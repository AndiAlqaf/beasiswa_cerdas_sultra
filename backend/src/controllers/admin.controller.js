/**
 * Admin Controller — Dashboard, Applicant Management, Verification
 * 
 * All endpoints require admin role.
 * Pagination and filtering for high-volume data.
 */

const { getPool } = require('../config/database');
const { auditLog, getClientIp, log, LOG_LEVELS } = require('../utils/logger');

/**
 * GET /api/v1/admin/dashboard
 */
async function getDashboard(req, res) {
  try {
    const pool = getPool();

    const [[{ totalPendaftar }]] = await pool.execute('SELECT COUNT(*) as totalPendaftar FROM applications');
    const [[{ menungguVerifikasi }]] = await pool.execute("SELECT COUNT(*) as menungguVerifikasi FROM applications WHERE status = 'TERKIRIM'");
    const [[{ berkasLolos }]] = await pool.execute("SELECT COUNT(*) as berkasLolos FROM applications WHERE status IN ('VERIFIKASI_BERKAS', 'SELEKSI_ADMINISTRASI', 'DITERIMA', 'PENCAIRAN_TERMIN_1', 'PENCAIRAN_TERMIN_2')");
    const [[{ diterima }]] = await pool.execute("SELECT COUNT(*) as diterima FROM applications WHERE status IN ('DITERIMA', 'PENCAIRAN_TERMIN_1', 'PENCAIRAN_TERMIN_2')");
    const [[{ ditolak }]] = await pool.execute("SELECT COUNT(*) as ditolak FROM applications WHERE status = 'DITOLAK'");
    const [[{ totalUsers }]] = await pool.execute("SELECT COUNT(*) as totalUsers FROM users WHERE role = 'mahasiswa'");

    const [recentApplicants] = await pool.execute(`
      SELECT u.nama_lengkap, u.email, u.jenjang_target,
             a.registration_no, a.status, a.submitted_at
      FROM applications a
      JOIN users u ON u.id = a.user_id
      ORDER BY a.submitted_at DESC
      LIMIT 10
    `);

    res.json({
      success: true,
      data: {
        stats: { totalPendaftar, menungguVerifikasi, berkasLolos, diterima, ditolak, totalUsers },
        recentApplicants: recentApplicants.map(a => ({
          namaLengkap: a.nama_lengkap, email: a.email, jenjangTarget: a.jenjang_target,
          registrationNo: a.registration_no, status: a.status, submittedAt: a.submitted_at,
        })),
      },
    });
  } catch (err) {
    log(LOG_LEVELS.ERROR, `Admin dashboard error: ${err.message}`);
    res.status(500).json({ success: false, message: 'Gagal mengambil data dashboard.' });
  }
}

/**
 * GET /api/v1/admin/applicants
 */
async function listApplicants(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const offset = (page - 1) * limit;
    const status = req.query.status || null;
    const jenjang = req.query.jenjang || null;
    const search = req.query.search || null;
    const pool = getPool();

    let whereClause = '1=1';
    const params = [];

    if (status) {
      let mappedStatus = status;
      if (status === 'Lolos') mappedStatus = 'DITERIMA';
      if (status === 'Menunggu') mappedStatus = 'TERKIRIM';
      if (status === 'Ditolak') mappedStatus = 'DITOLAK';
      if (status === 'Verifikasi') mappedStatus = 'VERIFIKASI_BERKAS';

      whereClause += ' AND a.status = ?';
      params.push(mappedStatus);
    }
    if (jenjang) {
      whereClause += ' AND u.jenjang_target = ?';
      params.push(jenjang);
    }
    if (search) {
      whereClause += ' AND (u.nama_lengkap LIKE ? OR u.nik LIKE ? OR a.registration_no LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    const [[{ cnt }]] = await pool.execute(
      `SELECT COUNT(*) as cnt FROM applications a JOIN users u ON u.id = a.user_id WHERE ${whereClause}`,
      params
    );

    const [applicants] = await pool.execute(
      `SELECT u.id as userId, u.nama_lengkap, u.email, u.nik, u.jenjang_target,
              a.id as applicationId, a.registration_no, a.status, a.notes,
              a.submitted_at, a.verified_at,
              p.ipk, p.prodi_prioritas, p.akreditasi_prodi,
              p.nama_bank, p.no_rekening, p.nama_rekening,
              (
                SELECT e.institusi 
                FROM education_history e 
                WHERE e.user_id = u.id 
                ORDER BY (CASE WHEN e.tingkat = u.jenjang_target THEN 1 WHEN e.tingkat != 'SMA' THEN 2 ELSE 3 END), e.sort_order DESC 
                LIMIT 1
              ) as perguruan_tinggi,
              (
                SELECT e.jurusan 
                FROM education_history e 
                WHERE e.user_id = u.id 
                ORDER BY (CASE WHEN e.tingkat = u.jenjang_target THEN 1 WHEN e.tingkat != 'SMA' THEN 2 ELSE 3 END), e.sort_order DESC 
                LIMIT 1
              ) as jurusan
       FROM applications a
       JOIN users u ON u.id = a.user_id
       LEFT JOIN profiles p ON p.user_id = u.id
       WHERE ${whereClause}
       ORDER BY a.submitted_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    res.json({
      success: true,
      data: {
        applicants: applicants.map(a => ({
          userId: a.userId, namaLengkap: a.nama_lengkap, email: a.email, nik: a.nik,
          jenjangTarget: a.jenjang_target, applicationId: a.applicationId,
          registrationNo: a.registration_no, status: a.status, notes: a.notes,
          submittedAt: a.submitted_at, verifiedAt: a.verified_at,
          ipk: a.ipk ? String(a.ipk) : '-',
          perguruanTinggi: a.perguruan_tinggi || '-',
          prodi: a.prodi_prioritas || a.jurusan || '-',
          namaBank: a.nama_bank || '-',
          noRekening: a.no_rekening || '-',
          namaRekening: a.nama_rekening || '-'
        })),
        pagination: {
          currentPage: page, totalPages: Math.ceil(cnt / limit),
          totalItems: cnt, itemsPerPage: limit,
        },
      },
    });
  } catch (err) {
    log(LOG_LEVELS.ERROR, `List applicants error: ${err.message}`);
    res.status(500).json({ success: false, message: 'Gagal mengambil daftar pendaftar.' });
  }
}

/**
 * GET /api/v1/admin/applicants/:id
 */
async function getApplicantDetail(req, res) {
  try {
    const userId = req.params.id;
    const pool = getPool();

    const [userRows] = await pool.execute(`
      SELECT u.id, u.email, u.nik, u.nama_lengkap, u.jenjang_target, u.created_at,
             p.tempat_lahir, p.tanggal_lahir, p.gender, p.no_hp,
             p.status_pernikahan, p.alamat_domisili, p.selfie_path, p.perguruan_tinggi, p.fakultas_prodi,
             p.no_kk, p.alamat_ktp, p.akreditasi_prodi, p.nim, p.semester, p.ipk, p.target_lulus,
             p.beasiswa_lain, p.nama_ayah, p.pekerjaan_ayah, p.nama_ibu, p.pekerjaan_ibu,
             p.penghasilan_ortu, p.jumlah_tanggungan, p.kepemilikan_bantuan,
             p.prestasi_akademik, p.prestasi_non_akademik, p.pengalaman_organisasi,
             p.pengalaman_pengabdian, p.pelatihan_sertifikasi, p.signature_data,
             p.nama_bank, p.no_rekening, p.nama_rekening,
             a.id as app_id, a.registration_no, a.status, a.notes, a.submitted_at, a.verified_at
      FROM users u
      LEFT JOIN profiles p ON p.user_id = u.id
      LEFT JOIN applications a ON a.user_id = u.id
      WHERE u.id = ?
    `, [userId]);

    if (userRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Pendaftar tidak ditemukan.' });
    }
    const user = userRows[0];

    const [education] = await pool.execute(
      'SELECT tingkat, institusi, jurusan, tahun_mulai, tahun_lulus FROM education_history WHERE user_id = ? ORDER BY sort_order ASC',
      [userId]
    );

    const [documents] = await pool.execute(
      'SELECT id, doc_type, original_name, mime_type, file_size, uploaded_at FROM documents WHERE user_id = ?',
      [userId]
    );

    res.json({
      success: true,
      data: {
        user: { id: user.id, email: user.email, nik: user.nik, namaLengkap: user.nama_lengkap, jenjangTarget: user.jenjang_target, createdAt: user.created_at },
        profile: {
          tempatLahir: user.tempat_lahir, tanggalLahir: user.tanggal_lahir, gender: user.gender,
          noHp: user.no_hp, statusPernikahan: user.status_pernikahan, alamatDomisili: user.alamat_domisili,
          hasSelfie: !!user.selfie_path,
          perguruanTinggi: user.perguruan_tinggi,
          fakultasProdi: user.fakultas_prodi,
          noKk: user.no_kk,
          alamatKtp: user.alamat_ktp,
          akreditasiProdi: user.akreditasi_prodi,
          nim: user.nim,
          semester: user.semester,
          ipk: user.ipk,
          targetLulus: user.target_lulus,
          beasiswaLain: user.beasiswa_lain,
          namaAyah: user.nama_ayah,
          pekerjaanAyah: user.pekerjaan_ayah,
          namaIbu: user.nama_ibu,
          pekerjaanIbu: user.pekerjaan_ibu,
          penghasilanOrtu: user.penghasilan_ortu,
          jumlahTanggungan: user.jumlah_tanggungan,
          kepemilikanBantuan: user.kepemilikan_bantuan,
          prestasiAkademik: user.prestasi_akademik,
          prestasiNonAkademik: user.prestasi_non_akademik,
          pengalamanOrganisasi: user.pengalaman_organisasi,
          pengalamanPengabdian: user.pengalaman_pengabdian,
          pelatihanSertifikasi: user.pelatihan_sertifikasi,
          signatureData: user.signature_data,
          namaBank: user.nama_bank,
          noRekening: user.no_rekening,
          namaRekening: user.nama_rekening
        },
        application: user.app_id ? {
          id: user.app_id, registrationNo: user.registration_no, status: user.status,
          notes: user.notes, submittedAt: user.submitted_at, verifiedAt: user.verified_at,
        } : null,
        education,
        documents: documents.map(d => ({
          id: d.id, docType: d.doc_type, originalName: d.original_name,
          mimeType: d.mime_type, fileSize: d.file_size, uploadedAt: d.uploaded_at,
        })),
      },
    });
  } catch (err) {
    log(LOG_LEVELS.ERROR, `Get applicant detail error: ${err.message}`);
    res.status(500).json({ success: false, message: 'Gagal mengambil detail pendaftar.' });
  }
}

/**
 * PATCH /api/v1/admin/applicants/:id/verify
 */
async function verifyApplicant(req, res) {
  try {
    const applicantUserId = req.params.id;
    const adminUserId = req.user.id;
    const { status, notes } = req.body;
    const pool = getPool();

    const [appRows] = await pool.execute('SELECT id, status FROM applications WHERE user_id = ?', [applicantUserId]);
    if (appRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Pendaftaran tidak ditemukan.' });
    }

    const currentStatus = appRows[0].status;
    if (currentStatus === 'DITERIMA' || currentStatus === 'DITOLAK') {
      return res.status(400).json({
        success: false,
        message: `Status pendaftaran sudah ${currentStatus} (Dikunci). Status tidak dapat diubah lagi kecuali pendaftar mengajukan sanggahan.`
      });
    }

    await pool.execute(
      `UPDATE applications SET status = ?, notes = COALESCE(?, notes), verified_at = NOW(), verified_by = ? WHERE user_id = ?`,
      [status, notes || null, adminUserId, applicantUserId]
    );

    auditLog({
      action: 'APPLICATION_STATUS_UPDATED', userId: adminUserId, ipAddress: getClientIp(req),
      details: { applicantUserId, oldStatus: appRows[0].status, newStatus: status, notes },
      requestId: req.requestId,
    });

    res.json({
      success: true,
      message: `Status pendaftar berhasil diubah ke ${status}.`,
      data: { status, verifiedAt: new Date().toISOString() },
    });
  } catch (err) {
    log(LOG_LEVELS.ERROR, `Verify applicant error: ${err.message}`);
    res.status(500).json({ success: false, message: 'Gagal memperbarui status pendaftar.' });
  }
}
/**
 * GET /api/v1/admin/applicants/:id/documents/:docId/view
 */
async function viewDocument(req, res) {
  try {
    const { id: userId, docId } = req.params;
    const pool = getPool();

    const [docs] = await pool.execute(
      'SELECT file_path, original_name, mime_type FROM documents WHERE id = ? AND user_id = ?',
      [docId, userId]
    );

    if (docs.length === 0) {
      return res.status(404).json({ success: false, message: 'Dokumen tidak ditemukan.' });
    }

    const doc = docs[0];
    const fs = require('fs');
    if (!fs.existsSync(doc.file_path)) {
      return res.status(404).json({ success: false, message: 'File fisik dokumen tidak ditemukan di server.' });
    }

    // Set appropriate headers for viewing in browser (inline instead of attachment)
    res.setHeader('Content-Type', doc.mime_type);
    res.setHeader('Content-Disposition', `inline; filename="${doc.original_name}"`);
    
    // Stream the file
    fs.createReadStream(doc.file_path).pipe(res);
  } catch (err) {
    log(LOG_LEVELS.ERROR, `View document error: ${err.message}`);
    res.status(500).json({ success: false, message: 'Gagal memuat dokumen.' });
  }
}

module.exports = { getDashboard, listApplicants, getApplicantDetail, verifyApplicant, viewDocument };
