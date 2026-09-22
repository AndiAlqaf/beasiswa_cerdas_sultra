/**
 * Applicant Routes (Protected — role: mahasiswa)
 * 
 * GET    /api/v1/applicant/profile        — Get profile
 * PUT    /api/v1/applicant/profile        — Update profile
 * PUT    /api/v1/applicant/education      — Update education history
 * POST   /api/v1/applicant/upload/selfie  — Upload selfie photo
 * POST   /api/v1/applicant/upload/ktm     — Upload KTM/surat aktif
 * POST   /api/v1/applicant/upload/pendukung — Upload supporting doc
 * GET    /api/v1/applicant/application    — Get application status
 * POST   /api/v1/applicant/application    — Submit application
 */

const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { ROLES } = require('../config/security');
const { createUploadMiddleware } = require('../middleware/fileUpload');
const { profileUpdateValidation, educationValidation } = require('../middleware/validator');
const {
  getProfile,
  updateProfile,
  updateEducation,
  uploadDocument,
  getApplication,
  submitApplication,
} = require('../controllers/applicant.controller');

// All routes require authentication as mahasiswa
router.use(authenticate);
router.use(authorize(ROLES.MAHASISWA));

// Profile
router.get('/profile', getProfile);
router.put('/profile', profileUpdateValidation, updateProfile);

// Education
router.put('/education', educationValidation, updateEducation);

// File uploads (multer middleware handles file processing & validation)
router.post('/upload/selfie', createUploadMiddleware('selfie', 'selfie'), uploadDocument('selfie'));
router.post('/upload/ktm', createUploadMiddleware('ktm', 'ktm'), uploadDocument('ktm'));
router.post('/upload/pendukung', createUploadMiddleware('pendukung', 'pendukung'), uploadDocument('pendukung'));

// Application
router.get('/application', getApplication);
router.post('/application', submitApplication);

module.exports = router;
