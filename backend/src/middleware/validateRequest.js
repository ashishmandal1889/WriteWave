import { validationResult } from 'express-validator';
import AppError from '../utils/AppError.js';

/**
 * Middleware to check results from express-validator rule chains
 */
export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
      value: err.value
    }));
    return next(new AppError('Validation error', 400, formattedErrors));
  }
  next();
};

export default validateRequest;
