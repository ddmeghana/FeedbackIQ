import { Boxes, Calendar, RefreshCw, Clock, ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../config/constants';
import Badge from '../ui/Badge';

export default function ProductHeader({
  products = [],
  selectedProductId,
  onSelectProduct,
  selectedProduct,
  dateRange,
  onSelectDateRange,
  lastRefreshed,
  onRefresh,
  loading,
}) {
  const dateOptions = [
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' },
    { value: 'all', label: 'All Time' },
  ];

  const activeProducts = products.filter((p) => p.Status !== 'Inactive');

  return (
    <div className="surface-card rounded-2xl p-5 sm:p-6 border border-border space-y-5">
      {/* Top Row: Product Selector & Action Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Product Selector with Meta Details */}
        <div className="space-y-1.5 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted font-bold">
              Product Investigation Workspace
            </span>
            {selectedProduct?.Product_ID && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-muted border border-border/60">
                {selectedProduct.Product_ID}
              </span>
            )}
            <Badge
              variant={selectedProduct?.Status === 'Active' ? 'positive' : 'default'}
              size="sm"
              dot
            >
              {selectedProduct?.Status || 'Active'}
            </Badge>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Custom Styled Native Select for accessibility & performance */}
            <div className="relative inline-flex items-center">
              <Boxes className="w-4 h-4 text-accent absolute left-3 pointer-events-none" />
              <select
                id="product-analysis-selector"
                value={selectedProductId || ''}
                onChange={(e) => onSelectProduct(e.target.value)}
                aria-label="Select product for analysis"
                className="appearance-none pl-9 pr-9 py-2 text-base sm:text-lg font-bold rounded-xl bg-card text-primary border border-border hover:border-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-colors cursor-pointer shadow-xs"
              >
                {activeProducts.map((p) => (
                  <option key={p.Product_ID} value={p.Product_ID}>
                    {p.Product_Name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedProduct?.Description && (
            <p className="text-xs text-muted max-w-2xl pt-0.5 leading-relaxed">
              {selectedProduct.Description}
            </p>
          )}
        </div>

        {/* Right: Date Range Selector & Refresh */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Date Range Dropdown */}
          <div className="relative inline-flex items-center">
            <Calendar className="w-3.5 h-3.5 text-muted absolute left-3 pointer-events-none" />
            <select
              value={dateRange}
              onChange={(e) => onSelectDateRange(e.target.value)}
              aria-label="Filter feedback date range"
              className="appearance-none pl-8 pr-8 py-2 text-xs font-medium rounded-xl bg-card text-primary border border-border hover:border-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-colors cursor-pointer shadow-xs"
            >
              {dateOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Refresh Data Button */}
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-muted hover:text-primary hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-border transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent shadow-xs"
              title="Refresh product feedback from Google Sheets"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-accent' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          )}
        </div>
      </div>

      {/* Bottom Sub-bar: Freshness indicator & Navigation to AI Insights */}
      <div className="pt-3 border-t border-border/60 flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-muted">
        <div className="flex items-center gap-2">
          <Clock className="w-3 h-3 text-muted/70" />
          <span>
            {lastRefreshed
              ? `Last synced: ${lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`
              : 'Live synchronization active'}
          </span>
          <span className="text-muted/40">·</span>
          <span className="text-amber-500 font-medium">Individual Product Scope</span>
        </div>

        <div className="flex items-center gap-4">
          <Link
            to={ROUTES.AI_INSIGHTS}
            className="text-muted hover:text-primary flex items-center gap-1 font-sans text-xs font-medium transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            <span>View Portfolio in AI Insights</span>
          </Link>

          <Link
            to={ROUTES.PRODUCTS}
            className="text-accent hover:underline flex items-center gap-1 font-sans text-xs font-medium"
          >
            <span>Manage Products</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
