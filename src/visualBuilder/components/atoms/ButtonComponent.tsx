import { GlobalStyles } from '../../../store/visualBuilderStore';

interface ButtonComponentProps {
  props: {
    text?: string;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    url?: string;
    openInNewTab?: boolean;
  };
  styles: {
    backgroundColor?: string;
    textColor?: string;
    padding?: string;
    borderRadius?: string;
    fontSize?: string;
    fontWeight?: string;
    borderWidth?: string;
    borderStyle?: string;
    borderColor?: string;
    width?: string;
    textAlign?: string;
  };
  globalStyles: GlobalStyles;
  getStyle: (componentStyle: string | undefined, globalKey: keyof GlobalStyles) => string | undefined;
}

export default function ButtonComponent({ props, styles, getStyle }: ButtonComponentProps) {
  const variant = props.variant || 'primary';
  const primaryBg = getStyle(styles.backgroundColor, 'buttonBackgroundColor') || '#4f46e5';
  const primaryText = getStyle(styles.textColor, 'buttonTextColor') || '#ffffff';

  // Get variant-specific styles
  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return {
          backgroundColor: '#6b7280',
          color: '#ffffff',
          borderWidth: '0',
          borderStyle: 'solid',
          borderColor: 'transparent',
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          color: primaryBg,
          borderWidth: '2px',
          borderStyle: 'solid',
          borderColor: primaryBg,
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          color: primaryBg,
          borderWidth: '0',
          borderStyle: 'solid',
          borderColor: 'transparent',
        };
      case 'primary':
      default:
        return {
          backgroundColor: primaryBg,
          color: primaryText,
          borderWidth: styles.borderWidth || '0',
          borderStyle: styles.borderStyle || 'solid',
          borderColor: styles.borderColor || 'transparent',
        };
    }
  };

  const variantStyles = getVariantStyles();

  const buttonElement = (
    <button
      style={{
        backgroundColor: variantStyles.backgroundColor,
        color: variantStyles.color,
        padding: getStyle(styles.padding, 'buttonPadding'),
        borderRadius: getStyle(styles.borderRadius, 'buttonBorderRadius'),
        fontSize: getStyle(styles.fontSize, 'buttonFontSize'),
        fontWeight: getStyle(styles.fontWeight, 'buttonFontWeight'),
        borderWidth: variantStyles.borderWidth,
        borderStyle: variantStyles.borderStyle,
        borderColor: variantStyles.borderColor,
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
      <div style={{ textAlign: styles.textAlign as React.CSSProperties['textAlign'] }}>
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

  return (
    <div style={{ textAlign: styles.textAlign as React.CSSProperties['textAlign'] }}>
      {buttonElement}
    </div>
  );
}
