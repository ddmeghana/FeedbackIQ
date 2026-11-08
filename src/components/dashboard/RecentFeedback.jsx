import { Link } from 'react-router-dom';
import { ArrowRight, User, Star } from 'lucide-react';
import Badge from '../ui/Badge';
import { formatDate, truncate } from '../../lib/utils';
import { ROUTES } from '../../config/constants';

export default function RecentFeedback({ records = [] }) {
  const recentItems = records.slice(0, 5);

  const getSentimentVariant = (sentiment) => {
    const s = (sentiment || '').toLowerCase();
    if (s === 'positive') return 'positive';
    if (s === 'negative') return 'negative';
    if (s === 'neutral') return 'neutral';
    if (s === 'mixed') return 'mixed';
    return 'default';
  };

  return (
    <div className="surface-card rounded-2xl p-5 border border-border space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border/80">
        <div>
          <h3 className="text-base font-bold text-primary">Recent Feedback Responses</h3>
          <p className="text-xs text-muted">
            Latest customer submissions matching active filters
          </p>
        </div>
        <Link
          to={ROUTES.FEEDBACK_HISTORY}
          className="text-xs text-accent hover:underline flex items-center gap-1 font-medium shrink-0"
        >
          View All Feedback <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {recentItems.length === 0 ? (
        <div className="py-8 text-center text-xs text-muted">
          No feedback entries found for this product and date range.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border/60 text-muted font-mono uppercase text-[10px]">
                <th scope="col" className="pb-2.5 font-semibold">Date</th>
                <th scope="col" className="pb-2.5 font-semibold">Product</th>
                <th scope="col" className="pb-2.5 font-semibold">Respondent</th>
                <th scope="col" className="pb-2.5 font-semibold">Rating</th>
                <th scope="col" className="pb-2.5 font-semibold">Sentiment</th>
                <th scope="col" className="pb-2.5 font-semibold">Category</th>
                <th scope="col" className="pb-2.5 font-semibold">Comment & Summary</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {recentItems.map((item) => (
                <tr
                  key={item.Response_ID}
                  className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors"
                >
                  <td className="py-3 font-mono text-muted whitespace-nowrap">
                    {formatDate(item.Timestamp)}
                  </td>
                  <td className="py-3 font-medium text-primary whitespace-nowrap">
                    {item.Product_Name}
                  </td>
                  <td className="py-3 text-muted whitespace-nowrap">
                    {item.Is_Anonymous ? (
                      <span className="italic text-zinc-400 dark:text-zinc-500">
                        Anonymous
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-primary">
                        <User className="w-3 h-3 text-muted" />
                        {item.Respondent_Name || 'Anonymous'}
                      </span>
                    )}
                  </td>
                  <td className="py-3 whitespace-nowrap">
                    <span className="flex items-center gap-1 text-amber-400 font-mono">
                      <Star className="w-3 h-3 fill-amber-400" />
                      <span>{item.Rating}/5</span>
                    </span>
                  </td>
                  <td className="py-3 whitespace-nowrap">
                    <Badge variant={getSentimentVariant(item.Sentiment)} dot size="sm">
                      {item.Sentiment}
                    </Badge>
                  </td>
                  <td className="py-3 whitespace-nowrap">
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-muted">
                      {item.Category}
                    </span>
                  </td>
                  <td className="py-3 max-w-xs sm:max-w-md">
                    <p className="text-primary truncate font-medium">
                      &ldquo;{truncate(item.Comment, 65)}&rdquo;
                    </p>
                    {item.Summary && (
                      <p className="text-[11px] text-muted truncate mt-0.5">
                        <span className="text-accent font-semibold">AI:</span> {truncate(item.Summary, 70)}
                      </p>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
