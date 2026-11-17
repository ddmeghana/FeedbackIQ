/**
 * FeedbackIQ — Admin Feedback Data Retrieval (Apps Script)
 *
 * SECURITY: All functions in this file require a valid admin session token.
 * They are ONLY called after validateAdminSession() succeeds in Code.gs.
 * Never expose these functions to public (unauthenticated) requests.
 */

/**
 * Validates and parses a date filter parameter.
 * Supports:
 *   1. Date-only format: 'YYYY-MM-DD' (strictly validated, rejecting impossible dates like 2026-02-31).
 *   2. Full ISO date-time string: parsed as an instant in time.
 *
 * If input is null/undefined or empty string, returns null (no filter).
 * If input is malformed or an impossible date, throws an Error with a clear message.
 *
 * @param {*} dateParam - Input from request
 * @param {string} paramName - 'dateFrom' or 'dateTo' for error messaging
 * @returns {{ isDateOnly: boolean, value: string|Date }|null}
 */
function parseDateFilter(dateParam, paramName) {
  if (dateParam === null || dateParam === undefined) return null;
  var str = String(dateParam).trim();
  if (str === '') return null;

  // 1. Strict YYYY-MM-DD format check
  var dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(str);
  if (dateOnlyMatch) {
    var year = parseInt(dateOnlyMatch[1], 10);
    var month = parseInt(dateOnlyMatch[2], 10);
    var day = parseInt(dateOnlyMatch[3], 10);

    if (month < 1 || month > 12 || day < 1 || day > 31) {
      throw new Error('Invalid ' + paramName + ' date filter: "' + str + '". Month must be 1-12 and day 1-31.');
    }

    // Verify calendar validity (e.g. rejects 2026-02-31, 2026-04-31)
    var checkDate = new Date(Date.UTC(year, month - 1, day));
    if (
      checkDate.getUTCFullYear() !== year ||
      checkDate.getUTCMonth() !== month - 1 ||
      checkDate.getUTCDate() !== day
    ) {
      throw new Error('Invalid ' + paramName + ' date filter: "' + str + '" is not a valid calendar date.');
    }

    return {
      isDateOnly: true,
      value: str, // Preserved as 'YYYY-MM-DD' for timezone-based calendar date matching
    };
  }

  // 2. Strict ISO 8601 date-time format check
  // Matches: YYYY-MM-DDTHH:mm, YYYY-MM-DDTHH:mm:ss, optional subseconds, optional timezone offset (Z or +/-HH:mm)
  var isoDateTimeMatch = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?(?:\.(\d+))?(Z|[+-]\d{2}:?(?:\d{2})?)?$/i.exec(str);
  if (isoDateTimeMatch) {
    var dtYear = parseInt(isoDateTimeMatch[1], 10);
    var dtMonth = parseInt(isoDateTimeMatch[2], 10);
    var dtDay = parseInt(isoDateTimeMatch[3], 10);
    var dtHour = parseInt(isoDateTimeMatch[4], 10);
    var dtMinute = parseInt(isoDateTimeMatch[5], 10);
    var dtSecond = isoDateTimeMatch[6] ? parseInt(isoDateTimeMatch[6], 10) : 0;

    if (dtMonth < 1 || dtMonth > 12 || dtDay < 1 || dtDay > 31) {
      throw new Error('Invalid ' + paramName + ' date-time filter: "' + str + '". Month must be 1-12 and day 1-31.');
    }

    // Calendar date validity check (e.g. rejects 2026-02-31T12:00:00Z)
    var dtCheckDate = new Date(Date.UTC(dtYear, dtMonth - 1, dtDay));
    if (
      dtCheckDate.getUTCFullYear() !== dtYear ||
      dtCheckDate.getUTCMonth() !== dtMonth - 1 ||
      dtCheckDate.getUTCDate() !== dtDay
    ) {
      throw new Error('Invalid ' + paramName + ' date-time filter: "' + str + '" is not a valid calendar date.');
    }

    // Time components range check
    if (dtHour < 0 || dtHour > 23 || dtMinute < 0 || dtMinute > 59 || dtSecond < 0 || dtSecond > 59) {
      throw new Error('Invalid ' + paramName + ' date-time filter: "' + str + '". Time components out of valid range (hour 0-23, minute 0-59, second 0-59).');
    }

    // Timezone offset range check if specified as [+-]HH:mm or [+-]HHmm
    var tzOffset = isoDateTimeMatch[8];
    if (tzOffset && (tzOffset.charAt(0) === '+' || tzOffset.charAt(0) === '-')) {
      var tzDigits = tzOffset.slice(1).replace(':', '');
      var tzH = parseInt(tzDigits.substring(0, 2), 10);
      var tzM = tzDigits.length >= 4 ? parseInt(tzDigits.substring(2, 4), 10) : 0;
      if (tzH > 23 || tzM > 59) {
        throw new Error('Invalid ' + paramName + ' date-time filter: "' + str + '". Timezone offset out of range.');
      }
    }

    var parsedInstant = new Date(str);
    if (isNaN(parsedInstant.getTime())) {
      throw new Error('Malformed ' + paramName + ' date filter: "' + str + '". Unable to parse ISO 8601 date-time instant.');
    }

    return {
      isDateOnly: false,
      value: parsedInstant, // Preserved as Date instant
    };
  }

  throw new Error('Malformed ' + paramName + ' date filter: "' + str + '". Expected YYYY-MM-DD or valid ISO 8601 date-time.');
}

/**
 * Retrieves feedback records from the Feedback sheet.
 * Uses a single batch range read for efficiency.
 * Normalizes all values to consistent JSON-safe types.
 * Handles blank AI fields (Sentiment, Category, Summary, Suggested_Action).
 *
 * TIMEZONE-AWARE DATE FILTERING:
 * Calendar date-only filters (YYYY-MM-DD) are evaluated against the spreadsheet's
 * configured timezone (ss.getSpreadsheetTimeZone()) using Utilities.formatDate().
 * A record submitted anytime during that calendar day in the spreadsheet's timezone
 * (including shortly after midnight or late at night) is properly included.
 *
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} ss
 * @param {Object} options - { page: number, pageSize: number, productId: string, dateFrom: string, dateTo: string }
 * @returns {{ records: Array<Object>, total: number, page: number, pageSize: number, totalPages: number }}
 */
function getAdminFeedback(ss, options) {
  var opts = options || {};
  var page = Math.max(1, parseInt(opts.page, 10) || 1);
  var pageSize = Math.min(200, Math.max(1, parseInt(opts.pageSize, 10) || 50));
  var filterProductId = opts.productId || 'ALL';

  // Obtain spreadsheet timezone once (avoid repeated calls in loops)
  var tz = ss.getSpreadsheetTimeZone() || 'UTC';

  // Strictly validate and parse date filters (throws if malformed)
  var parsedDateFrom = parseDateFilter(opts.dateFrom, 'dateFrom');
  var parsedDateTo   = parseDateFilter(opts.dateTo, 'dateTo');
  var isDateFilterActive = Boolean(parsedDateFrom || parsedDateTo);

  var sheet = ss.getSheetByName(CONFIG.SHEET_NAMES.FEEDBACK);
  if (!sheet) {
    throw new Error("The '" + CONFIG.SHEET_NAMES.FEEDBACK + "' sheet was not found.");
  }

  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) {
    // Only header row or empty sheet
    return { records: [], total: 0, page: 1, pageSize: pageSize, totalPages: 0 };
  }

  // Batch-read all data rows at once (most efficient approach)
  var dataRange = sheet.getRange(2, 1, lastRow - 1, 13);
  var values = dataRange.getValues();

  var allRecords = [];

  for (var i = 0; i < values.length; i++) {
    var row = values[i];

    // Parse row into named fields (matches 13-column schema exactly)
    var record = {
      Response_ID:       safeString(row[0]),
      Timestamp:         safeTimestamp(row[1]),
      Product_ID:        safeString(row[2]),
      Product_Name:      safeString(row[3]),
      Respondent_Name:   safeString(row[4]),
      Is_Anonymous:      safeBoolean(row[5]),
      Rating:            safeInteger(row[6]),
      Comment:           safeString(row[7]),
      Sentiment:         safeString(row[8]),   // Blank before AI analysis
      Category:          safeString(row[9]),   // Blank before AI analysis
      Summary:           safeString(row[10]),  // Blank before AI analysis
      Suggested_Action:  safeString(row[11]),  // Blank before AI analysis
      Processing_Status: safeString(row[12]) || 'Pending',
    };

    // Skip completely empty rows (can appear after deletions)
    if (!record.Response_ID && !record.Timestamp) continue;

    // Apply product filter
    if (filterProductId !== 'ALL' && record.Product_ID !== filterProductId) continue;

    // Apply date filters
    if (isDateFilterActive) {
      // If a date filter is active and timestamp is missing or invalid, exclude record
      if (!record.Timestamp) continue;
      var recordDate = new Date(record.Timestamp);
      if (isNaN(recordDate.getTime())) continue;

      var recordCalDateStr = null; // Lazily computed if date-only filter is used

      if (parsedDateFrom) {
        if (parsedDateFrom.isDateOnly) {
          if (!recordCalDateStr) {
            recordCalDateStr = Utilities.formatDate(recordDate, tz, 'yyyy-MM-dd');
          }
          if (recordCalDateStr < parsedDateFrom.value) continue;
        } else {
          if (recordDate.getTime() < parsedDateFrom.value.getTime()) continue;
        }
      }

      if (parsedDateTo) {
        if (parsedDateTo.isDateOnly) {
          if (!recordCalDateStr) {
            recordCalDateStr = Utilities.formatDate(recordDate, tz, 'yyyy-MM-dd');
          }
          if (recordCalDateStr > parsedDateTo.value) continue;
        } else {
          if (recordDate.getTime() > parsedDateTo.value.getTime()) continue;
        }
      }
    }

    allRecords.push(record);
  }

  // Sort descending by Timestamp (newest first)
  allRecords.sort(function(a, b) {
    if (!a.Timestamp) return 1;
    if (!b.Timestamp) return -1;
    return new Date(b.Timestamp) - new Date(a.Timestamp);
  });

  // Pagination
  var total = allRecords.length;
  var totalPages = Math.ceil(total / pageSize);
  var startIdx = (page - 1) * pageSize;
  var pageRecords = allRecords.slice(startIdx, startIdx + pageSize);

  return {
    records: pageRecords,
    total: total,
    page: page,
    pageSize: pageSize,
    totalPages: totalPages,
  };
}

// ─── Type-Safe Coercion Helpers ───────────────────────────────────────────────

/**
 * Coerces a value to a string; returns empty string if null/undefined/blank.
 * Never returns "undefined", "null", or spreadsheet formula artifacts.
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

/**
 * Coerces a value to an integer. Returns 0 on failure.
 */
function safeInteger(value) {
  var n = parseInt(String(value), 10);
  return isNaN(n) ? 0 : n;
}

/**
 * Coerces a Google Sheets date value or ISO string to an ISO timestamp string.
 * Hardened to handle invalid Date objects without throwing RangeError.
 * Returns null if the value cannot be parsed or is invalid.
 */
function safeTimestamp(value) {
  if (!value) return null;
  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : value.toISOString();
  }
  var str = String(value).trim();
  if (!str || str === '' || str === 'undefined' || str === 'null') return null;
  try {
    var d = new Date(str);
    if (isNaN(d.getTime())) return null;
    return d.toISOString();
  } catch (e) {
    return null;
  }
}
