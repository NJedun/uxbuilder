import Button from './Button';
import IconButton from './IconButton';
import Badge from './Badge';

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
        <div className="relative">
          <IconButton variant="ghost" size="small" />
          <div className="absolute -top-1 -right-1">
            <Badge variant="red" size="medium" />
          </div>
        </div>
        {/* User icon */}
        <IconButton variant="ghost" size="small" />
        {/* Notifications icon */}
        <div className="relative">
          <IconButton variant="ghost" size="small" />
          <div className="absolute -top-1 -right-1">
            <Badge variant="blue" size="small" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-end gap-3 px-4">
      {/* Login button - secondary style */}
      <div className="w-20">
        <Button variant="secondary" align="right" />
      </div>
      {/* Sign up button - primary style */}
      <div className="w-20">
        <Button variant="primary" align="right" />
      </div>
    </div>
  );
}
