import { getDb } from '../config/firebase.js';

export function getSystemHealth() {
  getDb();
  return { api: 'ok', firestore: 'connected', timestamp: new Date().toISOString() };
}
