import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import VisualComponentLibrary from '../visualBuilder/VisualComponentLibrary';
import VisualComponentRenderer from '../visualBuilder/VisualComponentRenderer';
import VisualStylePanel from '../visualBuilder/VisualStylePanel';
import GlobalStylePanel from '../visualBuilder/GlobalStylePanel';
import AppHeader from '../components/AppHeader';
import ProjectSelector from '../components/ProjectSelector';
import { useToast } from '../components/Toast';
import { useVisualBuilderStore, VisualComponent, GlobalStyles } from '../store/visualBuilderStore';
import { SectionStyles, BodySection, defaultBodyStyles, defaultHeaderStyles, defaultFooterStyles, createDefaultBodySection, getDefaultBodySections } from '../types/layout';

type ViewMode = 'desktop' | 'tablet' | 'mobile';
type ActiveSection = 'header' | 'body' | 'footer';

export default function LayoutEditor() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const toast = useToast();

  // Layout metadata
  const [layoutName, setLayoutName] = useState('');
  const [layoutDescription, setLayoutDescription] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  // Section components (stored separately from the main store)
  const [headerComponents, setHeaderComponents] = useState<VisualComponent[]>([]);
  const [footerComponents, setFooterComponents] = useState<VisualComponent[]>([]);

  // Body sections (multiple body zones)
  const [bodySections, setBodySections] = useState<BodySection[]>(getDefaultBodySections());
  const [activeBodySectionId, setActiveBodySectionId] = useState<string | null>('body-section-1');

  // Section styles
  const [headerStyles, setHeaderStyles] = useState<SectionStyles>({ ...defaultHeaderStyles });
  const [bodyStyles, setBodyStyles] = useState<SectionStyles>({ ...defaultBodyStyles }); // Deprecated, kept for backward compatibility
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
    projectName,
    setProjectName,
    components,
    globalStyles,
    selectedComponentId,
    selectComponent,
    setGlobalStyles,
    reorderComponents,
    importProject,
    exportProject,
    setActiveSectionId,
  } = useVisualBuilderStore();

  // Clear activeSectionId on mount so Layout Editor uses deprecated components array
  useEffect(() => {
    setActiveSectionId(null);
  }, [setActiveSectionId]);

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
      case 'body': {
        // Get styles for the active body section
        const activeSection = bodySections.find(s => s.id === activeBodySectionId);
        return activeSection?.styles || bodyStyles;
      }
      case 'footer': return footerStyles;
    }
  };

  // Update current section styles
  const updateCurrentSectionStyles = (styles: SectionStyles) => {
    switch (activeSection) {
      case 'header': setHeaderStyles(styles); break;
      case 'body': {
        // Update styles for the active body section
        if (activeBodySectionId) {
          setBodySections(sections =>
            sections.map(s =>
              s.id === activeBodySectionId ? { ...s, styles } : s
            )
          );
        } else {
          setBodyStyles(styles);
        }
        break;
      }
      case 'footer': setFooterStyles(styles); break;
    }
  };

  // Add a new body section
  const addBodySection = () => {
    const nextIndex = bodySections.length + 1;
    const newSection = createDefaultBodySection(nextIndex);
    setBodySections([...bodySections, newSection]);
    setActiveBodySectionId(newSection.id);
  };

  // Delete a body section
  const deleteBodySection = (sectionId: string) => {
    if (bodySections.length <= 1) {
      toast.showWarning('Cannot delete the last body section');
      return;
    }
    const newSections = bodySections.filter(s => s.id !== sectionId);
    setBodySections(newSections);
    // If we deleted the active section, select the first one
    if (activeBodySectionId === sectionId) {
      setActiveBodySectionId(newSections[0]?.id || null);
    }
  };

  // Update body section name
  const updateBodySectionName = (sectionId: string, name: string) => {
    setBodySections(sections =>
      sections.map(s =>
        s.id === sectionId ? { ...s, name } : s
      )
    );
  };

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

          // Parse body sections (new multi-section support)
          let parsedBodySections: BodySection[] = [];
          if (layout.bodySections && layout.bodySections !== '' && layout.bodySections !== '[]') {
            parsedBodySections = JSON.parse(layout.bodySections);
          }
          // If no body sections exist, create default one from bodyStyles for backward compatibility
          if (parsedBodySections.length === 0) {
            parsedBodySections = [{
              id: 'body-section-1',
              name: 'Body Section 1',
              styles: { ...defaultBodyStyles, ...parsedBodyStyles },
            }];
          }

          setHeaderComponents(parsedHeader);
          setFooterComponents(parsedFooter);
          setHeaderStyles({ ...defaultHeaderStyles, ...parsedHeaderStyles });
          setBodyStyles({ ...defaultBodyStyles, ...parsedBodyStyles }); // Keep for backward compatibility
          setBodySections(parsedBodySections);
          setActiveBodySectionId(parsedBodySections[0]?.id || null);
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
      toast.showWarning('Please enter a project name and layout name');
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
        bodyStyles: JSON.stringify(bodySections[0]?.styles || bodyStyles), // First section for backward compatibility
        bodySections: JSON.stringify(bodySections),
        footerStyles: JSON.stringify(footerStyles),
        globalStyles: JSON.stringify(globalStyles),
        isPublished: true,
      };

      let response;
      if (editingRowKey) {
        // Update existing layout via pages endpoint (handles both pages and layouts)
        response = await fetch(`${baseUrl}/api/pages/${projectName}/${editingRowKey}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(layoutData),
        });
      } else {
        // Create new layout via layouts endpoint
        response = await fetch(`${baseUrl}/api/layouts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(layoutData),
        });
      }

      if (response.ok) {
        toast.showSuccess('Layout saved successfully!');
        navigate('/layouts');
      } else {
        const err = await response.json();
        throw new Error(err.error || 'Failed to save layout');
      }
    } catch (err) {
      toast.showError(err instanceof Error ? err.message : 'Failed to save layout');
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
      {/* Header with Navigation */}
      <AppHeader title="Layout Editor" titleColor="text-purple-600" rightContent={
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
      }>
        <ProjectSelector />
        <input
          type="text"
          value={layoutName}
          onChange={(e) => setLayoutName(e.target.value)}
          className="px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
          placeholder="Layout name"
        />
      </AppHeader>

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
            Body ({bodySections.length} section{bodySections.length !== 1 ? 's' : ''})
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

          {/* Add Body Section button - only show when body tab is active */}
          {activeSection === 'body' && (
            <button
              onClick={addBodySection}
              className="px-3 py-1.5 text-sm text-green-600 hover:bg-green-50 rounded-md transition-colors mr-2 flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Section
            </button>
          )}

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

            {/* Body Sections (Content Zones) */}
            {bodySections.map((section) => (
              <div
                key={section.id}
                className={`relative transition-all cursor-pointer ${
                  activeSection === 'body' && activeBodySectionId === section.id
                    ? 'ring-2 ring-purple-500 ring-opacity-50'
                    : activeSection === 'body'
                    ? 'ring-1 ring-gray-300 ring-opacity-50'
                    : ''
                }`}
                onClick={() => {
                  handleSectionChange('body');
                  setActiveBodySectionId(section.id);
                }}
                style={{
                  maxWidth: section.styles.maxWidth || '100%',
                  margin: section.styles.margin || '0',
                  backgroundColor: section.styles.backgroundColor || 'transparent',
                  borderBottomWidth: section.styles.borderBottomWidth || undefined,
                  borderBottomStyle: (section.styles.borderBottomStyle as React.CSSProperties['borderBottomStyle']) || undefined,
                  borderBottomColor: section.styles.borderBottomColor || undefined,
                }}
              >
                {/* Section label */}
                {activeSection === 'body' && (
                  <div className="absolute top-1 left-1 z-10 flex items-center gap-1">
                    <span className={`px-2 py-0.5 text-[10px] rounded ${
                      activeBodySectionId === section.id
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-400 text-white'
                    }`}>
                      {section.name}
                    </span>
                    {bodySections.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteBodySection(section.id);
                        }}
                        className="px-1.5 py-0.5 text-[10px] rounded bg-red-500 text-white hover:bg-red-600 transition-colors"
                        title="Delete section"
                      >
                        ×
                      </button>
                    )}
                  </div>
                )}
                <div
                  style={{
                    maxWidth: section.styles.contentMaxWidth || '100%',
                    margin: section.styles.contentMargin || '0',
                    padding: section.styles.padding || '0',
                    minHeight: section.styles.minHeight || '200px',
                  }}
                  className={`border-2 border-dashed ${
                    activeSection === 'body' && activeBodySectionId === section.id
                      ? 'border-purple-300'
                      : 'border-gray-300'
                  } bg-white/50 flex items-center justify-center`}
                >
                  <div className="text-center text-gray-400">
                    <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <div className="font-medium text-sm">{section.name}</div>
                    <div className="text-xs">Page content will appear here</div>
                  </div>
                </div>
              </div>
            ))}

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
                {activeSection === 'header' ? 'Header' : activeSection === 'body' ? (
                  bodySections.find(s => s.id === activeBodySectionId)?.name || 'Body'
                ) : 'Footer'} Section Styles
              </h3>
              <button
                onClick={() => setShowSectionStylesPanel(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Body Section Name (only for body sections) */}
              {activeSection === 'body' && activeBodySectionId && (
                <div className="pb-3 border-b border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Section Name</label>
                  <input
                    type="text"
                    value={bodySections.find(s => s.id === activeBodySectionId)?.name || ''}
                    onChange={(e) => updateBodySectionName(activeBodySectionId, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    placeholder="Body Section 1"
                  />
                </div>
              )}

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
