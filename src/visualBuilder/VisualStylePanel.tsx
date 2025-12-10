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
    // Header sections
    headerContent: true,
    headerContainer: true,
    headerLogo: false,
    headerNav: false,
    // Image sections
    imageContent: true,
    imageStyles: true,
    // New component sections
    linkListContent: true,
    linkListStyles: false,
    iconBoxContent: true,
    iconBoxStyles: false,
    textContent: true,
    textStyles: false,
    buttonContent: true,
    buttonStyles: false,
    dividerStyles: true,
    footerContent: true,
    footerStyles: false,
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

      {/* Header Content Section */}
      {selectedComponent.type === 'Header' && renderSection('Content', 'headerContent', (
        <>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Logo Text</label>
            <input
              type="text"
              value={props.logoText || ''}
              onChange={(e) => handlePropChange('logoText', e.target.value)}
              placeholder="Enter logo text..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Logo Image URL</label>
            <input
              type="text"
              value={props.logoImageUrl || ''}
              onChange={(e) => handlePropChange('logoImageUrl', e.target.value)}
              placeholder="https://example.com/logo.png"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-400 mt-1">If set, image will be used instead of text</p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="showLogo"
              checked={props.showLogo !== false}
              onChange={(e) => handlePropChange('showLogo', e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
            <label htmlFor="showLogo" className="text-xs font-medium text-gray-600">Show Logo</label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="showNavLinks"
              checked={props.showNavLinks !== false}
              onChange={(e) => handlePropChange('showNavLinks', e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
            <label htmlFor="showNavLinks" className="text-xs font-medium text-gray-600">Show Navigation Links</label>
          </div>

          {/* Navigation Links Editor */}
          <div className="pt-2 border-t border-gray-100">
            <label className="block text-xs font-medium text-gray-600 mb-2">Navigation Links</label>
            {(props.navLinks || []).map((link: { text: string; url: string }, index: number) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={link.text}
                  onChange={(e) => {
                    const newLinks = [...(props.navLinks || [])];
                    newLinks[index] = { ...newLinks[index], text: e.target.value };
                    handlePropChange('navLinks', newLinks);
                  }}
                  placeholder="Link text"
                  className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  value={link.url}
                  onChange={(e) => {
                    const newLinks = [...(props.navLinks || [])];
                    newLinks[index] = { ...newLinks[index], url: e.target.value };
                    handlePropChange('navLinks', newLinks);
                  }}
                  placeholder="URL"
                  className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => {
                    const newLinks = (props.navLinks || []).filter((_: any, i: number) => i !== index);
                    handlePropChange('navLinks', newLinks);
                  }}
                  className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded hover:bg-red-200"
                >
                  ×
                </button>
              </div>
            ))}
            <button
              onClick={() => {
                const newLinks = [...(props.navLinks || []), { text: 'New Link', url: '#' }];
                handlePropChange('navLinks', newLinks);
              }}
              className="w-full px-3 py-2 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
            >
              + Add Link
            </button>
          </div>

          {/* Divider & Language Selector */}
          <div className="pt-2 border-t border-gray-100">
            <p className="text-xs font-medium text-gray-500 mb-2">Divider & Language</p>
            <div className="flex items-center gap-2 mb-2">
              <input
                type="checkbox"
                id="showNavDivider"
                checked={props.showNavDivider || false}
                onChange={(e) => handlePropChange('showNavDivider', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <label htmlFor="showNavDivider" className="text-xs font-medium text-gray-600">Show Divider</label>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <input
                type="checkbox"
                id="showLanguageSelector"
                checked={props.showLanguageSelector || false}
                onChange={(e) => handlePropChange('showLanguageSelector', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <label htmlFor="showLanguageSelector" className="text-xs font-medium text-gray-600">Show Language Selector</label>
            </div>

            {props.showLanguageSelector && (
              <>
                <div className="mb-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Selected Language</label>
                  <input
                    type="text"
                    value={props.selectedLanguage || 'EN'}
                    onChange={(e) => handlePropChange('selectedLanguage', e.target.value)}
                    placeholder="EN"
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Languages</label>
                {(props.languages || []).map((lang: { code: string; label: string }, index: number) => (
                  <div key={index} className="flex gap-2 mb-1">
                    <input
                      type="text"
                      value={lang.code}
                      onChange={(e) => {
                        const newLangs = [...(props.languages || [])];
                        newLangs[index] = { ...newLangs[index], code: e.target.value };
                        handlePropChange('languages', newLangs);
                      }}
                      placeholder="Code"
                      className="w-16 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      value={lang.label}
                      onChange={(e) => {
                        const newLangs = [...(props.languages || [])];
                        newLangs[index] = { ...newLangs[index], label: e.target.value };
                        handlePropChange('languages', newLangs);
                      }}
                      placeholder="Label"
                      className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => {
                        const newLangs = (props.languages || []).filter((_: any, i: number) => i !== index);
                        handlePropChange('languages', newLangs);
                      }}
                      className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded hover:bg-red-200"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => {
                    const newLangs = [...(props.languages || []), { code: 'NEW', label: 'New Language' }];
                    handlePropChange('languages', newLangs);
                  }}
                  className="w-full px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 mt-1"
                >
                  + Add Language
                </button>
              </>
            )}
          </div>
        </>
      ))}

      {/* Header Container Section */}
      {selectedComponent.type === 'Header' && renderSection('Container', 'headerContainer', (
        <>
          {renderColorInput('Background Color', 'backgroundColor', '#ffffff')}
          {renderTextInput('Padding', 'padding', 'e.g., 16px 40px')}
          {renderTextInput('Width', 'width', 'e.g., 100%, 800px')}
          {renderTextInput('Max Width', 'maxWidth', 'e.g., 1200px')}
          {renderTextInput('Margin', 'margin', 'e.g., 0 auto')}
          {renderSelectInput('Justify Content', 'justifyContent', [
            { value: 'flex-start', label: 'Start' },
            { value: 'center', label: 'Center' },
            { value: 'flex-end', label: 'End' },
            { value: 'space-between', label: 'Space Between' },
            { value: 'space-around', label: 'Space Around' },
          ], 'Select alignment')}
          {renderSelectInput('Align Items', 'alignItems', [
            { value: 'flex-start', label: 'Top' },
            { value: 'center', label: 'Center' },
            { value: 'flex-end', label: 'Bottom' },
            { value: 'stretch', label: 'Stretch' },
          ], 'Select alignment')}

          {/* Border Controls */}
          <div className="pt-2 border-t border-gray-100">
            <p className="text-xs font-medium text-gray-500 mb-2">Border</p>
            {renderTextInput('Border Width', 'borderWidth', 'e.g., 1px')}
            {renderSelectInput('Border Style', 'borderStyle', borderStyleOptions, 'Select style')}
            {renderColorInput('Border Color', 'borderColor', '#e5e7eb')}
          </div>
        </>
      ))}

      {/* Header Logo Styles */}
      {selectedComponent.type === 'Header' && renderSection('Logo Styles', 'headerLogo', (
        <>
          {renderColorInput('Logo Color', 'logoColor', '#1a1a1a')}
          {renderTextInput('Logo Font Size', 'logoFontSize', 'e.g., 24px')}
          {renderSelectInput('Logo Font Weight', 'logoFontWeight', fontWeightOptions, 'Select weight')}
          {renderTextInput('Logo Image Height', 'logoHeight', 'e.g., 32px, 40px')}
        </>
      ))}

      {/* Header Nav Link Styles */}
      {selectedComponent.type === 'Header' && renderSection('Navigation Styles', 'headerNav', (
        <>
          {renderColorInput('Link Color', 'navLinkColor', '#1a1a1a')}
          {renderTextInput('Link Font Size', 'navLinkFontSize', 'e.g., 14px')}
          {renderSelectInput('Link Font Weight', 'navLinkFontWeight', fontWeightOptions, 'Select weight')}
          {renderTextInput('Link Gap', 'navLinkGap', 'e.g., 32px, 2rem')}

          {/* Divider Styles */}
          <div className="pt-2 border-t border-gray-100">
            <p className="text-xs font-medium text-gray-500 mb-2">Divider</p>
            {renderColorInput('Divider Color', 'navDividerColor', '#cccccc')}
            {renderTextInput('Divider Height', 'navDividerHeight', 'e.g., 20px')}
            {renderTextInput('Divider Margin', 'navDividerMargin', 'e.g., 0 8px')}
          </div>
        </>
      ))}

      {/* Image Content Section */}
      {selectedComponent.type === 'Image' && renderSection('Content', 'imageContent', (
        <>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Image URL</label>
            <input
              type="text"
              value={props.src || ''}
              onChange={(e) => handlePropChange('src', e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Alt Text</label>
            <input
              type="text"
              value={props.alt || ''}
              onChange={(e) => handlePropChange('alt', e.target.value)}
              placeholder="Image description for accessibility"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="pt-2 border-t border-gray-100">
            <p className="text-xs font-medium text-gray-500 mb-2">Link Settings</p>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Link URL (optional)</label>
              <input
                type="text"
                value={props.linkUrl || ''}
                onChange={(e) => handlePropChange('linkUrl', e.target.value)}
                placeholder="https://example.com"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                id="openInNewTab"
                checked={props.openInNewTab || false}
                onChange={(e) => handlePropChange('openInNewTab', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <label htmlFor="openInNewTab" className="text-xs font-medium text-gray-600">Open in new tab</label>
            </div>
          </div>
        </>
      ))}

      {/* Image Styles Section */}
      {selectedComponent.type === 'Image' && renderSection('Styles', 'imageStyles', (
        <>
          {renderTextInput('Width', 'width', 'e.g., 100%, 300px, auto')}
          {renderTextInput('Max Width', 'maxWidth', 'e.g., 500px')}
          {renderTextInput('Height', 'height', 'e.g., auto, 200px')}
          {renderSelectInput('Object Fit', 'objectFit', [
            { value: 'cover', label: 'Cover' },
            { value: 'contain', label: 'Contain' },
            { value: 'fill', label: 'Fill' },
            { value: 'none', label: 'None' },
            { value: 'scale-down', label: 'Scale Down' },
          ], 'Select fit')}
          {renderTextInput('Border Radius', 'borderRadius', 'e.g., 8px, 50%')}
          {renderTextInput('Margin', 'margin', 'e.g., 0 auto, 10px')}

          {/* Border Controls */}
          <div className="pt-2 border-t border-gray-100">
            <p className="text-xs font-medium text-gray-500 mb-2">Border</p>
            {renderTextInput('Border Width', 'borderWidth', 'e.g., 1px, 2px')}
            {renderSelectInput('Border Style', 'borderStyle', borderStyleOptions, 'Select style')}
            {renderColorInput('Border Color', 'borderColor', '#cccccc')}
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
                // Update both columns and columnWidths in a single call
                updateComponent(selectedComponentId!, {
                  props: {
                    ...selectedComponent.props,
                    columns: newColumns,
                    columnWidths: newWidths,
                  },
                });
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

          {/* Mobile Column Widths */}
          <div className="pt-3 mt-3 border-t border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-medium text-gray-600">Mobile Column Widths</label>
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">📱</span>
            </div>
            <p className="text-xs text-gray-400 mb-2">Override widths for mobile/tablet views</p>
            {Array.from({ length: props.columns || 2 }).map((_, index) => (
              <div key={index} className="flex items-center gap-2 mb-2">
                <span className="text-xs text-gray-500 w-6">{index + 1}:</span>
                <input
                  type="text"
                  value={(props.mobileColumnWidths || [])[index] || ''}
                  onChange={(e) => {
                    const newWidths = [...(props.mobileColumnWidths || [])];
                    newWidths[index] = e.target.value;
                    handlePropChange('mobileColumnWidths', newWidths);
                  }}
                  placeholder="e.g., 100%"
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}
            <button
              onClick={() => {
                const columns = props.columns || 2;
                handlePropChange('mobileColumnWidths', Array(columns).fill('100%'));
              }}
              className="w-full px-3 py-2 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
            >
              Set All to 100% (Stack)
            </button>
          </div>
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

      {/* LinkList Content */}
      {selectedComponent.type === 'LinkList' && renderSection('Content', 'linkListContent', (
        <>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Label</label>
            <input
              type="text"
              value={props.label || ''}
              onChange={(e) => handlePropChange('label', e.target.value)}
              placeholder="Section label..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Layout</label>
            <select
              value={props.layout || 'vertical'}
              onChange={(e) => handlePropChange('layout', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="vertical">Vertical</option>
              <option value="horizontal">Horizontal</option>
            </select>
          </div>

          <div className="pt-2 border-t border-gray-100">
            <label className="block text-xs font-medium text-gray-600 mb-2">Links</label>
            {(props.links || []).map((link: { text: string; url: string }, index: number) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={link.text}
                  onChange={(e) => {
                    const newLinks = [...(props.links || [])];
                    newLinks[index] = { ...newLinks[index], text: e.target.value };
                    handlePropChange('links', newLinks);
                  }}
                  placeholder="Link text"
                  className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  value={link.url}
                  onChange={(e) => {
                    const newLinks = [...(props.links || [])];
                    newLinks[index] = { ...newLinks[index], url: e.target.value };
                    handlePropChange('links', newLinks);
                  }}
                  placeholder="URL"
                  className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => {
                    const newLinks = (props.links || []).filter((_: any, i: number) => i !== index);
                    handlePropChange('links', newLinks);
                  }}
                  className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded hover:bg-red-200"
                >
                  ×
                </button>
              </div>
            ))}
            <button
              onClick={() => {
                const newLinks = [...(props.links || []), { text: 'New Link', url: '#' }];
                handlePropChange('links', newLinks);
              }}
              className="w-full px-3 py-2 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
            >
              + Add Link
            </button>
          </div>
        </>
      ))}

      {/* LinkList Styles */}
      {selectedComponent.type === 'LinkList' && renderSection('Styles', 'linkListStyles', (
        <>
          {renderColorInput('Label Color', 'labelColor', '#ffffff')}
          {renderTextInput('Label Font Size', 'labelFontSize', 'e.g., 14px')}
          {renderSelectInput('Label Font Weight', 'labelFontWeight', fontWeightOptions, 'Select weight')}
          {renderTextInput('Label Margin Bottom', 'labelMarginBottom', 'e.g., 12px')}
          {renderColorInput('Link Color', 'itemColor', 'rgba(255,255,255,0.7)')}
          {renderTextInput('Link Font Size', 'itemFontSize', 'e.g., 13px')}
          {renderTextInput('Link Gap', 'itemGap', 'e.g., 8px')}
          {renderTextInput('Padding', 'padding', 'e.g., 20px')}
          {renderColorInput('Background', 'backgroundColor', 'transparent')}
        </>
      ))}

      {/* IconBox Content */}
      {selectedComponent.type === 'IconBox' && renderSection('Content', 'iconBoxContent', (
        <>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Icon (emoji)</label>
            <input
              type="text"
              value={props.icon || ''}
              onChange={(e) => handlePropChange('icon', e.target.value)}
              placeholder="🚀"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Icon Image URL</label>
            <input
              type="text"
              value={props.iconImageUrl || ''}
              onChange={(e) => handlePropChange('iconImageUrl', e.target.value)}
              placeholder="https://example.com/icon.png"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-400 mt-1">If set, image will be used instead of emoji</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Title</label>
            <input
              type="text"
              value={props.title || ''}
              onChange={(e) => handlePropChange('title', e.target.value)}
              placeholder="Feature Title"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
            <textarea
              value={props.description || ''}
              onChange={(e) => handlePropChange('description', e.target.value)}
              placeholder="Description text..."
              rows={3}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Layout</label>
            <select
              value={props.layout || 'top'}
              onChange={(e) => handlePropChange('layout', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="top">Icon on Top</option>
              <option value="left">Icon on Left</option>
              <option value="right">Icon on Right</option>
            </select>
          </div>
        </>
      ))}

      {/* IconBox Styles */}
      {selectedComponent.type === 'IconBox' && renderSection('Styles', 'iconBoxStyles', (
        <>
          {renderTextInput('Icon Size', 'iconSize', 'e.g., 48px, 64px')}
          {renderColorInput('Title Color', 'titleColor', '#1a1a2e')}
          {renderTextInput('Title Font Size', 'titleFontSize', 'e.g., 18px')}
          {renderSelectInput('Title Font Weight', 'titleFontWeight', fontWeightOptions, 'Select weight')}
          {renderTextInput('Title Margin Bottom', 'titleMarginBottom', 'e.g., 8px')}
          {renderColorInput('Description Color', 'descriptionColor', '#666666')}
          {renderTextInput('Description Font Size', 'descriptionFontSize', 'e.g., 14px')}
          {renderSelectInput('Text Align', 'textAlign', [
            { value: 'left', label: 'Left' },
            { value: 'center', label: 'Center' },
            { value: 'right', label: 'Right' },
          ], 'Select alignment')}
          {renderTextInput('Padding', 'padding', 'e.g., 20px')}
          {renderColorInput('Background', 'backgroundColor', 'transparent')}
          {renderTextInput('Border Radius', 'borderRadius', 'e.g., 8px')}
        </>
      ))}

      {/* Text Content */}
      {selectedComponent.type === 'Text' && renderSection('Content', 'textContent', (
        <>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Text Content</label>
            <textarea
              value={props.content || ''}
              onChange={(e) => handlePropChange('content', e.target.value)}
              placeholder="Enter your text..."
              rows={5}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-400 mt-1">Use line breaks for paragraphs</p>
          </div>
        </>
      ))}

      {/* Text Styles */}
      {selectedComponent.type === 'Text' && renderSection('Styles', 'textStyles', (
        <>
          {renderColorInput('Color', 'color', '#666666')}
          {renderTextInput('Font Size', 'fontSize', 'e.g., 16px')}
          {renderSelectInput('Font Weight', 'fontWeight', fontWeightOptions, 'Select weight')}
          {renderTextInput('Line Height', 'lineHeight', 'e.g., 1.6, 24px')}
          {renderSelectInput('Text Align', 'textAlign', [
            { value: 'left', label: 'Left' },
            { value: 'center', label: 'Center' },
            { value: 'right', label: 'Right' },
            { value: 'justify', label: 'Justify' },
          ], 'Select alignment')}
          {renderTextInput('Padding', 'padding', 'e.g., 20px')}
          {renderTextInput('Margin', 'margin', 'e.g., 0, 20px 0')}
        </>
      ))}

      {/* Button Content */}
      {selectedComponent.type === 'Button' && renderSection('Content', 'buttonContent', (
        <>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Button Text</label>
            <input
              type="text"
              value={props.text || ''}
              onChange={(e) => handlePropChange('text', e.target.value)}
              placeholder="Click Me"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Button Variant */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">Variant</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'primary', label: 'Primary', icon: '🔵' },
                { value: 'secondary', label: 'Secondary', icon: '⚪' },
                { value: 'outline', label: 'Outline', icon: '⭕' },
                { value: 'ghost', label: 'Ghost', icon: '👻' },
              ].map((variant) => (
                <button
                  key={variant.value}
                  onClick={() => handlePropChange('variant', variant.value)}
                  className={`px-3 py-2 text-xs rounded-lg border transition-all flex items-center justify-center gap-1.5 ${
                    (props.variant || 'primary') === variant.value
                      ? 'bg-blue-50 border-blue-300 text-blue-700 font-medium'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span>{variant.icon}</span>
                  {variant.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">URL</label>
            <input
              type="text"
              value={props.url || ''}
              onChange={(e) => handlePropChange('url', e.target.value)}
              placeholder="https://example.com"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="btnOpenInNewTab"
              checked={props.openInNewTab || false}
              onChange={(e) => handlePropChange('openInNewTab', e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
            <label htmlFor="btnOpenInNewTab" className="text-xs font-medium text-gray-600">Open in new tab</label>
          </div>
        </>
      ))}

      {/* Button Styles */}
      {selectedComponent.type === 'Button' && renderSection('Styles', 'buttonStyles', (
        <>
          {renderColorInput('Background Color', 'backgroundColor', '#4f46e5')}
          {renderColorInput('Text Color', 'textColor', '#ffffff')}
          {renderTextInput('Padding', 'padding', 'e.g., 12px 28px')}
          {renderTextInput('Border Radius', 'borderRadius', 'e.g., 8px')}
          {renderTextInput('Font Size', 'fontSize', 'e.g., 15px')}
          {renderSelectInput('Font Weight', 'fontWeight', fontWeightOptions, 'Select weight')}
          {renderTextInput('Width', 'width', 'e.g., auto, 100%')}
          {renderSelectInput('Alignment', 'textAlign', [
            { value: 'left', label: 'Left' },
            { value: 'center', label: 'Center' },
            { value: 'right', label: 'Right' },
          ], 'Select alignment')}
          <div className="pt-2 border-t border-gray-100">
            <p className="text-xs font-medium text-gray-500 mb-2">Border</p>
            {renderTextInput('Border Width', 'borderWidth', 'e.g., 1px, 2px')}
            {renderSelectInput('Border Style', 'borderStyle', borderStyleOptions, 'Select style')}
            {renderColorInput('Border Color', 'borderColor', '#4f46e5')}
          </div>
        </>
      ))}

      {/* Divider Styles */}
      {selectedComponent.type === 'Divider' && renderSection('Styles', 'dividerStyles', (
        <>
          <div className="flex items-center gap-2 mb-3">
            <input
              type="checkbox"
              id="showLine"
              checked={props.showLine !== false}
              onChange={(e) => handlePropChange('showLine', e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
            <label htmlFor="showLine" className="text-xs font-medium text-gray-600">Show Line</label>
          </div>
          {renderColorInput('Line Color', 'color', '#e5e7eb')}
          {renderTextInput('Line Height', 'height', 'e.g., 1px, 2px')}
          {renderTextInput('Margin', 'margin', 'e.g., 20px 0, 40px 0')}
          {renderTextInput('Width', 'width', 'e.g., 100%, 50%')}
        </>
      ))}

      {/* Footer Content */}
      {selectedComponent.type === 'Footer' && renderSection('Content', 'footerContent', (
        <>
          {(props.columns || []).map((col: { label: string; links: { text: string; url: string }[] }, colIndex: number) => (
            <div key={colIndex} className="mb-4 pb-4 border-b border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <input
                  type="text"
                  value={col.label}
                  onChange={(e) => {
                    const newColumns = [...(props.columns || [])];
                    newColumns[colIndex] = { ...newColumns[colIndex], label: e.target.value };
                    handlePropChange('columns', newColumns);
                  }}
                  placeholder="Column Label"
                  className="flex-1 px-2 py-1 text-xs font-semibold border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => {
                    const newColumns = (props.columns || []).filter((_: any, i: number) => i !== colIndex);
                    handlePropChange('columns', newColumns);
                  }}
                  className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-600 rounded hover:bg-red-200"
                >
                  ×
                </button>
              </div>
              {col.links.map((link, linkIndex) => (
                <div key={linkIndex} className="flex gap-1 mb-1">
                  <input
                    type="text"
                    value={link.text}
                    onChange={(e) => {
                      const newColumns = [...(props.columns || [])];
                      newColumns[colIndex].links[linkIndex] = { ...link, text: e.target.value };
                      handlePropChange('columns', newColumns);
                    }}
                    placeholder="Link text"
                    className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    value={link.url}
                    onChange={(e) => {
                      const newColumns = [...(props.columns || [])];
                      newColumns[colIndex].links[linkIndex] = { ...link, url: e.target.value };
                      handlePropChange('columns', newColumns);
                    }}
                    placeholder="URL"
                    className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => {
                      const newColumns = [...(props.columns || [])];
                      newColumns[colIndex].links = col.links.filter((_, i) => i !== linkIndex);
                      handlePropChange('columns', newColumns);
                    }}
                    className="px-1 text-xs text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                onClick={() => {
                  const newColumns = [...(props.columns || [])];
                  newColumns[colIndex].links = [...col.links, { text: 'New Link', url: '#' }];
                  handlePropChange('columns', newColumns);
                }}
                className="w-full mt-1 px-2 py-1 text-xs bg-gray-50 text-gray-600 rounded hover:bg-gray-100"
              >
                + Add Link
              </button>
            </div>
          ))}
          <button
            onClick={() => {
              const newColumns = [...(props.columns || []), { label: 'New Column', links: [] }];
              handlePropChange('columns', newColumns);
            }}
            className="w-full px-3 py-2 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
          >
            + Add Column
          </button>

          <div className="pt-4 border-t border-gray-100 mt-4">
            <label className="block text-xs font-medium text-gray-600 mb-1">Copyright Text</label>
            <input
              type="text"
              value={props.copyright || ''}
              onChange={(e) => handlePropChange('copyright', e.target.value)}
              placeholder="© 2024 Company Name"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                id="showCopyright"
                checked={props.showCopyright !== false}
                onChange={(e) => handlePropChange('showCopyright', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <label htmlFor="showCopyright" className="text-xs font-medium text-gray-600">Show Copyright</label>
            </div>
          </div>
        </>
      ))}

      {/* Footer Styles */}
      {selectedComponent.type === 'Footer' && renderSection('Styles', 'footerStyles', (
        <>
          {renderColorInput('Background Color', 'backgroundColor', '#1a2744')}
          {renderTextInput('Padding', 'padding', 'e.g., 50px 60px')}
          {renderTextInput('Column Gap', 'columnGap', 'e.g., 40px')}
          {renderColorInput('Label Color', 'labelColor', '#ffffff')}
          {renderTextInput('Label Font Size', 'labelFontSize', 'e.g., 14px')}
          {renderSelectInput('Label Font Weight', 'labelFontWeight', fontWeightOptions, 'Select weight')}
          {renderColorInput('Link Color', 'linkColor', 'rgba(255,255,255,0.7)')}
          {renderTextInput('Link Font Size', 'linkFontSize', 'e.g., 13px')}
          <div className="pt-2 border-t border-gray-100">
            <p className="text-xs font-medium text-gray-500 mb-2">Copyright Bar</p>
            {renderColorInput('Copyright Color', 'copyrightColor', 'rgba(255,255,255,0.5)')}
            {renderTextInput('Copyright Font Size', 'copyrightFontSize', 'e.g., 12px')}
            {renderTextInput('Copyright Padding', 'copyrightPadding', 'e.g., 20px 0 0 0')}
            {renderColorInput('Copyright Border Color', 'copyrightBorderColor', 'rgba(255,255,255,0.1)')}
          </div>
        </>
      ))}
    </div>
  );
}
