import { useState } from 'react';
import { useVisualBuilderStore, VisualComponent } from '../store/visualBuilderStore';
import ComponentTree from './ComponentTree';

const componentTemplates = [
  {
    type: 'Header',
    label: 'Header / Navigation',
    icon: '📍',
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
    icon: '🎯',
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
    icon: '🖼️',
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
    icon: '⊞',
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
    icon: '📋',
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
    icon: '✨',
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
    icon: '📝',
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
    icon: '🔘',
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
    icon: '➖',
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
    icon: '🦶',
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
];

export default function VisualComponentLibrary() {
  const { addComponent, components, selectedComponentId } = useVisualBuilderStore();
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
              <span className="text-xl">{template.icon}</span>
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
                      className="w-full px-3 py-2 text-left text-xs text-gray-700 hover:bg-green-50 hover:text-green-600 rounded-lg transition-colors border border-gray-200 hover:border-green-300 flex items-center gap-2"
                    >
                      <span>{template.icon}</span>
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
