import { useTheme } from '../../contexts/ThemeContext';

interface HorizontalLineProps {
  width?: number; // 1-5 for line thickness
  align?: 'top' | 'center' | 'bottom';
  useThemeStyles?: boolean;
}

export default function HorizontalLine({
  width = 2,
  align = 'center',
  useThemeStyles = false
}: HorizontalLineProps) {
  const { theme } = useTheme();
  const styles = theme.componentStyles.HorizontalLine?.default || {};

  const alignmentClass = {
    top: 'items-start',
    center: 'items-center',
    bottom: 'items-end',
  }[align];

  return (
    <div className={`w-full h-full flex ${alignmentClass}`}>
      <div
        className={`w-full ${useThemeStyles ? '' : 'bg-gray-300'}`}
        style={{
          height: useThemeStyles ? styles.thickness : `${width}px`,
          backgroundColor: useThemeStyles ? styles.color : undefined,
        }}
      />
    </div>
  );
}
