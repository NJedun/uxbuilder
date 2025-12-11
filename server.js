import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { TableClient, AzureNamedKeyCredential } from '@azure/data-tables';

dotenv.config();

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const STYLE_PROMPT = `You are a professional UI/UX designer. Style the provided layout JSON based on the user's style description.

IMPORTANT RULES:
1. Return ONLY valid JSON - no explanations, no markdown
2. Preserve ALL existing structure (ids, types, children)
3. Only modify style-related properties: customStyles, globalStyles
4. Use CSS-in-JS format (camelCase properties, string values)

Return the complete styled JSON with:
- globalStyles: Overall theme styles (colors, fonts, spacing)
- components: Array with updated customStyles for each component`;

const IMAGE_STYLE_PROMPT = `Analyze this UI screenshot and extract a complete style guide. Return ONLY valid JSON with this exact structure:

{
  "globalStyles": {
    "primaryColor": "#hex",
    "secondaryColor": "#hex",
    "backgroundColor": "#hex",
    "textColor": "#hex",
    "headingColor": "#hex",
    "headingFontSize": "px value",
    "headingFontWeight": "weight",
    "paragraphFontSize": "px value",
    "paragraphLineHeight": "value",
    "buttonBackgroundColor": "#hex",
    "buttonTextColor": "#hex",
    "buttonPadding": "px values",
    "buttonBorderRadius": "px value",
    "buttonFontSize": "px value",
    "buttonFontWeight": "weight",
    "inputBackgroundColor": "#hex",
    "inputBorderColor": "#hex",
    "inputBorderRadius": "px value",
    "inputPadding": "px values",
    "inputFontSize": "px value",
    "cardBackgroundColor": "#hex",
    "cardBorderRadius": "px value",
    "cardPadding": "px values",
    "cardShadow": "shadow value",
    "linkColor": "#hex",
    "linkHoverColor": "#hex",
    "navBackgroundColor": "#hex",
    "navTextColor": "#hex",
    "navPadding": "px values",
    "footerBackgroundColor": "#hex",
    "footerTextColor": "#hex",
    "footerPadding": "px values",
    "sectionPadding": "px values",
    "containerMaxWidth": "px value",
    "borderRadius": "px value",
    "spacing": "px value",
    "seedProductRatingBarColor": "#hex (use primaryColor value)",
    "seedProductCardTitleColor": "#hex (use primaryColor value)",
    "seedProductTitleColor": "#hex (use headingColor or primaryColor)"
  }
}

IMPORTANT: For seedProductRatingBarColor, seedProductCardTitleColor, and seedProductTitleColor - use the primaryColor value you extracted. These should match the brand's primary color.

Extract colors, sizes, and spacing from the visual design. Return ONLY the JSON, no explanations.`;

// AI Style endpoint (text-based styling)
app.post('/api/ai-style', async (req, res) => {
  const apiKey = process.env.AZURE_OPENAI_KEY;
  const azureEndpoint = process.env.AZURE_OPENAI_ENDPOINT || 'https://boris-m94gthfb-eastus2.cognitiveservices.azure.com';
  const apiVersion = '2024-12-01-preview';
  const deploymentName = 'gpt-4o';

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
      `${azureEndpoint}/openai/deployments/${deploymentName}/chat/completions?api-version=${apiVersion}`,
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
  const azureEndpoint = process.env.AZURE_OPENAI_ENDPOINT || 'https://boris-m94gthfb-eastus2.cognitiveservices.azure.com';
  const apiVersion = '2024-12-01-preview';
  const deploymentName = 'gpt-4o';

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
      `${azureEndpoint}/openai/deployments/${deploymentName}/chat/completions?api-version=${apiVersion}`,
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
const PDF_EXTRACT_PROMPT = `You are a seed product data extractor. Analyze the provided PDF/document image and extract all seed product information.

Return ONLY valid JSON with this exact structure:
{
  "productName": "Full product name with variety code (e.g., 'Allegiant 822')",
  "description": "Brief product description or marketing tagline",
  "ratings": [
    { "label": "Label from document", "value": <number 1-9> }
  ],
  "agronomics": [
    { "label": "Characteristic name", "value": "value as string" }
  ],
  "fieldPerformance": [
    { "label": "Condition type", "value": "rating text" }
  ],
  "diseaseResistance": [
    { "label": "Disease name", "value": "rating as string" }
  ]
}

CRITICAL RULES - DATA CAN APPEAR IN MULTIPLE ARRAYS:

1. "ratings" array = ALL items with NUMERIC values 1-9 (for rating bar display)
   - Emergence: 2, Test Weight: 2, Standability: 3, Protein Content: 2, Yield Potential: 2
   - Disease numeric ratings: Fusarium Head Blight: 6, Saw Fly: 8, Tillering: 3

2. "agronomics" array = ALL agronomic/plant characteristics INCLUDING those with numeric ratings
   - Include: Emergence: "2", Test weight: "2", Standability: "3", Protein content: "2", Yield potential: "2"
   - Also include: Plant height: "Med-tall", Planting rate: "Med-high", Maturity: "Med-late"
   - Values are STRINGS here (even numbers become "2", "3", etc.)

3. "diseaseResistance" array = ALL disease tolerance items INCLUDING those with numeric ratings
   - Include: Fusarium Head Blight: "6", Saw Fly: "8", Tillering: "3"
   - Also include: Hessian Fly: "Very good", Stripe Rust: "Excellent"
   - Values are STRINGS here (even numbers become "6", "8", etc.)

4. Items with 1-9 numeric ratings appear in BOTH:
   - "ratings" array (with numeric value for rating bars)
   - Their category array (agronomics or diseaseResistance) with string value for card display

5. Use EXACT labels from PDF, keep abbreviations (SDS, IDC, BSR)
6. Rating scale: 1=Excellent, 5=Average, 9=Fair
7. Return ONLY JSON, no explanations`;

app.post('/api/ai-pdf-extract', async (req, res) => {
  const apiKey = process.env.AZURE_OPENAI_KEY;
  const azureEndpoint = process.env.AZURE_OPENAI_ENDPOINT || 'https://boris-m94gthfb-eastus2.cognitiveservices.azure.com';
  const apiVersion = '2024-12-01-preview';
  const deploymentName = 'gpt-4o';

  if (!apiKey) {
    return res.status(500).json({ error: 'Azure OpenAI API key not configured' });
  }

  try {
    const { pdfImage } = req.body;

    if (!pdfImage) {
      return res.status(400).json({ error: 'Missing PDF image data' });
    }

    const response = await fetch(
      `${azureEndpoint}/openai/deployments/${deploymentName}/chat/completions?api-version=${apiVersion}`,
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

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
