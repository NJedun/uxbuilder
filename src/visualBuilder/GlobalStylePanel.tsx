import { useState } from 'react';
import { useVisualBuilderStore, GlobalStyles } from '../store/visualBuilderStore';

export default function GlobalStylePanel({ onClose }: { onClose: () => void }) {
  const { globalStyles, updateGlobalStyles } = useVisualBuilderStore();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    header: true,
    logo: false,
    navLink: false,
    container: true,
    title: true,
    subtitle: true,
    button: true,
    link: false,
    layout: false,
  });

  const handleStyleChange = (property: keyof GlobalStyles, value: string) => {
    updateGlobalStyles({ [property]: value });
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

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

  const renderColorInput = (label: string, property: keyof GlobalStyles, placeholder: string) => (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <div className="flex gap-2">
        <input
          type="color"
          value={globalStyles[property] || '#000000'}
          onChange={(e) => handleStyleChange(property, e.target.value)}
          className="w-10 h-10 rounded border border-gray-300 cursor-pointer"
        />
        <input
          type="text"
          value={globalStyles[property] || ''}
          onChange={(e) => handleStyleChange(property, e.target.value)}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );

  const renderTextInput = (label: string, property: keyof GlobalStyles, placeholder: string) => (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <input
        type="text"
        value={globalStyles[property] || ''}
        onChange={(e) => handleStyleChange(property, e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );

  const renderSelectInput = (
    label: string,
    property: keyof GlobalStyles,
    options: { value: string; label: string }[],
    placeholder: string
  ) => (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <select
        value={globalStyles[property] || ''}
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-indigo-500 to-purple-600">
          <div>
            <h2 className="text-xl font-bold text-white">Global Styles</h2>
            <p className="text-sm text-indigo-100 mt-1">Default styles for all components</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Header Defaults */}
          {renderSection('Header Defaults', 'header', (
            <>
              {renderColorInput('Background Color', 'headerBackgroundColor', '#ffffff')}
              {renderTextInput('Padding', 'headerPadding', 'e.g., 16px 40px')}
              {renderTextInput('Max Width', 'headerMaxWidth', 'e.g., 1200px')}
              {renderSelectInput('Justify Content', 'headerJustifyContent', [
                { value: 'flex-start', label: 'Start' },
                { value: 'center', label: 'Center' },
                { value: 'flex-end', label: 'End' },
                { value: 'space-between', label: 'Space Between' },
                { value: 'space-around', label: 'Space Around' },
              ], 'Select alignment')}
              {renderSelectInput('Align Items', 'headerAlignItems', [
                { value: 'flex-start', label: 'Top' },
                { value: 'center', label: 'Center' },
                { value: 'flex-end', label: 'Bottom' },
                { value: 'stretch', label: 'Stretch' },
              ], 'Select alignment')}
              <div className="pt-2 border-t border-gray-100">
                <p className="text-xs font-medium text-gray-500 mb-2">Border</p>
                {renderTextInput('Border Width', 'headerBorderWidth', 'e.g., 1px')}
                {renderSelectInput('Border Style', 'headerBorderStyle', [
                  { value: 'none', label: 'None' },
                  { value: 'solid', label: 'Solid' },
                  { value: 'dashed', label: 'Dashed' },
                  { value: 'dotted', label: 'Dotted' },
                ], 'Select style')}
                {renderColorInput('Border Color', 'headerBorderColor', '#e5e7eb')}
              </div>
            </>
          ))}

          {/* Logo Defaults */}
          {renderSection('Logo Defaults', 'logo', (
            <>
              {renderColorInput('Color', 'logoColor', '#1a1a1a')}
              {renderTextInput('Font Size', 'logoFontSize', 'e.g., 24px')}
              {renderSelectInput('Font Weight', 'logoFontWeight', fontWeightOptions, 'Select weight')}
            </>
          ))}

          {/* Nav Link Defaults */}
          {renderSection('Navigation Link Defaults', 'navLink', (
            <>
              {renderColorInput('Color', 'navLinkColor', '#1a1a1a')}
              {renderTextInput('Font Size', 'navLinkFontSize', 'e.g., 14px')}
              {renderSelectInput('Font Weight', 'navLinkFontWeight', fontWeightOptions, 'Select weight')}
              {renderTextInput('Gap Between Links', 'navLinkGap', 'e.g., 32px')}
              {renderColorInput('Hover Color', 'navLinkHoverColor', '#4f46e5')}
            </>
          ))}

          {/* Container Defaults */}
          {renderSection('Container Defaults', 'container', (
            <>
              {renderColorInput('Background Color', 'containerBackgroundColor', '#1a1a2e')}
              {renderTextInput('Background Image URL', 'containerBackgroundImage', 'https://example.com/image.jpg')}
              {renderSelectInput('Background Size', 'containerBackgroundSize', [
                { value: 'cover', label: 'Cover' },
                { value: 'contain', label: 'Contain' },
                { value: 'auto', label: 'Auto' },
                { value: '100% 100%', label: 'Stretch' },
              ], 'Select size')}
              {renderSelectInput('Background Position', 'containerBackgroundPosition', [
                { value: 'center', label: 'Center' },
                { value: 'top', label: 'Top' },
                { value: 'bottom', label: 'Bottom' },
                { value: 'left', label: 'Left' },
                { value: 'right', label: 'Right' },
              ], 'Select position')}
              {renderTextInput('Padding', 'containerPadding', 'e.g., 60px 40px')}
              {renderTextInput('Border Radius', 'containerBorderRadius', 'e.g., 8px')}
            </>
          ))}

          {/* Title Defaults */}
          {renderSection('Title Defaults', 'title', (
            <>
              {renderColorInput('Color', 'titleColor', '#ffffff')}
              {renderTextInput('Font Size', 'titleFontSize', 'e.g., 42px')}
              {renderSelectInput('Font Weight', 'titleFontWeight', fontWeightOptions, 'Select weight')}
              {renderTextInput('Margin Bottom', 'titleMarginBottom', 'e.g., 20px')}
            </>
          ))}

          {/* Subtitle/Text Defaults */}
          {renderSection('Text Defaults', 'subtitle', (
            <>
              {renderColorInput('Color', 'subtitleColor', '#cccccc')}
              {renderTextInput('Font Size', 'subtitleFontSize', 'e.g., 16px')}
              {renderSelectInput('Font Weight', 'subtitleFontWeight', fontWeightOptions, 'Select weight')}
              {renderTextInput('Margin Bottom', 'subtitleMarginBottom', 'e.g., 24px')}
            </>
          ))}

          {/* Button Defaults */}
          {renderSection('Button Defaults', 'button', (
            <>
              {renderColorInput('Background Color', 'buttonBackgroundColor', '#4f46e5')}
              {renderColorInput('Text Color', 'buttonTextColor', '#ffffff')}
              {renderTextInput('Padding', 'buttonPadding', 'e.g., 12px 28px')}
              {renderTextInput('Border Radius', 'buttonBorderRadius', 'e.g., 8px')}
              {renderTextInput('Font Size', 'buttonFontSize', 'e.g., 15px')}
              {renderSelectInput('Font Weight', 'buttonFontWeight', fontWeightOptions, 'Select weight')}
            </>
          ))}

          {/* Link Defaults */}
          {renderSection('Link Defaults', 'link', (
            <>
              {renderColorInput('Color', 'linkColor', '#4f46e5')}
              {renderTextInput('Font Size', 'linkFontSize', 'e.g., 14px')}
              {renderSelectInput('Font Weight', 'linkFontWeight', fontWeightOptions, 'Select weight')}
              {renderSelectInput('Text Decoration', 'linkTextDecoration', [
                { value: 'none', label: 'None' },
                { value: 'underline', label: 'Underline' },
                { value: 'underline dotted', label: 'Dotted Underline' },
              ], 'Select decoration')}
              {renderColorInput('Hover Color', 'linkHoverColor', '#3730a3')}
            </>
          ))}

          {/* Layout Defaults */}
          {renderSection('Layout Defaults', 'layout', (
            <>
              {renderTextInput('Row Gap', 'rowGap', 'e.g., 20px')}
              {renderTextInput('Row Padding', 'rowPadding', 'e.g., 20px')}
              {renderColorInput('Row Background', 'rowBackgroundColor', 'transparent')}
              <div className="pt-2 border-t border-gray-100">
                <p className="text-xs font-medium text-gray-500 mb-2">Column Defaults</p>
                {renderColorInput('Column Background', 'columnBackgroundColor', 'transparent')}
                {renderTextInput('Column Padding', 'columnPadding', 'e.g., 16px')}
                {renderTextInput('Column Border Radius', 'columnBorderRadius', 'e.g., 8px')}
              </div>
            </>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
