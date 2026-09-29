require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { getPool, closePool } = require('./src/config/database');

async function cleanDatabase() {
  console.log('🧹 Memulai Pembersihan Database (BSSC)...');
  const pool = getPool();

  try {
    // 1. Ambil daftar user admin yang akan dipertahankan
    const [adminRows] = await pool.execute("SELECT id, email, nama_lengkap FROM users WHERE role = 'admin'");
    console.log(`\n📌 Ditemukan ${adminRows.length} Akun Admin:`);
    adminRows.forEach((admin) => {
      console.log(`   • ${admin.nama_lengkap} (${admin.email}) [ID: ${admin.id}]`);
    });

    if (adminRows.length === 0) {
      console.log('⚠️  TIDAK DITEMUKAN AKUN ADMIN! Membuat akun admin default...');
      const { hashPassword } = require('./src/utils/password');
      const { v4: uuidv4 } = require('uuid');
      const adminId = uuidv4();
      const adminPassword = await hashPassword('Admin@2026!');
      await pool.execute(
        `INSERT INTO users (id, email, nik, password_hash, role, nama_lengkap, jenjang_target) VALUES (?, ?, ?, ?, 'admin', ?, 'S1')`,
        [adminId, 'admin@beasiswa-sultra.go.id', '9999999999999999', adminPassword, 'Admin BSSC']
      );
      await pool.execute(`INSERT INTO profiles (id, user_id) VALUES (?, ?)`, [uuidv4(), adminId]);
      adminRows.push({ id: adminId, email: 'admin@beasiswa-sultra.go.id', nama_lengkap: 'Admin BSSC' });
    }

    const adminIds = adminRows.map((a) => a.id);
    const placeholders = adminIds.map(() => '?').join(',');

    // 2. Hapus data aplikasi / pendaftaran
    const [delApps] = await pool.execute('DELETE FROM applications');
    console.log(`\n✅ Menghapus ${delApps.affectedRows} berkas pendaftaran (applications).`);

    // 3. Hapus data dokumen yang diunggah
    const [delDocs] = await pool.execute('DELETE FROM documents');
    console.log(`✅ Menghapus ${delDocs.affectedRows} dokumen unggahan (documents).`);

    // 4. Hapus data riwayat pendidikan
    const [delEdu] = await pool.execute('DELETE FROM education_history');
    console.log(`✅ Menghapus ${delEdu.affectedRows} riwayat pendidikan (education_history).`);

    // 5. Hapus token sesi / blacklist
    const [delTokens] = await pool.execute('DELETE FROM refresh_tokens');
    const [delBlacklist] = await pool.execute('DELETE FROM token_blacklist');
    console.log(`✅ Menghapus ${delTokens.affectedRows + delBlacklist.affectedRows} token sesi.`);

    // 6. Hapus audit log
    const [delAudit] = await pool.execute('DELETE FROM audit_logs');
    console.log(`✅ Menghapus ${delAudit.affectedRows} catatan audit log.`);

    // 7. Hapus profil non-admin
    const [delProfiles] = await pool.execute(
      `DELETE FROM profiles WHERE user_id NOT IN (${placeholders})`,
      adminIds
    );
    console.log(`✅ Menghapus ${delProfiles.affectedRows} profil mahasiswa.`);

    // 8. Hapus user non-admin
    const [delUsers] = await pool.execute("DELETE FROM users WHERE role != 'admin'");
    console.log(`✅ Menghapus ${delUsers.affectedRows} akun pendaftar (users non-admin).`);

    // 9. Bersihkan file unggahan fisik di folder uploads jika ada
    const uploadDir = path.join(__dirname, process.env.UPLOAD_DIR || './uploads');
    if (fs.existsSync(uploadDir)) {
      const files = fs.readdirSync(uploadDir);
      let removedFiles = 0;
      for (const file of files) {
        const filePath = path.join(uploadDir, file);
        if (fs.statSync(filePath).isFile() && file !== '.gitkeep') {
          fs.unlinkSync(filePath);
          removedFiles++;
        }
      }
      console.log(`✅ Menghapus ${removedFiles} file fisik di folder uploads.`);
    }

    console.log('\n🎉 PEMBERSIHAN SELESAI! Database bersih dan siap untuk Testing Final.');
    console.log('🔒 Akun yang tersisa di database:');
    adminRows.forEach((admin) => {
      console.log(`   - Email: ${admin.email}`);
    });
  } catch (err) {
    console.error('❌ Terjadi kesalahan saat pembersihan database:', err);
  } finally {
    await closePool();
  }
}

cleanDatabase();
