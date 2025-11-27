import { useState } from 'react';
import { useVisualBuilderStore } from '../store/visualBuilderStore';

export default function VisualStylePanel() {
  const { selectedComponentId, components, updateComponent } = useVisualBuilderStore();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    content: true,
    container: true,
    title: false,
    subtitle: false,
    button: false,
    columns: true,
    columnStyles: false,
    layout: true,
  });

  // Find the selected component
  const findComponent = (id: string | null, componentList: any[]): any => {
    if (!id) return null;
    for (const comp of componentList) {
      if (comp.id === id) return comp;
      if (comp.children) {
        const found = findComponent(id, comp.children);
        if (found) return found;
      }
    }
    return null;
  };

  const selectedComponent = findComponent(selectedComponentId, components);

  const handleStyleChange = (property: string, value: string) => {
    if (!selectedComponentId || !selectedComponent) return;

    const newStyles = { ...selectedComponent.customStyles };

    // If value is empty, remove the property entirely
    if (value === '') {
      delete newStyles[property];
    } else {
      newStyles[property] = value;
    }

    updateComponent(selectedComponentId, {
      customStyles: newStyles,
    });
  };

  const handlePropChange = (property: string, value: any) => {
    if (!selectedComponentId || !selectedComponent) return;

    updateComponent(selectedComponentId, {
      props: {
        ...selectedComponent.props,
        [property]: value,
      },
    });
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  if (!selectedComponent) {
    return (
      <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto h-full">
        <div className="p-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Properties</h2>
          <div className="text-center text-gray-500 py-8">
            <svg
              className="mx-auto h-12 w-12 mb-4 text-gray-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
              />
            </svg>
            <p className="text-sm">Select a component to edit</p>
          </div>
        </div>
      </div>
    );
  }

  const props = selectedComponent.props || {};
  const styles = selectedComponent.customStyles || {};

  const renderSection = (
    title: string,
    sectionKey: string,
    children: React.ReactNode
  ) => (
    <div className="border-b border-gray-200">
      <button
        onClick={() => toggleSection(sectionKey)}
        className="w-full px-4 py-3 flex items-center justify-between text-sm font-semibold text-gray-700 hover:bg-gray-50"
      >
        <span>{title}</span>
        <span className="text-gray-400">
          {expandedSections[sectionKey] ? '▼' : '▶'}
        </span>
      </button>
      {expandedSections[sectionKey] && (
        <div className="px-4 pb-4 space-y-3">
          {children}
        </div>
      )}
    </div>
  );

  // Fix: Use value from styles, allow empty string
  const renderColorInput = (label: string, property: string, placeholder: string) => (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <div className="flex gap-2">
        <input
          type="color"
          value={styles[property] || '#000000'}
          onChange={(e) => handleStyleChange(property, e.target.value)}
          className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
        />
        <input
          type="text"
          value={styles[property] !== undefined ? styles[property] : ''}
          onChange={(e) => handleStyleChange(property, e.target.value)}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );

  // Fix: Allow empty values - controlled input without default fallback
  const renderTextInput = (label: string, property: string, placeholder: string) => (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <input
        type="text"
        value={styles[property] !== undefined ? styles[property] : ''}
        onChange={(e) => handleStyleChange(property, e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );

  const renderSelectInput = (label: string, property: string, options: { value: string; label: string }[], placeholder: string) => (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <select
        value={styles[property] || ''}
        onChange={(e) => handleStyleChange(property, e.target.value)}
        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">{placeholder}</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );

  const fontWeightOptions = [
    { value: '300', label: 'Light (300)' },
    { value: '400', label: 'Normal (400)' },
    { value: '500', label: 'Medium (500)' },
    { value: '600', label: 'Semi Bold (600)' },
    { value: '700', label: 'Bold (700)' },
    { value: '800', label: 'Extra Bold (800)' },
  ];

  const textAlignOptions = [
    { value: 'left', label: 'Left' },
    { value: 'center', label: 'Center' },
    { value: 'right', label: 'Right' },
  ];

  const borderStyleOptions = [
    { value: 'none', label: 'None' },
    { value: 'solid', label: 'Solid' },
    { value: 'dashed', label: 'Dashed' },
    { value: 'dotted', label: 'Dotted' },
  ];

  return (
    <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto h-full">
      <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 z-10">
        <h2 className="text-lg font-semibold text-gray-800">Properties</h2>
        <p className="text-xs text-gray-500 mt-1">{selectedComponent.type}</p>
      </div>

      {/* Content Section - Only for HeroSection */}
      {selectedComponent.type === 'HeroSection' && renderSection('Content', 'content', (
        <>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Title Text</label>
            <input
              type="text"
              value={props.title || ''}
              onChange={(e) => handlePropChange('title', e.target.value)}
              placeholder="Enter title..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Subtitle Text</label>
            <textarea
              value={props.subtitle || ''}
              onChange={(e) => handlePropChange('subtitle', e.target.value)}
              placeholder="Enter subtitle..."
              rows={3}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Button Text</label>
            <input
              type="text"
              value={props.buttonText || ''}
              onChange={(e) => handlePropChange('buttonText', e.target.value)}
              placeholder="Enter button text..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="showButton"
              checked={props.showButton !== false}
              onChange={(e) => handlePropChange('showButton', e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
            <label htmlFor="showButton" className="text-xs font-medium text-gray-600">Show Button</label>
          </div>
        </>
      ))}

      {/* Container Styles - Only for HeroSection */}
      {selectedComponent.type === 'HeroSection' && renderSection('Container', 'container', (
        <>
          {renderColorInput('Background Color', 'backgroundColor', '#1a1a2e')}

          {/* Background Image Controls */}
          <div className="pt-2 border-t border-gray-100">
            <p className="text-xs font-medium text-gray-500 mb-2">Background Image</p>
            {renderTextInput('Image URL', 'backgroundImage', 'https://example.com/image.jpg')}
            {renderSelectInput('Size', 'backgroundSize', [
              { value: 'cover', label: 'Cover' },
              { value: 'contain', label: 'Contain' },
              { value: 'auto', label: 'Auto' },
              { value: '100% 100%', label: 'Stretch' },
            ], 'Select size')}
            {renderSelectInput('Position', 'backgroundPosition', [
              { value: 'center', label: 'Center' },
              { value: 'top', label: 'Top' },
              { value: 'bottom', label: 'Bottom' },
              { value: 'left', label: 'Left' },
              { value: 'right', label: 'Right' },
              { value: 'top left', label: 'Top Left' },
              { value: 'top right', label: 'Top Right' },
              { value: 'bottom left', label: 'Bottom Left' },
              { value: 'bottom right', label: 'Bottom Right' },
            ], 'Select position')}
            {renderSelectInput('Repeat', 'backgroundRepeat', [
              { value: 'no-repeat', label: 'No Repeat' },
              { value: 'repeat', label: 'Repeat' },
              { value: 'repeat-x', label: 'Repeat X' },
              { value: 'repeat-y', label: 'Repeat Y' },
            ], 'Select repeat')}
          </div>

          {renderTextInput('Width', 'width', 'e.g., 100%, 800px, auto')}
          {renderTextInput('Max Width', 'maxWidth', 'e.g., 1200px')}
          {renderSelectInput('Container Align', 'containerAlign', [
            { value: 'left', label: 'Left' },
            { value: 'center', label: 'Center' },
            { value: 'right', label: 'Right' },
          ], 'Select position')}
          {renderTextInput('Min Height', 'minHeight', 'e.g., 400px')}
          {renderTextInput('Padding', 'padding', 'e.g., 80px 40px')}
          {renderTextInput('Margin', 'margin', 'e.g., 20px, 0 auto')}
          {renderSelectInput('Text Align', 'textAlign', textAlignOptions, 'Select alignment')}

          {/* Border Controls */}
          <div className="pt-2 border-t border-gray-100">
            <p className="text-xs font-medium text-gray-500 mb-2">Border</p>
            {renderTextInput('Border Width', 'borderWidth', 'e.g., 1px, 2px')}
            {renderSelectInput('Border Style', 'borderStyle', borderStyleOptions, 'Select style')}
            {renderColorInput('Border Color', 'borderColor', '#cccccc')}
            {renderTextInput('Border Radius', 'borderRadius', 'e.g., 8px, 16px')}
          </div>
        </>
      ))}

      {/* Title Styles - Only for HeroSection */}
      {selectedComponent.type === 'HeroSection' && renderSection('Title Styles', 'title', (
        <>
          {renderColorInput('Color', 'titleColor', '#ffffff')}
          {renderTextInput('Font Size', 'titleFontSize', 'e.g., 48px, 3rem')}
          {renderSelectInput('Font Weight', 'titleFontWeight', fontWeightOptions, 'Select weight')}
          {renderTextInput('Margin Bottom', 'titleMarginBottom', 'e.g., 20px')}
          {renderTextInput('Max Width', 'titleMaxWidth', 'e.g., 600px')}
        </>
      ))}

      {/* Subtitle Styles - Only for HeroSection */}
      {selectedComponent.type === 'HeroSection' && renderSection('Subtitle Styles', 'subtitle', (
        <>
          {renderColorInput('Color', 'subtitleColor', '#cccccc')}
          {renderTextInput('Font Size', 'subtitleFontSize', 'e.g., 18px, 1.125rem')}
          {renderSelectInput('Font Weight', 'subtitleFontWeight', fontWeightOptions, 'Select weight')}
          {renderTextInput('Margin Bottom', 'subtitleMarginBottom', 'e.g., 30px')}
          {renderTextInput('Max Width', 'subtitleMaxWidth', 'e.g., 600px')}
        </>
      ))}

      {/* Button Styles - Only for HeroSection */}
      {selectedComponent.type === 'HeroSection' && renderSection('Button Styles', 'button', (
        <>
          {renderColorInput('Background', 'buttonBackgroundColor', '#4f46e5')}
          {renderColorInput('Text Color', 'buttonTextColor', '#ffffff')}
          {renderTextInput('Padding', 'buttonPadding', 'e.g., 12px 32px')}
          {renderTextInput('Border Radius', 'buttonBorderRadius', 'e.g., 8px')}
          {renderTextInput('Font Size', 'buttonFontSize', 'e.g., 16px')}
          {renderSelectInput('Font Weight', 'buttonFontWeight', fontWeightOptions, 'Select weight')}

          {/* Button Border */}
          <div className="pt-2 border-t border-gray-100">
            <p className="text-xs font-medium text-gray-500 mb-2">Button Border</p>
            {renderTextInput('Border Width', 'buttonBorderWidth', 'e.g., 1px, 2px')}
            {renderSelectInput('Border Style', 'buttonBorderStyle', borderStyleOptions, 'Select style')}
            {renderColorInput('Border Color', 'buttonBorderColor', '#4f46e5')}
          </div>
        </>
      ))}

      {/* Row/Grid Columns - Only for Row */}
      {selectedComponent.type === 'Row' && renderSection('Columns', 'columns', (
        <>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Number of Columns</label>
            <select
              value={props.columns || 2}
              onChange={(e) => {
                const newColumns = parseInt(e.target.value);
                const currentWidths = props.columnWidths || [];
                const newWidths = Array.from({ length: newColumns }, (_, i) =>
                  currentWidths[i] || `${Math.floor(100 / newColumns)}%`
                );
                handlePropChange('columns', newColumns);
                handlePropChange('columnWidths', newWidths);
              }}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {[1, 2, 3, 4, 5, 6].map(n => (
                <option key={n} value={n}>{n} Column{n > 1 ? 's' : ''}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-600">Column Widths</label>
            {Array.from({ length: props.columns || 2 }).map((_, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="text-xs text-gray-500 w-6">{index + 1}:</span>
                <input
                  type="text"
                  value={(props.columnWidths || [])[index] || ''}
                  onChange={(e) => {
                    const newWidths = [...(props.columnWidths || [])];
                    newWidths[index] = e.target.value;
                    handlePropChange('columnWidths', newWidths);
                  }}
                  placeholder={`e.g., ${Math.floor(100 / (props.columns || 2))}%, 200px, 1fr`}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}
            <p className="text-xs text-gray-400">Use %, px, or fr units</p>
          </div>

          <button
            onClick={() => {
              const columns = props.columns || 2;
              const equalWidth = `${Math.floor(100 / columns)}%`;
              handlePropChange('columnWidths', Array(columns).fill(equalWidth));
            }}
            className="w-full px-3 py-2 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
          >
            Reset to Equal Widths
          </button>
        </>
      ))}

      {/* Column Styles - Only for Row */}
      {selectedComponent.type === 'Row' && renderSection('Column Styles', 'columnStyles', (
        <>
          {Array.from({ length: props.columns || 2 }).map((_, colIndex) => {
            const columnStyles = props.columnStyles || [];
            const colStyle = columnStyles[colIndex] || {};

            const updateColumnStyle = (property: string, value: string) => {
              const newColumnStyles = [...(props.columnStyles || [])];
              // Ensure array has enough elements
              while (newColumnStyles.length <= colIndex) {
                newColumnStyles.push({});
              }
              if (value === '') {
                delete newColumnStyles[colIndex][property];
              } else {
                newColumnStyles[colIndex] = {
                  ...newColumnStyles[colIndex],
                  [property]: value,
                };
              }
              handlePropChange('columnStyles', newColumnStyles);
            };

            return (
              <div key={colIndex} className="mb-4 pb-4 border-b border-gray-100 last:border-b-0">
                <p className="text-xs font-semibold text-gray-700 mb-2">Column {colIndex + 1}</p>
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Background</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={colStyle.backgroundColor || '#ffffff'}
                        onChange={(e) => updateColumnStyle('backgroundColor', e.target.value)}
                        className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={colStyle.backgroundColor || ''}
                        onChange={(e) => updateColumnStyle('backgroundColor', e.target.value)}
                        placeholder="#ffffff"
                        className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Padding</label>
                    <input
                      type="text"
                      value={colStyle.padding || ''}
                      onChange={(e) => updateColumnStyle('padding', e.target.value)}
                      placeholder="e.g., 10px, 1rem"
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Border Radius</label>
                    <input
                      type="text"
                      value={colStyle.borderRadius || ''}
                      onChange={(e) => updateColumnStyle('borderRadius', e.target.value)}
                      placeholder="e.g., 4px, 8px"
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Border Width</label>
                      <input
                        type="text"
                        value={colStyle.borderWidth || ''}
                        onChange={(e) => updateColumnStyle('borderWidth', e.target.value)}
                        placeholder="e.g., 1px"
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Border Style</label>
                      <select
                        value={colStyle.borderStyle || ''}
                        onChange={(e) => updateColumnStyle('borderStyle', e.target.value)}
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">None</option>
                        <option value="solid">Solid</option>
                        <option value="dashed">Dashed</option>
                        <option value="dotted">Dotted</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Border Color</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={colStyle.borderColor || '#e5e7eb'}
                        onChange={(e) => updateColumnStyle('borderColor', e.target.value)}
                        className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={colStyle.borderColor || ''}
                        onChange={(e) => updateColumnStyle('borderColor', e.target.value)}
                        placeholder="#e5e7eb"
                        className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </>
      ))}

      {/* Row Layout Styles - Only for Row */}
      {selectedComponent.type === 'Row' && renderSection('Layout', 'layout', (
        <>
          {renderTextInput('Gap', 'gap', 'e.g., 20px, 1rem')}
          {renderSelectInput('Vertical Align', 'alignItems', [
            { value: 'flex-start', label: 'Top' },
            { value: 'center', label: 'Center' },
            { value: 'flex-end', label: 'Bottom' },
            { value: 'stretch', label: 'Stretch' },
          ], 'Select alignment')}
          {renderSelectInput('Horizontal Align', 'justifyContent', [
            { value: 'flex-start', label: 'Start' },
            { value: 'center', label: 'Center' },
            { value: 'flex-end', label: 'End' },
            { value: 'space-between', label: 'Space Between' },
            { value: 'space-around', label: 'Space Around' },
          ], 'Select alignment')}
          {renderColorInput('Background Color', 'backgroundColor', '#ffffff')}
          {renderTextInput('Padding', 'padding', 'e.g., 20px, 1rem')}
          {renderTextInput('Width', 'width', 'e.g., 100%, 800px')}
          {renderTextInput('Max Width', 'maxWidth', 'e.g., 1200px')}
          {renderTextInput('Min Height', 'minHeight', 'e.g., 200px')}
          {renderTextInput('Margin', 'margin', 'e.g., 20px, 0 auto')}

          {/* Border Controls */}
          <div className="pt-2 border-t border-gray-100">
            <p className="text-xs font-medium text-gray-500 mb-2">Border</p>
            {renderTextInput('Border Width', 'borderWidth', 'e.g., 1px, 2px')}
            {renderSelectInput('Border Style', 'borderStyle', borderStyleOptions, 'Select style')}
            {renderColorInput('Border Color', 'borderColor', '#cccccc')}
            {renderTextInput('Border Radius', 'borderRadius', 'e.g., 8px')}
          </div>
        </>
      ))}
    </div>
  );
}
