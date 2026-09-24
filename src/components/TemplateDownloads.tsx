'use client';

import React, { useState } from 'react';
import { TEMPLATE_DOCUMENTS } from '@/data/bsscData';
import { Download, FileText, CheckCircle2, FileCheck, ShieldAlert } from 'lucide-react';

export default function TemplateDownloads() {
  const [downloadedIds, setDownloadedIds] = useState<string[]>([]);

  const handleSimulatedDownload = (docTitle: string, docId: string, downloadUrl?: string) => {
    if (downloadUrl && downloadUrl !== '#') {
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = decodeURIComponent(downloadUrl.split('/').pop() || `${docId}.docx`);
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      if (!downloadedIds.includes(docId)) {
        setDownloadedIds([...downloadedIds, docId]);
      }
      return;
    }

    // Generate text content for download simulation
    const sampleContent = `===========================================================
PEMERINTAH PROVINSI SULAWESI TENGGARA
BEASISWA STIMULAN SULTRA CERDAS (BSSC) TAHUN ANGGARAN 2026
===========================================================

DOKUMEN RESMI TEMPLATE: ${docTitle}

PETUNJUK PENGISIAN:
1. Isilah data identitas diri secara lengkap sesuai KTP Sulawesi Tenggara.
2. Gunakan materai Rp10.000 khusus untuk Surat Pernyataan Tidak Sedang Menerima Beasiswa Penuh Lain.
3. Pastikan format fisik yang dicetak dan diunggah dapat dibaca jelas oleh sistem validasi.
4. Lampirkan dokumen ini pada menu pendaftaran di portal resmi BSSC 2026 (www.akusahabatrakyat.com).

Website Resmi: www.akusahabatrakyat.com
Penyelenggara: Pemerintah Provinsi Sulawesi Tenggara
===========================================================`;

    const blob = new Blob([sampleContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${docId}-BSSC-2026.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    if (!downloadedIds.includes(docId)) {
      setDownloadedIds([...downloadedIds, docId]);
    }
  };

  return (
    <section id="template-berkas" className="py-12 bg-white">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Unduh Format & Template Berkas Pendaftaran
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Gunakan format dokumen acuan resmi dari Lampiran Petunjuk Teknis BSSC 2026 untuk menghindari pembatalan kelulusan berkas administrasi.
          </p>
        </div>

        {/* Templates Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TEMPLATE_DOCUMENTS.map((doc) => {
            const isDownloaded = downloadedIds.includes(doc.id);
            return (
              <div
                key={doc.id}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-6"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-900 flex items-center justify-center font-bold text-xs border border-blue-100">
                      {doc.fileType}
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {doc.fileSize}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 text-base mb-1">{doc.title}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">{doc.description}</p>
                  </div>

                  <div className="pt-2">
                    <span className="text-[11px] font-semibold text-blue-900 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-md inline-block">
                      {doc.requiredFor}
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <button
                    onClick={() => handleSimulatedDownload(doc.title, doc.id, doc.downloadUrl)}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                      isDownloaded
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-blue-900 hover:bg-blue-950 text-white shadow-xs'
                    }`}
                  >
                    {isDownloaded ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        Telah Diunduh
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        Unduh Template Document ({doc.fileType})
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Warning Callout Box */}
        <div className="mt-12 bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-4 text-amber-950">
          <ShieldAlert className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed space-y-1">
            <h4 className="font-bold text-sm text-amber-900">Ketentuan Penting Penandatanganan & Materai:</h4>
            <p>
              • <strong>Surat Pernyataan Bebas Beasiswa Lain</strong> wajib ditempeli <strong>Materai Rp10.000</strong> fisik yang sah dan ditandatangani oleh pendaftar.<br />
              • Hasil scan/foto surat pernyataan harus terbaca jelas dan tidak buram sebelum diunggah ke sistem pendaftaran.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
