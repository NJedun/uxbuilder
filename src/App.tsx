import { useEffect, useState } from 'react';
import ComponentLibrary from './builder/ComponentLibrary';
import Canvas from './builder/Canvas';
import ViewportSwitcher from './builder/ViewportSwitcher';
import CanvasSizeControl from './builder/CanvasSizeControl';
import PropertiesPanel from './builder/PropertiesPanel';
import Toolbar from './builder/Toolbar';
import ZoomControl from './builder/ZoomControl';
import { useBuilderStore } from './store/builderStore';
import { useAutoSave } from './hooks/useAutoSave';

export default function App() {
  const loadFromLocalStorage = useBuilderStore((state) => state.loadFromLocalStorage);
  const [showComponentLibrary, setShowComponentLibrary] = useState(false);
  const [showPropertiesPanel, setShowPropertiesPanel] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    loadFromLocalStorage();
  }, [loadFromLocalStorage]);

  // Auto-save on changes
  useAutoSave();

  return (
    <div className="h-screen flex flex-col bg-gray-100">
        {/* Toolbar */}
        <Toolbar />

        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-2 sm:px-6 py-2 sm:py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
              <CanvasSizeControl />
              <ViewportSwitcher />
              <ZoomControl />
            </div>

            {/* Mobile Panel Toggles */}
            <div className="flex gap-2 w-full sm:w-auto lg:hidden">
              <button
                onClick={() => setShowComponentLibrary(!showComponentLibrary)}
                className="flex-1 sm:flex-none px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm font-medium"
              >
                {showComponentLibrary ? 'Hide' : 'Show'} Components
              </button>
              <button
                onClick={() => setShowPropertiesPanel(!showPropertiesPanel)}
                className="flex-1 sm:flex-none px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-sm font-medium"
              >
                {showPropertiesPanel ? 'Hide' : 'Show'} Properties
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* Component Library Sidebar - Desktop always visible, Mobile toggleable */}
          <div className={`
            absolute lg:relative z-20 lg:z-0 h-full
            transition-transform duration-300 ease-in-out
            ${showComponentLibrary ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}>
            <ComponentLibrary />
          </div>

          {/* Mobile Overlay */}
          {(showComponentLibrary || showPropertiesPanel) && (
            <div
              className="lg:hidden absolute inset-0 bg-black bg-opacity-50 z-10"
              onClick={() => {
                setShowComponentLibrary(false);
                setShowPropertiesPanel(false);
              }}
            />
          )}

          {/* Canvas Area */}
          <main className="flex-1 p-2 sm:p-6 overflow-auto">
            <Canvas />
          </main>

          {/* Properties Panel - Desktop always visible, Mobile toggleable */}
          <div className={`
            absolute lg:relative z-20 lg:z-0 h-full right-0
            transition-transform duration-300 ease-in-out
            ${showPropertiesPanel ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
          `}>
            <PropertiesPanel />
          </div>
        </div>
      </div>
  );
}
