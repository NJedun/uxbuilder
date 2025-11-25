interface SizeSelectorProps {
  optionCount?: number;
  selectedIndex?: number;
  size?: 'small' | 'medium' | 'large';
  variant?: 'outlined' | 'filled';
}

export default function SizeSelector({
  optionCount = 3,
  selectedIndex = 1,
  size = 'medium',
  variant = 'outlined'
}: SizeSelectorProps) {
  const optionSize = {
    small: 'h-8 w-8',
    medium: 'h-10 w-10',
    large: 'h-12 w-12'
  }[size];

  return (
    <div className="flex gap-2">
      {Array.from({ length: optionCount }).map((_, i) => {
        const isSelected = i === selectedIndex;

        const borderClass = variant === 'outlined'
          ? (isSelected ? 'border-gray-600' : 'border-gray-400')
          : 'border-transparent';

        const bgClass = variant === 'filled'
          ? (isSelected ? 'bg-gray-600' : 'bg-gray-300')
          : 'bg-transparent';

        return (
          <div
            key={i}
            className={`${optionSize} border-2 ${borderClass} ${bgClass} rounded cursor-pointer transition-colors`}
          ></div>
        );
      })}
    </div>
  );
}
