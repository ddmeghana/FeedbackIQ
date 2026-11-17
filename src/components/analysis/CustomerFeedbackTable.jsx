import { useState, useMemo } from 'react';
import {
  Search,
  Star,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  User,
  Clock,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import Badge from '../ui/Badge';
import { formatDate } from '../../lib/utils';

export default function CustomerFeedbackTable({ records = [], productName = 'Product' }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sentimentFilter, setSentimentFilter] = useState('ALL'); // 'ALL' | 'Positive' | 'Neutral' | 'Negative' | 'Pending'
  const [expandedId, setExpandedId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Filter records by search keyword and sentiment filter
  const filtered = useMemo(() => {
    return records.filter((r) => {
      // 1. Sentiment filter
      if (sentimentFilter !== 'ALL') {
        const sentiment = (r.Sentiment || '').trim().toLowerCase();
        const status = (r.Processing_Status || '').trim().toLowerCase();

        if (sentimentFilter === 'Pending') {
          if (sentiment !== '' && status === 'analyzed') return false;
        } else if (sentiment !== sentimentFilter.toLowerCase()) {
          return false;
        }
      }

      // 2. Search query filter
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchComment = (r.Comment || '').toLowerCase().includes(q);
        const matchCategory = (r.Category || '').toLowerCase().includes(q);
        const matchSummary = (r.Summary || '').toLowerCase().includes(q);
        const matchRespondent = !r.Is_Anonymous && (r.Respondent_Name || '').toLowerCase().includes(q);

        if (!matchComment && !matchCategory && !matchSummary && !matchRespondent) {
          return false;
        }
      }

      return true;
    });
  }, [records, sentimentFilter, searchQuery]);

  // Pagination calculation
  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  // Reset to page 1 when filter changes
  const handleFilterChange = (filter) => {
    setSentimentFilter(filter);
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getSentimentVariant = (sentiment, status) => {
    const s = (sentiment || '').trim().toLowerCase();
    if (s === 'positive') return 'positive';
    if (s === 'neutral') return 'neutral';
    if (s === 'negative') return 'negative';
    if (s === 'mixed') return 'mixed';
    return 'default';
  };

  return (
    <div className="surface-card rounded-2xl p-5 sm:p-6 border border-border space-y-4">
      {/* Table Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-border/80">
        <div>
          <h3 className="text-base font-bold text-primary">
            Customer Feedback Records
          </h3>
          <p className="text-xs text-muted">
            Inspect individual submissions, ratings, and AI processing details for {productName}
          </p>
        </div>

        {/* Filter Badges & Search */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Sentiment Filter Pills */}
          <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800/60 p-1 rounded-xl border border-border/60 text-xs">
            {['ALL', 'Positive', 'Neutral', 'Negative', 'Pending'].map((f) => {
              const count =
                f === 'ALL'
                  ? records.length
                  : f === 'Pending'
                  ? records.filter((r) => !(r.Sentiment && r.Sentiment.trim() !== '')).length
                  : records.filter((r) => (r.Sentiment || '').trim().toLowerCase() === f.toLowerCase()).length;

              return (
                <button
                  key={f}
                  type="button"
                  onClick={() => handleFilterChange(f)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                    sentimentFilter === f
                      ? 'bg-card text-primary shadow-xs font-semibold'
                      : 'text-muted hover:text-primary'
                  }`}
                >
                  {f} ({count})
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search comments..."
              aria-label="Search feedback comments"
              className="pl-8 pr-3 py-1.5 text-xs rounded-xl bg-card text-primary border border-border hover:border-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-colors w-40 sm:w-48 shadow-xs"
            />
          </div>
        </div>
      </div>

      {/* Empty State */}
      {paginatedRecords.length === 0 ? (
        <div className="py-12 text-center space-y-2 text-xs text-muted">
          <p className="font-semibold text-primary">No matching feedback records found.</p>
          <p>Try adjusting your search query or sentiment filter.</p>
        </div>
      ) : (
        /* Table of Records */
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border/60 text-muted font-mono uppercase text-[10px]">
                <th scope="col" className="pb-2.5 font-semibold w-24">Date</th>
                <th scope="col" className="pb-2.5 font-semibold w-28">Respondent</th>
                <th scope="col" className="pb-2.5 font-semibold w-20">Rating</th>
                <th scope="col" className="pb-2.5 font-semibold w-24">Sentiment</th>
                <th scope="col" className="pb-2.5 font-semibold w-28">Category</th>
                <th scope="col" className="pb-2.5 font-semibold">Customer Comment</th>
                <th scope="col" className="pb-2.5 font-semibold w-16 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {paginatedRecords.map((item) => {
                const isExpanded = expandedId === item.Response_ID;
                const isPending = !(item.Sentiment && item.Sentiment.trim() !== '');

                return (
                  <tr
                    key={item.Response_ID}
                    className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors group cursor-pointer"
                    onClick={() => toggleExpand(item.Response_ID)}
                  >
                    {/* Timestamp */}
                    <td className="py-3 font-mono text-muted whitespace-nowrap align-top text-[11px]">
                      {formatDate(item.Timestamp)}
                    </td>

                    {/* Respondent */}
                    <td className="py-3 text-primary whitespace-nowrap align-top">
                      {item.Is_Anonymous ? (
                        <span className="italic text-muted/70 text-[11px]">
                          Anonymous
                        </span>
                      ) : (
                        <span className="font-medium text-[11px]">
                          {item.Respondent_Name || 'Verified User'}
                        </span>
                      )}
                    </td>

                    {/* Rating */}
                    <td className="py-3 align-top whitespace-nowrap">
                      {typeof item.Rating === 'number' && item.Rating >= 1 && item.Rating <= 5 ? (
                        <span className="text-amber-500 font-mono font-semibold flex items-center gap-1">
                          {item.Rating} <Star className="w-3 h-3 fill-amber-500" />
                        </span>
                      ) : (
                        <span className="text-muted/60 font-mono text-[11px]">—</span>
                      )}
                    </td>

                    {/* Sentiment Badge */}
                    <td className="py-3 align-top whitespace-nowrap">
                      {isPending ? (
                        <Badge variant="default" size="sm" dot>
                          Pending
                        </Badge>
                      ) : (
                        <Badge variant={getSentimentVariant(item.Sentiment)} size="sm" dot>
                          {item.Sentiment}
                        </Badge>
                      )}
                    </td>

                    {/* Category Badge */}
                    <td className="py-3 align-top whitespace-nowrap">
                      {item.Category && item.Category.trim() !== '' ? (
                        <span className="text-[11px] text-primary font-medium">
                          {item.Category}
                        </span>
                      ) : (
                        <span className="text-[11px] text-muted/60 italic font-mono">
                          {isPending ? 'Pending' : '—'}
                        </span>
                      )}
                    </td>

                    {/* Comment & Summary Expanded Drawer */}
                    <td className="py-3 align-top">
                      <div className="space-y-1 max-w-xl">
                        <p className="text-primary text-[11px] leading-relaxed line-clamp-2">
                          &ldquo;{item.Comment}&rdquo;
                        </p>

                        {/* Inline AI Summary if available */}
                        {item.Summary && (
                          <div className="text-[10.5px] text-muted flex items-center gap-1.5 pt-0.5">
                            <Sparkles className="w-3 h-3 text-accent shrink-0" />
                            <span className="truncate">Summary: {item.Summary}</span>
                          </div>
                        )}

                        {/* Expanded Deep Drawer */}
                        {isExpanded && (
                          <div className="mt-2.5 p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-border/80 space-y-2 text-xs">
                            <div className="flex items-center justify-between text-[10px] font-mono text-muted border-b border-border/60 pb-1.5">
                              <span>Response ID: {item.Response_ID}</span>
                              <span>Status: {item.Processing_Status || (isPending ? 'Pending' : 'Analyzed')}</span>
                            </div>

                            <div className="space-y-1">
                              <span className="font-bold text-primary text-[11px] block">Full Customer Comment:</span>
                              <p className="text-muted leading-relaxed text-[11px] italic bg-card p-2 rounded-lg border border-border/40">
                                &ldquo;{item.Comment}&rdquo;
                              </p>
                            </div>

                            {item.Summary ? (
                              <div className="space-y-1">
                                <span className="font-bold text-primary text-[11px] flex items-center gap-1">
                                  <Sparkles className="w-3 h-3 text-accent" /> AI Executive Summary:
                                </span>
                                <p className="text-muted text-[11px] leading-relaxed">
                                  {item.Summary}
                                </p>
                              </div>
                            ) : (
                              <div className="text-[11px] text-muted italic flex items-center gap-1.5">
                                <Clock className="w-3 h-3" />
                                <span>No AI summary recorded yet for this response.</span>
                              </div>
                            )}

                            {item.Suggested_Action && (
                              <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-primary">
                                <strong className="text-accent font-semibold">Recommended Action:</strong>{' '}
                                {item.Suggested_Action}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Details Expand Toggle */}
                    <td className="py-3 align-top text-right text-muted whitespace-nowrap">
                      <button
                        type="button"
                        aria-label={isExpanded ? 'Collapse response details' : 'Expand response details'}
                        className="p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-accent" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-muted group-hover:text-primary" />
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted">
          <div className="font-mono text-[11px]">
            Showing {(currentPage - 1) * pageSize + 1}–
            {Math.min(currentPage * pageSize, filtered.length)} of {filtered.length} responses
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              className="p-1.5 rounded-lg border border-border hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-40"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono text-[11px] px-1">
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              className="p-1.5 rounded-lg border border-border hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-40"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
