import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { normalizeProduct } from '../services/productService';
import { fetchAdminFeedback, fetchAdminProducts } from '../services/adminDataService';
import { isAuthenticated } from '../services/adminAuthService';
import {
  filterFeedback,
  calculateKPIs,
  calculateSentimentDistribution,
  calculateCategoryDistribution,
  calculateFeedbackTrend,
  calculateRatingDistribution,
  calculateProductComparison,
} from '../data/mockDashboardData';

/**
 * useDashboardData — Replaces mock data dependency for authenticated admin dashboard.
 *
 * Fetches real feedback records and products from Google Sheets via Apps Script.
 * Uses pure calculation functions from mockDashboardData.js.
 * Provides loading, error, empty, and session-expired states.
 *
 * RELIABILITY:
 *   - Uses activeRequestIdRef to discard stale responses from overlapping refresh requests.
 *   - Does not perform unconditional session clearing after Promise.all(); relies on
 *     token-aware session management in adminDataService / adminAuthService.
 *   - Never silently falls back to mock data on API errors.
 *
 * @param {string} initialProduct  - 'ALL' or a Product_ID
 * @param {string} initialDateRange - '7d' | '30d' | '90d' | 'all'
 * @returns {Object} Dashboard state and filter controls
 */
export function useDashboardData(initialProduct = 'ALL', initialDateRange = '30d') {
  // Filter state
  const [selectedProduct, setSelectedProduct] = useState(initialProduct);
  const [dateRange, setDateRange] = useState(() => {
    try {
      if (initialDateRange !== '30d') return initialDateRange;
      const stored = localStorage.getItem('feedbackiq-default-period');
      return stored || initialDateRange;
    } catch {
      return initialDateRange;
    }
  });

  // Data state
  const [allRecords, setAllRecords] = useState([]);
  const [products, setProducts] = useState([]);

  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(null);

  // Request race-condition guard: tracks current request ID
  const activeRequestIdRef = useRef(0);

  /**
   * Fetches all data from the live API.
   */
  const loadData = useCallback(async () => {
    const requestId = ++activeRequestIdRef.current;

    setLoading(true);
    setError(null);
    setSessionExpired(false);

    try {
      // Fetch products and feedback in parallel
      const [productsResult, feedbackResult] = await Promise.all([
        fetchAdminProducts(),
        fetchAdminFeedback({}),
      ]);

      // If a newer request was dispatched while this was in-flight, discard this response
      if (requestId !== activeRequestIdRef.current) {
        return;
      }

      // Handle session expiry: adminDataService clears session only if token matches.
      // If user is no longer authenticated, update UI to show session-expired state.
      if (productsResult.sessionExpired || feedbackResult.sessionExpired) {
        if (!isAuthenticated()) {
          setSessionExpired(true);
        }
        setLoading(false);
        return;
      }

      if (!productsResult.success) {
        setError(productsResult.message || 'Failed to load product list.');
        setLoading(false);
        return;
      }

      if (!feedbackResult.success) {
        setError(feedbackResult.message || 'Failed to load feedback records.');
        setLoading(false);
        return;
      }

      // Normalize products from API (same schema as mockProducts)
      const normalizedProducts = (productsResult.data || []).map(normalizeProduct);
      setProducts(normalizedProducts);

      // Normalize feedback records (ensure correct types expected by calculation functions)
      const normalizedRecords = (feedbackResult.records || []).map(normalizeRecord);
      setAllRecords(normalizedRecords);
      setLastRefreshed(new Date());
    } catch (err) {
      if (requestId === activeRequestIdRef.current) {
        setError('An unexpected error occurred while loading dashboard data.');
      }
    }

    if (requestId === activeRequestIdRef.current) {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Safe fallback: If currently selected product is removed or replaced, revert to 'ALL'
  useEffect(() => {
    if (selectedProduct !== 'ALL' && products.length > 0) {
      const exists = products.some((p) => p.Product_ID === selectedProduct);
      if (!exists) {
        setSelectedProduct('ALL');
      }
    }
  }, [products, selectedProduct]);

  // Dataset Fingerprint for content-based change detection across dependent components.
  // Note: Volatile metadata (e.g. lastRefreshed timestamp) is intentionally excluded so normal
  // refreshes with identical data preserve interactive state such as Ask FeedbackIQ conversation.
  const datasetFingerprint = useMemo(() => {
    return computeDatasetFingerprint(products, allRecords);
  }, [products, allRecords]);

  // ─── Derived Data (pure calculation functions) ───────────────────────────

  const filteredRecords = useMemo(
    () => filterFeedback(allRecords, selectedProduct, dateRange),
    [allRecords, selectedProduct, dateRange]
  );

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
    const dateFiltered = filterFeedback(allRecords, 'ALL', dateRange);
    return calculateProductComparison(dateFiltered, products);
  }, [allRecords, products, dateRange]);

  const selectedProductDetails = useMemo(() => {
    if (selectedProduct === 'ALL') return null;
    return products.find((p) => p.Product_ID === selectedProduct) || null;
  }, [products, selectedProduct]);

  return {
    // Data
    products,
    allRecords,
    filteredRecords,
    datasetFingerprint,
    // Computed analytics
    kpis,
    sentimentData,
    categoryData,
    trendData,
    ratingData,
    productComparison,
    selectedProductDetails,
    // Filters
    selectedProduct,
    setSelectedProduct,
    dateRange,
    setDateRange,
    // Status
    loading,
    error,
    sessionExpired,
    lastRefreshed,
    // Actions
    refresh: loadData,
  };
}

/**
 * Normalizes a feedback record from the API into the shape expected by
 * the calculation functions.
 *
 * @param {Object} raw - Record as returned by AdminFeedback.gs
 * @returns {Object} Normalized record
 */
function normalizeRecord(raw) {
  let parsedRating = null;
  if (raw.Rating !== null && raw.Rating !== undefined && String(raw.Rating).trim() !== '') {
    const num = Number(raw.Rating);
    if (!isNaN(num) && num >= 1 && num <= 5) {
      parsedRating = num;
    }
  }

  return {
    Response_ID:      raw.Response_ID || '',
    Timestamp:        raw.Timestamp || null,
    Product_ID:       (raw.Product_ID || '').trim(),
    Product_Name:     raw.Product_Name || 'Unknown Product',
    Respondent_Name:  raw.Respondent_Name || '',
    Is_Anonymous:     Boolean(raw.Is_Anonymous),
    Rating:           parsedRating, // Preserves null for missing/invalid ratings; never converts to 0!
    Comment:          raw.Comment || '',
    // AI fields: keep as empty string — do NOT substitute a default sentiment
    Sentiment:        raw.Sentiment || '',
    Category:         raw.Category || '',
    Summary:          raw.Summary || '',
    Suggested_Action: raw.Suggested_Action || '',
    Processing_Status: raw.Processing_Status || 'Pending',
  };
}

/**
 * Computes a deterministic content-based fingerprint of the dataset.
 *
 * Stably sorts products and records so order changes do not alter the signature.
 * Incorporates all meaningful data fields (IDs, names, ratings, comments, AI summaries, etc.)
 * while strictly omitting volatile metadata (timestamps of the fetch, Date.now(), request IDs).
 *
 * @param {Array<Object>} products - List of products
 * @param {Array<Object>} records  - List of feedback records
 * @returns {string} Compact deterministic signature (e.g. "P3_R25_7a9f...b12c")
 */
export function computeDatasetFingerprint(products = [], records = []) {
  if (!products.length && !records.length) {
    return 'EMPTY_DATASET';
  }

  // Deterministically sort products by Product_ID, then Product_Name
  const sortedProducts = [...products].sort((a, b) => {
    const idA = String(a.Product_ID || a.productId || '');
    const idB = String(b.Product_ID || b.productId || '');
    const idComp = idA.localeCompare(idB);
    if (idComp !== 0) return idComp;
    const nameA = String(a.Product_Name || a.productName || '');
    const nameB = String(b.Product_Name || b.productName || '');
    return nameA.localeCompare(nameB);
  });

  // Deterministically sort records by Response_ID, then Timestamp, then Comment
  const sortedRecords = [...records].sort((a, b) => {
    const idA = String(a.Response_ID || a.response_id || a.id || '');
    const idB = String(b.Response_ID || b.response_id || b.id || '');
    const idComp = idA.localeCompare(idB);
    if (idComp !== 0) return idComp;
    const timeA = String(a.Timestamp || a.timestamp || '');
    const timeB = String(b.Timestamp || b.timestamp || '');
    const timeComp = timeA.localeCompare(timeB);
    if (timeComp !== 0) return timeComp;
    const commA = String(a.Comment || a.comment || '');
    const commB = String(b.Comment || b.comment || '');
    return commA.localeCompare(commB);
  });

  // FNV-1a 64-bit dual-hash accumulator
  let h1 = 0x811c9dc5;
  let h2 = 0x84222325;

  function updateHash(str) {
    for (let i = 0; i < str.length; i++) {
      const code = str.charCodeAt(i);
      h1 ^= code;
      h1 = Math.imul(h1, 0x01000193) >>> 0;
      h2 ^= code;
      h2 = Math.imul(h2, 0x5bd1e995) >>> 0;
    }
  }

  function feedSeparator() {
    h1 ^= 0x1f;
    h1 = Math.imul(h1, 0x01000193) >>> 0;
    h2 ^= 0x1f;
    h2 = Math.imul(h2, 0x5bd1e995) >>> 0;
  }

  for (const p of sortedProducts) {
    const pId = p.Product_ID ?? p.productId ?? '';
    const pName = p.Product_Name ?? p.productName ?? '';
    const pStatus = p.Status ?? p.status ?? p.Is_Active ?? p.is_active ?? '';
    const pStr = `${pId}|${pName}|${pStatus}`;
    updateHash(pStr);
    feedSeparator();
  }

  for (const r of sortedRecords) {
    const rId = r.Response_ID ?? r.response_id ?? r.id ?? '';
    const rTime = r.Timestamp ?? r.timestamp ?? '';
    const rProd = r.Product_ID ?? r.productId ?? '';
    const rRating = r.Rating ?? r.rating ?? '';
    const rComment = r.Comment ?? r.comment ?? '';
    const rSentiment = r.Sentiment ?? r.sentiment ?? '';
    const rCategory = r.Category ?? r.category ?? '';
    const rSummary = r.Summary ?? r.summary ?? '';
    const rAction = r.Suggested_Action ?? r.suggested_action ?? r.SuggestedAction ?? '';
    const rStatus = r.Processing_Status ?? r.processing_status ?? r.ProcessingStatus ?? '';
    const rStr = `${rId}|${rTime}|${rProd}|${rRating}|${rComment}|${rSentiment}|${rCategory}|${rSummary}|${rAction}|${rStatus}`;
    updateHash(rStr);
    feedSeparator();
  }

  const hashPart = `${(h1 >>> 0).toString(16).padStart(8, '0')}${(h2 >>> 0).toString(16).padStart(8, '0')}`;
  return `P${sortedProducts.length}_R${sortedRecords.length}_${hashPart}`;
}
