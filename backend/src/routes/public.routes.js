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
const {
  healthCheck,
  checkStatus,
  getAcceptedRecipients,
  triggerAnnouncementBlast,
  triggerAppealBlast,
  triggerPenetapanBlast,
} = require('../controllers/public.controller');

// Health check (no rate limit)
router.get('/health', healthCheck);

// Public status check (rate limited)
router.get('/cek-status/:nik', statusCheckLimiter, nikCheckValidation, checkStatus);

// Official recipients list (public)
router.get('/announcements/recipients', getAcceptedRecipients);

// Trigger announcement blast email (fase pengumuman awal - dinonaktifkan sesuai arahan)
router.post('/trigger-announcement-blast', triggerAnnouncementBlast);

// Trigger appeal blast email (fase hasil sanggah - dinonaktifkan sesuai arahan)
router.post('/trigger-appeal-blast', triggerAppealBlast);

// Trigger penetapan blast email (fase resmi SK Gubernur)
router.post('/trigger-penetapan-blast', triggerPenetapanBlast);

module.exports = router;
