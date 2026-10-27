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

/**
 * GET /api/v1/public/announcements/recipients
 */
async function getAcceptedRecipients(req, res) {
  try {
    const pool = getPool();
    const { search, jenjang, mode } = req.query;

    let baseWhere = "a.status IN ('DITERIMA', 'PENCAIRAN_TERMIN_1', 'PENCAIRAN_TERMIN_2')";
    if (mode === 'sanggah') {
      // Khusus pengumuman hasil sanggah: pendaftar yang memiliki riwayat pengajuan sanggahan
      baseWhere = "(a.is_lulus_sanggah = 1 OR a.notes LIKE '%[SANGGAHAN%' OR a.status = 'VERIFIKASI_BERKAS')";
    } else if (mode === 'awal') {
      // Khusus yang lolos seleksi awal tanpa jalur sanggah
      baseWhere = "a.status IN ('DITERIMA', 'PENCAIRAN_TERMIN_1', 'PENCAIRAN_TERMIN_2') AND a.is_lulus_sanggah = 0 AND (a.notes IS NULL OR a.notes NOT LIKE '%[SANGGAHAN%')";
    }

    let query = `
      SELECT u.nama_lengkap, u.jenjang_target, a.registration_no, a.status, a.verified_at, a.notes, a.is_lulus_sanggah,
             eh.institusi, eh.jurusan
      FROM applications a
      JOIN users u ON u.id = a.user_id
      LEFT JOIN education_history eh ON eh.user_id = u.id AND eh.sort_order = 0
      WHERE ${baseWhere}
    `;
    const params = [];

    if (search && search.trim()) {
      query += ` AND (u.nama_lengkap LIKE ? OR a.registration_no LIKE ? OR eh.institusi LIKE ?)`;
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
    }

    if (jenjang) {
      query += ` AND u.jenjang_target = ?`;
      params.push(jenjang);
    }

    query += ` ORDER BY a.verified_at DESC, u.nama_lengkap ASC LIMIT 100`;

    const [rows] = await pool.execute(query, params);

    res.json({
      success: true,
      data: {
        total: rows.length,
        recipients: rows.map(r => {
          const isSanggah = r.is_lulus_sanggah === 1 || (r.notes && r.notes.includes('[SANGGAHAN'));
          return {
            namaLengkap: r.nama_lengkap,
            jenjangTarget: r.jenjang_target,
            registrationNo: r.registration_no,
            status: r.status,
            verifiedAt: r.verified_at,
            institusi: r.institusi || '-',
            jurusan: r.jurusan || '-',
            isLulusSanggah: r.is_lulus_sanggah === 1,
            isSanggah,
            jalur: isSanggah ? 'Pasca Sanggah' : 'Seleksi Awal',
            notes: r.notes || null,
          };
        })
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal memuat daftar penerima beasiswa.' });
  }
}

/**
 * POST /api/v1/public/trigger-announcement-blast
 * Memungkinkan trigger manual/demo pengiriman email notifikasi kelulusan
 */
async function triggerAnnouncementBlast(req, res) {
  try {
    const { jalankanBlastEmail } = require('../utils/emailScheduler');
    const result = await jalankanBlastEmail();
    return res.json({
      success: true,
      message: 'Blast email kelulusan berhasil dipicu!',
      data: result,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Gagal mengirim email kelulusan: ' + err.message,
    });
  }
}

/**
 * POST /api/v1/public/trigger-appeal-blast
 * Memungkinkan trigger pengiriman email notifikasi kelulusan KHUSUS HASIL SANGGAH
 */
async function triggerAppealBlast(req, res) {
  try {
    const { jalankanBlastHasilSanggah } = require('../utils/emailScheduler');
    const result = await jalankanBlastHasilSanggah();
    return res.json({
      success: true,
      message: 'Blast email kelulusan hasil sanggah berhasil dipicu!',
      data: result,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Gagal mengirim email hasil sanggah: ' + err.message,
    });
  }
}

/**
 * POST /api/v1/public/trigger-penetapan-blast
 * Memungkinkan trigger pengiriman email notifikasi penetapan resmi penerima beasiswa (SK Gubernur)
 */
async function triggerPenetapanBlast(req, res) {
  try {
    const { jalankanBlastPenetapanPenerima } = require('../utils/emailScheduler');
    const result = await jalankanBlastPenetapanPenerima();
    return res.json({
      success: true,
      message: 'Blast email penetapan resmi penerima beasiswa berhasil dipicu!',
      data: result,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Gagal mengirim email penetapan: ' + err.message,
    });
  }
}

module.exports = {
  healthCheck,
  checkStatus,
  getAcceptedRecipients,
  triggerAnnouncementBlast,
  triggerAppealBlast,
  triggerPenetapanBlast,
};
