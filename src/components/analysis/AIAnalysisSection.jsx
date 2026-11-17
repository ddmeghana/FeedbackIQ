import { useState } from 'react';
import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  FileText,
  Clock,
} from 'lucide-react';
import Badge from '../ui/Badge';

export default function AIAnalysisSection({
  analyzedRecords = [],
  pendingCount = 0,
  productName = 'Product',
}) {
  const [activeTab, setActiveTab] = useState('recommendations'); // 'recommendations' | 'positive' | 'friction' | 'summaries'

  // If there are zero analyzed records
  if (analyzedRecords.length === 0) {
    return (
      <div className="surface-card rounded-2xl p-8 border border-border text-center space-y-4">
        <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-accent flex items-center justify-center mx-auto">
          <Sparkles className="w-6 h-6" />
        </div>
        <div className="space-y-1.5 max-w-md mx-auto">
          <h3 className="text-base font-bold text-primary">
            AI-Generated Analysis Awaiting Execution
          </h3>
          <p className="text-xs text-muted leading-relaxed">
            {pendingCount > 0
              ? `${pendingCount} imported responses for ${productName} are awaiting automated analysis by the AI pipeline.`
              : `No analyzed feedback records found for ${productName} in this date range.`}
          </p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-[11px] font-mono text-muted border border-border/60 mt-2">
            <Clock className="w-3.5 h-3.5" />
            <span>AI summaries & recommendations will appear once records are analyzed</span>
          </div>
        </div>
      </div>
    );
  }

  // ─── 1. Recurring Positive Themes (Praise Drivers) ──────────────────────────
  const positiveWithSummaries = analyzedRecords.filter(
    (r) => (r.Sentiment || '').trim().toLowerCase() === 'positive' && (r.Summary || '').trim() !== ''
  );

  // Group positive summaries by category
  const positiveThemesByCategory = {};
  positiveWithSummaries.forEach((r) => {
    const cat = (r.Category || 'General Product Quality').trim();
    if (!positiveThemesByCategory[cat]) {
      positiveThemesByCategory[cat] = [];
    }
    positiveThemesByCategory[cat].push({
      summary: r.Summary,
      rating: r.Rating,
      action: r.Suggested_Action,
    });
  });

  // ─── 2. Recurring Negative Themes (Friction Drivers) ────────────────────────
  const negativeWithSummaries = analyzedRecords.filter(
    (r) => (r.Sentiment || '').trim().toLowerCase() === 'negative' && (r.Summary || '').trim() !== ''
  );

  // Group negative summaries by category
  const negativeThemesByCategory = {};
  negativeWithSummaries.forEach((r) => {
    const cat = (r.Category || 'General Issue').trim();
    if (!negativeThemesByCategory[cat]) {
      negativeThemesByCategory[cat] = [];
    }
    negativeThemesByCategory[cat].push({
      summary: r.Summary,
      rating: r.Rating,
      action: r.Suggested_Action,
    });
  });

  // ─── 3. AI Suggested Actions (Actionable Recommendations) ───────────────────
  const recordsWithActions = analyzedRecords.filter(
    (r) => (r.Suggested_Action || '').trim() !== ''
  );

  // Deduplicate and prioritize actions from negative/mixed feedback first
  const seenActions = new Set();
  const prioritizedActions = [];

  recordsWithActions.forEach((r) => {
    const act = r.Suggested_Action.trim();
    if (!seenActions.has(act.toLowerCase())) {
      seenActions.add(act.toLowerCase());
      prioritizedActions.push({
        action: act,
        category: r.Category || 'General',
        sentiment: r.Sentiment || 'Neutral',
        summary: r.Summary || '',
        rating: r.Rating,
      });
    }
  });

  // Sort: Negative sentiment actions first, then neutral/mixed, then positive
  prioritizedActions.sort((a, b) => {
    const score = (s) => (s.toLowerCase() === 'negative' ? 3 : s.toLowerCase() === 'neutral' ? 2 : 1);
    return score(b.sentiment) - score(a.sentiment);
  });

  // ─── 4. Grounded Executive Observations ─────────────────────────────────────
  // Top positive category
  const topPositiveCategoryEntry = Object.entries(positiveThemesByCategory).sort(
    (a, b) => b[1].length - a[1].length
  )[0];

  // Top friction category
  const topFrictionCategoryEntry = Object.entries(negativeThemesByCategory).sort(
    (a, b) => b[1].length - a[1].length
  )[0];

  return (
    <div className="surface-card rounded-2xl p-5 sm:p-6 border border-border space-y-5">
      {/* Section Header with Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-accent/15 text-accent flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-primary">
              AI-Generated Product Intelligence
            </h3>
            <p className="text-xs text-muted">
              Grounded summaries, themes, and actionable next steps from database records
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800/60 p-1 rounded-xl border border-border/60 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('recommendations')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'recommendations'
                ? 'bg-card text-primary shadow-xs font-semibold'
                : 'text-muted hover:text-primary'
            }`}
          >
            Recommendations ({prioritizedActions.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('positive')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'positive'
                ? 'bg-card text-emerald-500 shadow-xs font-semibold'
                : 'text-muted hover:text-primary'
            }`}
          >
            Praise Drivers ({positiveWithSummaries.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('friction')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'friction'
                ? 'bg-card text-red-500 shadow-xs font-semibold'
                : 'text-muted hover:text-primary'
            }`}
          >
            Friction Drivers ({negativeWithSummaries.length})
          </button>
        </div>
      </div>

      {/* ─── TAB 1: Grounded Recommendations & Action Items ───────────────────── */}
      {activeTab === 'recommendations' && (
        <div className="space-y-4">
          {/* Key Observations Summary Strip */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Observation 1: Core Strength */}
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-1 text-xs">
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Primary Praised Characteristic</span>
              </div>
              <p className="text-muted leading-relaxed text-[11px]">
                {topPositiveCategoryEntry
                  ? `Customers most frequently praise ${topPositiveCategoryEntry[0]} (${topPositiveCategoryEntry[1].length} positive responses recorded).`
                  : 'No significant positive clusters identified yet.'}
              </p>
            </div>

            {/* Observation 2: Core Friction */}
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 space-y-1 text-xs">
              <div className="flex items-center gap-1.5 text-red-600 dark:text-red-400 font-semibold">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Primary Friction Driver</span>
              </div>
              <p className="text-muted leading-relaxed text-[11px]">
                {topFrictionCategoryEntry
                  ? `Critical feedback concentrates heavily in ${topFrictionCategoryEntry[0]} (${topFrictionCategoryEntry[1].length} negative responses recorded).`
                  : 'No significant critical friction clusters identified for this product.'}
              </p>
            </div>
          </div>

          {/* Actionable Recommendations List */}
          <div className="space-y-2.5 pt-1">
            <h4 className="text-xs font-bold text-primary uppercase tracking-wider font-mono">
              Actionable Recommendations (Extracted from AI Suggested Actions)
            </h4>

            {prioritizedActions.length === 0 ? (
              <p className="text-xs text-muted py-4 text-center">
                No suggested actions recorded in the database for this product.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {prioritizedActions.map((item, idx) => (
                  <div
                    key={idx}
                    className="surface-card rounded-xl p-3.5 border border-border flex flex-col justify-between space-y-2 hover:border-accent/30 transition-colors"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <Badge
                          variant={
                            item.sentiment.toLowerCase() === 'negative'
                              ? 'negative'
                              : item.sentiment.toLowerCase() === 'positive'
                              ? 'positive'
                              : 'neutral'
                          }
                          size="sm"
                        >
                          {item.category}
                        </Badge>
                        <span className="text-[10px] font-mono text-muted uppercase">
                          Action #{idx + 1}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-primary leading-snug">
                        {item.action}
                      </p>
                    </div>

                    {item.summary && (
                      <p className="text-[11px] text-muted line-clamp-2 pt-1 border-t border-border/60 italic">
                        Context: &ldquo;{item.summary}&rdquo;
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── TAB 2: Recurring Positive Themes (Strengths) ─────────────────────── */}
      {activeTab === 'positive' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-muted">
            <span>Customer praise points grouped by operational theme</span>
            <span className="font-mono">{positiveWithSummaries.length} positive responses</span>
          </div>

          {Object.keys(positiveThemesByCategory).length === 0 ? (
            <p className="text-xs text-muted py-6 text-center">
              No positive feedback summaries recorded for this selection.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(positiveThemesByCategory).map(([cat, items]) => (
                <div
                  key={cat}
                  className="surface-card rounded-xl p-4 border border-border space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5" />
                      {cat}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                      {items.length} responses
                    </span>
                  </div>

                  <ul className="space-y-2 text-xs text-muted">
                    {items.slice(0, 4).map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-emerald-500 shrink-0 mt-0.5">•</span>
                        <span className="leading-relaxed text-[11px]">
                          {item.summary}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 3: Recurring Negative Themes (Friction Drivers) ───────────────── */}
      {activeTab === 'friction' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-muted">
            <span>Customer complaints and pain points grouped by operational theme</span>
            <span className="font-mono">{negativeWithSummaries.length} critical responses</span>
          </div>

          {Object.keys(negativeThemesByCategory).length === 0 ? (
            <p className="text-xs text-muted py-6 text-center text-emerald-500">
              No critical friction points or negative feedback recorded for this selection.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(negativeThemesByCategory).map(([cat, items]) => (
                <div
                  key={cat}
                  className="surface-card rounded-xl p-4 border border-border space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-red-600 dark:text-red-400 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      {cat}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 border border-red-500/20">
                      {items.length} complaints
                    </span>
                  </div>

                  <ul className="space-y-2 text-xs text-muted">
                    {items.slice(0, 4).map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-red-500 shrink-0 mt-0.5">•</span>
                        <div className="space-y-0.5">
                          <span className="leading-relaxed text-[11px] block">
                            {item.summary}
                          </span>
                          {item.action && (
                            <span className="text-[10px] text-accent block font-mono">
                              Recommended Fix: {item.action}
                            </span>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
