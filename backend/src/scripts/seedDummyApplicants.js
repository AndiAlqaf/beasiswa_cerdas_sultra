/**
 * Seed Dummy Applicants — Beasiswa Sultra Cerdas 2026
 * 
 * Menambahkan data dummy pendaftar:
 * - Pendaftar LULUS (status: DITERIMA)
 * - Pendaftar TIDAK LULUS (status: DITOLAK)
 * Termasuk akun pengguna, profil mahasiswa, dan status aplikasi beasiswa.
 */

const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const { getPool, closePool } = require('../config/database');

async function seedDummyApplicants() {
  const db = getPool();
  console.log('🌱 Memulai proses seeding data pendaftar lulus & tidak lulus...');

  // Hash password standar untuk akun dummy: "Password123!"
  const passwordHash = await bcrypt.hash('Password123!', 10);

  const dummyApplicants = [
    // --- PENDAFTAR LULUS (DITERIMA) ---
    {
      namaLengkap: 'Muhammad Rizky Pratama',
      email: 'printerbekas05@gmail.com', // Email riil untuk pengujian
      nik: '7471011508020001',
      jenjang: 'S1',
      institusi: 'Universitas Halu Oleo (UHO)',
      jurusan: 'Teknik Informatika',
      nim: 'F1G122045',
      ipk: 3.88,
      semester: 6,
      noHp: '081245678901',
      alamat: 'Jl. H.E.A. Mokodompit, Kendari',
      regNo: 'BSSC-2026-S1-0003',
      status: 'DITERIMA',
      notes: 'Memenuhi semua kriteria berkas dan IPK di atas standar rata-rata prodi.',
    },
    {
      namaLengkap: 'Fajar Ramadhan',
      email: 'fajar.ramadhan@student.uho.ac.id',
      nik: '7471021203980002',
      jenjang: 'S2',
      institusi: 'Universitas Halu Oleo (UHO)',
      jurusan: 'Manajemen Sumber Daya Perairan',
      nim: 'G2A123012',
      ipk: 3.91,
      semester: 3,
      noHp: '081356789012',
      alamat: 'Kambu, Kota Kendari',
      regNo: 'BSSC-2026-S2-0001',
      status: 'DITERIMA',
      notes: 'Lolos seleksi berkas dan proposal riset tesis terarah pada kelautan Sultra.',
    },
    {
      namaLengkap: 'Nurul Fadilah',
      email: 'nurul.fadilah@student.umkendari.ac.id',
      nik: '7405034509010003',
      jenjang: 'S1',
      institusi: 'Universitas Muhammadiyah Kendari',
      jurusan: 'Ilmu Hukum',
      nim: '210201088',
      ipk: 3.82,
      semester: 4,
      noHp: '085212345678',
      alamat: 'Anduonohu, Kota Kendari',
      regNo: 'BSSC-2026-S1-0004',
      status: 'DITERIMA',
      notes: 'Berkas lengkap dan terverifikasi berprestasi akademik tingkat daerah.',
    },

    // --- PENDAFTAR TIDAK LULUS (DITOLAK) ---
    {
      namaLengkap: 'Dimas Prasetyo',
      email: 'dimas.prasetyo@student.usn.ac.id',
      nik: '7401041907010004',
      jenjang: 'S1',
      institusi: 'Universitas Sembilanbelas November Kolaka',
      jurusan: 'Sistem Informasi',
      nim: '202151034',
      ipk: 2.85,
      semester: 6,
      noHp: '082187654321',
      alamat: 'Jl. Pemuda No. 45, Kolaka',
      regNo: 'BSSC-2026-S1-0005',
      status: 'DITOLAK',
      notes: 'Indeks Prestasi Kumulatif (IPK) 2.85 belum memenuhi syarat standar minimal pendaftaran (minimal 3.00).',
    },
    {
      namaLengkap: 'Rina Wulandari',
      email: 'rina.wulandari@student.iainkendari.ac.id',
      nik: '7403065406020005',
      jenjang: 'S1',
      institusi: 'IAIN Kendari',
      jurusan: 'Perbankan Syariah',
      nim: '2130104015',
      ipk: 3.40,
      semester: 4,
      noHp: '085398761234',
      alamat: 'Baruga, Kota Kendari',
      regNo: 'BSSC-2026-S1-0006',
      status: 'DITOLAK',
      notes: 'Surat Keterangan Tidak Sedang Menerima Beasiswa Lain dari pihak kampus tidak terlampir atau belum ditandatangani pejabat berwenang.',
    },
    {
      namaLengkap: 'Hendra Wijaya',
      email: 'hendra.wijaya@student.uho.ac.id',
      nik: '7471010804970006',
      jenjang: 'S2',
      institusi: 'Universitas Halu Oleo (UHO)',
      jurusan: 'Teknik Sipil',
      nim: 'G2C122005',
      ipk: 3.35,
      semester: 4,
      noHp: '081234567899',
      alamat: 'Mandonga, Kendari',
      regNo: 'BSSC-2026-S2-0002',
      status: 'DITOLAK',
      notes: 'Kuota penerima jenjang S2 telah terpenuhi berdasarkan hasil pemeringkatan skor seleksi akhir.',
    },
    {
      namaLengkap: 'Dr. (Cand.) Andi Bachtiar',
      email: 'andi.bachtiar@student.uho.ac.id',
      nik: '7402011211910007',
      jenjang: 'S3',
      institusi: 'Universitas Halu Oleo (UHO)',
      jurusan: 'Ilmu Pertanian',
      nim: 'H3A123002',
      ipk: 3.45,
      semester: 3,
      noHp: '08114002345',
      alamat: 'Lepolepo, Baruga, Kota Kendari',
      regNo: 'BSSC-2026-S3-0001',
      status: 'DITOLAK',
      notes: 'Dokumen rekomendasi promotor belum dilengkapi dan akreditasi program studi asal tidak memenuhi kriteria minimal.',
    },
  ];

  try {
    for (const item of dummyApplicants) {
      // 1. Cek apakah user sudah ada berdasarkan email atau NIK
      const [existingUsers] = await db.execute(
        'SELECT id FROM users WHERE email = ? OR nik = ? LIMIT 1',
        [item.email, item.nik]
      );

      let userId;

      if (existingUsers.length > 0) {
        userId = existingUsers[0].id;
        // Update user
        await db.execute(
          `UPDATE users SET nama_lengkap = ?, jenjang_target = ?, role = 'mahasiswa' WHERE id = ?`,
          [item.namaLengkap, item.jenjang, userId]
        );
      } else {
        userId = uuidv4();
        // Insert user baru
        await db.execute(
          `INSERT INTO users (id, email, nik, password_hash, role, nama_lengkap, jenjang_target)
           VALUES (?, ?, ?, ?, 'mahasiswa', ?, ?)`,
          [userId, item.email, item.nik, passwordHash, item.namaLengkap, item.jenjang]
        );
      }

      // 2. Profile
      const [existingProfile] = await db.execute(
        'SELECT id FROM profiles WHERE user_id = ? LIMIT 1',
        [userId]
      );

      if (existingProfile.length > 0) {
        await db.execute(
          `UPDATE profiles SET
            no_hp = ?,
            alamat_domisili = ?,
            nim = ?,
            ipk = ?,
            semester = ?
          WHERE user_id = ?`,
          [item.noHp, item.alamat, item.nim, item.ipk, item.semester, userId]
        );
      } else {
        await db.execute(
          `INSERT INTO profiles (id, user_id, no_hp, alamat_domisili, nim, ipk, semester)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [uuidv4(), userId, item.noHp, item.alamat, item.nim, item.ipk, item.semester]
        );
      }

      // 3. Application
      const [existingApp] = await db.execute(
        'SELECT id FROM applications WHERE user_id = ? LIMIT 1',
        [userId]
      );

      if (existingApp.length > 0) {
        await db.execute(
          `UPDATE applications SET
            registration_no = ?,
            status = ?,
            notes = ?,
            submitted_at = NOW(),
            verified_at = NOW()
          WHERE user_id = ?`,
          [item.regNo, item.status, item.notes, userId]
        );
      } else {
        await db.execute(
          `INSERT INTO applications (id, user_id, registration_no, status, notes, submitted_at, verified_at)
           VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
          [uuidv4(), userId, item.regNo, item.status, item.notes]
        );
      }

      const icon = item.status === 'DITERIMA' ? '✅ LULUS' : '❌ TIDAK LULUS';
      console.log(`  [${icon}] ${item.namaLengkap} (${item.regNo}) — ${item.jenjang} ${item.jurusan} [${item.email}]`);
    }

    console.log('\n✨ Seeding selesai dengan sukses!');
  } catch (error) {
    console.error('❌ Gagal seeding:', error);
  } finally {
    await closePool();
  }
}

seedDummyApplicants();
