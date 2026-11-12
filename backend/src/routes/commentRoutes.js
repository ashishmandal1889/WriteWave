import { Router } from 'express';
import {
  addComment,
  getComments,
  updateComment,
  deleteComment,
  toggleCommentLike
} from '../controllers/commentController.js';
import { protect, optionalAuth } from '../middleware/auth.js';

const router = Router();

router.get('/article/:articleId', optionalAuth, getComments);
router.post('/article/:articleId', protect, addComment);
router.put('/:id', protect, updateComment);
router.delete('/:id', protect, deleteComment);
router.post('/:id/like', protect, toggleCommentLike);

export default router;
