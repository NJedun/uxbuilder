import type { VercelRequest, VercelResponse } from '@vercel/node';
import { IMAGE_TO_COMPONENTS_PROMPT, AZURE_CONFIG } from '../shared/prompts.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
  } catch (error: any) {
    console.error('AI Generate Components API error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
