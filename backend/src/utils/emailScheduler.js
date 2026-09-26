/**
 * Email Scheduler — Cron Job Pengumuman Kelulusan BSSC
 *
 * Cara kerja:
 * 1. Cron berjalan setiap menit
 * 2. Cek apakah tanggal & jam saat ini = ANNOUNCEMENT_DATE di .env
 * 3. Jika ya: ambil semua pendaftar berstatus DITERIMA dari DB
 * 4. Kirim email pengumuman kelulusan hanya ke pendaftar yang LULUS
 * 5. Tandai sudah terkirim agar tidak terkirim 2x
 *
 * Tanggal diambil dari .env: ANNOUNCEMENT_DATE=2026-10-16
 */

const cron = require('node-cron');
const env = require('../config/env');
const { getPool } = require('../config/database');
const { sendBulkMail } = require('./mailer');
const { templateKelulusan } = require('../templates/emailKelulusan');
const { log, LOG_LEVELS } = require('./logger');

let blastSudahTerkirim = false; // Guard agar tidak blast 2x dalam 1 hari

/**
 * Cek apakah sekarang adalah hari pengumuman
 */
function isAnnouncementDay() {
  const announcementDate = env.ANNOUNCEMENT_DATE;
  if (!announcementDate) return false;

  // Format tanggal hari ini: YYYY-MM-DD
  const today = new Date().toISOString().split('T')[0];
  return today === announcementDate;
}

/**
 * Ambil semua pendaftar berstatus DITERIMA dari DB
 */
async function getPendaftarDiterima() {
  const pool = getPool();
  const [rows] = await pool.execute(`
    SELECT
      u.email,
      u.nama_lengkap,
      u.jenjang_target,
      a.registration_no,
      a.status
    FROM applications a
    JOIN users u ON u.id = a.user_id
    WHERE a.status = 'DITERIMA'
  `);
  return rows;
}

/**
 * Jalankan blast email pengumuman kelulusan (Hanya untuk yang LULUS)
 */
async function jalankanBlastEmail() {
  log(LOG_LEVELS.INFO, '[SCHEDULER] Memulai blast email pengumuman kelulusan BSSC (khusus pendaftar LULUS)...');

  try {
    const pendaftarLulus = await getPendaftarDiterima();

    if (pendaftarLulus.length === 0) {
      log(LOG_LEVELS.WARN, '[SCHEDULER] Tidak ada pendaftar berstatus DITERIMA. Blast dilewati.');
      return { sent: 0, failed: 0 };
    }

    // Format tanggal pengumuman untuk email
    const rawDate = env.ANNOUNCEMENT_DATE || new Date().toISOString().split('T')[0];
    const tglPengumuman = new Date(rawDate).toLocaleDateString('id-ID', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });

    log(LOG_LEVELS.INFO, `[SCHEDULER] Ditemukan ${pendaftarLulus.length} pendaftar LULUS. Menyiapkan email...`);

    // Siapkan daftar email khusus DITERIMA
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

    log(LOG_LEVELS.INFO, `[SCHEDULER] ✅ Blast kelulusan selesai. Terkirim: ${sent}, Gagal: ${failed}`);
    blastSudahTerkirim = true; // Tandai sudah blast hari ini
    return { sent, failed };

  } catch (err) {
    log(LOG_LEVELS.ERROR, `[SCHEDULER] ❌ Blast email gagal: ${err.message}`);
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
    blastSudahTerkirim = false;
    log(LOG_LEVELS.INFO, '[SCHEDULER] Guard blast direset untuk hari baru.');
  });

  // Cek setiap menit apakah sudah saatnya kirim
  cron.schedule('* * * * *', async () => {
    if (blastSudahTerkirim) return; // Sudah blast hari ini
    if (!isAnnouncementDay()) return; // Belum hari pengumuman

    log(LOG_LEVELS.INFO, '[SCHEDULER] 🔔 Hari pengumuman tiba! Memulai blast email ke seluruh peserta LULUS...');
    await jalankanBlastEmail();
  });
}

module.exports = {
  startEmailScheduler,
  jalankanBlastEmail,
  getPendaftarDiterima,
};
