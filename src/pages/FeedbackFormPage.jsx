import { Link } from 'react-router-dom';
import { Sparkles, Sun, Moon, Laptop, ArrowLeft, LayoutDashboard, Shield } from 'lucide-react';
import FeedbackForm from '../components/feedback/FeedbackForm';
import { mockProducts } from '../data/mockDashboardData';
import { useThemeContext } from '../context/ThemeContext';
import { THEMES, ROUTES, ORG_NAME } from '../config/constants';

export default function FeedbackFormPage() {
  const { theme, setTheme } = useThemeContext();

  const cycleTheme = () => {
    if (theme === THEMES.SYSTEM) setTheme(THEMES.DARK);
    else if (theme === THEMES.DARK) setTheme(THEMES.LIGHT);
    else setTheme(THEMES.SYSTEM);
  };

  const themeIcon = {
    [THEMES.LIGHT]: <Sun className="w-4 h-4 text-amber-500" aria-hidden="true" />,
    [THEMES.DARK]: <Moon className="w-4 h-4 text-amber-400" aria-hidden="true" />,
    [THEMES.SYSTEM]: <Laptop className="w-4 h-4 text-muted" aria-hidden="true" />,
  }[theme];

  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-canvas text-primary flex flex-col justify-between selection:bg-accent selection:text-zinc-950">
      {/* 1. Respondent Header */}
      <header className="border-b border-border/80 bg-card/60 backdrop-blur-xs sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          {/* Brand Logo & Name */}
          <Link
            to={ROUTES.HOME}
            className="flex items-center gap-2 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-lg"
            aria-label="FeedbackIQ Home"
          >
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-zinc-950 fill-zinc-950" />
            </div>
            <span className="font-extrabold text-sm sm:text-base tracking-tight text-primary">
              Feedback<span className="text-accent">IQ</span>
            </span>
          </Link>

          {/* Right Controls: Theme Switcher & Navigation Links */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={cycleTheme}
              aria-label="Toggle theme mode"
              title="Toggle theme (light/dark/system)"
              className="p-2 rounded-xl text-muted hover:text-primary hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              {themeIcon}
            </button>

            <Link
              to={ROUTES.HOME}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-medium text-muted hover:text-primary hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              title="Return to Home"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Home</span>
            </Link>

            <Link
              to={ROUTES.DASHBOARD}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-medium text-muted hover:text-primary hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              title="Go to Dashboard"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-accent" />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Main Form Content Area */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-6">
        {/* Intro Headings */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-xs font-mono text-accent">
            <span>PUBLIC FEEDBACK DESK</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight">
            We value your feedback
          </h1>
          <p className="text-xs sm:text-sm text-muted max-w-md mx-auto leading-relaxed">
            Your honest opinions help {ORG_NAME} refine our products, resolve bugs, and deliver
            better customer experiences.
          </p>
        </div>

        {/* The Core Feedback Form */}
        <FeedbackForm products={mockProducts} />

        {/* Privacy Reassurance Note */}
        <div className="flex items-center justify-center gap-2 text-center text-xs text-muted pt-2">
          <Shield className="w-3.5 h-3.5 text-accent" />
          <span>
            We respect your privacy. Anonymous submissions exclude all personal identification.
          </span>
        </div>
      </main>

      {/* 3. Minimal Respondent Footer */}
      <footer className="border-t border-border/80 py-6 text-center text-xs text-muted">
        <div className="max-w-2xl mx-auto px-4 space-y-1">
          <p>© {currentYear} FeedbackIQ. All rights reserved.</p>
          <p className="font-mono text-[11px] text-muted/70">
            AI-Powered Feedback Analysis & Summarization System
          </p>
        </div>
      </footer>
    </div>
  );
}
