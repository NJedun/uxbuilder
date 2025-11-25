import { useTheme } from '../../contexts/ThemeContext';

interface BadgeProps {
  variant?: 'red' | 'blue' | 'green' | 'yellow';
  size?: 'small' | 'medium' | 'large';
  useThemeStyles?: boolean;
}

export default function Badge({
  variant = 'red',
  size = 'small',
  useThemeStyles = false
}: BadgeProps) {
  const { theme } = useTheme();
  const styles = theme.componentStyles.Badge?.[variant] || {};

  const sizeClasses = {
    small: 'w-2 h-2',
    medium: 'w-3 h-3',
    large: 'w-4 h-4'
  }[size];

  const colorClasses = {
    red: 'bg-red-500',
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500'
  }[variant];

  const inlineStyles = useThemeStyles ? {
    backgroundColor: styles.backgroundColor,
  } : {};

  return (
    <div
      className={`${sizeClasses} ${useThemeStyles ? '' : colorClasses} rounded-full`}
      style={inlineStyles}
    ></div>
  );
}
