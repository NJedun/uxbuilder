import { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import VisualCanvas from '../visualBuilder/VisualCanvas';
import VisualComponentLibrary from '../visualBuilder/VisualComponentLibrary';
import VisualStylePanel from '../visualBuilder/VisualStylePanel';
import GlobalStylePanel from '../visualBuilder/GlobalStylePanel';
import AIStylerModal from '../visualBuilder/AIStylerModal';
import SavePageModal from '../visualBuilder/SavePageModal';
import AppHeader from '../components/AppHeader';
import ProjectSelector from '../components/ProjectSelector';
import { useToast } from '../components/Toast';
import { useConfirm } from '../components/ConfirmDialog';
import { useVisualBuilderStore } from '../store/visualBuilderStore';
import { Layout, BodySection, defaultBodyStyles, defaultHeaderStyles, defaultFooterStyles } from '../types/layout';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';

export type ViewMode = 'desktop' | 'tablet' | 'mobile';

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

export default function VisualBuilder() {
  const {
    projectName,
    setProjectName,
    exportProject,
    importProject,
    clearProject,
    clearCanvas,
    setSectionComponents,
    setActiveSectionId,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useVisualBuilderStore();

  const [searchParams] = useSearchParams();
  const toast = useToast();
  const { confirm } = useConfirm();
  const [editingPage, setEditingPage] = useState<EditingPage | null>(null);
  const [loadingPage, setLoadingPage] = useState(false);

  // Sync project name from localStorage on mount (in case it was changed in Layout Editor)
  useEffect(() => {
    const savedProjectName = localStorage.getItem('uxBuilder_lastProjectName');
    if (savedProjectName && savedProjectName !== projectName) {
      setProjectName(savedProjectName);
    }
  }, []);

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if target is an input or textarea to avoid interfering with text editing
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo()) {
          undo();
        }
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        if (canRedo()) {
          redo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, canUndo, canRedo]);

  // Load page data if editing
  useEffect(() => {
    const editRowKey = searchParams.get('edit');
    const editProject = searchParams.get('project');

    if (editRowKey && editProject) {
      loadPageForEditing(editProject, editRowKey);
    }
  }, [searchParams]);

  const loadPageForEditing = async (project: string, rowKey: string) => {
    try {
      setLoadingPage(true);
      const baseUrl = import.meta.env.DEV ? 'http://localhost:3001' : '';
      const response = await fetch(`${baseUrl}/api/pages/${project}/${rowKey}`);

      if (response.ok) {
        const data = await response.json();
        const page = data.data;

        // Load components and styles into the store using importProject
        try {
          const components = JSON.parse(page.components || '[]');
          const globalStyles = JSON.parse(page.globalStyles || '{}');
          const sectionComponents = JSON.parse(page.sectionComponents || '{}');

          importProject({
            version: '1.0.0',
            name: page.partitionKey,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            instructions: { note: '' },
            components,
            sectionComponents,
            globalStyles,
            theme: null,
          });

          // Set active section to first one if sectionComponents exist
          const sectionIds = Object.keys(sectionComponents);
          if (sectionIds.length > 0) {
            setActiveSectionId(sectionIds[0]);
          }
        } catch (err) {
          console.error('Failed to parse page data:', err);
        }

        // Store editing context
        setEditingPage({
          rowKey: page.rowKey,
          partitionKey: page.partitionKey,
          pageType: page.pageType,
          slug: page.slug,
          parentRowKey: page.parentRowKey,
          layoutRowKey: page.layoutRowKey || null,
          title: page.title,
          summary: page.summary || '',
          category: page.category,
        });

        // Load the associated layout if one exists
        if (page.layoutRowKey) {
          await loadLayoutForPreview(page.partitionKey, page.layoutRowKey);
        }
      }
    } catch (err) {
      console.error('Failed to load page for editing:', err);
    } finally {
      setLoadingPage(false);
    }
  };

  const loadLayoutForPreview = async (project: string, layoutRowKey: string) => {
    try {
      const baseUrl = import.meta.env.DEV ? 'http://localhost:3001' : '';
      const response = await fetch(`${baseUrl}/api/pages/${project}/${layoutRowKey}`);

      if (response.ok) {
        const data = await response.json();
        const layoutEntity = data.data;

        // Parse body sections (with backward compatibility)
        let bodySections: BodySection[] = [];
        if (layoutEntity.bodySections && layoutEntity.bodySections !== '' && layoutEntity.bodySections !== '[]') {
          bodySections = JSON.parse(layoutEntity.bodySections);
        }
        // If no body sections, create default one from bodyStyles for backward compatibility
        const parsedBodyStyles = layoutEntity.bodyStyles ? JSON.parse(layoutEntity.bodyStyles) : {};
        if (bodySections.length === 0) {
          bodySections = [{
            id: 'body-section-1',
            name: 'Body Section 1',
            styles: { ...defaultBodyStyles, ...parsedBodyStyles },
          }];
        }

        // Parse and set the layout
        const layout: Layout = {
          rowKey: layoutEntity.rowKey,
          partitionKey: layoutEntity.partitionKey,
          entityType: 'layout',
          name: layoutEntity.name || layoutEntity.title,
          isDefault: layoutEntity.isDefault || false,
          headerComponents: layoutEntity.headerComponents ? JSON.parse(layoutEntity.headerComponents) : [],
          footerComponents: layoutEntity.footerComponents ? JSON.parse(layoutEntity.footerComponents) : [],
          bodySections,
          headerStyles: layoutEntity.headerStyles ? JSON.parse(layoutEntity.headerStyles) : { ...defaultHeaderStyles },
          footerStyles: layoutEntity.footerStyles ? JSON.parse(layoutEntity.footerStyles) : { ...defaultFooterStyles },
          globalStyles: layoutEntity.globalStyles ? JSON.parse(layoutEntity.globalStyles) : {},
          createdAt: layoutEntity.createdAt || '',
          updatedAt: layoutEntity.updatedAt || '',
        };
        setPreviewLayout(layout);

        // Set active section to first body section from layout
        if (bodySections.length > 0) {
          setActiveSectionId(bodySections[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load layout for preview:', err);
    }
  };

  const [showComponentLibrary, setShowComponentLibrary] = useState(false);
  const [showStylePanel, setShowStylePanel] = useState(false);
  const [showGlobalStyles, setShowGlobalStyles] = useState(false);
  const [showAIStyler, setShowAIStyler] = useState(false);
  const [showSavePageModal, setShowSavePageModal] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [showNewDropdown, setShowNewDropdown] = useState(false);
  const [showStylesDropdown, setShowStylesDropdown] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('desktop');
  const [previewLayout, setPreviewLayout] = useState<Layout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get canvas width based on view mode
  const getCanvasWidth = () => {
    switch (viewMode) {
      case 'mobile': return '375px';
      case 'tablet': return '768px';
      case 'desktop': return '100%';
    }
  };

  const handleExportJSON = () => {
    const projectData = exportProject();
    const json = JSON.stringify(projectData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${projectName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = e.target?.result as string;
        const data = JSON.parse(json);
        importProject(data);
        toast.showSuccess(`Project "${data.name}" imported successfully!`);
      } catch (error) {
        toast.showError('Failed to import project. Invalid JSON file.');
        console.error('Import error:', error);
      }
    };
    reader.readAsText(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleExportPNG = async () => {
    const canvasElement = document.getElementById('visual-builder-canvas');
    if (!canvasElement) {
      toast.showError('Canvas not found');
      return;
    }

    try {
      window.scrollTo(0, 0);
      await new Promise(resolve => setTimeout(resolve, 200));

      const dataUrl = await toPng(canvasElement, {
        backgroundColor: '#ffffff',
        pixelRatio: 2,
        cacheBust: true,
        style: {
          margin: '0',
          padding: '0',
        }
      });

      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `${projectName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.showSuccess('PNG exported successfully');
    } catch (error) {
      console.error('Failed to export PNG:', error);
      toast.showError('Failed to export PNG');
    }
  };

  const handleExportPDF = async () => {
    const canvasElement = document.getElementById('visual-builder-canvas');
    if (!canvasElement) {
      toast.showError('Canvas not found');
      return;
    }

    try {
      window.scrollTo(0, 0);
      await new Promise(resolve => setTimeout(resolve, 200));

      const dataUrl = await toPng(canvasElement, {
        backgroundColor: '#ffffff',
        pixelRatio: 2,
        cacheBust: true,
        style: {
          margin: '0',
          padding: '0',
        }
      });

      const img = new Image();
      img.src = dataUrl;
      await new Promise((resolve) => { img.onload = resolve; });

      const imgWidth = img.width;
      const imgHeight = img.height;

      const pdf = new jsPDF({
        orientation: imgWidth > imgHeight ? 'landscape' : 'portrait',
        unit: 'px',
        format: [imgWidth, imgHeight],
      });

      pdf.addImage(dataUrl, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`${projectName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${Date.now()}.pdf`);
      toast.showSuccess('PDF exported successfully');
    } catch (error) {
      console.error('Failed to export PDF:', error);
      toast.showError('Failed to export PDF');
    }
  };

  const handleNew = async () => {
    const confirmed = await confirm({
      title: 'New Project',
      message: 'Create a new project? Current work will be lost if not exported.',
      confirmText: 'Create New',
      variant: 'warning',
    });
    if (confirmed) {
      clearProject();
    }
  };

  const handleClearCanvas = async () => {
    const confirmed = await confirm({
      title: 'Clear Canvas',
      message: 'Clear all components from the canvas? Project name and global styles will be preserved.',
      confirmText: 'Clear',
      variant: 'warning',
    });
    if (confirmed) {
      clearCanvas();
    }
  };

  const handleNewPage = () => {
    // Clear editing state so saving creates a new page instead of updating
    setEditingPage(null);
    // Also clear URL params if present
    if (searchParams.get('edit')) {
      window.history.replaceState({}, '', '/visual-builder');
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100">
        {/* Header with Navigation */}
        <AppHeader rightContent={
          <div className="flex items-center gap-2 flex-wrap">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('desktop')}
                className={`p-1.5 sm:p-2 rounded-md transition-colors ${viewMode === 'desktop' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                title="Desktop view"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('tablet')}
                className={`p-1.5 sm:p-2 rounded-md transition-colors ${viewMode === 'tablet' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                title="Tablet view (768px)"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('mobile')}
                className={`p-1.5 sm:p-2 rounded-md transition-colors ${viewMode === 'mobile' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                title="Mobile view (375px)"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </button>
            </div>

            {/* Undo/Redo Buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={undo}
                disabled={!canUndo()}
                className={`p-1.5 sm:p-2 rounded-md transition-colors ${
                  canUndo()
                    ? 'text-gray-600 hover:bg-gray-200 hover:text-gray-800'
                    : 'text-gray-300 cursor-not-allowed'
                }`}
                title="Undo (Ctrl+Z)"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
              </button>
              <button
                onClick={redo}
                disabled={!canRedo()}
                className={`p-1.5 sm:p-2 rounded-md transition-colors ${
                  canRedo()
                    ? 'text-gray-600 hover:bg-gray-200 hover:text-gray-800'
                    : 'text-gray-300 cursor-not-allowed'
                }`}
                title="Redo (Ctrl+Y)"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
                </svg>
              </button>
            </div>

            <div className="hidden sm:block h-6 w-px bg-gray-300" />

            {/* New Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowNewDropdown(!showNewDropdown)}
                className="px-3 sm:px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors font-medium text-xs sm:text-sm whitespace-nowrap flex items-center gap-1"
              >
                New
                <svg className={`w-4 h-4 transition-transform ${showNewDropdown ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showNewDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowNewDropdown(false)}
                  />
                  <div className="absolute top-full right-0 mt-1 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50 min-w-[160px]">
                    <button
                      onClick={() => {
                        handleNew();
                        setShowNewDropdown(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                      </svg>
                      New Project
                    </button>
                    <button
                      onClick={() => {
                        handleNewPage();
                        setShowNewDropdown(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      New Page
                    </button>
                    <button
                      onClick={() => {
                        handleClearCanvas();
                        setShowNewDropdown(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Clear Canvas
                    </button>
                    <div className="border-t border-gray-100 my-1" />
                    <button
                      onClick={() => {
                        setShowNewDropdown(false);
                        fileInputRef.current?.click();
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      Import JSON
                    </button>
                  </div>
                </>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImportJSON}
              className="hidden"
              id="import-input"
            />

            {/* Export Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowExportDropdown(!showExportDropdown)}
                className="px-3 sm:px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-800 transition-colors font-medium text-xs sm:text-sm whitespace-nowrap flex items-center gap-1"
              >
                Export
                <svg className={`w-4 h-4 transition-transform ${showExportDropdown ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showExportDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowExportDropdown(false)}
                  />
                  <div className="absolute top-full right-0 mt-1 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50 min-w-[120px]">
                    <button
                      onClick={() => {
                        handleExportJSON();
                        setShowExportDropdown(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      JSON
                    </button>
                    <button
                      onClick={() => {
                        handleExportPNG();
                        setShowExportDropdown(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      PNG
                    </button>
                    <button
                      onClick={() => {
                        handleExportPDF();
                        setShowExportDropdown(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      PDF
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Styles Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowStylesDropdown(!showStylesDropdown)}
                className="px-3 sm:px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors font-medium text-xs sm:text-sm whitespace-nowrap flex items-center gap-1"
              >
                Styles
                <svg className={`w-4 h-4 transition-transform ${showStylesDropdown ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showStylesDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowStylesDropdown(false)}
                  />
                  <div className="absolute top-full right-0 mt-1 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50 min-w-[160px]">
                    <button
                      onClick={() => {
                        setShowGlobalStyles(true);
                        setShowStylesDropdown(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                      </svg>
                      Global Styles
                    </button>
                    <button
                      onClick={() => {
                        setShowAIStyler(true);
                        setShowStylesDropdown(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      Style with AI
                    </button>
                  </div>
                </>
              )}
            </div>

            <div className="hidden sm:block h-6 w-px bg-gray-300" />

            <button
              onClick={() => setShowSavePageModal(true)}
              className="px-3 sm:px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-800 transition-colors font-medium text-xs sm:text-sm whitespace-nowrap flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Save Page
            </button>
          </div>
        }>
          <ProjectSelector />
        </AppHeader>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* Component Library Sidebar - Desktop always visible, Mobile toggleable */}
          <div className={`
            absolute lg:relative z-20 lg:z-0 h-full
            transition-transform duration-300 ease-in-out
            ${showComponentLibrary ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}>
            <VisualComponentLibrary
              onLayoutSelect={setPreviewLayout}
              selectedLayoutId={previewLayout?.rowKey || null}
            />
          </div>

          {/* Mobile Overlay */}
          {(showComponentLibrary || showStylePanel) && (
            <div
              className="lg:hidden absolute inset-0 bg-black bg-opacity-50 z-10"
              onClick={() => {
                setShowComponentLibrary(false);
                setShowStylePanel(false);
              }}
            />
          )}

          {/* Canvas Area */}
          <main className="flex-1 p-2 sm:p-6 overflow-auto bg-gray-50">
            <VisualCanvas viewMode={viewMode} previewLayout={previewLayout} />
          </main>

          {/* Style Panel - Desktop always visible, Mobile toggleable */}
          <div className={`
            absolute lg:relative z-20 lg:z-0 h-full right-0
            transition-transform duration-300 ease-in-out
            ${showStylePanel ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
          `}>
            <VisualStylePanel previewLayout={previewLayout} />
          </div>

          {/* Mobile Panel Toggles */}
          <div className="lg:hidden absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-30">
            <button
              onClick={() => setShowComponentLibrary(!showComponentLibrary)}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg shadow-lg hover:bg-gray-800 transition-colors text-sm font-medium"
            >
              {showComponentLibrary ? 'Hide' : 'Show'} Components
            </button>
            <button
              onClick={() => setShowStylePanel(!showStylePanel)}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg shadow-lg hover:bg-gray-700 transition-colors text-sm font-medium"
            >
              {showStylePanel ? 'Hide' : 'Show'} Styles
            </button>
          </div>
        </div>

        {/* Global Styles Modal */}
        {showGlobalStyles && (
          <GlobalStylePanel onClose={() => setShowGlobalStyles(false)} />
        )}

        {/* AI Styler Modal */}
        {showAIStyler && (
          <AIStylerModal
            isOpen={showAIStyler}
            onClose={() => setShowAIStyler(false)}
          />
        )}

        {/* Save Page Modal */}
        {showSavePageModal && (
          <SavePageModal
            isOpen={showSavePageModal}
            onClose={() => setShowSavePageModal(false)}
            editingPage={editingPage}
            previewLayoutId={previewLayout?.rowKey || null}
          />
        )}
      </div>
  );
}
