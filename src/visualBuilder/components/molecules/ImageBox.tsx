import { GlobalStyles } from '../../../store/visualBuilderStore';

interface ImageBoxProps {
  props: {
    layout?: 'top' | 'left' | 'right';
    icon?: string; // Emoji or text icon
    iconImageUrl?: string; // Image URL (takes precedence over icon)
    title?: string;
    description?: string;
    linkText?: string;
    linkUrl?: string;
  };
  styles: {
    padding?: string;
    backgroundColor?: string;
    borderRadius?: string;
    textAlign?: string;
    iconSize?: string;
    iconColor?: string;
    titleColor?: string;
    titleFontSize?: string;
    titleFontWeight?: string;
    titleMarginBottom?: string;
    descriptionColor?: string;
    descriptionFontSize?: string;
    linkColor?: string;
    linkFontSize?: string;
  };
  globalStyles: GlobalStyles;
  getStyle: (componentStyle: string | undefined, globalKey: keyof GlobalStyles) => string | undefined;
}

export default function ImageBox({ props, styles, getStyle }: ImageBoxProps) {
  const layout = props.layout || 'top';
  const isTopLayout = layout === 'top';
  const isLeftLayout = layout === 'left';
  const isRightLayout = layout === 'right';

  const iconSize = getStyle(styles.iconSize, 'iconBoxIconSize') || '48px';

  // Render icon/image element
  const renderIcon = () => {
    // If image URL is set, show the image
    if (props.iconImageUrl) {
      return (
        <img
          src={props.iconImageUrl}
          alt=""
          style={{
            width: iconSize,
            height: iconSize,
            objectFit: 'contain',
            borderRadius: '4px',
          }}
        />
      );
    }

    // If text icon is set, show it
    if (props.icon) {
      return (
        <span
          style={{
            fontSize: iconSize,
            display: 'block',
            color: styles.iconColor,
          }}
        >
          {props.icon}
        </span>
      );
    }

    // Default: show image placeholder
    return (
      <div
        style={{
          width: iconSize,
          height: iconSize,
          backgroundColor: '#f3f4f6',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px dashed #d1d5db',
        }}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#9ca3af"
          strokeWidth="1.5"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
      </div>
    );
  };

  // Render content (title, description, link)
  const renderContent = () => (
    <div style={{ flex: 1 }}>
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
            marginBottom: props.linkText ? '8px' : undefined,
          }}
        >
          {props.description}
        </div>
      )}
      {props.linkText && (
        <a
          href={props.linkUrl || '#'}
          style={{
            color: styles.linkColor || getStyle(undefined, 'linkColor') || '#2563eb',
            fontSize: styles.linkFontSize || '14px',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          {props.linkText}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </a>
      )}
    </div>
  );

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: isTopLayout ? 'column' : 'row',
        alignItems: isTopLayout
          ? styles.textAlign === 'center'
            ? 'center'
            : 'flex-start'
          : 'flex-start',
        gap: '16px',
        padding: styles.padding,
        backgroundColor: styles.backgroundColor,
        borderRadius: styles.borderRadius,
        textAlign: styles.textAlign as React.CSSProperties['textAlign'],
      }}
    >
      {/* Icon/Image - order based on layout */}
      <div
        style={{
          flexShrink: 0,
          order: isRightLayout ? 1 : 0,
        }}
      >
        {renderIcon()}
      </div>

      {/* Content - order based on layout */}
      <div style={{ order: isRightLayout ? 0 : 1, flex: isTopLayout ? undefined : 1 }}>
        {renderContent()}
      </div>
    </div>
  );
}
