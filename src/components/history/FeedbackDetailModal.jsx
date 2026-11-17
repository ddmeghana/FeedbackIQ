import {
  Sparkles,
  Star,
  User,
  Calendar,
  Boxes,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
} from 'lucide-react';
import Modal from '../ui/Modal';
import Badge from '../ui/Badge';
import { formatDate } from '../../lib/utils';

export default function FeedbackDetailModal({ feedback, isOpen, onClose }) {
  if (!feedback) return null;

  const isAnon = Boolean(feedback.Is_Anonymous);
  const respondentName = isAnon
    ? 'Anonymous Respondent'
    : feedback.Respondent_Name || 'Verified Respondent';

  const hasRating =
    typeof feedback.Rating === 'number' && feedback.Rating >= 1 && feedback.Rating <= 5;

  const isPending =
    !(feedback.Sentiment && feedback.Sentiment.trim() !== '') ||
    (feedback.Processing_Status || '').toLowerCase() === 'pending';

  const getSentimentVariant = (sentiment) => {
    const s = (sentiment || '').trim().toLowerCase();
    if (s === 'positive') return 'positive';
    if (s === 'neutral') return 'neutral';
    if (s === 'negative') return 'negative';
    if (s === 'mixed') return 'mixed';
    return 'default';
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Feedback Details`}
      description={`Record ID: ${feedback.Response_ID}`}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-5 text-xs">
        {/* Top Meta Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-zinc-100/70 dark:bg-zinc-800/60 border border-border/80">
          {/* Timestamp */}
          <div className="space-y-0.5">
            <span className="text-[10px] font-mono text-muted uppercase flex items-center gap-1">
              <Calendar className="w-3 h-3 text-muted/70" /> Submitted
            </span>
            <div className="font-mono text-primary font-medium text-[11px]">
              {feedback.Timestamp ? formatDate(feedback.Timestamp) : 'No date recorded'}
            </div>
          </div>

          {/* Product */}
          <div className="space-y-0.5">
            <span className="text-[10px] font-mono text-muted uppercase flex items-center gap-1">
              <Boxes className="w-3 h-3 text-muted/70" /> Product
            </span>
            <div className="text-primary font-medium truncate" title={feedback.Product_Name}>
              {feedback.Product_Name}
            </div>
            {feedback.Product_ID && (
              <span className="text-[9px] font-mono text-muted block truncate">
                {feedback.Product_ID}
              </span>
            )}
          </div>

          {/* Respondent */}
          <div className="space-y-0.5">
            <span className="text-[10px] font-mono text-muted uppercase flex items-center gap-1">
              <User className="w-3 h-3 text-muted/70" /> Respondent
            </span>
            <div className={isAnon ? 'italic text-muted/70 font-medium' : 'text-primary font-medium'}>
              {respondentName}
            </div>
            {isAnon && (
              <span className="text-[9px] font-mono text-muted block">Identity Protected</span>
            )}
          </div>

          {/* Rating */}
          <div className="space-y-0.5">
            <span className="text-[10px] font-mono text-muted uppercase flex items-center gap-1">
              <Star className="w-3 h-3 text-muted/70" /> Customer Rating
            </span>
            {hasRating ? (
              <div className="flex items-center gap-1 text-amber-500 font-mono font-bold">
                <span>{feedback.Rating}.0</span>
                <span>{'★'.repeat(feedback.Rating)}</span>
              </div>
            ) : (
              <div className="text-muted/60 font-mono font-medium">N/A (Unrated)</div>
            )}
          </div>
        </div>

        {/* Customer Comment */}
        <div className="space-y-1.5">
          <span className="text-xs font-bold text-primary">Original Customer Comment:</span>
          <div className="p-3.5 rounded-xl bg-card border border-border leading-relaxed text-primary text-xs italic">
            &ldquo;{feedback.Comment || 'No comment provided by customer.'}&rdquo;
          </div>
        </div>

        {/* AI Analysis Classification Strip */}
        <div className="p-4 rounded-xl surface-card border border-border space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-border/60">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="font-bold text-primary">AI Intelligence Analysis</span>
            </div>
            <Badge
              variant={isPending ? 'default' : 'positive'}
              size="sm"
            >
              {feedback.Processing_Status || (isPending ? 'Pending' : 'Analyzed')}
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Sentiment */}
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-100/50 dark:bg-zinc-800/40 border border-border/50">
              <span className="text-muted">Detected Sentiment:</span>
              {isPending ? (
                <Badge variant="default" size="sm" dot>
                  Pending Analysis
                </Badge>
              ) : (
                <Badge variant={getSentimentVariant(feedback.Sentiment)} size="sm" dot>
                  {feedback.Sentiment}
                </Badge>
              )}
            </div>

            {/* Category */}
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-100/50 dark:bg-zinc-800/40 border border-border/50">
              <span className="text-muted">Feedback Category:</span>
              {feedback.Category && feedback.Category.trim() !== '' ? (
                <span className="font-medium text-primary">{feedback.Category}</span>
              ) : (
                <span className="text-muted/60 italic font-mono text-[11px]">
                  {isPending ? 'Pending Analysis' : 'Uncategorized'}
                </span>
              )}
            </div>
          </div>

          {/* AI Executive Summary */}
          <div className="space-y-1 pt-1">
            <span className="font-semibold text-primary text-[11px] block">Executive Summary:</span>
            {feedback.Summary && feedback.Summary.trim() !== '' ? (
              <p className="text-muted text-xs leading-relaxed p-2.5 rounded-lg bg-zinc-100/50 dark:bg-zinc-800/40 border border-border/50">
                {feedback.Summary}
              </p>
            ) : (
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-muted text-[11px] flex items-center gap-2 font-mono">
                <Clock className="w-3.5 h-3.5 text-accent shrink-0" />
                <span>
                  {isPending
                    ? 'AI summary has not yet been generated. Waiting for processing pipeline.'
                    : 'No summary recorded for this feedback item.'}
                </span>
              </div>
            )}
          </div>

          {/* AI Suggested Action */}
          <div className="space-y-1 pt-1">
            <span className="font-semibold text-primary text-[11px] block">
              Suggested Action / Next Step:
            </span>
            {feedback.Suggested_Action && feedback.Suggested_Action.trim() !== '' ? (
              <div className="p-3 rounded-lg bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/20 text-primary text-xs leading-relaxed flex items-start gap-2">
                <Lightbulb className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                <span>{feedback.Suggested_Action}</span>
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-zinc-100/50 dark:bg-zinc-800/40 border border-border/50 text-muted text-[11px] flex items-center gap-2 font-mono">
                <Clock className="w-3.5 h-3.5 text-muted/70 shrink-0" />
                <span>
                  {isPending
                    ? 'Action recommendations will be generated once AI analysis is applied.'
                    : 'No specific action recommended.'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
