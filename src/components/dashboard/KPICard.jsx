import { cn } from '../../lib/utils';

export default function KPICard({
  title,
  value,
  subvalue,
  icon: Icon,
  accentColor = 'accent', // 'accent' | 'emerald' | 'red' | 'amber'
  footnote,
}) {
  const iconColors = {
    accent: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    red: 'bg-red-500/10 text-red-500 border-red-500/20',
    amber: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  };

  return (
    <div className="surface-card rounded-2xl p-5 border border-border flex flex-col justify-between hover:border-accent/30 transition-all duration-200">
      <div className="flex items-center justify-between gap-3 mb-2">
        <span className="text-xs font-medium text-muted">{title}</span>
        {Icon && (
          <div
            className={cn(
              'w-8 h-8 rounded-xl border flex items-center justify-center shrink-0',
              iconColors[accentColor] || iconColors.accent
            )}
          >
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="space-y-1">
        <div className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight">
          {value}
        </div>
        {subvalue && (
          <div className="text-xs text-muted font-medium">{subvalue}</div>
        )}
      </div>

      {footnote && (
        <div className="mt-3 pt-2.5 border-t border-border/60 text-[11px] font-mono text-muted">
          {footnote}
        </div>
      )}
    </div>
  );
}
