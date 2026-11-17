import { useState } from 'react';
import { Lightbulb, Layers, Tag, Sparkles, ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Badge from '../ui/Badge';
import { ROUTES } from '../../config/constants';

export default function ActionableRecommendations({
  analyzedRecords = [],
}) {
  const [expandedIndex, setExpandedIndex] = useState(null);

  // Extract all records that have a non-empty Suggested_Action
  const recordsWithActions = analyzedRecords.filter(
    (r) => r.Suggested_Action && typeof r.Suggested_Action === 'string' && r.Suggested_Action.trim() !== ''
  );

  // Consolidate & deduplicate recommendations (case-insensitive key)
  const actionMap = {};

  recordsWithActions.forEach((r) => {
    const rawAction = r.Suggested_Action.trim();
    const key = rawAction.toLowerCase();

    if (!actionMap[key]) {
      actionMap[key] = {
        action: rawAction,
        category: (r.Category || 'General').trim(),
        products: new Set(),
        sentiments: new Set(),
        responseIds: [],
        ratings: [],
        summaries: [],
        count: 0,
      };
    }

    const item = actionMap[key];
    item.count++;
    const prod = r.Product_Name || r.Product_ID || 'Product';
    item.products.add(prod);
    if (r.Sentiment) item.sentiments.add(r.Sentiment.trim());
    if (r.Response_ID) item.responseIds.push(r.Response_ID);
    if (r.Rating && !isNaN(Number(r.Rating))) item.ratings.push(Number(r.Rating));
    if (r.Summary && r.Summary.trim()) item.summaries.push(r.Summary.trim());
  });

  // Convert to array and prioritize:
  // 1. Actions with Negative/Mixed feedback
  // 2. Actions with higher supporting feedback counts
  const recommendations = Object.values(actionMap).sort((a, b) => {
    const aHasNegative = a.sentiments.has('Negative') || a.sentiments.has('Mixed');
    const bHasNegative = b.sentiments.has('Negative') || b.sentiments.has('Mixed');

    if (aHasNegative && !bHasNegative) return -1;
    if (!aHasNegative && bHasNegative) return 1;

    return b.count - a.count;
  });

  const toggleExpand = (idx) => {
    setExpandedIndex(expandedIndex === idx ? null : idx);
  };

  return (
    <div className="surface-card rounded-2xl p-5 sm:p-6 border border-border space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border/80">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-accent flex items-center justify-center shrink-0">
              <Lightbulb className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-primary">Suggested Actions from Customer Feedback</h3>
              <p className="text-xs text-muted">
                Synthesized improvement directives directly traceable to analyzed customer feedback
              </p>
            </div>
          </div>
        </div>
        <span className="text-[11px] font-mono text-muted self-start sm:self-auto">
          {recommendations.length} Actionable Directives
        </span>
      </div>

      {/* Recommendations List */}
      {recommendations.length === 0 ? (
        <div className="py-12 text-center space-y-2">
          <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-muted flex items-center justify-center mx-auto">
            <Sparkles className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-bold text-primary">No Suggestions Available</h4>
          <p className="text-xs text-muted max-w-sm mx-auto">
            Suggested actions will populate here as customer feedback is processed by the AI pipeline.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.map((item, idx) => {
            const isNegativeIssue =
              item.sentiments.has('Negative') || item.sentiments.has('Mixed');
            const isRecurring = item.count > 1;
            const sentimentList = Array.from(item.sentiments);
            const productList = Array.from(item.products);
            const isExpanded = expandedIndex === idx;

            return (
              <div
                key={idx}
                className="p-4 rounded-xl bg-zinc-50/70 dark:bg-zinc-900/50 border border-border/70 hover:border-accent/40 transition-colors flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2.5">
                  {/* Top Badges */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary">
                        <Tag className="w-3 h-3 text-accent" />
                        <span>{item.category}</span>
                      </span>

                      {sentimentList.map((sent) => (
                        <span
                          key={sent}
                          className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                            sent.toLowerCase() === 'positive'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                              : sent.toLowerCase() === 'negative'
                              ? 'bg-red-500/10 text-red-600 dark:text-red-400'
                              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                          }`}
                        >
                          {sent}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-1.5 font-mono text-[10px]">
                      {isRecurring ? (
                        <span className="px-2 py-0.5 rounded-full bg-red-500/15 text-red-600 dark:text-red-400 font-bold border border-red-500/20">
                          Recurring ({item.count} reports)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-muted border border-border">
                          1 report
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Recommendation Text */}
                  <p className="text-xs font-semibold text-primary leading-relaxed">
                    {item.action}
                  </p>

                  {/* Context Summary Preview */}
                  {item.summaries.length > 0 && (
                    <div className="p-2.5 rounded-lg bg-card border border-border/60 text-[11px] text-muted italic leading-normal">
                      &ldquo;{item.summaries[0]}&rdquo;
                    </div>
                  )}

                  {/* Expandable Associated Records */}
                  {isExpanded && item.responseIds.length > 0 && (
                    <div className="p-2.5 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 border border-border/60 text-[10px] font-mono space-y-1">
                      <span className="text-primary font-bold block">Source Response IDs:</span>
                      <div className="flex flex-wrap gap-1">
                        {item.responseIds.map((id) => (
                          <span key={id} className="px-1.5 py-0.5 rounded bg-card border border-border text-muted">
                            {id}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer: Traceability & Product with deep link */}
                <div className="pt-2 border-t border-border/50 flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-muted">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {productList.map((prod) => (
                      <Link
                        key={prod}
                        to={`${ROUTES.PRODUCT_ANALYSIS}?product=${encodeURIComponent(prod)}`}
                        className="flex items-center gap-1 text-primary hover:text-accent transition-colors"
                        title={`Investigate ${prod} in Product Analysis`}
                      >
                        <Layers className="w-3 h-3 text-accent" />
                        <span>{prod}</span>
                        <ArrowRight className="w-2.5 h-2.5 text-muted" />
                      </Link>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleExpand(idx)}
                    className="hover:text-primary transition-colors flex items-center gap-1"
                    title="Toggle source response IDs"
                  >
                    <span>Ref: {item.responseIds[0]}</span>
                    {item.responseIds.length > 1 && (
                      <span className="text-accent">
                        (+{item.responseIds.length - 1} more)
                      </span>
                    )}
                    {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="pt-2 text-[10px] font-mono text-muted">
        * Sourced strictly from original Suggested_Action values generated by Groq and stored in Google Sheets.
      </div>
    </div>
  );
}
