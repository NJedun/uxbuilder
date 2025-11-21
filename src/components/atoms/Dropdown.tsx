export default function Dropdown() {
  return (
    <div className="w-full h-full flex items-center px-2">
      <div className="w-full h-8 border-2 border-gray-400 rounded bg-white relative flex items-center justify-end pr-2">
        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}
