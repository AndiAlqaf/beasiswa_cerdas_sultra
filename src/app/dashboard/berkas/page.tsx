'use client';

import React, { useState, useEffect, useRef } from 'react';
import { fetchAPI } from '@/lib/api';
import { FileText, FileBadge, Calendar, HardDrive, Upload, ExternalLink, AlertCircle, Loader2, CheckCircle2, RefreshCw, XCircle } from 'lucide-react';

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
  const dbName = (doc.originalName || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const tgt = targetKey.toLowerCase().replace(/[^a-z0-9]/g, '');

  if (dbType === tgt || (dbType && (dbType.includes(tgt) || tgt.includes(dbType)))) return true;

  if (tgt.includes('transkrip') && (dbType.includes('transkrip') || dbName.includes('transkrip'))) return true;
  if ((tgt.includes('ktm') || tgt.includes('aktif')) && (dbType.includes('ktm') || dbType.includes('aktif') || dbName.includes('ktm') || dbName.includes('aktif'))) return true;
  if ((tgt.includes('selfie') || tgt.includes('pasfoto')) && (dbType.includes('selfie') || dbType.includes('pasfoto') || dbName.includes('selfie') || dbName.includes('pasfoto'))) return true;
  if (tgt.includes('pernyataan') && (dbType.includes('pernyataan') || dbName.includes('pernyataan'))) return true;
  if ((tgt.includes('dtks') || tgt.includes('kip')) && (dbType.includes('dtks') || dbType.includes('kip') || dbName.includes('dtks') || dbName.includes('kip'))) return true;
  if ((tgt.includes('ktp') || tgt.includes('kk')) && (dbType.includes('ktp') || dbType.includes('kk') || dbName.includes('ktp') || dbName.includes('kk'))) return true;

  return false;
};

const DOCUMENT_TYPES = [
  { key: 'ktm', label: 'KTM / Surat Aktif Kuliah', desc: 'Salinan Kartu Tanda Mahasiswa (KTM) aktif atau Surat Keterangan Aktif Kuliah.', required: true, accept: '.pdf,.png,.jpg,.jpeg' },
  { key: 'selfie', label: 'Pasfoto / Selfie KTP', desc: 'Foto formal atau selfie memegang KTP dengan latar belakang jelas.', required: true, accept: '.png,.jpg,.jpeg' },
  { key: 'transkrip', label: 'Transkrip Nilai Akademik', desc: 'Transkrip nilai semester terakhir yang disahkan stempel basah fakultas/prodi.', required: true, accept: '.pdf,.png,.jpg,.jpeg' },
  { key: 'pernyataan', label: 'Surat Pernyataan Bebas Beasiswa Lain', desc: 'Surat Pernyataan resmi bermaterai Rp 10.000 tidak sedang menerima beasiswa lain.', required: true, accept: '.pdf,.png,.jpg,.jpeg' },
  { key: 'dtks', label: 'Bukti DTKS / KIP / Suket Kurang Mampu', desc: 'Kartu Indonesia Pintar, Bukti Terdaftar DTKS Kemensos, atau Surat Keterangan Tidak Mampu.', required: false, accept: '.pdf,.png,.jpg,.jpeg' },
  { key: 'ktp', label: 'Kartu Tanda Penduduk (KTP)', desc: 'Scan KTP asli domisili Kabupaten/Kota Sulawesi Tenggara.', required: true, accept: '.pdf,.png,.jpg,.jpeg' },
  { key: 'pendukung', label: 'Berkas Sertifikat & Pendukung Lain', desc: 'Sertifikat keahlian, prestasi, atau dokumen pendukung tambahan.', required: false, accept: '.pdf,.png,.jpg,.jpeg' },
];

export default function BerkasPage() {
  const [documents, setDocuments] = useState<DocumentInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [toast, setToast] = useState<{ title: string; message: string; type: 'success' | 'error' } | null>(null);

  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const loadDocuments = async () => {
    try {
      const res = await fetchAPI('/applicant/profile');
      if (res.success && res.data) {
        setDocuments(res.data.documents || []);
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

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/applicant/upload/${docKey}`, {
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
        {DOCUMENT_TYPES.map((docTypeItem) => {
          const uploadedDoc = documents.find((d) => isDocTypeMatch(d, docTypeItem.key));
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
                  <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-100 space-y-2 mb-4">
                    <p className="text-xs font-semibold text-slate-800 truncate" title={uploadedDoc.originalName}>
                      📄 {uploadedDoc.originalName}
                    </p>
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
                  onClick={() => handleTriggerUpload(docTypeItem.key)}
                  className={`flex-1 py-2 px-3 text-xs font-bold text-white rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 ${
                    isUploading
                      ? 'bg-slate-400 cursor-not-allowed'
                      : uploadedDoc
                      ? 'bg-slate-800 hover:bg-slate-900'
                      : 'bg-blue-900 hover:bg-blue-950'
                  }`}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Mengunggah...
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
