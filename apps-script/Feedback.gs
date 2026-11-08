/**
 * FeedbackIQ — Feedback Sheet Data Access & Transaction Handling
 */

/**
 * Appends a verified feedback record to the Feedback sheet.
 * Uses LockService to guarantee ACID-like consistency and prevent concurrent write corruption.
 *
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} ss - Spreadsheet instance
 * @param {Object} sanitizedData - Pre-validated, sanitized submission data
 * @returns {{ responseId: string, timestamp: string, processingStatus: string }}
 * @throws {Error} If sheet is missing or lock fails.
 */
function recordFeedback(ss, sanitizedData) {
  var sheet = ss.getSheetByName(CONFIG.SHEET_NAMES.FEEDBACK);
  if (!sheet) {
    throw new Error("The '" + CONFIG.SHEET_NAMES.FEEDBACK + "' sheet was not found in the spreadsheet.");
  }

  // Obtain Script Lock to prevent simultaneous write collisions
  var lock = LockService.getScriptLock();
  var acquired = lock.tryLock(CONFIG.LOCK_TIMEOUT_MS);
  if (!acquired) {
    throw new Error('Database is temporarily busy processing other requests. Please try again in a few moments.');
  }

  try {
    // Generate authoritative server-side metadata
    var responseId = generateResponseId();
    var timestamp = generateTimestamp();

    // Prepare row in exact 13-column order (Columns A through M)
    var newRow = [
      responseId,                  // Column A: Response_ID
      timestamp,                   // Column B: Timestamp
      sanitizedData.productId,     // Column C: Product_ID
      sanitizedData.productName,   // Column D: Product_Name (from Products sheet)
      sanitizedData.respondentName,// Column E: Respondent_Name (empty if anonymous)
      sanitizedData.isAnonymous,   // Column F: Is_Anonymous (boolean)
      sanitizedData.rating,        // Column G: Rating (integer 1-5)
      sanitizedData.comment,       // Column H: Comment (plain text)
      '',                          // Column I: Sentiment (blank initially)
      '',                          // Column J: Category (blank initially)
      '',                          // Column K: Summary (blank initially)
      '',                          // Column L: Suggested_Action (blank initially)
      'Pending',                   // Column M: Processing_Status
    ];

    sheet.appendRow(newRow);

    return {
      responseId: responseId,
      timestamp: timestamp,
      processingStatus: 'Pending',
    };
  } finally {
    // Always release lock
    lock.releaseLock();
  }
}
