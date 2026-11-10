import { getDb } from '../config/firebase.js';
import { ApiError } from '../utils/ApiError.js';
import { parseResourcePayload } from '../validations/resource.validation.js';

export async function listRecords(collectionName, { search = '', page = 1, limit = 25 } = {}) {
  const safePage = Math.max(Number(page) || 1, 1);
  const safeLimit = Math.min(Math.max(Number(limit) || 25, 1), 100);
  const snapshot = await getDb().collection(collectionName).orderBy('createdAt', 'desc').get();
  const normalizedSearch = String(search).trim().toLowerCase();
  const records = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })).filter((record) => !normalizedSearch || JSON.stringify(record).toLowerCase().includes(normalizedSearch));
  const start = (safePage - 1) * safeLimit;
  return { records: records.slice(start, start + safeLimit), page: safePage, limit: safeLimit, total: records.length, totalPages: Math.ceil(records.length / safeLimit) };
}

export async function getRecord(collectionName, id) {
  const doc = await getDb().collection(collectionName).doc(id).get();
  if (!doc.exists) throw new ApiError(404, 'Record not found');
  return { id: doc.id, ...doc.data() };
}

function normalized(value) {
  return String(value || '').trim().toLowerCase();
}

async function ensureUniqueAdmissionEnquiry(collectionName, data, excludeId = null) {
  if (collectionName !== 'admissionEnquiries') return;
  const snapshot = await getDb().collection(collectionName).get();
  const duplicate = snapshot.docs.some((doc) => {
    if (doc.id === excludeId) return false;
    const existing = doc.data();
    return normalized(existing.name) === normalized(data.name)
      && normalized(existing.phone) === normalized(data.phone)
      && normalized(existing.className) === normalized(data.className);
  });
  if (duplicate) throw new ApiError(409, 'This admission enquiry already exists');
}

export async function createRecord(collectionName, payload, userId) {
  const data = parseResourcePayload(payload);
  await ensureUniqueAdmissionEnquiry(collectionName, data);
  const now = new Date().toISOString();
  const record = { ...data, createdAt: now, updatedAt: now, createdBy: userId };
  const ref = await getDb().collection(collectionName).add(record);
  return { id: ref.id, ...record };
}

export async function updateRecord(collectionName, id, payload, userId) {
  const existing = await getRecord(collectionName, id);
  const data = parseResourcePayload({ ...existing, ...payload });
  await ensureUniqueAdmissionEnquiry(collectionName, data, id);
  const record = { ...data, updatedBy: userId, updatedAt: new Date().toISOString() };
  await getDb().collection(collectionName).doc(id).set(record, { merge: true });
  return { ...existing, ...record, id };
}

export async function deleteRecord(collectionName, id) {
  await getRecord(collectionName, id);
  await getDb().collection(collectionName).doc(id).delete();
}
