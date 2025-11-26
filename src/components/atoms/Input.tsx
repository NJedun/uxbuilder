import { useTheme } from '../../contexts/ThemeContext';

interface InputProps {
  showLabel?: boolean;
  useThemeStyles?: boolean;
}

export default function Input({ showLabel = false, useThemeStyles = false }: InputProps) {
  const { theme } = useTheme();
  const styles = theme.componentStyles.Input?.default || {};

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
    <div className="w-full h-full flex flex-col justify-center gap-1">
      {showLabel && <div className="h-1.5 bg-gray-500 rounded" style={{ width: '60px' }} />}
      <div
        className={`w-full h-8 ${useThemeStyles ? '' : 'border-2 border-gray-400 bg-white'} rounded`}
        style={inlineStyles}
      />
    </div>
  );
}
