interface InputProps {
  showLabel?: boolean;
}

export default function Input({ showLabel = false }: InputProps) {
  return (
    <div className="w-full h-full flex flex-col justify-center px-2 gap-1">
      {showLabel && <div className="h-1.5 bg-gray-500 rounded" style={{ width: '60px' }} />}
      <div className="w-full h-8 border-2 border-gray-400 rounded bg-white" />
    </div>
  );
}
