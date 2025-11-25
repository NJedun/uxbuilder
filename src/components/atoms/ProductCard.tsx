import Image from './Image';
import Title from './Title';
import Paragraph from './Paragraph';
import Button from './Button';

interface ProductCardProps {
  variant?: 'grid' | 'list';
}

export default function ProductCard({
  variant = 'grid'
}: ProductCardProps) {
  if (variant === 'list') {
    return (
      <div className="w-full h-full flex gap-4 p-4 border border-gray-200 rounded bg-white">
        {/* Product Image */}
        <div className="w-32 h-32 flex-shrink-0">
          <Image />
        </div>

        {/* Product Info */}
        <div className="flex-1 flex flex-col gap-2">
          {/* Title */}
          <div className="h-6 w-48">
            <Title level={3} align="left" />
          </div>
          {/* Description */}
          <div className="h-6 flex-1">
            <Paragraph lines={2} />
          </div>
          {/* Price and Button */}
          <div className="flex items-center justify-between mt-auto">
            <div className="h-6 w-16">
              <Title level={3} align="left" />
            </div>
            <div className="h-8 w-24">
              <Button variant="primary" align="center" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid variant
  return (
    <div className="w-full h-full flex flex-col p-4 border border-gray-200 rounded bg-white">
      {/* Product Image */}
      <div className="w-full h-32 mb-3">
        <Image />
      </div>

      {/* Product Title */}
      <div className="h-5 w-full mb-2">
        <Title level={3} align="left" />
      </div>

      {/* Product Description */}
      <div className="h-6 mb-3">
        <Paragraph lines={2} />
      </div>

      {/* Price */}
      <div className="h-5 w-16 mb-3">
        <Title level={3} align="left" />
      </div>

      {/* Add to Cart Button */}
      <div className="h-8 w-full">
        <Button variant="primary" align="center" />
      </div>
    </div>
  );
}
