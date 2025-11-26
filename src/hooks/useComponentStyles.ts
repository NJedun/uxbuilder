import { useTheme } from '../contexts/ThemeContext';
import { CSSProperties } from 'react';

interface StyleConfig {
  [key: string]: any;
}

/**
 * Hook to extract and apply theme styles for a component
 * Reduces boilerplate for theme style application across components
 */
export function useComponentStyles(
  componentName: string,
  variant: string,
  useThemeStyles: boolean,
  styleKeys: string[] = ['backgroundColor', 'borderColor', 'borderWidth', 'borderRadius', 'padding']
): {
  containerStyles: CSSProperties;
  gapStyle: CSSProperties;
  styles: StyleConfig;
} {
  const { theme } = useTheme();
  const styles = theme.componentStyles[componentName]?.[variant] || {};

  const containerStyles = useThemeStyles
    ? styleKeys.reduce((acc, key) => {
        if (styles[key] !== undefined) {
          acc[key] = styles[key];
        }
        return acc;
      }, {} as CSSProperties)
    : {};

  const gapStyle = useThemeStyles && styles.gap ? { gap: styles.gap } : {};

  return { containerStyles, gapStyle, styles };
}
