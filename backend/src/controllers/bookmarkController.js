import Bookmark from '../models/Bookmark.js';
import Article from '../models/Article.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * Toggle bookmark on an article
 * POST /api/v1/bookmarks/:articleId
 */
export const toggleBookmark = asyncHandler(async (req, res, next) => {
  const { articleId } = req.params;

  const article = await Article.findById(articleId);
  if (!article) {
    return next(new AppError('Article not found', 404));
  }

  const existingBookmark = await Bookmark.findOne({ user: req.user._id, article: article._id });

  let isBookmarked;
  if (existingBookmark) {
    await Bookmark.findByIdAndDelete(existingBookmark._id);
    isBookmarked = false;
    res.status(200).json({
      success: true,
      message: 'Article removed from bookmarks',
      isBookmarked
    });
  } else {
    await Bookmark.create({ user: req.user._id, article: article._id });
    isBookmarked = true;
    res.status(200).json({
      success: true,
      message: 'Article bookmarked successfully',
      isBookmarked
    });
  }
});

/**
 * Get all bookmarks for current user
 * GET /api/v1/bookmarks/my
 */
export const getMyBookmarks = asyncHandler(async (req, res) => {
  const bookmarks = await Bookmark.find({ user: req.user._id })
    .populate({
      path: 'article',
      populate: [
        { path: 'publication', select: 'name slug logoUrl category' },
        { path: 'author', select: 'fullName username avatarUrl' }
      ]
    })
    .sort({ createdAt: -1 });

  // Filter out any bookmarks whose article may have been deleted
  const validBookmarks = bookmarks
    .filter((b) => b.article)
    .map((b) => b.article);

  res.status(200).json({
    success: true,
    count: validBookmarks.length,
    bookmarks: validBookmarks
  });
});

export default {
  toggleBookmark,
  getMyBookmarks
};
