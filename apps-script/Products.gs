/**
 * FeedbackIQ — Products Sheet Data Access
 */

/**
 * Reads all active products from the Products sheet.
 * Uses a single batch range read (getDataRange().getValues()) for maximum performance.
 *
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} ss - Spreadsheet instance
 * @returns {Array<{ productId: string, productName: string, description: string }>}
 * @throws {Error} If Products sheet is missing or improperly configured.
 */
function getActiveProducts(ss) {
  var sheet = ss.getSheetByName(CONFIG.SHEET_NAMES.PRODUCTS);
  if (!sheet) {
    throw new Error("The '" + CONFIG.SHEET_NAMES.PRODUCTS + "' sheet was not found in the spreadsheet.");
  }

  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) {
    // Only header row or empty sheet
    return [];
  }

  var headerRow = data[0];
  var idIndex = -1;
  var nameIndex = -1;
  var descIndex = -1;
  var statusIndex = -1;

  for (var c = 0; c < headerRow.length; c++) {
    var colName = String(headerRow[c]).trim().toLowerCase();
    if (colName === 'product_id' || colName === 'productid') idIndex = c;
    else if (colName === 'product_name' || colName === 'productname') nameIndex = c;
    else if (colName === 'description') descIndex = c;
    else if (colName === 'status') statusIndex = c;
  }

  if (idIndex === -1 || nameIndex === -1 || statusIndex === -1) {
    throw new Error("Products sheet headers are incomplete. Expected columns: Product_ID, Product_Name, Description, Status.");
  }

  var activeProducts = [];
  for (var r = 1; r < data.length; r++) {
    var row = data[r];
    var status = String(row[statusIndex] || '').trim().toLowerCase();
    var pId = String(row[idIndex] || '').trim();
    var pName = String(row[nameIndex] || '').trim();
    var pDesc = descIndex !== -1 ? String(row[descIndex] || '').trim() : '';

    if (status === 'active' && pId !== '') {
      activeProducts.push({
        productId: pId,
        productName: pName,
        description: pDesc,
      });
    }
  }

  return activeProducts;
}

/**
 * Adds a new product to the Products sheet.
 *
 * Rules:
 * - Product name must be non-empty (after trimming).
 * - Product name must be unique (case-insensitive) among ALL existing products.
 * - New Product_ID is generated as PROD-NNN where NNN is the next available
 *   three-digit zero-padded number, computed by scanning ALL existing IDs in
 *   the sheet (not by assuming the last row has the highest ID).
 * - All writes are guarded by LockService to prevent concurrent inserts.
 *
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} ss
 * @param {string} productName - Desired product name (will be sanitized)
 * @returns {{ success: boolean, productId?: string, productName?: string, message: string }}
 */
function adminAddProduct(ss, productName) {
  var trimmedName = String(productName || '').trim();

  if (!trimmedName) {
    return { success: false, message: 'Product name is required.' };
  }

  if (trimmedName.length > 100) {
    return { success: false, message: 'Product name must not exceed 100 characters.' };
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
    var sheet = ss.getSheetByName(CONFIG.SHEET_NAMES.PRODUCTS);
    if (!sheet) {
      return { success: false, message: "Products sheet not found in the database." };
    }

    var data = sheet.getDataRange().getValues();

    // Locate column indices from header row
    var headerRow = data[0] || [];
    var idIndex = -1;
    var nameIndex = -1;
    var statusIndex = -1;

    for (var c = 0; c < headerRow.length; c++) {
      var colName = String(headerRow[c]).trim().toLowerCase();
      if (colName === 'product_id' || colName === 'productid') idIndex = c;
      else if (colName === 'product_name' || colName === 'productname') nameIndex = c;
      else if (colName === 'status') statusIndex = c;
    }

    if (idIndex === -1 || nameIndex === -1) {
      return { success: false, message: "Products sheet headers are incomplete." };
    }

    // Scan ALL existing rows for:
    //   1. Duplicate name (case-insensitive)
    //   2. Maximum numeric suffix of existing PROD-NNN IDs
    var newNameLower = trimmedName.toLowerCase();
    var maxSuffix = 0;

    for (var r = 1; r < data.length; r++) {
      var row = data[r];
      var existingName = String(row[nameIndex] || '').trim().toLowerCase();
      var existingId   = String(row[idIndex]   || '').trim();

      // Case-insensitive duplicate name check (all statuses, not just Active)
      if (existingName === newNameLower) {
        return {
          success: false,
          message: 'A product named "' + trimmedName + '" already exists.',
        };
      }

      // Parse numeric suffix from PROD-NNN pattern
      var match = existingId.match(/^PROD-(\d+)$/i);
      if (match) {
        var suffix = parseInt(match[1], 10);
        if (!isNaN(suffix) && suffix > maxSuffix) {
          maxSuffix = suffix;
        }
      }
    }

    // Generate next Product_ID
    var nextSuffix = maxSuffix + 1;
    var paddedSuffix = nextSuffix < 10 ? '00' + nextSuffix
                     : nextSuffix < 100 ? '0' + nextSuffix
                     : String(nextSuffix);
    var newProductId = 'PROD-' + paddedSuffix;

    // Sanitize name against formula injection before writing
    var sanitizedName = sanitizeText(trimmedName);

    // Append new product row: Product_ID | Product_Name | Description | Status
    sheet.appendRow([newProductId, sanitizedName, '', 'Active']);

    return {
      success: true,
      productId: newProductId,
      productName: sanitizedName,
      message: 'Product "' + sanitizedName + '" added successfully with ID ' + newProductId + '.',
    };

  } finally {
    lock.releaseLock();
  }
}

/**
 * Reads all products (both Active and Inactive) from the Products sheet for admin management.
 *
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} ss - Spreadsheet instance
 * @returns {Array<{ productId: string, productName: string, description: string, status: string }>}
 */
function getAllAdminProducts(ss) {
  var sheet = ss.getSheetByName(CONFIG.SHEET_NAMES.PRODUCTS);
  if (!sheet) {
    throw new Error("The '" + CONFIG.SHEET_NAMES.PRODUCTS + "' sheet was not found in the spreadsheet.");
  }

  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) {
    return [];
  }

  var headerRow = data[0];
  var idIndex = -1;
  var nameIndex = -1;
  var descIndex = -1;
  var statusIndex = -1;

  for (var c = 0; c < headerRow.length; c++) {
    var colName = String(headerRow[c]).trim().toLowerCase();
    if (colName === 'product_id' || colName === 'productid') idIndex = c;
    else if (colName === 'product_name' || colName === 'productname') nameIndex = c;
    else if (colName === 'description') descIndex = c;
    else if (colName === 'status') statusIndex = c;
  }

  if (idIndex === -1 || nameIndex === -1) {
    throw new Error("Products sheet headers are incomplete.");
  }

  var allProducts = [];
  for (var r = 1; r < data.length; r++) {
    var row = data[r];
    var pId = String(row[idIndex] || '').trim();
    var pName = String(row[nameIndex] || '').trim();
    var pDesc = descIndex !== -1 ? String(row[descIndex] || '').trim() : '';
    var rawStatus = statusIndex !== -1 ? String(row[statusIndex] || '').trim() : 'Active';
    var status = rawStatus.toLowerCase() === 'inactive' ? 'Inactive' : 'Active';

    if (pId !== '') {
      allProducts.push({
        productId: pId,
        productName: pName,
        description: pDesc,
        status: status,
      });
    }
  }

  return allProducts;
}

/**
 * Deactivates a product in the Products sheet by setting its Status to 'Inactive'.
 * Does NOT delete the database row or historical feedback records.
 *
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} ss
 * @param {string} productId - Product_ID to remove/deactivate
 * @returns {{ success: boolean, productId?: string, productName?: string, message: string }}
 */
function adminRemoveProduct(ss, productId) {
  var trimmedId = String(productId || '').trim();

  if (!trimmedId) {
    return { success: false, message: 'Product ID is required.' };
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
    var sheet = ss.getSheetByName(CONFIG.SHEET_NAMES.PRODUCTS);
    if (!sheet) {
      return { success: false, message: "Products sheet not found in the database." };
    }

    var data = sheet.getDataRange().getValues();
    var headerRow = data[0] || [];
    var idIndex = -1;
    var nameIndex = -1;
    var statusIndex = -1;

    for (var c = 0; c < headerRow.length; c++) {
      var colName = String(headerRow[c]).trim().toLowerCase();
      if (colName === 'product_id' || colName === 'productid') idIndex = c;
      else if (colName === 'product_name' || colName === 'productname') nameIndex = c;
      else if (colName === 'status') statusIndex = c;
    }

    if (idIndex === -1 || statusIndex === -1) {
      return { success: false, message: "Products sheet headers are incomplete." };
    }

    var targetRowIndex = -1;
    var productName = '';
    var trimmedIdLower = trimmedId.toLowerCase();

    for (var r = 1; r < data.length; r++) {
      var row = data[r];
      var existingId = String(row[idIndex] || '').trim().toLowerCase();
      if (existingId === trimmedIdLower) {
        targetRowIndex = r + 1; // 1-based index in sheet
        productName = nameIndex !== -1 ? String(row[nameIndex] || '').trim() : trimmedId;
        break;
      }
    }

    if (targetRowIndex === -1) {
      return { success: false, message: 'Product with ID "' + trimmedId + '" not found in registry.' };
    }

    // Set Status cell to 'Inactive' (1-based row, 1-based column)
    sheet.getRange(targetRowIndex, statusIndex + 1).setValue('Inactive');

    return {
      success: true,
      productId: trimmedId,
      productName: productName,
      message: 'Product "' + productName + '" (' + trimmedId + ') has been removed and marked inactive.',
    };
  } finally {
    lock.releaseLock();
  }
}
