import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useVisualBuilderStore, SeedProductRating, SeedProductAttribute, VisualComponent } from '../store/visualBuilderStore';
import { Layout } from '../types/layout';
import AIGenerateModal from './AIGenerateModal';

// Quick add component templates for Row columns
const quickAddTemplates: { type: string; label: string; icon: string; defaultProps: Record<string, any> }[] = [
  { type: 'Heading', label: 'Heading', icon: 'H', defaultProps: { text: 'Heading', level: 'h2' } },
  { type: 'Text', label: 'Text', icon: 'T', defaultProps: { text: 'Add your text here...' } },
  { type: 'Button', label: 'Button', icon: 'B', defaultProps: { text: 'Click Me', variant: 'primary' } },
  { type: 'Image', label: 'Image', icon: 'I', defaultProps: { src: '', alt: 'Image' } },
  { type: 'ImageBox', label: 'Image Box', icon: 'IB', defaultProps: { layout: 'top', icon: '', title: 'Title', description: '' } },
  { type: 'Divider', label: 'Divider', icon: '-', defaultProps: { orientation: 'horizontal' } },
];

interface VisualStylePanelProps {
  previewLayout?: Layout | null;
}

export default function VisualStylePanel({ previewLayout }: VisualStylePanelProps = {}) {
  const { selectedComponentId, components, sectionComponents, updateComponent, addComponent, selectedRowColumn, setSelectedRowColumn, selectComponent } = useVisualBuilderStore();
  // Use store state for column selection (shared with VisualComponentLibrary)
  const selectedColumn = selectedRowColumn;
  const setSelectedColumn = setSelectedRowColumn;
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
    // HeaderAllegiant sections
    headerAllegiantContent: true,
    headerAllegiantContainer: true,
    headerAllegiantLogo: false,
    headerAllegiantNav: false,
    headerAllegiantSearch: false,
    // Breadcrumb sections
    breadcrumbContent: true,
    breadcrumbStyles: false,
    // Image sections
    imageContent: true,
    imageStyles: true,
    // New component sections
    linkListContent: true,
    linkListStyles: false,
    iconBoxContent: true,
    iconBoxStyles: false,
    headingContent: true,
    headingStyles: false,
    textContent: true,
    textStyles: false,
    buttonContent: true,
    buttonStyles: false,
    dividerStyles: true,
    footerContent: true,
    footerStyles: false,
    // FooterAllegiant sections
    footerAllegiantContent: true,
    footerAllegiantContainer: true,
    footerAllegiantLogo: false,
    footerAllegiantLinks: false,
    footerAllegiantCopyright: false,
    // SeedProduct sections
    seedProductContent: true,
    seedProductRatings: true,
    seedProductAgronomics: false,
    seedProductFieldPerformance: false,
    seedProductDiseaseResistance: false,
    seedProductStyles: false,
    seedProductPdfUpload: true,
    // ProductGrid sections
    productGridContent: true,
    productGridLayout: true,
    productGridCardStyles: false,
    productGridTextStyles: false,
    productGridBadgeStyles: false,
    // AIChatWidget sections
    aiChatContent: true,
    aiChatAlignment: true,
    aiChatStyles: false,
    aiChatHeaderStyles: false,
    aiChatMessageStyles: false,
    aiChatInputStyles: false,
  });

  // PDF upload state
  const [isExtractingPdf, setIsExtractingPdf] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  // AI Generate from Image modal state
  const [showAIGenerateModal, setShowAIGenerateModal] = useState(false);

  // Find the selected component in a component tree
  const findInTree = (id: string, componentList: any[]): any => {
    for (const comp of componentList) {
      if (comp.id === id) return comp;
      if (comp.children) {
        const found = findInTree(id, comp.children);
        if (found) return found;
      }
    }
    return null;
  };

  // Find component across all sections and deprecated components array
  const findComponent = (id: string | null): any => {
    if (!id) return null;

    // Search in sectionComponents first
    for (const sectionId of Object.keys(sectionComponents)) {
      const found = findInTree(id, sectionComponents[sectionId]);
      if (found) return found;
    }

    // Fallback to deprecated components array
    return findInTree(id, components);
  };

  const selectedComponent = findComponent(selectedComponentId);

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

  // Convert PDF file to base64 image using canvas
  const pdfToImage = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const pdfData = e.target?.result as ArrayBuffer;
          // @ts-expect-error - pdfjsLib is loaded from CDN
          const pdfjsLib = window.pdfjsLib;
          if (!pdfjsLib) {
            reject(new Error('PDF.js library not loaded. Please refresh the page.'));
            return;
          }

          const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
          const page = await pdf.getPage(1);
          const scale = 2; // Higher quality
          const viewport = page.getViewport({ scale });

          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          await page.render({ canvasContext: context, viewport }).promise;
          const imageData = canvas.toDataURL('image/png');
          resolve(imageData);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsArrayBuffer(file);
    });
  };

  // Handle PDF upload and extraction for SeedProduct
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setPdfError('Please upload a PDF file');
      return;
    }

    if (!selectedComponentId || !selectedComponent) return;

    setIsExtractingPdf(true);
    setPdfError(null);

    try {
      // Convert PDF to image
      const pdfImage = await pdfToImage(file);

      // Send to AI extraction API
      const baseUrl = import.meta.env.DEV ? 'http://localhost:3001' : '';
      const response = await fetch(`${baseUrl}/api/ai`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'pdfExtract', pdfImage }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to extract data from PDF');
      }

      const data = await response.json();
      const extractedData = data.content;

      // Update the current SeedProduct component with extracted data
      updateComponent(selectedComponentId, {
        props: {
          ...selectedComponent.props,
          seedProductData: {
            productName: extractedData.productName || 'Product Name',
            description: extractedData.description || '',
            heroImage: selectedComponent.props?.seedProductData?.heroImage || '',
            ratings: extractedData.ratings || [],
            agronomics: extractedData.agronomics || [],
            fieldPerformance: extractedData.fieldPerformance || [],
            diseaseResistance: extractedData.diseaseResistance || [],
          },
        },
      });
    } catch (err: any) {
      setPdfError(err.message || 'Failed to process PDF');
    } finally {
      setIsExtractingPdf(false);
      // Reset file input
      if (pdfInputRef.current) {
        pdfInputRef.current.value = '';
      }
    }
  };

  if (!selectedComponent) {
    return (
      <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto h-full">
        <div className="p-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Properties</h2>

          {/* Layout Preview Info */}
          {previewLayout && (
            <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                </svg>
                <span className="font-semibold text-purple-800">Layout Preview</span>
              </div>
              <p className="text-sm text-purple-700 mb-1">
                <span className="font-medium">{previewLayout.name}</span>
              </p>
              <p className="text-xs text-purple-600 mb-4">
                Header and footer from this layout are shown in preview mode. They are read-only here.
              </p>
              <div className="space-y-2">
                <Link
                  to={`/layout-editor?edit=${previewLayout.rowKey}&project=${previewLayout.partitionKey}`}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Layout
                </Link>
                <Link
                  to="/layout-editor"
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-white text-purple-600 text-sm font-medium rounded-md border border-purple-300 hover:bg-purple-50 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create New Layout
                </Link>
              </div>
            </div>
          )}

          {/* AI Generate from Image */}
          <div className="mb-6">
            <button
              onClick={() => setShowAIGenerateModal(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all shadow-sm"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Generate from Image
            </button>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Upload a screenshot to generate components with AI
            </p>
          </div>

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

          {/* AI Generate Modal */}
          <AIGenerateModal
            isOpen={showAIGenerateModal}
            onClose={() => setShowAIGenerateModal(false)}
          />
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
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">Properties</h2>
          <button
            onClick={() => selectComponent(null)}
            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
            title="Close properties"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1">{selectedComponent.type}</p>
      </div>

      {/* Quick Add to Column - Only for Row (at the top for easy access) */}
      {selectedComponent.type === 'Row' && (
        <div className="px-4 py-3 bg-blue-50 border-b border-blue-200">
          <h3 className="text-sm font-semibold text-blue-800 mb-2">Quick Add to Column</h3>
          <div className="flex items-center gap-2 mb-3">
            <label className="text-xs font-medium text-blue-700">Column:</label>
            <div className="flex gap-1">
              {Array.from({ length: props.columns || 2 }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedColumn(i)}
                  className={`px-3 py-1 text-xs rounded font-medium transition-colors ${
                    selectedColumn === i
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-blue-600 border border-blue-300 hover:bg-blue-100'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {quickAddTemplates.map((template) => (
              <button
                key={template.type}
                onClick={() => {
                  const newComponent: VisualComponent = {
                    id: `${template.type.toLowerCase()}-${Date.now()}`,
                    type: template.type,
                    props: { ...template.defaultProps, columnIndex: selectedColumn },
                    customStyles: {},
                  };
                  addComponent(newComponent, selectedComponentId!);
                }}
                className="flex flex-col items-center gap-1 px-2 py-2 bg-white rounded border border-blue-200 hover:bg-blue-100 hover:border-blue-400 transition-colors"
                title={`Add ${template.label} to Column ${selectedColumn + 1}`}
              >
                <span className="text-lg">{template.icon}</span>
                <span className="text-xs text-gray-600">{template.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

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

      {/* HeaderAllegiant Content Section */}
      {selectedComponent.type === 'HeaderAllegiant' && renderSection('Content', 'headerAllegiantContent', (
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
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="showLogo"
              checked={props.showLogo !== false}
              onChange={(e) => handlePropChange('showLogo', e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded"
            />
            <label htmlFor="showLogo" className="text-xs text-gray-600">Show Logo</label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="showNavLinks"
              checked={props.showNavLinks !== false}
              onChange={(e) => handlePropChange('showNavLinks', e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded"
            />
            <label htmlFor="showNavLinks" className="text-xs text-gray-600">Show Navigation Links</label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="showSearch"
              checked={props.showSearch !== false}
              onChange={(e) => handlePropChange('showSearch', e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded"
            />
            <label htmlFor="showSearch" className="text-xs text-gray-600">Show Search Box</label>
          </div>

          {/* Search Navigation Settings */}
          {props.showSearch !== false && (
            <div className="pt-2 border-t border-gray-100">
              <p className="text-xs font-medium text-gray-500 mb-2">Search Navigation</p>
              <div className="mb-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Target URL</label>
                <input
                  type="text"
                  value={props.searchTargetUrl || ''}
                  onChange={(e) => handlePropChange('searchTargetUrl', e.target.value)}
                  placeholder="/preview/chat"
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                />
                <p className="text-xs text-gray-400 mt-1">URL to navigate when searching (leave empty to disable)</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Query Parameter</label>
                <input
                  type="text"
                  value={props.searchQueryParam || 'q'}
                  onChange={(e) => handlePropChange('searchQueryParam', e.target.value)}
                  placeholder="q"
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                />
                <p className="text-xs text-gray-400 mt-1">URL parameter name for the search query</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="showBreadcrumb"
              checked={props.showBreadcrumb === true}
              onChange={(e) => handlePropChange('showBreadcrumb', e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded"
            />
            <label htmlFor="showBreadcrumb" className="text-xs text-gray-600">Show Breadcrumb</label>
          </div>

          {/* Navigation Links Editor */}
          <div className="pt-2 border-t border-gray-100">
            <p className="text-xs font-medium text-gray-500 mb-2">Navigation Links</p>
            {(props.navLinks || []).map((link: { text: string; url: string; hasDropdown?: boolean }, index: number) => (
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
                  className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
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
                  className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
                />
                <button
                  onClick={() => {
                    const newLinks = (props.navLinks || []).filter((_: unknown, i: number) => i !== index);
                    handlePropChange('navLinks', newLinks);
                  }}
                  className="px-2 py-1 text-xs text-red-500 hover:bg-red-50 rounded"
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
              className="w-full px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded border border-blue-200"
            >
              + Add Link
            </button>
          </div>

          {/* Breadcrumb Editor */}
          {props.showBreadcrumb && (
            <div className="pt-2 border-t border-gray-100">
              <p className="text-xs font-medium text-gray-500 mb-2">Breadcrumb Items</p>
              {(props.breadcrumbItems || []).map((item: { text: string; url: string }, index: number) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={item.text}
                    onChange={(e) => {
                      const newItems = [...(props.breadcrumbItems || [])];
                      newItems[index] = { ...newItems[index], text: e.target.value };
                      handlePropChange('breadcrumbItems', newItems);
                    }}
                    placeholder="Text"
                    className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
                  />
                  <input
                    type="text"
                    value={item.url}
                    onChange={(e) => {
                      const newItems = [...(props.breadcrumbItems || [])];
                      newItems[index] = { ...newItems[index], url: e.target.value };
                      handlePropChange('breadcrumbItems', newItems);
                    }}
                    placeholder="URL"
                    className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
                  />
                  <button
                    onClick={() => {
                      const newItems = (props.breadcrumbItems || []).filter((_: unknown, i: number) => i !== index);
                      handlePropChange('breadcrumbItems', newItems);
                    }}
                    className="px-2 py-1 text-xs text-red-500 hover:bg-red-50 rounded"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                onClick={() => {
                  const newItems = [...(props.breadcrumbItems || []), { text: 'New Item', url: '#' }];
                  handlePropChange('breadcrumbItems', newItems);
                }}
                className="w-full px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded border border-blue-200"
              >
                + Add Breadcrumb
              </button>
              <div className="mt-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Separator</label>
                <input
                  type="text"
                  value={props.breadcrumbSeparator || '>'}
                  onChange={(e) => handlePropChange('breadcrumbSeparator', e.target.value)}
                  placeholder=">"
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                />
              </div>
            </div>
          )}
        </>
      ))}

      {/* HeaderAllegiant Container Section */}
      {selectedComponent.type === 'HeaderAllegiant' && renderSection('Container', 'headerAllegiantContainer', (
        <>
          {renderColorInput('Background Color', 'backgroundColor', '#ffffff')}
          {renderTextInput('Padding', 'padding', 'e.g., 16px 32px')}
          {renderTextInput('Width', 'width', 'e.g., 100%, 800px')}
          {renderTextInput('Max Width', 'maxWidth', 'e.g., 1400px')}
          {renderTextInput('Margin', 'margin', 'e.g., 0 auto')}
          <div className="pt-2 border-t border-gray-100 mt-2">
            <p className="text-xs font-medium text-gray-500 mb-2">Border Bottom</p>
            {renderTextInput('Border Bottom Width', 'borderBottomWidth', 'e.g., 1px')}
            {renderSelectInput('Border Bottom Style', 'borderBottomStyle', [
              { value: '', label: 'None' },
              { value: 'solid', label: 'Solid' },
              { value: 'dashed', label: 'Dashed' },
              { value: 'dotted', label: 'Dotted' },
            ], 'Select style')}
            {renderColorInput('Border Bottom Color', 'borderBottomColor', '#e5e7eb')}
          </div>
        </>
      ))}

      {/* HeaderAllegiant Logo Styles */}
      {selectedComponent.type === 'HeaderAllegiant' && renderSection('Logo Styles', 'headerAllegiantLogo', (
        <>
          {renderColorInput('Logo Color', 'logoColor', '#003087')}
          {renderTextInput('Logo Font Size', 'logoFontSize', 'e.g., 24px')}
          {renderSelectInput('Logo Font Weight', 'logoFontWeight', fontWeightOptions, 'Select weight')}
          {renderTextInput('Logo Image Height', 'logoHeight', 'e.g., 48px')}
        </>
      ))}

      {/* HeaderAllegiant Nav Link Styles */}
      {selectedComponent.type === 'HeaderAllegiant' && renderSection('Navigation Styles', 'headerAllegiantNav', (
        <>
          {renderColorInput('Link Color', 'navLinkColor', '#003087')}
          {renderColorInput('Link Hover Color', 'navLinkHoverColor', '#0066cc')}
          {renderTextInput('Link Font Size', 'navLinkFontSize', 'e.g., 15px')}
          {renderSelectInput('Link Font Weight', 'navLinkFontWeight', fontWeightOptions, 'Select weight')}
          {renderTextInput('Link Gap', 'navLinkGap', 'e.g., 32px')}
        </>
      ))}

      {/* HeaderAllegiant Search Styles */}
      {selectedComponent.type === 'HeaderAllegiant' && renderSection('Search Styles', 'headerAllegiantSearch', (
        <>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Search Placeholder</label>
            <input
              type="text"
              value={props.searchPlaceholder || 'Search'}
              onChange={(e) => handlePropChange('searchPlaceholder', e.target.value)}
              placeholder="Search"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {renderColorInput('Border Color', 'searchBorderColor', '#003087')}
          {renderTextInput('Border Radius', 'searchBorderRadius', 'e.g., 4px')}
          {renderColorInput('Background Color', 'searchBackgroundColor', '#ffffff')}
          {renderColorInput('Text Color', 'searchTextColor', '#333333')}
          {renderTextInput('Width', 'searchWidth', 'e.g., 180px')}
        </>
      ))}

      {/* Breadcrumb Content Section */}
      {selectedComponent.type === 'Breadcrumb' && renderSection('Content', 'breadcrumbContent', (
        <>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Separator</label>
            <input
              type="text"
              value={props.separator || '>'}
              onChange={(e) => handlePropChange('separator', e.target.value)}
              placeholder=">"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="showHomeIcon"
              checked={props.showHomeIcon || false}
              onChange={(e) => handlePropChange('showHomeIcon', e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
            <label htmlFor="showHomeIcon" className="text-xs font-medium text-gray-600">Show Home Icon</label>
          </div>
          <div className="pt-2 border-t border-gray-100">
            <label className="block text-xs font-medium text-gray-600 mb-2">Breadcrumb Items</label>
            {(props.items || []).map((item: { text: string; url: string }, index: number) => (
              <div key={index} className="mb-2 p-2 bg-gray-50 rounded">
                <input
                  type="text"
                  value={item.text}
                  onChange={(e) => {
                    const newItems = [...(props.items || [])];
                    newItems[index] = { ...newItems[index], text: e.target.value };
                    handlePropChange('items', newItems);
                  }}
                  placeholder="Item text"
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded mb-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <input
                  type="text"
                  value={item.url}
                  onChange={(e) => {
                    const newItems = [...(props.items || [])];
                    newItems[index] = { ...newItems[index], url: e.target.value };
                    handlePropChange('items', newItems);
                  }}
                  placeholder="URL"
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded mb-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  onClick={() => {
                    const newItems = (props.items || []).filter((_: any, i: number) => i !== index);
                    handlePropChange('items', newItems);
                  }}
                  className="text-xs text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              onClick={() => {
                const newItems = [...(props.items || []), { text: 'New Item', url: '#' }];
                handlePropChange('items', newItems);
              }}
              className="w-full px-3 py-1 text-xs text-blue-600 border border-blue-300 rounded hover:bg-blue-50"
            >
              + Add Item
            </button>
          </div>
        </>
      ))}

      {/* Breadcrumb Styles Section */}
      {selectedComponent.type === 'Breadcrumb' && renderSection('Styles', 'breadcrumbStyles', (
        <>
          {renderColorInput('Background Color', 'backgroundColor', '#f8fafc')}
          {renderTextInput('Padding', 'padding', 'e.g., 12px 32px')}
          {renderTextInput('Max Width', 'maxWidth', 'e.g., 1400px')}
          {renderTextInput('Margin', 'margin', 'e.g., 0 auto')}
          {renderColorInput('Text Color', 'textColor', '#374151')}
          {renderColorInput('Link Color', 'linkColor', '#003087')}
          {renderColorInput('Link Hover Color', 'linkHoverColor', '#0066cc')}
          {renderTextInput('Font Size', 'fontSize', 'e.g., 14px')}
          {renderSelectInput('Font Weight', 'fontWeight', fontWeightOptions, 'Select weight')}
          {renderColorInput('Separator Color', 'separatorColor', '#6b7280')}
          {renderTextInput('Border Top Width', 'borderTopWidth', 'e.g., 1px')}
          {renderColorInput('Border Top Color', 'borderTopColor', '#e5e7eb')}
          {renderTextInput('Border Bottom Width', 'borderBottomWidth', 'e.g., 1px')}
          {renderColorInput('Border Bottom Color', 'borderBottomColor', '#e5e7eb')}
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

      {/* ImageBox Content */}
      {selectedComponent.type === 'ImageBox' && renderSection('Content', 'iconBoxContent', (
        <>
          {/* Layout */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Layout</label>
            <select
              value={props.layout || 'top'}
              onChange={(e) => handlePropChange('layout', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="top">Image/Icon on Top</option>
              <option value="left">Image/Icon on Left</option>
              <option value="right">Image/Icon on Right</option>
            </select>
          </div>

          {/* Icon/Image */}
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
            <label className="block text-xs font-medium text-gray-600 mb-1">Image URL (overrides icon)</label>
            <input
              type="text"
              value={props.iconImageUrl || ''}
              onChange={(e) => handlePropChange('iconImageUrl', e.target.value)}
              placeholder="https://example.com/image.png"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-400 mt-1">If set, image will be used instead of emoji</p>
          </div>

          {/* Title */}
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

          {/* Description */}
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

          {/* Link */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Link Text</label>
            <input
              type="text"
              value={props.linkText || ''}
              onChange={(e) => handlePropChange('linkText', e.target.value)}
              placeholder="Learn more"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Link URL</label>
            <input
              type="text"
              value={props.linkUrl || ''}
              onChange={(e) => handlePropChange('linkUrl', e.target.value)}
              placeholder="#"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </>
      ))}

      {/* ImageBox Styles */}
      {selectedComponent.type === 'ImageBox' && renderSection('Styles', 'iconBoxStyles', (
        <>
          {renderTextInput('Icon/Image Size', 'iconSize', 'e.g., 48px, 64px')}
          {renderColorInput('Icon Color', 'iconColor', '#000000')}
          {renderColorInput('Title Color', 'titleColor', '#1a1a2e')}
          {renderTextInput('Title Font Size', 'titleFontSize', 'e.g., 18px')}
          {renderSelectInput('Title Font Weight', 'titleFontWeight', fontWeightOptions, 'Select weight')}
          {renderTextInput('Title Margin Bottom', 'titleMarginBottom', 'e.g., 8px')}
          {renderColorInput('Description Color', 'descriptionColor', '#666666')}
          {renderTextInput('Description Font Size', 'descriptionFontSize', 'e.g., 14px')}
          {renderColorInput('Link Color', 'linkColor', '#2563eb')}
          {renderTextInput('Link Font Size', 'linkFontSize', 'e.g., 14px')}
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

      {/* Heading Content */}
      {selectedComponent.type === 'Heading' && renderSection('Content', 'headingContent', (
        <>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Heading Text</label>
            <input
              type="text"
              value={props.text || ''}
              onChange={(e) => handlePropChange('text', e.target.value)}
              placeholder="Enter heading text..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Heading Level</label>
            <select
              value={props.level || 'h1'}
              onChange={(e) => handlePropChange('level', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="h1">H1 - Main Title</option>
              <option value="h2">H2 - Section Title</option>
              <option value="h3">H3 - Subsection</option>
              <option value="h4">H4 - Sub-subsection</option>
              <option value="h5">H5 - Small Heading</option>
              <option value="h6">H6 - Smallest Heading</option>
            </select>
          </div>
        </>
      ))}

      {/* Heading Styles */}
      {selectedComponent.type === 'Heading' && renderSection('Styles', 'headingStyles', (
        <>
          {renderColorInput('Color', 'color', '#333333')}
          {renderTextInput('Font Size', 'fontSize', 'e.g., 2.5rem, 40px')}
          {renderSelectInput('Font Weight', 'fontWeight', fontWeightOptions, 'Select weight')}
          {renderTextInput('Line Height', 'lineHeight', 'e.g., 1.2')}
          {renderSelectInput('Text Align', 'textAlign', [
            { value: 'left', label: 'Left' },
            { value: 'center', label: 'Center' },
            { value: 'right', label: 'Right' },
          ], 'Select alignment')}
          {renderTextInput('Letter Spacing', 'letterSpacing', 'e.g., 0.5px, 2px')}
          {renderSelectInput('Text Transform', 'textTransform', [
            { value: '', label: 'None' },
            { value: 'uppercase', label: 'UPPERCASE' },
            { value: 'lowercase', label: 'lowercase' },
            { value: 'capitalize', label: 'Capitalize' },
          ], 'Select transform')}
          {renderTextInput('Padding', 'padding', 'e.g., 20px')}
          {renderTextInput('Margin', 'margin', 'e.g., 0 0 20px 0')}
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

      {/* FooterAllegiant Content */}
      {selectedComponent.type === 'FooterAllegiant' && renderSection('Content', 'footerAllegiantContent', (
        <>
          {/* Logo settings */}
          <div className="mb-4">
            <label className="flex items-center gap-2 text-sm text-gray-700 mb-2">
              <input
                type="checkbox"
                checked={props.showLogo !== false}
                onChange={(e) => handlePropChange('showLogo', e.target.checked)}
                className="rounded"
              />
              Show Logo
            </label>
            {props.showLogo !== false && (
              <>
                <div className="mb-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Logo Text</label>
                  <input
                    type="text"
                    value={props.logoText || ''}
                    onChange={(e) => handlePropChange('logoText', e.target.value)}
                    placeholder="e.g., CHS"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="mb-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Logo Image URL</label>
                  <input
                    type="text"
                    value={props.logoImageUrl || ''}
                    onChange={(e) => handlePropChange('logoImageUrl', e.target.value)}
                    placeholder="e.g., /logo.png"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-400 mt-1">If set, image will be used instead of text</p>
                </div>
              </>
            )}
          </div>

          {/* Copyright text */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-600 mb-1">Copyright Text</label>
            <input
              type="text"
              value={props.copyrightText || ''}
              onChange={(e) => handlePropChange('copyrightText', e.target.value)}
              placeholder="e.g., © 2025 CHS Inc."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Footer Links */}
          <div className="mt-4 border-t border-gray-100 pt-4">
            <p className="text-xs font-medium text-gray-500 mb-3">Footer Links</p>
            {(props.footerLinks || []).map((link: { text: string; url: string }, index: number) => (
              <div key={index} className="mb-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-gray-500">Link {index + 1}</span>
                  <button
                    onClick={() => {
                      const newLinks = [...(props.footerLinks || [])];
                      newLinks.splice(index, 1);
                      handlePropChange('footerLinks', newLinks);
                    }}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
                <input
                  type="text"
                  value={link.text}
                  onChange={(e) => {
                    const newLinks = [...(props.footerLinks || [])];
                    newLinks[index] = { ...newLinks[index], text: e.target.value };
                    handlePropChange('footerLinks', newLinks);
                  }}
                  placeholder="Link text"
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded mb-1"
                />
                <input
                  type="text"
                  value={link.url}
                  onChange={(e) => {
                    const newLinks = [...(props.footerLinks || [])];
                    newLinks[index] = { ...newLinks[index], url: e.target.value };
                    handlePropChange('footerLinks', newLinks);
                  }}
                  placeholder="Link URL"
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                />
              </div>
            ))}
            <button
              onClick={() => {
                const newLinks = [...(props.footerLinks || []), { text: 'New Link', url: '#' }];
                handlePropChange('footerLinks', newLinks);
              }}
              className="w-full px-3 py-2 text-xs text-blue-600 hover:bg-blue-50 border border-blue-200 rounded-lg"
            >
              + Add Link
            </button>
          </div>
        </>
      ))}

      {/* FooterAllegiant Container */}
      {selectedComponent.type === 'FooterAllegiant' && renderSection('Container', 'footerAllegiantContainer', (
        <>
          {renderColorInput('Background Color', 'backgroundColor', '#003087')}
          {renderTextInput('Padding', 'padding', 'e.g., 12px 32px')}
          {renderTextInput('Max Width', 'maxWidth', 'e.g., 1400px')}
          {renderTextInput('Margin', 'margin', 'e.g., 0 auto')}
          <div className="pt-2 border-t border-gray-100 mt-2">
            <p className="text-xs font-medium text-gray-500 mb-2">Border Top</p>
            {renderTextInput('Border Top Width', 'borderTopWidth', 'e.g., 1px')}
            {renderSelectInput('Border Top Style', 'borderTopStyle', [
              { value: '', label: 'None' },
              { value: 'solid', label: 'Solid' },
              { value: 'dashed', label: 'Dashed' },
              { value: 'dotted', label: 'Dotted' },
            ], 'Select style')}
            {renderColorInput('Border Top Color', 'borderTopColor', '#e5e7eb')}
          </div>
        </>
      ))}

      {/* FooterAllegiant Logo Styles */}
      {selectedComponent.type === 'FooterAllegiant' && renderSection('Logo Styles', 'footerAllegiantLogo', (
        <>
          {renderColorInput('Logo Color', 'logoColor', '#ffffff')}
          {renderTextInput('Logo Font Size', 'logoFontSize', 'e.g., 24px')}
          {renderSelectInput('Logo Font Weight', 'logoFontWeight', fontWeightOptions, 'Select weight')}
          {renderTextInput('Logo Height (for image)', 'logoHeight', 'e.g., 36px')}
        </>
      ))}

      {/* FooterAllegiant Link Styles */}
      {selectedComponent.type === 'FooterAllegiant' && renderSection('Link Styles', 'footerAllegiantLinks', (
        <>
          {renderColorInput('Link Color', 'linkColor', '#ffffff')}
          {renderTextInput('Link Font Size', 'linkFontSize', 'e.g., 13px')}
          {renderSelectInput('Link Font Weight', 'linkFontWeight', fontWeightOptions, 'Select weight')}
          {renderTextInput('Link Gap', 'linkGap', 'e.g., 24px')}
          {renderColorInput('Link Hover Color', 'linkHoverColor', '#cccccc')}
        </>
      ))}

      {/* FooterAllegiant Copyright Styles */}
      {selectedComponent.type === 'FooterAllegiant' && renderSection('Copyright Styles', 'footerAllegiantCopyright', (
        <>
          {renderColorInput('Copyright Color', 'copyrightColor', '#ffffff')}
          {renderTextInput('Copyright Font Size', 'copyrightFontSize', 'e.g., 12px')}
        </>
      ))}

      {/* SeedProduct PDF Upload */}
      {selectedComponent.type === 'SeedProduct' && renderSection('Upload PDF Tech Sheet', 'seedProductPdfUpload', (
        <>
          <p className="text-xs text-gray-500 mb-3">
            Upload a seed product PDF tech sheet to automatically extract product data using AI.
          </p>
          <label
            className={`relative w-full px-4 py-4 text-left text-sm rounded-lg transition-colors border-2 border-dashed flex flex-col items-center gap-2 cursor-pointer ${
              isExtractingPdf
                ? 'border-blue-400 bg-blue-50 text-blue-600'
                : 'border-green-300 hover:border-green-500 hover:bg-green-50 text-gray-600 hover:text-green-600'
            }`}
          >
            <input
              ref={pdfInputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={handlePdfUpload}
              disabled={isExtractingPdf}
            />
            {isExtractingPdf ? (
              <svg className="w-8 h-8 text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <span className="text-2xl">📄</span>
            )}
            <span className="font-medium">
              {isExtractingPdf ? 'Extracting data...' : 'Click to upload PDF'}
            </span>
            <span className="text-xs text-gray-400">
              {isExtractingPdf ? 'This may take a few seconds' : 'PDF files only'}
            </span>
          </label>
          {pdfError && (
            <p className="text-xs text-red-500 mt-2 px-1">{pdfError}</p>
          )}
          <p className="text-xs text-gray-400 mt-3">
            Note: Uploading a new PDF will replace existing product data (except hero image).
          </p>
        </>
      ))}

      {/* SeedProduct Content */}
      {selectedComponent.type === 'SeedProduct' && renderSection('Product Info', 'seedProductContent', (
        <>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Product Name</label>
            <input
              type="text"
              value={props.seedProductData?.productName || ''}
              onChange={(e) => handlePropChange('seedProductData', {
                ...props.seedProductData,
                productName: e.target.value,
              })}
              placeholder="e.g., Allegiant 009F23 XF"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
            <textarea
              value={props.seedProductData?.description || ''}
              onChange={(e) => handlePropChange('seedProductData', {
                ...props.seedProductData,
                description: e.target.value,
              })}
              placeholder="Product description..."
              rows={3}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Hero Image URL</label>
            <input
              type="text"
              value={props.seedProductData?.heroImage || ''}
              onChange={(e) => handlePropChange('seedProductData', {
                ...props.seedProductData,
                heroImage: e.target.value,
              })}
              placeholder="https://example.com/product-hero.jpg"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Category Icon URLs */}
          <div className="pt-3 border-t border-gray-100 mt-3">
            <p className="text-xs font-medium text-gray-500 mb-2">Category Icons</p>
            <div className="space-y-2">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Agronomics Icon URL</label>
                <input
                  type="text"
                  value={props.seedProductData?.agronomicsIcon || ''}
                  onChange={(e) => handlePropChange('seedProductData', {
                    ...props.seedProductData,
                    agronomicsIcon: e.target.value,
                  })}
                  placeholder="https://example.com/agronomics-icon.png"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Field Performance Icon URL</label>
                <input
                  type="text"
                  value={props.seedProductData?.fieldPerformanceIcon || ''}
                  onChange={(e) => handlePropChange('seedProductData', {
                    ...props.seedProductData,
                    fieldPerformanceIcon: e.target.value,
                  })}
                  placeholder="https://example.com/field-icon.png"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Disease Tolerance Icon URL</label>
                <input
                  type="text"
                  value={props.seedProductData?.diseaseResistanceIcon || ''}
                  onChange={(e) => handlePropChange('seedProductData', {
                    ...props.seedProductData,
                    diseaseResistanceIcon: e.target.value,
                  })}
                  placeholder="https://example.com/disease-icon.png"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </>
      ))}

      {/* SeedProduct Ratings */}
      {selectedComponent.type === 'SeedProduct' && renderSection('Ratings (1-9 Scale)', 'seedProductRatings', (
        <>
          <p className="text-xs text-gray-500 mb-2">1 = Excellent, 5 = Average, 9 = Fair</p>
          {(props.seedProductData?.ratings || []).map((rating: SeedProductRating, index: number) => (
            <div key={index} className="flex gap-2 mb-2 items-center">
              <input
                type="text"
                value={rating.label}
                onChange={(e) => {
                  const newRatings = [...(props.seedProductData?.ratings || [])];
                  newRatings[index] = { ...newRatings[index], label: e.target.value };
                  handlePropChange('seedProductData', {
                    ...props.seedProductData,
                    ratings: newRatings,
                  });
                }}
                placeholder="Label"
                className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                min="1"
                max="9"
                value={rating.value}
                onChange={(e) => {
                  const newRatings = [...(props.seedProductData?.ratings || [])];
                  newRatings[index] = { ...newRatings[index], value: parseInt(e.target.value) || 1 };
                  handlePropChange('seedProductData', {
                    ...props.seedProductData,
                    ratings: newRatings,
                  });
                }}
                className="w-16 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => {
                  const newRatings = (props.seedProductData?.ratings || []).filter((_: SeedProductRating, i: number) => i !== index);
                  handlePropChange('seedProductData', {
                    ...props.seedProductData,
                    ratings: newRatings,
                  });
                }}
                className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded hover:bg-red-200"
              >
                ×
              </button>
            </div>
          ))}
          <button
            onClick={() => {
              const newRatings = [...(props.seedProductData?.ratings || []), { label: 'New Rating', value: 5 }];
              handlePropChange('seedProductData', {
                ...props.seedProductData,
                ratings: newRatings,
              });
            }}
            className="w-full px-3 py-2 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
          >
            + Add Rating
          </button>
        </>
      ))}

      {/* SeedProduct Agronomics */}
      {selectedComponent.type === 'SeedProduct' && renderSection('Agronomics', 'seedProductAgronomics', (
        <>
          {(props.seedProductData?.agronomics || []).map((attr: SeedProductAttribute, index: number) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                value={attr.label}
                onChange={(e) => {
                  const newAttrs = [...(props.seedProductData?.agronomics || [])];
                  newAttrs[index] = { ...newAttrs[index], label: e.target.value };
                  handlePropChange('seedProductData', {
                    ...props.seedProductData,
                    agronomics: newAttrs,
                  });
                }}
                placeholder="Label"
                className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                value={attr.value}
                onChange={(e) => {
                  const newAttrs = [...(props.seedProductData?.agronomics || [])];
                  newAttrs[index] = { ...newAttrs[index], value: e.target.value };
                  handlePropChange('seedProductData', {
                    ...props.seedProductData,
                    agronomics: newAttrs,
                  });
                }}
                placeholder="Value"
                className="w-24 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => {
                  const newAttrs = (props.seedProductData?.agronomics || []).filter((_: SeedProductAttribute, i: number) => i !== index);
                  handlePropChange('seedProductData', {
                    ...props.seedProductData,
                    agronomics: newAttrs,
                  });
                }}
                className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded hover:bg-red-200"
              >
                ×
              </button>
            </div>
          ))}
          <button
            onClick={() => {
              const newAttrs = [...(props.seedProductData?.agronomics || []), { label: 'New Attribute', value: '' }];
              handlePropChange('seedProductData', {
                ...props.seedProductData,
                agronomics: newAttrs,
              });
            }}
            className="w-full px-3 py-2 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
          >
            + Add Agronomic
          </button>
        </>
      ))}

      {/* SeedProduct Field Performance */}
      {selectedComponent.type === 'SeedProduct' && renderSection('Field Performance', 'seedProductFieldPerformance', (
        <>
          {(props.seedProductData?.fieldPerformance || []).map((attr: SeedProductAttribute, index: number) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                value={attr.label}
                onChange={(e) => {
                  const newAttrs = [...(props.seedProductData?.fieldPerformance || [])];
                  newAttrs[index] = { ...newAttrs[index], label: e.target.value };
                  handlePropChange('seedProductData', {
                    ...props.seedProductData,
                    fieldPerformance: newAttrs,
                  });
                }}
                placeholder="Label"
                className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                value={attr.value}
                onChange={(e) => {
                  const newAttrs = [...(props.seedProductData?.fieldPerformance || [])];
                  newAttrs[index] = { ...newAttrs[index], value: e.target.value };
                  handlePropChange('seedProductData', {
                    ...props.seedProductData,
                    fieldPerformance: newAttrs,
                  });
                }}
                placeholder="Value"
                className="w-24 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => {
                  const newAttrs = (props.seedProductData?.fieldPerformance || []).filter((_: SeedProductAttribute, i: number) => i !== index);
                  handlePropChange('seedProductData', {
                    ...props.seedProductData,
                    fieldPerformance: newAttrs,
                  });
                }}
                className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded hover:bg-red-200"
              >
                ×
              </button>
            </div>
          ))}
          <button
            onClick={() => {
              const newAttrs = [...(props.seedProductData?.fieldPerformance || []), { label: 'New Condition', value: '' }];
              handlePropChange('seedProductData', {
                ...props.seedProductData,
                fieldPerformance: newAttrs,
              });
            }}
            className="w-full px-3 py-2 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
          >
            + Add Field Performance
          </button>
        </>
      ))}

      {/* SeedProduct Disease Resistance */}
      {selectedComponent.type === 'SeedProduct' && renderSection('Disease Resistance', 'seedProductDiseaseResistance', (
        <>
          {(props.seedProductData?.diseaseResistance || []).map((attr: SeedProductAttribute, index: number) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                value={attr.label}
                onChange={(e) => {
                  const newAttrs = [...(props.seedProductData?.diseaseResistance || [])];
                  newAttrs[index] = { ...newAttrs[index], label: e.target.value };
                  handlePropChange('seedProductData', {
                    ...props.seedProductData,
                    diseaseResistance: newAttrs,
                  });
                }}
                placeholder="Disease Name"
                className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                value={attr.value}
                onChange={(e) => {
                  const newAttrs = [...(props.seedProductData?.diseaseResistance || [])];
                  newAttrs[index] = { ...newAttrs[index], value: e.target.value };
                  handlePropChange('seedProductData', {
                    ...props.seedProductData,
                    diseaseResistance: newAttrs,
                  });
                }}
                placeholder="Rating"
                className="w-24 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => {
                  const newAttrs = (props.seedProductData?.diseaseResistance || []).filter((_: SeedProductAttribute, i: number) => i !== index);
                  handlePropChange('seedProductData', {
                    ...props.seedProductData,
                    diseaseResistance: newAttrs,
                  });
                }}
                className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded hover:bg-red-200"
              >
                ×
              </button>
            </div>
          ))}
          <button
            onClick={() => {
              const newAttrs = [...(props.seedProductData?.diseaseResistance || []), { label: 'New Disease', value: '' }];
              handlePropChange('seedProductData', {
                ...props.seedProductData,
                diseaseResistance: newAttrs,
              });
            }}
            className="w-full px-3 py-2 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
          >
            + Add Disease Resistance
          </button>
        </>
      ))}

      {/* SeedProduct Styles */}
      {selectedComponent.type === 'SeedProduct' && renderSection('Styles', 'seedProductStyles', (
        <>
          {renderColorInput('Title Color', 'titleColor', '#003087')}
          {renderTextInput('Title Font Size', 'titleFontSize', 'e.g., 32px')}
          {renderColorInput('Description Color', 'descriptionColor', '#666666')}
          {renderColorInput('Rating Bar Color', 'ratingBarColor', '#003087')}
          {renderColorInput('Rating Bar Background', 'ratingBarBgColor', '#e5e7eb')}
          <div className="pt-2 border-t border-gray-100">
            <p className="text-xs font-medium text-gray-500 mb-2">Category Cards</p>
            {renderColorInput('Card Background', 'cardBgColor', '#f8fafc')}
            {renderColorInput('Card Border', 'cardBorderColor', '#e2e8f0')}
            {renderColorInput('Card Title Color', 'cardTitleColor', '#003087')}
            {renderColorInput('Card Icon Color', 'cardIconColor', '#003087')}
          </div>
          <div className="pt-2 border-t border-gray-100">
            <p className="text-xs font-medium text-gray-500 mb-2">Text Colors</p>
            {renderColorInput('Label Color', 'labelColor', '#374151')}
            {renderColorInput('Value Color', 'valueColor', '#111827')}
          </div>
          {renderTextInput('Padding', 'padding', 'e.g., 32px')}
          {renderColorInput('Background', 'backgroundColor', '#ffffff')}
        </>
      ))}

      {/* ProductGrid Content Options */}
      {selectedComponent.type === 'ProductGrid' && renderSection('Content Options', 'productGridContent', (
        <>
          <div className="flex items-center gap-2 mb-3">
            <input
              type="checkbox"
              id="showLearnMore"
              checked={props.showLearnMore !== false}
              onChange={(e) => handlePropChange('showLearnMore', e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="showLearnMore" className="text-sm text-gray-700">Show "Learn more" link</label>
          </div>
          {props.showLearnMore !== false && (
            <div className="mb-3 pl-6">
              <label className="block text-xs font-medium text-gray-600 mb-1">Learn More Text</label>
              <input
                type="text"
                value={props.learnMoreText || 'Learn more'}
                onChange={(e) => handlePropChange('learnMoreText', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
          <div className="flex items-center gap-2 mb-3">
            <input
              type="checkbox"
              id="showDownloadLink"
              checked={props.showDownloadLink !== false}
              onChange={(e) => handlePropChange('showDownloadLink', e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="showDownloadLink" className="text-sm text-gray-700">Show "Download tech sheet" link</label>
          </div>
          {props.showDownloadLink !== false && (
            <div className="mb-3 pl-6">
              <label className="block text-xs font-medium text-gray-600 mb-1">Download Link Text</label>
              <input
                type="text"
                value={props.downloadLinkText || 'Download tech sheet'}
                onChange={(e) => handlePropChange('downloadLinkText', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="showNewBadge"
              checked={props.showNewBadge !== false}
              onChange={(e) => handlePropChange('showNewBadge', e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="showNewBadge" className="text-sm text-gray-700">Show "NEW" badge</label>
          </div>
        </>
      ))}

      {/* ProductGrid Layout */}
      {selectedComponent.type === 'ProductGrid' && renderSection('Layout', 'productGridLayout', (
        <>
          <div className="mb-3">
            <label className="block text-xs font-medium text-gray-600 mb-1">Columns</label>
            <select
              value={props.columns || 4}
              onChange={(e) => handlePropChange('columns', parseInt(e.target.value))}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={2}>2 columns</option>
              <option value={3}>3 columns</option>
              <option value={4}>4 columns</option>
              <option value={5}>5 columns</option>
              <option value={6}>6 columns</option>
            </select>
          </div>
          {renderTextInput('Gap', 'gap', 'e.g., 24px')}
          {renderTextInput('Padding', 'padding', 'e.g., 40px 20px')}
          {renderColorInput('Background Color', 'backgroundColor', '#f3f4f6')}
        </>
      ))}

      {/* ProductGrid Card Styles */}
      {selectedComponent.type === 'ProductGrid' && renderSection('Card Styles', 'productGridCardStyles', (
        <>
          {renderColorInput('Card Background', 'cardBackgroundColor', '#ffffff')}
          {renderColorInput('Card Border Color', 'cardBorderColor', '#e5e7eb')}
          {renderTextInput('Card Border Width', 'cardBorderWidth', 'e.g., 1px')}
          {renderTextInput('Card Border Radius', 'cardBorderRadius', 'e.g., 8px')}
          {renderTextInput('Card Padding', 'cardPadding', 'e.g., 24px')}
        </>
      ))}

      {/* ProductGrid Text Styles */}
      {selectedComponent.type === 'ProductGrid' && renderSection('Text Styles', 'productGridTextStyles', (
        <>
          {renderColorInput('Title Color', 'titleColor', '#003087')}
          {renderTextInput('Title Font Size', 'titleFontSize', 'e.g., 18px')}
          {renderTextInput('Title Font Weight', 'titleFontWeight', 'e.g., 700')}
          {renderColorInput('Text Color', 'textColor', '#6b7280')}
          {renderTextInput('Text Font Size', 'textFontSize', 'e.g., 14px')}
          {renderColorInput('Link Color', 'linkColor', '#003087')}
          {renderTextInput('Link Font Size', 'linkFontSize', 'e.g., 14px')}
        </>
      ))}

      {/* ProductGrid Badge Styles */}
      {selectedComponent.type === 'ProductGrid' && renderSection('Badge Styles', 'productGridBadgeStyles', (
        <>
          {renderColorInput('Badge Background', 'badgeBackgroundColor', '#003087')}
          {renderColorInput('Badge Text Color', 'badgeTextColor', '#ffffff')}
        </>
      ))}

      {/* AIChatWidget Content */}
      {selectedComponent.type === 'AIChatWidget' && renderSection('Content', 'aiChatContent', (
        <>
          <div className="mb-3">
            <label className="block text-xs font-medium text-gray-600 mb-1">Project Name</label>
            <input
              type="text"
              value={selectedComponent.props?.projectName || ''}
              onChange={(e) => handlePropChange('projectName', e.target.value)}
              placeholder="Project to fetch pages from"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Leave empty to use current project</p>
          </div>
          <div className="mb-3">
            <label className="block text-xs font-medium text-gray-600 mb-1">Title</label>
            <input
              type="text"
              value={selectedComponent.props?.title || ''}
              onChange={(e) => handlePropChange('title', e.target.value)}
              placeholder="e.g., Product Assistant"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-3">
            <label className="block text-xs font-medium text-gray-600 mb-1">Placeholder</label>
            <input
              type="text"
              value={selectedComponent.props?.placeholder || ''}
              onChange={(e) => handlePropChange('placeholder', e.target.value)}
              placeholder="e.g., Ask about our products..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-3">
            <label className="block text-xs font-medium text-gray-600 mb-1">Welcome Message</label>
            <textarea
              value={selectedComponent.props?.welcomeMessage || ''}
              onChange={(e) => handlePropChange('welcomeMessage', e.target.value)}
              placeholder="Enter welcome message..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>
        </>
      ))}

      {/* AIChatWidget Alignment */}
      {selectedComponent.type === 'AIChatWidget' && renderSection('Alignment', 'aiChatAlignment', (
        <>
          <div className="mb-3">
            <label className="block text-xs font-medium text-gray-600 mb-1">Horizontal Alignment</label>
            <select
              value={selectedComponent.customStyles?.justifyContent || 'flex-start'}
              onChange={(e) => handleStyleChange('justifyContent', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="flex-start">Left</option>
              <option value="center">Center</option>
              <option value="flex-end">Right</option>
            </select>
          </div>
          <div className="mb-3">
            <label className="block text-xs font-medium text-gray-600 mb-1">Vertical Alignment</label>
            <select
              value={selectedComponent.customStyles?.alignItems || 'flex-start'}
              onChange={(e) => handleStyleChange('alignItems', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="flex-start">Top</option>
              <option value="center">Center</option>
              <option value="flex-end">Bottom</option>
            </select>
          </div>
          {renderTextInput('Container Height', 'containerHeight', 'e.g., 100vh or 600px')}
          <p className="text-xs text-gray-500 mt-1">Set height to enable vertical alignment</p>
        </>
      ))}

      {/* AIChatWidget Container Styles */}
      {selectedComponent.type === 'AIChatWidget' && renderSection('Container Styles', 'aiChatStyles', (
        <>
          {renderColorInput('Background Color', 'backgroundColor', '#ffffff')}
          {renderTextInput('Max Width', 'maxWidth', 'e.g., 400px')}
          {renderTextInput('Min Height', 'minHeight', 'e.g., 500px')}
          {renderTextInput('Border Radius', 'borderRadius', 'e.g., 12px')}
          {renderTextInput('Border Width', 'borderWidth', 'e.g., 1px')}
          {renderColorInput('Border Color', 'borderColor', '#e5e7eb')}
        </>
      ))}

      {/* AIChatWidget Header Styles */}
      {selectedComponent.type === 'AIChatWidget' && renderSection('Header Styles', 'aiChatHeaderStyles', (
        <>
          {renderColorInput('Header Background', 'headerBackgroundColor', '')}
          <p className="text-xs text-gray-500 mb-2">Empty = use global button color</p>
          {renderColorInput('Header Text Color', 'headerTextColor', '#ffffff')}
          {renderTextInput('Header Font Size', 'headerFontSize', 'e.g., 16px')}
          {renderTextInput('Header Font Weight', 'headerFontWeight', 'e.g., 600')}
          {renderTextInput('Header Padding', 'headerPadding', 'e.g., 16px')}
        </>
      ))}

      {/* AIChatWidget Message Styles */}
      {selectedComponent.type === 'AIChatWidget' && renderSection('Message Styles', 'aiChatMessageStyles', (
        <>
          {renderColorInput('User Message Background', 'userMessageBgColor', '')}
          <p className="text-xs text-gray-500 mb-2">Empty = use global button color</p>
          {renderColorInput('User Message Text', 'userMessageTextColor', '#ffffff')}
          {renderColorInput('Assistant Message Background', 'assistantMessageBgColor', '#f3f4f6')}
          {renderColorInput('Assistant Message Text', 'assistantMessageTextColor', '#374151')}
          {renderTextInput('Message Font Size', 'messageFontSize', 'e.g., 14px')}
          {renderTextInput('Message Border Radius', 'messageBorderRadius', 'e.g., 12px')}
        </>
      ))}

      {/* AIChatWidget Input Styles */}
      {selectedComponent.type === 'AIChatWidget' && renderSection('Input & Button Styles', 'aiChatInputStyles', (
        <>
          {renderColorInput('Input Background', 'inputBackgroundColor', '#f9fafb')}
          {renderColorInput('Input Text Color', 'inputTextColor', '#111827')}
          {renderColorInput('Input Border Color', 'inputBorderColor', '#d1d5db')}
          {renderTextInput('Input Border Radius', 'inputBorderRadius', 'e.g., 8px')}
          {renderTextInput('Input Padding', 'inputPadding', 'e.g., 10px 12px')}
          {renderColorInput('Button Background', 'buttonBackgroundColor', '')}
          <p className="text-xs text-gray-500 mb-2">Empty = use global button color</p>
          {renderColorInput('Button Text Color', 'buttonTextColor', '#ffffff')}
          {renderTextInput('Button Border Radius', 'buttonBorderRadius', 'e.g., 8px')}
          {renderTextInput('Button Padding', 'buttonPadding', 'e.g., 10px 16px')}
        </>
      ))}
    </div>
  );
}
