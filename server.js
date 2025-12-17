import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { TableClient, AzureNamedKeyCredential } from '@azure/data-tables';
import { STYLE_PROMPT, IMAGE_STYLE_PROMPT, PDF_EXTRACT_PROMPT, IMAGE_TO_COMPONENTS_PROMPT, AZURE_CONFIG } from './shared/prompts.js';

dotenv.config();

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// AI Style endpoint (text-based styling)
app.post('/api/ai-style', async (req, res) => {
  const apiKey = process.env.AZURE_OPENAI_KEY;
  const azureEndpoint = process.env.AZURE_OPENAI_ENDPOINT || AZURE_CONFIG.defaultEndpoint;

  if (!apiKey) {
    return res.status(500).json({ error: 'Azure OpenAI API key not configured' });
  }

  try {
    const { prompt, projectJson } = req.body;

    if (!prompt || !projectJson) {
      return res.status(400).json({ error: 'Missing prompt or projectJson' });
    }

    const userPrompt = `Style this layout JSON:\n${projectJson}\n\nStyle: ${prompt}`;

    const response = await fetch(
      `${azureEndpoint}/openai/deployments/${AZURE_CONFIG.deploymentName}/chat/completions?api-version=${AZURE_CONFIG.apiVersion}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': apiKey,
        },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: STYLE_PROMPT },
            { role: 'user', content: userPrompt },
          ],
          max_completion_tokens: 16000,
        }),
      }
    );

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return res.status(response.status).json({
        error: err.error?.message || `Azure OpenAI API error: ${response.status}`
      });
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '';

    return res.status(200).json({ content });
  } catch (error) {
    console.error('AI Style API error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Combined AI endpoint (style, vision, chat)
app.post('/api/ai', async (req, res) => {
  const apiKey = process.env.AZURE_OPENAI_KEY;
  const azureEndpoint = process.env.AZURE_OPENAI_ENDPOINT || AZURE_CONFIG.defaultEndpoint;

  if (!apiKey) {
    return res.status(500).json({ error: 'Azure OpenAI API key not configured' });
  }

  try {
    const { action } = req.body;

    let content;
    switch (action) {
      case 'style': {
        const { prompt, projectJson } = req.body;
        if (!prompt || !projectJson) {
          return res.status(400).json({ error: 'Missing prompt or projectJson' });
        }
        const userPrompt = `Style this layout JSON:\n${projectJson}\n\nStyle: ${prompt}`;
        const messages = [
          { role: 'system', content: STYLE_PROMPT },
          { role: 'user', content: userPrompt },
        ];
        content = await callAzureOpenAI(apiKey, azureEndpoint, messages, 16000);
        break;
      }

      case 'vision': {
        const { image, customPrompt } = req.body;
        if (!image) {
          return res.status(400).json({ error: 'Missing image data' });
        }
        const promptText = customPrompt || IMAGE_STYLE_PROMPT;
        const messages = [
          {
            role: 'user',
            content: [
              { type: 'text', text: promptText },
              { type: 'image_url', image_url: { url: image } },
            ],
          },
        ];
        content = await callAzureOpenAI(apiKey, azureEndpoint, messages, 4000);
        break;
      }

      case 'chat': {
        const { projectName, userMessage, conversationHistory = [] } = req.body;
        if (!projectName || !userMessage) {
          return res.status(400).json({ error: 'Missing projectName or userMessage' });
        }

        // Fetch all pages for the project
        const tableClient = getTableClient();
        const pagesData = [];

        const queryResults = tableClient.listEntities({
          queryOptions: { filter: `PartitionKey eq '${projectName}'` }
        });

        for await (const entity of queryResults) {
          if (entity.entityType === 'layout') continue;

          // Parse sectionComponents - handle both string and object
          let sectionComponents = {};
          let components = [];

          try {
            if (entity.sectionComponents) {
              sectionComponents = typeof entity.sectionComponents === 'string'
                ? JSON.parse(entity.sectionComponents)
                : entity.sectionComponents;
            }
          } catch (parseErr) {
            console.error('Failed to parse sectionComponents for page:', entity.title, parseErr);
          }

          // Also try deprecated components field as fallback
          try {
            if (entity.components) {
              components = typeof entity.components === 'string'
                ? JSON.parse(entity.components)
                : entity.components;
            }
          } catch (parseErr) {
            console.error('Failed to parse components for page:', entity.title, parseErr);
          }

          pagesData.push({
            title: entity.title,
            pageType: entity.pageType,
            slug: entity.slug,
            summary: entity.summary || '',
            sectionComponents,
            components, // Include deprecated field as fallback
          });
        }

        // Pass raw JSON to AI
        const pagesJson = JSON.stringify(pagesData, null, 2);

        const systemPrompt = `You are a friendly seed product assistant helping farmers find the right seeds.

PRODUCT DATA:
${pagesJson}

RESPONSE STYLE:
- Be conversational and friendly, like talking to a neighbor
- Keep responses SHORT - 2-4 sentences for simple questions
- Use bullet points only when comparing multiple products
- Explain ratings simply (e.g., "rated 1 out of 9 for emergence - that's excellent")
- Focus on what matters most to farmers: yield, disease resistance, best conditions
- Never dump raw data - summarize naturally
- End with a brief follow-up question when helpful
- If info isn't available, say so simply

LINKS:
- When referencing a product page, use markdown links with the page's slug
- Format: [Product Name](/slug-from-json)
- Example: [Allegiant 009F23](/allegiant-soybeans/009f23)
- Only link to pages that exist in the JSON data (use the "slug" field)
- Do NOT make up URLs or use generic links like #home`;

        const messages = [
          { role: 'system', content: systemPrompt },
          ...conversationHistory.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
          { role: 'user', content: userMessage },
        ];

        content = await callAzureOpenAI(apiKey, azureEndpoint, messages, 2000);
        break;
      }

      case 'pdfExtract': {
        const { pdfImage } = req.body;
        if (!pdfImage) {
          return res.status(400).json({ error: 'Missing PDF image data' });
        }
        const messages = [
          {
            role: 'user',
            content: [
              { type: 'text', text: PDF_EXTRACT_PROMPT },
              { type: 'image_url', image_url: { url: pdfImage } },
            ],
          },
        ];
        const rawContent = await callAzureOpenAI(apiKey, azureEndpoint, messages, 4000);

        // Try to parse and validate the JSON
        let cleanedContent = rawContent
          .replace(/```json\n?/g, '')
          .replace(/```\n?/g, '')
          .trim();

        const jsonMatch = cleanedContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          cleanedContent = jsonMatch[0];
        }

        try {
          content = JSON.parse(cleanedContent);
        } catch {
          content = { raw: true, content: cleanedContent };
        }
        break;
      }

      case 'generateComponents': {
        const { image } = req.body;
        if (!image) {
          return res.status(400).json({ error: 'Missing image data' });
        }
        const messages = [
          {
            role: 'user',
            content: [
              { type: 'text', text: IMAGE_TO_COMPONENTS_PROMPT },
              { type: 'image_url', image_url: { url: image } },
            ],
          },
        ];
        content = await callAzureOpenAI(apiKey, azureEndpoint, messages, 8000);
        break;
      }

      default:
        return res.status(400).json({ error: 'Invalid action. Use: style, vision, chat, pdfExtract, or generateComponents' });
    }

    return res.status(200).json({ content });
  } catch (error) {
    console.error('AI API error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Helper function to call Azure OpenAI
async function callAzureOpenAI(apiKey, azureEndpoint, messages, maxTokens = 4000) {
  const response = await fetch(
    `${azureEndpoint}/openai/deployments/${AZURE_CONFIG.deploymentName}/chat/completions?api-version=${AZURE_CONFIG.apiVersion}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        messages,
        max_completion_tokens: maxTokens,
      }),
    }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `Azure OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || '';
}

// AI Vision endpoint (image-based style extraction)
app.post('/api/ai-vision', async (req, res) => {
  const apiKey = process.env.AZURE_OPENAI_KEY;
  const azureEndpoint = process.env.AZURE_OPENAI_ENDPOINT || AZURE_CONFIG.defaultEndpoint;

  if (!apiKey) {
    return res.status(500).json({ error: 'Azure OpenAI API key not configured' });
  }

  try {
    const { image, customPrompt } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'Missing image data' });
    }

    const promptText = customPrompt || IMAGE_STYLE_PROMPT;

    const response = await fetch(
      `${azureEndpoint}/openai/deployments/${AZURE_CONFIG.deploymentName}/chat/completions?api-version=${AZURE_CONFIG.apiVersion}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': apiKey,
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: promptText },
                {
                  type: 'image_url',
                  image_url: { url: image },
                },
              ],
            },
          ],
          max_completion_tokens: 4000,
        }),
      }
    );

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return res.status(response.status).json({
        error: err.error?.message || `Azure OpenAI Vision API error: ${response.status}`
      });
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '';

    return res.status(200).json({ content });
  } catch (error) {
    console.error('AI Vision API error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// AI Generate Components endpoint (image-to-components)
app.post('/api/ai-generate-components', async (req, res) => {
  const apiKey = process.env.AZURE_OPENAI_KEY;
  const azureEndpoint = process.env.AZURE_OPENAI_ENDPOINT || AZURE_CONFIG.defaultEndpoint;

  if (!apiKey) {
    return res.status(500).json({ error: 'Azure OpenAI API key not configured' });
  }

  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'Missing image data' });
    }

    const response = await fetch(
      `${azureEndpoint}/openai/deployments/${AZURE_CONFIG.deploymentName}/chat/completions?api-version=${AZURE_CONFIG.apiVersion}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': apiKey,
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: IMAGE_TO_COMPONENTS_PROMPT },
                {
                  type: 'image_url',
                  image_url: { url: image },
                },
              ],
            },
          ],
          max_completion_tokens: 8000,
        }),
      }
    );

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return res.status(response.status).json({
        error: err.error?.message || `Azure OpenAI Vision API error: ${response.status}`
      });
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '';

    return res.status(200).json({ content });
  } catch (error) {
    console.error('AI Generate Components API error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// PDF Extract endpoint (seed product data extraction)
app.post('/api/ai-pdf-extract', async (req, res) => {
  const apiKey = process.env.AZURE_OPENAI_KEY;
  const azureEndpoint = process.env.AZURE_OPENAI_ENDPOINT || AZURE_CONFIG.defaultEndpoint;

  if (!apiKey) {
    return res.status(500).json({ error: 'Azure OpenAI API key not configured' });
  }

  try {
    const { pdfImage } = req.body;

    if (!pdfImage) {
      return res.status(400).json({ error: 'Missing PDF image data' });
    }

    const response = await fetch(
      `${azureEndpoint}/openai/deployments/${AZURE_CONFIG.deploymentName}/chat/completions?api-version=${AZURE_CONFIG.apiVersion}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': apiKey,
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: PDF_EXTRACT_PROMPT },
                {
                  type: 'image_url',
                  image_url: { url: pdfImage },
                },
              ],
            },
          ],
          max_completion_tokens: 4000,
        }),
      }
    );

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return res.status(response.status).json({
        error: err.error?.message || `Azure OpenAI API error: ${response.status}`
      });
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '';

    // Try to parse and validate the JSON
    let cleanedContent = content
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    // Extract JSON object if wrapped in other text
    const jsonMatch = cleanedContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleanedContent = jsonMatch[0];
    }

    // Validate it's proper JSON
    try {
      const parsed = JSON.parse(cleanedContent);
      return res.status(200).json({ content: parsed });
    } catch {
      // Return raw content if parsing fails - let client handle it
      return res.status(200).json({ content: cleanedContent, raw: true });
    }
  } catch (error) {
    console.error('PDF Extract API error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Get all Seed Products from Azure Table Storage
app.get('/api/seed-products', async (req, res) => {
  const accountName = process.env.AZURE_STORAGE_ACCOUNT;
  const accountKey = process.env.AZURE_STORAGE_KEY;
  const tableName = process.env.AZURE_TABLE_NAME;

  if (!accountName || !accountKey || !tableName) {
    return res.status(500).json({ error: 'Azure Table Storage not configured' });
  }

  try {
    const credential = new AzureNamedKeyCredential(accountName, accountKey);
    const tableClient = new TableClient(
      `https://${accountName}.table.core.windows.net`,
      tableName,
      credential
    );

    const entities = [];
    const queryResults = tableClient.listEntities({
      queryOptions: { filter: "PartitionKey eq 'SeedProduct'" }
    });

    for await (const entity of queryResults) {
      // Parse JSON strings back to objects
      entities.push({
        rowKey: entity.rowKey,
        name: entity.name,
        description: entity.description,
        category: entity.category,
        isActive: entity.isActive,
        rating: entity.rating ? JSON.parse(entity.rating) : {},
        productCharacteristics: entity.productCharacteristics ? JSON.parse(entity.productCharacteristics) : {},
        createdAt: entity.createdAt,
      });
    }

    return res.status(200).json({
      success: true,
      count: entities.length,
      data: entities
    });
  } catch (error) {
    console.error('Azure Table Storage error:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch products' });
  }
});

// Save Seed Product to Azure Table Storage (POST to same endpoint as GET)
app.post('/api/seed-products', async (req, res) => {
  const accountName = process.env.AZURE_STORAGE_ACCOUNT;
  const accountKey = process.env.AZURE_STORAGE_KEY;
  const tableName = process.env.AZURE_TABLE_NAME;

  if (!accountName || !accountKey || !tableName) {
    return res.status(500).json({ error: 'Azure Table Storage not configured' });
  }

  try {
    const productData = req.body;

    if (!productData || !productData.name) {
      return res.status(400).json({ error: 'Missing product data or name' });
    }

    // Create table client
    const credential = new AzureNamedKeyCredential(accountName, accountKey);
    const tableClient = new TableClient(
      `https://${accountName}.table.core.windows.net`,
      tableName,
      credential
    );

    // Create table if it doesn't exist
    try {
      await tableClient.createTable();
    } catch (err) {
      // Table might already exist, ignore error
      if (err.statusCode !== 409) {
        console.log('Table creation note:', err.message);
      }
    }

    // Generate unique row key using timestamp and product name
    const timestamp = Date.now();
    const sanitizedName = productData.name.replace(/[^a-zA-Z0-9]/g, '_');
    const rowKey = `${sanitizedName}_${timestamp}`;

    // Prepare entity for Azure Table Storage
    // Azure Tables requires partitionKey and rowKey
    // Complex objects must be stored as JSON strings
    const entity = {
      partitionKey: 'SeedProduct',
      rowKey: rowKey,
      name: productData.name,
      description: productData.description || '',
      category: productData.category || 'Soybean',
      isActive: productData.isActive || false,
      rating: JSON.stringify(productData.rating || {}),
      productCharacteristics: JSON.stringify(productData.productCharacteristics || {}),
      createdAt: new Date().toISOString(),
    };

    // Insert entity
    await tableClient.createEntity(entity);

    return res.status(200).json({
      success: true,
      message: 'Product saved successfully',
      rowKey: rowKey
    });
  } catch (error) {
    console.error('Azure Table Storage error:', error);
    return res.status(500).json({ error: error.message || 'Failed to save product' });
  }
});

// ============================================
// Single Table Design API
// ============================================
// Entity types: 'layout', 'page', 'settings'
// RowKey prefixes: layout_, page_, settings

const ROW_KEY_PREFIX = {
  layout: 'layout_',
  page: 'page_',
  settings: 'settings',
};

// Helper to get table client
function getTableClient() {
  const accountName = process.env.AZURE_STORAGE_ACCOUNT;
  const accountKey = process.env.AZURE_STORAGE_KEY;
  const tableName = process.env.AZURE_TABLE_NAME;

  if (!accountName || !accountKey || !tableName) {
    throw new Error('Azure Table Storage not configured');
  }

  const credential = new AzureNamedKeyCredential(accountName, accountKey);
  return new TableClient(
    `https://${accountName}.table.core.windows.net`,
    tableName,
    credential
  );
}

// Helper to create rowKey with prefix
function createRowKey(entityType, name) {
  const sanitizedName = name.replace(/[^a-zA-Z0-9]/g, '_');
  const timestamp = Date.now();
  if (entityType === 'settings') {
    return ROW_KEY_PREFIX.settings;
  }
  return `${ROW_KEY_PREFIX[entityType]}${sanitizedName}_${timestamp}`;
}

// Helper to format entity response
function formatEntityResponse(entity) {
  return {
    rowKey: entity.rowKey,
    partitionKey: entity.partitionKey,
    entityType: entity.entityType || 'page', // Default for backward compatibility
    pageType: entity.pageType,
    slug: entity.slug,
    parentRowKey: entity.parentRowKey || null,
    layoutRowKey: entity.layoutRowKey || null,
    title: entity.title,
    name: entity.name || entity.title,
    summary: entity.summary || '',
    category: entity.category || null,
    sectionComponents: entity.sectionComponents || '{}',
    globalStyles: entity.globalStyles || '{}',
    // Layout-specific fields
    headerComponents: entity.headerComponents || '[]',
    footerComponents: entity.footerComponents || '[]',
    bodySections: entity.bodySections || '[]',
    headerStyles: entity.headerStyles || '{}',
    footerStyles: entity.footerStyles || '{}',
    isDefault: entity.isDefault || false,
    isPublished: entity.isPublished || false,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
  };
}

// GET /api/pages - List all pages (entityType = 'page')
app.get('/api/pages', async (req, res) => {
  try {
    const tableClient = getTableClient();
    const { type, parentRowKey, project } = req.query;

    const entities = [];

    // Build filter query - only get pages (not layouts, settings, or SeedProducts)
    const filters = ["PartitionKey ne 'SeedProduct'", "entityType eq 'page'"];
    if (type) {
      filters.push(`pageType eq '${type}'`);
    }
    if (parentRowKey) {
      filters.push(`parentRowKey eq '${parentRowKey}'`);
    }
    if (project) {
      filters.push(`PartitionKey eq '${project}'`);
    }

    const filter = filters.join(' and ');
    const queryOptions = { filter };
    const queryResults = tableClient.listEntities({ queryOptions });

    for await (const entity of queryResults) {
      entities.push(formatEntityResponse(entity));
    }

    return res.status(200).json({
      success: true,
      count: entities.length,
      data: entities,
    });
  } catch (error) {
    console.error('Pages fetch error:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch pages' });
  }
});

// GET /api/pages/:project/:rowKey - Get single entity (page or layout)
app.get('/api/pages/:project/:rowKey', async (req, res) => {
  try {
    const tableClient = getTableClient();
    const { project, rowKey } = req.params;

    const entity = await tableClient.getEntity(project, rowKey);

    return res.status(200).json({
      success: true,
      data: formatEntityResponse(entity),
    });
  } catch (error) {
    if (error.statusCode === 404) {
      return res.status(404).json({ error: 'Entity not found' });
    }
    console.error('Entity fetch error:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch entity' });
  }
});

// GET /api/pages/by-slug?slug=xxx - Get page by slug
app.get('/api/pages/by-slug', async (req, res) => {
  try {
    const tableClient = getTableClient();
    const slug = req.query.slug;

    if (!slug) {
      return res.status(400).json({ error: 'Missing slug parameter' });
    }

    const queryResults = tableClient.listEntities({
      queryOptions: { filter: `slug eq '${slug}' and entityType eq 'page'` },
    });

    let foundEntity = null;
    for await (const entity of queryResults) {
      foundEntity = entity;
      break;
    }

    if (!foundEntity) {
      return res.status(404).json({ error: 'Page not found' });
    }

    return res.status(200).json({
      success: true,
      data: formatEntityResponse(foundEntity),
    });
  } catch (error) {
    console.error('Page by slug fetch error:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch page' });
  }
});

// POST /api/pages - Create new page
app.post('/api/pages', async (req, res) => {
  try {
    const tableClient = getTableClient();

    // Create table if it doesn't exist
    try {
      await tableClient.createTable();
    } catch (err) {
      if (err.statusCode !== 409) {
        console.log('Table creation note:', err.message);
      }
    }

    const pageData = req.body;

    if (!pageData.partitionKey || !pageData.title) {
      return res.status(400).json({ error: 'Missing project (partitionKey) or title' });
    }

    // Generate unique row key with prefix
    const rowKey = createRowKey('page', pageData.title);
    const now = new Date().toISOString();

    const entity = {
      partitionKey: pageData.partitionKey,
      rowKey: rowKey,
      entityType: 'page',
      pageType: pageData.pageType || 'PDP',
      slug: pageData.slug || '',
      parentRowKey: pageData.parentRowKey || '',
      layoutRowKey: pageData.layoutRowKey || '',
      title: pageData.title,
      name: pageData.title,
      summary: pageData.summary || '',
      category: pageData.category || '',
      sectionComponents: pageData.sectionComponents || '{}',
      globalStyles: pageData.globalStyles || '{}',
      isPublished: pageData.isPublished || false,
      createdAt: now,
      updatedAt: now,
    };

    await tableClient.createEntity(entity);

    return res.status(200).json({
      success: true,
      message: 'Page saved successfully',
      rowKey: rowKey,
      slug: pageData.slug,
    });
  } catch (error) {
    console.error('Page save error:', error);
    return res.status(500).json({ error: error.message || 'Failed to save page' });
  }
});

// PUT /api/pages/:project/:rowKey - Update existing entity (page or layout)
app.put('/api/pages/:project/:rowKey', async (req, res) => {
  try {
    const tableClient = getTableClient();
    const { project, rowKey } = req.params;
    const data = req.body;

    // Get existing entity first
    const existing = await tableClient.getEntity(project, rowKey);
    const entityType = existing.entityType || 'page';

    const entity = {
      partitionKey: project,
      rowKey: rowKey,
      entityType: entityType,
      pageType: data.pageType !== undefined ? data.pageType : existing.pageType,
      slug: data.slug !== undefined ? data.slug : existing.slug,
      parentRowKey: data.parentRowKey !== undefined ? data.parentRowKey : existing.parentRowKey,
      layoutRowKey: data.layoutRowKey !== undefined ? data.layoutRowKey : existing.layoutRowKey,
      title: data.title !== undefined ? data.title : existing.title,
      name: data.name !== undefined ? data.name : existing.name,
      summary: data.summary !== undefined ? data.summary : existing.summary,
      category: data.category !== undefined ? data.category : existing.category,
      sectionComponents: data.sectionComponents !== undefined ? data.sectionComponents : existing.sectionComponents,
      globalStyles: data.globalStyles !== undefined ? data.globalStyles : existing.globalStyles,
      // Layout-specific fields
      headerComponents: data.headerComponents !== undefined ? data.headerComponents : existing.headerComponents,
      footerComponents: data.footerComponents !== undefined ? data.footerComponents : existing.footerComponents,
      bodySections: data.bodySections !== undefined ? data.bodySections : existing.bodySections,
      headerStyles: data.headerStyles !== undefined ? data.headerStyles : existing.headerStyles,
      footerStyles: data.footerStyles !== undefined ? data.footerStyles : existing.footerStyles,
      isDefault: data.isDefault !== undefined ? data.isDefault : existing.isDefault,
      isPublished: data.isPublished !== undefined ? data.isPublished : existing.isPublished,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    };

    await tableClient.updateEntity(entity, 'Replace');

    return res.status(200).json({
      success: true,
      message: 'Entity updated successfully',
    });
  } catch (error) {
    if (error.statusCode === 404) {
      return res.status(404).json({ error: 'Entity not found' });
    }
    console.error('Entity update error:', error);
    return res.status(500).json({ error: error.message || 'Failed to update entity' });
  }
});

// DELETE /api/pages/:project/:rowKey - Delete entity
app.delete('/api/pages/:project/:rowKey', async (req, res) => {
  try {
    const tableClient = getTableClient();
    const { project, rowKey } = req.params;

    await tableClient.deleteEntity(project, rowKey);

    return res.status(200).json({
      success: true,
      message: 'Entity deleted successfully',
    });
  } catch (error) {
    if (error.statusCode === 404) {
      return res.status(404).json({ error: 'Entity not found' });
    }
    console.error('Entity delete error:', error);
    return res.status(500).json({ error: error.message || 'Failed to delete entity' });
  }
});

// ============================================
// Layouts API
// ============================================

// GET /api/layouts - List all layouts
app.get('/api/layouts', async (req, res) => {
  try {
    const tableClient = getTableClient();
    const { project } = req.query;

    const entities = [];

    // Build filter query - only get layouts
    const filters = ["entityType eq 'layout'"];
    if (project) {
      filters.push(`PartitionKey eq '${project}'`);
    }

    const filter = filters.join(' and ');
    const queryOptions = { filter };
    const queryResults = tableClient.listEntities({ queryOptions });

    for await (const entity of queryResults) {
      entities.push(formatEntityResponse(entity));
    }

    return res.status(200).json({
      success: true,
      count: entities.length,
      data: entities,
    });
  } catch (error) {
    console.error('Layouts fetch error:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch layouts' });
  }
});

// POST /api/layouts - Create new layout
app.post('/api/layouts', async (req, res) => {
  try {
    const tableClient = getTableClient();

    // Create table if it doesn't exist
    try {
      await tableClient.createTable();
    } catch (err) {
      if (err.statusCode !== 409) {
        console.log('Table creation note:', err.message);
      }
    }

    const layoutData = req.body;

    if (!layoutData.partitionKey || !layoutData.name) {
      return res.status(400).json({ error: 'Missing project (partitionKey) or name' });
    }

    // Generate unique row key with layout prefix
    const rowKey = createRowKey('layout', layoutData.name);
    const now = new Date().toISOString();

    const entity = {
      partitionKey: layoutData.partitionKey,
      rowKey: rowKey,
      entityType: 'layout',
      name: layoutData.name,
      title: layoutData.name,
      isDefault: layoutData.isDefault || false,
      headerComponents: layoutData.headerComponents || '[]',
      footerComponents: layoutData.footerComponents || '[]',
      bodySections: layoutData.bodySections || '[]',
      headerStyles: layoutData.headerStyles || '{}',
      footerStyles: layoutData.footerStyles || '{}',
      globalStyles: layoutData.globalStyles || '{}',
      isPublished: layoutData.isPublished || false,
      createdAt: now,
      updatedAt: now,
    };

    await tableClient.createEntity(entity);

    return res.status(200).json({
      success: true,
      message: 'Layout saved successfully',
      rowKey: rowKey,
    });
  } catch (error) {
    console.error('Layout save error:', error);
    return res.status(500).json({ error: error.message || 'Failed to save layout' });
  }
});

// ============================================
// Project Settings API
// ============================================

// GET /api/settings/:project - Get project settings
app.get('/api/settings/:project', async (req, res) => {
  try {
    const tableClient = getTableClient();
    const { project } = req.params;

    try {
      const entity = await tableClient.getEntity(project, 'settings');
      return res.status(200).json({
        success: true,
        data: {
          partitionKey: entity.partitionKey,
          rowKey: entity.rowKey,
          entityType: 'settings',
          projectName: entity.projectName || project,
          defaultLayoutRowKey: entity.defaultLayoutRowKey || null,
          globalStyles: entity.globalStyles || '{}',
          createdAt: entity.createdAt,
          updatedAt: entity.updatedAt,
        },
      });
    } catch (error) {
      if (error.statusCode === 404) {
        // Return default settings if not found
        return res.status(200).json({
          success: true,
          data: {
            partitionKey: project,
            rowKey: 'settings',
            entityType: 'settings',
            projectName: project,
            defaultLayoutRowKey: null,
            globalStyles: '{}',
            createdAt: null,
            updatedAt: null,
          },
        });
      }
      throw error;
    }
  } catch (error) {
    console.error('Settings fetch error:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch settings' });
  }
});

// PUT /api/settings/:project - Update project settings
app.put('/api/settings/:project', async (req, res) => {
  try {
    const tableClient = getTableClient();
    const { project } = req.params;
    const data = req.body;

    const now = new Date().toISOString();

    // Try to get existing settings
    let existing = null;
    try {
      existing = await tableClient.getEntity(project, 'settings');
    } catch (error) {
      if (error.statusCode !== 404) throw error;
    }

    const entity = {
      partitionKey: project,
      rowKey: 'settings',
      entityType: 'settings',
      projectName: data.projectName || project,
      defaultLayoutRowKey: data.defaultLayoutRowKey !== undefined ? data.defaultLayoutRowKey : (existing?.defaultLayoutRowKey || ''),
      globalStyles: data.globalStyles !== undefined ? data.globalStyles : (existing?.globalStyles || '{}'),
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    };

    await tableClient.upsertEntity(entity, 'Replace');

    return res.status(200).json({
      success: true,
      message: 'Settings saved successfully',
    });
  } catch (error) {
    console.error('Settings save error:', error);
    return res.status(500).json({ error: error.message || 'Failed to save settings' });
  }
});

// ============================================
// Projects API
// ============================================

// GET /api/projects - List all projects (unique partitionKeys)
app.get('/api/projects', async (req, res) => {
  try {
    const tableClient = getTableClient();
    const projects = new Set();

    // Get all entities and extract unique partitionKeys
    const queryResults = tableClient.listEntities({
      queryOptions: { filter: "PartitionKey ne 'SeedProduct'" },
    });

    for await (const entity of queryResults) {
      projects.add(entity.partitionKey);
    }

    return res.status(200).json({
      success: true,
      count: projects.size,
      data: Array.from(projects),
    });
  } catch (error) {
    console.error('Projects fetch error:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch projects' });
  }
});

// DELETE /api/projects/:project - Delete all entities in a project
app.delete('/api/projects/:project', async (req, res) => {
  const { project } = req.params;

  if (!project) {
    return res.status(400).json({ error: 'Project name is required' });
  }

  try {
    const tableClient = getTableClient();

    // Get all entities with this partitionKey
    const queryResults = tableClient.listEntities({
      queryOptions: { filter: `PartitionKey eq '${project}'` },
    });

    const entitiesToDelete = [];
    for await (const entity of queryResults) {
      entitiesToDelete.push({
        partitionKey: entity.partitionKey,
        rowKey: entity.rowKey,
      });
    }

    if (entitiesToDelete.length === 0) {
      return res.status(404).json({ error: 'Project not found or already empty' });
    }

    // Delete all entities
    let deletedCount = 0;
    for (const entity of entitiesToDelete) {
      try {
        await tableClient.deleteEntity(entity.partitionKey, entity.rowKey);
        deletedCount++;
      } catch (error) {
        console.error(`Failed to delete entity ${entity.rowKey}:`, error);
      }
    }

    return res.status(200).json({
      success: true,
      message: `Project "${project}" deleted successfully`,
      deletedCount,
      totalEntities: entitiesToDelete.length,
    });
  } catch (error) {
    console.error('Project delete error:', error);
    return res.status(500).json({ error: error.message || 'Failed to delete project' });
  }
});

// GET /api/projects/:project - Get project details
app.get('/api/projects/:project', async (req, res) => {
  const { project } = req.params;

  if (!project) {
    return res.status(400).json({ error: 'Project name is required' });
  }

  try {
    const tableClient = getTableClient();

    const queryResults = tableClient.listEntities({
      queryOptions: { filter: `PartitionKey eq '${project}'` },
    });

    let pageCount = 0;
    let layoutCount = 0;

    for await (const entity of queryResults) {
      const entityType = entity.entityType;
      if (entityType === 'layout') {
        layoutCount++;
      } else {
        pageCount++;
      }
    }

    return res.status(200).json({
      success: true,
      project,
      pageCount,
      layoutCount,
      totalCount: pageCount + layoutCount,
    });
  } catch (error) {
    console.error('Project fetch error:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch project details' });
  }
});

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
