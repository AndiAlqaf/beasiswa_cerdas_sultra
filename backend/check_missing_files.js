const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env' });

async function checkMissingFiles() {
  console.log('\n=============================================================');
  console.log('🔍 AUDIT DOKUMEN FISIK PENDAFTAR (BEASISWA SULTRA CERDAS)');
  console.log('=============================================================\n');

  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'bssc_db',
  });

  try {
    // 1. Ambil semua dokumen beserta data user dan aplikasinya
    const [docs] = await pool.query(`
      SELECT 
        d.id as doc_id,
        d.user_id,
        d.doc_type,
        d.original_name,
        d.stored_name,
        d.file_path,
        d.file_size,
        d.uploaded_at,
        u.nama_lengkap,
        u.email,
        u.nik,
        u.jenjang_target,
        p.no_hp,
        a.registration_no,
        a.status as application_status
      FROM documents d
      JOIN users u ON u.id = d.user_id
      LEFT JOIN profiles p ON p.user_id = u.id
      LEFT JOIN applications a ON a.user_id = u.id
      ORDER BY u.nama_lengkap ASC, d.uploaded_at ASC
    `);

    console.log(`📊 Total Dokumen Tercatat di Database: ${docs.length}`);

    // Kumpulkan semua file fisik yang ada di folder uploads untuk pengecekan cepat
    const uploadsDir = path.join(__dirname, 'uploads');
    const existingFilesInUploads = new Set();
    
    function scanDir(dir) {
      if (!fs.existsSync(dir)) return;
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          scanDir(fullPath);
        } else if (entry.isFile()) {
          existingFilesInUploads.add(entry.name.toLowerCase());
          existingFilesInUploads.add(path.resolve(fullPath).toLowerCase());
        }
      }
    }
    scanDir(uploadsDir);

    console.log(`📂 Total File Fisik Ditemukan di Folder uploads/: ${existingFilesInUploads.size}\n`);

    // Periksa status setiap dokumen
    let totalMissing = 0;
    let totalFound = 0;
    const usersMap = new Map();

    for (const doc of docs) {
      const storedName = (doc.stored_name || path.basename(doc.file_path || '')).toLowerCase();
      
      let isFileFound = false;

      // Cek variasi path
      if (doc.file_path && fs.existsSync(doc.file_path)) {
        isFileFound = true;
      } else if (doc.file_path && fs.existsSync(path.join(__dirname, doc.file_path))) {
        isFileFound = true;
      } else if (storedName && existingFilesInUploads.has(storedName)) {
        isFileFound = true;
      }

      if (isFileFound) {
        totalFound++;
      } else {
        totalMissing++;
      }

      // Kelompokkan per mahasiswa
      if (!usersMap.has(doc.user_id)) {
        usersMap.set(doc.user_id, {
          userId: doc.user_id,
          namaLengkap: doc.nama_lengkap,
          nik: doc.nik,
          noHp: doc.no_hp || '-',
          email: doc.email,
          jenjang: doc.jenjang_target,
          noRegistrasi: doc.registration_no || 'Belum Submit',
          statusAplikasi: doc.application_status || 'DRAFT',
          berkasAda: [],
          berkasHilang: [],
        });
      }

      const uData = usersMap.get(doc.user_id);
      const docLabel = `${doc.doc_type} (${doc.original_name})`;
      if (isFileFound) {
        uData.berkasAda.push(docLabel);
      } else {
        uData.berkasHilang.push(docLabel);
      }
    }

    // Filter mahasiswa yang memiliki berkas hilang
    const affectedUsers = [];
    for (const u of usersMap.values()) {
      if (u.berkasHilang.length > 0) {
        affectedUsers.push(u);
      }
    }

    console.log('-------------------------------------------------------------');
    console.log(`📌 RANGKUMAN AUDIT BERKAS:`);
    console.log(`   • Dokumen Fisik Tersedia  : ${totalFound}`);
    console.log(`   • Dokumen Fisik HILANG    : ${totalMissing}`);
    console.log(`   • Total Mahasiswa Terdata : ${usersMap.size}`);
    console.log(`   • Mahasiswa TERDAMPAK     : ${affectedUsers.length} orang`);
    console.log('-------------------------------------------------------------\n');

    // Tampilkan 15 data pertama di konsol
    console.log('📋 DAFTAR MAHASISWA YANG BERKASNYA PERLU DIUNGGAH ULANG:\n');
    affectedUsers.slice(0, 15).forEach((u, idx) => {
      console.log(`[${idx + 1}] ${u.namaLengkap} | WA: ${u.noHp} | Reg: ${u.noRegistrasi} (${u.statusAplikasi})`);
      console.log(`    ❌ Berkas Hilang (${u.berkasHilang.length}): ${u.berkasHilang.join(', ')}`);
      console.log(`    ✅ Berkas Aman   (${u.berkasAda.length}): ${u.berkasAda.join(', ') || '-'}\n`);
    });

    if (affectedUsers.length > 15) {
      console.log(`... dan ${affectedUsers.length - 15} mahasiswa lainnya tercatat di file CSV.\n`);
    }

    // Export ke CSV untuk dibagikan ke Panitia / Mas Radit
    const csvHeader = 'No,Nama Mahasiswa,Nomor WhatsApp,Email,NIK,Jenjang,No Registrasi,Status Pendaftaran,Jumlah Berkas Hilang,Daftar Berkas Hilang,Daftar Berkas Aman\n';
    const csvRows = affectedUsers.map((u, idx) => {
      const clean = (str) => `"${String(str || '').replace(/"/g, '""')}"`;
      return [
        idx + 1,
        clean(u.namaLengkap),
        clean(u.noHp),
        clean(u.email),
        clean(u.nik),
        clean(u.jenjang),
        clean(u.noRegistrasi),
        clean(u.statusAplikasi),
        u.berkasHilang.length,
        clean(u.berkasHilang.join('; ')),
        clean(u.berkasAda.join('; '))
      ].join(',');
    });

    const csvPath = path.join(__dirname, 'audit_mahasiswa_berkas_hilang.csv');
    fs.writeFileSync(csvPath, csvHeader + csvRows.join('\n'), 'utf8');
    console.log(`💾 Data lengkap berhasil diexport ke CSV:`);
    console.log(`   👉 ${csvPath}\n`);

    // Export JSON
    const jsonPath = path.join(__dirname, 'audit_mahasiswa_berkas_hilang.json');
    fs.writeFileSync(jsonPath, JSON.stringify(affectedUsers, null, 2), 'utf8');
    console.log(`💾 Data JSON: ${jsonPath}\n`);

  } catch (err) {
    console.error('❌ Terjadi kesalahan audit:', err);
  } finally {
    await pool.end();
  }
}

checkMissingFiles();
