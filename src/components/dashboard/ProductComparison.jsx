import { Star, ArrowRight, Layers } from 'lucide-react';
import Button from '../ui/Button';

export default function ProductComparison({ comparisonData = [], onSelectProduct }) {
  if (!comparisonData || comparisonData.length === 0) return null;

  return (
    <div className="surface-card rounded-2xl p-5 border border-border space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border/80">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-primary">Portfolio Comparison</h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-accent/15 text-accent font-semibold uppercase">
              All Products Scope
            </span>
          </div>
          <p className="text-xs text-muted">
            Benchmark feedback volume, ratings, and customer satisfaction across all managed products
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-border/60 text-muted font-mono uppercase text-[10px]">
              <th scope="col" className="pb-2.5 font-semibold">Product</th>
              <th scope="col" className="pb-2.5 font-semibold">Description</th>
              <th scope="col" className="pb-2.5 font-semibold text-center">Responses</th>
              <th scope="col" className="pb-2.5 font-semibold text-center">Avg Rating</th>
              <th scope="col" className="pb-2.5 font-semibold text-center">Positive %</th>
              <th scope="col" className="pb-2.5 font-semibold text-center">Negative %</th>
              <th scope="col" className="pb-2.5 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {comparisonData.map((item) => (
              <tr
                key={item.productId}
                className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors"
              >
                <td className="py-3.5 font-bold text-primary whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-accent/10 text-accent flex items-center justify-center shrink-0">
                      <Layers className="w-3.5 h-3.5" />
                    </div>
                    <span>{item.productName}</span>
                  </div>
                </td>
                <td className="py-3.5 text-muted max-w-xs truncate">
                  {item.description}
                </td>
                <td className="py-3.5 font-mono text-center text-primary font-semibold">
                  {item.totalFeedback}
                </td>
                <td className="py-3.5 text-center whitespace-nowrap">
                  <span className="inline-flex items-center gap-1 font-mono text-amber-400 font-semibold">
                    <Star className="w-3 h-3 fill-amber-400" />
                    <span>{item.averageRating}</span>
                  </span>
                </td>
                <td className="py-3.5 text-center font-mono text-emerald-500 font-semibold">
                  {item.positivePct}%
                </td>
                <td className="py-3.5 text-center font-mono text-red-500 font-semibold">
                  {item.negativePct}%
                </td>
                <td className="py-3.5 text-right whitespace-nowrap">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onSelectProduct(item.productId)}
                    className="text-xs text-accent hover:text-accent font-medium gap-1"
                  >
                    <span>View Product</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
