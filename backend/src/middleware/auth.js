/**
 * Authentication & Authorization Middleware
 * 
 * Verifies JWT tokens and checks user roles.
 * Blocks blacklisted (logged-out) tokens.
 */

const { verifyAccessToken, hashToken } = require('../utils/jwt');
const { getPool } = require('../config/database');
const { log, LOG_LEVELS } = require('../utils/logger');

/**
 * Authenticate request via Bearer token
 * Extracts and verifies JWT from Authorization header.
 */
async function authenticate(req, res, next) {
  try {
    let authHeader = req.headers.authorization;
    let token = '';

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.query.token) {
      token = req.query.token;
    }

    if (!token || token.length < 10) {
      return res.status(401).json({
        success: false,
        message: 'Token autentikasi tidak ditemukan atau tidak valid.',
      });
    }

    // Check if token is blacklisted (user logged out)
    const tokenHash = hashToken(token);
    const pool = getPool();
    const [blacklisted] = await pool.execute(
      `SELECT 1 FROM token_blacklist WHERE token_hash = ?`,
      [tokenHash]
    );

    if (blacklisted.length > 0) {
      return res.status(401).json({
        success: false,
        message: 'Sesi telah berakhir. Silakan login kembali.',
      });
    }

    // Verify token signature and expiry
    const decoded = verifyAccessToken(token);

    // Verify token type
    if (decoded.type !== 'access') {
      return res.status(401).json({
        success: false,
        message: 'Tipe token tidak valid.',
      });
    }

    // Attach user info to request
    req.user = {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role,
    };
    req.token = token;

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Sesi Anda telah berakhir. Silakan login kembali.',
        code: 'TOKEN_EXPIRED',
      });
    }

    if (err.name === 'JsonWebTokenError') {
      log(LOG_LEVELS.SECURITY, 'Invalid JWT attempt', {
        ip: req.ip,
        error: err.message,
      });
      return res.status(401).json({
        success: false,
        message: 'Token tidak valid.',
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Autentikasi gagal.',
    });
  }
}

/**
 * Authorize by role — creates middleware that checks user role
 * @param  {...string} roles - Allowed roles
 * @returns {Function} Express middleware
 */
function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Autentikasi diperlukan.',
      });
    }

    if (!roles.includes(req.user.role)) {
      log(LOG_LEVELS.SECURITY, 'Unauthorized role access attempt', {
        userId: req.user.id,
        role: req.user.role,
        requiredRoles: roles,
        path: req.path,
        ip: req.ip,
      });

      return res.status(403).json({
        success: false,
        message: 'Anda tidak memiliki akses ke resource ini.',
      });
    }

    next();
  };
}

module.exports = { authenticate, authorize };
