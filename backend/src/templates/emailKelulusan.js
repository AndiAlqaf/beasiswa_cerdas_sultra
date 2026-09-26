/**
 * Template Email Notifikasi Kelulusan Beasiswa Sultra Cerdas (BSSC) 2026
 *
 * Khusus dikirimkan kepada seluruh pendaftar yang DINYATAKAN LULUS (DITERIMA)
 * secara serentak pada tanggal pengumuman hasil seleksi.
 */

/**
 * Template Email: DITERIMA / LULUS SELEKSI
 * @param {Object} data
 * @param {string} data.namaLengkap - Nama lengkap pendaftar
 * @param {string} data.registrationNo - Nomor registrasi (misal: BSSC-2026-S1-0001)
 * @param {string} data.jenjangTarget - Jenjang pendidikan (S1, S2, S3)
 * @param {string} data.announcementDate - Tanggal resmi pengumuman
 * @param {string} [data.portalUrl] - URL portal beasiswa
 */
function templateKelulusan({ namaLengkap, registrationNo, jenjangTarget, announcementDate, portalUrl = 'http://localhost:3000/dashboard' }) {
  return {
    subject: `🎉 Selamat! Anda Dinyatakan LULUS Seleksi — Beasiswa Sultra Cerdas 2026`,
    html: `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Pengumuman Kelulusan Beasiswa Sultra Cerdas</title>
</head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:36px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 10px 30px rgba(15,23,42,0.08);max-width:600px;width:100%;border:1px solid #e2e8f0;">

          <!-- Header Resmi Pemprov -->
          <tr>
            <td style="background:linear-gradient(135deg,#0B3A6A 0%,#1e3a8a 60%,#1d4ed8 100%);padding:40px 36px 32px;text-align:center;">
              <div style="display:inline-block;padding:6px 16px;background:rgba(255,255,255,0.15);border-radius:50px;margin-bottom:12px;backdrop-filter:blur(4px);">
                <p style="margin:0;font-size:11px;color:#bfdbfe;letter-spacing:2px;text-transform:uppercase;font-weight:700;">
                  Pemerintah Provinsi Sulawesi Tenggara
                </p>
              </div>
              <h1 style="margin:0;font-size:24px;font-weight:800;color:#ffffff;line-height:1.3;letter-spacing:-0.5px;">
                Beasiswa Stimulan<br/>Sultra Cerdas 2026
              </h1>
              <p style="margin:8px 0 0;font-size:13px;color:#93c5fd;">Pengumuman Hasil Seleksi Akhir Penerima Beasiswa</p>
            </td>
          </tr>

          <!-- Banner Status Hijau -->
          <tr>
            <td style="background:#ecfdf5;border-top:3px solid #10b981;border-bottom:1px solid #a7f3d0;padding:16px 24px;text-align:center;">
              <span style="display:inline-block;background:#059669;color:#ffffff;font-size:13px;font-weight:800;letter-spacing:1px;padding:8px 24px;border-radius:9999px;text-transform:uppercase;box-shadow:0 2px 8px rgba(5,150,105,0.25);">
                ✅ LULUS & DITERIMA SEBAGAI PENERIMA
              </span>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding:36px 36px 28px;">
              <p style="margin:0 0 16px;font-size:15px;color:#1e293b;">
                Yth. Saudara/i <strong>${namaLengkap}</strong>,
              </p>
              <p style="margin:0 0 24px;font-size:14px;color:#475569;line-height:1.75;">
                Berdasarkan hasil verifikasi berkas, penilaian berkas akademik/prestasi, serta keputusan rapat pleno Tim Seleksi Beasiswa Stimulan Pemerintah Provinsi Sulawesi Tenggara Tahun Anggaran 2026, dengan penuh rasa bangga kami menyatakan bahwa Anda:
              </p>

              <!-- Kartu Keputusan -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1.5px solid #cbd5e1;border-radius:14px;overflow:hidden;margin-bottom:28px;">
                <tr>
                  <td style="padding:22px 24px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:6px 0;font-size:13px;color:#64748b;font-weight:600;width:42%;">Nomor Registrasi</td>
                        <td style="padding:6px 0;font-size:13px;color:#0f172a;font-weight:800;font-family:Consolas,Monaco,monospace;">: ${registrationNo}</td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;font-size:13px;color:#64748b;font-weight:600;">Nama Lengkap</td>
                        <td style="padding:6px 0;font-size:13px;color:#0f172a;font-weight:700;">: ${namaLengkap}</td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;font-size:13px;color:#64748b;font-weight:600;">Jenjang Program</td>
                        <td style="padding:6px 0;font-size:13px;color:#0f172a;font-weight:700;">: Jenjang ${jenjangTarget}</td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;font-size:13px;color:#64748b;font-weight:600;">Tanggal Pengumuman</td>
                        <td style="padding:6px 0;font-size:13px;color:#0f172a;font-weight:700;">: ${announcementDate}</td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;font-size:13px;color:#64748b;font-weight:600;">Status Seleksi</td>
                        <td style="padding:6px 0;font-size:14px;color:#059669;font-weight:800;">: DITERIMA (LULUS)</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Tahap Lanjutan -->
              <h3 style="margin:0 0 14px;font-size:14px;font-weight:800;color:#0f172a;text-transform:uppercase;letter-spacing:0.5px;">
                📌 Instruksi & Langkah Selanjutnya
              </h3>
              <ol style="margin:0 0 28px;padding-left:20px;font-size:13.5px;color:#334155;line-height:1.8;">
                <li style="margin-bottom:6px;"><strong>Login ke Portal:</strong> Periksa dashboard akun Anda untuk mengunduh Surat Keterangan Lulus Seleksi (SK Lulus).</li>
                <li style="margin-bottom:6px;"><strong>Verifikasi Rekening Bank:</strong> Pastikan buku tabungan / nomor rekening bank yang terdaftar berstatus aktif atas nama pribadi.</li>
                <li style="margin-bottom:6px;"><strong>Penandatanganan Dokumen:</strong> Ikuti petunjuk penyerahan pakta integritas dan berkas pencairan termin pertama.</li>
              </ol>

              <!-- Tombol Akses Dashboard -->
              <div style="text-align:center;margin:32px 0;">
                <a href="${portalUrl}" style="display:inline-block;background:#0B3A6A;color:#ffffff;font-size:14px;font-weight:700;padding:14px 36px;border-radius:10px;text-decoration:none;box-shadow:0 4px 12px rgba(11,58,106,0.3);letter-spacing:0.3px;">
                  Masuk ke Portal Beasiswa &rarr;
                </a>
              </div>

              <!-- Peringatan Keamanan -->
              <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:14px 18px;margin-top:24px;">
                <p style="margin:0;font-size:12.5px;color:#92400e;line-height:1.5;">
                  ⚠️ <strong>PENTING:</strong> Program Beasiswa Sultra Cerdas tidak memungut biaya apapun (GRATIS). Waspadai segala bentuk penipuan yang mengatasnamakan Panitia Seleksi Pemprov Sultra.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 36px;background:#f8fafc;border-top:1px solid #e2e8f0;text-align:center;">
              <p style="margin:0 0 6px;font-size:12px;font-weight:600;color:#64748b;">
                Sekretariat Beasiswa Stimulan Sultra Cerdas
              </p>
              <p style="margin:0;font-size:11px;color:#94a3b8;line-height:1.6;">
                Kompleks Bumi Praja Anduonohu, Kota Kendari, Sulawesi Tenggara<br/>
                Email resmi: beasiswa@sultraprov.go.id &bull; Dikelola oleh Tim Pengelola BSSC 2026
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim(),
  };
}

module.exports = {
  templateKelulusan,
};
