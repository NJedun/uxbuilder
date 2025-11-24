interface HeroWithImageProps {
  align?: 'left' | 'right';
}

export default function HeroWithImage({
  align = 'left'
}: HeroWithImageProps) {
  const isImageLeft = align === 'left';

  const textColor = 'bg-gray-700';
  const subtextColor = 'bg-gray-500';

  return (
    <div className="w-full h-full flex items-center gap-8 px-12 py-16 bg-gradient-to-r from-gray-100 to-gray-200">
      {/* Image Section */}
      {isImageLeft && (
        <div className="w-1/2 h-full relative overflow-hidden rounded">
          {/* Diagonal stripes pattern to represent image */}
          <div className="absolute inset-0 image-pattern" />
          {/* Image icon in center */}
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
      )}

      {/* Content Section */}
      <div className="w-1/2 flex flex-col justify-center">
        {/* Main Heading - H1 style */}
        <div className="flex justify-start mb-6 w-full">
          <div className={`h-4 ${textColor} rounded`} style={{ width: '70%' }}></div>
        </div>

        {/* Subheading - H3 style */}
        <div className="flex justify-start mb-8 w-full">
          <div className={`h-2 ${subtextColor} rounded`} style={{ width: '50%' }}></div>
        </div>

        {/* Single CTA Button */}
        <div className="flex justify-start w-full">
          <div className="h-12 w-40 bg-gray-600 rounded"></div>
        </div>
      </div>

      {/* Image Section */}
      {!isImageLeft && (
        <div className="w-1/2 h-full relative overflow-hidden rounded">
          {/* Diagonal stripes pattern to represent image */}
          <div className="absolute inset-0 image-pattern" />
          {/* Image icon in center */}
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}
