import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

export default function SentimentChart({ data = [] }) {
  if (!data || data.length === 0) {
    return (
      <div className="surface-card rounded-2xl p-6 border border-border h-full flex flex-col items-center justify-center text-center">
        <p className="text-xs text-muted">No sentiment data available for this range.</p>
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
    <div className="surface-card rounded-2xl p-5 border border-border h-full flex flex-col justify-between">
      <div className="space-y-1 mb-3">
        <h3 className="text-sm font-bold text-primary">Sentiment Distribution</h3>
        <p className="text-[11px] text-muted">
          Multidimensional sentiment breakdown across responses
        </p>
      </div>

      <div className="w-full h-52 sm:h-56 relative flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={52}
              outerRadius={78}
              paddingAngle={3}
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend Grid */}
      <div className="pt-3 border-t border-border/60 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
        {data.map((item) => (
          <div key={item.name} className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-muted text-[11px] truncate">
              {item.name}: <strong className="text-primary font-mono">{item.pct}%</strong>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
