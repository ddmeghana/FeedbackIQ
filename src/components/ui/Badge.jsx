import { cn } from '../../lib/utils';

export default function Badge({
  children,
  variant = 'default', // 'default' | 'positive' | 'neutral' | 'negative' | 'mixed' | 'outline'
  size = 'md',
  dot = false,
  className = '',
}) {
  const variants = {
    default:
      'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700',
    positive:
      'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    neutral:
      'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    negative:
      'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
    mixed:
      'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    outline:
      'bg-transparent text-primary border-border',
  };

  const dotColors = {
    default: 'bg-zinc-400 dark:bg-zinc-500',
    positive: 'bg-emerald-500',
    neutral: 'bg-amber-500',
    negative: 'bg-red-500',
    mixed: 'bg-purple-500',
    outline: 'bg-accent',
  };

  const sizes = {
    sm: 'text-xs px-2 py-0.5 rounded-md gap-1 font-medium',
    md: 'text-xs px-2.5 py-1 rounded-lg gap-1.5 font-medium',
    lg: 'text-sm px-3 py-1.5 rounded-lg gap-2 font-medium',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center border select-none',
        variants[variant] || variants.default,
        sizes[size],
        className
      )}
    >
      {dot && (
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-full shrink-0',
            dotColors[variant] || dotColors.default
          )}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}
