/**
 * Broadcast Email Mendesak: H-3 Jam Sebelum Penutupan Pendaftaran
 * Khusus Mahasiswa yang Saat Ini Masih Berstatus "PERLU_UNGGAH_ULANG"
 * 
 * Penggunaan:
 *   node broadcast_urgent_perlu_unggah_ulang.js              -> DRY-RUN (Cek total & daftar mahasiswa tanpa kirim)
 *   node broadcast_urgent_perlu_unggah_ulang.js --test=email@gmail.com  -> Uji coba kirim 1 email contoh
 *   node broadcast_urgent_perlu_unggah_ulang.js --send       -> Eksekusi pengiriman email nyata
 *   node broadcast_urgent_perlu_unggah_ulang.js --send --limit=50  -> Kirim batch 50 email
 */

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '.env') });

const { getPool } = require('./src/config/database');
const { sendMail } = require('./src/utils/mailer');
const env = require('./src/config/env');

function generateUrgentEmailHtml(namaLengkap, regNo, notes) {
  const cleanNotes = notes || 'Terdapat dokumen persyaratan pendaftaran Anda yang belum lengkap, tidak terbaca, atau perlu diperbaiki sesuai petunjuk teknis.';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>[MENDESAK] Unggah Ulang Berkas Beasiswa Sultra Cerdas 2026</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f1f5f9; padding: 25px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);">
          
          <!-- Header Banner -->
          <tr>
            <td style="background-color: #0B3A6A; padding: 28px 24px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 19px; font-weight: 800; letter-spacing: 0.5px; line-height: 1.3;">
                PANITIA SELEKSI BEASISWA SULTRA CERDAS 2026
              </h1>
              <p style="color: #bfdbfe; margin: 6px 0 0 0; font-size: 13px; font-weight: 500;">
                Pemerintah Provinsi Sulawesi Tenggara
              </p>
            </td>
          </tr>

          <!-- Red Countdown / Urgent Badge -->
          <tr>
            <td style="padding: 24px 24px 0 24px;">
              <div style="background-color: #fef2f2; border: 2px solid #ef4444; border-radius: 14px; padding: 16px 18px; text-align: center;">
                <span style="display: inline-block; background-color: #dc2626; color: #ffffff; font-size: 11px; font-weight: 800; padding: 4px 12px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px;">
                  ⚠️ PEMBERITAHUAN MENDESAK &bull; H-3 JAM TERAKHIR
                </span>
                <h2 style="color: #991b1b; font-size: 15px; font-weight: 800; margin: 10px 0 4px 0;">
                  Pendaftaran Ditutup Malam Ini: 18 Oktober 2026 Pukul 23:59 WITA
                </h2>
                <p style="color: #b91c1c; font-size: 12px; margin: 0; line-height: 1.5;">
                  Segera perbaiki dan unggah ulang berkas Anda agar tidak didiskualifikasi dari seleksi administrasi.
                </p>
              </div>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 24px 24px; color: #334155; line-height: 1.6; font-size: 14px;">
              <p style="margin: 0 0 16px 0; font-size: 15px;">
                Yth. Sdr/i <strong>${namaLengkap}</strong>,
              </p>

              <!-- Status Application Box -->
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 16px 18px; margin: 0 0 20px 0;">
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td style="padding-bottom: 8px; font-size: 13px; color: #64748b; width: 40%;">Nomor Registrasi:</td>
                    <td style="padding-bottom: 8px; font-size: 13px; color: #0B3A6A; font-weight: 800; font-family: monospace;">${regNo || '-'}</td>
                  </tr>
                  <tr>
                    <td style="padding-bottom: 8px; font-size: 13px; color: #64748b;">Status Saat Ini:</td>
                    <td style="padding-bottom: 8px; font-size: 13px; color: #dc2626; font-weight: 800;">PERLU UNGGAH ULANG</td>
                  </tr>
                  <tr>
                    <td style="font-size: 13px; color: #64748b; vertical-align: top;">Catatan Verifikator:</td>
                    <td style="font-size: 13px; color: #1e293b; font-weight: 600; line-height: 1.4;">
                      ${cleanNotes}
                    </td>
                  </tr>
                </table>
              </div>

              <p style="margin: 0 0 16px 0;">
                Berdasarkan hasil verifikasi awal panitia, berkas pendaftaran Anda belum dapat disetujui karena memerlukan perbaikan atau pengunggahan ulang dokumen pendukung.
              </p>

              <!-- Steps List -->
              <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 14px; padding: 16px 18px; margin: 0 0 24px 0;">
                <p style="margin: 0 0 10px 0; font-size: 13px; font-weight: 800; color: #1e40af; text-transform: uppercase;">
                  Langkah yang Wajib Dilakukan Sekarang:
                </p>
                <ol style="margin: 0; padding-left: 20px; font-size: 13px; color: #1e3a8a; line-height: 1.6;">
                  <li style="margin-bottom: 6px;">Login ke portal pendaftaran menggunakan akun Anda.</li>
                  <li style="margin-bottom: 6px;">Buka menu <strong>"Kelola Berkas"</strong> pada dashboard pendaftar.</li>
                  <li style="margin-bottom: 6px;">Unggah ulang dokumen yang ditandai atau sesuai catatan di atas.</li>
                  <li style="margin-bottom: 0;"><strong>KLIK TOMBOL "KIRIM ULANG PENDAFTARAN"</strong> sebelum pukul 23:59 WITA malam ini agar data Anda kembali masuk ke sistem verifikator.</li>
                </ol>
              </div>

              <!-- Button CTA -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center">
                    <a href="https://bssc.akusahabatrakyat.com/dashboard/berkas" target="_blank" style="display: inline-block; background-color: #dc2626; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 800; padding: 16px 36px; border-radius: 12px; box-shadow: 0 4px 12px rgba(220, 38, 38, 0.35); text-align: center;">
                      UNGGAH ULANG BERKAS SEKARANG &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 24px 0 0 0; font-size: 12px; color: #64748b; line-height: 1.5; border-top: 1px solid #e2e8f0; padding-top: 16px;">
                <em>Perhatian: Apabila Anda tidak mengirimkan ulang dokumen persyaratan hingga batas waktu malam ini (18 Oktober 2026 pukul 23:59 WITA), maka permohonan beasiswa Anda tidak dapat diproses ke tahapan selanjutnya. Jika Anda baru saja mengirim ulang dokumen, Anda dapat mengabaikan email ini.</em>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 20px 24px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; font-size: 12px; color: #64748b; font-weight: 600;">
                Sekretariat Panitia Seleksi Beasiswa Sultra Cerdas 2026
              </p>
              <p style="margin: 4px 0 0 0; font-size: 11px; color: #94a3b8;">
                Pemerintah Provinsi Sulawesi Tenggara &bull; Email otomatis sistem
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

async function main() {
  const args = process.argv.slice(2);
  const isSend = args.includes('--send');
  const testArg = args.find(a => a.startsWith('--test'));
  const testEmail = testArg ? testArg.split('=')[1] : null;
  const isDryRun = !isSend && !testEmail;

  console.log('================================================================');
  console.log(' BROADCAST EMAIL MENDESAK (H-3 JAM SEBELUM PENUTUPAN BSSC 2026)');
  console.log(' Khusus Status: PERLU_UNGGAH_ULANG');
  console.log('================================================================');
  console.log('Waktu Sekarang :', new Date().toLocaleString('id-ID', { timeZone: 'Asia/Makassar' }), 'WITA');
  console.log('Batas Akhir    : 18 Oktober 2026 Pukul 23:59 WITA');
  console.log('Mode Eksekusi  :', isDryRun ? 'DRY-RUN (Hanya Audit, Tidak Mengirim)' : testEmail ? `TEST KE ${testEmail}` : 'LIVE SEND (KIRIM NYATA KE PENDAFTAR)');
  console.log('SMTP Host      :', env.SMTP_HOST);
  console.log('SMTP Sender    :', env.EMAIL_FROM);
  console.log('----------------------------------------------------------------');

  const pool = getPool();

  // Query seluruh pendaftar yang status aplikasinya PERLU_UNGGAH_ULANG
  const [rows] = await pool.execute(`
    SELECT 
      a.id AS app_id,
      a.registration_no,
      a.status,
      a.notes,
      a.submitted_at,
      u.id AS user_id,
      u.email,
      u.nama_lengkap,
      p.no_hp
    FROM applications a
    JOIN users u ON u.id = a.user_id
    LEFT JOIN profiles p ON p.user_id = u.id
    WHERE a.status = 'PERLU_UNGGAH_ULANG'
    ORDER BY a.submitted_at DESC
  `);

  console.log(`[DATABASE] Ditemukan ${rows.length} pendaftar yang masih berstatus 'PERLU_UNGGAH_ULANG'.\n`);

  if (rows.length === 0) {
    console.log('✅ Tidak ada pendaftar berstatus PERLU_UNGGAH_ULANG. Semua berkas sudah lengkap / tersubmit!');
    process.exit(0);
  }

  // Jika mode test email tunggal
  if (testEmail) {
    const sample = rows[0];
    console.log(`Mengirim 1 email percobaan ke: ${testEmail}...`);
    const html = generateUrgentEmailHtml(sample.nama_lengkap || 'Pendaftar', sample.registration_no, sample.notes);
    try {
      await sendMail({
        to: testEmail,
        subject: `[MENDESAK H-3 JAM] Segera Unggah Ulang Berkas Beasiswa Sultra Cerdas - ${sample.nama_lengkap}`,
        html,
      });
      console.log('✅ Email percobaan berhasil dikirim ke:', testEmail);
    } catch (err) {
      console.error('❌ Gagal mengirim email percobaan:', err.message);
    }
    process.exit(0);
  }

  // File riwayat pengiriman
  const historyPath = path.join(__dirname, 'urgent_perlu_unggah_ulang_history.json');
  let sentHistory = new Set();
  if (fs.existsSync(historyPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(historyPath, 'utf8'));
      if (Array.isArray(data)) sentHistory = new Set(data);
    } catch (e) {}
  }

  // Filter yang belum dikirim
  const pendingRecipients = rows.filter(r => r.email && !sentHistory.has(r.email.trim().toLowerCase()));

  const limitArg = args.find(a => a.startsWith('--limit='));
  const maxToSend = limitArg ? parseInt(limitArg.split('=')[1], 10) : pendingRecipients.length;
  const toSendBatch = pendingRecipients.slice(0, maxToSend);

  console.log(`Total pendaftar PERLU_UNGGAH_ULANG : ${rows.length}`);
  console.log(`Sudah pernah dikirimi email ini     : ${sentHistory.size}`);
  console.log(`Sisa antrean belum dikirim          : ${pendingRecipients.length}`);
  if (limitArg) {
    console.log(`Batas pengiriman batch ini          : ${toSendBatch.length} email (--limit=${maxToSend})`);
  }
  console.log('----------------------------------------------------------------');

  // Jika DRY-RUN
  if (isDryRun) {
    console.log('DAFTAR MAHASISWA YANG AKAN DIKIRIMI EMAIL:');
    toSendBatch.slice(0, 20).forEach((r, idx) => {
      console.log(`${idx + 1}. [${r.registration_no || '-'}] ${r.nama_lengkap} (${r.email}) - Catatan: "${(r.notes || 'Perlu unggah berkas').substring(0, 45)}..."`);
    });

    if (toSendBatch.length > 20) {
      console.log(`... dan ${toSendBatch.length - 20} mahasiswa lainnya.`);
    }

    console.log('\n[PANDUAN EKSEKUSI PENGIRIMAN]:');
    console.log('  1. Kirim 1 email uji coba ke email Anda sendiri:');
    console.log('     node broadcast_urgent_perlu_unggah_ulang.js --test=email_anda@gmail.com');
    console.log('\n  2. Eksekusi pengiriman email nyata ke SEMUA pendaftar tersebut:');
    console.log('     node broadcast_urgent_perlu_unggah_ulang.js --send');
    console.log('\n  3. Atau eksekusi secara bertahap (misal 50 per batch):');
    console.log('     node broadcast_urgent_perlu_unggah_ulang.js --send --limit=50');
    process.exit(0);
  }

  // Jika LIVE SEND
  console.log(`🚀 MEMULAI PENGIRIMAN EMAIL NYATA KE ${toSendBatch.length} PENDAFTAR...`);
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < toSendBatch.length; i++) {
    const r = toSendBatch[i];
    const emailLower = r.email.trim().toLowerCase();
    const html = generateUrgentEmailHtml(r.nama_lengkap || 'Pendaftar', r.registration_no, r.notes);
    const subject = `[MENDESAK H-3 JAM] Segera Unggah Ulang Berkas Beasiswa Sultra Cerdas - ${r.nama_lengkap}`;

    try {
      console.log(`[${i + 1}/${toSendBatch.length}] Mengirim ke ${r.email} (${r.registration_no || '-'} - ${r.nama_lengkap})...`);
      await sendMail({
        to: r.email,
        subject,
        html,
      });
      successCount++;
      sentHistory.add(emailLower);
      fs.writeFileSync(historyPath, JSON.stringify(Array.from(sentHistory), null, 2), 'utf8');
    } catch (err) {
      console.error(`❌ Gagal kirim ke ${r.email}:`, err.message);
      failCount++;

      // Jika kuota habis
      if (err.message && (err.message.includes('quota') || err.message.includes('limit') || err.message.includes('451'))) {
        console.warn('\n⚠️ Kuota harian SMTP kemungkinan habis!');
        console.warn('Pengiriman dihentikan. Riwayat sukses tersimpan di urgent_perlu_unggah_ulang_history.json.');
        break;
      }
    }

    // Jeda 1.2 detik antar email agar tidak terkena rate limit
    await new Promise(resolve => setTimeout(resolve, 1200));
  }

  console.log('================================================================');
  console.log('PENGIRIMAN SELESAI:');
  console.log(`✅ Berhasil Terkirim Baru : ${successCount}`);
  console.log(`❌ Gagal                  : ${failCount}`);
  console.log(`📊 Total Kumulatif Sukses : ${sentHistory.size} / ${rows.length}`);
  console.log(`Sisa Antrean              : ${rows.length - sentHistory.size} mahasiswa`);
  console.log('================================================================');
}

if (require.main === module) {
  main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}

module.exports = { generateUrgentEmailHtml, main };
