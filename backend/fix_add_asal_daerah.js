const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env' });

async function migrateAsalDaerah() {
  console.log('🔄 Memulai migrasi penambahan kolom asal_daerah ke tabel profiles...');
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'bssc_db',
  });

  try {
    await pool.query(`ALTER TABLE profiles ADD COLUMN asal_daerah VARCHAR(100) NULL`);
    console.log('✅ Berhasil menambahkan kolom asal_daerah ke tabel profiles!');
  } catch (err) {
    if (err.code === 'ER_DUP_FIELDNAME') {
      console.log('ℹ️ Kolom asal_daerah sudah ada di tabel profiles.');
    } else {
      console.error('❌ Gagal menambahkan kolom asal_daerah:', err.message);
    }
  }

  await pool.end();
  process.exit(0);
}

migrateAsalDaerah();
