import jwt from 'jsonwebtoken';
import config from '../config/environment.js';
import User from '../models/User.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * Protect middleware: Ensures request has a valid Bearer JWT
 */
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('Authentication required. Please sign in to access this resource.', 401));
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    const currentUser = await User.findById(decoded.id).select('-password');

    if (!currentUser) {
      return next(new AppError('The user belonging to this token no longer exists.', 401));
    }

    req.user = currentUser;
    next();
  } catch (err) {
    return next(new AppError('Invalid or expired authentication token. Please sign in again.', 401));
  }
});

/**
 * Optional Auth middleware: Attaches req.user if valid token provided, else sets req.user = null
 */
export const optionalAuth = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    const currentUser = await User.findById(decoded.id).select('-password');
    req.user = currentUser || null;
  } catch {
    req.user = null;
  }
  next();
});

export default {
  protect,
  optionalAuth
};
