import { Layers, Star, ArrowRight, ThumbsUp, ThumbsDown, Package, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';
import { ROUTES } from '../../config/constants';

export default function ProductInsightsComparison({
  products = [],
  feedbackRecords = [],
  onSelectProduct,
}) {
  if (products.length === 0) {
    return (
      <div className="surface-card rounded-2xl p-8 border border-border text-center space-y-2">
        <Package className="w-8 h-8 text-muted mx-auto" />
        <h3 className="text-sm font-bold text-primary">No Products Registered</h3>
        <p className="text-xs text-muted max-w-sm mx-auto">
          Add products in Manage Products to enable cross-product performance benchmarking.
        </p>
      </div>
    );
  }

  // Calculate dynamic metrics per product from the scoped feedbackRecords
  const productMetrics = products.map((prod) => {
    const prodId = (prod.Product_ID || '').trim();
    const prodName = (prod.Product_Name || '').trim().toLowerCase();

    // Match records using Product_ID as primary identifier, Product_Name as fallback
    const matched = feedbackRecords.filter((r) => {
      if (prodId && r.Product_ID && r.Product_ID.trim() === prodId) return true;
      if (prodName && r.Product_Name && r.Product_Name.trim().toLowerCase() === prodName) return true;
      return false;
    });

    const total = matched.length;

    // Classify records by Processing_Status primarily
    let analyzedCount = 0;
    let pendingCount = 0;
    let failedCount = 0;
    const analyzedWithSentiment = [];

    matched.forEach((r) => {
      const st = (r.Processing_Status || '').trim().toLowerCase();
      const rawSent = (r.Sentiment || '').trim();

      if (st === 'failed' || st === 'error') {
        failedCount++;
      } else if (st === 'pending' || st === 'processing') {
        pendingCount++;
      } else if (st === 'analyzed') {
        analyzedCount++;
        if (rawSent) analyzedWithSentiment.push(r);
      } else if (st === '') {
        if (rawSent) {
          analyzedCount++;
          analyzedWithSentiment.push(r);
        } else {
          pendingCount++;
        }
      } else {
        // Unknown status
        pendingCount++;
      }
    });

    // Average rating (valid 1-5 ratings only)
    const validRatings = matched.filter(
      (r) => typeof r.Rating === 'number' && !isNaN(r.Rating) && r.Rating >= 1 && r.Rating <= 5
    );
    const avgRating =
      validRatings.length > 0
        ? (validRatings.reduce((sum, r) => sum + Number(r.Rating), 0) / validRatings.length).toFixed(1)
        : 'N/A';

    // Sentiment percentages (denominator: analyzedWithSentiment.length)
    let positivePct = 'N/A';
    let negativePct = 'N/A';
    let positiveCount = 0;
    let negativeCount = 0;

    if (analyzedWithSentiment.length > 0) {
      positiveCount = analyzedWithSentiment.filter(
        (r) => (r.Sentiment || '').trim().toLowerCase() === 'positive'
      ).length;
      negativeCount = analyzedWithSentiment.filter(
        (r) => (r.Sentiment || '').trim().toLowerCase() === 'negative'
      ).length;

      positivePct = Math.round((positiveCount / analyzedWithSentiment.length) * 100);
      negativePct = Math.round((negativeCount / analyzedWithSentiment.length) * 100);
    }

    return {
      productId: prod.Product_ID,
      productName: prod.Product_Name || prod.Product_ID,
      category: prod.Category || 'General',
      status: prod.Status || 'Active',
      totalFeedback: total,
      analyzedCount,
      pendingCount,
      failedCount,
      averageRating: avgRating,
      positivePct,
      negativePct,
      positiveCount,
      negativeCount,
    };
  });

  return (
    <div className="surface-card rounded-2xl p-5 sm:p-6 border border-border space-y-4">
      {/* Table Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border/80">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-primary">Product-Wise Comparison</h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-accent/15 text-accent font-semibold uppercase">
              Registered Portfolio
            </span>
          </div>
          <p className="text-xs text-muted mt-0.5">
            Cross-product benchmarking comparing volume, rating quality, and analyzed sentiment ratios
          </p>
        </div>
        <span className="text-[11px] font-mono text-muted self-start sm:self-auto">
          {products.length} registered products
        </span>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-border/70 text-muted font-mono uppercase text-[10px] tracking-wider">
              <th scope="col" className="py-2.5 px-3 font-semibold">Product</th>
              <th scope="col" className="py-2.5 px-3 font-semibold text-center">Total Volume</th>
              <th scope="col" className="py-2.5 px-3 font-semibold text-center">Analyzed</th>
              <th scope="col" className="py-2.5 px-3 font-semibold text-center">Pending</th>
              <th scope="col" className="py-2.5 px-3 font-semibold text-center">Avg Rating</th>
              <th scope="col" className="py-2.5 px-3 font-semibold text-center">Positive %</th>
              <th scope="col" className="py-2.5 px-3 font-semibold text-center">Negative %</th>
              <th scope="col" className="py-2.5 px-3 font-semibold text-right">Deep-Dive</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {productMetrics.map((item) => (
              <tr
                key={item.productId}
                className="hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40 transition-colors"
              >
                {/* Product Name & ID */}
                <td className="py-3 px-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-accent/10 text-accent flex items-center justify-center shrink-0">
                      <Layers className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="font-bold text-primary block">{item.productName}</span>
                      <span className="text-[10px] font-mono text-muted">{item.productId}</span>
                    </div>
                  </div>
                </td>

                {/* Total Volume */}
                <td className="py-3 px-3 text-center">
                  <span
                    className={`font-mono font-semibold ${
                      item.totalFeedback > 0 ? 'text-primary' : 'text-muted'
                    }`}
                  >
                    {item.totalFeedback > 0 ? `${item.totalFeedback} entries` : '0'}
                  </span>
                </td>

                {/* Analyzed Count */}
                <td className="py-3 px-3 text-center">
                  <span className="font-mono text-muted text-[11px]">
                    {item.analyzedCount > 0 ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                        {item.analyzedCount}
                      </span>
                    ) : (
                      '—'
                    )}
                  </span>
                </td>

                {/* Pending Count */}
                <td className="py-3 px-3 text-center">
                  <span className="font-mono text-muted text-[11px]">
                    {item.pendingCount > 0 ? (
                      <span className="text-amber-500 font-medium">
                        {item.pendingCount}
                      </span>
                    ) : (
                      '0'
                    )}
                  </span>
                </td>

                {/* Avg Rating */}
                <td className="py-3 px-3 text-center">
                  {item.averageRating !== 'N/A' ? (
                    <span className="inline-flex items-center gap-1 font-mono text-amber-500 font-bold">
                      <Star className="w-3 h-3 fill-amber-500" />
                      <span>{item.averageRating}</span>
                    </span>
                  ) : (
                    <span className="font-mono text-muted text-[11px]">N/A</span>
                  )}
                </td>

                {/* Positive % */}
                <td className="py-3 px-3 text-center">
                  {item.positivePct !== 'N/A' ? (
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {item.positivePct}%
                    </span>
                  ) : (
                    <span className="font-mono text-muted text-[11px]">N/A</span>
                  )}
                </td>

                {/* Negative % */}
                <td className="py-3 px-3 text-center">
                  {item.negativePct !== 'N/A' ? (
                    <span className="font-mono font-bold text-red-600 dark:text-red-400">
                      {item.negativePct}%
                    </span>
                  ) : (
                    <span className="font-mono text-muted text-[11px]">N/A</span>
                  )}
                </td>

                {/* Deep-Dive Action */}
                <td className="py-3 px-3 text-right">
                  <Link
                    to={`${ROUTES.PRODUCT_ANALYSIS}?product=${encodeURIComponent(item.productId)}`}
                    onClick={() => onSelectProduct && onSelectProduct(item.productId)}
                  >
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-xs text-accent hover:text-accent font-medium gap-1 py-1"
                      title={`View ${item.productName} in Product Analysis`}
                    >
                      <span>Analyze</span>
                      <ArrowRight className="w-3 h-3" />
                    </Button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pt-2 text-[10px] font-mono text-muted flex items-center justify-between">
        <span>* Volume indicates quantity; ratings and sentiment percentages reflect customer satisfaction.</span>
        <span>Empty products display N/A rather than fabricated values.</span>
      </div>
    </div>
  );
}
