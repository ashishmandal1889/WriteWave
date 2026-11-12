import Comment from '../models/Comment.js';
import Article from '../models/Article.js';
import Like from '../models/Like.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * Add a comment to an article
 * POST /api/v1/comments/article/:articleId
 */
export const addComment = asyncHandler(async (req, res, next) => {
  const { articleId } = req.params;
  const { content } = req.body;

  if (!content || !content.trim()) {
    return next(new AppError('Comment content cannot be empty', 400));
  }

  const article = await Article.findById(articleId);
  if (!article) {
    return next(new AppError('Article not found', 404));
  }

  const comment = await Comment.create({
    article: article._id,
    user: req.user._id,
    content: content.trim()
  });

  await Article.findByIdAndUpdate(article._id, { $inc: { commentsCount: 1 } });

  const populated = await Comment.findById(comment._id).populate('user', 'fullName username avatarUrl');

  res.status(201).json({
    success: true,
    message: 'Comment posted successfully',
    comment: populated
  });
});

/**
 * Get comments for an article
 * GET /api/v1/comments/article/:articleId
 */
export const getComments = asyncHandler(async (req, res, next) => {
  const { articleId } = req.params;

  const comments = await Comment.find({ article: articleId })
    .populate('user', 'fullName username avatarUrl')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: comments.length,
    comments
  });
});

/**
 * Update an existing comment
 * PUT /api/v1/comments/:id
 */
export const updateComment = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { content } = req.body;

  if (!content || !content.trim()) {
    return next(new AppError('Comment content cannot be empty', 400));
  }

  const comment = await Comment.findById(id);
  if (!comment) {
    return next(new AppError('Comment not found', 404));
  }

  if (comment.user.toString() !== req.user._id.toString()) {
    return next(new AppError('Unauthorized: You can only edit your own comment', 403));
  }

  comment.content = content.trim();
  await comment.save();

  const populated = await Comment.findById(comment._id).populate('user', 'fullName username avatarUrl');

  res.status(200).json({
    success: true,
    message: 'Comment updated successfully',
    comment: populated
  });
});

/**
 * Delete a comment
 * DELETE /api/v1/comments/:id
 */
export const deleteComment = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const comment = await Comment.findById(id);
  if (!comment) {
    return next(new AppError('Comment not found', 404));
  }

  if (comment.user.toString() !== req.user._id.toString()) {
    return next(new AppError('Unauthorized: You can only delete your own comment', 403));
  }

  await Comment.findByIdAndDelete(id);

  // Decrement article commentsCount
  await Article.findByIdAndUpdate(comment.article, { $inc: { commentsCount: -1 } });

  res.status(200).json({
    success: true,
    message: 'Comment deleted successfully'
  });
});

/**
 * Like / unlike a comment
 * POST /api/v1/comments/:id/like
 */
export const toggleCommentLike = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const comment = await Comment.findById(id);
  if (!comment) {
    return next(new AppError('Comment not found', 404));
  }

  const existingLike = await Like.findOne({ user: req.user._id, comment: comment._id });

  if (existingLike) {
    await Like.findByIdAndDelete(existingLike._id);
    await Comment.findByIdAndUpdate(comment._id, { $inc: { likesCount: -1 } });
    res.status(200).json({ success: true, message: 'Unliked comment', hasLiked: false });
  } else {
    await Like.create({ user: req.user._id, comment: comment._id });
    await Comment.findByIdAndUpdate(comment._id, { $inc: { likesCount: 1 } });
    res.status(200).json({ success: true, message: 'Liked comment', hasLiked: true });
  }
});

export default {
  addComment,
  getComments,
  updateComment,
  deleteComment,
  toggleCommentLike
};
