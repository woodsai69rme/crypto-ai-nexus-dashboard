
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

export const LoadingSpinner = ({ size = 'md', className, text }: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-16 w-16'
  };

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className="text-center space-y-2">
        <div className={cn(
          "animate-spin rounded-full border-b-2 border-emerald-500 mx-auto",
          sizeClasses[size]
        )} />
        {text && <p className="text-slate-300 text-sm">{text}</p>}
      </div>
    </div>
  );
};
