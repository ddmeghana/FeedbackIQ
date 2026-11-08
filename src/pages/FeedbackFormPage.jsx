import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Sun,
  Moon,
  Laptop,
  ArrowLeft,
  LayoutDashboard,
  Shield,
  RotateCcw,
  AlertCircle,
  Inbox,
} from 'lucide-react';
import FeedbackForm from '../components/feedback/FeedbackForm';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';
import { getActiveProducts } from '../services/productService';
import { useThemeContext } from '../context/ThemeContext';
import { THEMES, ROUTES, ORG_NAME } from '../config/constants';

export default function FeedbackFormPage() {
  const { theme, setTheme } = useThemeContext();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isConfigError, setIsConfigError] = useState(false);

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

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    setIsConfigError(false);

    const result = await getActiveProducts();
    if (result.success) {
      setProducts(result.data || []);
    } else {
      setError(result.error || 'Failed to load active products.');
      setIsConfigError(Boolean(result.isConfigError));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

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

        {/* Content State: Loading, Error, Empty, or Form */}
        {loading ? (
          <div className="surface-card rounded-2xl p-12 border border-border text-center space-y-4">
            <Spinner size="lg" className="text-accent mx-auto" />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-primary">Loading active products...</p>
              <p className="text-xs text-muted">Retrieving product registry from Google Sheets</p>
            </div>
          </div>
        ) : error ? (
          <div
            role="alert"
            className="surface-card rounded-2xl p-8 border border-red-500/30 text-center space-y-5 shadow-card-dark"
          >
            <div className="w-12 h-12 rounded-full bg-red-500/15 text-red-500 flex items-center justify-center mx-auto shadow-sm">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div className="space-y-2 max-w-md mx-auto">
              <h2 className="text-base font-bold text-primary">Unable to Load Products</h2>
              <p className="text-xs text-muted leading-relaxed">{error}</p>

              {isConfigError && (
                <div className="mt-4 p-4 rounded-xl bg-canvas/80 border border-border text-left text-xs space-y-2">
                  <p className="text-accent font-semibold font-mono text-[11px] uppercase tracking-wider">
                    Configuration Required
                  </p>
                  <p className="text-muted leading-relaxed">
                    To connect to Google Sheets, set your deployed Web App URL in <code className="text-primary font-bold">.env.local</code>:
                  </p>
                  <pre className="p-2.5 rounded-lg bg-zinc-900 text-amber-400 font-mono text-[11px] overflow-x-auto border border-border/60">
                    VITE_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
                  </pre>
                  <p className="text-muted text-[11px]">
                    See <code className="text-primary">docs/PHASE_6A_SETUP.md</code> for complete setup steps.
                  </p>
                </div>
              )}
            </div>

            <div className="pt-1">
              <Button
                variant="primary"
                onClick={fetchProducts}
                leftIcon={<RotateCcw className="w-4 h-4" />}
              >
                Try Again
              </Button>
            </div>
          </div>
        ) : products.length === 0 ? (
          <div className="surface-card rounded-2xl p-10 border border-border text-center space-y-4 shadow-card-dark">
            <div className="w-12 h-12 rounded-full bg-amber-500/15 text-accent flex items-center justify-center mx-auto">
              <Inbox className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h2 className="text-base font-bold text-primary">No Active Products Found</h2>
              <p className="text-xs text-muted max-w-md mx-auto leading-relaxed">
                Feedback submissions are temporarily closed because no active products were found in the database.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={fetchProducts}
              leftIcon={<RotateCcw className="w-4 h-4" />}
            >
              Refresh Products
            </Button>
          </div>
        ) : (
          <FeedbackForm products={products} />
        )}

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
