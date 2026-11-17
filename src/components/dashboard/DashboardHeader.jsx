import { Sparkles, Calendar, Boxes } from 'lucide-react';

export default function DashboardHeader({
  productName = 'All Products',
  dateRangeLabel = 'Last 30 Days',
  totalCount = 0,
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border/80">
      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-bold text-primary tracking-tight">
          Overview
        </h1>
        <p className="text-xs sm:text-sm text-muted">
          Understand customer feedback and discover what needs improvement.
        </p>
      </div>

      {/* Active Scope Summary Pills */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="px-2.5 py-1 rounded-lg bg-card border border-border text-primary font-medium flex items-center gap-1.5 shadow-xs">
          <Boxes className="w-3.5 h-3.5 text-accent" />
          <span>{productName}</span>
        </span>

        <span className="px-2.5 py-1 rounded-lg bg-card border border-border text-muted flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" />
          <span>{dateRangeLabel}</span>
        </span>

        <span className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-muted font-mono">
          {totalCount} responses evaluated
        </span>
      </div>
    </div>
  );
}
