import { Router } from 'express';
import { getHealth } from '../controllers/healthController.js';

const router = Router();

/**
 * @route   GET /api/v1/health
 * @desc    Public service health check endpoint
 * @access  Public
 */
router.get('/health', getHealth);

export default router;
