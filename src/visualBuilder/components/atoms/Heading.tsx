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

  const style: React.CSSProperties = {
    color: styles.color || '#000000',
    fontSize: styles.fontSize || defaultFontSizes[level],
    fontWeight: getStyle(styles.fontWeight, 'titleFontWeight') || '700',
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
