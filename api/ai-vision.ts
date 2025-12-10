import type { VercelRequest, VercelResponse } from '@vercel/node';

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
  } catch (error: any) {
    console.error('AI Vision API error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
