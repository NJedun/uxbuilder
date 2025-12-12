import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { VisualComponent, GlobalStyles } from '../store/visualBuilderStore';
import VisualComponentRenderer from '../visualBuilder/VisualComponentRenderer';
import { ProductGrid } from '../visualBuilder/components';

interface PageData {
  rowKey: string;
  partitionKey: string;
  pageType: 'PLP' | 'PDP';
  slug: string;
  parentRowKey: string | null;
  title: string;
  summary: string;
  components: string;
  globalStyles: string;
  isPublished: boolean;
}

interface ChildPage {
  rowKey: string;
  title: string;
  summary: string;
  slug: string;
}

interface ParentPage {
  rowKey: string;
  title: string;
  slug: string;
}

export default function Preview() {
  const { '*': slug } = useParams(); // Catch-all for nested slugs like wheat/product1
  const [page, setPage] = useState<PageData | null>(null);
  const [childPages, setChildPages] = useState<ChildPage[]>([]);
  const [parentPage, setParentPage] = useState<ParentPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      fetchPage(slug);
    }
  }, [slug]);

  const fetchPage = async (pageSlug: string) => {
    try {
      setLoading(true);
      setError(null);

      const baseUrl = import.meta.env.DEV ? 'http://localhost:3001' : '';
      const response = await fetch(`${baseUrl}/api/pages/by-slug?slug=${encodeURIComponent(pageSlug)}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Page not found');
        }
        throw new Error('Failed to load page');
      }

      const data = await response.json();
      setPage(data.data);

      // If this is a PLP, fetch child PDPs
      if (data.data.pageType === 'PLP') {
        fetchChildPages(data.data.rowKey);
        setParentPage(null);
      }

      // If this is a PDP with a parent, fetch parent PLP info
      if (data.data.pageType === 'PDP' && data.data.parentRowKey) {
        fetchParentPage(data.data.parentRowKey, data.data.partitionKey);
      } else {
        setParentPage(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load page');
    } finally {
      setLoading(false);
    }
  };

  const fetchChildPages = async (parentRowKey: string) => {
    try {
      const baseUrl = import.meta.env.DEV ? 'http://localhost:3001' : '';
      const response = await fetch(`${baseUrl}/api/pages?parentRowKey=${parentRowKey}`);

      if (response.ok) {
        const data = await response.json();
        setChildPages(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch child pages:', err);
    }
  };

  const fetchParentPage = async (parentRowKey: string, project: string) => {
    try {
      const baseUrl = import.meta.env.DEV ? 'http://localhost:3001' : '';
      const response = await fetch(`${baseUrl}/api/pages/${project}/${parentRowKey}`);

      if (response.ok) {
        const data = await response.json();
        setParentPage({
          rowKey: data.data.rowKey,
          title: data.data.title,
          slug: data.data.slug,
        });
      }
    } catch (err) {
      console.error('Failed to fetch parent page:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          <span className="text-gray-600">Loading page...</span>
        </div>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h1>
          <p className="text-gray-600 mb-4">{error || 'The requested page does not exist.'}</p>
          <Link
            to="/pages"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            ← Back to Page Manager
          </Link>
        </div>
      </div>
    );
  }

  // Parse components and global styles
  let components: VisualComponent[] = [];
  let globalStyles: GlobalStyles = {} as GlobalStyles;

  try {
    components = JSON.parse(page.components || '[]');
    globalStyles = JSON.parse(page.globalStyles || '{}');
  } catch (err) {
    console.error('Failed to parse page data:', err);
  }

  // Check if any component is a ProductGrid placeholder
  const hasProductGrid = components.some((c) => c.type === 'ProductGrid');

  return (
    <div className="min-h-screen bg-white">
      {/* Preview Banner */}
      <div className="bg-gray-900 text-white px-4 py-2 flex items-center justify-between text-sm">
        <div className="flex items-center gap-4">
          <span className="font-medium">Preview Mode</span>
          <span className="text-gray-400">|</span>
          <span className="text-gray-300">
            {page.pageType === 'PLP' ? 'Category Page' : 'Product Page'}
          </span>
          <span className="text-gray-400">|</span>
          <code className="text-gray-300 bg-gray-800 px-2 py-0.5 rounded">
            /{page.slug}
          </code>
          {/* Show parent PLP link for PDP pages */}
          {page.pageType === 'PDP' && parentPage && (
            <>
              <span className="text-gray-400">|</span>
              <Link
                to={`/preview/${parentPage.slug}`}
                className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                <span>←</span>
                <span>{parentPage.title}</span>
              </Link>
            </>
          )}
        </div>
        <div className="flex items-center gap-4">
          <Link
            to="/pages"
            className="text-gray-300 hover:text-white"
          >
            Page Manager
          </Link>
          <Link
            to={`/visual-builder?edit=${page.rowKey}&project=${page.partitionKey}`}
            className="px-3 py-1 bg-blue-600 rounded hover:bg-blue-700"
          >
            Edit Page
          </Link>
        </div>
      </div>

      {/* Page Content */}
      <div>
        {components.map((component) => {
          // Special handling for ProductGrid - inject child pages
          if (component.type === 'ProductGrid' && page.pageType === 'PLP') {
            return (
              <ProductGrid
                key={component.id}
                props={{ ...component.props, parentRowKey: page.rowKey }}
                styles={component.customStyles || {}}
                globalStyles={globalStyles}
                childPages={childPages}
              />
            );
          }

          return (
            <VisualComponentRenderer
              key={component.id}
              component={component}
              isSelected={false}
              onSelect={() => {}}
              viewMode="desktop"
              readOnly={true}
            />
          );
        })}

        {/* If PLP but no ProductGrid component, show child pages at bottom */}
        {page.pageType === 'PLP' && !hasProductGrid && childPages.length > 0 && (
          <ProductGrid
            props={{ parentRowKey: page.rowKey }}
            styles={{}}
            globalStyles={globalStyles}
            childPages={childPages}
          />
        )}
      </div>
    </div>
  );
}
