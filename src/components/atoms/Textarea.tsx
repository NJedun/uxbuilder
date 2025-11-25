import { useTheme } from '../../contexts/ThemeContext';

interface TextareaProps {
  rows?: number;
  showLabel?: boolean;
  useThemeStyles?: boolean;
}

export default function Textarea({ rows = 3, showLabel = false, useThemeStyles = false }: TextareaProps) {
  const { theme } = useTheme();
  const styles = theme.componentStyles.Textarea?.default || {};

  const inlineStyles = useThemeStyles ? {
    backgroundColor: styles.backgroundColor,
    color: styles.textColor,
    borderColor: styles.borderColor,
    borderWidth: styles.borderWidth,
    borderRadius: styles.borderRadius,
    paddingTop: styles.paddingTop,
    paddingBottom: styles.paddingBottom,
    paddingLeft: styles.paddingLeft,
    paddingRight: styles.paddingRight,
    fontSize: styles.fontSize,
    fontFamily: styles.fontFamily,
  } : {};

  return (
    <div className="w-full h-full flex flex-col justify-start px-2 py-2 gap-1">
      {showLabel && <div className="h-1.5 bg-gray-500 rounded" style={{ width: '60px' }} />}
      <div
        className={`w-full ${useThemeStyles ? '' : 'border-2 border-gray-400 bg-white'} rounded`}
        style={{
          height: `${rows * 2}rem`,
          ...inlineStyles,
        }}
      />
    </div>
  );
}
