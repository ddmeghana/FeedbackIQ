import { Table, Eye, FileSpreadsheet } from 'lucide-react';

/**
 * DataPreviewTable — Renders the first 5-10 rows of parsed data.
 */
export default function DataPreviewTable({
  headers = [],
  rows = [],
  totalRows = 0,
  sheetNames = [],
  activeSheet = '',
  onSelectSheet,
  maxPreviewRows = 8,
}) {
  const previewRows = rows.slice(0, maxPreviewRows);

  return (
    <div className="space-y-4">
      {/* Worksheet Switcher (for Excel files with multiple sheets) */}
      {sheetNames.length > 1 && (
        <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl bg-card border border-border">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-primary shrink-0 mr-1">
            <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
            <span>Select Worksheet:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {sheetNames.map((sheet) => (
              <button
                key={sheet}
                type="button"
                onClick={() => onSelectSheet && onSelectSheet(sheet)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  activeSheet === sheet
                    ? 'bg-accent text-zinc-950 font-semibold shadow-xs'
                    : 'text-muted hover:text-primary bg-zinc-100 dark:bg-zinc-800'
                }`}
              >
                {sheet}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Dataset Summary Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/60 border border-border text-xs">
        <div className="flex items-center gap-2">
          <Eye className="w-3.5 h-3.5 text-accent" />
          <span className="font-medium text-primary">
            Showing first {previewRows.length} of {totalRows.toLocaleString()} rows
          </span>
        </div>
        <div className="font-mono text-[11px] text-muted">
          {headers.length} columns detected
        </div>
      </div>

      {/* Scrollable Preview Table */}
      <div className="rounded-xl border border-border overflow-hidden bg-card shadow-xs">
        <div className="overflow-x-auto max-h-[380px]">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border bg-zinc-100/80 dark:bg-zinc-800/80 sticky top-0 z-10 backdrop-blur-xs">
                <th className="py-2.5 px-3 font-mono text-[11px] font-semibold text-muted w-12 text-center">
                  #
                </th>
                {headers.map((header) => (
                  <th
                    key={header}
                    className="py-2.5 px-3.5 font-semibold text-primary whitespace-nowrap min-w-[140px]"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {previewRows.map((row, rIdx) => (
                <tr
                  key={rIdx}
                  className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors"
                >
                  <td className="py-2.5 px-3 font-mono text-[11px] text-muted text-center select-none bg-zinc-50/50 dark:bg-zinc-900/30">
                    {rIdx + 1}
                  </td>
                  {headers.map((header) => {
                    const rawVal = row[header];
                    const isBlank = rawVal === null || rawVal === undefined || String(rawVal).trim() === '';

                    return (
                      <td
                        key={header}
                        className="py-2.5 px-3.5 max-w-xs truncate text-primary font-normal"
                        title={!isBlank ? String(rawVal) : 'Empty cell'}
                      >
                        {isBlank ? (
                          <span className="text-muted/40 italic font-mono text-[11px]">
                            — empty —
                          </span>
                        ) : (
                          String(rawVal)
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
