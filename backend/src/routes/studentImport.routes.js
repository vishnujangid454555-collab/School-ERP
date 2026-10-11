import { Router } from 'express';
import { importStudentRows } from '../controllers/studentImport.controller.js';
import { requireAuth, requirePermission } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
router.post('/students/import', requireAuth, requirePermission('student-import:create'), asyncHandler(importStudentRows));
export default router;
