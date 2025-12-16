import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AppHeader from '../components/AppHeader';

interface PageEntity {
  rowKey: string;
  partitionKey: string;
  pageType: 'PLP' | 'PDP' | 'landingPage';
  slug: string;
  parentRowKey: string | null;
  title: string;
  summary: string;
  components: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function PageManager() {
  const [pages, setPages] = useState<PageEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<string>('all');

  // Get unique projects from pages
  const projects = Array.from(new Set(pages.map((p) => p.partitionKey)));

  // Filter pages by project
  const filteredPages = selectedProject === 'all'
    ? pages
    : pages.filter((p) => p.partitionKey === selectedProject);

  // Separate PLPs, PDPs, and Landing Pages
  const plpPages = filteredPages.filter((p) => p.pageType === 'PLP');
  const pdpPages = filteredPages.filter((p) => p.pageType === 'PDP');
  const landingPages = filteredPages.filter((p) => p.pageType === 'landingPage');

  // Get child PDPs for a PLP
  const getChildPDPs = (plpRowKey: string) => {
    return filteredPages.filter((p) => p.pageType === 'PDP' && p.parentRowKey === plpRowKey);
  };

  // Get orphan PDPs (no parent or parent not found)
  const orphanPDPs = pdpPages.filter((p) => {
    if (!p.parentRowKey) return true;
    return !plpPages.find((plp) => plp.rowKey === p.parentRowKey);
  });

  // Get parent title for PDP
  const getParentTitle = (parentRowKey: string | null) => {
    if (!parentRowKey) return '-';
    const parent = pages.find((p) => p.rowKey === parentRowKey);
    return parent?.title || parentRowKey;
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      setLoading(true);
      const baseUrl = import.meta.env.DEV ? 'http://localhost:3001' : '';
      const response = await fetch(`${baseUrl}/api/pages`);

      if (!response.ok) {
        throw new Error('Failed to fetch pages');
      }

      const data = await response.json();
      setPages(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load pages');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (rowKey: string, partitionKey: string) => {
    if (!confirm('Are you sure you want to delete this page?')) return;

    try {
      const baseUrl = import.meta.env.DEV ? 'http://localhost:3001' : '';
      const response = await fetch(`${baseUrl}/api/pages/${partitionKey}/${rowKey}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete page');
      }

      // Refresh list
      fetchPages();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete page');
    }
  };

  const handleDeleteProject = async (project: string) => {
    const projectPages = pages.filter(p => p.partitionKey === project);
    const message = `Are you sure you want to delete the project "${project}"?\n\nThis will permanently delete ${projectPages.length} page(s) and all associated layouts.\n\nThis action cannot be undone.`;

    if (!confirm(message)) return;

    try {
      const baseUrl = import.meta.env.DEV ? 'http://localhost:3001' : '';
      const response = await fetch(`${baseUrl}/api/projects/${encodeURIComponent(project)}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete project');
      }

      // Reset selection and refresh list
      setSelectedProject('all');
      fetchPages();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete project');
    }
  };

  // Single page row component
  const PageRow = ({ page, isChild = false }: { page: PageEntity; isChild?: boolean }) => (
    <div
      className={`flex items-center justify-between py-3 px-4 hover:bg-gray-50 border-b border-gray-100 ${
        isChild ? 'pl-12 bg-gray-50/50' : ''
      }`}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Icon and Title */}
        <div className="flex items-center gap-2">
          {isChild ? (
            <span className="text-gray-400 text-sm">└─</span>
          ) : null}
          {page.pageType === 'PLP' ? (
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          ) : page.pageType === 'landingPage' ? (
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-900 truncate">{page.title}</span>
            <span
              className={`px-1.5 py-0.5 text-xs font-medium rounded ${
                page.pageType === 'PLP'
                  ? 'bg-blue-100 text-blue-700'
                  : page.pageType === 'landingPage'
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-green-100 text-green-700'
              }`}
            >
              {page.pageType === 'landingPage' ? 'Landing' : page.pageType}
            </span>
            <span
              className={`px-1.5 py-0.5 text-xs rounded ${
                page.isPublished
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-yellow-100 text-yellow-700'
              }`}
            >
              {page.isPublished ? 'Published' : 'Draft'}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <code className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
              /{page.slug}
            </code>
            <span className="text-xs text-gray-400">
              {page.partitionKey}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 ml-4">
        <Link
          to={`/preview/${page.slug}`}
          className="px-2 py-1 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
        >
          Preview
        </Link>
        <Link
          to={`/visual-builder?edit=${page.rowKey}&project=${page.partitionKey}`}
          className="px-2 py-1 text-xs text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded"
        >
          Edit
        </Link>
        <button
          onClick={() => handleDelete(page.rowKey, page.partitionKey)}
          className="px-2 py-1 text-xs text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
        >
          Delete
        </button>
      </div>
    </div>
  );

  // Hierarchical tree component
  const PageTree = () => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Page Hierarchy</h2>
      </div>

      {filteredPages.length === 0 ? (
        <div className="px-6 py-8 text-center text-gray-500">
          No pages found
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {/* PLPs with their child PDPs */}
          {plpPages.map((plp) => {
            const children = getChildPDPs(plp.rowKey);
            return (
              <div key={plp.rowKey}>
                <PageRow page={plp} />
                {children.map((pdp) => (
                  <PageRow key={pdp.rowKey} page={pdp} isChild />
                ))}
              </div>
            );
          })}

          {/* Landing Pages */}
          {landingPages.length > 0 && (
            <div className="bg-purple-50/30">
              <div className="px-4 py-2 text-xs font-medium text-purple-600 uppercase tracking-wider bg-purple-100/50">
                Landing Pages
              </div>
              {landingPages.map((page) => (
                <PageRow key={page.rowKey} page={page} />
              ))}
            </div>
          )}

          {/* Orphan PDPs (no parent) */}
          {orphanPDPs.length > 0 && (
            <div className="bg-gray-50/50">
              <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-100">
                Unassigned Product Pages
              </div>
              {orphanPDPs.map((pdp) => (
                <PageRow key={pdp.rowKey} page={pdp} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header with Navigation */}
      <AppHeader rightContent={
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
          {/* Delete Project Button - only show when a project is selected */}
          {selectedProject !== 'all' && (
            <button
              onClick={() => handleDeleteProject(selectedProject)}
              className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors font-medium text-sm flex items-center gap-1"
              title={`Delete project "${selectedProject}"`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete Project
            </button>
          )}
          <Link
            to="/visual-builder"
            className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-800 transition-colors font-medium text-sm"
          >
            + Create Page
          </Link>
        </div>
      } />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-gray-600">Loading pages...</span>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="text-2xl font-bold text-gray-900">{pages.length}</div>
                <div className="text-sm text-gray-500">Total Pages</div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="text-2xl font-bold text-blue-600">{plpPages.length}</div>
                <div className="text-sm text-gray-500">Category Pages (PLP)</div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="text-2xl font-bold text-green-600">{pdpPages.length}</div>
                <div className="text-sm text-gray-500">Product Pages (PDP)</div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="text-2xl font-bold text-purple-600">{landingPages.length}</div>
                <div className="text-sm text-gray-500">Landing Pages</div>
              </div>
            </div>

            {/* Hierarchical Page Tree */}
            <PageTree />
          </>
        )}
      </main>
    </div>
  );
}
