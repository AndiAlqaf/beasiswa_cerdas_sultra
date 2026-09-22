/**
 * Password Utility — Bcrypt Hashing & Comparison
 * 
 * Uses bcrypt with configurable salt rounds (default: 12).
 * Each hash is unique even for the same password (random salt).
 */

const bcrypt = require('bcrypt');
const env = require('../config/env');

/**
 * Hash a plaintext password
 * @param {string} plaintext
 * @returns {Promise<string>} Hashed password
 */
async function hashPassword(plaintext) {
  return bcrypt.hash(plaintext, env.BCRYPT_SALT_ROUNDS);
}

/**
 * Compare plaintext against a hash
 * @param {string} plaintext
 * @param {string} hash
 * @returns {Promise<boolean>} True if match
 */
async function comparePassword(plaintext, hash) {
  return bcrypt.compare(plaintext, hash);
}

module.exports = { hashPassword, comparePassword };
