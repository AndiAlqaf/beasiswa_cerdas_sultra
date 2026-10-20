/**
 * Rate Limiter Middleware
 * 
 * Protects against brute force and DDoS attacks.
 * Specially tuned to support high-concurrency verification workloads (9+ admins).
 */

const rateLimit = require('express-rate-limit');
const env = require('../config/env');

/**
 * General API rate limiter — For public & general applicant routes
 * High limit (5000 requests per 15 minutes) so real users & shared office IPs are never choked.
 * Automatically skips admin routes and health checks.
 */
const generalLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.IS_PRODUCTION ? env.RATE_LIMIT_MAX : 10000,
  standardHeaders: true,  // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false,   // Disable `X-RateLimit-*` headers
  message: {
    success: false,
    message: 'Terlalu banyak permintaan dari jaringan Anda. Coba lagi dalam beberapa menit.',
    retryAfter: Math.ceil(env.RATE_LIMIT_WINDOW_MS / 1000),
  },
  // Skip rate limiting for admin routes and health check
  skip: (req) => {
    const url = req.originalUrl || req.url || '';
    if (url.startsWith('/api/v1/admin') || url.startsWith('/api/v1/public/health')) {
      return true;
    }
    return false;
  },
  keyGenerator: (req) => {
    // Use X-Forwarded-For if behind proxy, otherwise use IP
    return req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip;
  },
});

/**
 * Admin rate limiter — Dedicated, extra-generous limit for admin verifiers
 * Handles heavy traffic from 9+ admins simultaneously viewing documents, previews & updating statuses.
 */
const adminLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: 30000, // 30,000 requests per 15m window (~2,000 req/min)
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Batas operasional admin tercapai. Silakan coba kembali dalam 1 menit.',
    retryAfter: 60,
  },
  keyGenerator: (req) => {
    // Key by admin user ID if authenticated, else IP
    return req.user?.id || req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip;
  },
});

/**
 * Auth rate limiter — Protects login/register against brute force
 * Specifically keys by IP + account identifier so 9 admins on the same office Wi-Fi don't block each other.
 */
const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: env.IS_PRODUCTION ? (env.AUTH_RATE_LIMIT_MAX || 60) : 500, // 60 attempts per minute
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Terlalu banyak percobaan login dalam 1 menit. Silakan tunggu 60 detik.',
      retryAfter: 60,
    });
  },
  keyGenerator: (req) => {
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip;
    const identifier = (req.body?.identifier || req.body?.email || req.body?.nik || '').toString().trim().toLowerCase();
    return identifier ? `${ip}_${identifier}` : ip;
  },
});

/**
 * Status check rate limiter — 60 requests per 15 minutes
 * For the public NIK status check endpoint
 */
const statusCheckLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.IS_PRODUCTION ? 60 : 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Terlalu banyak pengecekan status. Coba lagi dalam beberapa menit.',
  },
  keyGenerator: (req) => {
    return req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip;
  },
});

module.exports = { generalLimiter, adminLimiter, authLimiter, statusCheckLimiter };
