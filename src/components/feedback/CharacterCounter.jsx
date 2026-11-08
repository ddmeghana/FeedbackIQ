import { FORM_LIMITS } from '../../config/constants';

export default function CharacterCounter({ count = 0 }) {
  const min = FORM_LIMITS.COMMENT_MIN_LENGTH;
  const max = FORM_LIMITS.COMMENT_MAX_LENGTH;

  const isBelowMin = count > 0 && count < min;
  const isOverMax = count > max;
  const isNearMax = count >= max * 0.9 && !isOverMax;

  let colorClass = 'text-muted';
  if (isBelowMin) colorClass = 'text-amber-500';
  if (isNearMax) colorClass = 'text-amber-600 dark:text-amber-400';
  if (isOverMax) colorClass = 'text-red-500 font-semibold';

  return (
    <div className="flex items-center justify-between text-[11px] font-mono">
      <span>
        {count < min ? (
          <span className="text-muted">Minimum {min} characters required</span>
        ) : (
          <span className="text-emerald-500">Minimum length reached</span>
        )}
      </span>
      <span className={colorClass} aria-live="polite">
        {count} / {max}
      </span>
    </div>
  );
}
