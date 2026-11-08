/**
 * Utility functions for FeedbackIQ
 */

/**
 * Combine multiple class names conditionally.
 * Replaces the need for external clsx/tailwind-merge packages for simple cases.
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

/**
 * Generate a unique Response ID in format: FB-YYYYMMDD-XXXX
 */
export function generateResponseId() {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `FB-${dateStr}-${randomStr}`;
}

/**
 * Format an ISO timestamp string into a readable date and time.
 */
export function formatDate(isoString) {
  if (!isoString) return '—';
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}

/**
 * Truncate text with ellipsis if it exceeds maxLength.
 */
export function truncate(text, maxLength = 100) {
  if (!text || text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

/**
 * Calculate sentiment badge styling and label.
 */
export function getSentimentConfig(sentiment) {
  const norm = (sentiment || '').toLowerCase();
  switch (norm) {
    case 'positive':
      return {
        label: 'Positive',
        bg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
        text: 'text-emerald-600 dark:text-emerald-400',
        border: 'border-emerald-500/20',
        dot: 'bg-emerald-500',
      };
    case 'negative':
      return {
        label: 'Negative',
        bg: 'bg-red-500/10 dark:bg-red-500/15',
        text: 'text-red-600 dark:text-red-400',
        border: 'border-red-500/20',
        dot: 'bg-red-500',
      };
    case 'neutral':
      return {
        label: 'Neutral',
        bg: 'bg-amber-500/10 dark:bg-amber-500/15',
        text: 'text-amber-600 dark:text-amber-400',
        border: 'border-amber-500/20',
        dot: 'bg-amber-500',
      };
    case 'mixed':
      return {
        label: 'Mixed',
        bg: 'bg-purple-500/10 dark:bg-purple-500/15',
        text: 'text-purple-600 dark:text-purple-400',
        border: 'border-purple-500/20',
        dot: 'bg-purple-500',
      };
    default:
      return {
        label: 'Unclear',
        bg: 'bg-zinc-500/10 dark:bg-zinc-500/15',
        text: 'text-zinc-600 dark:text-zinc-400',
        border: 'border-zinc-500/20',
        dot: 'bg-zinc-500',
      };
  }
}
