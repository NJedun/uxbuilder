interface TextareaProps {
  rows?: number;
}

export default function Textarea({ rows = 3 }: TextareaProps) {
  return (
    <div className="w-full h-full flex items-start px-2 py-2">
      <div
        className="w-full border-2 border-gray-400 rounded bg-white"
        style={{ height: `${rows * 2}rem` }}
      />
    </div>
  );
}
