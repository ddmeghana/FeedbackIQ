import { FORM_LIMITS, RATING_MIN, RATING_MAX } from '../config/constants.js';

/**
 * Validates the feedback form inputs against requirements.
 *
 * @param {Object} data - The form data object
 * @param {string} data.productId - Selected Product_ID
 * @param {string} data.respondentName - Optional name
 * @param {boolean} data.isAnonymous - Anonymous toggle
 * @param {number|null} data.rating - Rating (1-5)
 * @param {string} data.comment - Written comment
 * @param {Array} availableProducts - Array of valid products
 * @returns {Object} { isValid: boolean, errors: Object }
 */
export function validateFeedback(data, availableProducts = []) {
  const errors = {};

  // 1. Product Validation
  if (!data.productId || data.productId.trim() === '') {
    errors.productId = 'Please select a product to review.';
  } else {
    const productExists = availableProducts.some(
      (p) => p.Product_ID === data.productId
    );
    if (!productExists) {
      errors.productId = 'The selected product is not recognized.';
    }
  }

  // 2. Rating Validation
  if (!data.rating || data.rating < RATING_MIN || data.rating > RATING_MAX) {
    errors.rating = 'Please select a rating from 1 to 5 stars.';
  }

  // 3. Comment Validation
  const trimmedComment = (data.comment || '').trim();
  if (trimmedComment.length === 0) {
    errors.comment = 'Please share details about your experience.';
  } else if (trimmedComment.length < FORM_LIMITS.COMMENT_MIN_LENGTH) {
    errors.comment = `Please provide at least ${FORM_LIMITS.COMMENT_MIN_LENGTH} characters of feedback (currently ${trimmedComment.length}).`;
  } else if (trimmedComment.length > FORM_LIMITS.COMMENT_MAX_LENGTH) {
    errors.comment = `Comment exceeds maximum limit of ${FORM_LIMITS.COMMENT_MAX_LENGTH} characters.`;
  }

  // 4. Name Validation (only if not anonymous)
  if (!data.isAnonymous && data.respondentName) {
    const trimmedName = data.respondentName.trim();
    if (trimmedName.length > FORM_LIMITS.NAME_MAX_LENGTH) {
      errors.name = `Name cannot exceed ${FORM_LIMITS.NAME_MAX_LENGTH} characters.`;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
