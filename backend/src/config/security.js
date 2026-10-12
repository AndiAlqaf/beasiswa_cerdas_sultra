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
  LOCKOUT_DURATION_MS: 5 * 60 * 1000, // 5 minutes

  // Token
  TOKEN_ALGORITHM: 'HS512',

  // File upload — allowed MIME types
  ALLOWED_MIME_TYPES: [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],

  // File upload — magic bytes signatures for validation
  FILE_SIGNATURES: {
    'image/jpeg': [
      Buffer.from([0xFF, 0xD8]),
    ],
    'image/jpg': [
      Buffer.from([0xFF, 0xD8]),
    ],
    'image/png': [
      Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]),
    ],
    'image/webp': [
      Buffer.from([0x52, 0x49, 0x46, 0x46]), // RIFF
    ],
    'application/pdf': [
      Buffer.from([0x25, 0x50, 0x44, 0x46]), // %PDF
    ],
    'application/msword': [
      Buffer.from([0xD0, 0xCF, 0x11, 0xE0]),
    ],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [
      Buffer.from([0x50, 0x4B, 0x03, 0x04]), // PK..
    ],
  },

  // Max file sizes per type (bytes) — 10MB default max
  MAX_FILE_SIZES: {
    selfie: 10 * 1024 * 1024,
    filePasfoto: 10 * 1024 * 1024,
    pasfoto: 10 * 1024 * 1024,
    ktm: 10 * 1024 * 1024,
    fileSuratAktif: 10 * 1024 * 1024,
    surataktif: 10 * 1024 * 1024,
    pendukung: 10 * 1024 * 1024,
    ktp: 10 * 1024 * 1024,
    fileKtp: 10 * 1024 * 1024,
    transkrip: 10 * 1024 * 1024,
    fileTranskrip: 10 * 1024 * 1024,
    dtks: 10 * 1024 * 1024,
    fileDtks: 10 * 1024 * 1024,
    pernyataan: 10 * 1024 * 1024,
    surat_pernyataan: 10 * 1024 * 1024,
    fileSuratPernyataan: 10 * 1024 * 1024,
    surat_permohonan: 10 * 1024 * 1024,
    fileSuratPermohonan: 10 * 1024 * 1024,
    esai: 10 * 1024 * 1024,
    fileMotivationOrEsai: 10 * 1024 * 1024,
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

  // Request body size limits — 25MB to comfortably support canvas signature base64 & rich profile data
  JSON_BODY_LIMIT: '25mb',
  URL_ENCODED_LIMIT: '25mb',

  // Valid roles
  ROLES: {
    MAHASISWA: 'mahasiswa',
    ADMIN: 'admin',
  },

  // Application statuses
  APPLICATION_STATUSES: [
    'TERKIRIM',
    'PERLU_UNGGAH_ULANG',
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
