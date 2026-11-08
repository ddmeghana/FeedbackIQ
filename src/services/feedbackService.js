/**
 * FeedbackIQ — Feedback Submission Service
 *
 * Connects the public feedback submission form to the Google Apps Script Web App.
 *
 * CORS & PREFLIGHT ARCHITECTURAL NOTE:
 * Google Apps Script Content Service does not respond to HTTP OPTIONS preflight requests.
 * By sending the POST payload with Content-Type: 'text/plain;charset=utf-8' containing
 * serialized JSON, the browser treats it as a simple CORS request and omits the OPTIONS preflight.
 * Google Apps Script then receives the JSON string in e.postData.contents, processes it,
 * and redirects (302) to script.googleusercontent.com which serves the JSON response
 * with Access-Control-Allow-Origin: *. Standard fetch follows the redirect seamlessly.
 */

import { APPS_SCRIPT_URL, PROCESSING_STATUS } from '../config/constants.js';

/**
 * Formats client data into the API submission payload.
 *
 * @param {Object} rawData
 * @returns {Object}
 */
export function formatSubmissionPayload(rawData) {
  return {
    productId: rawData.productId,
    rating: Number(rawData.rating),
    comment: (rawData.comment || '').trim(),
    isAnonymous: Boolean(rawData.isAnonymous),
    respondentName: rawData.isAnonymous ? '' : (rawData.respondentName || '').trim(),
  };
}

/**
 * Submits feedback to the Google Apps Script Web App.
 *
 * @param {Object} rawData - Form state
 * @returns {Promise<{ success: boolean, message?: string, record?: Object, error?: string, isConfigError?: boolean }>}
 */
export async function submitFeedback(rawData) {
  // 1. Verify that Apps Script endpoint is configured
  if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL.trim() === '') {
    return {
      success: false,
      error: 'Google Apps Script endpoint is not configured. Please set VITE_APPS_SCRIPT_URL in your .env.local file.',
      isConfigError: true,
    };
  }

  // 2. Format payload
  const payload = formatSubmissionPayload(rawData);

  // 3. Client-side guard against empty payload
  if (!payload.comment || payload.rating < 1 || payload.rating > 5 || !payload.productId) {
    return {
      success: false,
      error: 'Submission rejected: Incomplete or invalid feedback payload.',
    };
  }

  try {
    // 4. Send request using text/plain to avoid OPTIONS preflight
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      return {
        success: false,
        error: `Server responded with HTTP error status: ${response.status}`,
      };
    }

    const result = await response.json();

    if (!result || typeof result !== 'object') {
      return {
        success: false,
        error: 'Invalid response received from Google Apps Script.',
      };
    }

    if (!result.success) {
      return {
        success: false,
        error: result.message || 'Submission was rejected by Google Sheets backend.',
      };
    }

    // 5. Construct verified record with server-generated metadata
    const verifiedRecord = {
      Response_ID: result.data?.responseId || null,
      Timestamp: result.data?.timestamp || new Date().toISOString(),
      Product_ID: payload.productId,
      Product_Name: rawData.productName || 'Product',
      Respondent_Name: payload.respondentName,
      Is_Anonymous: payload.isAnonymous,
      Rating: payload.rating,
      Comment: payload.comment,
      Sentiment: null,
      Category: null,
      Summary: null,
      Suggested_Action: null,
      Processing_Status: result.data?.processingStatus || PROCESSING_STATUS.PENDING,
    };

    return {
      success: true,
      message: result.message || 'Thank you for sharing your feedback!',
      record: verifiedRecord,
    };
  } catch (err) {
    return {
      success: false,
      error: 'Network error: Unable to reach Google Apps Script. Check your internet connection or verify the deployed Web App URL.',
    };
  }
}
