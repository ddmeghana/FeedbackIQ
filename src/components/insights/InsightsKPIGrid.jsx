import { MessageSquare, CheckCircle2, Clock, ThumbsUp, ThumbsDown, Star } from 'lucide-react';
import KPICard from '../dashboard/KPICard';

export default function InsightsKPIGrid({
  totalResponses = 0,
  analyzedCount = 0,
  pendingCount = 0,
  failedCount = 0,
  positivePct = null, // number or null
  negativePct = null, // number or null
  positiveCount = 0,
  negativeCount = 0,
  averageRating = 'N/A',
  validRatingCount = 0,
}) {
  const positiveDisplay =
    positivePct !== null && analyzedCount > 0 ? `${positivePct}%` : 'N/A';
  const negativeDisplay =
    negativePct !== null && analyzedCount > 0 ? `${negativePct}%` : 'N/A';

  const analyzedRate =
    totalResponses > 0 ? Math.round((analyzedCount / totalResponses) * 100) : 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
      {/* 1. Total Feedback Responses */}
      <KPICard
        title="Total Responses"
        value={totalResponses}
        subvalue="All incoming feedback"
        icon={MessageSquare}
        accentColor="accent"
        footnote="Total records in scope"
      />

      {/* 2. Analyzed Responses */}
      <KPICard
        title="Analyzed"
        value={analyzedCount}
        subvalue={`${analyzedRate}% processing rate`}
        icon={CheckCircle2}
        accentColor="emerald"
        footnote="AI-classified responses"
      />

      {/* 3. Pending Analysis */}
      <KPICard
        title="Pending Analysis"
        value={pendingCount}
        subvalue={
          failedCount > 0
            ? `${pendingCount} pending, ${failedCount} failed`
            : pendingCount > 0
            ? 'Awaiting AI pipeline'
            : 'All records processed'
        }
        icon={Clock}
        accentColor={failedCount > 0 ? 'red' : pendingCount > 0 ? 'amber' : 'accent'}
        footnote={failedCount > 0 ? `* ${failedCount} failed records excluded` : 'Queue awaiting analysis'}
      />

      {/* 4. Positive Feedback Percentage */}
      <KPICard
        title="Positive Ratio"
        value={positiveDisplay}
        subvalue={analyzedCount > 0 ? `${positiveCount} of ${analyzedCount} analyzed` : 'No analyzed data'}
        icon={ThumbsUp}
        accentColor="emerald"
        footnote="Base: Analyzed feedback"
      />

      {/* 5. Negative Feedback Percentage */}
      <KPICard
        title="Negative Ratio"
        value={negativeDisplay}
        subvalue={analyzedCount > 0 ? `${negativeCount} of ${analyzedCount} analyzed` : 'No analyzed data'}
        icon={ThumbsDown}
        accentColor="red"
        footnote="Base: Analyzed feedback"
      />

      {/* 6. Average Rating */}
      <KPICard
        title="Average Rating"
        value={averageRating !== 'N/A' ? `${averageRating} ★` : 'N/A'}
        subvalue={validRatingCount > 0 ? `${validRatingCount} verified ratings` : 'No ratings recorded'}
        icon={Star}
        accentColor="accent"
        footnote="1 to 5 star scale"
      />
    </div>
  );
}
