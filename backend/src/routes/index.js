import { Router } from 'express';
import systemRoutes from './system.routes.js';
import authRoutes from './auth.routes.js';
import { registerResourceRoutes } from './resource.registry.js';
import dashboardRoutes from './dashboard.routes.js';
import attendanceRoutes from './attendance.routes.js';
import studentImportRoutes from './studentImport.routes.js';

const router = Router();
router.use('/system', systemRoutes);
router.use('/auth', authRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/attendance', attendanceRoutes);
router.use(studentImportRoutes);
registerResourceRoutes(router);

export default router;
