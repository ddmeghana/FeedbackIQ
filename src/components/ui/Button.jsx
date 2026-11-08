import { forwardRef } from 'react';
import { cn } from '../../lib/utils';
import Spinner from './Spinner';

/**
 * Reusable Button Component
 * Supports multiple variants, sizes, loading state, and icons.
 * Fully keyboard accessible with custom focus rings.
 */
const Button = forwardRef(function Button(
  {
    children,
    type = 'button',
    variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
    size = 'md',        // 'sm' | 'md' | 'lg' | 'icon'
    isLoading = false,
    disabled = false,
    className = '',
    leftIcon,
    rightIcon,
    ...props
  },
  ref
) {
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-all duration-200 select-none disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas active:scale-[0.98]';

  const variants = {
    primary:
      'bg-accent text-zinc-950 hover:bg-amber-400 font-semibold shadow-sm hover:shadow-glow-amber',
    secondary:
      'bg-card text-primary border border-border hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700',
    outline:
      'bg-transparent text-primary border border-border hover:border-accent hover:text-accent',
    ghost:
      'bg-transparent text-primary hover:bg-zinc-100 dark:hover:bg-zinc-800/60',
    danger:
      'bg-red-500 text-white hover:bg-red-600 shadow-sm hover:shadow-glow-red',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 rounded-lg gap-1.5',
    md: 'text-sm px-4 py-2 rounded-xl gap-2',
    lg: 'text-base px-6 py-2.5 rounded-xl gap-2.5',
    icon: 'p-2 rounded-xl',
  };

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || isLoading}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {isLoading ? (
        <Spinner size={size === 'sm' ? 'sm' : 'md'} className="text-current" />
      ) : leftIcon ? (
        <span className="shrink-0">{leftIcon}</span>
      ) : null}
      {children}
      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
});

export default Button;
