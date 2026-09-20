import React from 'react';
import { CheckCircle2, Clock, FileText, Calendar, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div className="space-y-6 w-full">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-slate-900 rounded-3xl p-8 sm:p-10 text-white relative overflow-hidden shadow-md">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 right-20 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl translate-y-1/2"></div>
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3 tracking-tight">Selamat Datang, Ahmad Dani!</h2>
          <p className="text-blue-100 text-sm sm:text-base leading-relaxed font-light">
            Pendaftaran beasiswa Anda saat ini sedang dalam tahap <strong className="text-white font-semibold">Verifikasi Berkas</strong> oleh tim seleksi. Pantau terus status kelulusan Anda di portal ini.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Status Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-6">
            <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 px-3 py-1 rounded-full">
              Diproses
            </span>
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mb-1.5">Status Pendaftaran</p>
            <h3 className="text-lg font-bold text-slate-900">Verifikasi Berkas</h3>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
              Menunggu validasi dokumen persyaratan dari panitia seleksi.
            </p>
          </div>
        </div>

        {/* Tahap Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-6">
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mb-1.5">Tahapan Saat Ini</p>
            <h3 className="text-lg font-bold text-slate-900">Seleksi Tahap 1</h3>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
              Telah selesai pada 15 Oktober 2026.
            </p>
          </div>
        </div>

        {/* Dokumen Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-6">
            <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center">
              <FileText className="w-5 h-5 text-emerald-600" />
            </div>
            <Link href="/dashboard/berkas" className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 bg-blue-50 px-3 py-1 rounded-full transition-colors">
              Lihat Berkas <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mb-1.5">Kelengkapan Berkas</p>
            <h3 className="text-lg font-bold text-slate-900">Lengkap (8/8)</h3>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
              Seluruh dokumen wajib telah berhasil diunggah ke sistem.
            </p>
          </div>
        </div>
      </div>


    </div>
  );
}
