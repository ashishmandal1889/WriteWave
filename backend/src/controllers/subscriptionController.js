import Subscription from '../models/Subscription.js';
import Publication from '../models/Publication.js';
import emailService from '../services/emailService.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * Subscribe to a publication with email
 * POST /api/v1/subscriptions
 */
export const subscribe = asyncHandler(async (req, res, next) => {
  const { publicationId, email } = req.body;

  if (!publicationId || !email) {
    return next(new AppError('Publication ID and a valid email address are required', 400));
  }

  const cleanEmail = email.toLowerCase().trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    return next(new AppError('Please provide a valid email address', 400));
  }

  const publication = await Publication.findById(publicationId);
  if (!publication) {
    return next(new AppError('Publication not found', 404));
  }

  // Check for existing subscription record
  let subscription = await Subscription.findOne({
    publication: publication._id,
    subscriberEmail: cleanEmail
  });

  if (subscription) {
    if (subscription.status === 'active') {
      return res.status(200).json({
        success: true,
        message: `You are already subscribed to ${publication.name}.`,
        subscription
      });
    }

    // Reactivate subscription if previously unsubscribed
    subscription.status = 'active';
    if (req.user) subscription.subscriberUser = req.user._id;
    await subscription.save();
    await Publication.findByIdAndUpdate(publication._id, { $inc: { subscriberCount: 1 } });
  } else {
    // Create new subscription record
    subscription = await Subscription.create({
      subscriberEmail: cleanEmail,
      publication: publication._id,
      subscriberUser: req.user ? req.user._id : null,
      status: 'active'
    });
    await Publication.findByIdAndUpdate(publication._id, { $inc: { subscriberCount: 1 } });
  }

  // Trigger subscription confirmation notice via email service
  emailService.sendSubscriptionConfirmation(cleanEmail, publication.name).catch((err) => {
    console.error('Confirmation notice log:', err.message);
  });

  res.status(201).json({
    success: true,
    message: `Successfully subscribed to ${publication.name}.`,
    subscription
  });
});

/**
 * Unsubscribe from a publication
 * POST /api/v1/subscriptions/unsubscribe
 */
export const unsubscribe = asyncHandler(async (req, res, next) => {
  const { publicationId, email } = req.body;

  if (!publicationId || !email) {
    return next(new AppError('Publication ID and email address are required', 400));
  }

  const cleanEmail = email.toLowerCase().trim();

  const subscription = await Subscription.findOne({
    publication: publicationId,
    subscriberEmail: cleanEmail
  });

  if (!subscription || subscription.status === 'unsubscribed') {
    return res.status(200).json({
      success: true,
      message: 'Email is already unsubscribed.'
    });
  }

  subscription.status = 'unsubscribed';
  await subscription.save();

  // Decrement subscriberCount safely
  await Publication.findByIdAndUpdate(publicationId, {
    $inc: { subscriberCount: -1 }
  });

  res.status(200).json({
    success: true,
    message: 'Successfully unsubscribed from publication newsletters.'
  });
});

/**
 * Get active subscriptions for current logged-in user
 * GET /api/v1/subscriptions/my
 */
export const getMySubscriptions = asyncHandler(async (req, res) => {
  const subscriptions = await Subscription.find({
    $or: [{ subscriberUser: req.user._id }, { subscriberEmail: req.user.email }],
    status: 'active'
  })
    .populate('publication', 'name slug description logoUrl coverImageUrl category author')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    subscriptions
  });
});

/**
 * Get subscribers for a publication (author only)
 * GET /api/v1/subscriptions/publication/:publicationId
 */
export const getPublicationSubscribers = asyncHandler(async (req, res, next) => {
  const { publicationId } = req.params;

  const publication = await Publication.findById(publicationId);
  if (!publication) {
    return next(new AppError('Publication not found', 404));
  }

  if (publication.author.toString() !== req.user._id.toString()) {
    return next(new AppError('Unauthorized: You can only view subscribers for your own publication', 403));
  }

  const subscribers = await Subscription.find({
    publication: publication._id,
    status: 'active'
  })
    .populate('subscriberUser', 'fullName username avatarUrl')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: subscribers.length,
    subscribers
  });
});

export default {
  subscribe,
  unsubscribe,
  getMySubscriptions,
  getPublicationSubscribers
};
