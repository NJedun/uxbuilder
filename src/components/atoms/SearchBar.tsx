import Input from './Input';
import { useTheme } from '../../contexts/ThemeContext';

interface SearchBarProps {
  variant?: 'simple' | 'withIcon';
  placeholder?: string;
  useThemeStyles?: boolean;
}

export default function SearchBar({
  variant = 'simple',
  placeholder = 'Search...',
  useThemeStyles = false
}: SearchBarProps) {
  const { theme } = useTheme();
  const styles = theme.componentStyles.SearchBar?.[variant] || {};

  const inlineStyles = useThemeStyles ? {
    backgroundColor: styles.backgroundColor,
    borderColor: styles.borderColor,
    borderWidth: styles.borderWidth,
    borderRadius: styles.borderRadius,
  } : {};

  if (variant === 'simple') {
    return (
      <div className="w-full h-full flex items-center px-2">
        <div className="w-full h-9">
          <Input showLabel={false} useThemeStyles={useThemeStyles} />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex items-center px-2">
      <div
        className={`w-full h-9 px-3 flex items-center gap-2 ${useThemeStyles ? '' : 'border-2 border-gray-300 bg-white'} rounded-md`}
        style={inlineStyles}
      >
        <svg
          className={`w-4 h-4 ${useThemeStyles ? '' : 'text-gray-400'}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          style={{ color: useThemeStyles ? styles.iconColor : undefined }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <div className="h-9 flex-1">
          <Input showLabel={false} useThemeStyles={useThemeStyles} />
        </div>
      </div>
    </div>
  );
}
