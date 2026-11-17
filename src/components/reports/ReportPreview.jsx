/**
 * FeedbackIQ — Executive Report Preview Component
 *
 * Renders an exact preview of the executive analysis report before PDF export.
 * Features:
 *   - FeedbackIQ branding and report metadata
 *   - Multi-section layout matching Nordic Obsidian theme
 *   - Direct "Export PDF" action button with live status
 *   - Empty and partial data indicators
 */

import { useState } from 'react';
import {
  FileText,
  Download,
  ArrowLeft,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Star,
  ThumbsUp,
  ThumbsDown,
  TrendingUp,
  Layers,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { exportReportToPdf } from '../../services/reportPdfService';

export default function ReportPreview({ reportData, onBackToConfig, onRegenerate }) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [exportError, setExportError] = useState(null);

  const handleExportPdf = async () => {
    setIsExporting(true);
    setExportError(null);
    setExportSuccess(false);

    try {
      await exportReportToPdf(reportData);
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 4000);
    } catch (err) {
      console.error('PDF export failure:', err);
      setExportError('Failed to generate PDF. Please ensure all data is valid and try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const { metadata, kpis, executiveSummary, sentimentBreakdown, ratingDistribution, categoryDistribution, praiseItems, concernItems, productComparison, actionStreams, supportingReferences } = reportData;
  const sections = metadata.sections || {};

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="surface-card rounded-2xl border border-border p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="secondary"
            onClick={onBackToConfig}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Edit Configuration
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={onRegenerate}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Regenerate Preview
          </Button>
        </div>

        <div className="flex items-center gap-3">
          {exportSuccess && (
            <span className="text-xs text-emerald-500 font-medium flex items-center gap-1.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4" /> PDF Downloaded
            </span>
          )}
          {exportError && (
            <span className="text-xs text-red-500 font-medium flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" /> {exportError}
            </span>
          )}
          <Button
            size="sm"
            variant="primary"
            onClick={handleExportPdf}
            loading={isExporting}
            leftIcon={<Download className="w-4 h-4" />}
          >
            Export to PDF
          </Button>
        </div>
      </div>

      {/* Main Report Document Container */}
      <div className="surface-card rounded-3xl border border-border p-6 md:p-10 space-y-10 shadow-sm">
        {/* Executive Header Banner */}
        <div className="rounded-2xl bg-zinc-900 text-white p-6 md:p-8 space-y-6 border border-zinc-800 shadow-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-zinc-950 shadow-sm shadow-amber-500/20">
                <Sparkles className="w-5 h-5 fill-zinc-950" />
              </div>
              <div>
                <span className="font-extrabold text-base tracking-tight text-white">
                  Feedback<span className="text-amber-500">IQ</span>
                </span>
                <span className="block text-[10px] font-mono uppercase tracking-widest text-zinc-400">
                  AI-Powered Customer Intelligence Platform
                </span>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-800/80 border border-zinc-700 text-xs font-mono text-zinc-300">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
              <span>Executive Management Report</span>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-zinc-800">
            <h1 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">
              {metadata.title}
            </h1>
            <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-zinc-400 font-mono">
              <span>Scope: <strong className="text-zinc-200">{metadata.productScopeLabel}</strong></span>
              <span>•</span>
              <span>Period: <strong className="text-zinc-200">{metadata.dateRangeLabel}</strong></span>
              <span>•</span>
              <span>Generated: <strong className="text-zinc-200">{metadata.generatedAt}</strong></span>
              <span>•</span>
              <span>Responses: <strong className="text-amber-400">{metadata.totalResponses}</strong></span>
            </div>
          </div>
        </div>

        {/* Undated disclosure note if any */}
        {metadata.undatedCount > 0 && metadata.dateRange !== 'all' && (
          <div className="px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs flex items-center gap-2">
            <Clock className="w-4 h-4 shrink-0" />
            <span>
              Note: {metadata.undatedCount} feedback record(s) without valid timestamps were excluded from this date-bounded reporting period.
            </span>
          </div>
        )}

        {/* Section 1: Executive Overview */}
        {sections.overview !== false && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-border">
              <span className="w-2 h-2 rounded-full bg-accent" />
              <h2 className="text-sm font-bold text-primary uppercase tracking-wider">
                1. Executive Overview
              </h2>
            </div>
            <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-border/80 border-l-4 border-l-accent leading-relaxed text-xs sm:text-sm text-primary">
              {executiveSummary}
            </div>
          </div>
        )}

        {/* Section 2: Key Performance Indicators */}
        {sections.kpis !== false && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border">
              <span className="w-2 h-2 rounded-full bg-accent" />
              <h2 className="text-sm font-bold text-primary uppercase tracking-wider">
                2. Key Performance Indicators
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="surface-card rounded-xl p-3.5 border border-border space-y-1">
                <span className="text-[11px] font-mono text-muted uppercase">Total Volume</span>
                <p className="text-xl font-bold text-primary">{kpis.totalResponses}</p>
                <span className="text-[10px] text-muted">{kpis.analyzedCount} Analyzed</span>
              </div>

              <div className="surface-card rounded-xl p-3.5 border border-border space-y-1">
                <span className="text-[11px] font-mono text-muted uppercase">Avg Rating</span>
                <p className="text-xl font-bold text-amber-500 flex items-center gap-1">
                  <span>{kpis.averageRating}</span>
                  <Star className="w-3.5 h-3.5 fill-amber-500" />
                </p>
                <span className="text-[10px] text-muted">{kpis.validRatingCount} Ratings</span>
              </div>

              <div className="surface-card rounded-xl p-3.5 border border-border space-y-1">
                <span className="text-[11px] font-mono text-muted uppercase">Positive Share</span>
                <p className="text-xl font-bold text-emerald-500">{kpis.positivePct}%</p>
                <span className="text-[10px] text-muted">{kpis.positiveCount} records</span>
              </div>

              <div className="surface-card rounded-xl p-3.5 border border-border space-y-1">
                <span className="text-[11px] font-mono text-muted uppercase">Negative Share</span>
                <p className="text-xl font-bold text-red-500">{kpis.negativePct}%</p>
                <span className="text-[10px] text-muted">{kpis.negativeCount} records</span>
              </div>

              <div className="surface-card rounded-xl p-3.5 border border-border space-y-1">
                <span className="text-[11px] font-mono text-muted uppercase">Pending AI</span>
                <p className="text-xl font-bold text-primary">{kpis.pendingCount}</p>
                <span className="text-[10px] text-muted">In Queue</span>
              </div>

              <div className="surface-card rounded-xl p-3.5 border border-border space-y-1">
                <span className="text-[11px] font-mono text-muted uppercase">Failed / Flagged</span>
                <p className="text-xl font-bold text-primary">{kpis.failedCount}</p>
                <span className="text-[10px] text-muted">Exceptions</span>
              </div>
            </div>
          </div>
        )}

        {/* Section 3: Sentiment & Rating Breakdown */}
        {(sections.sentiment !== false || sections.ratings !== false) && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border">
              <span className="w-2 h-2 rounded-full bg-accent" />
              <h2 className="text-sm font-bold text-primary uppercase tracking-wider">
                3. Sentiment & Rating Distribution
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left: Sentiment Distribution */}
              {sections.sentiment !== false && (
                <div className="surface-card rounded-2xl p-5 border border-border space-y-3">
                  <h3 className="text-xs font-semibold text-primary">Sentiment Breakdown</h3>
                  <div className="space-y-2">
                    {sentimentBreakdown.map((s) => (
                      <div key={s.name} className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                          <span className="font-medium text-primary">{s.name}</span>
                        </div>
                        <div className="font-mono text-right">
                          <strong className="text-primary">{s.count}</strong>
                          <span className="text-muted ml-1.5">({s.pct}%)</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Right: Rating Breakdown */}
              {sections.ratings !== false && (
                <div className="surface-card rounded-2xl p-5 border border-border space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-primary">Rating Breakdown</h3>
                    <span className="text-[11px] font-mono text-muted">Avg: {kpis.averageRating} ★</span>
                  </div>
                  <div className="space-y-2">
                    {ratingDistribution.map((rat) => (
                      <div key={rat.stars} className="flex items-center gap-3 text-xs">
                        <span className="w-12 font-mono text-muted text-right">{rat.stars} ★</span>
                        <div className="flex-1 h-2 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
                          <div
                            className="h-full bg-amber-500 rounded-full transition-all"
                            style={{ width: `${rat.pct}%` }}
                          />
                        </div>
                        <span className="w-16 font-mono text-primary text-right">
                          {rat.count} ({rat.pct}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Section 4: Feedback Category Breakdown */}
        {sections.categories !== false && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border">
              <span className="w-2 h-2 rounded-full bg-accent" />
              <h2 className="text-sm font-bold text-primary uppercase tracking-wider">
                4. Feedback Category Breakdown
              </h2>
            </div>

            {categoryDistribution.length === 0 ? (
              <p className="text-xs text-muted italic">No feedback categories identified in this dataset.</p>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-border">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-100 dark:bg-zinc-800 text-muted uppercase font-mono text-[10px]">
                    <tr>
                      <th className="py-2.5 px-4 font-semibold">Category</th>
                      <th className="py-2.5 px-4 font-semibold">Response Count</th>
                      <th className="py-2.5 px-4 font-semibold text-right">Share of Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {categoryDistribution.map((cat) => (
                      <tr key={cat.category} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                        <td className="py-2.5 px-4 font-medium text-primary">{cat.category}</td>
                        <td className="py-2.5 px-4 font-mono text-muted">{cat.count}</td>
                        <td className="py-2.5 px-4 font-mono text-primary text-right font-semibold">{cat.pct}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Section 5: Key Customer Praise & Concerns */}
        {sections.praise_pain !== false && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border">
              <span className="w-2 h-2 rounded-full bg-accent" />
              <h2 className="text-sm font-bold text-primary uppercase tracking-wider">
                5. Customer Praise & Recurring Concerns
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Praise Highlights */}
              <div className="surface-card rounded-2xl p-5 border border-emerald-500/20 bg-emerald-500/5 space-y-3">
                <div className="flex items-center gap-2 text-emerald-500 font-semibold text-xs">
                  <ThumbsUp className="w-4 h-4" />
                  <span>Key Positive Observations</span>
                </div>
                {praiseItems.length === 0 ? (
                  <p className="text-xs text-muted italic">No positive feedback records logged.</p>
                ) : (
                  <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                    {praiseItems.map((p, idx) => (
                      <div key={`${p.id}-${idx}`} className="p-3 rounded-xl bg-white dark:bg-zinc-800 border border-emerald-500/20 text-xs space-y-1">
                        <div className="flex items-center justify-between gap-2 text-[11px] font-mono text-muted">
                          <span className="truncate">{p.productName} ({p.category})</span>
                          <span className="text-emerald-500 font-semibold shrink-0">{p.id}</span>
                        </div>
                        <p className="text-primary italic break-words">&ldquo;{p.summary}&rdquo;</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Customer Concerns */}
              <div className="surface-card rounded-2xl p-5 border border-red-500/20 bg-red-500/5 space-y-3">
                <div className="flex items-center gap-2 text-red-500 font-semibold text-xs">
                  <ThumbsDown className="w-4 h-4" />
                  <span>Key Friction Points & Issues</span>
                </div>
                {concernItems.length === 0 ? (
                  <p className="text-xs text-muted italic">No negative feedback records logged.</p>
                ) : (
                  <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                    {concernItems.map((c, idx) => (
                      <div key={`${c.id}-${idx}`} className="p-3 rounded-xl bg-white dark:bg-zinc-800 border border-red-500/20 text-xs space-y-1">
                        <div className="flex items-center justify-between gap-2 text-[11px] font-mono text-muted">
                          <span className="truncate">{c.productName} ({c.category})</span>
                          <span className="text-red-500 font-semibold shrink-0">{c.id}</span>
                        </div>
                        <p className="text-primary italic break-words">&ldquo;{c.summary}&rdquo;</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Section 6: Cross-Product Benchmark (All Products Only) */}
        {sections.product_comparison !== false && metadata.productScope === 'ALL' && productComparison.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border">
              <span className="w-2 h-2 rounded-full bg-accent" />
              <h2 className="text-sm font-bold text-primary uppercase tracking-wider">
                6. Cross-Product Benchmark Comparison
              </h2>
            </div>

            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-100 dark:bg-zinc-800 text-muted uppercase font-mono text-[10px]">
                  <tr>
                    <th className="py-2.5 px-4 font-semibold">Product Name (ID)</th>
                    <th className="py-2.5 px-4 font-semibold">Responses</th>
                    <th className="py-2.5 px-4 font-semibold">Avg Rating</th>
                    <th className="py-2.5 px-4 font-semibold">Positive %</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Negative %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {productComparison.map((prod) => (
                    <tr key={prod.productId} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                      <td className="py-2.5 px-4 font-medium text-primary">
                        {prod.productName} <span className="font-mono text-muted text-[11px]">({prod.productId})</span>
                      </td>
                      <td className="py-2.5 px-4 font-mono text-muted">{prod.totalFeedback}</td>
                      <td className="py-2.5 px-4 font-mono text-amber-500 font-semibold">{prod.averageRating} ★</td>
                      <td className="py-2.5 px-4 font-mono text-emerald-500 font-semibold">{prod.positivePct}%</td>
                      <td className="py-2.5 px-4 font-mono text-red-500 text-right font-semibold">{prod.negativePct}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Section 7: Suggested Improvement Actions */}
        {sections.actions !== false && actionStreams.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border">
              <span className="w-2 h-2 rounded-full bg-accent" />
              <h2 className="text-sm font-bold text-primary uppercase tracking-wider">
                7. Suggested Improvement Actions
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {actionStreams.map((streamObj) => (
                <div key={streamObj.stream} className="surface-card rounded-2xl p-5 border border-border space-y-3">
                  <h3 className="text-xs font-bold text-accent">{streamObj.stream}</h3>
                  <div className="space-y-2">
                    {streamObj.items.map((item, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-border text-xs space-y-1">
                        <div className="flex items-center justify-between text-[10px] font-mono text-muted">
                          <span>Ref: {item.responseId || 'General'}</span>
                          <span>{item.productName}</span>
                        </div>
                        <p className="text-primary font-medium">{item.action}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 8: Supporting Feedback References */}
        {sections.references !== false && supportingReferences.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border">
              <span className="w-2 h-2 rounded-full bg-accent" />
              <h2 className="text-sm font-bold text-primary uppercase tracking-wider">
                8. Supporting Feedback Evidence Log
              </h2>
            </div>

            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-100 dark:bg-zinc-800 text-muted uppercase font-mono text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3 font-semibold">Response ID</th>
                    <th className="py-2.5 px-3 font-semibold">Product</th>
                    <th className="py-2.5 px-3 font-semibold">Rating</th>
                    <th className="py-2.5 px-3 font-semibold">Sentiment</th>
                    <th className="py-2.5 px-3 font-semibold">Summary / Extract</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {supportingReferences.map((ref, idx) => (
                    <tr key={`${ref.responseId}-${idx}`} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                      <td className="py-2.5 px-3 font-mono text-muted">{ref.responseId}</td>
                      <td className="py-2.5 px-3 font-medium text-primary">{ref.productName}</td>
                      <td className="py-2.5 px-3 font-mono text-amber-500">{ref.rating}</td>
                      <td className="py-2.5 px-3 font-medium">{ref.sentiment}</td>
                      <td className="py-2.5 px-3 text-muted">{ref.summary}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
