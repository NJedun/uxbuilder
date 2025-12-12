import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { TableClient, AzureNamedKeyCredential } from '@azure/data-tables';
import { STYLE_PROMPT, IMAGE_STYLE_PROMPT, PDF_EXTRACT_PROMPT, AZURE_CONFIG } from './shared/prompts.js';

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

// Save Seed Product to Azure Table Storage
app.post('/api/seed-product', async (req, res) => {
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
// Pages API (PLP/PDP Management)
// ============================================

// Helper to get pages table client (uses same table as products, distinguished by PartitionKey)
function getPagesTableClient() {
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

// GET /api/pages - List all pages with optional filters
app.get('/api/pages', async (req, res) => {
  try {
    const tableClient = getPagesTableClient();
    const { type, parentRowKey, project } = req.query;

    const entities = [];
    let filter = '';

    // Build filter query
    const filters = [];
    if (type) {
      filters.push(`pageType eq '${type}'`);
    }
    if (parentRowKey) {
      filters.push(`parentRowKey eq '${parentRowKey}'`);
    }
    if (project) {
      filters.push(`PartitionKey eq '${project}'`);
    }

    if (filters.length > 0) {
      filter = filters.join(' and ');
    }

    const queryOptions = filter ? { filter } : {};
    const queryResults = tableClient.listEntities({ queryOptions });

    for await (const entity of queryResults) {
      entities.push({
        rowKey: entity.rowKey,
        partitionKey: entity.partitionKey,
        pageType: entity.pageType,
        slug: entity.slug,
        parentRowKey: entity.parentRowKey || null,
        title: entity.title,
        summary: entity.summary || '',
        category: entity.category || null,
        components: entity.components,
        globalStyles: entity.globalStyles,
        isPublished: entity.isPublished || false,
        createdAt: entity.createdAt,
        updatedAt: entity.updatedAt,
      });
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

// GET /api/pages/:project/:rowKey - Get single page
app.get('/api/pages/:project/:rowKey', async (req, res) => {
  try {
    const tableClient = getPagesTableClient();
    const { project, rowKey } = req.params;

    const entity = await tableClient.getEntity(project, rowKey);

    return res.status(200).json({
      success: true,
      data: {
        rowKey: entity.rowKey,
        partitionKey: entity.partitionKey,
        pageType: entity.pageType,
        slug: entity.slug,
        parentRowKey: entity.parentRowKey || null,
        title: entity.title,
        summary: entity.summary || '',
        category: entity.category || null,
        components: entity.components,
        globalStyles: entity.globalStyles,
        isPublished: entity.isPublished || false,
        createdAt: entity.createdAt,
        updatedAt: entity.updatedAt,
      },
    });
  } catch (error) {
    if (error.statusCode === 404) {
      return res.status(404).json({ error: 'Page not found' });
    }
    console.error('Page fetch error:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch page' });
  }
});

// GET /api/pages/by-slug?slug=xxx - Get page by slug (supports nested slugs like wheat/product1)
app.get('/api/pages/by-slug', async (req, res) => {
  try {
    const tableClient = getPagesTableClient();
    const slug = req.query.slug;

    if (!slug) {
      return res.status(400).json({ error: 'Missing slug parameter' });
    }

    const queryResults = tableClient.listEntities({
      queryOptions: { filter: `slug eq '${slug}'` },
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
      data: {
        rowKey: foundEntity.rowKey,
        partitionKey: foundEntity.partitionKey,
        pageType: foundEntity.pageType,
        slug: foundEntity.slug,
        parentRowKey: foundEntity.parentRowKey || null,
        title: foundEntity.title,
        summary: foundEntity.summary || '',
        category: foundEntity.category || null,
        components: foundEntity.components,
        globalStyles: foundEntity.globalStyles,
        isPublished: foundEntity.isPublished || false,
        createdAt: foundEntity.createdAt,
        updatedAt: foundEntity.updatedAt,
      },
    });
  } catch (error) {
    console.error('Page by slug fetch error:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch page' });
  }
});

// POST /api/pages - Create new page
app.post('/api/pages', async (req, res) => {
  try {
    const tableClient = getPagesTableClient();

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

    // Generate unique row key
    const timestamp = Date.now();
    const sanitizedTitle = pageData.title.replace(/[^a-zA-Z0-9]/g, '_');
    const rowKey = `${sanitizedTitle}_${timestamp}`;

    const now = new Date().toISOString();

    const entity = {
      partitionKey: pageData.partitionKey,
      rowKey: rowKey,
      pageType: pageData.pageType || 'PDP',
      slug: pageData.slug,
      parentRowKey: pageData.parentRowKey || '',
      title: pageData.title,
      summary: pageData.summary || '',
      category: pageData.category || '',
      components: pageData.components || '[]',
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

// PUT /api/pages/:project/:rowKey - Update existing page
app.put('/api/pages/:project/:rowKey', async (req, res) => {
  try {
    const tableClient = getPagesTableClient();
    const { project, rowKey } = req.params;
    const pageData = req.body;

    // Get existing entity first
    const existing = await tableClient.getEntity(project, rowKey);

    const entity = {
      partitionKey: project,
      rowKey: rowKey,
      pageType: pageData.pageType || existing.pageType,
      slug: pageData.slug || existing.slug,
      parentRowKey: pageData.parentRowKey !== undefined ? pageData.parentRowKey : existing.parentRowKey,
      title: pageData.title || existing.title,
      summary: pageData.summary !== undefined ? pageData.summary : existing.summary,
      category: pageData.category !== undefined ? pageData.category : existing.category,
      components: pageData.components || existing.components,
      globalStyles: pageData.globalStyles || existing.globalStyles,
      isPublished: pageData.isPublished !== undefined ? pageData.isPublished : existing.isPublished,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    };

    await tableClient.updateEntity(entity, 'Replace');

    return res.status(200).json({
      success: true,
      message: 'Page updated successfully',
    });
  } catch (error) {
    if (error.statusCode === 404) {
      return res.status(404).json({ error: 'Page not found' });
    }
    console.error('Page update error:', error);
    return res.status(500).json({ error: error.message || 'Failed to update page' });
  }
});

// DELETE /api/pages/:project/:rowKey - Delete page
app.delete('/api/pages/:project/:rowKey', async (req, res) => {
  try {
    const tableClient = getPagesTableClient();
    const { project, rowKey } = req.params;

    await tableClient.deleteEntity(project, rowKey);

    return res.status(200).json({
      success: true,
      message: 'Page deleted successfully',
    });
  } catch (error) {
    if (error.statusCode === 404) {
      return res.status(404).json({ error: 'Page not found' });
    }
    console.error('Page delete error:', error);
    return res.status(500).json({ error: error.message || 'Failed to delete page' });
  }
});

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
