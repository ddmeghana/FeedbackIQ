/**
 * FeedbackIQ — Google Apps Script Utility Functions
 */

/**
 * Builds a JSON HTTP response with ContentService and correct MIME type.
 *
 * @param {Object} data - Payload to return to client
 * @returns {GoogleAppsScript.Content.TextOutput}
 */
function createJsonResponse(data) {
  var output = JSON.stringify(data);
  return ContentService.createTextOutput(output)
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Generates an authoritative server-side Response ID.
 * Format: RESP-YYYYMMDD-HHMMSS-XXXX (e.g. RESP-20261108-143000-8421)
 *
 * @returns {string} Unique response identifier
 */
function generateResponseId() {
  var now = new Date();
  var dateStr = Utilities.formatDate(now, 'UTC', 'yyyyMMdd-HHmmss');
  var randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return 'RESP-' + dateStr + '-' + randomSuffix;
}

/**
 * Generates an authoritative ISO 8601 UTC timestamp.
 * Example: 2026-11-08T14:30:00.000Z
 *
 * @returns {string}
 */
function generateTimestamp() {
  return new Date().toISOString();
}

/**
 * Sanitizes user-supplied text to prevent Spreadsheet Formula Injection (CSV injection).
 * If text begins with '=', '+', '-', '@', '\t', or '\r', a leading single quote (')
 * is prepended so Google Sheets treats it strictly as plain text, never as a formula.
 *
 * @param {*} input - Raw input
 * @returns {string} Sanitized plain text
 */
function sanitizeText(input) {
  if (input === null || input === undefined) return '';
  var str = String(input).trim();
  if (str.length === 0) return '';

  var firstChar = str.charAt(0);
  if (firstChar === '=' || firstChar === '+' || firstChar === '-' || firstChar === '@' || firstChar === '\t' || firstChar === '\r') {
    return "'" + str;
  }
  return str;
}

/**
 * Coerces a value to a clean string; returns empty string if null/undefined/blank.
 */
function safeString(value) {
  if (value === null || value === undefined) return '';
  var str = String(value).trim();
  if (str === 'undefined' || str === 'null') return '';
  return str;
}

/**
 * Coerces a value to a boolean.
 * Handles: true/false, 'TRUE'/'FALSE', 'true'/'false', 1/0.
 */
function safeBoolean(value) {
  if (typeof value === 'boolean') return value;
  var str = String(value).trim().toUpperCase();
  return str === 'TRUE' || str === '1';
}
