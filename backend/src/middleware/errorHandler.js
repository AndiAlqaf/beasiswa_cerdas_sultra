/**
 * Global Error Handler
 * 
 * Catches all unhandled errors and returns safe responses.
 * NEVER exposes stack traces, internal details, or file paths to clients.
 */

const { log, LOG_LEVELS } = require('../utils/logger');
const env = require('../config/env');

/**
 * 404 Not Found handler
 */
function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    message: 'Endpoint tidak ditemukan.',
    path: req.originalUrl,
  });
}

/**
 * Global error handler — must have 4 parameters for Express to recognize it
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, _next) {
  // Log the full error internally
  log(LOG_LEVELS.ERROR, `Unhandled error: ${err.message}`, {
    stack: err.stack,
    path: req.originalUrl,
    method: req.method,
    requestId: req.requestId,
    ip: req.ip,
  });

  // Determine status code
  const statusCode = err.statusCode || err.status || 500;

  // CORS error
  if (err.message && err.message.includes('CORS')) {
    return res.status(403).json({
      success: false,
      message: 'Akses ditolak oleh kebijakan CORS.',
    });
  }

  // JSON parse error (malformed JSON body)
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      message: 'Format JSON tidak valid.',
    });
  }

  // Entity too large
  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      success: false,
      message: 'Ukuran permintaan melebihi batas yang diizinkan.',
    });
  }

  // Send safe error response — NEVER expose internal details
  res.status(statusCode).json({
    success: false,
    message: env.IS_PRODUCTION
      ? 'Terjadi kesalahan internal. Silakan coba lagi.'
      : err.message || 'Internal Server Error',
    ...(env.IS_PRODUCTION ? {} : { requestId: req.requestId }),
  });
}

module.exports = { notFoundHandler, errorHandler };
