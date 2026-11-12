import { Router } from 'express';
import {
  createArticle,
  getArticles,
  getArticleBySlugOrId,
  getMyDrafts,
  getMyArticles,
  updateArticle,
  deleteArticle
} from '../controllers/articleController.js';
import { protect, optionalAuth } from '../middleware/auth.js';

const router = Router();

router.get('/drafts', protect, getMyDrafts);
router.get('/my', protect, getMyArticles);
router.get('/', optionalAuth, getArticles);
router.get('/:slugOrId', optionalAuth, getArticleBySlugOrId);
router.post('/', protect, createArticle);
router.put('/:id', protect, updateArticle);
router.delete('/:id', protect, deleteArticle);

export default router;
