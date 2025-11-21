interface TextareaProps {
  rows?: number;
  showLabel?: boolean;
}

export default function Textarea({ rows = 3, showLabel = false }: TextareaProps) {
  return (
    <div className="w-full h-full flex flex-col justify-start px-2 py-2 gap-1">
      {showLabel && <div className="h-1.5 bg-gray-500 rounded" style={{ width: '60px' }} />}
      <div
        className="w-full border-2 border-gray-400 rounded bg-white"
        style={{ height: `${rows * 2}rem` }}
      />
    </div>
  );
}
