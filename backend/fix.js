const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env' });

async function fix() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });
  
  await pool.execute("UPDATE documents SET doc_type = 'surat_permohonan' WHERE doc_type = 'fileSuratPermohonan'");
  await pool.execute("UPDATE documents SET doc_type = 'selfie' WHERE doc_type = 'filePasfoto'");
  await pool.execute("UPDATE documents SET doc_type = 'ktp' WHERE doc_type = 'fileKtp'");
  await pool.execute("UPDATE documents SET doc_type = 'ktm' WHERE doc_type = 'fileSuratAktif'");
  await pool.execute("UPDATE documents SET doc_type = 'transkrip' WHERE doc_type = 'fileTranskrip'");
  await pool.execute("UPDATE documents SET doc_type = 'dtks' WHERE doc_type = 'fileDtks'");
  await pool.execute("UPDATE documents SET doc_type = 'surat_pernyataan' WHERE doc_type = 'fileSuratPernyataan'");
  await pool.execute("UPDATE documents SET doc_type = 'esai' WHERE doc_type = 'fileMotivationOrEsai'");
  
  console.log('Fixed doc_types in database!');
  process.exit(0);
}

fix();
