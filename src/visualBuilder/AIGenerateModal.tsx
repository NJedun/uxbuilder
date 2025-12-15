import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useVisualBuilderStore, VisualComponent } from '../store/visualBuilderStore';

interface AIGenerateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Attempt to repair common JSON issues from AI responses
function repairJson(jsonStr: string): string {
  let repaired = jsonStr;

  // Remove any text before the first { or [
  const firstBrace = repaired.indexOf('{');
  const firstBracket = repaired.indexOf('[');
  const startIndex = Math.min(
    firstBrace >= 0 ? firstBrace : Infinity,
    firstBracket >= 0 ? firstBracket : Infinity
  );
  if (startIndex !== Infinity && startIndex > 0) {
    repaired = repaired.substring(startIndex);
  }

  // Remove any text after the last } or ]
  const lastBrace = repaired.lastIndexOf('}');
  const lastBracket = repaired.lastIndexOf(']');
  const endIndex = Math.max(lastBrace, lastBracket);
  if (endIndex > 0) {
    repaired = repaired.substring(0, endIndex + 1);
  }

  // Fix trailing commas before closing brackets/braces
  repaired = repaired.replace(/,(\s*[}\]])/g, '$1');

  // Fix unquoted property names
  repaired = repaired.replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)(\s*:)/g, '$1"$2"$3');

  // Replace single quotes with double quotes (but not inside strings)
  repaired = repaired.replace(/'/g, '"');

  // Remove control characters except newlines and tabs
  repaired = repaired.replace(/[\x00-\x1F\x7F]/g, (char) => {
    if (char === '\n' || char === '\r' || char === '\t') return char;
    return '';
  });

  // Fix missing commas between array elements (common AI error)
  // Look for }{ or }[ or ]{ patterns without comma
  repaired = repaired.replace(/\}(\s*)\{/g, '},$1{');
  repaired = repaired.replace(/\}(\s*)\[/g, '},$1[');
  repaired = repaired.replace(/\](\s*)\{/g, '],$1{');

  // Fix missing commas after string values followed by a key
  repaired = repaired.replace(/"(\s*)"([a-zA-Z_])/g, '",$1"$2');

  // Fix double commas
  repaired = repaired.replace(/,\s*,/g, ',');

  return repaired;
}

// Generate unique IDs for components
function generateId(type: string): string {
  return `${type.toLowerCase()}-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

// Process AI response and add IDs to components
function processComponents(components: any[]): VisualComponent[] {
  return components.map((comp) => {
    const processed: VisualComponent = {
      id: generateId(comp.type),
      type: comp.type,
      props: comp.props || {},
      customStyles: comp.customStyles || {},
    };

    if (comp.children && Array.isArray(comp.children)) {
      processed.children = processComponents(comp.children);
    }

    return processed;
  });
}

export default function AIGenerateModal({ isOpen, onClose }: AIGenerateModalProps) {
  const { addComponent, activeSectionId } = useVisualBuilderStore();
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [previewComponents, setPreviewComponents] = useState<VisualComponent[] | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Delete a component from preview (top-level)
  const handleDeleteComponent = (index: number) => {
    if (!previewComponents) return;
    const updated = previewComponents.filter((_, i) => i !== index);
    setPreviewComponents(updated);
  };

  // Delete a child component from a Row
  const handleDeleteChild = (parentIndex: number, childIndex: number) => {
    if (!previewComponents) return;
    const updated = [...previewComponents];
    const parent = updated[parentIndex];
    if (parent.children) {
      parent.children = parent.children.filter((_, i) => i !== childIndex);
      // Update columns count if needed
      if (parent.props.columns && parent.children.length < parent.props.columns) {
        parent.props = { ...parent.props, columns: Math.max(1, parent.children.length) };
      }
    }
    setPreviewComponents(updated);
  };

  // Move component up
  const handleMoveUp = (index: number) => {
    if (!previewComponents || index === 0) return;
    const updated = [...previewComponents];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    setPreviewComponents(updated);
  };

  // Move component down
  const handleMoveDown = (index: number) => {
    if (!previewComponents || index === previewComponents.length - 1) return;
    const updated = [...previewComponents];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    setPreviewComponents(updated);
  };

  // Move child up within parent
  const handleMoveChildUp = (parentIndex: number, childIndex: number) => {
    if (!previewComponents || childIndex === 0) return;
    const updated = [...previewComponents];
    const parent = updated[parentIndex];
    if (parent.children && childIndex > 0) {
      [parent.children[childIndex - 1], parent.children[childIndex]] =
        [parent.children[childIndex], parent.children[childIndex - 1]];
    }
    setPreviewComponents(updated);
  };

  // Move child down within parent
  const handleMoveChildDown = (parentIndex: number, childIndex: number) => {
    if (!previewComponents) return;
    const updated = [...previewComponents];
    const parent = updated[parentIndex];
    if (parent.children && childIndex < parent.children.length - 1) {
      [parent.children[childIndex], parent.children[childIndex + 1]] =
        [parent.children[childIndex + 1], parent.children[childIndex]];
    }
    setPreviewComponents(updated);
  };

  // Drag and drop handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragEnd = () => {
    if (draggedIndex !== null && dragOverIndex !== null && draggedIndex !== dragOverIndex && previewComponents) {
      const updated = [...previewComponents];
      const [removed] = updated.splice(draggedIndex, 1);
      updated.splice(dragOverIndex, 0, removed);
      setPreviewComponents(updated);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

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
      const maxSize = 1500; // Higher res for better text extraction
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
      const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setImage(compressedDataUrl);
      setError('');
      setPreviewComponents(null);
    };
    img.onerror = () => setError('Failed to load image');
    img.src = URL.createObjectURL(file);
  };

  const handleRemoveImage = () => {
    setImage(null);
    setPreviewComponents(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleGenerate = async () => {
    if (!image) {
      setError('Please upload an image');
      return;
    }

    setLoading(true);
    setError('');
    setStatus('Analyzing image...');
    setPreviewComponents(null);

    try {
      const baseUrl = import.meta.env.DEV ? 'http://localhost:3001' : '';
      const response = await fetch(`${baseUrl}/api/ai-generate-components`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || `API error: ${response.status}`);
      }

      setStatus('Processing response...');
      const data = await response.json();
      const content = data.content || '';

      // Clean and parse JSON
      let cleanedJson = content
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      const jsonMatch = cleanedJson.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanedJson = jsonMatch[0];
      }

      let parsed;
      try {
        parsed = JSON.parse(cleanedJson);
      } catch (firstError) {
        // Try to repair the JSON
        const repairedJson = repairJson(cleanedJson);
        try {
          parsed = JSON.parse(repairedJson);
        } catch (secondError) {
          // Log both for debugging
          console.error('Original JSON parse error:', firstError);
          console.error('Repaired JSON parse error:', secondError);
          console.error('Original JSON (first 1000 chars):', cleanedJson.substring(0, 1000));
          console.error('Repaired JSON (first 1000 chars):', repairedJson.substring(0, 1000));
          throw new Error('Failed to parse AI response. The AI returned invalid JSON. Please try again.');
        }
      }

      if (!parsed.components || !Array.isArray(parsed.components)) {
        throw new Error('Invalid response - missing components array');
      }

      // Process components and add IDs
      const processedComponents = processComponents(parsed.components);
      setPreviewComponents(processedComponents);
      setStatus('');

    } catch (err: any) {
      console.error('AI Generate error:', err);
      setError(err.message || 'Failed to generate components. Please try again.');
      setStatus('');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCanvas = () => {
    if (!previewComponents || previewComponents.length === 0) return;

    if (!activeSectionId) {
      setError('Please select a body section first');
      return;
    }

    // Add each component to the canvas
    previewComponents.forEach((component) => {
      addComponent(component);
    });

    // Close modal
    onClose();
  };

  const handleClose = () => {
    setImage(null);
    setPreviewComponents(null);
    setError('');
    setStatus('');
    onClose();
  };

  // Render component preview with controls
  // parentIndex is used for nested components (children of Row)
  const renderComponentPreview = (
    comp: VisualComponent,
    index: number,
    isTopLevel: boolean,
    parentIndex?: number,
    siblingCount?: number
  ) => {
    const bgColors: Record<string, string> = {
      Heading: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
      Text: 'bg-gray-50 border-gray-200 hover:bg-gray-100',
      Button: 'bg-purple-50 border-purple-200 hover:bg-purple-100',
      Image: 'bg-green-50 border-green-200 hover:bg-green-100',
      Row: 'bg-orange-50 border-orange-200 hover:bg-orange-100',
      ImageBox: 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100',
      LinkList: 'bg-pink-50 border-pink-200 hover:bg-pink-100',
      Divider: 'bg-gray-100 border-gray-300 hover:bg-gray-200',
    };

    const colorClass = bgColors[comp.type] || 'bg-gray-50 border-gray-200 hover:bg-gray-100';
    const isDragging = isTopLevel && draggedIndex === index;
    const isDragOver = isTopLevel && dragOverIndex === index;

    return (
      <div
        key={comp.id}
        draggable={isTopLevel}
        onDragStart={isTopLevel ? () => handleDragStart(index) : undefined}
        onDragOver={isTopLevel ? (e) => handleDragOver(e, index) : undefined}
        onDragEnd={isTopLevel ? handleDragEnd : undefined}
        className={`${isTopLevel ? 'cursor-move' : ''} ${isDragging ? 'opacity-50' : ''} ${isDragOver ? 'ring-2 ring-blue-400' : ''}`}
      >
        <div className={`p-2 mb-1 rounded border ${colorClass} transition-colors group`}>
          <div className="flex items-center gap-2">
            {/* Drag handle for top-level */}
            {isTopLevel && (
              <span className="text-gray-400 cursor-move" title="Drag to reorder">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M7 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
                </svg>
              </span>
            )}

            <span className="text-xs font-semibold text-gray-600">{comp.type}</span>

            {/* Component preview text */}
            <span className="text-xs text-gray-500 truncate flex-1 max-w-[120px]">
              {comp.type === 'Heading' && `"${comp.props.text}"`}
              {comp.type === 'Text' && `"${comp.props.content?.substring(0, 30)}..."`}
              {comp.type === 'Button' && `"${comp.props.text}"`}
              {comp.type === 'Row' && `${comp.props.columns} columns`}
              {comp.type === 'ImageBox' && `${comp.props.icon || '🖼️'} ${comp.props.title}`}
              {comp.type === 'Image' && '[placeholder]'}
              {comp.type === 'LinkList' && `${comp.props.links?.length || 0} links`}
            </span>

            {/* Action buttons for top-level components */}
            {isTopLevel && previewComponents && (
              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity ml-auto">
                {/* Move up */}
                <button
                  onClick={(e) => { e.stopPropagation(); handleMoveUp(index); }}
                  disabled={index === 0}
                  className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Move up"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </button>
                {/* Move down */}
                <button
                  onClick={(e) => { e.stopPropagation(); handleMoveDown(index); }}
                  disabled={index === previewComponents.length - 1}
                  className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Move down"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {/* Delete */}
                <button
                  onClick={(e) => { e.stopPropagation(); handleDeleteComponent(index); }}
                  className="p-1 text-gray-400 hover:text-red-500"
                  title="Remove component"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}

            {/* Action buttons for nested (child) components */}
            {!isTopLevel && parentIndex !== undefined && siblingCount !== undefined && (
              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity ml-auto">
                {/* Move left (up in order) */}
                <button
                  onClick={(e) => { e.stopPropagation(); handleMoveChildUp(parentIndex, index); }}
                  disabled={index === 0}
                  className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Move left"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                {/* Move right (down in order) */}
                <button
                  onClick={(e) => { e.stopPropagation(); handleMoveChildDown(parentIndex, index); }}
                  disabled={index === siblingCount - 1}
                  className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Move right"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                {/* Delete */}
                <button
                  onClick={(e) => { e.stopPropagation(); handleDeleteChild(parentIndex, index); }}
                  className="p-1 text-gray-400 hover:text-red-500"
                  title="Remove from row"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
        {/* Render children (nested components like Row children) */}
        {comp.children && comp.children.length > 0 && (
          <div className="ml-4 border-l-2 border-gray-200 pl-2">
            {comp.children.map((child, childIndex) =>
              renderComponentPreview(child, childIndex, false, index, comp.children!.length)
            )}
          </div>
        )}
      </div>
    );
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />

      <div className="relative bg-white rounded-xl shadow-2xl w-[95vw] max-w-[700px] max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🤖</span>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Generate from Image</h2>
              <p className="text-xs text-gray-500">Upload a screenshot to generate components</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Left: Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Screenshot
              </label>
              <p className="text-xs text-gray-500 mb-3">
                Upload a screenshot of a webpage section. AI will extract text and layout.
              </p>
              {!image ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-colors"
                >
                  <div className="text-4xl mb-2">📸</div>
                  <p className="text-sm text-gray-600">Click to upload</p>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG</p>
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={image}
                    alt="Screenshot"
                    className="w-full h-48 object-contain rounded-lg border bg-gray-50"
                  />
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
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              {/* Generate Button */}
              {image && !previewComponents && (
                <button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Analyzing...
                    </>
                  ) : (
                    <>🔍 Analyze Image</>
                  )}
                </button>
              )}
            </div>

            {/* Right: Preview */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Detected Components
              </label>
              <div className="border border-gray-200 rounded-lg p-3 min-h-[200px] max-h-[350px] overflow-y-auto bg-gray-50">
                {!previewComponents && !loading && (
                  <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                    Upload an image and click Analyze
                  </div>
                )}
                {loading && (
                  <div className="flex flex-col items-center justify-center h-full gap-2">
                    <svg className="w-8 h-8 text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <p className="text-sm text-gray-500">{status}</p>
                  </div>
                )}
                {previewComponents && previewComponents.length > 0 && (
                  <div className="space-y-1">
                    {previewComponents.map((comp, index) => renderComponentPreview(comp, index, true))}
                  </div>
                )}
                {previewComponents && previewComponents.length === 0 && (
                  <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                    No components detected
                  </div>
                )}
              </div>

              {/* Component count */}
              {previewComponents && previewComponents.length > 0 && (
                <p className="mt-2 text-xs text-gray-500">
                  {previewComponents.length} top-level component{previewComponents.length !== 1 ? 's' : ''} detected
                </p>
              )}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* No active section warning */}
          {!activeSectionId && previewComponents && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-700">
                ⚠️ No body section selected. Please select a body section in the canvas first.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
          <div className="text-xs text-gray-500">
            Components will be added to the active body section
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            {previewComponents && previewComponents.length > 0 && (
              <button
                onClick={handleAddToCanvas}
                disabled={!activeSectionId}
                className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                ✓ Add to Canvas
              </button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
