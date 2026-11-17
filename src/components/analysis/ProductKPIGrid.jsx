import {
  MessageSquare,
  Star,
  CheckCircle2,
  AlertTriangle,
  MinusCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import KPICard from '../dashboard/KPICard';

export default function ProductKPIGrid({
  totalResponses = 0,
  averageRating = '0.0',
  validRatingCount = 0,
  positiveCount = 0,
  positivePct = 0,
  neutralCount = 0,
  neutralPct = 0,
  negativeCount = 0,
  negativePct = 0,
  analyzedCount = 0,
  pendingCount = 0,
}) {
  const numericAvg = parseFloat(averageRating);
  const roundedStars = !isNaN(numericAvg) ? Math.round(numericAvg) : 0;

  return (
    <div className="space-y-3">
      {/* 5-Card Main Metric Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* 1. Total Feedback */}
        <KPICard
          title="Total Feedback"
          value={totalResponses}
          subvalue="Imported responses"
          icon={MessageSquare}
          accentColor="accent"
          footnote="Filtered for this product"
        />

        {/* 2. Average Rating */}
        <KPICard
          title="Average Rating"
          value={averageRating !== 'N/A' ? `${averageRating} / 5.0` : 'N/A'}
          subvalue={
            validRatingCount > 0 ? (
              <span className="text-amber-400 font-mono text-sm tracking-wider">
                {'★'.repeat(roundedStars)}
                {'☆'.repeat(5 - roundedStars)}
              </span>
            ) : (
              'No ratings recorded'
            )
          }
          icon={Star}
          accentColor="amber"
          footnote={
            validRatingCount > 0
              ? `Based on ${validRatingCount} verified ratings`
              : 'Zero rated responses'
          }
        />

        {/* 3. Positive Sentiment */}
        <KPICard
          title="Positive Sentiment"
          value={`${positivePct}%`}
          subvalue={`${positiveCount} positive responses`}
          icon={CheckCircle2}
          accentColor="emerald"
          footnote="Identified product praise"
        />

        {/* 4. Neutral Sentiment */}
        <KPICard
          title="Neutral Sentiment"
          value={`${neutralPct}%`}
          subvalue={`${neutralCount} neutral responses`}
          icon={MinusCircle}
          accentColor="amber"
          footnote="Balanced customer reviews"
        />

        {/* 5. Negative Sentiment */}
        <KPICard
          title="Negative Sentiment"
          value={`${negativePct}%`}
          subvalue={`${negativeCount} critical responses`}
          icon={AlertTriangle}
          accentColor="red"
          footnote="Flagged friction points"
        />
      </div>

      {/* Analysis Status Callout: Clearly distinguishes Analyzed vs Pending */}
      <div className="surface-card rounded-xl px-4 py-2.5 border border-border flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-accent" />
          <span className="font-semibold text-primary">AI Processing Status:</span>
          <span className="text-muted font-mono">
            <strong className="text-emerald-500 font-medium">{analyzedCount}</strong> analyzed
            {pendingCount > 0 && (
              <>
                {' '}· <strong className="text-amber-500 font-medium">{pendingCount}</strong> pending analysis
              </>
            )}
            {' '}({totalResponses > 0 ? Math.round((analyzedCount / totalResponses) * 100) : 0}% pipeline progress)
          </span>
        </div>

        {pendingCount > 0 && (
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
            <Clock className="w-3 h-3" />
            <span>Pending records are excluded from sentiment % until analyzed</span>
          </div>
        )}
      </div>
    </div>
  );
}
