import Image from './Image';
import Title from './Title';
import Paragraph from './Paragraph';
import Button from './Button';
import { useTheme } from '../../contexts/ThemeContext';

interface HeroWithImageProps {
  align?: 'left' | 'right';
  useThemeStyles?: boolean;
}

export default function HeroWithImage({
  align = 'left',
  useThemeStyles = false
}: HeroWithImageProps) {
  const { theme } = useTheme();
  const styles = theme.componentStyles.HeroWithImage?.default || {};
  const isImageLeft = align === 'left';

  const inlineStyles = useThemeStyles ? {
    backgroundColor: styles.backgroundColor,
    padding: styles.padding,
  } : {};

  return (
    <div
      className={`w-full h-full flex items-center gap-8 px-12 py-16 ${useThemeStyles ? '' : 'bg-gradient-to-r from-gray-100 to-gray-200'}`}
      style={inlineStyles}
    >
      {/* Image Section */}
      {isImageLeft && (
        <div className="w-1/2 h-full">
          <Image useThemeStyles={useThemeStyles} />
        </div>
      )}

      {/* Content Section */}
      <div className="w-1/2 flex flex-col justify-center">
        {/* Main Heading - H1 style */}
        <div className="w-full h-10 mb-6">
          <Title level={1} align="left" useThemeStyles={useThemeStyles} />
        </div>

        {/* Subheading - Paragraph style */}
        <div className="w-full h-8 mb-8">
          <Paragraph lines={2} align="left" useThemeStyles={useThemeStyles} />
        </div>

        {/* Single CTA Button */}
        <div className="w-40 h-12">
          <Button variant="primary" align="left" useThemeStyles={useThemeStyles} />
        </div>
      </div>

      {/* Image Section */}
      {!isImageLeft && (
        <div className="w-1/2 h-full">
          <Image useThemeStyles={useThemeStyles} />
        </div>
      )}
    </div>
  );
}
