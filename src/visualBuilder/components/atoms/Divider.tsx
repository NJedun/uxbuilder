import { GlobalStyles } from '../../../store/visualBuilderStore';

interface DividerProps {
  props: {
    showLine?: boolean;
  };
  styles: {
    width?: string;
    margin?: string;
    height?: string;
    color?: string;
  };
  globalStyles: GlobalStyles;
  getStyle: (componentStyle: string | undefined, globalKey: keyof GlobalStyles) => string | undefined;
}

export default function Divider({ props, styles, getStyle }: DividerProps) {
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
