/**
 * FeedbackIQ — Google Apps Script Server-Side Validation
 */

/**
 * Validates and sanitizes a feedback submission payload.
 *
 * @param {Object} rawData - Incoming request payload from client
 * @param {Array<Object>} activeProducts - List of active products from Products sheet
 * @returns {{ isValid: boolean, error?: string, data?: Object }}
 */
function validateFeedbackSubmission(rawData, activeProducts) {
  if (!rawData || typeof rawData !== 'object') {
    return { isValid: false, error: 'Invalid request body: Expected a JSON object.' };
  }

  // 1. Validate Product ID
  var rawProductId = rawData.productId || rawData.Product_ID;
  if (!rawProductId || typeof rawProductId !== 'string' || rawProductId.trim() === '') {
    return { isValid: false, error: 'Product selection is required.' };
  }
  var cleanProductId = rawProductId.trim();

  // Find matching active product in database
  var matchedProduct = null;
  for (var i = 0; i < activeProducts.length; i++) {
    if (activeProducts[i].productId === cleanProductId) {
      matchedProduct = activeProducts[i];
      break;
    }
  }

  if (!matchedProduct) {
    return { isValid: false, error: 'The selected product is invalid, inactive, or no longer available.' };
  }

  // 2. Validate Rating (Integer between 1 and 5)
  var rawRating = rawData.rating !== undefined ? rawData.rating : rawData.Rating;
  var parsedRating = Number(rawRating);
  if (
    isNaN(parsedRating) ||
    !Number.isInteger(parsedRating) ||
    parsedRating < CONFIG.LIMITS.RATING_MIN ||
    parsedRating > CONFIG.LIMITS.RATING_MAX
  ) {
    return {
      isValid: false,
      error: 'Rating must be an integer between ' + CONFIG.LIMITS.RATING_MIN + ' and ' + CONFIG.LIMITS.RATING_MAX + '.',
    };
  }

  // 3. Validate Comment
  var rawComment = rawData.comment || rawData.Comment || '';
  if (typeof rawComment !== 'string') {
    return { isValid: false, error: 'Comment must be text.' };
  }
  var trimmedComment = rawComment.trim();
  if (trimmedComment.length === 0) {
    return { isValid: false, error: 'Comment cannot be empty or whitespace only.' };
  }
  if (trimmedComment.length < CONFIG.LIMITS.COMMENT_MIN_LENGTH) {
    return {
      isValid: false,
      error: 'Comment must be at least ' + CONFIG.LIMITS.COMMENT_MIN_LENGTH + ' characters long (received ' + trimmedComment.length + ').',
    };
  }
  if (trimmedComment.length > CONFIG.LIMITS.COMMENT_MAX_LENGTH) {
    return {
      isValid: false,
      error: 'Comment exceeds maximum allowed length of ' + CONFIG.LIMITS.COMMENT_MAX_LENGTH + ' characters.',
    };
  }

  // 4. Validate Anonymous Flag & Respondent Name
  var isAnonymous = Boolean(rawData.isAnonymous || rawData.Is_Anonymous);
  var cleanName = '';

  if (!isAnonymous) {
    var rawName = rawData.respondentName || rawData.Respondent_Name || '';
    if (typeof rawName === 'string') {
      var trimmedName = rawName.trim();
      if (trimmedName.length > CONFIG.LIMITS.NAME_MAX_LENGTH) {
        return {
          isValid: false,
          error: 'Respondent name cannot exceed ' + CONFIG.LIMITS.NAME_MAX_LENGTH + ' characters.',
        };
      }
      cleanName = sanitizeText(trimmedName);
    }
  }

  // Return sanitized data ready for database insertion
  return {
    isValid: true,
    data: {
      productId: cleanProductId,
      productName: matchedProduct.productName, // Authoritatively assigned from database
      respondentName: cleanName,
      isAnonymous: isAnonymous,
      rating: parsedRating,
      comment: sanitizeText(trimmedComment), // Formula injection protected
    },
  };
}
