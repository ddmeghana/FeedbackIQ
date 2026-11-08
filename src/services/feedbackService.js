/**
 * FeedbackIQ — Feedback Submission Service
 *
 * ARCHITECTURAL NOTE FOR PHASE 6+:
 * This service abstracts the submission pipeline. In Phase 5, it operates in
 * simulated DEMO mode with realistic network latency. In Phase 6, the `submitFeedback`
 * function will send a POST request to the Google Apps Script Web App URL
 * without modifying any component in `src/components/feedback/`.
 */

import { PROCESSING_STATUS } from '../config/constants.js';

/**
 * Format raw form data into the exact Google Sheets schema.
 *
 * @param {Object} rawData
 * @param {string} rawData.productId
 * @param {string} rawData.productName
 * @param {string} rawData.respondentName
 * @param {boolean} rawData.isAnonymous
 * @param {number} rawData.rating
 * @param {string} rawData.comment
 * @returns {Object} Schema-compliant record
 */
export function formatSubmissionPayload(rawData) {
  return {
    Response_ID: null, // Generated authoritative by backend
    Timestamp: null,   // Generated authoritative by backend
    Product_ID: rawData.productId,
    Product_Name: rawData.productName,
    Respondent_Name: rawData.isAnonymous ? '' : (rawData.respondentName || '').trim(),
    Is_Anonymous: Boolean(rawData.isAnonymous),
    Rating: Number(rawData.rating),
    Comment: (rawData.comment || '').trim(),
    Sentiment: null,        // To be populated by Gemini in Phase 8
    Category: null,         // To be populated by Gemini in Phase 8
    Summary: null,          // To be populated by Gemini in Phase 8
    Suggested_Action: null, // To be populated by Gemini in Phase 8
    Processing_Status: PROCESSING_STATUS.PENDING,
  };
}

/**
 * Submit feedback record.
 *
 * @param {Object} rawData - Form state
 * @returns {Promise<{ success: boolean, message: string, record?: Object, error?: string }>}
 */
export async function submitFeedback(rawData) {
  // Format payload according to strict database schema
  const payload = formatSubmissionPayload(rawData);

  // In Phase 5: Simulate realistic asynchronous network submission (750ms)
  await new Promise((resolve) => setTimeout(resolve, 750));

  // Simulation safeguard: Reject empty comments or invalid ratings
  if (!payload.Comment || payload.Rating < 1 || payload.Rating > 5) {
    return {
      success: false,
      error: 'Submission rejected: Invalid or incomplete feedback payload.',
      mode: 'demo',
    };
  }

  // Return simulated success confirmation
  return {
    success: true,
    message: 'Thank you for sharing your feedback!',
    record: payload,
    mode: 'demo',
  };
}
