import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import VisualCanvas from '../visualBuilder/VisualCanvas';
import VisualComponentLibrary from '../visualBuilder/VisualComponentLibrary';
import VisualStylePanel from '../visualBuilder/VisualStylePanel';
import GlobalStylePanel from '../visualBuilder/GlobalStylePanel';
import AIStylerModal from '../visualBuilder/AIStylerModal';
import { useVisualBuilderStore } from '../store/visualBuilderStore';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';

export type ViewMode = 'desktop' | 'tablet' | 'mobile';

export default function VisualBuilder() {
  const {
    projectName,
    setProjectName,
    exportProject,
    importProject,
    clearProject,
  } = useVisualBuilderStore();

  const [showComponentLibrary, setShowComponentLibrary] = useState(false);
  const [showStylePanel, setShowStylePanel] = useState(false);
  const [showGlobalStyles, setShowGlobalStyles] = useState(false);
  const [showAIStyler, setShowAIStyler] = useState(false);
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

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
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

            <button
              onClick={handleNew}
              className="px-3 sm:px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors font-medium text-xs sm:text-sm whitespace-nowrap"
            >
              New
            </button>

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

            <button
              onClick={handleExportJSON}
              className="px-3 sm:px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors font-medium text-xs sm:text-sm whitespace-nowrap"
            >
              Export JSON
            </button>

            <button
              onClick={handleExportPNG}
              className="px-3 sm:px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors font-medium text-xs sm:text-sm whitespace-nowrap"
            >
              PNG
            </button>

            <button
              onClick={handleExportPDF}
              className="px-3 sm:px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors font-medium text-xs sm:text-sm whitespace-nowrap"
            >
              PDF
            </button>

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
      </div>
  );
}
