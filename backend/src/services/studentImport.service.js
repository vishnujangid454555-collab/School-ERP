import { getDb } from '../config/firebase.js';
import { COLLECTIONS } from '../constants/collections.js';
import { studentImportSchema } from '../validations/studentImport.validation.js';

export async function importStudents(payload, userId) {
  const { rows } = studentImportSchema.parse(payload);
  const existingSnapshot = await getDb().collection(COLLECTIONS.STUDENTS).get();
  const existingCodes = new Set(existingSnapshot.docs.map((doc) => doc.data().code).filter(Boolean));
  const seenCodes = new Set();
  const accepted = [];
  const errors = [];

  rows.forEach((row, index) => {
    const rowNumber = index + 2;
    if (row.code && (existingCodes.has(row.code) || seenCodes.has(row.code))) {
      errors.push({ row: rowNumber, message: `Duplicate student code: ${row.code}` });
      return;
    }
    if (row.code) seenCodes.add(row.code);
    accepted.push(row);
  });

  const batch = getDb().batch();
  const now = new Date().toISOString();
  accepted.forEach((row) => {
    const ref = getDb().collection(COLLECTIONS.STUDENTS).doc();
    batch.set(ref, { ...row, createdAt: now, updatedAt: now, createdBy: userId, source: 'import' });
  });
  if (accepted.length) await batch.commit();

  return { imported: accepted.length, skipped: errors.length, errors };
}
