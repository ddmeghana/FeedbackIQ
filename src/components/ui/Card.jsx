import { cn } from '../../lib/utils';

export default function Card({
  children,
  className = '',
  hoverEffect = false,
  glass = false,
  ...props
}) {
  return (
    <div
      className={cn(
        glass ? 'glass-card' : 'surface-card',
        'rounded-2xl p-6 transition-all duration-300',
        hoverEffect && 'glow-border hover:-translate-y-0.5',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
