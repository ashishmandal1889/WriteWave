import config from '../config/environment.js';
import AppError from '../utils/AppError.js';

/**
 * 404 Not Found Handler for unmatched routes
 */
export const notFoundHandler = (req, res, next) => {
  const message = `Resource not found: ${req.method} ${req.originalUrl}`;
  res.status(404).json({
    success: false,
    statusCode: 404,
    message
  });
};

/**
 * Centralized Error-Handling Middleware
 */
export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = err.errors || null;

  // Handle invalid JSON body syntax
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    statusCode = 400;
    message = 'Malformed JSON in request body';
  }

  // Handle express-validator or custom validation array
  if (Array.isArray(err.array ? err.array() : err.errors)) {
    statusCode = 400;
    message = 'Validation failed';
    errors = err.array ? err.array() : err.errors;
  }

  // Log unexpected internal errors in development
  if (statusCode === 500 && config.nodeEnv === 'development') {
    console.error('🔥 [Unhandled Error]:', err);
  }

  const response = {
    success: false,
    statusCode,
    message,
    ...(errors && { errors }),
    ...(config.nodeEnv === 'development' && statusCode === 500 && { stack: err.stack })
  };

  res.status(statusCode).json(response);
};

export default {
  notFoundHandler,
  errorHandler
};
