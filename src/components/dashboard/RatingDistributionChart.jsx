import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

export default function RatingDistributionChart({ data = [] }) {
  if (!data || data.length === 0) {
    return (
      <div className="surface-card rounded-2xl p-6 border border-border h-full flex flex-col items-center justify-center text-center">
        <p className="text-xs text-muted">No rating distribution data available.</p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="surface-card p-2.5 rounded-xl border border-border shadow-md text-xs space-y-1">
          <div className="font-semibold text-primary">{item.stars} Rating</div>
          <div className="text-amber-400 font-mono">
            {item.count} responses ({item.pct}%)
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="surface-card rounded-2xl p-5 border border-border h-full flex flex-col justify-between">
      <div className="space-y-1 mb-2">
        <h3 className="text-sm font-bold text-primary">Rating Distribution</h3>
        <p className="text-[11px] text-muted">
          Count and share of ratings from 1 to 5 stars
        </p>
      </div>

      <div className="w-full h-52 sm:h-60">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 8, right: 16, left: 16, bottom: 8 }}
          >
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="stars"
              width={42}
              tick={{ fontSize: 12, fill: '#F59E0B' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="count"
              fill="#F59E0B"
              radius={[0, 6, 6, 0]}
              barSize={12}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="pt-2 flex items-center justify-between text-[11px] font-mono text-muted">
        <span>5 Stars: Top tier</span>
        <span>1 Star: High friction</span>
      </div>
    </div>
  );
}
