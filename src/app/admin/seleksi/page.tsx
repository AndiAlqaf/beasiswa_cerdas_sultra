'use client';

import React, { useState } from 'react';
import { CheckCircle2, XCircle, Clock, FileText, ExternalLink, Search, X } from 'lucide-react';

export default function SeleksiPage() {
  const [selectedApplicant, setSelectedApplicant] = useState<any>(null);
  const applicants = [
    { 
      id: 'REG-2026-001', 
      name: 'Ahmad Dani', 
      univ: 'Universitas Halu Oleo',
      jenjang: 'S1/D4',
      score: 85,
      documents: [
        { name: 'KTP & KK', status: 'valid' },
        { name: 'KHS Terakhir', status: 'valid' },
        { name: 'Surat Keterangan Aktif', status: 'pending' },
        { name: 'Sertifikat Prestasi', status: 'invalid' }
      ]
    },
    { 
      id: 'REG-2026-005', 
      name: 'Andi Saputra', 
      univ: 'Universitas Sulawesi Tenggara',
      jenjang: 'S2',
      score: 72,
      documents: [
        { name: 'KTP & KK', status: 'valid' },
        { name: 'KHS Terakhir', status: 'pending' },
        { name: 'Surat Keterangan Aktif', status: 'pending' },
        { name: 'Sertifikat Prestasi', status: 'pending' }
      ]
    },
    { 
      id: 'REG-2026-012', 
      name: 'Budi Santoso', 
      univ: 'Universitas Muhammadiyah Kendari',
      jenjang: 'S1/D4',
      score: 91,
      documents: [
        { name: 'KTP & KK', status: 'valid' },
        { name: 'KHS Terakhir', status: 'valid' },
        { name: 'Surat Keterangan Aktif', status: 'valid' },
        { name: 'Sertifikat Prestasi', status: 'valid' }
      ]
    },
    { 
      id: 'REG-2026-024', 
      name: 'Citra Kirana', 
      univ: 'Universitas Halu Oleo',
      jenjang: 'S3',
      score: 88,
      documents: [
        { name: 'KTP & KK', status: 'valid' },
        { name: 'KHS Terakhir', status: 'valid' },
        { name: 'Surat Keterangan Aktif', status: 'pending' },
        { name: 'Sertifikat Prestasi', status: 'valid' }
      ]
    },
    { 
      id: 'REG-2026-031', 
      name: 'Deni Setiawan', 
      univ: 'Institut Agama Islam Negeri Kendari',
      jenjang: 'S1/D4',
      score: 65,
      documents: [
        { name: 'KTP & KK', status: 'invalid' },
        { name: 'KHS Terakhir', status: 'valid' },
        { name: 'Surat Keterangan Aktif', status: 'invalid' },
        { name: 'Sertifikat Prestasi', status: 'invalid' }
      ]
    },
    { 
      id: 'REG-2026-042', 
      name: 'Eka Putri', 
      univ: 'Universitas Dayanu Ikhsanuddin',
      jenjang: 'S1/D4',
      score: 79,
      documents: [
        { name: 'KTP & KK', status: 'valid' },
        { name: 'KHS Terakhir', status: 'pending' },
        { name: 'Surat Keterangan Aktif', status: 'valid' },
        { name: 'Sertifikat Prestasi', status: 'pending' }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Verifikasi & Seleksi</h2>
          <p className="text-slate-500">Verifikasi kelengkapan berkas dan tentukan kelulusan pendaftar.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <select className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm w-full sm:w-auto">
            <option value="">Semua Jenjang</option>
            <option value="S1/D4">S1 / D4</option>
            <option value="S2">S2</option>
            <option value="S3">S3</option>
          </select>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari pendaftar..." 
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm w-full sm:w-64"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="p-4 whitespace-nowrap">ID Pendaftaran</th>
                <th className="p-4 whitespace-nowrap">Nama & Asal PT</th>
                <th className="p-4">Kelengkapan Berkas</th>
                <th className="p-4 text-center whitespace-nowrap">Skor</th>
                <th className="p-4 text-center whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {applicants.map((applicant, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 align-middle">
                    <span className="text-xs font-mono font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">{applicant.id}</span>
                    <div className="mt-2">
                      <span className="text-[10px] font-bold text-[#0B3A6A] bg-blue-100 px-2 py-0.5 rounded-md border border-blue-200">{applicant.jenjang}</span>
                    </div>
                  </td>
                  <td className="p-4 align-middle">
                    <p className="font-bold text-slate-900 whitespace-nowrap">{applicant.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5 whitespace-nowrap">{applicant.univ}</p>
                  </td>
                  <td className="p-4 align-middle">
                    <div className="flex flex-wrap gap-2">
                      {applicant.documents.map((doc, docIdx) => (
                        <div key={docIdx} className="flex items-center gap-1.5 text-[10px] sm:text-xs font-medium px-2 py-1 rounded-md border bg-white shadow-sm" title={doc.name}>
                          {doc.status === 'valid' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                          {doc.status === 'invalid' && <XCircle className="w-3.5 h-3.5 text-rose-500" />}
                          {doc.status === 'pending' && <Clock className="w-3.5 h-3.5 text-amber-500" />}
                          <span className="text-slate-600 truncate max-w-[120px]">{doc.name}</span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="p-4 align-middle text-center">
                    <div className="inline-block bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm">
                      <p className="text-lg font-black text-blue-600 leading-none">{applicant.score}</p>
                    </div>
                  </td>
                  <td className="p-4 align-middle">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => setSelectedApplicant(applicant)}
                        className="px-3 py-2 bg-slate-50 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-bold border border-slate-200" 
                        title="Lihat Detail"
                      >
                        <ExternalLink className="w-4 h-4" /> Detail
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Detail Berkas */}
      {selectedApplicant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Detail Berkas Pendaftar</h3>
                <p className="text-sm text-slate-500 mt-1">ID: {selectedApplicant.id}</p>
              </div>
              <button 
                onClick={() => setSelectedApplicant(null)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {/* Applicant Info */}
              <div className="flex items-center gap-4 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                <div className="flex-1">
                  <h4 className="font-bold text-slate-900 text-lg">{selectedApplicant.name}</h4>
                  <p className="text-sm text-slate-600">{selectedApplicant.univ} • Jenjang {selectedApplicant.jenjang}</p>
                </div>
                <div className="text-center bg-white px-4 py-2 rounded-lg border border-blue-200 shadow-sm">
                  <span className="block text-[10px] font-bold text-slate-500 uppercase">Skor</span>
                  <span className="block text-2xl font-black text-blue-600 leading-none">{selectedApplicant.score}</span>
                </div>
              </div>

              {/* Documents List */}
              <div>
                <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-slate-500" />
                  Daftar Berkas Unggahan
                </h4>
                <div className="space-y-3">
                  {selectedApplicant.documents.map((doc: any, docIdx: number) => (
                    <div key={docIdx} className="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-blue-200 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3">
                        {doc.status === 'valid' && <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />}
                        {doc.status === 'invalid' && <XCircle className="w-6 h-6 text-rose-500 shrink-0" />}
                        {doc.status === 'pending' && <Clock className="w-6 h-6 text-amber-500 shrink-0" />}
                        <div>
                          <p className="font-medium text-slate-800">{doc.name}</p>
                          <p className="text-xs text-slate-500 mt-0.5 capitalize">Status: {doc.status}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => window.open('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', '_blank')}
                        className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors flex items-center gap-2 shadow-sm"
                      >
                        <ExternalLink className="w-4 h-4" /> Buka Berkas
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button 
                onClick={() => setSelectedApplicant(null)}
                className="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors"
              >
                Tutup
              </button>
              <button className="px-5 py-2.5 bg-rose-100 text-rose-700 font-medium rounded-xl hover:bg-rose-200 transition-colors flex items-center gap-2 shadow-sm">
                <XCircle className="w-4 h-4" /> Tolak
              </button>
              <button className="px-5 py-2.5 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-colors flex items-center gap-2 shadow-sm">
                <CheckCircle2 className="w-4 h-4" /> Loloskan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
