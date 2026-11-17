import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRight,
  RotateCcw,
  LayoutDashboard,
  Database,
  Copy,
} from 'lucide-react';
import Button from '../ui/Button';
import { ROUTES } from '../../config/constants';

/**
 * ImportResultView — Post-import confirmation card displaying verified server counts.
 */
export default function ImportResultView({
  result,
  totalSourceRows = 0,
  onReset,
}) {
  if (!result) return null;

  const {
    success = false,
    importedCount = 0,
    duplicateCount = 0,
    rejectedCount = 0,
    message = '',
  } = result;

  const isFullSuccess = success && rejectedCount === 0 && importedCount > 0;
  const isPartialSuccess = success && (rejectedCount > 0 || duplicateCount > 0) && importedCount > 0;
  const isZeroImport = success && importedCount === 0;

  return (
    <div className="surface-card rounded-2xl p-6 sm:p-8 border border-border space-y-6 max-w-2xl mx-auto text-center shadow-card-dark">
      {/* Status Icon */}
      <div className="mx-auto flex items-center justify-center">
        {isFullSuccess ? (
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center border border-emerald-500/20 shadow-lg shadow-emerald-500/10">
            <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
          </div>
        ) : isPartialSuccess || isZeroImport ? (
          <div className="w-16 h-16 rounded-2xl bg-amber-500/15 text-amber-500 flex items-center justify-center border border-amber-500/20 shadow-lg shadow-amber-500/10">
            <AlertTriangle className="w-8 h-8 stroke-[2.5]" />
          </div>
        ) : (
          <div className="w-16 h-16 rounded-2xl bg-red-500/15 text-red-500 flex items-center justify-center border border-red-500/20 shadow-lg shadow-red-500/10">
            <XCircle className="w-8 h-8 stroke-[2.5]" />
          </div>
        )}
      </div>

      {/* Status Title & Message */}
      <div className="space-y-1.5">
        <h2 className="text-xl sm:text-2xl font-extrabold text-primary tracking-tight">
          {isFullSuccess
            ? 'Import Completed Successfully'
            : isZeroImport
            ? 'No New Records Imported'
            : isPartialSuccess
            ? 'Import Completed with Filtered Records'
            : 'Import Failed'}
        </h2>
        <p className="text-xs sm:text-sm text-muted max-w-md mx-auto leading-relaxed">
          {message || 'The data ingestion batch has finished processing.'}
        </p>
      </div>

      {/* Verified Server Metrics */}
      <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-zinc-100 dark:bg-zinc-800/60 border border-border text-center">
        <div>
          <div className="text-xs text-muted font-medium mb-1">Imported</div>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
            {importedCount}
          </div>
          <div className="text-[10px] text-muted">Added to database</div>
        </div>

        <div className="border-x border-border/70">
          <div className="text-xs text-muted font-medium mb-1">Duplicates</div>
          <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 font-mono">
            {duplicateCount}
          </div>
          <div className="text-[10px] text-muted">Skipped cleanly</div>
        </div>

        <div>
          <div className="text-xs text-muted font-medium mb-1">Rejected</div>
          <div className="text-2xl font-extrabold text-red-500 font-mono">
            {rejectedCount}
          </div>
          <div className="text-[10px] text-muted">Validation errors</div>
        </div>
      </div>

      {/* Note on Processing Status */}
      <div className="p-3.5 rounded-xl bg-card border border-border text-left flex items-start gap-3">
        <Database className="w-4 h-4 text-accent shrink-0 mt-0.5" />
        <div className="text-xs text-muted space-y-0.5">
          <p className="font-semibold text-primary">Database Sync Confirmed</p>
          <p className="leading-relaxed">
            All imported rows are stored in the central Google Sheets database with{' '}
            <span className="font-mono text-amber-500 font-medium">Processing_Status: Pending</span>.
            AI sentiment analysis will be applied in Phase 7D via the n8n automation pipeline.
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link to={ROUTES.DASHBOARD} className="w-full sm:w-auto">
          <Button
            variant="primary"
            size="md"
            className="w-full justify-center"
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            View in Dashboard
          </Button>
        </Link>

        <Button
          type="button"
          variant="outline"
          size="md"
          onClick={onReset}
          className="w-full sm:w-auto justify-center"
          leftIcon={<RotateCcw className="w-4 h-4" />}
        >
          Import Another File
        </Button>
      </div>
    </div>
  );
}
