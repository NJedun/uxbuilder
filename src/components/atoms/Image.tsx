import { useTheme } from '../../contexts/ThemeContext';

interface ImageProps {
  useThemeStyles?: boolean;
}

export default function Image({ useThemeStyles = false }: ImageProps) {
  const { theme } = useTheme();
  const styles = theme.componentStyles.Image?.default || {};

  // Check if there's an image URL in the theme
  const imageUrl = useThemeStyles ? styles.imageUrl : null;

  if (useThemeStyles && imageUrl) {
    // UI Mode with image URL - display actual image
    return (
      <div className="w-full h-full relative overflow-hidden">
        <img
          src={imageUrl}
          alt={styles.alt || 'Image'}
          className="w-full h-full object-cover"
          style={{
            borderRadius: styles.borderRadius,
          }}
        />
      </div>
    );
  }

  // UX Mode - display placeholder wireframe
  return (
    <div className="w-full h-full bg-gray-100 border-2 border-gray-400 relative overflow-hidden">
      {/* Diagonal lines pattern for wireframe image representation */}
      <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
        <line x1="0" y1="0" x2="100%" y2="100%" stroke="currentColor" strokeWidth="2" className="text-gray-400" />
        <line x1="100%" y1="0" x2="0" y2="100%" stroke="currentColor" strokeWidth="2" className="text-gray-400" />
      </svg>
      {/* Optional image icon in center */}
      <div className="absolute inset-0 flex items-center justify-center">
        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    </div>
  );
}
