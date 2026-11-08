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
