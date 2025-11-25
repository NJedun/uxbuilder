import { useTheme } from '../../contexts/ThemeContext';

interface TitleProps {
  level?: 1 | 2 | 3 | 4 | 5;
  align?: 'left' | 'center' | 'right';
  useThemeStyles?: boolean;
}

export default function Title({ level = 1, align = 'left', useThemeStyles = false }: TitleProps) {
  const { theme } = useTheme();
  const variantMap = { 1: 'h1', 2: 'h2', 3: 'h3', 4: 'h4', 5: 'h5' } as const;
  const variant = variantMap[level];
  const styles = theme.componentStyles.Title?.[variant] || {};

  const heights = {
    1: 'h-4',
    2: 'h-3',
    3: 'h-2',
    4: 'h-2',
    5: 'h-1.5',
  };

  const widths = {
    1: '70%',
    2: '60%',
    3: '50%',
    4: '45%',
    5: '40%',
  };

  const alignmentClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
  };

  return (
    <div className={`w-full h-full flex items-center ${alignmentClasses[align]} p-2`}>
      {useThemeStyles ? (
        // UI Mode - Display actual text content with theme styles
        <div
          style={{
            color: styles.textColor,
            fontSize: styles.fontSize,
            fontWeight: styles.fontWeight,
            fontFamily: styles.fontFamily,
            lineHeight: styles.lineHeight,
            marginBottom: styles.marginBottom,
          }}
        >
          {styles.content || 'Title'}
        </div>
      ) : (
        // UX Mode - Display placeholder bar
        <div
          className={`${heights[level]} bg-gray-600 rounded`}
          style={{ width: widths[level] }}
        />
      )}
    </div>
  );
}
