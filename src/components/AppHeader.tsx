import { Link, useLocation } from 'react-router-dom';

interface AppHeaderProps {
  title?: string;
  titleColor?: string;
  children?: React.ReactNode;
  rightContent?: React.ReactNode;
}

export default function AppHeader({ title, titleColor = 'text-gray-700', children, rightContent }: AppHeaderProps) {
  const location = useLocation();

  const navLinks = [
    { path: '/visual-builder', label: 'Builder' },
    { path: '/layouts', label: 'Layouts' },
    { path: '/pages', label: 'Pages' },
    { path: '/content-intake', label: 'Add Product' },
  ];

  const isActive = (path: string) => {
    if (path === '/visual-builder') {
      return location.pathname === '/' || location.pathname === '/visual-builder' || location.pathname === '/layout-editor';
    }
    return location.pathname === path;
  };

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="px-4 py-2">
        <div className="flex items-center justify-between gap-4">
          {/* Left side: Logo + Navigation + Title */}
          <div className="flex items-center gap-4">
            {/* Logo/Brand */}
            <Link
              to="/visual-builder"
              className="text-lg font-bold text-gray-800 hover:text-gray-600 transition-colors whitespace-nowrap"
            >
              Visual AI Builder
            </Link>

            {/* Navigation Tabs */}
            <nav className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    isActive(link.path)
                      ? 'bg-white shadow-sm text-gray-900'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Optional page title */}
            {title && (
              <>
                <span className="text-gray-300">|</span>
                <h1 className={`text-base font-semibold ${titleColor} whitespace-nowrap`}>{title}</h1>
              </>
            )}

            {/* Additional left-side content (e.g., ProjectSelector) */}
            {children}
          </div>

          {/* Right side content */}
          {rightContent && (
            <div className="flex items-center gap-2">
              {rightContent}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
