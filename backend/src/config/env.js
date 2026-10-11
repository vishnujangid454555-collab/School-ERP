import dotenv from 'dotenv';
dotenv.config();

function required(name, fallback = undefined) {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    // Fail fast at boot rather than deep inside a request handler.
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 5000),
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  enforcePermissions: process.env.ENFORCE_PERMISSIONS === 'true',

  jwt: {
    accessSecret: required('JWT_ACCESS_SECRET'),
    refreshSecret: required('JWT_REFRESH_SECRET'),
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '1h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  firebase: {
    serviceAccountPath: process.env.FIREBASE_SERVICE_ACCOUNT_PATH,
    serviceAccountJson: process.env.FIREBASE_SERVICE_ACCOUNT_JSON,
  },

  bootstrapSuperAdmin: {
    email: process.env.BOOTSTRAP_SUPER_ADMIN_EMAIL,
    password: process.env.BOOTSTRAP_SUPER_ADMIN_PASSWORD,
    name: process.env.BOOTSTRAP_SUPER_ADMIN_NAME || 'Platform Owner',
  },
};
