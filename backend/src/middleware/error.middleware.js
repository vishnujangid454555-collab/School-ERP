import { ApiError } from '../utils/ApiError.js';
import { ZodError } from 'zod';

export function notFoundHandler(req, res) {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
}

export function errorHandler(error, req, res, _next) {
  const isValidationError = error instanceof ZodError;
  const statusCode = error instanceof ApiError ? error.statusCode : isValidationError ? 400 : 500;
  const message = statusCode === 500 ? 'Internal server error' : isValidationError ? 'Validation failed' : error.message;

  if (statusCode === 500) console.error(error);
  res.status(statusCode).json({ success: false, message, ...(error.details ? { details: error.details } : {}), ...(isValidationError ? { details: error.flatten() } : {}) });
}
