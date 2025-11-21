interface SocialLinksProps {
  count?: number;
  align?: 'left' | 'center' | 'right';
}

export default function SocialLinks({ count = 4, align = 'center' }: SocialLinksProps) {
  const alignmentClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
  };

  return (
    <div className={`w-full h-full flex items-center ${alignmentClasses[align]} px-2`}>
      <div className="flex gap-3">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center"
          >
            <div className="w-4 h-4 flex items-center justify-center">
              {/* Simple icon representation - different for variety */}
              {i % 4 === 0 && (
                // F shape (Facebook-like)
                <div className="flex flex-col gap-0.5 items-start">
                  <div className="w-2 h-0.5 bg-white rounded" />
                  <div className="w-1.5 h-0.5 bg-white rounded" />
                  <div className="w-2 h-0.5 bg-white rounded" />
                </div>
              )}
              {i % 4 === 1 && (
                // Bird shape (Twitter-like)
                <div className="w-2.5 h-2.5 bg-white rounded-sm transform rotate-45" />
              )}
              {i % 4 === 2 && (
                // Camera (Instagram-like)
                <div className="w-2 h-2 border border-white rounded" />
              )}
              {i % 4 === 3 && (
                // Play button (YouTube-like)
                <div className="w-0 h-0 border-l-[4px] border-l-white border-t-[3px] border-t-transparent border-b-[3px] border-b-transparent" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
