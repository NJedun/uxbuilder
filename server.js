import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

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
    "spacing": "px value"
  }
}

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

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
