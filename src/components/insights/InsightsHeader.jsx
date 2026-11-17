import { Sparkles, RefreshCw, Clock, Globe, Calendar, Info, ChevronDown, Layers } from 'lucide-react';
import Badge from '../ui/Badge';

export default function InsightsHeader({
  totalResponses = 0,
  analyzedCount = 0,
  pendingCount = 0,
  failedCount = 0,
  unknownStatusCount = 0,
  undatedCount = 0,
  dateRangeLabel = 'Last 30 Days',
  isDateScoped = true,
  lastRefreshed,
  onRefresh,
  loading = false,
  products = [],
  selectedProduct = 'ALL',
  onSelectProduct,
}) {
  const formatRefreshTime = (timestamp) => {
    if (!timestamp) return null;
    try {
      const d = new Date(timestamp);
      if (isNaN(d.getTime())) return null;
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return null;
    }
  };

  const formattedTime = formatRefreshTime(lastRefreshed);

  const activeProducts = products.filter((p) => p.Status !== 'Inactive');
  const isAllProducts = selectedProduct === 'ALL';
  const selectedProductObj = products.find((p) => p.Product_ID === selectedProduct);
  const selectedProductName = isAllProducts
    ? 'All Products (Portfolio-Wide)'
    : selectedProductObj?.Product_Name || selectedProduct;

  return (
    <div className="surface-card rounded-2xl p-5 sm:p-6 border border-border space-y-4">
      {/* Top Header Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-border/80">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-accent/15 text-accent flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-primary tracking-tight">
                AI Insights
              </h1>
            </div>

            {/* Groq Attribution Badge */}
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-[11px] font-mono text-muted border border-border/70">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              <span>Powered by Groq-analyzed feedback</span>
            </span>
          </div>

          <p className="text-xs sm:text-sm text-muted">
            {isAllProducts
              ? 'Organization-wide customer intelligence across your entire product portfolio.'
              : `Aggregated customer intelligence focused on ${selectedProductName}.`}
          </p>
        </div>

        {/* Live Sync Status & Refresh Action */}
        <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto">
          {/* Live Google Sheets Connection Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-mono font-medium shadow-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Google Sheets Live</span>
          </div>

          {/* Last refreshed time */}
          {formattedTime && (
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs font-mono text-muted border border-border/60">
              <Clock className="w-3.5 h-3.5" />
              <span>Synced {formattedTime}</span>
            </span>
          )}

          {/* Manual Refresh Button */}
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-muted hover:text-primary hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-border transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent shadow-xs"
              title="Refresh intelligence from Google Sheets"
              aria-label="Refresh intelligence"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-accent' : ''}`} />
              <span>Refresh</span>
            </button>
          )}
        </div>
      </div>

      {/* Scope Selector & Coverage Status Chips */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        {/* Dynamic Product Scope Selector & Date Badge */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-mono text-muted uppercase font-semibold">Scope:</span>
            <div className="relative inline-flex items-center">
              {isAllProducts ? (
                <Globe className="w-3.5 h-3.5 text-accent absolute left-2.5 pointer-events-none" />
              ) : (
                <Layers className="w-3.5 h-3.5 text-accent absolute left-2.5 pointer-events-none" />
              )}
              <select
                id="ai-insights-scope-selector"
                value={selectedProduct}
                onChange={(e) => onSelectProduct && onSelectProduct(e.target.value)}
                aria-label="Select product scope for intelligence"
                className="appearance-none pl-8 pr-8 py-1.5 text-xs font-semibold rounded-xl bg-card text-primary border border-border hover:border-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-colors cursor-pointer shadow-xs"
              >
                <option value="ALL">All Products (Portfolio-Wide)</option>
                {activeProducts.map((p) => (
                  <option key={p.Product_ID} value={p.Product_ID}>
                    {p.Product_Name || p.Product_ID}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-muted absolute right-2.5 pointer-events-none" />
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-card border border-border text-primary font-medium text-[11px] shadow-xs">
            <Calendar className="w-3 h-3 text-muted" />
            <span>{dateRangeLabel}</span>
          </span>
        </div>

        {/* Coverage summary */}
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
          <span className="px-2.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-muted border border-border/60">
            <strong className="text-primary font-bold">{totalResponses}</strong> Total
          </span>
          <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <strong className="font-bold">{analyzedCount}</strong> Analyzed
          </span>
          {pendingCount > 0 && (
            <span className="px-2.5 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <strong className="font-bold">{pendingCount}</strong> Pending
            </span>
          )}
          {failedCount > 0 && (
            <span className="px-2.5 py-0.5 rounded-md bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
              <strong className="font-bold">{failedCount}</strong> Failed
            </span>
          )}
          {unknownStatusCount > 0 && (
            <span className="px-2.5 py-0.5 rounded-md bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border border-zinc-500/20">
              <strong className="font-bold">{unknownStatusCount}</strong> Unknown Status
            </span>
          )}
        </div>
      </div>

      {/* Undated records note if date filtering is active */}
      {isDateScoped && undatedCount > 0 && (
        <div className="flex items-center gap-1.5 pt-2 border-t border-border/60 text-[11px] font-mono text-muted">
          <Info className="w-3.5 h-3.5 text-muted shrink-0" />
          <span>
            {undatedCount} imported record{undatedCount > 1 ? 's lack' : ' lacks'} a valid submission timestamp and {undatedCount > 1 ? 'are' : 'is'} excluded from date-scoped calculations. Switch to &ldquo;All Time&rdquo; to include undated records.
          </span>
        </div>
      )}
    </div>
  );
}
