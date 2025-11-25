interface IconButtonProps {
  variant?: 'outlined' | 'filled' | 'ghost';
  size?: 'small' | 'medium' | 'large';
}

export default function IconButton({
  variant = 'outlined',
  size = 'medium'
}: IconButtonProps) {
  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-10 h-10',
    large: 'w-12 h-12'
  }[size];

  const variantClasses = {
    outlined: 'border-2 border-gray-400 bg-transparent',
    filled: 'border-2 border-gray-600 bg-gray-600',
    ghost: 'border-0 bg-transparent hover:bg-gray-100'
  }[variant];

  return (
    <div className={`${sizeClasses} ${variantClasses} rounded flex items-center justify-center cursor-pointer transition-colors`}>
      {/* Icon placeholder - represented by a small square */}
      <div className="w-1/2 h-1/2 border border-gray-500 rounded-sm"></div>
    </div>
  );
}
