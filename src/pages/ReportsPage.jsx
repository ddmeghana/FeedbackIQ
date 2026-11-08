import { Link } from 'react-router-dom';
import { FileText, ArrowLeft, Clock } from 'lucide-react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import Button from '../components/ui/Button';
import { ROUTES } from '../config/constants';
import { useDashboardFilters } from '../hooks/useDashboardFilters';

export default function ReportsPage() {
  const { products, selectedProduct, setSelectedProduct, dateRange, setDateRange } =
    useDashboardFilters();

  return (
    <DashboardLayout
      products={products}
      selectedProduct={selectedProduct}
      onSelectProduct={setSelectedProduct}
      dateRange={dateRange}
      onSelectDateRange={setDateRange}
      pageTitle="Reports"
    >
      <div className="surface-card rounded-2xl p-8 border border-border text-center max-w-lg mx-auto my-12 space-y-4">
        <div className="w-12 h-12 rounded-xl bg-accent/15 text-accent flex items-center justify-center mx-auto">
          <FileText className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-primary">Executive PDF Reports</h2>
          <p className="text-xs text-muted leading-relaxed">
            Report configuration, date-filtering, and client-side PDF export generation using jsPDF
            will be implemented in Phase 11.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-mono text-amber-500">
          <Clock className="w-3.5 h-3.5" /> Scheduled for Phase 11
        </div>
        <div className="pt-2">
          <Link to={ROUTES.DASHBOARD}>
            <Button size="sm" variant="secondary" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Return to Overview
            </Button>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
