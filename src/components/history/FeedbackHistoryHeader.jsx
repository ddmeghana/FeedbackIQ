import { History, RefreshCw, Clock, FilterX } from 'lucide-react';
import Badge from '../ui/Badge';

export default function FeedbackHistoryHeader({
  totalMatching = 0,
  totalRecords = 0,
  activeFiltersCount = 0,
  onResetFilters,
  lastRefreshed,
  onRefresh,
  loading,
  selectedProductName = 'All Products',
  dateRangeLabel = 'Last 30 Days',
}) {
  return (
    <div className="surface-card rounded-2xl p-5 sm:p-6 border border-border space-y-4">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-border/80">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-accent/15 text-accent flex items-center justify-center shrink-0">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-primary tracking-tight">
                Feedback History
              </h1>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-muted">
            Inspect, search, and audit all customer feedback collected in the central database.
          </p>
        </div>

        {/* Refresh & Record Count Indicator */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs font-mono text-muted border border-border/60">
            <strong className="text-primary font-bold">{totalMatching}</strong> of {totalRecords} records
          </span>

          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-muted hover:text-primary hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-border transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent shadow-xs"
              title="Refresh feedback from Google Sheets"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-accent' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          )}
        </div>
      </div>

      {/* Scope Summary & Filter Reset Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-mono text-muted">Scope:</span>
          <span className="px-2.5 py-0.5 rounded-lg bg-card border border-border text-primary font-medium text-[11px] shadow-xs">
            {selectedProductName}
          </span>
          <span className="px-2.5 py-0.5 rounded-lg bg-card border border-border text-muted text-[11px]">
            {dateRangeLabel}
          </span>
          {activeFiltersCount > 0 && (
            <Badge variant="outline" size="sm">
              {activeFiltersCount} {activeFiltersCount === 1 ? 'filter' : 'filters'} active
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-3">
          {activeFiltersCount > 0 && (
            <button
              type="button"
              onClick={onResetFilters}
              className="flex items-center gap-1 text-[11px] font-medium text-accent hover:underline focus-visible:outline-none"
            >
              <FilterX className="w-3.5 h-3.5" />
              Reset page filters
            </button>
          )}

          <div className="flex items-center gap-1.5 text-[11px] font-mono text-muted">
            <Clock className="w-3 h-3 text-muted/70" />
            <span>
              {lastRefreshed
                ? `Synced ${lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                : 'Live sync'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
