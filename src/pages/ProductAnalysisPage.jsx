import { useEffect, useMemo, useCallback } from 'react';
import { Layers, ArrowLeft, PackagePlus, Upload } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import DashboardStatus from '../components/dashboard/DashboardStatus';
import Button from '../components/ui/Button';
import { ROUTES } from '../config/constants';
import { useDashboardData } from '../hooks/useDashboardData';
import { clearSession } from '../services/adminAuthService';

import ProductHeader from '../components/analysis/ProductHeader';
import ProductKPIGrid from '../components/analysis/ProductKPIGrid';
import SentimentBreakdown from '../components/analysis/SentimentBreakdown';
import CategoryBreakdown from '../components/analysis/CategoryBreakdown';
import RatingAnalysis from '../components/analysis/RatingAnalysis';
import CustomerFeedbackTable from '../components/analysis/CustomerFeedbackTable';

export default function ProductAnalysisPage() {
  const [searchParams] = useSearchParams();
  const urlProduct = searchParams.get('product');

  const {
    products,
    allRecords,
    selectedProduct,
    setSelectedProduct,
    dateRange,
    setDateRange,
    loading,
    error,
    sessionExpired,
    lastRefreshed,
    refresh,
  } = useDashboardData('', '30d');

  // Filter only active products
  const activeProducts = useMemo(() => {
    return products.filter((p) => p.Status !== 'Inactive');
  }, [products]);

  // Handle URL query parameter when navigating from AI Insights
  useEffect(() => {
    if (urlProduct && products.length > 0) {
      const match = products.find(
        (p) =>
          p.Product_ID === urlProduct ||
          p.Product_Name.toLowerCase() === urlProduct.toLowerCase()
      );
      if (match) {
        setSelectedProduct(match.Product_ID);
      }
    }
  }, [urlProduct, products, setSelectedProduct]);

  // Ensure a specific product is selected for deep analysis (default to first active product)
  useEffect(() => {
    if (activeProducts.length > 0) {
      if (!selectedProduct || selectedProduct === 'ALL') {
        // If urlProduct was given, prioritize it, otherwise first active product
        const urlMatch = urlProduct && activeProducts.find(
          (p) => p.Product_ID === urlProduct || p.Product_Name.toLowerCase() === urlProduct.toLowerCase()
        );
        setSelectedProduct(urlMatch ? urlMatch.Product_ID : activeProducts[0].Product_ID);
      } else {
        // If current selectedProduct is not found in activeProducts, select the first one
        const exists = activeProducts.some((p) => p.Product_ID === selectedProduct);
        if (!exists) {
          setSelectedProduct(activeProducts[0].Product_ID);
        }
      }
    }
  }, [activeProducts, selectedProduct, setSelectedProduct, urlProduct]);

  // Resolve current product details
  const currentProductDetails = useMemo(() => {
    return (
      activeProducts.find((p) => p.Product_ID === selectedProduct) ||
      products.find((p) => p.Product_ID === selectedProduct) ||
      null
    );
  }, [activeProducts, products, selectedProduct]);

  // Filter feedback records strictly for the selected product and date range
  const productRecords = useMemo(() => {
    if (!selectedProduct || selectedProduct === 'ALL' || !currentProductDetails) {
      return [];
    }

    const prodId = currentProductDetails.Product_ID;
    const prodName = (currentProductDetails.Product_Name || '').trim().toLowerCase();

    // 1. Product Match (Product_ID or Product_Name)
    const matched = allRecords.filter((r) => {
      if (r.Product_ID && r.Product_ID.trim() === prodId) return true;
      if (r.Product_Name && r.Product_Name.trim().toLowerCase() === prodName) return true;
      return false;
    });

    // 2. Date Filter Match
    const now = new Date();
    let cutoffDate = null;
    if (dateRange === '7d') {
      cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (dateRange === '30d') {
      cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else if (dateRange === '90d') {
      cutoffDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    }

    if (!cutoffDate) return matched;

    return matched.filter((item) => {
      if (!item.Timestamp) return false;
      const itemDate = new Date(item.Timestamp);
      return !isNaN(itemDate.getTime()) && itemDate >= cutoffDate;
    });
  }, [allRecords, selectedProduct, currentProductDetails, dateRange]);

  // ─── Metrics Calculations (Guaranteed Data Integrity) ───────────────────────

  // 1. Total and Analysis Pipeline Health
  const totalResponses = productRecords.length;

  const analyzedRecords = useMemo(() => {
    return productRecords.filter((r) => {
      const status = (r.Processing_Status || '').trim().toLowerCase();
      if (status === 'failed' || status === 'error') return false;
      const sentiment = (r.Sentiment || '').trim();
      return status === 'analyzed' || (status === '' && sentiment !== '');
    });
  }, [productRecords]);

  const pendingRecords = useMemo(() => {
    return productRecords.filter((r) => {
      const status = (r.Processing_Status || '').trim().toLowerCase();
      if (status === 'failed' || status === 'error') return false;
      const sentiment = (r.Sentiment || '').trim();
      return status === 'pending' || status === 'processing' || (status === '' && sentiment === '');
    });
  }, [productRecords]);

  const analyzedCount = analyzedRecords.length;
  const pendingCount = pendingRecords.length;

  // 2. Average Rating (Exclude blank, invalid, or out-of-range ratings)
  const validRatingRecords = useMemo(() => {
    return productRecords.filter((r) => {
      const num = Number(r.Rating);
      return !isNaN(num) && num >= 1 && num <= 5;
    });
  }, [productRecords]);

  const validRatingCount = validRatingRecords.length;
  const averageRating = useMemo(() => {
    if (validRatingCount === 0) return 'N/A';
    const sum = validRatingRecords.reduce((acc, curr) => acc + Number(curr.Rating), 0);
    return (sum / validRatingCount).toFixed(1);
  }, [validRatingRecords, validRatingCount]);

  // 3. Sentiment Counts and Percentages (Calculated strictly over analyzed population with valid sentiment)
  const positiveRecords = useMemo(() => {
    return analyzedRecords.filter((r) => (r.Sentiment || '').trim().toLowerCase() === 'positive');
  }, [analyzedRecords]);

  const neutralRecords = useMemo(() => {
    return analyzedRecords.filter((r) => (r.Sentiment || '').trim().toLowerCase() === 'neutral');
  }, [analyzedRecords]);

  const negativeRecords = useMemo(() => {
    return analyzedRecords.filter((r) => (r.Sentiment || '').trim().toLowerCase() === 'negative');
  }, [analyzedRecords]);

  const mixedRecords = useMemo(() => {
    return analyzedRecords.filter((r) => (r.Sentiment || '').trim().toLowerCase() === 'mixed');
  }, [analyzedRecords]);

  const validSentimentCount = useMemo(() => {
    return analyzedRecords.filter((r) => (r.Sentiment || '').trim() !== '').length;
  }, [analyzedRecords]);

  const positiveCount = positiveRecords.length;
  const neutralCount = neutralRecords.length;
  const negativeCount = negativeRecords.length;

  const positivePct = validSentimentCount > 0 ? Math.round((positiveCount / validSentimentCount) * 100) : 0;
  const neutralPct = validSentimentCount > 0 ? Math.round((neutralCount / validSentimentCount) * 100) : 0;
  const negativePct = validSentimentCount > 0 ? Math.round((negativeCount / validSentimentCount) * 100) : 0;
  const mixedPct = validSentimentCount > 0 ? Math.round((mixedRecords.length / validSentimentCount) * 100) : 0;

  const sentimentData = useMemo(() => {
    return [
      { name: 'Positive', count: positiveCount, pct: positivePct, color: '#10B981' },
      { name: 'Neutral',  count: neutralCount,  pct: neutralPct,  color: '#F59E0B' },
      { name: 'Negative', count: negativeCount, pct: negativePct, color: '#EF4444' },
      ...(mixedRecords.length > 0
        ? [{ name: 'Mixed', count: mixedRecords.length, pct: mixedPct, color: '#8B5CF6' }]
        : []),
    ].filter((item) => item.count > 0);
  }, [positiveCount, positivePct, neutralCount, neutralPct, negativeCount, negativePct, mixedRecords, mixedPct]);

  // 4. Category Breakdown (Real categories only; safely excludes blank & pending)
  const { categoryData, totalCategorized } = useMemo(() => {
    const map = {};
    productRecords.forEach((r) => {
      const cat = (r.Category || '').trim();
      if (
        !cat ||
        cat.toLowerCase() === 'pending analysis' ||
        cat.toLowerCase() === 'pending' ||
        cat === '—' ||
        cat === '-'
      ) {
        return;
      }
      map[cat] = (map[cat] || 0) + 1;
    });

    const total = Object.values(map).reduce((sum, count) => sum + count, 0);

    const list = Object.entries(map)
      .map(([category, count]) => ({
        category,
        count,
        pct: total > 0 ? Math.round((count / total) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);

    return { categoryData: list, totalCategorized: total };
  }, [productRecords]);

  // 5. Ratings Breakdown (1 to 5 stars)
  const ratingData = useMemo(() => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    productRecords.forEach((r) => {
      const num = Number(r.Rating);
      if (!isNaN(num) && num >= 1 && num <= 5) {
        counts[num]++;
      }
    });

    return [5, 4, 3, 2, 1].map((stars) => ({
      stars: `${stars} ★`,
      starValue: stars,
      count: counts[stars],
      pct: validRatingCount > 0 ? Math.round((counts[stars] / validRatingCount) * 100) : 0,
    }));
  }, [productRecords, validRatingCount]);

  // Handle session expired
  const handleSessionExpired = useCallback(() => {
    clearSession();
    window.location.reload();
  }, []);

  // Determine top-level layout status
  const getStatus = () => {
    if (loading) return 'loading';
    if (sessionExpired) return 'sessionExpired';
    if (error) return 'error';
    return 'ready';
  };

  const status = getStatus();

  return (
    <DashboardLayout
      products={products}
      selectedProduct={selectedProduct}
      onSelectProduct={setSelectedProduct}
      dateRange={dateRange}
      onSelectDateRange={setDateRange}
      pageTitle="Product Analysis"
      showProductSelector={false}
    >
      {/* ─── Loading / Session Expired / API Error States ─────────────────────── */}
      {status !== 'ready' && (
        <DashboardStatus
          status={status}
          error={error}
          onRetry={refresh}
          onSessionExpired={handleSessionExpired}
        />
      )}

      {/* ─── Ready State ─────────────────────────────────────────────────────── */}
      {status === 'ready' && (
        <div className="space-y-6">
          {/* Edge Case 1: Zero products exist in registry */}
          {products.length === 0 ? (
            <div className="surface-card rounded-2xl p-12 border border-border text-center max-w-md mx-auto my-8 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-accent flex items-center justify-center mx-auto">
                <PackagePlus className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-primary">No Products Registered</h3>
                <p className="text-xs text-muted leading-relaxed">
                  Your organization does not have any products registered in the Products sheet. Add
                  products first to unlock dedicated analysis.
                </p>
              </div>
              <div className="pt-2">
                <Link to={ROUTES.PRODUCTS}>
                  <Button size="md" variant="primary" leftIcon={<PackagePlus className="w-4 h-4" />}>
                    Go to Manage Products
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Product Header & Selector */}
              <ProductHeader
                products={products}
                selectedProductId={selectedProduct}
                onSelectProduct={setSelectedProduct}
                selectedProduct={currentProductDetails}
                dateRange={dateRange}
                onSelectDateRange={setDateRange}
                lastRefreshed={lastRefreshed}
                onRefresh={refresh}
                loading={loading}
              />

              {/* Edge Case 2: Zero feedback records for this product */}
              {totalResponses === 0 ? (
                <div className="surface-card rounded-2xl p-10 border border-border text-center max-w-lg mx-auto my-6 space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-muted flex items-center justify-center mx-auto">
                    <Layers className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-primary">
                      No Feedback for {currentProductDetails?.Product_Name || 'this product'}
                    </h3>
                    <p className="text-xs text-muted leading-relaxed">
                      No feedback entries were found for this product matching the active date filter ({dateRange}).
                      Try switching to &ldquo;All Time&rdquo; or import feedback using Excel or CSV.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                    <Button size="sm" variant="secondary" onClick={() => setDateRange('all')}>
                      View All Time
                    </Button>
                    <Link to={ROUTES.IMPORT}>
                      <Button size="sm" variant="primary" leftIcon={<Upload className="w-3.5 h-3.5" />}>
                        Import Feedback
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <>
                  {/* 1. Overview Metric KPIs */}
                  <ProductKPIGrid
                    totalResponses={totalResponses}
                    averageRating={averageRating}
                    validRatingCount={validRatingCount}
                    positiveCount={positiveCount}
                    positivePct={positivePct}
                    neutralCount={neutralCount}
                    neutralPct={neutralPct}
                    negativeCount={negativeCount}
                    negativePct={negativePct}
                    analyzedCount={analyzedCount}
                    pendingCount={pendingCount}
                  />

                  {/* 2. Visual Deep-Dive Charts Grid (Sentiment, Category, Rating) */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Sentiment Analysis Donut & Bars */}
                    <SentimentBreakdown
                      sentimentData={sentimentData}
                      analyzedCount={analyzedCount}
                      pendingCount={pendingCount}
                    />

                    {/* Category Distribution Bar Chart & List */}
                    <CategoryBreakdown
                      categoryData={categoryData}
                      totalCategorized={totalCategorized}
                    />

                    {/* Rating Breakdown (1–5 Stars) */}
                    <RatingAnalysis
                      ratingData={ratingData}
                      averageRating={averageRating}
                      validRatingCount={validRatingCount}
                    />
                  </div>

                  {/* 3. Customer Feedback Records Table (Filterable, Searchable, Expandable with Stored AI Details) */}
                  <CustomerFeedbackTable
                    records={productRecords}
                    productName={currentProductDetails?.Product_Name || 'Product'}
                  />
                </>
              )}
            </>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
