/**
 * Auth Routes
 * 
 * POST /api/v1/auth/register — Register new mahasiswa account
 * POST /api/v1/auth/login    — Login with email/NIK + password
 * POST /api/v1/auth/refresh  — Refresh access token
 * POST /api/v1/auth/logout   — Logout (requires auth)
 */

const express = require('express');
const router = express.Router();
const { register, login, refresh, logout } = require('../controllers/auth.controller');
const { authLimiter } = require('../middleware/rateLimiter');
const { registerValidation, loginValidation, refreshValidation } = require('../middleware/validator');
const { authenticate } = require('../middleware/auth');

// Rate-limited auth endpoints (rate limit removed as requested)
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/refresh', refreshValidation, refresh);
router.post('/logout', authenticate, logout);

module.exports = router;
