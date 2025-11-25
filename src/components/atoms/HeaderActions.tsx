import Button from './Button';
import IconButton from './IconButton';
import Badge from './Badge';
import { useTheme } from '../../contexts/ThemeContext';

interface HeaderActionsProps {
  variant?: 'icons' | 'buttons';
  useThemeStyles?: boolean;
}

export default function HeaderActions({
  variant = 'icons',
  useThemeStyles = false
}: HeaderActionsProps) {
  const { theme } = useTheme();
  const styles = theme.componentStyles.HeaderActions?.[variant] || {};

  const inlineStyles = useThemeStyles ? {
    gap: styles.gap,
  } : {};

  if (variant === 'icons') {
    return (
      <div
        className={`w-full h-full flex items-center justify-end px-4 ${useThemeStyles ? '' : 'gap-4'}`}
        style={inlineStyles}
      >
        {/* Cart icon */}
        <div className="relative">
          <IconButton variant="ghost" size="small" useThemeStyles={useThemeStyles} />
          <div className="absolute -top-1 -right-1">
            <Badge variant="red" size="medium" useThemeStyles={useThemeStyles} />
          </div>
        </div>
        {/* User icon */}
        <IconButton variant="ghost" size="small" useThemeStyles={useThemeStyles} />
        {/* Notifications icon */}
        <div className="relative">
          <IconButton variant="ghost" size="small" useThemeStyles={useThemeStyles} />
          <div className="absolute -top-1 -right-1">
            <Badge variant="blue" size="small" useThemeStyles={useThemeStyles} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`w-full h-full flex items-center justify-end px-4 ${useThemeStyles ? '' : 'gap-3'}`}
      style={inlineStyles}
    >
      {/* Login button - secondary style */}
      <div className="w-20">
        <Button variant="secondary" align="right" useThemeStyles={useThemeStyles} />
      </div>
      {/* Sign up button - primary style */}
      <div className="w-20">
        <Button variant="primary" align="right" useThemeStyles={useThemeStyles} />
      </div>
    </div>
  );
}
