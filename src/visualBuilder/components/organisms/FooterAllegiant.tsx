import { GlobalStyles } from '../../../store/visualBuilderStore';
import type { ViewMode } from '../../../pages/VisualBuilder';

interface FooterLink {
  text: string;
  url: string;
}

interface FooterAllegiantProps {
  props: {
    showLogo?: boolean;
    logoImageUrl?: string;
    logoText?: string;
    copyrightText?: string;
    footerLinks?: FooterLink[];
  };
  styles: {
    backgroundColor?: string;
    padding?: string;
    maxWidth?: string;
    margin?: string;
    width?: string;
    borderWidth?: string;
    borderStyle?: string;
    borderColor?: string;
    logoColor?: string;
    logoFontSize?: string;
    logoFontWeight?: string;
    logoHeight?: string;
    linkColor?: string;
    linkGap?: string;
    linkFontSize?: string;
    linkFontWeight?: string;
    linkHoverColor?: string;
    copyrightColor?: string;
    copyrightFontSize?: string;
    borderTopWidth?: string;
    borderTopStyle?: string;
    borderTopColor?: string;
  };
  globalStyles: GlobalStyles;
  viewMode?: ViewMode;
  getStyle: (componentStyle: string | undefined, globalKey: keyof GlobalStyles) => string | undefined;
}

export default function FooterAllegiant({
  props,
  styles,
  globalStyles,
  viewMode = 'desktop',
  getStyle,
}: FooterAllegiantProps) {
  const isMobile = viewMode === 'mobile';
  const isTablet = viewMode === 'tablet';
  const isCompact = isMobile || isTablet;

  const footerLinks = props.footerLinks || [
    { text: 'Benefits of New Seed', url: '#' },
    { text: 'CHS Terms & Conditions of Sale', url: '#' },
    { text: 'chsinc.com', url: '#' },
    { text: 'Contact us', url: '#' },
    { text: 'CHS Privacy Center', url: '#' },
    { text: 'Preference Center', url: '#' },
  ];

  // Use component styles with fallback to defaults (no global style for footer links)
  const linkColor = styles.linkColor || globalStyles.footerTextColor || '#ffffff';
  const linkHoverColor = styles.linkHoverColor || '#cccccc';
  const backgroundColor = getStyle(styles.backgroundColor, 'footerBackgroundColor') || '#003087';

  return (
    <footer
      style={{
        backgroundColor,
        width: styles.width || '100%',
        boxSizing: 'border-box',
        borderWidth: styles.borderWidth,
        borderStyle: styles.borderStyle,
        borderColor: styles.borderColor,
        borderTopWidth: styles.borderTopWidth,
        borderTopStyle: styles.borderTopStyle as React.CSSProperties['borderTopStyle'],
        borderTopColor: styles.borderTopColor,
      }}
    >
      {/* Main Footer Row */}
      <div
        style={{
          display: 'flex',
          flexDirection: isCompact ? 'column' : 'row',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          maxWidth: styles.maxWidth || '1400px',
          margin: styles.margin || '0 auto',
          padding: isCompact ? '16px' : getStyle(styles.padding, 'footerPadding') || '12px 32px',
          boxSizing: 'border-box',
          gap: isCompact ? '16px' : '24px',
        }}
      >
        {/* Navigation Links */}
        <nav
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
            gap: isCompact ? '12px 16px' : styles.linkGap || '24px',
            flex: 1,
          }}
        >
          {footerLinks.map((link, index) => (
            <a
              key={index}
              href={link.url}
              onClick={(e) => e.preventDefault()}
              style={{
                color: linkColor,
                fontSize: isCompact ? '12px' : styles.linkFontSize || '13px',
                fontWeight: styles.linkFontWeight || '400',
                textDecoration: 'none',
                cursor: 'pointer',
                transition: 'color 0.2s',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = linkHoverColor)}
              onMouseLeave={(e) => (e.currentTarget.style.color = linkColor)}
            >
              {link.text}
            </a>
          ))}
        </nav>

        {/* Logo */}
        {props.showLogo !== false && (
          <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            {props.logoImageUrl ? (
              <img
                src={props.logoImageUrl}
                alt={props.logoText || 'Logo'}
                style={{
                  height: isCompact ? '28px' : styles.logoHeight || '36px',
                  width: 'auto',
                }}
              />
            ) : (
              <span
                style={{
                  color: styles.logoColor || '#ffffff',
                  fontSize: isCompact ? '18px' : styles.logoFontSize || '24px',
                  fontWeight: styles.logoFontWeight || '700',
                }}
              >
                {props.logoText || 'CHS'}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Copyright Row */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          maxWidth: styles.maxWidth || '1400px',
          margin: '0 auto',
          padding: isCompact ? '8px 16px 16px' : '8px 32px 16px',
          boxSizing: 'border-box',
        }}
      >
        <span
          style={{
            color: getStyle(styles.copyrightColor, 'footerCopyrightColor') || '#ffffff',
            fontSize: isCompact ? '11px' : getStyle(styles.copyrightFontSize, 'footerCopyrightFontSize') || '12px',
          }}
        >
          {props.copyrightText || '© 2025 CHS Inc.'}
        </span>
      </div>
    </footer>
  );
}
