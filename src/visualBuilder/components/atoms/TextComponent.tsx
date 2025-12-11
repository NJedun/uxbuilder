import { GlobalStyles } from '../../../store/visualBuilderStore';

interface TextComponentProps {
  props: {
    content?: string;
  };
  styles: {
    color?: string;
    fontSize?: string;
    fontWeight?: string;
    lineHeight?: string;
    textAlign?: string;
    padding?: string;
    margin?: string;
  };
  globalStyles: GlobalStyles;
  getStyle: (componentStyle: string | undefined, globalKey: keyof GlobalStyles) => string | undefined;
}

export default function TextComponent({ props, styles, getStyle }: TextComponentProps) {
  return (
    <p
      style={{
        color: getStyle(styles.color, 'subtitleColor'),
        fontSize: getStyle(styles.fontSize, 'subtitleFontSize'),
        fontWeight: getStyle(styles.fontWeight, 'subtitleFontWeight'),
        lineHeight: styles.lineHeight || '1.6',
        textAlign: styles.textAlign as React.CSSProperties['textAlign'],
        padding: styles.padding,
        margin: styles.margin || 0,
        whiteSpace: 'pre-line',
      }}
    >
      {props.content || 'Text content here...'}
    </p>
  );
}
