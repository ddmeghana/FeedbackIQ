/**
 * FeedbackIQ — Application Constants
 *
 * This file is the single source of truth for:
 *   - Design tokens (colour palette, referenced by name)
 *   - Gemini model configuration (configurable, never hardcoded elsewhere)
 *   - Product category and sentiment lists
 *   - Route paths
 *
 * IMPORTANT: This file contains NO secrets or API keys.
 * All values here are either non-sensitive config strings or UI constants.
 */

// ─── Gemini Model Configuration ──────────────────────────────────────────────
// VITE_GEMINI_MODEL is set in your .env file.
// It is a non-secret public model name string — safe to include in VITE_ variables.
// Change your .env to switch models without touching any other file.
export const GEMINI_MODEL = import.meta.env.VITE_GEMINI_MODEL || 'gemini-3.8-flash';

// ─── Google Apps Script API URL ──────────────────────────────────────────────
// This is a capability URL (not a secret) — the feedback form is public by design.
// Set VITE_APPS_SCRIPT_URL in your .env file.
export const APPS_SCRIPT_URL = import.meta.env.VITE_APPS_SCRIPT_URL || '';

// ─── Nordic Obsidian Colour Palette ──────────────────────────────────────────
// These are used in JavaScript contexts (e.g., Recharts, canvas drawing).
// For CSS/Tailwind contexts, use the CSS variables in globals.css instead.
export const COLORS = {
  // Dark mode
  canvasDark:  '#121214',
  cardDark:    '#1C1C1F',
  textDark:    '#E4E4E7',
  accentDark:  '#F59E0B',

  // Light mode
  canvasLight: '#FAFAFA',
  cardLight:   '#FFFFFF',
  textLight:   '#18181B',
  accentLight: '#D97706',

  // Sentiment (same in both modes)
  positive: '#10B981',
  neutral:  '#F59E0B',
  negative: '#EF4444',
  mixed:    '#8B5CF6',
  unclear:  '#6B7280',

  // Chart palette (ordered for variety)
  chart: ['#F59E0B', '#10B981', '#EF4444', '#8B5CF6', '#3B82F6', '#EC4899'],
};

// ─── Sentiment Options ────────────────────────────────────────────────────────
export const SENTIMENTS = [
  { value: 'Positive', label: 'Positive', color: COLORS.positive },
  { value: 'Negative', label: 'Negative', color: COLORS.negative },
  { value: 'Neutral',  label: 'Neutral',  color: COLORS.neutral  },
  { value: 'Mixed',    label: 'Mixed',    color: COLORS.mixed    },
  { value: 'Unclear',  label: 'Unclear',  color: COLORS.unclear  },
];

// ─── Feedback Categories ──────────────────────────────────────────────────────
export const CATEGORIES = [
  'Product Quality',
  'Pricing',
  'Delivery',
  'Customer Support',
  'Usability',
  'Performance',
  'Features',
  'Packaging',
  'Other',
];

// ─── Processing Statuses ──────────────────────────────────────────────────────
export const PROCESSING_STATUS = {
  PENDING:    'Pending',
  PROCESSING: 'Processing',
  ANALYZED:   'Analyzed',
  ERROR:      'Error',
};

// ─── Route Paths ──────────────────────────────────────────────────────────────
export const ROUTES = {
  HOME:            '/',
  DASHBOARD:       '/dashboard',
  PRODUCT_ANALYSIS:'/analysis',
  FEEDBACK_HISTORY:'/history',
  AI_INSIGHTS:     '/insights',
  REPORTS:         '/reports',
  SUBMIT:          '/submit',
};

// ─── Theme Options ────────────────────────────────────────────────────────────
export const THEMES = {
  LIGHT:  'light',
  DARK:   'dark',
  SYSTEM: 'system',
};

export const THEME_STORAGE_KEY = 'feedbackiq-theme';

// ─── Rating Scale ─────────────────────────────────────────────────────────────
export const RATING_MIN = 1;
export const RATING_MAX = 5;

// ─── Form Limits ──────────────────────────────────────────────────────────────
// These mirror the server-side validation in Apps Script.
// Keep them in sync when changing Code.gs.
export const FORM_LIMITS = {
  COMMENT_MIN_LENGTH:  10,
  COMMENT_MAX_LENGTH:  2000,
  NAME_MAX_LENGTH:     100,
  MAX_SUBMISSIONS_PER_HOUR: 5,
};

// ─── Organisation Name ────────────────────────────────────────────────────────
// Change this to your organisation's name.
export const ORG_NAME = 'FeedbackIQ Demo Organisation';
