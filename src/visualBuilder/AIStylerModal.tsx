import { useState, useRef } from 'react';
import { useVisualBuilderStore } from '../store/visualBuilderStore';

interface AIStylerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type StyleMode = 'prompt' | 'image';

const STYLE_PROMPT = `You are a UI stylist. Style this JSON by filling in customStyles and globalStyles with appropriate CSS values.

RULES:
1. Fill style values with colors, sizes, spacing based on the style description
2. Keep structure, IDs unchanged
3. Return ONLY valid JSON - no markdown, no explanation
4. Use hex colors like #1a365d, #ffffff
5. NEVER use shorthand CSS properties (margin, padding, border). ALWAYS use specific properties:
   - Use marginTop, marginRight, marginBottom, marginLeft instead of margin
   - Use paddingTop, paddingRight, paddingBottom, paddingLeft instead of padding
   - Use borderWidth, borderStyle, borderColor instead of border`;

const IMAGE_STYLE_PROMPT = `You are a UI design expert. Analyze this website screenshot and extract a style guide.

Return ONLY a valid JSON object with these globalStyles (use hex colors):
{
  "globalStyles": {
    "headerBackgroundColor": "#...",
    "headerPadding": "12px 40px",
    "logoColor": "#...",
    "logoFontSize": "20px",
    "logoFontWeight": "800",
    "navLinkColor": "#...",
    "navLinkFontSize": "14px",
    "navLinkFontWeight": "500",
    "navLinkGap": "24px",
    "titleColor": "#...",
    "titleFontSize": "28px",
    "titleFontWeight": "700",
    "titleMarginBottom": "12px",
    "subtitleColor": "#...",
    "subtitleFontSize": "14px",
    "subtitleFontWeight": "400",
    "subtitleMarginBottom": "20px",
    "buttonBackgroundColor": "#...",
    "buttonTextColor": "#...",
    "buttonPadding": "14px 32px",
    "buttonBorderRadius": "0",
    "buttonFontSize": "14px",
    "buttonFontWeight": "600",
    "containerBackgroundColor": "#...",
    "containerPadding": "40px",
    "footerBackgroundColor": "#...",
    "footerPadding": "40px 60px",
    "footerTextColor": "#...",
    "linkColor": "#...",
    "dividerColor": "#...",
    "dividerHeight": "2px"
  }
}

IMPORTANT RULES:
1. Extract ACTUAL colors from the image - use hex codes like #1a365d
2. Look carefully at: header/nav, main content, buttons, footer, text hierarchy
3. Return ONLY valid JSON - no markdown, no explanation
4. Use ONLY the exact property names shown above - do not add margin, padding, or border shorthand properties

Return ONLY the JSON, no explanation.`;

// Attempt to repair common JSON issues from AI responses
function repairJson(jsonStr: string): string {
  let repaired = jsonStr;
  repaired = repaired.replace(/,(\s*[}\]])/g, '$1');
  repaired = repaired.replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)(\s*:)/g, '$1"$2"$3');
  repaired = repaired.replace(/'/g, '"');
  repaired = repaired.replace(/[\x00-\x1F\x7F]/g, (char) => {
    if (char === '\n' || char === '\r' || char === '\t') return char;
    return '';
  });
  return repaired;
}

// Remove conflicting shorthand CSS properties to avoid React warnings
function sanitizeStyles(styles: Record<string, any>): Record<string, any> {
  const sanitized = { ...styles };

  // If specific properties exist, remove shorthand
  const hasMarginSpecific = ['marginTop', 'marginRight', 'marginBottom', 'marginLeft']
    .some(p => p in sanitized);
  const hasPaddingSpecific = ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft']
    .some(p => p in sanitized);
  const hasBorderSpecific = ['borderWidth', 'borderStyle', 'borderColor', 'borderTop', 'borderRight', 'borderBottom', 'borderLeft']
    .some(p => p in sanitized);

  if (hasMarginSpecific) delete sanitized.margin;
  if (hasPaddingSpecific) delete sanitized.padding;
  if (hasBorderSpecific) delete sanitized.border;

  return sanitized;
}

// Extract only style-related fields from components for AI processing
function extractStylesOnly(project: any): any {
  const extractComponentStyles = (comp: any): any => {
    const result: any = {
      id: comp.id,
      type: comp.type,
    };
    if (comp.customStyles && Object.keys(comp.customStyles).length > 0) {
      result.customStyles = comp.customStyles;
    }
    if (comp.children && comp.children.length > 0) {
      result.children = comp.children.map(extractComponentStyles);
    }
    return result;
  };

  return {
    name: project.name,
    globalStyles: project.globalStyles || {},
    components: project.components.map(extractComponentStyles),
  };
}

// Merge AI styles back into original project
function mergeStyles(original: any, styled: any): any {
  const mergeComponent = (origComp: any, styledComp: any): any => {
    if (!styledComp) return origComp;

    const result = { ...origComp };
    if (styledComp.customStyles) {
      const mergedStyles = { ...origComp.customStyles, ...styledComp.customStyles };
      result.customStyles = sanitizeStyles(mergedStyles);
    }
    if (origComp.children && styledComp.children) {
      result.children = origComp.children.map((child: any, i: number) =>
        mergeComponent(child, styledComp.children?.[i])
      );
    }
    return result;
  };

  const mergedGlobalStyles = { ...original.globalStyles, ...styled.globalStyles };

  return {
    ...original,
    globalStyles: sanitizeStyles(mergedGlobalStyles),
    components: original.components.map((comp: any, i: number) =>
      mergeComponent(comp, styled.components?.[i])
    ),
  };
}

export default function AIStylerModal({ isOpen, onClose }: AIStylerModalProps) {
  const { exportProject, importProject, updateGlobalStyles } = useVisualBuilderStore();
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('groq_api_key') || '');
  const [prompt, setPrompt] = useState('');
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [mode, setMode] = useState<StyleMode>('prompt');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const maxSize = 1024; // Higher res for vision model
      let { width, height } = img;

      if (width > height && width > maxSize) {
        height = (height * maxSize) / width;
        width = maxSize;
      } else if (height > maxSize) {
        width = (width * maxSize) / height;
        height = maxSize;
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, width, height);
      const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setReferenceImage(compressedDataUrl);
      setError('');
    };
    img.onerror = () => setError('Failed to load image');
    img.src = URL.createObjectURL(file);
  };

  const handleRemoveImage = () => {
    setReferenceImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Text-only styling with llama-3.3-70b
  const callGroqText = async (userPrompt: string): Promise<string> => {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: STYLE_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 32000,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message || `Groq API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  };

  // Vision-based style extraction with Llama 4 Scout (multimodal)
  const callGroqVision = async (imageBase64: string): Promise<string> => {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: IMAGE_STYLE_PROMPT },
              {
                type: 'image_url',
                image_url: { url: imageBase64 },
              },
            ],
          },
        ],
        temperature: 0.3,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message || `Groq Vision API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  };

  const handleStyleWithPrompt = async () => {
    if (!apiKey.trim()) {
      setError('Please enter your Groq API key');
      return;
    }
    if (!prompt.trim()) {
      setError('Please provide a style description');
      return;
    }

    setLoading(true);
    setError('');
    setStatus('Preparing layout...');

    try {
      localStorage.setItem('groq_api_key', apiKey);

      const projectData = exportProject();
      const stylesOnly = extractStylesOnly(projectData);
      const projectJson = JSON.stringify(stylesOnly);

      setStatus('AI is styling...');

      const userPrompt = `Style this layout JSON:\n${projectJson}\n\nStyle: ${prompt}`;
      const responseText = await callGroqText(userPrompt);

      setStatus('Processing response...');

      let cleanedJson = responseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      const jsonMatch = cleanedJson.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanedJson = jsonMatch[0];
      }

      let styledProject;
      try {
        styledProject = JSON.parse(cleanedJson);
      } catch {
        const repairedJson = repairJson(cleanedJson);
        styledProject = JSON.parse(repairedJson);
      }

      if (!styledProject.components || !Array.isArray(styledProject.components)) {
        throw new Error('Invalid response - missing components');
      }

      setStatus('Applying styles...');
      const mergedProject = mergeStyles(projectData, styledProject);
      mergedProject.updatedAt = new Date().toISOString();
      importProject(mergedProject);

      setStatus('Done!');
      setTimeout(onClose, 500);

    } catch (err: any) {
      console.error('AI Styling error:', err);
      setError(err.message || 'Failed to style. Please try again.');
    } finally {
      setLoading(false);
      setStatus('');
    }
  };

  const handleExtractFromImage = async () => {
    if (!apiKey.trim()) {
      setError('Please enter your Groq API key');
      return;
    }
    if (!referenceImage) {
      setError('Please upload a reference image');
      return;
    }

    setLoading(true);
    setError('');
    setStatus('Analyzing image...');

    try {
      localStorage.setItem('groq_api_key', apiKey);

      setStatus('Extracting style guide...');
      const responseText = await callGroqVision(referenceImage);

      setStatus('Processing response...');

      let cleanedJson = responseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      const jsonMatch = cleanedJson.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanedJson = jsonMatch[0];
      }

      let extractedStyles;
      try {
        extractedStyles = JSON.parse(cleanedJson);
      } catch {
        const repairedJson = repairJson(cleanedJson);
        extractedStyles = JSON.parse(repairedJson);
      }

      // Apply to globalStyles
      if (extractedStyles.globalStyles) {
        setStatus('Applying style guide...');
        const sanitizedGlobalStyles = sanitizeStyles(extractedStyles.globalStyles);
        updateGlobalStyles(sanitizedGlobalStyles);
      } else {
        throw new Error('Could not extract styles from image');
      }

      setStatus('Done!');
      setTimeout(onClose, 500);

    } catch (err: any) {
      console.error('Image extraction error:', err);
      setError(err.message || 'Failed to extract styles. Try a clearer screenshot.');
    } finally {
      setLoading(false);
      setStatus('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative bg-white rounded-xl shadow-2xl w-[95vw] max-w-[550px] max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <span className="text-2xl">✨</span>
            <h2 className="text-xl font-semibold text-gray-900">Style with AI</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6 space-y-4">
          {/* Mode Toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Styling Method</label>
            <div className="flex gap-2">
              <button
                onClick={() => setMode('prompt')}
                className={`flex-1 px-3 py-2 text-sm rounded-lg border transition-colors ${
                  mode === 'prompt'
                    ? 'bg-purple-50 border-purple-300 text-purple-700'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span className="mr-1">📝</span> Describe Style
              </button>
              <button
                onClick={() => setMode('image')}
                className={`flex-1 px-3 py-2 text-sm rounded-lg border transition-colors ${
                  mode === 'image'
                    ? 'bg-purple-50 border-purple-300 text-purple-700'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span className="mr-1">🖼️</span> Extract from Image
              </button>
            </div>
          </div>

          {/* API Key */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Groq API Key
              <a
                href="https://console.groq.com/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 text-xs text-blue-500 hover:text-blue-600"
              >
                (Get free key)
              </a>
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="gsk_..."
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm"
            />
          </div>

          {/* Prompt Mode */}
          {mode === 'prompt' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Style Description</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., Dark theme with blue (#1e40af) accents, white text, rounded corners..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm resize-none h-24"
              />
            </div>
          )}

          {/* Image Mode */}
          {mode === 'image' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reference Screenshot
              </label>
              <p className="text-xs text-gray-500 mb-2">
                Upload a screenshot of a website. AI will extract colors and styles.
              </p>
              {!referenceImage ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-purple-400 hover:bg-purple-50/50"
                >
                  <div className="text-3xl mb-2">📸</div>
                  <p className="text-sm text-gray-600">Click to upload screenshot</p>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG (website screenshot works best)</p>
                </div>
              ) : (
                <div className="relative">
                  <img src={referenceImage} alt="Reference" className="w-full h-40 object-cover rounded-lg border" />
                  <button
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Status */}
          {status && (
            <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg flex items-center gap-3">
              <svg className="w-5 h-5 text-purple-500 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <p className="text-sm text-purple-700">{status}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={mode === 'prompt' ? handleStyleWithPrompt : handleExtractFromImage}
            disabled={loading || (mode === 'prompt' ? !prompt.trim() : !referenceImage)}
            className="px-6 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:from-purple-600 hover:to-indigo-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                {mode === 'prompt' ? 'Styling...' : 'Extracting...'}
              </>
            ) : (
              <>{mode === 'prompt' ? '✨ Apply Style' : '🎨 Extract & Apply'}</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
