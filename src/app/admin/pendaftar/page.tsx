'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, Eye, Edit, Trash2, Loader2, AlertCircle, X, FileText, Printer, ExternalLink } from 'lucide-react';
import { fetchAPI } from '@/lib/api';

const getDocTitle = (key: string) => {
  const map: Record<string, string> = {
    fileSuratPermohonan: 'Surat Permohonan',
    filePasfoto: 'Pasfoto / Selfie',
    fileKtp: 'KTP',
    fileSuratAktif: 'Surat Aktif Kuliah / KTM',
    fileTranskrip: 'Transkrip Nilai Sementara',
    fileDtks: 'Surat Keterangan (DTKS / Ijazah)',
    fileSuratPernyataan: 'Surat Pernyataan',
    fileMotivationOrEsai: 'Motivation Letter / Esai',
    selfie: 'Selfie Profil',
    ktm: 'KTM',
    pendukung: 'Berkas Pendukung',
  };
  return map[key] || key;
};

export default function PendaftarPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [jenjangFilter, setJenjangFilter] = useState('');

  const handleViewDocument = async (userId: string, docId: string) => {
    try {
      const token = localStorage.getItem('bssc_access_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/admin/applicants/${userId}/documents/${docId}/view`, {
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

  const handleExport = () => {
    const headers = ['No. Registrasi', 'Nama', 'Email', 'NIK', 'Jenjang', 'Status', 'Tanggal'];
    const csvContent = [
      headers.join(','),
      ...applicants.map((u: any) => `"${u.registrationNo}","${u.namaLengkap}","${u.email}","${u.nik}","${u.jenjangTarget}","${u.status}","${u.submittedAt}"`)
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `data_pendaftar_${jenjangFilter || 'semua'}_${statusFilter || 'semua'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="relative">
      <div className="space-y-6 print:hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Data Pendaftar</h2>
          <p className="text-slate-500">Kelola dan pantau seluruh data pendaftar beasiswa.</p>
        </div>
        <button onClick={handleExport} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors shadow-sm">
          <Download className="w-4 h-4" />
          Export Data ({applicants.length})
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
              <option value="Lolos">Lolos</option>
              <option value="Menunggu">Menunggu</option>
              <option value="Ditolak">Ditolak</option>
            </select>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 text-blue-700 rounded-xl text-sm font-semibold hover:bg-blue-100 transition-colors">
              <Filter className="w-4 h-4" />
              Terapkan
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
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
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-900 mb-2" />
                    Memuat data pendaftar...
                  </td>
                </tr>
              ) : applicants.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    Tidak ada pendaftar yang sesuai dengan kriteria filter.
                  </td>
                </tr>
              ) : (
                applicants.map((user, idx) => (
                  <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="p-4 text-slate-600 font-mono text-xs">{user.registrationNo}</td>
                    <td className="p-4">
                      <p className="font-bold text-slate-900">{user.namaLengkap}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{user.email}</p>
                    </td>
                    <td className="p-4 text-slate-600">NIK: {user.nik}</td>
                    <td className="p-4">
                      <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md text-xs font-bold border border-slate-200 whitespace-nowrap">{user.jenjangTarget}</span>
                    </td>
                    <td className="p-4 text-slate-900 font-semibold">-</td>
                    <td className="p-4 text-slate-500 text-xs">
                      {user.submittedAt ? new Date(user.submittedAt).toLocaleDateString('id-ID') : '-'}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        user.status === 'DITERIMA' ? 'bg-emerald-100 text-emerald-700' :
                        user.status === 'DITOLAK' ? 'bg-rose-100 text-rose-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => handleOpenDetail(user)}
                          className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors" 
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
              className="px-3 py-1 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50"
            >
              Sebelumnya
            </button>
            <button
              disabled={page >= (pagination?.totalPages || 1)}
              onClick={() => setPage(p => p + 1)}
              className="px-3 py-1 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50"
            >
              Selanjutnya
            </button>
          </div>
        </div>
      </div>

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
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        selectedApplicant.status === 'DITERIMA' ? 'bg-emerald-100 text-emerald-700' :
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
                        {applicantDetail.documents.map((doc: any, docIdx: number) => (
                          <div key={docIdx} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-white">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-blue-500" />
                              <div>
                                <p className="font-medium text-slate-800 text-xs uppercase">{getDocTitle(doc.docType)}</p>
                                <p className="text-[10px] text-slate-500">{doc.originalName}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500 font-mono">Terverifikasi Sistem</span>
                              <button 
                                onClick={() => handleViewDocument(applicantDetail.user?.id || selectedApplicant?.id, doc.id)}
                                className="px-2 py-1 text-[10px] font-bold bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors flex items-center gap-1"
                              >
                                <ExternalLink className="w-3 h-3" /> Lihat
                              </button>
                            </div>
                          </div>
                        ))}
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
                  {/* Note: since admin API may not return complete academic details mapped clearly if it wasn't entered, we do our best with what we have. Education table has S1 entry etc. */}
                  {applicantDetail.education && applicantDetail.education.length > 0 ? (
                    <>
                      <tr><td className="w-1/3 py-1.5 font-semibold">Perguruan Tinggi</td><td>: {applicantDetail.education[0].institusi || '-'}</td></tr>
                      <tr><td className="w-1/3 py-1.5 font-semibold">Fakultas / Program Studi</td><td>: {applicantDetail.education[0].jurusan || '-'}</td></tr>
                    </>
                  ) : (
                     <>
                      <tr><td className="w-1/3 py-1.5 font-semibold">Perguruan Tinggi</td><td>: -</td></tr>
                      <tr><td className="w-1/3 py-1.5 font-semibold">Fakultas / Program Studi</td><td>: -</td></tr>
                     </>
                  )}
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
                  <tr><td className="w-1/3 py-1.5 font-semibold">Prestasi Akademik</td><td>: {applicantDetail.profile?.prestasiAkademik || '-'}</td></tr>
                  <tr><td className="w-1/3 py-1.5 font-semibold">Prestasi Non-Akademik</td><td>: {applicantDetail.profile?.prestasiNonAkademik || '-'}</td></tr>
                  <tr><td className="w-1/3 py-1.5 font-semibold">Pengalaman Organisasi</td><td>: {applicantDetail.profile?.pengalamanOrganisasi || '-'}</td></tr>
                  <tr><td className="w-1/3 py-1.5 font-semibold">Pelatihan/Sertifikasi</td><td>: {applicantDetail.profile?.pelatihanSertifikasi || '-'}</td></tr>
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
