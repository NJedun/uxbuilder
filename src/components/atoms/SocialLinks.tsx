import IconButton from './IconButton';
import { useTheme } from '../../contexts/ThemeContext';

interface SocialLinksProps {
  count?: number;
  align?: 'left' | 'center' | 'right';
  useThemeStyles?: boolean;
}

export default function SocialLinks({ count = 4, align = 'center', useThemeStyles = false }: SocialLinksProps) {
  const { theme } = useTheme();
  const styles = theme.componentStyles.SocialLinks?.default || {};
  const iconButtonStyles = theme.componentStyles.IconButton?.filled || {};

  const alignmentClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
  };

  // Get icon color from theme or default to white
  const iconColor = useThemeStyles ? (iconButtonStyles.iconColor || '#FFFFFF') : '#FFFFFF';

  return (
    <div className={`w-full h-full flex items-center ${alignmentClasses[align]} px-2`}>
      <div className={`flex ${useThemeStyles ? '' : 'gap-3'}`} style={useThemeStyles ? { gap: styles.gap } : undefined}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="relative">
            <IconButton variant="filled" size="small" useThemeStyles={useThemeStyles} />
            {/* Icon representation overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-4 h-4 flex items-center justify-center">
                {/* Simple icon representation - different for variety */}
                {i % 4 === 0 && (
                  // F shape (Facebook-like)
                  <div className="flex flex-col gap-0.5 items-start">
                    <div className="w-2 h-0.5 rounded" style={{ backgroundColor: iconColor }} />
                    <div className="w-1.5 h-0.5 rounded" style={{ backgroundColor: iconColor }} />
                    <div className="w-2 h-0.5 rounded" style={{ backgroundColor: iconColor }} />
                  </div>
                )}
                {i % 4 === 1 && (
                  // Bird shape (Twitter-like)
                  <div className="w-2.5 h-2.5 rounded-sm transform rotate-45" style={{ backgroundColor: iconColor }} />
                )}
                {i % 4 === 2 && (
                  // Camera (Instagram-like)
                  <div className="w-2 h-2 border rounded" style={{ borderColor: iconColor }} />
                )}
                {i % 4 === 3 && (
                  // Play button (YouTube-like)
                  <div
                    className="w-0 h-0 border-t-[3px] border-t-transparent border-b-[3px] border-b-transparent"
                    style={{ borderLeftWidth: '4px', borderLeftColor: iconColor }}
                  />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
