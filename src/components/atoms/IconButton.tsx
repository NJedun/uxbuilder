import { useTheme } from '../../contexts/ThemeContext';

interface IconButtonProps {
  variant?: 'outlined' | 'filled' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  useThemeStyles?: boolean;
}

export default function IconButton({
  variant = 'outlined',
  size = 'medium',
  useThemeStyles = false
}: IconButtonProps) {
  const { theme } = useTheme();
  const styles = theme.componentStyles.IconButton?.[variant] || {};

  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-10 h-10',
    large: 'w-12 h-12'
  }[size];

  const variantClasses = {
    outlined: 'border-2 border-gray-400 bg-transparent',
    filled: 'border-2 border-gray-600 bg-gray-600',
    ghost: 'border-0 bg-transparent hover:bg-gray-100'
  }[variant];

  const inlineStyles = useThemeStyles ? {
    backgroundColor: styles.backgroundColor,
    borderColor: styles.borderColor,
    borderWidth: styles.borderWidth,
    borderRadius: styles.borderRadius,
  } : {};

  return (
    <div
      className={`${sizeClasses} ${useThemeStyles ? '' : variantClasses} ${useThemeStyles ? '' : 'rounded'} flex items-center justify-center cursor-pointer transition-colors`}
      style={inlineStyles}
    >
      {/* Icon placeholder - represented by a small square */}
      <div
        className={`w-1/2 h-1/2 border rounded-sm ${useThemeStyles ? '' : 'border-gray-500'}`}
        style={{ borderColor: useThemeStyles ? styles.iconColor : undefined }}
      ></div>
    </div>
  );
}
