import Image from './Image';
import Title from './Title';
import Paragraph from './Paragraph';
import Button from './Button';
import { useComponentStyles } from '../../hooks/useComponentStyles';
import { cx } from '../../utils/classNames';

interface ProductCardProps {
  variant?: 'grid' | 'list';
  useThemeStyles?: boolean;
}

export default function ProductCard({
  variant = 'grid',
  useThemeStyles = false
}: ProductCardProps) {
  const { containerStyles } = useComponentStyles('ProductCard', variant, useThemeStyles);

  if (variant === 'list') {
    return (
      <div
        className={`w-full h-full flex gap-4 ${cx(useThemeStyles, 'p-4 border border-gray-200 rounded bg-white')}`}
        style={containerStyles}
      >
        {/* Product Image */}
        <div className="w-32 h-32 flex-shrink-0">
          <Image useThemeStyles={useThemeStyles} />
        </div>

        {/* Product Info */}
        <div className="flex-1 flex flex-col gap-2">
          {/* Title */}
          <div className={cx(useThemeStyles, 'h-6', 'w-48')}>
            <Title level={3} align="left" useThemeStyles={useThemeStyles} />
          </div>
          {/* Description */}
          <div className={cx(useThemeStyles, 'h-6', 'flex-1')}>
            <Paragraph lines={2} align="left" useThemeStyles={useThemeStyles} />
          </div>
          {/* Price and Button */}
          <div className="flex items-center justify-between mt-auto">
            <div className={cx(useThemeStyles, 'h-6')}>
              <Title level={4} align="left" useThemeStyles={useThemeStyles} />
            </div>
            <div className={cx(useThemeStyles, 'h-8', 'w-24')}>
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
      className={`w-full h-full flex flex-col ${cx(useThemeStyles, 'p-4 border border-gray-200 rounded bg-white')}`}
      style={containerStyles}
    >
      {/* Product Image */}
      <div className="w-full h-32 mb-3">
        <Image useThemeStyles={useThemeStyles} />
      </div>

      {/* Product Title */}
      <div className={cx(useThemeStyles, 'h-5', 'mb-2')}>
        <Title level={3} align="left" useThemeStyles={useThemeStyles} />
      </div>

      {/* Product Description */}
      <div className={cx(useThemeStyles, 'h-6', 'mb-3')}>
        <Paragraph lines={2} align="left" useThemeStyles={useThemeStyles} />
      </div>

      {/* Price */}
      <div className={cx(useThemeStyles, 'h-5', 'mb-3')}>
        <Title level={4} align="left" useThemeStyles={useThemeStyles} />
      </div>

      {/* Add to Cart Button */}
      <div className={cx(useThemeStyles, 'h-8', 'w-full')}>
        <Button variant="primary" align="center" useThemeStyles={useThemeStyles} />
      </div>
    </div>
  );
}
