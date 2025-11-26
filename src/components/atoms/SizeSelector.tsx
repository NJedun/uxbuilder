import { useTheme } from '../../contexts/ThemeContext';

interface SizeSelectorProps {
  optionCount?: number;
  selectedIndex?: number;
  size?: 'small' | 'medium' | 'large';
  variant?: 'outlined' | 'filled';
  useThemeStyles?: boolean;
}

export default function SizeSelector({
  optionCount = 3,
  selectedIndex = 1,
  size = 'medium',
  variant = 'outlined',
  useThemeStyles = false
}: SizeSelectorProps) {
  const { theme } = useTheme();
  const styles = theme.componentStyles.SizeSelector?.[variant] || {};

  const optionSize = {
    small: 'h-8 w-8',
    medium: 'h-10 w-10',
    large: 'h-12 w-12'
  }[size];

  const gapStyle = useThemeStyles && styles.gap ? { gap: styles.gap } : {};

  return (
    <div className={useThemeStyles ? 'flex' : 'flex gap-2'} style={gapStyle}>
      {Array.from({ length: optionCount }).map((_, i) => {
        const isSelected = i === selectedIndex;

        if (useThemeStyles) {
          const optionStyles = {
            borderColor: isSelected ? styles.selectedBorderColor : styles.borderColor,
            borderWidth: styles.borderWidth,
            backgroundColor: isSelected ? styles.selectedBackgroundColor : styles.backgroundColor,
            borderRadius: styles.borderRadius,
          };

          return (
            <div
              key={i}
              className={`${optionSize} cursor-pointer transition-colors`}
              style={{ ...optionStyles, borderStyle: 'solid' }}
            ></div>
          );
        }

        const borderClass = variant === 'outlined'
          ? (isSelected ? 'border-gray-600' : 'border-gray-400')
          : 'border-transparent';

        const bgClass = variant === 'filled'
          ? (isSelected ? 'bg-gray-600' : 'bg-gray-300')
          : 'bg-transparent';

        return (
          <div
            key={i}
            className={`${optionSize} border-2 ${borderClass} ${bgClass} rounded cursor-pointer transition-colors`}
          ></div>
        );
      })}
    </div>
  );
}
