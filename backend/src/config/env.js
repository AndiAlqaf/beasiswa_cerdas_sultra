/**
 * Environment Configuration
 * Validates all required environment variables at startup.
 * Fails fast if any are missing — never run with incomplete config.
 */

const dotenv = require('dotenv');
const path = require('path');
const crypto = require('crypto');

// Load .env from backend root
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

/**
 * Auto-generate secure secrets for development if not provided.
 * In production, these MUST be set explicitly in .env
 */
function getOrGenerateSecret(envKey, envValue) {
  if (envValue && envValue !== '' && !envValue.startsWith('CHANGE_ME')) {
    return envValue;
  }
  if (process.env.NODE_ENV === 'production') {
    console.error(`[FATAL] ${envKey} must be set in production. Exiting.`);
    process.exit(1);
  }
  const generated = crypto.randomBytes(64).toString('hex');
  console.warn(`[WARN] ${envKey} not set — auto-generated for development. Set it in .env for production!`);
  return generated;
}

const env = {
  // Server
  PORT: parseInt(process.env.PORT, 10) || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',

  // JWT
  JWT_ACCESS_SECRET: getOrGenerateSecret('JWT_ACCESS_SECRET', process.env.JWT_ACCESS_SECRET),
  JWT_REFRESH_SECRET: getOrGenerateSecret('JWT_REFRESH_SECRET', process.env.JWT_REFRESH_SECRET),
  JWT_ACCESS_EXPIRY: process.env.JWT_ACCESS_EXPIRY || '15m',
  JWT_REFRESH_EXPIRY: process.env.JWT_REFRESH_EXPIRY || '7d',

  // CORS
  CORS_ORIGINS: (process.env.CORS_ORIGINS || 'http://localhost:3000,http://localhost:3001')
    .split(',')
    .map(s => s.trim()),

  // Bcrypt
  BCRYPT_SALT_ROUNDS: parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 12,

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 900000,
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
  AUTH_RATE_LIMIT_MAX: parseInt(process.env.AUTH_RATE_LIMIT_MAX, 10) || 5,

  // File Upload
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE, 10) || 2 * 1024 * 1024, // 2MB
  UPLOAD_DIR: process.env.UPLOAD_DIR || path.join(__dirname, '..', '..', 'uploads'),

  // MySQL
  DB_HOST: process.env.DB_HOST || '127.0.0.1',
  DB_PORT: parseInt(process.env.DB_PORT, 10) || 3306,
  DB_USER: process.env.DB_USER || 'root',
  DB_PASSWORD: process.env.DB_PASSWORD || '',
  DB_NAME: process.env.DB_NAME || 'beasiswa_sultra_cerdas',
  DB_CONNECTION_LIMIT: parseInt(process.env.DB_CONNECTION_LIMIT, 10) || 20,
};

module.exports = env;
