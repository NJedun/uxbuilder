import type { VercelRequest, VercelResponse } from '@vercel/node';

const PDF_EXTRACT_PROMPT = `You are a seed product data extractor. Analyze the provided PDF/document image and extract all seed product information.

Return ONLY valid JSON with this exact structure:
{
  "productName": "Full product name with variety code (e.g., 'Allegiant 009F23 XF')",
  "description": "Brief product description or marketing tagline",
  "ratings": [
    { "label": "Rating category name", "value": <number 1-9> }
  ],
  "agronomics": [
    { "label": "Characteristic name", "value": "value as string" }
  ],
  "fieldPerformance": [
    { "label": "Soil or condition type", "value": "rating code" }
  ],
  "diseaseResistance": [
    { "label": "Disease name", "value": "rating or score" }
  ]
}

IMPORTANT RULES:
1. Extract ALL available data from the document
2. For numeric ratings (like 1-9 scale), use the NUMBER directly in the value field
3. Rating scale: 1=Excellent, 5=Average, 9=Fair - preserve the original numbers
4. Common rating codes: E=Excellent, VG=Very Good, G=Good, R=Resistant, MR=Moderately Resistant, S=Susceptible, NR=Not Rated
5. Keep original terminology for labels (e.g., "Relative Maturity", "Phytophthora Root Rot")
6. If a section doesn't exist in the document, return an empty array for that section
7. Map similar data even if the document uses different terminology:
   - "Agronomic Traits" → agronomics
   - "Performance" or "Yield" data → fieldPerformance
   - "Disease Ratings" or "Tolerance" → diseaseResistance
8. Return ONLY the JSON object, no explanations or markdown

Example output for a soybean tech sheet:
{
  "productName": "Allegiant 009F23 XF",
  "description": "IDC and standability leader at this relative maturity.",
  "ratings": [
    { "label": "Emergence", "value": 1 },
    { "label": "Standability", "value": 2 },
    { "label": "Stress Tolerance", "value": 2 }
  ],
  "agronomics": [
    { "label": "Relative Maturity", "value": "0.09" },
    { "label": "Plant Height", "value": "Med" },
    { "label": "Plant Type", "value": "Med-bushy" }
  ],
  "fieldPerformance": [
    { "label": "Fine Soil", "value": "VG" },
    { "label": "No-Till", "value": "VG" }
  ],
  "diseaseResistance": [
    { "label": "Phytophthora Root Rot", "value": "6" },
    { "label": "White Mold", "value": "4" },
    { "label": "Brown Stem Rot", "value": "R" }
  ]
}`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
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
  } catch (error: any) {
    console.error('PDF Extract API error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
