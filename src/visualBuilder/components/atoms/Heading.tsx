import { GlobalStyles } from '../../../store/visualBuilderStore';

type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

interface HeadingProps {
  props: {
    text?: string;
    level?: HeadingLevel;
  };
  styles: {
    color?: string;
    fontSize?: string;
    fontWeight?: string;
    lineHeight?: string;
    textAlign?: string;
    padding?: string;
    margin?: string;
    letterSpacing?: string;
    textTransform?: string;
  };
  globalStyles: GlobalStyles;
  getStyle: (componentStyle: string | undefined, globalKey: keyof GlobalStyles) => string | undefined;
}

const defaultFontSizes: Record<HeadingLevel, string> = {
  h1: '2.5rem',
  h2: '2rem',
  h3: '1.75rem',
  h4: '1.5rem',
  h5: '1.25rem',
  h6: '1rem',
};

export default function Heading({ props, styles, getStyle }: HeadingProps) {
  const level = props.level || 'h1';
  const Tag = level;

  // Map heading levels to their globalStyles keys
  const colorKeys: Record<HeadingLevel, keyof GlobalStyles> = {
    h1: 'titleColor',
    h2: 'h2Color',
    h3: 'h3Color',
    h4: 'h4Color',
    h5: 'h4Color', // Use h4 as fallback
    h6: 'h4Color', // Use h4 as fallback
  };

  const fontSizeKeys: Record<HeadingLevel, keyof GlobalStyles> = {
    h1: 'titleFontSize',
    h2: 'h2FontSize',
    h3: 'h3FontSize',
    h4: 'h4FontSize',
    h5: 'h4FontSize', // Use h4 as fallback
    h6: 'h4FontSize', // Use h4 as fallback
  };

  const fontWeightKeys: Record<HeadingLevel, keyof GlobalStyles> = {
    h1: 'titleFontWeight',
    h2: 'h2FontWeight',
    h3: 'h3FontWeight',
    h4: 'h4FontWeight',
    h5: 'h4FontWeight', // Use h4 as fallback
    h6: 'h4FontWeight', // Use h4 as fallback
  };

  const style: React.CSSProperties = {
    color: getStyle(styles.color, colorKeys[level]) || '#000000',
    fontSize: getStyle(styles.fontSize, fontSizeKeys[level]) || defaultFontSizes[level],
    fontWeight: getStyle(styles.fontWeight, fontWeightKeys[level]) || '700',
    lineHeight: styles.lineHeight || '1.2',
    textAlign: styles.textAlign as React.CSSProperties['textAlign'],
    padding: styles.padding,
    margin: styles.margin || '0',
    letterSpacing: styles.letterSpacing,
    textTransform: styles.textTransform as React.CSSProperties['textTransform'],
  };

  return (
    <Tag style={style}>
      {props.text || 'Heading Text'}
    </Tag>
  );
}
