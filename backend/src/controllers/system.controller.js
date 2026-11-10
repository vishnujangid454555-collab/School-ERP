import { sendSuccess } from '../utils/ApiResponse.js';
import { getSystemHealth } from '../services/system.service.js';

export function healthCheck(req, res) {
  return sendSuccess(res, getSystemHealth(), 'System is healthy');
}
