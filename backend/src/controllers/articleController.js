import Article from '../models/Article.js';
import Publication from '../models/Publication.js';
import Subscription from '../models/Subscription.js';
import Comment from '../models/Comment.js';
import Like from '../models/Like.js';
import Bookmark from '../models/Bookmark.js';
import emailService from '../services/emailService.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';

const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
};

const calculateReadingTime = (content) => {
  if (!content) return '1 min read';
  const wordCount = content.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(wordCount / 200));
  return `${minutes} min read`;
};

/**
 * Create a new article or draft
 * POST /api/v1/articles
 */
export const createArticle = asyncHandler(async (req, res, next) => {
  const { title, subtitle, content, coverImageUrl, status = 'draft', isPremium = false, publicationId } = req.body;

  if (!title || !content || !publicationId) {
    return next(new AppError('Title, content, and publication are required', 400));
  }

  // Verify that the user owns the publication
  const publication = await Publication.findById(publicationId);
  if (!publication) {
    return next(new AppError('Publication not found', 404));
  }

  if (publication.author.toString() !== req.user._id.toString()) {
    return next(new AppError('You can only publish articles to your own publication', 403));
  }

  let baseSlug = slugify(title);
  if (!baseSlug) baseSlug = `article-${Date.now()}`;
  let finalSlug = baseSlug;

  const existingSlug = await Article.findOne({ slug: finalSlug });
  if (existingSlug) {
    finalSlug = `${baseSlug}-${Math.floor(100 + Math.random() * 900)}`;
  }

  const readingTime = calculateReadingTime(content);
  const isPublished = status === 'published';

  const article = await Article.create({
    title: title.trim(),
    subtitle: subtitle ? subtitle.trim() : '',
    slug: finalSlug,
    content,
    coverImageUrl: coverImageUrl ? coverImageUrl.trim() : '',
    status,
    isPremium: Boolean(isPremium),
    publication: publication._id,
    author: req.user._id,
    readingTime,
    publishedAt: isPublished ? new Date() : null
  });

  // If immediately published, queue newsletter notification to subscribers
  if (isPublished) {
    const activeSubscribers = await Subscription.find({
      publication: publication._id,
      status: 'active'
    }).select('subscriberEmail');

    if (activeSubscribers.length > 0) {
      const emailList = activeSubscribers.map((s) => s.subscriberEmail);
      emailService.sendNewsletterNotification({
        publicationName: publication.name,
        articleTitle: article.title,
        articleUrl: `/article/${article.slug}`,
        subscribers: emailList
      }).catch((err) => console.error('Newsletter dispatch log:', err.message));
    }
  }

  res.status(201).json({
    success: true,
    message: isPublished ? 'Article published successfully' : 'Draft saved successfully',
    article
  });
});

/**
 * Get all published articles with filters and search
 * GET /api/v1/articles
 */
export const getArticles = asyncHandler(async (req, res) => {
  const { search, category, publicationSlug, limit = 12, page = 1 } = req.query;
  const query = { status: 'published' };

  if (publicationSlug) {
    const pub = await Publication.findOne({ slug: publicationSlug.toLowerCase() });
    if (pub) {
      query.publication = pub._id;
    }
  }

  if (search && search.trim()) {
    query.$or = [
      { title: { $regex: search.trim(), $options: 'i' } },
      { subtitle: { $regex: search.trim(), $options: 'i' } },
      { content: { $regex: search.trim(), $options: 'i' } }
    ];
  }

  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

  const [articles, total] = await Promise.all([
    Article.find(query)
      .populate('publication', 'name slug logoUrl category')
      .populate('author', 'fullName username avatarUrl')
      .sort({ publishedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10)),
    Article.countDocuments(query)
  ]);

  res.status(200).json({
    success: true,
    count: articles.length,
    total,
    page: parseInt(page, 10),
    pages: Math.ceil(total / parseInt(limit, 10)),
    articles
  });
});

/**
 * Get a single article by ID or slug
 * GET /api/v1/articles/:slugOrId
 */
export const getArticleBySlugOrId = asyncHandler(async (req, res, next) => {
  const { slugOrId } = req.params;

  const isObjectId = /^[0-9a-fA-F]{24}$/.test(slugOrId);
  const query = isObjectId ? { _id: slugOrId } : { slug: slugOrId.toLowerCase() };

  const article = await Article.findOne(query)
    .populate('publication', 'name slug description logoUrl coverImageUrl about author')
    .populate('author', 'fullName username bio avatarUrl socialLinks');

  if (!article) {
    return next(new AppError('Article not found', 404));
  }

  // Increment views asynchronously
  Article.findByIdAndUpdate(article._id, { $inc: { viewsCount: 1 } }).exec();

  // If user is authenticated, determine like and bookmark status
  let hasLiked = false;
  let hasBookmarked = false;
  let isSubscribed = false;

  if (req.user) {
    const [likeCheck, bookmarkCheck, subCheck] = await Promise.all([
      Like.findOne({ user: req.user._id, article: article._id }),
      Bookmark.findOne({ user: req.user._id, article: article._id }),
      Subscription.findOne({
        publication: article.publication._id,
        $or: [{ subscriberEmail: req.user.email }, { subscriberUser: req.user._id }],
        status: 'active'
      })
    ]);
    hasLiked = Boolean(likeCheck);
    hasBookmarked = Boolean(bookmarkCheck);
    isSubscribed = Boolean(subCheck);
  }

  // Fetch comments for this article
  const comments = await Comment.find({ article: article._id })
    .populate('user', 'fullName username avatarUrl')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    article: {
      ...article.toObject(),
      hasLiked,
      hasBookmarked,
      isSubscribed,
      comments
    }
  });
});

/**
 * Get current user's drafts
 * GET /api/v1/articles/drafts
 */
export const getMyDrafts = asyncHandler(async (req, res) => {
  const drafts = await Article.find({ author: req.user._id, status: 'draft' })
    .populate('publication', 'name slug logoUrl')
    .sort({ updatedAt: -1 });

  res.status(200).json({
    success: true,
    drafts
  });
});

/**
 * Get current user's authored articles (both published and drafts)
 * GET /api/v1/articles/my
 */
export const getMyArticles = asyncHandler(async (req, res) => {
  const articles = await Article.find({ author: req.user._id })
    .populate('publication', 'name slug logoUrl')
    .sort({ updatedAt: -1 });

  res.status(200).json({
    success: true,
    articles
  });
});

/**
 * Update an article
 * PUT /api/v1/articles/:id
 */
export const updateArticle = asyncHandler(async (req, res, next) => {
  const article = await Article.findById(req.params.id);

  if (!article) {
    return next(new AppError('Article not found', 404));
  }

  if (article.author.toString() !== req.user._id.toString()) {
    return next(new AppError('Unauthorized: You can only edit your own article', 403));
  }

  const { title, subtitle, content, coverImageUrl, status, isPremium, publicationId } = req.body;

  if (title) article.title = title.trim();
  if (subtitle !== undefined) article.subtitle = subtitle.trim();
  if (content) {
    article.content = content;
    article.readingTime = calculateReadingTime(content);
  }
  if (coverImageUrl !== undefined) article.coverImageUrl = coverImageUrl.trim();
  if (isPremium !== undefined) article.isPremium = Boolean(isPremium);

  // If transition from draft to published, record publish timestamp
  if (status && status !== article.status) {
    article.status = status;
    if (status === 'published' && !article.publishedAt) {
      article.publishedAt = new Date();
    }
  }

  if (publicationId) {
    const pub = await Publication.findById(publicationId);
    if (pub && pub.author.toString() === req.user._id.toString()) {
      article.publication = pub._id;
    }
  }

  await article.save();

  res.status(200).json({
    success: true,
    message: 'Article updated successfully',
    article
  });
});

/**
 * Delete an article
 * DELETE /api/v1/articles/:id
 */
export const deleteArticle = asyncHandler(async (req, res, next) => {
  const article = await Article.findById(req.params.id);

  if (!article) {
    return next(new AppError('Article not found', 404));
  }

  if (article.author.toString() !== req.user._id.toString()) {
    return next(new AppError('Unauthorized: You can only delete your own article', 403));
  }

  await Article.findByIdAndDelete(req.params.id);

  // Clean up associated comments, likes, and bookmarks
  await Promise.all([
    Comment.deleteMany({ article: req.params.id }),
    Like.deleteMany({ article: req.params.id }),
    Bookmark.deleteMany({ article: req.params.id })
  ]);

  res.status(200).json({
    success: true,
    message: 'Article deleted successfully'
  });
});

export default {
  createArticle,
  getArticles,
  getArticleBySlugOrId,
  getMyDrafts,
  getMyArticles,
  updateArticle,
  deleteArticle
};
