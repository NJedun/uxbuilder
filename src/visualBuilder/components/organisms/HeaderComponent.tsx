import { useState } from 'react';
import { GlobalStyles } from '../../../store/visualBuilderStore';
import type { ViewMode } from '../../../pages/VisualBuilder';

interface NavLink {
  text: string;
  url: string;
}

interface Language {
  code: string;
  label?: string;
}

interface HeaderProps {
  props: {
    showLogo?: boolean;
    logoImageUrl?: string;
    logoText?: string;
    showNavLinks?: boolean;
    navLinks?: NavLink[];
    showNavDivider?: boolean;
    showLanguageSelector?: boolean;
    languages?: Language[];
    selectedLanguage?: string;
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
    navLinkColor?: string;
    navLinkGap?: string;
    navLinkFontSize?: string;
    navLinkFontWeight?: string;
    navDividerHeight?: string;
    navDividerColor?: string;
    navDividerMargin?: string;
  };
  globalStyles: GlobalStyles;
  viewMode?: ViewMode;
  getStyle: (componentStyle: string | undefined, globalKey: keyof GlobalStyles) => string | undefined;
}

export default function HeaderComponent({
  props,
  styles,
  globalStyles,
  viewMode = 'desktop',
  getStyle,
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isMobile = viewMode === 'mobile';
  const isTablet = viewMode === 'tablet';
  const isCompact = isMobile || isTablet;

  const navLinks = props.navLinks || [];
  const navLinkColor = getStyle(styles.navLinkColor, 'navLinkColor') || '#ffffff';

  return (
    <header
      style={{
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: getStyle(styles.backgroundColor, 'headerBackgroundColor'),
        padding: isCompact ? '12px 16px' : getStyle(styles.padding, 'headerPadding'),
        maxWidth: styles.maxWidth || globalStyles.headerMaxWidth,
        margin: styles.margin,
        width: styles.width || '100%',
        boxSizing: 'border-box',
        borderWidth: getStyle(styles.borderWidth, 'headerBorderWidth'),
        borderStyle: getStyle(styles.borderStyle, 'headerBorderStyle'),
        borderColor: getStyle(styles.borderColor, 'headerBorderColor'),
      }}
    >
      {/* Main Header Row */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
        }}
      >
        {/* Logo */}
        {props.showLogo !== false && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {props.logoImageUrl ? (
              <img
                src={props.logoImageUrl}
                alt={props.logoText || 'Logo'}
                style={{
                  height: isCompact ? '28px' : styles.logoHeight || '32px',
                  width: 'auto',
                }}
              />
            ) : (
              <span
                style={{
                  color: getStyle(styles.logoColor, 'logoColor'),
                  fontSize: isCompact ? '18px' : getStyle(styles.logoFontSize, 'logoFontSize'),
                  fontWeight: getStyle(styles.logoFontWeight, 'logoFontWeight'),
                }}
              >
                {props.logoText || 'Logo'}
              </span>
            )}
          </div>
        )}

        {/* Desktop Navigation */}
        {!isCompact && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: getStyle(styles.navLinkGap, 'navLinkGap') || '32px',
            }}
          >
            {props.showNavLinks !== false && navLinks.length > 0 && (
              <nav
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: getStyle(styles.navLinkGap, 'navLinkGap') || '32px',
                }}
              >
                {navLinks.map((link, index) => (
                  <a
                    key={index}
                    href={link.url}
                    onClick={(e) => e.preventDefault()}
                    style={{
                      color: navLinkColor,
                      fontSize: getStyle(styles.navLinkFontSize, 'navLinkFontSize'),
                      fontWeight: getStyle(styles.navLinkFontWeight, 'navLinkFontWeight'),
                      textDecoration: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    {link.text}
                  </a>
                ))}
              </nav>
            )}

            {props.showNavDivider && (
              <div
                style={{
                  width: '1px',
                  height: styles.navDividerHeight || '20px',
                  backgroundColor: styles.navDividerColor || navLinkColor || '#cccccc',
                  margin: styles.navDividerMargin || '0 8px',
                }}
              />
            )}

            {props.showLanguageSelector && props.languages && props.languages.length > 0 && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  color: navLinkColor,
                  fontSize: getStyle(styles.navLinkFontSize, 'navLinkFontSize'),
                  fontWeight: getStyle(styles.navLinkFontWeight, 'navLinkFontWeight'),
                  cursor: 'pointer',
                }}
              >
                <span>{props.selectedLanguage || props.languages[0]?.code}</span>
                <span style={{ fontSize: '10px' }}>▼</span>
              </div>
            )}
          </div>
        )}

        {/* Hamburger Menu Button (Mobile/Tablet) */}
        {isCompact && (
          <button
            aria-label="Toggle navigation menu"
            onClick={(e) => {
              e.stopPropagation();
              setMobileMenuOpen(!mobileMenuOpen);
            }}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}
          >
            <span
              style={{
                width: '20px',
                height: '2px',
                backgroundColor: navLinkColor,
                display: 'block',
                transition: 'transform 0.2s',
                transform: mobileMenuOpen ? 'rotate(45deg) translate(4px, 4px)' : 'none',
              }}
            />
            <span
              style={{
                width: '20px',
                height: '2px',
                backgroundColor: navLinkColor,
                display: 'block',
                opacity: mobileMenuOpen ? 0 : 1,
                transition: 'opacity 0.2s',
              }}
            />
            <span
              style={{
                width: '20px',
                height: '2px',
                backgroundColor: navLinkColor,
                display: 'block',
                transition: 'transform 0.2s',
                transform: mobileMenuOpen ? 'rotate(-45deg) translate(4px, -4px)' : 'none',
              }}
            />
          </button>
        )}
      </div>

      {/* Mobile Navigation Dropdown */}
      {isCompact && mobileMenuOpen && (
        <nav
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            paddingTop: '16px',
            borderTop: `1px solid ${navLinkColor}20`,
            marginTop: '12px',
          }}
        >
          {props.showNavLinks !== false &&
            navLinks.map((link, index) => (
              <a
                key={index}
                href={link.url}
                onClick={(e) => e.preventDefault()}
                style={{
                  color: navLinkColor,
                  fontSize: isMobile ? '14px' : '15px',
                  fontWeight: getStyle(styles.navLinkFontWeight, 'navLinkFontWeight'),
                  textDecoration: 'none',
                  cursor: 'pointer',
                  padding: '4px 0',
                }}
              >
                {link.text}
              </a>
            ))}

          {props.showLanguageSelector && props.languages && props.languages.length > 0 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                color: navLinkColor,
                fontSize: isMobile ? '14px' : '15px',
                fontWeight: getStyle(styles.navLinkFontWeight, 'navLinkFontWeight'),
                cursor: 'pointer',
                padding: '4px 0',
              }}
            >
              <span>{props.selectedLanguage || props.languages[0]?.code}</span>
              <span style={{ fontSize: '10px' }}>▼</span>
            </div>
          )}
        </nav>
      )}
    </header>
  );
}
