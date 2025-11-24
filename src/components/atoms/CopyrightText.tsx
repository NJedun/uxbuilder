interface CopyrightTextProps {
  align?: 'left' | 'center' | 'right';
}

export default function CopyrightText({
  align = 'center'
}: CopyrightTextProps) {
  const alignmentClass = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
  }[align];

  return (
    <div className={`w-full h-full flex items-center ${alignmentClass} px-4`}>
      <div className="text-xs text-gray-500">
        <div className="h-2 w-48 bg-gray-400 rounded"></div>
      </div>
    </div>
  );
}
