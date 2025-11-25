import Image from './Image';
import Title from './Title';
import Paragraph from './Paragraph';
import Button from './Button';
import IconButton from './IconButton';
import Rating from './Rating';
import SizeSelector from './SizeSelector';

interface ProductDetailsProps {
  layout?: 'sideBySide' | 'stacked';
}

export default function ProductDetails({
  layout = 'sideBySide'
}: ProductDetailsProps) {
  if (layout === 'stacked') {
    return (
      <div className="w-full h-full flex flex-col gap-6 p-6">
        {/* Product Images */}
        <div className="w-full h-64">
          <Image />
        </div>

        {/* Product Info */}
        <div className="flex flex-col gap-4">
          {/* Title */}
          <div className="h-8 w-full">
            <Title level={1} align="left" />
          </div>

          {/* Price */}
          <div className="h-8 w-32">
            <Title level={2} align="left" />
          </div>

          {/* Description */}
          <div className="h-12">
            <Paragraph lines={3} />
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-2">
            <div className="h-10 flex-1">
              <Button variant="primary" align="center" />
            </div>
            <IconButton variant="outlined" size="medium" />
          </div>
        </div>
      </div>
    );
  }

  // Side by side layout
  return (
    <div className="w-full h-full flex gap-8 p-6">
      {/* Left: Product Images */}
      <div className="flex-1 flex flex-col gap-3">
        <div className="w-full h-80">
          <Image />
        </div>
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="w-16 h-16">
              <Image />
            </div>
          ))}
        </div>
      </div>

      {/* Right: Product Info */}
      <div className="flex-1 flex flex-col gap-4">
        {/* Title */}
        <div className="h-8 w-full">
          <Title level={1} align="left" />
        </div>

        {/* Price */}
        <div className="h-8 w-32">
          <Title level={2} align="left" />
        </div>

        {/* Rating */}
        <Rating maxStars={5} filledStars={4} size="medium" />

        {/* Description */}
        <div className="h-16 mt-2">
          <Paragraph lines={4} />
        </div>

        {/* Size/Variant Selection */}
        <div className="mt-4">
          <SizeSelector optionCount={3} selectedIndex={1} size="medium" variant="outlined" />
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-4">
          <div className="h-12 flex-1">
            <Button variant="primary" align="center" />
          </div>
          <IconButton variant="outlined" size="large" />
        </div>
      </div>
    </div>
  );
}
