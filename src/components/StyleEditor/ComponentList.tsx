import { useBuilderStore } from '../../store/builderStore';

interface ComponentListProps {
  onSelectComponent: (type: string, variant?: string) => void;
  selectedComponentType?: string;
  selectedVariant?: string;
}

export default function ComponentList({
  onSelectComponent,
  selectedComponentType,
  selectedVariant
}: ComponentListProps) {
  const { componentsByViewport, viewport } = useBuilderStore();
  const components = componentsByViewport[viewport];

  // Group components by type
  const componentsByType = components.reduce((acc, comp) => {
    if (!acc[comp.type]) {
      acc[comp.type] = [];
    }
    acc[comp.type].push(comp);
    return acc;
  }, {} as Record<string, typeof components>);

  return (
    <div className="w-64 h-full bg-white border-r border-gray-200 overflow-y-auto">
      <div className="p-4">
        <h2 className="text-lg font-bold mb-4">Style Components</h2>

        <div className="space-y-4">
          {/* Global Styles - Always at top */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Global</h3>
            <div
              onClick={() => onSelectComponent('Global')}
              className={`text-sm p-2 rounded transition-colors cursor-pointer ${
                selectedComponentType === 'Global'
                  ? 'bg-blue-100 border-2 border-blue-500'
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <div className="font-medium text-gray-800">
                Global Styles
              </div>
              <div className="text-xs text-gray-500 mt-0.5">
                Body, colors, typography
              </div>
            </div>
          </div>

          {/* Components from Canvas */}
          {Object.keys(componentsByType).length === 0 ? (
            <p className="text-sm text-gray-500">No components added yet. Switch to UX Mode to add components.</p>
          ) : (
            Object.entries(componentsByType).map(([type, comps]) => (
              <div key={type}>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">{type}</h3>
                <div className="space-y-1">
                  {comps.map((comp, index) => {
                    const variant = comp.props?.variant;
                    const isSelected =
                      selectedComponentType === type &&
                      (variant ? selectedVariant === variant : true);

                    return (
                      <div
                        key={comp.i}
                        onClick={() => onSelectComponent(type, variant)}
                        className={`text-sm p-2 rounded transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-blue-100 border-2 border-blue-500'
                            : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                      >
                        <div className="font-medium text-gray-800">
                          {type} #{index + 1}
                        </div>
                        {variant && (
                          <div className="text-xs text-gray-500 mt-0.5">
                            Variant: {variant}
                          </div>
                        )}
                        <div className="text-xs text-gray-400 mt-0.5">
                          Section: {comp.parentId}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
