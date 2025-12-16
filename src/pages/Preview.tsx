import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { VisualComponent, GlobalStyles } from '../store/visualBuilderStore';
import VisualComponentRenderer from '../visualBuilder/VisualComponentRenderer';
import { ProductGrid } from '../visualBuilder/components';
import { SectionStyles, BodySection, SectionComponentsMap, defaultBodyStyles, defaultHeaderStyles, defaultFooterStyles } from '../types/layout';

interface PageData {
  rowKey: string;
  partitionKey: string;
  pageType: 'PLP' | 'PDP' | 'landingPage';
  slug: string;
  parentRowKey: string | null;
  layoutRowKey: string | null;
  title: string;
  summary: string;
  components: string; // Deprecated, use sectionComponents
  sectionComponents?: string; // New: JSON string of SectionComponentsMap
  globalStyles: string;
  isPublished: boolean;
}

interface LayoutData {
  rowKey: string;
  headerComponents: string;
  footerComponents: string;
  headerStyles: string;
  bodySections?: string; // New: JSON string of BodySection[]
  bodyStyles: string; // Deprecated
  footerStyles: string;
  globalStyles: string;
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
  const [layout, setLayout] = useState<LayoutData | null>(null);
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
      setLayout(null);

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

      // If page has a layout, fetch it
      if (data.data.layoutRowKey) {
        fetchLayout(data.data.partitionKey, data.data.layoutRowKey);
      }

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

  const fetchLayout = async (project: string, layoutRowKey: string) => {
    try {
      const baseUrl = import.meta.env.DEV ? 'http://localhost:3001' : '';
      const response = await fetch(`${baseUrl}/api/pages/${project}/${layoutRowKey}`);

      if (response.ok) {
        const data = await response.json();
        setLayout(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch layout:', err);
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
  let sectionComponents: SectionComponentsMap = {};
  let globalStyles: GlobalStyles = {} as GlobalStyles;

  try {
    // Parse deprecated components for backward compatibility
    components = JSON.parse(page.components || '[]');
    // Parse new sectionComponents
    if (page.sectionComponents) {
      sectionComponents = JSON.parse(page.sectionComponents);
    }
    globalStyles = JSON.parse(page.globalStyles || '{}');
  } catch (err) {
    console.error('Failed to parse page data:', err);
  }

  // Parse layout data if available
  let headerComponents: VisualComponent[] = [];
  let footerComponents: VisualComponent[] = [];
  let bodySections: BodySection[] = [];
  let headerStyles: SectionStyles = { ...defaultHeaderStyles };
  let footerStyles: SectionStyles = { ...defaultFooterStyles };
  let layoutGlobalStyles: GlobalStyles = {} as GlobalStyles;

  if (layout) {
    try {
      headerComponents = JSON.parse(layout.headerComponents || '[]');
      footerComponents = JSON.parse(layout.footerComponents || '[]');

      // Parse body sections (or create default from bodyStyles for backward compatibility)
      if (layout.bodySections && layout.bodySections !== '[]') {
        bodySections = JSON.parse(layout.bodySections);
      }
      if (bodySections.length === 0) {
        // Backward compatibility: create single section from bodyStyles
        const parsedBodyStyles = layout.bodyStyles && layout.bodyStyles !== '' ? JSON.parse(layout.bodyStyles) : {};
        bodySections = [{
          id: 'body-section-1',
          name: 'Body Section 1',
          styles: { ...defaultBodyStyles, ...parsedBodyStyles },
        }];
      }

      // Handle empty strings for styles
      const parsedHeaderStyles = layout.headerStyles && layout.headerStyles !== '' ? JSON.parse(layout.headerStyles) : {};
      const parsedFooterStyles = layout.footerStyles && layout.footerStyles !== '' ? JSON.parse(layout.footerStyles) : {};
      headerStyles = { ...defaultHeaderStyles, ...parsedHeaderStyles };
      footerStyles = { ...defaultFooterStyles, ...parsedFooterStyles };
      layoutGlobalStyles = JSON.parse(layout.globalStyles || '{}');
      // Merge layout global styles with page global styles (page takes precedence)
      globalStyles = { ...layoutGlobalStyles, ...globalStyles };
    } catch (err) {
      console.error('Failed to parse layout data:', err);
    }
  } else {
    // No layout - create a default body section
    bodySections = [{
      id: 'body-section-1',
      name: 'Body Section 1',
      styles: { ...defaultBodyStyles },
    }];
  }

  // Get components for a specific section
  const getSectionComponents = (sectionId: string): VisualComponent[] => {
    // First check sectionComponents
    if (sectionComponents[sectionId] && sectionComponents[sectionId].length > 0) {
      return sectionComponents[sectionId];
    }
    // Backward compatibility: if only one section and we have deprecated components, use them
    if (bodySections.length === 1 && sectionId === bodySections[0].id && components.length > 0) {
      return components;
    }
    return [];
  };

  // Check if any component is a ProductGrid placeholder (across all sections)
  const allComponents = Object.values(sectionComponents).flat();
  const hasProductGrid = allComponents.some((c) => c.type === 'ProductGrid') ||
                         components.some((c) => c.type === 'ProductGrid');

  // Helper function to get style from component or global styles
  const getStyle = (componentStyle: string | undefined, globalKey: keyof GlobalStyles): string | undefined => {
    if (componentStyle) return componentStyle;
    return globalStyles[globalKey] as string | undefined;
  };

  // Get page type label
  const getPageTypeLabel = () => {
    switch (page.pageType) {
      case 'PLP': return 'Category Page';
      case 'PDP': return 'Product Page';
      case 'landingPage': return 'Landing Page';
      default: return page.pageType;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Preview Banner */}
      <div className="bg-gray-900 text-white px-4 py-2 flex items-center justify-between text-sm">
        <div className="flex items-center gap-4">
          <Link
            to="/visual-builder"
            className="font-bold text-white hover:text-gray-300 transition-colors"
          >
            Visual AI Builder
          </Link>
          <span className="text-gray-500">|</span>
          <span className="font-medium text-gray-300">Preview</span>
          <span className="text-gray-500">|</span>
          <span className="text-gray-400">{getPageTypeLabel()}</span>
          <code className="text-gray-300 bg-gray-800 px-2 py-0.5 rounded">
            /{page.slug}
          </code>
          {layout && (
            <>
              <span className="text-gray-500">|</span>
              <span className="text-gray-400">Layout applied</span>
            </>
          )}
          {/* Show parent PLP link for PDP pages */}
          {page.pageType === 'PDP' && parentPage && (
            <>
              <span className="text-gray-500">|</span>
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
            className="px-3 py-1 bg-gray-600 rounded hover:bg-gray-700"
          >
            Edit Page
          </Link>
        </div>
      </div>

      {/* Layout Header */}
      {headerComponents.length > 0 && (
        <header
          style={{
            maxWidth: headerStyles.maxWidth || '100%',
            margin: headerStyles.margin || '0',
            backgroundColor: headerStyles.backgroundColor || 'transparent',
            borderBottomWidth: headerStyles.borderBottomWidth || undefined,
            borderBottomStyle: (headerStyles.borderBottomStyle as React.CSSProperties['borderBottomStyle']) || undefined,
            borderBottomColor: headerStyles.borderBottomColor || undefined,
          }}
        >
          <div
            style={{
              maxWidth: headerStyles.contentMaxWidth || '100%',
              margin: headerStyles.contentMargin || '0',
              padding: headerStyles.padding || '0',
              minHeight: headerStyles.minHeight || undefined,
            }}
          >
            {headerComponents.map((component) => (
              <VisualComponentRenderer
                key={component.id}
                component={component}
                isSelected={false}
                onSelect={() => {}}
                viewMode="desktop"
                readOnly={true}
              />
            ))}
          </div>
        </header>
      )}

      {/* Page Content (Body Sections) */}
      {bodySections.map((section) => {
        const sectionComps = getSectionComponents(section.id);
        const styles = section.styles || defaultBodyStyles;

        // In preview, hide empty sections (except if it's the only section)
        if (sectionComps.length === 0 && bodySections.length > 1) {
          return null;
        }

        return (
          <main
            key={section.id}
            style={{
              maxWidth: styles.maxWidth || '100%',
              margin: styles.margin || '0',
              backgroundColor: styles.backgroundColor || 'transparent',
              borderBottom: styles.borderBottomWidth
                ? `${styles.borderBottomWidth} ${styles.borderBottomStyle || 'solid'} ${styles.borderBottomColor || '#e5e7eb'}`
                : undefined,
            }}
          >
            <div
              style={{
                maxWidth: styles.contentMaxWidth || '100%',
                margin: styles.contentMargin || '0',
                padding: styles.padding || '0',
                minHeight: styles.minHeight || undefined,
              }}
            >
              {sectionComps.map((component) => {
                // Special handling for ProductGrid - inject child pages
                if (component.type === 'ProductGrid' && page.pageType === 'PLP') {
                  return (
                    <ProductGrid
                      key={component.id}
                      props={{ ...component.props, parentRowKey: page.rowKey }}
                      styles={component.customStyles || {}}
                      globalStyles={globalStyles}
                      getStyle={getStyle}
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

              {/* If PLP but no ProductGrid component, show child pages in first section */}
              {section.id === bodySections[0].id && page.pageType === 'PLP' && !hasProductGrid && childPages.length > 0 && (
                <ProductGrid
                  props={{ parentRowKey: page.rowKey }}
                  styles={{}}
                  globalStyles={globalStyles}
                  getStyle={getStyle}
                  childPages={childPages}
                />
              )}
            </div>
          </main>
        );
      })}

      {/* Layout Footer */}
      {footerComponents.length > 0 && (
        <footer
          style={{
            maxWidth: footerStyles.maxWidth || '100%',
            margin: footerStyles.margin || '0',
            backgroundColor: footerStyles.backgroundColor || 'transparent',
            borderBottomWidth: footerStyles.borderBottomWidth || undefined,
            borderBottomStyle: (footerStyles.borderBottomStyle as React.CSSProperties['borderBottomStyle']) || undefined,
            borderBottomColor: footerStyles.borderBottomColor || undefined,
          }}
        >
          <div
            style={{
              maxWidth: footerStyles.contentMaxWidth || '100%',
              margin: footerStyles.contentMargin || '0',
              padding: footerStyles.padding || '0',
              minHeight: footerStyles.minHeight || undefined,
            }}
          >
            {footerComponents.map((component) => (
              <VisualComponentRenderer
                key={component.id}
                component={component}
                isSelected={false}
                onSelect={() => {}}
                viewMode="desktop"
                readOnly={true}
              />
            ))}
          </div>
        </footer>
      )}
    </div>
  );
}
