import { useTheme } from '../../contexts/ThemeContext';

interface StyleEditorProps {
  selectedComponent: string;
  selectedVariant: string;
  onComponentChange: (component: string) => void;
  onVariantChange: (variant: string) => void;
}

export default function StyleEditor({
  selectedComponent,
  selectedVariant,
  onComponentChange,
  onVariantChange
}: StyleEditorProps) {
  const { theme, updateComponentStyle, updateGlobalStyle } = useTheme();

  // Get the current styles based on selected component and variant
  const currentStyles = selectedComponent === 'Global'
    ? null
    : (theme.componentStyles as any)?.[selectedComponent]?.[selectedVariant];

  // Debug: Log current selection
  console.log('StyleEditor - Selected:', { selectedComponent, selectedVariant, currentStyles });

  // Get available variants for the selected component
  const availableVariants = selectedComponent === 'Global'
    ? []
    : Object.keys((theme.componentStyles as any)?.[selectedComponent] || {});

  const handleStyleChange = (property: string, value: string) => {
    updateComponentStyle(selectedComponent, selectedVariant, {
      [property]: value
    });
  };

  const handleGlobalStyleChange = (category: string, property: string, value: string) => {
    updateGlobalStyle(category, property, value);
  };

  // Define which properties are colors for color picker rendering
  const colorProperties = ['backgroundColor', 'textColor', 'borderColor', 'shadowColor', 'hoverColor'];

  // Render a style input field dynamically
  const renderStyleInput = (property: string, value: any) => {
    const isColor = colorProperties.includes(property);

    if (isColor) {
      return (
        <div key={property}>
          <label className="block text-sm font-medium mb-1 capitalize">
            {property.replace(/([A-Z])/g, ' $1').trim()}
          </label>
          <div className="flex gap-2">
            <input
              type="color"
              value={value || '#000000'}
              onChange={(e) => handleStyleChange(property, e.target.value)}
              className="h-10 w-16 border border-gray-300 rounded cursor-pointer"
            />
            <input
              type="text"
              value={value || ''}
              onChange={(e) => handleStyleChange(property, e.target.value)}
              className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
            />
          </div>
        </div>
      );
    }

    return (
      <div key={property}>
        <label className="block text-sm font-medium mb-1 capitalize">
          {property.replace(/([A-Z])/g, ' $1').trim()}
        </label>
        <input
          type="text"
          value={value || ''}
          onChange={(e) => handleStyleChange(property, e.target.value)}
          className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
        />
      </div>
    );
  };

  return (
    <div className="w-80 h-full bg-white border-l border-gray-200 overflow-y-auto">
      <div className="p-4">
        <h2 className="text-lg font-bold mb-4">Style Editor</h2>

        {selectedComponent === 'Global' ? (
          // Global Styles Editor
          <>
            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-gray-700 border-b pb-2">Colors</h3>

              {/* Primary Color */}
              <div>
                <label className="block text-sm font-medium mb-1">Primary Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={theme.globalStyles.colors.primary}
                    onChange={(e) => handleGlobalStyleChange('colors', 'primary', e.target.value)}
                    className="h-10 w-16 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={theme.globalStyles.colors.primary}
                    onChange={(e) => handleGlobalStyleChange('colors', 'primary', e.target.value)}
                    className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
                  />
                </div>
              </div>

              {/* Secondary Color */}
              <div>
                <label className="block text-sm font-medium mb-1">Secondary Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={theme.globalStyles.colors.secondary}
                    onChange={(e) => handleGlobalStyleChange('colors', 'secondary', e.target.value)}
                    className="h-10 w-16 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={theme.globalStyles.colors.secondary}
                    onChange={(e) => handleGlobalStyleChange('colors', 'secondary', e.target.value)}
                    className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
                  />
                </div>
              </div>

              {/* Text Color */}
              <div>
                <label className="block text-sm font-medium mb-1">Text Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={theme.globalStyles.colors.text}
                    onChange={(e) => handleGlobalStyleChange('colors', 'text', e.target.value)}
                    className="h-10 w-16 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={theme.globalStyles.colors.text}
                    onChange={(e) => handleGlobalStyleChange('colors', 'text', e.target.value)}
                    className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
                  />
                </div>
              </div>

              {/* Background Color */}
              <div>
                <label className="block text-sm font-medium mb-1">Background Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={theme.globalStyles.colors.background}
                    onChange={(e) => handleGlobalStyleChange('colors', 'background', e.target.value)}
                    className="h-10 w-16 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={theme.globalStyles.colors.background}
                    onChange={(e) => handleGlobalStyleChange('colors', 'background', e.target.value)}
                    className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
                  />
                </div>
              </div>

              <h3 className="font-semibold text-sm text-gray-700 border-b pb-2 mt-6">Section Backgrounds</h3>

              {/* Header Background Color */}
              <div>
                <label className="block text-sm font-medium mb-1">Header Background</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={theme.globalStyles.colors.headerBackground}
                    onChange={(e) => handleGlobalStyleChange('colors', 'headerBackground', e.target.value)}
                    className="h-10 w-16 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={theme.globalStyles.colors.headerBackground}
                    onChange={(e) => handleGlobalStyleChange('colors', 'headerBackground', e.target.value)}
                    className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
                  />
                </div>
              </div>

              {/* Body Background Color */}
              <div>
                <label className="block text-sm font-medium mb-1">Body Background</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={theme.globalStyles.colors.bodyBackground}
                    onChange={(e) => handleGlobalStyleChange('colors', 'bodyBackground', e.target.value)}
                    className="h-10 w-16 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={theme.globalStyles.colors.bodyBackground}
                    onChange={(e) => handleGlobalStyleChange('colors', 'bodyBackground', e.target.value)}
                    className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
                  />
                </div>
              </div>

              {/* Footer Background Color */}
              <div>
                <label className="block text-sm font-medium mb-1">Footer Background</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={theme.globalStyles.colors.footerBackground}
                    onChange={(e) => handleGlobalStyleChange('colors', 'footerBackground', e.target.value)}
                    className="h-10 w-16 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={theme.globalStyles.colors.footerBackground}
                    onChange={(e) => handleGlobalStyleChange('colors', 'footerBackground', e.target.value)}
                    className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
                  />
                </div>
              </div>

              <h3 className="font-semibold text-sm text-gray-700 border-b pb-2 mt-6">Typography</h3>

              {/* Font Family */}
              <div>
                <label className="block text-sm font-medium mb-1">Font Family</label>
                <input
                  type="text"
                  value={theme.globalStyles.typography.fontFamily}
                  onChange={(e) => handleGlobalStyleChange('typography', 'fontFamily', e.target.value)}
                  className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                  placeholder="e.g., Inter, sans-serif"
                />
              </div>

              {/* Font Size */}
              <div>
                <label className="block text-sm font-medium mb-1">Base Font Size</label>
                <input
                  type="text"
                  value={theme.globalStyles.typography.fontSize}
                  onChange={(e) => handleGlobalStyleChange('typography', 'fontSize', e.target.value)}
                  className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                  placeholder="e.g., 16px"
                />
              </div>

              {/* Font Weight */}
              <div>
                <label className="block text-sm font-medium mb-1">Base Font Weight</label>
                <input
                  type="text"
                  value={theme.globalStyles.typography.fontWeight}
                  onChange={(e) => handleGlobalStyleChange('typography', 'fontWeight', e.target.value)}
                  className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                  placeholder="e.g., 400"
                />
              </div>

              {/* Line Height */}
              <div>
                <label className="block text-sm font-medium mb-1">Line Height</label>
                <input
                  type="text"
                  value={theme.globalStyles.typography.lineHeight}
                  onChange={(e) => handleGlobalStyleChange('typography', 'lineHeight', e.target.value)}
                  className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                  placeholder="e.g., 1.5"
                />
              </div>
            </div>
          </>
        ) : (
          // Component Styles Editor
          <>
            {/* Component Selector */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Component</label>
              <select
                value={selectedComponent}
                onChange={(e) => onComponentChange(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2"
              >
                {Object.keys(theme.componentStyles).map((componentType) => (
                  <option key={componentType} value={componentType}>
                    {componentType}
                  </option>
                ))}
              </select>
            </div>

            {/* Variant Selector */}
            {availableVariants.length > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Variant</label>
                <select
                  value={selectedVariant}
                  onChange={(e) => onVariantChange(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  {availableVariants.map((variant) => (
                    <option key={variant} value={variant}>
                      {variant.charAt(0).toUpperCase() + variant.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Dynamic Style Properties */}
            {currentStyles && (
              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-gray-700 border-b pb-2">
                  {selectedComponent} Styles
                </h3>
                {Object.entries(currentStyles).map(([property, value]) =>
                  renderStyleInput(property, value)
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
