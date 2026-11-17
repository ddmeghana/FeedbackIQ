/**
 * FeedbackIQ — Report Data Service
 *
 * Prepares, validates, and aggregates report data for:
 *   1. Executive Report Preview (in browser)
 *   2. Client-side PDF Generation (via jsPDF)
 *
 * Guarantees zero hardcoded data, accurate KPI formulas, transparent handling
 * of processing status (analyzed, pending, failed), and strict product/date scope isolation.
 */

import {
  calculateKPIs,
  calculateSentimentDistribution,
  calculateCategoryDistribution,
  calculateRatingDistribution,
  calculateProductComparison,
} from '../data/mockDashboardData.js';

/**
 * Filter feedback records by selected product and date range (including custom ranges).
 *
 * @param {Array<Object>} records - Feedback records
 * @param {string} productId - 'ALL' or specific Product_ID
 * @param {string} dateRange - 'all' | '7d' | '30d' | '90d' | 'custom'
 * @param {string} customStartDate - 'YYYY-MM-DD'
 * @param {string} customEndDate - 'YYYY-MM-DD'
 * @returns {{ filteredRecords: Array<Object>, undatedCount: number }}
 */
export function filterReportRecords(
  records = [],
  productId = 'ALL',
  dateRange = '30d',
  customStartDate = '',
  customEndDate = ''
) {
  const now = new Date();
  let startCutoff = null;
  let endCutoff = null;

  if (dateRange === '7d') {
    startCutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  } else if (dateRange === '30d') {
    startCutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  } else if (dateRange === '90d') {
    startCutoff = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  } else if (dateRange === 'custom') {
    if (customStartDate) {
      startCutoff = new Date(customStartDate + 'T00:00:00');
    }
    if (customEndDate) {
      endCutoff = new Date(customEndDate + 'T23:59:59.999');
    }
  }

  let undatedCount = 0;

  const filtered = records.filter((item) => {
    // 1. Product Scope Filter
    if (productId !== 'ALL') {
      const matchId = (item.Product_ID || '').trim() === productId.trim();
      const matchName = (item.Product_Name || '').trim().toLowerCase() === productId.trim().toLowerCase();
      if (!matchId && !matchName) return false;
    }

    // Check if timestamp exists and is parseable
    const rawTime = item.Timestamp;
    const itemDate = rawTime ? new Date(rawTime) : null;
    const isDateValid = itemDate && !isNaN(itemDate.getTime());

    if (!isDateValid) {
      undatedCount++;
      // If date range is bounded, exclude undated records
      if (dateRange !== 'all') {
        return false;
      }
      // If 'all', include undated records
      return true;
    }

    // 2. Date Range Filter
    if (startCutoff && itemDate < startCutoff) {
      return false;
    }
    if (endCutoff && itemDate > endCutoff) {
      return false;
    }

    return true;
  });

  return {
    filteredRecords: filtered,
    undatedCount,
  };
}

/**
 * Validates report configuration parameters.
 *
 * @param {Object} config
 * @returns {{ isValid: boolean, error?: string }}
 */
export function validateReportConfig(config) {
  if (!config.title || config.title.trim() === '') {
    return { isValid: false, error: 'Report title cannot be empty.' };
  }

  if (config.dateRange === 'custom') {
    if (!config.customStartDate || !config.customEndDate) {
      return { isValid: false, error: 'Both start date and end date are required for a custom date range.' };
    }
    const start = new Date(config.customStartDate);
    const end = new Date(config.customEndDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return { isValid: false, error: 'Invalid start date or end date format.' };
    }
    if (start > end) {
      return { isValid: false, error: 'Start date cannot be later than end date.' };
    }
  }

  if (!config.sections || Object.values(config.sections).every((v) => !v)) {
    return { isValid: false, error: 'Please select at least one section to include in the report.' };
  }

  return { isValid: true };
}

/**
 * Builds the comprehensive report data model.
 *
 * @param {Object} params
 * @param {Object} params.config - User configuration
 * @param {Array<Object>} params.products - Products registry
 * @param {Array<Object>} params.allRecords - Raw feedback records
 * @returns {Object} Complete report data object
 */
export function buildReportData({ config, products = [], allRecords = [] }) {
  const { filteredRecords, undatedCount } = filterReportRecords(
    allRecords,
    config.productScope,
    config.dateRange,
    config.customStartDate,
    config.customEndDate
  );

  const totalResponses = filteredRecords.length;

  // Processing status partitions (aligned with AIInsightsPage 4-rule classification)
  const analyzedRecords = [];
  const pendingRecords = [];
  const failedRecords = [];

  filteredRecords.forEach((r) => {
    const rawStatus = String(r.Processing_Status || '').trim().toLowerCase();
    const hasSummary = Boolean((r.Summary || '').trim());
    const hasSentiment = Boolean((r.Sentiment || '').trim());

    if (rawStatus === 'failed' || rawStatus === 'error') {
      failedRecords.push(r);
    } else if (rawStatus === 'pending' || rawStatus === 'processing') {
      pendingRecords.push(r);
    } else if (rawStatus === 'analyzed') {
      analyzedRecords.push(r);
    } else if (rawStatus === '') {
      if (hasSentiment || hasSummary) {
        analyzedRecords.push(r);
      } else {
        pendingRecords.push(r);
      }
    } else {
      pendingRecords.push(r);
    }
  });

  // Calculate Rating statistics (Strictly 1..5, missing ratings excluded)
  const validRatings = [];
  let sumRatings = 0;
  let missingRatingCount = 0;

  filteredRecords.forEach((r) => {
    if (r.Rating !== null && r.Rating !== undefined && String(r.Rating).trim() !== '') {
      const num = Number(r.Rating);
      if (!isNaN(num) && num >= 1 && num <= 5) {
        validRatings.push(num);
        sumRatings += num;
        return;
      }
    }
    missingRatingCount++;
  });

  const averageRating = validRatings.length > 0 ? (sumRatings / validRatings.length).toFixed(1) : 'N/A';

  // Sentiment Breakdown (calculated from analyzed records or filtered records)
  const positiveRecords = analyzedRecords.filter((r) => (r.Sentiment || '').toLowerCase() === 'positive');
  const negativeRecords = analyzedRecords.filter((r) => (r.Sentiment || '').toLowerCase() === 'negative');
  const neutralRecords = analyzedRecords.filter((r) => (r.Sentiment || '').toLowerCase() === 'neutral');
  const mixedRecords = analyzedRecords.filter((r) => (r.Sentiment || '').toLowerCase() === 'mixed');
  const otherSentimentRecords = analyzedRecords.filter((r) => {
    const s = (r.Sentiment || '').toLowerCase();
    return s && !['positive', 'negative', 'neutral', 'mixed'].includes(s);
  });

  const validAnalyzedCount = analyzedRecords.length;
  const positivePct = validAnalyzedCount > 0 ? Math.round((positiveRecords.length / validAnalyzedCount) * 100) : 0;
  const negativePct = validAnalyzedCount > 0 ? Math.round((negativeRecords.length / validAnalyzedCount) * 100) : 0;
  const neutralPct = validAnalyzedCount > 0 ? Math.round((neutralRecords.length / validAnalyzedCount) * 100) : 0;
  const mixedPct = validAnalyzedCount > 0 ? Math.round((mixedRecords.length / validAnalyzedCount) * 100) : 0;
  const otherPct = validAnalyzedCount > 0 ? Math.round((otherSentimentRecords.length / validAnalyzedCount) * 100) : 0;

  // Rating Distribution (1..5)
  const ratingDistribution = [5, 4, 3, 2, 1].map((stars) => {
    const count = validRatings.filter((r) => r === stars).length;
    const pct = validRatings.length > 0 ? Math.round((count / validRatings.length) * 100) : 0;
    return { stars, count, pct };
  });

  // Dynamic Category Breakdown
  const categoryMap = {};
  filteredRecords.forEach((r) => {
    const cat = (r.Category || '').trim() || 'Uncategorized';
    categoryMap[cat] = (categoryMap[cat] || 0) + 1;
  });

  const categoryDistribution = Object.keys(categoryMap)
    .map((category) => ({
      category,
      count: categoryMap[category],
      pct: totalResponses > 0 ? Math.round((categoryMap[category] / totalResponses) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);

  // Customer Praise & Customer Concerns Extraction (no silent truncation)
  const praiseItems = positiveRecords
    .filter((r) => (r.Summary || r.Comment || '').trim())
    .map((r) => ({
      id: r.Response_ID || 'N/A',
      productName: r.Product_Name || 'Unknown Product',
      category: r.Category || 'General',
      rating: r.Rating,
      summary: (r.Summary || r.Comment || '').trim(),
    }));

  const concernItems = negativeRecords
    .filter((r) => (r.Summary || r.Comment || '').trim())
    .map((r) => ({
      id: r.Response_ID || 'N/A',
      productName: r.Product_Name || 'Unknown Product',
      category: r.Category || 'General',
      rating: r.Rating,
      summary: (r.Summary || r.Comment || '').trim(),
    }));

  // Actionable Recommendations Grouped by Stream (deduplicating identical suggestions while citing IDs)
  const actionStreams = {
    'Product Quality & Design': new Map(),
    'Performance & Reliability': new Map(),
    'Customer Experience': new Map(),
    'Marketing & Communication': new Map(),
  };

  analyzedRecords.forEach((r) => {
    const action = (r.Suggested_Action || '').trim();
    if (!action) return;

    const cat = (r.Category || '').toLowerCase();
    const comment = (r.Comment || '').toLowerCase();

    let stream = 'Customer Experience';
    if (cat.includes('quality') || cat.includes('packaging') || cat.includes('design') || comment.includes('build')) {
      stream = 'Product Quality & Design';
    } else if (cat.includes('performance') || cat.includes('battery') || cat.includes('hardware') || comment.includes('slow') || comment.includes('crash')) {
      stream = 'Performance & Reliability';
    } else if (cat.includes('pricing') || cat.includes('feature') || cat.includes('marketing') || comment.includes('price')) {
      stream = 'Marketing & Communication';
    }

    const key = action.toLowerCase();
    const map = actionStreams[stream];
    if (map.has(key)) {
      const existing = map.get(key);
      if (r.Response_ID) existing.responseIds.push(r.Response_ID);
    } else {
      map.set(key, {
        action,
        responseId: r.Response_ID || 'General',
        responseIds: r.Response_ID ? [r.Response_ID] : [],
        productName: r.Product_Name || 'General',
        category: r.Category || 'General',
      });
    }
  });

  const consolidatedActions = Object.keys(actionStreams)
    .map((streamName) => ({
      stream: streamName,
      items: Array.from(actionStreams[streamName].values()).map((entry) => ({
        ...entry,
        responseId: entry.responseIds.length > 0 ? entry.responseIds.join(', ') : 'General',
      })),
    }))
    .filter((s) => s.items.length > 0);

  // Cross-Product Comparison (for All Products scope)
  const productComparison =
    config.productScope === 'ALL' && products.length > 0
      ? calculateProductComparison(filteredRecords, products)
      : [];

  // Product Scope Display Label
  let scopeLabel = 'All Products (Portfolio-wide)';
  if (config.productScope !== 'ALL') {
    const prodObj = products.find((p) => p.Product_ID === config.productScope);
    scopeLabel = prodObj ? `${prodObj.Product_Name} (${prodObj.Product_ID})` : config.productScope;
  }

  // Date Range Display Label
  let dateRangeLabel = 'All Time';
  if (config.dateRange === '7d') dateRangeLabel = 'Last 7 Days';
  else if (config.dateRange === '30d') dateRangeLabel = 'Last 30 Days';
  else if (config.dateRange === '90d') dateRangeLabel = 'Last 90 Days';
  else if (config.dateRange === 'custom') {
    dateRangeLabel = `${config.customStartDate} to ${config.customEndDate}`;
  }

  // Executive Overview Summary Text (evidence-based deterministic synthesis)
  let executiveSummary = '';
  if (totalResponses === 0) {
    executiveSummary = 'No customer feedback records were identified for the selected product scope and reporting period.';
  } else {
    const sentimentDescriptor =
      positivePct >= 60
        ? 'predominantly positive'
        : negativePct >= 40
        ? 'experiencing notable customer friction'
        : 'balanced across positive praise and constructive feedback';

    const topCategory = categoryDistribution[0]?.category || 'General';
    executiveSummary = `During this reporting period, FeedbackIQ collected and analyzed ${totalResponses} customer feedback responses. Overall customer sentiment is ${sentimentDescriptor}, with an average satisfaction rating of ${averageRating} out of 5.0 (${validRatings.length} verified ratings). Customer feedback is primarily concentrated around ${topCategory} (${categoryDistribution[0]?.count || 0} responses). Analyzed feedback accounts for ${validAnalyzedCount} records (${positivePct}% positive, ${negativePct}% negative), with ${pendingRecords.length} records pending AI processing and ${failedRecords.length} flagged with ingestion or processing exceptions.`;
  }

  return {
    metadata: {
      title: config.title.trim(),
      generatedAt: new Date().toLocaleString(),
      generatedDateISO: new Date().toISOString().split('T')[0],
      productScope: config.productScope,
      productScopeLabel: scopeLabel,
      dateRange: config.dateRange,
      dateRangeLabel,
      totalResponses,
      undatedCount,
      sections: config.sections,
    },
    kpis: {
      totalResponses,
      analyzedCount: validAnalyzedCount,
      pendingCount: pendingRecords.length,
      failedCount: failedRecords.length,
      averageRating,
      validRatingCount: validRatings.length,
      missingRatingCount,
      positiveCount: positiveRecords.length,
      positivePct,
      neutralCount: neutralRecords.length,
      neutralPct,
      negativeCount: negativeRecords.length,
      negativePct,
      mixedCount: mixedRecords.length,
      mixedPct,
      otherSentimentCount: otherSentimentRecords.length,
      otherPct,
    },
    executiveSummary,
    sentimentBreakdown: [
      { name: 'Positive', count: positiveRecords.length, pct: positivePct, color: '#10B981' },
      { name: 'Neutral', count: neutralRecords.length, pct: neutralPct, color: '#F59E0B' },
      { name: 'Negative', count: negativeRecords.length, pct: negativePct, color: '#EF4444' },
      { name: 'Mixed', count: mixedRecords.length, pct: mixedPct, color: '#8B5CF6' },
      { name: 'Other/Unknown', count: otherSentimentRecords.length, pct: otherPct, color: '#6B7280' },
    ].filter((s) => s.count > 0 || totalResponses === 0),
    ratingDistribution,
    categoryDistribution,
    praiseItems,
    concernItems,
    productComparison,
    actionStreams: consolidatedActions,
    supportingReferences: filteredRecords.map((r) => ({
      responseId: r.Response_ID || 'N/A',
      productName: r.Product_Name || 'Unknown Product',
      rating: r.Rating !== null && r.Rating !== undefined ? `${r.Rating} / 5` : 'No rating',
      sentiment: r.Sentiment || 'Unclassified',
      category: r.Category || 'General',
      summary: r.Summary || r.Comment || 'No summary available.',
    })),
  };
}
