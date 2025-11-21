interface LogoProps {
  size?: 'small' | 'medium' | 'large';
}

export default function Logo({ size = 'medium' }: LogoProps) {
  const sizeConfig = {
    small: { width: '65%', height: '18px' },
    medium: { width: '75%', height: '24px' },
    large: { width: '85%', height: '30px' },
  };

  const config = sizeConfig[size];

  return (
    <div className="w-full h-full flex items-center justify-center p-2">
      <div
        className="border-2 border-gray-600 relative overflow-hidden"
        style={{
          width: config.width,
          height: config.height,
          borderRadius: '999px',
          backgroundColor: '#e5e7eb',
          backgroundImage: 'repeating-linear-gradient(45deg, #d1d5db 0, #d1d5db 10px, #e5e7eb 10px, #e5e7eb 20px)'
        }}
      />
    </div>
  );
}
