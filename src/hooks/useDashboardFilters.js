import { useDashboardData } from './useDashboardData';

/**
 * useDashboardFilters — Hook providing dashboard filtering and live Google Sheets data.
 *
 * Fully integrated with useDashboardData to ensure dynamic data retrieval
 * directly from Google Sheets via Apps Script with zero hardcoded mock data.
 *
 * @param {string} initialProduct  - 'ALL' or a Product_ID
 * @param {string} initialDateRange - '7d' | '30d' | '90d' | 'all'
 * @returns {Object} Dashboard state, live data, and filter controls
 */
export function useDashboardFilters(initialProduct = 'ALL', initialDateRange = '30d') {
  return useDashboardData(initialProduct, initialDateRange);
}

