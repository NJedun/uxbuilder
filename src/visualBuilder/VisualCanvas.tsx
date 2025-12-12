import { useEffect } from 'react';
import { useVisualBuilderStore } from '../store/visualBuilderStore';
import VisualComponentRenderer from './VisualComponentRenderer';
import type { ViewMode } from '../pages/VisualBuilder';
import { Layout } from '../types/layout';

interface VisualCanvasProps {
  viewMode?: ViewMode;
  previewLayout?: Layout | null;
}

export default function VisualCanvas({ viewMode = 'desktop', previewLayout }: VisualCanvasProps) {
  const {
    components,
    selectComponent,
    selectedComponentId,
    loadFromLocalStorage,
  } = useVisualBuilderStore();

  useEffect(() => {
    loadFromLocalStorage();
  }, [loadFromLocalStorage]);

  const handleCanvasClick = (e: React.MouseEvent) => {
    // Only deselect if clicking directly on canvas, not on a component
    if (e.target === e.currentTarget) {
      selectComponent(null);
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

  const canvasWidth = getCanvasWidth();
  const isResponsiveView = viewMode !== 'desktop';

  return (
    <div className="flex justify-center w-full">
      <div
        id="visual-builder-canvas"
        className={`bg-white shadow-lg rounded-lg min-h-screen relative transition-all duration-300 ${
          isResponsiveView ? 'border-2 border-gray-300' : ''
        }`}
        style={{
          width: canvasWidth,
          maxWidth: viewMode === 'desktop' ? '1500px' : canvasWidth,
          minWidth: isResponsiveView ? canvasWidth : undefined,
        }}
        onClick={handleCanvasClick}
      >
      {/* Layout Header Preview */}
      {previewLayout && previewLayout.headerComponents.length > 0 && (
        <div className="relative">
          <div className="absolute top-1 left-1 z-10 px-2 py-0.5 bg-purple-500 text-white text-[10px] rounded opacity-75">
            Layout Header
          </div>
          {previewLayout.headerComponents.map((component) => (
            <VisualComponentRenderer
              key={`layout-header-${component.id}`}
              component={component}
              isSelected={false}
              onSelect={() => {}}
              viewMode={viewMode}
              readOnly={true}
            />
          ))}
        </div>
      )}

      {/* Main Content Area (Body) */}
      <main
        style={{
          maxWidth: previewLayout?.bodyStyles?.maxWidth || '100%',
          margin: previewLayout?.bodyStyles?.margin || '0',
          backgroundColor: previewLayout?.bodyStyles?.backgroundColor || 'transparent',
        }}
      >
        <div
          style={{
            maxWidth: previewLayout?.bodyStyles?.contentMaxWidth || '100%',
            margin: previewLayout?.bodyStyles?.contentMargin || '0',
            padding: previewLayout?.bodyStyles?.padding || '0',
            minHeight: previewLayout?.bodyStyles?.minHeight || undefined,
          }}
        >
          {components.length === 0 ? (
            <div className="flex items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-lg m-8">
              <div className="text-center text-gray-400">
                <svg
                  className="mx-auto h-12 w-12 mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                <p className="text-lg font-medium">Click a component to add it</p>
                <p className="text-sm mt-2">Select a component from the left sidebar</p>
              </div>
            </div>
          ) : (
            <>
              {components.map((component) => (
                <VisualComponentRenderer
                  key={component.id}
                  component={component}
                  isSelected={selectedComponentId === component.id}
                  onSelect={() => selectComponent(component.id)}
                  viewMode={viewMode}
                />
              ))}
            </>
          )}
        </div>
      </main>

      {/* Layout Footer Preview */}
      {previewLayout && previewLayout.footerComponents.length > 0 && (
        <div className="relative">
          <div className="absolute top-1 left-1 z-10 px-2 py-0.5 bg-purple-500 text-white text-[10px] rounded opacity-75">
            Layout Footer
          </div>
          {previewLayout.footerComponents.map((component) => (
            <VisualComponentRenderer
              key={`layout-footer-${component.id}`}
              component={component}
              isSelected={false}
              onSelect={() => {}}
              viewMode={viewMode}
              readOnly={true}
            />
          ))}
        </div>
      )}
      </div>
    </div>
  );
}
