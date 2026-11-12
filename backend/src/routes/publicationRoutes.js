import { Router } from 'express';
import {
  createPublication,
  getPublications,
  getPublicationBySlug,
  getMyPublications,
  updatePublication,
  deletePublication,
  getCategories
} from '../controllers/publicationController.js';
import { protect, optionalAuth } from '../middleware/auth.js';

const router = Router();

router.get('/categories', getCategories);
router.get('/my', protect, getMyPublications);
router.get('/', optionalAuth, getPublications);
router.get('/:slugOrId', optionalAuth, getPublicationBySlug);
router.post('/', protect, createPublication);
router.put('/:id', protect, updatePublication);
router.delete('/:id', protect, deletePublication);

export default router;
