import Logo from './Logo';
import NavMenu from './NavMenu';
import SocialLinks from './SocialLinks';
import CopyrightText from './CopyrightText';
import Title from './Title';
import Link from './Link';
import Input from './Input';
import Button from './Button';
import HorizontalLine from './HorizontalLine';

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
          {[1, 2, 3].map((col) => (
            <div key={col} className="flex flex-col gap-2">
              {/* Column Header */}
              <div className="h-6 w-16">
                <Title level={3} align="left" />
              </div>
              {/* Links */}
              {[1, 2, 3, 4].map((link) => (
                <div key={link} className="w-16 h-8">
                  <Link variant="primary" align="left" />
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Subscribe Section */}
        <div className="flex flex-col gap-3 flex-shrink-0">
          {/* Input field and CTA Button on same line */}
          <div className="flex gap-2">
            <div className="h-10 w-40">
              <Input showLabel={false} />
            </div>
            <div className="h-10 w-20">
              <Button variant="primary" align="center" />
            </div>
          </div>
          {/* Social Links */}
          <div className="mt-2">
            <SocialLinks />
          </div>
        </div>
      </div>

      {/* Bottom Row - Copyright */}
      <div className="pt-2">
        <div className="h-px mb-4">
          <HorizontalLine width={1} align="center" />
        </div>
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
