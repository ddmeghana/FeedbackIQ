/**
 * FeedbackIQ — Main Google Apps Script API Router
 *
 * Provides the public HTTP Web App entry points:
 *   - doGet(e): Health check and public active products retrieval
 *   - doPost(e): Public feedback submission with server-side validation and database locking
 *
 * ARCHITECTURAL SECURITY NOTE:
 * This endpoint is public for respondent feedback submissions.
 * It strictly DOES NOT expose administrative feedback records or private respondent comments.
 * All responses are served as JSON via ContentService with standard CORS headers.
 */

/**
 * Handles incoming HTTP GET requests.
 *
 * Supported Actions:
 *   ?action=health         - Confirms API responsiveness and spreadsheet connection (Default)
 *   ?action=getProducts    - Returns list of currently active products for respondent form
 *
 * @param {GoogleAppsScript.Events.DoGet} e
 * @returns {GoogleAppsScript.Content.TextOutput}
 */
function doGet(e) {
  try {
    var action = (e && e.parameter && e.parameter.action) ? String(e.parameter.action).trim().toLowerCase() : 'health';

    // 1. Get Active Products
    if (action === 'getproducts' || action === 'products') {
      var ss = getSpreadsheet();
      var products = getActiveProducts(ss);
      return createJsonResponse({
        success: true,
        data: products,
      });
    }

    // 2. Health Check (Default)
    var ssHealth = getSpreadsheet();
    var productsSheet = ssHealth.getSheetByName(CONFIG.SHEET_NAMES.PRODUCTS);
    var feedbackSheet = ssHealth.getSheetByName(CONFIG.SHEET_NAMES.FEEDBACK);

    if (!productsSheet || !feedbackSheet) {
      return createJsonResponse({
        success: false,
        message: 'Database check failed: One or more required sheets (Products, Feedback) are missing.',
        sheetsFound: {
          products: Boolean(productsSheet),
          feedback: Boolean(feedbackSheet),
        },
      });
    }

    return createJsonResponse({
      success: true,
      message: 'FeedbackIQ API is healthy and connected to Google Sheets.',
      status: 'healthy',
      sheetsFound: {
        products: true,
        feedback: true,
      },
    });
  } catch (err) {
    return createJsonResponse({
      success: false,
      message: err.message || 'An error occurred during GET processing.',
    });
  }
}

/**
 * Handles incoming HTTP POST requests for feedback submission.
 *
 * Expected payload (sent as text/plain or application/json containing JSON string):
 * {
 *   "productId": "PROD-001",
 *   "rating": 5,
 *   "comment": "Exceptional product experience...",
 *   "isAnonymous": false,
 *   "respondentName": "John Doe"
 * }
 *
 * @param {GoogleAppsScript.Events.DoPost} e
 * @returns {GoogleAppsScript.Content.TextOutput}
 */
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return createJsonResponse({
        success: false,
        message: 'Empty request body: Expected JSON feedback payload.',
      });
    }

    // Parse incoming payload
    var payload;
    try {
      payload = JSON.parse(e.postData.contents);
    } catch (parseErr) {
      return createJsonResponse({
        success: false,
        message: 'Malformed request: Unable to parse JSON payload.',
      });
    }

    // Access spreadsheet
    var ss = getSpreadsheet();

    // 1. Fetch currently active products from database
    var activeProducts = getActiveProducts(ss);
    if (!activeProducts || activeProducts.length === 0) {
      return createJsonResponse({
        success: false,
        message: 'Submissions are currently closed because no active products are available in the system.',
      });
    }

    // 2. Perform strict server-side validation & formula sanitization
    var validation = validateFeedbackSubmission(payload, activeProducts);
    if (!validation.isValid) {
      return createJsonResponse({
        success: false,
        message: validation.error || 'Validation failed.',
      });
    }

    // 3. Atomically record feedback into Feedback sheet using LockService
    var recordResult = recordFeedback(ss, validation.data);

    return createJsonResponse({
      success: true,
      message: 'Feedback submitted successfully',
      data: {
        responseId: recordResult.responseId,
        timestamp: recordResult.timestamp,
        processingStatus: recordResult.processingStatus,
      },
    });
  } catch (err) {
    return createJsonResponse({
      success: false,
      message: err.message || 'An unexpected server error occurred while recording feedback.',
    });
  }
}
