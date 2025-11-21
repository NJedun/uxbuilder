interface TitleProps {
  level?: 1 | 2 | 3;
  align?: 'left' | 'center' | 'right';
}

export default function Title({ level = 1, align = 'left' }: TitleProps) {
  const heights = {
    1: 'h-4',
    2: 'h-3',
    3: 'h-2',
  };

  const widths = {
    1: '70%',
    2: '60%',
    3: '50%',
  };

  const alignmentClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
  };

  return (
    <div className={`w-full h-full flex items-center ${alignmentClasses[align]} p-2`}>
      <div
        className={`${heights[level]} bg-gray-600 rounded`}
        style={{ width: widths[level] }}
      />
    </div>
  );
}
