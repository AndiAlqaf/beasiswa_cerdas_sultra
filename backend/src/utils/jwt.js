/**
 * JWT Utility — Token Generation & Verification
 * 
 * Uses HS512 algorithm for maximum security.
 * Access tokens are short-lived (15min), refresh tokens longer (7d).
 */

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const env = require('../config/env');
const { TOKEN_ALGORITHM } = require('../config/security');

/**
 * Generate an access token (short-lived)
 * @param {Object} payload - { id, email, role }
 * @returns {string} JWT token
 */
function generateAccessToken(payload) {
  return jwt.sign(
    {
      sub: payload.id,
      email: payload.email,
      role: payload.role,
      type: 'access',
    },
    env.JWT_ACCESS_SECRET,
    {
      algorithm: TOKEN_ALGORITHM,
      expiresIn: env.JWT_ACCESS_EXPIRY,
      issuer: 'beasiswa-sultra-cerdas',
      audience: 'bssc-api',
    }
  );
}

/**
 * Generate a refresh token (long-lived)
 * @param {Object} payload - { id }
 * @returns {{ token: string, hash: string }} Token and its hash for DB storage
 */
function generateRefreshToken(payload) {
  const token = jwt.sign(
    {
      sub: payload.id,
      type: 'refresh',
      jti: crypto.randomUUID(), // unique token ID
    },
    env.JWT_REFRESH_SECRET,
    {
      algorithm: TOKEN_ALGORITHM,
      expiresIn: env.JWT_REFRESH_EXPIRY,
      issuer: 'beasiswa-sultra-cerdas',
    }
  );

  // Store hash in DB, not the raw token
  const hash = crypto.createHash('sha256').update(token).digest('hex');
  return { token, hash };
}

/**
 * Verify an access token
 * @param {string} token
 * @returns {Object} Decoded payload
 * @throws {Error} If invalid or expired
 */
function verifyAccessToken(token) {
  return jwt.verify(token, env.JWT_ACCESS_SECRET, {
    algorithms: [TOKEN_ALGORITHM],
    issuer: 'beasiswa-sultra-cerdas',
    audience: 'bssc-api',
  });
}

/**
 * Verify a refresh token
 * @param {string} token
 * @returns {Object} Decoded payload
 * @throws {Error} If invalid or expired
 */
function verifyRefreshToken(token) {
  return jwt.verify(token, env.JWT_REFRESH_SECRET, {
    algorithms: [TOKEN_ALGORITHM],
    issuer: 'beasiswa-sultra-cerdas',
  });
}

/**
 * Hash a token for DB storage (never store raw tokens)
 * @param {string} token
 * @returns {string} SHA-256 hash
 */
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  hashToken,
};
