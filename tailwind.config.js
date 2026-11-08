/** @type {import('tailwindcss').Config} */
export default {
  // 'class' strategy: dark mode is toggled by adding/removing the 'dark' class on <html>
  darkMode: 'class',

  // Tell Tailwind which files to scan for class names (so unused styles are removed in production)
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],

  theme: {
    extend: {
      // ─── Nordic Obsidian Colour Palette ───────────────────────────────────
      // These exact values are locked per the design specification.
      // Do NOT substitute with generic Tailwind colours.
      colors: {
        // Dark mode surfaces
        'canvas-dark':  '#121214',
        'card-dark':    '#1C1C1F',
        'text-dark':    '#E4E4E7',
        'accent-dark':  '#F59E0B',

        // Light mode surfaces
        'canvas-light': '#FAFAFA',
        'card-light':   '#FFFFFF',
        'text-light':   '#18181B',
        'accent-light': '#D97706',

        // Semantic sentiment colours (same in both modes)
        'sentiment-positive': '#10B981',
        'sentiment-neutral':  '#F59E0B',
        'sentiment-negative': '#EF4444',
        'sentiment-mixed':    '#8B5CF6',
        'sentiment-unclear':  '#6B7280',

        // Design token aliases (map to CSS variables for dynamic theming)
        canvas:  'var(--color-canvas)',
        card:    'var(--color-card)',
        primary: 'var(--color-text)',
        accent:  'var(--color-accent)',
        muted:   'var(--color-muted)',
        border:  'var(--color-border)',
      },

      // ─── Typography ───────────────────────────────────────────────────────
      fontFamily: {
        // Inter for body text — clean, modern, highly legible
        sans: ['Inter', 'system-ui', 'sans-serif'],
        // JetBrains Mono for code, IDs, timestamps
        mono: ['JetBrains Mono', 'monospace'],
      },

      // ─── Custom Animations ────────────────────────────────────────────────
      animation: {
        'fade-in':       'fadeIn 0.4s ease-out forwards',
        'slide-up':      'slideUp 0.5s ease-out forwards',
        'slide-down':    'slideDown 0.3s ease-out forwards',
        'pulse-slow':    'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow':     'spin 3s linear infinite',
        'marquee':       'marquee 25s linear infinite',
        'marquee-rev':   'marqueeReverse 25s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%':   { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        marquee: {
          '0%':   { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        marqueeReverse: {
          '0%':   { transform: 'translateX(-50%)' },
          '100%': { transform: 'translateX(0%)' },
        },
      },

      // ─── Backdrop Blur ────────────────────────────────────────────────────
      backdropBlur: {
        xs: '2px',
      },

      // ─── Box Shadow ───────────────────────────────────────────────────────
      boxShadow: {
        'glow-amber':    '0 0 20px 0 rgba(245, 158, 11, 0.25)',
        'glow-green':    '0 0 20px 0 rgba(16, 185, 129, 0.25)',
        'glow-red':      '0 0 20px 0 rgba(239, 68, 68, 0.25)',
        'card-dark':     '0 4px 24px 0 rgba(0, 0, 0, 0.5)',
        'card-light':    '0 4px 24px 0 rgba(0, 0, 0, 0.08)',
      },

      // ─── Border Radius ────────────────────────────────────────────────────
      borderRadius: {
        'xl2': '1rem',
        'xl3': '1.5rem',
      },
    },
  },

  plugins: [],
}
