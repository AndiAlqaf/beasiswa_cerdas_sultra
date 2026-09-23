/**
 * Input Validation Schemas
 * 
 * Uses express-validator for whitelist validation on all inputs.
 * Each schema validates specific fields for specific endpoints.
 */

const { body, param, query } = require('express-validator');
const { PASSWORD_POLICY_MESSAGE, JENJANG_OPTIONS, APPLICATION_STATUSES } = require('../config/security');

/**
 * Handle validation result — returns 400 with errors if invalid
 */
const { validationResult } = require('express-validator');

function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validasi gagal. Periksa kembali data Anda.',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  next();
}

// ========================================
// AUTH VALIDATION SCHEMAS
// ========================================

const registerValidation = [
  body('email')
    .trim()
    .isEmail().withMessage('Format email tidak valid.')
    .normalizeEmail()
    .isLength({ max: 255 }).withMessage('Email terlalu panjang.'),
  
  body('nik')
    .trim()
    .matches(/^\d{7,16}$/).withMessage('NIK harus berupa 16 digit angka.'),
  
  body('password')
    .isLength({ min: 8, max: 128 }).withMessage('Password harus 8-128 karakter.')
    .matches(/[a-z]/).withMessage('Password harus mengandung huruf kecil.')
    .matches(/[A-Z]/).withMessage('Password harus mengandung huruf besar.')
    .matches(/\d/).withMessage('Password harus mengandung angka.')
    .matches(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/).withMessage('Password harus mengandung karakter spesial.'),
  
  body().custom((_, { req }) => {
    req.body.confirmPassword = req.body.confirmPassword || req.body.confirm_password || req.body.password;
    req.body.namaLengkap = req.body.namaLengkap || req.body.nama_lengkap;
    req.body.jenjangTarget = req.body.jenjangTarget || req.body.jenjang_target || 'S1';
    
    if (req.body.confirmPassword !== req.body.password) {
      throw new Error('Konfirmasi password tidak cocok.');
    }
    return true;
  }),
  
  body('namaLengkap')
    .trim()
    .isLength({ min: 2, max: 255 }).withMessage('Nama lengkap harus 2-255 karakter.')
    .matches(/^[a-zA-Z\s'.,-]+$/).withMessage('Nama hanya boleh mengandung huruf, spasi, dan tanda baca.'),
  
  body('jenjangTarget')
    .isIn(JENJANG_OPTIONS).withMessage('Jenjang target harus S1, S2, atau S3.'),
  
  handleValidation,
];

const loginValidation = [
  body()
    .custom((_, { req }) => {
      const id = req.body.identifier || req.body.email || req.body.nik;
      if (!id || (typeof id === 'string' && !id.trim())) {
        throw new Error('Email atau NIK wajib diisi.');
      }
      req.body.identifier = String(id).trim();
      return true;
    }),
  
  body('password')
    .notEmpty().withMessage('Password wajib diisi.')
    .isLength({ max: 128 }).withMessage('Password terlalu panjang.'),
  
  handleValidation,
];

const refreshValidation = [
  body('refreshToken')
    .optional()
    .isString().withMessage('Refresh token harus berupa string.'),
  
  handleValidation,
];

// ========================================
// PROFILE VALIDATION SCHEMAS
// ========================================

const profileUpdateValidation = [
  body('tempatLahir')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Tempat lahir maks 100 karakter.')
    .matches(/^[a-zA-Z\s'.,-]+$/).withMessage('Tempat lahir mengandung karakter tidak valid.'),
  
  body('tanggalLahir')
    .optional()
    .isISO8601({ strict: true }).withMessage('Format tanggal tidak valid (gunakan YYYY-MM-DD).'),
  
  body('gender')
    .optional()
    .isIn(['Laki-laki', 'Perempuan']).withMessage('Gender harus Laki-laki atau Perempuan.'),
  
  body('noHp')
    .optional()
    .trim()
    .matches(/^\+?[0-9\s-]{8,20}$/).withMessage('Nomor HP tidak valid.'),
  
  body('statusPernikahan')
    .optional()
    .isIn(['Belum Menikah', 'Menikah']).withMessage('Status pernikahan tidak valid.'),
  
  body('alamatDomisili')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Alamat maks 500 karakter.'),
  
  handleValidation,
];

const educationValidation = [
  body('educationList')
    .isArray({ min: 1, max: 10 }).withMessage('Riwayat pendidikan harus berisi 1-10 entri.'),
  
  body('educationList.*.tingkat')
    .trim()
    .isIn(['SD', 'SMP', 'SMA', 'SMK', 'MA', 'MTS', 'MI', 'D1', 'D2', 'D3', 'D4', 'S1', 'S2', 'S3']).withMessage('Tingkat pendidikan tidak valid.'),
  
  body('educationList.*.institusi')
    .trim()
    .isLength({ min: 2, max: 255 }).withMessage('Nama institusi harus 2-255 karakter.'),
  
  body('educationList.*.jurusan')
    .optional()
    .trim()
    .isLength({ max: 255 }).withMessage('Jurusan maks 255 karakter.'),
  
  body('educationList.*.tahunMulai')
    .optional()
    .matches(/^\d{4}$/).withMessage('Tahun mulai harus 4 digit.'),
  
  body('educationList.*.tahunLulus')
    .optional()
    .matches(/^(\d{4})?$/).withMessage('Tahun lulus harus 4 digit atau kosong.'),
  
  handleValidation,
];

// ========================================
// ADMIN VALIDATION SCHEMAS
// ========================================

// Status normalization helper
const normalizeStatus = (status) => {
  if (!status) return status;
  const s = String(status).toUpperCase();
  if (['LOLOS', 'APPROVED', 'DITERIMA'].includes(s)) return 'DITERIMA';
  if (['MENUNGGU', 'PENDING', 'SUBMITTED', 'TERKIRIM'].includes(s)) return 'TERKIRIM';
  if (['DITOLAK', 'REJECTED'].includes(s)) return 'DITOLAK';
  return s;
};

const normalizeJenjang = (jenjang) => {
  if (!jenjang) return jenjang;
  const j = String(jenjang).toUpperCase();
  if (j.includes('S1') || j.includes('D4')) return 'S1';
  if (j.includes('S2')) return 'S2';
  if (j.includes('S3')) return 'S3';
  return j;
};

const verifyStatusValidation = [
  param('id')
    .trim()
    .isUUID(4).withMessage('ID tidak valid.'),
  
  body('status')
    .customSanitizer(normalizeStatus)
    .isIn(APPLICATION_STATUSES).withMessage('Status tidak valid.'),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Catatan maks 1000 karakter.'),
  
  handleValidation,
];

const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1, max: 10000 }).withMessage('Halaman harus angka positif.'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit harus 1-100.'),
  
  query('status')
    .optional()
    .customSanitizer(normalizeStatus)
    .isIn([...APPLICATION_STATUSES, '']).withMessage('Filter status tidak valid.'),
  
  query('jenjang')
    .optional()
    .customSanitizer(normalizeJenjang)
    .isIn([...JENJANG_OPTIONS, '']).withMessage('Filter jenjang tidak valid.'),
  
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Pencarian maks 100 karakter.'),
  
  handleValidation,
];

// ========================================
// PUBLIC VALIDATION
// ========================================

const nikCheckValidation = [
  param('nik')
    .trim()
    .matches(/^\d{7,16}$/).withMessage('NIK harus berupa 7-16 digit angka.'),
  
  handleValidation,
];

module.exports = {
  registerValidation,
  loginValidation,
  refreshValidation,
  profileUpdateValidation,
  educationValidation,
  verifyStatusValidation,
  paginationValidation,
  nikCheckValidation,
  handleValidation,
};
