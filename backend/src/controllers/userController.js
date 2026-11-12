import User from '../models/User.js';
import Publication from '../models/Publication.js';
import Article from '../models/Article.js';
import Subscription from '../models/Subscription.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * Get public writer profile by username or ID
 * GET /api/v1/users/profile/:usernameOrId
 */
export const getWriterProfile = asyncHandler(async (req, res, next) => {
  const { usernameOrId } = req.params;

  // Query either by MongoDB ObjectId or unique username
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(usernameOrId);
  const query = isObjectId ? { _id: usernameOrId } : { username: usernameOrId.toLowerCase() };

  const user = await User.findOne(query).select('-password');
  if (!user) {
    return next(new AppError('Writer not found', 404));
  }

  // Fetch publications owned by this writer
  const publications = await Publication.find({ author: user._id }).sort({ createdAt: -1 });

  // Fetch published articles written by this writer
  const articles = await Article.find({ author: user._id, status: 'published' })
    .populate('publication', 'name slug logoUrl')
    .sort({ publishedAt: -1, createdAt: -1 });

  // Calculate actual total subscriber count across publications
  const publicationIds = publications.map((p) => p._id);
  const totalSubscribers = await Subscription.countDocuments({
    publication: { $in: publicationIds },
    status: 'active'
  });

  res.status(200).json({
    success: true,
    writer: {
      id: user._id,
      fullName: user.fullName,
      username: user.username,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      socialLinks: user.socialLinks,
      followersCount: user.followers?.length || 0,
      followingCount: user.following?.length || 0,
      totalSubscribers,
      publications,
      articles
    }
  });
});

/**
 * Update current authenticated user's profile
 * PUT /api/v1/users/profile
 */
export const updateProfile = asyncHandler(async (req, res, next) => {
  const { fullName, bio, avatarUrl, socialLinks, username } = req.body;
  const updates = {};

  if (fullName) updates.fullName = fullName.trim();
  if (bio !== undefined) updates.bio = bio.trim();
  if (avatarUrl !== undefined) updates.avatarUrl = avatarUrl.trim();
  if (socialLinks) updates.socialLinks = socialLinks;

  if (username && username.toLowerCase() !== req.user.username) {
    const existing = await User.findOne({ username: username.toLowerCase().trim() });
    if (existing) {
      return next(new AppError('Username is already taken by another writer', 400));
    }
    updates.username = username.toLowerCase().trim();
  }

  const updatedUser = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true
  }).select('-password');

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    user: updatedUser
  });
});

/**
 * Follow or unfollow a writer
 * POST /api/v1/users/:id/follow
 */
export const toggleFollow = asyncHandler(async (req, res, next) => {
  const targetId = req.params.id;

  if (targetId === req.user._id.toString()) {
    return next(new AppError('You cannot follow yourself', 400));
  }

  const targetUser = await User.findById(targetId);
  if (!targetUser) {
    return next(new AppError('Writer not found', 404));
  }

  const isFollowing = targetUser.followers.some((f) => f.toString() === req.user._id.toString());

  if (isFollowing) {
    // Unfollow
    await User.findByIdAndUpdate(targetId, { $pull: { followers: req.user._id } });
    await User.findByIdAndUpdate(req.user._id, { $pull: { following: targetId } });
    res.status(200).json({ success: true, message: 'Unfollowed writer', isFollowing: false });
  } else {
    // Follow
    await User.findByIdAndUpdate(targetId, { $addToSet: { followers: req.user._id } });
    await User.findByIdAndUpdate(req.user._id, { $addToSet: { following: targetId } });
    res.status(200).json({ success: true, message: 'Followed writer', isFollowing: true });
  }
});

/**
 * Get recommended writers for homepage / explore
 * GET /api/v1/users/recommended
 */
export const getRecommendedWriters = asyncHandler(async (req, res) => {
  // Return writers with published articles
  const writers = await User.find()
    .select('fullName username bio avatarUrl socialLinks')
    .limit(6);

  res.status(200).json({
    success: true,
    writers
  });
});

export default {
  getWriterProfile,
  updateProfile,
  toggleFollow,
  getRecommendedWriters
};
