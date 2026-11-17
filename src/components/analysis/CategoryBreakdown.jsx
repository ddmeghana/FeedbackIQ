import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

export default function CategoryBreakdown({ categoryData = [], totalCategorized = 0 }) {
  if (!categoryData || categoryData.length === 0) {
    return (
      <div className="surface-card rounded-2xl p-6 border border-border h-full flex flex-col items-center justify-center text-center space-y-2">
        <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-muted flex items-center justify-center">
          <span className="font-mono text-sm">#</span>
        </div>
        <h3 className="text-sm font-bold text-primary">No Category Data</h3>
        <p className="text-xs text-muted max-w-xs leading-relaxed">
          No categorized feedback recorded for this product in the selected period.
        </p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="surface-card p-2.5 rounded-xl border border-border shadow-md text-xs space-y-1">
          <div className="font-semibold text-primary">{item.category}</div>
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
          <h3 className="text-sm font-bold text-primary">Feedback Categories</h3>
          <span className="text-[11px] font-mono text-muted">
            {totalCategorized} categorized responses
          </span>
        </div>
        <p className="text-[11px] text-muted mt-0.5">
          Distribution of customer comments by operational area
        </p>
      </div>

      {/* Horizontal Bar Chart for Categories */}
      <div className="w-full h-52 sm:h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={categoryData}
            layout="vertical"
            margin={{ top: 4, right: 16, left: 8, bottom: 4 }}
          >
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="category"
              width={100}
              tick={{ fontSize: 11, fill: 'var(--color-muted)' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="count"
              fill="var(--color-accent)"
              radius={[0, 6, 6, 0]}
              barSize={12}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Category List Grid */}
      <div className="pt-2 border-t border-border/60 max-h-40 overflow-y-auto space-y-1.5 pr-1">
        {categoryData.map((item) => (
          <div
            key={item.category}
            className="flex items-center justify-between text-xs py-1 px-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors"
          >
            <span className="text-primary font-medium truncate max-w-[150px]">
              {item.category}
            </span>
            <div className="flex items-center gap-2 font-mono text-muted text-[11px]">
              <span className="font-semibold text-primary">{item.count}</span>
              <span className="text-muted/60">({item.pct}%)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
