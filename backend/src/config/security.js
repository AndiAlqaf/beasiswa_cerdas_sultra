/**
 * Security Constants
 * Centralized security configuration — DO NOT weaken these values.
 */

module.exports = {
  // Password policy
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_REGEX: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,128}$/,
  PASSWORD_POLICY_MESSAGE:
    'Password harus minimal 8 karakter, mengandung huruf besar, huruf kecil, angka, dan karakter spesial (!@#$%^&*)',

  // Account lockout
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION_MS: 15 * 60 * 1000, // 15 minutes

  // Token
  TOKEN_ALGORITHM: 'HS512',

  // File upload — allowed MIME types
  ALLOWED_MIME_TYPES: [
    'image/jpeg',
    'image/png',
    'application/pdf',
  ],

  // File upload — magic bytes signatures for validation
  FILE_SIGNATURES: {
    'image/jpeg': [
      Buffer.from([0xFF, 0xD8, 0xFF, 0xE0]),
      Buffer.from([0xFF, 0xD8, 0xFF, 0xE1]),
      Buffer.from([0xFF, 0xD8, 0xFF, 0xE2]),
      Buffer.from([0xFF, 0xD8, 0xFF, 0xE8]),
      Buffer.from([0xFF, 0xD8, 0xFF, 0xDB]),
      Buffer.from([0xFF, 0xD8, 0xFF, 0xEE]),
    ],
    'image/png': [
      Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]),
    ],
    'application/pdf': [
      Buffer.from([0x25, 0x50, 0x44, 0x46]), // %PDF
    ],
  },

  // Max file sizes per type (bytes)
  MAX_FILE_SIZES: {
    selfie: 2 * 1024 * 1024,      // 2MB
    ktm: 2 * 1024 * 1024,         // 2MB
    pendukung: 2 * 1024 * 1024,   // 2MB
  },

  // Dangerous input patterns to reject
  DANGEROUS_PATTERNS: [
    /__proto__/,
    /constructor\s*\[/,
    /prototype/,
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /data:text\/html/i,
  ],

  // Request body size limits
  JSON_BODY_LIMIT: '5mb',
  URL_ENCODED_LIMIT: '5mb',

  // Valid roles
  ROLES: {
    MAHASISWA: 'mahasiswa',
    ADMIN: 'admin',
  },

  // Application statuses
  APPLICATION_STATUSES: [
    'TERKIRIM',
    'VERIFIKASI_BERKAS',
    'SELEKSI_ADMINISTRASI',
    'DITERIMA',
    'DITOLAK',
    'PENCAIRAN_TERMIN_1',
    'PENCAIRAN_TERMIN_2',
  ],

  // Jenjang options
  JENJANG_OPTIONS: ['S1', 'S2', 'S3'],
};
