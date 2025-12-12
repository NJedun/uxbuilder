import { useState } from 'react';
import { useVisualBuilderStore, VisualComponent, defaultSeedProductData } from '../store/visualBuilderStore';
import ComponentTree from './ComponentTree';

// SVG Icon components for the component library
const ComponentIcons: Record<string, JSX.Element> = {
  Header: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h7" />
    </svg>
  ),
  HeroSection: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Image: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  Row: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v14a1 1 0 01-1 1h-4a1 1 0 01-1-1V5z" />
    </svg>
  ),
  LinkList: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
    </svg>
  ),
  IconBox: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  ),
  Text: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  ),
  Button: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
    </svg>
  ),
  Divider: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 12H4" />
    </svg>
  ),
  Footer: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  ),
  SeedProduct: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  ProductGrid: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  ),
};

const componentTemplates = [
  {
    type: 'Header',
    label: 'Header / Navigation',
    canBeChild: false,
    defaultProps: {
      logoText: 'Logo',
      logoImageUrl: '',
      navLinks: [
        { text: 'Home', url: '#' },
        { text: 'About', url: '#' },
        { text: 'Services', url: '#' },
        { text: 'Contact', url: '#' },
      ],
      showLogo: true,
      showNavLinks: true,
      // Language selector
      showLanguageSelector: false,
      languages: [
        { code: 'EN', label: 'English' },
        { code: 'LV', label: 'Latvian' },
      ],
      selectedLanguage: 'EN',
      // Divider between nav and language
      showNavDivider: false,
    },
    defaultStyles: {
      // All empty - will fallback to global styles
      backgroundColor: '',
      padding: '',
      // Logo styles
      logoColor: '',
      logoFontSize: '',
      logoFontWeight: '',
      // Nav link styles
      navLinkColor: '',
      navLinkFontSize: '',
      navLinkFontWeight: '',
      navLinkGap: '',
      // Layout
      justifyContent: '',
      alignItems: '',
      // Container
      maxWidth: '',
      margin: '',
      // Border
      borderWidth: '',
      borderStyle: '',
      borderColor: '',
      // Divider styles
      navDividerColor: '',
      navDividerHeight: '',
      navDividerMargin: '',
    },
  },
  {
    type: 'HeroSection',
    label: 'Hero Section',
    canBeChild: true,
    defaultProps: {
      title: 'Welcome to Our Website',
      subtitle: 'This is a paragraph of text that provides information to the reader.',
      buttonText: 'Get Started',
      showButton: true,
    },
    defaultStyles: {
      // All empty - will fallback to global styles
      backgroundColor: '',
      padding: '',
      textAlign: 'center',
      // Title styles - empty for global fallback
      titleColor: '',
      titleFontSize: '',
      titleFontWeight: '',
      titleMarginBottom: '',
      // Subtitle styles - empty for global fallback
      subtitleColor: '',
      subtitleFontSize: '',
      subtitleFontWeight: '',
      subtitleMarginBottom: '',
      // Button styles - empty for global fallback
      buttonBackgroundColor: '',
      buttonTextColor: '',
      buttonPadding: '',
      buttonBorderRadius: '',
      buttonFontSize: '',
      buttonFontWeight: '',
    },
  },
  {
    type: 'Image',
    label: 'Image',
    canBeChild: true,
    defaultProps: {
      src: '',
      alt: 'Image description',
      linkUrl: '',
      openInNewTab: false,
    },
    defaultStyles: {
      width: '100%',
      maxWidth: '',
      height: 'auto',
      objectFit: 'cover',
      borderRadius: '',
      margin: '',
      // Border
      borderWidth: '',
      borderStyle: '',
      borderColor: '',
    },
  },
  {
    type: 'Row',
    label: 'Row / Grid Layout',
    canBeChild: true,
    defaultProps: {
      columns: 2,
      columnWidths: ['50%', '50%'],
      columnStyles: [
        { backgroundColor: '', padding: '', borderRadius: '', borderWidth: '', borderStyle: '', borderColor: '' },
        { backgroundColor: '', padding: '', borderRadius: '', borderWidth: '', borderStyle: '', borderColor: '' },
      ],
    },
    defaultStyles: {
      gap: '20px',
      padding: '20px',
      backgroundColor: '',
      alignItems: 'stretch',
      justifyContent: 'flex-start',
      borderWidth: '',
      borderStyle: '',
      borderColor: '',
      borderRadius: '',
    },
  },
  {
    type: 'LinkList',
    label: 'Link List',
    canBeChild: true,
    defaultProps: {
      label: 'Quick Links',
      links: [
        { text: 'Home', url: '#' },
        { text: 'About', url: '#' },
        { text: 'Contact', url: '#' },
      ],
      layout: 'vertical', // vertical or horizontal
    },
    defaultStyles: {
      labelColor: '',
      labelFontSize: '',
      labelFontWeight: '',
      labelMarginBottom: '',
      itemColor: '',
      itemFontSize: '',
      itemGap: '',
      padding: '',
      backgroundColor: '',
    },
  },
  {
    type: 'IconBox',
    label: 'Icon Box / Feature',
    canBeChild: true,
    defaultProps: {
      icon: '🚀',
      iconImageUrl: '',
      title: 'Feature Title',
      description: 'A brief description of this feature or service.',
      layout: 'top', // top, left, right
    },
    defaultStyles: {
      backgroundColor: '',
      padding: '',
      borderRadius: '',
      iconSize: '',
      iconColor: '',
      titleColor: '',
      titleFontSize: '',
      titleFontWeight: '',
      titleMarginBottom: '',
      descriptionColor: '',
      descriptionFontSize: '',
      textAlign: 'left',
    },
  },
  {
    type: 'Text',
    label: 'Text / Paragraph',
    canBeChild: true,
    defaultProps: {
      content: 'This is a paragraph of text. You can use this component for body content, descriptions, or any other text.',
    },
    defaultStyles: {
      color: '',
      fontSize: '',
      fontWeight: '',
      lineHeight: '',
      textAlign: 'left',
      padding: '',
      margin: '',
    },
  },
  {
    type: 'Button',
    label: 'Button',
    canBeChild: true,
    defaultProps: {
      text: 'Click Me',
      url: '#',
      openInNewTab: false,
      variant: 'primary', // primary, secondary, outline, ghost
    },
    defaultStyles: {
      backgroundColor: '',
      textColor: '',
      padding: '',
      borderRadius: '',
      fontSize: '',
      fontWeight: '',
      borderWidth: '',
      borderStyle: '',
      borderColor: '',
      width: '',
      textAlign: 'center',
    },
  },
  {
    type: 'Divider',
    label: 'Divider / Spacer',
    canBeChild: true,
    defaultProps: {
      showLine: true,
    },
    defaultStyles: {
      color: '',
      height: '',
      margin: '',
      width: '100%',
    },
  },
  {
    type: 'Footer',
    label: 'Footer',
    canBeChild: false,
    defaultProps: {
      columns: [
        {
          label: 'Quick Links',
          links: [{ text: 'Home', url: '#' }, { text: 'About', url: '#' }],
        },
        {
          label: 'Services',
          links: [{ text: 'Service 1', url: '#' }, { text: 'Service 2', url: '#' }],
        },
        {
          label: 'Contact',
          links: [{ text: 'Email Us', url: '#' }, { text: 'Call Us', url: '#' }],
        },
      ],
      copyright: '© 2024 Company Name. All Rights Reserved.',
      showCopyright: true,
    },
    defaultStyles: {
      backgroundColor: '',
      padding: '',
      columnGap: '',
      labelColor: '',
      labelFontSize: '',
      labelFontWeight: '',
      linkColor: '',
      linkFontSize: '',
      copyrightColor: '',
      copyrightFontSize: '',
      copyrightPadding: '',
      copyrightBorderColor: '',
    },
  },
  {
    type: 'SeedProduct',
    label: 'Seed Product Card',
    canBeChild: true,
    defaultProps: {
      seedProductData: { ...defaultSeedProductData },
    },
    defaultStyles: {
      // All empty - will fallback to global styles
      titleColor: '',
      titleFontSize: '',
      descriptionColor: '',
      ratingBarColor: '',
      ratingBarBgColor: '',
      cardBgColor: '',
      cardBorderColor: '',
      cardTitleColor: '',
      cardIconColor: '',
      labelColor: '',
      valueColor: '',
      padding: '',
      backgroundColor: '',
    },
  },
  {
    type: 'ProductGrid',
    label: 'Product Grid (PLP)',
    canBeChild: true,
    defaultProps: {
      columns: 3,
      gap: '24px',
    },
    defaultStyles: {
      padding: '40px 20px',
      backgroundColor: '',
      cardBackgroundColor: '',
      cardBorderColor: '',
      titleColor: '',
      textColor: '',
      linkColor: '',
    },
  },
];

interface VisualComponentLibraryProps {
  onAddComponent?: (component: VisualComponent) => void;
  components?: VisualComponent[];
}

export default function VisualComponentLibrary({ onAddComponent: externalAddComponent, components: externalComponents }: VisualComponentLibraryProps = {}) {
  const store = useVisualBuilderStore();
  const addComponent = externalAddComponent || store.addComponent;
  const components = externalComponents || store.components;
  const selectedComponentId = store.selectedComponentId;
  const [targetColumn, setTargetColumn] = useState<number | null>(null);

  // Find all Row components to allow adding children to them
  const findRowComponents = (comps: VisualComponent[]): { id: string; columns: number }[] => {
    const rows: { id: string; columns: number }[] = [];
    for (const comp of comps) {
      if (comp.type === 'Row') {
        rows.push({ id: comp.id, columns: comp.props?.columns || 2 });
      }
      if (comp.children) {
        rows.push(...findRowComponents(comp.children));
      }
    }
    return rows;
  };

  // Find selected component
  const findComponent = (id: string | null, comps: VisualComponent[]): VisualComponent | null => {
    if (!id) return null;
    for (const comp of comps) {
      if (comp.id === id) return comp;
      if (comp.children) {
        const found = findComponent(id, comp.children);
        if (found) return found;
      }
    }
    return null;
  };

  const selectedComponent = findComponent(selectedComponentId, components);
  const selectedRow = selectedComponent?.type === 'Row' ? selectedComponent : null;
  const rowComponents = findRowComponents(components);

  const handleAddComponent = (
    template: typeof componentTemplates[0],
    toColumn?: number,
    toRowId?: string
  ) => {
    const newComponent: VisualComponent = {
      id: `${template.type.toLowerCase()}-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      type: template.type,
      props: {
        ...template.defaultProps,
        ...(toColumn !== undefined ? { columnIndex: toColumn } : {}),
      },
      customStyles: { ...template.defaultStyles },
    };

    if (toRowId) {
      addComponent(newComponent, toRowId);
    } else {
      addComponent(newComponent);
    }
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto h-full flex flex-col">
      <div className="p-4 flex-shrink-0">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Components</h2>

        <p className="text-xs text-gray-500 mb-4">Click to add to canvas</p>

        <div className="space-y-2">
          {componentTemplates.map((template) => (
            <div
              key={template.type}
              className="relative group w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors border border-gray-200 hover:border-blue-300 flex items-center gap-3 cursor-pointer"
              onClick={() => handleAddComponent(template)}
            >
              <span className="text-gray-500 group-hover:text-blue-500">{ComponentIcons[template.type]}</span>
              <span className="font-medium flex-1">{template.label}</span>
            </div>
          ))}
        </div>

        {/* Add to Row Column section */}
        {selectedRow && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Add to Selected Row</h3>
            <p className="text-xs text-gray-500 mb-3">
              Row has {selectedRow.props?.columns || 2} columns
            </p>

            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-600 mb-1">Target Column</label>
              <select
                value={targetColumn ?? ''}
                onChange={(e) => setTargetColumn(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full px-3 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select column...</option>
                {Array.from({ length: selectedRow.props?.columns || 2 }).map((_, i) => (
                  <option key={i} value={i}>Column {i + 1}</option>
                ))}
              </select>
            </div>

            {targetColumn !== null && (
              <div className="space-y-2">
                {componentTemplates
                  .filter(t => t.canBeChild)
                  .map((template) => (
                    <button
                      key={`child-${template.type}`}
                      onClick={() => {
                        handleAddComponent(template, targetColumn, selectedRow.id);
                        setTargetColumn(null);
                      }}
                      className="w-full px-3 py-2 text-left text-xs text-gray-700 hover:bg-green-50 hover:text-green-600 rounded-lg transition-colors border border-gray-200 hover:border-green-300 flex items-center gap-2 group"
                    >
                      <span className="text-gray-500 group-hover:text-green-500">{ComponentIcons[template.type]}</span>
                      <span className="font-medium flex-1">+ {template.label}</span>
                    </button>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* Quick add to any Row */}
        {rowComponents.length > 0 && !selectedRow && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Add to Row Column</h3>
            <p className="text-xs text-gray-500 mb-2">Select a Row component to add children</p>
          </div>
        )}
      </div>

      {/* Component Tree - shows structure and allows reordering */}
      <div className="flex-1 border-t border-gray-200 overflow-y-auto">
        <ComponentTree />
      </div>
    </div>
  );
}
