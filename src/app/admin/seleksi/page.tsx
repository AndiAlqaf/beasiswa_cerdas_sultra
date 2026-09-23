'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Clock, FileText, ExternalLink, Search, X, Loader2, AlertCircle, Printer } from 'lucide-react';
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

export default function SeleksiPage() {
  const [selectedApplicant, setSelectedApplicant] = useState<any>(null);
  const [applicantDetail, setApplicantDetail] = useState<any>(null);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);
  const [applicants, setApplicants] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [jenjangFilter, setJenjangFilter] = useState<string>('');

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

  const loadApplicants = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (searchTerm.trim()) params.set('search', searchTerm.trim());
      if (jenjangFilter) params.set('jenjang', jenjangFilter);

      const res = await fetchAPI(`/admin/applicants?${params.toString()}`);
      if (res.success && res.data) {
        setApplicants(res.data.applicants || []);
      }
    } catch (err: any) {
      setError(err.message || 'Gagal memuat data seleksi pendaftar.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplicants();
  }, [jenjangFilter]);

  const handleOpenDetail = async (applicant: any) => {
    setSelectedApplicant(applicant);
    setLoadingDetail(true);
    setApplicantDetail(null);
    try {
      const res = await fetchAPI(`/admin/applicants/${applicant.userId || applicant.id}`);
      if (res.success && res.data) {
        setApplicantDetail(res.data);
      }
    } catch (err: any) {
      alert(err.message || 'Gagal memuat detail berkas pendaftar.');
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadApplicants();
  };

  return (
    <div className="relative">
      <div className="space-y-6 print:hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Verifikasi & Seleksi</h2>
          <p className="text-slate-500">Verifikasi kelengkapan berkas dan tentukan kelulusan pendaftar real.</p>
        </div>
        
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <select 
            value={jenjangFilter}
            onChange={(e) => setJenjangFilter(e.target.value)}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm w-full sm:w-auto"
          >
            <option value="">Semua Jenjang</option>
            <option value="S1">S1 / D4</option>
            <option value="S2">S2</option>
            <option value="S3">S3</option>
          </select>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari pendaftar..." 
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm w-full sm:w-64"
            />
          </div>
        </form>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 text-sm">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="p-4 whitespace-nowrap">No. Registrasi</th>
                <th className="p-4 whitespace-nowrap">Nama & Email</th>
                <th className="p-4 whitespace-nowrap">NIK</th>
                <th className="p-4 whitespace-nowrap">Tanggal Submit</th>
                <th className="p-4 text-center whitespace-nowrap">Status Verifikasi</th>
                <th className="p-4 text-center whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-900 mb-2" />
                    Memuat daftar verifikasi pendaftar...
                  </td>
                </tr>
              ) : applicants.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    Belum ada pendaftar yang tersedia untuk verifikasi.
                  </td>
                </tr>
              ) : (
                applicants.map((applicant, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 align-middle">
                      <span className="text-xs font-mono font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">{applicant.registrationNo}</span>
                      <div className="mt-2">
                        <span className="text-[10px] font-bold text-[#0B3A6A] bg-blue-100 px-2 py-0.5 rounded-md border border-blue-200">Jenjang {applicant.jenjangTarget}</span>
                      </div>
                    </td>
                    <td className="p-4 align-middle">
                      <p className="font-bold text-slate-900 whitespace-nowrap">{applicant.namaLengkap}</p>
                      <p className="text-xs text-slate-500 mt-0.5 whitespace-nowrap">{applicant.email}</p>
                    </td>
                    <td className="p-4 align-middle text-xs font-mono text-slate-600">
                      {applicant.nik}
                    </td>
                    <td className="p-4 align-middle text-xs text-slate-500">
                      {applicant.submittedAt ? new Date(applicant.submittedAt).toLocaleDateString('id-ID') : '-'}
                    </td>
                    <td className="p-4 align-middle text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        applicant.status === 'DITERIMA' ? 'bg-emerald-100 text-emerald-700' :
                        applicant.status === 'DITOLAK' ? 'bg-rose-100 text-rose-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {applicant.status}
                      </span>
                    </td>
                    <td className="p-4 align-middle text-center">
                      <button 
                        onClick={() => handleOpenDetail(applicant)}
                        className="px-3 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-bold border border-blue-200 mx-auto" 
                        title="Lihat Detail Berkas"
                      >
                        <ExternalLink className="w-4 h-4" /> Verifikasi Berkas
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Detail Berkas Pendaftar */}
      {selectedApplicant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Detail Berkas Pendaftar</h3>
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
                  Mengambil data & berkas pendaftar...
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

                  {/* Documents List */}
                  <div>
                    <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-slate-500" />
                      Daftar Berkas Unggahan Real
                    </h4>
                    {applicantDetail.documents && applicantDetail.documents.length > 0 ? (
                      <div className="space-y-3">
                        {applicantDetail.documents.map((doc: any, docIdx: number) => (
                          <div key={docIdx} className="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-blue-200 hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-3">
                              <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
                              <div>
                                <p className="font-medium text-slate-800 uppercase">{getDocTitle(doc.docType)}</p>
                                <p className="text-xs text-slate-500 mt-0.5">{doc.originalName} ({Math.round(doc.fileSize / 1024)} KB)</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-xs bg-slate-100 px-3 py-1 rounded text-slate-600 font-mono">Terverifikasi Sistem</span>
                              <button 
                                onClick={() => handleViewDocument(applicantDetail.user?.id || selectedApplicant?.userId, doc.id)}
                                className="px-3 py-1.5 text-xs font-bold bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-1"
                              >
                                <ExternalLink className="w-3.5 h-3.5" /> Lihat
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center">
                        Belum ada dokumen fisik yang diunggah pendaftar ini.
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
                className="px-5 py-2.5 bg-slate-800 text-white font-medium rounded-xl hover:bg-slate-900 transition-colors flex items-center gap-2 mr-auto"
              >
                <Printer className="w-4 h-4" /> Cetak Formulir
              </button>
              <button 
                onClick={() => { setSelectedApplicant(null); setApplicantDetail(null); }}
                className="px-5 py-2.5 bg-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-300 transition-colors"
              >
                Tutup
              </button>
              <button 
                onClick={async () => {
                  if (!selectedApplicant) return;
                  try {
                    const id = selectedApplicant.userId || selectedApplicant.id;
                    await fetchAPI(`/admin/applicants/${id}/verify`, {
                      method: 'PATCH',
                      body: JSON.stringify({ status: 'DITOLAK', notes: 'Berkas belum memenuhi kualifikasi administrasi.' }),
                    });
                    alert('Status berhasil diubah menjadi DITOLAK.');
                    setSelectedApplicant(null);
                    setApplicantDetail(null);
                    loadApplicants();
                  } catch (err: any) {
                    alert(err.message || 'Gagal mengubah status.');
                  }
                }}
                className="px-5 py-2.5 bg-rose-100 text-rose-700 font-medium rounded-xl hover:bg-rose-200 transition-colors flex items-center gap-2 shadow-sm"
              >
                <XCircle className="w-4 h-4" /> Tolak
              </button>
              <button 
                onClick={async () => {
                  if (!selectedApplicant) return;
                  try {
                    const id = selectedApplicant.userId || selectedApplicant.id;
                    await fetchAPI(`/admin/applicants/${id}/verify`, {
                      method: 'PATCH',
                      body: JSON.stringify({ status: 'DITERIMA', notes: 'Berkas lengkap dan dinyatakan lolos verifikasi.' }),
                    });
                    alert('Status berhasil diubah menjadi DITERIMA.');
                    setSelectedApplicant(null);
                    setApplicantDetail(null);
                    loadApplicants();
                  } catch (err: any) {
                    alert(err.message || 'Gagal mengubah status.');
                  }
                }}
                className="px-5 py-2.5 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-colors flex items-center gap-2 shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4" /> Loloskan
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
