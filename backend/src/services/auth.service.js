import { getDb } from '../config/firebase.js';
import { COLLECTIONS } from '../constants/collections.js';
import { ApiError } from '../utils/ApiError.js';
import { comparePassword, hashPassword } from '../utils/password.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.js';

const MIN_USER_ID = 1000;
const MAX_USER_ID = 9999;

export function generateUniqueUserId(usedIds = new Set()) {
  let candidate = Math.floor(Math.random() * (MAX_USER_ID - MIN_USER_ID + 1)) + MIN_USER_ID;

  while (usedIds.has(candidate)) {
    candidate = Math.floor(Math.random() * (MAX_USER_ID - MIN_USER_ID + 1)) + MIN_USER_ID;
  }

  return candidate;
}

export function getNumericUserId(value) {
  if (Number.isInteger(value) && String(value).length === 4) return value;
  if (typeof value === 'string' && /^\d{4}$/.test(value.trim())) return Number(value);
  return null;
}

async function createUserId() {
  const allUsers = await getDb().collection(COLLECTIONS.USERS).select('userId').get();
  const usedIds = new Set(
    allUsers.docs
      .map((doc) => getNumericUserId(doc.data().userId))
      .filter((value) => value !== null)
  );
  return generateUniqueUserId(usedIds);
}

function createAuthResponse(user) {
  const userId = getNumericUserId(user.userId);
  const permissions = Array.isArray(user.permissions) ? user.permissions : [];
  const claims = { sub: String(userId), email: user.email, role: user.role, permissions };
  const token = signAccessToken(claims);
  const refreshToken = signRefreshToken(claims);
  return { token, refreshToken, user: { id: userId, name: user.name, email: user.email, role: user.role, permissions } };
}

export function refreshUser(refreshToken) {
  const claims = verifyRefreshToken(refreshToken);
  const userId = Number(claims.sub);
  if (!Number.isInteger(userId) || !claims.email) throw new ApiError(401, 'Invalid or expired refresh token');

  const permissions = Array.isArray(claims.permissions) ? claims.permissions : [];
  const accessClaims = { sub: String(userId), email: claims.email, role: claims.role, permissions };
  return {
    token: signAccessToken(accessClaims),
    user: { id: userId, email: claims.email, role: claims.role, permissions },
  };
}

export async function registerUser({ name, email, password }) {
  const normalizedEmail = email.toLowerCase();
  const existing = await getDb().collection(COLLECTIONS.USERS).where('email', '==', normalizedEmail).limit(1).get();
  if (!existing.empty) throw new ApiError(409, 'An account with this email already exists');

  const user = {
    userId: await createUserId(),
    name,
    email: normalizedEmail,
    passwordHash: await hashPassword(password),
    role: 'customer',
    permissions: [],
    status: 'active',
    createdAt: new Date().toISOString(),
  };

  await getDb().collection(COLLECTIONS.USERS).add(user);
  return createAuthResponse(user);
}

export async function loginUser({ email, password }) {
  const snapshot = await getDb().collection(COLLECTIONS.USERS).where('email', '==', email.toLowerCase()).limit(1).get();
  if (snapshot.empty) throw new ApiError(401, 'Invalid email or password');

  const userDoc = snapshot.docs[0];
  const dbUser = userDoc.data();
  const existingUserId = getNumericUserId(dbUser.userId);

  if (!existingUserId) {
    const allUsers = await getDb().collection(COLLECTIONS.USERS).select('userId').get();
    const usedIds = new Set(
      allUsers.docs
        .map((doc) => getNumericUserId(doc.data().userId))
        .filter((value) => value !== null)
    );

    const nextUserId = generateUniqueUserId(usedIds);
    await userDoc.ref.update({ userId: nextUserId });
    dbUser.userId = nextUserId;
  }

  const user = { ...dbUser, id: dbUser.userId };
  if (user.status === 'inactive' || !(await comparePassword(password, user.passwordHash))) {
    throw new ApiError(401, 'Invalid email or password');
  }

  return createAuthResponse(user);
}
