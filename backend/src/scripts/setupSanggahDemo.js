const { getPool, closePool } = require('../config/database');

async function run() {
  const db = getPool();

  // 1. Set Rina Wulandari sebagai pendaftar yang LULUS lewat jalur SANGGAH
  const [app] = await db.query("SELECT user_id FROM applications WHERE registration_no = 'BSSC-2026-S1-0006'");
  if (app.length > 0) {
    const userId = app[0].user_id;
    await db.query("UPDATE users SET email = 'printerbekas05@gmail.com', nama_lengkap = 'Rina Wulandari' WHERE id = ?", [userId]);
    await db.query(`
      UPDATE applications SET 
        status = 'DITERIMA',
        is_lulus_sanggah = 1,
        announcement_email_sent_at = NULL,
        appeal_email_sent_at = NULL,
        notes = '[SANGGAHAN MAHASISWA]: Surat Keterangan Tidak Menerima Beasiswa Lain telah disusulkan resmi dari Dekanat. Tim Verifikator menyetujui sanggahan dan menyatakan pendaftar LULUS.'
      WHERE id = (SELECT id FROM (SELECT id FROM applications WHERE registration_no = 'BSSC-2026-S1-0006') as t)
    `);
  }

  // 2. Pastikan 3 pendaftar awal (Ahmad Dani, Siti Rahmawati, Rizky Pratama) adalah lulus awal (is_lulus_sanggah = 0)
  await db.query("UPDATE applications SET is_lulus_sanggah = 0 WHERE registration_no != 'BSSC-2026-S1-0006'");

  // Tampilkan ringkasan
  const [lulusAwal] = await db.query(`
    SELECT a.registration_no, u.nama_lengkap, u.email, a.status, a.is_lulus_sanggah 
    FROM applications a JOIN users u ON u.id = a.user_id 
    WHERE a.status = 'DITERIMA' AND a.is_lulus_sanggah = 0
  `);
  console.log('--- PENDAFTAR LULUS AWAL (Fase Pengumuman) ---');
  console.log(lulusAwal);

  const [lulusSanggah] = await db.query(`
    SELECT a.registration_no, u.nama_lengkap, u.email, a.status, a.is_lulus_sanggah 
    FROM applications a JOIN users u ON u.id = a.user_id 
    WHERE a.status = 'DITERIMA' AND a.is_lulus_sanggah = 1
  `);
  console.log('\n--- PENDAFTAR LULUS HASIL SANGGAH (Fase Hasil Sanggah) ---');
  console.log(lulusSanggah);

  await closePool();
}

run();
