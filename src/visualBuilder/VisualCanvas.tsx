import { useEffect } from 'react';
import { useVisualBuilderStore } from '../store/visualBuilderStore';
import VisualComponentRenderer from './VisualComponentRenderer';

export default function VisualCanvas() {
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

  return (
    <div
      id="visual-builder-canvas"
      className="max-w-6xl mx-auto bg-white shadow-lg rounded-lg min-h-screen relative"
      onClick={handleCanvasClick}
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
        <div>
          {components.map((component) => (
            <VisualComponentRenderer
              key={component.id}
              component={component}
              isSelected={selectedComponentId === component.id}
              onSelect={() => selectComponent(component.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
