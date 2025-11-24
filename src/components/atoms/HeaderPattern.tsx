import Logo from './Logo';
import NavMenu from './NavMenu';
import SearchBar from './SearchBar';
import HeaderActions from './HeaderActions';
import HamburgerIcon from './HamburgerIcon';

interface HeaderPatternProps {
  variant?: 'simple' | 'ecommerce' | 'saas' | 'mobile';
}

export default function HeaderPattern({
  variant = 'simple'
}: HeaderPatternProps) {
  const renderSimple = () => (
    <div className="w-full h-full flex items-center justify-between px-6">
      <div className="flex items-center gap-2">
        <Logo size="medium" />
      </div>
      <div className="flex items-center">
        <NavMenu variant="simple" itemCount={4} />
      </div>
    </div>
  );

  const renderEcommerce = () => (
    <div className="w-full h-full flex items-center justify-between px-6 gap-4">
      <div className="flex items-center gap-2 flex-shrink-0">
        <Logo size="medium" />
      </div>
      <div className="flex-1 max-w-md">
        <SearchBar variant="withIcon" />
      </div>
      <div className="flex-shrink-0">
        <HeaderActions variant="icons" />
      </div>
    </div>
  );

  const renderSaaS = () => (
    <div className="w-full h-full flex items-center justify-between px-6">
      <div className="flex items-center gap-2">
        <Logo size="medium" />
      </div>
      <div className="flex items-center gap-8">
        <NavMenu variant="simple" itemCount={3} />
        <HeaderActions variant="buttons" />
      </div>
    </div>
  );

  const renderMobile = () => (
    <div className="w-full h-full flex items-center justify-between px-4">
      <div className="flex items-center gap-2">
        <Logo size="small" />
      </div>
      <div className="flex items-center gap-4">
        <HamburgerIcon />
      </div>
    </div>
  );

  const variants = {
    simple: renderSimple,
    ecommerce: renderEcommerce,
    saas: renderSaaS,
    mobile: renderMobile,
  };

  return variants[variant]();
}
