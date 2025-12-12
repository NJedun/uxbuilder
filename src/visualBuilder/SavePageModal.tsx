import { useState, useEffect } from 'react';
import { useVisualBuilderStore } from '../store/visualBuilderStore';
import { PageType } from '../types/layout';

interface PLPOption {
  rowKey: string;
  title: string;
  slug: string;
  partitionKey: string;
}

interface LayoutOption {
  rowKey: string;
  name: string;
  partitionKey: string;
  isDefault: boolean;
}

interface EditingPage {
  rowKey: string;
  partitionKey: string;
  pageType: 'PLP' | 'PDP' | 'landingPage';
  slug: string;
  parentRowKey: string | null;
  layoutRowKey: string | null;
  title: string;
  summary: string;
  category: string | null;
}

interface SavePageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
  editingPage?: EditingPage | null;
  previewLayoutId?: string | null;
}

export default function SavePageModal({ isOpen, onClose, onSaved, editingPage, previewLayoutId }: SavePageModalProps) {
  const { components, sectionComponents, globalStyles, projectName } = useVisualBuilderStore();

  const isEditing = !!editingPage;

  const [project, setProject] = useState(projectName || 'Farming');
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [pageType, setPageType] = useState<'PLP' | 'PDP' | 'landingPage'>('PDP');
  const [category, setCategory] = useState(''); // For PLP
  const [parentRowKey, setParentRowKey] = useState(''); // For PDP
  const [layoutRowKey, setLayoutRowKey] = useState(''); // Selected layout
  const [isPublished, setIsPublished] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Available PLPs for parent selection
  const [plpOptions, setPlpOptions] = useState<PLPOption[]>([]);
  const [loadingPLPs, setLoadingPLPs] = useState(false);

  // Available layouts
  const [layoutOptions, setLayoutOptions] = useState<LayoutOption[]>([]);
  const [loadingLayouts, setLoadingLayouts] = useState(false);

  // Populate form when editing
  useEffect(() => {
    if (isOpen && editingPage) {
      setProject(editingPage.partitionKey);
      setTitle(editingPage.title);
      setSummary(editingPage.summary || '');
      setPageType(editingPage.pageType);
      setLayoutRowKey(editingPage.layoutRowKey || '');
      if (editingPage.pageType === 'PLP') {
        setCategory(editingPage.category || '');
        setParentRowKey('');
      } else if (editingPage.pageType === 'PDP') {
        setCategory('');
        setParentRowKey(editingPage.parentRowKey || '');
      } else {
        setCategory('');
        setParentRowKey('');
      }
    }
  }, [isOpen, editingPage]);

  // Set previewLayoutId as initial layout when opening for new page
  useEffect(() => {
    if (isOpen && !isEditing && previewLayoutId) {
      setLayoutRowKey(previewLayoutId);
    }
  }, [isOpen, isEditing, previewLayoutId]);

  // Fetch existing PLPs and layouts when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchPLPs();
      fetchLayouts();
    }
  }, [isOpen]);

  const fetchPLPs = async () => {
    try {
      setLoadingPLPs(true);
      const baseUrl = import.meta.env.DEV ? 'http://localhost:3001' : '';
      const response = await fetch(`${baseUrl}/api/pages?type=PLP`);

      if (response.ok) {
        const data = await response.json();
        setPlpOptions(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch PLPs:', err);
    } finally {
      setLoadingPLPs(false);
    }
  };

  const fetchLayouts = async () => {
    try {
      setLoadingLayouts(true);
      const baseUrl = import.meta.env.DEV ? 'http://localhost:3001' : '';
      const response = await fetch(`${baseUrl}/api/pages?type=layout`);

      if (response.ok) {
        const data = await response.json();
        const layouts = (data.data || []).map((l: any) => ({
          rowKey: l.rowKey,
          name: l.name || l.title,
          partitionKey: l.partitionKey,
          isDefault: l.isDefault || false,
        }));
        setLayoutOptions(layouts);

        // Auto-select layout for new pages: prioritize previewLayoutId, then default layout
        if (!isEditing && !layoutRowKey) {
          if (previewLayoutId) {
            // Use the layout selected in the preview
            setLayoutRowKey(previewLayoutId);
          } else {
            // Fall back to default layout
            const defaultLayout = layouts.find((l: LayoutOption) => l.isDefault);
            if (defaultLayout) {
              setLayoutRowKey(defaultLayout.rowKey);
            }
          }
        }
      }
    } catch (err) {
      console.error('Failed to fetch layouts:', err);
    } finally {
      setLoadingLayouts(false);
    }
  };

  // Filter layouts by current project
  const filteredLayouts = layoutOptions.filter(
    (l) => l.partitionKey === project || !project
  );

  // Generate slug based on page type
  const generateSlug = (): string => {
    const titleSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    if (pageType === 'PLP') {
      return category.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }

    if (pageType === 'landingPage') {
      return titleSlug;
    }

    // For PDP, combine parent slug with title
    const parent = plpOptions.find((p) => p.rowKey === parentRowKey);
    if (parent) {
      return `${parent.slug}/${titleSlug}`;
    }
    return titleSlug;
  };

  const handleSave = async () => {
    // Validation
    if (!project.trim()) {
      setError('Project name is required');
      return;
    }
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    if (pageType === 'PLP' && !category) {
      setError('Category is required for PLP pages');
      return;
    }
    if (pageType === 'PDP' && !parentRowKey) {
      setError('Parent category is required for PDP pages');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const baseUrl = import.meta.env.DEV ? 'http://localhost:3001' : '';

      if (isEditing && editingPage) {
        // Update existing page using PUT
        const pageData = {
          pageType,
          slug: editingPage.slug, // Keep original slug when editing
          parentRowKey: pageType === 'PDP' ? parentRowKey : null,
          layoutRowKey: layoutRowKey || null,
          title: title.trim(),
          summary: summary.trim(),
          category: pageType === 'PLP' ? category.trim() : null,
          components: JSON.stringify(components), // Deprecated, keep for backward compatibility
          sectionComponents: JSON.stringify(sectionComponents), // New: components per body section
          globalStyles: JSON.stringify(globalStyles),
          isPublished,
        };

        const response = await fetch(
          `${baseUrl}/api/pages/${editingPage.partitionKey}/${editingPage.rowKey}`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(pageData),
          }
        );

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || 'Failed to update page');
        }

        alert(`Page updated successfully!`);
      } else {
        // Create new page using POST
        const pageData = {
          partitionKey: project.trim(),
          pageType,
          slug: generateSlug(),
          parentRowKey: pageType === 'PDP' ? parentRowKey : null,
          layoutRowKey: layoutRowKey || null,
          title: title.trim(),
          summary: summary.trim(),
          category: pageType === 'PLP' ? category.trim() : null,
          components: JSON.stringify(components), // Deprecated, keep for backward compatibility
          sectionComponents: JSON.stringify(sectionComponents), // New: components per body section
          globalStyles: JSON.stringify(globalStyles),
          isPublished,
        };

        const response = await fetch(`${baseUrl}/api/pages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(pageData),
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || 'Failed to save page');
        }

        const result = await response.json();
        alert(`Page saved successfully!\nSlug: ${result.slug}`);
      }

      onSaved?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save page');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {isEditing ? 'Update Page' : 'Save Page to Azure'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Project Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project Name *
            </label>
            <input
              type="text"
              value={project}
              onChange={(e) => setProject(e.target.value)}
              placeholder="e.g., Farming"
              disabled={isEditing}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isEditing ? 'bg-gray-100 cursor-not-allowed' : ''
              }`}
            />
            <p className="mt-1 text-xs text-gray-500">
              {isEditing ? 'Cannot change project when editing' : 'Groups pages together'}
            </p>
          </div>

          {/* Page Type Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Page Type *
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPageType('PLP')}
                className={`px-3 py-2 text-sm font-medium rounded-md border transition-colors ${
                  pageType === 'PLP'
                    ? 'bg-blue-100 border-blue-500 text-blue-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                PLP (Category)
              </button>
              <button
                type="button"
                onClick={() => setPageType('PDP')}
                className={`px-3 py-2 text-sm font-medium rounded-md border transition-colors ${
                  pageType === 'PDP'
                    ? 'bg-green-100 border-green-500 text-green-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                PDP (Product)
              </button>
              <button
                type="button"
                onClick={() => setPageType('landingPage')}
                className={`px-3 py-2 text-sm font-medium rounded-md border transition-colors ${
                  pageType === 'landingPage'
                    ? 'bg-purple-100 border-purple-500 text-purple-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Landing Page
              </button>
            </div>
          </div>

          {/* Layout Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Layout
            </label>
            <select
              value={layoutRowKey}
              onChange={(e) => setLayoutRowKey(e.target.value)}
              disabled={loadingLayouts}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">No layout (standalone page)</option>
              {filteredLayouts.map((layout) => (
                <option key={layout.rowKey} value={layout.rowKey}>
                  {layout.name} {layout.isDefault ? '(Default)' : ''}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              {layoutRowKey ? 'Page will use layout header/footer' : 'No shared header/footer'}
            </p>
          </div>

          <hr className="my-4" />

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Page Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Allegiant 822 HRSW"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Summary */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Summary
            </label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Short description for listing cards..."
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Category (for PLP) */}
          {pageType === 'PLP' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category Name *
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g., Wheat"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                URL: /preview/{category.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'category-slug'}
              </p>
            </div>
          )}

          {/* Parent (for PDP) */}
          {pageType === 'PDP' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Parent Category *
              </label>
              <select
                value={parentRowKey}
                onChange={(e) => setParentRowKey(e.target.value)}
                disabled={loadingPLPs}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a parent PLP...</option>
                {plpOptions.map((plp) => (
                  <option key={plp.rowKey} value={plp.rowKey}>
                    {plp.title} ({plp.partitionKey})
                  </option>
                ))}
              </select>
              {parentRowKey && (
                <p className="mt-1 text-xs text-gray-500">
                  URL: /preview/{generateSlug()}
                </p>
              )}
            </div>
          )}

          {/* Landing Page slug preview */}
          {pageType === 'landingPage' && title && (
            <p className="text-xs text-gray-500">
              URL: /preview/{title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}
            </p>
          )}

          <hr className="my-4" />

          {/* Publish Toggle */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isPublished"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="isPublished" className="text-sm text-gray-700">
              Publish immediately
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saving && (
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            {saving ? 'Saving...' : isEditing ? 'Update Page' : 'Save Page'}
          </button>
        </div>
      </div>
    </div>
  );
}
