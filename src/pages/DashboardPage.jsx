import { useCallback } from 'react';
import { RefreshCw, Clock } from 'lucide-react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import DashboardStatus from '../components/dashboard/DashboardStatus';
import KPIGrid from '../components/dashboard/KPIGrid';
import SentimentChart from '../components/dashboard/SentimentChart';
import CategoryChart from '../components/dashboard/CategoryChart';
import FeedbackTrendChart from '../components/dashboard/FeedbackTrendChart';
import RatingDistributionChart from '../components/dashboard/RatingDistributionChart';
import RecentFeedback from '../components/dashboard/RecentFeedback';
import ProductComparison from '../components/dashboard/ProductComparison';
import { useDashboardData } from '../hooks/useDashboardData';
import { clearSession } from '../services/adminAuthService';

export default function DashboardPage() {
  const {
    products,
    filteredRecords,
    kpis,
    sentimentData,
    categoryData,
    trendData,
    ratingData,
    productComparison,
    selectedProduct,
    setSelectedProduct,
    selectedProductDetails,
    dateRange,
    setDateRange,
    loading,
    error,
    sessionExpired,
    lastRefreshed,
    refresh,
  } = useDashboardData('ALL', '30d');

  const dateLabels = {
    '7d': 'Last 7 Days',
    '30d': 'Last 30 Days',
    '90d': 'Last 90 Days',
    all: 'All Time',
  };

  const activeProductName = selectedProductDetails
    ? selectedProductDetails.Product_Name
    : 'All Products';

  // Determine the current dashboard status
  const getStatus = () => {
    if (loading) return 'loading';
    if (sessionExpired) return 'sessionExpired';
    if (error) return 'error';
    if (!loading && filteredRecords.length === 0) return 'empty';
    return 'ready';
  };

  const status = getStatus();

  // Handle session expiry: clear session so the auth guard shows login screen on next render
  const handleSessionExpired = useCallback(() => {
    clearSession();
    window.location.reload(); // Force RequireAdminAuth to re-evaluate
  }, []);

  return (
    <DashboardLayout
      products={products}
      selectedProduct={selectedProduct}
      onSelectProduct={setSelectedProduct}
      dateRange={dateRange}
      onSelectDateRange={setDateRange}
      pageTitle="Dashboard Overview"
    >
      {/* Data freshness bar */}
      {!loading && !error && lastRefreshed && (
        <div className="flex items-center justify-between gap-3 px-1">
          <div className="flex items-center gap-1.5 text-[11px] text-muted font-mono">
            <Clock className="w-3 h-3" aria-hidden="true" />
            <span>
              Last refreshed: {lastRefreshed.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
            <span className="text-muted/50">·</span>
            <span className="text-amber-500">Live data from Google Sheets</span>
          </div>
          <button
            type="button"
            onClick={refresh}
            className="flex items-center gap-1 text-[11px] font-medium text-muted hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent rounded px-1.5"
            aria-label="Refresh dashboard data"
          >
            <RefreshCw className="w-3 h-3" aria-hidden="true" />
            Refresh
          </button>
        </div>
      )}

      {/* Loading / Error / Empty / Session-expired states */}
      {status !== 'ready' && (
        <DashboardStatus
          status={status}
          error={error}
          onRetry={refresh}
          onSessionExpired={handleSessionExpired}
        />
      )}

      {/* Dashboard content — only shown when data is ready */}
      {status === 'ready' && (
        <>
          {/* 1. Header with Title & Context Badges */}
          <DashboardHeader
            productName={activeProductName}
            dateRangeLabel={dateLabels[dateRange] || 'Last 30 Days'}
            totalCount={kpis.totalFeedback}
          />

          {/* 2. Key Performance Indicators */}
          <KPIGrid kpis={kpis} />

          {/* 3. Product Comparison (All Products view only) */}
          {selectedProduct === 'ALL' && (
            <ProductComparison
              comparisonData={productComparison}
              onSelectProduct={setSelectedProduct}
            />
          )}

          {/* 4. Analytics Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SentimentChart data={sentimentData} />
            <CategoryChart data={categoryData} />
            <FeedbackTrendChart data={trendData} />
            <RatingDistributionChart data={ratingData} />
          </div>

          {/* 5. Recent Feedback Table */}
          <RecentFeedback records={filteredRecords} />
        </>
      )}
    </DashboardLayout>
  );
}
