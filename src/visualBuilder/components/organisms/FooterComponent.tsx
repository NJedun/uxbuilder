import { GlobalStyles } from '../../../store/visualBuilderStore';

interface FooterColumn {
  label: string;
  links: { text: string; url: string }[];
}

interface FooterComponentProps {
  props: {
    columns?: FooterColumn[];
    showCopyright?: boolean;
    copyright?: string;
  };
  styles: {
    backgroundColor?: string;
    padding?: string;
    columnGap?: string;
    labelColor?: string;
    labelFontSize?: string;
    labelFontWeight?: string;
    linkColor?: string;
    linkFontSize?: string;
    copyrightColor?: string;
    copyrightFontSize?: string;
    copyrightPadding?: string;
    copyrightBorderColor?: string;
  };
  globalStyles: GlobalStyles;
  getStyle: (componentStyle: string | undefined, globalKey: keyof GlobalStyles) => string | undefined;
}

export default function FooterComponent({ props, styles, getStyle }: FooterComponentProps) {
  const columns = props.columns || [];

  return (
    <footer
      style={{
        backgroundColor: getStyle(styles.backgroundColor, 'footerBackgroundColor'),
        padding: getStyle(styles.padding, 'footerPadding'),
        width: '100%',
      }}
    >
      {/* Footer Columns */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: styles.columnGap || '40px',
          marginBottom: props.showCopyright !== false ? '30px' : 0,
        }}
      >
        {columns.map((col, index) => (
          <div key={index} style={{ minWidth: '150px' }}>
            {/* Column Label */}
            <div
              style={{
                color: getStyle(styles.labelColor, 'footerTextColor'),
                fontSize: getStyle(styles.labelFontSize, 'linkListLabelFontSize'),
                fontWeight: getStyle(styles.labelFontWeight, 'linkListLabelFontWeight'),
                marginBottom: '12px',
              }}
            >
              {col.label}
            </div>
            {/* Column Links */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {col.links.map((link, linkIndex) => (
                <a
                  key={linkIndex}
                  href={link.url}
                  onClick={(e) => e.preventDefault()}
                  style={{
                    color: getStyle(styles.linkColor, 'linkListItemColor'),
                    fontSize: getStyle(styles.linkFontSize, 'linkListItemFontSize'),
                    textDecoration: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {link.text}
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Copyright */}
      {props.showCopyright !== false && (
        <div
          style={{
            color: getStyle(styles.copyrightColor, 'footerCopyrightColor'),
            fontSize: getStyle(styles.copyrightFontSize, 'footerCopyrightFontSize'),
            padding: styles.copyrightPadding || '20px 0 0 0',
            borderTop: styles.copyrightBorderColor
              ? `1px solid ${styles.copyrightBorderColor}`
              : 'none',
          }}
        >
          {props.copyright || '© 2024 Company Name. All Rights Reserved.'}
        </div>
      )}
    </footer>
  );
}
