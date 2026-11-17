import { useState, useEffect, useMemo, useCallback } from 'react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import DashboardStatus from '../components/dashboard/DashboardStatus';
import { ROUTES } from '../config/constants';
import { useDashboardData } from '../hooks/useDashboardData';
import { clearSession } from '../services/adminAuthService';
import { filterFeedback } from '../data/mockDashboardData';

import FeedbackHistoryHeader from '../components/history/FeedbackHistoryHeader';
import FeedbackHistoryFilters from '../components/history/FeedbackHistoryFilters';
import FeedbackHistoryTable from '../components/history/FeedbackHistoryTable';
import FeedbackPagination from '../components/history/FeedbackPagination';
import FeedbackDetailModal from '../components/history/FeedbackDetailModal';

export default function FeedbackHistoryPage() {
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
  } = useDashboardData('ALL', '30d');

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [sentimentFilter, setSentimentFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [ratingFilter, setRatingFilter] = useState('ALL');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  // Detail Modal inspection state
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Session expired redirect
  const handleSessionExpired = useCallback(() => {
    clearSession();
    window.location.href = ROUTES.ADMIN_LOGIN;
  }, []);

  // 1. Initial product and date range scope
  const scopedRecords = useMemo(() => {
    return filterFeedback(allRecords, selectedProduct, dateRange);
  }, [allRecords, selectedProduct, dateRange]);

  // 2. Dynamically extract distinct feedback categories from live data
  const availableCategories = useMemo(() => {
    const catSet = new Set();
    allRecords.forEach((item) => {
      if (item.Category && typeof item.Category === 'string' && item.Category.trim()) {
        catSet.add(item.Category.trim());
      }
    });
    return Array.from(catSet).sort((a, b) => a.localeCompare(b));
  }, [allRecords]);

  // 3. Composite Filtering: Search, Sentiment, Category, Processing Status, Rating
  const filteredRecords = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return scopedRecords.filter((item) => {
      // (a) Full-Text Search: Comments, Response IDs, and Non-Anonymous Respondent Name
      if (query) {
        const commentMatch = (item.Comment || '').toLowerCase().includes(query);
        const idMatch = (item.Response_ID || '').toLowerCase().includes(query);

        // Strict Anonymity: never search real respondent names of anonymous records
        const isAnon = Boolean(item.Is_Anonymous);
        let respondentMatch = false;
        if (isAnon) {
          respondentMatch = 'anonymous'.includes(query);
        } else {
          respondentMatch = (item.Respondent_Name || '').toLowerCase().includes(query);
        }

        if (!commentMatch && !idMatch && !respondentMatch) {
          return false;
        }
      }

      // (b) Sentiment Filter
      if (sentimentFilter !== 'ALL') {
        const rawSentiment = (item.Sentiment || '').trim().toLowerCase();
        const isPending =
          !rawSentiment || (item.Processing_Status || '').toLowerCase() === 'pending';

        if (sentimentFilter === 'Pending') {
          if (!isPending) return false;
        } else {
          if (isPending || rawSentiment !== sentimentFilter.toLowerCase()) {
            return false;
          }
        }
      }

      // (c) Category Filter
      if (categoryFilter !== 'ALL') {
        const cat = (item.Category || '').trim().toLowerCase();
        if (cat !== categoryFilter.toLowerCase()) {
          return false;
        }
      }

      // (d) Processing Status Filter
      if (statusFilter !== 'ALL') {
        const rawStatus = (item.Processing_Status || '').toLowerCase();
        const isPending =
          !(item.Sentiment && item.Sentiment.trim() !== '') || rawStatus === 'pending';

        if (statusFilter === 'Pending') {
          if (!isPending) return false;
        } else if (statusFilter === 'Analyzed') {
          if (isPending) return false;
        }
      }

      // (e) Rating Filter
      if (ratingFilter !== 'ALL') {
        const numRating = Number(item.Rating);
        const isUnrated =
          item.Rating === null ||
          item.Rating === undefined ||
          item.Rating === '' ||
          isNaN(numRating) ||
          numRating < 1 ||
          numRating > 5;

        if (ratingFilter === 'unrated') {
          if (!isUnrated) return false;
        } else {
          if (isUnrated || Math.round(numRating) !== Number(ratingFilter)) {
            return false;
          }
        }
      }

      return true;
    });
  }, [scopedRecords, searchQuery, sentimentFilter, categoryFilter, statusFilter, ratingFilter]);

  // 4. Sort Descending by Timestamp (Newest feedback first)
  const sortedRecords = useMemo(() => {
    return [...filteredRecords].sort((a, b) => {
      const timeA = a.Timestamp ? new Date(a.Timestamp).getTime() : 0;
      const timeB = b.Timestamp ? new Date(b.Timestamp).getTime() : 0;
      return timeB - timeA;
    });
  }, [filteredRecords]);

  // 5. Reset to page 1 whenever search, filters, or pagination page size changes
  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchQuery,
    sentimentFilter,
    categoryFilter,
    statusFilter,
    ratingFilter,
    selectedProduct,
    dateRange,
    pageSize,
  ]);

  // 6. Pagination Slice
  const totalPages = Math.max(1, Math.ceil(sortedRecords.length / pageSize));
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedRecords.slice(start, start + pageSize);
  }, [sortedRecords, currentPage, pageSize]);

  // 7. Active Page Filter Count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchQuery.trim()) count++;
    if (sentimentFilter !== 'ALL') count++;
    if (categoryFilter !== 'ALL') count++;
    if (statusFilter !== 'ALL') count++;
    if (ratingFilter !== 'ALL') count++;
    return count;
  }, [searchQuery, sentimentFilter, categoryFilter, statusFilter, ratingFilter]);

  // Clear page-level filters
  const handleClearFilters = useCallback(() => {
    setSearchQuery('');
    setSentimentFilter('ALL');
    setCategoryFilter('ALL');
    setStatusFilter('ALL');
    setRatingFilter('ALL');
    setCurrentPage(1);
  }, []);

  // Modal inspection handlers
  const handleOpenModal = useCallback((record) => {
    setSelectedRecord(record);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedRecord(null);
  }, []);

  // Labels for scope bar
  const selectedProductName = useMemo(() => {
    if (!selectedProduct || selectedProduct === 'ALL') return 'All Products';
    const match = products.find((p) => p.Product_ID === selectedProduct);
    return match ? match.Product_Name : selectedProduct;
  }, [products, selectedProduct]);

  const dateLabels = {
    '7d': 'Last 7 Days',
    '30d': 'Last 30 Days',
    '90d': 'Last 90 Days',
    all: 'All Time',
  };
  const dateRangeLabel = dateLabels[dateRange] || 'Last 30 Days';

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
      onSelectProduct={setSelectedProduct}
      dateRange={dateRange}
      onSelectDateRange={setDateRange}
      pageTitle="Feedback History"
      showProductSelector={true}
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

      {/* ─── Ready State: History Explorer ───────────────────────────────────── */}
      {status === 'ready' && (
        <div className="space-y-5">
          {/* Top Scope & Refresh Header */}
          <FeedbackHistoryHeader
            totalMatching={filteredRecords.length}
            totalRecords={scopedRecords.length}
            activeFiltersCount={activeFiltersCount}
            onResetFilters={handleClearFilters}
            lastRefreshed={lastRefreshed}
            onRefresh={refresh}
            loading={loading}
            selectedProductName={selectedProductName}
            dateRangeLabel={dateRangeLabel}
          />

          {/* Search & Filter Bar */}
          <FeedbackHistoryFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            sentimentFilter={sentimentFilter}
            onSentimentChange={setSentimentFilter}
            categoryFilter={categoryFilter}
            onCategoryChange={setCategoryFilter}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            ratingFilter={ratingFilter}
            onRatingChange={setRatingFilter}
            categories={availableCategories}
            onClearFilters={handleClearFilters}
            isFiltered={activeFiltersCount > 0}
          />

          {/* Records Table */}
          <FeedbackHistoryTable
            records={paginatedRecords}
            onSelectRecord={handleOpenModal}
          />

          {/* Pagination Controls */}
          {filteredRecords.length > 0 && (
            <FeedbackPagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredRecords.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
            />
          )}

          {/* Detail Inspection Modal */}
          <FeedbackDetailModal
            feedback={selectedRecord}
            isOpen={isModalOpen}
            onClose={handleCloseModal}
          />
        </div>
      )}
    </DashboardLayout>
  );
}
