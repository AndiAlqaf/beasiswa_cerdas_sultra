export interface FaqItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

export interface DocumentTemplate {
  id: string;
  title: string;
  description: string;
  fileType: string;
  fileSize: string;
  downloadUrl: string;
  requiredFor: string;
}

export interface District {
  code: string;
  name: string;
}

export const SULTRA_DISTRICTS: District[] = [
  { code: 'KONAWE', name: 'Kabupaten Konawe' },
  { code: 'KONAWE_SELATAN', name: 'Kabupaten Konawe Selatan' },
  { code: 'KONAWE_UTARA', name: 'Kabupaten Konawe Utara' },
  { code: 'KONAWE_KEPULAUAN', name: 'Kabupaten Konawe Kepulauan' },
  { code: 'KOLAKA', name: 'Kabupaten Kolaka' },
  { code: 'KOLAKA_UTARA', name: 'Kabupaten Kolaka Utara' },
  { code: 'KOLAKA_TIMUR', name: 'Kabupaten Kolaka Timur' },
  { code: 'MUNA', name: 'Kabupaten Muna' },
  { code: 'MUNA_BARAT', name: 'Kabupaten Muna Barat' },
  { code: 'BUTON', name: 'Kabupaten Buton' },
  { code: 'BUTON_UTARA', name: 'Kabupaten Buton Utara' },
  { code: 'BUTON_SELATAN', name: 'Kabupaten Buton Selatan' },
  { code: 'BUTON_TENGAH', name: 'Kabupaten Buton Tengah' },
  { code: 'BOMBANA', name: 'Kabupaten Bombana' },
  { code: 'WAKATOBI', name: 'Kabupaten Wakatobi' },
  { code: 'KOTA_KENDARI', name: 'Kota Kendari' },
  { code: 'KOTA_BAUBAU', name: 'Kota Bau-Bau' }
];

export const PRIORITY_FIELDS = [
  {
    id: 'pendidikan',
    name: 'Pendidikan',
    icon: 'GraduationCap',
    description: 'Keguruan, Manajemen Pendidikan, Pendidikan Dasar, Bimbingan Konseling, dan Pembelajaran Inovatif.',
    color: 'emerald'
  },
  {
    id: 'kesehatan',
    name: 'Kesehatan',
    icon: 'Stethoscope',
    description: 'Kedokteran, Keperawatan, Kebidanan, Farmasi, Kesehatan Masyarakat, dan Gizi.',
    color: 'sky'
  },
  {
    id: 'agromaritim',
    name: 'Agromaritim',
    icon: 'Wheat',
    description: 'Pertanian, Perikanan, Kelautan, Peternakan, Kehutanan, dan Teknologi Pangan.',
    color: 'amber'
  },
  {
    id: 'infrastruktur',
    name: 'Infrastruktur',
    icon: 'Building2',
    description: 'Teknik Sipil, Arsitektur, Perencanaan Wilayah Kota, Teknik Elektro, dan Lingkungan.',
    color: 'indigo'
  }
];

export const SCHOLARSHIP_AMOUNTS = [
  {
    jenjang: 'S1 / D4',
    totalAmount: 'Rp10.000.000',
    termin1: 'Rp5.000.000 (50%)',
    termin2: 'Rp5.000.000 (50%)',
    semesters: 'Semester 3 - 5',
    minIpk: '3.25'
  },
  {
    jenjang: 'S2 (Magister)',
    totalAmount: 'Rp15.000.000',
    termin1: 'Rp7.500.000 (50%)',
    termin2: 'Rp7.500.000 (50%)',
    semesters: 'Semester 2 - 3',
    minIpk: '3.50'
  },
  {
    jenjang: 'S3 (Doktor)',
    totalAmount: 'Rp30.000.000',
    termin1: 'Rp15.000.000 (50%)',
    termin2: 'Rp15.000.000 (50%)',
    semesters: 'Semester 2 - 5',
    minIpk: '3.50'
  }
];

export const SCHEDULE_TIMELINE = [
  { date: '13 - 30 September 2026', title: 'Pendaftaran Online', desc: 'Pembuatan akun, pengisian formulir, & unggah berkas di portal resmi.', status: 'active' },
  { date: '1 - 15 Oktober 2026', title: 'Proses Seleksi & Verifikasi', desc: 'Verifikasi berkas & validasi kualifikasi pendaftar oleh tim seleksi.', status: 'upcoming' },
  { date: '16 - 17 Oktober 2026', title: 'Pengumuman Hasil Seleksi', desc: 'Pengumuman kelulusan administrasi & seleksi tahap awal.', status: 'upcoming' },
  { date: '19 - 21 Oktober 2026', title: 'Masa Sanggah', desc: 'Pengajuan sanggahan bagi pendaftar yang berkasnya memerlukan klarifikasi.', status: 'upcoming' },
  { date: '22 - 29 Oktober 2026', title: 'Pengumuman Hasil Sanggah', desc: 'Pengumuman final setelah proses verifikasi sanggahan.', status: 'upcoming' },
  { date: '30 - 31 Oktober 2026', title: 'Penetapan Penerima Resmi', desc: 'SK Gubernur penetapan nama penerima Beasiswa Stimulan Sultra Cerdas.', status: 'upcoming' },
  { date: '2 - 3 November 2026', title: 'Penandatanganan Kontrak & Pakta Integritas', desc: 'Penandatanganan dokumen komitmen penerima beasiswa.', status: 'upcoming' },
  { date: 'Mulai 4 November 2026', title: 'Penyaluran Beasiswa Termin I', desc: 'Pencairan dana 50% tahap pertama langsung ke rekening bank penerima.', status: 'upcoming' }
];

export const TEMPLATE_DOCUMENTS: DocumentTemplate[] = [
  {
    id: 'surat-permohonan',
    title: 'Template Surat Permohonan BSSC 2026',
    description: 'Format surat permohonan resmi yang ditujukan kepada Gubernur Sulawesi Tenggara.',
    fileType: 'DOCX',
    fileSize: '45 KB',
    downloadUrl: '#',
    requiredFor: 'Semua Jenjang (S1/D4, S2, S3)'
  },
  {
    id: 'surat-pernyataan',
    title: 'Template Surat Pernyataan Bebas Beasiswa Lain',
    description: 'Surat pernyataan tidak sedang menerima beasiswa penuh dari institusi lain (Wajib Materai Rp10.000).',
    fileType: 'DOCX',
    fileSize: '38 KB',
    downloadUrl: '#',
    requiredFor: 'Semua Jenjang (S1/D4, S2, S3)'
  },
  {
    id: 'panduan-motivation-letter',
    title: 'Panduan & Format Motivation Letter (S1/D4)',
    description: 'Format penulisan motivation letter mengenai alasan & target akademik untuk mahasiswa S1/D4.',
    fileType: 'PDF',
    fileSize: '120 KB',
    downloadUrl: '#',
    requiredFor: 'Khusus Mahasiswa S1 / D4'
  },
  {
    id: 'panduan-esai-kontribusi',
    title: 'Panduan & Format Esai Kontribusi Daerah (S2/S3)',
    description: 'Pedoman penyusunan esai rencana kontribusi 5 tahun untuk kemajuan Sulawesi Tenggara.',
    fileType: 'PDF',
    fileSize: '150 KB',
    downloadUrl: '#',
    requiredFor: 'Khusus Mahasiswa S2 & S3'
  },
  {
    id: 'juknis-bssc-2026',
    title: 'Petunjuk Teknis (Juknis) BSSC Tahun 2026',
    description: 'Dokumen lengkap pedoman pelaksanaan, kriteria seleksi, dan aturan beasiswa.',
    fileType: 'PDF',
    fileSize: '1.2 MB',
    downloadUrl: '#',
    requiredFor: 'Dokumen Acuan Resmi'
  }
];

export const FAQ_DATA: FaqItem[] = [
  {
    id: 'faq-1',
    category: 'Tentang BSSC',
    question: 'Apa itu Beasiswa Stimulan Sultra Cerdas (BSSC)?',
    answer: 'Beasiswa Stimulan Sultra Cerdas (BSSC) adalah bantuan biaya pendidikan dari Pemerintah Provinsi Sulawesi Tenggara yang bersumber dari APBD TA 2026. Beasiswa ini bersifat stimulan untuk membantu sebagian kebutuhan pendidikan selama dua semester.'
  },
  {
    id: 'faq-2',
    category: 'Tentang BSSC',
    question: 'Apakah BSSC merupakan beasiswa penuh?',
    answer: 'Tidak. BSSC bersifat stimulan untuk membantu sebagian operasional pendidikan dan bukan menanggung seluruh biaya studi secara penuh.'
  },
  {
    id: 'faq-3',
    category: 'Cek Kelayakan',
    question: 'Siapa saja yang berhak mendaftar BSSC?',
    answer: 'Mahasiswa aktif berkewarganegaraan Indonesia (WNI) yang memiliki KTP Sulawesi Tenggara, menempuh pendidikan jenjang S1/D4 (semester 3-5), S2 (semester 2-3), atau S3 (semester 2-5) baik pada Perguruan Tinggi Negeri (PTN) maupun Swasta (PTS) di dalam atau luar Provinsi Sultra.'
  },
  {
    id: 'faq-4',
    category: 'Cek Kelayakan',
    question: 'Berapa IPK minimum yang disyaratkan?',
    answer: 'Batas IPK minimal berdasarkan transkrip nilai sementara adalah: S1/D4 minimal 3,25 (skala 4,00); S2 & S3 minimal 3,50 (skala 4,00).'
  },
  {
    id: 'faq-5',
    category: 'Cek Kelayakan',
    question: 'Apakah perguruan tinggi dan program studi harus memiliki akreditasi tertentu?',
    answer: 'Ya. Perguruan tinggi dan program studi yang ditempuh wajib terakreditasi paling rendah "Baik Sekali" atau "B" dari BAN-PT / LAM.'
  },
  {
    id: 'faq-6',
    category: 'Program Studi Prioritas',
    question: 'Program studi apa saja yang termasuk bidang prioritas BSSC 2026?',
    answer: 'Terdapat 4 bidang prioritas utama: (1) Pendidikan, (2) Kesehatan, (3) Agromaritim, dan (4) Infrastruktur.'
  },
  {
    id: 'faq-7',
    category: 'Dokumen Persyaratan',
    question: 'Dokumen apa saja yang wajib disiapkan?',
    answer: '1. Surat permohonan ke Gubernur Sultra\n2. Pasfoto terbaru\n3. KTP Provinsi Sultra\n4. Surat Keterangan Aktif Kuliah\n5. Transkrip Nilai Sementara\n6. Bukti terdaftar DTKS / DTSEN\n7. Surat Pernyataan tidak sedang menerima beasiswa penuh (Materai 10rb)\n8. Sertifikat prestasi (jika ada)\n9. Motivation Letter (S1/D4) atau Esai Kontribusi (S2/S3).'
  },
  {
    id: 'faq-8',
    category: 'Dokumen Persyaratan',
    question: 'Apa bedanya Motivation Letter dan Esai Kontribusi?',
    answer: 'Motivation Letter diperuntukkan bagi mahasiswa jenjang S1/D4 yang memuat alasan dan motivasi akademik, sedangkan Esai Kontribusi diperuntukkan bagi mahasiswa S2 dan S3 yang berfokus pada rencana nyata kontribusi bagi Sulawesi Tenggara dalam 5 tahun ke depan.'
  },
  {
    id: 'faq-9',
    category: 'Beasiswa Lain & Double Funding',
    question: 'Apakah boleh menerima BSSC jika sedang menerima beasiswa lain?',
    answer: 'Pendaftar TIDAK diperbolehkan sedang menerima beasiswa penuh (full scholarship) atau bantuan pendidikan lain yang membiayai komponen pendidikan yang sama pada tahun akademik yang sama dari sumber manapun (APBN/APBD/Swasta).'
  },
  {
    id: 'faq-10',
    category: 'Besaran & Penyaluran',
    question: 'Bagaimana mekanisme penyaluran dana BSSC?',
    answer: 'Dana disalurkan dalam 2 termin (masing-masing 50%). Termin I dicairkan pada awal tahun anggaran setelah penetapan, dan Termin II dicairkan pada semester berikutnya setelah memenuhi evaluasi akademik.'
  }
];

export const MOCK_APPLICATIONS: Record<string, {
  registrationNo: string;
  name: string;
  nik: string;
  univ: string;
  prodi: string;
  jenjang: string;
  status: 'TERKIRIM' | 'VERIFIKASI_BERKAS' | 'SELEKSI_ADMINISTRASI' | 'DITERIMA' | 'PENCAIRAN_TERMIN_1';
  dateSubmitted: string;
  notes: string;
}> = {
  '3401020304050001': {
    registrationNo: 'BSSC-2026-S1-0892',
    name: 'Andi Rahmat Hidayat',
    nik: '3401020304050001',
    univ: 'Universitas Halu Oleo (UHO)',
    prodi: 'Teknik Sipil',
    jenjang: 'S1',
    status: 'PENCAIRAN_TERMIN_1',
    dateSubmitted: '15 September 2026',
    notes: 'Berkas telah diverifikasi dan lolos seleksi. Dana Termin I telah berhasil ditransfer.'
  },
  '3401020304050002': {
    registrationNo: 'BSSC-2026-S2-0314',
    name: 'Siti Nurhaliza',
    nik: '3401020304050002',
    univ: 'Universitas 19 November Kolaka',
    prodi: 'Kesehatan Masyarakat',
    jenjang: 'S2',
    status: 'VERIFIKASI_BERKAS',
    dateSubmitted: '20 September 2026',
    notes: 'Berkas administrasi sedang dalam proses verifikasi tim seleksi Pemprov Sultra.'
  }
};
