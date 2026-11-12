import Publication from '../models/Publication.js';
import Article from '../models/Article.js';
import Subscription from '../models/Subscription.js';
import Comment from '../models/Comment.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * Get comprehensive writer dashboard metrics and activity
 * GET /api/v1/dashboard/overview
 */
export const getDashboardOverview = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Find all publications owned by this writer
  const publications = await Publication.find({ author: userId });
  const publicationIds = publications.map((p) => p._id);

  // Find all articles written by this writer
  const articles = await Article.find({ author: userId });
  const articleIds = articles.map((a) => a._id);

  const publishedArticles = articles.filter((a) => a.status === 'published');
  const drafts = articles.filter((a) => a.status === 'draft');

  // Compute aggregate engagement metrics from actual database counts
  const totalViews = articles.reduce((sum, a) => sum + (a.viewsCount || 0), 0);
  const totalLikes = articles.reduce((sum, a) => sum + (a.likesCount || 0), 0);
  const totalComments = articles.reduce((sum, a) => sum + (a.commentsCount || 0), 0);

  // Total active subscribers across owned publications
  const totalSubscribers = await Subscription.countDocuments({
    publication: { $in: publicationIds },
    status: 'active'
  });

  // Recent 5 subscribers
  const recentSubscribers = await Subscription.find({
    publication: { $in: publicationIds },
    status: 'active'
  })
    .populate('publication', 'name slug')
    .sort({ createdAt: -1 })
    .limit(5);

  // Recent comments on writer's articles
  const recentComments = await Comment.find({ article: { $in: articleIds } })
    .populate('user', 'fullName username avatarUrl')
    .populate('article', 'title slug')
    .sort({ createdAt: -1 })
    .limit(5);

  res.status(200).json({
    success: true,
    metrics: {
      publicationsCount: publications.length,
      publishedArticlesCount: publishedArticles.length,
      draftsCount: drafts.length,
      totalSubscribers,
      totalViews,
      totalLikes,
      totalComments
    },
    publications,
    recentArticles: publishedArticles.slice(0, 5),
    recentDrafts: drafts.slice(0, 5),
    recentSubscribers,
    recentComments
  });
});

export default {
  getDashboardOverview
};
