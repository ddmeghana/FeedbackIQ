import { useState } from 'react';
import { ThumbsUp, AlertTriangle, Layers, Quote, Sparkles, Star, Calendar, ChevronDown, ChevronUp, Lightbulb, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Badge from '../ui/Badge';
import { formatDate } from '../../lib/utils';
import { ROUTES } from '../../config/constants';

export default function PraiseAndPainPoints({
  positiveRecords = [],
  negativeRecords = [],
}) {
  const [showAllPraise, setShowAllPraise] = useState(false);
  const [showAllComplaints, setShowAllComplaints] = useState(false);

  // ─── 1. Group Positive Feedback (What Customers Appreciate) ──────────────────
  const positiveSummaries = positiveRecords.filter(
    (r) => r.Summary && typeof r.Summary === 'string' && r.Summary.trim() !== ''
  );

  const praiseByCategory = {};
  positiveSummaries.forEach((r) => {
    const cat = (r.Category || 'General Product Quality').trim();
    if (!praiseByCategory[cat]) {
      praiseByCategory[cat] = [];
    }
    praiseByCategory[cat].push({
      id: r.Response_ID,
      summary: r.Summary.trim(),
      productId: r.Product_ID,
      productName: r.Product_Name || r.Product_ID || 'Product',
      rating: r.Rating,
      timestamp: r.Timestamp,
    });
  });

  const praiseCategories = Object.keys(praiseByCategory).sort(
    (a, b) => praiseByCategory[b].length - praiseByCategory[a].length
  );

  const visiblePraiseCats = showAllPraise ? praiseCategories : praiseCategories.slice(0, 4);

  // ─── 2. Group Negative Feedback (Areas Needing Attention) ────────────────────
  const negativeSummaries = negativeRecords.filter(
    (r) => r.Summary && typeof r.Summary === 'string' && r.Summary.trim() !== ''
  );

  const complaintsByCategory = {};
  negativeSummaries.forEach((r) => {
    const cat = (r.Category || 'General Friction').trim();
    if (!complaintsByCategory[cat]) {
      complaintsByCategory[cat] = [];
    }
    complaintsByCategory[cat].push({
      id: r.Response_ID,
      summary: r.Summary.trim(),
      productId: r.Product_ID,
      productName: r.Product_Name || r.Product_ID || 'Product',
      rating: r.Rating,
      timestamp: r.Timestamp,
      action: r.Suggested_Action && r.Suggested_Action.trim() !== '' ? r.Suggested_Action.trim() : null,
    });
  });

  const complaintCategories = Object.keys(complaintsByCategory).sort(
    (a, b) => complaintsByCategory[b].length - complaintsByCategory[a].length
  );

  const visibleComplaintCats = showAllComplaints ? complaintCategories : complaintCategories.slice(0, 4);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
      {/* ─── Column 1: Organization-Level Praise Patterns ─────────────────────── */}
      <div className="surface-card rounded-2xl p-5 sm:p-6 border border-border space-y-4 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 pb-3 border-b border-border/80">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                <ThumbsUp className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-primary">What Customers Appreciate</h3>
                <p className="text-xs text-muted">
                  Positive customer themes and praise highlights grouped by operational category
                </p>
              </div>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold shrink-0">
              {positiveSummaries.length} Praise Highlights
            </span>
          </div>

          <div className="mt-4 space-y-4">
            {praiseCategories.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-muted flex items-center justify-center mx-auto">
                  <Sparkles className="w-4 h-4" />
                </div>
                <p className="text-xs text-muted max-w-xs mx-auto">
                  No analyzed positive feedback records with executive summaries found in this scope.
                </p>
              </div>
            ) : (
              visiblePraiseCats.map((category) => {
                const items = praiseByCategory[category];
                // Unique products supporting this praise category
                const uniqueProducts = Array.from(
                  new Set(items.map((i) => i.productName))
                );

                return (
                  <div
                    key={category}
                    className="p-4 rounded-xl bg-emerald-500/[0.03] border border-emerald-500/15 space-y-3"
                  >
                    {/* Pattern Theme Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-emerald-500/10">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="font-bold text-primary text-xs sm:text-sm">
                          {category}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold self-start sm:self-auto">
                        {items.length} {items.length === 1 ? 'report in this category' : 'reports in this category'}
                      </span>
                    </div>

                    {/* Associated Products Tags with Link to Product Analysis */}
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono">
                      <span className="text-muted">Products:</span>
                      {uniqueProducts.map((prodName) => {
                        const matchingItem = items.find((i) => i.productName === prodName);
                        const prodTarget = matchingItem?.productId || prodName;
                        return (
                          <Link
                            key={prodName}
                            to={`${ROUTES.PRODUCT_ANALYSIS}?product=${encodeURIComponent(prodTarget)}`}
                            className="px-2 py-0.5 rounded-md bg-card border border-border hover:border-accent/40 text-primary font-medium flex items-center gap-1 transition-colors"
                            title={`Investigate ${prodName} in Product Analysis`}
                          >
                            <Layers className="w-2.5 h-2.5 text-accent" />
                            <span>{prodName}</span>
                            <ArrowRight className="w-2 h-2 text-muted" />
                          </Link>
                        );
                      })}
                    </div>

                    {/* Supporting Stored Groq Summaries */}
                    <div className="space-y-2 pt-1">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className="p-2.5 rounded-lg bg-card border border-border/60 text-xs space-y-1.5"
                        >
                          <div className="flex items-start gap-2">
                            <Quote className="w-3.5 h-3.5 text-emerald-500/70 shrink-0 mt-0.5" />
                            <p className="font-medium text-primary leading-relaxed text-[11px]">
                              {item.summary}
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-muted pt-1 border-t border-border/40">
                            <div className="flex items-center gap-2">
                              <span className="text-primary font-medium">{item.productName}</span>
                              {item.rating && (
                                <span className="flex items-center gap-1 text-amber-500">
                                  <Star className="w-2.5 h-2.5 fill-amber-500" />
                                  <span>{item.rating} ★</span>
                                </span>
                              )}
                            </div>
                            {item.timestamp && (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-2.5 h-2.5" />
                                <span>{formatDate(item.timestamp)}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            )}

            {/* View All / Collapse toggle */}
            {praiseCategories.length > 4 && (
              <button
                type="button"
                onClick={() => setShowAllPraise(!showAllPraise)}
                className="w-full py-2 text-center text-xs font-medium text-accent hover:underline flex items-center justify-center gap-1 pt-1"
              >
                <span>{showAllPraise ? 'Show Fewer Categories' : `View All (${praiseCategories.length} Categories)`}</span>
                {showAllPraise ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>
        </div>

        <div className="pt-3 border-t border-border/60 text-[10px] font-mono text-muted">
          * Feedback summaries are authentic values stored in Google Sheets without frontend rewriting.
        </div>
      </div>

      {/* ─── Column 2: Organization-Level Friction Patterns ──────────────────── */}
      <div className="surface-card rounded-2xl p-5 sm:p-6 border border-border space-y-4 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 pb-3 border-b border-border/80">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-primary">Areas Needing Attention</h3>
                <p className="text-xs text-muted">
                  Customer pain points and friction highlights grouped by operational category
                </p>
              </div>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-red-500/10 text-red-600 dark:text-red-400 font-semibold shrink-0">
              {negativeSummaries.length} Friction Highlights
            </span>
          </div>

          <div className="mt-4 space-y-4">
            {complaintCategories.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-muted flex items-center justify-center mx-auto">
                  <Sparkles className="w-4 h-4" />
                </div>
                <p className="text-xs text-muted max-w-xs mx-auto">
                  Zero negative feedback records identified in the active filter scope.
                </p>
              </div>
            ) : (
              visibleComplaintCats.map((category) => {
                const items = complaintsByCategory[category];
                const hasMultiple = items.length > 1;
                const uniqueProducts = Array.from(
                  new Set(items.map((i) => i.productName))
                );

                // Collect distinct stored actions
                const distinctActions = Array.from(
                  new Set(items.map((i) => i.action).filter(Boolean))
                );

                return (
                  <div
                    key={category}
                    className="p-4 rounded-xl bg-red-500/[0.03] border border-red-500/15 space-y-3"
                  >
                    {/* Pattern Theme Header with Conservative, Accurate Classification */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-red-500/10">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500" />
                        <span className="font-bold text-primary text-xs sm:text-sm">
                          {category}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold self-start sm:self-auto ${
                          hasMultiple
                            ? 'bg-red-500/15 text-red-600 dark:text-red-400 font-bold border border-red-500/20'
                            : 'bg-zinc-100 dark:bg-zinc-800 text-muted border border-border'
                        }`}
                      >
                        {hasMultiple
                          ? `Multiple reports in this category (${items.length} across ${uniqueProducts.length} ${uniqueProducts.length === 1 ? 'product' : 'products'})`
                          : 'Single report in this category'}
                      </span>
                    </div>

                    {/* Associated Products Tags with Link to Product Analysis */}
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono">
                      <span className="text-muted">Products affected:</span>
                      {uniqueProducts.map((prodName) => {
                        const matchingItem = items.find((i) => i.productName === prodName);
                        const prodTarget = matchingItem?.productId || prodName;
                        return (
                          <Link
                            key={prodName}
                            to={`${ROUTES.PRODUCT_ANALYSIS}?product=${encodeURIComponent(prodTarget)}`}
                            className="px-2 py-0.5 rounded-md bg-card border border-border hover:border-accent/40 text-primary font-medium flex items-center gap-1 transition-colors"
                            title={`Investigate ${prodName} in Product Analysis`}
                          >
                            <Layers className="w-2.5 h-2.5 text-accent" />
                            <span>{prodName}</span>
                            <ArrowRight className="w-2 h-2 text-muted" />
                          </Link>
                        );
                      })}
                    </div>

                    {/* Stored Groq Suggested Actions if present */}
                    {distinctActions.length > 0 && (
                      <div className="p-2.5 rounded-lg bg-card/90 border border-border/70 space-y-1 text-xs">
                        <div className="flex items-center gap-1.5 font-bold text-primary text-[11px]">
                          <Lightbulb className="w-3 h-3 text-amber-500" />
                          <span>Stored Groq Suggested Action:</span>
                        </div>
                        {distinctActions.map((act, aIdx) => (
                          <p key={aIdx} className="text-muted text-[11px] leading-relaxed pl-4">
                            &bull; {act}
                          </p>
                        ))}
                      </div>
                    )}

                    {/* Supporting Stored Groq Summaries */}
                    <div className="space-y-2 pt-1">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className="p-2.5 rounded-lg bg-card border border-border/60 text-xs space-y-1.5"
                        >
                          <div className="flex items-start gap-2">
                            <Quote className="w-3.5 h-3.5 text-red-500/70 shrink-0 mt-0.5" />
                            <p className="font-medium text-primary leading-relaxed text-[11px]">
                              {item.summary}
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-muted pt-1 border-t border-border/40">
                            <div className="flex items-center gap-2">
                              <span className="text-primary font-medium">{item.productName}</span>
                              {item.rating && (
                                <span className="flex items-center gap-1 text-amber-500">
                                  <Star className="w-2.5 h-2.5 fill-amber-500" />
                                  <span>{item.rating} ★</span>
                                </span>
                              )}
                            </div>
                            {item.timestamp && (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-2.5 h-2.5" />
                                <span>{formatDate(item.timestamp)}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            )}

            {/* View All / Collapse toggle */}
            {complaintCategories.length > 4 && (
              <button
                type="button"
                onClick={() => setShowAllComplaints(!showAllComplaints)}
                className="w-full py-2 text-center text-xs font-medium text-accent hover:underline flex items-center justify-center gap-1 pt-1"
              >
                <span>{showAllComplaints ? 'Show Fewer Categories' : `View All (${complaintCategories.length} Categories)`}</span>
                {showAllComplaints ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>
        </div>

        <div className="pt-3 border-t border-border/60 text-[10px] font-mono text-muted">
          * Categorized customer feedback highlights without synthetic extrapolation or frontend-generated conclusions.
        </div>
      </div>
    </div>
  );
}
