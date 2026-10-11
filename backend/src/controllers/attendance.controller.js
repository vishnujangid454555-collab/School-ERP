import { sendSuccess } from '../utils/ApiResponse.js';
import { getStudentAttendance, saveStudentAttendance } from '../services/attendance.service.js';

export async function listStudentAttendance(req, res) {
  return sendSuccess(res, await getStudentAttendance(req.query), 'Attendance loaded');
}

export async function saveAttendance(req, res) {
  return sendSuccess(res, await saveStudentAttendance(req.body, req.auth.sub), 'Attendance saved');
}