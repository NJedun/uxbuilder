import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import VisualComponentLibrary from '../visualBuilder/VisualComponentLibrary';
import VisualComponentRenderer from '../visualBuilder/VisualComponentRenderer';
import VisualStylePanel from '../visualBuilder/VisualStylePanel';
import GlobalStylePanel from '../visualBuilder/GlobalStylePanel';
import { useVisualBuilderStore, VisualComponent, GlobalStyles } from '../store/visualBuilderStore';
import { SectionStyles, defaultBodyStyles, defaultHeaderStyles, defaultFooterStyles } from '../types/layout';

type ViewMode = 'desktop' | 'tablet' | 'mobile';
type ActiveSection = 'header' | 'body' | 'footer';

export default function LayoutEditor() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Layout metadata
  const [layoutName, setLayoutName] = useState('');
  const [layoutDescription, setLayoutDescription] = useState('');
  const [projectName, setProjectName] = useState(() => {
    // Load last used project name from localStorage (shared with Visual Builder)
    return localStorage.getItem('uxBuilder_lastProjectName') || '';
  });
  const [isDefault, setIsDefault] = useState(false);

  // Section components (stored separately from the main store)
  const [headerComponents, setHeaderComponents] = useState<VisualComponent[]>([]);
  const [footerComponents, setFooterComponents] = useState<VisualComponent[]>([]);

  // Section styles
  const [headerStyles, setHeaderStyles] = useState<SectionStyles>({ ...defaultHeaderStyles });
  const [bodyStyles, setBodyStyles] = useState<SectionStyles>({ ...defaultBodyStyles });
  const [footerStyles, setFooterStyles] = useState<SectionStyles>({ ...defaultFooterStyles });

  // UI state
  const [activeSection, setActiveSection] = useState<ActiveSection>('header');
  const [viewMode, setViewMode] = useState<ViewMode>('desktop');
  const [showGlobalStyles, setShowGlobalStyles] = useState(false);
  const [showSectionStylesPanel, setShowSectionStylesPanel] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  // Editing state
  const [editingRowKey, setEditingRowKey] = useState<string | null>(null);

  // Use store for current editing
  const {
    components,
    globalStyles,
    selectedComponentId,
    selectComponent,
    setGlobalStyles,
    reorderComponents,
    importProject,
    exportProject,
  } = useVisualBuilderStore();

  // Sync store components to section state when switching sections
  const saveCurrentSection = useCallback(() => {
    const currentComponents = [...components];
    if (activeSection === 'header') {
      setHeaderComponents(currentComponents);
    } else if (activeSection === 'footer') {
      setFooterComponents(currentComponents);
    }
  }, [activeSection, components]);

  // Load section into store when switching
  const loadSection = useCallback((section: ActiveSection) => {
    selectComponent(null);
    if (section === 'header') {
      reorderComponents([...headerComponents]);
    } else if (section === 'footer') {
      reorderComponents([...footerComponents]);
    } else {
      reorderComponents([]);
    }
  }, [headerComponents, footerComponents, reorderComponents, selectComponent]);

  // Handle section change
  const handleSectionChange = (newSection: ActiveSection) => {
    if (newSection === activeSection) return;
    saveCurrentSection();
    setActiveSection(newSection);
    loadSection(newSection);
  };

  // Get current section styles based on active section
  const getCurrentSectionStyles = (): SectionStyles => {
    switch (activeSection) {
      case 'header': return headerStyles;
      case 'body': return bodyStyles;
      case 'footer': return footerStyles;
    }
  };

  // Update current section styles
  const updateCurrentSectionStyles = (styles: SectionStyles) => {
    switch (activeSection) {
      case 'header': setHeaderStyles(styles); break;
      case 'body': setBodyStyles(styles); break;
      case 'footer': setFooterStyles(styles); break;
    }
  };

  // Persist project name to localStorage whenever it changes (shared with Visual Builder)
  useEffect(() => {
    if (projectName) {
      localStorage.setItem('uxBuilder_lastProjectName', projectName);
    }
  }, [projectName]);

  // Cleanup: Clear store components when leaving Layout Editor to not pollute Visual Builder
  useEffect(() => {
    return () => {
      reorderComponents([]);
      selectComponent(null);
    };
  }, []);

  // Load layout if editing or duplicating
  useEffect(() => {
    const editRowKey = searchParams.get('edit');
    const duplicateRowKey = searchParams.get('duplicate');
    const editProject = searchParams.get('project');

    if (editRowKey && editProject) {
      loadLayout(editProject, editRowKey, false);
    } else if (duplicateRowKey && editProject) {
      loadLayout(editProject, duplicateRowKey, true);
    } else {
      // New layout - load header section by default
      reorderComponents([]);
    }
  }, [searchParams]);

  const loadLayout = async (project: string, rowKey: string, isDuplicate: boolean = false) => {
    try {
      setLoading(true);
      const baseUrl = import.meta.env.DEV ? 'http://localhost:3001' : '';
      const response = await fetch(`${baseUrl}/api/pages/${project}/${rowKey}`);

      if (response.ok) {
        const data = await response.json();
        const layout = data.data;

        // For duplicate mode, don't set editingRowKey so it creates a new layout
        if (!isDuplicate) {
          setEditingRowKey(rowKey);
        }
        setProjectName(layout.partitionKey);
        // For duplicate, append " (Copy)" to name
        const originalName = layout.name || layout.title;
        setLayoutName(isDuplicate ? `${originalName} (Copy)` : originalName);
        setLayoutDescription(layout.summary || '');
        // Don't copy isDefault when duplicating
        setIsDefault(isDuplicate ? false : (layout.isDefault || false));

        // Parse stored JSON (handle empty strings)
        try {
          const parsedHeader = JSON.parse(layout.headerComponents || '[]');
          const parsedFooter = JSON.parse(layout.footerComponents || '[]');
          const parsedHeaderStyles = layout.headerStyles && layout.headerStyles !== ''
            ? JSON.parse(layout.headerStyles)
            : {};
          const parsedBodyStyles = layout.bodyStyles && layout.bodyStyles !== ''
            ? JSON.parse(layout.bodyStyles)
            : {};
          const parsedFooterStyles = layout.footerStyles && layout.footerStyles !== ''
            ? JSON.parse(layout.footerStyles)
            : {};
          const parsedGlobalStyles = JSON.parse(layout.globalStyles || '{}');

          setHeaderComponents(parsedHeader);
          setFooterComponents(parsedFooter);
          setHeaderStyles({ ...defaultHeaderStyles, ...parsedHeaderStyles });
          setBodyStyles({ ...defaultBodyStyles, ...parsedBodyStyles });
          setFooterStyles({ ...defaultFooterStyles, ...parsedFooterStyles });
          setGlobalStyles(parsedGlobalStyles);

          // Load header into store by default
          reorderComponents(parsedHeader);
        } catch (err) {
          console.error('Failed to parse layout data:', err);
        }
      }
    } catch (err) {
      console.error('Failed to load layout:', err);
    } finally {
      setLoading(false);
    }
  };

  // Save layout
  const handleSave = async () => {
    if (!projectName || !layoutName) {
      alert('Please enter a project name and layout name');
      return;
    }

    // Save current section first
    saveCurrentSection();

    // Get the latest components for current section
    let finalHeaderComponents = headerComponents;
    let finalFooterComponents = footerComponents;

    if (activeSection === 'header') {
      finalHeaderComponents = components;
    } else if (activeSection === 'footer') {
      finalFooterComponents = components;
    }

    setSaving(true);
    try {
      const baseUrl = import.meta.env.DEV ? 'http://localhost:3001' : '';
      const slug = layoutName.toLowerCase().replace(/[^a-z0-9]+/g, '-');

      const layoutData = {
        partitionKey: projectName,
        pageType: 'layout',
        name: layoutName,
        title: layoutName,
        slug: `layout-${slug}`,
        summary: layoutDescription,
        isDefault: isDefault,
        headerComponents: JSON.stringify(finalHeaderComponents),
        footerComponents: JSON.stringify(finalFooterComponents),
        headerStyles: JSON.stringify(headerStyles),
        bodyStyles: JSON.stringify(bodyStyles),
        footerStyles: JSON.stringify(footerStyles),
        globalStyles: JSON.stringify(globalStyles),
        isPublished: true,
      };

      let response;
      if (editingRowKey) {
        response = await fetch(`${baseUrl}/api/pages/${projectName}/${editingRowKey}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(layoutData),
        });
      } else {
        response = await fetch(`${baseUrl}/api/pages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(layoutData),
        });
      }

      if (response.ok) {
        alert('Layout saved successfully!');
        navigate('/layouts');
      } else {
        const err = await response.json();
        throw new Error(err.error || 'Failed to save layout');
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save layout');
    } finally {
      setSaving(false);
    }
  };

  // Get canvas width based on view mode
  const getCanvasWidth = () => {
    switch (viewMode) {
      case 'mobile': return '375px';
      case 'tablet': return '768px';
      case 'desktop': return '100%';
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
        <span className="ml-3 text-gray-600">Loading layout...</span>
      </div>
    );
  }

  // Get display components for each section
  const displayHeaderComponents = activeSection === 'header' ? components : headerComponents;
  const displayFooterComponents = activeSection === 'footer' ? components : footerComponents;

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Toolbar */}
      <div className="min-h-16 bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            to="/visual-builder"
            className="text-xl font-bold text-gray-800 hover:text-gray-600 transition-colors"
          >
            Visual AI Builder
          </Link>
          <span className="text-gray-300">|</span>
          <h1 className="text-lg font-semibold text-purple-600">Layout Editor</h1>
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
            placeholder="Project name"
            disabled={!!editingRowKey}
          />
          <input
            type="text"
            value={layoutName}
            onChange={(e) => setLayoutName(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
            placeholder="Layout name"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('desktop')}
              className={`p-2 rounded-md transition-colors ${viewMode === 'desktop' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
              title="Desktop view"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('tablet')}
              className={`p-2 rounded-md transition-colors ${viewMode === 'tablet' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
              title="Tablet view"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('mobile')}
              className={`p-2 rounded-md transition-colors ${viewMode === 'mobile' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
              title="Mobile view"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </button>
          </div>

          <div className="h-6 w-px bg-gray-300" />

          <button
            onClick={() => setShowGlobalStyles(true)}
            className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors font-medium text-sm"
          >
            Global Styles
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors font-medium text-sm disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Layout'}
          </button>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="bg-white border-b border-gray-200 px-4">
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleSectionChange('header')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeSection === 'header'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Header ({displayHeaderComponents.length})
          </button>
          <button
            onClick={() => handleSectionChange('body')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeSection === 'body'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Body (Content Zone)
          </button>
          <button
            onClick={() => handleSectionChange('footer')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeSection === 'footer'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Footer ({displayFooterComponents.length})
          </button>

          <div className="flex-1" />

          <button
            onClick={() => setShowSectionStylesPanel(true)}
            className="px-3 py-1.5 text-sm text-purple-600 hover:bg-purple-50 rounded-md transition-colors mr-2"
          >
            Section Styles
          </button>

          <label className="flex items-center gap-2 text-sm text-gray-600 mr-4">
            <input
              type="checkbox"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            Set as default layout
          </label>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Component Library - only show for header/footer */}
        {activeSection !== 'body' && (
          <VisualComponentLibrary />
        )}

        {/* Canvas Area */}
        <main className="flex-1 p-6 overflow-auto bg-gray-50">
          <div
            className="mx-auto bg-white shadow-lg rounded-lg overflow-hidden"
            style={{ width: getCanvasWidth(), maxWidth: '100%' }}
          >
            {/* Header Section */}
            <div
              className={`relative transition-all cursor-pointer ${
                activeSection === 'header' ? 'ring-2 ring-purple-500' : 'opacity-60'
              }`}
              onClick={() => handleSectionChange('header')}
              style={{
                maxWidth: headerStyles.maxWidth || '100%',
                margin: headerStyles.margin || '0',
                backgroundColor: headerStyles.backgroundColor || 'transparent',
                borderBottomWidth: headerStyles.borderBottomWidth || undefined,
                borderBottomStyle: (headerStyles.borderBottomStyle as React.CSSProperties['borderBottomStyle']) || undefined,
                borderBottomColor: headerStyles.borderBottomColor || undefined,
              }}
            >
              {activeSection !== 'header' && (
                <div className="absolute inset-0 bg-gray-900/10 z-10 flex items-center justify-center">
                  <span className="bg-gray-800 text-white px-2 py-1 rounded text-xs">Header (click to edit)</span>
                </div>
              )}
              {/* Content wrapper for inner alignment */}
              <div
                style={{
                  maxWidth: headerStyles.contentMaxWidth || '100%',
                  margin: headerStyles.contentMargin || '0',
                  padding: headerStyles.padding || '0',
                  minHeight: headerStyles.minHeight || undefined,
                }}
              >
                {displayHeaderComponents.length === 0 ? (
                  <div className="bg-gray-100 p-8 text-center text-gray-400 border-b">
                    <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <div>Click here and add components for the header</div>
                  </div>
                ) : (
                  displayHeaderComponents.map((component) => (
                    <VisualComponentRenderer
                      key={component.id}
                      component={component}
                      isSelected={activeSection === 'header' && selectedComponentId === component.id}
                      onSelect={() => activeSection === 'header' && selectComponent(component.id)}
                      viewMode={viewMode}
                      readOnly={activeSection !== 'header'}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Body Section (Content Zone) */}
            <div
              className={`relative transition-all cursor-pointer ${
                activeSection === 'body' ? 'ring-2 ring-purple-500' : ''
              }`}
              onClick={() => handleSectionChange('body')}
              style={{
                maxWidth: bodyStyles.maxWidth || '100%',
                margin: bodyStyles.margin || '0',
                backgroundColor: bodyStyles.backgroundColor || 'transparent',
                borderBottomWidth: bodyStyles.borderBottomWidth || undefined,
                borderBottomStyle: (bodyStyles.borderBottomStyle as React.CSSProperties['borderBottomStyle']) || undefined,
                borderBottomColor: bodyStyles.borderBottomColor || undefined,
              }}
            >
              <div
                style={{
                  maxWidth: bodyStyles.contentMaxWidth || '100%',
                  margin: bodyStyles.contentMargin || '0',
                  padding: bodyStyles.padding || '0',
                  minHeight: bodyStyles.minHeight || '400px',
                }}
                className="border-2 border-dashed border-gray-300 bg-white/50 flex items-center justify-center"
              >
                <div className="text-center text-gray-400">
                  <svg className="w-10 h-10 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <div className="font-medium">Content Zone</div>
                  <div className="text-sm">Page content will appear here</div>
                </div>
              </div>
            </div>

            {/* Footer Section */}
            <div
              className={`relative transition-all cursor-pointer ${
                activeSection === 'footer' ? 'ring-2 ring-purple-500' : 'opacity-60'
              }`}
              onClick={() => handleSectionChange('footer')}
              style={{
                maxWidth: footerStyles.maxWidth || '100%',
                margin: footerStyles.margin || '0',
                backgroundColor: footerStyles.backgroundColor || 'transparent',
                borderBottomWidth: footerStyles.borderBottomWidth || undefined,
                borderBottomStyle: (footerStyles.borderBottomStyle as React.CSSProperties['borderBottomStyle']) || undefined,
                borderBottomColor: footerStyles.borderBottomColor || undefined,
              }}
            >
              {activeSection !== 'footer' && (
                <div className="absolute inset-0 bg-gray-900/10 z-10 flex items-center justify-center">
                  <span className="bg-gray-800 text-white px-2 py-1 rounded text-xs">Footer (click to edit)</span>
                </div>
              )}
              {/* Content wrapper for inner alignment */}
              <div
                style={{
                  maxWidth: footerStyles.contentMaxWidth || '100%',
                  margin: footerStyles.contentMargin || '0',
                  padding: footerStyles.padding || '0',
                  minHeight: footerStyles.minHeight || undefined,
                }}
              >
                {displayFooterComponents.length === 0 ? (
                  <div className="bg-gray-100 p-8 text-center text-gray-400 border-t">
                    <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <div>Click here and add components for the footer</div>
                  </div>
                ) : (
                  displayFooterComponents.map((component) => (
                    <VisualComponentRenderer
                      key={component.id}
                      component={component}
                      isSelected={activeSection === 'footer' && selectedComponentId === component.id}
                      onSelect={() => activeSection === 'footer' && selectComponent(component.id)}
                      viewMode={viewMode}
                      readOnly={activeSection !== 'footer'}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        </main>

        {/* Style Panel - for component styles */}
        {selectedComponentId && (
          <VisualStylePanel />
        )}

        {/* Section Styles Panel */}
        {showSectionStylesPanel && (
          <div className="w-80 border-l border-gray-200 bg-white overflow-y-auto p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">
                {activeSection === 'header' ? 'Header' : activeSection === 'body' ? 'Body' : 'Footer'} Section Styles
              </h3>
              <button
                onClick={() => setShowSectionStylesPanel(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Section Container Styles */}
              <div className="pb-3 border-b border-gray-200">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Section Container</h4>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Section Max Width</label>
                    <input
                      type="text"
                      value={getCurrentSectionStyles().maxWidth}
                      onChange={(e) => updateCurrentSectionStyles({ ...getCurrentSectionStyles(), maxWidth: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      placeholder="100% (full width)"
                    />
                    <p className="mt-1 text-xs text-gray-500">Outer section width</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Section Margin</label>
                    <input
                      type="text"
                      value={getCurrentSectionStyles().margin}
                      onChange={(e) => updateCurrentSectionStyles({ ...getCurrentSectionStyles(), margin: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Background Color</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={getCurrentSectionStyles().backgroundColor || '#ffffff'}
                        onChange={(e) => updateCurrentSectionStyles({ ...getCurrentSectionStyles(), backgroundColor: e.target.value })}
                        className="w-10 h-10 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={getCurrentSectionStyles().backgroundColor}
                        onChange={(e) => updateCurrentSectionStyles({ ...getCurrentSectionStyles(), backgroundColor: e.target.value })}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                        placeholder="transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Content Wrapper Styles */}
              <div className="pt-1">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Content Area</h4>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Content Max Width</label>
                    <input
                      type="text"
                      value={getCurrentSectionStyles().contentMaxWidth}
                      onChange={(e) => updateCurrentSectionStyles({ ...getCurrentSectionStyles(), contentMaxWidth: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      placeholder="e.g., 1200px, 800px"
                    />
                    <p className="mt-1 text-xs text-gray-500">Inner content width (e.g., 800px)</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Content Margin</label>
                    <input
                      type="text"
                      value={getCurrentSectionStyles().contentMargin}
                      onChange={(e) => updateCurrentSectionStyles({ ...getCurrentSectionStyles(), contentMargin: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      placeholder="0 auto (centered)"
                    />
                    <p className="mt-1 text-xs text-gray-500">Use "0 auto" to center</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Padding</label>
                    <input
                      type="text"
                      value={getCurrentSectionStyles().padding}
                      onChange={(e) => updateCurrentSectionStyles({ ...getCurrentSectionStyles(), padding: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      placeholder="e.g., 20px, 40px 20px"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Min Height</label>
                    <input
                      type="text"
                      value={getCurrentSectionStyles().minHeight}
                      onChange={(e) => updateCurrentSectionStyles({ ...getCurrentSectionStyles(), minHeight: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      placeholder="e.g., 400px"
                    />
                  </div>

                  {/* Border Bottom Section */}
                  <div className="pt-4 mt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Border Bottom</h4>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Border Width</label>
                        <input
                          type="text"
                          value={getCurrentSectionStyles().borderBottomWidth || ''}
                          onChange={(e) => updateCurrentSectionStyles({ ...getCurrentSectionStyles(), borderBottomWidth: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          placeholder="e.g., 1px"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Border Style</label>
                        <select
                          value={getCurrentSectionStyles().borderBottomStyle || ''}
                          onChange={(e) => updateCurrentSectionStyles({ ...getCurrentSectionStyles(), borderBottomStyle: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        >
                          <option value="">None</option>
                          <option value="solid">Solid</option>
                          <option value="dashed">Dashed</option>
                          <option value="dotted">Dotted</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Border Color</label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={getCurrentSectionStyles().borderBottomColor || '#e5e7eb'}
                            onChange={(e) => updateCurrentSectionStyles({ ...getCurrentSectionStyles(), borderBottomColor: e.target.value })}
                            className="w-10 h-10 border border-gray-300 rounded cursor-pointer"
                          />
                          <input
                            type="text"
                            value={getCurrentSectionStyles().borderBottomColor || ''}
                            onChange={(e) => updateCurrentSectionStyles({ ...getCurrentSectionStyles(), borderBottomColor: e.target.value })}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                            placeholder="#e5e7eb"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Global Styles Modal */}
      {showGlobalStyles && (
        <GlobalStylePanel onClose={() => setShowGlobalStyles(false)} />
      )}
    </div>
  );
}
