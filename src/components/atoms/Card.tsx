interface CardProps {
  variant?: 'solid' | 'image';
}

export default function Card({ variant = 'solid' }: CardProps) {
  const isImage = variant === 'image';

  return (
    <div className="w-full h-full" style={{ padding: '5px' }}>
      <div
        className="w-full h-full rounded relative overflow-hidden"
        style={{
          backgroundColor: isImage ? '#e5e7eb' : '#e5e7eb',
        }}
      >
        {isImage && (
          <>
            {/* Diagonal stripes pattern to represent image */}
            <div className="absolute inset-0" style={{
              backgroundImage: 'repeating-linear-gradient(45deg, #d1d5db 0, #d1d5db 10px, #e5e7eb 10px, #e5e7eb 20px)',
            }} />
            {/* X mark in center to represent image placeholder */}
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
