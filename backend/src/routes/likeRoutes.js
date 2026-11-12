import { Router } from 'express';
import { toggleArticleLike, getArticleLikeStatus } from '../controllers/likeController.js';
import { protect, optionalAuth } from '../middleware/auth.js';

const router = Router();

router.post('/article/:articleId', protect, toggleArticleLike);
router.get('/article/:articleId', optionalAuth, getArticleLikeStatus);

export default router;
