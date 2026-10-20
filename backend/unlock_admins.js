require('dotenv').config();
const { getPool, closePool } = require('./src/config/database');

async function unlockAdmins() {
  console.log('🔓 Membuka kunci (unlock) semua akun admin...');
  const pool = getPool();

  try {
    const [result] = await pool.execute(
      "UPDATE users SET failed_login_attempts = 0, locked_until = NULL WHERE role = 'admin'"
    );
    console.log(`✅ Berhasil membuka kunci akun admin (${result.affectedRows} akun terupdate).`);

    const [adminRows] = await pool.execute(
      "SELECT id, email, nama_lengkap, failed_login_attempts, locked_until FROM users WHERE role = 'admin'"
    );
    console.log('\n📋 Status Akun Admin Saat Ini:');
    adminRows.forEach((admin, i) => {
      console.log(`  ${i + 1}. ${admin.email} - Status: AKTIF (Gagal: ${admin.failed_login_attempts}, Locked Until: ${admin.locked_until || 'None'})`);
    });
  } catch (err) {
    console.error('❌ Gagal membuka kunci admin:', err.message);
  } finally {
    await closePool();
    process.exit(0);
  }
}

unlockAdmins();
