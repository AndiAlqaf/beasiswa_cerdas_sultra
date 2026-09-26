/**
 * ============================================
 * Beasiswa Sultra Cerdas — Backend API Server
 * ============================================
 * 
 * Enterprise-grade Node.js backend with 5-layer security:
 * 1. Network (Helmet, CORS, Rate Limiting)
 * 2. Input (Validation, Sanitization, Parameterized Queries)
 * 3. Auth (JWT HS512, Account Lockout, Token Blacklist)
 * 4. File (Magic Bytes, UUID Rename, Size Limit)
 * 5. Audit (Event Logging, Request Tracing)
 * 
 * Database: MySQL (mysql2/promise connection pool)
 */

const express = require('express');
const env = require('./config/env');
const { runMigrations, startCleanupJob, closePool } = require('./config/database');
const { applySecurityMiddleware } = require('./middleware/security');
const { requestId } = require('./middleware/requestId');
const { generalLimiter } = require('./middleware/rateLimiter');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');
const { log, LOG_LEVELS } = require('./utils/logger');
const { startEmailScheduler } = require('./utils/emailScheduler');

// Route imports
const authRoutes = require('./routes/auth.routes');
const applicantRoutes = require('./routes/applicant.routes');
const adminRoutes = require('./routes/admin.routes');
const publicRoutes = require('./routes/public.routes');

// ============================================
// Initialize Express App
// ============================================
const app = express();

// Trust first proxy (for X-Forwarded-For behind nginx/cloudflare)
app.set('trust proxy', 1);

// ============================================
// Apply Security Middleware Stack
// ============================================
app.use(requestId);
applySecurityMiddleware(app);
app.use(generalLimiter);

// Request logging (development only)
if (!env.IS_PRODUCTION) {
  app.use((req, _res, next) => {
    log(LOG_LEVELS.INFO, `${req.method} ${req.originalUrl}`, { ip: req.ip, requestId: req.requestId });
    next();
  });
}

// ============================================
// Mount API Routes
// ============================================
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/applicant', applicantRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/public', publicRoutes);

// ============================================
// Error Handling
// ============================================
app.use(notFoundHandler);
app.use(errorHandler);

// ============================================
// Start Server (async for MySQL migrations)
// ============================================
async function startServer() {
  try {
    // Run database migrations
    await runMigrations();

    // Start token cleanup job
    startCleanupJob();

    // Start email announcement scheduler
    startEmailScheduler();

    const server = app.listen(env.PORT, () => {
      console.log('');
      console.log('  ╔══════════════════════════════════════════════════╗');
      console.log('  ║  🎓 Beasiswa Sultra Cerdas — Backend API        ║');
      console.log('  ╠══════════════════════════════════════════════════╣');
      console.log(`  ║  🌐 Server    : http://localhost:${env.PORT}          ║`);
      console.log(`  ║  📦 Mode      : ${env.NODE_ENV.padEnd(28)}║`);
      console.log('  ║  🔒 Security  : 5-Layer Defense Active          ║');
      console.log(`  ║  🗄️  Database  : MySQL @ ${env.DB_HOST}:${env.DB_PORT}         ║`);
      console.log('  ╠══════════════════════════════════════════════════╣');
      console.log('  ║  Endpoints:                                     ║');
      console.log('  ║  • /api/v1/auth/*       — Authentication        ║');
      console.log('  ║  • /api/v1/applicant/*  — Mahasiswa Portal      ║');
      console.log('  ║  • /api/v1/admin/*      — Admin Panel           ║');
      console.log('  ║  • /api/v1/public/*     — Public Access         ║');
      console.log('  ╚══════════════════════════════════════════════════╝');
      console.log('');
    });

    // ============================================
    // Graceful Shutdown
    // ============================================
    function gracefulShutdown(signal) {
      console.log(`\n[${signal}] Shutting down gracefully...`);
      server.close(async () => {
        console.log('[SERVER] HTTP server closed');
        await closePool();
        process.exit(0);
      });

      setTimeout(() => {
        console.error('[FATAL] Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    }

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (err) {
    console.error('[FATAL] Failed to start server:', err.message);
    console.error(err.stack);
    process.exit(1);
  }
}

// Catch unhandled errors
process.on('uncaughtException', (err) => {
  log(LOG_LEVELS.ERROR, `Uncaught Exception: ${err.message}`, { stack: err.stack });
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  log(LOG_LEVELS.ERROR, `Unhandled Rejection: ${reason}`, { stack: reason?.stack });
});

startServer();

module.exports = app;
