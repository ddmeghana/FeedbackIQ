import { RefreshCw, AlertCircle, Database, LogIn } from 'lucide-react';
import Spinner from '../ui/Spinner';
import Button from '../ui/Button';

/**
 * DashboardStatus — Full-page loading, error, empty, and session-expired states for the dashboard.
 * Keeps DashboardPage clean and avoids duplicating these patterns across dashboard sub-pages.
 */
export default function DashboardStatus({ status, error, onRetry, onSessionExpired }) {
  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-5 text-center">
        <Spinner size="lg" className="text-accent" />
        <div className="space-y-1">
          <p className="text-sm font-semibold text-primary">Loading dashboard data...</p>
          <p className="text-xs text-muted">Fetching feedback records from Google Sheets</p>
        </div>
      </div>
    );
  }

  if (status === 'sessionExpired') {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-6 text-center max-w-sm mx-auto">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center">
          <LogIn className="w-7 h-7 text-accent" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-primary">Session Expired</h2>
          <p className="text-xs text-muted max-w-xs">
            Your admin session has expired or been invalidated. Please log in again to continue.
          </p>
        </div>
        <Button variant="primary" onClick={onSessionExpired} leftIcon={<LogIn className="w-4 h-4" />}>
          Log In Again
        </Button>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div
        role="alert"
        className="flex flex-col items-center justify-center py-24 space-y-6 text-center max-w-sm mx-auto"
      >
        <div className="w-14 h-14 rounded-2xl bg-red-500/15 border border-red-500/25 flex items-center justify-center">
          <AlertCircle className="w-7 h-7 text-red-500" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-primary">Failed to Load Data</h2>
          <p className="text-xs text-muted max-w-xs leading-relaxed">{error || 'An unexpected error occurred.'}</p>
        </div>
        <Button variant="primary" onClick={onRetry} leftIcon={<RefreshCw className="w-4 h-4" />}>
          Try Again
        </Button>
      </div>
    );
  }

  if (status === 'empty') {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-6 text-center max-w-sm mx-auto">
        <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border border-border flex items-center justify-center">
          <Database className="w-7 h-7 text-muted" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-primary">No Feedback Yet</h2>
          <p className="text-xs text-muted max-w-xs leading-relaxed">
            No feedback records were found matching your current filters.
            Share the submission link so respondents can start providing feedback.
          </p>
        </div>
        <Button variant="outline" onClick={onRetry} leftIcon={<RefreshCw className="w-4 h-4" />}>
          Refresh Data
        </Button>
      </div>
    );
  }

  return null;
}
