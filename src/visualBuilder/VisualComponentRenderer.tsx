import { VisualComponent, useVisualBuilderStore, GlobalStyles } from '../store/visualBuilderStore';

interface VisualComponentRendererProps {
  component: VisualComponent;
  isSelected: boolean;
  onSelect: () => void;
  isNested?: boolean;
}

interface ColumnStyle {
  backgroundColor?: string;
  padding?: string;
  borderRadius?: string;
  borderWidth?: string;
  borderStyle?: string;
  borderColor?: string;
}

interface ColumnDropZoneProps {
  columnIndex: number;
  children: VisualComponent[];
  width: string;
  columnStyle?: ColumnStyle;
  globalStyles: GlobalStyles;
}

function ColumnDropZone({ columnIndex, children, width, columnStyle = {}, globalStyles }: ColumnDropZoneProps) {
  const { selectComponent, selectedComponentId } = useVisualBuilderStore();

  const columnChildren = children.filter(
    (child) => child.props?.columnIndex === columnIndex
  );

  const hasContent = columnChildren.length > 0;
  const hasCustomStyles = columnStyle.backgroundColor || columnStyle.borderWidth || columnStyle.padding;

  // Use column style -> global column style -> defaults
  const bgColor = columnStyle.backgroundColor || globalStyles.columnBackgroundColor;
  const padding = columnStyle.padding || globalStyles.columnPadding;
  const borderRadius = columnStyle.borderRadius || globalStyles.columnBorderRadius || '4px';

  return (
    <div
      style={{
        flex: `0 0 calc(${width} - 10px)`,
        width: `calc(${width} - 10px)`,
        minHeight: '100px',
        backgroundColor: bgColor || (hasContent ? 'transparent' : '#f9fafb'),
        border: hasCustomStyles && columnStyle.borderWidth
          ? `${columnStyle.borderWidth} ${columnStyle.borderStyle || 'solid'} ${columnStyle.borderColor || '#e5e7eb'}`
          : (hasContent ? 'none' : '2px dashed #e5e7eb'),
        borderRadius: borderRadius,
        padding: padding || undefined,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        boxSizing: 'border-box',
      }}
    >
      {!hasContent ? (
        <div className="flex items-center justify-center h-full text-gray-400 text-sm">
          Column {columnIndex + 1}
        </div>
      ) : (
        columnChildren.map((child) => (
          <VisualComponentRenderer
            key={child.id}
            component={child}
            isSelected={selectedComponentId === child.id}
            onSelect={() => selectComponent(child.id)}
            isNested={true}
          />
        ))
      )}
    </div>
  );
}

export default function VisualComponentRenderer({
  component,
  isSelected,
  onSelect,
  isNested = false,
}: VisualComponentRendererProps) {
  const { deleteComponent, selectComponent, selectedComponentId, globalStyles } = useVisualBuilderStore();

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this component?')) {
      deleteComponent(component.id);
    }
  };

  // Helper to get style with global fallback
  const getStyle = (componentStyle: string | undefined, globalKey: keyof GlobalStyles): string | undefined => {
    return componentStyle || globalStyles[globalKey] as string | undefined;
  };

  const renderComponent = () => {
    const props = component.props || {};
    const styles = component.customStyles || {};

    if (component.type === 'Header') {
      const navLinks = props.navLinks || [];

      return (
        <header
          style={{
            display: 'flex',
            backgroundColor: getStyle(styles.backgroundColor, 'headerBackgroundColor'),
            padding: getStyle(styles.padding, 'headerPadding'),
            justifyContent: getStyle(styles.justifyContent, 'headerJustifyContent') || 'space-between',
            alignItems: getStyle(styles.alignItems, 'headerAlignItems') || 'center',
            maxWidth: styles.maxWidth || globalStyles.headerMaxWidth,
            margin: styles.margin,
            width: styles.width || '100%',
            boxSizing: 'border-box',
            // Border styles
            borderWidth: getStyle(styles.borderWidth, 'headerBorderWidth'),
            borderStyle: getStyle(styles.borderStyle, 'headerBorderStyle'),
            borderColor: getStyle(styles.borderColor, 'headerBorderColor'),
          }}
        >
          {/* Logo */}
          {props.showLogo !== false && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              {props.logoImageUrl ? (
                <img
                  src={props.logoImageUrl}
                  alt={props.logoText || 'Logo'}
                  style={{
                    height: styles.logoHeight || '32px',
                    width: 'auto',
                  }}
                />
              ) : (
                <span
                  style={{
                    color: getStyle(styles.logoColor, 'logoColor'),
                    fontSize: getStyle(styles.logoFontSize, 'logoFontSize'),
                    fontWeight: getStyle(styles.logoFontWeight, 'logoFontWeight'),
                  }}
                >
                  {props.logoText || 'Logo'}
                </span>
              )}
            </div>
          )}

          {/* Navigation Links + Divider + Language Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: getStyle(styles.navLinkGap, 'navLinkGap') || '32px' }}>
            {/* Navigation Links */}
            {props.showNavLinks !== false && navLinks.length > 0 && (
              <nav
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: getStyle(styles.navLinkGap, 'navLinkGap') || '32px',
                }}
              >
                {navLinks.map((link: { text: string; url: string }, index: number) => (
                  <a
                    key={index}
                    href={link.url}
                    onClick={(e) => e.preventDefault()}
                    style={{
                      color: getStyle(styles.navLinkColor, 'navLinkColor'),
                      fontSize: getStyle(styles.navLinkFontSize, 'navLinkFontSize'),
                      fontWeight: getStyle(styles.navLinkFontWeight, 'navLinkFontWeight'),
                      textDecoration: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    {link.text}
                  </a>
                ))}
              </nav>
            )}

            {/* Vertical Divider */}
            {props.showNavDivider && (
              <div
                style={{
                  width: '1px',
                  height: styles.navDividerHeight || '20px',
                  backgroundColor: styles.navDividerColor || getStyle(styles.navLinkColor, 'navLinkColor') || '#cccccc',
                  margin: styles.navDividerMargin || '0 8px',
                }}
              />
            )}

            {/* Language Selector */}
            {props.showLanguageSelector && props.languages && props.languages.length > 0 && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  color: getStyle(styles.navLinkColor, 'navLinkColor'),
                  fontSize: getStyle(styles.navLinkFontSize, 'navLinkFontSize'),
                  fontWeight: getStyle(styles.navLinkFontWeight, 'navLinkFontWeight'),
                  cursor: 'pointer',
                }}
              >
                <span>{props.selectedLanguage || props.languages[0]?.code}</span>
                <span style={{ fontSize: '10px' }}>▼</span>
              </div>
            )}
          </div>
        </header>
      );
    }

    if (component.type === 'HeroSection') {
      // Calculate margin based on container alignment
      const getContainerMargin = () => {
        if (styles.margin) return styles.margin;
        switch (styles.containerAlign) {
          case 'left': return '0 auto 0 0';
          case 'right': return '0 0 0 auto';
          case 'center': return '0 auto';
          default: return undefined;
        }
      };

      // Get background image URL (component or global)
      const bgImage = styles.backgroundImage || globalStyles.containerBackgroundImage;
      const bgSize = styles.backgroundSize || globalStyles.containerBackgroundSize || 'cover';
      const bgPosition = styles.backgroundPosition || globalStyles.containerBackgroundPosition || 'center';
      const bgRepeat = styles.backgroundRepeat || globalStyles.containerBackgroundRepeat || 'no-repeat';

      return (
        <div
          style={{
            backgroundColor: getStyle(styles.backgroundColor, 'containerBackgroundColor'),
            backgroundImage: bgImage ? `url(${bgImage})` : undefined,
            backgroundSize: bgImage ? bgSize : undefined,
            backgroundPosition: bgImage ? bgPosition : undefined,
            backgroundRepeat: bgImage ? bgRepeat : undefined,
            width: styles.width,
            maxWidth: styles.maxWidth,
            minHeight: styles.minHeight,
            padding: getStyle(styles.padding, 'containerPadding'),
            margin: getContainerMargin(),
            textAlign: (styles.textAlign as any) || 'center',
            // Border styles
            borderWidth: getStyle(styles.borderWidth, 'containerBorderWidth'),
            borderStyle: getStyle(styles.borderStyle, 'containerBorderStyle'),
            borderColor: getStyle(styles.borderColor, 'containerBorderColor'),
            borderRadius: getStyle(styles.borderRadius, 'containerBorderRadius'),
          }}
        >
          {/* Title */}
          <h1
            style={{
              color: getStyle(styles.titleColor, 'titleColor'),
              fontSize: getStyle(styles.titleFontSize, 'titleFontSize'),
              fontWeight: getStyle(styles.titleFontWeight, 'titleFontWeight'),
              marginBottom: getStyle(styles.titleMarginBottom, 'titleMarginBottom'),
              maxWidth: styles.titleMaxWidth,
              margin: styles.textAlign === 'center' ? '0 auto' : 0,
              marginBlockEnd: getStyle(styles.titleMarginBottom, 'titleMarginBottom'),
            }}
          >
            {props.title || 'Welcome to Our Website'}
          </h1>

          {/* Subtitle */}
          <p
            style={{
              color: getStyle(styles.subtitleColor, 'subtitleColor'),
              fontSize: getStyle(styles.subtitleFontSize, 'subtitleFontSize'),
              fontWeight: getStyle(styles.subtitleFontWeight, 'subtitleFontWeight'),
              marginBottom: getStyle(styles.subtitleMarginBottom, 'subtitleMarginBottom'),
              maxWidth: styles.subtitleMaxWidth || '600px',
              margin: styles.textAlign === 'center' ? '0 auto' : 0,
              marginBlockEnd: getStyle(styles.subtitleMarginBottom, 'subtitleMarginBottom'),
              whiteSpace: 'pre-line',
            }}
          >
            {props.subtitle || 'This is a paragraph of text that provides information to the reader.'}
          </p>

          {/* Button */}
          {props.showButton !== false && (
            <button
              style={{
                backgroundColor: getStyle(styles.buttonBackgroundColor, 'buttonBackgroundColor'),
                color: getStyle(styles.buttonTextColor, 'buttonTextColor'),
                padding: getStyle(styles.buttonPadding, 'buttonPadding'),
                borderRadius: getStyle(styles.buttonBorderRadius, 'buttonBorderRadius'),
                fontSize: getStyle(styles.buttonFontSize, 'buttonFontSize'),
                fontWeight: getStyle(styles.buttonFontWeight, 'buttonFontWeight'),
                // Button border
                borderWidth: getStyle(styles.buttonBorderWidth, 'buttonBorderWidth') || '0',
                borderStyle: getStyle(styles.buttonBorderStyle, 'buttonBorderStyle') || 'solid',
                borderColor: getStyle(styles.buttonBorderColor, 'buttonBorderColor'),
                cursor: 'pointer',
              }}
            >
              {props.buttonText || 'Get Started'}
            </button>
          )}
        </div>
      );
    }

    if (component.type === 'Image') {
      const imageElement = (
        <img
          src={props.src || 'https://via.placeholder.com/400x300?text=Add+Image+URL'}
          alt={props.alt || 'Image'}
          style={{
            width: styles.width || '100%',
            maxWidth: styles.maxWidth,
            height: styles.height || 'auto',
            objectFit: (styles.objectFit as any) || 'cover',
            borderRadius: styles.borderRadius,
            margin: styles.margin,
            display: 'block',
            // Border styles
            borderWidth: styles.borderWidth,
            borderStyle: styles.borderStyle,
            borderColor: styles.borderColor,
          }}
        />
      );

      // Wrap in link if linkUrl is provided
      if (props.linkUrl) {
        return (
          <a
            href={props.linkUrl}
            target={props.openInNewTab ? '_blank' : '_self'}
            rel={props.openInNewTab ? 'noopener noreferrer' : undefined}
            onClick={(e) => e.preventDefault()}
            style={{ display: 'block' }}
          >
            {imageElement}
          </a>
        );
      }

      return imageElement;
    }

    if (component.type === 'Row') {
      const columns = props.columns || 2;
      const columnWidths = props.columnWidths || Array(columns).fill(`${100 / columns}%`);
      const columnStyles = props.columnStyles || [];
      const children = component.children || [];

      return (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: styles.gap || globalStyles.rowGap || '20px',
            padding: styles.padding || globalStyles.rowPadding,
            backgroundColor: styles.backgroundColor || globalStyles.rowBackgroundColor || undefined,
            width: styles.width,
            maxWidth: styles.maxWidth,
            minHeight: styles.minHeight || '120px',
            margin: styles.margin,
            alignItems: styles.alignItems || 'stretch',
            justifyContent: styles.justifyContent || 'flex-start',
            // Border styles
            borderWidth: styles.borderWidth,
            borderStyle: styles.borderStyle,
            borderColor: styles.borderColor,
            borderRadius: styles.borderRadius,
          }}
        >
          {Array.from({ length: columns }).map((_, index) => (
            <ColumnDropZone
              key={index}
              columnIndex={index}
              children={children}
              width={columnWidths[index] || `${100 / columns}%`}
              columnStyle={columnStyles[index] || {}}
              globalStyles={globalStyles}
            />
          ))}
        </div>
      );
    }

    if (component.type === 'LinkList') {
      const links = props.links || [];
      const isVertical = props.layout !== 'horizontal';

      return (
        <div
          style={{
            padding: styles.padding,
            backgroundColor: styles.backgroundColor,
          }}
        >
          {/* Label */}
          {props.label && (
            <div
              style={{
                color: getStyle(styles.labelColor, 'linkListLabelColor'),
                fontSize: getStyle(styles.labelFontSize, 'linkListLabelFontSize'),
                fontWeight: getStyle(styles.labelFontWeight, 'linkListLabelFontWeight'),
                marginBottom: getStyle(styles.labelMarginBottom, 'linkListLabelMarginBottom'),
              }}
            >
              {props.label}
            </div>
          )}
          {/* Links */}
          <div
            style={{
              display: 'flex',
              flexDirection: isVertical ? 'column' : 'row',
              gap: getStyle(styles.itemGap, 'linkListItemGap'),
              flexWrap: 'wrap',
            }}
          >
            {links.map((link: { text: string; url: string }, index: number) => (
              <a
                key={index}
                href={link.url}
                onClick={(e) => e.preventDefault()}
                style={{
                  color: getStyle(styles.itemColor, 'linkListItemColor'),
                  fontSize: getStyle(styles.itemFontSize, 'linkListItemFontSize'),
                  textDecoration: 'none',
                  cursor: 'pointer',
                }}
              >
                {link.text}
              </a>
            ))}
          </div>
        </div>
      );
    }

    if (component.type === 'IconBox') {
      const isTopLayout = props.layout === 'top';
      const isLeftLayout = props.layout === 'left';

      return (
        <div
          style={{
            display: 'flex',
            flexDirection: isTopLayout ? 'column' : 'row',
            alignItems: isTopLayout ? (styles.textAlign === 'center' ? 'center' : 'flex-start') : 'flex-start',
            gap: '16px',
            padding: styles.padding,
            backgroundColor: styles.backgroundColor,
            borderRadius: styles.borderRadius,
            textAlign: styles.textAlign as any,
          }}
        >
          {/* Icon */}
          <div
            style={{
              flexShrink: 0,
              order: isLeftLayout ? 0 : (props.layout === 'right' ? 1 : 0),
            }}
          >
            {props.iconImageUrl ? (
              <img
                src={props.iconImageUrl}
                alt=""
                style={{
                  width: getStyle(styles.iconSize, 'iconBoxIconSize'),
                  height: getStyle(styles.iconSize, 'iconBoxIconSize'),
                  objectFit: 'contain',
                }}
              />
            ) : (
              <span
                style={{
                  fontSize: getStyle(styles.iconSize, 'iconBoxIconSize'),
                  display: 'block',
                }}
              >
                {props.icon || '🚀'}
              </span>
            )}
          </div>
          {/* Content */}
          <div style={{ order: isLeftLayout ? 1 : (props.layout === 'right' ? 0 : 1) }}>
            {props.title && (
              <div
                style={{
                  color: getStyle(styles.titleColor, 'iconBoxTitleColor'),
                  fontSize: getStyle(styles.titleFontSize, 'iconBoxTitleFontSize'),
                  fontWeight: getStyle(styles.titleFontWeight, 'iconBoxTitleFontWeight'),
                  marginBottom: styles.titleMarginBottom || '8px',
                }}
              >
                {props.title}
              </div>
            )}
            {props.description && (
              <div
                style={{
                  color: getStyle(styles.descriptionColor, 'iconBoxDescriptionColor'),
                  fontSize: getStyle(styles.descriptionFontSize, 'iconBoxDescriptionFontSize'),
                  whiteSpace: 'pre-line',
                }}
              >
                {props.description}
              </div>
            )}
          </div>
        </div>
      );
    }

    if (component.type === 'Text') {
      return (
        <p
          style={{
            color: getStyle(styles.color, 'subtitleColor'),
            fontSize: getStyle(styles.fontSize, 'subtitleFontSize'),
            fontWeight: getStyle(styles.fontWeight, 'subtitleFontWeight'),
            lineHeight: styles.lineHeight || '1.6',
            textAlign: styles.textAlign as any,
            padding: styles.padding,
            margin: styles.margin || 0,
            whiteSpace: 'pre-line',
          }}
        >
          {props.content || 'Text content here...'}
        </p>
      );
    }

    if (component.type === 'Button') {
      const buttonElement = (
        <button
          style={{
            backgroundColor: getStyle(styles.backgroundColor, 'buttonBackgroundColor'),
            color: getStyle(styles.textColor, 'buttonTextColor'),
            padding: getStyle(styles.padding, 'buttonPadding'),
            borderRadius: getStyle(styles.borderRadius, 'buttonBorderRadius'),
            fontSize: getStyle(styles.fontSize, 'buttonFontSize'),
            fontWeight: getStyle(styles.fontWeight, 'buttonFontWeight'),
            borderWidth: styles.borderWidth || '0',
            borderStyle: styles.borderStyle || 'solid',
            borderColor: styles.borderColor,
            width: styles.width || 'auto',
            cursor: 'pointer',
            display: 'inline-block',
            textAlign: 'center',
          }}
        >
          {props.text || 'Button'}
        </button>
      );

      if (props.url && props.url !== '#') {
        return (
          <div style={{ textAlign: styles.textAlign as any }}>
            <a
              href={props.url}
              target={props.openInNewTab ? '_blank' : '_self'}
              rel={props.openInNewTab ? 'noopener noreferrer' : undefined}
              onClick={(e) => e.preventDefault()}
              style={{ textDecoration: 'none' }}
            >
              {buttonElement}
            </a>
          </div>
        );
      }

      return <div style={{ textAlign: styles.textAlign as any }}>{buttonElement}</div>;
    }

    if (component.type === 'Divider') {
      return (
        <div
          style={{
            width: styles.width || '100%',
            margin: getStyle(styles.margin, 'dividerMargin'),
          }}
        >
          {props.showLine !== false && (
            <hr
              style={{
                border: 'none',
                borderTop: `${getStyle(styles.height, 'dividerHeight')} solid ${getStyle(styles.color, 'dividerColor')}`,
                margin: 0,
              }}
            />
          )}
        </div>
      );
    }

    if (component.type === 'Footer') {
      const columns = props.columns || [];

      return (
        <footer
          style={{
            backgroundColor: getStyle(styles.backgroundColor, 'footerBackgroundColor'),
            padding: getStyle(styles.padding, 'footerPadding'),
            width: '100%',
          }}
        >
          {/* Footer Columns */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: styles.columnGap || '40px',
              marginBottom: props.showCopyright !== false ? '30px' : 0,
            }}
          >
            {columns.map((col: { label: string; links: { text: string; url: string }[] }, index: number) => (
              <div key={index} style={{ minWidth: '150px' }}>
                {/* Column Label */}
                <div
                  style={{
                    color: getStyle(styles.labelColor, 'footerTextColor'),
                    fontSize: getStyle(styles.labelFontSize, 'linkListLabelFontSize'),
                    fontWeight: getStyle(styles.labelFontWeight, 'linkListLabelFontWeight'),
                    marginBottom: '12px',
                  }}
                >
                  {col.label}
                </div>
                {/* Column Links */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {col.links.map((link, linkIndex) => (
                    <a
                      key={linkIndex}
                      href={link.url}
                      onClick={(e) => e.preventDefault()}
                      style={{
                        color: getStyle(styles.linkColor, 'linkListItemColor'),
                        fontSize: getStyle(styles.linkFontSize, 'linkListItemFontSize'),
                        textDecoration: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      {link.text}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Copyright */}
          {props.showCopyright !== false && (
            <div
              style={{
                color: getStyle(styles.copyrightColor, 'footerCopyrightColor'),
                fontSize: getStyle(styles.copyrightFontSize, 'footerCopyrightFontSize'),
                padding: styles.copyrightPadding || '20px 0 0 0',
                borderTop: styles.copyrightBorderColor ? `1px solid ${styles.copyrightBorderColor}` : 'none',
              }}
            >
              {props.copyright || '© 2024 Company Name. All Rights Reserved.'}
            </div>
          )}
        </footer>
      );
    }

    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded">
        <p className="text-red-600 text-sm">Unknown component type: {component.type}</p>
      </div>
    );
  };

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      className={`relative group ${
        isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''
      } hover:ring-2 hover:ring-blue-300 hover:ring-offset-2 transition-all overflow-hidden`}
    >
      {renderComponent()}

      {/* Component Controls */}
      <div
        className={`absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ${
          isSelected ? 'opacity-100' : ''
        }`}
      >
        <button
          onClick={handleDelete}
          className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg text-xs"
          title="Delete component"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Selected indicator label */}
      {isSelected && (
        <div className="absolute top-2 left-2 px-2 py-1 bg-blue-500 text-white text-xs rounded shadow-lg">
          {component.type}
        </div>
      )}
    </div>
  );
}
