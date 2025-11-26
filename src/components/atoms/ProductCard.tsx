import Image from './Image';
import Title from './Title';
import Paragraph from './Paragraph';
import Button from './Button';
import { useTheme } from '../../contexts/ThemeContext';

interface ProductCardProps {
  variant?: 'grid' | 'list';
  useThemeStyles?: boolean;
}

export default function ProductCard({
  variant = 'grid',
  useThemeStyles = false
}: ProductCardProps) {
  const { theme } = useTheme();
  const styles = theme.componentStyles.ProductCard?.[variant] || {};

  const containerStyles = useThemeStyles ? {
    backgroundColor: styles.backgroundColor,
    borderColor: styles.borderColor,
    borderWidth: styles.borderWidth,
    borderRadius: styles.borderRadius,
    padding: styles.padding,
  } : {};

  if (variant === 'list') {
    return (
      <div
        className={`w-full h-full flex gap-4 ${useThemeStyles ? '' : 'p-4 border border-gray-200 rounded bg-white'}`}
        style={containerStyles}
      >
        {/* Product Image */}
        <div className="w-32 h-32 flex-shrink-0">
          <Image useThemeStyles={useThemeStyles} />
        </div>

        {/* Product Info */}
        <div className="flex-1 flex flex-col gap-2">
          {/* Title */}
          <div className={useThemeStyles ? 'w-48' : 'h-6 w-48'}>
            <Title level={3} align="left" useThemeStyles={useThemeStyles} />
          </div>
          {/* Description */}
          <div className={useThemeStyles ? 'flex-1' : 'h-6 flex-1'}>
            <Paragraph lines={2} align="left" useThemeStyles={useThemeStyles} />
          </div>
          {/* Price and Button */}
          <div className="flex items-center justify-between mt-auto">
            <div className={useThemeStyles ? '' : 'h-6'}>
              <Title level={4} align="left" useThemeStyles={useThemeStyles} />
            </div>
            <div className={useThemeStyles ? 'w-24' : 'h-8 w-24'}>
              <Button variant="primary" align="center" useThemeStyles={useThemeStyles} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid variant
  return (
    <div
      className={`w-full h-full flex flex-col ${useThemeStyles ? '' : 'p-4 border border-gray-200 rounded bg-white'}`}
      style={containerStyles}
    >
      {/* Product Image */}
      <div className="w-full h-32 mb-3">
        <Image useThemeStyles={useThemeStyles} />
      </div>

      {/* Product Title */}
      <div className={useThemeStyles ? 'mb-2' : 'h-5 mb-2'}>
        <Title level={3} align="left" useThemeStyles={useThemeStyles} />
      </div>

      {/* Product Description */}
      <div className={useThemeStyles ? 'mb-3' : 'h-6 mb-3'}>
        <Paragraph lines={2} align="left" useThemeStyles={useThemeStyles} />
      </div>

      {/* Price */}
      <div className={useThemeStyles ? 'mb-3' : 'h-5 mb-3'}>
        <Title level={4} align="left" useThemeStyles={useThemeStyles} />
      </div>

      {/* Add to Cart Button */}
      <div className={useThemeStyles ? 'w-full' : 'h-8 w-full'}>
        <Button variant="primary" align="center" useThemeStyles={useThemeStyles} />
      </div>
    </div>
  );
}
