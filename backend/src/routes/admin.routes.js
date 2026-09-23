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
const {
  getDashboard,
  listApplicants,
  getApplicantDetail,
  verifyApplicant,
  viewDocument,
} = require('../controllers/admin.controller');

// All routes require authentication as admin
router.use(authenticate);
router.use(authorize(ROLES.ADMIN));

// Dashboard
router.get('/dashboard', getDashboard);

// Applicant management
router.get('/applicants', paginationValidation, listApplicants);
router.get('/applicants/:id', getApplicantDetail);
router.get('/applicants/:id/documents/:docId/view', viewDocument);
router.patch('/applicants/:id/verify', verifyStatusValidation, verifyApplicant);

module.exports = router;
