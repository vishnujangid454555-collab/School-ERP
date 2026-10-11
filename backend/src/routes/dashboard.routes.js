import { Router } from 'express';
import { summary } from '../controllers/dashboard.controller.js';
import { requireAuth, requirePermission } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
router.get('/summary', requireAuth, requirePermission('dashboard:view'), asyncHandler(summary));
export default router;
