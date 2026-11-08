import { AlertCircle, X } from 'lucide-react';

export default function SubmissionError({ message, onDismiss }) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className="p-4 rounded-xl bg-red-500/10 border border-red-500/25 text-xs text-red-600 dark:text-red-400 flex items-start justify-between gap-3 animate-fade-in"
    >
      <div className="flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
        <div className="space-y-0.5">
          <p className="font-semibold">Submission could not be completed</p>
          <p className="text-[11px] leading-relaxed text-red-700/80 dark:text-red-300/80">
            {message} Please verify your inputs and try submitting again.
          </p>
        </div>
      </div>

      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss error notification"
          className="p-1 rounded-md text-red-500 hover:bg-red-500/20 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
