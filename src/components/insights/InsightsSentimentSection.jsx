import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { ThumbsUp, Minus, ThumbsDown, Shuffle, Clock, Calendar, HelpCircle, AlertTriangle } from 'lucide-react';
import FeedbackTrendChart from '../dashboard/FeedbackTrendChart';

export default function InsightsSentimentSection({
  analyzedCount = 0,
  pendingCount = 0,
  failedCount = 0,
  unknownStatusCount = 0,
  positiveCount = 0,
  positivePct = 0,
  neutralCount = 0,
  neutralPct = 0,
  negativeCount = 0,
  negativePct = 0,
  mixedCount = 0,
  mixedPct = 0,
  otherCount = 0,
  otherPct = 0,
  timelineData = [],
  missingTimestampCount = 0,
}) {
  // Build chart dataset from analyzed sentiments only
  const chartData = [
    { name: 'Positive', count: positiveCount, pct: positivePct, color: '#10B981' },
    { name: 'Neutral', count: neutralCount, pct: neutralPct, color: '#F59E0B' },
    { name: 'Negative', count: negativeCount, pct: negativePct, color: '#EF4444' },
  ];

  if (mixedCount > 0) {
    chartData.push({ name: 'Mixed', count: mixedCount, pct: mixedPct, color: '#8B5CF6' });
  }

  if (otherCount > 0) {
    chartData.push({ name: 'Other / Unknown', count: otherCount, pct: otherPct, color: '#6B7280' });
  }

  // Filter out sentiments with 0 counts for clean chart rendering
  const activeChartData = chartData.filter((item) => item.count > 0);

  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="surface-card p-2.5 rounded-xl border border-border shadow-md text-xs space-y-1">
          <div className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="font-semibold text-primary">{item.name}</span>
          </div>
          <div className="text-muted font-mono">
            {item.count} responses ({item.pct}% of analyzed)
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
      {/* ─── Left: Sentiment Overview ────────────────────────────────────────── */}
      <div className="surface-card rounded-2xl p-5 sm:p-6 border border-border flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-primary">Overall Sentiment Distribution</h3>
            <span className="text-[11px] font-mono text-muted">
              Denominator: {analyzedCount} Analyzed
            </span>
          </div>
          <p className="text-xs text-muted mt-0.5">
            Proportional distribution across customer sentiments (pending and failed items excluded from percentages)
          </p>
        </div>

        {analyzedCount === 0 ? (
          <div className="py-12 text-center space-y-2">
            <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-muted flex items-center justify-center mx-auto">
              <span className="font-mono text-sm">Ø</span>
            </div>
            <p className="text-xs text-muted">
              {pendingCount > 0
                ? `${pendingCount} incoming responses are awaiting AI sentiment analysis.`
                : 'No analyzed feedback records available in this scope.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
            {/* Donut Chart */}
            <div className="sm:col-span-5 h-44 sm:h-48 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={activeChartData}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={44}
                    outerRadius={68}
                    paddingAngle={3}
                    stroke="none"
                  >
                    {activeChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-lg font-extrabold text-primary">{positivePct}%</span>
                <span className="text-[10px] font-mono text-muted uppercase">Positive</span>
              </div>
            </div>

            {/* Sentiment Breakdown Cards */}
            <div className="sm:col-span-7 space-y-2 text-xs">
              {/* Positive */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-500/5 border border-emerald-500/15">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                    <ThumbsUp className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-bold text-primary">Positive</span>
                    <span className="text-[10px] text-muted block">{positiveCount} responses</span>
                  </div>
                </div>
                <div className="text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {positivePct}%
                </div>
              </div>

              {/* Neutral */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-amber-500/5 border border-amber-500/15">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                    <Minus className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-bold text-primary">Neutral</span>
                    <span className="text-[10px] text-muted block">{neutralCount} responses</span>
                  </div>
                </div>
                <div className="text-right font-mono font-bold text-amber-600 dark:text-amber-400">
                  {neutralPct}%
                </div>
              </div>

              {/* Negative */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-red-500/5 border border-red-500/15">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center">
                    <ThumbsDown className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-bold text-primary">Negative</span>
                    <span className="text-[10px] text-muted block">{negativeCount} responses</span>
                  </div>
                </div>
                <div className="text-right font-mono font-bold text-red-600 dark:text-red-400">
                  {negativePct}%
                </div>
              </div>

              {/* Mixed (if present in stored records) */}
              {mixedCount > 0 && (
                <div className="flex items-center justify-between p-2 rounded-xl bg-purple-500/5 border border-purple-500/15">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center">
                      <Shuffle className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="font-bold text-primary">Mixed</span>
                      <span className="text-[10px] text-muted block">{mixedCount} responses</span>
                    </div>
                  </div>
                  <div className="text-right font-mono font-bold text-purple-600 dark:text-purple-400">
                    {mixedPct}%
                  </div>
                </div>
              )}

              {/* Other / Unknown (if present in stored records) */}
              {otherCount > 0 && (
                <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-500/5 border border-zinc-500/15">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-zinc-500/10 text-zinc-500 flex items-center justify-center">
                      <HelpCircle className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="font-bold text-primary">Other / Unknown</span>
                      <span className="text-[10px] text-muted block">{otherCount} responses</span>
                    </div>
                  </div>
                  <div className="text-right font-mono font-bold text-zinc-600 dark:text-zinc-400">
                    {otherPct}%
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Processing State Strips */}
        <div className="space-y-1.5 pt-1">
          {pendingCount > 0 && (
            <div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/70 border border-border flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2 text-muted">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span>Pending AI Pipeline:</span>
              </div>
              <span className="text-primary font-bold">{pendingCount} records</span>
            </div>
          )}

          {failedCount > 0 && (
            <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-between text-xs font-mono text-red-600 dark:text-red-400">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                <span>Failed AI Processing:</span>
              </div>
              <span className="font-bold">{failedCount} records (excluded from metrics)</span>
            </div>
          )}

          {unknownStatusCount > 0 && (
            <div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/70 border border-border flex items-center justify-between text-xs font-mono text-muted">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Unclassified Processing Status:</span>
              </div>
              <span className="text-primary font-bold">{unknownStatusCount} records</span>
            </div>
          )}
        </div>
      </div>

      {/* ─── Right: Feedback Timeline / Trend Chart ────────────────────────── */}
      <div className="surface-card rounded-2xl p-5 sm:p-6 border border-border flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-primary">Feedback Activity Trend</h3>
            <span className="text-[11px] font-mono text-muted">Timeline Analysis</span>
          </div>
          <p className="text-xs text-muted mt-0.5">
            Chronological feedback volume pattern across valid submission timestamps
          </p>
        </div>

        <div className="flex-1 min-h-[180px]">
          {timelineData.length >= 2 ? (
            <FeedbackTrendChart data={timelineData} />
          ) : (
            <div className="h-full py-12 flex flex-col items-center justify-center text-center space-y-2">
              <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-muted flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
              <p className="text-xs text-muted max-w-xs">
                Insufficient chronological data in this date range to render an activity curve.
              </p>
            </div>
          )}
        </div>

        {/* Missing Timestamps Notice */}
        {missingTimestampCount > 0 && (
          <div className="pt-2 border-t border-border/60 text-[11px] font-mono text-muted">
            * Note: {missingTimestampCount} imported records lack a submission timestamp and are excluded from timeline grouping.
          </div>
        )}
      </div>
    </div>
  );
}
