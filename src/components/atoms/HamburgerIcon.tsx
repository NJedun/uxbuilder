import { useTheme } from '../../contexts/ThemeContext';

interface HamburgerIconProps {
  useThemeStyles?: boolean;
}

export default function HamburgerIcon({ useThemeStyles = false }: HamburgerIconProps) {
  const { theme } = useTheme();
  const styles = theme.componentStyles.HamburgerIcon?.default || {};

  const inlineStyles = useThemeStyles ? {
    backgroundColor: styles.barColor,
    height: styles.barHeight,
  } : {};

  return (
    <div className="w-full h-full flex items-center justify-center p-2">
      <div className="w-6 h-6 flex flex-col justify-center gap-1">
        <div
          className={`w-full rounded ${useThemeStyles ? '' : 'h-0.5 bg-gray-600'}`}
          style={inlineStyles}
        ></div>
        <div
          className={`w-full rounded ${useThemeStyles ? '' : 'h-0.5 bg-gray-600'}`}
          style={inlineStyles}
        ></div>
        <div
          className={`w-full rounded ${useThemeStyles ? '' : 'h-0.5 bg-gray-600'}`}
          style={inlineStyles}
        ></div>
      </div>
    </div>
  );
}
