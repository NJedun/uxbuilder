import { useTheme } from '../../contexts/ThemeContext';

interface ParagraphProps {
  lines?: number;
  align?: 'left' | 'center' | 'right';
  useThemeStyles?: boolean;
}

export default function Paragraph({ lines = 3, align = 'left', useThemeStyles = false }: ParagraphProps) {
  const { theme } = useTheme();
  const styles = theme.componentStyles.Paragraph?.default || {};

  const alignmentClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  const wireframeAlignmentClasses = {
    left: 'items-start',
    center: 'items-center',
    right: 'items-end',
  };

  const inlineStyles = useThemeStyles ? {
    color: styles.textColor,
    fontSize: styles.fontSize,
    fontWeight: styles.fontWeight,
    fontFamily: styles.fontFamily,
    lineHeight: styles.lineHeight,
    marginBottom: styles.marginBottom,
  } : {};

  // Check if there's content in the theme
  const content = useThemeStyles ? styles.content : null;

  if (useThemeStyles && content) {
    // UI Mode with content - display actual text
    return (
      <p className={`w-full h-full ${alignmentClasses[align]}`} style={inlineStyles}>
        {content}
      </p>
    );
  }

  // UX Mode - display placeholder wireframe lines
  return (
    <div className={`w-full h-full flex flex-col justify-start ${wireframeAlignmentClasses[align]} gap-0.5 px-1`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`h-1.5 ${useThemeStyles ? '' : 'bg-gray-400'} rounded`}
          style={{
            width: i === lines - 1 ? '60%' : '100%',
            backgroundColor: useThemeStyles ? styles.textColor : undefined,
          }}
        />
      ))}
    </div>
  );
}
