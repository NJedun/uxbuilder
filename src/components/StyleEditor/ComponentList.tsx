import { useBuilderStore } from '../../store/builderStore';
import { PlacedComponent } from '../../types/builder';
import { useState } from 'react';

interface ComponentListProps {
  onSelectComponent: (type: string, variant?: string) => void;
  selectedComponentType?: string;
  selectedVariant?: string;
}

// Define which child components each composite component contains
const compositeComponentChildren: Record<string, Record<string, Array<{ type: string; variant?: string; count?: number }>>> = {
  HeaderPattern: {
    simple: [
      { type: 'Logo' },
      { type: 'NavMenu', variant: 'simple' },
      { type: 'Link', variant: 'primary', count: 4 }, // From NavMenu
    ],
    ecommerce: [
      { type: 'Logo' },
      { type: 'SearchBar', variant: 'withIcon' },
      { type: 'Input' }, // From SearchBar
      { type: 'HeaderActions', variant: 'icons' },
      { type: 'IconButton', variant: 'ghost', count: 3 }, // From HeaderActions
      { type: 'Badge', variant: 'red' }, // From HeaderActions
      { type: 'Badge', variant: 'blue' }, // From HeaderActions
    ],
    saas: [
      { type: 'Logo' },
      { type: 'NavMenu', variant: 'simple' },
      { type: 'Link', variant: 'primary', count: 3 }, // From NavMenu
      { type: 'HeaderActions', variant: 'buttons' },
      { type: 'Button', variant: 'secondary' }, // From HeaderActions
      { type: 'Button', variant: 'primary' }, // From HeaderActions
    ],
    mobile: [
      { type: 'Logo' }, // Logo doesn't use variants, only size prop
      { type: 'HamburgerIcon' },
    ],
  },
  FooterPattern: {
    simple: [
      { type: 'Logo' }, // Logo doesn't use variants, only size prop
      { type: 'NavMenu', variant: 'simple' },
      { type: 'Link', variant: 'primary', count: 3 },
    ],
    withSocial: [
      { type: 'NavMenu', variant: 'simple' },
      { type: 'Link', variant: 'primary', count: 4 },
      { type: 'SocialLinks' },
      { type: 'IconButton', variant: 'filled', count: 4 }, // From SocialLinks
    ],
    multiColumn: [
      { type: 'Logo' }, // Logo doesn't use variants, only size prop
      { type: 'Title', variant: 'h5', count: 3 }, // 3 column headers with h5
      { type: 'Link', variant: 'primary', count: 12 }, // 3 columns × 4 links
      { type: 'Input' },
      { type: 'Button', variant: 'primary' },
      { type: 'SocialLinks' },
      { type: 'IconButton', variant: 'filled', count: 4 }, // From SocialLinks
      { type: 'HorizontalLine' },
      { type: 'CopyrightText' },
    ],
  },
};

export default function ComponentList({
  onSelectComponent,
  selectedComponentType,
  selectedVariant
}: ComponentListProps) {
  const { componentsByViewport, viewport } = useBuilderStore();
  const components = componentsByViewport[viewport];

  // Flatten components - include both top-level and children from composites
  const flattenedComponents: Array<{ type: string; variant?: string; parentComponent?: PlacedComponent; childIndex?: number }> = [];

  components.forEach((comp) => {
    // Add the top-level component
    flattenedComponents.push({ type: comp.type, variant: comp.props?.variant, parentComponent: comp });

    // If it's a composite component, add its children
    const variant = comp.props?.variant || 'default';
    const children = compositeComponentChildren[comp.type]?.[variant];

    if (children) {
      children.forEach((child, index) => {
        flattenedComponents.push({
          type: child.type,
          variant: child.variant,
          parentComponent: comp,
          childIndex: index,
        });
      });
    }
  });

  // Deduplicate by type+variant combination
  const uniqueComponents = new Map<string, typeof flattenedComponents[0]>();
  flattenedComponents.forEach((comp) => {
    const key = `${comp.type}-${comp.variant || 'default'}`;
    if (!uniqueComponents.has(key)) {
      uniqueComponents.set(key, comp);
    }
  });

  // Group unique components by type
  const componentsByType = Array.from(uniqueComponents.values()).reduce((acc, comp) => {
    if (!acc[comp.type]) {
      acc[comp.type] = [];
    }
    acc[comp.type].push(comp);
    return acc;
  }, {} as Record<string, Array<typeof flattenedComponents[0]>>);

  // Track collapsed state for each component type - start with all component types collapsed
  const [collapsedTypes, setCollapsedTypes] = useState<Set<string>>(() =>
    new Set(Object.keys(componentsByType))
  );

  const toggleCollapse = (type: string) => {
    setCollapsedTypes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(type)) {
        newSet.delete(type);
      } else {
        newSet.add(type);
      }
      return newSet;
    });
  };

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
            Object.entries(componentsByType).map(([type, comps]) => {
              const isCollapsed = collapsedTypes.has(type);

              return (
                <div key={type}>
                  <div
                    className="flex items-center justify-between cursor-pointer mb-2 hover:bg-gray-50 p-1 rounded"
                    onClick={() => toggleCollapse(type)}
                  >
                    <h3 className="text-sm font-semibold text-gray-700">{type}</h3>
                    <svg
                      className={`w-4 h-4 text-gray-600 transition-transform ${isCollapsed ? '' : 'rotate-90'}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>

                  {!isCollapsed && (
                    <div className="space-y-1">
                      {comps.map((comp, index) => {
                        const variant = comp.variant || 'default';
                        const isSelected =
                          selectedComponentType === type &&
                          selectedVariant === variant;

                        return (
                          <div
                            key={`${type}-${variant}`}
                            onClick={() => onSelectComponent(type, variant)}
                            className={`text-sm p-2 rounded transition-colors cursor-pointer ${
                              isSelected
                                ? 'bg-blue-100 border-2 border-blue-500'
                                : 'bg-gray-50 hover:bg-gray-100'
                            }`}
                          >
                            <div className="font-medium text-gray-800">
                              {type}
                            </div>
                            {variant && variant !== 'default' && (
                              <div className="text-xs text-gray-500 mt-0.5">
                                Variant: {variant}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
