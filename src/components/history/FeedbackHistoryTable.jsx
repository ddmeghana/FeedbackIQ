import { Star, ExternalLink, ChevronRight } from 'lucide-react';
import Badge from '../ui/Badge';
import { formatDate } from '../../lib/utils';

export default function FeedbackHistoryTable({ records = [], onSelectRecord }) {
  if (records.length === 0) {
    return (
      <div className="surface-card rounded-2xl p-12 border border-border text-center space-y-2">
        <p className="text-sm font-semibold text-primary">No feedback records match the active criteria.</p>
        <p className="text-xs text-muted max-w-sm mx-auto">
          Try clearing your search terms or broadening the selected product and date filters.
        </p>
      </div>
    );
  }

  const getSentimentVariant = (sentiment) => {
    const s = (sentiment || '').trim().toLowerCase();
    if (s === 'positive') return 'positive';
    if (s === 'neutral') return 'neutral';
    if (s === 'negative') return 'negative';
    if (s === 'mixed') return 'mixed';
    return 'default';
  };

  return (
    <div className="surface-card rounded-2xl border border-border overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-zinc-50/70 dark:bg-zinc-900/60 border-b border-border/80 text-muted font-mono uppercase text-[10px] tracking-wider">
              <th scope="col" className="py-3 px-4 font-semibold w-28">Submitted</th>
              <th scope="col" className="py-3 px-4 font-semibold w-36">Product</th>
              <th scope="col" className="py-3 px-4 font-semibold w-32">Respondent</th>
              <th scope="col" className="py-3 px-4 font-semibold w-20">Rating</th>
              <th scope="col" className="py-3 px-4 font-semibold">Comment</th>
              <th scope="col" className="py-3 px-4 font-semibold w-28">Sentiment</th>
              <th scope="col" className="py-3 px-4 font-semibold w-32">Category</th>
              <th scope="col" className="py-3 px-4 font-semibold w-24">Status</th>
              <th scope="col" className="py-3 px-4 font-semibold w-16 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {records.map((item) => {
              const isAnon = Boolean(item.Is_Anonymous);
              const respondentDisplay = isAnon
                ? 'Anonymous'
                : item.Respondent_Name || 'Verified User';

              const hasRating =
                typeof item.Rating === 'number' && item.Rating >= 1 && item.Rating <= 5;

              const isPending =
                !(item.Sentiment && item.Sentiment.trim() !== '') ||
                (item.Processing_Status || '').toLowerCase() === 'pending';

              return (
                <tr
                  key={item.Response_ID}
                  onClick={() => onSelectRecord(item)}
                  className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors cursor-pointer group"
                >
                  {/* Timestamp */}
                  <td className="py-3 px-4 font-mono text-muted whitespace-nowrap text-[11px] align-top">
                    {item.Timestamp ? formatDate(item.Timestamp) : '—'}
                  </td>

                  {/* Product */}
                  <td className="py-3 px-4 text-primary font-medium align-top">
                    <div className="truncate max-w-[130px]" title={item.Product_Name}>
                      {item.Product_Name}
                    </div>
                    {item.Product_ID && (
                      <span className="text-[10px] font-mono text-muted/70 block truncate">
                        {item.Product_ID}
                      </span>
                    )}
                  </td>

                  {/* Respondent (Anonymous protected) */}
                  <td className="py-3 px-4 align-top whitespace-nowrap">
                    {isAnon ? (
                      <span className="italic text-muted/70 text-[11px]">
                        Anonymous
                      </span>
                    ) : (
                      <span className="text-primary text-[11px] truncate max-w-[120px] block font-medium" title={item.Respondent_Name}>
                        {respondentDisplay}
                      </span>
                    )}
                  </td>

                  {/* Rating */}
                  <td className="py-3 px-4 align-top whitespace-nowrap">
                    {hasRating ? (
                      <span className="font-mono font-semibold text-amber-500 flex items-center gap-1">
                        {item.Rating}.0 <Star className="w-3 h-3 fill-amber-500" />
                      </span>
                    ) : (
                      <span className="text-muted/60 font-mono text-[11px]">N/A</span>
                    )}
                  </td>

                  {/* Comment preview */}
                  <td className="py-3 px-4 align-top max-w-xs">
                    <p className="text-primary text-[11px] leading-relaxed line-clamp-2">
                      &ldquo;{item.Comment}&rdquo;
                    </p>
                    {item.Summary && (
                      <p className="text-[10px] text-muted italic line-clamp-1 pt-0.5">
                        {item.Summary}
                      </p>
                    )}
                  </td>

                  {/* Sentiment */}
                  <td className="py-3 px-4 align-top whitespace-nowrap">
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

                  {/* Category */}
                  <td className="py-3 px-4 align-top whitespace-nowrap">
                    {item.Category && item.Category.trim() !== '' ? (
                      <span className="text-[11px] text-primary font-medium truncate max-w-[120px] block" title={item.Category}>
                        {item.Category}
                      </span>
                    ) : (
                      <span className="text-[11px] text-muted/60 italic font-mono">
                        {isPending ? 'Pending Analysis' : '—'}
                      </span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="py-3 px-4 align-top whitespace-nowrap">
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-md font-medium border ${
                        (item.Processing_Status || '').toLowerCase() === 'analyzed'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-muted border-border'
                      }`}
                    >
                      {item.Processing_Status || (isPending ? 'Pending' : 'Analyzed')}
                    </span>
                  </td>

                  {/* Action inspect */}
                  <td className="py-3 px-4 align-top text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectRecord(item);
                      }}
                      className="p-1.5 rounded-lg text-muted hover:text-primary hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors inline-flex items-center"
                      title="Inspect record details"
                      aria-label={`Inspect feedback record ${item.Response_ID}`}
                    >
                      <ChevronRight className="w-4 h-4 text-muted group-hover:text-primary transition-colors" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
