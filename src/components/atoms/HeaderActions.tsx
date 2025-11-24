interface HeaderActionsProps {
  variant?: 'icons' | 'buttons';
}

export default function HeaderActions({
  variant = 'icons'
}: HeaderActionsProps) {
  if (variant === 'icons') {
    return (
      <div className="w-full h-full flex items-center justify-end gap-4 px-4">
        {/* Cart icon */}
        <div className="w-6 h-6 border-2 border-gray-400 rounded relative">
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
        </div>
        {/* User icon */}
        <div className="w-6 h-6 border-2 border-gray-400 rounded-full"></div>
        {/* Notifications icon */}
        <div className="w-6 h-6 border-2 border-gray-400 rounded relative">
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-end gap-3 px-4">
      {/* Login button - secondary style */}
      <div className="h-8 rounded bg-gray-400" style={{ width: '80px' }} />
      {/* Sign up button - primary style */}
      <div className="h-8 rounded bg-gray-600" style={{ width: '80px' }} />
    </div>
  );
}
