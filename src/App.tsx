import { useEffect } from 'react';
import ComponentLibrary from './builder/ComponentLibrary';
import Canvas from './builder/Canvas';
import ViewportSwitcher from './builder/ViewportSwitcher';
import CanvasSizeControl from './builder/CanvasSizeControl';
import PropertiesPanel from './builder/PropertiesPanel';
import Toolbar from './builder/Toolbar';
import { useBuilderStore } from './store/builderStore';
import { useAutoSave } from './hooks/useAutoSave';

export default function App() {
  const loadFromLocalStorage = useBuilderStore((state) => state.loadFromLocalStorage);

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
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <CanvasSizeControl />
              <ViewportSwitcher />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Component Library Sidebar */}
          <ComponentLibrary />

          {/* Canvas Area */}
          <main className="flex-1 p-6 overflow-auto">
            <Canvas />
          </main>

          {/* Properties Panel */}
          <PropertiesPanel />
        </div>
      </div>
  );
}
