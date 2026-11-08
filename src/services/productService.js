/**
 * FeedbackIQ — Products Data Service
 *
 * Fetches active products from the Google Sheets database via the Apps Script Web App.
 * Ensures zero-cost public product registry retrieval without exposing private feedback records.
 */

import { APPS_SCRIPT_URL } from '../config/constants.js';

/**
 * Normalizes a product record from the Apps Script API to the application's internal structure.
 *
 * @param {Object} raw
 * @returns {{ Product_ID: string, Product_Name: string, Description: string, Status: string }}
 */
export function normalizeProduct(raw) {
  return {
    Product_ID: raw.productId || raw.Product_ID || '',
    Product_Name: raw.productName || raw.Product_Name || 'Unknown Product',
    Description: raw.description || raw.Description || '',
    Status: raw.status || 'Active',
  };
}

/**
 * Fetches active products from Google Sheets.
 *
 * @returns {Promise<{ success: boolean, data?: Array<Object>, error?: string, isConfigError?: boolean }>}
 */
export async function getActiveProducts() {
  if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL.trim() === '') {
    return {
      success: false,
      error: 'Google Apps Script URL is not configured. Please add VITE_APPS_SCRIPT_URL to your .env.local file.',
      isConfigError: true,
    };
  }

  try {
    const separator = APPS_SCRIPT_URL.includes('?') ? '&' : '?';
    const endpoint = `${APPS_SCRIPT_URL}${separator}action=getProducts`;

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      return {
        success: false,
        error: `Server responded with status ${response.status}. Verify your Google Apps Script deployment.`,
      };
    }

    const result = await response.json();

    if (!result || typeof result !== 'object') {
      return {
        success: false,
        error: 'Invalid response format received from Google Apps Script.',
      };
    }

    if (!result.success) {
      return {
        success: false,
        error: result.message || 'Failed to retrieve products from Google Sheets.',
      };
    }

    const rawList = Array.isArray(result.data) ? result.data : [];
    const normalized = rawList.map(normalizeProduct);

    return {
      success: true,
      data: normalized,
    };
  } catch (err) {
    return {
      success: false,
      error: 'Network error: Unable to connect to Google Apps Script. Check your internet connection or Web App URL.',
    };
  }
}
