import { GlobalStyles } from '../../../store/visualBuilderStore';

interface ImageBoxProps {
  props: {
    variant?: 'icon' | 'image'; // 'icon' = emoji/icon, 'image' = image at top
    layout?: 'top' | 'left' | 'right';
    icon?: string;
    iconImageUrl?: string;
    title?: string;
    description?: string;
    // Image variant props
    featureImage?: string;
    featureImageHeight?: string;
    linkText?: string;
    linkUrl?: string;
  };
  styles: {
    padding?: string;
    backgroundColor?: string;
    borderRadius?: string;
    textAlign?: string;
    iconSize?: string;
    titleColor?: string;
    titleFontSize?: string;
    titleFontWeight?: string;
    titleMarginBottom?: string;
    descriptionColor?: string;
    descriptionFontSize?: string;
    // Link styles
    linkColor?: string;
    linkFontSize?: string;
  };
  globalStyles: GlobalStyles;
  getStyle: (componentStyle: string | undefined, globalKey: keyof GlobalStyles) => string | undefined;
}

export default function ImageBox({ props, styles, getStyle }: ImageBoxProps) {
  const isTopLayout = props.layout === 'top' || props.variant !== 'icon';
  const isLeftLayout = props.layout === 'left' && props.variant === 'icon';

  // Image variant (default) - image at top with title and link below
  if (props.variant !== 'icon') {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          padding: styles.padding,
          backgroundColor: styles.backgroundColor,
          borderRadius: styles.borderRadius,
          textAlign: styles.textAlign as React.CSSProperties['textAlign'],
        }}
      >
        {/* Feature Image */}
        <div
          style={{
            width: '100%',
            height: props.featureImageHeight || '150px',
            borderRadius: styles.borderRadius || '8px',
            overflow: 'hidden',
            marginBottom: '12px',
            backgroundColor: '#f3f4f6',
          }}
        >
          {props.featureImage ? (
            <img
              src={props.featureImage}
              alt={props.title || ''}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#9ca3af',
                fontSize: '14px',
              }}
            >
              Add Image
            </div>
          )}
        </div>
        {/* Title */}
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
        {/* Link */}
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
  }

  // Traditional icon layout (default)

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
      {/* Icon */}
      <div
        style={{
          flexShrink: 0,
          order: isLeftLayout ? 0 : props.layout === 'right' ? 1 : 0,
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
      <div style={{ order: isLeftLayout ? 1 : props.layout === 'right' ? 0 : 1 }}>
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
