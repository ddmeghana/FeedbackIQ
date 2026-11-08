import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

export default function CategoryChart({ data = [] }) {
  if (!data || data.length === 0) {
    return (
      <div className="surface-card rounded-2xl p-6 border border-border h-full flex flex-col items-center justify-center text-center">
        <p className="text-xs text-muted">No category data recorded for this selection.</p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="surface-card p-2.5 rounded-xl border border-border shadow-md text-xs space-y-1">
          <div className="font-semibold text-primary">{item.category}</div>
          <div className="text-muted font-mono">{item.count} responses tagged</div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="surface-card rounded-2xl p-5 border border-border h-full flex flex-col justify-between">
      <div className="space-y-1 mb-2">
        <h3 className="text-sm font-bold text-primary">Category Distribution</h3>
        <p className="text-[11px] text-muted">
          Feedback classification across operational themes
        </p>
      </div>

      <div className="w-full h-56 sm:h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 8, right: 16, left: 16, bottom: 8 }}
          >
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="category"
              width={105}
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

      <div className="pt-2 text-[11px] font-mono text-muted text-right">
        Sorted by feedback volume
      </div>
    </div>
  );
}
