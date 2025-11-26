/**
 * Helper to conditionally apply className based on useThemeStyles flag
 * @param useThemeStyles - Whether theme styles are being used
 * @param defaultClasses - Classes to apply when NOT using theme styles
 * @param themeClasses - Optional classes to always apply or apply when using theme styles
 */
export function conditionalClasses(
  useThemeStyles: boolean,
  defaultClasses: string,
  themeClasses: string = ''
): string {
  return useThemeStyles ? themeClasses : `${defaultClasses} ${themeClasses}`.trim();
}

/**
 * Shorter alias for conditional classes
 */
export const cx = conditionalClasses;

/**
 * Combines multiple class names, filtering out falsy values
 */
export function classNames(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}
