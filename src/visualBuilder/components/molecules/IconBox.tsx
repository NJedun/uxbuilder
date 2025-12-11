import { GlobalStyles } from '../../../store/visualBuilderStore';

interface IconBoxProps {
  props: {
    layout?: 'top' | 'left' | 'right';
    icon?: string;
    iconImageUrl?: string;
    title?: string;
    description?: string;
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
  };
  globalStyles: GlobalStyles;
  getStyle: (componentStyle: string | undefined, globalKey: keyof GlobalStyles) => string | undefined;
}

export default function IconBox({ props, styles, getStyle }: IconBoxProps) {
  const isTopLayout = props.layout === 'top';
  const isLeftLayout = props.layout === 'left';

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
