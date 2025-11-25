'use client';

import { useTheme } from '../../contexts/ThemeContext';

interface ButtonProps {
  variant?: 'primary' | 'secondary';
  align?: 'left' | 'center' | 'right';
  useThemeStyles?: boolean;
}

export default function Button({ variant = 'primary', align = 'center', useThemeStyles = false }: ButtonProps) {
  const { theme } = useTheme();

  const alignmentClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
  };

  // Wireframe mode (UX mode) - just show gray box
  if (!useThemeStyles) {
    return (
      <div className={`w-full h-full flex items-center ${alignmentClasses[align]} px-2`}>
        <div
          className={`h-8 rounded ${
            variant === 'primary' ? 'bg-gray-600' : 'bg-gray-400'
          }`}
          style={{ width: '80px' }}
        />
      </div>
    );
  }

  // Styled mode (UI mode) - apply theme styles
  const buttonStyles = theme.componentStyles.Button[variant];

  // Use global primary/secondary color as fallback for backgroundColor
  const backgroundColor = buttonStyles.backgroundColor ||
    (variant === 'primary' ? theme.globalStyles.colors.primary : theme.globalStyles.colors.secondary);

  // Use white as default text color for buttons
  const textColor = buttonStyles.textColor || '#FFFFFF';

  return (
    <div className={`w-full h-full flex items-center ${alignmentClasses[align]} px-2`}>
      <div
        style={{
          minWidth: '80px',
          height: '32px',
          backgroundColor: backgroundColor,
          color: textColor,
          borderColor: buttonStyles.borderColor || backgroundColor,
          borderWidth: buttonStyles.borderWidth,
          borderStyle: 'solid',
          borderRadius: buttonStyles.borderRadius,
          paddingTop: buttonStyles.paddingTop,
          paddingBottom: buttonStyles.paddingBottom,
          paddingLeft: buttonStyles.paddingLeft,
          paddingRight: buttonStyles.paddingRight,
          fontSize: buttonStyles.fontSize,
          fontWeight: buttonStyles.fontWeight,
          fontFamily: buttonStyles.fontFamily,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          whiteSpace: 'nowrap'
        }}
      >
        {buttonStyles.content || 'Button'}
      </div>
    </div>
  );
}
