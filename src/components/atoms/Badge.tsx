interface BadgeProps {
  variant?: 'red' | 'blue' | 'green' | 'yellow';
  size?: 'small' | 'medium' | 'large';
}

export default function Badge({
  variant = 'red',
  size = 'small'
}: BadgeProps) {
  const sizeClasses = {
    small: 'w-2 h-2',
    medium: 'w-3 h-3',
    large: 'w-4 h-4'
  }[size];

  const colorClasses = {
    red: 'bg-red-500',
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500'
  }[variant];

  return (
    <div className={`${sizeClasses} ${colorClasses} rounded-full`}></div>
  );
}
