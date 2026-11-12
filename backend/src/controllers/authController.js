import jwt from 'jsonwebtoken';
import config from '../config/environment.js';
import User from '../models/User.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';

const signToken = (id) => {
  return jwt.sign({ id }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn
  });
};

/**
 * Register a new user
 * POST /api/v1/auth/register
 */
export const register = asyncHandler(async (req, res, next) => {
  const { fullName, email, password, username } = req.body;

  if (!fullName || !email || !password) {
    return next(new AppError('Full name, email, and password are required', 400));
  }

  // Check if email already exists
  const existingEmail = await User.findOne({ email: email.toLowerCase() });
  if (existingEmail) {
    return next(new AppError('An account with this email address already exists', 400));
  }

  // Generate unique username if not provided
  let generatedUsername = username ? username.toLowerCase().replace(/[^a-z0-9_]/g, '') : '';
  if (!generatedUsername) {
    const base = fullName.toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 15);
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    generatedUsername = `${base}_${randomSuffix}`;
  }

  // Check username uniqueness
  const existingUsername = await User.findOne({ username: generatedUsername });
  if (existingUsername) {
    generatedUsername = `${generatedUsername}_${Date.now().toString().slice(-4)}`;
  }

  const user = await User.create({
    fullName: fullName.trim(),
    email: email.toLowerCase().trim(),
    password,
    username: generatedUsername
  });

  const token = signToken(user._id);

  res.status(201).json({
    success: true,
    message: 'Account registered successfully',
    token,
    user: {
      id: user._id,
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      socialLinks: user.socialLinks
    }
  });
});

/**
 * Login user
 * POST /api/v1/auth/login
 */
export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide both email and password', 400));
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    return next(new AppError('Invalid email or password', 401));
  }

  const token = signToken(user._id);

  res.status(200).json({
    success: true,
    message: 'Signed in successfully',
    token,
    user: {
      id: user._id,
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      socialLinks: user.socialLinks
    }
  });
});

/**
 * Get current authenticated user
 * GET /api/v1/auth/me
 */
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.status(200).json({
    success: true,
    user
  });
});

/**
 * Logout user
 * POST /api/v1/auth/logout
 */
export const logout = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};

export default {
  register,
  login,
  getMe,
  logout
};
