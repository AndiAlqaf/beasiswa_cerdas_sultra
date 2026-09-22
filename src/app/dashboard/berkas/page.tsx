'use client';

import React, { useState, useEffect } from 'react';
import { fetchAPI } from '@/lib/api';
import { FileText, FileBadge, Calendar, HardDrive, Download, AlertCircle, Loader2 } from 'lucide-react';
import { TEMPLATE_DOCUMENTS } from '@/data/bsscData';

interface DocumentInfo {
  id: string;
  docType: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  uploadedAt: string;
}

export default function BerkasPage() {
  const [documents, setDocuments] = useState<DocumentInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadDocuments() {
      try {
        const res = await fetchAPI('/applicant/profile');
        if (res.success && res.data) {
          setDocuments(res.data.documents || []);
        } else {
          setError(res.message || 'Gagal memuat dokumen.');
        }
      } catch (err: any) {
        setError(err.message || 'Terjadi kesalahan sistem.');
      } finally {
        setLoading(false);
      }
    }
    loadDocuments();
  }, []);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getDocTypeName = (docType: string) => {
    switch (docType) {
      case 'ktm': return 'KTM / Surat Aktif Kuliah';
      case 'selfie': return 'Pasfoto / Selfie KTP';
      case 'transkrip': return 'Transkrip Nilai Akademik';
      case 'pernyataan': return 'Surat Pernyataan';
      case 'dtks': return 'Bukti DTKS / KIP';
      case 'ktp': return 'Kartu Tanda Penduduk';
      case 'kk': return 'Kartu Keluarga';
      case 'suket': return 'Surat Keterangan';
      default: return docType.toUpperCase();
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
      <div className="bg-red-50 text-red-700 p-6 rounded-2xl flex items-start gap-4">
        <AlertCircle className="w-6 h-6 shrink-0" />
        <div>
          <h3 className="font-bold mb-1">Gagal Memuat Berkas</h3>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Berkasku</h1>
          <p className="text-sm text-slate-500 mt-1">
            Daftar seluruh dokumen persyaratan yang telah berhasil Anda unggah.
          </p>
        </div>
      </div>

      {documents.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-sm">
          <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900 mb-2">Belum Ada Berkas</h3>
          <p className="text-slate-500 text-sm max-w-md mx-auto">
            Anda belum mengunggah berkas apapun. Silakan lanjutkan pengisian formulir pendaftaran pada tahap "Unggah Berkas".
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {documents.map((doc) => (
            <div key={doc.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between h-full">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <FileBadge className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                      Tersimpan
                    </span>
                    <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded uppercase">
                      {doc.mimeType.split('/')[1] || 'FILE'}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-base leading-tight">
                    {getDocTypeName(doc.docType)}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 truncate" title={doc.originalName}>
                    {doc.originalName}
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-3 flex flex-wrap gap-4 text-xs font-medium text-slate-600 mt-auto border border-slate-100">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  {new Date(doc.uploadedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
                <div className="flex items-center gap-1.5">
                  <HardDrive className="w-4 h-4 text-slate-400" />
                  {formatSize(doc.fileSize)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
