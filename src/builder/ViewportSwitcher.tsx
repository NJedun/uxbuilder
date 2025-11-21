import { Viewport } from '../types/builder';
import { useBuilderStore } from '../store/builderStore';

const viewportOptions: Array<{ value: Viewport; label: string; icon: string }> = [
  { value: 'mobile', label: 'Mobile', icon: '📱' },
  { value: 'tablet', label: 'Tablet', icon: '💻' },
  { value: 'desktop', label: 'Desktop', icon: '🖥️' },
];

export default function ViewportSwitcher() {
  const { viewport, setViewport } = useBuilderStore();

  return (
    <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-1">
      {viewportOptions.map((option) => (
        <button
          key={option.value}
          onClick={() => setViewport(option.value)}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            viewport === option.value
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          <span className="mr-2">{option.icon}</span>
          {option.label}
        </button>
      ))}
    </div>
  );
}
