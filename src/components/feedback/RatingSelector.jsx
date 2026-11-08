import { useState } from 'react';
import { Star } from 'lucide-react';
import { RATING_LABELS } from '../../config/constants';

export default function RatingSelector({
  value,
  onChange,
  error,
  required = true,
  id = 'rating-selector',
}) {
  const [hovered, setHovered] = useState(null);

  const activeRating = hovered !== null ? hovered : value;
  const currentLabel = activeRating ? `${activeRating} — ${RATING_LABELS[activeRating]}` : 'Click to rate';

  const handleKeyDown = (e, star) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onChange(star);
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      onChange(Math.min(5, (value || 0) + 1));
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      onChange(Math.max(1, (value || 2) - 1));
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label
          id={`${id}-label`}
          className="block text-xs font-medium text-muted uppercase tracking-wider"
        >
          How would you rate your experience? {required && <span className="text-red-500">*</span>}
        </label>
        <span
          className={`text-xs font-medium font-mono ${
            activeRating ? 'text-amber-500 dark:text-amber-400' : 'text-muted'
          }`}
          aria-live="polite"
        >
          {currentLabel}
        </span>
      </div>

      {/* Accessible Star Rating Group */}
      <div
        role="radiogroup"
        aria-labelledby={`${id}-label`}
        aria-required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className="flex items-center gap-1.5 p-2 rounded-xl bg-card border border-border/80 w-fit"
      >
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = activeRating !== null && star <= activeRating;

          return (
            <button
              key={star}
              type="button"
              role="radio"
              aria-checked={value === star}
              aria-label={`${star} star${star > 1 ? 's' : ''} — ${RATING_LABELS[star]}`}
              tabIndex={0}
              onClick={() => onChange(star)}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(null)}
              onKeyDown={(e) => handleKeyDown(e, star)}
              className="p-1.5 rounded-lg transition-transform hover:scale-115 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <Star
                className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors ${
                  isFilled
                    ? 'text-amber-400 fill-amber-400 drop-shadow-xs'
                    : 'text-zinc-300 dark:text-zinc-700 hover:text-amber-300'
                }`}
                aria-hidden="true"
              />
            </button>
          );
        })}
      </div>

      {error && (
        <p id={`${id}-error`} className="text-xs text-red-500 font-medium">
          {error}
        </p>
      )}
    </div>
  );
}
