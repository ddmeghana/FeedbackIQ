import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { Tag, ThumbsUp, Minus, ThumbsDown, HelpCircle, Star } from 'lucide-react';

export default function InsightsCategorySection({
  categoryData = [],
  totalCategorized = 0,
}) {
  if (categoryData.length === 0) {
    return (
      <div className="surface-card rounded-2xl p-8 border border-border text-center space-y-2">
        <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-muted flex items-center justify-center mx-auto">
          <Tag className="w-5 h-5" />
        </div>
        <h3 className="text-sm font-bold text-primary">No Category Intelligence Available</h3>
        <p className="text-xs text-muted max-w-sm mx-auto">
          Categorized feedback will appear here as incoming customer responses are analyzed by the AI pipeline.
        </p>
      </div>
    );
  }

  const CustomBarTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="surface-card p-2.5 rounded-xl border border-border shadow-md text-xs space-y-1">
          <div className="font-bold text-primary">{item.category}</div>
          <div className="text-muted font-mono">
            {item.total} responses ({item.pct}% share)
          </div>
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border/60 text-[11px] font-mono">
            <span className="text-emerald-500">{item.positive} Pos</span>
            <span className="text-muted">·</span>
            <span className="text-amber-500">{item.neutral} Neu</span>
            <span className="text-muted">·</span>
            <span className="text-red-500">{item.negative} Neg</span>
            {item.other > 0 && (
              <>
                <span className="text-muted">·</span>
                <span className="text-zinc-400">{item.other} Other</span>
              </>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="surface-card rounded-2xl p-5 sm:p-6 border border-border space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border/80">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-primary">Feedback Category Analysis</h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-accent/15 text-accent font-semibold uppercase">
              Dynamic Frequency
            </span>
          </div>
          <p className="text-xs text-muted mt-0.5">
            Operational area breakdown ranking volume and exact positive, neutral, negative, and unknown counts
          </p>
        </div>
        <span className="text-[11px] font-mono text-muted self-start sm:self-auto">
          {totalCategorized} categorized responses
        </span>
      </div>

      {/* Grid: Bar Chart + Detailed Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Horizontal Bar Chart (Top Categories) */}
        <div className="lg:col-span-5 h-64 sm:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={categoryData.slice(0, 6)}
              layout="vertical"
              margin={{ top: 4, right: 16, left: 8, bottom: 4 }}
            >
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="category"
                width={110}
                tick={{ fontSize: 11, fill: 'var(--color-muted)' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomBarTooltip />} />
              <Bar
                dataKey="total"
                fill="var(--color-accent)"
                radius={[0, 6, 6, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Detailed Category Table / Breakdown List */}
        <div className="lg:col-span-7 space-y-2.5 max-h-72 overflow-y-auto pr-1">
          {categoryData.map((item) => (
            <div
              key={item.category}
              className="p-3 rounded-xl bg-zinc-50/70 dark:bg-zinc-900/50 border border-border/70 space-y-2 hover:border-accent/30 transition-colors"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Tag className="w-3.5 h-3.5 text-accent shrink-0" />
                  <span className="text-xs font-bold text-primary truncate">
                    {item.category}
                  </span>
                </div>
                <div className="flex items-center gap-2 font-mono text-xs shrink-0">
                  <span className="text-primary font-bold">{item.total} responses</span>
                  <span className="text-muted text-[11px]">({item.pct}%)</span>
                </div>
              </div>

              {/* Sentiment Ratio Bar */}
              <div className="space-y-1">
                <div className="w-full h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden flex">
                  {item.posPct > 0 && (
                    <div
                      className="bg-emerald-500 h-full"
                      style={{ width: `${item.posPct}%` }}
                      title={`Positive: ${item.positive} (${item.posPct}%)`}
                    />
                  )}
                  {item.neutral > 0 && (
                    <div
                      className="bg-amber-500 h-full"
                      style={{ width: `${Math.round((item.neutral / item.total) * 100)}%` }}
                      title={`Neutral: ${item.neutral}`}
                    />
                  )}
                  {item.negPct > 0 && (
                    <div
                      className="bg-red-500 h-full"
                      style={{ width: `${item.negPct}%` }}
                      title={`Negative: ${item.negative} (${item.negPct}%)`}
                    />
                  )}
                  {item.other > 0 && (
                    <div
                      className="bg-zinc-500 h-full"
                      style={{ width: `${Math.round((item.other / item.total) * 100)}%` }}
                      title={`Other / Unknown: ${item.other}`}
                    />
                  )}
                </div>

                {/* Exact Sentiment counts display */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-muted">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                      <ThumbsUp className="w-2.5 h-2.5" />
                      <span>{item.positive} Pos ({item.posPct}%)</span>
                    </span>
                    <span className="inline-flex items-center gap-1 text-amber-500">
                      <Minus className="w-2.5 h-2.5" />
                      <span>{item.neutral} Neu</span>
                    </span>
                    <span className="inline-flex items-center gap-1 text-red-600 dark:text-red-400">
                      <ThumbsDown className="w-2.5 h-2.5" />
                      <span>{item.negative} Neg ({item.negPct}%)</span>
                    </span>
                    {item.other > 0 && (
                      <span className="inline-flex items-center gap-1 text-zinc-500">
                        <HelpCircle className="w-2.5 h-2.5" />
                        <span>{item.other} Other</span>
                      </span>
                    )}
                  </div>

                  {item.avgRating !== 'N/A' && (
                    <span className="inline-flex items-center gap-1 text-amber-500 font-medium">
                      <Star className="w-2.5 h-2.5 fill-amber-500" />
                      <span>{item.avgRating} avg</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
