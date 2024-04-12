// responseUtil.js

/**
 * Generates a standardized JSON response for API endpoints.
 * @param {string} status - The status of the response, typically 'success' or 'error'.
 * @param {string} message - A descriptive message about the response.
 * @param {Object} data - The payload/data of the response.
 * @returns {Object} An object structured for response.
 */
function generateResponse(message, data = {}) {
  return {
    message,
    data,
  };
}

module.exports = { generateResponse };
