import Link from './Link';
import Button from './Button';

interface NavMenuProps {
  variant?: 'simple' | 'withDropdown' | 'withButton';
  itemCount?: number;
}

export default function NavMenu({
  variant = 'simple',
  itemCount = 4
}: NavMenuProps) {
  const renderSimple = () => (
    <nav className="flex gap-6 items-center h-full">
      {Array.from({ length: itemCount }).map((_, i) => (
        <div key={i} className="w-16">
          <Link variant="primary" align="left" />
        </div>
      ))}
    </nav>
  );

  const renderWithDropdown = () => (
    <nav className="flex gap-6 items-center h-full">
      {Array.from({ length: itemCount }).map((_, i) => (
        <div key={i} className="flex items-center gap-1">
          <div className="w-16">
            <Link variant="primary" align="left" />
          </div>
          <div className="w-3 h-3 border-l-2 border-b-2 border-blue-500 transform rotate-[-45deg] mt-[-2px]"></div>
        </div>
      ))}
    </nav>
  );

  const renderWithButton = () => (
    <nav className="flex gap-6 items-center h-full">
      {Array.from({ length: itemCount - 1 }).map((_, i) => (
        <div key={i} className="w-16">
          <Link variant="primary" align="left" />
        </div>
      ))}
      <div className="w-20">
        <Button variant="primary" align="left" />
      </div>
    </nav>
  );

  const variants = {
    simple: renderSimple,
    withDropdown: renderWithDropdown,
    withButton: renderWithButton,
  };

  return (
    <div className="w-full h-full flex items-center px-4">
      {variants[variant]()}
    </div>
  );
}
