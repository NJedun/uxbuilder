import { useState, useRef, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import VisualCanvas from '../visualBuilder/VisualCanvas';
import VisualComponentLibrary from '../visualBuilder/VisualComponentLibrary';
import VisualStylePanel from '../visualBuilder/VisualStylePanel';
import GlobalStylePanel from '../visualBuilder/GlobalStylePanel';
import AIStylerModal from '../visualBuilder/AIStylerModal';
import SavePageModal from '../visualBuilder/SavePageModal';
import { useVisualBuilderStore } from '../store/visualBuilderStore';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';

export type ViewMode = 'desktop' | 'tablet' | 'mobile';

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

export default function VisualBuilder() {
  const {
    projectName,
    setProjectName,
    exportProject,
    importProject,
    clearProject,
    clearCanvas,
  } = useVisualBuilderStore();

  const [searchParams] = useSearchParams();
  const [editingPage, setEditingPage] = useState<EditingPage | null>(null);
  const [loadingPage, setLoadingPage] = useState(false);

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
          importProject({
            name: page.partitionKey,
            components,
            globalStyles,
          });
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
          title: page.title,
          summary: page.summary || '',
          category: page.category,
        });
      }
    } catch (err) {
      console.error('Failed to load page for editing:', err);
    } finally {
      setLoadingPage(false);
    }
  };

  const [showComponentLibrary, setShowComponentLibrary] = useState(false);
  const [showStylePanel, setShowStylePanel] = useState(false);
  const [showGlobalStyles, setShowGlobalStyles] = useState(false);
  const [showAIStyler, setShowAIStyler] = useState(false);
  const [showSavePageModal, setShowSavePageModal] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [showNewDropdown, setShowNewDropdown] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('desktop');
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
        alert(`Project "${data.name}" imported successfully!`);
      } catch (error) {
        alert('Failed to import project. Invalid JSON file.');
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
      alert('Canvas not found');
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
    } catch (error) {
      console.error('Failed to export PNG:', error);
      alert('Failed to export PNG');
    }
  };

  const handleExportPDF = async () => {
    const canvasElement = document.getElementById('visual-builder-canvas');
    if (!canvasElement) {
      alert('Canvas not found');
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
    } catch (error) {
      console.error('Failed to export PDF:', error);
      alert('Failed to export PDF');
    }
  };

  const handleNew = () => {
    if (confirm('Create a new project? Current work will be lost if not exported.')) {
      clearProject();
    }
  };

  const handleClearCanvas = () => {
    if (confirm('Clear all components from the canvas? Project name and global styles will be preserved.')) {
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
        {/* Toolbar */}
        <div className="min-h-16 bg-white border-b border-gray-200 px-2 sm:px-6 py-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
            <h1 className="text-lg sm:text-xl font-bold text-gray-800">Visual Builder</h1>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full sm:w-auto px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="Project name"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
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
                      <span>📁</span> New Project
                    </button>
                    <button
                      onClick={() => {
                        handleNewPage();
                        setShowNewDropdown(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <span>📄</span> New Page
                    </button>
                    <button
                      onClick={() => {
                        handleClearCanvas();
                        setShowNewDropdown(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <span>🧹</span> Clear Canvas
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
            <label
              htmlFor="import-input"
              className="px-3 sm:px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors font-medium text-xs sm:text-sm cursor-pointer whitespace-nowrap"
            >
              Import
            </label>

            {/* Export Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowExportDropdown(!showExportDropdown)}
                className="px-3 sm:px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors font-medium text-xs sm:text-sm whitespace-nowrap flex items-center gap-1"
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
                      <span className="text-green-500">📄</span> JSON
                    </button>
                    <button
                      onClick={() => {
                        handleExportPNG();
                        setShowExportDropdown(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <span className="text-purple-500">🖼️</span> PNG
                    </button>
                    <button
                      onClick={() => {
                        handleExportPDF();
                        setShowExportDropdown(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <span className="text-orange-500">📑</span> PDF
                    </button>
                  </div>
                </>
              )}
            </div>

            <button
              onClick={() => setShowGlobalStyles(true)}
              className="px-3 sm:px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors font-medium text-xs sm:text-sm whitespace-nowrap"
            >
              Global Styles
            </button>

            <Link
              to="/styleguide"
              className="px-3 sm:px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition-colors font-medium text-xs sm:text-sm whitespace-nowrap"
            >
              Style Guide
            </Link>

            <button
              onClick={() => setShowAIStyler(true)}
              className="px-3 sm:px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-md hover:from-purple-600 hover:to-pink-600 transition-all font-medium text-xs sm:text-sm whitespace-nowrap flex items-center gap-1"
            >
              <span>✨</span>
              Style with AI
            </button>

            <div className="hidden sm:block h-6 w-px bg-gray-300" />

            <Link
              to="/pages"
              className="px-3 sm:px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors font-medium text-xs sm:text-sm whitespace-nowrap"
            >
              Pages
            </Link>

            <button
              onClick={() => setShowSavePageModal(true)}
              className="px-3 sm:px-4 py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 transition-colors font-medium text-xs sm:text-sm whitespace-nowrap flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Save Page
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* Component Library Sidebar - Desktop always visible, Mobile toggleable */}
          <div className={`
            absolute lg:relative z-20 lg:z-0 h-full
            transition-transform duration-300 ease-in-out
            ${showComponentLibrary ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}>
            <VisualComponentLibrary />
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
            <VisualCanvas viewMode={viewMode} />
          </main>

          {/* Style Panel - Desktop always visible, Mobile toggleable */}
          <div className={`
            absolute lg:relative z-20 lg:z-0 h-full right-0
            transition-transform duration-300 ease-in-out
            ${showStylePanel ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
          `}>
            <VisualStylePanel />
          </div>

          {/* Mobile Panel Toggles */}
          <div className="lg:hidden absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-30">
            <button
              onClick={() => setShowComponentLibrary(!showComponentLibrary)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow-lg hover:bg-blue-600 transition-colors text-sm font-medium"
            >
              {showComponentLibrary ? 'Hide' : 'Show'} Components
            </button>
            <button
              onClick={() => setShowStylePanel(!showStylePanel)}
              className="px-4 py-2 bg-green-500 text-white rounded-lg shadow-lg hover:bg-green-600 transition-colors text-sm font-medium"
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
          />
        )}
      </div>
  );
}
