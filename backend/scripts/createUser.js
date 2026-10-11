import { getDb } from '../src/config/firebase.js';
import { COLLECTIONS } from '../src/constants/collections.js';
import { env } from '../src/config/env.js';
import { hashPassword } from '../src/utils/password.js';
import { generateUniqueUserId } from '../src/services/auth.service.js';

const email = process.argv[2] || env.bootstrapSuperAdmin.email;
const password = process.argv[3] || env.bootstrapSuperAdmin.password;
const name = process.argv[4] || env.bootstrapSuperAdmin.name;

if (!email || !password) throw new Error('Provide email and password arguments or configure bootstrap env values.');
const existing = await getDb().collection(COLLECTIONS.USERS).where('email', '==', email.toLowerCase()).limit(1).get();
if (!existing.empty) throw new Error('A user with this email already exists.');

const allUsers = await getDb().collection(COLLECTIONS.USERS).select('userId').get();
const usedUserIds = new Set(allUsers.docs
  .map((doc) => doc.data().userId)
  .filter((value) => Number.isInteger(value) && String(value).length === 4));
const userId = generateUniqueUserId(usedUserIds);

await getDb().collection(COLLECTIONS.USERS).add({
  userId,
  name,
  email: email.toLowerCase(),
  passwordHash: await hashPassword(password),
  role: 'super_admin',
  permissions: [],
  status: 'active',
  createdAt: new Date().toISOString(),
});
console.log(`Created super admin ${email} with user ID ${userId}`);
