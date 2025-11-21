import { ReactNode } from 'react';

interface ContainerProps {
  children?: ReactNode;
  variant?: 'default' | 'bordered' | 'shadowed';
  padding?: 'none' | 'small' | 'medium' | 'large';
}

export default function Container({
  children,
  variant = 'default',
  padding = 'medium'
}: ContainerProps) {
  const variantStyles = {
    default: 'bg-gray-100',
    bordered: 'bg-white border-2 border-gray-300',
    shadowed: 'bg-white shadow-lg',
  };

  const paddingStyles = {
    none: 'p-0',
    small: 'p-2',
    medium: 'p-4',
    large: 'p-8',
  };

  return (
    <div className={`rounded-lg ${variantStyles[variant]} ${paddingStyles[padding]} min-h-[100px] w-full flex flex-wrap gap-2 items-start content-start`}>
      {children || (
        <div className="text-gray-400 text-center py-8 text-sm w-full">
          Drop components here
        </div>
      )}
    </div>
  );
}
