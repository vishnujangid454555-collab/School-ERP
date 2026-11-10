import { Router } from 'express';
import { listStudentAttendance, saveAttendance } from '../controllers/attendance.controller.js';
import { requireAuth, requirePermission } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
router.use(requireAuth);
router.get('/students', requirePermission('student-attendance:view'), asyncHandler(listStudentAttendance));
router.post('/students', requirePermission('student-attendance:edit'), asyncHandler(saveAttendance));
export default router;