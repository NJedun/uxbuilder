import { useTheme } from '../../contexts/ThemeContext';

interface CopyrightTextProps {
  align?: 'left' | 'center' | 'right';
  useThemeStyles?: boolean;
  content?: string;
}

export default function CopyrightText({
  align = 'center',
  useThemeStyles = false,
  content
}: CopyrightTextProps) {
  const { theme } = useTheme();
  const styles = theme.componentStyles.CopyrightText?.default || {};

  const alignmentClass = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
  }[align];

  return (
    <div className={`w-full h-full flex items-center ${alignmentClass} px-4`}>
      {useThemeStyles ? (
        // UI Mode - Display actual text content with theme styles
        <div
          style={{
            color: styles.textColor,
            fontSize: styles.fontSize,
            fontWeight: styles.fontWeight,
            fontFamily: styles.fontFamily,
          }}
        >
          {content || styles.content || '© 2024 Your Company. All rights reserved.'}
        </div>
      ) : (
        // UX Mode - Display placeholder bar
        <div className="text-xs text-gray-500">
          <div className="h-2 w-48 bg-gray-400 rounded"></div>
        </div>
      )}
    </div>
  );
}
