'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Clock, FileText, ExternalLink, Search, X, Loader2, AlertCircle, Printer, RefreshCw } from 'lucide-react';
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

export default function SeleksiPage() {
  const [selectedApplicant, setSelectedApplicant] = useState<any>(null);
  const [applicantDetail, setApplicantDetail] = useState<any>(null);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);
  const [applicants, setApplicants] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [jenjangFilter, setJenjangFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  // Custom Toast/Notification Modal State
  const [toast, setToast] = useState<{
    title?: string;
    message: string;
    type: 'success' | 'error' | 'warning';
  } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' | 'warning' = 'success', title?: string) => {
    setToast({
      title: title || (type === 'success' ? 'Berhasil!' : type === 'error' ? 'Terjadi Kesalahan' : 'Pemberitahuan'),
      message,
      type,
    });
  };

  // Rejection Modal State
  const [showRejectModal, setShowRejectModal] = useState<boolean>(false);
  const [rejectReason, setRejectReason] = useState<string>('');
  const [submittingReject, setSubmittingReject] = useState<boolean>(false);

  const REJECTION_TEMPLATES = [
    'Transkrip Nilai buram, terpotong, atau tidak terbaca dengan jelas.',
    'Surat Keterangan Aktif Kuliah / KTM tidak valid atau belum disahkan pejabat berwenang.',
    'IPK Kumulatif yang diinput tidak sesuai dengan transkrip nilai resmi.',
    'Dokumen Kartu Tanda Penduduk (KTP) / KK tidak sesuai dengan domisili Sultra.',
    'Dokumen persyaratan utama (Surat Pernyataan / Esai) tidak dilampirkan.',
  ];

  const formatAsalDaerah = (asal: string) => {
    if (!asal) return '-';
    return asal.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
  };

  const handleToggleTemplate = (tmpl: string) => {
    if (!rejectReason) {
      setRejectReason(`- ${tmpl}`);
      return;
    }

    if (rejectReason.includes(tmpl)) {
      const lines = rejectReason.split('\n').filter(line => !line.includes(tmpl));
      setRejectReason(lines.join('\n').trim());
    } else {
      const trimmed = rejectReason.trim();
      if (!trimmed.startsWith('- ') && !trimmed.includes('\n- ')) {
        setRejectReason(`- ${trimmed}\n- ${tmpl}`);
      } else {
        setRejectReason(`${trimmed}\n- ${tmpl}`);
      }
    }
  };

  const handleOpenRejectModal = () => {
    setRejectReason('');
    setShowRejectModal(true);
  };

  const handleConfirmReject = async () => {
    if (!selectedApplicant) return;
    if (!rejectReason.trim()) {
      showNotification('Harap tuliskan alasan penolakan terlebih dahulu agar pendaftar dapat mengetahuinya.', 'warning', 'Alasan Diperlukan');
      return;
    }

    setSubmittingReject(true);
    try {
      const id = selectedApplicant.userId || selectedApplicant.id;
      await fetchAPI(`/admin/applicants/${id}/verify`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: 'DITOLAK',
          notes: rejectReason.trim(),
        }),
      });

      setShowRejectModal(false);
      setSelectedApplicant(null);
      setApplicantDetail(null);
      loadApplicants();
      showNotification('Status pendaftar berhasil diubah menjadi DITOLAK.', 'success', 'Status Berhasil Diubah');
    } catch (err: any) {
      showNotification(err.message || 'Gagal mengubah status pendaftaran.', 'error', 'Gagal Update Status');
    } finally {
      setSubmittingReject(false);
    }
  };

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
      showNotification(err.message || 'Gagal membuka dokumen.', 'error', 'Gagal Membuka Dokumen');
    }
  };

  const loadApplicants = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (searchTerm.trim()) params.set('search', searchTerm.trim());
      if (jenjangFilter) params.set('jenjang', jenjangFilter);
      if (statusFilter) params.set('status', statusFilter);

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
  }, [jenjangFilter, statusFilter]);

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
      showNotification(err.message || 'Gagal memuat detail berkas pendaftar.', 'error', 'Gagal Memuat Detail');
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
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm w-full sm:w-auto"
          >
            <option value="">Semua Status</option>
            <option value="TERKIRIM">Menunggu Verifikasi (TERKIRIM)</option>
            <option value="VERIFIKASI_BERKAS">Proses Verifikasi (VERIFIKASI)</option>
            <option value="SELEKSI_ADMINISTRASI">Seleksi Administrasi</option>
            <option value="DITERIMA">Lolos Seleksi (DITERIMA)</option>
            <option value="DITOLAK">Ditolak (DITOLAK)</option>
          </select>
          <select 
            value={jenjangFilter}
            onChange={(e) => setJenjangFilter(e.target.value)}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm w-full sm:w-auto"
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
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-normal text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm w-full sm:w-64"
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
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Detail & Verifikasi Berkas Pendaftar</h3>
                <p className="text-sm text-slate-500 mt-1">No. Registrasi: <span className="font-mono font-bold text-slate-800">{selectedApplicant.registrationNo}</span></p>
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
                  {/* Applicant Info Header */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-blue-50/60 rounded-2xl border border-blue-100">
                    <div className="flex-1">
                      <h4 className="font-extrabold text-slate-900 text-lg">{applicantDetail.user?.namaLengkap}</h4>
                      <p className="text-xs text-slate-600 mt-0.5">NIK: <strong>{applicantDetail.user?.nik}</strong> • Email: <strong>{applicantDetail.user?.email}</strong></p>
                      <p className="text-xs text-slate-500 mt-1">Jenjang Target: <strong className="text-blue-900">{applicantDetail.user?.jenjangTarget}</strong></p>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-extrabold shadow-xs ${
                        (applicantDetail.application?.status || selectedApplicant.status) === 'DITERIMA' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                        (applicantDetail.application?.status || selectedApplicant.status) === 'DITOLAK' ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                        'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}>
                        {applicantDetail.application?.status || selectedApplicant.status}
                      </span>
                    </div>
                  </div>

                  {/* Pengajuan Sanggahan Notice Box (If any) */}
                  {applicantDetail.application?.notes && applicantDetail.application.notes.includes('[SANGGAHAN') && (
                    <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl space-y-2">
                      <div className="flex items-center gap-2 text-amber-900 font-extrabold text-xs">
                        <RefreshCw className="w-4 h-4 text-amber-700 animate-spin" />
                        <span>Catatan Sanggahan & Perbaikan Berkas Mahasiswa</span>
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-amber-200 text-xs text-slate-900 leading-relaxed font-medium whitespace-pre-line">
                        {applicantDetail.application.notes}
                      </div>
                    </div>
                  )}

                  {/* Highlights Card: IPK & Perguruan Tinggi */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-4 bg-amber-50/80 rounded-2xl border border-amber-200 flex items-center justify-between">
                      <div>
                        <p className="text-[11px] font-bold text-amber-900 uppercase tracking-wider">IPK Kumulatif Terakhir</p>
                        <p className="text-xs text-amber-700 mt-0.5">Sesuai Isian Formulir</p>
                      </div>
                      <span className="text-2xl font-black bg-amber-500 text-white px-3.5 py-1 rounded-xl shadow-xs">
                        {applicantDetail.profile?.ipk || '-'}
                      </span>
                    </div>

                    <div className="p-4 bg-blue-50/80 rounded-2xl border border-blue-200 flex flex-col justify-between">
                      <p className="text-[11px] font-bold text-blue-900 uppercase tracking-wider">Perguruan Tinggi & Prodi</p>
                      <p className="text-xs font-bold text-slate-900 mt-1 truncate">
                        {getOngoingEducation(applicantDetail).institusi}
                      </p>
                      <p className="text-[11px] text-slate-600 truncate">
                        {getOngoingEducation(applicantDetail).jurusan} (Akreditasi: {applicantDetail.profile?.akreditasiProdi || '-'})
                      </p>
                    </div>
                  </div>

                  {/* Complete Form Rincian Accordion / Sections */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 text-xs text-slate-800">
                    <h5 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider border-b border-slate-200 pb-2 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-blue-900" /> Rincian Isian Formulir Mahasiswa
                    </h5>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-[11px]">
                      <p>• Tempat/Tgl Lahir: <strong>{applicantDetail.profile?.tempatLahir || '-'}, {applicantDetail.profile?.tanggalLahir ? applicantDetail.profile.tanggalLahir.split('T')[0] : '-'}</strong></p>
                      <p>• Gender / No HP: <strong>{applicantDetail.profile?.gender || '-'} | {applicantDetail.profile?.noHp || '-'}</strong></p>
                      <p>• NIM / Semester: <strong>{applicantDetail.profile?.nim || '-'} (Semester {applicantDetail.profile?.semester || '-'})</strong></p>
                      <p>• Target Tahun Lulus: <strong>{applicantDetail.profile?.targetLulus || '-'}</strong></p>
                      <p>• Status Double Funding: <strong>{applicantDetail.profile?.beasiswaLain || 'Tidak Ada (Bukan Double Funding)'}</strong></p>
                      <p>• No. KK / Alamat KTP: <strong>{applicantDetail.profile?.noKk || '-'} | {applicantDetail.profile?.alamatKtp || '-'}</strong></p>
                      <p>• Nama Ortu (Ayah/Ibu): <strong>{applicantDetail.profile?.namaAyah || '-'} / {applicantDetail.profile?.namaIbu || '-'}</strong></p>
                      <p>• Pekerjaan Ortu: <strong>{applicantDetail.profile?.pekerjaanAyah || '-'} / {applicantDetail.profile?.pekerjaanIbu || '-'}</strong></p>
                      <p>• Penghasilan / Tanggungan: <strong>{applicantDetail.profile?.penghasilanOrtu || '-'} ({applicantDetail.profile?.jumlahTanggungan || 0} orang)</strong></p>
                      <p className="col-span-1 sm:col-span-2 text-blue-900 font-bold bg-blue-50 p-2 rounded-lg border border-blue-100 mt-1">
                        💳 Rekening Bank Penyaluran 50%: <strong>{applicantDetail.profile?.namaBank || '-'}</strong> | No. Rek: <strong className="font-mono">{applicantDetail.profile?.noRekening || '-'}</strong> | a.n: <strong>{applicantDetail.profile?.namaRekening || '-'}</strong>
                      </p>
                    </div>

                    {(applicantDetail.profile?.prestasiAkademik || applicantDetail.profile?.prestasiNonAkademik) && (
                      <div className="pt-2 border-t border-slate-200 space-y-1.5 text-[11px]">
                        {applicantDetail.profile?.prestasiAkademik && (
                          <div>
                            <span className="font-bold text-slate-900">Prestasi Akademik:</span>
                            {renderAchievementDetails(applicantDetail.profile.prestasiAkademik)}
                          </div>
                        )}
                        {applicantDetail.profile?.prestasiNonAkademik && (
                          <div>
                            <span className="font-bold text-slate-900">Prestasi Non-Akademik:</span>
                            {renderAchievementDetails(applicantDetail.profile.prestasiNonAkademik)}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Documents List */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-extrabold text-slate-900 flex items-center gap-2 text-sm">
                        <FileText className="w-4 h-4 text-blue-900" />
                        Daftar Berkas Unggahan Mahasiswa
                      </h4>
                      <span className="text-[11px] text-slate-500 italic">
                        Bandingkan Berkas Lama vs Berkas Baru
                      </span>
                    </div>

                    {applicantDetail.documents && applicantDetail.documents.length > 0 ? (
                      <div className="space-y-3">
                        {(() => {
                          const hasSanggahanNote = applicantDetail.application?.notes?.toLowerCase().includes('sanggah') || applicantDetail.application?.status === 'DITOLAK';
                          const hasMultipleDocs = applicantDetail.documents.some((d: any) => 
                            applicantDetail.documents.filter((x: any) => (x.docType || '').toLowerCase() === (d.docType || '').toLowerCase()).length > 1
                          );
                          const isAppeal = hasSanggahanNote || hasMultipleDocs;
                          
                          // If not appeal/multiple, filter to only show latest document of each docType
                          let docsToRender = applicantDetail.documents;
                          if (!isAppeal) {
                            const latestDocsMap = new Map();
                            applicantDetail.documents.forEach((d: any) => {
                              const key = (d.docType || '').toLowerCase();
                              latestDocsMap.set(key, d); // over-writes with later uploads
                            });
                            docsToRender = Array.from(latestDocsMap.values());
                          }

                          return docsToRender.map((doc: any, docIdx: number) => {
                            const sameTypeDocs = applicantDetail.documents.filter((d: any) => (d.docType || '').toLowerCase() === (doc.docType || '').toLowerCase());
                            const sameTypeIndex = sameTypeDocs.findIndex((d: any) => d.id === doc.id);
                            const isMultiple = sameTypeDocs.length > 1;
                            const isLatest = sameTypeIndex === sameTypeDocs.length - 1;

                            return (
                              <div key={docIdx} className={`flex items-center justify-between p-3.5 rounded-xl border transition-colors ${isMultiple && isLatest ? 'bg-amber-50/70 border-amber-300' : 'bg-white border-slate-200 hover:bg-slate-50'}`}>
                                <div className="flex items-center gap-3">
                                  <CheckCircle2 className={`w-5 h-5 shrink-0 ${isMultiple && isLatest ? 'text-amber-600' : 'text-emerald-500'}`} />
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <p className="font-bold text-slate-800 uppercase text-xs">{getDocTitle(doc.docType)}</p>
                                      {isMultiple && (
                                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${isLatest ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                                          {isLatest ? '🆕 Berkas Sanggahan Baru' : `📁 Berkas Lama (#${sameTypeIndex + 1})`}
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[11px] text-slate-500 mt-0.5">{doc.originalName} ({Math.round(doc.fileSize / 1024)} KB) • {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleString('id-ID') : 'Terverifikasi'}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button 
                                    onClick={() => handleViewDocument(applicantDetail.user?.id || selectedApplicant?.userId, doc.id)}
                                    className="px-3 py-1.5 text-xs font-bold bg-blue-100 text-blue-800 hover:bg-blue-200 rounded-lg transition-colors flex items-center gap-1 border border-blue-200"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" /> Lihat Dokumen
                                  </button>
                                </div>
                              </div>
                            );
                          });
                        })()}
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
            {(() => {
              const currentStatus = applicantDetail?.application?.status || selectedApplicant?.status;
              const isStatusLocked = currentStatus === 'DITERIMA' || currentStatus === 'DITOLAK';

              return (
                <div className="p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
                  <button 
                    onClick={() => window.print()}
                    className="px-5 py-2.5 bg-slate-800 text-white font-normal rounded-xl hover:bg-slate-900 transition-colors flex items-center gap-2 mr-auto text-xs"
                  >
                    <Printer className="w-4 h-4" /> Cetak Formulir
                  </button>
                  <button 
                    onClick={() => { setSelectedApplicant(null); setApplicantDetail(null); }}
                    className="px-5 py-2.5 bg-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-300 transition-colors text-xs"
                  >
                    Tutup
                  </button>
                  <button 
                    type="button"
                    disabled={isStatusLocked}
                    onClick={handleOpenRejectModal}
                    className="px-5 py-2.5 bg-rose-100 text-rose-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed font-extrabold rounded-xl hover:bg-rose-200 transition-colors flex items-center gap-2 shadow-sm text-xs"
                  >
                    <XCircle className="w-4 h-4" /> Tolak
                  </button>
                  <button 
                    disabled={isStatusLocked}
                    onClick={async () => {
                      if (!selectedApplicant) return;
                      try {
                        const id = selectedApplicant.userId || selectedApplicant.id;
                        await fetchAPI(`/admin/applicants/${id}/verify`, {
                          method: 'PATCH',
                          body: JSON.stringify({ status: 'DITERIMA', notes: 'Berkas lengkap dan dinyatakan lolos verifikasi.' }),
                        });
                        setSelectedApplicant(null);
                        setApplicantDetail(null);
                        loadApplicants();
                        showNotification('Status pendaftar berhasil diubah menjadi DITERIMA!', 'success', 'Status Berhasil Diubah');
                      } catch (err: any) {
                        showNotification(err.message || 'Gagal mengubah status.', 'error', 'Gagal Update Status');
                      }
                    }}
                    className="px-5 py-2.5 bg-emerald-600 text-white disabled:bg-slate-300 disabled:cursor-not-allowed font-extrabold rounded-xl hover:bg-emerald-700 transition-colors flex items-center gap-2 shadow-sm text-xs"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Loloskan
                  </button>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Modal Alasan Penolakan Pendaftaran */}
      {showRejectModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl w-[94vw] max-w-lg shadow-2xl overflow-hidden border border-slate-200">
            {/* Modal Header */}
            <div className="bg-rose-600 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-xl">
                  <XCircle className="w-5 h-5 text-rose-100" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold">Alasan Penolakan Pendaftaran</h3>
                  <p className="text-xs text-rose-100">Pendaftar: {selectedApplicant?.namaLengkap || selectedApplicant?.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                className="text-rose-200 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-amber-900 text-xs leading-relaxed">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Alasan penolakan ini akan <strong>ditampilkan di akun mahasiswa</strong> agar mahasiswa yang ditolak dapat mengajukan <strong>sanggahan / perbaikan berkas</strong> pada masa sanggah.
                </span>
              </div>

              {/* Template Quick Chips */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700">Pilih Template Alasan (Bisa Pilih &gt; 1):</label>
                  {rejectReason && (
                    <button
                      type="button"
                      onClick={() => setRejectReason('')}
                      className="text-[10px] text-rose-600 font-semibold hover:underline"
                    >
                      Reset Alasan
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {REJECTION_TEMPLATES.map((tmpl, idx) => {
                    const isSelected = rejectReason.includes(tmpl);
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleToggleTemplate(tmpl)}
                        className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition-all text-left flex items-center gap-1 ${
                          isSelected
                            ? 'bg-rose-600 text-white font-semibold shadow-sm'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        {isSelected ? '✓' : '+'} {tmpl.slice(0, 38)}...
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Reason Textarea */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Catatan / Alasan Penolakan Spesifik *</label>
                <textarea
                  rows={4}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Tuliskan catatan spesifik alasan berkas ditolak (misal: Transkrip Nilai buram atau belum berstempel basah fakultas)..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none leading-relaxed text-slate-900"
                ></textarea>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={submittingReject || !rejectReason.trim()}
                  onClick={handleConfirmReject}
                  className="px-5 py-2.5 text-xs font-extrabold text-white bg-rose-600 hover:bg-rose-700 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-xl shadow-md transition-all flex items-center gap-1.5"
                >
                  {submittingReject ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Memproses...
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4" /> Konfirmasi Tolak Pendaftaran
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>

      {/* Printable CV - Only visible during print */}
      {applicantDetail && (
        <div className="hidden print:block p-8 font-serif text-slate-900 max-w-4xl mx-auto bg-white min-h-screen">
          {/* Kop Surat Resmi */}
          <div className="text-center font-serif border-b-4 border-slate-900 pb-3 mb-1">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">Pemerintah Provinsi Sulawesi Tenggara</h3>
            <p className="text-xs font-bold uppercase text-slate-800">Panitia Seleksi Program Beasiswa Sultra Cerdas 2026</p>
            <p className="text-[10px] text-slate-600 italic">Kompleks Bumi Praja Anduonohu, Kota Kendari | Website: bssc.akusahabatrakyat.com</p>
          </div>
          <div className="border-b border-slate-900 mb-6"></div>

          {/* Title & Document Ref */}
          <div className="text-center space-y-1 mb-6">
            <h1 className="text-base font-black uppercase tracking-wider underline text-slate-900">FORMULIR BUKTI PENDAFTARAN BEASISWA MAHASISWA</h1>
            <p className="text-xs font-bold text-slate-800">NOMOR REGISTRASI: <span className="font-mono text-sm px-2 py-0.5 bg-slate-100 border border-slate-400 inline-block font-black">{applicantDetail.application?.registrationNo || '-'}</span></p>
          </div>

          <div className="space-y-4 text-xs font-sans">
            {/* Section 1 */}
            <div className="border border-slate-400 overflow-hidden">
              <div className="bg-slate-100 px-3 py-1 font-bold uppercase text-slate-900 border-b border-slate-400 flex justify-between">
                <span>I. IDENTITAS DIRI PENDAFTAR</span>
                <span>JENJANG TARGET: {applicantDetail.user?.jenjangTarget || '-'}</span>
              </div>
              <table className="w-full text-left border-collapse">
                <tbody>
                  <tr className="border-b border-slate-200"><td className="w-1/3 p-1.5 font-semibold bg-slate-50">Nama Lengkap (KTP)</td><td className="p-1.5 font-bold">: {applicantDetail.user?.namaLengkap || '-'}</td></tr>
                  <tr className="border-b border-slate-200"><td className="w-1/3 p-1.5 font-semibold bg-slate-50">NIK Mahasiswa</td><td className="p-1.5 font-mono">: {applicantDetail.user?.nik || '-'}</td></tr>
                  <tr className="border-b border-slate-200"><td className="w-1/3 p-1.5 font-semibold bg-slate-50">No. Kartu Keluarga (KK)</td><td className="p-1.5 font-mono">: {applicantDetail.profile?.noKk || '-'}</td></tr>
                  <tr className="border-b border-slate-200"><td className="w-1/3 p-1.5 font-semibold bg-slate-50">Tempat, Tanggal Lahir</td><td className="p-1.5">: {applicantDetail.profile?.tempatLahir || '-'}, {applicantDetail.profile?.tanggalLahir ? applicantDetail.profile.tanggalLahir.split('T')[0] : '-'}</td></tr>
                  <tr className="border-b border-slate-200"><td className="w-1/3 p-1.5 font-semibold bg-slate-50">Jenis Kelamin</td><td className="p-1.5">: {applicantDetail.profile?.gender || '-'}</td></tr>
                  <tr className="border-b border-slate-200"><td className="w-1/3 p-1.5 font-semibold bg-slate-50">Asal Daerah (Kab/Kota)</td><td className="p-1.5">: {formatAsalDaerah(applicantDetail.profile?.asalDaerah || '')}</td></tr>
                  <tr className="border-b border-slate-200"><td className="w-1/3 p-1.5 font-semibold bg-slate-50">Alamat KTP</td><td className="p-1.5">: {applicantDetail.profile?.alamatKtp || '-'}</td></tr>
                  <tr className="border-b border-slate-200"><td className="w-1/3 p-1.5 font-semibold bg-slate-50">Alamat Domisili</td><td className="p-1.5">: {applicantDetail.profile?.alamatDomisili || '-'}</td></tr>
                  <tr className="border-b border-slate-200"><td className="w-1/3 p-1.5 font-semibold bg-slate-50">No. HP / WhatsApp</td><td className="p-1.5">: {applicantDetail.profile?.noHp || '-'}</td></tr>
                  <tr><td className="w-1/3 p-1.5 font-semibold bg-slate-50">Email Aktif</td><td className="p-1.5">: {applicantDetail.user?.email || '-'}</td></tr>
                </tbody>
              </table>
            </div>

            {/* Section 2 */}
            <div className="border border-slate-400 overflow-hidden">
              <div className="bg-slate-100 px-3 py-1 font-bold uppercase text-slate-900 border-b border-slate-400">
                II. DATA AKADEMIK & PERGURUAN TINGGI
              </div>
              <table className="w-full text-left border-collapse">
                <tbody>
                  <tr className="border-b border-slate-200"><td className="w-1/3 p-1.5 font-semibold bg-slate-50">Perguruan Tinggi</td><td className="p-1.5 font-bold">: {getOngoingEducation(applicantDetail).institusi}</td></tr>
                  <tr className="border-b border-slate-200"><td className="w-1/3 p-1.5 font-semibold bg-slate-50">Fakultas / Program Studi</td><td className="p-1.5">: {getOngoingEducation(applicantDetail).jurusan}</td></tr>
                  <tr className="border-b border-slate-200"><td className="w-1/3 p-1.5 font-semibold bg-slate-50">Akreditasi Prodi</td><td className="p-1.5">: {applicantDetail.profile?.akreditasiProdi || '-'}</td></tr>
                  <tr className="border-b border-slate-200"><td className="w-1/3 p-1.5 font-semibold bg-slate-50">NIM Mahasiswa</td><td className="p-1.5 font-mono">: {applicantDetail.profile?.nim || '-'}</td></tr>
                  <tr className="border-b border-slate-200"><td className="w-1/3 p-1.5 font-semibold bg-slate-50">Semester Saat Ini</td><td className="p-1.5">: Semester {applicantDetail.profile?.semester || '-'}</td></tr>
                  <tr className="border-b border-slate-200"><td className="w-1/3 p-1.5 font-semibold bg-slate-50">IPK Kumulatif Terakhir</td><td className="p-1.5 font-bold">: {applicantDetail.profile?.ipk || '-'}</td></tr>
                  <tr><td className="w-1/3 p-1.5 font-semibold bg-slate-50">Target Tahun Lulus</td><td className="p-1.5">: {applicantDetail.profile?.targetLulus || '-'}</td></tr>
                </tbody>
              </table>
            </div>

            {/* Section 3 */}
            <div className="border border-slate-400 overflow-hidden">
              <div className="bg-slate-100 px-3 py-1 font-bold uppercase text-slate-900 border-b border-slate-400">
                III. ORANG TUA / EKONOMI KELUARGA
              </div>
              <table className="w-full text-left border-collapse">
                <tbody>
                  <tr className="border-b border-slate-200"><td className="w-1/3 p-1.5 font-semibold bg-slate-50">Nama Ayah / Ibu</td><td className="p-1.5">: {applicantDetail.profile?.namaAyah || '-'} / {applicantDetail.profile?.namaIbu || '-'}</td></tr>
                  <tr className="border-b border-slate-200"><td className="w-1/3 p-1.5 font-semibold bg-slate-50">Pekerjaan Orang Tua</td><td className="p-1.5">: {applicantDetail.profile?.pekerjaanAyah || '-'} / {applicantDetail.profile?.pekerjaanIbu || '-'}</td></tr>
                  <tr className="border-b border-slate-200"><td className="w-1/3 p-1.5 font-semibold bg-slate-50">Penghasilan Orang Tua</td><td className="p-1.5">: {applicantDetail.profile?.penghasilanOrtu || '-'}</td></tr>
                  <tr><td className="w-1/3 p-1.5 font-semibold bg-slate-50">Jumlah Tanggungan</td><td className="p-1.5">: {applicantDetail.profile?.jumlahTanggungan || '0'} Orang</td></tr>
                </tbody>
              </table>
            </div>

            {/* Section 4 - Prestasi */}
            {(applicantDetail.profile?.prestasiAkademik || applicantDetail.profile?.prestasiNonAkademik || applicantDetail.profile?.pengalamanOrganisasi) && (
              <div className="border border-slate-400 overflow-hidden">
                <div className="bg-slate-100 px-3 py-1 font-bold uppercase text-slate-900 border-b border-slate-400">
                  IV. PRESTASI & PENGALAMAN ORGANISASI
                </div>
                <table className="w-full text-left border-collapse">
                  <tbody>
                    {applicantDetail.profile?.prestasiAkademik && (
                      <tr className="border-b border-slate-200">
                        <td className="w-1/3 p-1.5 font-semibold bg-slate-50">Prestasi Akademik</td>
                        <td className="p-1.5">{renderAchievementDetails(applicantDetail.profile.prestasiAkademik)}</td>
                      </tr>
                    )}
                    {applicantDetail.profile?.prestasiNonAkademik && (
                      <tr className="border-b border-slate-200">
                        <td className="w-1/3 p-1.5 font-semibold bg-slate-50">Prestasi Non-Akademik</td>
                        <td className="p-1.5">{renderAchievementDetails(applicantDetail.profile.prestasiNonAkademik)}</td>
                      </tr>
                    )}
                    {applicantDetail.profile?.pengalamanOrganisasi && (
                      <tr>
                        <td className="w-1/3 p-1.5 font-semibold bg-slate-50">Pengalaman Organisasi</td>
                        <td className="p-1.5">{renderAchievementDetails(applicantDetail.profile.pengalamanOrganisasi)}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Statement Box */}
            <div className="p-3 border-2 border-slate-900 text-[10px] leading-relaxed text-justify bg-slate-50 font-serif">
              <p className="font-bold mb-1 uppercase">PERNYATAAN TANGGUNG JAWAB MUTLAK (SPTJM):</p>
              <p>
                Saya yang bertanda tangan di bawah ini menyatakan dengan sesungguhnya bahwa seluruh data, informasi, dan dokumen berkas persyaratan yang saya sampaikan adalah <strong>BENAR, SAH, dan DAPAT DIPERTANGGUNGJAWABKAN</strong>. Apabila di kemudian hari terbukti memberikan data palsu atau terbukti menerima pendanaan beasiswa ganda (double funding), saya bersedia menerima sanksi pembatalan status penerima beasiswa dan sanggup mengembalikan seluruh dana beasiswa yang telah diterima ke Kas Daerah Provinsi Sulawesi Tenggara.
              </p>
            </div>

            {/* Signature Block */}
            <div className="pt-4 flex justify-end items-end">
              <div className="text-center w-64 space-y-1">
                <p className="text-xs">Kendari, {applicantDetail.application?.submittedAt ? new Date(applicantDetail.application.submittedAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p className="text-xs font-semibold mb-1">Pemohon / Pendaftar Beasiswa,</p>
                
                {/* Signature Display */}
                <div className="h-16 flex items-center justify-center my-1">
                  {applicantDetail.profile?.signatureData ? (
                    <img src={applicantDetail.profile.signatureData} alt="Tanda Tangan Digital" className="max-h-16 max-w-full object-contain" crossOrigin="anonymous" />
                  ) : (
                    <div className="text-[10px] text-slate-400 italic">
                      (Tanda Tangan Digital)
                    </div>
                  )}
                </div>

                <p className="font-bold underline uppercase text-slate-900">{applicantDetail.user?.namaLengkap || '-'}</p>
                <p className="text-[10px] text-slate-700 font-mono">NIK. {applicantDetail.user?.nik || '-'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Notification Modal Pop-up */}
      {toast && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl w-[90vw] max-w-sm shadow-2xl overflow-hidden border border-slate-100 p-6 text-center animate-in zoom-in-95">
            <div className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center mb-4 ${
              toast.type === 'success' ? 'bg-emerald-100 text-emerald-600' :
              toast.type === 'error' ? 'bg-rose-100 text-rose-600' :
              'bg-amber-100 text-amber-600'
            }`}>
              {toast.type === 'success' && <CheckCircle2 className="w-8 h-8" />}
              {toast.type === 'error' && <XCircle className="w-8 h-8" />}
              {toast.type === 'warning' && <AlertCircle className="w-8 h-8" />}
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">{toast.title}</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-6">{toast.message}</p>
            <button
              onClick={() => setToast(null)}
              className={`w-full py-2.5 px-4 font-bold text-xs text-white rounded-xl transition-all shadow-md ${
                toast.type === 'success' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200' :
                toast.type === 'error' ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-200' :
                'bg-slate-900 hover:bg-slate-800 shadow-slate-200'
              }`}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
