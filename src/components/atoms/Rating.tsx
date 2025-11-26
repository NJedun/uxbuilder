import { useTheme } from '../../contexts/ThemeContext';

interface RatingProps {
  maxStars?: number;
  filledStars?: number;
  size?: 'small' | 'medium' | 'large';
  useThemeStyles?: boolean;
}

export default function Rating({
  maxStars = 5,
  filledStars = 4,
  size = 'medium',
  useThemeStyles = false
}: RatingProps) {
  const { theme } = useTheme();
  const styles = theme.componentStyles.Rating?.default || {};

  const starSize = {
    small: 'w-3 h-3',
    medium: 'w-4 h-4',
    large: 'w-5 h-5'
  }[size];

  const gapStyle = useThemeStyles && styles.gap ? { gap: styles.gap } : {};

  return (
    <div className={useThemeStyles ? 'flex' : 'flex gap-1'} style={gapStyle}>
      {Array.from({ length: maxStars }).map((_, i) => {
        const isFilled = i < filledStars;
        const backgroundColor = useThemeStyles
          ? (isFilled ? styles.filledColor : styles.emptyColor)
          : undefined;

        return (
          <div
            key={i}
            className={`${starSize} ${
              useThemeStyles ? '' : (isFilled ? 'bg-yellow-400' : 'bg-gray-300')
            } rounded-full`}
            style={useThemeStyles ? { backgroundColor } : undefined}
          ></div>
        );
      })}
    </div>
  );
}
