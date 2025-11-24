interface LogoProps {
  size?: 'small' | 'medium' | 'large';
}

export default function Logo({ size = 'medium' }: LogoProps) {
  const sizeConfig = {
    small: { width: '80px', height: '32px', iconSize: 'w-4 h-4' },
    medium: { width: '100px', height: '40px', iconSize: 'w-5 h-5' },
    large: { width: '120px', height: '48px', iconSize: 'w-6 h-6' },
  };

  const config = sizeConfig[size];

  return (
    <div className="w-full h-full flex items-center justify-center p-2">
      <div
        className="border-2 border-gray-600 relative overflow-hidden rounded image-pattern"
        style={{
          width: config.width,
          height: config.height,
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className={`${config.iconSize} text-gray-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      </div>
    </div>
  );
}
