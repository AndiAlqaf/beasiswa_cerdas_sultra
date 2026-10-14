'use client';

import React, { useState, useEffect, useRef } from 'react';
import { fetchAPI } from '@/lib/api';
import { FileText, FileBadge, Calendar, HardDrive, Upload, ExternalLink, AlertCircle, Loader2, CheckCircle2, RefreshCw, XCircle, Camera, Lock } from 'lucide-react';
import SelfieLivenessModal from '@/components/SelfieLivenessModal';

interface DocumentInfo {
  id: string;
  docType: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  uploadedAt: string;
  isMissing?: boolean;
}

const isDocTypeMatch = (doc: DocumentInfo, targetKey: string) => {
  if (!doc || !targetKey) return false;
  const dbType = (doc.docType || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const tgt = targetKey.toLowerCase().replace(/[^a-z0-9]/g, '');

  // 1. Direct match
  if (dbType === tgt) return true;

  // 2. Controlled alias mapping based on docType ONLY (never match on user's arbitrary originalName)
  if (tgt === 'pernyataan' && (dbType === 'suratpernyataan' || dbType === 'filesuratpernyataan' || dbType === 'pernyataan')) return true;
  if (tgt === 'suratpermohonan' && (dbType === 'filesuratpermohonan' || dbType === 'suratpermohonan')) return true;
  if (tgt === 'esai' && (dbType === 'filemotivationoresai' || dbType === 'motivationletter' || dbType === 'esai')) return true;
  if (tgt === 'selfie' && (dbType === 'pasfoto' || dbType === 'filepasfoto' || dbType === 'selfie')) return true;
  if (tgt === 'ktm' && (dbType === 'surataktif' || dbType === 'filesurataktif' || dbType === 'ktm')) return true;
  if (tgt === 'ktp' && (dbType === 'filektp' || dbType === 'ktp')) return true;
  if (tgt === 'transkrip' && (dbType === 'filetranskrip' || dbType === 'transkrip')) return true;
  if (tgt === 'dtks' && (dbType === 'filedtks' || dbType === 'dtks' || dbType === 'kip')) return true;
  if (tgt === 'pendukung' && dbType === 'pendukung') return true;

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
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [toast, setToast] = useState<{ title: string; message: string; type: 'success' | 'error' } | null>(null);

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
      label: jenjang === 'S2' ? 'Ijazah & Transkrip Nilai S1' : jenjang === 'S3' ? 'Ijazah & Transkrip S1 & S2' : 'Bukti DTKS / KIP / Suket Kurang Mampu', 
      desc: jenjang === 'S2' ? 'Salinan ijazah dan transkrip nilai jenjang Sarjana (S1).' : jenjang === 'S3' ? 'Salinan ijazah dan transkrip jenjang S1 & Magister (S2).' : 'Kartu Indonesia Pintar, Bukti Terdaftar DTKS Kemensos, atau Surat Keterangan Tidak Mampu.', 
      required: false, 
      accept: '.pdf,.png,.jpg,.jpeg' 
    },
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

  const handleResubmit = async () => {
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

  useEffect(() => {
    loadDocuments();
  }, []);

  const formatSize = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleTriggerUpload = (docKey: string) => {
    if (fileInputRefs.current[docKey]) {
      fileInputRefs.current[docKey]?.click();
    }
  };

  const handleFileChange = async (docKey: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (max 10MB — must match backend MAX_FILE_SIZES)
    if (file.size > 10 * 1024 * 1024) {
      setToast({
        title: 'Ukuran File Terlalu Besar',
        message: `Ukuran file ${file.name} melebihi batas maksimum 10MB. Silakan kompres file Anda.`,
        type: 'error',
      });
      e.target.value = '';
      return;
    }

    setUploadingKey(docKey);
    try {
      const token = localStorage.getItem('bssc_access_token');
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`/api/v1/applicant/upload/${docKey}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Gagal mengunggah berkas.');
      }

      setToast({
        title: 'Berkas Berhasil Diperbarui!',
        message: `Dokumen ${file.name} telah berhasil diunggah dan tersimpan di server.`,
        type: 'success',
      });

      await loadDocuments();
    } catch (err: any) {
      setToast({
        title: 'Gagal Mengunggah Berkas',
        message: err.message || 'Terjadi kesalahan saat mengunggah file.',
        type: 'error',
      });
    } finally {
      setUploadingKey(null);
      if (e.target) e.target.value = '';
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
            Anda dapat memperbarui atau mengganti berkas yang buram / belum sesuai di halaman ini kapan saja, terutama saat mengajukan <strong>sanggahan</strong>.
          </p>
        </div>
      </div>

      {applicationStatus === 'PERLU_UNGGAH_ULANG' && (() => {
        const hasValidKtm = documents.some((d) => isDocTypeMatch(d, 'ktm') && !d.isMissing);
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
                  Berkas KTM/Surat Aktif Kuliah Anda tidak terbaca di sistem. Unggah ulang pada kartu <strong>KTM</strong> di bawah, lalu tekan tombol kirim ulang. Nomor registrasi Anda <strong>tidak berubah</strong>.
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

      {/* Banner Peringatan Berkas Hilang */}
      {missingDocuments && missingDocuments.length > 0 && (
        <div className="bg-gradient-to-r from-rose-50 to-amber-50 border-2 border-rose-300 rounded-3xl p-6 shadow-md flex items-start gap-4 animate-in fade-in">
          <div className="p-3 bg-rose-600 text-white rounded-2xl shadow-xs shrink-0">
            <AlertCircle className="w-6 h-6 animate-pulse" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-extrabold text-rose-950">
              Perhatian: Beberapa Berkas Anda Perlu Diunggah Ulang
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
              Dokumen dengan label <span className="font-extrabold text-rose-700 bg-rose-100 px-2 py-0.5 rounded">⚠️ File Perlu Diunggah Ulang</span> di bawah mengalami kendala sinkronisasi pada server. Mohon pilih dan unggah kembali berkas fisik yang sesuai.
            </p>
          </div>
        </div>
      )}

      {/* Grid Dokumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {documentTypes.map((docTypeItem) => {
          const matchingDocs = documents.filter((d) => isDocTypeMatch(d, docTypeItem.key));
          const presentDocs = matchingDocs.filter((d) => !d.isMissing);
          const uploadedDoc = presentDocs.length > 0 ? presentDocs[presentDocs.length - 1] : matchingDocs[matchingDocs.length - 1]; // Latest physically-present file
          const hasMultipleVersions = presentDocs.length > 1;
          const isUploading = uploadingKey === docTypeItem.key;
          const isFileMissing = uploadedDoc ? !!uploadedDoc.isMissing : missingDocuments.some(mKey => isDocTypeMatch({ docType: mKey } as any, docTypeItem.key));
          // Pasfoto / Selfie boleh ditake ulang kapan saja melalui kamera live ber-liveness detection (SOP anti-pemalsuan).
          const isSelfieLocked = false;

          return (
            <div
              key={docTypeItem.key}
              className={`rounded-3xl p-6 transition-all flex flex-col justify-between border ${
                isFileMissing
                  ? 'bg-rose-50/40 border-rose-300 shadow-sm ring-1 ring-rose-200'
                  : uploadedDoc
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
                    {isFileMissing ? (
                      <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border bg-rose-600 text-white border-rose-700 shadow-2xs animate-pulse">
                        ⚠️ File Perlu Diunggah Ulang
                      </span>
                    ) : (
                      <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                        uploadedDoc
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                          : docTypeItem.required
                          ? 'bg-amber-100 text-amber-800 border-amber-200'
                          : 'bg-slate-200 text-slate-600 border-slate-300'
                      }`}>
                        {uploadedDoc ? '✓ Tersimpan' : docTypeItem.required ? 'Wajib Unggah' : 'Opsional'}
                      </span>
                    )}
                    {hasMultipleVersions && (
                      <span className="text-[10px] font-extrabold uppercase bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full">
                        🆕 Sanggahan Baru (#{matchingDocs.length})
                      </span>
                    )}
                    {uploadedDoc && (
                      <span className="text-[10px] font-mono uppercase bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                        {uploadedDoc.mimeType.split('/')[1] || 'FILE'}
                      </span>
                    )}
                  </div>
                </div>

                {isFileMissing && (
                  <div className="p-3 bg-rose-100/80 border border-rose-300 rounded-2xl flex items-center gap-2 text-rose-900 text-xs font-bold mb-3 shadow-2xs">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>File fisik dokumen ini belum terbaca di server. Silakan pilih & unggah ulang file ini.</span>
                  </div>
                )}

                {/* Doc Title & Description */}
                <h3 className="font-bold text-slate-900 text-base mb-1">{docTypeItem.label}</h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">{docTypeItem.desc}</p>

                {/* Uploaded File Details (If Available) */}
                {uploadedDoc ? (
                  <div className="space-y-2 mb-4">
                    <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-slate-800 truncate" title={uploadedDoc.originalName}>
                          📄 {uploadedDoc.originalName}
                        </p>
                        {hasMultipleVersions && (
                          <span className="text-[9px] font-bold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
                            Unggahan Terbaru
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-[11px] text-slate-500 font-medium">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {new Date(uploadedDoc.uploadedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                        <span className="flex items-center gap-1">
                          <HardDrive className="w-3.5 h-3.5 text-slate-400" />
                          {formatSize(uploadedDoc.fileSize)}
                        </span>
                      </div>
                    </div>

                    {hasMultipleVersions && (
                      <div className="p-2.5 bg-amber-50/80 rounded-xl border border-amber-200 text-[11px] text-amber-900">
                        <p className="font-bold mb-1">Riwayat Berkas Sanggahan ({matchingDocs.length} File):</p>
                        <div className="space-y-1">
                          {matchingDocs.map((mDoc, idx) => (
                            <div key={mDoc.id} className="flex items-center justify-between text-[10px]">
                              <span className="truncate max-w-[200px]">
                                {idx === matchingDocs.length - 1 ? '🆕' : '📁'} #{idx + 1}: {mDoc.originalName}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleViewDocument(mDoc.id)}
                                className="text-blue-700 font-bold hover:underline"
                              >
                                Lihat
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 bg-amber-50/50 border border-amber-200/60 rounded-2xl text-[11px] text-amber-800 leading-relaxed mb-4">
                    Belum ada dokumen yang diunggah untuk kategori ini.
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-3 border-t border-slate-100 mt-auto">
                {uploadedDoc && (
                  <button
                    type="button"
                    onClick={() => handleViewDocument(uploadedDoc.id)}
                    className="flex-1 py-2 px-3 text-xs font-bold bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-xl transition-colors flex items-center justify-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Lihat File
                  </button>
                )}

                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => {
                    if (docTypeItem.key === 'selfie') {
                      setIsCameraModalOpen(true);
                    } else {
                      handleTriggerUpload(docTypeItem.key);
                    }
                  }}
                  className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 ${
                    docTypeItem.key === 'selfie'
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20'
                      : isUploading
                      ? 'bg-slate-400 cursor-not-allowed text-white'
                      : uploadedDoc
                      ? 'bg-slate-800 hover:bg-slate-900 text-white'
                      : 'bg-blue-900 hover:bg-blue-950 text-white'
                  }`}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Mengunggah...
                    </>
                  ) : docTypeItem.key === 'selfie' ? (
                    <>
                      <Camera className="w-3.5 h-3.5" /> {uploadedDoc ? 'Ambil Ulang Foto via Kamera' : 'Ambil Foto via Kamera'}
                    </>
                  ) : uploadedDoc ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5" /> Ganti / Unggah Ulang
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5" /> Unggah Berkas
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>



      {/* Modal Pengambilan Foto Langsung via Kamera (Liveness Detection: Hadap Kanan, Kiri, Senyum) */}
      <SelfieLivenessModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onSuccess={() => {
          setToast({
            title: 'Foto Berhasil Diperbarui!',
            message: 'Foto selfie / pasfoto Anda telah berhasil diverifikasi liveness dan tersimpan ke sistem.',
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
