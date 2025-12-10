import { useState, useRef } from 'react';
import { useVisualBuilderStore, GlobalStyles } from '../store/visualBuilderStore';
import { Link } from 'react-router-dom';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';

// Style category types for AI targeting
type StyleCategory =
  | 'header'
  | 'logo'
  | 'navigation'
  | 'typography'
  | 'buttons'
  | 'container'
  | 'row'
  | 'column'
  | 'link'
  | 'linkList'
  | 'iconBox'
  | 'footer'
  | 'divider';

interface StyleCategoryConfig {
  label: string;
  description: string;
  globalStyleKeys: (keyof GlobalStyles)[];
}

const STYLE_CATEGORIES: Record<StyleCategory, StyleCategoryConfig> = {
  'header': {
    label: 'Header',
    description: 'Navigation bar background, padding, and borders',
    globalStyleKeys: ['headerBackgroundColor', 'headerPadding', 'headerBorderWidth', 'headerBorderStyle', 'headerBorderColor', 'headerMaxWidth', 'headerJustifyContent', 'headerAlignItems'],
  },
  'logo': {
    label: 'Logo',
    description: 'Logo text styling',
    globalStyleKeys: ['logoColor', 'logoFontSize', 'logoFontWeight'],
  },
  'navigation': {
    label: 'Navigation Links',
    description: 'Nav link colors, font, and spacing',
    globalStyleKeys: ['navLinkColor', 'navLinkFontSize', 'navLinkFontWeight', 'navLinkGap', 'navLinkHoverColor', 'navDividerColor', 'navDividerHeight', 'navDividerMargin'],
  },
  'typography': {
    label: 'Typography',
    description: 'Headings (H1-H4) and body text styles',
    globalStyleKeys: [
      'titleColor', 'titleFontSize', 'titleFontWeight', 'titleMarginBottom',
      'h2Color', 'h2FontSize', 'h2FontWeight', 'h2MarginBottom',
      'h3Color', 'h3FontSize', 'h3FontWeight', 'h3MarginBottom',
      'h4Color', 'h4FontSize', 'h4FontWeight', 'h4MarginBottom',
      'subtitleColor', 'subtitleFontSize', 'subtitleFontWeight', 'subtitleMarginBottom',
    ],
  },
  'buttons': {
    label: 'Buttons',
    description: 'Primary, secondary, and outline button styles',
    globalStyleKeys: ['buttonBackgroundColor', 'buttonTextColor', 'buttonPadding', 'buttonBorderRadius', 'buttonFontSize', 'buttonFontWeight', 'buttonBorderWidth', 'buttonBorderStyle', 'buttonBorderColor'],
  },
  'container': {
    label: 'Container / Section',
    description: 'Section background, padding, and borders',
    globalStyleKeys: ['containerBackgroundColor', 'containerPadding', 'containerBorderRadius', 'containerBorderWidth', 'containerBorderStyle', 'containerBorderColor'],
  },
  'row': {
    label: 'Row Layout',
    description: 'Row spacing, padding, and background',
    globalStyleKeys: ['rowGap', 'rowPadding', 'rowBackgroundColor'],
  },
  'column': {
    label: 'Column',
    description: 'Column background, padding, and border radius',
    globalStyleKeys: ['columnBackgroundColor', 'columnPadding', 'columnBorderRadius'],
  },
  'link': {
    label: 'Links',
    description: 'Text link styles',
    globalStyleKeys: ['linkColor', 'linkFontSize', 'linkFontWeight', 'linkTextDecoration', 'linkHoverColor'],
  },
  'linkList': {
    label: 'Link Lists',
    description: 'Footer/sidebar link list styles (vertical & horizontal)',
    globalStyleKeys: ['linkListLabelColor', 'linkListLabelFontSize', 'linkListLabelFontWeight', 'linkListLabelMarginBottom', 'linkListItemColor', 'linkListItemFontSize', 'linkListItemGap'],
  },
  'iconBox': {
    label: 'Icon Box',
    description: 'Feature cards with icons',
    globalStyleKeys: ['iconBoxIconSize', 'iconBoxIconColor', 'iconBoxTitleColor', 'iconBoxTitleFontSize', 'iconBoxTitleFontWeight', 'iconBoxDescriptionColor', 'iconBoxDescriptionFontSize'],
  },
  'footer': {
    label: 'Footer',
    description: 'Footer background, padding, and text',
    globalStyleKeys: ['footerBackgroundColor', 'footerPadding', 'footerTextColor', 'footerCopyrightColor', 'footerCopyrightFontSize'],
  },
  'divider': {
    label: 'Divider',
    description: 'Horizontal line separators',
    globalStyleKeys: ['dividerColor', 'dividerHeight', 'dividerMargin'],
  },
};

type ViewMode = 'desktop' | 'tablet' | 'mobile';

export default function StyleGuide() {
  const { globalStyles, updateGlobalStyles, projectName } = useVisualBuilderStore();
  const [selectedCategory, setSelectedCategory] = useState<StyleCategory | null>(null);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('desktop');
  const styleGuideRef = useRef<HTMLDivElement>(null);

  // Get preview container width based on view mode
  const getPreviewWidth = () => {
    switch (viewMode) {
      case 'mobile': return '375px';
      case 'tablet': return '768px';
      case 'desktop': return '100%';
    }
  };

  // Helper to get style value
  const getStyle = (key: keyof GlobalStyles): string => {
    return (globalStyles[key] as string) || '';
  };

  // Export JSON
  const handleExportJSON = () => {
    const styleGuideData = {
      version: '1.0.0',
      name: `${projectName} - Style Guide`,
      exportedAt: new Date().toISOString(),
      globalStyles: globalStyles,
      categories: Object.fromEntries(
        Object.entries(STYLE_CATEGORIES).map(([key, config]) => [
          key,
          {
            label: config.label,
            description: config.description,
            styles: Object.fromEntries(
              config.globalStyleKeys.map(styleKey => [styleKey, globalStyles[styleKey] || ''])
            ),
          },
        ])
      ),
    };

    const json = JSON.stringify(styleGuideData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `styleguide_${projectName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  // Export PNG
  const handleExportPNG = async () => {
    if (!styleGuideRef.current) {
      alert('Style guide content not found');
      return;
    }

    try {
      // Temporarily expand all sections for export
      const originalSelection = selectedCategory;
      setSelectedCategory(null);
      await new Promise(resolve => setTimeout(resolve, 100));

      const dataUrl = await toPng(styleGuideRef.current, {
        backgroundColor: '#f3f4f6',
        pixelRatio: 2,
        cacheBust: true,
      });

      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `styleguide_${projectName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setSelectedCategory(originalSelection);
    } catch (error) {
      console.error('Failed to export PNG:', error);
      alert('Failed to export PNG');
    }
    setShowExportMenu(false);
  };

  // Export PDF
  const handleExportPDF = async () => {
    if (!styleGuideRef.current) {
      alert('Style guide content not found');
      return;
    }

    try {
      // Temporarily expand all sections for export
      const originalSelection = selectedCategory;
      setSelectedCategory(null);
      await new Promise(resolve => setTimeout(resolve, 100));

      const dataUrl = await toPng(styleGuideRef.current, {
        backgroundColor: '#f3f4f6',
        pixelRatio: 2,
        cacheBust: true,
      });

      const img = new Image();
      img.src = dataUrl;
      await new Promise((resolve) => { img.onload = resolve; });

      const imgWidth = img.width;
      const imgHeight = img.height;

      const pdf = new jsPDF({
        orientation: imgWidth > imgHeight ? 'landscape' : 'portrait',
        unit: 'px',
        format: [imgWidth, imgHeight],
      });

      pdf.addImage(dataUrl, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`styleguide_${projectName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${Date.now()}.pdf`);

      setSelectedCategory(originalSelection);
    } catch (error) {
      console.error('Failed to export PDF:', error);
      alert('Failed to export PDF');
    }
    setShowExportMenu(false);
  };

  // Render preview for each category
  const renderPreview = (category: StyleCategory, mode: ViewMode) => {
    const mobile = mode === 'mobile';
    const tablet = mode === 'tablet';

    switch (category) {
      case 'header':
        const isCompact = mobile || tablet;
        return (
          <header
            style={{
              display: 'flex',
              backgroundColor: getStyle('headerBackgroundColor'),
              padding: isCompact ? '12px 16px' : getStyle('headerPadding'),
              justifyContent: 'space-between',
              alignItems: 'center',
              borderWidth: getStyle('headerBorderWidth'),
              borderStyle: getStyle('headerBorderStyle'),
              borderColor: getStyle('headerBorderColor'),
            }}
          >
            <span style={{
              color: getStyle('logoColor'),
              fontSize: isCompact ? '18px' : getStyle('logoFontSize'),
              fontWeight: getStyle('logoFontWeight'),
            }}>
              Logo
            </span>
            {isCompact ? (
              /* Hamburger Menu for Mobile/Tablet */
              <button
                aria-label="Toggle navigation menu"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                }}
              >
                <span style={{ width: '20px', height: '2px', backgroundColor: getStyle('navLinkColor') || '#fff', display: 'block' }} />
                <span style={{ width: '20px', height: '2px', backgroundColor: getStyle('navLinkColor') || '#fff', display: 'block' }} />
                <span style={{ width: '20px', height: '2px', backgroundColor: getStyle('navLinkColor') || '#fff', display: 'block' }} />
              </button>
            ) : (
              /* Desktop Navigation */
              <nav style={{
                display: 'flex',
                gap: getStyle('navLinkGap') || '32px',
                alignItems: 'center',
              }}>
                {['Home', 'About', 'Services', 'Contact'].map((link) => (
                  <a
                    key={link}
                    href="#"
                    onClick={(e) => e.preventDefault()}
                    style={{
                      color: getStyle('navLinkColor'),
                      fontSize: getStyle('navLinkFontSize'),
                      fontWeight: getStyle('navLinkFontWeight'),
                      textDecoration: 'none',
                    }}
                  >
                    {link}
                  </a>
                ))}
              </nav>
            )}
          </header>
        );

      case 'logo':
        return (
          <div style={{ padding: '20px', backgroundColor: getStyle('headerBackgroundColor') }}>
            <span style={{ color: getStyle('logoColor'), fontSize: getStyle('logoFontSize'), fontWeight: getStyle('logoFontWeight') }}>
              Brand Logo
            </span>
          </div>
        );

      case 'navigation':
        return (
          <nav style={{
            display: 'flex',
            flexDirection: mobile ? 'column' : 'row',
            flexWrap: tablet ? 'wrap' : 'nowrap',
            gap: mobile ? '8px' : (getStyle('navLinkGap') || '32px'),
            padding: mobile ? '16px' : '20px',
            backgroundColor: getStyle('headerBackgroundColor'),
            alignItems: mobile ? 'center' : 'center',
          }}>
            {['Home', 'Products', 'Pricing', 'Blog', 'Contact'].map((link) => (
              <a
                key={link}
                href="#"
                onClick={(e) => e.preventDefault()}
                style={{
                  color: getStyle('navLinkColor'),
                  fontSize: mobile ? '14px' : getStyle('navLinkFontSize'),
                  fontWeight: getStyle('navLinkFontWeight'),
                  textDecoration: 'none',
                }}
              >
                {link}
              </a>
            ))}
          </nav>
        );

      case 'typography':
        // Scale typography for mobile
        const getResponsiveFontSize = (desktopSize: string, mobileScale: number = 0.75) => {
          if (!mobile) return desktopSize;
          const size = parseInt(desktopSize) || 16;
          return `${Math.round(size * mobileScale)}px`;
        };
        return (
          <div style={{ padding: mobile ? '20px' : '30px', backgroundColor: getStyle('containerBackgroundColor') }}>
            {/* H1 */}
            <div style={{ marginBottom: mobile ? '16px' : '24px' }}>
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginBottom: '4px', display: 'block' }}>H1 - Title</span>
              <h1 style={{
                color: getStyle('titleColor'),
                fontSize: mobile ? getResponsiveFontSize(getStyle('titleFontSize') || '48px', 0.65) : getStyle('titleFontSize'),
                fontWeight: getStyle('titleFontWeight'),
                margin: 0,
              }}>
                Main Page Heading
              </h1>
            </div>
            {/* H2 */}
            <div style={{ marginBottom: mobile ? '14px' : '20px' }}>
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginBottom: '4px', display: 'block' }}>H2 - Section Title</span>
              <h2 style={{
                color: getStyle('h2Color') || getStyle('titleColor'),
                fontSize: mobile ? '22px' : (getStyle('h2FontSize') || '32px'),
                fontWeight: getStyle('h2FontWeight') || '700',
                margin: 0,
              }}>
                Section Heading
              </h2>
            </div>
            {/* H3 */}
            <div style={{ marginBottom: mobile ? '12px' : '16px' }}>
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginBottom: '4px', display: 'block' }}>H3 - Subsection</span>
              <h3 style={{
                color: getStyle('h3Color') || getStyle('titleColor'),
                fontSize: mobile ? '18px' : (getStyle('h3FontSize') || '24px'),
                fontWeight: getStyle('h3FontWeight') || '600',
                margin: 0,
              }}>
                Subsection Heading
              </h3>
            </div>
            {/* H4 */}
            <div style={{ marginBottom: mobile ? '12px' : '16px' }}>
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginBottom: '4px', display: 'block' }}>H4 - Card Title</span>
              <h4 style={{
                color: getStyle('h4Color') || getStyle('titleColor'),
                fontSize: mobile ? '16px' : (getStyle('h4FontSize') || '20px'),
                fontWeight: getStyle('h4FontWeight') || '600',
                margin: 0,
              }}>
                Card or Component Title
              </h4>
            </div>
            {/* Body Text */}
            <div>
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginBottom: '4px', display: 'block' }}>Body Text</span>
              <p style={{
                color: getStyle('subtitleColor'),
                fontSize: mobile ? '14px' : getStyle('subtitleFontSize'),
                fontWeight: getStyle('subtitleFontWeight'),
                margin: 0,
                lineHeight: '1.6',
              }}>
                This is body text that appears throughout the website. It provides detailed information and context to your visitors.
              </p>
            </div>
          </div>
        );

      case 'buttons':
        return (
          <div style={{ padding: mobile ? '16px' : '30px', backgroundColor: getStyle('containerBackgroundColor') }}>
            {/* Button Variants */}
            <div style={{ display: 'flex', flexDirection: mobile ? 'column' : 'row', flexWrap: 'wrap', gap: mobile ? '12px' : '16px', alignItems: mobile ? 'stretch' : 'center', marginBottom: '24px' }}>
              <div>
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginBottom: '8px', display: 'block' }}>Primary</span>
                <button style={{
                  backgroundColor: getStyle('buttonBackgroundColor'),
                  color: getStyle('buttonTextColor'),
                  padding: mobile ? '10px 16px' : getStyle('buttonPadding'),
                  borderRadius: getStyle('buttonBorderRadius'),
                  fontSize: mobile ? '14px' : getStyle('buttonFontSize'),
                  fontWeight: getStyle('buttonFontWeight'),
                  borderWidth: getStyle('buttonBorderWidth') || '0',
                  borderStyle: getStyle('buttonBorderStyle') || 'solid',
                  borderColor: getStyle('buttonBorderColor'),
                  cursor: 'pointer',
                  width: mobile ? '100%' : 'auto',
                }}>
                  Primary Button
                </button>
              </div>
              <div>
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginBottom: '8px', display: 'block' }}>Secondary / Outline</span>
                <button style={{
                  backgroundColor: 'transparent',
                  color: getStyle('buttonBackgroundColor'),
                  padding: mobile ? '10px 16px' : getStyle('buttonPadding'),
                  borderRadius: getStyle('buttonBorderRadius'),
                  fontSize: mobile ? '14px' : getStyle('buttonFontSize'),
                  fontWeight: getStyle('buttonFontWeight'),
                  borderWidth: '2px',
                  borderStyle: 'solid',
                  borderColor: getStyle('buttonBackgroundColor'),
                  cursor: 'pointer',
                  width: mobile ? '100%' : 'auto',
                }}>
                  Secondary Button
                </button>
              </div>
              <div>
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginBottom: '8px', display: 'block' }}>Ghost / Text</span>
                <button style={{
                  backgroundColor: 'transparent',
                  color: getStyle('buttonBackgroundColor'),
                  padding: mobile ? '10px 16px' : getStyle('buttonPadding'),
                  borderRadius: getStyle('buttonBorderRadius'),
                  fontSize: mobile ? '14px' : getStyle('buttonFontSize'),
                  fontWeight: getStyle('buttonFontWeight'),
                  border: 'none',
                  cursor: 'pointer',
                  width: mobile ? '100%' : 'auto',
                }}>
                  Ghost Button
                </button>
              </div>
            </div>
            {/* Button Sizes */}
            {!mobile && (
              <div>
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginBottom: '8px', display: 'block' }}>Sizes</span>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <button style={{
                    backgroundColor: getStyle('buttonBackgroundColor'),
                    color: getStyle('buttonTextColor'),
                    padding: '8px 16px',
                    borderRadius: getStyle('buttonBorderRadius'),
                    fontSize: '13px',
                    fontWeight: getStyle('buttonFontWeight'),
                    border: 'none',
                    cursor: 'pointer',
                  }}>
                    Small
                  </button>
                  <button style={{
                    backgroundColor: getStyle('buttonBackgroundColor'),
                    color: getStyle('buttonTextColor'),
                    padding: getStyle('buttonPadding'),
                    borderRadius: getStyle('buttonBorderRadius'),
                    fontSize: getStyle('buttonFontSize'),
                    fontWeight: getStyle('buttonFontWeight'),
                    border: 'none',
                    cursor: 'pointer',
                  }}>
                    Medium
                  </button>
                  <button style={{
                    backgroundColor: getStyle('buttonBackgroundColor'),
                    color: getStyle('buttonTextColor'),
                    padding: '16px 40px',
                    borderRadius: getStyle('buttonBorderRadius'),
                    fontSize: '17px',
                    fontWeight: getStyle('buttonFontWeight'),
                    border: 'none',
                    cursor: 'pointer',
                  }}>
                    Large
                  </button>
                </div>
              </div>
            )}
          </div>
        );

      case 'container':
        return (
          <div style={{
            backgroundColor: getStyle('containerBackgroundColor'),
            padding: getStyle('containerPadding'),
            borderRadius: getStyle('containerBorderRadius'),
            borderWidth: getStyle('containerBorderWidth'),
            borderStyle: getStyle('containerBorderStyle'),
            borderColor: getStyle('containerBorderColor'),
          }}>
            <h2 style={{ color: getStyle('titleColor'), fontSize: '24px', fontWeight: '600', marginBottom: '12px' }}>
              Section Title
            </h2>
            <p style={{ color: getStyle('subtitleColor'), fontSize: getStyle('subtitleFontSize'), margin: 0 }}>
              This is a content section with the container styles applied.
            </p>
          </div>
        );

      case 'row':
        return (
          <div style={{
            display: 'flex',
            flexDirection: mobile ? 'column' : 'row',
            gap: mobile ? '12px' : getStyle('rowGap'),
            padding: mobile ? '16px' : getStyle('rowPadding'),
            backgroundColor: getStyle('rowBackgroundColor') || '#f5f5f5',
          }}>
            {[1, 2, 3].map((col) => (
              <div key={col} style={{
                flex: mobile ? 'none' : 1,
                width: mobile ? '100%' : 'auto',
                backgroundColor: getStyle('columnBackgroundColor') || '#ffffff',
                padding: mobile ? '12px' : getStyle('columnPadding'),
                borderRadius: getStyle('columnBorderRadius'),
                textAlign: 'center',
              }}>
                Column {col}
              </div>
            ))}
          </div>
        );

      case 'column':
        return (
          <div style={{
            display: 'flex',
            flexDirection: mobile ? 'column' : 'row',
            gap: mobile ? '12px' : '16px',
            padding: mobile ? '16px' : '20px',
            backgroundColor: '#f0f0f0',
          }}>
            {[1, 2].map((col) => (
              <div key={col} style={{
                flex: mobile ? 'none' : 1,
                width: mobile ? '100%' : 'auto',
                backgroundColor: getStyle('columnBackgroundColor') || '#ffffff',
                padding: mobile ? '16px' : getStyle('columnPadding'),
                borderRadius: getStyle('columnBorderRadius'),
                minHeight: mobile ? '60px' : '80px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                Column Content
              </div>
            ))}
          </div>
        );

      case 'link':
        return (
          <div style={{ padding: '20px', backgroundColor: getStyle('containerBackgroundColor') }}>
            <p style={{ color: getStyle('subtitleColor'), margin: 0 }}>
              Check out our{' '}
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                style={{
                  color: getStyle('linkColor'),
                  fontSize: getStyle('linkFontSize'),
                  fontWeight: getStyle('linkFontWeight'),
                  textDecoration: getStyle('linkTextDecoration'),
                }}
              >
                documentation
              </a>
              {' '}and{' '}
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                style={{
                  color: getStyle('linkColor'),
                  fontSize: getStyle('linkFontSize'),
                  fontWeight: getStyle('linkFontWeight'),
                  textDecoration: getStyle('linkTextDecoration'),
                }}
              >
                getting started guide
              </a>
              .
            </p>
          </div>
        );

      case 'linkList':
        return (
          <div style={{ padding: mobile ? '20px' : '30px', backgroundColor: getStyle('footerBackgroundColor') }}>
            <div style={{ display: 'flex', flexDirection: mobile ? 'column' : 'row', gap: mobile ? '24px' : '60px' }}>
              {/* Vertical Layout */}
              <div>
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginBottom: '12px', display: 'block' }}>Vertical Layout</span>
                <div style={{
                  color: getStyle('linkListLabelColor'),
                  fontSize: mobile ? '14px' : getStyle('linkListLabelFontSize'),
                  fontWeight: getStyle('linkListLabelFontWeight'),
                  marginBottom: getStyle('linkListLabelMarginBottom') || '12px',
                }}>
                  Resources
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: getStyle('linkListItemGap') || '8px' }}>
                  {['Documentation', 'API Reference', 'Tutorials', 'Blog'].map((item) => (
                    <a
                      key={item}
                      href="#"
                      onClick={(e) => e.preventDefault()}
                      style={{
                        color: getStyle('linkListItemColor'),
                        fontSize: mobile ? '13px' : getStyle('linkListItemFontSize'),
                        textDecoration: 'none',
                      }}
                    >
                      {item}
                    </a>
                  ))}
                </div>
              </div>
              {/* Another Vertical Column */}
              <div>
                <div style={{
                  color: getStyle('linkListLabelColor'),
                  fontSize: mobile ? '14px' : getStyle('linkListLabelFontSize'),
                  fontWeight: getStyle('linkListLabelFontWeight'),
                  marginBottom: getStyle('linkListLabelMarginBottom') || '12px',
                  marginTop: mobile ? '0' : '24px',
                }}>
                  Company
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: getStyle('linkListItemGap') || '8px' }}>
                  {['About Us', 'Careers', 'Contact', 'Press'].map((item) => (
                    <a
                      key={item}
                      href="#"
                      onClick={(e) => e.preventDefault()}
                      style={{
                        color: getStyle('linkListItemColor'),
                        fontSize: mobile ? '13px' : getStyle('linkListItemFontSize'),
                        textDecoration: 'none',
                      }}
                    >
                      {item}
                    </a>
                  ))}
                </div>
              </div>
              {/* Horizontal Layout - hide on mobile */}
              {!mobile && (
                <div>
                  <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginBottom: '12px', display: 'block' }}>Horizontal Layout</span>
                  <div style={{
                    color: getStyle('linkListLabelColor'),
                    fontSize: getStyle('linkListLabelFontSize'),
                    fontWeight: getStyle('linkListLabelFontWeight'),
                    marginBottom: getStyle('linkListLabelMarginBottom') || '12px',
                  }}>
                    Quick Links
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'row', gap: getStyle('linkListItemGap') || '8px', flexWrap: 'wrap' }}>
                    {['Home', 'Features', 'Pricing', 'FAQ'].map((item) => (
                      <a
                        key={item}
                        href="#"
                        onClick={(e) => e.preventDefault()}
                        style={{
                          color: getStyle('linkListItemColor'),
                          fontSize: getStyle('linkListItemFontSize'),
                          textDecoration: 'none',
                        }}
                      >
                        {item}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'iconBox':
        return (
          <div style={{ padding: mobile ? '20px' : '30px', backgroundColor: '#ffffff' }}>
            {/* Top Layout (Icon on top) */}
            <div style={{ marginBottom: mobile ? '20px' : '30px' }}>
              <span style={{ color: '#999', fontSize: '12px', marginBottom: '16px', display: 'block' }}>Icon Top Layout</span>
              <div style={{ display: 'flex', flexDirection: mobile ? 'column' : 'row', gap: mobile ? '20px' : '24px' }}>
                {[
                  { icon: '🚀', title: 'Fast', desc: 'Lightning quick performance' },
                  { icon: '🔒', title: 'Secure', desc: 'Enterprise-grade security' },
                  { icon: '⚡', title: 'Powerful', desc: 'Advanced features built-in' },
                ].map((item) => (
                  <div key={item.title} style={{ flex: mobile ? 'none' : 1, textAlign: 'center' }}>
                    <span style={{ fontSize: mobile ? '28px' : getStyle('iconBoxIconSize'), display: 'block', marginBottom: '12px' }}>
                      {item.icon}
                    </span>
                    <div style={{
                      color: getStyle('iconBoxTitleColor'),
                      fontSize: mobile ? '16px' : getStyle('iconBoxTitleFontSize'),
                      fontWeight: getStyle('iconBoxTitleFontWeight'),
                      marginBottom: '8px',
                    }}>
                      {item.title}
                    </div>
                    <div style={{
                      color: getStyle('iconBoxDescriptionColor'),
                      fontSize: mobile ? '13px' : getStyle('iconBoxDescriptionFontSize'),
                    }}>
                      {item.desc}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Left Layout (Icon on left) */}
            <div>
              <span style={{ color: '#999', fontSize: '12px', marginBottom: '16px', display: 'block' }}>Icon Left Layout</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: mobile ? '12px' : '16px' }}>
                {[
                  { icon: '📊', title: 'Analytics', desc: 'Track your progress with detailed insights' },
                  { icon: '🎯', title: 'Goals', desc: 'Set and achieve your targets' },
                ].map((item) => (
                  <div key={item.title} style={{ display: 'flex', alignItems: 'flex-start', gap: mobile ? '12px' : '16px' }}>
                    <span style={{ fontSize: mobile ? '24px' : getStyle('iconBoxIconSize'), flexShrink: 0 }}>
                      {item.icon}
                    </span>
                    <div>
                      <div style={{
                        color: getStyle('iconBoxTitleColor'),
                        fontSize: mobile ? '15px' : getStyle('iconBoxTitleFontSize'),
                        fontWeight: getStyle('iconBoxTitleFontWeight'),
                        marginBottom: '4px',
                      }}>
                        {item.title}
                      </div>
                      <div style={{
                        color: getStyle('iconBoxDescriptionColor'),
                        fontSize: mobile ? '13px' : getStyle('iconBoxDescriptionFontSize'),
                      }}>
                        {item.desc}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'footer':
        return (
          <footer style={{
            backgroundColor: getStyle('footerBackgroundColor'),
            padding: mobile ? '20px' : getStyle('footerPadding'),
          }}>
            <div style={{ display: 'flex', flexDirection: mobile ? 'column' : 'row', gap: mobile ? '24px' : '60px', marginBottom: mobile ? '20px' : '30px' }}>
              {['Company', 'Product', 'Resources'].map((section) => (
                <div key={section}>
                  <div style={{
                    color: getStyle('footerTextColor'),
                    fontSize: mobile ? '14px' : getStyle('linkListLabelFontSize'),
                    fontWeight: getStyle('linkListLabelFontWeight'),
                    marginBottom: mobile ? '8px' : '12px',
                  }}>
                    {section}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: mobile ? '6px' : '8px' }}>
                    {['Link 1', 'Link 2', 'Link 3'].map((link) => (
                      <a
                        key={link}
                        href="#"
                        onClick={(e) => e.preventDefault()}
                        style={{
                          color: getStyle('linkListItemColor'),
                          fontSize: mobile ? '13px' : getStyle('linkListItemFontSize'),
                          textDecoration: 'none',
                        }}
                      >
                        {link}
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div style={{
              color: getStyle('footerCopyrightColor'),
              fontSize: mobile ? '12px' : getStyle('footerCopyrightFontSize'),
              paddingTop: mobile ? '16px' : '20px',
              borderTop: '1px solid rgba(255,255,255,0.1)',
              textAlign: mobile ? 'center' : 'left',
            }}>
              © 2024 Company Name. All Rights Reserved.
            </div>
          </footer>
        );

      case 'divider':
        return (
          <div style={{ padding: '20px', backgroundColor: getStyle('containerBackgroundColor') }}>
            <p style={{ color: getStyle('subtitleColor'), marginBottom: getStyle('dividerMargin') }}>Content above divider</p>
            <hr style={{
              border: 'none',
              borderTop: `${getStyle('dividerHeight')} solid ${getStyle('dividerColor')}`,
              margin: getStyle('dividerMargin'),
            }} />
            <p style={{ color: getStyle('subtitleColor'), marginTop: getStyle('dividerMargin') }}>Content below divider</p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
          <Link
            to="/"
            className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Builder
          </Link>
          <div className="h-6 w-px bg-gray-300" />
          <h1 className="text-xl font-semibold text-gray-900">Style Guide</h1>
        </div>
        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('desktop')}
              className={`p-2 rounded-md transition-colors ${viewMode === 'desktop' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
              title="Desktop view"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('tablet')}
              className={`p-2 rounded-md transition-colors ${viewMode === 'tablet' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
              title="Tablet view (768px)"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('mobile')}
              className={`p-2 rounded-md transition-colors ${viewMode === 'mobile' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
              title="Mobile view (375px)"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </button>
          </div>

          <div className="h-6 w-px bg-gray-300" />

          {/* Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Export
              <svg className={`w-4 h-4 transition-transform ${showExportMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showExportMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowExportMenu(false)} />
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                  <button
                    onClick={handleExportJSON}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Export JSON
                  </button>
                  <button
                    onClick={handleExportPNG}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Export PNG
                  </button>
                  <button
                    onClick={handleExportPDF}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    Export PDF
                  </button>
                </div>
              </>
            )}
          </div>

          {/* AI Style Button */}
          <button
            onClick={() => setIsAIModalOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:from-purple-600 hover:to-indigo-700 font-medium flex items-center gap-2"
          >
            <span>✨</span>
            Style with AI
          </button>
        </div>
      </div>
    </div>

      {/* Main Content */}
      <div ref={styleGuideRef} className="py-8 px-6 flex justify-center">
        <div className="w-full max-w-6xl">
        {/* Instructions */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">How to use</h2>
          <p className="text-gray-600">
            Click on any element below to edit its styles. Changes are saved automatically and will be reflected in the Visual Builder.
            Use the "Style with AI" button to apply styles from a reference image or text description.
          </p>
        </div>

        {/* Style Categories Grid */}
        <div className="space-y-6">
          {(Object.keys(STYLE_CATEGORIES) as StyleCategory[]).map((category) => {
            const config = STYLE_CATEGORIES[category];
            const isSelected = selectedCategory === category;

            return (
              <div
                key={category}
                className={`bg-white rounded-xl shadow-sm overflow-hidden transition-all ${
                  isSelected ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                {/* Category Header */}
                <div
                  onClick={() => setSelectedCategory(isSelected ? null : category)}
                  className="px-6 py-4 border-b border-gray-100 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                >
                  <div>
                    <h3 className="font-semibold text-gray-900">{config.label}</h3>
                    <p className="text-sm text-gray-500">{config.description}</p>
                  </div>
                  <svg
                    className={`w-5 h-5 text-gray-400 transition-transform ${isSelected ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>

                {/* Preview */}
                <div className="border-b border-gray-100 overflow-auto bg-gray-50 flex justify-center p-4">
                  <div
                    style={{ width: getPreviewWidth(), minWidth: viewMode !== 'desktop' ? getPreviewWidth() : undefined }}
                    className={`transition-all duration-300 ${viewMode !== 'desktop' ? 'shadow-lg rounded-lg overflow-hidden border border-gray-200' : ''}`}
                  >
                    {renderPreview(category, viewMode)}
                  </div>
                </div>

                {/* Style Editor (shown when selected) */}
                {isSelected && (
                  <div className="px-6 py-4 bg-gray-50">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {config.globalStyleKeys.map((key) => (
                        <div key={key}>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            {formatStyleKey(key)}
                          </label>
                          {key.toLowerCase().includes('color') ? (
                            <div className="flex gap-2">
                              <input
                                type="color"
                                value={getStyle(key) || '#000000'}
                                onChange={(e) => updateGlobalStyles({ [key]: e.target.value })}
                                className="w-10 h-8 rounded border border-gray-300 cursor-pointer"
                              />
                              <input
                                type="text"
                                value={getStyle(key)}
                                onChange={(e) => updateGlobalStyles({ [key]: e.target.value })}
                                placeholder="#000000"
                                className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            </div>
                          ) : (
                            <input
                              type="text"
                              value={getStyle(key)}
                              onChange={(e) => updateGlobalStyles({ [key]: e.target.value })}
                              placeholder={getPlaceholder(key)}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        </div>
      </div>

      {/* AI Styler Modal */}
      {isAIModalOpen && (
        <AIStylerModal
          isOpen={isAIModalOpen}
          onClose={() => setIsAIModalOpen(false)}
          targetCategory={selectedCategory}
        />
      )}
    </div>
  );
}

// Helper to format style key for display
function formatStyleKey(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

// Get placeholder based on style type
function getPlaceholder(key: string): string {
  if (key.toLowerCase().includes('padding') || key.toLowerCase().includes('margin')) {
    return '12px 24px';
  }
  if (key.toLowerCase().includes('size') || key.toLowerCase().includes('height') || key.toLowerCase().includes('width')) {
    return '16px';
  }
  if (key.toLowerCase().includes('weight')) {
    return '500';
  }
  if (key.toLowerCase().includes('radius')) {
    return '8px';
  }
  if (key.toLowerCase().includes('gap')) {
    return '16px';
  }
  return '';
}

// AI Styler Modal Component
interface AIStylerModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetCategory: StyleCategory | null;
}

function AIStylerModal({ isOpen, onClose, targetCategory }: AIStylerModalProps) {
  const { updateGlobalStyles, setGlobalStyles } = useVisualBuilderStore();
  const [prompt, setPrompt] = useState('');
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [mode, setMode] = useState<'prompt' | 'image'>('image');

  // Azure OpenAI configuration from environment variables
  const apiKey = import.meta.env.VITE_AZURE_OPENAI_KEY || '';
  const azureEndpoint = import.meta.env.VITE_AZURE_OPENAI_ENDPOINT || 'https://boris-m94gthfb-eastus2.cognitiveservices.azure.com';
  const apiVersion = '2024-12-01-preview';

  const targetInfo = targetCategory ? STYLE_CATEGORIES[targetCategory] : null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const maxSize = 1024;
      let { width, height } = img;

      if (width > height && width > maxSize) {
        height = (height * maxSize) / width;
        width = maxSize;
      } else if (height > maxSize) {
        width = (width * maxSize) / height;
        height = maxSize;
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, width, height);
      const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setReferenceImage(compressedDataUrl);
      setError('');
    };
    img.onerror = () => setError('Failed to load image');
    img.src = URL.createObjectURL(file);
  };

  const buildPrompt = (): string => {
    const basePrompt = `You are a UI design expert. Analyze this website screenshot and extract styles.

Return ONLY a valid JSON object with globalStyles.`;

    if (targetCategory && targetInfo) {
      return `${basePrompt}

IMPORTANT: Focus specifically on extracting styles for: ${targetInfo.label}
Description: ${targetInfo.description}

Only include these properties in your response:
${targetInfo.globalStyleKeys.map(k => `- ${k}`).join('\n')}

Return format:
{
  "globalStyles": {
    ${targetInfo.globalStyleKeys.map(k => `"${k}": "extracted_value"`).join(',\n    ')}
  }
}`;
    }

    return `${basePrompt}

Extract a complete style guide including:
- Header: background, padding, borders
- Logo: color, size, weight
- Navigation: link colors, sizes, spacing
- Typography: title and body text styles
- Buttons: background, text, padding, radius
- Containers: background, padding, radius
- Footer: background, text colors
- Dividers: color, height

Return format:
{
  "globalStyles": {
    "headerBackgroundColor": "#...",
    "headerPadding": "...",
    "logoColor": "#...",
    "logoFontSize": "...",
    "logoFontWeight": "...",
    "navLinkColor": "#...",
    "navLinkFontSize": "...",
    "navLinkGap": "...",
    "titleColor": "#...",
    "titleFontSize": "...",
    "titleFontWeight": "...",
    "subtitleColor": "#...",
    "subtitleFontSize": "...",
    "buttonBackgroundColor": "#...",
    "buttonTextColor": "#...",
    "buttonPadding": "...",
    "buttonBorderRadius": "...",
    "buttonFontSize": "...",
    "buttonFontWeight": "...",
    "containerBackgroundColor": "#...",
    "containerPadding": "...",
    "footerBackgroundColor": "#...",
    "footerTextColor": "#...",
    "linkColor": "#...",
    "dividerColor": "#...",
    "dividerHeight": "..."
  }
}`;
  };

  const handleExtractFromImage = async () => {
    if (!apiKey.trim()) {
      setError('Please enter your Azure OpenAI API key');
      return;
    }
    if (!referenceImage) {
      setError('Please upload a reference image');
      return;
    }

    setLoading(true);
    setError('');
    setStatus('Analyzing image...');

    try {
      setStatus('Extracting styles...');
      // Azure OpenAI endpoint for vision-capable model
      const deploymentName = 'gpt-4o';
      const response = await fetch(`${azureEndpoint}/openai/deployments/${deploymentName}/chat/completions?api-version=${apiVersion}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': apiKey,
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: buildPrompt() },
                { type: 'image_url', image_url: { url: referenceImage } },
              ],
            },
          ],
          max_completion_tokens: 4000,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error?.message || `API error: ${response.status}`);
      }

      const data = await response.json();
      const responseText = data.choices[0]?.message?.content || '';

      setStatus('Processing response...');

      let cleanedJson = responseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      const jsonMatch = cleanedJson.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanedJson = jsonMatch[0];
      }

      const extractedStyles = JSON.parse(cleanedJson);

      if (extractedStyles.globalStyles) {
        setStatus('Applying styles...');
        // Fully replace styles to avoid conflicts with manual changes
        setGlobalStyles(extractedStyles.globalStyles);
      } else {
        throw new Error('Could not extract styles from image');
      }

      setStatus('Done!');
      setTimeout(onClose, 500);
    } catch (err: any) {
      console.error('Style extraction error:', err);
      setError(err.message || 'Failed to extract styles. Try a clearer screenshot.');
    } finally {
      setLoading(false);
      setStatus('');
    }
  };

  const handleStyleWithPrompt = async () => {
    if (!apiKey.trim()) {
      setError('Please enter your Azure OpenAI API key');
      return;
    }
    if (!prompt.trim()) {
      setError('Please provide a style description');
      return;
    }

    setLoading(true);
    setError('');
    setStatus('Generating styles...');

    try {
      const systemPrompt = targetCategory && targetInfo
        ? `You are a UI stylist. Generate CSS styles based on the description.
           Focus on: ${targetInfo.label}
           Properties to set: ${targetInfo.globalStyleKeys.join(', ')}
           Return ONLY valid JSON with globalStyles object.`
        : `You are a UI stylist. Generate a complete style guide based on the description.
           Return ONLY valid JSON with globalStyles object containing colors, sizes, spacing, etc.`;

      // Azure OpenAI endpoint for text model
      const deploymentName = 'gpt-5.1-chat';
      const response = await fetch(`${azureEndpoint}/openai/deployments/${deploymentName}/chat/completions?api-version=${apiVersion}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': apiKey,
        },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt },
          ],
          max_completion_tokens: 4000,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error?.message || `API error: ${response.status}`);
      }

      const data = await response.json();
      const responseText = data.choices[0]?.message?.content || '';

      setStatus('Processing response...');

      let cleanedJson = responseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      const jsonMatch = cleanedJson.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanedJson = jsonMatch[0];
      }

      const styledResult = JSON.parse(cleanedJson);

      if (styledResult.globalStyles) {
        setStatus('Applying styles...');
        updateGlobalStyles(styledResult.globalStyles);
      }

      setStatus('Done!');
      setTimeout(onClose, 500);
    } catch (err: any) {
      console.error('Style generation error:', err);
      setError(err.message || 'Failed to generate styles. Please try again.');
    } finally {
      setLoading(false);
      setStatus('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative bg-white rounded-xl shadow-2xl w-[95vw] max-w-[550px] max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <span className="text-2xl">✨</span>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Style with AI</h2>
              {targetInfo && (
                <p className="text-sm text-gray-500">Targeting: {targetInfo.label}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6 space-y-4">
          {/* Mode Toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Styling Method</label>
            <div className="flex gap-2">
              <button
                onClick={() => setMode('image')}
                className={`flex-1 px-3 py-2 text-sm rounded-lg border transition-colors ${
                  mode === 'image'
                    ? 'bg-purple-50 border-purple-300 text-purple-700'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span className="mr-1">🖼️</span> Extract from Image
              </button>
              <button
                onClick={() => setMode('prompt')}
                className={`flex-1 px-3 py-2 text-sm rounded-lg border transition-colors ${
                  mode === 'prompt'
                    ? 'bg-purple-50 border-purple-300 text-purple-700'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span className="mr-1">📝</span> Describe Style
              </button>
            </div>
          </div>

          {/* Image Mode */}
          {mode === 'image' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reference Screenshot
              </label>
              {!referenceImage ? (
                <label className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-purple-400 hover:bg-purple-50/50 block">
                  <div className="text-3xl mb-2">📸</div>
                  <p className="text-sm text-gray-600">Click to upload screenshot</p>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG</p>
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>
              ) : (
                <div className="relative">
                  <img src={referenceImage} alt="Reference" className="w-full h-40 object-cover rounded-lg border" />
                  <button
                    onClick={() => setReferenceImage(null)}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Prompt Mode */}
          {mode === 'prompt' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Style Description</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., Modern dark theme with purple accents, rounded corners, clean typography..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm resize-none h-24"
              />
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Status */}
          {status && (
            <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg flex items-center gap-3">
              <svg className="w-5 h-5 text-purple-500 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <p className="text-sm text-purple-700">{status}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={mode === 'image' ? handleExtractFromImage : handleStyleWithPrompt}
            disabled={loading || (mode === 'image' ? !referenceImage : !prompt.trim())}
            className="px-6 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:from-purple-600 hover:to-indigo-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Processing...
              </>
            ) : (
              <>🎨 Apply Styles</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
