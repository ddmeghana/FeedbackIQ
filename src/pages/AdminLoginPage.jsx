import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Lock, Eye, EyeOff, LogIn, Sun, Moon, Laptop, AlertCircle } from 'lucide-react';
import { useThemeContext } from '../context/ThemeContext';
import { THEMES, ROUTES } from '../config/constants';
import Button from '../components/ui/Button';
import { adminLogin } from '../services/adminAuthService';

/**
 * AdminLoginPage — Standalone page for admin PIN authentication.
 *
 * SECURITY NOTES:
 *   - The PIN is NEVER stored in state after a failed attempt is cleared.
 *   - The session token is stored in sessionStorage by adminAuthService, not here.
 *   - On success, calls onLoginSuccess() callback to let the parent redirect.
 */
export default function AdminLoginPage({ onLoginSuccess }) {
  const { theme, setTheme } = useThemeContext();
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [remainingAttempts, setRemainingAttempts] = useState(null);
  const pinRef = useRef(null);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pin.trim()) {
      setError('Please enter the admin PIN.');
      pinRef.current?.focus();
      return;
    }

    setIsLoading(true);
    setError(null);
    setRemainingAttempts(null);

    const result = await adminLogin(pin.trim());
    setPin(''); // Always clear PIN from memory after attempt

    setIsLoading(false);

    if (result.success) {
      if (onLoginSuccess) onLoginSuccess();
    } else {
      setError(result.message || 'Login failed.');
      if (typeof result.remainingAttempts === 'number') {
        setRemainingAttempts(result.remainingAttempts);
      }
      pinRef.current?.focus();
    }
  };

  return (
    <div className="min-h-screen bg-canvas flex flex-col">
      {/* Minimal Header */}
      <header className="border-b border-border/80 bg-card/60 backdrop-blur-xs">
        <div className="max-w-md mx-auto px-4 py-3.5 flex items-center justify-between">
          <Link
            to={ROUTES.HOME}
            className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-lg"
            aria-label="FeedbackIQ Home"
          >
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-zinc-950 fill-zinc-950" />
            </div>
            <span className="font-extrabold text-sm tracking-tight text-primary">
              Feedback<span className="text-accent">IQ</span>
            </span>
          </Link>
          <button
            type="button"
            onClick={cycleTheme}
            aria-label="Toggle theme mode"
            className="p-2 rounded-xl text-muted hover:text-primary hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            {themeIcon}
          </button>
        </div>
      </header>

      {/* Login Card */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm space-y-6">
          {/* Title */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-accent/15 border border-accent/25 flex items-center justify-center mx-auto">
              <Lock className="w-7 h-7 text-accent" />
            </div>
            <h1 className="text-2xl font-extrabold text-primary tracking-tight">Admin Access</h1>
            <p className="text-xs text-muted">
              Enter your admin PIN to access the FeedbackIQ dashboard.
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div
              role="alert"
              className="flex gap-3 p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 text-xs text-red-600 dark:text-red-400"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
              <div className="space-y-0.5">
                <p className="font-semibold">{error}</p>
                {remainingAttempts !== null && (
                  <p className="text-red-500/80 dark:text-red-400/70">
                    {remainingAttempts} attempt(s) remaining before lockout.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* PIN Form */}
          <form
            onSubmit={handleSubmit}
            className="surface-card rounded-2xl p-6 border border-border shadow-card-dark space-y-5"
            noValidate
          >
            <div className="space-y-1.5">
              <label
                htmlFor="admin-pin"
                className="block text-xs font-medium text-muted uppercase tracking-wider"
              >
                Admin PIN
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted pointer-events-none" aria-hidden="true" />
                <input
                  ref={pinRef}
                  id="admin-pin"
                  type={showPin ? 'text' : 'password'}
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="Enter admin PIN"
                  autoComplete="current-password"
                  aria-describedby={error ? 'pin-error' : undefined}
                  aria-invalid={Boolean(error)}
                  className={`w-full pl-9 pr-10 py-2.5 text-sm rounded-xl bg-canvas text-primary border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                    error ? 'border-red-500' : 'border-border hover:border-accent/40'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  aria-label={showPin ? 'Hide PIN' : 'Show PIN'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent rounded"
                >
                  {showPin
                    ? <EyeOff className="w-3.5 h-3.5" aria-hidden="true" />
                    : <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                  }
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              disabled={isLoading || !pin.trim()}
              className="w-full font-semibold"
              rightIcon={!isLoading && <LogIn className="w-4 h-4" />}
            >
              {isLoading ? 'Verifying...' : 'Access Dashboard'}
            </Button>
          </form>

          {/* Security Notice */}
          <div className="text-center space-y-1">
            <p className="text-[11px] text-muted font-mono">
              Academic demonstration only. Not production authentication.
            </p>
            <p className="text-[11px] text-muted/60">
              Session expires after 2 hours of inactivity.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
