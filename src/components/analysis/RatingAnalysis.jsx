import { Star } from 'lucide-react';

export default function RatingAnalysis({
  ratingData = [],
  averageRating = '0.0',
  validRatingCount = 0,
}) {
  const numericAvg = parseFloat(averageRating);
  const roundedStars = !isNaN(numericAvg) ? Math.round(numericAvg) : 0;

  if (validRatingCount === 0) {
    return (
      <div className="surface-card rounded-2xl p-6 border border-border h-full flex flex-col items-center justify-center text-center space-y-2">
        <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-muted flex items-center justify-center">
          <Star className="w-5 h-5 text-muted" />
        </div>
        <h3 className="text-sm font-bold text-primary">No Ratings Recorded</h3>
        <p className="text-xs text-muted max-w-xs leading-relaxed">
          No numerical ratings (1–5 stars) found for this product in the selected period.
        </p>
      </div>
    );
  }

  return (
    <div className="surface-card rounded-2xl p-5 sm:p-6 border border-border h-full flex flex-col justify-between space-y-4">
      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-primary">Ratings Analysis</h3>
          <span className="text-[11px] font-mono text-muted">
            {validRatingCount} rated responses
          </span>
        </div>
        <p className="text-[11px] text-muted mt-0.5">
          Score breakdown from 1 to 5 customer satisfaction stars
        </p>
      </div>

      {/* Average Score Header Display */}
      <div className="flex items-center justify-between p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
        <div>
          <div className="text-2xl font-extrabold text-primary tracking-tight">
            {averageRating} <span className="text-sm font-normal text-muted font-mono">/ 5.0</span>
          </div>
          <div className="flex items-center gap-1 text-amber-500 text-xs mt-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3.5 h-3.5 ${
                  i < roundedStars ? 'fill-amber-500' : 'text-zinc-300 dark:text-zinc-600'
                }`}
              />
            ))}
            <span className="text-muted text-[11px] font-mono ml-1">
              ({validRatingCount} total)
            </span>
          </div>
        </div>

        <div className="text-right font-mono text-[11px] text-muted space-y-0.5">
          <div>Top: 5★ ({ratingData.find((r) => r.starValue === 5)?.pct || 0}%)</div>
          <div>Low: 1★ ({ratingData.find((r) => r.starValue === 1)?.pct || 0}%)</div>
        </div>
      </div>

      {/* Star Progress Bars (5 to 1) */}
      <div className="space-y-2.5 pt-1">
        {ratingData.map((item) => (
          <div key={item.stars} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono text-amber-500 font-semibold flex items-center gap-1">
                {item.starValue} ★
              </span>
              <div className="font-mono text-muted text-[11px]">
                <span className="text-primary font-semibold">{item.count}</span> ({item.pct}%)
              </div>
            </div>
            <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-amber-500 transition-all duration-300"
                style={{ width: `${item.pct}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
