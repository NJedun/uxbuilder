export default function HamburgerIcon() {
  return (
    <div className="w-full h-full flex items-center justify-center p-2">
      <div className="w-6 h-6 flex flex-col justify-center gap-1">
        <div className="w-full h-0.5 bg-gray-600 rounded"></div>
        <div className="w-full h-0.5 bg-gray-600 rounded"></div>
        <div className="w-full h-0.5 bg-gray-600 rounded"></div>
      </div>
    </div>
  );
}
