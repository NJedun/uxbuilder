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
        <div className="w-full h-64 bg-gray-200 rounded relative overflow-hidden">
          <div className="absolute inset-0 image-pattern" />
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>

        {/* Product Info */}
        <div className="flex flex-col gap-4">
          {/* Title */}
          <div className="h-6 w-3/4 bg-gray-700 rounded"></div>

          {/* Price */}
          <div className="h-8 w-32 bg-gray-700 rounded"></div>

          {/* Description */}
          <div className="flex flex-col gap-2">
            <div className="h-2 w-full bg-gray-400 rounded"></div>
            <div className="h-2 w-full bg-gray-400 rounded"></div>
            <div className="h-2 w-5/6 bg-gray-400 rounded"></div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-2">
            <div className="h-10 flex-1 bg-gray-600 rounded"></div>
            <div className="h-10 w-10 border-2 border-gray-400 rounded"></div>
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
        <div className="w-full h-80 bg-gray-200 rounded relative overflow-hidden">
          <div className="absolute inset-0 image-pattern" />
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="w-16 h-16 bg-gray-300 rounded relative overflow-hidden">
            <div className="absolute inset-0 image-pattern" />
          </div>
          <div className="w-16 h-16 bg-gray-300 rounded relative overflow-hidden">
            <div className="absolute inset-0 image-pattern" />
          </div>
          <div className="w-16 h-16 bg-gray-300 rounded relative overflow-hidden">
            <div className="absolute inset-0 image-pattern" />
          </div>
          <div className="w-16 h-16 bg-gray-300 rounded relative overflow-hidden">
            <div className="absolute inset-0 image-pattern" />
          </div>
        </div>
      </div>

      {/* Right: Product Info */}
      <div className="flex-1 flex flex-col gap-4">
        {/* Title */}
        <div className="h-6 w-3/4 bg-gray-700 rounded"></div>

        {/* Price */}
        <div className="h-8 w-32 bg-gray-700 rounded"></div>

        {/* Rating */}
        <div className="flex gap-1">
          <div className="w-4 h-4 bg-yellow-400 rounded-full"></div>
          <div className="w-4 h-4 bg-yellow-400 rounded-full"></div>
          <div className="w-4 h-4 bg-yellow-400 rounded-full"></div>
          <div className="w-4 h-4 bg-yellow-400 rounded-full"></div>
          <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
        </div>

        {/* Description */}
        <div className="flex flex-col gap-2 mt-2">
          <div className="h-2 w-full bg-gray-400 rounded"></div>
          <div className="h-2 w-full bg-gray-400 rounded"></div>
          <div className="h-2 w-full bg-gray-400 rounded"></div>
          <div className="h-2 w-4/5 bg-gray-400 rounded"></div>
        </div>

        {/* Size/Variant Selection */}
        <div className="flex gap-2 mt-4">
          <div className="h-10 w-10 border-2 border-gray-400 rounded"></div>
          <div className="h-10 w-10 border-2 border-gray-600 rounded"></div>
          <div className="h-10 w-10 border-2 border-gray-400 rounded"></div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-4">
          <div className="h-12 flex-1 bg-gray-600 rounded"></div>
          <div className="h-12 w-12 border-2 border-gray-400 rounded"></div>
        </div>
      </div>
    </div>
  );
}
