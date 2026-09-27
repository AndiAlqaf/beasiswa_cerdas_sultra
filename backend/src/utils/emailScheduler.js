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
 * Start cron job — cek setiap menit
 */
function startEmailScheduler() {
  const announcementDate = env.ANNOUNCEMENT_DATE;

  if (!announcementDate) {
    log(LOG_LEVELS.WARN, '[SCHEDULER] ANNOUNCEMENT_DATE tidak diset di .env. Email scheduler dinonaktifkan.');
    return;
  }

  log(LOG_LEVELS.INFO, `[SCHEDULER] Email scheduler aktif. Pengumuman kelulusan dijadwalkan: ${announcementDate}`);

  // Reset guard setiap tengah malam
  cron.schedule('0 0 * * *', () => {
    blastPengumumanSudahTerkirim = false;
    blastSanggahSudahTerkirim = false;
    log(LOG_LEVELS.INFO, '[SCHEDULER] Guard blast direset untuk hari baru.');
  });

  // Cek setiap menit apakah hari pengumuman awal tiba
  cron.schedule('* * * * *', async () => {
    if (blastPengumumanSudahTerkirim) return;
    if (!isAnnouncementDay()) return;

    log(LOG_LEVELS.INFO, '[SCHEDULER] 🔔 Hari pengumuman tiba! Memulai blast email ke seluruh peserta LULUS awal...');
    await jalankanBlastEmail();
  });
}

module.exports = {
  startEmailScheduler,
  jalankanBlastEmail,
  jalankanBlastHasilSanggah,
  getPendaftarDiterimaAwal,
  getPendaftarLulusHasilSanggah,
};
