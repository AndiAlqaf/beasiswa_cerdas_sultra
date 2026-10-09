'use client';

import React, { useState, useEffect, useRef } from 'react';
import { fetchAPI } from '@/lib/api';
import { FileText, FileBadge, Calendar, HardDrive, Upload, ExternalLink, AlertCircle, Loader2, CheckCircle2, RefreshCw, XCircle, Camera, Lock, X, Check, RotateCw } from 'lucide-react';

interface DocumentInfo {
  id: string;
  docType: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  uploadedAt: string;
}

const isDocTypeMatch = (doc: DocumentInfo, targetKey: string) => {
  if (!doc || !targetKey) return false;
  const dbType = (doc.docType || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const tgt = targetKey.toLowerCase().replace(/[^a-z0-9]/g, '');

  // 1. Direct match
  if (dbType === tgt) return true;

  // 2. Controlled alias mapping based on docType ONLY (never match on user's arbitrary originalName)
  if (tgt === 'pernyataan' && (dbType === 'suratpernyataan' || dbType === 'pernyataan')) return true;
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
  const [jenjang, setJenjang] = useState<string>('S1');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [toast, setToast] = useState<{ title: string; message: string; type: 'success' | 'error' } | null>(null);

  // Camera Modal States for Selfie
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedSelfie, setCapturedSelfie] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [isUploadingSelfie, setIsUploadingSelfie] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const startCamera = async (mode: 'user' | 'environment' = 'user') => {
    setCameraLoading(true);
    setCameraError(null);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode,
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraError('Tidak dapat mengakses kamera. Pastikan izin kamera telah diberikan pada browser atau buka halaman ini melalui smartphone Anda.');
    } finally {
      setCameraLoading(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const openCameraModal = () => {
    setCapturedSelfie(null);
    setCameraError(null);
    setIsCameraModalOpen(true);
    setTimeout(() => {
      startCamera(facingMode);
    }, 150);
  };

  const closeCameraModal = () => {
    stopCamera();
    setCapturedSelfie(null);
    setIsCameraModalOpen(false);
  };

  const handleCapturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      if (facingMode === 'user') {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setCapturedSelfie(dataUrl);
      stopCamera();
    }
  };

  const handleRetakePhoto = () => {
    setCapturedSelfie(null);
    startCamera(facingMode);
  };

  const handleSwitchCamera = () => {
    const nextMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  const handleUploadCapturedSelfie = async () => {
    if (!capturedSelfie) return;
    setIsUploadingSelfie(true);
    try {
      const res = await fetch(capturedSelfie);
      const blob = await res.blob();
      const token = localStorage.getItem('bssc_access_token');
      const formData = new FormData();
      formData.append('file', blob, 'selfie_kamera.jpg');

      const uploadRes = await fetch('/api/v1/applicant/upload/selfie', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await uploadRes.json();
      if (!uploadRes.ok || !data.success) {
        throw new Error(data.message || 'Gagal menyimpan foto selfie.');
      }

      setToast({
        title: 'Foto Berhasil Diambil & Disimpan!',
        message: 'Foto selfie / pasfoto Anda telah tersimpan langsung dari kamera dan kini terkunci.',
        type: 'success',
      });

      closeCameraModal();
      await loadDocuments();
    } catch (err: any) {
      setToast({
        title: 'Gagal Menyimpan Foto',
        message: err.message || 'Terjadi kesalahan saat mengunggah foto.',
        type: 'error',
      });
    } finally {
      setIsUploadingSelfie(false);
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const documentTypes = [
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
    { key: 'pendukung', label: 'Berkas Sertifikat & Pendukung Lain', desc: 'Sertifikat keahlian, prestasi, atau dokumen pendukung tambahan.', required: false, accept: '.pdf,.png,.jpg,.jpeg' },
  ];

  const loadDocuments = async () => {
    try {
      const res = await fetchAPI('/applicant/profile');
      if (res.success && res.data) {
        setDocuments(res.data.documents || []);
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

    // Check size limit (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setToast({
        title: 'Ukuran File Terlalu Besar',
        message: `Ukuran file ${file.name} melebihi batas maksimum 5MB. Silakan kompres file Anda.`,
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

      {/* Grid Dokumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {documentTypes.map((docTypeItem) => {
          const matchingDocs = documents.filter((d) => isDocTypeMatch(d, docTypeItem.key));
          const uploadedDoc = matchingDocs[matchingDocs.length - 1]; // Latest uploaded file
          const hasMultipleVersions = matchingDocs.length > 1;
          const isUploading = uploadingKey === docTypeItem.key;

          return (
            <div
              key={docTypeItem.key}
              className={`rounded-3xl p-6 transition-all flex flex-col justify-between border ${
                uploadedDoc
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
                    <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                      uploadedDoc
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                        : docTypeItem.required
                        ? 'bg-amber-100 text-amber-800 border-amber-200'
                        : 'bg-slate-200 text-slate-600 border-slate-300'
                    }`}>
                      {uploadedDoc ? '✓ Tersimpan' : docTypeItem.required ? 'Wajib Unggah' : 'Opsional'}
                    </span>
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
                  disabled={isUploading || (docTypeItem.key === 'selfie' && !!uploadedDoc)}
                  onClick={() => {
                    if (docTypeItem.key === 'selfie' && !uploadedDoc) {
                      openCameraModal();
                    } else {
                      handleTriggerUpload(docTypeItem.key);
                    }
                  }}
                  className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 ${
                    docTypeItem.key === 'selfie' && uploadedDoc
                      ? 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed shadow-none'
                      : docTypeItem.key === 'selfie' && !uploadedDoc
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
                  ) : docTypeItem.key === 'selfie' && uploadedDoc ? (
                    <>
                      <Lock className="w-3.5 h-3.5" /> Terkunci (SOP Foto)
                    </>
                  ) : docTypeItem.key === 'selfie' && !uploadedDoc ? (
                    <>
                      <Camera className="w-3.5 h-3.5" /> Ambil Foto via Kamera
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



      {/* Modal Pengambilan Foto Langsung via Kamera */}
      {isCameraModalOpen && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="bg-slate-900 text-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-800 flex flex-col animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/40">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Ambil Pasfoto / Selfie Langsung</h3>
                  <p className="text-[11px] text-slate-400">Wajib diambil langsung dari kamera live (bukan upload galeri)</p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeCameraModal}
                disabled={isUploadingSelfie}
                className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Viewfinder / Camera Screen */}
            <div className="relative aspect-[4/3] w-full bg-black flex items-center justify-center overflow-hidden">
              {capturedSelfie ? (
                /* Pratinjau Foto yang Ditangkap */
                <div className="relative w-full h-full">
                  <img
                    src={capturedSelfie}
                    alt="Pratinjau Selfie"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 bg-emerald-600/90 backdrop-blur-sm text-white text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-md">
                    <Check className="w-3.5 h-3.5" /> Foto Berhasil Ditangkap
                  </div>
                </div>
              ) : cameraError ? (
                /* Pesan Error Kamera */
                <div className="p-6 text-center max-w-sm space-y-3">
                  <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
                  <p className="text-xs text-rose-300 leading-relaxed">{cameraError}</p>
                  <button
                    type="button"
                    onClick={() => startCamera(facingMode)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-xl text-white inline-flex items-center gap-1.5"
                  >
                    <RotateCw className="w-3.5 h-3.5" /> Coba Lagi
                  </button>
                </div>
              ) : (
                /* Live Camera Stream */
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full object-cover ${facingMode === 'user' ? '-scale-x-100' : ''}`}
                  />

                  {/* Oval Face Guide Overlay */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <div className="w-44 h-56 border-2 border-dashed border-emerald-400/90 rounded-[50%] shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]" />
                    <span className="mt-3 text-[11px] font-medium text-emerald-200 bg-black/70 px-3 py-1 rounded-full backdrop-blur-sm">
                      Posisikan wajah Anda di dalam bingkai oval
                    </span>
                  </div>

                  {cameraLoading && (
                    <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center space-y-2">
                      <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
                      <p className="text-xs text-slate-300">Menghubungkan ke kamera...</p>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Modal Controls Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between gap-3">
              {capturedSelfie ? (
                <>
                  <button
                    type="button"
                    onClick={handleRetakePhoto}
                    disabled={isUploadingSelfie}
                    className="flex-1 py-2.5 px-4 text-xs font-bold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors flex items-center justify-center gap-2"
                  >
                    <RotateCw className="w-3.5 h-3.5" /> Ulangi Foto
                  </button>
                  <button
                    type="button"
                    onClick={handleUploadCapturedSelfie}
                    disabled={isUploadingSelfie}
                    className="flex-1 py-2.5 px-4 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2"
                  >
                    {isUploadingSelfie ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Menyimpan Foto...
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" /> Gunakan & Simpan Foto
                      </>
                    )}
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleSwitchCamera}
                    disabled={cameraLoading || !!cameraError}
                    className="py-2 px-3 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1.5"
                    title="Ganti Kamera Depan/Belakang"
                  >
                    <RotateCw className="w-3.5 h-3.5" /> Ganti Kamera
                  </button>

                  <button
                    type="button"
                    onClick={handleCapturePhoto}
                    disabled={cameraLoading || !!cameraError}
                    className="py-2.5 px-6 text-xs font-bold rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all shadow-lg shadow-emerald-500/25 flex items-center gap-2"
                  >
                    <Camera className="w-4 h-4" /> Ambil Foto
                  </button>

                  <button
                    type="button"
                    onClick={closeCameraModal}
                    className="py-2 px-3 text-xs font-semibold rounded-xl bg-transparent hover:bg-slate-800 text-slate-400 transition-colors"
                  >
                    Batal
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

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
