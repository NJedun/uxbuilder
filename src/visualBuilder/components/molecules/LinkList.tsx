import { GlobalStyles } from '../../../store/visualBuilderStore';

interface LinkListProps {
  props: {
    label?: string;
    links?: { text: string; url: string }[];
    layout?: 'vertical' | 'horizontal';
  };
  styles: {
    padding?: string;
    backgroundColor?: string;
    labelColor?: string;
    labelFontSize?: string;
    labelFontWeight?: string;
    labelMarginBottom?: string;
    itemGap?: string;
    itemColor?: string;
    itemFontSize?: string;
  };
  globalStyles: GlobalStyles;
  getStyle: (componentStyle: string | undefined, globalKey: keyof GlobalStyles) => string | undefined;
}

export default function LinkList({ props, styles, getStyle }: LinkListProps) {
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
        {links.map((link, index) => (
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
