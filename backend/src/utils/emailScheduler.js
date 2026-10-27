/**
 * Email Scheduler — Cron Job & Pengiriman Email Pengumuman BSSC
 *
 * Mendukung 2 Fase Pengiriman Email Kelulusan:
 * 1. FASE PENGUMUMAN AWAL:
 *    - Mengirimkan email kelulusan resmi ke pendaftar yang lulus seleksi awal (DITERIMA).
 *    - Menandai announcement_email_sent_at di database.
 * 
 * 2. FASE HASIL SANGGAH:
 *    - Hanya mengirimkan email kelulusan hasil sanggah kepada pendaftar yang sanggahannya DIKABULKAN (is_lulus_sanggah = 1 atau memiliki riwayat sanggahan).
 *    - TIDAK AKAN mengirim ulang kepada peserta yang sudah lulus dan diumumkan di fase pengumuman awal.
 *    - Menandai appeal_email_sent_at di database.
 */

const cron = require('node-cron');
const env = require('../config/env');
const { getPool } = require('../config/database');
const { sendBulkMail } = require('./mailer');
const { templateKelulusan, templateKelulusanHasilSanggah } = require('../templates/emailKelulusan');
const { log, LOG_LEVELS } = require('./logger');

let blastPengumumanSudahTerkirim = false;
let blastSanggahSudahTerkirim = false;

/**
 * Cek apakah sekarang adalah hari pengumuman
 */
function isAnnouncementDay() {
  const announcementDate = env.ANNOUNCEMENT_DATE;
  if (!announcementDate) return false;

  const today = new Date().toISOString().split('T')[0];
  return today === announcementDate;
}

/**
 * Ambil pendaftar yang lulus di FASE PENGUMUMAN AWAL
 * (status DITERIMA dan bukan dari jalur sanggah)
 */
async function getPendaftarDiterimaAwal() {
  const pool = getPool();
  const [rows] = await pool.execute(`
    SELECT
      a.id AS application_id,
      u.email,
      u.nama_lengkap,
      u.jenjang_target,
      a.registration_no,
      a.status
    FROM applications a
    JOIN users u ON u.id = a.user_id
    WHERE a.status = 'DITERIMA'
      AND a.is_lulus_sanggah = 0
  `);
  return rows;
}

/**
 * Ambil pendaftar yang lulus HANYA DI FASE HASIL SANGGAH
 * (status DITERIMA, lulus karena sanggahan dikabulkan, dan BELUM pernah dikirimi email pengumuman awal)
 */
async function getPendaftarLulusHasilSanggah() {
  const pool = getPool();
  const [rows] = await pool.execute(`
    SELECT
      a.id AS application_id,
      u.email,
      u.nama_lengkap,
      u.jenjang_target,
      a.registration_no,
      a.status,
      a.notes
    FROM applications a
    JOIN users u ON u.id = a.user_id
    WHERE a.status = 'DITERIMA'
      AND (a.is_lulus_sanggah = 1 OR a.notes LIKE '%[SANGGAHAN%')
      AND a.announcement_email_sent_at IS NULL
  `);
  return rows;
}

/**
 * 1. Blast Email Pengumuman Kelulusan Awal
 */
async function jalankanBlastEmail() {
  log(LOG_LEVELS.INFO, '[SCHEDULER] Memulai blast email pengumuman kelulusan awal...');

  try {
    const pendaftarLulus = await getPendaftarDiterimaAwal();

    if (pendaftarLulus.length === 0) {
      log(LOG_LEVELS.WARN, '[SCHEDULER] Tidak ada pendaftar berstatus DITERIMA di tahap awal.');
      return { sent: 0, failed: 0 };
    }

    const rawDate = env.ANNOUNCEMENT_DATE || new Date().toISOString().split('T')[0];
    const tglPengumuman = new Date(rawDate).toLocaleDateString('id-ID', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });

    log(LOG_LEVELS.INFO, `[SCHEDULER] Ditemukan ${pendaftarLulus.length} pendaftar lulus awal. Menyiapkan email...`);

    const recipients = pendaftarLulus.map((p) => {
      const { subject, html } = templateKelulusan({
        namaLengkap: p.nama_lengkap,
        registrationNo: p.registration_no,
        jenjangTarget: p.jenjang_target,
        announcementDate: tglPengumuman,
      });
      return { to: p.email, subject, html };
    });

    const { sent, failed } = await sendBulkMail(recipients);

    // Tandai tanggal kirim di database agar tidak terkirim ulang
    if (sent > 0) {
      const pool = getPool();
      const appIds = pendaftarLulus.map(p => p.application_id);
      const placeholders = appIds.map(() => '?').join(',');
      await pool.execute(
        `UPDATE applications SET announcement_email_sent_at = NOW() WHERE id IN (${placeholders})`,
        appIds
      );
    }

    log(LOG_LEVELS.INFO, `[SCHEDULER] ✅ Blast kelulusan awal selesai. Terkirim: ${sent}, Gagal: ${failed}`);
    blastPengumumanSudahTerkirim = true;
    return { sent, failed };

  } catch (err) {
    log(LOG_LEVELS.ERROR, `[SCHEDULER] ❌ Blast email awal gagal: ${err.message}`);
    throw err;
  }
}

/**
 * 2. Blast Email Pengumuman Hasil Sanggah
 * (HANYA mengirim ke peserta yang baru lulus lewat sanggahan)
 */
async function jalankanBlastHasilSanggah() {
  log(LOG_LEVELS.INFO, '[SCHEDULER] Memulai blast email pengumuman HASIL SANGGAH (khusus sanggahan dikabulkan)...');

  try {
    const pendaftarSanggah = await getPendaftarLulusHasilSanggah();

    if (pendaftarSanggah.length === 0) {
      log(LOG_LEVELS.WARN, '[SCHEDULER] Tidak ada pendaftar yang lulus di tahap hasil sanggah.');
      return { sent: 0, failed: 0 };
    }

    const tglPengumumanSanggah = new Date().toLocaleDateString('id-ID', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });

    log(LOG_LEVELS.INFO, `[SCHEDULER] Ditemukan ${pendaftarSanggah.length} peserta lulus hasil sanggah. Menyiapkan email...`);

    const recipients = pendaftarSanggah.map((p) => {
      const { subject, html } = templateKelulusanHasilSanggah({
        namaLengkap: p.nama_lengkap,
        registrationNo: p.registration_no,
        jenjangTarget: p.jenjang_target,
        announcementDate: tglPengumumanSanggah,
      });
      return { to: p.email, subject, html };
    });

    const { sent, failed } = await sendBulkMail(recipients);

    // Tandai tanggal kirim sanggah di database
    if (sent > 0) {
      const pool = getPool();
      const appIds = pendaftarSanggah.map(p => p.application_id);
      const placeholders = appIds.map(() => '?').join(',');
      await pool.execute(
        `UPDATE applications SET appeal_email_sent_at = NOW(), is_lulus_sanggah = 1 WHERE id IN (${placeholders})`,
        appIds
      );
    }

    log(LOG_LEVELS.INFO, `[SCHEDULER] ✅ Blast hasil sanggah selesai. Terkirim: ${sent}, Gagal: ${failed}`);
    blastSanggahSudahTerkirim = true;
    return { sent, failed };

  } catch (err) {
    log(LOG_LEVELS.ERROR, `[SCHEDULER] ❌ Blast email hasil sanggah gagal: ${err.message}`);
    throw err;
  }
}

/**
 * 3. Blast Email Resmi Penetapan Penerima Beasiswa (SK Gubernur)
 * Khusus dikirim pada tahap Penetapan Penerima Beasiswa.
 */
async function jalankanBlastPenetapanPenerima() {
  log(LOG_LEVELS.INFO, '[SCHEDULER] Memulai blast email PENETAPAN RESMI PENERIMA BEASISWA (SK Gubernur)...');

  try {
    const pool = getPool();
    const [penerimaResmi] = await pool.execute(`
      SELECT
        a.id AS application_id,
        u.email,
        u.nama_lengkap,
        u.jenjang_target,
        a.registration_no,
        a.status
      FROM applications a
      JOIN users u ON u.id = a.user_id
      WHERE a.status IN ('DITERIMA', 'PENCAIRAN_TERMIN_1', 'PENCAIRAN_TERMIN_2')
        AND a.announcement_email_sent_at IS NULL
    `);

    if (penerimaResmi.length === 0) {
      log(LOG_LEVELS.WARN, '[SCHEDULER] Tidak ada penerima beasiswa baru yang belum dikirimi email penetapan.');
      return { sent: 0, failed: 0 };
    }

    const tglPenetapan = new Date().toLocaleDateString('id-ID', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });

    log(LOG_LEVELS.INFO, `[SCHEDULER] Ditemukan ${penerimaResmi.length} penerima resmi SK Gubernur. Menyiapkan email...`);

    const recipients = penerimaResmi.map((p) => {
      const { subject, html } = templateKelulusan({
        namaLengkap: p.nama_lengkap,
        registrationNo: p.registration_no,
        jenjangTarget: p.jenjang_target,
        announcementDate: tglPenetapan,
      });
      return { to: p.email, subject, html };
    });

    const { sent, failed } = await sendBulkMail(recipients);

    if (sent > 0) {
      const appIds = penerimaResmi.map(p => p.application_id);
      const placeholders = appIds.map(() => '?').join(',');
      await pool.execute(
        `UPDATE applications SET announcement_email_sent_at = NOW() WHERE id IN (${placeholders})`,
        appIds
      );
    }

    log(LOG_LEVELS.INFO, `[SCHEDULER] ✅ Blast penetapan penerima selesai. Terkirim: ${sent}, Gagal: ${failed}`);
    blastPengumumanSudahTerkirim = true;
    return { sent, failed };
  } catch (err) {
    log(LOG_LEVELS.ERROR, `[SCHEDULER] ❌ Blast email penetapan gagal: ${err.message}`);
    throw err;
  }
}

/**
 * Start cron job
 * Sesuai arahan Panitia: Pengumuman hasil seleksi awal & hasil sanggah HANYA ada di portal web
 * (tidak ada email terkirim saat mahasiswa melihat hasil seleksi/sanggah).
 * Email resmi HANYA dikirimkan saat tahap Penetapan Penerima Beasiswa (SK Gubernur).
 */
function startEmailScheduler() {
  const penetapanDate = env.PENETAPAN_DATE || '2026-11-16';

  log(LOG_LEVELS.INFO, `[SCHEDULER] Email scheduler aktif. Email kelulusan hanya dikirim pada tahap Penetapan Penerima Beasiswa: ${penetapanDate}`);

  // Reset guard setiap tengah malam
  cron.schedule('0 0 * * *', () => {
    blastPengumumanSudahTerkirim = false;
    blastSanggahSudahTerkirim = false;
    log(LOG_LEVELS.INFO, '[SCHEDULER] Guard blast direset untuk hari baru.');
  });

  // Cek pada hari penetapan penerima beasiswa
  cron.schedule('0 9 * * *', async () => {
    if (blastPengumumanSudahTerkirim) return;
    const today = new Date().toISOString().split('T')[0];
    if (today !== penetapanDate) return;

    log(LOG_LEVELS.INFO, '[SCHEDULER] 🔔 Hari penetapan penerima beasiswa tiba! Memulai pengiriman email SK...');
    await jalankanBlastPenetapanPenerima();
  });
}

module.exports = {
  startEmailScheduler,
  jalankanBlastPenetapanPenerima,
  jalankanBlastEmail,
  jalankanBlastHasilSanggah,
  getPendaftarDiterimaAwal,
  getPendaftarLulusHasilSanggah,
};
