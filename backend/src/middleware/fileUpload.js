/**
 * File Upload Middleware — Secure Multer Configuration
 * 
 * Validates file type by both MIME and magic bytes (file header).
 * Renames all files with UUID to prevent path traversal.
 * Enforces strict file size limits.
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const env = require('../config/env');
const { ALLOWED_MIME_TYPES, FILE_SIGNATURES, MAX_FILE_SIZES } = require('../config/security');
const { sanitizeFilename } = require('../utils/sanitizer');
const { log, LOG_LEVELS } = require('../utils/logger');

// Ensure upload directories exist
const UPLOAD_DIRS = [
  'selfies', 'ktm', 'pendukung',
  'fileSuratPermohonan', 'filePasfoto', 'fileKtp', 'fileSuratAktif',
  'fileTranskrip', 'fileDtks', 'fileSuratPernyataan', 'fileMotivationOrEsai'
];
for (const dir of UPLOAD_DIRS) {
  const fullPath = path.join(env.UPLOAD_DIR, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
  // Create .gitkeep
  const gitkeepPath = path.join(fullPath, '.gitkeep');
  if (!fs.existsSync(gitkeepPath)) {
    fs.writeFileSync(gitkeepPath, '');
  }
}

/**
 * Get the file extension from MIME type
 * @param {string} mimeType
 * @returns {string}
 */
function getExtFromMime(mimeType) {
  const map = {
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg',
    'image/png': '.png',
    'application/pdf': '.pdf',
    'application/msword': '.doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  };
  return map[mimeType] || '.bin';
}

/**
 * Create multer storage config for a specific document type
 * @param {string} docType - 'selfie' | 'ktm' | 'pendukung'
 * @returns {multer.StorageEngine}
 */
function createStorage(docType) {
  const subDir = docType === 'selfie' ? 'selfies' : docType;
  const targetDir = path.join(env.UPLOAD_DIR, subDir);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  
  return multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, targetDir);
    },
    filename: (_req, file, cb) => {
      // Always rename to UUID — prevents path traversal & overwrites
      const ext = getExtFromMime(file.mimetype);
      const safeName = `${uuidv4()}${ext}`;
      cb(null, safeName);
    },
  });
}

/**
 * File filter — validates MIME type
 */
function fileFilter(_req, file, cb) {
  // Sanitize the original filename
  file.originalname = sanitizeFilename(file.originalname);
  
  // Check MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    log(LOG_LEVELS.SECURITY, 'Rejected file upload: invalid MIME type', {
      filename: file.originalname,
      mimetype: file.mimetype,
    });
    return cb(new Error('Tipe file tidak diizinkan. Hanya JPG, PNG, dan PDF yang diterima.'), false);
  }
  
  cb(null, true);
}

/**
 * Validate file magic bytes after upload
 * This is the second layer of file type verification — validates the actual
 * file content, not just the declared MIME type or extension.
 * 
 * @param {string} filePath - Path to the uploaded file
 * @param {string} declaredMime - The MIME type declared by the client
 * @returns {boolean} True if file signature matches declared type
 */
function validateMagicBytes(filePath, declaredMime) {
  try {
    const signatures = FILE_SIGNATURES[declaredMime];
    if (!signatures) return false;

    const fd = fs.openSync(filePath, 'r');
    const buffer = Buffer.alloc(8); // Read first 8 bytes
    fs.readSync(fd, buffer, 0, 8, 0);
    fs.closeSync(fd);

    return signatures.some(sig => {
      return buffer.subarray(0, sig.length).equals(sig);
    });
  } catch (err) {
    log(LOG_LEVELS.ERROR, 'Magic bytes validation error', { error: err.message });
    return false;
  }
}

/**
 * Create upload middleware for a specific document type
 * @param {string} docType - 'selfie' | 'ktm' | 'pendukung'
 * @returns {Function} Express middleware
 */
function createUploadMiddleware(docType) {
  const maxSize = MAX_FILE_SIZES[docType] || env.MAX_FILE_SIZE;
  
  const upload = multer({
    storage: createStorage(docType),
    fileFilter,
    limits: {
      fileSize: maxSize,
      files: 1, // Only 1 file per request
      fields: 10,
    },
  }).any();

  return (req, res, next) => {
    upload(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(413).json({
              success: false,
              message: 'Ukuran file melebihi batas maksimum (2MB)',
            });
          }
          if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
              success: false,
              message: 'Hanya 1 file yang diizinkan per unggahan.',
            });
          }
          return res.status(400).json({
            success: false,
            message: `Error saat mengunggah file (${err.message}).`,
          });
        }
        // Custom error from fileFilter
        return res.status(400).json({
          success: false,
          message: err.message,
        });
      }

      if (req.files && req.files.length > 0) {
        req.file = req.files[0];
      }

      // If file was uploaded, validate magic bytes
      if (req.file) {
        const isValid = validateMagicBytes(req.file.path, req.file.mimetype);
        if (!isValid) {
          // Delete the invalid file immediately
          try {
            fs.unlinkSync(req.file.path);
          } catch (e) {
            // ignore cleanup errors
          }
          
          log(LOG_LEVELS.SECURITY, 'Rejected file: magic bytes mismatch', {
            filename: req.file.originalname,
            declaredMime: req.file.mimetype,
            ip: req.ip,
          });

          return res.status(400).json({
            success: false,
            message: 'File tidak valid. Konten file tidak sesuai dengan tipe yang dideklarasikan.',
          });
        }
      }

      next();
    });
  };
}

module.exports = { createUploadMiddleware, validateMagicBytes };
