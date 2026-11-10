import admin from 'firebase-admin';
import fs from 'fs';
import { env } from './env.js';

let app;

function loadCredential() {
  // Support either a JSON key file path (local dev) or a raw JSON string in
  // an env var (common on hosting platforms that don't allow file uploads).
  if (env.firebase.serviceAccountJson) {
    const parsed = JSON.parse(env.firebase.serviceAccountJson);
    return admin.credential.cert(parsed);
  }

  if (env.firebase.serviceAccountPath && fs.existsSync(env.firebase.serviceAccountPath)) {
    const parsed = JSON.parse(fs.readFileSync(env.firebase.serviceAccountPath, 'utf-8'));
    return admin.credential.cert(parsed);
  }

  throw new Error(
    'Firebase service account not found. Set FIREBASE_SERVICE_ACCOUNT_PATH or FIREBASE_SERVICE_ACCOUNT_JSON.'
  );
}

export function initFirebase() {
  if (!app) {
    app = admin.initializeApp({ credential: loadCredential() });
  }
  return app;
}

export function getDb() {
  initFirebase();
  return admin.firestore();
}

export { admin };
