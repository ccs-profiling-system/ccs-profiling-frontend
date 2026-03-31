interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'white';
  text?: string;
}

export function Spinner({ size = 'md', color = 'primary', text }: SpinnerProps) {
  const sizeClasses = { sm: 'w-8 h-8 border-2', md: 'w-16 h-16 border-4', lg: 'w-24 h-24 border-4' };
  const colorClasses = { primary: 'border-primary border-t-transparent', secondary: 'border-secondary border-t-transparent', white: 'border-white border-t-transparent' };
  return (
    <div className="flex items-center justify-center">
      <div className="text-center">
        <div className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-spin mx-auto mb-4`}></div>
        {text && <p className="text-gray-600">{text}</p>}
      </div>
    </div>
  );
}
