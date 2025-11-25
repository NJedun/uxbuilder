interface RatingProps {
  maxStars?: number;
  filledStars?: number;
  size?: 'small' | 'medium' | 'large';
}

export default function Rating({
  maxStars = 5,
  filledStars = 4,
  size = 'medium'
}: RatingProps) {
  const starSize = {
    small: 'w-3 h-3',
    medium: 'w-4 h-4',
    large: 'w-5 h-5'
  }[size];

  return (
    <div className="flex gap-1">
      {Array.from({ length: maxStars }).map((_, i) => (
        <div
          key={i}
          className={`${starSize} ${
            i < filledStars ? 'bg-yellow-400' : 'bg-gray-300'
          } rounded-full`}
        ></div>
      ))}
    </div>
  );
}
