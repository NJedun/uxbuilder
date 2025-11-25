import Title from './Title';
import Paragraph from './Paragraph';
import Button from './Button';

interface HeroSectionProps {
  align?: 'left' | 'center' | 'right';
  hasImageBackground?: boolean;
}

export default function HeroSection({
  align = 'center',
  hasImageBackground = false
}: HeroSectionProps) {
  const backgroundClass = hasImageBackground
    ? ''
    : 'bg-gradient-to-r from-gray-100 to-gray-200';

  return (
    <div className={`w-full h-full relative overflow-hidden ${backgroundClass}`}>
      {/* Image background pattern */}
      {hasImageBackground && (
        <>
          {/* Diagonal stripes pattern to represent image */}
          <div className="absolute inset-0 image-pattern" />
          {/* Image icon in center */}
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </>
      )}

      {/* Content */}
      <div className={`w-full h-full relative z-10 flex flex-col items-center justify-center px-12 py-16`}>
        {/* Main Heading - H1 style */}
        <div className="w-full h-10 mb-6">
          <Title level={1} align={align} />
        </div>

        {/* Subheading - Paragraph style */}
        <div className="w-full h-8 mb-8">
          <Paragraph lines={2} />
        </div>

        {/* Single CTA Button */}
        <div className="w-40 h-12">
          <Button variant="primary" align={align} />
        </div>
      </div>
    </div>
  );
}
