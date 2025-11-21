interface LinkProps {
  variant?: 'primary' | 'secondary';
  align?: 'left' | 'center' | 'right';
}

export default function Link({ variant = 'primary', align = 'left' }: LinkProps) {
  const alignmentClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
  };

  return (
    <div className={`w-full h-full flex items-center ${alignmentClasses[align]} px-2`}>
      <div className="flex flex-col gap-0.5">
        <div
          className={`h-2.5 rounded ${
            variant === 'primary' ? 'bg-blue-500' : 'bg-gray-500'
          }`}
          style={{ width: '60px' }}
        />
        <div
          className={`h-0.5 ${
            variant === 'primary' ? 'bg-blue-500' : 'bg-gray-500'
          }`}
          style={{ width: '60px' }}
        />
      </div>
    </div>
  );
}
