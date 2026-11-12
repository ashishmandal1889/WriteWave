import { Router } from 'express';
import { toggleBookmark, getMyBookmarks } from '../controllers/bookmarkController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.get('/my', protect, getMyBookmarks);
router.post('/:articleId', protect, toggleBookmark);

export default router;
