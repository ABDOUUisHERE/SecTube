import xss from 'xss';

/**
 * Sanitize user input to prevent XSS attacks
 * @param {string} input - User input to sanitize
 * @returns {string} Sanitized input
 */
export const sanitize = (input) => {
  if (!input || typeof input !== 'string') return '';
  return xss(input);
};

export default sanitize;
