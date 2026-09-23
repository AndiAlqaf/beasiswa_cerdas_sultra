/**
 * Applicant Controller — Profile, Documents, Application
 * 
 * All operations are scoped to the authenticated user.
 * No user can access another user's data.
 */

const { v4: uuidv4 } = require('uuid');
const { getPool } = require('../config/database');
const { auditLog, getClientIp, log, LOG_LEVELS } = require('../utils/logger');

/**
 * GET /api/v1/applicant/profile
 */
async function getProfile(req, res) {
  try {
    const userId = req.user.id;
    const pool = getPool();

    const [userRows] = await pool.execute(`
      SELECT u.id, u.email, u.nik, u.nama_lengkap, u.jenjang_target, u.role, u.created_at,
             p.tempat_lahir, p.tanggal_lahir, p.gender, p.no_hp, p.status_pernikahan,
             p.alamat_domisili, p.selfie_path,
             p.no_kk, p.alamat_ktp, p.akreditasi_prodi, p.nim, p.semester, p.ipk, p.target_lulus,
             p.beasiswa_lain, p.nama_ayah, p.pekerjaan_ayah, p.nama_ibu, p.pekerjaan_ibu,
             p.penghasilan_ortu, p.jumlah_tanggungan, p.kepemilikan_bantuan,
             p.prestasi_akademik, p.prestasi_non_akademik, p.pengalaman_organisasi,
             p.pengalaman_pengabdian, p.pelatihan_sertifikasi
      FROM users u
      LEFT JOIN profiles p ON p.user_id = u.id
      WHERE u.id = ?
    `, [userId]);

    if (userRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Profil tidak ditemukan.' });
    }
    const user = userRows[0];

    const [education] = await pool.execute(
      'SELECT id, tingkat, institusi, jurusan, tahun_mulai, tahun_lulus FROM education_history WHERE user_id = ? ORDER BY sort_order ASC',
      [userId]
    );

    const [documents] = await pool.execute(
      'SELECT id, doc_type, original_name, mime_type, file_size, uploaded_at FROM documents WHERE user_id = ?',
      [userId]
    );

    res.json({
      success: true,
      data: {
        user: {
          id: user.id, email: user.email, nik: user.nik,
          namaLengkap: user.nama_lengkap, jenjangTarget: user.jenjang_target,
          role: user.role, createdAt: user.created_at,
        },
        profile: {
          tempatLahir: user.tempat_lahir, tanggalLahir: user.tanggal_lahir,
          gender: user.gender, noHp: user.no_hp,
          statusPernikahan: user.status_pernikahan, alamatDomisili: user.alamat_domisili,
          hasSelfie: !!user.selfie_path,
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
          pelatihanSertifikasi: user.pelatihan_sertifikasi
        },
        education,
        documents: documents.map(doc => ({
          id: doc.id, docType: doc.doc_type, originalName: doc.original_name,
          mimeType: doc.mime_type, fileSize: doc.file_size, uploadedAt: doc.uploaded_at,
        })),
      },
    });
  } catch (err) {
    log(LOG_LEVELS.ERROR, `Get profile error: ${err.message}`);
    res.status(500).json({ success: false, message: 'Gagal mengambil profil.' });
  }
}

/**
 * PUT /api/v1/applicant/profile
 */
async function updateProfile(req, res) {
  try {
    const userId = req.user.id;
    const { 
      tempatLahir, tanggalLahir, gender, noHp, statusPernikahan, alamatDomisili,
      noKk, alamatKtp, akreditasiProdi, nim, semester, ipk, targetLulus,
      beasiswaLain, namaAyah, pekerjaanAyah, namaIbu, pekerjaanIbu,
      penghasilanOrtu, jumlahTanggungan, kepemilikanBantuan,
      prestasiAkademik, prestasiNonAkademik, pengalamanOrganisasi,
      pengalamanPengabdian, pelatihanSertifikasi
    } = req.body;
    const pool = getPool();

    await pool.execute(`
      UPDATE profiles
      SET tempat_lahir = COALESCE(?, tempat_lahir),
          tanggal_lahir = COALESCE(?, tanggal_lahir),
          gender = COALESCE(?, gender),
          no_hp = COALESCE(?, no_hp),
          status_pernikahan = COALESCE(?, status_pernikahan),
          alamat_domisili = COALESCE(?, alamat_domisili),
          no_kk = COALESCE(?, no_kk),
          alamat_ktp = COALESCE(?, alamat_ktp),
          akreditasi_prodi = COALESCE(?, akreditasi_prodi),
          nim = COALESCE(?, nim),
          semester = COALESCE(?, semester),
          ipk = COALESCE(?, ipk),
          target_lulus = COALESCE(?, target_lulus),
          beasiswa_lain = COALESCE(?, beasiswa_lain),
          nama_ayah = COALESCE(?, nama_ayah),
          pekerjaan_ayah = COALESCE(?, pekerjaan_ayah),
          nama_ibu = COALESCE(?, nama_ibu),
          pekerjaan_ibu = COALESCE(?, pekerjaan_ibu),
          penghasilan_ortu = COALESCE(?, penghasilan_ortu),
          jumlah_tanggungan = COALESCE(?, jumlah_tanggungan),
          kepemilikan_bantuan = COALESCE(?, kepemilikan_bantuan),
          prestasi_akademik = COALESCE(?, prestasi_akademik),
          prestasi_non_akademik = COALESCE(?, prestasi_non_akademik),
          pengalaman_organisasi = COALESCE(?, pengalaman_organisasi),
          pengalaman_pengabdian = COALESCE(?, pengalaman_pengabdian),
          pelatihan_sertifikasi = COALESCE(?, pelatihan_sertifikasi)
      WHERE user_id = ?
    `, [
      tempatLahir || null, tanggalLahir || null, gender || null,
      noHp || null, statusPernikahan || null, alamatDomisili || null,
      noKk || null, alamatKtp || null, akreditasiProdi || null, nim || null,
      semester || null, ipk || null, targetLulus || null, beasiswaLain || null,
      namaAyah || null, pekerjaanAyah || null, namaIbu || null, pekerjaanIbu || null,
      penghasilanOrtu || null, jumlahTanggungan || null, kepemilikanBantuan || null,
      prestasiAkademik || null, prestasiNonAkademik || null, pengalamanOrganisasi || null,
      pengalamanPengabdian || null, pelatihanSertifikasi || null,
      userId,
    ]);

    auditLog({ action: 'PROFILE_UPDATED', userId, ipAddress: getClientIp(req), requestId: req.requestId });
    res.json({ success: true, message: 'Profil berhasil diperbarui.' });
  } catch (err) {
    log(LOG_LEVELS.ERROR, `Update profile error: ${err.message}`);
    res.status(500).json({ success: false, message: 'Gagal memperbarui profil.' });
  }
}

/**
 * PUT /api/v1/applicant/education
 */
async function updateEducation(req, res) {
  try {
    const userId = req.user.id;
    const { educationList } = req.body;
    const pool = getPool();

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      await conn.execute('DELETE FROM education_history WHERE user_id = ?', [userId]);

      for (let i = 0; i < educationList.length; i++) {
        const edu = educationList[i];
        await conn.execute(
          `INSERT INTO education_history (id, user_id, tingkat, institusi, jurusan, tahun_mulai, tahun_lulus, sort_order)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [uuidv4(), userId, edu.tingkat, edu.institusi, edu.jurusan || null, edu.tahunMulai || null, edu.tahunLulus || null, i]
        );
      }

      await conn.commit();
    } catch (txErr) {
      await conn.rollback();
      throw txErr;
    } finally {
      conn.release();
    }

    auditLog({ action: 'EDUCATION_UPDATED', userId, ipAddress: getClientIp(req), details: { count: educationList.length }, requestId: req.requestId });
    res.json({ success: true, message: 'Riwayat pendidikan berhasil diperbarui.' });
  } catch (err) {
    log(LOG_LEVELS.ERROR, `Update education error: ${err.message}`);
    res.status(500).json({ success: false, message: 'Gagal memperbarui riwayat pendidikan.' });
  }
}

/**
 * POST /api/v1/applicant/upload/selfie|ktm|pendukung
 */
function uploadDocument(docType) {
  return async (req, res) => {
    try {
      const userId = req.user.id;
      const pool = getPool();

      if (!req.file) {
        return res.status(400).json({ success: false, message: 'File tidak ditemukan. Silakan pilih file untuk diunggah.' });
      }

      // Remove old document of same type
      const [oldDocs] = await pool.execute(
        'SELECT id, file_path FROM documents WHERE user_id = ? AND doc_type = ?',
        [userId, docType]
      );

      if (oldDocs.length > 0) {
        const fs = require('fs');
        try { if (fs.existsSync(oldDocs[0].file_path)) fs.unlinkSync(oldDocs[0].file_path); } catch (e) { /* ignore */ }
        await pool.execute('DELETE FROM documents WHERE id = ?', [oldDocs[0].id]);
      }

      // Save document record
      const docId = uuidv4();
      await pool.execute(
        `INSERT INTO documents (id, user_id, doc_type, original_name, stored_name, mime_type, file_size, file_path)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [docId, userId, docType, req.file.originalname, req.file.filename, req.file.mimetype, req.file.size, req.file.path]
      );

      if (docType === 'selfie' || docType === 'filePasfoto') {
        await pool.execute('UPDATE profiles SET selfie_path = ? WHERE user_id = ?', [req.file.path, userId]);
      }

      auditLog({
        action: 'FILE_UPLOADED', userId, ipAddress: getClientIp(req),
        details: { docType, originalName: req.file.originalname, storedName: req.file.filename, mimeType: req.file.mimetype, size: req.file.size },
        requestId: req.requestId,
      });

      res.json({
        success: true,
        message: `File ${docType} berhasil diunggah.`,
        data: { documentId: docId, originalName: req.file.originalname, mimeType: req.file.mimetype, size: req.file.size },
      });
    } catch (err) {
      log(LOG_LEVELS.ERROR, `Upload ${docType} error: ${err.message}`);
      res.status(500).json({ success: false, message: 'Gagal mengunggah file.' });
    }
  };
}

/**
 * GET /api/v1/applicant/application
 */
async function getApplication(req, res) {
  try {
    const userId = req.user.id;
    const pool = getPool();

    const [appRows] = await pool.execute(
      `SELECT id, registration_no, status, notes, submitted_at, verified_at FROM applications WHERE user_id = ?`,
      [userId]
    );

    if (appRows.length === 0) {
      return res.json({ success: true, data: null, message: 'Belum ada pendaftaran beasiswa.' });
    }

    const app = appRows[0];
    res.json({
      success: true,
      data: { id: app.id, registrationNo: app.registration_no, status: app.status, notes: app.notes, submittedAt: app.submitted_at, verifiedAt: app.verified_at },
    });
  } catch (err) {
    log(LOG_LEVELS.ERROR, `Get application error: ${err.message}`);
    res.status(500).json({ success: false, message: 'Gagal mengambil status pendaftaran.' });
  }
}

/**
 * POST /api/v1/applicant/application
 */
async function submitApplication(req, res) {
  try {
    const userId = req.user.id;
    const pool = getPool();

    const [existing] = await pool.execute('SELECT id FROM applications WHERE user_id = ?', [userId]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'Anda sudah mengajukan pendaftaran beasiswa.' });
    }

    const [profileRows] = await pool.execute('SELECT * FROM profiles WHERE user_id = ?', [userId]);
    const profile = profileRows[0];
    if (!profile || !profile.tempat_lahir || !profile.tanggal_lahir || !profile.gender) {
      return res.status(400).json({ success: false, message: 'Lengkapi profil Anda terlebih dahulu sebelum mengajukan pendaftaran.' });
    }

    const [ktmRows] = await pool.execute("SELECT id FROM documents WHERE user_id = ? AND doc_type = 'ktm'", [userId]);
    if (ktmRows.length === 0) {
      return res.status(400).json({ success: false, message: 'Unggah KTM/Surat Aktif Kuliah terlebih dahulu.' });
    }

    const [userRows] = await pool.execute('SELECT jenjang_target FROM users WHERE id = ?', [userId]);
    const [countRows] = await pool.execute('SELECT COUNT(*) as cnt FROM applications');
    const year = new Date().getFullYear();
    const regNo = `BSSC-${year}-${userRows[0].jenjang_target}-${String(countRows[0].cnt + 1).padStart(4, '0')}`;

    const appId = uuidv4();
    await pool.execute(
      `INSERT INTO applications (id, user_id, registration_no, status) VALUES (?, ?, ?, 'TERKIRIM')`,
      [appId, userId, regNo]
    );

    auditLog({ action: 'APPLICATION_SUBMITTED', userId, ipAddress: getClientIp(req), details: { registrationNo: regNo }, requestId: req.requestId });

    res.status(201).json({
      success: true,
      message: 'Pendaftaran beasiswa berhasil diajukan!',
      data: { id: appId, registrationNo: regNo, status: 'TERKIRIM' },
    });
  } catch (err) {
    log(LOG_LEVELS.ERROR, `Submit application error: ${err.message}`);
    res.status(500).json({ success: false, message: 'Gagal mengajukan pendaftaran.' });
  }
}

module.exports = { getProfile, updateProfile, updateEducation, uploadDocument, getApplication, submitApplication };
