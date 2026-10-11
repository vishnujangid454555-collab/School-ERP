import { getDb } from '../config/firebase.js';
import { COLLECTIONS } from '../constants/collections.js';

async function count(collection) {
  const snapshot = await getDb().collection(collection).count().get();
  return snapshot.data().count;
}

export async function getDashboardSummary() {
  const [students, staff, classes, sections, subjects] = await Promise.all([
    count(COLLECTIONS.STUDENTS),
    count(COLLECTIONS.STAFF),
    count(COLLECTIONS.CLASSES),
    count(COLLECTIONS.SECTIONS),
    count(COLLECTIONS.SUBJECTS),
  ]);
  return { students, staff, classes, sections, subjects, generatedAt: new Date().toISOString() };
}
