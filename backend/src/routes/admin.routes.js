/**
 * Admin Routes (Protected — role: admin)
 * 
 * GET   /api/v1/admin/dashboard           — Dashboard stats
 * GET   /api/v1/admin/applicants          — List applicants (paginated)
 * GET   /api/v1/admin/applicants/:id      — Applicant detail
 * PATCH /api/v1/admin/applicants/:id/verify — Update verification status
 */

const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { ROLES } = require('../config/security');
const { verifyStatusValidation, paginationValidation } = require('../middleware/validator');
const { adminLimiter } = require('../middleware/rateLimiter');
const {
  getDashboard,
  listApplicants,
  exportApplicants,
  getApplicantDetail,
  verifyApplicant,
  viewDocument,
  listUsers,
  broadcastMissingDocsEmail,
} = require('../controllers/admin.controller');

// All routes require authentication as admin and use adminLimiter (generous limits)
router.use(adminLimiter);
router.use(authenticate);
router.use(authorize(ROLES.ADMIN));

// Dashboard
router.get('/dashboard', getDashboard);

// User accounts management (cek pengguna yang sudah bikin akun)
router.get('/users', listUsers);

// Applicant management
router.get('/applicants/export', exportApplicants);
router.get('/applicants', paginationValidation, listApplicants);
router.get('/applicants/:id', getApplicantDetail);
router.get('/applicants/:id/documents/:docId/view', viewDocument);
router.patch('/applicants/:id/verify', verifyStatusValidation, verifyApplicant);

// Broadcast email pemberitahuan unggah ulang berkas hilang
router.post('/broadcast-missing-files-email', broadcastMissingDocsEmail);

module.exports = router;
