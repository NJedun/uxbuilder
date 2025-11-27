import { useTheme } from '../../contexts/ThemeContext';

interface LinkProps {
  variant?: 'primary' | 'secondary';
  align?: 'left' | 'center' | 'right';
  useThemeStyles?: boolean;
  content?: string;
}

export default function Link({ variant = 'primary', align = 'left', useThemeStyles = false, content }: LinkProps) {
  const { theme } = useTheme();
  const styles = theme.componentStyles.Link?.[variant] || {};

  const alignmentClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
  };

  const defaultColor = variant === 'primary' ? 'bg-blue-500' : 'bg-gray-500';

  return (
    <div className={`w-full h-full flex items-center ${alignmentClasses[align]} px-2`}>
      {useThemeStyles ? (
        // UI Mode - Display actual text content with theme styles
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: styles.textColor,
            fontSize: styles.fontSize,
            fontWeight: styles.fontWeight,
            fontFamily: styles.fontFamily,
            textDecoration: styles.textDecoration,
            backgroundColor: styles.backgroundColor,
            paddingTop: styles.paddingTop,
            paddingBottom: styles.paddingBottom,
            paddingLeft: styles.paddingLeft,
            paddingRight: styles.paddingRight,
            borderRadius: styles.borderRadius,
            whiteSpace: 'nowrap',
          }}
        >
          {content || styles.content || 'Link'}
        </div>
      ) : (
        // UX Mode - Display placeholder rectangles
        <div className="inline-flex flex-col gap-0.5 px-2 py-1">
          <div
            className={`h-2.5 rounded ${defaultColor}`}
            style={{ width: '60px' }}
          />
          <div
            className={`h-0.5 ${defaultColor}`}
            style={{ width: '60px' }}
          />
        </div>
      )}
    </div>
  );
}
