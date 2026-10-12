/**
 * Tandai pendaftar yang statusnya sudah "terkirim" tetapi TIDAK punya KTM sama sekali
 * di tabel documents -> status PERLU_UNGGAH_ULANG.
 * Nomor registrasi TIDAK diubah, tidak ada baris yang dihapus.
 *
 * Penggunaan (jalankan SETELAH backend versi baru ter-deploy agar ENUM sudah bertambah):
 *   node mark_missing_ktm_applications.js              -> dry-run (hanya menghitung)
 *   node mark_missing_ktm_applications.js --apply      -> eksekusi
 *   node mark_missing_ktm_applications.js --rollback   -> kembalikan ke TERKIRIM
 *                                                          (hanya yang masih PERLU_UNGGAH_ULANG)
 */

const { getPool } = require('./src/config/database');

const NOTE =
  'Berkas KTM/Surat Aktif Kuliah Anda tidak terbaca di sistem. Mohon unggah ulang pada menu Berkas, lalu klik "Kirim Ulang Pendaftaran". Nomor registrasi Anda tidak berubah.';

// Hanya status yang belum diputuskan; DITERIMA/DITOLAK/PENCAIRAN tidak disentuh.
const SAFE_STATUSES = ['TERKIRIM', 'VERIFIKASI_BERKAS', 'SELEKSI_ADMINISTRASI'];

async function main() {
  const args = process.argv.slice(2);
  const apply = args.includes('--apply');
  const rollback = args.includes('--rollback');
  const pool = getPool();

  if (rollback) {
    const [r] = await pool.execute(
      "UPDATE applications SET status = 'TERKIRIM', notes = NULL WHERE status = 'PERLU_UNGGAH_ULANG'"
    );
    console.log(`Rollback selesai. ${r.affectedRows} pendaftaran dikembalikan ke TERKIRIM.`);
    process.exit(0);
  }

  const [byStatus] = await pool.execute(`
    SELECT a.status, COUNT(*) AS cnt
    FROM applications a
    WHERE NOT EXISTS (SELECT 1 FROM documents d WHERE d.user_id = a.user_id AND d.doc_type = 'ktm')
    GROUP BY a.status
  `);

  console.log('Pendaftaran tanpa KTM, per status:');
  let total = 0;
  let eligible = 0;
  for (const row of byStatus) {
    total += row.cnt;
    const ok = SAFE_STATUSES.includes(row.status);
    if (ok) eligible += row.cnt;
    console.log(`  ${row.status.padEnd(22)} ${String(row.cnt).padStart(5)}  ${ok ? '(akan ditandai)' : '(DILEWATI)'}`);
  }
  console.log(`Total tanpa KTM: ${total} | Akan ditandai: ${eligible}`);

  if (!apply) {
    console.log('\n[DRY-RUN] Tidak ada perubahan. Jalankan dengan --apply untuk mengeksekusi.');
    process.exit(0);
  }

  const placeholders = SAFE_STATUSES.map(() => '?').join(',');
  const [res] = await pool.execute(
    `UPDATE applications a
        SET a.status = 'PERLU_UNGGAH_ULANG', a.notes = ?
      WHERE a.status IN (${placeholders})
        AND NOT EXISTS (SELECT 1 FROM documents d WHERE d.user_id = a.user_id AND d.doc_type = 'ktm')`,
    [NOTE, ...SAFE_STATUSES]
  );
  console.log(`\nSELESAI: ${res.affectedRows} pendaftaran ditandai PERLU_UNGGAH_ULANG.`);
  process.exit(0);
}

main().catch((err) => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
