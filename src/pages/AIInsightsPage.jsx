import { useState, useEffect, useMemo, useCallback } from 'react';
import { Layers, ArrowRight, BarChart2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import DashboardStatus from '../components/dashboard/DashboardStatus';
import Button from '../components/ui/Button';
import { ROUTES } from '../config/constants';
import { useDashboardData } from '../hooks/useDashboardData';
import { clearSession } from '../services/adminAuthService';
import { filterFeedback, calculateFeedbackTrend } from '../data/mockDashboardData';

import InsightsHeader from '../components/insights/InsightsHeader';
import InsightsKPIGrid from '../components/insights/InsightsKPIGrid';
import InsightsSentimentSection from '../components/insights/InsightsSentimentSection';
import InsightsCategorySection from '../components/insights/InsightsCategorySection';
import PraiseAndPainPoints from '../components/insights/PraiseAndPainPoints';
import ProductInsightsComparison from '../components/insights/ProductInsightsComparison';
import ActionableRecommendations from '../components/insights/ActionableRecommendations';
import AskFeedbackIQ from '../components/insights/AskFeedbackIQ';

export default function AIInsightsPage() {
  const {
    products,
    allRecords,
    datasetFingerprint,
    dateRange,
    setDateRange,
    loading,
    error,
    sessionExpired,
    lastRefreshed,
    refresh,
  } = useDashboardData('ALL', '30d');

  // Page-level dynamic product scope (defaults to 'ALL')
  const [selectedProduct, setSelectedProduct] = useState('ALL');

  // Handle session expiration
  const handleSessionExpired = useCallback(() => {
    clearSession();
    window.location.href = ROUTES.ADMIN_LOGIN;
  }, []);

  // Safe fallback: if selected product is removed from registry, revert to 'ALL'
  useEffect(() => {
    if (selectedProduct !== 'ALL' && products.length > 0) {
      const exists = products.some((p) => p.Product_ID === selectedProduct);
      if (!exists) {
        setSelectedProduct('ALL');
      }
    }
  }, [products, selectedProduct]);

  // 1. Scoped Records: dynamic composition of selectedProduct ('ALL' or ID) and dateRange
  const scopedRecords = useMemo(() => {
    return filterFeedback(allRecords, selectedProduct, dateRange);
  }, [allRecords, selectedProduct, dateRange]);

  // Count undated records in the complete database
  const undatedCount = useMemo(() => {
    return allRecords.filter(
      (r) => !r.Timestamp || isNaN(new Date(r.Timestamp).getTime())
    ).length;
  }, [allRecords]);

  // 2. Data Partitioning: Processing Status as Primary Source
  const {
    analyzedRecords,       // Analyzed with valid sentiment
    analyzedNoSentiment,   // Analyzed but blank sentiment
    pendingRecords,        // Explicitly Pending / Processing (or blank status + blank sentiment)
    failedRecords,         // Explicitly Failed / Error
    unknownStatusRecords,  // Unrecognized status
    positiveRecords,
    neutralRecords,
    negativeRecords,
    mixedRecords,
    otherSentimentRecords, // Unknown non-empty sentiment
  } = useMemo(() => {
    const analyzed = [];
    const noSentiment = [];
    const pending = [];
    const failed = [];
    const unknownStatus = [];
    const positive = [];
    const neutral = [];
    const negative = [];
    const mixed = [];
    const otherSentiment = [];

    scopedRecords.forEach((r) => {
      const rawSent = (r.Sentiment || '').trim();
      const sent = rawSent.toLowerCase();
      const rawStatus = (r.Processing_Status || '').trim();
      const status = rawStatus.toLowerCase();

      // Rule 1: Failed / Error status takes highest priority (even if sentiment was unexpectedly present)
      if (status === 'failed' || status === 'error') {
        failed.push(r);
        return;
      }

      // Rule 2: Explicitly Pending or Processing
      if (status === 'pending' || status === 'processing') {
        pending.push(r);
        return;
      }

      // Rule 3: Explicitly Analyzed
      if (status === 'analyzed') {
        if (rawSent) {
          analyzed.push(r);
          if (sent === 'positive') positive.push(r);
          else if (sent === 'neutral') neutral.push(r);
          else if (sent === 'negative') negative.push(r);
          else if (sent === 'mixed') mixed.push(r);
          else otherSentiment.push(r); // Unknown non-empty sentiment
        } else {
          // Analyzed by status but missing sentiment field
          noSentiment.push(r);
        }
        return;
      }

      // Rule 4: Missing Processing_Status
      if (rawStatus === '') {
        if (rawSent) {
          // Inferred as analyzed because AI output is already present
          analyzed.push(r);
          if (sent === 'positive') positive.push(r);
          else if (sent === 'neutral') neutral.push(r);
          else if (sent === 'negative') negative.push(r);
          else if (sent === 'mixed') mixed.push(r);
          else otherSentiment.push(r);
        } else {
          // Unclassified and unanalyzed -> Pending
          pending.push(r);
        }
        return;
      }

      // Rule 5: Unknown/unrecognized Processing_Status
      unknownStatus.push(r);
    });

    return {
      analyzedRecords: analyzed,
      analyzedNoSentiment: noSentiment,
      pendingRecords: pending,
      failedRecords: failed,
      unknownStatusRecords: unknownStatus,
      positiveRecords: positive,
      neutralRecords: neutral,
      negativeRecords: negative,
      mixedRecords: mixed,
      otherSentimentRecords: otherSentiment,
    };
  }, [scopedRecords]);

  // Total analyzed by status: includes analyzed with and without sentiment
  const totalAnalyzedCount = analyzedRecords.length + analyzedNoSentiment.length;
  // Denominator for sentiment percentages strictly uses analyzed records with valid sentiment
  const validSentimentAnalyzedCount = analyzedRecords.length;
  const pendingCount = pendingRecords.length;
  const failedCount = failedRecords.length;
  const unknownStatusCount = unknownStatusRecords.length;
  const totalResponses = scopedRecords.length;

  const positivePct =
    validSentimentAnalyzedCount > 0
      ? Math.round((positiveRecords.length / validSentimentAnalyzedCount) * 100)
      : null;
  const negativePct =
    validSentimentAnalyzedCount > 0
      ? Math.round((negativeRecords.length / validSentimentAnalyzedCount) * 100)
      : null;
  const neutralPct =
    validSentimentAnalyzedCount > 0
      ? Math.round((neutralRecords.length / validSentimentAnalyzedCount) * 100)
      : 0;
  const mixedPct =
    validSentimentAnalyzedCount > 0
      ? Math.round((mixedRecords.length / validSentimentAnalyzedCount) * 100)
      : 0;
  const otherPct =
    validSentimentAnalyzedCount > 0
      ? Math.round((otherSentimentRecords.length / validSentimentAnalyzedCount) * 100)
      : 0;

  // 4. Rating Calculation (Valid 1-5 numeric ratings only)
  const { averageRating, validRatingCount } = useMemo(() => {
    const valid = scopedRecords.filter(
      (r) =>
        typeof r.Rating === 'number' &&
        !isNaN(r.Rating) &&
        r.Rating >= 1 &&
        r.Rating <= 5
    );

    if (valid.length === 0) {
      return { averageRating: 'N/A', validRatingCount: 0 };
    }

    const sum = valid.reduce((acc, curr) => acc + Number(curr.Rating), 0);
    return {
      averageRating: (sum / valid.length).toFixed(1),
      validRatingCount: valid.length,
    };
  }, [scopedRecords]);

  // 5. Category Intelligence Calculation (Excluding blank or pending categories)
  const { categoryData, totalCategorized } = useMemo(() => {
    const map = {};
    let categorizedCount = 0;

    analyzedRecords.forEach((r) => {
      const rawCat = (r.Category || '').trim();
      if (!rawCat) return; // Do not count blank or pending as a real category

      categorizedCount++;
      if (!map[rawCat]) {
        map[rawCat] = {
          category: rawCat,
          total: 0,
          positive: 0,
          neutral: 0,
          negative: 0,
          mixed: 0,
          other: 0,
          ratings: [],
        };
      }

      const item = map[rawCat];
      item.total++;
      const s = (r.Sentiment || '').trim().toLowerCase();
      if (s === 'positive') item.positive++;
      else if (s === 'negative') item.negative++;
      else if (s === 'neutral') item.neutral++;
      else if (s === 'mixed') item.mixed++;
      else item.other++; // Unknown non-empty sentiment

      if (typeof r.Rating === 'number' && !isNaN(r.Rating) && r.Rating >= 1 && r.Rating <= 5) {
        item.ratings.push(r.Rating);
      }
    });

    const list = Object.values(map)
      .map((item) => {
        const pct = categorizedCount > 0 ? Math.round((item.total / categorizedCount) * 100) : 0;
        const posPct = item.total > 0 ? Math.round((item.positive / item.total) * 100) : 0;
        const negPct = item.total > 0 ? Math.round((item.negative / item.total) * 100) : 0;
        const avgRating =
          item.ratings.length > 0
            ? (item.ratings.reduce((a, b) => a + b, 0) / item.ratings.length).toFixed(1)
            : 'N/A';

        return {
          ...item,
          pct,
          posPct,
          negPct,
          avgRating,
        };
      })
      .sort((a, b) => b.total - a.total);

    return { categoryData: list, totalCategorized: categorizedCount };
  }, [analyzedRecords]);

  // 6. Chronological Activity Trend and Missing Timestamp count
  const { timelineData, missingTimestampCount } = useMemo(() => {
    let missing = 0;
    scopedRecords.forEach((r) => {
      if (!r.Timestamp || isNaN(new Date(r.Timestamp).getTime())) {
        missing++;
      }
    });

    return {
      timelineData: calculateFeedbackTrend(scopedRecords),
      missingTimestampCount: missing,
    };
  }, [scopedRecords]);

  // Date labels
  const dateLabels = {
    '7d': 'Last 7 Days',
    '30d': 'Last 30 Days',
    '90d': 'Last 90 Days',
    all: 'All Time',
  };
  const dateRangeLabel = dateLabels[dateRange] || 'Last 30 Days';

  // Current scope details
  const currentProductObj = products.find((p) => p.Product_ID === selectedProduct);
  const currentProductName = selectedProduct === 'ALL'
    ? 'All Products'
    : currentProductObj?.Product_Name || selectedProduct;

  // Overall page status
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
      dateRange={dateRange}
      onSelectDateRange={setDateRange}
      pageTitle="AI Insights"
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

      {/* ─── Ready State: Organization-Wide AI Insights Dashboard ────────────── */}
      {status === 'ready' && (
        <div className="space-y-6">
          {/* Section 1: Page Header with Interactive Dynamic Scope Selector */}
          <InsightsHeader
            totalResponses={totalResponses}
            analyzedCount={totalAnalyzedCount}
            pendingCount={pendingCount}
            failedCount={failedCount}
            unknownStatusCount={unknownStatusCount}
            undatedCount={undatedCount}
            dateRangeLabel={dateRangeLabel}
            isDateScoped={dateRange !== 'all'}
            lastRefreshed={lastRefreshed}
            onRefresh={refresh}
            loading={loading}
            products={products}
            selectedProduct={selectedProduct}
            onSelectProduct={setSelectedProduct}
          />

          {/* Section 2: Portfolio Performance KPIs */}
          <InsightsKPIGrid
            totalResponses={totalResponses}
            analyzedCount={totalAnalyzedCount}
            pendingCount={pendingCount}
            failedCount={failedCount}
            positivePct={positivePct}
            negativePct={negativePct}
            positiveCount={positiveRecords.length}
            negativeCount={negativeRecords.length}
            averageRating={averageRating}
            validRatingCount={validRatingCount}
          />

          {/* Section 3: Ask FeedbackIQ — Domain-Restricted Intelligence Assistant */}
          <AskFeedbackIQ
            products={products}
            allRecords={allRecords}
            scopedRecords={scopedRecords}
            selectedProduct={selectedProduct}
            dateRange={dateRange}
            dateRangeLabel={dateRangeLabel}
            datasetFingerprint={datasetFingerprint}
          />

          {/* Section 4 & 5: Sentiment Distribution & Feedback Activity Trend */}
          <InsightsSentimentSection
            analyzedCount={validSentimentAnalyzedCount}
            pendingCount={pendingCount}
            failedCount={failedCount}
            unknownStatusCount={unknownStatusCount}
            positiveCount={positiveRecords.length}
            positivePct={positivePct || 0}
            neutralCount={neutralRecords.length}
            neutralPct={neutralPct}
            negativeCount={negativeRecords.length}
            negativePct={negativePct || 0}
            mixedCount={mixedRecords.length}
            mixedPct={mixedPct}
            otherCount={otherSentimentRecords.length}
            otherPct={otherPct}
            timelineData={timelineData}
            missingTimestampCount={missingTimestampCount}
          />

          {/* Section 5: Organization-Wide Feedback Category Patterns */}
          <InsightsCategorySection
            categoryData={categoryData}
            totalCategorized={totalCategorized}
          />

          {/* Section 6: Cross-Product Performance Comparison (All Products Scope Only) */}
          {selectedProduct === 'ALL' ? (
            <ProductInsightsComparison
              products={products}
              feedbackRecords={scopedRecords}
              onSelectProduct={setSelectedProduct}
            />
          ) : (
            <div className="surface-card rounded-2xl p-6 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent/15 text-accent flex items-center justify-center shrink-0">
                  <BarChart2 className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-sm font-bold text-primary">
                    Cross-Product Comparison is Hidden for Single-Product Scope
                  </h4>
                  <p className="text-xs text-muted">
                    Currently filtering insights exclusively for <strong>{currentProductName}</strong>. Switch scope back to &ldquo;All Products&rdquo; to benchmark across your portfolio.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setSelectedProduct('ALL')}
                >
                  View All Products
                </Button>
                <Link to={`${ROUTES.PRODUCT_ANALYSIS}?product=${encodeURIComponent(selectedProduct)}`}>
                  <Button
                    size="sm"
                    variant="primary"
                    rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                  >
                    Open in Product Analysis
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* Section 7: Organization-Level Praise and Friction Patterns */}
          <PraiseAndPainPoints
            positiveRecords={positiveRecords}
            negativeRecords={negativeRecords}
          />

          {/* Section 8: Stored Suggested Actions */}
          <ActionableRecommendations
            analyzedRecords={analyzedRecords}
          />
        </div>
      )}
    </DashboardLayout>
  );
}
