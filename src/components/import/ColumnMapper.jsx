import { Check, AlertTriangle, HelpCircle, Columns } from 'lucide-react';
import { CANONICAL_FIELDS } from '../../utils/fileImportParser';

/**
 * ColumnMapper — Interactive source-to-canonical field mapping component.
 */
export default function ColumnMapper({
  headers = [],
  mappings = {},
  onMappingChange,
}) {
  const canonicalKeys = Object.keys(CANONICAL_FIELDS);

  // Detect duplicate source header assignments
  const headerUsageCount = {};
  Object.values(mappings).forEach((hdr) => {
    if (hdr) {
      headerUsageCount[hdr] = (headerUsageCount[hdr] || 0) + 1;
    }
  });

  const isProductMapped = Boolean(mappings.Product_Name);
  const isCommentMapped = Boolean(mappings.Comment);
  const hasRequiredFields = isProductMapped && isCommentMapped;

  return (
    <div className="space-y-5">
      {/* Required Fields Status Banner */}
      {!hasRequiredFields && (
        <div
          role="alert"
          className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-xs text-amber-600 dark:text-amber-400 flex items-start gap-2.5"
        >
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-semibold">Required Column Mapping Needed</p>
            <p className="text-muted leading-relaxed">
              Please map both <strong className="text-primary">Product Name</strong> and{' '}
              <strong className="text-primary">Feedback Comment</strong> before validating.
            </p>
          </div>
        </div>
      )}

      {/* Field Mapping Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {canonicalKeys.map((canonKey) => {
          const field = CANONICAL_FIELDS[canonKey];
          const selectedHeader = mappings[canonKey] || '';
          const isAssigned = Boolean(selectedHeader);
          const isDuplicate = selectedHeader && headerUsageCount[selectedHeader] > 1;

          return (
            <div
              key={canonKey}
              className={`p-4 rounded-xl border transition-all ${
                field.required && !isAssigned
                  ? 'border-amber-500/40 bg-amber-500/5'
                  : isAssigned
                  ? 'border-border bg-card'
                  : 'border-border/70 bg-zinc-50/50 dark:bg-zinc-900/30'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-primary">{field.label}</span>
                    {field.required ? (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-red-500/15 text-red-500 font-semibold">
                        Required
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-muted">
                        Optional
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted mt-0.5 leading-snug">
                    {field.description}
                  </p>
                </div>

                {isAssigned && !isDuplicate && (
                  <span className="w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </span>
                )}
              </div>

              {/* Header Selector Dropdown */}
              <div className="space-y-1 pt-1">
                <label htmlFor={`map-${canonKey}`} className="sr-only">
                  Map {field.label}
                </label>
                <div className="relative">
                  <select
                    id={`map-${canonKey}`}
                    value={selectedHeader}
                    onChange={(e) => onMappingChange(canonKey, e.target.value)}
                    className={`w-full px-3 py-2 text-xs font-medium rounded-xl bg-canvas text-primary border appearance-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent cursor-pointer ${
                      field.required && !isAssigned
                        ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                        : isDuplicate
                        ? 'border-red-500'
                        : 'border-border hover:border-accent/50'
                    }`}
                  >
                    <option value="">
                      {field.required ? '— Select Source Column (Required) —' : '— Do Not Map (Leave Blank) —'}
                    </option>
                    {headers.map((hdr) => (
                      <option key={hdr} value={hdr}>
                        {hdr}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted">
                    <Columns className="w-3.5 h-3.5" />
                  </div>
                </div>

                {isDuplicate && (
                  <p className="text-[10px] text-red-500 flex items-center gap-1 mt-1 font-medium">
                    <AlertTriangle className="w-3 h-3 shrink-0" />
                    Column &quot;{selectedHeader}&quot; is mapped to multiple fields.
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
