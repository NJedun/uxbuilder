import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../types/layout';

interface LayoutEntity {
  rowKey: string;
  partitionKey: string;
  pageType: string;
  name: string;
  slug: string;
  description?: string;
  isDefault?: boolean;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function LayoutManager() {
  const [layouts, setLayouts] = useState<LayoutEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<string>('all');

  // Get unique projects from layouts
  const projects = Array.from(new Set(layouts.map((l) => l.partitionKey)));

  // Filter layouts by project
  const filteredLayouts = selectedProject === 'all'
    ? layouts
    : layouts.filter((l) => l.partitionKey === selectedProject);

  useEffect(() => {
    fetchLayouts();
  }, []);

  const fetchLayouts = async () => {
    try {
      setLoading(true);
      const baseUrl = import.meta.env.DEV ? 'http://localhost:3001' : '';
      const response = await fetch(`${baseUrl}/api/pages?type=layout`);

      if (!response.ok) {
        throw new Error('Failed to fetch layouts');
      }

      const data = await response.json();
      setLayouts(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load layouts');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (rowKey: string, partitionKey: string) => {
    if (!confirm('Are you sure you want to delete this layout? Pages using this layout will need to be updated.')) return;

    try {
      const baseUrl = import.meta.env.DEV ? 'http://localhost:3001' : '';
      const response = await fetch(`${baseUrl}/api/pages/${partitionKey}/${rowKey}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete layout');
      }

      fetchLayouts();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete layout');
    }
  };

  const handleSetDefault = async (rowKey: string, partitionKey: string) => {
    try {
      const baseUrl = import.meta.env.DEV ? 'http://localhost:3001' : '';

      // First, unset any existing default for this project
      const projectLayouts = layouts.filter(l => l.partitionKey === partitionKey && l.isDefault);
      for (const layout of projectLayouts) {
        await fetch(`${baseUrl}/api/pages/${partitionKey}/${layout.rowKey}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isDefault: false }),
        });
      }

      // Set new default
      const response = await fetch(`${baseUrl}/api/pages/${partitionKey}/${rowKey}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDefault: true }),
      });

      if (!response.ok) {
        throw new Error('Failed to set default layout');
      }

      fetchLayouts();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to set default layout');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                to="/visual-builder"
                className="text-xl font-bold text-gray-800 hover:text-gray-600 transition-colors"
              >
                Visual AI Builder
              </Link>
              <span className="text-gray-300">|</span>
              <h1 className="text-lg font-semibold text-gray-700">Layout Manager</h1>
            </div>
            <div className="flex items-center gap-4">
              {/* Project Filter */}
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Projects</option>
                {projects.map((project) => (
                  <option key={project} value={project}>
                    {project}
                  </option>
                ))}
              </select>
              <Link
                to="/layout-editor"
                className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-800 transition-colors font-medium text-sm"
              >
                + Create Layout
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-500"></div>
            <span className="ml-3 text-gray-600">Loading layouts...</span>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="text-2xl font-bold text-gray-900">{layouts.length}</div>
                <div className="text-sm text-gray-500">Total Layouts</div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="text-2xl font-bold text-purple-600">{projects.length}</div>
                <div className="text-sm text-gray-500">Projects with Layouts</div>
              </div>
            </div>

            {/* Layout Grid */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">Layouts</h2>
              </div>

              {filteredLayouts.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No layouts yet</h3>
                  <p className="text-gray-500 mb-4">
                    Layouts define the header, footer, and content area for your pages.
                  </p>
                  <Link
                    to="/layout-editor"
                    className="inline-flex items-center px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-800 transition-colors font-medium text-sm"
                  >
                    Create your first layout
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                  {filteredLayouts.map((layout) => (
                    <div
                      key={layout.rowKey}
                      className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                    >
                      {/* Layout Preview */}
                      <div className="bg-gray-100 p-4 h-32 flex flex-col">
                        <div className="bg-gray-300 h-4 rounded mb-2" /> {/* Header placeholder */}
                        <div className="flex-1 bg-white rounded border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-xs">
                          Body Content Zone
                        </div>
                        <div className="bg-gray-300 h-4 rounded mt-2" /> {/* Footer placeholder */}
                      </div>

                      {/* Layout Info */}
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium text-gray-900">{layout.name}</h3>
                          <div className="flex items-center gap-2">
                            {layout.isDefault && (
                              <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded">
                                Default
                              </span>
                            )}
                            <span
                              className={`px-2 py-0.5 text-xs rounded ${
                                layout.isPublished
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-yellow-100 text-yellow-700'
                              }`}
                            >
                              {layout.isPublished ? 'Published' : 'Draft'}
                            </span>
                          </div>
                        </div>

                        <p className="text-sm text-gray-500 mb-2 line-clamp-2">
                          {layout.description || 'No description'}
                        </p>

                        <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                          <span>{layout.partitionKey}</span>
                          <span>{new Date(layout.updatedAt).toLocaleDateString()}</span>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                          <Link
                            to={`/layout-editor?edit=${layout.rowKey}&project=${layout.partitionKey}`}
                            className="flex-1 px-3 py-1.5 text-xs text-center text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                          >
                            Edit
                          </Link>
                          <Link
                            to={`/layout-editor?duplicate=${layout.rowKey}&project=${layout.partitionKey}`}
                            className="flex-1 px-3 py-1.5 text-xs text-center text-teal-600 hover:bg-teal-50 rounded transition-colors"
                          >
                            Duplicate
                          </Link>
                          {!layout.isDefault && (
                            <button
                              onClick={() => handleSetDefault(layout.rowKey, layout.partitionKey)}
                              className="flex-1 px-3 py-1.5 text-xs text-center text-purple-600 hover:bg-purple-50 rounded transition-colors"
                            >
                              Set Default
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(layout.rowKey, layout.partitionKey)}
                            className="flex-1 px-3 py-1.5 text-xs text-center text-red-600 hover:bg-red-50 rounded transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Help Section */}
            <div className="mt-8 bg-purple-50 border border-purple-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-purple-900 mb-2">About Layouts</h3>
              <ul className="text-sm text-purple-800 space-y-1">
                <li>• Layouts define the structure shared across multiple pages (header, footer, content zone)</li>
                <li>• Create different layouts for different page types (e.g., "PDP Layout" with hero banner)</li>
                <li>• Set a default layout that will be pre-selected when creating new pages</li>
                <li>• Edit layout components (logo, navigation, footer links) in the Layout Editor</li>
              </ul>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
