import { importStudents } from '../services/studentImport.service.js';
import { sendSuccess } from '../utils/ApiResponse.js';

export async function importStudentRows(req, res) {
  return sendSuccess(res, await importStudents(req.body, req.auth.sub), 'Student import completed');
}
