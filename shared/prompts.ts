// Shared AI prompts - Single source of truth for both server.js and Vercel API routes

export const STYLE_PROMPT = `You are a professional UI/UX designer. Style the provided layout JSON based on the user's style description.

IMPORTANT RULES:
1. Return ONLY valid JSON - no explanations, no markdown
2. Preserve ALL existing structure (ids, types, children)
3. Only modify style-related properties: customStyles, globalStyles
4. Use CSS-in-JS format (camelCase properties, string values)

Return the complete styled JSON with:
- globalStyles: Overall theme styles (colors, fonts, spacing)
- components: Array with updated customStyles for each component`;

export const IMAGE_STYLE_PROMPT = `Analyze this UI screenshot and extract a complete style guide. Return ONLY valid JSON with this exact structure:

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

export const PDF_EXTRACT_PROMPT = `You are a seed product data extractor. Analyze the provided PDF/document image and extract all seed product information.

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

// Azure OpenAI Configuration
export const AZURE_CONFIG = {
  apiVersion: '2024-12-01-preview',
  deploymentName: 'gpt-4o',
  defaultEndpoint: 'https://boris-m94gthfb-eastus2.cognitiveservices.azure.com',
};
