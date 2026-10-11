import { ApiError } from '../utils/ApiError.js';
import { verifyAccessToken } from '../utils/jwt.js';
import { env } from '../config/env.js';

export function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return next(new ApiError(401, 'Authentication required'));

  try {
    req.auth = verifyAccessToken(header.slice(7));
    return next();
  } catch {
    return next(new ApiError(401, 'Invalid or expired access token'));
  }
}

export function requirePermission(permission) {
  return (req, res, next) => {
    if (!env.enforcePermissions) return next();
    if (req.auth?.role === 'super_admin' || req.auth?.permissions?.includes(permission)) return next();
    return next(new ApiError(403, 'You do not have permission for this action'));
  };
}
