/**
 * Broadcast Email Pemberitahuan Unggah Ulang Berkas (Missing Files Notification)
 * 
 * Penggunaan:
 *   node broadcast_missing_docs_email.js --dry-run
 *   node broadcast_missing_docs_email.js --test=email_tujuan@gmail.com
 *   node broadcast_missing_docs_email.js --send
 */

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const { getPool } = require('./src/config/database');
const { sendMail } = require('./src/utils/mailer');
const env = require('./src/config/env');

const DOC_NAME_MAP = {
  ktm: 'Kartu Tanda Mahasiswa (KTM) / Surat Keterangan Aktif Kuliah',
  surataktif: 'Surat Keterangan Aktif Kuliah',
  filesurataktif: 'Surat Keterangan Aktif Kuliah',
  selfie: 'Pasfoto Formal / Foto Wajah (Selfie)',
  pasfoto: 'Pasfoto Formal / Foto Wajah',
  filepasfoto: 'Pasfoto Formal / Foto Wajah',
  transkrip: 'Transkrip Nilai Akademik',
  filetranskrip: 'Transkrip Nilai Akademik',
  pernyataan: 'Surat Pernyataan Bebas Beasiswa',
  suratpernyataan: 'Surat Pernyataan Bebas Beasiswa',
  surat_pernyataan: 'Surat Pernyataan Bebas Beasiswa',
  ktp: 'Kartu Tanda Penduduk (KTP)',
  filektp: 'Kartu Tanda Penduduk (KTP)',
  dtks: 'Bukti DTKS / Surat Keterangan Tidak Mampu / Ijazah',
  filedtks: 'Bukti DTKS / Surat Keterangan Tidak Mampu / Ijazah',
  pendukung: 'Berkas Sertifikat Prestasi / Dokumen Pendukung',
  surat_permohonan: 'Surat Permohonan',
  suratpermohonan: 'Surat Permohonan',
  filesuratpermohonan: 'Surat Permohonan',
  esai: 'Motivation Letter / Esai',
  filemotivationoresai: 'Motivation Letter / Esai',
};

function formatDocName(type) {
  const clean = (type || '').toLowerCase().replace(/[^a-z0-9_]/g, '');
  return DOC_NAME_MAP[clean] || (type || 'Dokumen Persyaratan').toUpperCase();
}

function generateEmailHtml(namaLengkap, missingDocList, regNo = null, appStatus = null) {
  const docListHtml = missingDocList
    .map(
      (d) => `
      <li style="margin-bottom: 8px; color: #1e293b; font-size: 14px; font-weight: 600;">
        ⚠️ <span style="color: #b91c1c;">${formatDocName(d)}</span>
      </li>
    `
    )
    .join('');

  const statusBoxHtml = regNo
    ? `
      <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 14px 18px; margin: 0 0 18px 0;">
        <p style="margin: 0; font-size: 13px; color: #1e40af; line-height: 1.5;">
          <strong>Nomor Registrasi Anda:</strong> <span style="font-family: monospace; font-weight: 700; background-color: #dbeafe; padding: 2px 6px; border-radius: 4px;">${regNo}</span> (Tetap Tercatat & Aman)<br>
          <span style="font-size: 12px; color: #1d4ed8; display: inline-block; margin-top: 4px;">
            Setelah mengunggah berkas di bawah, silakan klik tombol <strong>"Kirim Ulang Pendaftaran"</strong> pada portal agar berkas Anda diperiksa verifikator.
          </span>
        </p>
      </div>
    `
    : `
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px 18px; margin: 0 0 18px 0;">
        <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">
          <strong>Status Akun:</strong> Belum Mengajukan Pendaftaran (Draft)<br>
          <span style="font-size: 12px; color: #64748b; display: inline-block; margin-top: 4px;">
            Silakan unggah dokumen persyaratan Anda pada portal agar Anda dapat menyelesaikan dan mengajukan permohonan beasiswa.
          </span>
        </p>
      </div>
    `;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pemberitahuan Verifikasi Berkas Beasiswa Sultra Cerdas</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f1f5f9; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);">
          <!-- Header Banner -->
          <tr>
            <td style="background-color: #0B3A6A; padding: 30px 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 800; letter-spacing: 0.5px;">
                PANITIA SELEKSI BEASISWA SULTRA CERDAS 2026
              </h1>
              <p style="color: #bfdbfe; margin: 6px 0 0 0; font-size: 13px;">
                Pemerintah Provinsi Sulawesi Tenggara
              </p>
            </td>
          </tr>

          <!-- Alert Badge -->
          <tr>
            <td style="padding: 25px 30px 0 30px;">
              <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 14px 18px;">
                <span style="display: inline-block; background-color: #dc2626; color: #ffffff; font-size: 11px; font-weight: 800; padding: 3px 10px; border-radius: 20px; text-transform: uppercase;">
                  Pemberitahuan Penting
                </span>
                <p style="color: #991b1b; font-size: 13px; font-weight: 600; margin: 8px 0 0 0; line-height: 1.5;">
                  Terdapat dokumen pendaftaran Anda yang perlu diunggah ulang agar dapat diverifikasi oleh tim penilai.
                </p>
              </div>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 25px 30px; color: #334155; line-height: 1.6; font-size: 14px;">
              <p style="margin: 0 0 16px 0;">
                Yth. Sdr/i <strong>${namaLengkap}</strong>,
              </p>
              ${statusBoxHtml}
              <p style="margin: 0 0 16px 0;">
                Sehubungan dengan tahapan verifikasi berkas administrasi Beasiswa Stimulan Sultra Cerdas, sistem kami mendeteksi bahwa berkas fisik berikut ini <strong>mengalami kendala saat sinkronisasi server</strong> sehingga belum dapat terbaca dengan sempurna oleh verifikator:
              </p>

              <!-- List of Missing Documents -->
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 18px 20px; margin: 20px 0;">
                <p style="margin: 0 0 12px 0; font-size: 12px; font-weight: 800; color: #475569; text-transform: uppercase; letter-spacing: 0.5px;">
                  Daftar Berkas yang Wajib Diunggah Ulang:
                </p>
                <ul style="margin: 0; padding-left: 20px;">
                  ${docListHtml}
                </ul>
              </div>

              <p style="margin: 0 0 24px 0;">
                Mohon segera masuk (login) ke portal akun pendaftaran Anda dan unggah kembali dokumen tersebut pada menu <strong>Kelola Berkas</strong> sebelum masa verifikasi/sanggah berakhir.
              </p>

              <!-- Action Button -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center">
                    <a href="https://bssc.akusahabatrakyat.com/dashboard/berkas" target="_blank" style="display: inline-block; background-color: #0B3A6A; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 700; padding: 14px 28px; border-radius: 12px; box-shadow: 0 2px 8px rgba(11, 58, 106, 0.3);">
                      Unggah Ulang Berkas di Portal &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 28px 0 0 0; font-size: 12px; color: #64748b; line-height: 1.5; border-top: 1px solid #e2e8f0; padding-top: 16px;">
                <em>Catatan: Dokumen yang Anda unggah otomatis menggantikan data lama. Apabila Anda telah mengunggah ulang dokumen tersebut sebelumnya dan telah berstatus lengkap di dashboard, Anda dapat mengabaikan email ini.</em>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 20px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; font-size: 12px; color: #64748b; font-weight: 600;">
                Sekretariat Panitia Beasiswa Sultra Cerdas 2026
              </p>
              <p style="margin: 4px 0 0 0; font-size: 11px; color: #94a3b8;">
                Pemerintah Provinsi Sulawesi Tenggara &bull; Email ini dikirim secara otomatis oleh sistem
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
  const isDryRun = args.includes('--dry-run') || (!args.includes('--send') && !args.some(a => a.startsWith('--test')));
  const testArg = args.find(a => a.startsWith('--test'));
  const testEmail = testArg ? testArg.split('=')[1] : null;

  console.log('====================================================');
  console.log(' AUDIT & BROADCAST EMAIL PEMBERITAHUAN BERKAS HILANG');
  console.log('====================================================');
  console.log('Mode:', isDryRun ? 'DRY-RUN (Tidak Mengirim Email)' : testEmail ? `TEST KE ${testEmail}` : 'LIVE SEND (KIRIM NYATA KE SEMUA MAHASISWA)');
  console.log('SMTP Host:', env.SMTP_HOST);
  console.log('SMTP User:', env.SMTP_USER);
  console.log('Sender From:', env.EMAIL_FROM);
  console.log('----------------------------------------------------');

  const csvPath = path.join(__dirname, 'data_pendaftar_berkas_hilang.csv');
  let recipients = [];

  if (fs.existsSync(csvPath)) {
    console.log(`[INFO] Memuat data dari file CSV resmi: ${csvPath}`);
    const rawCsv = fs.readFileSync(csvPath, 'utf8').trim().split('\n');
    for (let i = 1; i < rawCsv.length; i++) {
      const line = rawCsv[i].trim();
      if (!line || line.startsWith('NAMA,EMAIL')) continue;

      // Regex parser untuk menangani baris CSV dengan kutip pada nama atau jenis_dokumen
      const regex = /(".*?"|[^",\s]+(?:\s+[^",\s]+)*?),\s*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}),\s*([^,]*),\s*(\d+),\s*(.*)/;
      const match = line.match(regex);

      let nama = '';
      let email = '';
      let noHp = '';
      let docsStr = '';

      if (match) {
        nama = match[1].replace(/^"|"$/g, '').trim();
        email = match[2].trim();
        noHp = match[3].trim();
        docsStr = match[5].replace(/^"|"$/g, '').trim();
      } else {
        const parts = line.split(',');
        nama = (parts[0] || '').replace(/^"|"$/g, '').trim();
        email = (parts[1] || '').trim();
        noHp = (parts[2] || '').trim();
        docsStr = parts.slice(4).join(',').replace(/^"|"$/g, '').trim();
      }

      if (email && email.includes('@')) {
        const docList = docsStr.split(',').map(s => s.trim()).filter(Boolean);
        recipients.push({
          namaLengkap: nama || 'Pendaftar',
          email,
          noHp,
          missingDocList: docList.length > 0 ? docList : ['Dokumen Persyaratan'],
        });
      }
    }
  } else {
    console.log('[INFO] File CSV tidak ditemukan, melakukan audit langsung dari database MySQL...');
    const pool = getPool();

    // 1. Ambil seluruh berkas yang ada di database beserta informasi user
    const [docs] = await pool.execute(`
      SELECT d.id AS docId, d.user_id, d.doc_type, d.file_path, d.original_name,
             u.email, u.nama_lengkap, p.selfie_path, p.no_hp
      FROM documents d
      JOIN users u ON u.id = d.user_id
      LEFT JOIN profiles p ON p.user_id = u.id
    `);

    // 2. Filter berkas yang file fisiknya tidak ada di disk
    const missingByUser = new Map();

    for (const doc of docs) {
      const filePath = doc.file_path;
      const exists = filePath && fs.existsSync(filePath);

      if (!exists) {
        if (!missingByUser.has(doc.email)) {
          missingByUser.set(doc.email, {
            userId: doc.user_id,
            email: doc.email,
            namaLengkap: doc.nama_lengkap || 'Pendaftar',
            noHp: doc.no_hp || '-',
            missingDocs: new Set(),
          });
        }
        missingByUser.get(doc.email).missingDocs.add(doc.doc_type);
      }
    }

    // Periksa juga selfie di profiles
    const [profiles] = await pool.execute(`
      SELECT p.user_id, p.selfie_path, u.email, u.nama_lengkap, p.no_hp
      FROM profiles p
      JOIN users u ON u.id = p.user_id
      WHERE p.selfie_path IS NOT NULL AND p.selfie_path != ''
    `);

    for (const prof of profiles) {
      if (prof.selfie_path && !fs.existsSync(prof.selfie_path)) {
        if (!missingByUser.has(prof.email)) {
          missingByUser.set(prof.email, {
            userId: prof.user_id,
            email: prof.email,
            namaLengkap: prof.nama_lengkap || 'Pendaftar',
            noHp: prof.no_hp || '-',
            missingDocs: new Set(),
          });
        }
        missingByUser.get(prof.email).missingDocs.add('selfie');
      }
    }

    recipients = Array.from(missingByUser.values()).map(r => ({
      ...r,
      missingDocList: Array.from(r.missingDocs),
    }));
  }

  console.log(`Ditemukan total ${recipients.length} mahasiswa unik yang terdaftar.`);
  console.log('----------------------------------------------------');

  if (recipients.length === 0) {
    console.log('Tidak ada berkas hilang yang terdeteksi! Semua file aman.');
    process.exit(0);
  }

  // Sinkronisasi status pendaftaran dari database untuk prioritas pengiriman:
  // Prioritas 1: Mahasiswa yang SUDAH mengajukan pendaftaran (ada di tabel applications)
  // Prioritas 2: Mahasiswa yang BELUM mengajukan pendaftaran (draft)
  let countPriority1 = 0;
  let countPriority2 = 0;
  try {
    const pool = getPool();
    const [appRows] = await pool.execute(`
      SELECT LOWER(u.email) as email, a.registration_no, a.status as app_status
      FROM applications a
      JOIN users u ON u.id = a.user_id
    `);
    const appMap = new Map();
    for (const row of appRows) {
      if (row.email) appMap.set(row.email.trim(), row);
    }

    for (const r of recipients) {
      const emailLower = (r.email || '').toLowerCase().trim();
      const app = appMap.get(emailLower);
      if (app) {
        r.hasApplication = true;
        r.regNo = app.registration_no;
        r.appStatus = app.app_status;
        r.priority = 1;
        countPriority1++;
      } else {
        r.hasApplication = false;
        r.regNo = null;
        r.appStatus = 'DRAFT';
        r.priority = 2;
        countPriority2++;
      }
    }
  } catch (dbErr) {
    console.warn('[WARN] Gagal menyinkronkan status aplikasi dari database:', dbErr.message);
  }

  // Jika mode test email tunggal
  if (testEmail) {
    const sample = recipients.find(r => r.priority === 1) || recipients[0];
    console.log(`Mengirim 1 email percobaan ke: ${testEmail}...`);
    const html = generateEmailHtml(sample.namaLengkap, sample.missingDocList, sample.regNo, sample.appStatus);
    try {
      await sendMail({
        to: testEmail,
        subject: '[PENTING] Pemberitahuan Unggah Ulang Berkas Beasiswa Sultra Cerdas 2026',
        html,
      });
      console.log('✅ Email percobaan berhasil dikirim ke:', testEmail);
    } catch (err) {
      console.error('❌ Gagal mengirim email percobaan:', err.message);
    }
    process.exit(0);
  }

  // Ambil history pengiriman sebelumnya agar tidak mengirim ganda
  const historyFilePath = path.join(__dirname, 'broadcast_sent_history.json');
  let sentHistory = new Set();
  if (fs.existsSync(historyFilePath)) {
    try {
      const data = JSON.parse(fs.readFileSync(historyFilePath, 'utf8'));
      if (Array.isArray(data)) sentHistory = new Set(data);
    } catch (e) {}
  }

  // Filter penerima yang belum pernah dikirimi email sukses
  const pendingRecipients = recipients.filter(r => !sentHistory.has(r.email));

  // URUTKAN: Prioritas 1 (Sudah Mendaftar/Terkirim) duluan, baru Prioritas 2 (Belum Mendaftar/Draft)
  pendingRecipients.sort((a, b) => a.priority - b.priority);

  const pendingP1 = pendingRecipients.filter(r => r.priority === 1).length;
  const pendingP2 = pendingRecipients.filter(r => r.priority === 2).length;

  const limitArg = args.find(a => a.startsWith('--limit='));
  const maxToSend = limitArg ? parseInt(limitArg.split('=')[1], 10) : pendingRecipients.length;
  const toSendBatch = pendingRecipients.slice(0, maxToSend);

  console.log(`Total terdeteksi berkas hilang : ${recipients.length} mahasiswa`);
  console.log(`  • Prioritas 1 (SUDAH DAFTAR) : ${countPriority1} mahasiswa`);
  console.log(`  • Prioritas 2 (BELUM DAFTAR) : ${countPriority2} mahasiswa`);
  console.log(`Sudah pernah terkirim sukses   : ${sentHistory.size} mahasiswa`);
  console.log(`Antrean belum terkirim         : ${pendingRecipients.length} mahasiswa`);
  console.log(`  • Sisa antrean Prioritas 1   : ${pendingP1} mahasiswa`);
  console.log(`  • Sisa antrean Prioritas 2   : ${pendingP2} mahasiswa`);
  if (limitArg) {
    console.log(`Batas pengiriman batch ini     : ${toSendBatch.length} email (--limit=${maxToSend})`);
  }
  console.log('----------------------------------------------------');

  // Jika dry-run, cetak ringkasan saja
  if (isDryRun) {
    console.log('DAFTAR MAHASISWA DALAM ANTREAN (DIPROSES URUT PRIORITAS):');
    toSendBatch.slice(0, 15).forEach((r, idx) => {
      const tag = r.priority === 1 ? `[PRIORITAS 1 - NoReg: ${r.regNo || '-'}]` : '[PRIORITAS 2 - DRAFT]';
      console.log(`${idx + 1}. ${tag} ${r.namaLengkap} (${r.email}) -> [${r.missingDocList.join(', ')}]`);
    });
    if (toSendBatch.length > 15) {
      console.log(`... dan ${toSendBatch.length - 15} mahasiswa lainnya.`);
    }
    console.log('\n[PANDUAN EKSEKUSI PENGIRIMAN]:');
    console.log('  Kirim sesuai kuota harian Brevo (misal 300 email hari ini):');
    console.log('    node broadcast_missing_docs_email.js --send --limit=300');
    console.log('  Kirim seluruh antrean:');
    console.log('    node broadcast_missing_docs_email.js --send');
    process.exit(0);
  }

  // Jika live send
  console.log(`MEMULAI PENGIRIMAN EMAIL NYATA KE ${toSendBatch.length} PENDAFTAR (URUT PRIORITAS)...`);
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < toSendBatch.length; i++) {
    const r = toSendBatch[i];
    const html = generateEmailHtml(r.namaLengkap, r.missingDocList, r.regNo, r.appStatus);
    const tag = r.priority === 1 ? `[P-1: SUDAH DAFTAR]` : `[P-2: DRAFT]`;
    const subject = `[PENTING] Pemberitahuan Unggah Ulang Berkas - ${r.namaLengkap}`;

    try {
      console.log(`[${i + 1}/${toSendBatch.length}] ${tag} Mengirim ke ${r.email} (${r.missingDocList.join(', ')})...`);
      await sendMail({
        to: r.email,
        subject,
        html,
      });
      successCount++;
      sentHistory.add(r.email);
      fs.writeFileSync(historyFilePath, JSON.stringify(Array.from(sentHistory), null, 2), 'utf8');
    } catch (err) {
      console.error(`❌ Gagal kirim ke ${r.email}:`, err.message);
      failCount++;

      // Jika error kuota Brevo habis, hentikan loop agar tidak terus menerus error
      if (err.message && (err.message.includes('quota') || err.message.includes('limit') || err.message.includes('451'))) {
        console.warn('\n⚠️ Kuota pengiriman harian provider SMTP kemungkinan telah habis!');
        console.warn('Pengiriman dihentikan sementara. Riwayat yang berhasil telah tersimpan di broadcast_sent_history.json.');
        console.warn('Anda dapat melanjutkan sisanya besok hari dengan menjalankan perintah yang sama.');
        break;
      }
    }

    // Jeda 1.2 detik antar email agar aman dari rate limiter SMTP
    await new Promise(resolve => setTimeout(resolve, 1200));
  }

  console.log('====================================================');
  console.log(`PENGIRIMAN SELESAI:`);
  console.log(`✅ Berhasil Terkirim Baru : ${successCount}`);
  console.log(`❌ Gagal                  : ${failCount}`);
  console.log(`📊 Total Kumulatif Sukses : ${sentHistory.size} / ${recipients.length}`);
  console.log(`Sisa Antrean              : ${recipients.length - sentHistory.size} mahasiswa`);
  console.log('====================================================');
}

if (require.main === module) {
  main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}

module.exports = { formatDocName, generateEmailHtml, main };
