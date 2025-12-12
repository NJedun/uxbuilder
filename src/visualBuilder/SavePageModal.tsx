import { useState, useEffect } from 'react';
import { useVisualBuilderStore } from '../store/visualBuilderStore';

interface PLPOption {
  rowKey: string;
  title: string;
  slug: string;
  partitionKey: string;
}

interface EditingPage {
  rowKey: string;
  partitionKey: string;
  pageType: 'PLP' | 'PDP';
  slug: string;
  parentRowKey: string | null;
  title: string;
  summary: string;
  category: string | null;
}

interface SavePageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
  editingPage?: EditingPage | null;
}

export default function SavePageModal({ isOpen, onClose, onSaved, editingPage }: SavePageModalProps) {
  const { components, globalStyles, projectName } = useVisualBuilderStore();

  const isEditing = !!editingPage;

  const [project, setProject] = useState(projectName || 'Farming');
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [category, setCategory] = useState(''); // If filled -> PLP
  const [parentRowKey, setParentRowKey] = useState(''); // If filled -> PDP
  const [isPublished, setIsPublished] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Available PLPs for parent selection
  const [plpOptions, setPlpOptions] = useState<PLPOption[]>([]);
  const [loadingPLPs, setLoadingPLPs] = useState(false);

  // Populate form when editing
  useEffect(() => {
    if (isOpen && editingPage) {
      setProject(editingPage.partitionKey);
      setTitle(editingPage.title);
      setSummary(editingPage.summary || '');
      if (editingPage.pageType === 'PLP') {
        setCategory(editingPage.category || '');
        setParentRowKey('');
      } else {
        setCategory('');
        setParentRowKey(editingPage.parentRowKey || '');
      }
    }
  }, [isOpen, editingPage]);

  // Fetch existing PLPs when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchPLPs();
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

  // Determine page type based on inputs
  const getPageType = (): 'PLP' | 'PDP' => {
    if (category && !parentRowKey) return 'PLP';
    return 'PDP';
  };

  // Generate slug
  const generateSlug = (): string => {
    const titleSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    if (getPageType() === 'PLP') {
      return category.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
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
    if (!category && !parentRowKey) {
      setError('Either Category (for PLP) or Parent (for PDP) must be specified');
      return;
    }
    if (category && parentRowKey) {
      setError('Cannot set both Category and Parent. Choose one.');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const baseUrl = import.meta.env.DEV ? 'http://localhost:3001' : '';

      if (isEditing && editingPage) {
        // Update existing page using PUT
        const pageData = {
          pageType: getPageType(),
          slug: editingPage.slug, // Keep original slug when editing
          parentRowKey: parentRowKey || null,
          title: title.trim(),
          summary: summary.trim(),
          category: category.trim() || null,
          components: JSON.stringify(components),
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
          pageType: getPageType(),
          slug: generateSlug(),
          parentRowKey: parentRowKey || null,
          title: title.trim(),
          summary: summary.trim(),
          category: category.trim() || null,
          components: JSON.stringify(components),
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

  const pageType = getPageType();

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
        <div className="px-6 py-4 space-y-4">
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

          <hr className="my-4" />

          <p className="text-sm text-gray-600 mb-2">
            Choose <strong>one</strong> option below:
          </p>

          {/* Category (for PLP) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category (creates a PLP)
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                if (e.target.value) setParentRowKey(''); // Clear parent
              }}
              placeholder="e.g., Wheat"
              disabled={!!parentRowKey}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                parentRowKey ? 'bg-gray-100 cursor-not-allowed' : ''
              }`}
            />
            <p className="mt-1 text-xs text-gray-500">
              URL: /preview/{category.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'category-slug'}
            </p>
          </div>

          <div className="text-center text-gray-400 text-sm">— OR —</div>

          {/* Parent (for PDP) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Parent Category (creates a PDP)
            </label>
            <select
              value={parentRowKey}
              onChange={(e) => {
                setParentRowKey(e.target.value);
                if (e.target.value) setCategory(''); // Clear category
              }}
              disabled={!!category || loadingPLPs}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                category ? 'bg-gray-100 cursor-not-allowed' : ''
              }`}
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

          <hr className="my-4" />

          {/* Page Type Indicator */}
          <div className="flex items-center justify-between bg-gray-50 rounded-md p-3">
            <span className="text-sm text-gray-600">Page Type:</span>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                pageType === 'PLP'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-green-100 text-green-800'
              }`}
            >
              {pageType === 'PLP' ? 'Category Page (PLP)' : 'Product Page (PDP)'}
            </span>
          </div>

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
