import Image from './Image';
import Title from './Title';
import Paragraph from './Paragraph';
import Button from './Button';
import IconButton from './IconButton';
import Rating from './Rating';
import SizeSelector from './SizeSelector';
import { useTheme } from '../../contexts/ThemeContext';

interface ProductDetailsProps {
  layout?: 'sideBySide' | 'stacked';
  useThemeStyles?: boolean;
}

export default function ProductDetails({
  layout = 'sideBySide',
  useThemeStyles = false
}: ProductDetailsProps) {
  const { theme } = useTheme();
  const styles = theme.componentStyles.ProductDetails?.[layout] || {};

  const containerStyles = useThemeStyles ? {
    backgroundColor: styles.backgroundColor,
    padding: styles.padding,
  } : {};

  const gapStyle = useThemeStyles && styles.gap ? { gap: styles.gap } : {};

  if (layout === 'stacked') {
    return (
      <div
        className={`w-full h-full flex flex-col ${useThemeStyles ? '' : 'gap-6 p-6'}`}
        style={{ ...containerStyles, ...gapStyle }}
      >
        {/* Product Images */}
        <div className="w-full h-64">
          <Image useThemeStyles={useThemeStyles} />
        </div>

        {/* Product Info */}
        <div className="flex flex-col gap-4">
          {/* Title */}
          <div className={useThemeStyles ? '' : 'h-8'}>
            <Title level={1} align="left" useThemeStyles={useThemeStyles} />
          </div>

          {/* Price */}
          <div className={useThemeStyles ? '' : 'h-8'}>
            <Title level={4} align="left" useThemeStyles={useThemeStyles} />
          </div>

          {/* Description */}
          <div className={useThemeStyles ? '' : 'h-12'}>
            <Paragraph lines={3} align="left" useThemeStyles={useThemeStyles} />
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-2">
            <div className={useThemeStyles ? 'flex-1' : 'h-10 flex-1'}>
              <Button variant="primary" align="center" useThemeStyles={useThemeStyles} />
            </div>
            <IconButton variant="outlined" size="medium" useThemeStyles={useThemeStyles} />
          </div>
        </div>
      </div>
    );
  }

  // Side by side layout
  return (
    <div
      className={`w-full h-full flex ${useThemeStyles ? '' : 'gap-8 p-6'}`}
      style={{ ...containerStyles, ...gapStyle }}
    >
      {/* Left: Product Images */}
      <div className="flex-1 flex flex-col gap-3">
        <div className="w-full h-80">
          <Image useThemeStyles={useThemeStyles} />
        </div>
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="w-16 h-16">
              <Image useThemeStyles={useThemeStyles} />
            </div>
          ))}
        </div>
      </div>

      {/* Right: Product Info */}
      <div className="flex-1 flex flex-col gap-4">
        {/* Title */}
        <div className={useThemeStyles ? '' : 'h-8'}>
          <Title level={1} align="left" useThemeStyles={useThemeStyles} />
        </div>

        {/* Price */}
        <div className={useThemeStyles ? '' : 'h-8'}>
          <Title level={4} align="left" useThemeStyles={useThemeStyles} />
        </div>

        {/* Rating */}
        <Rating maxStars={5} filledStars={4} size="medium" useThemeStyles={useThemeStyles} />

        {/* Description */}
        <div className={useThemeStyles ? 'mt-2' : 'h-16 mt-2'}>
          <Paragraph lines={4} align="left" useThemeStyles={useThemeStyles} />
        </div>

        {/* Size/Variant Selection */}
        <div className="mt-4">
          <SizeSelector optionCount={3} selectedIndex={1} size="medium" variant="outlined" useThemeStyles={useThemeStyles} />
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-4">
          <div className={useThemeStyles ? 'flex-1' : 'h-12 flex-1'}>
            <Button variant="primary" align="center" useThemeStyles={useThemeStyles} />
          </div>
          <IconButton variant="outlined" size="large" useThemeStyles={useThemeStyles} />
        </div>
      </div>
    </div>
  );
}
