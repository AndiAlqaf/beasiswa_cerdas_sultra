'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, Eye, Edit, Trash2, Loader2, AlertCircle, X, FileText, Printer, ExternalLink, FileSpreadsheet, Check } from 'lucide-react';
import { fetchAPI } from '@/lib/api';

const getDocTitle = (key: string) => {
  if (!key) return '-';
  const clean = String(key).trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  if (['dtks', 'filedtks', 'kip', 'dtsen', 'kemensos', 'suratdtks'].includes(clean)) return 'Bukti DTKS / DTSEN';
  if (['ijazah', 'fileijazah', 'ijazahs1', 'ijazahs2', 'ijazahsebelumnya'].includes(clean)) return 'Ijazah & Transkrip Jenjang Sebelumnya';
  if (['ktm', 'filesurataktif', 'surataktif', 'filektm', 'kartumahasiswa', 'suratketeranganaktif'].includes(clean)) return 'Surat Aktif Kuliah / KTM';
  if (['ktp', 'filektp', 'kartutandapenduduk'].includes(clean)) return 'KTP';
  if (['transkrip', 'filetranskrip', 'transkripnilai', 'khs'].includes(clean)) return 'Transkrip Nilai';
  if (['suratpermohonan', 'filesuratpermohonan', 'permohonan'].includes(clean)) return 'Surat Permohonan';
  if (['suratpernyataan', 'filesuratpernyataan', 'pernyataan'].includes(clean)) return 'Surat Pernyataan';
  if (['esai', 'filemotivationoresai', 'motivationletter', 'essay', 'fileesai'].includes(clean)) return 'Motivation Letter / Esai';
  if (['selfie', 'filepasfoto', 'pasfoto', 'fileselfie', 'foto'].includes(clean)) return 'Pasfoto / Selfie';
  if (['pendukung', 'filependukung', 'prestasi', 'sertifikat'].includes(clean)) return 'Berkas Pendukung / Sertifikat';
  return key;
};

const getOngoingEducation = (detail: any) => {
  if (!detail) return { institusi: '-', jurusan: '-' };
  const profilePt = detail.profile?.perguruanTinggi;
  const profileProdi = detail.profile?.fakultasProdi || detail.profile?.prodiPrioritas;

  const targetEdu = detail.education?.find((e: any) => e.tingkat === detail.user?.jenjangTarget);
  const higherEdu = detail.education?.find((e: any) => e.tingkat && e.tingkat !== 'SMA');
  const lastEdu = detail.education && detail.education.length > 0 ? detail.education[detail.education.length - 1] : null;

  const institusi = profilePt || targetEdu?.institusi || higherEdu?.institusi || lastEdu?.institusi || detail.education?.[0]?.institusi || '-';
  const jurusan = profileProdi || targetEdu?.jurusan || higherEdu?.jurusan || lastEdu?.jurusan || detail.education?.[0]?.jurusan || '-';

  return { institusi, jurusan };
};

const renderAchievementDetails = (rawStr?: string) => {
  if (!rawStr || !rawStr.trim()) return '-';
  if (rawStr.trim().startsWith('[')) {
    try {
      const items = JSON.parse(rawStr);
      if (Array.isArray(items) && items.length > 0) {
        return (
          <div className="space-y-2 py-1">
            {items.map((item: any, idx: number) => (
              <div key={idx} className="border-b border-slate-100 last:border-0 pb-1.5 last:pb-0">
                <p className="font-semibold text-slate-900">
                  {idx + 1}. {item.nama || item.name || '-'} {item.tahun ? `(${item.tahun})` : ''}
                </p>
                {(item.buktiFile || item.buktiLink) && (
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    {item.buktiFile && (
                      <a
                        href={item.buktiFile}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 hover:text-blue-900 bg-blue-50 px-2.5 py-1 rounded border border-blue-200 shadow-xs"
                      >
                        🖼️ Lihat Foto Bukti ({item.buktiFileName || 'File Bukti'})
                      </a>
                    )}
                    {item.buktiLink && (
                      <a
                        href={item.buktiLink.startsWith('http') ? item.buktiLink : `https://${item.buktiLink}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 shadow-xs"
                      >
                        🔗 Buka Link Bukti
                      </a>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        );
      }
    } catch (e) {
      // fallback
    }
  }
  return <div className="whitespace-pre-line">{rawStr}</div>;
};

export default function PendaftarPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [jenjangFilter, setJenjangFilter] = useState('');

  const handleViewDocument = async (userId: string, docId: string) => {
    try {
      const token = localStorage.getItem('bssc_access_token');
      const res = await fetch(`/api/v1/admin/applicants/${userId}/documents/${docId}/view`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Gagal memuat dokumen');
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      setTimeout(() => window.URL.revokeObjectURL(url), 60000);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [applicants, setApplicants] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selection & Export States
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [exportScope, setExportScope] = useState<'all' | 'page' | 'selected'>('all');
  const [exportFormat, setExportFormat] = useState<'xlsx' | 'csv'>('xlsx');
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Detail Modal States
  const [selectedApplicant, setSelectedApplicant] = useState<any>(null);
  const [applicantDetail, setApplicantDetail] = useState<any>(null);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);

  const handleOpenDetail = async (applicant: any) => {
    setSelectedApplicant(applicant);
    setLoadingDetail(true);
    setApplicantDetail(null);
    try {
      const id = applicant.userId || applicant.id;
      const res = await fetchAPI(`/admin/applicants/${id}`);
      if (res.success && res.data) {
        setApplicantDetail(res.data);
      }
    } catch (err: any) {
      alert(err.message || 'Gagal memuat detail berkas pendaftar.');
    } finally {
      setLoadingDetail(false);
    }
  };

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '10');
      if (searchTerm.trim()) params.set('search', searchTerm.trim());
      if (jenjangFilter) params.set('jenjang', jenjangFilter);
      if (statusFilter) params.set('status', statusFilter);

      const res = await fetchAPI(`/admin/applicants?${params.toString()}`);
      if (res.success && res.data) {
        setApplicants(res.data.applicants || []);
        setPagination(res.data.pagination || null);
      }
    } catch (err: any) {
      setError(err.message || 'Gagal memuat data pendaftar.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page, jenjangFilter, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadData();
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    const currentPageIds = applicants.map(u => u.userId || u.id);
    const allSelectedOnPage = currentPageIds.length > 0 && currentPageIds.every(id => selectedIds.includes(id));
    if (allSelectedOnPage) {
      setSelectedIds(prev => prev.filter(id => !currentPageIds.includes(id)));
    } else {
      setSelectedIds(prev => Array.from(new Set([...prev, ...currentPageIds])));
    }
  };

  // Mengambil SEMUA data pendaftar (seluruhnya, bukan dibatasi 10 data per sheet/halaman)
  const fetchAllApplicantsForExport = async () => {
    const params = new URLSearchParams();
    if (searchTerm.trim()) params.set('search', searchTerm.trim());
    if (jenjangFilter) params.set('jenjang', jenjangFilter);
    if (statusFilter) params.set('status', statusFilter);

    // 1. Coba endpoint ekspor khusus backend (cepat & langsung seluruh data tanpa limitasi paginasi)
    try {
      const res = await fetchAPI(`/admin/applicants/export?${params.toString()}`);
      if (res.success && res.data?.applicants && res.data.applicants.length > 0) {
        return res.data.applicants;
      }
    } catch (e) {
      console.warn('Endpoint /admin/applicants/export tidak tersedia, menggunakan fallback paginasi:', e);
    }

    // 2. Fallback aman: ambil berulang per halaman (limit 100) sampai semua halaman terkumpul
    let allData: any[] = [];
    let curPage = 1;
    let totalPages = 1;

    do {
      params.set('page', String(curPage));
      params.set('limit', '100');
      const res = await fetchAPI(`/admin/applicants?${params.toString()}`);
      if (res.success && res.data?.applicants) {
        allData = allData.concat(res.data.applicants);
        totalPages = res.data.pagination?.totalPages || 1;
      } else {
        break;
      }
      curPage++;
    } while (curPage <= totalPages);

    return allData.length > 0 ? allData : applicants;
  };

  const handlePerformExport = async () => {
    setIsExporting(true);
    try {
      let dataToExport: any[] = [];

      if (exportScope === 'page') {
        dataToExport = applicants;
      } else if (exportScope === 'selected') {
        dataToExport = applicants.filter(u => selectedIds.includes(u.userId || u.id));
        if (dataToExport.length === 0) {
          alert('Belum ada data pendaftar yang dipilih di tabel.');
          setIsExporting(false);
          return;
        }
      } else {
        // 'all' -> Seluruh Data (bukan persheet/per-halaman)
        dataToExport = await fetchAllApplicantsForExport();
      }

      if (dataToExport.length === 0) {
        alert('Tidak ada data pendaftar untuk diekspor.');
        setIsExporting(false);
        return;
      }

      const timestamp = new Date().toISOString().slice(0, 10);
      const filename = `data_pendaftar_${jenjangFilter || 'semua'}_${statusFilter || 'semua'}_${exportScope === 'all' ? 'seluruhnya' : exportScope}_${timestamp}`;

      if (exportFormat === 'xlsx') {
        const XLSX = await import('xlsx');
        const rows = dataToExport.map((u: any, idx: number) => ({
          'No.': idx + 1,
          'No. Registrasi': u.registrationNo || '-',
          'Nama Lengkap': u.namaLengkap || '-',
          'NIK': String(u.nik || ''),
          'Jenis Kelamin': u.gender || '-',
          'No. HP / WA': String(u.noHp || '-'),
          'Email': u.email || '-',
          'Asal Daerah': u.asalDaerah || '-',
          'Jenjang': u.jenjangTarget || '-',
          'Perguruan Tinggi': u.perguruanTinggi || '-',
          'Program Studi': u.prodi || '-',
          'Semester': u.semester || '-',
          'IPK': u.ipk || '-',
          'Status': u.status || '-',
          'Tanggal Submit': u.submittedAt ? new Date(u.submittedAt).toLocaleDateString('id-ID') : '-',
          'Nama Bank': u.namaBank || '-',
          'Nomor Rekening': String(u.noRekening || '-'),
          'Nama Rekening': u.namaRekening || '-',
          'Catatan': u.notes || '-'
        }));

        const worksheet = XLSX.utils.json_to_sheet(rows);

        // Atur lebar kolom yang rapi
        worksheet['!cols'] = [
          { wch: 6 },  // No.
          { wch: 22 }, // No. Registrasi
          { wch: 28 }, // Nama Lengkap
          { wch: 20 }, // NIK
          { wch: 14 }, // Jenis Kelamin
          { wch: 18 }, // No HP
          { wch: 26 }, // Email
          { wch: 20 }, // Asal Daerah
          { wch: 10 }, // Jenjang
          { wch: 30 }, // Perguruan Tinggi
          { wch: 26 }, // Program Studi
          { wch: 10 }, // Semester
          { wch: 8 },  // IPK
          { wch: 20 }, // Status
          { wch: 16 }, // Tanggal Submit
          { wch: 16 }, // Nama Bank
          { wch: 20 }, // Nomor Rekening
          { wch: 26 }, // Nama Rekening
          { wch: 30 }, // Catatan
        ];

        // Format cell string untuk NIK dan No. Rekening agar tidak jadi angka eksponensial (scientific notation) di Excel
        const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:A1');
        for (let R = range.s.r + 1; R <= range.e.r; ++R) {
          const nikCell = XLSX.utils.encode_cell({ r: R, c: 3 });
          if (worksheet[nikCell]) {
            worksheet[nikCell].t = 's';
            worksheet[nikCell].z = '@';
          }
          const hpCell = XLSX.utils.encode_cell({ r: R, c: 5 });
          if (worksheet[hpCell]) {
            worksheet[hpCell].t = 's';
            worksheet[hpCell].z = '@';
          }
          const rekCell = XLSX.utils.encode_cell({ r: R, c: 16 });
          if (worksheet[rekCell]) {
            worksheet[rekCell].t = 's';
            worksheet[rekCell].z = '@';
          }
        }

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Pendaftar');
        XLSX.writeFile(workbook, `${filename}.xlsx`);
      } else {
        // Format CSV
        const headers = [
          'No.', 'No. Registrasi', 'Nama Lengkap', 'NIK', 'Jenis Kelamin', 'No. HP',
          'Email', 'Asal Daerah', 'Jenjang Target', 'Perguruan Tinggi', 'Prodi',
          'Semester', 'IPK', 'Status Pendaftaran', 'Tanggal Submit',
          'Nama Bank', 'Nomor Rekening', 'Nama Pemilik Rekening', 'Catatan'
        ];

        const rows = dataToExport.map((u: any, idx: number) => [
          `"${idx + 1}"`,
          `"${(u.registrationNo || '').replace(/"/g, '""')}"`,
          `"${(u.namaLengkap || '').replace(/"/g, '""')}"`,
          `="'${u.nik || ''}"`, // Trik format Excel agar NIK 16 digit tidak terpotong
          `"${(u.gender || '').replace(/"/g, '""')}"`,
          `="'${u.noHp || ''}"`,
          `"${(u.email || '').replace(/"/g, '""')}"`,
          `"${(u.asalDaerah || '').replace(/"/g, '""')}"`,
          `"${(u.jenjangTarget || '').replace(/"/g, '""')}"`,
          `"${(u.perguruanTinggi || '').replace(/"/g, '""')}"`,
          `"${(u.prodi || '').replace(/"/g, '""')}"`,
          `"${u.semester || ''}"`,
          `"${u.ipk || ''}"`,
          `"${(u.status || '').replace(/"/g, '""')}"`,
          `"${u.submittedAt ? new Date(u.submittedAt).toLocaleDateString('id-ID') : ''}"`,
          `"${(u.namaBank || '').replace(/"/g, '""')}"`,
          `="'${u.noRekening || ''}"`,
          `"${(u.namaRekening || '').replace(/"/g, '""')}"`,
          `"${(u.notes || '').replace(/"/g, '""')}"`
        ]);

        const csvContent = '\uFEFF' + [
          headers.join(';'),
          ...rows.map(r => r.join(';'))
        ].join('\r\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      }

      setShowExportModal(false);
    } catch (err: any) {
      alert('Gagal mengekspor data: ' + (err.message || 'Terjadi kesalahan sistem'));
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="relative">
      <div className="space-y-6 print:hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Data Pendaftar</h2>
            <p className="text-slate-500">Kelola dan pantau seluruh data pendaftar beasiswa.</p>
          </div>
          <button
            onClick={() => setShowExportModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Export Data ({pagination?.totalItems || applicants.length})
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Table Controls */}
          <div className="p-4 sm:p-6 border-b border-slate-200 flex flex-col sm:flex-row justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari nama, No. Registrasi, atau Universitas..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-normal text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
              />
            </div>
            <div className="flex gap-2 flex-wrap sm:flex-nowrap">
              <select
                value={jenjangFilter}
                onChange={(e) => setJenjangFilter(e.target.value)}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Semua Jenjang</option>
                <option value="S1/D4">S1 / D4</option>
                <option value="S2">S2</option>
                <option value="S3">S3</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Semua Status</option>
                <option value="TERKIRIM">Menunggu Verifikasi (TERKIRIM)</option>
                <option value="PERLU_UNGGAH_ULANG">Perlu Unggah Ulang (KTM hilang)</option>
                <option value="VERIFIKASI_BERKAS">Proses Verifikasi (VERIFIKASI)</option>
                <option value="SELEKSI_ADMINISTRASI">Seleksi Administrasi</option>
                <option value="DITERIMA">Lolos Seleksi (DITERIMA)</option>
                <option value="DITOLAK">Ditolak (DITOLAK)</option>
              </select>
              <button
                type="button"
                onClick={() => { setPage(1); loadData(); }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 text-blue-700 rounded-xl text-sm font-semibold hover:bg-blue-100 transition-colors cursor-pointer"
              >
                <Filter className="w-4 h-4" />
                Terapkan
              </button>
              {selectedIds.length > 0 && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-800 rounded-xl text-xs font-bold border border-blue-200">
                  <span>{selectedIds.length} dipilih</span>
                  <button
                    type="button"
                    onClick={() => setSelectedIds([])}
                    className="text-blue-600 hover:text-blue-900 ml-1 underline cursor-pointer"
                  >
                    Reset
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
                  <th className="p-4 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={applicants.length > 0 && applicants.every(u => selectedIds.includes(u.userId || u.id))}
                      onChange={toggleSelectAll}
                      title="Pilih semua di halaman ini"
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                    />
                  </th>
                  <th className="p-4 font-semibold whitespace-nowrap">No. Registrasi</th>
                  <th className="p-4 font-semibold whitespace-nowrap">Nama & Prodi</th>
                  <th className="p-4 font-semibold whitespace-nowrap">Universitas</th>
                  <th className="p-4 font-semibold whitespace-nowrap">Jenjang</th>
                  <th className="p-4 font-semibold whitespace-nowrap">IPK</th>
                  <th className="p-4 font-semibold whitespace-nowrap">Tanggal</th>
                  <th className="p-4 font-semibold whitespace-nowrap">Status</th>
                  <th className="p-4 font-semibold text-center whitespace-nowrap">Aksi</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-slate-500">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-900 mb-2" />
                      Memuat data pendaftar...
                    </td>
                  </tr>
                ) : applicants.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-slate-500">
                      Tidak ada pendaftar yang sesuai dengan kriteria filter.
                    </td>
                  </tr>
                ) : (
                  applicants.map((user, idx) => (
                    <tr key={idx} className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${selectedIds.includes(user.userId || user.id) ? 'bg-blue-50/50' : ''}`}>
                      <td className="p-4 text-center">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(user.userId || user.id)}
                          onChange={() => toggleSelect(user.userId || user.id)}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                        />
                      </td>
                      <td className="p-4 text-slate-600 font-mono text-xs">{user.registrationNo}</td>
                      <td className="p-4">
                        <p className="font-bold text-slate-900">{user.namaLengkap}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{user.prodi && user.prodi !== '-' ? user.prodi : user.email}</p>
                      </td>
                      <td className="p-4 text-slate-600 text-xs font-medium truncate max-w-[200px]" title={user.perguruanTinggi || `NIK: ${user.nik}`}>
                        {user.perguruanTinggi && user.perguruanTinggi !== '-' ? user.perguruanTinggi : `NIK: ${user.nik}`}
                      </td>
                      <td className="p-4">
                        <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md text-xs font-bold border border-slate-200 whitespace-nowrap">{user.jenjangTarget}</span>
                      </td>
                      <td className="p-4 text-slate-900 font-extrabold text-sm">{user.ipk && user.ipk !== '-' ? user.ipk : '-'}</td>
                      <td className="p-4 text-slate-500 text-xs">
                        {user.submittedAt ? new Date(user.submittedAt).toLocaleDateString('id-ID') : '-'}
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${user.status === 'DITERIMA' ? 'bg-emerald-100 text-emerald-700' :
                            user.status === 'DITOLAK' ? 'bg-rose-100 text-rose-700' :
                              user.status === 'PERLU_UNGGAH_ULANG' ? 'bg-rose-100 text-rose-700' :
                                'bg-amber-100 text-amber-700'
                          }`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenDetail(user)}
                            className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                            title="Lihat Detail"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-600">
            <p>Total {pagination?.totalItems || applicants.length} pendaftar (Halaman {pagination?.currentPage || 1} dari {pagination?.totalPages || 1})</p>
            <div className="flex gap-1">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="px-3 py-1 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
              >
                Sebelumnya
              </button>
              <button
                disabled={page >= (pagination?.totalPages || 1)}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        </div>

        {/* Modal Pilihan Export Data */}
        {showExportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col border border-slate-100">
              {/* Header Modal */}
              <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
                    <Download className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Export Data Pendaftar</h3>
                    <p className="text-xs text-slate-500">Unduh data pendaftar beasiswa ke file spreadsheet</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowExportModal(false)}
                  disabled={isExporting}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-white rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body Modal */}
              <div className="p-6 space-y-5">
                {/* Opsi Jangkauan Data */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                    1. Pilih Jangkauan Data
                  </label>
                  <div className="space-y-2.5">
                    {/* Opsi 1: Seluruh Data */}
                    <label className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${exportScope === 'all'
                        ? 'border-blue-500 bg-blue-50/60 ring-2 ring-blue-500/20'
                        : 'border-slate-200 hover:bg-slate-50'
                      }`}>
                      <input
                        type="radio"
                        name="exportScope"
                        value="all"
                        checked={exportScope === 'all'}
                        onChange={() => setExportScope('all')}
                        className="mt-0.5 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex-1 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">
                            Seluruh Data ({pagination?.totalItems || applicants.length} Pendaftar)
                          </span>
                          <span className="text-[11px] bg-blue-100 text-blue-700 font-semibold px-2 py-0.5 rounded-full">
                            Direkomendasikan
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Mengunduh <strong>SEMUA</strong> pendaftar sekaligus dalam satu file (bukan per sheet / per halaman).
                          {jenjangFilter || statusFilter || searchTerm ? ' Mengikuti filter aktif saat ini.' : ''}
                        </p>
                      </div>
                    </label>

                    {/* Opsi 2: Halaman Ini Saja */}
                    <label className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${exportScope === 'page'
                        ? 'border-blue-500 bg-blue-50/60 ring-2 ring-blue-500/20'
                        : 'border-slate-200 hover:bg-slate-50'
                      }`}>
                      <input
                        type="radio"
                        name="exportScope"
                        value="page"
                        checked={exportScope === 'page'}
                        onChange={() => setExportScope('page')}
                        className="mt-0.5 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex-1 text-sm">
                        <span className="font-semibold text-slate-900">
                          Halaman Ini Saja ({applicants.length} Pendaftar)
                        </span>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Hanya mengunduh data pendaftar yang sedang tampil di halaman tabel saat ini (Halaman {pagination?.currentPage || 1}).
                        </p>
                      </div>
                    </label>

                    {/* Opsi 3: Data yang Dipilih */}
                    <label className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all ${selectedIds.length === 0 ? 'opacity-50 cursor-not-allowed border-slate-200 bg-slate-50' :
                        exportScope === 'selected'
                          ? 'border-blue-500 bg-blue-50/60 ring-2 ring-blue-500/20 cursor-pointer'
                          : 'border-slate-200 hover:bg-slate-50 cursor-pointer'
                      }`}>
                      <input
                        type="radio"
                        name="exportScope"
                        value="selected"
                        disabled={selectedIds.length === 0}
                        checked={exportScope === 'selected'}
                        onChange={() => setExportScope('selected')}
                        className="mt-0.5 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex-1 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-900">
                            Data yang Dipilih ({selectedIds.length} Pendaftar)
                          </span>
                          {selectedIds.length === 0 && (
                            <span className="text-[10px] text-slate-400 italic">Centang baris tabel dulu</span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Hanya mengekspor baris pendaftar yang telah dicentang di tabel.
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Opsi Format File */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                    2. Pilih Format File
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setExportFormat('xlsx')}
                      className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer ${exportFormat === 'xlsx'
                          ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/20 text-emerald-950 font-bold'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                    >
                      <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                        XLSX
                      </div>
                      <div>
                        <p className="text-sm font-bold">Microsoft Excel</p>
                        <p className="text-[11px] text-slate-500 font-normal">.xlsx (Format Resmi)</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setExportFormat('csv')}
                      className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer ${exportFormat === 'csv'
                          ? 'border-blue-500 bg-blue-50/60 ring-2 ring-blue-500/20 text-blue-950 font-bold'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                    >
                      <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                        CSV
                      </div>
                      <div>
                        <p className="text-sm font-bold">File CSV</p>
                        <p className="text-[11px] text-slate-500 font-normal">.csv (UTF-8 Excel)</p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Info Tambahan */}
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    Nomor NIK (16 digit) dan Nomor Rekening otomatis diformat sebagai teks agar tidak rusak menjadi format ilmiah (scientific <code>7.40E+15</code>) di Microsoft Excel.
                  </span>
                </div>
              </div>

              {/* Footer Modal */}
              <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
                <button
                  type="button"
                  disabled={isExporting}
                  onClick={() => setShowExportModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={isExporting}
                  onClick={handlePerformExport}
                  className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {isExporting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Menyiapkan Data...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Unduh File {exportFormat.toUpperCase()}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Detail Berkas Pendaftar */}
        {selectedApplicant && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
              {/* Modal Header */}
              <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Detail Pendaftar</h3>
                  <p className="text-sm text-slate-500 mt-1">No. Registrasi: {selectedApplicant.registrationNo}</p>
                </div>
                <button
                  onClick={() => { setSelectedApplicant(null); setApplicantDetail(null); }}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto flex-1 space-y-6">
                {loadingDetail ? (
                  <div className="p-12 text-center text-slate-500">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-900 mb-2" />
                    Mengambil data pendaftar...
                  </div>
                ) : applicantDetail ? (
                  <>
                    {/* Applicant Info */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-900 text-lg">{applicantDetail.user?.namaLengkap}</h4>
                        <p className="text-sm text-slate-600">NIK: {applicantDetail.user?.nik} • Email: {applicantDetail.user?.email}</p>
                        <p className="text-xs text-slate-500 mt-1">Jenjang Target: <strong>{applicantDetail.user?.jenjangTarget}</strong></p>
                      </div>
                      <div className="text-right">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${selectedApplicant.status === 'DITERIMA' ? 'bg-emerald-100 text-emerald-700' :
                            selectedApplicant.status === 'DITOLAK' ? 'bg-rose-100 text-rose-700' :
                              'bg-amber-100 text-amber-700'
                          }`}>
                          {selectedApplicant.status}
                        </span>
                      </div>
                    </div>

                    {/* Biodata Summary */}
                    {applicantDetail.profile && (
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-1 text-slate-700">
                        <p>• Tempat/Tanggal Lahir: <strong>{applicantDetail.profile.tempatLahir || '-'}, {applicantDetail.profile.tanggalLahir || '-'}</strong></p>
                        <p>• Gender: <strong>{applicantDetail.profile.gender || '-'}</strong> | No. HP: <strong>{applicantDetail.profile.noHp || '-'}</strong></p>
                        <p>• Alamat Domisili: <strong>{applicantDetail.profile.alamatDomisili || '-'}</strong></p>
                      </div>
                    )}

                    {/* Bank Account Info Card (Penyaluran Beasiswa 50%) */}
                    <div className="bg-blue-50/80 p-4 rounded-xl border border-blue-200 text-xs space-y-1.5 text-slate-800">
                      <h5 className="font-extrabold text-blue-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                        💳 Rekening Bank Penerima (Penyaluran 50% Tahap 1)
                      </h5>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 font-medium">
                        <p>• Bank: <strong className="text-slate-900">{applicantDetail.profile?.namaBank || '-'}</strong></p>
                        <p>• No. Rekening: <strong className="font-mono text-slate-900">{applicantDetail.profile?.noRekening || '-'}</strong></p>
                        <p>• Atas Nama: <strong className="text-slate-900">{applicantDetail.profile?.namaRekening || '-'}</strong></p>
                      </div>
                    </div>

                    {/* Education History */}
                    {applicantDetail.education && applicantDetail.education.length > 0 && (
                      <div>
                        <h4 className="font-bold text-slate-900 mb-3 text-sm">Riwayat Pendidikan</h4>
                        <div className="space-y-2">
                          {applicantDetail.education.map((edu: any, idx: number) => (
                            <div key={idx} className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs text-slate-700">
                              <p className="font-semibold text-slate-900">{edu.tingkat} - {edu.institusi}</p>
                              {edu.jurusan && <p>Jurusan: {edu.jurusan}</p>}
                              <p>Tahun: {edu.tahunMulai || '-'} s/d {edu.tahunLulus || 'Sekarang'}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Documents List */}
                    <div>
                      <h4 className="font-bold text-slate-900 mb-3 text-sm">Berkas Unggahan</h4>
                      {applicantDetail.documents && applicantDetail.documents.length > 0 ? (
                        <div className="space-y-2">
                          {(() => {
                            const hasSanggahanNote = applicantDetail.application?.notes?.toLowerCase().includes('sanggah') || applicantDetail.application?.status === 'DITOLAK';
                            const hasMultipleDocs = applicantDetail.documents.some((d: any) =>
                              applicantDetail.documents.filter((x: any) => (x.docType || '').toLowerCase() === (d.docType || '').toLowerCase()).length > 1
                            );
                            const isAppeal = hasSanggahanNote || hasMultipleDocs;

                            let docsToRender = applicantDetail.documents;
                            if (!isAppeal) {
                              const latestDocsMap = new Map();
                              applicantDetail.documents.forEach((d: any) => {
                                const key = (d.docType || '').toLowerCase();
                                latestDocsMap.set(key, d);
                              });
                              docsToRender = Array.from(latestDocsMap.values());
                            }

                            return docsToRender.map((doc: any, docIdx: number) => {
                              const sameTypeDocs = applicantDetail.documents.filter((d: any) => (d.docType || '').toLowerCase() === (doc.docType || '').toLowerCase());
                              const sameTypeIndex = sameTypeDocs.findIndex((d: any) => d.id === doc.id);
                              const isMultiple = sameTypeDocs.length > 1;
                              const isLatest = sameTypeIndex === sameTypeDocs.length - 1;

                              return (
                                <div key={docIdx} className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${isMultiple && isLatest ? 'bg-amber-50/70 border-amber-300' : 'bg-white border-slate-200 hover:bg-slate-50'}`}>
                                  <div className="flex items-center gap-2">
                                    <FileText className={`w-4 h-4 ${isMultiple && isLatest ? 'text-amber-600' : 'text-blue-500'}`} />
                                    <div>
                                      <div className="flex items-center gap-1.5 flex-wrap">
                                        <p className="font-medium text-slate-800 text-xs uppercase">{getDocTitle(doc.docType)}</p>
                                        {isMultiple && (
                                          <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded border ${isLatest ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                                            {isLatest ? '🆕 Berkas Sanggahan Baru' : `📁 Berkas Lama (#${sameTypeIndex + 1})`}
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-[10px] text-slate-500">{doc.originalName}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500 font-mono">Terverifikasi</span>
                                    <button
                                      onClick={() => handleViewDocument(applicantDetail.user?.id || selectedApplicant?.id, doc.id)}
                                      className="px-2 py-1 text-[10px] font-bold bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors flex items-center gap-1"
                                    >
                                      <ExternalLink className="w-3 h-3" /> Lihat
                                    </button>
                                  </div>
                                </div>
                              );
                            });
                          })()}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic p-3 bg-slate-50 rounded-lg border border-dashed border-slate-200 text-center">
                          Belum ada dokumen yang diunggah.
                        </p>
                      )}
                    </div>
                  </>
                ) : null}
              </div>

              {/* Modal Footer */}
              <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                <button
                  onClick={() => window.print()}
                  className="px-5 py-2.5 bg-slate-800 text-white font-normal rounded-xl hover:bg-slate-900 transition-colors flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" /> Cetak Formulir
                </button>
                <button
                  onClick={() => { setSelectedApplicant(null); setApplicantDetail(null); }}
                  className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Printable CV - Only visible during print */}
      {applicantDetail && (
        <div className="hidden print:block p-8 font-sans text-black max-w-4xl mx-auto bg-white min-h-screen">
          <div className="text-center mb-8 border-b-4 border-black pb-6">
            <h1 className="text-2xl font-black uppercase tracking-wider mb-2">Formulir Pendaftaran Beasiswa Sultra Cerdas 2026</h1>
            <p className="text-lg">Nomor Registrasi: <span className="font-bold font-mono px-3 py-1 bg-gray-100 border border-black inline-block ml-2">{applicantDetail.application?.registrationNo || '-'}</span></p>
          </div>

          <div className="space-y-6 text-sm">
            <section>
              <h2 className="font-bold text-lg border-b-2 border-black mb-3 uppercase bg-gray-100 px-2 py-1">1. Data Diri & Kependudukan</h2>
              <table className="w-full text-left border-collapse">
                <tbody>
                  <tr><td className="w-1/3 py-1.5 font-semibold">Nama Lengkap</td><td>: {applicantDetail.user?.namaLengkap}</td></tr>
                  <tr><td className="w-1/3 py-1.5 font-semibold">NIK</td><td>: {applicantDetail.user?.nik}</td></tr>
                  <tr><td className="w-1/3 py-1.5 font-semibold">No. KK</td><td>: {applicantDetail.profile?.noKk || '-'}</td></tr>
                  <tr><td className="w-1/3 py-1.5 font-semibold">Tempat, Tanggal Lahir</td><td>: {applicantDetail.profile?.tempatLahir || '-'}, {applicantDetail.profile?.tanggalLahir ? applicantDetail.profile.tanggalLahir.split('T')[0] : '-'}</td></tr>
                  <tr><td className="w-1/3 py-1.5 font-semibold">Jenis Kelamin</td><td>: {applicantDetail.profile?.gender || '-'}</td></tr>
                  <tr><td className="w-1/3 py-1.5 font-semibold">Alamat KTP</td><td>: {applicantDetail.profile?.alamatKtp || '-'}</td></tr>
                  <tr><td className="w-1/3 py-1.5 font-semibold">Alamat Domisili</td><td>: {applicantDetail.profile?.alamatDomisili || '-'}</td></tr>
                  <tr><td className="w-1/3 py-1.5 font-semibold">No. Handphone (WA)</td><td>: {applicantDetail.profile?.noHp || '-'}</td></tr>
                  <tr><td className="w-1/3 py-1.5 font-semibold">Email</td><td>: {applicantDetail.user?.email || '-'}</td></tr>
                </tbody>
              </table>
            </section>

            <section>
              <h2 className="font-bold text-lg border-b-2 border-black mb-3 uppercase bg-gray-100 px-2 py-1">2. Data Akademik</h2>
              <table className="w-full text-left border-collapse">
                <tbody>
                  <tr><td className="w-1/3 py-1.5 font-semibold">Jenjang Beasiswa</td><td>: {applicantDetail.user?.jenjangTarget}</td></tr>
                  <tr><td className="w-1/3 py-1.5 font-semibold">Perguruan Tinggi</td><td>: {getOngoingEducation(applicantDetail).institusi}</td></tr>
                  <tr><td className="w-1/3 py-1.5 font-semibold">Fakultas / Program Studi</td><td>: {getOngoingEducation(applicantDetail).jurusan}</td></tr>
                  <tr><td className="w-1/3 py-1.5 font-semibold">Akreditasi Prodi</td><td>: {applicantDetail.profile?.akreditasiProdi || '-'}</td></tr>
                  <tr><td className="w-1/3 py-1.5 font-semibold">NIM</td><td>: {applicantDetail.profile?.nim || '-'}</td></tr>
                  <tr><td className="w-1/3 py-1.5 font-semibold">Semester</td><td>: {applicantDetail.profile?.semester || '-'}</td></tr>
                  <tr><td className="w-1/3 py-1.5 font-semibold">IPK Kumulatif</td><td>: {applicantDetail.profile?.ipk || '-'}</td></tr>
                  <tr><td className="w-1/3 py-1.5 font-semibold">Target Tahun Lulus</td><td>: {applicantDetail.profile?.targetLulus || '-'}</td></tr>
                  <tr><td className="w-1/3 py-1.5 font-semibold">Beasiswa Lain</td><td>: {applicantDetail.profile?.beasiswaLain || '-'}</td></tr>
                </tbody>
              </table>
            </section>

            <section>
              <h2 className="font-bold text-lg border-b-2 border-black mb-3 uppercase bg-gray-100 px-2 py-1">3. Data Keluarga & Ekonomi</h2>
              <table className="w-full text-left border-collapse">
                <tbody>
                  <tr><td className="w-1/3 py-1.5 font-semibold">Nama Ayah</td><td>: {applicantDetail.profile?.namaAyah || '-'}</td></tr>
                  <tr><td className="w-1/3 py-1.5 font-semibold">Pekerjaan Ayah</td><td>: {applicantDetail.profile?.pekerjaanAyah || '-'}</td></tr>
                  <tr><td className="w-1/3 py-1.5 font-semibold">Nama Ibu</td><td>: {applicantDetail.profile?.namaIbu || '-'}</td></tr>
                  <tr><td className="w-1/3 py-1.5 font-semibold">Pekerjaan Ibu</td><td>: {applicantDetail.profile?.pekerjaanIbu || '-'}</td></tr>
                  <tr><td className="w-1/3 py-1.5 font-semibold">Rata-rata Penghasilan</td><td>: {applicantDetail.profile?.penghasilanOrtu || '-'}</td></tr>
                  <tr><td className="w-1/3 py-1.5 font-semibold">Jumlah Tanggungan</td><td>: {applicantDetail.profile?.jumlahTanggungan || '-'}</td></tr>
                  <tr><td className="w-1/3 py-1.5 font-semibold">Kepemilikan Bantuan</td><td>: {applicantDetail.profile?.kepemilikanBantuan || '-'}</td></tr>
                </tbody>
              </table>
            </section>

            <section>
              <h2 className="font-bold text-lg border-b-2 border-black mb-3 uppercase bg-gray-100 px-2 py-1">4. Riwayat & Prestasi</h2>
              <table className="w-full text-left border-collapse">
                <tbody>
                  <tr><td className="w-1/3 py-1.5 font-semibold">Prestasi Akademik</td><td>{renderAchievementDetails(applicantDetail.profile?.prestasiAkademik)}</td></tr>
                  <tr><td className="w-1/3 py-1.5 font-semibold">Prestasi Non-Akademik</td><td>{renderAchievementDetails(applicantDetail.profile?.prestasiNonAkademik)}</td></tr>
                  <tr><td className="w-1/3 py-1.5 font-semibold">Pengalaman Organisasi</td><td>{renderAchievementDetails(applicantDetail.profile?.pengalamanOrganisasi)}</td></tr>
                  <tr><td className="w-1/3 py-1.5 font-semibold">Pelatihan/Sertifikasi</td><td>{renderAchievementDetails(applicantDetail.profile?.pelatihanSertifikasi)}</td></tr>
                </tbody>
              </table>
            </section>

            <section className="mt-8 p-4 border-2 border-black text-xs text-justify">
              <p><strong>PERNYATAAN:</strong> Saya yang bertanda tangan di bawah ini menyatakan dengan sesungguhnya bahwa seluruh data dan dokumen yang terlampir pada pendaftaran ini adalah <strong>BENAR, SAH, dan DAPAT DIPERTANGGUNGJAWABKAN</strong>. Apabila di kemudian hari terbukti memberikan data fiktif atau menerima pendanaan ganda (double funding), saya bersedia menerima sanksi pembatalan status penerima beasiswa dan wajib mengembalikan seluruh dana beasiswa yang telah diterima ke Kas Daerah Pemerintah Provinsi Sulawesi Tenggara.</p>
            </section>

            <div className="mt-12 flex justify-end">
              <div className="text-center w-64">
                <p>Pendaftar Beasiswa,</p>
                <p className="mt-20 border-b-2 border-black font-bold uppercase">{applicantDetail.user?.namaLengkap}</p>
                <p className="mt-1">NIK. {applicantDetail.user?.nik}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
