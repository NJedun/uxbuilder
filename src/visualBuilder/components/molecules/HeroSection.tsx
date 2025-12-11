import { GlobalStyles } from '../../../store/visualBuilderStore';

interface HeroSectionProps {
  props: {
    title?: string;
    subtitle?: string;
    showButton?: boolean;
    buttonText?: string;
  };
  styles: {
    backgroundColor?: string;
    backgroundImage?: string;
    backgroundSize?: string;
    backgroundPosition?: string;
    backgroundRepeat?: string;
    width?: string;
    maxWidth?: string;
    minHeight?: string;
    padding?: string;
    margin?: string;
    textAlign?: string;
    containerAlign?: string;
    borderWidth?: string;
    borderStyle?: string;
    borderColor?: string;
    borderRadius?: string;
    titleColor?: string;
    titleFontSize?: string;
    titleFontWeight?: string;
    titleMarginBottom?: string;
    titleMaxWidth?: string;
    subtitleColor?: string;
    subtitleFontSize?: string;
    subtitleFontWeight?: string;
    subtitleMarginBottom?: string;
    subtitleMaxWidth?: string;
    buttonBackgroundColor?: string;
    buttonTextColor?: string;
    buttonPadding?: string;
    buttonBorderRadius?: string;
    buttonFontSize?: string;
    buttonFontWeight?: string;
    buttonBorderWidth?: string;
    buttonBorderStyle?: string;
    buttonBorderColor?: string;
  };
  globalStyles: GlobalStyles;
  getStyle: (componentStyle: string | undefined, globalKey: keyof GlobalStyles) => string | undefined;
}

export default function HeroSection({ props, styles, globalStyles, getStyle }: HeroSectionProps) {
  // Calculate margin based on container alignment
  const getContainerMargin = () => {
    if (styles.margin) return styles.margin;
    switch (styles.containerAlign) {
      case 'left':
        return '0 auto 0 0';
      case 'right':
        return '0 0 0 auto';
      case 'center':
        return '0 auto';
      default:
        return undefined;
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
        textAlign: (styles.textAlign as React.CSSProperties['textAlign']) || 'center',
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
