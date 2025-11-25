import { useTheme } from '../../contexts/ThemeContext';

interface CardProps {
  variant?: 'solid' | 'image';
  useThemeStyles?: boolean;
}

export default function Card({ variant = 'solid', useThemeStyles = false }: CardProps) {
  const { theme } = useTheme();
  const styles = theme.componentStyles.Card?.solid || {};
  const isImage = variant === 'image';

  const inlineStyles = useThemeStyles ? {
    backgroundColor: styles.backgroundColor,
    borderColor: styles.borderColor,
    borderWidth: styles.borderWidth,
    borderRadius: styles.borderRadius,
    padding: styles.padding,
    boxShadow: styles.shadowColor ? `0 1px 3px ${styles.shadowColor}` : undefined,
  } : {};

  return (
    <div className="w-full h-full" style={{ padding: '5px' }}>
      <div
        className={`w-full h-full rounded relative overflow-hidden ${useThemeStyles ? '' : 'bg-gray-200'}`}
        style={useThemeStyles ? inlineStyles : {
          backgroundColor: isImage ? '#e5e7eb' : '#e5e7eb',
        }}
      >
        {isImage && (
          <>
            {/* Diagonal stripes pattern to represent image */}
            <div className="absolute inset-0 image-pattern" />
            {/* X mark in center to represent image placeholder */}
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
