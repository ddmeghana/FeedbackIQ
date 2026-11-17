import Papa from 'papaparse';
import * as XLSX from 'xlsx';

/**
 * Maximum accepted file size: 10 MB in bytes.
 */
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

/**
 * Canonical FeedbackIQ Fields definition with aliases for auto-matching.
 */
export const CANONICAL_FIELDS = {
  Product_Name: {
    key: 'Product_Name',
    label: 'Product Name',
    required: true,
    description: 'Name or title of the product or service being reviewed.',
    aliases: [
      'product',
      'product name',
      'product_name',
      'productname',
      'item',
      'item name',
      'product title',
      'service',
      'service name',
      'model',
    ],
  },
  Comment: {
    key: 'Comment',
    label: 'Feedback Comment',
    required: true,
    description: 'Customer text review, comment, or feedback message.',
    aliases: [
      'feedback',
      'review',
      'customer review',
      'user review',
      'comment',
      'customer feedback',
      'message',
      'description',
      'text',
      'notes',
      'opinion',
      'thoughts',
      'response',
    ],
  },
  Respondent_Name: {
    key: 'Respondent_Name',
    label: 'Respondent Name',
    required: false,
    description: 'Customer or respondent name. Left blank if anonymous.',
    aliases: [
      'customer',
      'customer name',
      'name',
      'respondent',
      'respondent name',
      'user',
      'user name',
      'client',
      'author',
      'submitted by',
    ],
  },
  Rating: {
    key: 'Rating',
    label: 'Rating (1-5)',
    required: false,
    description: 'Numerical rating score from 1 to 5 stars.',
    aliases: [
      'rating',
      'score',
      'stars',
      'satisfaction',
      'satisfaction score',
      'rate',
      'grade',
    ],
  },
  Timestamp: {
    key: 'Timestamp',
    label: 'Timestamp / Date',
    required: false,
    description: 'Date or time feedback was originally collected.',
    aliases: [
      'date',
      'timestamp',
      'created at',
      'created_at',
      'submitted at',
      'submitted_at',
      'time',
      'datetime',
      'date submitted',
    ],
  },
  Product_ID: {
    key: 'Product_ID',
    label: 'Product ID',
    required: false,
    description: 'Optional SKU or internal product code.',
    aliases: [
      'product id',
      'product_id',
      'productid',
      'sku',
      'item id',
      'item_id',
      'code',
    ],
  },
  Is_Anonymous: {
    key: 'Is_Anonymous',
    label: 'Is Anonymous',
    required: false,
    description: 'Flag indicating if the submission was anonymous.',
    aliases: [
      'anonymous',
      'is anonymous',
      'is_anonymous',
      'isanonymous',
    ],
  },
};

/**
 * Normalizes header string for comparison (lowercase, trimmed, strip underscores & extra spaces).
 */
export function normalizeHeaderString(str) {
  if (!str) return '';
  return String(str)
    .trim()
    .toLowerCase()
    .replace(/[_\-]+/g, ' ')
    .replace(/\s+/g, ' ');
}

/**
 * Parses a CSV file using PapaParse.
 *
 * @param {File} file
 * @returns {Promise<{ headers: string[], rows: Array<Object>, totalRows: number }>}
 */
export function parseCSVFile(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      return reject(new Error('No file provided for parsing.'));
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return reject(new Error(`File exceeds maximum size of 10 MB (${(file.size / 1024 / 1024).toFixed(1)} MB).`));
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: 'greedy',
      complete: (results) => {
        if (results.errors && results.errors.length > 0 && (!results.data || results.data.length === 0)) {
          return reject(new Error(`Failed to parse CSV: ${results.errors[0].message}`));
        }

        const headers = (results.meta.fields || []).map((h) => String(h).trim()).filter(Boolean);

        if (headers.length === 0) {
          return reject(new Error('The CSV file does not contain a valid header row.'));
        }

        const rows = results.data || [];
        if (rows.length === 0) {
          return reject(new Error('The CSV file is empty and contains no data rows.'));
        }

        resolve({
          headers,
          rows,
          totalRows: rows.length,
        });
      },
      error: (err) => {
        reject(new Error(`CSV parsing error: ${err.message}`));
      },
    });
  });
}

/**
 * Parses an Excel (.xlsx) file using SheetJS.
 *
 * @param {File} file
 * @param {string} [requestedSheetName]
 * @returns {Promise<{ sheetNames: string[], activeSheet: string, headers: string[], rows: Array<Object>, totalRows: number }>}
 */
export async function parseExcelFile(file, requestedSheetName) {
  if (!file) {
    throw new Error('No file provided for parsing.');
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error(`File exceeds maximum size of 10 MB (${(file.size / 1024 / 1024).toFixed(1)} MB).`);
  }

  let arrayBuffer;
  try {
    arrayBuffer = await file.arrayBuffer();
  } catch (err) {
    throw new Error('Unable to read Excel file from your computer.');
  }

  let workbook;
  try {
    workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: true });
  } catch (err) {
    throw new Error('Unable to parse Excel file. The file may be password-protected or corrupt.');
  }

  const sheetNames = workbook.SheetNames || [];
  if (sheetNames.length === 0) {
    throw new Error('The Excel workbook contains no worksheets.');
  }

  // Pick requested sheet, or first sheet with data
  let activeSheetName = requestedSheetName && sheetNames.includes(requestedSheetName)
    ? requestedSheetName
    : sheetNames[0];

  const worksheet = workbook.Sheets[activeSheetName];
  if (!worksheet) {
    throw new Error(`Worksheet "${activeSheetName}" could not be opened.`);
  }

  // Convert to JSON with headers from first row
  const jsonData = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    defval: '',
    blankrows: false,
  });

  if (!jsonData || jsonData.length === 0) {
    throw new Error(`Worksheet "${activeSheetName}" is empty.`);
  }

  // Row 0 is header row
  const rawHeaders = jsonData[0] || [];
  const headers = rawHeaders.map((h, idx) => (h ? String(h).trim() : `Column_${idx + 1}`)).filter(Boolean);

  if (headers.length === 0) {
    throw new Error(`Worksheet "${activeSheetName}" does not contain a valid header row.`);
  }

  // Remaining rows are data
  const rawRows = jsonData.slice(1);
  const rows = [];

  for (let r = 0; r < rawRows.length; r++) {
    const rowValues = rawRows[r];
    // Check if entire row is blank
    const hasValues = rowValues.some((val) => val !== '' && val !== null && val !== undefined);
    if (!hasValues) continue;

    const rowObj = {};
    for (let c = 0; c < headers.length; c++) {
      const val = rowValues[c];
      rowObj[headers[c]] = val instanceof Date ? val.toISOString() : (val !== undefined && val !== null ? String(val) : '');
    }
    rows.push(rowObj);
  }

  if (rows.length === 0) {
    throw new Error(`Worksheet "${activeSheetName}" has headers but contains no data rows.`);
  }

  return {
    sheetNames,
    activeSheet: activeSheetName,
    headers,
    rows,
    totalRows: rows.length,
  };
}

/**
 * Automatically detects likely column mappings from source headers.
 * Uses exact and normalized alias matching.
 *
 * @param {string[]} sourceHeaders
 * @returns {Record<string, string>} Mapping of canonicalFieldKey -> sourceHeaderName
 */
export function detectColumnMappings(sourceHeaders) {
  const mappings = {};
  const usedHeaders = new Set();

  const canonicalKeys = Object.keys(CANONICAL_FIELDS);

  // 1. Exact / alias match pass
  for (const canonKey of canonicalKeys) {
    const fieldDef = CANONICAL_FIELDS[canonKey];
    let matchedHeader = null;

    for (const header of sourceHeaders) {
      if (usedHeaders.has(header)) continue;

      const norm = normalizeHeaderString(header);
      // Check exact match with canonical key or aliases
      if (norm === normalizeHeaderString(fieldDef.label) || norm === normalizeHeaderString(canonKey)) {
        matchedHeader = header;
        break;
      }

      if (fieldDef.aliases.some((alias) => norm === normalizeHeaderString(alias))) {
        matchedHeader = header;
        break;
      }
    }

    if (matchedHeader) {
      mappings[canonKey] = matchedHeader;
      usedHeaders.add(matchedHeader);
    } else {
      mappings[canonKey] = ''; // Unmapped initially
    }
  }

  // 2. Substring matching pass for still unmapped fields
  for (const canonKey of canonicalKeys) {
    if (mappings[canonKey]) continue;
    const fieldDef = CANONICAL_FIELDS[canonKey];
    let matchedHeader = null;

    for (const header of sourceHeaders) {
      if (usedHeaders.has(header)) continue;
      const norm = normalizeHeaderString(header);

      if (fieldDef.aliases.some((alias) => alias.length >= 4 && (norm.includes(alias) || alias.includes(norm)))) {
        matchedHeader = header;
        break;
      }
    }

    if (matchedHeader) {
      mappings[canonKey] = matchedHeader;
      usedHeaders.add(matchedHeader);
    }
  }

  return mappings;
}

/**
 * Generates a normalized row fingerprint for duplicate detection.
 *
 * FIX (Duplicate fingerprint): When no source timestamp is present, use '' (empty string)
 * as the date component — NOT the import time. This ensures the same record imported on
 * different days always produces the same fingerprint, preventing re-import as duplicates.
 *
 * The backend computeRecordFingerprint() uses identical logic.
 */
export function generateRowFingerprint(record) {
  const normProduct = (record.Product_Name || '').trim().toLowerCase();
  const normComment = (record.Comment || '').trim().toLowerCase();
  const normRespondent = (record.Respondent_Name || '').trim().toLowerCase();
  const normRating = record.Rating !== null && record.Rating !== undefined ? String(record.Rating).trim() : '';

  // Only incorporate a date portion when a valid source timestamp is present.
  let normDate = '';
  if (record.Timestamp && String(record.Timestamp).trim() !== '') {
    try {
      const d = new Date(record.Timestamp);
      if (!isNaN(d.getTime())) {
        normDate = d.toISOString().substring(0, 10); // YYYY-MM-DD boundary
      }
      // If unparseable, normDate stays '' — consistent with absent timestamp
    } catch {
      // normDate stays ''
    }
  }

  return `${normProduct}___${normComment}___${normRespondent}___${normRating}___${normDate}`;
}

/**
 * Validates a single row given the user's column mappings.
 *
 * @param {Object} row - Raw row object from parser
 * @param {Record<string, string>} mappings - canonicalKey -> sourceHeader
 * @param {number} rowIndex - 1-based row index for error reporting
 * @returns {{ isValid: boolean, errors: string[], record: Object, fingerprint: string }}
 */
export function validateRow(row, mappings, rowIndex) {
  const errors = [];

  // 1. Product_Name (Required)
  const productHeader = mappings.Product_Name;
  const rawProduct = productHeader && row[productHeader] !== undefined ? String(row[productHeader]).trim() : '';
  if (!rawProduct) {
    errors.push(`Row ${rowIndex}: Missing required Product Name.`);
  }

  // 2. Comment (Required)
  const commentHeader = mappings.Comment;
  const rawComment = commentHeader && row[commentHeader] !== undefined ? String(row[commentHeader]).trim() : '';
  if (!rawComment) {
    errors.push(`Row ${rowIndex}: Missing required Feedback Comment.`);
  }

  // 3. Optional Rating (1-5 if provided)
  // FIX (Strict rating): Use regex to reject non-integer strings like "4.5" or "4abc"
  // before parsing. parseInt("4abc") would return 4, incorrectly passing validation.
  const ratingHeader = mappings.Rating;
  let parsedRating = null;
  if (ratingHeader && row[ratingHeader] !== undefined && String(row[ratingHeader]).trim() !== '') {
    const rawRating = String(row[ratingHeader]).trim();
    if (!/^\d+$/.test(rawRating)) {
      errors.push(`Row ${rowIndex}: Rating "${rawRating}" is invalid (must be a whole number 1–5).`);
    } else {
      const num = parseInt(rawRating, 10);
      if (num < 1 || num > 5) {
        errors.push(`Row ${rowIndex}: Rating ${num} is out of range (must be 1–5).`);
      } else {
        parsedRating = num;
      }
    }
  }

  // 4. Optional Timestamp
  // FIX (Timestamp): When no timestamp is provided, leave it null (no error).
  // When a timestamp IS provided but is unparseable, reject the row.
  const timestampHeader = mappings.Timestamp;
  let parsedTimestamp = null;
  if (timestampHeader && row[timestampHeader] !== undefined && String(row[timestampHeader]).trim() !== '') {
    const rawTs = String(row[timestampHeader]).trim();
    const d = new Date(rawTs);
    if (isNaN(d.getTime())) {
      errors.push(`Row ${rowIndex}: Timestamp "${rawTs}" cannot be parsed as a valid date.`);
    } else {
      parsedTimestamp = d.toISOString();
    }
  }

  // 5. Optional Respondent_Name
  const respondentHeader = mappings.Respondent_Name;
  const rawRespondent = respondentHeader && row[respondentHeader] !== undefined ? String(row[respondentHeader]).trim() : '';

  // 6. Optional Product_ID
  const productIdHeader = mappings.Product_ID;
  const rawProductId = productIdHeader && row[productIdHeader] !== undefined ? String(row[productIdHeader]).trim() : '';

  // 7. Optional Is_Anonymous
  // FIX (Anonymous matrix): Implement full 6-case inference table.
  //   | Is_Anonymous supplied | Name present | Result                              |
  //   |-----------------------|--------------|-------------------------------------|
  //   | absent                | absent       | anonymous=true,  name=''            |
  //   | absent                | present      | anonymous=false, name=as supplied   |
  //   | true                  | absent       | anonymous=true,  name=''            |
  //   | true                  | present      | anonymous=true,  name='' (redacted) |
  //   | false                 | absent       | anonymous=false, name=''            |
  //   | false                 | present      | anonymous=false, name=as supplied   |
  //   | invalid value         |              | row is invalid                      |
  const anonHeader = mappings.Is_Anonymous;
  let isAnonymous = null; // null until determined
  const rawAnonCell = anonHeader && row[anonHeader] !== undefined ? String(row[anonHeader]).trim() : '';

  if (rawAnonCell === '') {
    // Is_Anonymous absent — infer from name presence
    isAnonymous = !rawRespondent;
  } else {
    const anonLower = rawAnonCell.toLowerCase();
    if (anonLower === 'true' || anonLower === '1' || anonLower === 'yes') {
      isAnonymous = true;
    } else if (anonLower === 'false' || anonLower === '0' || anonLower === 'no') {
      isAnonymous = false;
    } else {
      errors.push(`Row ${rowIndex}: Is_Anonymous value "${rawAnonCell}" is not recognised (use true/false/1/0/yes/no).`);
      isAnonymous = false; // Default for normalizedRecord; row will be invalid anyway
    }
  }

  const normalizedRecord = {
    Product_Name: rawProduct,
    Comment: rawComment,
    Respondent_Name: isAnonymous ? '' : rawRespondent,
    Rating: parsedRating,
    Timestamp: parsedTimestamp,
    Product_ID: rawProductId,
    Is_Anonymous: isAnonymous,
  };

  const fingerprint = generateRowFingerprint(normalizedRecord);

  return {
    isValid: errors.length === 0,
    errors,
    record: normalizedRecord,
    fingerprint,
    sourceRow: row,
    rowIndex,
  };
}

/**
 * Validates and normalizes the entire dataset.
 * Identifies valid rows, invalid rows, and intra-file duplicate rows.
 *
 * @param {Array<Object>} rows
 * @param {Record<string, string>} mappings
 * @returns {{ totalRows: number, validCount: number, invalidCount: number, duplicateCount: number, validRecords: Array<Object>, invalidRecords: Array<Object> }}
 */
export function validateDataset(rows, mappings) {
  const validRecords = [];
  const invalidRecords = [];
  const seenFingerprints = new Set();
  let duplicateCount = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const validation = validateRow(row, mappings, i + 1);

    if (!validation.isValid) {
      invalidRecords.push(validation);
      continue;
    }

    // Check for internal file duplicates
    if (seenFingerprints.has(validation.fingerprint)) {
      duplicateCount++;
      invalidRecords.push({
        ...validation,
        isValid: false,
        errors: [`Row ${i + 1}: Duplicate entry (identical to an earlier row in this file).`],
      });
      continue;
    }

    seenFingerprints.add(validation.fingerprint);
    validRecords.push(validation);
  }

  return {
    totalRows: rows.length,
    validCount: validRecords.length,
    invalidCount: invalidRecords.length,
    duplicateCount,
    validRecords,
    invalidRecords,
  };
}
