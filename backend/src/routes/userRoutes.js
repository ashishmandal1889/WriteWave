import { Router } from 'express';
import {
  getWriterProfile,
  updateProfile,
  toggleFollow,
  getRecommendedWriters
} from '../controllers/userController.js';
import { protect, optionalAuth } from '../middleware/auth.js';

const router = Router();

router.get('/recommended', getRecommendedWriters);
router.get('/profile/:usernameOrId', optionalAuth, getWriterProfile);
router.put('/profile', protect, updateProfile);
router.post('/:id/follow', protect, toggleFollow);

export default router;
