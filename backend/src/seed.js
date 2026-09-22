/**
 * Seed Script — Create default admin account & sample data
 * 
 * Run with: npm run seed
 * Requires MySQL database to be running and the DB to exist.
 */

const { v4: uuidv4 } = require('uuid');
const { getPool, runMigrations, closePool } = require('./config/database');
const { hashPassword } = require('./utils/password');

async function seed() {
  console.log('🌱 Seeding database...\n');

  // Run migrations first
  await runMigrations();

  const pool = getPool();

  // Check if admin already exists
  const [existingAdmin] = await pool.execute("SELECT id FROM users WHERE role = 'admin'");
  if (existingAdmin.length > 0) {
    console.log('⚠️  Admin user already exists. Skipping seed.');
    await closePool();
    return;
  }

  // Create admin user
  const adminId = uuidv4();
  const adminPassword = await hashPassword('Admin@2026!');

  await pool.execute(
    `INSERT INTO users (id, email, nik, password_hash, role, nama_lengkap, jenjang_target) VALUES (?, ?, ?, ?, 'admin', ?, 'S1')`,
    [adminId, 'admin@beasiswa-sultra.go.id', '9999999999999999', adminPassword, 'Admin BSSC']
  );
  await pool.execute(
    `INSERT INTO profiles (id, user_id) VALUES (?, ?)`,
    [uuidv4(), adminId]
  );

  console.log('✅ Admin user created:');
  console.log('   Email    : admin@beasiswa-sultra.go.id');
  console.log('   Password : Admin@2026!');
  console.log('   Role     : admin\n');

  // Create sample mahasiswa user
  const mahasiswaId = uuidv4();
  const mahasiswaPassword = await hashPassword('Mahasiswa@2026!');

  await pool.execute(
    `INSERT INTO users (id, email, nik, password_hash, role, nama_lengkap, jenjang_target) VALUES (?, ?, ?, ?, 'mahasiswa', ?, 'S1')`,
    [mahasiswaId, 'ahmad.dani@student.uho.ac.id', '7401020304050001', mahasiswaPassword, 'Ahmad Dani']
  );
  await pool.execute(
    `INSERT INTO profiles (id, user_id, tempat_lahir, tanggal_lahir, gender, no_hp, status_pernikahan, alamat_domisili) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [uuidv4(), mahasiswaId, 'Kendari', '2003-05-15', 'Laki-laki', '+62 812-3456-7890', 'Belum Menikah', 'Jl. MT Haryono No. 12, Kec. Kadia, Kota Kendari, Sulawesi Tenggara']
  );

  // Education history
  await pool.execute(
    `INSERT INTO education_history (id, user_id, tingkat, institusi, jurusan, tahun_mulai, tahun_lulus, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [uuidv4(), mahasiswaId, 'SMA', 'SMA Negeri 1 Kendari', 'IPA', '2018', '2021', 0]
  );
  await pool.execute(
    `INSERT INTO education_history (id, user_id, tingkat, institusi, jurusan, tahun_mulai, tahun_lulus, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [uuidv4(), mahasiswaId, 'S1', 'Universitas Halu Oleo', 'Teknik Sipil', '2021', '', 1]
  );

  // Application
  await pool.execute(
    `INSERT INTO applications (id, user_id, registration_no, status, notes) VALUES (?, ?, ?, ?, ?)`,
    [uuidv4(), mahasiswaId, 'BSSC-2026-S1-0001', 'VERIFIKASI_BERKAS', 'Berkas administrasi sedang dalam proses verifikasi tim seleksi Pemprov Sultra.']
  );

  console.log('✅ Sample mahasiswa created:');
  console.log('   Email    : ahmad.dani@student.uho.ac.id');
  console.log('   Password : Mahasiswa@2026!');
  console.log('   NIK      : 7401020304050001');
  console.log('   Role     : mahasiswa\n');

  console.log('🎉 Seeding completed!\n');
  await closePool();
}

seed().catch(async (err) => {
  console.error('❌ Seed failed:', err.message);
  try { await closePool(); } catch (e) { /* ignore */ }
  process.exit(1);
});
