import { useState, useEffect } from 'react';
import { useVisualBuilderStore, VisualComponent, defaultSeedProductData } from '../store/visualBuilderStore';
import { Layout, BodySection, defaultBodyStyles } from '../types/layout';
import ComponentTree from './ComponentTree';

// SVG Icon components for the component library
const ComponentIcons: Record<string, JSX.Element> = {
  Header: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h7" />
    </svg>
  ),
  HeaderAllegiant: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM4 6h16M4 10h16" />
    </svg>
  ),
  Breadcrumb: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12h4l3-3 3 3h8M9 9l3 3M12 12l3-3" />
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
  Heading: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h8m-8 6h16" />
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
  FooterAllegiant: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14H5m14 0a2 2 0 012 2v3a2 2 0 01-2 2H5a2 2 0 01-2-2v-3a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 14V9a2 2 0 012-2" />
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
    type: 'HeaderAllegiant',
    label: 'Header Allegiant (with Search)',
    canBeChild: false,
    defaultProps: {
      logoText: 'ALLEGIANT',
      logoImageUrl: '',
      navLinks: [
        { text: 'Corn', url: '#' },
        { text: 'Soybeans', url: '#' },
        { text: 'Wheat', url: '#' },
        { text: 'Forages', url: '#', hasDropdown: true, dropdownItems: [
          { text: 'Alfalfa', url: '#' },
          { text: 'Clover', url: '#' },
          { text: 'Grass', url: '#' },
        ]},
        { text: 'Tech sheets', url: '#' },
        { text: 'Plot data', url: '#' },
        { text: 'Contact us', url: '#' },
      ],
      showLogo: true,
      showNavLinks: true,
      showSearch: true,
      searchPlaceholder: 'Search',
    },
    defaultStyles: {
      backgroundColor: '#ffffff',
      padding: '16px 32px',
      // Logo styles
      logoColor: '#003087',
      logoFontSize: '24px',
      logoFontWeight: '700',
      logoHeight: '48px',
      // Nav link styles
      navLinkColor: '#003087',
      navLinkFontSize: '15px',
      navLinkFontWeight: '500',
      navLinkGap: '32px',
      navLinkHoverColor: '#0066cc',
      // Container
      maxWidth: '1400px',
      margin: '0 auto',
      // Border
      borderWidth: '',
      borderStyle: '',
      borderColor: '',
      // Search styles
      searchBorderColor: '#003087',
      searchBorderRadius: '4px',
      searchBackgroundColor: '#ffffff',
      searchTextColor: '#333333',
      searchWidth: '180px',
      // Border bottom styles
      borderBottomWidth: '',
      borderBottomStyle: '',
      borderBottomColor: '',
    },
  },
  {
    type: 'Breadcrumb',
    label: 'Breadcrumb Navigation',
    canBeChild: true,
    defaultProps: {
      items: [
        { text: 'Home', url: '#' },
        { text: 'Category', url: '#' },
        { text: 'Current Page', url: '#' },
      ],
      separator: '>',
      showHomeIcon: false,
    },
    defaultStyles: {
      backgroundColor: '#f8fafc',
      padding: '12px 32px',
      maxWidth: '1400px',
      margin: '0 auto',
      textColor: '#374151',
      linkColor: '#003087',
      linkHoverColor: '#0066cc',
      fontSize: '14px',
      fontWeight: '400',
      separatorColor: '#6b7280',
      borderTopWidth: '1px',
      borderTopColor: '#e5e7eb',
      borderBottomWidth: '1px',
      borderBottomColor: '#e5e7eb',
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
    type: 'Heading',
    label: 'Heading (H1-H6)',
    canBeChild: true,
    defaultProps: {
      text: 'Heading Text',
      level: 'h1',
    },
    defaultStyles: {
      color: '',
      fontSize: '',
      fontWeight: '',
      lineHeight: '',
      textAlign: 'left',
      padding: '',
      margin: '',
      letterSpacing: '',
      textTransform: '',
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
    type: 'FooterAllegiant',
    label: 'Footer Allegiant (Horizontal)',
    canBeChild: false,
    defaultProps: {
      showLogo: true,
      logoImageUrl: '',
      logoText: 'CHS',
      copyrightText: '© 2025 CHS Inc.',
      footerLinks: [
        { text: 'Benefits of New Seed', url: '#' },
        { text: 'CHS Terms & Conditions of Sale', url: '#' },
        { text: 'chsinc.com', url: '#' },
        { text: 'Contact us', url: '#' },
        { text: 'CHS Privacy Center', url: '#' },
        { text: 'Preference Center', url: '#' },
      ],
    },
    defaultStyles: {
      backgroundColor: '#003087',
      padding: '12px 32px',
      maxWidth: '1400px',
      margin: '0 auto',
      // Logo styles
      logoColor: '#ffffff',
      logoFontSize: '24px',
      logoFontWeight: '700',
      logoHeight: '36px',
      // Link styles
      linkColor: '#ffffff',
      linkFontSize: '13px',
      linkFontWeight: '400',
      linkGap: '24px',
      linkHoverColor: '#cccccc',
      // Copyright styles
      copyrightColor: '#ffffff',
      copyrightFontSize: '12px',
      // Border top styles
      borderTopWidth: '',
      borderTopStyle: '',
      borderTopColor: '',
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

interface LayoutEntity {
  rowKey: string;
  partitionKey: string;
  name: string;
  slug: string;
  description?: string;
  isDefault?: boolean;
  headerComponents: string;
  footerComponents: string;
  bodySections?: string;
  bodyStyles?: string;
  isPublished: boolean;
}

interface VisualComponentLibraryProps {
  onAddComponent?: (component: VisualComponent) => void;
  components?: VisualComponent[];
  onLayoutSelect?: (layout: Layout | null) => void;
  selectedLayoutId?: string | null;
}

export default function VisualComponentLibrary({
  onAddComponent: externalAddComponent,
  components: externalComponents,
  onLayoutSelect,
  selectedLayoutId,
}: VisualComponentLibraryProps = {}) {
  const store = useVisualBuilderStore();
  const addComponent = externalAddComponent || store.addComponent;
  const components = externalComponents || store.components;
  const sectionComponents = store.sectionComponents;
  const activeSectionId = store.activeSectionId;
  const selectedComponentId = store.selectedComponentId;
  const projectName = store.projectName;

  // Get all components from active section and fallback deprecated components
  const getAllComponents = (): VisualComponent[] => {
    if (activeSectionId && sectionComponents[activeSectionId]) {
      return sectionComponents[activeSectionId];
    }
    return components;
  };
  const [targetColumn, setTargetColumn] = useState<number | null>(null);
  const [layouts, setLayouts] = useState<LayoutEntity[]>([]);
  const [loadingLayouts, setLoadingLayouts] = useState(false);
  const [layoutsExpanded, setLayoutsExpanded] = useState(true);

  // Fetch layouts for current project
  useEffect(() => {
    const fetchLayouts = async () => {
      if (!projectName || projectName === 'Untitled Project') return;

      setLoadingLayouts(true);
      try {
        const baseUrl = import.meta.env.DEV ? 'http://localhost:3001' : '';
        const response = await fetch(`${baseUrl}/api/pages?type=layout&project=${encodeURIComponent(projectName)}`);
        if (response.ok) {
          const data = await response.json();
          setLayouts(data.data || []);
        }
      } catch (err) {
        console.error('Failed to fetch layouts:', err);
      } finally {
        setLoadingLayouts(false);
      }
    };

    fetchLayouts();
  }, [projectName]);

  // Handle layout selection
  const handleLayoutSelect = async (layoutEntity: LayoutEntity | null) => {
    if (!onLayoutSelect) return;

    if (!layoutEntity) {
      onLayoutSelect(null);
      return;
    }

    try {
      // Parse body sections (or create default from bodyStyles for backward compatibility)
      let bodySections: BodySection[] = [];
      if (layoutEntity.bodySections && layoutEntity.bodySections !== '[]') {
        bodySections = JSON.parse(layoutEntity.bodySections);
      }
      // Backward compatibility: create a single body section from bodyStyles if no bodySections
      if (bodySections.length === 0) {
        const existingBodyStyles = layoutEntity.bodyStyles ? JSON.parse(layoutEntity.bodyStyles) : {};
        bodySections = [{
          id: 'body-section-1',
          name: 'Body Section 1',
          styles: { ...defaultBodyStyles, ...existingBodyStyles },
        }];
      }

      // Parse the layout components
      const layout: Layout = {
        rowKey: layoutEntity.rowKey,
        partitionKey: layoutEntity.partitionKey,
        name: layoutEntity.name,
        slug: layoutEntity.slug,
        description: layoutEntity.description,
        isDefault: layoutEntity.isDefault,
        headerComponents: layoutEntity.headerComponents ? JSON.parse(layoutEntity.headerComponents) : [],
        footerComponents: layoutEntity.footerComponents ? JSON.parse(layoutEntity.footerComponents) : [],
        bodySections,
        bodyStyles: layoutEntity.bodyStyles ? JSON.parse(layoutEntity.bodyStyles) : {},
        globalStyles: store.globalStyles,
        isPublished: layoutEntity.isPublished,
        createdAt: '',
        updatedAt: '',
      };
      onLayoutSelect(layout);
    } catch (err) {
      console.error('Failed to parse layout:', err);
    }
  };

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

  const activeComponents = getAllComponents();
  const selectedComponent = findComponent(selectedComponentId, activeComponents);
  const selectedRow = selectedComponent?.type === 'Row' ? selectedComponent : null;
  const rowComponents = findRowComponents(activeComponents);

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
    <div className="w-64 bg-white border-r border-gray-200 h-full flex flex-col min-h-0">
      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {/* Layout Preview Section */}
        {onLayoutSelect && (
          <div className="p-4 border-b border-gray-200" style={{ minHeight: '120px' }}>
            <button
              onClick={() => setLayoutsExpanded(!layoutsExpanded)}
              className="flex items-center justify-between w-full text-left"
            >
              <h2 className="text-lg font-semibold text-gray-800">Layout Preview</h2>
              <svg
                className={`w-5 h-5 text-gray-500 transition-transform ${layoutsExpanded ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {layoutsExpanded && (
              <div className="mt-3">
                {loadingLayouts ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-400"></div>
                    <span className="ml-2 text-xs text-gray-500">Loading layouts...</span>
                  </div>
                ) : layouts.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-xs text-gray-500 mb-2">
                      {projectName === 'Untitled Project'
                        ? 'Name your project to see layouts'
                        : 'No layouts for this project'}
                    </p>
                    <a
                      href="/layout-editor"
                      className="text-xs text-blue-600 hover:text-blue-700"
                    >
                      Create a layout →
                    </a>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {/* No Layout Option */}
                    <div
                      onClick={() => handleLayoutSelect(null)}
                      className={`cursor-pointer rounded-lg border p-2 transition-all ${
                        !selectedLayoutId
                          ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-8 bg-gray-100 rounded flex items-center justify-center">
                          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-700 truncate">No Layout</p>
                          <p className="text-[10px] text-gray-400">Content only</p>
                        </div>
                      </div>
                    </div>

                    {/* Layout Options */}
                    {layouts.map((layout) => (
                      <div
                        key={layout.rowKey}
                        onClick={() => handleLayoutSelect(layout)}
                        className={`cursor-pointer rounded-lg border p-2 transition-all ${
                          selectedLayoutId === layout.rowKey
                            ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {/* Mini Layout Preview */}
                          <div className="w-12 h-8 bg-gray-100 rounded flex flex-col overflow-hidden">
                            <div className="h-1.5 bg-gray-300" /> {/* Header */}
                            <div className="flex-1 bg-white border-x border-dashed border-gray-200" /> {/* Body */}
                            <div className="h-1.5 bg-gray-300" /> {/* Footer */}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-700 truncate">{layout.name}</p>
                            <div className="flex items-center gap-1">
                              {layout.isDefault && (
                                <span className="text-[9px] px-1 py-0.5 bg-purple-100 text-purple-600 rounded">
                                  Default
                                </span>
                              )}
                              <p className="text-[10px] text-gray-400 truncate">
                                {layout.description || layout.slug}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Create New Layout Option */}
                    <a
                      href="/layout-editor"
                      className="block cursor-pointer rounded-lg border border-dashed border-gray-300 p-2 transition-all hover:border-purple-400 hover:bg-purple-50"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-8 bg-purple-50 rounded flex items-center justify-center">
                          <svg className="w-4 h-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-purple-600">Create New Layout</p>
                          <p className="text-[10px] text-gray-400">Design header & footer</p>
                        </div>
                      </div>
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div className="p-4">
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
      </div>

      {/* Component Tree - shows structure and allows reordering */}
      <div className="flex-shrink-0 border-t border-gray-200 overflow-y-auto" style={{ minHeight: '150px', maxHeight: '250px' }}>
        <ComponentTree />
      </div>
    </div>
  );
}
