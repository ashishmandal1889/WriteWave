import { Router } from 'express';
import healthRoutes from './healthRoutes.js';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import publicationRoutes from './publicationRoutes.js';
import articleRoutes from './articleRoutes.js';
import subscriptionRoutes from './subscriptionRoutes.js';
import commentRoutes from './commentRoutes.js';
import likeRoutes from './likeRoutes.js';
import bookmarkRoutes from './bookmarkRoutes.js';
import dashboardRoutes from './dashboardRoutes.js';

const router = Router();

// Health Check API
router.use('/', healthRoutes);

// Substack-Inspired Independent Publishing Platform API Endpoints
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/publications', publicationRoutes);
router.use('/articles', articleRoutes);
router.use('/blogs', articleRoutes);
router.use('/subscriptions', subscriptionRoutes);
router.use('/comments', commentRoutes);
router.use('/likes', likeRoutes);
router.use('/bookmarks', bookmarkRoutes);
router.use('/dashboard', dashboardRoutes);

export default router;
