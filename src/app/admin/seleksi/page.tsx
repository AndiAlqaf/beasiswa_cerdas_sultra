import React from 'react';
import { CheckCircle2, XCircle, Clock, FileText, ExternalLink, Search } from 'lucide-react';

export default function SeleksiPage() {
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {applicants.map((applicant, idx) => (
          <div key={idx} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            {/* Header Card */}
            <div className="p-5 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-mono font-semibold text-slate-500 bg-slate-200 px-2 py-0.5 rounded-md">{applicant.id}</span>
                  <span className="text-[10px] font-bold text-[#0B3A6A] bg-blue-100 px-2 py-0.5 rounded-md border border-blue-200">{applicant.jenjang}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900">{applicant.name}</h3>
                <p className="text-sm text-slate-600">{applicant.univ}</p>
              </div>
              <div className="text-center bg-white border border-slate-200 px-3 py-2 rounded-xl shadow-sm">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Skor Sistem</p>
                <p className="text-xl font-black text-blue-600 leading-none">{applicant.score}</p>
              </div>
            </div>

            {/* Document List */}
            <div className="p-5 flex-1">
              <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-500" />
                Pemeriksaan Berkas
              </h4>
              <div className="space-y-3">
                {applicant.documents.map((doc, docIdx) => (
                  <div key={docIdx} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-blue-100 hover:bg-blue-50/50 transition-colors group">
                    <div className="flex items-center gap-3">
                      {doc.status === 'valid' && <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />}
                      {doc.status === 'invalid' && <XCircle className="w-5 h-5 text-rose-500 shrink-0" />}
                      {doc.status === 'pending' && <Clock className="w-5 h-5 text-amber-500 shrink-0" />}
                      <span className="text-sm font-medium text-slate-700">{doc.name}</span>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="text-xs bg-white border border-slate-200 px-2 py-1 rounded hover:bg-slate-50 text-slate-600 flex items-center gap-1 font-medium">
                        <ExternalLink className="w-3 h-3" /> Cek
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-5 border-t border-slate-100 bg-slate-50 flex gap-3">
              <button className="flex-1 bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
                <XCircle className="w-4 h-4" /> Tolak
              </button>
              <button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2 shadow-sm">
                <CheckCircle2 className="w-4 h-4" /> Loloskan
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
