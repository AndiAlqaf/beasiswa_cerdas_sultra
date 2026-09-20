'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { MOCK_APPLICATIONS } from '@/data/bsscData';
import { Search, CheckCircle2, Clock, AlertCircle, ShieldCheck, ArrowRight, UserCheck } from 'lucide-react';

export default function CheckStatusPage() {
  const [searchKey, setSearchKey] = useState<string>('3401020304050001');
  const [searchedApp, setSearchedApp] = useState<typeof MOCK_APPLICATIONS[string] | null>(
    MOCK_APPLICATIONS['3401020304050001']
  );
  const [hasSearched, setHasSearched] = useState<boolean>(true);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const found = MOCK_APPLICATIONS[searchKey.trim()] || null;
    setSearchedApp(found);
    setHasSearched(true);
  };

  const statusSteps = [
    { key: 'TERKIRIM', title: 'Permohonan Terkirim' },
    { key: 'VERIFIKASI_BERKAS', title: 'Verifikasi Berkas' },
    { key: 'SELEKSI_ADMINISTRASI', title: 'Seleksi Administrasi' },
    { key: 'DITERIMA', title: 'Penetapan Penerima' },
    { key: 'PENCAIRAN_TERMIN_1', title: 'Pencairan Termin I' }
  ];

  const getStepIndex = (statusKey: string) => {
    return statusSteps.findIndex((s) => s.key === statusKey);
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased">
      <Navbar />

      <div className="pt-32 pb-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center space-y-3 mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-900 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
            Layanan Pelacak Status
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Cek Status Pendaftaran Beasiswa Sultra Cerdas
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
            Masukkan NIK 16 digit atau Nomor Registrasi pendaftaran Anda untuk memantau progres verifikasi dan pencairan.
          </p>
        </div>

        {/* Search Input Box */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm mb-8 space-y-4">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchKey}
                onChange={(e) => setSearchKey(e.target.value)}
                placeholder="Masukkan NIK (Contoh: 3401020304050001)"
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-blue-900 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="px-7 py-3.5 rounded-2xl bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-all"
            >
              Cari Status
            </button>
          </form>

          {/* Quick Demo Shortcuts */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
            <span className="text-slate-400 font-medium">Contoh Demo NIK:</span>
            <button
              onClick={() => {
                setSearchKey('3401020304050001');
                setSearchedApp(MOCK_APPLICATIONS['3401020304050001']);
              }}
              className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[11px]"
            >
              3401020304050001 (Pencairan Termin I)
            </button>
            <button
              onClick={() => {
                setSearchKey('3401020304050002');
                setSearchedApp(MOCK_APPLICATIONS['3401020304050002']);
              }}
              className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[11px]"
            >
              3401020304050002 (Verifikasi Berkas)
            </button>
          </div>
        </div>

        {/* Status Result Details */}
        {hasSearched && (
          <div>
            {searchedApp ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-8">
                {/* Header Profile */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-900 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-100">
                      {searchedApp.registrationNo}
                    </span>
                    <h2 className="text-2xl font-bold text-slate-900 mt-1">{searchedApp.name}</h2>
                    <p className="text-xs text-slate-500">
                      {searchedApp.univ} • {searchedApp.prodi} ({searchedApp.jenjang})
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Tanggal Submit:</span>
                    <strong className="text-slate-900 text-xs">{searchedApp.dateSubmitted}</strong>
                  </div>
                </div>

                {/* Progress Steps Indicator */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Progres Status Verifikasi Berkas & Seleksi
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                    {statusSteps.map((step, idx) => {
                      const currentIdx = getStepIndex(searchedApp.status);
                      const isComplete = idx <= currentIdx;
                      const isCurrent = idx === currentIdx;

                      return (
                        <div
                          key={step.key}
                          className={`p-3 rounded-xl border text-center space-y-2 transition-all ${
                            isCurrent
                              ? 'bg-blue-900 border-blue-900 text-white shadow-xs'
                              : isComplete
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                              : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
                          }`}
                        >
                          <div className="w-6 h-6 rounded-full mx-auto flex items-center justify-center font-bold text-xs bg-white/20">
                            {isComplete ? '✓' : idx + 1}
                          </div>
                          <p className="text-[11px] font-bold leading-tight">{step.title}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Official Status Notes */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                    <ShieldCheck className="w-4 h-4 text-blue-900" />
                    Catatan Resmi Tim Verifikator:
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{searchedApp.notes}</p>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
                <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
                <h3 className="font-bold text-slate-900 text-lg">Data Pendaftaran Tidak Ditemukan</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  NIK atau Nomor Registrasi <strong>"{searchKey}"</strong> belum terdaftar dalam database pendaftaran BSSC 2026.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
