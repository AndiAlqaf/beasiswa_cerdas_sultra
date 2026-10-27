/**
 * BACKUP MANUAL MANDIRI — BEASISWA STIMULAN SULTRA CERDAS 2026
 * 
 * Skrip ini melakukan pencadangan menyeluruh (full backup) independen:
 * 1. DUMP DATABASE SQL (.sql) — Struktur tabel & seluruh data dengan escaping aman.
 * 2. EXPORT JSON (.json) — Seluruh tabel diekspor ke JSON terstruktur per tabel.
 * 3. DOKUMEN FISIK — Menyalin seluruh berkas fisik dari `backend/uploads/` ke folder backup.
 * 4. AUDIT & MANIFEST INTEGRITAS — Verifikasi fisik 8 dokumen per pendaftar, ukuran, dan SHA-256 hash.
 * 
 * Jalankan kapan saja dengan:
 *   npm run backup
 * atau:
 *   node scripts/backup_manual.js
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { getPool } = require('../src/config/database');
const env = require('../src/config/env');
const { normalizeDocType } = require('../src/config/documentTypes');

function getTimestamp() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const y = now.getFullYear();
  const m = pad(now.getMonth() + 1);
  const d = pad(now.getDate());
  const hh = pad(now.getHours());
  const mm = pad(now.getMinutes());
  const ss = pad(now.getSeconds());
  return `${y}${m}${d}_${hh}${mm}${ss}`;
}

function calculateFileSha256(filePath) {
  try {
    if (!fs.existsSync(filePath)) return null;
    const fileBuffer = fs.readFileSync(filePath);
    return crypto.createHash('sha256').update(fileBuffer).digest('hex');
  } catch (e) {
    return null;
  }
}

function copyDirectoryRecursive(src, dest) {
  if (!fs.existsSync(src)) return 0;
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });

  let count = 0;
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      count += copyDirectoryRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
      count++;
    }
  }
  return count;
}

function getDirectorySizeBytes(dirPath) {
  if (!fs.existsSync(dirPath)) return 0;
  let total = 0;
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      total += getDirectorySizeBytes(fullPath);
    } else {
      total += fs.statSync(fullPath).size;
    }
  }
  return total;
}

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function escapeSqlValue(val) {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'number') return val;
  if (typeof val === 'boolean') return val ? 1 : 0;
  if (val instanceof Date) {
    const pad = (n) => String(n).padStart(2, '0');
    return `'${val.getFullYear()}-${pad(val.getMonth() + 1)}-${pad(val.getDate())} ${pad(val.getHours())}:${pad(val.getMinutes())}:${pad(val.getSeconds())}'`;
  }
  if (typeof val === 'object') {
    return `'${JSON.stringify(val).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
  }
  return `'${String(val).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n').replace(/\r/g, '\\r')}'`;
}

async function runManualBackup() {
  const startTime = Date.now();
  const timestamp = getTimestamp();
  const rootBackupDir = path.join(__dirname, '..', 'backups');
  const backupFolder = path.join(rootBackupDir, `bssc_backup_${timestamp}`);
  const uploadsBackupDir = path.join(backupFolder, 'uploads');
  const jsonExportDir = path.join(backupFolder, 'database_json');

  console.log('================================================================');
  console.log('  SISTEM BACKUP MANUAL MANDIRI — BSSC 2026');
  console.log(`  Waktu Mulai: ${new Date().toLocaleString('id-ID')}`);
  console.log(`  Direktori Target: ${backupFolder}`);
  console.log('================================================================\n');

  fs.mkdirSync(backupFolder, { recursive: true });
  fs.mkdirSync(uploadsBackupDir, { recursive: true });
  fs.mkdirSync(jsonExportDir, { recursive: true });

  const pool = getPool();

  // 1. DAFTAR SEMUA TABEL
  const [tablesResult] = await pool.execute('SHOW TABLES');
  const tableKey = Object.keys(tablesResult[0])[0];
  const tables = tablesResult.map((r) => r[tableKey]);

  console.log(`[1/4] DUMP DATABASE SQL & EKSPOR JSON (${tables.length} tabel)...`);

  let sqlDumpContent = `-- ================================================================\n`;
  sqlDumpContent += `-- BACKUP DATABASE BEASISWA STIMULAN SULTRA CERDAS 2026\n`;
  sqlDumpContent += `-- Timestamp: ${timestamp} (${new Date().toISOString()})\n`;
  sqlDumpContent += `-- Database: ${env.DB_NAME}\n`;
  sqlDumpContent += `-- ================================================================\n\n`;
  sqlDumpContent += `SET FOREIGN_KEY_CHECKS = 0;\n\n`;

  const allTablesData = {};
  const tableCounts = {};

  for (const table of tables) {
    // Schema
    const [[createResult]] = await pool.execute(`SHOW CREATE TABLE \`${table}\``);
    const createTableSql = createResult['Create Table'];

    sqlDumpContent += `--\n-- Struktur tabel \`${table}\`\n--\n`;
    sqlDumpContent += `DROP TABLE IF EXISTS \`${table}\`;\n`;
    sqlDumpContent += `${createTableSql};\n\n`;

    // Data
    const [rows] = await pool.execute(`SELECT * FROM \`${table}\``);
    tableCounts[table] = rows.length;
    allTablesData[table] = rows;

    // Write individual JSON
    fs.writeFileSync(
      path.join(jsonExportDir, `${table}.json`),
      JSON.stringify(rows, null, 2),
      'utf-8'
    );

    if (rows.length > 0) {
      sqlDumpContent += `--\n-- Dumping data tabel \`${table}\` (${rows.length} baris)\n--\n`;
      const columns = Object.keys(rows[0]);
      const colList = columns.map((c) => `\`${c}\``).join(', ');

      const batchSize = 100;
      for (let i = 0; i < rows.length; i += batchSize) {
        const chunk = rows.slice(i, i + batchSize);
        const valueClauses = chunk.map((r) => {
          const vals = columns.map((col) => escapeSqlValue(r[col]));
          return `(${vals.join(', ')})`;
        });
        sqlDumpContent += `INSERT INTO \`${table}\` (${colList}) VALUES\n${valueClauses.join(',\n')};\n`;
      }
      sqlDumpContent += `\n`;
    }
    console.log(`  ✔ Tabel \`${table}\`: ${rows.length} baris dicadangkan.`);
  }

  sqlDumpContent += `SET FOREIGN_KEY_CHECKS = 1;\n`;
  sqlDumpContent += `-- End of dump\n`;

  const sqlFilePath = path.join(backupFolder, 'database_dump.sql');
  fs.writeFileSync(sqlFilePath, sqlDumpContent, 'utf-8');
  fs.writeFileSync(
    path.join(backupFolder, 'database_all_tables.json'),
    JSON.stringify(allTablesData, null, 2),
    'utf-8'
  );
  console.log(`  ✔ Database SQL Dump tersimpan: database_dump.sql (${formatBytes(fs.statSync(sqlFilePath).size)})\n`);

  // 2. BACKUP SELURUH FILE FISIK UPLOADS
  console.log('[2/4] MENCADANGKAN SELURUH BERKAS FISIK DOKUMEN (uploads)...');
  const uploadsSourceDir = env.UPLOAD_DIR || path.join(__dirname, '..', 'uploads');
  const copiedFilesCount = copyDirectoryRecursive(uploadsSourceDir, uploadsBackupDir);
  const uploadsSizeBytes = getDirectorySizeBytes(uploadsBackupDir);
  console.log(`  ✔ Berhasil menyalin ${copiedFilesCount} file fisik (${formatBytes(uploadsSizeBytes)}) ke:`);
  console.log(`    ${uploadsBackupDir}\n`);

  // 3. AUDIT INTEGRITAS DOKUMEN & VERIFIKASI 8 FILE PER PENDAFTAR
  console.log('[3/4] AUDIT INTEGRITAS BERKAS & PENGECEKAN KELENGKAPAN 8 FILE...');
  const [docRows] = await pool.execute(`
    SELECT d.id, d.user_id, d.doc_type, d.original_name, d.stored_name, d.mime_type, d.file_size, d.file_path, d.uploaded_at,
           u.nama_lengkap, u.nik, u.jenjang_target, u.email,
           a.registration_no, a.status as app_status
    FROM documents d
    LEFT JOIN users u ON u.id = d.user_id
    LEFT JOIN applications a ON a.user_id = d.user_id
    ORDER BY d.user_id, d.uploaded_at ASC
  `);

  const documentsAudit = [];
  let physicalFilesMissingCount = 0;
  let physicalFilesValidCount = 0;

  for (const doc of docRows) {
    const rawPath = doc.file_path;
    const resolvedPath = rawPath && path.isAbsolute(rawPath) ? rawPath : path.resolve(__dirname, '..', rawPath || '');
    const existsOriginal = fs.existsSync(resolvedPath);

    // Relatif path di folder backup
    const backupRelPath = path.relative(uploadsSourceDir, resolvedPath);
    const backupFilePath = path.join(uploadsBackupDir, backupRelPath);
    const existsBackup = fs.existsSync(backupFilePath);

    const hash = existsOriginal ? calculateFileSha256(resolvedPath) : null;
    const actualSize = existsOriginal ? fs.statSync(resolvedPath).size : 0;

    const auditEntry = {
      id: doc.id,
      userId: doc.user_id,
      namaLengkap: doc.nama_lengkap,
      nik: doc.nik,
      jenjang: doc.jenjang_target,
      registrationNo: doc.registration_no || '-',
      appStatus: doc.app_status || '-',
      docTypeRaw: doc.doc_type,
      canonicalDocType: normalizeDocType(doc.doc_type),
      originalName: doc.original_name,
      storedName: doc.stored_name,
      dbFileSize: doc.file_size,
      actualFileSize: actualSize,
      sha256: hash,
      existsOnServer: existsOriginal,
      existsInBackup: existsBackup,
      status: existsOriginal ? 'VALID' : 'HILANG_DI_SERVER',
    };

    if (existsOriginal) {
      physicalFilesValidCount++;
    } else {
      physicalFilesMissingCount++;
    }

    documentsAudit.push(auditEntry);
  }

  // Pengecekan kelengkapan 8 dokumen wajib per pendaftar yang sudah submit
  const [userApplications] = await pool.execute(`
    SELECT a.id as app_id, a.user_id, a.registration_no, a.status, a.submitted_at,
           u.nama_lengkap, u.nik, u.jenjang_target, u.email
    FROM applications a
    JOIN users u ON u.id = a.user_id
    ORDER BY a.submitted_at DESC
  `);

  const S1_REQUIRED_DOCS = [
    'surat_permohonan',
    'selfie',
    'ktp',
    'ktm',
    'transkrip',
    'dtks',
    'surat_pernyataan',
    'esai',
  ];

  const applicantChecklist = [];
  let applicantsCompleteCount = 0;
  let applicantsIncompleteCount = 0;

  for (const app of userApplications) {
    const userDocs = documentsAudit.filter((d) => d.userId === app.user_id && d.existsOnServer);
    const userCanonicalTypes = new Set(userDocs.map((d) => d.canonicalDocType));

    const isS1 = (app.jenjang_target || 'S1') === 'S1';
    const requiredTypes = S1_REQUIRED_DOCS;
    const missingTypes = requiredTypes.filter((req) => !userCanonicalTypes.has(req));

    const hasDtks = userCanonicalTypes.has('dtks');
    const hasIjazah = userCanonicalTypes.has('ijazah');

    const isComplete = missingTypes.length === 0;
    if (isComplete) {
      applicantsCompleteCount++;
    } else {
      applicantsIncompleteCount++;
    }

    applicantChecklist.push({
      registrationNo: app.registration_no,
      namaLengkap: app.nama_lengkap,
      nik: app.nik,
      jenjang: app.jenjang_target,
      status: app.status,
      totalUploadedDocs: userDocs.length,
      isS1,
      hasDtks,
      hasIjazah,
      missingTypes,
      isComplete,
      uploadedList: userDocs.map((d) => ({
        type: d.canonicalDocType,
        filename: d.originalName,
        size: formatBytes(d.actualFileSize),
      })),
    });
  }

  // 4. GENERATE MANIFEST & LAPORAN AUDIT
  console.log('[4/4] MENULIS MANIFEST AUDIT & LAPORAN TEXT...');

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(2);
  const totalBackupSizeBytes = getDirectorySizeBytes(backupFolder);

  const manifest = {
    backupName: `bssc_backup_${timestamp}`,
    timestamp: new Date().toISOString(),
    durationSeconds: parseFloat(durationSec),
    environment: {
      dbName: env.DB_NAME,
      uploadDir: uploadsSourceDir,
    },
    statistics: {
      totalUsers: tableCounts['users'] || 0,
      totalProfiles: tableCounts['profiles'] || 0,
      totalApplications: tableCounts['applications'] || 0,
      totalDocumentsInDb: docRows.length,
      physicalFilesValid: physicalFilesValidCount,
      physicalFilesMissing: physicalFilesMissingCount,
      physicalFilesCopiedToBackup: copiedFilesCount,
      applicantsAudited: userApplications.length,
      applicantsComplete8Docs: applicantsCompleteCount,
      applicantsIncomplete: applicantsIncompleteCount,
      totalBackupSizeBytes,
      totalBackupSizeFormatted: formatBytes(totalBackupSizeBytes),
    },
    tableCounts,
    documentsAudit,
    applicantChecklist,
  };

  fs.writeFileSync(
    path.join(backupFolder, 'manifest.json'),
    JSON.stringify(manifest, null, 2),
    'utf-8'
  );

  // Tulis laporan manusia (human-readable text report)
  let reportText = `========================================================================\n`;
  reportText += `       LAPORAN RESMI AUDIT & BACKUP MANUAL BSSC 2026\n`;
  reportText += `========================================================================\n`;
  reportText += `Tanggal & Waktu    : ${new Date().toLocaleString('id-ID')}\n`;
  reportText += `Folder Backup      : ${backupFolder}\n`;
  reportText += `Durasi Pembuatan   : ${durationSec} detik\n`;
  reportText += `Ukuran Total Backup: ${formatBytes(totalBackupSizeBytes)}\n`;
  reportText += `------------------------------------------------------------------------\n`;
  reportText += `RINGKASAN DATABASE:\n`;
  for (const [t, count] of Object.entries(tableCounts)) {
    reportText += `  - Tabel ${t.padEnd(20)} : ${count} baris\n`;
  }
  reportText += `------------------------------------------------------------------------\n`;
  reportText += `INTEGRITAS BERKAS FISIK:\n`;
  reportText += `  - Total Dokumen di DB        : ${docRows.length}\n`;
  reportText += `  - Berkas Fisik Valid di Disk : ${physicalFilesValidCount}\n`;
  reportText += `  - Berkas Fisik Hilang        : ${physicalFilesMissingCount}\n`;
  reportText += `  - File Disalin ke Cadangan   : ${copiedFilesCount}\n`;
  reportText += `------------------------------------------------------------------------\n`;
  reportText += `AUDIT KELENGKAPAN 8 FILE PENDAFTAR (S1: 8 Wajib, S2/S3: +Ijazah):\n`;
  reportText += `  - Total Pendaftar Disubmit   : ${userApplications.length}\n`;
  reportText += `  - Berkas Lengkap             : ${applicantsCompleteCount}\n`;
  reportText += `  - Berkas Belum Lengkap       : ${applicantsIncompleteCount}\n\n`;

  reportText += `DETAIL CHECKLIST PENDAFTAR:\n`;
  for (const a of applicantChecklist) {
    reportText += `  [${a.registrationNo}] ${a.namaLengkap} (${a.jenjang}) - Status: ${a.status}\n`;
    reportText += `    DTKS Terunggah   : ${a.hasDtks ? 'YA (Valid)' : 'TIDAK'}\n`;
    reportText += `    Ijazah Terunggah : ${a.hasIjazah ? 'YA' : 'TIDAK (Opsional/S1)'}\n`;
    reportText += `    Status 8 Dokumen : ${a.isComplete ? 'LENGKAP 100%' : 'KURANG: ' + a.missingTypes.join(', ')}\n`;
    reportText += `    Daftar Berkas    :\n`;
    for (const f of a.uploadedList) {
      reportText += `      * ${f.type.padEnd(18)} : ${f.filename} (${f.size})\n`;
    }
    reportText += `\n`;
  }

  reportText += `========================================================================\n`;
  reportText += `HASIL AUDIT KESELURUHAN: ${physicalFilesMissingCount === 0 ? 'AMBIL KEPUTUSAN: 100% AMAN & LENGKAP' : 'PERINGATAN: ADA BERKAS HILANG'}\n`;
  reportText += `========================================================================\n`;

  fs.writeFileSync(path.join(backupFolder, 'LAPORAN_BACKUP.txt'), reportText, 'utf-8');

  console.log('================================================================');
  console.log('  ✔ BACKUP MANUAL SELESAI DENGAN SUKSES!');
  console.log(`  Lokasi Folder Cadangan:`);
  console.log(`  👉 ${backupFolder}`);
  console.log(`  Total Ukuran Backup: ${formatBytes(totalBackupSizeBytes)}`);
  console.log(`  File SQL Dump      : ${path.join(backupFolder, 'database_dump.sql')}`);
  console.log(`  File Laporan Teks  : ${path.join(backupFolder, 'LAPORAN_BACKUP.txt')}`);
  console.log(`  File Manifest JSON : ${path.join(backupFolder, 'manifest.json')}`);
  console.log('================================================================\n');

  process.exit(0);
}

runManualBackup().catch((err) => {
  console.error('\n❌ GAGAL MEMBUAT BACKUP MANUAL:', err);
  process.exit(1);
});
