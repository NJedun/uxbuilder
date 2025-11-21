interface LogoProps {
  text?: string;
  size?: 'small' | 'medium' | 'large';
}

export default function Logo({ text = 'LOGO', size = 'medium' }: LogoProps) {
  const sizeStyles = {
    small: 'text-xl',
    medium: 'text-3xl',
    large: 'text-5xl',
  };

  return (
    <div className={`${sizeStyles[size]} font-bold text-gray-900 tracking-tight`}>
      {text}
    </div>
  );
}
