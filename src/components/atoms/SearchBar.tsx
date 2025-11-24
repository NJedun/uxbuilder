interface SearchBarProps {
  variant?: 'simple' | 'withIcon';
  placeholder?: string;
}

export default function SearchBar({
  variant = 'simple',
  placeholder = 'Search...'
}: SearchBarProps) {
  if (variant === 'simple') {
    return (
      <div className="w-full h-full flex items-center px-2">
        <div className="w-full h-9 border-2 border-gray-300 rounded-md px-3 flex items-center">
          <div className="h-3 bg-gray-300 rounded w-16"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex items-center px-2">
      <div className="w-full h-9 border-2 border-gray-300 rounded-md px-3 flex items-center gap-2">
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <div className="h-3 bg-gray-300 rounded flex-1"></div>
      </div>
    </div>
  );
}
