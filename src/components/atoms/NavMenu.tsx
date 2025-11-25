import Link from './Link';
import Button from './Button';
import { useTheme } from '../../contexts/ThemeContext';

interface NavMenuProps {
  variant?: 'simple' | 'withDropdown' | 'withButton';
  itemCount?: number;
  useThemeStyles?: boolean;
}

export default function NavMenu({
  variant = 'simple',
  itemCount = 4,
  useThemeStyles = false
}: NavMenuProps) {
  const { theme } = useTheme();
  const styles = theme.componentStyles.NavMenu?.[variant] || {};

  const renderSimple = () => (
    <nav className={`flex items-center h-full ${useThemeStyles ? '' : 'gap-6'}`} style={useThemeStyles ? { gap: styles.gap } : undefined}>
      {Array.from({ length: itemCount }).map((_, i) => (
        <div key={i} className="w-16">
          <Link variant="primary" align="left" useThemeStyles={useThemeStyles} />
        </div>
      ))}
    </nav>
  );

  const renderWithDropdown = () => (
    <nav className={`flex items-center h-full ${useThemeStyles ? '' : 'gap-6'}`} style={useThemeStyles ? { gap: styles.gap } : undefined}>
      {Array.from({ length: itemCount }).map((_, i) => (
        <div key={i} className="flex items-center gap-1">
          <div>
            <Link variant="primary" align="left" useThemeStyles={useThemeStyles} />
          </div>
          <div
            className={`w-2 h-2 border-l-2 border-b-2 ${useThemeStyles ? '' : 'border-blue-500'} transform rotate-[-45deg]`}
            style={useThemeStyles ? { borderColor: styles.textColor } : undefined}
          ></div>
        </div>
      ))}
    </nav>
  );

  const renderWithButton = () => (
    <nav className={`flex items-center h-full ${useThemeStyles ? '' : 'gap-6'}`} style={useThemeStyles ? { gap: styles.gap } : undefined}>
      {Array.from({ length: itemCount - 1 }).map((_, i) => (
        <div key={i} className="w-16">
          <Link variant="primary" align="left" useThemeStyles={useThemeStyles} />
        </div>
      ))}
      <div className="w-20">
        <Button variant="primary" align="left" useThemeStyles={useThemeStyles} />
      </div>
    </nav>
  );

  const variants = {
    simple: renderSimple,
    withDropdown: renderWithDropdown,
    withButton: renderWithButton,
  };

  return (
    <div className="w-full h-full flex items-center px-4">
      {variants[variant]()}
    </div>
  );
}
