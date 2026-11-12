import Publication from '../models/Publication.js';
import Article from '../models/Article.js';
import Subscription from '../models/Subscription.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';

// Helper to sanitize slug
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
};

/**
 * Create a new publication
 * POST /api/v1/publications
 */
export const createPublication = asyncHandler(async (req, res, next) => {
  const { name, description, logoUrl, coverImageUrl, category, about, slug } = req.body;

  if (!name || !description) {
    return next(new AppError('Publication name and description are required', 400));
  }

  let finalSlug = slug ? slugify(slug) : slugify(name);
  if (!finalSlug) {
    finalSlug = `pub-${Date.now()}`;
  }

  // Ensure unique slug
  const existingSlug = await Publication.findOne({ slug: finalSlug });
  if (existingSlug) {
    finalSlug = `${finalSlug}-${Math.floor(100 + Math.random() * 900)}`;
  }

  const publication = await Publication.create({
    name: name.trim(),
    slug: finalSlug,
    description: description.trim(),
    about: about ? about.trim() : '',
    logoUrl: logoUrl ? logoUrl.trim() : '',
    coverImageUrl: coverImageUrl ? coverImageUrl.trim() : '',
    category: category || 'General',
    author: req.user._id
  });

  res.status(201).json({
    success: true,
    message: 'Publication created successfully',
    publication
  });
});

/**
 * Get all publications with filters and search
 * GET /api/v1/publications
 */
export const getPublications = asyncHandler(async (req, res) => {
  const { search, category, featured, limit = 12, page = 1 } = req.query;
  const query = {};

  if (category && category !== 'All') {
    query.category = category;
  }

  if (featured === 'true') {
    query.isFeatured = true;
  }

  if (search && search.trim()) {
    query.$or = [
      { name: { $regex: search.trim(), $options: 'i' } },
      { description: { $regex: search.trim(), $options: 'i' } }
    ];
  }

  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

  const [publications, total] = await Promise.all([
    Publication.find(query)
      .populate('author', 'fullName username avatarUrl')
      .sort({ subscriberCount: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10)),
    Publication.countDocuments(query)
  ]);

  res.status(200).json({
    success: true,
    count: publications.length,
    total,
    page: parseInt(page, 10),
    pages: Math.ceil(total / parseInt(limit, 10)),
    publications
  });
});

/**
 * Get a single publication by slug or ID
 * GET /api/v1/publications/:slugOrId
 */
export const getPublicationBySlug = asyncHandler(async (req, res, next) => {
  const { slugOrId } = req.params;

  const isObjectId = /^[0-9a-fA-F]{24}$/.test(slugOrId);
  const query = isObjectId ? { _id: slugOrId } : { slug: slugOrId.toLowerCase() };

  const publication = await Publication.findOne(query).populate('author', 'fullName username bio avatarUrl socialLinks');

  if (!publication) {
    return next(new AppError('Publication not found', 404));
  }

  // Count active subscribers accurately
  const subscriberCount = await Subscription.countDocuments({
    publication: publication._id,
    status: 'active'
  });

  // Fetch published articles belonging to this publication
  const articles = await Article.find({
    publication: publication._id,
    status: 'published'
  })
    .populate('author', 'fullName username avatarUrl')
    .sort({ publishedAt: -1, createdAt: -1 });

  res.status(200).json({
    success: true,
    publication: {
      ...publication.toObject(),
      subscriberCount,
      articles
    }
  });
});

/**
 * Get publications owned by current authenticated user
 * GET /api/v1/publications/my
 */
export const getMyPublications = asyncHandler(async (req, res) => {
  const publications = await Publication.find({ author: req.user._id }).sort({ createdAt: -1 });

  // Compute live subscriber and article counts for each
  const enriched = await Promise.all(
    publications.map(async (pub) => {
      const [subscribers, articlesCount] = await Promise.all([
        Subscription.countDocuments({ publication: pub._id, status: 'active' }),
        Article.countDocuments({ publication: pub._id })
      ]);
      return {
        ...pub.toObject(),
        subscriberCount: subscribers,
        articlesCount
      };
    })
  );

  res.status(200).json({
    success: true,
    publications: enriched
  });
});

/**
 * Update a publication
 * PUT /api/v1/publications/:id
 */
export const updatePublication = asyncHandler(async (req, res, next) => {
  const publication = await Publication.findById(req.params.id);

  if (!publication) {
    return next(new AppError('Publication not found', 404));
  }

  // Verify ownership
  if (publication.author.toString() !== req.user._id.toString()) {
    return next(new AppError('Unauthorized: You can only edit your own publication', 403));
  }

  const { name, description, about, logoUrl, coverImageUrl, category } = req.body;
  if (name) publication.name = name.trim();
  if (description) publication.description = description.trim();
  if (about !== undefined) publication.about = about.trim();
  if (logoUrl !== undefined) publication.logoUrl = logoUrl.trim();
  if (coverImageUrl !== undefined) publication.coverImageUrl = coverImageUrl.trim();
  if (category) publication.category = category;

  await publication.save();

  res.status(200).json({
    success: true,
    message: 'Publication updated successfully',
    publication
  });
});

/**
 * Delete a publication
 * DELETE /api/v1/publications/:id
 */
export const deletePublication = asyncHandler(async (req, res, next) => {
  const publication = await Publication.findById(req.params.id);

  if (!publication) {
    return next(new AppError('Publication not found', 404));
  }

  // Verify ownership
  if (publication.author.toString() !== req.user._id.toString()) {
    return next(new AppError('Unauthorized: You can only delete your own publication', 403));
  }

  await Publication.findByIdAndDelete(req.params.id);

  // Clean up associated articles & subscriptions
  await Promise.all([
    Article.deleteMany({ publication: req.params.id }),
    Subscription.deleteMany({ publication: req.params.id })
  ]);

  res.status(200).json({
    success: true,
    message: 'Publication and its associated articles deleted successfully'
  });
});

/**
 * Get distinct publication categories
 * GET /api/v1/publications/categories
 */
export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Publication.distinct('category');
  const defaults = ['Technology', 'Culture', 'Business', 'Writing', 'Design', 'Science', 'Finance', 'Life'];
  const allCategories = Array.from(new Set([...defaults, ...categories]));

  res.status(200).json({
    success: true,
    categories: allCategories
  });
});

export default {
  createPublication,
  getPublications,
  getPublicationBySlug,
  getMyPublications,
  updatePublication,
  deletePublication,
  getCategories
};
