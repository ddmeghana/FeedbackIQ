import { Link } from 'react-router-dom';
import { LayoutDashboard, ArrowLeft, Clock } from 'lucide-react';
import Button from '../components/ui/Button';
import { ROUTES } from '../config/constants';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-canvas text-primary flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md surface-card rounded-2xl p-8 border border-border shadow-card-dark space-y-5">
        <div className="w-12 h-12 rounded-xl bg-accent/15 text-accent flex items-center justify-center mx-auto">
          <LayoutDashboard className="w-6 h-6" />
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-bold text-primary">Executive Dashboard</h1>
          <p className="text-xs text-muted">
            The core analytics dashboard, KPI counters, and interactive chart panels will be implemented in Phase 4.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-mono text-amber-500">
          <Clock className="w-3.5 h-3.5" /> Phase 4 Up Next
        </div>
        <div className="pt-2">
          <Link to={ROUTES.HOME}>
            <Button variant="secondary" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back to Landing Page
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
