import { useTheme } from '../../contexts/ThemeContext';

interface ParagraphProps {
  lines?: number;
  useThemeStyles?: boolean;
}

export default function Paragraph({ lines = 3, useThemeStyles = false }: ParagraphProps) {
  const { theme } = useTheme();
  const styles = theme.componentStyles.Paragraph?.default || {};

  const inlineStyles = useThemeStyles ? {
    color: styles.textColor,
    fontSize: styles.fontSize,
    fontWeight: styles.fontWeight,
    fontFamily: styles.fontFamily,
    lineHeight: styles.lineHeight,
    marginBottom: styles.marginBottom,
  } : {};

  return (
    <div className="w-full h-full flex flex-col justify-start gap-0.5 px-1">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`h-1.5 ${useThemeStyles ? '' : 'bg-gray-400'} rounded`}
          style={{
            width: i === lines - 1 ? '60%' : '100%',
            backgroundColor: useThemeStyles ? styles.textColor : undefined,
            ...inlineStyles,
          }}
        />
      ))}
    </div>
  );
}
