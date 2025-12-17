import type { VercelRequest, VercelResponse } from '@vercel/node';
import { TableClient, AzureNamedKeyCredential } from '@azure/data-tables';
import { STYLE_PROMPT, IMAGE_STYLE_PROMPT, PDF_EXTRACT_PROMPT, IMAGE_TO_COMPONENTS_PROMPT, AZURE_CONFIG } from '../shared/prompts.js';

// Helper to get Azure OpenAI config
function getAzureConfig() {
  const apiKey = process.env.AZURE_OPENAI_KEY;
  const azureEndpoint = process.env.AZURE_OPENAI_ENDPOINT || AZURE_CONFIG.defaultEndpoint;

  if (!apiKey) {
    throw new Error('Azure OpenAI API key not configured');
  }

  return { apiKey, azureEndpoint };
}

// Helper to call Azure OpenAI
async function callAzureOpenAI(
  apiKey: string,
  azureEndpoint: string,
  messages: any[],
  maxTokens: number = 4000
) {
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

// Handle style action
async function handleStyle(body: any, apiKey: string, azureEndpoint: string) {
  const { prompt, projectJson } = body;

  if (!prompt || !projectJson) {
    throw new Error('Missing prompt or projectJson');
  }

  const userPrompt = `Style this layout JSON:\n${projectJson}\n\nStyle: ${prompt}`;
  const messages = [
    { role: 'system', content: STYLE_PROMPT },
    { role: 'user', content: userPrompt },
  ];

  return await callAzureOpenAI(apiKey, azureEndpoint, messages, 16000);
}

// Handle vision action
async function handleVision(body: any, apiKey: string, azureEndpoint: string) {
  const { image, customPrompt } = body;

  if (!image) {
    throw new Error('Missing image data');
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

  return await callAzureOpenAI(apiKey, azureEndpoint, messages, 4000);
}

// Handle PDF extract action
async function handlePdfExtract(body: any, apiKey: string, azureEndpoint: string) {
  const { pdfImage } = body;

  if (!pdfImage) {
    throw new Error('Missing PDF image data');
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

  const content = await callAzureOpenAI(apiKey, azureEndpoint, messages, 4000);

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
    return JSON.parse(cleanedContent);
  } catch {
    // Return raw content if parsing fails
    return { raw: true, content: cleanedContent };
  }
}

// Handle generate components action
async function handleGenerateComponents(body: any, apiKey: string, azureEndpoint: string) {
  const { image } = body;

  if (!image) {
    throw new Error('Missing image data');
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

  return await callAzureOpenAI(apiKey, azureEndpoint, messages, 8000);
}

// Handle chat action
async function handleChat(body: any, apiKey: string, azureEndpoint: string) {
  const { projectName, userMessage, conversationHistory = [] } = body;

  if (!projectName || !userMessage) {
    throw new Error('Missing projectName or userMessage');
  }

  // Fetch all pages for the project
  const tableClient = getTableClient();
  const pagesData: any[] = [];

  const queryResults = tableClient.listEntities({
    queryOptions: { filter: `PartitionKey eq '${projectName}'` }
  });

  for await (const entity of queryResults) {
    // Skip layouts, only get pages
    if (entity.entityType === 'layout') continue;

    // Parse sectionComponents - handle both string and object
    let sectionComponents = {};
    let components: any[] = [];

    try {
      if (entity.sectionComponents) {
        const raw = entity.sectionComponents as string;
        sectionComponents = typeof raw === 'string' ? JSON.parse(raw) : raw;
      }
    } catch (parseErr) {
      console.error('Failed to parse sectionComponents for page:', entity.title, parseErr);
    }

    // Also try deprecated components field as fallback
    try {
      if (entity.components) {
        const raw = entity.components as string;
        components = typeof raw === 'string' ? JSON.parse(raw) : raw;
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

  // Build messages with conversation history
  const messages = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory.map((msg: any) => ({
      role: msg.role,
      content: msg.content,
    })),
    { role: 'user', content: userMessage },
  ];

  return await callAzureOpenAI(apiKey, azureEndpoint, messages, 2000);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { apiKey, azureEndpoint } = getAzureConfig();
    const { action } = req.body;

    let content: any;

    switch (action) {
      case 'style':
        content = await handleStyle(req.body, apiKey, azureEndpoint);
        break;
      case 'vision':
        content = await handleVision(req.body, apiKey, azureEndpoint);
        break;
      case 'chat':
        content = await handleChat(req.body, apiKey, azureEndpoint);
        break;
      case 'pdfExtract':
        content = await handlePdfExtract(req.body, apiKey, azureEndpoint);
        break;
      case 'generateComponents':
        content = await handleGenerateComponents(req.body, apiKey, azureEndpoint);
        break;
      default:
        return res.status(400).json({ error: 'Invalid action. Use: style, vision, chat, pdfExtract, or generateComponents' });
    }

    return res.status(200).json({ content });
  } catch (error: any) {
    console.error('AI API error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
