interface ListProps {
  items?: number;
}

export default function List({ items = 2 }: ListProps) {
  return (
    <div className="w-full h-full flex flex-col justify-start gap-1.5 px-2">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-gray-600 rounded-full flex-shrink-0" />
          <div
            className="h-1.5 bg-gray-400 rounded flex-1"
            style={{ maxWidth: '90%' }}
          />
        </div>
      ))}
    </div>
  );
}
