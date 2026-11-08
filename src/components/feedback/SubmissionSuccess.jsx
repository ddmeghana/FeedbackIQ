import { CheckCircle2, RotateCcw, ArrowRight, User, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';
import { ROUTES } from '../../config/constants';

export default function SubmissionSuccess({ record, onReset }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="surface-card rounded-2xl p-6 sm:p-8 border border-emerald-500/30 text-center space-y-6 shadow-card-dark animate-fade-in"
    >
      {/* Success Icon */}
      <div className="w-16 h-16 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center mx-auto shadow-sm">
        <CheckCircle2 className="w-9 h-9" />
      </div>

      {/* Headings */}
      <div className="space-y-1.5">
        <h2 className="text-xl sm:text-2xl font-bold text-primary tracking-tight">
          Thank you for sharing your feedback!
        </h2>
        <p className="text-xs sm:text-sm text-muted max-w-md mx-auto">
          Your feedback helps our team understand what is working well and where we need to improve.
        </p>
      </div>

      {/* Submitted Summary Card */}
      {record && (
        <div className="max-w-md mx-auto p-4 rounded-xl bg-canvas/60 border border-border text-left text-xs space-y-2">
          <div className="flex items-center justify-between text-muted border-b border-border/60 pb-2">
            <span className="font-semibold text-primary">{record.Product_Name}</span>
            <span className="flex items-center gap-1 text-amber-400 font-mono">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span>{record.Rating}/5</span>
            </span>
          </div>
          <div className="text-muted flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-muted" />
            <span>
              {record.Is_Anonymous ? (
                <em className="text-zinc-400 dark:text-zinc-500">Anonymous Submission</em>
              ) : (
                record.Respondent_Name || 'Anonymous'
              )}
            </span>
          </div>
          <p className="text-primary italic pt-1">
            &ldquo;{record.Comment}&rdquo;
          </p>
        </div>
      )}

      {/* Honest Demo Mode Notice */}
      <div className="max-w-md mx-auto p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-600 dark:text-amber-400 space-y-0.5">
        <p className="font-semibold font-mono text-[11px] uppercase tracking-wider">
          Demo Mode Notice
        </p>
        <p className="text-[11px] leading-relaxed">
          Your submission has been verified on the client side. In Phase 6, this form will be
          connected to Google Sheets and n8n for persistent cloud storage.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <Button
          type="button"
          variant="primary"
          onClick={onReset}
          leftIcon={<RotateCcw className="w-4 h-4" />}
        >
          Submit Another Response
        </Button>

        <Link to={ROUTES.HOME}>
          <Button variant="secondary" rightIcon={<ArrowRight className="w-4 h-4" />}>
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
