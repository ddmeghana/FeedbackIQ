import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

export default function FeedbackTrendChart({ data = [] }) {
  if (!data || data.length === 0) {
    return (
      <div className="surface-card rounded-2xl p-6 border border-border h-full flex flex-col items-center justify-center text-center">
        <p className="text-xs text-muted">No timeline records in this window.</p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="surface-card p-2.5 rounded-xl border border-border shadow-md text-xs space-y-1">
          <div className="font-semibold text-primary">{label}</div>
          <div className="text-accent font-mono">
            {payload[0].value} responses submitted
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="surface-card rounded-2xl p-5 border border-border h-full flex flex-col justify-between">
      <div className="space-y-1 mb-2">
        <h3 className="text-sm font-bold text-primary">Feedback Activity Trend</h3>
        <p className="text-[11px] text-muted">
          Submission volume aggregated across chronologically sorted entries
        </p>
      </div>

      <div className="w-full h-52 sm:h-60">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 12, right: 12, left: -20, bottom: 4 }}
          >
            <defs>
              <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: 'var(--color-muted)' }}
              axisLine={{ stroke: 'var(--color-border)' }}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 10, fill: 'var(--color-muted)' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="feedbackCount"
              stroke="var(--color-accent)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#trendGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="pt-2 text-[11px] font-mono text-muted text-right">
        Volume per timeline date
      </div>
    </div>
  );
}
