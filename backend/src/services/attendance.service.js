import { getDb } from '../config/firebase.js';
import { COLLECTIONS } from '../constants/collections.js';
import { attendanceBatchSchema, attendanceQuerySchema } from '../validations/attendance.validation.js';

export async function getStudentAttendance(query) {
  const filters = attendanceQuerySchema.parse(query);
  const snapshot = await getDb().collection(COLLECTIONS.ATTENDANCE).where('date', '==', filters.date).get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })).filter((record) => record.className === filters.className && record.sectionName === filters.sectionName);
}

export async function saveStudentAttendance(payload, userId) {
  const data = attendanceBatchSchema.parse(payload);
  const batch = getDb().batch();
  const now = new Date().toISOString();
  data.entries.forEach((entry) => {
    const ref = getDb().collection(COLLECTIONS.ATTENDANCE).doc(`${data.date}_${entry.studentId}`);
    batch.set(ref, { ...entry, date: data.date, className: data.className, sectionName: data.sectionName, updatedAt: now, updatedBy: userId }, { merge: true });
  });
  await batch.commit();
  return getStudentAttendance(data);
}