interface ParagraphProps {
  lines?: number;
}

export default function Paragraph({ lines = 3 }: ParagraphProps) {
  return (
    <div className="w-full h-full flex flex-col justify-start gap-0.5 px-1">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-1.5 bg-gray-400 rounded"
          style={{
            width: i === lines - 1 ? '60%' : '100%',
          }}
        />
      ))}
    </div>
  );
}
