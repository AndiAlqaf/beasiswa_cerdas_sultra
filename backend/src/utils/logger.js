/**
 * Audit Logger — Security Event Logging
 * 
 * Logs all authentication events, file operations, and admin actions
 * to both database and console. Critical for forensic analysis.
 * 
 * Uses fire-and-forget async writes — never blocks the request.
 */

const { v4: uuidv4 } = require('uuid');

const LOG_LEVELS = {
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
  SECURITY: 'SECURITY',
};

/**
 * Log an audit event to the database (fire-and-forget)
 * @param {Object} params
 * @param {string} params.action - Event type (e.g., 'LOGIN_SUCCESS', 'UPLOAD_FILE')
 * @param {string} [params.userId] - User ID if available
 * @param {string} [params.ipAddress] - Client IP
 * @param {string} [params.userAgent] - Client User-Agent
 * @param {string} [params.details] - Additional details (JSON string)
 * @param {string} [params.requestId] - Request correlation ID
 */
function auditLog({ action, userId = null, ipAddress = null, userAgent = null, details = null, requestId = null }) {
  // Fire-and-forget — import pool lazily to avoid circular deps
  setImmediate(async () => {
    try {
      const { getPool } = require('../config/database');
      const pool = getPool();
      await pool.execute(
        `INSERT INTO audit_logs (id, user_id, action, ip_address, user_agent, details, request_id)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          uuidv4(),
          userId,
          action,
          ipAddress,
          userAgent ? userAgent.substring(0, 500) : null,
          typeof details === 'object' ? JSON.stringify(details) : details,
          requestId,
        ]
      );
    } catch (err) {
      // Never let logging failure crash the app
      console.error('[AUDIT LOG ERROR]', err.message);
    }
  });
}

/**
 * Console log with timestamp and level
 */
function log(level, message, meta = {}) {
  const timestamp = new Date().toISOString();
  const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
  console.log(`[${timestamp}] [${level}] ${message}${metaStr}`);
}

/**
 * Extract client IP from request (handles proxies)
 */
function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.socket?.remoteAddress || 'unknown';
}

module.exports = {
  auditLog,
  log,
  getClientIp,
  LOG_LEVELS,
};
