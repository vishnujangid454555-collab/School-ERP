import { getDashboardSummary } from '../services/dashboard.service.js';
import { sendSuccess } from '../utils/ApiResponse.js';

export async function summary(req, res) {
  return sendSuccess(res, await getDashboardSummary(), 'Dashboard summary');
}
