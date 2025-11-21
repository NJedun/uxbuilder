import { useState } from 'react';
import { useBuilderStore, viewportConfigs } from '../store/builderStore';

type EditingField = 'width' | 'cols' | 'height' | null;

export default function CanvasSizeControl() {
  const { viewport, canvasSettingsByViewport, setCustomWidth, setCustomCols, setCustomHeight } = useBuilderStore();
  const canvasSettings = canvasSettingsByViewport[viewport];
  const baseConfig = viewportConfigs[viewport];
  const [inputValue, setInputValue] = useState('');
  const [isEditing, setIsEditing] = useState<EditingField>(null);

  const currentWidth = canvasSettings.width || baseConfig.width;
  const currentCols = canvasSettings.cols || baseConfig.cols;
  const currentHeight = canvasSettings.height || 1080;

  const handleSubmit = () => {
    const value = parseInt(inputValue);
    if (isNaN(value)) {
      setIsEditing(null);
      setInputValue('');
      return;
    }

    switch (isEditing) {
      case 'width':
        if (value >= 320 && value <= 3000) {
          setCustomWidth(value);
        }
        break;
      case 'cols':
        if (value >= 1 && value <= 24) {
          setCustomCols(value);
        }
        break;
      case 'height':
        if (value >= 400 && value <= 3000) {
          setCustomHeight(value);
        }
        break;
    }
    setIsEditing(null);
    setInputValue('');
  };

  const handleReset = () => {
    setCustomWidth(null);
    setCustomCols(null);
    setCustomHeight(null);
    setIsEditing(null);
    setInputValue('');
  };

  const hasCustomValues = canvasSettings.width !== null || canvasSettings.cols !== null || canvasSettings.height !== null;

  return (
    <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg px-4 py-2">
      <span className="text-sm text-gray-600 font-medium">Canvas:</span>

      {isEditing ? (
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSubmit();
              if (e.key === 'Escape') {
                setIsEditing(null);
                setInputValue('');
              }
            }}
            placeholder={
              isEditing === 'width' ? currentWidth.toString() :
              isEditing === 'cols' ? currentCols.toString() :
              currentHeight.toString()
            }
            className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
          <button
            onClick={handleSubmit}
            className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Set
          </button>
          <button
            onClick={() => {
              setIsEditing(null);
              setInputValue('');
            }}
            className="px-2 py-1 text-xs bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      ) : (
        <>
          <button
            onClick={() => setIsEditing('width')}
            className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline"
            title="Click to edit width"
          >
            {currentWidth}px
          </button>
          <span className="text-xs text-gray-400">×</span>
          <button
            onClick={() => setIsEditing('cols')}
            className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline"
            title="Click to edit columns"
          >
            {currentCols} cols
          </button>
          <span className="text-xs text-gray-400">×</span>
          <button
            onClick={() => setIsEditing('height')}
            className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline"
            title="Click to edit height"
          >
            {currentHeight}px
          </button>
          {hasCustomValues && (
            <button
              onClick={handleReset}
              className="text-xs text-gray-500 hover:text-gray-700 underline ml-2"
              title="Reset to viewport default"
            >
              Reset
            </button>
          )}
        </>
      )}
    </div>
  );
}
