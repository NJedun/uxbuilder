import Image from './Image';
import Title from './Title';
import Paragraph from './Paragraph';
import Button from './Button';

interface HeroWithImageProps {
  align?: 'left' | 'right';
}

export default function HeroWithImage({
  align = 'left'
}: HeroWithImageProps) {
  const isImageLeft = align === 'left';

  return (
    <div className="w-full h-full flex items-center gap-8 px-12 py-16 bg-gradient-to-r from-gray-100 to-gray-200">
      {/* Image Section */}
      {isImageLeft && (
        <div className="w-1/2 h-full">
          <Image />
        </div>
      )}

      {/* Content Section */}
      <div className="w-1/2 flex flex-col justify-center">
        {/* Main Heading - H1 style */}
        <div className="w-full h-10 mb-6">
          <Title level={1} align="left" />
        </div>

        {/* Subheading - Paragraph style */}
        <div className="w-full h-8 mb-8">
          <Paragraph lines={2} />
        </div>

        {/* Single CTA Button */}
        <div className="w-40 h-12">
          <Button variant="primary" align="left" />
        </div>
      </div>

      {/* Image Section */}
      {!isImageLeft && (
        <div className="w-1/2 h-full">
          <Image />
        </div>
      )}
    </div>
  );
}
