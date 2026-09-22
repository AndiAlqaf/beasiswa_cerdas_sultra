/**
 * Auth Controller — Registration, Login, Token Refresh, Logout
 * 
 * All auth events are audit-logged for security forensics.
 * Account lockout is enforced after 5 failed login attempts.
 */

const { v4: uuidv4 } = require('uuid');
const { getPool } = require('../config/database');
const { hashPassword, comparePassword } = require('../utils/password');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken, hashToken } = require('../utils/jwt');
const { auditLog, getClientIp, log, LOG_LEVELS } = require('../utils/logger');
const { MAX_LOGIN_ATTEMPTS, LOCKOUT_DURATION_MS } = require('../config/security');

/**
 * POST /api/v1/auth/register
 */
async function register(req, res) {
  try {
    const { email, nik, password, namaLengkap, jenjangTarget } = req.body;
    const clientIp = getClientIp(req);
    const pool = getPool();

    // Check if email already exists
    const [existingEmail] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (existingEmail.length > 0) {
      auditLog({ action: 'REGISTER_DUPLICATE_EMAIL', ipAddress: clientIp, userAgent: req.headers['user-agent'], details: { email }, requestId: req.requestId });
      return res.status(409).json({ success: false, message: 'Email sudah terdaftar. Gunakan email lain atau login.' });
    }

    // Check if NIK already exists
    const [existingNik] = await pool.execute('SELECT id FROM users WHERE nik = ?', [nik]);
    if (existingNik.length > 0) {
      auditLog({ action: 'REGISTER_DUPLICATE_NIK', ipAddress: clientIp, userAgent: req.headers['user-agent'], details: { nik: nik.substring(0, 4) + '****' }, requestId: req.requestId });
      return res.status(409).json({ success: false, message: 'NIK/NIM sudah terdaftar. Gunakan NIK/NIM lain atau login.' });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user + profile in transaction
    const conn = await pool.getConnection();
    const userId = uuidv4();
    try {
      await conn.beginTransaction();

      await conn.execute(
        `INSERT INTO users (id, email, nik, password_hash, role, nama_lengkap, jenjang_target) VALUES (?, ?, ?, ?, 'mahasiswa', ?, ?)`,
        [userId, email, nik, passwordHash, namaLengkap, jenjangTarget]
      );

      await conn.execute(
        `INSERT INTO profiles (id, user_id) VALUES (?, ?)`,
        [uuidv4(), userId]
      );

      await conn.commit();
    } catch (txErr) {
      await conn.rollback();
      throw txErr;
    } finally {
      conn.release();
    }

    // Generate tokens
    const accessToken = generateAccessToken({ id: userId, email, role: 'mahasiswa' });
    const { token: refreshToken, hash: refreshHash } = generateRefreshToken({ id: userId });

    // Store refresh token hash
    const refreshExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ');
    await pool.execute(
      `INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at) VALUES (?, ?, ?, ?)`,
      [uuidv4(), userId, refreshHash, refreshExpiry]
    );

    auditLog({ action: 'REGISTER_SUCCESS', userId, ipAddress: clientIp, userAgent: req.headers['user-agent'], details: { email, jenjangTarget }, requestId: req.requestId });
    log(LOG_LEVELS.INFO, `New user registered: ${email}`, { userId });

    res.status(201).json({
      success: true,
      message: 'Registrasi berhasil! Selamat datang di portal Beasiswa Sultra Cerdas.',
      data: {
        user: { id: userId, email, namaLengkap, role: 'mahasiswa', jenjangTarget },
        accessToken,
        refreshToken,
      },
    });
  } catch (err) {
    log(LOG_LEVELS.ERROR, `Registration error: ${err.message}`, { stack: err.stack });
    res.status(500).json({ success: false, message: 'Terjadi kesalahan saat registrasi. Silakan coba lagi.' });
  }
}

/**
 * POST /api/v1/auth/login
 */
async function login(req, res) {
  try {
    const { identifier, password } = req.body;
    const clientIp = getClientIp(req);
    const pool = getPool();

    // Find user by email or NIK
    const [users] = await pool.execute(
      'SELECT id, email, nik, password_hash, role, nama_lengkap, jenjang_target, failed_login_attempts, locked_until FROM users WHERE email = ? OR nik = ?',
      [identifier, identifier]
    );
    const user = users[0];

    if (!user) {
      auditLog({ action: 'LOGIN_USER_NOT_FOUND', ipAddress: clientIp, userAgent: req.headers['user-agent'], details: { identifier: identifier.substring(0, 4) + '****' }, requestId: req.requestId });
      return res.status(401).json({ success: false, message: 'Email/NIK atau password salah.' });
    }

    // Check if account is locked
    if (user.locked_until) {
      const lockExpiry = new Date(user.locked_until);
      if (lockExpiry > new Date()) {
        const remainingMinutes = Math.ceil((lockExpiry - new Date()) / 60000);
        auditLog({ action: 'LOGIN_ACCOUNT_LOCKED', userId: user.id, ipAddress: clientIp, userAgent: req.headers['user-agent'], requestId: req.requestId });
        return res.status(423).json({ success: false, message: `Akun terkunci karena terlalu banyak percobaan gagal. Coba lagi dalam ${remainingMinutes} menit.` });
      }
      // Lock expired, reset
      await pool.execute('UPDATE users SET failed_login_attempts = 0, locked_until = NULL WHERE id = ?', [user.id]);
    }

    // Compare password
    const isMatch = await comparePassword(password, user.password_hash);
    if (!isMatch) {
      const newAttempts = user.failed_login_attempts + 1;

      if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
        const lockUntil = new Date(Date.now() + LOCKOUT_DURATION_MS).toISOString().slice(0, 19).replace('T', ' ');
        await pool.execute('UPDATE users SET failed_login_attempts = ?, locked_until = ? WHERE id = ?', [newAttempts, lockUntil, user.id]);
        auditLog({ action: 'ACCOUNT_LOCKED', userId: user.id, ipAddress: clientIp, userAgent: req.headers['user-agent'], details: { attempts: newAttempts }, requestId: req.requestId });
        return res.status(423).json({ success: false, message: `Akun dikunci selama 15 menit setelah ${MAX_LOGIN_ATTEMPTS}x percobaan gagal.` });
      }

      await pool.execute('UPDATE users SET failed_login_attempts = ? WHERE id = ?', [newAttempts, user.id]);
      auditLog({ action: 'LOGIN_FAILED', userId: user.id, ipAddress: clientIp, userAgent: req.headers['user-agent'], details: { attempts: newAttempts }, requestId: req.requestId });
      return res.status(401).json({
        success: false,
        message: 'Email/NIK atau password salah.',
        ...(newAttempts >= 3 ? { attemptsRemaining: MAX_LOGIN_ATTEMPTS - newAttempts } : {}),
      });
    }

    // Login successful — reset failed attempts
    await pool.execute('UPDATE users SET failed_login_attempts = 0, locked_until = NULL WHERE id = ?', [user.id]);

    // Revoke all existing refresh tokens (single session)
    await pool.execute('UPDATE refresh_tokens SET revoked = 1 WHERE user_id = ?', [user.id]);

    // Generate new tokens
    const accessToken = generateAccessToken({ id: user.id, email: user.email, role: user.role });
    const { token: refreshToken, hash: refreshHash } = generateRefreshToken({ id: user.id });

    const refreshExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ');
    await pool.execute(
      `INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at) VALUES (?, ?, ?, ?)`,
      [uuidv4(), user.id, refreshHash, refreshExpiry]
    );

    auditLog({ action: 'LOGIN_SUCCESS', userId: user.id, ipAddress: clientIp, userAgent: req.headers['user-agent'], requestId: req.requestId });

    res.json({
      success: true,
      message: 'Login berhasil!',
      data: {
        user: { id: user.id, email: user.email, namaLengkap: user.nama_lengkap, role: user.role, jenjangTarget: user.jenjang_target },
        accessToken,
        refreshToken,
      },
    });
  } catch (err) {
    log(LOG_LEVELS.ERROR, `Login error: ${err.message}`, { stack: err.stack });
    res.status(500).json({ success: false, message: 'Terjadi kesalahan saat login. Silakan coba lagi.' });
  }
}

/**
 * POST /api/v1/auth/refresh
 */
async function refresh(req, res) {
  try {
    const refreshTokenValue = req.body.refreshToken || req.cookies?.refreshToken;
    if (!refreshTokenValue) {
      return res.status(400).json({ success: false, message: 'Refresh token diperlukan.' });
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(refreshTokenValue);
    } catch (err) {
      return res.status(401).json({ success: false, message: 'Refresh token tidak valid atau kedaluwarsa.' });
    }

    const pool = getPool();
    const tokenHash = hashToken(refreshTokenValue);
    const [storedTokens] = await pool.execute(
      'SELECT id, user_id, revoked FROM refresh_tokens WHERE token_hash = ?',
      [tokenHash]
    );
    const storedToken = storedTokens[0];

    if (!storedToken || storedToken.revoked) {
      if (decoded.sub) {
        await pool.execute('UPDATE refresh_tokens SET revoked = 1 WHERE user_id = ?', [decoded.sub]);
        auditLog({ action: 'REFRESH_TOKEN_REUSE_DETECTED', userId: decoded.sub, ipAddress: getClientIp(req), userAgent: req.headers['user-agent'], requestId: req.requestId });
      }
      return res.status(401).json({ success: false, message: 'Refresh token tidak valid. Silakan login kembali.' });
    }

    // Revoke old refresh token (rotation)
    await pool.execute('UPDATE refresh_tokens SET revoked = 1 WHERE id = ?', [storedToken.id]);

    // Get user
    const [userRows] = await pool.execute(
      'SELECT id, email, role, nama_lengkap, jenjang_target FROM users WHERE id = ?',
      [storedToken.user_id]
    );
    const user = userRows[0];
    if (!user) {
      return res.status(401).json({ success: false, message: 'User tidak ditemukan.' });
    }

    // Generate new tokens
    const newAccessToken = generateAccessToken({ id: user.id, email: user.email, role: user.role });
    const { token: newRefreshToken, hash: newRefreshHash } = generateRefreshToken({ id: user.id });

    const refreshExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ');
    await pool.execute(
      `INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at) VALUES (?, ?, ?, ?)`,
      [uuidv4(), user.id, newRefreshHash, refreshExpiry]
    );

    res.json({ success: true, data: { accessToken: newAccessToken, refreshToken: newRefreshToken } });
  } catch (err) {
    log(LOG_LEVELS.ERROR, `Refresh error: ${err.message}`);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan saat refresh token.' });
  }
}

/**
 * POST /api/v1/auth/logout
 */
async function logout(req, res) {
  try {
    const userId = req.user.id;
    const token = req.token;
    const pool = getPool();

    // Blacklist the access token
    if (token) {
      const tokenHashVal = hashToken(token);
      const decoded = require('jsonwebtoken').decode(token);
      const expiresAt = decoded?.exp
        ? new Date(decoded.exp * 1000).toISOString().slice(0, 19).replace('T', ' ')
        : new Date(Date.now() + 15 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ');

      await pool.execute(
        `INSERT IGNORE INTO token_blacklist (token_hash, expires_at) VALUES (?, ?)`,
        [tokenHashVal, expiresAt]
      );
    }

    // Revoke all refresh tokens
    await pool.execute('UPDATE refresh_tokens SET revoked = 1 WHERE user_id = ?', [userId]);

    auditLog({ action: 'LOGOUT', userId, ipAddress: getClientIp(req), userAgent: req.headers['user-agent'], requestId: req.requestId });

    res.json({ success: true, message: 'Logout berhasil.' });
  } catch (err) {
    log(LOG_LEVELS.ERROR, `Logout error: ${err.message}`);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan saat logout.' });
  }
}

module.exports = { register, login, refresh, logout };
