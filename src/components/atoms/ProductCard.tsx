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
        <div className="w-32 h-32 flex-shrink-0 bg-gray-200 rounded relative overflow-hidden">
          <div className="absolute inset-0 image-pattern" />
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>

        {/* Product Info */}
        <div className="flex-1 flex flex-col gap-2">
          {/* Title */}
          <div className="h-4 w-48 bg-gray-700 rounded"></div>
          {/* Description */}
          <div className="flex flex-col gap-1">
            <div className="h-2 w-full bg-gray-400 rounded"></div>
            <div className="h-2 w-5/6 bg-gray-400 rounded"></div>
          </div>
          {/* Price and Button */}
          <div className="flex items-center justify-between mt-auto">
            <div className="h-5 w-16 bg-gray-700 rounded"></div>
            <div className="h-8 w-24 bg-gray-600 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // Grid variant
  return (
    <div className="w-full h-full flex flex-col p-4 border border-gray-200 rounded bg-white">
      {/* Product Image */}
      <div className="w-full h-32 bg-gray-200 rounded mb-3 relative overflow-hidden">
        <div className="absolute inset-0 image-pattern" />
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      </div>

      {/* Product Title */}
      <div className="h-3 w-3/4 bg-gray-700 rounded mb-2"></div>

      {/* Product Description */}
      <div className="flex flex-col gap-1 mb-3">
        <div className="h-2 w-full bg-gray-400 rounded"></div>
        <div className="h-2 w-4/5 bg-gray-400 rounded"></div>
      </div>

      {/* Price */}
      <div className="h-4 w-16 bg-gray-700 rounded mb-3"></div>

      {/* Add to Cart Button */}
      <div className="h-8 w-full bg-gray-600 rounded"></div>
    </div>
  );
}
