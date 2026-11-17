import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function FeedbackPagination({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  pageSize = 15,
  onPageChange,
  onPageSizeChange,
}) {
  if (totalItems === 0) return null;

  const startIdx = (currentPage - 1) * pageSize + 1;
  const endIdx = Math.min(currentPage * pageSize, totalItems);

  // Generate page window (e.g. [1, 2, 3])
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="surface-card rounded-2xl p-4 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-muted">
      {/* Left: Range and Page Size Selector */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="font-mono text-[11px]">
          Showing <strong className="text-primary font-semibold">{startIdx}</strong>–
          <strong className="text-primary font-semibold">{endIdx}</strong> of{' '}
          <strong className="text-primary font-semibold">{totalItems}</strong> records
        </span>

        <div className="flex items-center gap-1.5 font-mono text-[11px]">
          <span>Per page:</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            aria-label="Records per page"
            className="pl-2 pr-6 py-1 rounded-lg bg-card text-primary border border-border hover:border-accent/40 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent transition-colors cursor-pointer"
          >
            <option value={10}>10</option>
            <option value={15}>15</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      {/* Right: Page Navigation Controls */}
      <div className="flex items-center gap-1 self-center sm:self-auto">
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="p-1.5 rounded-lg border border-border hover:bg-zinc-100 dark:hover:bg-zinc-800 text-muted hover:text-primary transition-colors disabled:opacity-30 disabled:pointer-events-none"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {pageNumbers[0] > 1 && (
          <>
            <button
              type="button"
              onClick={() => onPageChange(1)}
              className="w-8 h-8 rounded-lg border border-border hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors font-mono text-xs"
            >
              1
            </button>
            {pageNumbers[0] > 2 && <span className="px-1 text-muted/60">...</span>}
          </>
        )}

        {pageNumbers.map((page) => (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            className={`w-8 h-8 rounded-lg font-mono text-xs transition-colors ${
              currentPage === page
                ? 'bg-accent text-zinc-950 font-bold shadow-xs'
                : 'border border-border hover:bg-zinc-100 dark:hover:bg-zinc-800 text-muted hover:text-primary'
            }`}
          >
            {page}
          </button>
        ))}

        {pageNumbers[pageNumbers.length - 1] < totalPages && (
          <>
            {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
              <span className="px-1 text-muted/60">...</span>
            )}
            <button
              type="button"
              onClick={() => onPageChange(totalPages)}
              className="w-8 h-8 rounded-lg border border-border hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors font-mono text-xs"
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          type="button"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="p-1.5 rounded-lg border border-border hover:bg-zinc-100 dark:hover:bg-zinc-800 text-muted hover:text-primary transition-colors disabled:opacity-30 disabled:pointer-events-none"
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
