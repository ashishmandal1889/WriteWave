/**
 * Higher-order function to catch errors in async Express controllers
 * and forward them cleanly to the centralized error-handling middleware.
 *
 * @param {Function} fn - Async controller function
 * @returns {Function} Express middleware function
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
