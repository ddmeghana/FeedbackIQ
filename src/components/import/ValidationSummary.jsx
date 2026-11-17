import { useState } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  Copy,
  Layers,
  ChevronDown,
  ChevronUp,
  Info,
} from 'lucide-react';

/**
 * ValidationSummary — Displays validation metrics and invalid row inspector.
 */
export default function ValidationSummary({ validationResult }) {
  const [showInvalidDetails, setShowInvalidDetails] = useState(false);
  const [showValidPreview, setShowValidPreview] = useState(false);

  if (!validationResult) return null;

  const {
    totalRows = 0,
    validCount = 0,
    invalidCount = 0,
    duplicateCount = 0,
    validRecords = [],
    invalidRecords = [],
  } = validationResult;

  return (
    <div className="space-y-6">
      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Rows */}
        <div className="p-4 rounded-xl surface-card border border-border">
          <div className="flex items-center justify-between text-muted mb-1">
            <span className="text-[11px] font-mono uppercase tracking-wider">Total Rows</span>
            <Layers className="w-4 h-4 text-muted" />
          </div>
          <div className="text-xl font-bold text-primary font-mono">{totalRows}</div>
          <div className="text-[10px] text-muted mt-0.5">Parsed from source file</div>
        </div>

        {/* Valid Records */}
        <div className="p-4 rounded-xl surface-card border border-emerald-500/30 bg-emerald-500/5">
          <div className="flex items-center justify-between text-emerald-500 mb-1">
            <span className="text-[11px] font-mono uppercase tracking-wider font-semibold">Valid</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">
            {validCount}
          </div>
          <div className="text-[10px] text-muted mt-0.5">Ready for database import</div>
        </div>

        {/* Invalid Records */}
        <div className={`p-4 rounded-xl surface-card border ${
          invalidCount > 0 ? 'border-red-500/30 bg-red-500/5' : 'border-border'
        }`}>
          <div className="flex items-center justify-between text-red-500 mb-1">
            <span className="text-[11px] font-mono uppercase tracking-wider font-semibold">Invalid</span>
            <AlertCircle className="w-4 h-4" />
          </div>
          <div className={`text-xl font-bold font-mono ${invalidCount > 0 ? 'text-red-500' : 'text-primary'}`}>
            {invalidCount}
          </div>
          <div className="text-[10px] text-muted mt-0.5">Will be skipped safely</div>
        </div>

        {/* Internal Duplicates */}
        <div className={`p-4 rounded-xl surface-card border ${
          duplicateCount > 0 ? 'border-amber-500/30 bg-amber-500/5' : 'border-border'
        }`}>
          <div className="flex items-center justify-between text-amber-500 mb-1">
            <span className="text-[11px] font-mono uppercase tracking-wider font-semibold">Duplicates</span>
            <Copy className="w-4 h-4" />
          </div>
          <div className={`text-xl font-bold font-mono ${duplicateCount > 0 ? 'text-amber-500' : 'text-primary'}`}>
            {duplicateCount}
          </div>
          <div className="text-[10px] text-muted mt-0.5">Identical rows within file</div>
        </div>
      </div>

      {/* Reassurance Callout */}
      <div className="p-3.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/60 border border-border flex items-start gap-2.5">
        <Info className="w-4 h-4 text-accent shrink-0 mt-0.5" />
        <p className="text-xs text-muted leading-relaxed">
          <strong className="text-primary font-medium">Safe Ingestion Guarantee:</strong> Only the{' '}
          <strong className="text-emerald-500 font-semibold">{validCount} valid records</strong> will be
          sent to the central FeedbackIQ database. Any invalid or duplicate rows will be cleanly skipped.
        </p>
      </div>

      {/* Invalid Records Inspector (Accordion) */}
      {invalidCount > 0 && (
        <div className="rounded-xl border border-red-500/25 overflow-hidden bg-card">
          <button
            type="button"
            onClick={() => setShowInvalidDetails(!showInvalidDetails)}
            className="w-full px-4 py-3 bg-red-500/10 hover:bg-red-500/15 flex items-center justify-between text-xs font-semibold text-red-500 transition-colors focus-visible:outline-none"
          >
            <span className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Inspect {invalidCount} Invalid Rows and Reasons</span>
            </span>
            {showInvalidDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showInvalidDetails && (
            <div className="p-4 space-y-3 max-h-72 overflow-y-auto divide-y divide-border/60">
              {invalidRecords.map((item, idx) => (
                <div key={idx} className="pt-2.5 first:pt-0 space-y-1 text-xs">
                  <div className="flex items-center justify-between text-[11px] font-mono text-muted">
                    <span className="font-semibold text-red-500">Row #{item.rowIndex}</span>
                    <span className="truncate max-w-[200px] text-muted/60">
                      Product: {item.record?.Product_Name || '— blank —'}
                    </span>
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 text-red-600 dark:text-red-400">
                    {item.errors.map((err, eIdx) => (
                      <li key={eIdx} className="leading-snug">{err}</li>
                    ))}
                  </ul>
                  {item.record?.Comment && (
                    <p className="text-[11px] text-muted italic line-clamp-1 mt-0.5">
                      &quot;{item.record.Comment}&quot;
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Valid Records Preview (Accordion) */}
      {validCount > 0 && (
        <div className="rounded-xl border border-border overflow-hidden bg-card">
          <button
            type="button"
            onClick={() => setShowValidPreview(!showValidPreview)}
            className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800/40 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-between text-xs font-semibold text-primary transition-colors focus-visible:outline-none"
          >
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Preview Normalized Valid Records ({validCount})</span>
            </span>
            {showValidPreview ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showValidPreview && (
            <div className="p-3 overflow-x-auto max-h-72">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border text-[11px] font-mono text-muted">
                    <th className="py-2 px-2.5">Product Name</th>
                    <th className="py-2 px-2.5">Feedback Comment</th>
                    <th className="py-2 px-2.5">Rating</th>
                    <th className="py-2 px-2.5">Respondent</th>
                    <th className="py-2 px-2.5">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {validRecords.slice(0, 10).map((vr, idx) => (
                    <tr key={idx} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                      <td className="py-2 px-2.5 font-medium text-primary whitespace-nowrap">
                        {vr.record.Product_Name}
                      </td>
                      <td className="py-2 px-2.5 text-muted max-w-xs truncate">
                        {vr.record.Comment}
                      </td>
                      <td className="py-2 px-2.5 font-mono text-accent whitespace-nowrap">
                        {vr.record.Rating ? `${vr.record.Rating} ★` : '—'}
                      </td>
                      <td className="py-2 px-2.5 text-muted whitespace-nowrap">
                        {vr.record.Respondent_Name || 'Anonymous'}
                      </td>
                      <td className="py-2 px-2.5 text-muted font-mono text-[11px] whitespace-nowrap">
                        {vr.record.Timestamp ? vr.record.Timestamp.substring(0, 10) : 'Now'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {validCount > 10 && (
                <p className="text-[11px] text-muted text-center py-2 font-mono">
                  + {validCount - 10} more valid records
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
