import { useTheme } from '../../contexts/ThemeContext';

interface TitleProps {
  level?: 1 | 2 | 3;
  align?: 'left' | 'center' | 'right';
  useThemeStyles?: boolean;
}

export default function Title({ level = 1, align = 'left', useThemeStyles = false }: TitleProps) {
  const { theme } = useTheme();
  const styles = theme.componentStyles.Title?.default || {};

  const heights = {
    1: 'h-4',
    2: 'h-3',
    3: 'h-2',
  };

  const widths = {
    1: '70%',
    2: '60%',
    3: '50%',
  };

  const alignmentClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
  };

  const inlineStyles = useThemeStyles ? {
    color: styles.textColor,
    fontSize: styles.fontSize,
    fontWeight: styles.fontWeight,
    fontFamily: styles.fontFamily,
    lineHeight: styles.lineHeight,
    marginBottom: styles.marginBottom,
  } : {};

  return (
    <div className={`w-full h-full flex items-center ${alignmentClasses[align]} p-2`}>
      <div
        className={`${heights[level]} ${useThemeStyles ? '' : 'bg-gray-600'} rounded`}
        style={{
          width: widths[level],
          ...inlineStyles,
          backgroundColor: useThemeStyles ? styles.textColor : undefined,
        }}
      />
    </div>
  );
}
