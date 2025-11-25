import Logo from './Logo';
import NavMenu from './NavMenu';
import SearchBar from './SearchBar';
import HeaderActions from './HeaderActions';
import HamburgerIcon from './HamburgerIcon';
import { useTheme } from '../../contexts/ThemeContext';

interface HeaderPatternProps {
  variant?: 'simple' | 'ecommerce' | 'saas' | 'mobile';
  useThemeStyles?: boolean;
}

export default function HeaderPattern({
  variant = 'simple',
  useThemeStyles = false
}: HeaderPatternProps) {
  const { theme } = useTheme();
  const styles = theme.componentStyles.HeaderPattern?.[variant] || {};

  const inlineStyles = useThemeStyles ? {
    backgroundColor: styles.backgroundColor,
    padding: styles.padding,
  } : {};

  const renderSimple = () => (
    <div
      className={`w-full h-full flex items-center justify-between ${useThemeStyles ? '' : 'px-6'}`}
      style={inlineStyles}
    >
      <div className="flex items-center gap-2">
        <Logo size="medium" useThemeStyles={useThemeStyles} />
      </div>
      <div className="flex items-center">
        <NavMenu variant="simple" itemCount={4} useThemeStyles={useThemeStyles} />
      </div>
    </div>
  );

  const renderEcommerce = () => (
    <div
      className={`w-full h-full flex items-center justify-between gap-4 ${useThemeStyles ? '' : 'px-6'}`}
      style={inlineStyles}
    >
      <div className="flex items-center gap-2 flex-shrink-0">
        <Logo size="medium" useThemeStyles={useThemeStyles} />
      </div>
      <div className="flex-1 max-w-md">
        <SearchBar variant="withIcon" useThemeStyles={useThemeStyles} />
      </div>
      <div className="flex-shrink-0">
        <HeaderActions variant="icons" useThemeStyles={useThemeStyles} />
      </div>
    </div>
  );

  const renderSaaS = () => (
    <div
      className={`w-full h-full flex items-center justify-between ${useThemeStyles ? '' : 'px-6'}`}
      style={inlineStyles}
    >
      <div className="flex items-center gap-2">
        <Logo size="medium" useThemeStyles={useThemeStyles} />
      </div>
      <div className="flex items-center gap-8">
        <NavMenu variant="simple" itemCount={3} useThemeStyles={useThemeStyles} />
        <HeaderActions variant="buttons" useThemeStyles={useThemeStyles} />
      </div>
    </div>
  );

  const renderMobile = () => (
    <div
      className={`w-full h-full flex items-center justify-between ${useThemeStyles ? '' : 'px-4'}`}
      style={inlineStyles}
    >
      <div className="flex items-center gap-2">
        <Logo size="small" useThemeStyles={useThemeStyles} />
      </div>
      <div className="flex items-center gap-4">
        <HamburgerIcon useThemeStyles={useThemeStyles} />
      </div>
    </div>
  );

  const variants = {
    simple: renderSimple,
    ecommerce: renderEcommerce,
    saas: renderSaaS,
    mobile: renderMobile,
  };

  return variants[variant]();
}
