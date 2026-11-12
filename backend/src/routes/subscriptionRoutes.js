import { Router } from 'express';
import {
  subscribe,
  unsubscribe,
  getMySubscriptions,
  getPublicationSubscribers
} from '../controllers/subscriptionController.js';
import { protect, optionalAuth } from '../middleware/auth.js';

const router = Router();

router.post('/', optionalAuth, subscribe);
router.post('/unsubscribe', unsubscribe);
router.get('/my', protect, getMySubscriptions);
router.get('/publication/:publicationId', protect, getPublicationSubscribers);

export default router;
