/**
 * Public Controller — Health Check & Status Lookup
 * 
 * These endpoints are accessible without authentication.
 * Rate-limited to prevent abuse.
 */

const { getPool } = require('../config/database');
const { auditLog, getClientIp } = require('../utils/logger');

/**
 * GET /api/v1/public/health
 */
async function healthCheck(_req, res) {
  try {
    const pool = getPool();
    await pool.execute('SELECT 1');

    res.json({
      success: true,
      message: 'Server berjalan normal.',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
    });
  } catch (err) {
    res.status(503).json({ success: false, message: 'Server sedang mengalami gangguan.' });
  }
}

/**
 * GET /api/v1/public/cek-status/:nik
 */
async function checkStatus(req, res) {
  try {
    const { nik } = req.params;
    const pool = getPool();

    const [rows] = await pool.execute(`
      SELECT u.nama_lengkap, u.jenjang_target,
             a.registration_no, a.status, a.submitted_at, a.notes
      FROM users u
      JOIN applications a ON a.user_id = u.id
      WHERE u.nik = ?
    `, [nik]);

    auditLog({
      action: 'STATUS_CHECK', ipAddress: getClientIp(req),
      userAgent: req.headers['user-agent'],
      details: { nik: nik.substring(0, 4) + '****' },
      requestId: req.requestId,
    });

    if (rows.length === 0) {
      return res.json({ success: true, data: null, message: 'Data pendaftaran dengan NIK tersebut tidak ditemukan.' });
    }

    const result = rows[0];
    res.json({
      success: true,
      data: {
        namaLengkap: result.nama_lengkap, jenjangTarget: result.jenjang_target,
        registrationNo: result.registration_no, status: result.status,
        submittedAt: result.submitted_at, notes: result.notes,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal memeriksa status.' });
  }
}

module.exports = { healthCheck, checkStatus };
