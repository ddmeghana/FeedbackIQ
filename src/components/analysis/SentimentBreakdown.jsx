import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

export default function SentimentBreakdown({
  sentimentData = [],
  analyzedCount = 0,
  pendingCount = 0,
}) {
  if (analyzedCount === 0) {
    return (
      <div className="surface-card rounded-2xl p-6 border border-border h-full flex flex-col items-center justify-center text-center space-y-2">
        <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-muted flex items-center justify-center">
          <span className="font-mono text-sm">Ø</span>
        </div>
        <h3 className="text-sm font-bold text-primary">No Sentiment Data Yet</h3>
        <p className="text-xs text-muted max-w-xs leading-relaxed">
          {pendingCount > 0
            ? `${pendingCount} feedback responses are awaiting AI sentiment analysis.`
            : 'No feedback records available for this product in the selected period.'}
        </p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }) => {
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
            {item.count} responses ({item.pct}%)
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="surface-card rounded-2xl p-5 sm:p-6 border border-border h-full flex flex-col justify-between space-y-4">
      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-primary">Sentiment Analysis</h3>
          <span className="text-[11px] font-mono text-muted">
            {analyzedCount} analyzed responses
          </span>
        </div>
        <p className="text-[11px] text-muted mt-0.5">
          Proportional sentiment classification for this product
        </p>
      </div>

      {/* Donut Chart Visual */}
      <div className="w-full h-48 sm:h-52 relative flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={sentimentData}
              dataKey="count"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={48}
              outerRadius={72}
              paddingAngle={4}
              stroke="none"
            >
              {sentimentData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Detailed Percentage & Count Breakdown */}
      <div className="space-y-2.5 pt-2 border-t border-border/60">
        {sentimentData.map((item) => (
          <div key={item.name} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="font-medium text-primary">{item.name}</span>
              </div>
              <div className="font-mono text-muted">
                <span className="text-primary font-semibold">{item.count}</span> ({item.pct}%)
              </div>
            </div>
            {/* Horizontal progress representation */}
            <div className="w-full h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${item.pct}%`,
                  backgroundColor: item.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
