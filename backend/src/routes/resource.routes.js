import { Router } from 'express';
import { create, get, list, remove, update } from '../controllers/resource.controller.js';
import { requireAuth, requirePermission } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export function resourceRoutes(resource) {
  const router = Router();
  router.use(requireAuth, (req, res, next) => { req.resource = resource; next(); });
  router.get('/', requirePermission(`${resource.key}:view`), asyncHandler(list));
  router.get('/:id', requirePermission(`${resource.key}:view`), asyncHandler(get));
  router.post('/', requirePermission(`${resource.key}:create`), asyncHandler(create));
  router.patch('/:id', requirePermission(`${resource.key}:edit`), asyncHandler(update));
  router.delete('/:id', requirePermission(`${resource.key}:delete`), asyncHandler(remove));
  return router;
}
