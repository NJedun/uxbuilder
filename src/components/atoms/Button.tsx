interface ButtonProps {
  variant?: 'primary' | 'secondary';
  align?: 'left' | 'center' | 'right';
}

export default function Button({ variant = 'primary', align = 'center' }: ButtonProps) {
  const alignmentClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
  };

  return (
    <div className={`w-full h-full flex items-center ${alignmentClasses[align]} px-2`}>
      <div
        className={`h-8 rounded ${
          variant === 'primary' ? 'bg-gray-600' : 'bg-gray-400'
        }`}
        style={{ width: '80px' }}
      />
    </div>
  );
}
