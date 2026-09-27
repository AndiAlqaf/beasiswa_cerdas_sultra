/**
 * Public Routes (No authentication required)
 * 
 * GET /api/v1/public/health       — Health check
 * GET /api/v1/public/cek-status/:nik — Check application status by NIK
 */

const express = require('express');
const router = express.Router();
const { statusCheckLimiter } = require('../middleware/rateLimiter');
const { nikCheckValidation } = require('../middleware/validator');
const { healthCheck, checkStatus, getAcceptedRecipients, triggerAnnouncementBlast } = require('../controllers/public.controller');

// Health check (no rate limit)
router.get('/health', healthCheck);

// Public status check (rate limited)
router.get('/cek-status/:nik', statusCheckLimiter, nikCheckValidation, checkStatus);

// Official recipients list (public)
router.get('/announcements/recipients', getAcceptedRecipients);

// Trigger announcement blast email (untuk simulasi/demo)
router.post('/trigger-announcement-blast', triggerAnnouncementBlast);

module.exports = router;
