/**
 * Rate Limiter Middleware
 * 
 * Protects against brute force and DDoS attacks.
 * Different limits for general API vs authentication endpoints.
 */

const rateLimit = require('express-rate-limit');
const env = require('../config/env');

/**
 * General API rate limiter — 100 requests per 15 minutes per IP
 */
const generalLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,  // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false,   // Disable `X-RateLimit-*` headers
  message: {
    success: false,
    message: 'Terlalu banyak permintaan. Coba lagi dalam beberapa menit.',
    retryAfter: Math.ceil(env.RATE_LIMIT_WINDOW_MS / 1000),
  },
  // Skip rate limiting for health check
  skip: (req) => req.path === '/api/v1/public/health',
  keyGenerator: (req) => {
    // Use X-Forwarded-For if behind proxy, otherwise use IP
    return req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip;
  },
});

/**
 * Auth rate limiter — 5 requests per 15 minutes per IP
 * Specifically for login/register to prevent brute force
 */
const authLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.AUTH_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Terlalu banyak percobaan login/registrasi. Coba lagi dalam 15 menit.',
    retryAfter: Math.ceil(env.RATE_LIMIT_WINDOW_MS / 1000),
  },
  keyGenerator: (req) => {
    return req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip;
  },
});

/**
 * Status check rate limiter — 10 requests per 15 minutes
 * For the public NIK status check endpoint
 */
const statusCheckLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Terlalu banyak pengecekan status. Coba lagi dalam 15 menit.',
  },
  keyGenerator: (req) => {
    return req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip;
  },
});

module.exports = { generalLimiter, authLimiter, statusCheckLimiter };
