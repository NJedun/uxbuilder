import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PDF_EXTRACT_PROMPT, AZURE_CONFIG } from '../shared/prompts';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
  } catch (error: any) {
    console.error('PDF Extract API error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
