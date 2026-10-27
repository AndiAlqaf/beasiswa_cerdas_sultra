/**
 * Document Types — SINGLE SOURCE OF TRUTH
 *
 * Setiap slot dokumen punya satu makna tetap, TIDAK BOLEH dipakai ulang untuk
 * dokumen lain (mis. slot DTKS tidak boleh dipakai untuk Ijazah).
 *
 * - `dtks`             : Bukti tangkapan layar DTKS / DTSEN (Kemensos)
 * - `ijazah`           : Ijazah & transkrip jenjang sebelumnya (khusus S2/S3, opsional)
 * - `surat_permohonan` : Surat permohonan beasiswa kepada Gubernur Sultra
 * - `ktm`              : Salinan KTM / Surat Keterangan Aktif Kuliah
 * - `ktp`              : Salinan Kartu Tanda Penduduk domisili Sultra
 * - `transkrip`        : Salinan transkrip nilai akademik semester terakhir
 * - `surat_pernyataan` : Surat pernyataan tidak sedang menerima beasiswa lain
 * - `esai`             : Motivation letter (S1) atau Esai Kontribusi Daerah (S2/S3)
 * - `selfie`           : Pasfoto formal / selfie memegang KTP
 * - `pendukung`        : Dokumen sertifikat atau prestasi pendukung
 */

// Tipe dokumen kanonik utama yang disimpan di database
const CANONICAL_DOC_TYPES = [
  'surat_permohonan',
  'selfie',
  'ktp',
  'ktm',
  'transkrip',
  'dtks',
  'ijazah',
  'surat_pernyataan',
  'pernyataan',
  'esai',
  'pendukung',
];

// Alias lama (legacy) yang masih bisa muncul di form klien / API.
// Setiap grup merepresentasikan satu dokumen logis yang identik.
const DOC_ALIAS_GROUPS = [
  ['selfie', 'filePasfoto', 'pasfoto', 'fileSelfie', 'photo'],
  ['ktm', 'fileSuratAktif', 'surataktif', 'surat_aktif', 'fileKtm'],
  ['ktp', 'fileKtp'],
  ['transkrip', 'fileTranskrip', 'transkrip_nilai'],
  ['dtks', 'fileDtks', 'kip', 'dtsen', 'kemensos'],
  ['ijazah', 'fileIjazah', 'ijazah_s1', 'ijazah_s2', 'ijazah_sebelumnya'],
  ['surat_pernyataan', 'pernyataan', 'fileSuratPernyataan'],
  ['surat_permohonan', 'fileSuratPermohonan', 'suratpermohonan', 'permohonan'],
  ['esai', 'fileMotivationOrEsai', 'motivationletter', 'essay', 'fileEsai'],
  ['pendukung', 'filePendukung'],
];

/**
 * Normalisasi tipe dokumen mentah dari input manapun ke format kanonik standar.
 * Menghilangkan risiko mismatch karena camelCase (docType) vs snake_case (doc_type).
 *
 * @param {string} raw - Input docType mentah
 * @returns {string} Nama dokumen kanonik
 */
function normalizeDocType(raw) {
  if (!raw || typeof raw !== 'string') return '';
  const clean = raw.trim().toLowerCase().replace(/[^a-z0-9]/g, '');

  if (['dtks', 'filedtks', 'kip', 'dtsen', 'kemensos', 'suratdtks'].includes(clean)) return 'dtks';
  if (['ijazah', 'fileijazah', 'ijazahs1', 'ijazahs2', 'ijazahsebelumnya'].includes(clean)) return 'ijazah';
  if (['ktm', 'filesurataktif', 'surataktif', 'filektm', 'kartumahasiswa', 'suratketeranganaktif'].includes(clean)) return 'ktm';
  if (['ktp', 'filektp', 'kartutandapenduduk'].includes(clean)) return 'ktp';
  if (['transkrip', 'filetranskrip', 'transkripnilai', 'khs'].includes(clean)) return 'transkrip';
  if (['suratpermohonan', 'filesuratpermohonan', 'permohonan'].includes(clean)) return 'surat_permohonan';
  if (['suratpernyataan', 'filesuratpernyataan', 'pernyataan'].includes(clean)) return 'surat_pernyataan';
  if (['esai', 'filemotivationoresai', 'motivationletter', 'essay', 'fileesai', 'karyatulis'].includes(clean)) return 'esai';
  if (['selfie', 'filepasfoto', 'pasfoto', 'fileselfie', 'foto'].includes(clean)) return 'selfie';
  if (['pendukung', 'filependukung', 'prestasi', 'sertifikat'].includes(clean)) return 'pendukung';

  return raw.trim().toLowerCase();
}

/**
 * Mendapatkan semua varian alias untuk suatu tipe dokumen
 * @param {string} docType
 * @returns {string[]}
 */
function getAliasGroup(docType) {
  const canonical = normalizeDocType(docType);
  const group = DOC_ALIAS_GROUPS.find((g) => g.map(a => normalizeDocType(a)).includes(canonical));
  if (group) {
    return Array.from(new Set([canonical, ...group]));
  }
  return [docType];
}

const ALLOWED_DOC_TYPES = new Set(DOC_ALIAS_GROUPS.flat().concat(CANONICAL_DOC_TYPES));

function isAllowedDocType(docType) {
  if (!docType || typeof docType !== 'string') return false;
  if (ALLOWED_DOC_TYPES.has(docType)) return true;
  const normalized = normalizeDocType(docType);
  return CANONICAL_DOC_TYPES.includes(normalized);
}

module.exports = {
  CANONICAL_DOC_TYPES,
  DOC_ALIAS_GROUPS,
  ALLOWED_DOC_TYPES,
  normalizeDocType,
  getAliasGroup,
  isAllowedDocType,
};
