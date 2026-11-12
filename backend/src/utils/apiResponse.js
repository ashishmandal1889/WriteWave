/**
 * Standardized API response format helpers
 */

export const sendSuccess = (res, { statusCode = 200, message = 'Success', data = null, ...rest }) => {
  const response = {
    success: true,
    message,
    ...(data !== null && { data }),
    ...rest
  };
  return res.status(statusCode).json(response);
};

export const sendError = (res, { statusCode = 500, message = 'Internal Server Error', errors = null, ...rest }) => {
  const response = {
    success: false,
    message,
    ...(errors !== null && { errors }),
    ...rest
  };
  return res.status(statusCode).json(response);
};

export default {
  sendSuccess,
  sendError
};
