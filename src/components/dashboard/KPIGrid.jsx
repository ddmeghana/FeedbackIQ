import { MessageSquare, Star, CheckCircle2, AlertTriangle } from 'lucide-react';
import KPICard from './KPICard';

export default function KPIGrid({ kpis }) {
  const {
    totalFeedback = 0,
    averageRating = '0.0',
    positiveCount = 0,
    positivePct = 0,
    negativeCount = 0,
    negativePct = 0,
  } = kpis || {};

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Feedback */}
      <KPICard
        title="Total Feedback"
        value={totalFeedback}
        subvalue="Filtered responses"
        icon={MessageSquare}
        accentColor="accent"
        footnote="Stored in central registry"
      />

      {/* 2. Average Rating */}
      <KPICard
        title="Average Rating"
        value={`${averageRating} / 5.0`}
        subvalue={
          totalFeedback > 0 ? (
            <span className="text-amber-400 font-mono">
              {'★'.repeat(Math.round(Number(averageRating)))}
              {'☆'.repeat(5 - Math.round(Number(averageRating)))}
            </span>
          ) : (
            'No ratings recorded'
          )
        }
        icon={Star}
        accentColor="amber"
        footnote="Mean 1–5 customer score"
      />

      {/* 3. Positive Feedback */}
      <KPICard
        title="Positive Feedback"
        value={`${positivePct}%`}
        subvalue={`${positiveCount} positive responses`}
        icon={CheckCircle2}
        accentColor="emerald"
        footnote="Identified strengths & praise"
      />

      {/* 4. Negative Feedback */}
      <KPICard
        title="Negative Feedback"
        value={`${negativePct}%`}
        subvalue={`${negativeCount} critical responses`}
        icon={AlertTriangle}
        accentColor="red"
        footnote="Flagged friction & complaints"
      />
    </div>
  );
}
