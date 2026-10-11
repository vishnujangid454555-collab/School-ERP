import { loginSchema, registerSchema } from '../validations/auth.validation.js';
import { loginUser, refreshUser, registerUser } from '../services/auth.service.js';
import { sendSuccess } from '../utils/ApiResponse.js';

export async function register(req, res) {
  const credentials = registerSchema.parse(req.body);
  return sendSuccess(res, await registerUser(credentials), 'Account created');
}

export async function login(req, res) {
  const credentials = loginSchema.parse(req.body);
  return sendSuccess(res, await loginUser(credentials), 'Signed in');
}

export function refresh(req, res) {
  return sendSuccess(res, refreshUser(req.body?.refreshToken), 'Token refreshed');
}

export function currentUser(req, res) {
  return sendSuccess(res, { user: req.auth }, 'Current user');
}
