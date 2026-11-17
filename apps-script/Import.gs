/**
 * FeedbackIQ — Admin Feedback Import Engine (Apps Script)
 *
 * Implements server-side validation, duplicate prevention, and batch insertion
 * into the central 13-column Feedback sheet.
 *
 * SECURITY & CONCURRENCY:
 * - Requires admin session token (enforced by Code.gs).
 * - All writes guarded by LockService (15s timeout).
 * - Sanitizes all text inputs against Formula Injection (CSV injection).
 * - Server validates all required fields independently of client checks.
 */

var IMPORT_LOG_SHEET_NAME = 'Import_Log';

/**
 * Computes a deterministic SHA-256 fingerprint for a row to prevent duplicates.
 *
 * IMPORTANT: When no source timestamp is available, pass '' (empty string) — NOT the
 * import timestamp. Using the import timestamp would cause the same record imported
 * on different days to produce different fingerprints and thus be re-imported as a
 * duplicate each time.
 *
 * @param {string} productName
 * @param {string} comment
 * @param {string} respondentName
 * @param {*} rating
 * @param {string} sourceTimestampStr  - ISO string from the source data, or '' if absent
 * @returns {string} Hex-encoded SHA-256 fingerprint
 */
function computeRecordFingerprint(productName, comment, respondentName, rating, sourceTimestampStr) {
  var p = String(productName || '').trim().toLowerCase();
  var c = String(comment || '').trim().toLowerCase();
  var r = String(respondentName || '').trim().toLowerCase();
  var rate = (rating !== null && rating !== undefined && String(rating).trim() !== '') ? String(rating).trim() : '';

  // FIX (Duplicate fingerprint): Only incorporate a date portion when a valid source
  // timestamp is present. Never substitute the import timestamp here.
  var dStr = '';
  if (sourceTimestampStr && String(sourceTimestampStr).trim() !== '') {
    try {
      var d = new Date(String(sourceTimestampStr).trim());
      if (!isNaN(d.getTime())) {
        dStr = d.toISOString().substring(0, 10); // Date portion only (YYYY-MM-DD)
      }
      // If the date is unparseable, dStr stays '' — consistent with absent timestamp
    } catch (e) {
      // dStr stays ''
    }
  }

  var rawInput = p + '___' + c + '___' + r + '___' + rate + '___' + dStr;
  var digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, rawInput, Utilities.Charset.UTF_8);

  var hex = '';
  for (var i = 0; i < digest.length; i++) {
    var b = (digest[i] + 256) % 256;
    var byteHex = b.toString(16);
    if (byteHex.length === 1) byteHex = '0' + byteHex;
    hex += byteHex;
  }
  return hex;
}

/**
 * Gets or creates the Import_Log sheet for duplicate tracking.
 *
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} ss
 * @returns {GoogleAppsScript.Spreadsheet.Sheet}
 */
function getOrCreateImportLogSheet(ss) {
  var sheet = ss.getSheetByName(IMPORT_LOG_SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(IMPORT_LOG_SHEET_NAME);
    sheet.appendRow([
      'Fingerprint',
      'Import_Timestamp',
      'Response_ID',
      'Product_Name',
      'Rating',
      'Comment_Preview',
    ]);
  }
  return sheet;
}

/**
 * Loads all known fingerprints from both the Import_Log sheet and the existing Feedback sheet.
 *
 * @param {GoogleAppsScript.Spreadsheet.Sheet} feedbackSheet
 * @param {GoogleAppsScript.Spreadsheet.Sheet} logSheet
 * @returns {Object.<string, boolean>} Map of known fingerprints
 */
function loadKnownFingerprints(feedbackSheet, logSheet) {
  var fingerprintMap = {};

  // 1. Load from Import_Log sheet if it has rows
  var logLastRow = logSheet.getLastRow();
  if (logLastRow > 1) {
    var logValues = logSheet.getRange(2, 1, logLastRow - 1, 1).getValues();
    for (var i = 0; i < logValues.length; i++) {
      var fp = String(logValues[i][0] || '').trim();
      if (fp) fingerprintMap[fp] = true;
    }
  }

  // 2. Also back-fill fingerprints from existing Feedback sheet
  var fbLastRow = feedbackSheet.getLastRow();
  if (fbLastRow > 1) {
    // Read columns B (Timestamp), C (Product_ID), D (Product_Name), E (Respondent_Name), G (Rating), H (Comment)
    var fbValues = feedbackSheet.getRange(2, 1, fbLastRow - 1, 8).getValues();
    for (var j = 0; j < fbValues.length; j++) {
      var row = fbValues[j];
      var ts = row[1];
      var prodName = row[3];
      var respName = row[4];
      var rating = row[6];
      var comment = row[7];

      if (prodName || comment) {
        var existingFp = computeRecordFingerprint(prodName, comment, respName, rating, ts);
        fingerprintMap[existingFp] = true;
      }
    }
  }

  return fingerprintMap;
}

/**
 * Imports an array of normalized feedback records into the central Feedback sheet.
 *
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} ss
 * @param {Array<Object>} incomingRecords - Validated records from client
 * @returns {{ success: boolean, importedCount: number, duplicateCount: number, rejectedCount: number, errors: string[], message: string }}
 */
function importFeedbackRecords(ss, incomingRecords) {
  if (!incomingRecords || !Array.isArray(incomingRecords)) {
    return {
      success: false,
      importedCount: 0,
      duplicateCount: 0,
      rejectedCount: 0,
      errors: ['Invalid payload: Expected an array of records to import.'],
      message: 'Invalid payload structure.',
    };
  }

  var lock = LockService.getScriptLock();
  var acquired = lock.tryLock(15000);
  if (!acquired) {
    return {
      success: false,
      lockContention: true,
      error: 'AUTH_BUSY',
      message: 'Database is currently locked by another operation. Please retry in a few moments.',
    };
  }

  try {
    var feedbackSheet = ss.getSheetByName(CONFIG.SHEET_NAMES.FEEDBACK);
    if (!feedbackSheet) {
      throw new Error("Central '" + CONFIG.SHEET_NAMES.FEEDBACK + "' sheet was not found.");
    }

    var logSheet = getOrCreateImportLogSheet(ss);
    var knownFingerprints = loadKnownFingerprints(feedbackSheet, logSheet);

    // Fetch active products for product resolution
    var activeProducts = getActiveProducts(ss);
    var productMapByName = {};
    var productMapById = {};

    for (var p = 0; p < activeProducts.length; p++) {
      var prod = activeProducts[p];
      if (prod.productName) {
        productMapByName[prod.productName.trim().toLowerCase()] = prod;
      }
      if (prod.productId) {
        productMapById[prod.productId.trim().toLowerCase()] = prod;
      }
    }

    var newFeedbackRows = [];
    var newLogRows = [];
    var duplicateCount = 0;
    var rejectedCount = 0;
    var errors = [];
    var importTimestamp = generateTimestamp();

    for (var i = 0; i < incomingRecords.length; i++) {
      var item = incomingRecords[i];
      var rowNum = i + 1;

      // 1. Server-side validation of required fields
      var rawProductName = safeString(item.Product_Name || item.productName);
      var rawComment = safeString(item.Comment || item.comment);

      if (!rawProductName) {
        rejectedCount++;
        errors.push('Row ' + rowNum + ': Missing required Product Name.');
        continue;
      }

      if (!rawComment) {
        rejectedCount++;
        errors.push('Row ' + rowNum + ': Missing required Feedback Comment.');
        continue;
      }

      // 2. Validate optional rating (1..5)
      // FIX (Strict rating): Use regex to reject non-integer strings like "4.5" or "4abc"
      // before parsing. parseInt("4abc") returns 4 which would incorrectly pass validation.
      var ratingVal = '';
      var rawRatingStr = (item.Rating !== undefined && item.Rating !== null) ? String(item.Rating).trim() : '';
      if (rawRatingStr !== '') {
        if (!/^\d+$/.test(rawRatingStr)) {
          rejectedCount++;
          errors.push('Row ' + rowNum + ': Rating "' + rawRatingStr + '" is invalid (must be a whole number 1\u20135).');
          continue;
        }
        var numRating = parseInt(rawRatingStr, 10);
        if (numRating < 1 || numRating > 5) {
          rejectedCount++;
          errors.push('Row ' + rowNum + ': Rating ' + numRating + ' is out of range (must be 1\u20135).');
          continue;
        }
        ratingVal = numRating;
      }

      // 3. Validate optional timestamp
      // FIX (Timestamp): When no timestamp is provided, store blank ''.
      // When a timestamp IS provided but is invalid, reject the row entirely.
      // Never substitute the import timestamp — that would corrupt fingerprints.
      var sourceTimestampStr = ''; // The raw value used in fingerprinting ('' when absent)
      var timestampVal = '';       // The value stored in Column B of Feedback sheet
      var rawTimestampInput = (item.Timestamp !== undefined && item.Timestamp !== null)
        ? String(item.Timestamp).trim()
        : '';

      if (rawTimestampInput !== '') {
        var parsedTs = new Date(rawTimestampInput);
        if (isNaN(parsedTs.getTime())) {
          rejectedCount++;
          errors.push('Row ' + rowNum + ': Timestamp "' + rawTimestampInput + '" cannot be parsed as a valid date.');
          continue;
        }
        sourceTimestampStr = parsedTs.toISOString();
        timestampVal = sourceTimestampStr;
      }

      // 4. Resolve Product_ID & Product_Name
      // Resolution rules:
      // - Valid ID + matching registered name -> preserve ID & registered name
      // - Valid ID + conflicting registered name -> blank ID, preserve original source name
      // - Valid ID + unregistered name (e.g. PROD-001 with "Laptop X Pro") -> blank ID, preserve original source name
      // - Unknown ID + any name -> blank ID, preserve original source name
      // - Missing ID + registered name -> resolve ID from registered name
      // - Missing ID + unregistered name -> blank ID, preserve original source name
      var resolvedProductId = '';
      var resolvedProductName = rawProductName;
      var rawProductId = safeString(item.Product_ID || item.productId);

      var idMatchedProduct = rawProductId ? productMapById[rawProductId.toLowerCase()] : null;
      var nameMatchedProduct = productMapByName[rawProductName.toLowerCase()];

      if (rawProductId) {
        // If a Product_ID was supplied by the source:
        // Only link Product_ID if the supplied Name also matches the exact same registered product.
        if (idMatchedProduct && nameMatchedProduct && idMatchedProduct.productId === nameMatchedProduct.productId) {
          resolvedProductId   = idMatchedProduct.productId;
          resolvedProductName = idMatchedProduct.productName;
        } else {
          // ID is unknown, ID points to a different product than Name,
          // or Name is not registered (e.g. PROD-001 with "Laptop X Pro").
          // Leave ID blank and preserve original source name.
          resolvedProductId   = '';
          resolvedProductName = rawProductName;
        }
      } else {
        // No Product_ID was supplied by the source:
        if (nameMatchedProduct) {
          // Name matches a registered product -> resolve ID from registry
          resolvedProductId   = nameMatchedProduct.productId;
          resolvedProductName = nameMatchedProduct.productName;
        } else {
          // Unregistered product name -> leave ID blank, preserve original source name
          resolvedProductId   = '';
          resolvedProductName = rawProductName;
        }
      }

      // 5. Respondent name & Anonymous flag
      // FIX (Anonymous matrix): Implement full 6-case inference table.
      //   | Is_Anonymous supplied | Name present | Result                              |
      //   |-----------------------|--------------|-------------------------------------|
      //   | absent                | absent       | anonymous=true,  name=''            |
      //   | absent                | present      | anonymous=false, name=as supplied   |
      //   | true                  | absent       | anonymous=true,  name=''            |
      //   | true                  | present      | anonymous=true,  name='' (redacted) |
      //   | false                 | absent       | anonymous=false, name=''            |
      //   | false                 | present      | anonymous=false, name=as supplied   |
      //   | invalid value         |              | reject row                          |
      var rawRespondent = safeString(item.Respondent_Name || item.respondentName);
      var rawAnonInput = item.Is_Anonymous !== undefined ? item.Is_Anonymous : item.isAnonymous;
      var isAnon;

      if (rawAnonInput === undefined || rawAnonInput === null || String(rawAnonInput).trim() === '') {
        // Is_Anonymous absent — infer from name presence
        isAnon = !rawRespondent;
      } else {
        var anonStr = String(rawAnonInput).trim().toLowerCase();
        if (anonStr === 'true' || anonStr === '1' || anonStr === 'yes') {
          isAnon = true;
        } else if (anonStr === 'false' || anonStr === '0' || anonStr === 'no') {
          isAnon = false;
        } else {
          rejectedCount++;
          errors.push('Row ' + rowNum + ': Is_Anonymous value "' + rawAnonInput + '" is not recognised (use true/false/1/0/yes/no).');
          continue;
        }
      }

      var cleanRespondent = isAnon ? '' : rawRespondent;

      // 6. Check duplicates via deterministic fingerprint
      // FIX: Pass sourceTimestampStr ('' when absent) — NOT timestampVal — so that records
      // without a source timestamp always hash identically regardless of when they are imported.
      var fp = computeRecordFingerprint(resolvedProductName, rawComment, cleanRespondent, ratingVal, sourceTimestampStr);
      if (knownFingerprints[fp]) {
        duplicateCount++;
        continue;
      }

      // Mark as seen in this transaction
      knownFingerprints[fp] = true;

      // 7. Generate Response_ID and prepare row for central Feedback sheet
      var responseId = generateResponseId();

      var feedbackRow = [
        responseId,                          // Column A: Response_ID
        timestampVal,                        // Column B: Timestamp
        resolvedProductId,                   // Column C: Product_ID
        sanitizeText(resolvedProductName),   // Column D: Product_Name
        sanitizeText(cleanRespondent),       // Column E: Respondent_Name
        isAnon,                              // Column F: Is_Anonymous
        ratingVal,                           // Column G: Rating (1-5 or '')
        sanitizeText(rawComment),            // Column H: Comment
        '',                                  // Column I: Sentiment (blank initially)
        '',                                  // Column J: Category (blank initially)
        '',                                  // Column K: Summary (blank initially)
        '',                                  // Column L: Suggested_Action (blank initially)
        'Pending',                           // Column M: Processing_Status
      ];

      var commentSnippet = rawComment.length > 80 ? rawComment.substring(0, 77) + '...' : rawComment;
      var logRow = [
        fp,
        importTimestamp,
        responseId,
        resolvedProductName,
        ratingVal,
        commentSnippet,
      ];

      newFeedbackRows.push(feedbackRow);
      newLogRows.push(logRow);
    }

    // 8. Batch write to Feedback sheet
    if (newFeedbackRows.length > 0) {
      var lastRow = feedbackSheet.getLastRow();
      feedbackSheet.getRange(lastRow + 1, 1, newFeedbackRows.length, 13).setValues(newFeedbackRows);
    }

    // 9. Batch write to Import_Log sheet
    if (newLogRows.length > 0) {
      var logLastRow = logSheet.getLastRow();
      logSheet.getRange(logLastRow + 1, 1, newLogRows.length, 6).setValues(newLogRows);
    }

    var message = 'Import complete: ' + newFeedbackRows.length + ' records imported successfully.';
    if (duplicateCount > 0) {
      message += ' (' + duplicateCount + ' duplicate records skipped).';
    }
    if (rejectedCount > 0) {
      message += ' (' + rejectedCount + ' invalid rows rejected).';
    }

    return {
      success: true,
      importedCount: newFeedbackRows.length,
      duplicateCount: duplicateCount,
      rejectedCount: rejectedCount,
      errors: errors,
      message: message,
    };
  } finally {
    lock.releaseLock();
  }
}
