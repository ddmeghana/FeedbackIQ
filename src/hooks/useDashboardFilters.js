import { useState, useMemo } from 'react';
import {
  mockProducts,
  mockFeedbackRecords,
  filterFeedback,
  calculateKPIs,
  calculateSentimentDistribution,
  calculateCategoryDistribution,
  calculateFeedbackTrend,
  calculateRatingDistribution,
  calculateProductComparison,
} from '../data/mockDashboardData';

export function useDashboardFilters(initialProduct = 'ALL', initialDateRange = '30d') {
  const [selectedProduct, setSelectedProduct] = useState(initialProduct);
  const [dateRange, setDateRange] = useState(initialDateRange);

  // Products list (in Phase 9, this will be fetched from the Products sheet)
  const products = mockProducts;

  // Raw records (in Phase 9, this will be fetched from the Feedback sheet)
  const allRecords = mockFeedbackRecords;

  // Filtered dataset based on current selection
  const filteredRecords = useMemo(() => {
    return filterFeedback(allRecords, selectedProduct, dateRange);
  }, [allRecords, selectedProduct, dateRange]);

  // Derived metrics calculated strictly from filtered records
  const kpis = useMemo(() => calculateKPIs(filteredRecords), [filteredRecords]);

  const sentimentData = useMemo(
    () => calculateSentimentDistribution(filteredRecords),
    [filteredRecords]
  );

  const categoryData = useMemo(
    () => calculateCategoryDistribution(filteredRecords),
    [filteredRecords]
  );

  const trendData = useMemo(
    () => calculateFeedbackTrend(filteredRecords),
    [filteredRecords]
  );

  const ratingData = useMemo(
    () => calculateRatingDistribution(filteredRecords),
    [filteredRecords]
  );

  const productComparison = useMemo(() => {
    // Comparison metrics computed across date-filtered records
    const dateFiltered = filterFeedback(allRecords, 'ALL', dateRange);
    return calculateProductComparison(dateFiltered, products);
  }, [allRecords, products, dateRange]);

  const selectedProductDetails = useMemo(() => {
    if (selectedProduct === 'ALL') return null;
    return products.find((p) => p.Product_ID === selectedProduct) || null;
  }, [products, selectedProduct]);

  return {
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
  };
}
