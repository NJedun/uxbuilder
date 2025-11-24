import Logo from './Logo';
import NavMenu from './NavMenu';
import SocialLinks from './SocialLinks';
import CopyrightText from './CopyrightText';

interface FooterPatternProps {
  variant?: 'simple' | 'withSocial' | 'multiColumn';
}

export default function FooterPattern({
  variant = 'multiColumn'
}: FooterPatternProps) {
  const renderSimple = () => (
    <div className="w-full h-full flex items-center justify-between px-6">
      <div className="flex items-center gap-2">
        <Logo size="small" />
      </div>
      <div className="flex items-center">
        <NavMenu variant="simple" itemCount={3} />
      </div>
    </div>
  );

  const renderWithSocial = () => (
    <div className="w-full h-full flex flex-col items-center justify-center px-6 gap-4">
      <div className="flex items-center gap-8">
        <NavMenu variant="simple" itemCount={4} />
      </div>
      <div className="flex items-center">
        <SocialLinks />
      </div>
    </div>
  );

  const renderMultiColumn = () => (
    <div className="w-full h-full flex flex-col px-6 py-6">
      {/* Top Row */}
      <div className="flex items-start justify-between gap-8 mb-6">
        {/* Logo */}
        <div className="flex-shrink-0">
          <Logo size="small" />
        </div>

        {/* Link Columns */}
        <div className="flex gap-8 flex-1 justify-center">
          <div className="flex flex-col gap-2">
            {/* Column 1 - Header */}
            <div className="h-3 w-16 bg-gray-600 rounded mb-1"></div>
            {/* Links */}
            <div className="flex flex-col gap-1">
              <div className="h-2.5 w-16 bg-blue-500 rounded"></div>
              <div className="h-0.5 w-16 bg-blue-500"></div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="h-2.5 w-16 bg-blue-500 rounded"></div>
              <div className="h-0.5 w-16 bg-blue-500"></div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="h-2.5 w-16 bg-blue-500 rounded"></div>
              <div className="h-0.5 w-16 bg-blue-500"></div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="h-2.5 w-16 bg-blue-500 rounded"></div>
              <div className="h-0.5 w-16 bg-blue-500"></div>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {/* Column 2 - Header */}
            <div className="h-3 w-16 bg-gray-600 rounded mb-1"></div>
            {/* Links */}
            <div className="flex flex-col gap-1">
              <div className="h-2.5 w-16 bg-blue-500 rounded"></div>
              <div className="h-0.5 w-16 bg-blue-500"></div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="h-2.5 w-16 bg-blue-500 rounded"></div>
              <div className="h-0.5 w-16 bg-blue-500"></div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="h-2.5 w-16 bg-blue-500 rounded"></div>
              <div className="h-0.5 w-16 bg-blue-500"></div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="h-2.5 w-16 bg-blue-500 rounded"></div>
              <div className="h-0.5 w-16 bg-blue-500"></div>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {/* Column 3 - Header */}
            <div className="h-3 w-16 bg-gray-600 rounded mb-1"></div>
            {/* Links */}
            <div className="flex flex-col gap-1">
              <div className="h-2.5 w-16 bg-blue-500 rounded"></div>
              <div className="h-0.5 w-16 bg-blue-500"></div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="h-2.5 w-16 bg-blue-500 rounded"></div>
              <div className="h-0.5 w-16 bg-blue-500"></div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="h-2.5 w-16 bg-blue-500 rounded"></div>
              <div className="h-0.5 w-16 bg-blue-500"></div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="h-2.5 w-16 bg-blue-500 rounded"></div>
              <div className="h-0.5 w-16 bg-blue-500"></div>
            </div>
          </div>
        </div>

        {/* Subscribe Section */}
        <div className="flex flex-col gap-3 flex-shrink-0">
          {/* Input field and CTA Button on same line */}
          <div className="flex gap-2">
            <div className="h-8 w-40 border-2 border-gray-300 rounded bg-white"></div>
            <div className="h-8 w-20 bg-gray-600 rounded"></div>
          </div>
          {/* Social Links */}
          <div className="mt-2">
            <SocialLinks />
          </div>
        </div>
      </div>

      {/* Bottom Row - Copyright */}
      <div className="border-t border-gray-300 pt-4">
        <CopyrightText align="center" />
      </div>
    </div>
  );

  const variants = {
    simple: renderSimple,
    withSocial: renderWithSocial,
    multiColumn: renderMultiColumn,
  };

  return variants[variant]();
}
