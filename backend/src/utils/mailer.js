/**
 * Mailer Utility — Nodemailer + Brevo SMTP
 *
 * Menangani pengiriman email transaksional untuk sistem BSSC.
 * Provider: Brevo (via SMTP relay) — gratis 300 email/hari
 */

const nodemailer = require('nodemailer');
const env = require('../config/env');
const { log, LOG_LEVELS } = require('./logger');

let transporter = null;

/**
 * Inisialisasi koneksi SMTP (lazy init — hanya dibuat saat pertama dipakai)
 */
function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: false, // STARTTLS
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });
  }
  return transporter;
}

/**
 * Kirim satu email
 * @param {Object} options - { to, subject, html }
 */
async function sendMail({ to, subject, html }) {
  if (!env.SMTP_USER || !env.SMTP_PASS) {
    log(LOG_LEVELS.WARN, `[MAILER] SMTP belum dikonfigurasi. Email ke ${to} dilewati.`);
    return { skipped: true };
  }

  try {
    const info = await getTransporter().sendMail({
      from: env.EMAIL_FROM,
      to,
      subject,
      html,
    });

    log(LOG_LEVELS.INFO, `[MAILER] Email terkirim ke ${to}`, { messageId: info.messageId });
    return { success: true, messageId: info.messageId };
  } catch (err) {
    log(LOG_LEVELS.ERROR, `[MAILER] Gagal kirim email ke ${to}: ${err.message}`);
    throw err;
  }
}

/**
 * Kirim email ke banyak penerima secara berurutan (blast)
 * @param {Array} recipients - [{ to, subject, html }]
 * @returns {{ sent, failed }}
 */
async function sendBulkMail(recipients) {
  let sent = 0;
  let failed = 0;

  for (const item of recipients) {
    try {
      await sendMail(item);
      sent++;
      // Jeda kecil antar email agar tidak dianggap spam
      await new Promise((r) => setTimeout(r, 100));
    } catch {
      failed++;
    }
  }

  log(LOG_LEVELS.INFO, `[MAILER] Bulk mail selesai: ${sent} terkirim, ${failed} gagal`);
  return { sent, failed };
}

module.exports = { sendMail, sendBulkMail };
