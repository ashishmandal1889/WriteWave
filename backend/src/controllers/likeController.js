import Like from '../models/Like.js';
import Article from '../models/Article.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * Toggle like on an article
 * POST /api/v1/likes/article/:articleId
 */
export const toggleArticleLike = asyncHandler(async (req, res, next) => {
  const { articleId } = req.params;

  const article = await Article.findById(articleId);
  if (!article) {
    return next(new AppError('Article not found', 404));
  }

  const existingLike = await Like.findOne({ user: req.user._id, article: article._id });

  let hasLiked;
  if (existingLike) {
    await Like.findByIdAndDelete(existingLike._id);
    const updated = await Article.findByIdAndUpdate(
      article._id,
      { $inc: { likesCount: -1 } },
      { new: true }
    );
    hasLiked = false;
    res.status(200).json({
      success: true,
      message: 'Article unliked',
      hasLiked,
      likesCount: updated.likesCount
    });
  } else {
    await Like.create({ user: req.user._id, article: article._id });
    const updated = await Article.findByIdAndUpdate(
      article._id,
      { $inc: { likesCount: 1 } },
      { new: true }
    );
    hasLiked = true;
    res.status(200).json({
      success: true,
      message: 'Article liked',
      hasLiked,
      likesCount: updated.likesCount
    });
  }
});

/**
 * Get like status for an article
 * GET /api/v1/likes/article/:articleId
 */
export const getArticleLikeStatus = asyncHandler(async (req, res) => {
  const { articleId } = req.params;

  let hasLiked = false;
  if (req.user) {
    const existingLike = await Like.findOne({ user: req.user._id, article: articleId });
    hasLiked = Boolean(existingLike);
  }

  const article = await Article.findById(articleId).select('likesCount');
  const likesCount = article ? article.likesCount : 0;

  res.status(200).json({
    success: true,
    hasLiked,
    likesCount
  });
});

export default {
  toggleArticleLike,
  getArticleLikeStatus
};
