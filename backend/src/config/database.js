/**
 * Database Configuration — MySQL via mysql2/promise
 * 
 * Uses connection pool for high concurrency (101K+ users).
 * All queries use parameterized statements (anti SQL injection).
 * Prepared statements cached for maximum speed.
 */

const mysql = require('mysql2/promise');
const env = require('./env');

let pool = null;

/**
 * Get or create the MySQL connection pool
 * @returns {mysql.Pool}
 */
function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: env.DB_HOST,
      port: env.DB_PORT,
      user: env.DB_USER,
      password: env.DB_PASSWORD,
      database: env.DB_NAME,
      waitForConnections: true,
      connectionLimit: env.DB_CONNECTION_LIMIT,
      queueLimit: 0,
      charset: 'utf8mb4',
      timezone: '+00:00',
      // Security: reject multiple SQL statements in one query
      multipleStatements: false,
      // Performance
      namedPlaceholders: false,
      decimalNumbers: true,
    });
  }
  return pool;
}

/**
 * Run all schema migrations
 */
async function runMigrations() {
  const db = getPool();

  // For migrations we need multipleStatements temporarily
  const migrationConn = await mysql.createConnection({
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    multipleStatements: true,
    charset: 'utf8mb4',
  });

  await migrationConn.query(`
    -- Users table
    CREATE TABLE IF NOT EXISTS users (
      id CHAR(36) PRIMARY KEY,
      email VARCHAR(255) NOT NULL,
      nik VARCHAR(16) NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role ENUM('mahasiswa', 'admin') NOT NULL DEFAULT 'mahasiswa',
      nama_lengkap VARCHAR(255) NOT NULL,
      jenjang_target ENUM('S1', 'S2', 'S3') NOT NULL,
      failed_login_attempts INT NOT NULL DEFAULT 0,
      locked_until DATETIME NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE INDEX idx_users_email (email),
      UNIQUE INDEX idx_users_nik (nik)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

    -- Applicant profiles
    CREATE TABLE IF NOT EXISTS profiles (
      id CHAR(36) PRIMARY KEY,
      user_id CHAR(36) NOT NULL,
      tempat_lahir VARCHAR(100) NULL,
      tanggal_lahir DATE NULL,
      gender ENUM('Laki-laki', 'Perempuan') NULL,
      no_hp VARCHAR(20) NULL,
      status_pernikahan ENUM('Belum Menikah', 'Menikah') NULL,
      alamat_domisili TEXT NULL,
      selfie_path VARCHAR(500) NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE INDEX idx_profiles_user_id (user_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

    -- Education history
    CREATE TABLE IF NOT EXISTS education_history (
      id CHAR(36) PRIMARY KEY,
      user_id CHAR(36) NOT NULL,
      tingkat VARCHAR(10) NOT NULL,
      institusi VARCHAR(255) NOT NULL,
      jurusan VARCHAR(255) NULL,
      tahun_mulai VARCHAR(4) NULL,
      tahun_lulus VARCHAR(4) NULL,
      sort_order INT NOT NULL DEFAULT 0,
      INDEX idx_education_user_id (user_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

    -- Uploaded documents
    CREATE TABLE IF NOT EXISTS documents (
      id CHAR(36) PRIMARY KEY,
      user_id CHAR(36) NOT NULL,
      doc_type ENUM('ktm', 'pendukung', 'selfie') NOT NULL,
      original_name VARCHAR(255) NOT NULL,
      stored_name VARCHAR(255) NOT NULL,
      mime_type VARCHAR(50) NOT NULL,
      file_size INT NOT NULL,
      file_path VARCHAR(500) NOT NULL,
      uploaded_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_documents_user_id (user_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

    -- Applications
    CREATE TABLE IF NOT EXISTS applications (
      id CHAR(36) PRIMARY KEY,
      user_id CHAR(36) NOT NULL,
      registration_no VARCHAR(30) NOT NULL,
      status ENUM('TERKIRIM', 'VERIFIKASI_BERKAS', 'SELEKSI_ADMINISTRASI', 'DITERIMA', 'DITOLAK', 'PENCAIRAN_TERMIN_1', 'PENCAIRAN_TERMIN_2') NOT NULL DEFAULT 'TERKIRIM',
      notes TEXT NULL,
      submitted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      verified_at DATETIME NULL,
      verified_by CHAR(36) NULL,
      UNIQUE INDEX idx_applications_user_id (user_id),
      UNIQUE INDEX idx_applications_registration_no (registration_no),
      INDEX idx_applications_status (status),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

    -- Refresh tokens
    CREATE TABLE IF NOT EXISTS refresh_tokens (
      id CHAR(36) PRIMARY KEY,
      user_id CHAR(36) NOT NULL,
      token_hash VARCHAR(64) NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      revoked TINYINT(1) NOT NULL DEFAULT 0,
      UNIQUE INDEX idx_refresh_tokens_hash (token_hash),
      INDEX idx_refresh_tokens_user_id (user_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

    -- Audit logs
    CREATE TABLE IF NOT EXISTS audit_logs (
      id CHAR(36) PRIMARY KEY,
      user_id CHAR(36) NULL,
      action VARCHAR(50) NOT NULL,
      ip_address VARCHAR(45) NULL,
      user_agent VARCHAR(500) NULL,
      details TEXT NULL,
      request_id VARCHAR(36) NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_audit_logs_user_id (user_id),
      INDEX idx_audit_logs_action (action)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

    -- Token blacklist (for logout)
    CREATE TABLE IF NOT EXISTS token_blacklist (
      token_hash VARCHAR(64) PRIMARY KEY,
      expires_at DATETIME NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_token_blacklist_expires (expires_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // Dynamically add missing columns to profiles table without losing existing data
  const columnsToAdd = [
    'no_kk VARCHAR(20) NULL',
    'alamat_ktp TEXT NULL',
    'akreditasi_prodi VARCHAR(50) NULL',
    'nim VARCHAR(30) NULL',
    'semester INT NULL',
    'ipk DECIMAL(4,2) NULL',
    'target_lulus VARCHAR(10) NULL',
    'beasiswa_lain VARCHAR(255) NULL',
    'nama_ayah VARCHAR(150) NULL',
    'pekerjaan_ayah VARCHAR(150) NULL',
    'nama_ibu VARCHAR(150) NULL',
    'pekerjaan_ibu VARCHAR(150) NULL',
    'penghasilan_ortu VARCHAR(100) NULL',
    'jumlah_tanggungan INT NULL',
    'kepemilikan_bantuan VARCHAR(100) NULL',
    'prestasi_akademik TEXT NULL',
    'prestasi_non_akademik TEXT NULL',
    'pengalaman_organisasi TEXT NULL',
    'pengalaman_pengabdian TEXT NULL',
    'pelatihan_sertifikasi TEXT NULL',
    'prodi_prioritas VARCHAR(255) NULL'
  ];

  for (const colDef of columnsToAdd) {
    const colName = colDef.split(' ')[0];
    try {
      await migrationConn.query(`ALTER TABLE profiles ADD COLUMN ${colDef}`);
    } catch (e) {
      if (e.code !== 'ER_DUP_FIELDNAME') {
        console.error(`[DB] Error adding column ${colName}:`, e);
      }
    }
  }

  await migrationConn.end();
  console.log('[DB] MySQL migrations completed successfully');
}

/**
 * Cleanup expired tokens periodically (every hour)
 */
function startCleanupJob() {
  const cleanup = async () => {
    try {
      const db = getPool();
      const [result1] = await db.execute(
        `DELETE FROM refresh_tokens WHERE expires_at < NOW() OR revoked = 1`
      );
      const [result2] = await db.execute(
        `DELETE FROM token_blacklist WHERE expires_at < NOW()`
      );

      if (result1.affectedRows > 0 || result2.affectedRows > 0) {
        console.log(`[DB CLEANUP] Removed ${result1.affectedRows} expired refresh tokens, ${result2.affectedRows} blacklisted tokens`);
      }
    } catch (err) {
      console.error('[DB CLEANUP] Error:', err.message);
    }
  };

  // Run cleanup every hour
  setInterval(cleanup, 60 * 60 * 1000);
  // Run once on startup (delay 5s to let pool connect)
  setTimeout(cleanup, 5000);
}

/**
 * Close the pool gracefully
 */
async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('[DB] MySQL pool closed');
  }
}

module.exports = { getPool, runMigrations, startCleanupJob, closePool };
