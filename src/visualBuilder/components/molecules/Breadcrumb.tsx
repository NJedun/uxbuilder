import { GlobalStyles } from '../../../store/visualBuilderStore';

interface BreadcrumbItem {
  text: string;
  url: string;
}

interface BreadcrumbProps {
  props: {
    items?: BreadcrumbItem[];
    separator?: string;
    showHomeIcon?: boolean;
  };
  styles: {
    backgroundColor?: string;
    padding?: string;
    maxWidth?: string;
    margin?: string;
    textColor?: string;
    linkColor?: string;
    linkHoverColor?: string;
    fontSize?: string;
    fontWeight?: string;
    separatorColor?: string;
    borderTopWidth?: string;
    borderTopColor?: string;
    borderBottomWidth?: string;
    borderBottomColor?: string;
  };
  globalStyles: GlobalStyles;
  getStyle: (componentStyle: string | undefined, globalKey: keyof GlobalStyles) => string | undefined;
}

export default function Breadcrumb({
  props,
  styles,
}: BreadcrumbProps) {
  const items = props.items || [];
  const separator = props.separator || '>';

  if (items.length === 0) {
    return (
      <div
        style={{
          backgroundColor: styles.backgroundColor || '#f8fafc',
          padding: styles.padding || '12px 32px',
          borderTop: styles.borderTopWidth ? `${styles.borderTopWidth} solid ${styles.borderTopColor || '#e5e7eb'}` : '1px solid #e5e7eb',
          borderBottom: styles.borderBottomWidth ? `${styles.borderBottomWidth} solid ${styles.borderBottomColor || '#e5e7eb'}` : '1px solid #e5e7eb',
        }}
      >
        <div
          style={{
            maxWidth: styles.maxWidth || '1400px',
            margin: styles.margin || '0 auto',
            fontSize: styles.fontSize || '14px',
            color: styles.textColor || '#6b7280',
          }}
        >
          Add breadcrumb items in the properties panel
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: styles.backgroundColor || '#f8fafc',
        borderTop: styles.borderTopWidth ? `${styles.borderTopWidth} solid ${styles.borderTopColor || '#e5e7eb'}` : '1px solid #e5e7eb',
        borderBottom: styles.borderBottomWidth ? `${styles.borderBottomWidth} solid ${styles.borderBottomColor || '#e5e7eb'}` : '1px solid #e5e7eb',
      }}
    >
      <nav
        style={{
          maxWidth: styles.maxWidth || '1400px',
          margin: styles.margin || '0 auto',
          padding: styles.padding || '12px 32px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: styles.fontSize || '14px',
          fontWeight: styles.fontWeight || '400',
          flexWrap: 'wrap',
        }}
        aria-label="Breadcrumb"
      >
        {/* Optional Home Icon */}
        {props.showHomeIcon && (
          <>
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              style={{
                color: styles.linkColor || '#003087',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </a>
            <span style={{ color: styles.separatorColor || styles.textColor || '#6b7280' }}>
              {separator}
            </span>
          </>
        )}

        {items.map((item, index) => (
          <span key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {index > 0 && (
              <span style={{ color: styles.separatorColor || styles.textColor || '#6b7280' }}>
                {separator}
              </span>
            )}
            {index === items.length - 1 ? (
              <span
                style={{
                  color: styles.textColor || '#374151',
                  fontWeight: styles.fontWeight || '400',
                }}
                aria-current="page"
              >
                {item.text}
              </span>
            ) : (
              <a
                href={item.url}
                onClick={(e) => e.preventDefault()}
                style={{
                  color: styles.linkColor || '#003087',
                  textDecoration: 'none',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (styles.linkHoverColor) {
                    e.currentTarget.style.color = styles.linkHoverColor;
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = styles.linkColor || '#003087';
                }}
              >
                {item.text}
              </a>
            )}
          </span>
        ))}
      </nav>
    </div>
  );
}
