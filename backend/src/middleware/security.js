/**
 * Security Middleware — Defense Layer 1
 * 
 * Helmet, CORS, HPP, body parsing limits, and input sanitization.
 * This middleware stack is the first line of defense against attacks.
 */

const helmet = require('helmet');
const cors = require('cors');
const hpp = require('hpp');
const express = require('express');
const cookieParser = require('cookie-parser');
const env = require('../config/env');
const { JSON_BODY_LIMIT, URL_ENCODED_LIMIT } = require('../config/security');
const { deepSanitize } = require('../utils/sanitizer');

/**
 * Apply all security middleware to an Express app
 * @param {import('express').Application} app
 */
function applySecurityMiddleware(app) {
  // 1. Helmet — Set 15+ security HTTP headers
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:'],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: true,
    crossOriginOpenerPolicy: true,
    crossOriginResourcePolicy: { policy: 'same-origin' },
    dnsPrefetchControl: { allow: false },
    frameguard: { action: 'deny' },
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
    ieNoOpen: true,
    noSniff: true,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    xssFilter: true,
  }));

  // 2. CORS — Only allow whitelisted origins
  app.use(cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (server-to-server, mobile apps)
      if (!origin) return callback(null, true);
      
      if (env.CORS_ORIGINS.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Akses tidak diizinkan oleh kebijakan CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
    exposedHeaders: ['X-Request-ID'],
    maxAge: 600, // Preflight cache 10 minutes
  }));

  // 3. Cookie parser (for refresh tokens in httpOnly cookies)
  app.use(cookieParser());

  // 4. Body parsing with strict size limits
  app.use(express.json({
    limit: JSON_BODY_LIMIT,
    // Reject non-JSON content types claiming to be JSON
    type: 'application/json',
  }));
  app.use(express.urlencoded({
    extended: false,
    limit: URL_ENCODED_LIMIT,
  }));

  // 5. HPP — Prevent HTTP Parameter Pollution
  app.use(hpp());

  // 6. Deep sanitize all incoming request bodies
  app.use((req, _res, next) => {
    if (req.body && typeof req.body === 'object') {
      req.body = deepSanitize(req.body);
    }
    if (req.query && typeof req.query === 'object') {
      req.query = deepSanitize(req.query);
    }
    if (req.params && typeof req.params === 'object') {
      req.params = deepSanitize(req.params);
    }
    next();
  });

  // 7. Remove server identification headers
  app.disable('x-powered-by');
  app.disable('etag');

  // 8. Prevent clickjacking via additional header
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    next();
  });
}

module.exports = { applySecurityMiddleware };
