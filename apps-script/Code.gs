/**
 * FeedbackIQ — Main Google Apps Script API Router
 *
 * HTTP entry points:
 *   - doGet(e):  Health check | Public product retrieval
 *   - doPost(e): Admin login | Admin data retrieval | Admin logout
 *
 * PUBLIC ACTIONS (no authentication):
 *   GET  ?action=health        — API health check
 *   GET  ?action=getProducts   — Active products list
 *   POST { action: "adminLogin", pin: "..." } — Admin login authentication
 *
 * ADMIN ACTIONS (require session token in POST body):
 *   POST { action: "adminLogout", token: "..." }                         — Invalidate caller's session
 *   POST { action: "getFeedback", token: "...", page: 1, pageSize: 50 }  — Retrieve feedback records
 *   POST { action: "getProducts", token: "..." }                         — Admin product list
 *   POST { action: "adminImportFeedback", token: "...", records: [...] } — Import normalized feedback records
 *   POST { action: "adminAddProduct",    token: "...", productName: "..." } — Add a new product to the registry
 *
 * CORS NOTE:
 * All POST requests use Content-Type: text/plain on the client to avoid OPTIONS preflight.
 * Google Apps Script redirects to script.googleusercontent.com with Access-Control-Allow-Origin: *.
 */

function doGet(e) {
  try {
    var action = (e && e.parameter && e.parameter.action)
      ? String(e.parameter.action).trim().toLowerCase()
      : 'health';

    if (action === 'getproducts' || action === 'products') {
      var ss = getSpreadsheet();
      var products = getActiveProducts(ss);
      return createJsonResponse({ success: true, data: products });
    }

    // Default: health check
    var ssH = getSpreadsheet();
    var prodSheet = ssH.getSheetByName(CONFIG.SHEET_NAMES.PRODUCTS);
    var fbSheet   = ssH.getSheetByName(CONFIG.SHEET_NAMES.FEEDBACK);

    if (!prodSheet || !fbSheet) {
      return createJsonResponse({
        success: false,
        message: 'Database check failed: One or more required sheets are missing.',
        sheetsFound: { products: Boolean(prodSheet), feedback: Boolean(fbSheet) },
      });
    }

    return createJsonResponse({
      success: true,
      message: 'FeedbackIQ API is healthy and connected to Google Sheets.',
      status: 'healthy',
      sheetsFound: { products: true, feedback: true },
    });
  } catch (err) {
    return createJsonResponse({ success: false, message: err.message || 'GET error.' });
  }
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return createJsonResponse({ success: false, message: 'Empty request body.' });
    }

    var payload;
    try {
      payload = JSON.parse(e.postData.contents);
    } catch (parseErr) {
      return createJsonResponse({ success: false, message: 'Malformed JSON payload.' });
    }

    var action = payload.action ? String(payload.action).trim().toLowerCase() : '';

    // ─── 1. DECOMMISSIONED: Public Feedback Submission ─────────────────────
    if (action === 'submit') {
      return createJsonResponse({
        success: false,
        message: 'Public feedback submission has been decommissioned. Please use the admin import pipeline.',
      });
    }

    // ─── 2. PUBLIC: Admin Login (PIN Verification, No Token Required) ──────
    if (action === 'adminlogin') {
      var loginResult = adminLogin(payload.pin || '');
      return createJsonResponse(loginResult);
    }

    // ─── 3. ADMIN: Logout (Session Token REQUIRED) ─────────────────────────
    // An unauthenticated or mismatched request CANNOT invalidate another user's session
    if (action === 'adminlogout') {
      var logoutToken = payload.token ? String(payload.token).trim() : '';
      var logoutResult = adminLogout(logoutToken);
      return createJsonResponse(logoutResult);
    }

    // ─── 4. ADMIN: Protected Operations (Session Token REQUIRED) ───────────
    var token = payload.token ? String(payload.token).trim() : '';
    var sessionCheck = validateAdminSession(token);
    if (!sessionCheck.valid) {
      // Distinguish temporary lock contention from genuine session expiration
      if (sessionCheck.lockContention) {
        return createJsonResponse({
          success: false,
          lockContention: true,
          error: 'AUTH_BUSY',
          message: sessionCheck.reason || 'Authentication service is temporarily busy. Please retry in a moment.',
        });
      }
      return createJsonResponse({
        success: false,
        sessionExpired: true,
        error: 'SESSION_EXPIRED',
        message: sessionCheck.reason || 'Unauthorized: Active admin session required.',
      });
    }

    var ss = getSpreadsheet();

    // Protected: Retrieve Feedback Records
    if (action === 'getfeedback') {
      var feedbackResult = getAdminFeedback(ss, {
        page:          payload.page,
        pageSize:      payload.pageSize,
        productId:     payload.productId,
        dateFrom:      payload.dateFrom,
        dateTo:        payload.dateTo,
      });
      return createJsonResponse({
        success: true,
        message: 'Feedback retrieved successfully.',
        data: feedbackResult.records,
        expiresAt: sessionCheck.expiresAt,
        pagination: {
          total:      feedbackResult.total,
          page:       feedbackResult.page,
          pageSize:   feedbackResult.pageSize,
          totalPages: feedbackResult.totalPages,
        },
      });
    }

    // Protected: Retrieve Product Registry
    if (action === 'getproducts') {
      var products = payload.all ? getAllAdminProducts(ss) : getActiveProducts(ss);
      return createJsonResponse({
        success: true,
        data: products,
        expiresAt: sessionCheck.expiresAt,
      });
    }

    // Protected: Add a New Product
    if (action === 'adminaddproduct') {
      var newProdName = payload.productName ? String(payload.productName).trim() : '';
      var addResult = adminAddProduct(ss, newProdName);

      if (addResult.lockContention) {
        return createJsonResponse({
          success: false,
          lockContention: true,
          error: 'AUTH_BUSY',
          message: addResult.message,
        });
      }

      return createJsonResponse({
        success: addResult.success,
        productId: addResult.productId || null,
        productName: addResult.productName || null,
        message: addResult.message,
        expiresAt: sessionCheck.expiresAt,
      });
    }

    // Protected: Remove / Deactivate a Product
    if (action === 'adminremoveproduct' || action === 'admindeactivateproduct') {
      var prodIdToRemove = payload.productId ? String(payload.productId).trim() : '';
      var removeResult = adminRemoveProduct(ss, prodIdToRemove);

      if (removeResult.lockContention) {
        return createJsonResponse({
          success: false,
          lockContention: true,
          error: 'AUTH_BUSY',
          message: removeResult.message,
        });
      }

      return createJsonResponse({
        success: removeResult.success,
        productId: removeResult.productId || null,
        productName: removeResult.productName || null,
        message: removeResult.message,
        expiresAt: sessionCheck.expiresAt,
      });
    }

    // Protected: Change Admin PIN
    if (action === 'adminchangepin') {
      var currentPin = payload.currentPin ? String(payload.currentPin).trim() : '';
      var newPin = payload.newPin ? String(payload.newPin).trim() : '';
      var pinResult = adminChangePin(currentPin, newPin);

      if (pinResult.lockContention) {
        return createJsonResponse({
          success: false,
          lockContention: true,
          error: 'AUTH_BUSY',
          message: pinResult.message,
        });
      }

      return createJsonResponse({
        success: pinResult.success,
        message: pinResult.message,
        expiresAt: sessionCheck.expiresAt,
      });
    }

    // Protected: Get Admin Profile
    if (action === 'admingetprofile') {
      var profileData = adminGetProfile();
      return createJsonResponse({
        success: true,
        data: profileData,
        expiresAt: sessionCheck.expiresAt,
      });
    }

    // Protected: Update Admin Profile
    if (action === 'adminupdateprofile') {
      var updateName = payload.displayName ? String(payload.displayName).trim() : '';
      var updateEmail = payload.email ? String(payload.email).trim() : '';
      var updateResult = adminUpdateProfile(updateName, updateEmail);

      if (updateResult.lockContention) {
        return createJsonResponse({
          success: false,
          lockContention: true,
          error: 'AUTH_BUSY',
          message: updateResult.message,
        });
      }

      return createJsonResponse({
        success: updateResult.success,
        data: updateResult.data || null,
        message: updateResult.message,
        expiresAt: sessionCheck.expiresAt,
      });
    }

    // Protected: Import Feedback Records (Excel, CSV, Google Sheets)
    if (action === 'adminimportfeedback' || action === 'importfeedback') {
      var importPayloadRecords = Array.isArray(payload.records) ? payload.records : [];
      var importResult = importFeedbackRecords(ss, importPayloadRecords);

      if (importResult.lockContention) {
        return createJsonResponse({
          success: false,
          lockContention: true,
          error: 'AUTH_BUSY',
          message: importResult.message,
        });
      }

      return createJsonResponse({
        success: importResult.success,
        importedCount: importResult.importedCount,
        duplicateCount: importResult.duplicateCount,
        rejectedCount: importResult.rejectedCount,
        errors: importResult.errors,
        message: importResult.message,
        expiresAt: sessionCheck.expiresAt,
      });
    }

    return createJsonResponse({ success: false, message: 'Unknown action: ' + action });

  } catch (err) {
    return createJsonResponse({ success: false, message: err.message || 'An unexpected error occurred.' });
  }
}
