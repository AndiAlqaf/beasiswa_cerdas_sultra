'use client';

import React, { useState, useEffect, useRef } from 'react';
import { fetchAPI } from '@/lib/api';
import { getStoredScheduleConfig, getDynamicTimeline, ScheduleConfig } from '@/lib/schedule';
import {
  FileText,
  Calendar,
  HardDrive,
  Upload,
  ExternalLink,
  AlertCircle,
  Loader2,
  CheckCircle2,
  XCircle,
  Camera,
  Lock,
  Check,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import SelfieLivenessModal from '@/components/SelfieLivenessModal';

interface DocumentInfo {
  id: string;
  docType: string;
  originalName: string;
  storedName?: string;
  mimeType: string;
  fileSize: number;
  uploadedAt: string;
  isMissing?: boolean;
  isSanggah?: boolean;
}

const isDocTypeMatch = (doc: DocumentInfo, targetKey: string) => {
  if (!doc || !targetKey) return false;
  const dbType = ((doc as any).canonicalType || doc.docType || (doc as any).doc_type || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const tgt = targetKey.toLowerCase().replace(/[^a-z0-9]/g, '');

  // 1. Direct match
  if (dbType === tgt) return true;

  // 2. Controlled alias mapping based on docType ONLY (never match on user's arbitrary originalName)
  if ((tgt === 'pernyataan' || tgt === 'suratpernyataan') && (dbType === 'suratpernyataan' || dbType === 'filesuratpernyataan' || dbType === 'pernyataan')) return true;
  if ((tgt === 'suratpermohonan' || tgt === 'permohonan') && (dbType === 'filesuratpermohonan' || dbType === 'suratpermohonan' || dbType === 'permohonan')) return true;
  if (tgt === 'esai' && (dbType === 'filemotivationoresai' || dbType === 'motivationletter' || dbType === 'esai' || dbType === 'essay' || dbType === 'fileesai')) return true;
  if (tgt === 'selfie' && (dbType === 'pasfoto' || dbType === 'filepasfoto' || dbType === 'selfie' || dbType === 'fileselfie')) return true;
  if (tgt === 'ktm' && (dbType === 'surataktif' || dbType === 'filesurataktif' || dbType === 'ktm' || dbType === 'filektm' || dbType === 'kartumahasiswa')) return true;
  if (tgt === 'ktp' && (dbType === 'filektp' || dbType === 'ktp')) return true;
  if (tgt === 'transkrip' && (dbType === 'filetranskrip' || dbType === 'transkrip' || dbType === 'transkripnilai')) return true;
  if (tgt === 'dtks' && (dbType === 'filedtks' || dbType === 'dtks' || dbType === 'kip' || dbType === 'dtsen' || dbType === 'kemensos')) return true;
  if (tgt === 'ijazah' && (dbType === 'fileijazah' || dbType === 'ijazah' || dbType === 'ijazahs1' || dbType === 'ijazahs2')) return true;
  if (tgt === 'pendukung' && (dbType === 'pendukung' || dbType === 'filependukung')) return true;

  return false;
};

export default function BerkasPage() {
  const [documents, setDocuments] = useState<DocumentInfo[]>([]);
  const [applicationStatus, setApplicationStatus] = useState<string | null>(null);
  const [resubmitting, setResubmitting] = useState(false);
  const [missingDocuments, setMissingDocuments] = useState<string[]>([]);
  const [jenjang, setJenjang] = useState<string>('S1');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState<{ title: string; message: string; type: 'success' | 'error' } | null>(null);
  const [scheduleConfig, setScheduleConfig] = useState<ScheduleConfig>(getStoredScheduleConfig());

  // Pending Upload Confirmation State
  const [pendingUpload, setPendingUpload] = useState<{
    docKey: string;
    docLabel: string;
    file: File;
  } | null>(null);
  const [isUploadingPending, setIsUploadingPending] = useState(false);

  // Camera Modal State for Selfie Liveness
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const documentTypes = [
    { key: 'surat_permohonan', label: 'Surat Permohonan Beasiswa (Kepada Gubernur Sultra)', desc: 'Surat permohonan beasiswa BSSC yang ditujukan kepada Gubernur Sulawesi Tenggara.', required: true, accept: '.pdf,.png,.jpg,.jpeg' },
    { key: 'ktm', label: jenjang === 'S2' ? 'KTM / Surat Aktif S2' : jenjang === 'S3' ? 'KTM / Surat Aktif S3' : 'KTM / Surat Aktif Kuliah', desc: 'Salinan Kartu Tanda Mahasiswa (KTM) aktif atau Surat Keterangan Aktif Kuliah.', required: true, accept: '.pdf,.png,.jpg,.jpeg' },
    { key: 'selfie', label: 'Pasfoto / Selfie KTP', desc: 'Foto formal atau selfie memegang KTP dengan latar belakang jelas.', required: true, accept: '.png,.jpg,.jpeg' },
    { key: 'transkrip', label: jenjang === 'S2' ? 'Transkrip Nilai Semester S2' : jenjang === 'S3' ? 'Transkrip Nilai Semester S3' : 'Transkrip Nilai Akademik', desc: 'Transkrip nilai semester terakhir yang disahkan stempel basah fakultas/prodi.', required: true, accept: '.pdf,.png,.jpg,.jpeg' },
    { key: 'pernyataan', label: 'Surat Pernyataan Tidak Sedang Menerima Beasiswa Lain', desc: 'Surat Pernyataan resmi bermaterai Rp 10.000 tidak sedang menerima beasiswa lain.', required: true, accept: '.pdf,.png,.jpg,.jpeg' },
    { 
      key: 'dtks', 
      label: 'Bukti Tangkapan Layar DTKS / DTSEN', 
      desc: 'Tangkapan layar status terdaftar DTKS dan/atau DTSEN (Kemensos).', 
      required: true, 
      accept: '.pdf,.png,.jpg,.jpeg' 
    },
    ...((jenjang === 'S2' || jenjang === 'S3') ? [{
      key: 'ijazah',
      label: jenjang === 'S2' ? 'Ijazah & Transkrip Nilai S1' : 'Ijazah & Transkrip S1 & S2',
      desc: jenjang === 'S2' ? 'Salinan ijazah dan transkrip nilai jenjang Sarjana (S1).' : 'Salinan ijazah dan transkrip jenjang S1 & Magister (S2).',
      required: false,
      accept: '.pdf,.png,.jpg,.jpeg'
    }] : []),
    { key: 'ktp', label: 'Kartu Tanda Penduduk (KTP)', desc: 'Scan KTP asli domisili Kabupaten/Kota Sulawesi Tenggara.', required: true, accept: '.pdf,.png,.jpg,.jpeg' },
    { key: 'esai', label: (jenjang === 'S2' || jenjang === 'S3') ? 'Esai Kontribusi Daerah (5 Tahun)' : 'Motivation Letter (S1/D4)', desc: (jenjang === 'S2' || jenjang === 'S3') ? 'Esai rencana nyata kontribusi bagi Sulawesi Tenggara dalam 5 tahun ke depan.' : 'Surat motivasi yang memuat alasan dan motivasi akademik Anda.', required: true, accept: '.pdf,.png,.jpg,.jpeg' },
    { key: 'pendukung', label: 'Berkas Sertifikat & Pendukung Lain', desc: 'Sertifikat keahlian, prestasi, atau dokumen pendukung tambahan.', required: false, accept: '.pdf,.png,.jpg,.jpeg' },
  ];

  const loadDocuments = async () => {
    try {
      const res = await fetchAPI('/applicant/profile');
      if (res.success && res.data) {
        setDocuments(res.data.documents || []);
        setMissingDocuments(res.data.missingDocuments || []);
        setApplicationStatus(res.data.application?.status || null);
        if (res.data.user?.jenjangTarget) {
          setJenjang(res.data.user.jenjangTarget);
        }
      } else {
        setError(res.message || 'Gagal memuat berkas.');
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
    setScheduleConfig(getStoredScheduleConfig());
    const handleUpdate = () => {
      setScheduleConfig(getStoredScheduleConfig());
    };
    window.addEventListener('bssc_schedule_updated', handleUpdate);
    return () => window.removeEventListener('bssc_schedule_updated', handleUpdate);
  }, []);

  const timeline = getDynamicTimeline(scheduleConfig);

  // Masa Sanggah check
  const sanggahStep = timeline.find((s) => s.id === 'sanggah');
  const isSanggahPeriodOpen = sanggahStep ? sanggahStep.status === 'active' : false;
  const sanggahDateRange = sanggahStep?.date || '5 - 8 November 2026';

  const formatSize = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleTriggerUpload = (docKey: string) => {
    // 1. Cek apakah di luar masa sanggah
    if (!isSanggahPeriodOpen) {
      setToast({
        title: 'Masa Sanggah Belum Dibuka',
        message: `Pengunggahan dan perbaikan berkas hanya dapat dilakukan pada Masa Sanggah (${sanggahDateRange}). Saat ini sistem berada di luar jadwal masa sanggah.`,
        type: 'error',
      });
      return;
    }

    // 2. Cek apakah berkas sanggahan untuk kategori ini sudah pernah diunggah
    const matchingDocs = documents.filter((d) => isDocTypeMatch(d, docKey));
    const presentDocs = matchingDocs.filter((d) => !d.isMissing);
    const alreadyHasSanggahan = presentDocs.some((d, idx) => {
      if (d.isSanggah) return true;
      if (d.storedName?.startsWith('sanggah_')) return true;
      if (presentDocs.length > 1 && idx > 0) return true;
      return false;
    });

    if (alreadyHasSanggahan) {
      setToast({
        title: 'Berkas Sanggahan Terkunci',
        message: 'Berkas sanggahan untuk dokumen ini sudah berhasil diunggah dan terkunci permanen. Anda tidak dapat mengubah atau mengedit lagi.',
        type: 'error',
      });
      return;
    }

    if (fileInputRefs.current[docKey]) {
      fileInputRefs.current[docKey]?.click();
    }
  };

  const handleFileChange = (docKey: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. Validasi Masa Sanggah
    if (!isSanggahPeriodOpen) {
      setToast({
        title: 'Masa Sanggah Ditutup',
        message: `Pengunggahan berkas hanya dapat dilakukan pada Masa Sanggah (${sanggahDateRange}).`,
        type: 'error',
      });
      e.target.value = '';
      return;
    }

    // 2. Validasi Ukuran File (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setToast({
        title: 'Ukuran File Terlalu Besar',
        message: `Ukuran file "${file.name}" melebihi batas maksimum 10MB. Silakan kompres file Anda terlebih dahulu.`,
        type: 'error',
      });
      e.target.value = '';
      return;
    }

    // 3. JANGAN langsung upload: Simpan ke pendingUpload untuk menampilkan dialog konfirmasi
    const docItem = documentTypes.find((d) => d.key === docKey);
    setPendingUpload({
      docKey,
      docLabel: docItem?.label || docKey,
      file,
    });

    e.target.value = '';
  };

  const handleConfirmUpload = async () => {
    if (!pendingUpload) return;
    setIsUploadingPending(true);

    try {
      const token = localStorage.getItem('bssc_access_token');
      const formData = new FormData();
      formData.append('file', pendingUpload.file);

      const headers: Record<string, string> = {
        'x-is-sanggah': 'true',
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const mockTime = typeof window !== 'undefined' ? (window as any).__MOCK_TIME : undefined;
      if (mockTime) headers['x-mock-time'] = mockTime;

      const res = await fetch(`/api/v1/applicant/upload/${pendingUpload.docKey}?isSanggah=true`, {
        method: 'POST',
        headers,
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Gagal mengunggah berkas.');
      }

      setToast({
        title: 'Berkas Sanggahan Berhasil Diunggah & Terkunci!',
        message: `Dokumen "${pendingUpload.file.name}" telah berhasil disimpan sebagai Berkas Sanggahan dan terkunci permanen.`,
        type: 'success',
      });

      setPendingUpload(null);
      await loadDocuments();
    } catch (err: any) {
      setToast({
        title: 'Gagal Mengunggah Berkas',
        message: err.message || 'Terjadi kesalahan saat mengunggah file.',
        type: 'error',
      });
    } finally {
      setIsUploadingPending(false);
    }
  };

  const handleViewDocument = async (docId: string) => {
    try {
      const token = localStorage.getItem('bssc_access_token');
      const res = await fetch(`/api/v1/applicant/documents/${docId}/view`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Gagal memuat berkas.');
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      setTimeout(() => window.URL.revokeObjectURL(url), 60000);
    } catch (err: any) {
      setToast({
        title: 'Gagal Membuka File',
        message: err.message || 'File tidak dapat ditampilkan.',
        type: 'error',
      });
    }
  };

  const handleResubmit = async () => {
    if (!isSanggahPeriodOpen) {
      setToast({
        title: 'Di Luar Masa Sanggah',
        message: `Pengiriman ulang pendaftaran hanya dapat dilakukan pada Masa Sanggah (${sanggahDateRange}).`,
        type: 'error',
      });
      return;
    }
    setResubmitting(true);
    try {
      const res = await fetchAPI('/applicant/application/resubmit', { method: 'POST' });
      if (!res.success) throw new Error(res.message || 'Gagal mengirim ulang pendaftaran.');
      setToast({
        title: 'Pendaftaran Terkirim Ulang',
        message: res.message || 'Pendaftaran Anda berhasil dikirim ulang.',
        type: 'success',
      });
      await loadDocuments();
    } catch (err: any) {
      setToast({ title: 'Gagal Mengirim Ulang', message: err.message || 'Terjadi kesalahan sistem.', type: 'error' });
    } finally {
      setResubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-slate-500 font-medium">Memuat berkas unggahan Anda...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-50 text-rose-700 p-6 rounded-2xl flex items-start gap-4 border border-rose-200">
        <AlertCircle className="w-6 h-6 shrink-0" />
        <div>
          <h3 className="font-bold mb-1">Gagal Memuat Berkas</h3>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0B3A6A] p-6 sm:p-8 rounded-3xl text-white shadow-md">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-blue-200 text-xs font-semibold mb-2">
            <span>Manajemen Berkas Pendaftaran</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Kelola Berkas Unggahan</h1>
          <p className="text-blue-100 text-xs sm:text-sm mt-1 max-w-xl leading-relaxed">
            {isSanggahPeriodOpen
              ? `Masa Sanggah sedang aktif (${sanggahDateRange}). Anda dapat memperbarui berkas perbaikan sanggahan. Berkas lama tetap tersimpan sebagai riwayat perbandingan.`
              : `Pengunggahan dan perbaikan berkas hanya dapat dilakukan pada Masa Sanggah (${sanggahDateRange}). Saat ini portal berkas sedang dikunci.`}
          </p>
        </div>
      </div>

      {/* Banner Status Masa Sanggah */}
      {!isSanggahPeriodOpen ? (
        <div className="bg-gradient-to-r from-amber-50 to-slate-50 border-2 border-amber-300 rounded-3xl p-6 shadow-sm flex items-start gap-4 animate-in fade-in">
          <div className="p-3 bg-amber-600 text-white rounded-2xl shrink-0 shadow-sm">
            <Lock className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-200 text-amber-900 border border-amber-300">
                Di Luar Masa Sanggah
              </span>
              <span className="text-xs text-amber-800 font-bold">Pengunggahan Berkas Ditutup</span>
            </div>
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
              Portal Pengunggahan & Perbaikan Berkas Sedang Dikunci
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              Pengunggahan maupun perubahan berkas pendaftaran hanya dapat dilakukan pada <strong>Masa Sanggah ({sanggahDateRange})</strong>. Di luar jadwal tersebut, sistem mengunci seluruh aksi pengunggahan dan perbaikan berkas untuk menjaga keabsahan data seleksi. Anda tetap dapat meninjau berkas yang telah tersimpan melalui tombol <strong>Lihat File</strong>.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-emerald-50 to-blue-50 border-2 border-emerald-300 rounded-3xl p-6 shadow-sm flex items-start gap-4 animate-in fade-in">
          <div className="p-3 bg-emerald-600 text-white rounded-2xl shrink-0 shadow-sm">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-200 text-emerald-900 border border-emerald-300">
                Masa Sanggah Aktif
              </span>
              <span className="text-xs text-emerald-800 font-bold">{sanggahDateRange}</span>
            </div>
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
              Pengunggahan Berkas Masa Sanggah Terbuka
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
              Anda dapat mengunggah berkas sanggahan bagi dokumen yang memerlukan perbaikan. <strong>Penting:</strong> Setelah berkas sanggahan dipilih dan dikonfirmasi, dokumen akan <strong>langsung terkunci permanen</strong>. Berkas awal pendaftaran tetap tersimpan sebagai riwayat perbandingan.
            </p>
          </div>
        </div>
      )}

      {/* Banner Khusus Status PERLU_UNGGAH_ULANG */}
      {applicationStatus === 'PERLU_UNGGAH_ULANG' && (() => {
        const hasValidKtm = documents.some((d) => isDocTypeMatch(d, 'ktm') && !d.isMissing);
        if (!isSanggahPeriodOpen) {
          return (
            <div className="bg-slate-50 border-2 border-slate-300 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-slate-700 text-white rounded-2xl shrink-0">
                  <Lock className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300">
                      Terkunci
                    </span>
                    <span className="text-xs text-slate-500 font-semibold">Menunggu Masa Sanggah</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                    Perbaikan Berkas Belum Dapat Dikirimkan
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                    Pendaftaran Anda berstatus <strong>Perlu Unggah Ulang</strong>. Pengunggahan berkas perbaikan dan pengiriman ulang hanya dapat dilakukan pada saat <strong>Masa Sanggah ({sanggahDateRange})</strong> dibuka.
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 border-t border-slate-200">
                <p className="text-xs font-bold text-slate-500 italic">
                  Status: Terkunci (Di Luar Masa Sanggah)
                </p>
                <button
                  type="button"
                  disabled
                  className="px-6 py-2.5 bg-slate-300 cursor-not-allowed text-slate-600 font-extrabold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  Kirim Ulang Terkunci
                </button>
              </div>
            </div>
          );
        }
        return (
          <div className="bg-gradient-to-r from-rose-50 to-amber-50 border-2 border-rose-400 rounded-3xl p-6 shadow-md space-y-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-rose-600 text-white rounded-2xl shrink-0">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-extrabold text-rose-950">
                  Langkah 1: Unggah KTM / Surat Aktif Kuliah &nbsp;•&nbsp; Langkah 2: Kirim Ulang
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                  Berkas KTM/Surat Aktif Kuliah Anda tidak terbaca di sistem. Unggah berkas sanggahan pada kartu <strong>KTM</strong> di bawah, lalu tekan tombol kirim ulang. Berkas sanggahan yang diunggah akan langsung terkunci permanen. Nomor registrasi Anda <strong>tidak berubah</strong>.
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <p className={`text-xs font-bold ${hasValidKtm ? 'text-emerald-700' : 'text-rose-700'}`}>
                {hasValidKtm ? '✓ KTM sudah terunggah. Anda dapat mengirim ulang pendaftaran.' : '✗ KTM belum terunggah.'}
              </p>
              <button
                type="button"
                disabled={!hasValidKtm || resubmitting}
                onClick={handleResubmit}
                className="px-6 py-3 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                {resubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Kirim Ulang Pendaftaran
              </button>
            </div>
          </div>
        );
      })()}

      {/* Grid Dokumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {documentTypes.map((docTypeItem) => {
          const matchingDocs = documents.filter((d) => isDocTypeMatch(d, docTypeItem.key));
          const presentDocs = matchingDocs.filter((d) => !d.isMissing);

          // Cek apakah berkas merupakan sanggahan:
          // 1. Ditandai d.isSanggah === true atau storedName mengandung prefix 'sanggah_'
          // 2. ATAU jika memiliki lebih dari 1 file (presentDocs.length > 1), maka file setelah index 0 adalah sanggahan
          const isDocSanggah = (d: DocumentInfo, idx: number) => {
            if (d.isSanggah) return true;
            if (d.storedName && d.storedName.startsWith('sanggah_')) return true;
            if (presentDocs.length > 1 && idx > 0) return true;
            return false;
          };

          const sanggahDocs = presentDocs.filter((d, idx) => isDocSanggah(d, idx));
          const registrationDocs = presentDocs.filter((d, idx) => !isDocSanggah(d, idx));

          const hasSanggahanUploaded = sanggahDocs.length > 0;
          const latestSanggahDoc = hasSanggahanUploaded ? sanggahDocs[sanggahDocs.length - 1] : null;
          const registrationDoc = registrationDocs.length > 0 ? registrationDocs[0] : null;

          const isFileMissing = presentDocs.length === 0 && missingDocuments.some(mKey => isDocTypeMatch({ docType: mKey } as any, docTypeItem.key));

          return (
            <div
              key={docTypeItem.key}
              className={`rounded-3xl p-6 transition-all flex flex-col justify-between border ${
                isFileMissing
                  ? 'bg-rose-50/40 border-rose-300 shadow-sm ring-1 ring-rose-200'
                  : hasSanggahanUploaded
                  ? 'bg-amber-50/20 border-amber-300 shadow-sm ring-1 ring-amber-100'
                  : registrationDoc
                  ? 'bg-white border-slate-200 shadow-sm hover:shadow-md'
                  : 'bg-slate-50/80 border-dashed border-slate-300'
              }`}
            >
              {/* Hidden File Input */}
              <input
                type="file"
                ref={(el) => { fileInputRefs.current[docTypeItem.key] = el; }}
                onChange={(e) => handleFileChange(docTypeItem.key, e)}
                accept={docTypeItem.accept}
                className="hidden"
              />

              <div>
                {/* Header Badge */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {hasSanggahanUploaded ? (
                      <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border bg-amber-100 text-amber-900 border-amber-300 flex items-center gap-1 shadow-2xs">
                        <Check className="w-3 h-3 text-amber-700" /> Berkas Sanggahan Terkirim
                      </span>
                    ) : isFileMissing ? (
                      <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border bg-rose-600 text-white border-rose-700 shadow-2xs animate-pulse">
                        ⚠️ File Perlu Dilengkapi
                      </span>
                    ) : registrationDoc ? (
                      <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border bg-blue-100 text-blue-900 border-blue-200 flex items-center gap-1">
                        <FileText className="w-3 h-3 text-blue-600" /> Berkas Pendaftaran
                      </span>
                    ) : (
                      <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                        docTypeItem.required
                          ? 'bg-amber-100 text-amber-800 border-amber-200'
                          : 'bg-slate-200 text-slate-600 border-slate-300'
                      }`}>
                        {docTypeItem.required ? 'Wajib Unggah' : 'Opsional'}
                      </span>
                    )}

                    {(latestSanggahDoc || registrationDoc) && (
                      <span className="text-[10px] font-mono uppercase bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                        {(latestSanggahDoc || registrationDoc)!.mimeType.split('/')[1] || 'FILE'}
                      </span>
                    )}
                  </div>

                  {hasSanggahanUploaded ? (
                    <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                      <Lock className="w-3 h-3 text-slate-400" /> Terkunci Permanen
                    </span>
                  ) : !isSanggahPeriodOpen && registrationDoc ? (
                    <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                      <Lock className="w-3 h-3 text-slate-400" /> Terkunci
                    </span>
                  ) : isSanggahPeriodOpen && registrationDoc ? (
                    <span className="text-[10px] text-amber-800 font-bold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                      Bisa Disanggah
                    </span>
                  ) : null}
                </div>

                {isFileMissing && (
                  <div className="p-3 bg-rose-100/80 border border-rose-300 rounded-2xl flex items-center gap-2 text-rose-900 text-xs font-bold mb-3 shadow-2xs">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>Berkas ini belum dilampirkan atau tidak terbaca di server. Silakan unggah berkas sanggahan.</span>
                  </div>
                )}

                {/* Doc Title & Description */}
                <h3 className="font-bold text-slate-900 text-base mb-1">{docTypeItem.label}</h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">{docTypeItem.desc}</p>

                {/* Tampilan Berkas */}
                {hasSanggahanUploaded && latestSanggahDoc ? (
                  <div className="space-y-2 mb-4">
                    {/* 1. Berkas Sanggahan (Terkini) */}
                    <div className="bg-amber-50/70 rounded-2xl p-3.5 border-2 border-amber-300 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-[10px] font-black uppercase bg-amber-200 text-amber-950 px-2 py-0.5 rounded-md shrink-0">
                            🆕 Berkas Sanggahan
                          </span>
                          <p className="text-xs font-extrabold text-slate-900 truncate" title={latestSanggahDoc.originalName}>
                            📄 {latestSanggahDoc.originalName}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleViewDocument(latestSanggahDoc.id)}
                          className="text-xs font-extrabold text-blue-700 hover:text-blue-900 underline shrink-0 ml-2"
                        >
                          Lihat
                        </button>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-slate-600 font-medium">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {new Date(latestSanggahDoc.uploadedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                        <span className="flex items-center gap-1">
                          <HardDrive className="w-3.5 h-3.5 text-slate-400" />
                          {formatSize(latestSanggahDoc.fileSize)}
                        </span>
                      </div>
                    </div>

                    {/* 2. Berkas Lama Pendaftaran (jika ada) */}
                    {registrationDoc ? (
                      <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200 space-y-1.5 opacity-90">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="text-[10px] font-bold uppercase bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded shrink-0">
                              📁 Berkas Lama
                            </span>
                            <p className="text-xs font-semibold text-slate-700 truncate" title={registrationDoc.originalName}>
                              {registrationDoc.originalName}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleViewDocument(registrationDoc.id)}
                            className="text-xs font-bold text-slate-600 hover:text-slate-900 underline shrink-0 ml-2"
                          >
                            Lihat
                          </button>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] text-slate-500 font-medium">
                          <span>{new Date(registrationDoc.uploadedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                          <span>•</span>
                          <span>{formatSize(registrationDoc.fileSize)}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500 italic">
                        ℹ️ Dokumen awal saat pendaftaran belum dilampirkan. Berkas ini telah dilengkapi pada Masa Sanggah.
                      </div>
                    )}
                  </div>
                ) : registrationDoc ? (
                  /* Hanya ada Berkas Pendaftaran Awal (belum pernah mengajukan sanggahan) */
                  <div className="space-y-2 mb-4">
                    <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-slate-800 truncate" title={registrationDoc.originalName}>
                          📄 {registrationDoc.originalName}
                        </p>
                        <span className="text-[9px] font-bold uppercase bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md">
                          Dari Pendaftaran
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-[11px] text-slate-500 font-medium">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {new Date(registrationDoc.uploadedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                        <span className="flex items-center gap-1">
                          <HardDrive className="w-3.5 h-3.5 text-slate-400" />
                          {formatSize(registrationDoc.fileSize)}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-amber-50/50 border border-amber-200/60 rounded-2xl text-[11px] text-amber-800 leading-relaxed mb-4">
                    Belum ada berkas yang diunggah untuk kategori ini. Silakan unggah berkas perbaikan Anda pada Masa Sanggah ini.
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-3 border-t border-slate-100 mt-auto">
                {hasSanggahanUploaded && latestSanggahDoc ? (
                  /* KASUS 1: Berkas Sanggahan sudah terunggah -> LANGSUNG TERKUNCI PERMANEN */
                  <div className="w-full flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleViewDocument(latestSanggahDoc.id)}
                      className="flex-1 py-2.5 px-3 text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-xl transition-colors flex items-center justify-center gap-1.5 border border-amber-300 shadow-2xs"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Lihat Berkas Sanggahan
                    </button>
                    <div className="px-3 py-2 text-[11px] font-bold text-slate-500 bg-slate-100 rounded-xl border border-slate-200 flex items-center gap-1 shrink-0">
                      <Lock className="w-3.5 h-3.5 text-slate-400" /> Terkunci
                    </div>
                  </div>
                ) : !isSanggahPeriodOpen ? (
                  /* KASUS 2: DI LUAR MASA SANGGAH -> SEMUA AKSI EDIT/UNGGAH TERKUNCI */
                  <div className="w-full flex items-center gap-2">
                    {registrationDoc ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleViewDocument(registrationDoc.id)}
                          className="flex-1 py-2.5 px-3 text-xs font-bold bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-xl transition-colors flex items-center justify-center gap-1.5 border border-blue-200 shadow-2xs"
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> Lihat File
                        </button>
                        <div className="px-3 py-2 text-[11px] font-bold text-slate-400 bg-slate-100 rounded-xl border border-slate-200 flex items-center gap-1 shrink-0">
                          <Lock className="w-3.5 h-3.5 text-slate-400" /> Terkunci
                        </div>
                      </>
                    ) : (
                      <button
                        type="button"
                        disabled
                        className="w-full py-2.5 px-3 text-xs font-bold rounded-xl bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed flex items-center justify-center gap-1.5"
                      >
                        <Lock className="w-3.5 h-3.5" /> Terkunci (Di Luar Masa Sanggah)
                      </button>
                    )}
                  </div>
                ) : (
                  /* KASUS 3: MASA SANGGAH AKTIF & BELUM UNGGAH SANGGAHAN -> DIBUKA UNTUK UNGGAH SANGGAHAN! */
                  <div className="w-full flex items-center gap-2">
                    {registrationDoc && (
                      <button
                        type="button"
                        onClick={() => handleViewDocument(registrationDoc.id)}
                        className="flex-1 py-2.5 px-3 text-xs font-bold bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-xl transition-colors flex items-center justify-center gap-1.5 border border-blue-200 shadow-2xs"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Lihat File
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        if (docTypeItem.key === 'selfie') {
                          setIsCameraModalOpen(true);
                        } else {
                          handleTriggerUpload(docTypeItem.key);
                        }
                      }}
                      className={`flex-1 py-2.5 px-3 text-xs font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 ${
                        docTypeItem.key === 'selfie'
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                          : registrationDoc
                          ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/20'
                          : 'bg-blue-900 hover:bg-blue-950 text-white shadow-blue-900/20'
                      }`}
                    >
                      {docTypeItem.key === 'selfie' ? (
                        <>
                          <Camera className="w-3.5 h-3.5" /> {registrationDoc ? 'Ambil Foto Ulang' : 'Ambil Foto via Kamera'}
                        </>
                      ) : registrationDoc ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5" /> Unggah Sanggahan
                        </>
                      ) : (
                        <>
                          <Upload className="w-3.5 h-3.5" /> Unggah Berkas
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Konfirmasi Unggah Berkas */}
      {pendingUpload && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-100 p-6 sm:p-7 animate-in zoom-in-95 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                  Konfirmasi Berkas Sanggahan
                </span>
                <h3 className="text-lg font-extrabold text-slate-900 leading-tight mt-0.5">
                  Konfirmasi Unggah Berkas
                </h3>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
              <div className="text-xs text-slate-500 font-medium">Kategori Dokumen:</div>
              <div className="text-xs font-bold text-slate-900">{pendingUpload.docLabel}</div>
              <div className="pt-2 border-t border-slate-200 flex items-start gap-2">
                <FileText className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-800 break-all">
                    {pendingUpload.file.name}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Ukuran: {formatSize(pendingUpload.file.size)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3.5 flex items-start gap-2.5 text-rose-800">
              <Lock className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <p className="text-xs leading-relaxed font-semibold">
                <strong>Perhatian:</strong> Berkas ini akan tersimpan sebagai <strong>Berkas Sanggahan</strong> dan akan <strong>langsung terkunci permanen</strong> (tidak dapat diubah atau diedit lagi).
              </p>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
              Yakin mengunggah <strong>&quot;{pendingUpload.file.name}&quot;</strong>?
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                disabled={isUploadingPending}
                onClick={() => setPendingUpload(null)}
                className="flex-1 py-3 px-4 border border-slate-300 hover:bg-slate-100 text-slate-700 font-extrabold text-xs sm:text-sm rounded-xl transition-all disabled:opacity-50"
              >
                Tidak
              </button>
              <button
                type="button"
                disabled={isUploadingPending}
                onClick={handleConfirmUpload}
                className="flex-1 py-3 px-4 bg-blue-900 hover:bg-blue-950 text-white font-extrabold text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isUploadingPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Mengunggah...
                  </>
                ) : (
                  'Ya, Unggah'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Pengambilan Foto Langsung via Kamera */}
      <SelfieLivenessModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onSuccess={() => {
          setToast({
            title: 'Foto Berhasil Diperbarui & Terkunci!',
            message: 'Foto selfie / pasfoto Anda telah berhasil diverifikasi liveness dan tersimpan permanen sebagai berkas sanggahan.',
            type: 'success',
          });
          loadDocuments();
        }}
      />

      {/* Toast Notification Dialog */}
      {toast && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl w-[90vw] max-w-sm shadow-2xl overflow-hidden border border-slate-100 p-6 text-center animate-in zoom-in-95">
            <div className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center mb-4 ${
              toast.type === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
            }`}>
              {toast.type === 'success' ? <CheckCircle2 className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">{toast.title}</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-6">{toast.message}</p>
            <button
              onClick={() => setToast(null)}
              className="w-full py-2.5 px-4 font-bold text-xs text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-md"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
