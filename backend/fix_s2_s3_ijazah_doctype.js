/**
 * Pindahkan dokumen IJAZAH milik pendaftar S2/S3 yang salah tersimpan di slot DTKS
 * (doc_type 'dtks' / 'fileDtks') ke slot yang benar: doc_type 'ijazah'.
 *
 * - File fisik TIDAK dipindah/diubah, tidak ada baris yang dihapus. Hanya kolom doc_type.
 * - Dokumen yang NAMA FILE-nya terindikasi DTKS asli (dtks/dtsen/desil/kemensos/siks)
 *   DILEWATI agar tidak ikut tertukar. Daftarnya ditampilkan untuk dicek manual.
 * - Backup id yang diubah disimpan ke fix_s2_s3_ijazah_doctype.backup.json untuk rollback.
 *
 * Penggunaan (jalankan di server production, di folder backend):
 *   node fix_s2_s3_ijazah_doctype.js              -> dry-run (hanya menampilkan)
 *   node fix_s2_s3_ijazah_doctype.js --apply      -> eksekusi
 *   node fix_s2_s3_ijazah_doctype.js --rollback   -> kembalikan ke doc_type semula
 */

const fs = require('fs');
const path = require('path');
const { getPool } = require('./src/config/database');

const BACKUP_FILE = path.join(__dirname, 'fix_s2_s3_ijazah_doctype.backup.json');
const LOOKS_LIKE_DTKS = /dtks|dtsen|desil|kemensos|siks|cekbansos|bansos/i;

async function main() {
  const args = process.argv.slice(2);
  const apply = args.includes('--apply');
  const rollback = args.includes('--rollback');
  const pool = getPool();

  if (rollback) {
    if (!fs.existsSync(BACKUP_FILE)) {
      console.log('Tidak ada file backup. Rollback dibatalkan.');
      process.exit(1);
    }
    const backup = JSON.parse(fs.readFileSync(BACKUP_FILE, 'utf8'));
    let restored = 0;
    for (const row of backup) {
      const [r] = await pool.execute(
        "UPDATE documents SET doc_type = ? WHERE id = ? AND doc_type = 'ijazah'",
        [row.oldDocType, row.id]
      );
      restored += r.affectedRows;
    }
    console.log(`Rollback selesai. ${restored} dokumen dikembalikan.`);
    process.exit(0);
  }

  const [rows] = await pool.execute(`
    SELECT d.id, d.user_id, d.doc_type, d.original_name, u.nama_lengkap, u.jenjang_target
    FROM documents d
    JOIN users u ON u.id = d.user_id
    WHERE u.jenjang_target IN ('S2', 'S3')
      AND d.doc_type IN ('dtks', 'fileDtks')
    ORDER BY u.jenjang_target, u.nama_lengkap
  `);

  const toMove = rows.filter((r) => !LOOKS_LIKE_DTKS.test(r.original_name || ''));
  const skipped = rows.filter((r) => LOOKS_LIKE_DTKS.test(r.original_name || ''));

  console.log(`Dokumen S2/S3 di slot DTKS : ${rows.length}`);
  console.log(`  -> akan dipindah ke ijazah: ${toMove.length}`);
  console.log(`  -> DILEWATI (nama file mirip DTKS asli): ${skipped.length}`);
  if (skipped.length) {
    console.log('\nPeriksa manual yang dilewati:');
    skipped.forEach((r) => console.log(`  [${r.jenjang_target}] ${r.nama_lengkap} | ${r.original_name}`));
  }

  if (!apply) {
    console.log('\n[DRY-RUN] Tidak ada perubahan. Jalankan dengan --apply untuk mengeksekusi.');
    process.exit(0);
  }

  fs.writeFileSync(
    BACKUP_FILE,
    JSON.stringify(toMove.map((r) => ({ id: r.id, oldDocType: r.doc_type })), null, 2),
    'utf8'
  );

  let moved = 0;
  for (const r of toMove) {
    const [res] = await pool.execute(
      "UPDATE documents SET doc_type = 'ijazah' WHERE id = ? AND doc_type IN ('dtks', 'fileDtks')",
      [r.id]
    );
    moved += res.affectedRows;
  }
  console.log(`\nSELESAI: ${moved} dokumen dipindah ke slot 'ijazah'. Backup: ${BACKUP_FILE}`);
  process.exit(0);
}

main().catch((err) => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
