import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AppHeader from '../components/AppHeader';
import { useToast } from '../components/Toast';
import { SeedProductData } from '../store/visualBuilderStore';

interface PLPPage {
  rowKey: string;
  partitionKey: string;
  title: string;
  slug: string;
}

interface PDPPage {
  rowKey: string;
  partitionKey: string;
  title: string;
  slug: string;
  sectionComponents: string;
  layoutRowKey?: string;
}

interface LayoutEntity {
  rowKey: string;
  partitionKey: string;
  name: string;
  isDefault?: boolean;
}

type Step = 'select-plp' | 'select-template' | 'upload-pdf' | 'review-data' | 'configure-page';

const generateSlug = (productName: string): string => {
  return productName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

export default function ContentIntake() {
  const navigate = useNavigate();
  const toast = useToast();
  const pdfInputRef = useRef<HTMLInputElement>(null);

  // Wizard state
  const [currentStep, setCurrentStep] = useState<Step>('select-plp');
  const [isLoading, setIsLoading] = useState(false);

  // Step 1: Select PLP
  const [plpPages, setPlpPages] = useState<PLPPage[]>([]);
  const [selectedPlp, setSelectedPlp] = useState<PLPPage | null>(null);
  const [loadingPlps, setLoadingPlps] = useState(true);

  // Step 2: Select Template
  const [pdpPages, setPdpPages] = useState<PDPPage[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<PDPPage | null>(null);
  const [loadingPdps, setLoadingPdps] = useState(false);
  const [templateComponents, setTemplateComponents] = useState<Record<string, any[]> | null>(null);

  // Step 3: Upload PDF
  const [isExtractingPdf, setIsExtractingPdf] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  // Step 3: Review Data
  const [seedProductData, setSeedProductData] = useState<SeedProductData>({
    productName: '',
    description: '',
    heroImage: '',
    ratings: [],
    agronomics: [],
    fieldPerformance: [],
    diseaseResistance: [],
  });

  // Step 4: Configure Page
  const [layouts, setLayouts] = useState<LayoutEntity[]>([]);
  const [selectedLayout, setSelectedLayout] = useState<LayoutEntity | null>(null);
  const [pageSlug, setPageSlug] = useState('');
  const [loadingLayouts, setLoadingLayouts] = useState(false);

  const baseUrl = import.meta.env.DEV ? 'http://localhost:3001' : '';

  // Load PLPs on mount
  useEffect(() => {
    const fetchPlps = async () => {
      try {
        const response = await fetch(`${baseUrl}/api/pages?type=PLP`);
        if (response.ok) {
          const data = await response.json();
          setPlpPages(data.data || []);
        }
      } catch (err) {
        console.error('Failed to fetch PLPs:', err);
        toast.showError('Failed to load product listing pages');
      } finally {
        setLoadingPlps(false);
      }
    };
    fetchPlps();
  }, []);

  // Load PDPs when reaching template step
  useEffect(() => {
    if (currentStep === 'select-template' && pdpPages.length === 0) {
      const fetchPdps = async () => {
        setLoadingPdps(true);
        try {
          const response = await fetch(`${baseUrl}/api/pages?type=PDP`);
          if (response.ok) {
            const data = await response.json();
            setPdpPages(data.data || []);
          }
        } catch (err) {
          console.error('Failed to fetch PDPs:', err);
        } finally {
          setLoadingPdps(false);
        }
      };
      fetchPdps();
    }
  }, [currentStep]);

  // Load layouts when reaching step 5
  useEffect(() => {
    if (currentStep === 'configure-page' && layouts.length === 0) {
      const fetchLayouts = async () => {
        setLoadingLayouts(true);
        try {
          const response = await fetch(`${baseUrl}/api/layouts`);
          if (response.ok) {
            const data = await response.json();
            const layoutList = data.data || [];
            setLayouts(layoutList);
            // Auto-select default layout
            const defaultLayout = layoutList.find((l: LayoutEntity) => l.isDefault);
            if (defaultLayout) {
              setSelectedLayout(defaultLayout);
            }
          }
        } catch (err) {
          console.error('Failed to fetch layouts:', err);
        } finally {
          setLoadingLayouts(false);
        }
      };
      fetchLayouts();
    }
  }, [currentStep]);

  // Auto-generate slug when product name changes
  useEffect(() => {
    if (seedProductData.productName && !pageSlug) {
      setPageSlug(generateSlug(seedProductData.productName));
    }
  }, [seedProductData.productName]);

  // Convert PDF to image using pdf.js
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
          const scale = 2;
          const viewport = page.getViewport({ scale });

          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          await page.render({ canvasContext: context, viewport }).promise;
          resolve(canvas.toDataURL('image/png'));
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsArrayBuffer(file);
    });
  };

  // Handle PDF upload
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setPdfError('Please upload a PDF file');
      return;
    }

    setIsExtractingPdf(true);
    setPdfError(null);

    try {
      const pdfImage = await pdfToImage(file);

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

      setSeedProductData({
        productName: extractedData.productName || '',
        description: extractedData.description || '',
        heroImage: '',
        ratings: extractedData.ratings || [],
        agronomics: extractedData.agronomics || [],
        fieldPerformance: extractedData.fieldPerformance || [],
        diseaseResistance: extractedData.diseaseResistance || [],
      });

      // Auto-generate slug
      if (extractedData.productName) {
        setPageSlug(generateSlug(extractedData.productName));
      }

      // Move to review step
      setCurrentStep('review-data');
      toast.showSuccess('Data extracted successfully!');
    } catch (err: any) {
      setPdfError(err.message || 'Failed to process PDF');
      toast.showError(err.message || 'Failed to process PDF');
    } finally {
      setIsExtractingPdf(false);
      if (pdfInputRef.current) {
        pdfInputRef.current.value = '';
      }
    }
  };

  // Handle manual entry (skip PDF)
  const handleManualEntry = () => {
    setSeedProductData({
      productName: '',
      description: '',
      heroImage: '',
      ratings: [{ label: '', value: 5 }],
      agronomics: [{ label: '', value: '' }],
      fieldPerformance: [{ label: '', value: '' }],
      diseaseResistance: [{ label: '', value: '' }],
    });
    setCurrentStep('review-data');
  };

  // Handle template selection
  const handleSelectTemplate = (pdp: PDPPage | null) => {
    setSelectedTemplate(pdp);
    if (pdp) {
      try {
        const components = JSON.parse(pdp.sectionComponents || '{}');
        setTemplateComponents(components);
        // If template has a layout, pre-select it
        if (pdp.layoutRowKey) {
          const templateLayout = layouts.find(l => l.rowKey === pdp.layoutRowKey);
          if (templateLayout) {
            setSelectedLayout(templateLayout);
          }
        }
      } catch (err) {
        console.error('Failed to parse template components:', err);
        setTemplateComponents(null);
      }
    } else {
      setTemplateComponents(null);
    }
  };

  // Build final components - merge template with new SeedProduct data
  const buildFinalComponents = (): Record<string, any[]> => {
    if (templateComponents) {
      // Clone template components and replace SeedProduct data
      const finalComponents: Record<string, any[]> = {};

      for (const [sectionId, sectionComps] of Object.entries(templateComponents)) {
        finalComponents[sectionId] = sectionComps.map((comp: any) => {
          if (comp.type === 'SeedProduct') {
            // Replace SeedProduct data with new data, keep other props/styles
            return {
              ...comp,
              id: `seedproduct-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              props: {
                ...comp.props,
                seedProductData: seedProductData,
              },
            };
          }
          // For non-SeedProduct components, generate new IDs to avoid conflicts
          return {
            ...comp,
            id: `${comp.type.toLowerCase()}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            children: comp.children?.map((child: any) => ({
              ...child,
              id: `${child.type.toLowerCase()}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            })),
          };
        });
      }

      return finalComponents;
    }

    // No template - create simple structure with just SeedProduct
    const componentId = `seedproduct-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    return {
      'body-section-1': [
        {
          id: componentId,
          type: 'SeedProduct',
          props: {
            seedProductData: seedProductData,
          },
          customStyles: {},
        },
      ],
    };
  };

  // Save PDP page
  const handleSave = async () => {
    if (!selectedPlp) {
      toast.showError('Please select a parent PLP');
      return;
    }

    if (!seedProductData.productName.trim()) {
      toast.showError('Product name is required');
      return;
    }

    if (!pageSlug.trim()) {
      toast.showError('Page slug is required');
      return;
    }

    setIsLoading(true);

    try {
      // Build components from template or create new
      const components = buildFinalComponents();

      const pageData = {
        partitionKey: selectedPlp.partitionKey,
        pageType: 'PDP',
        slug: pageSlug,
        parentRowKey: selectedPlp.rowKey,
        title: seedProductData.productName,
        summary: seedProductData.description,
        components: JSON.stringify([]), // Legacy
        sectionComponents: JSON.stringify(components),
        globalStyles: JSON.stringify({}),
        layoutRowKey: selectedLayout?.rowKey || null,
        isPublished: true,
      };

      const response = await fetch(`${baseUrl}/api/pages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pageData),
      });

      if (!response.ok) {
        throw new Error('Failed to create page');
      }

      const result = await response.json();
      toast.showSuccess('Product page created successfully!');

      // Navigate to pages list or the new page
      navigate(`/preview/${pageSlug}`);
    } catch (err: any) {
      toast.showError(err.message || 'Failed to save page');
    } finally {
      setIsLoading(false);
    }
  };

  // Step indicators
  const steps = [
    { id: 'select-plp', label: 'Category', number: 1 },
    { id: 'select-template', label: 'Template', number: 2 },
    { id: 'upload-pdf', label: 'Upload PDF', number: 3 },
    { id: 'review-data', label: 'Review', number: 4 },
    { id: 'configure-page', label: 'Save', number: 5 },
  ];

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
          <p className="text-gray-600 mt-1">Create a new product detail page (PDP)</p>
        </div>

        {/* Step Indicators */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 font-semibold text-sm ${
                    index < currentStepIndex
                      ? 'bg-green-500 border-green-500 text-white'
                      : index === currentStepIndex
                      ? 'bg-blue-500 border-blue-500 text-white'
                      : 'bg-white border-gray-300 text-gray-400'
                  }`}
                >
                  {index < currentStepIndex ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    step.number
                  )}
                </div>
                <span
                  className={`ml-2 text-sm font-medium hidden sm:block ${
                    index <= currentStepIndex ? 'text-gray-900' : 'text-gray-400'
                  }`}
                >
                  {step.label}
                </span>
                {index < steps.length - 1 && (
                  <div
                    className={`w-12 sm:w-24 h-0.5 mx-2 sm:mx-4 ${
                      index < currentStepIndex ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {/* Step 1: Select PLP */}
          {currentStep === 'select-plp' && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Parent Category</h2>
              <p className="text-gray-600 mb-6">Choose which product listing page (PLP) this product belongs to.</p>

              {loadingPlps ? (
                <div className="flex items-center justify-center py-12">
                  <svg className="w-8 h-8 text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                </div>
              ) : plpPages.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 mb-4">No product listing pages found.</p>
                  <button
                    onClick={() => navigate('/visual-builder')}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    Create a PLP First
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {plpPages.map((plp) => (
                    <label
                      key={plp.rowKey}
                      className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedPlp?.rowKey === plp.rowKey
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="plp"
                        checked={selectedPlp?.rowKey === plp.rowKey}
                        onChange={() => setSelectedPlp(plp)}
                        className="w-4 h-4 text-blue-500"
                      />
                      <div className="ml-3">
                        <p className="font-medium text-gray-900">{plp.title}</p>
                        <p className="text-sm text-gray-500">/{plp.slug}</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}

              <div className="mt-8 flex justify-end">
                <button
                  onClick={() => setCurrentStep('select-template')}
                  disabled={!selectedPlp}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Select Template */}
          {currentStep === 'select-template' && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Select a Template (Optional)</h2>
              <p className="text-gray-600 mb-6">
                Choose an existing product page as a template to copy its layout and components, or start from scratch.
              </p>

              {loadingPdps ? (
                <div className="flex items-center justify-center py-12">
                  <svg className="w-8 h-8 text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* No template option */}
                  <label
                    className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedTemplate === null
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="template"
                      checked={selectedTemplate === null}
                      onChange={() => handleSelectTemplate(null)}
                      className="w-4 h-4 text-blue-500"
                    />
                    <div className="ml-3">
                      <p className="font-medium text-gray-900">Start from scratch</p>
                      <p className="text-sm text-gray-500">Create a simple page with just the SeedProduct component</p>
                    </div>
                  </label>

                  {/* Existing PDPs as templates */}
                  {pdpPages.length > 0 && (
                    <>
                      <div className="relative py-2">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-200" />
                        </div>
                        <div className="relative flex justify-center text-xs">
                          <span className="px-2 bg-white text-gray-500">or use existing page as template</span>
                        </div>
                      </div>

                      {pdpPages.map((pdp) => (
                        <label
                          key={pdp.rowKey}
                          className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                            selectedTemplate?.rowKey === pdp.rowKey
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <input
                            type="radio"
                            name="template"
                            checked={selectedTemplate?.rowKey === pdp.rowKey}
                            onChange={() => handleSelectTemplate(pdp)}
                            className="w-4 h-4 text-blue-500"
                          />
                          <div className="ml-3">
                            <p className="font-medium text-gray-900">{pdp.title}</p>
                            <p className="text-sm text-gray-500">/{pdp.slug}</p>
                          </div>
                        </label>
                      ))}
                    </>
                  )}
                </div>
              )}

              <div className="mt-8 flex justify-between">
                <button
                  onClick={() => setCurrentStep('select-plp')}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  onClick={() => setCurrentStep('upload-pdf')}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Upload PDF */}
          {currentStep === 'upload-pdf' && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Product Tech Sheet</h2>
              <p className="text-gray-600 mb-6">
                Upload a PDF tech sheet to automatically extract product data, or enter data manually.
              </p>

              <div className="space-y-6">
                {/* PDF Upload Area */}
                <label
                  className={`relative block w-full p-8 text-center rounded-lg border-2 border-dashed transition-colors cursor-pointer ${
                    isExtractingPdf
                      ? 'border-blue-400 bg-blue-50'
                      : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
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
                    <>
                      <svg className="w-12 h-12 mx-auto text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      <p className="mt-4 text-blue-600 font-medium">Extracting data from PDF...</p>
                      <p className="text-sm text-blue-500">This may take a few seconds</p>
                    </>
                  ) : (
                    <>
                      <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="mt-4 text-gray-700 font-medium">Click to upload PDF</p>
                      <p className="text-sm text-gray-500">or drag and drop</p>
                    </>
                  )}
                </label>

                {pdfError && (
                  <p className="text-red-500 text-sm">{pdfError}</p>
                )}

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">or</span>
                  </div>
                </div>

                {/* Manual Entry Button */}
                <button
                  onClick={handleManualEntry}
                  disabled={isExtractingPdf}
                  className="w-full py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Enter Data Manually
                </button>
              </div>

              <div className="mt-8 flex justify-between">
                <button
                  onClick={() => setCurrentStep('select-template')}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Back
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Review Data */}
          {currentStep === 'review-data' && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Review & Edit Product Data</h2>
              <p className="text-gray-600 mb-6">Review the extracted data and make any necessary corrections.</p>

              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                    <input
                      type="text"
                      value={seedProductData.productName}
                      onChange={(e) => setSeedProductData({ ...seedProductData, productName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Allegiant 009F23"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={seedProductData.description}
                      onChange={(e) => setSeedProductData({ ...seedProductData, description: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Product description..."
                    />
                  </div>
                </div>

                {/* Ratings */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ratings ({seedProductData.ratings.length})
                  </label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {seedProductData.ratings.map((rating, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={rating.label}
                          onChange={(e) => {
                            const newRatings = [...seedProductData.ratings];
                            newRatings[index] = { ...rating, label: e.target.value };
                            setSeedProductData({ ...seedProductData, ratings: newRatings });
                          }}
                          className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
                          placeholder="Label"
                        />
                        <input
                          type="number"
                          min="1"
                          max="9"
                          value={rating.value}
                          onChange={(e) => {
                            const newRatings = [...seedProductData.ratings];
                            newRatings[index] = { ...rating, value: parseInt(e.target.value) || 1 };
                            setSeedProductData({ ...seedProductData, ratings: newRatings });
                          }}
                          className="w-16 px-2 py-1 text-sm border border-gray-300 rounded"
                        />
                        <button
                          onClick={() => {
                            const newRatings = seedProductData.ratings.filter((_, i) => i !== index);
                            setSeedProductData({ ...seedProductData, ratings: newRatings });
                          }}
                          className="text-red-500 hover:text-red-700 px-2"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => setSeedProductData({
                      ...seedProductData,
                      ratings: [...seedProductData.ratings, { label: '', value: 5 }]
                    })}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-700"
                  >
                    + Add Rating
                  </button>
                </div>

                {/* Agronomics */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Agronomics ({seedProductData.agronomics.length})
                  </label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {seedProductData.agronomics.map((attr, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={attr.label}
                          onChange={(e) => {
                            const newAttrs = [...seedProductData.agronomics];
                            newAttrs[index] = { ...attr, label: e.target.value };
                            setSeedProductData({ ...seedProductData, agronomics: newAttrs });
                          }}
                          className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
                          placeholder="Label"
                        />
                        <input
                          type="text"
                          value={attr.value}
                          onChange={(e) => {
                            const newAttrs = [...seedProductData.agronomics];
                            newAttrs[index] = { ...attr, value: e.target.value };
                            setSeedProductData({ ...seedProductData, agronomics: newAttrs });
                          }}
                          className="w-24 px-2 py-1 text-sm border border-gray-300 rounded"
                          placeholder="Value"
                        />
                        <button
                          onClick={() => {
                            const newAttrs = seedProductData.agronomics.filter((_, i) => i !== index);
                            setSeedProductData({ ...seedProductData, agronomics: newAttrs });
                          }}
                          className="text-red-500 hover:text-red-700 px-2"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => setSeedProductData({
                      ...seedProductData,
                      agronomics: [...seedProductData.agronomics, { label: '', value: '' }]
                    })}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-700"
                  >
                    + Add Agronomic
                  </button>
                </div>

                {/* Field Performance */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Field Performance ({seedProductData.fieldPerformance.length})
                  </label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {seedProductData.fieldPerformance.map((attr, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={attr.label}
                          onChange={(e) => {
                            const newAttrs = [...seedProductData.fieldPerformance];
                            newAttrs[index] = { ...attr, label: e.target.value };
                            setSeedProductData({ ...seedProductData, fieldPerformance: newAttrs });
                          }}
                          className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
                          placeholder="Label"
                        />
                        <input
                          type="text"
                          value={attr.value}
                          onChange={(e) => {
                            const newAttrs = [...seedProductData.fieldPerformance];
                            newAttrs[index] = { ...attr, value: e.target.value };
                            setSeedProductData({ ...seedProductData, fieldPerformance: newAttrs });
                          }}
                          className="w-24 px-2 py-1 text-sm border border-gray-300 rounded"
                          placeholder="Value"
                        />
                        <button
                          onClick={() => {
                            const newAttrs = seedProductData.fieldPerformance.filter((_, i) => i !== index);
                            setSeedProductData({ ...seedProductData, fieldPerformance: newAttrs });
                          }}
                          className="text-red-500 hover:text-red-700 px-2"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => setSeedProductData({
                      ...seedProductData,
                      fieldPerformance: [...seedProductData.fieldPerformance, { label: '', value: '' }]
                    })}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-700"
                  >
                    + Add Field Performance
                  </button>
                </div>

                {/* Disease Resistance */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Disease Resistance ({seedProductData.diseaseResistance.length})
                  </label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {seedProductData.diseaseResistance.map((attr, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={attr.label}
                          onChange={(e) => {
                            const newAttrs = [...seedProductData.diseaseResistance];
                            newAttrs[index] = { ...attr, label: e.target.value };
                            setSeedProductData({ ...seedProductData, diseaseResistance: newAttrs });
                          }}
                          className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
                          placeholder="Label"
                        />
                        <input
                          type="text"
                          value={attr.value}
                          onChange={(e) => {
                            const newAttrs = [...seedProductData.diseaseResistance];
                            newAttrs[index] = { ...attr, value: e.target.value };
                            setSeedProductData({ ...seedProductData, diseaseResistance: newAttrs });
                          }}
                          className="w-24 px-2 py-1 text-sm border border-gray-300 rounded"
                          placeholder="Value"
                        />
                        <button
                          onClick={() => {
                            const newAttrs = seedProductData.diseaseResistance.filter((_, i) => i !== index);
                            setSeedProductData({ ...seedProductData, diseaseResistance: newAttrs });
                          }}
                          className="text-red-500 hover:text-red-700 px-2"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => setSeedProductData({
                      ...seedProductData,
                      diseaseResistance: [...seedProductData.diseaseResistance, { label: '', value: '' }]
                    })}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-700"
                  >
                    + Add Disease Resistance
                  </button>
                </div>
              </div>

              <div className="mt-8 flex justify-between">
                <button
                  onClick={() => setCurrentStep('upload-pdf')}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  onClick={() => setCurrentStep('configure-page')}
                  disabled={!seedProductData.productName.trim()}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Configure Page */}
          {currentStep === 'configure-page' && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Configure Page Settings</h2>
              <p className="text-gray-600 mb-6">Set the page URL and select a layout.</p>

              <div className="space-y-6">
                {/* Page Slug */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Page URL *</label>
                  <div className="flex items-center">
                    <span className="text-gray-500 mr-1">/preview/</span>
                    <input
                      type="text"
                      value={pageSlug}
                      onChange={(e) => setPageSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="product-slug"
                    />
                  </div>
                </div>

                {/* Layout Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Layout</label>
                  {loadingLayouts ? (
                    <div className="py-4 text-center text-gray-500">Loading layouts...</div>
                  ) : layouts.length === 0 ? (
                    <div className="py-4 text-center text-gray-500">
                      <p>No layouts available.</p>
                      <button
                        onClick={() => navigate('/layouts')}
                        className="mt-2 text-blue-600 hover:text-blue-700"
                      >
                        Create a layout
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <label
                        className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                          !selectedLayout
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="layout"
                          checked={!selectedLayout}
                          onChange={() => setSelectedLayout(null)}
                          className="w-4 h-4 text-blue-500"
                        />
                        <span className="ml-3 text-gray-700">No layout (content only)</span>
                      </label>
                      {layouts.map((layout) => (
                        <label
                          key={layout.rowKey}
                          className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                            selectedLayout?.rowKey === layout.rowKey
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name="layout"
                            checked={selectedLayout?.rowKey === layout.rowKey}
                            onChange={() => setSelectedLayout(layout)}
                            className="w-4 h-4 text-blue-500"
                          />
                          <span className="ml-3 text-gray-700">
                            {layout.name}
                            {layout.isDefault && (
                              <span className="ml-2 text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded">
                                Default
                              </span>
                            )}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Summary */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Summary</h3>
                  <dl className="text-sm space-y-1">
                    <div className="flex">
                      <dt className="text-gray-500 w-32">Product:</dt>
                      <dd className="text-gray-900">{seedProductData.productName}</dd>
                    </div>
                    <div className="flex">
                      <dt className="text-gray-500 w-32">Parent PLP:</dt>
                      <dd className="text-gray-900">{selectedPlp?.title}</dd>
                    </div>
                    <div className="flex">
                      <dt className="text-gray-500 w-32">Template:</dt>
                      <dd className="text-gray-900">{selectedTemplate?.title || 'None (from scratch)'}</dd>
                    </div>
                    <div className="flex">
                      <dt className="text-gray-500 w-32">URL:</dt>
                      <dd className="text-gray-900">/preview/{pageSlug}</dd>
                    </div>
                    <div className="flex">
                      <dt className="text-gray-500 w-32">Layout:</dt>
                      <dd className="text-gray-900">{selectedLayout?.name || 'None'}</dd>
                    </div>
                  </dl>
                </div>
              </div>

              <div className="mt-8 flex justify-between">
                <button
                  onClick={() => setCurrentStep('review-data')}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  onClick={handleSave}
                  disabled={isLoading || !pageSlug.trim()}
                  className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Creating...
                    </>
                  ) : (
                    'Create Product Page'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
