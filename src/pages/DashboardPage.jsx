import DashboardLayout from '../components/dashboard/DashboardLayout';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import KPIGrid from '../components/dashboard/KPIGrid';
import SentimentChart from '../components/dashboard/SentimentChart';
import CategoryChart from '../components/dashboard/CategoryChart';
import FeedbackTrendChart from '../components/dashboard/FeedbackTrendChart';
import RatingDistributionChart from '../components/dashboard/RatingDistributionChart';
import RecentFeedback from '../components/dashboard/RecentFeedback';
import ProductComparison from '../components/dashboard/ProductComparison';
import { useDashboardFilters } from '../hooks/useDashboardFilters';

export default function DashboardPage() {
  const {
    products,
    selectedProduct,
    setSelectedProduct,
    selectedProductDetails,
    dateRange,
    setDateRange,
    filteredRecords,
    kpis,
    sentimentData,
    categoryData,
    trendData,
    ratingData,
    productComparison,
  } = useDashboardFilters('ALL', '30d');

  const dateLabels = {
    '7d': 'Last 7 Days',
    '30d': 'Last 30 Days',
    '90d': 'Last 90 Days',
    all: 'All Time',
  };

  const activeProductName = selectedProductDetails
    ? selectedProductDetails.Product_Name
    : 'All Products';

  return (
    <DashboardLayout
      products={products}
      selectedProduct={selectedProduct}
      onSelectProduct={setSelectedProduct}
      dateRange={dateRange}
      onSelectDateRange={setDateRange}
      pageTitle="Overview"
    >
      {/* 1. Header with Title & Context Badges */}
      <DashboardHeader
        productName={activeProductName}
        dateRangeLabel={dateLabels[dateRange] || 'Last 30 Days'}
        totalCount={kpis.totalFeedback}
      />

      {/* 2. Key Performance Indicators Grid (4 cards) */}
      <KPIGrid kpis={kpis} />

      {/* 3. Product Comparison Section (Shown only when 'All Products' is selected) */}
      {selectedProduct === 'ALL' && (
        <ProductComparison
          comparisonData={productComparison}
          onSelectProduct={setSelectedProduct}
        />
      )}

      {/* 4. Analytics & Visual Charts Grid (2 columns on desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SentimentChart data={sentimentData} />
        <CategoryChart data={categoryData} />
        <FeedbackTrendChart data={trendData} />
        <RatingDistributionChart data={ratingData} />
      </div>

      {/* 5. Recent Feedback Responses Table */}
      <RecentFeedback records={filteredRecords} />
    </DashboardLayout>
  );
}
