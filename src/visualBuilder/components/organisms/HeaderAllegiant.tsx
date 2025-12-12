import { useState } from 'react';
import { GlobalStyles } from '../../../store/visualBuilderStore';
import type { ViewMode } from '../../../pages/VisualBuilder';

interface NavLink {
  text: string;
  url: string;
  hasDropdown?: boolean;
  dropdownItems?: { text: string; url: string }[];
}

interface HeaderAllegiantProps {
  props: {
    showLogo?: boolean;
    logoImageUrl?: string;
    logoText?: string;
    showNavLinks?: boolean;
    navLinks?: NavLink[];
    showSearch?: boolean;
    searchPlaceholder?: string;
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
    navLinkHoverColor?: string;
    searchBorderColor?: string;
    searchBorderRadius?: string;
    searchBackgroundColor?: string;
    searchTextColor?: string;
    searchWidth?: string;
    borderBottomWidth?: string;
    borderBottomStyle?: string;
    borderBottomColor?: string;
  };
  globalStyles: GlobalStyles;
  viewMode?: ViewMode;
  getStyle: (componentStyle: string | undefined, globalKey: keyof GlobalStyles) => string | undefined;
}

export default function HeaderAllegiant({
  props,
  styles,
  globalStyles,
  viewMode = 'desktop',
  getStyle,
}: HeaderAllegiantProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);

  const isMobile = viewMode === 'mobile';
  const isTablet = viewMode === 'tablet';
  const isCompact = isMobile || isTablet;

  const navLinks = props.navLinks || [];
  const navLinkColor = getStyle(styles.navLinkColor, 'navLinkColor') || '#003087';
  const navLinkHoverColor = styles.navLinkHoverColor || '#0066cc';

  return (
    <header
      style={{
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: getStyle(styles.backgroundColor, 'headerBackgroundColor') || '#ffffff',
        width: styles.width || '100%',
        boxSizing: 'border-box',
        borderWidth: getStyle(styles.borderWidth, 'headerBorderWidth'),
        borderStyle: getStyle(styles.borderStyle, 'headerBorderStyle'),
        borderColor: getStyle(styles.borderColor, 'headerBorderColor'),
        borderBottomWidth: styles.borderBottomWidth,
        borderBottomStyle: styles.borderBottomStyle as React.CSSProperties['borderBottomStyle'],
        borderBottomColor: styles.borderBottomColor,
      }}
    >
      {/* Main Header Row */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          maxWidth: styles.maxWidth || globalStyles.headerMaxWidth || '1400px',
          margin: styles.margin || '0 auto',
          padding: isCompact ? '12px 16px' : getStyle(styles.padding, 'headerPadding') || '16px 32px',
          boxSizing: 'border-box',
        }}
      >
        {/* Logo */}
        {props.showLogo !== false && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            {props.logoImageUrl ? (
              <img
                src={props.logoImageUrl}
                alt={props.logoText || 'Logo'}
                style={{
                  height: isCompact ? '36px' : styles.logoHeight || '48px',
                  width: 'auto',
                }}
              />
            ) : (
              <span
                style={{
                  color: getStyle(styles.logoColor, 'logoColor') || '#003087',
                  fontSize: isCompact ? '20px' : getStyle(styles.logoFontSize, 'logoFontSize') || '24px',
                  fontWeight: getStyle(styles.logoFontWeight, 'logoFontWeight') || '700',
                }}
              >
                {props.logoText || 'ALLEGIANT'}
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
              gap: '24px',
              flex: 1,
              justifyContent: 'center',
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
                  <div
                    key={index}
                    style={{ position: 'relative' }}
                    onMouseEnter={() => link.hasDropdown && setOpenDropdown(index)}
                    onMouseLeave={() => setOpenDropdown(null)}
                  >
                    <a
                      href={link.url}
                      onClick={(e) => e.preventDefault()}
                      style={{
                        color: navLinkColor,
                        fontSize: getStyle(styles.navLinkFontSize, 'navLinkFontSize') || '15px',
                        fontWeight: getStyle(styles.navLinkFontWeight, 'navLinkFontWeight') || '500',
                        textDecoration: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        transition: 'color 0.2s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = navLinkHoverColor)}
                      onMouseLeave={(e) => (e.currentTarget.style.color = navLinkColor)}
                    >
                      {link.text}
                      {link.hasDropdown && (
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          style={{
                            transform: openDropdown === index ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.2s',
                          }}
                        >
                          <path d="M6 9l6 6 6-6" />
                        </svg>
                      )}
                    </a>
                    {/* Dropdown Menu */}
                    {link.hasDropdown && link.dropdownItems && openDropdown === index && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '100%',
                          left: '0',
                          minWidth: '180px',
                          backgroundColor: '#ffffff',
                          border: '1px solid #e5e7eb',
                          borderRadius: '4px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                          padding: '8px 0',
                          zIndex: 100,
                        }}
                      >
                        {link.dropdownItems.map((item, itemIndex) => (
                          <a
                            key={itemIndex}
                            href={item.url}
                            onClick={(e) => e.preventDefault()}
                            style={{
                              display: 'block',
                              padding: '8px 16px',
                              color: navLinkColor,
                              fontSize: '14px',
                              textDecoration: 'none',
                              transition: 'background-color 0.2s',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#f3f4f6';
                              e.currentTarget.style.color = navLinkHoverColor;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                              e.currentTarget.style.color = navLinkColor;
                            }}
                          >
                            {item.text}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </nav>
            )}
          </div>
        )}

        {/* Search Box (Desktop) */}
        {!isCompact && props.showSearch !== false && (
          <div style={{ flexShrink: 0 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                border: `1px solid ${styles.searchBorderColor || '#003087'}`,
                borderRadius: styles.searchBorderRadius || '4px',
                backgroundColor: styles.searchBackgroundColor || '#ffffff',
                overflow: 'hidden',
              }}
            >
              <input
                type="text"
                placeholder={props.searchPlaceholder || 'Search'}
                style={{
                  border: 'none',
                  outline: 'none',
                  padding: '8px 12px',
                  fontSize: '14px',
                  width: styles.searchWidth || '180px',
                  color: styles.searchTextColor || '#333',
                  backgroundColor: 'transparent',
                }}
              />
              <button
                style={{
                  border: 'none',
                  background: 'transparent',
                  padding: '8px 12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={styles.searchBorderColor || '#003087'}
                  strokeWidth="2"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
              </button>
            </div>
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
                width: '24px',
                height: '2px',
                backgroundColor: navLinkColor,
                display: 'block',
                transition: 'transform 0.2s',
                transform: mobileMenuOpen ? 'rotate(45deg) translate(4px, 4px)' : 'none',
              }}
            />
            <span
              style={{
                width: '24px',
                height: '2px',
                backgroundColor: navLinkColor,
                display: 'block',
                opacity: mobileMenuOpen ? 0 : 1,
                transition: 'opacity 0.2s',
              }}
            />
            <span
              style={{
                width: '24px',
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
        <div
          style={{
            backgroundColor: '#ffffff',
            borderTop: '1px solid #e5e7eb',
            padding: '16px',
          }}
        >
          {/* Mobile Search */}
          {props.showSearch !== false && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                border: `1px solid ${styles.searchBorderColor || '#003087'}`,
                borderRadius: styles.searchBorderRadius || '4px',
                backgroundColor: styles.searchBackgroundColor || '#ffffff',
                marginBottom: '16px',
                overflow: 'hidden',
              }}
            >
              <input
                type="text"
                placeholder={props.searchPlaceholder || 'Search'}
                style={{
                  border: 'none',
                  outline: 'none',
                  padding: '10px 12px',
                  fontSize: '14px',
                  flex: 1,
                  color: styles.searchTextColor || '#333',
                  backgroundColor: 'transparent',
                }}
              />
              <button
                style={{
                  border: 'none',
                  background: 'transparent',
                  padding: '10px 12px',
                  cursor: 'pointer',
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={styles.searchBorderColor || '#003087'}
                  strokeWidth="2"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
              </button>
            </div>
          )}

          {/* Mobile Nav Links */}
          <nav
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}
          >
            {props.showNavLinks !== false &&
              navLinks.map((link, index) => (
                <div key={index}>
                  <a
                    href={link.url}
                    onClick={(e) => {
                      e.preventDefault();
                      if (link.hasDropdown) {
                        setOpenDropdown(openDropdown === index ? null : index);
                      }
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      color: navLinkColor,
                      fontSize: '15px',
                      fontWeight: '500',
                      textDecoration: 'none',
                      padding: '12px 0',
                      borderBottom: '1px solid #f3f4f6',
                    }}
                  >
                    {link.text}
                    {link.hasDropdown && (
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        style={{
                          transform: openDropdown === index ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.2s',
                        }}
                      >
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    )}
                  </a>
                  {/* Mobile Dropdown Items */}
                  {link.hasDropdown && link.dropdownItems && openDropdown === index && (
                    <div style={{ paddingLeft: '16px', paddingBottom: '8px' }}>
                      {link.dropdownItems.map((item, itemIndex) => (
                        <a
                          key={itemIndex}
                          href={item.url}
                          onClick={(e) => e.preventDefault()}
                          style={{
                            display: 'block',
                            padding: '10px 0',
                            color: navLinkColor,
                            fontSize: '14px',
                            textDecoration: 'none',
                            borderBottom: '1px solid #f9fafb',
                          }}
                        >
                          {item.text}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
          </nav>
        </div>
      )}

    </header>
  );
}
