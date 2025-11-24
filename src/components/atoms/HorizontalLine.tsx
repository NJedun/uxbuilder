interface HorizontalLineProps {
  width?: number; // 1-5 for line thickness
  align?: 'top' | 'center' | 'bottom';
}

export default function HorizontalLine({
  width = 2,
  align = 'center'
}: HorizontalLineProps) {
  const alignmentClass = {
    top: 'items-start',
    center: 'items-center',
    bottom: 'items-end',
  }[align];

  return (
    <div className={`w-full h-full flex ${alignmentClass}`}>
      <div
        className="w-full bg-gray-300"
        style={{ height: `${width}px` }}
      />
    </div>
  );
}
