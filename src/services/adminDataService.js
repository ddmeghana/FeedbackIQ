/**
 * FeedbackIQ — Admin Dashboard Data Service
 *
 * Fetches feedback records and products from the protected admin API.
 * Requests are token-aware to prevent out-of-order responses or older sessions
 * from corrupting the active admin session.
 *
 * DATA NORMALIZATION:
 * Raw Google Sheets values arrive as strings or dates from JSON.
 * This service normalizes them to consistent types that the calculation
 * functions (filterFeedback, calculateKPIs, etc.) expect:
 *   - Is_Anonymous: boolean
 *   - Rating: integer
 *   - Timestamp: ISO string or null
 *   - Blank AI fields: empty string '' (not null/undefined)
 */

import { APPS_SCRIPT_URL } from '../config/constants.js';
import { getStoredToken, clearSession, updateSessionExpiry } from './adminAuthService.js';

/**
 * Sends an authenticated POST request to the Apps Script API.
 * Captures requestToken before dispatching.
 *
 * @param {Object} body - Request payload (token is automatically injected)
 * @returns {Promise<Object>}
 */
async function authenticatedPost(body) {
  const requestToken = getStoredToken();
  if (!requestToken) {
    return { success: false, message: 'Session expired. Please log in again.', sessionExpired: true };
  }

  if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL.trim() === '') {
    return {
      success: false,
      message: 'Apps Script URL not configured. Set VITE_APPS_SCRIPT_URL in your .env.local file.',
    };
  }

  try {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ ...body, token: requestToken }),
    });

    if (!response.ok) {
      return { success: false, message: `HTTP error ${response.status} from server.` };
    }

    const result = await response.json();

    // 1. Temporary lock contention: Do NOT clear session
    if (!result.success && (result.lockContention || result.error === 'AUTH_BUSY')) {
      return {
        success: false,
        lockContention: true,
        message: result.message || 'Server is temporarily busy. Please retry.',
      };
    }

    // 2. Genuinely invalid or expired session: Clear session ONLY if current token matches requestToken
    if (!result.success && (result.sessionExpired || result.error === 'SESSION_EXPIRED')) {
      clearSession(requestToken);
      return { ...result, sessionExpired: true };
    }

    // 3. Successful authenticated response: Safely update sliding session expiry
    if (result.success && result.expiresAt) {
      updateSessionExpiry(requestToken, result.expiresAt);
    }

    return result;
  } catch (err) {
    // 4. Temporary network failure: MUST NOT destroy a valid session
    return {
      success: false,
      isNetworkError: true,
      message: 'Network error: Unable to reach Google Apps Script. Check your connection.',
    };
  }
}

/**
 * Fetches all feedback records for the admin dashboard.
 * Retrieves records page by page until all are loaded.
 *
 * @param {Object} options - { productId?: string, dateFrom?: string, dateTo?: string }
 * @returns {Promise<{ success: boolean, records?: Array<Object>, message?: string, sessionExpired?: boolean }>}
 */
export async function fetchAdminFeedback(options) {
  const opts = options || {};
  const PAGE_SIZE = 200; // Max batch per request
  let page = 1;
  let allRecords = [];

  while (true) {
    const result = await authenticatedPost({
      action: 'getFeedback',
      page: page,
      pageSize: PAGE_SIZE,
      productId: opts.productId || 'ALL',
      dateFrom: opts.dateFrom || null,
      dateTo: opts.dateTo || null,
    });

    if (!result.success) {
      return {
        success: false,
        message: result.message,
        sessionExpired: result.sessionExpired,
        lockContention: result.lockContention,
        isNetworkError: result.isNetworkError,
      };
    }

    const records = Array.isArray(result.data) ? result.data : [];
    allRecords = allRecords.concat(records);

    const pagination = result.pagination || {};
    if (page >= (pagination.totalPages || 1) || records.length === 0) break;
    page++;
  }

  return {
    success: true,
    records: allRecords,
  };
}

/**
 * Fetches products for the admin dashboard using the authenticated admin action ('getProducts').
 * Pass { all: true } to include both active and deactivated/inactive products.
 *
 * @param {Object} [options] - { all?: boolean }
 * @returns {Promise<{ success: boolean, data?: Array<Object>, message?: string, sessionExpired?: boolean }>}
 */
export async function fetchAdminProducts(options = {}) {
  return authenticatedPost({
    action: 'getProducts',
    all: Boolean(options && options.all),
  });
}

/**
 * Sends normalized feedback records to the protected admin import endpoint in Apps Script.
 *
 * @param {Array<Object>} records - Array of normalized feedback records
 * @returns {Promise<{ success: boolean, importedCount?: number, duplicateCount?: number, rejectedCount?: number, errors?: string[], message?: string, sessionExpired?: boolean, lockContention?: boolean }>}
 */
export async function importAdminFeedback(records) {
  return authenticatedPost({
    action: 'adminImportFeedback',
    records: records,
  });
}

/**
 * Adds a new product to the Products sheet via the protected admin API.
 *
 * @param {string} productName - The name for the new product
 * @returns {Promise<{ success: boolean, productId?: string, productName?: string, message?: string, sessionExpired?: boolean, lockContention?: boolean }>}
 */
export async function addAdminProduct(productName) {
  return authenticatedPost({
    action: 'adminAddProduct',
    productName: productName,
  });
}

/**
 * Removes (deactivates) a product in the Products registry via the protected admin API.
 * Preserves the database record and all historical feedback references.
 *
 * @param {string} productId - The unique Product ID to deactivate
 * @returns {Promise<{ success: boolean, productId?: string, productName?: string, message?: string, sessionExpired?: boolean, lockContention?: boolean }>}
 */
export async function removeAdminProduct(productId) {
  return authenticatedPost({
    action: 'adminRemoveProduct',
    productId: productId,
  });
}
