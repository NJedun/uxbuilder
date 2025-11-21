import { useBuilderStore } from '../store/builderStore';

export default function ZoomControl() {
  const { zoom, setZoom } = useBuilderStore();

  const zoomLevels = [0.5, 0.75, 1, 1.25, 1.5, 2];

  const handleZoomIn = () => {
    const currentIndex = zoomLevels.indexOf(zoom);
    if (currentIndex < zoomLevels.length - 1) {
      setZoom(zoomLevels[currentIndex + 1]);
    }
  };

  const handleZoomOut = () => {
    const currentIndex = zoomLevels.indexOf(zoom);
    if (currentIndex > 0) {
      setZoom(zoomLevels[currentIndex - 1]);
    }
  };

  const handleReset = () => {
    setZoom(1);
  };

  return (
    <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-md p-1">
      <button
        onClick={handleZoomOut}
        disabled={zoom <= zoomLevels[0]}
        className="px-2 py-1 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
        title="Zoom out"
      >
        −
      </button>
      <button
        onClick={handleReset}
        className="px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100 rounded min-w-[60px]"
        title="Reset zoom"
      >
        {Math.round(zoom * 100)}%
      </button>
      <button
        onClick={handleZoomIn}
        disabled={zoom >= zoomLevels[zoomLevels.length - 1]}
        className="px-2 py-1 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
        title="Zoom in"
      >
        +
      </button>
    </div>
  );
}
