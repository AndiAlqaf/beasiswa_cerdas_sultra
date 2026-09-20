import React from 'react';
import { Calendar } from 'lucide-react';

export default function PengumumanPage() {
  return (
    <div className="w-full space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Pengumuman & Jadwal</h1>
      
      {/* Jadwal Terdekat */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Jadwal Terdekat
          </h3>
        </div>
        
        <div className="space-y-0">
          <div className="flex gap-4 sm:gap-6 group">
            <div className="w-14 sm:w-20 text-right pt-0.5 shrink-0">
              <span className="text-xs sm:text-sm font-bold text-slate-900 block group-hover:text-blue-600 transition-colors">15 Okt</span>
              <span className="text-[10px] text-slate-400 font-medium">2026</span>
            </div>
            <div className="relative pb-8 border-l-2 border-blue-100 pl-6 sm:pl-8 last:border-0 last:pb-0">
              <div className="absolute top-0 -left-[11px] w-5 h-5 rounded-full bg-blue-50 border-4 border-white flex items-center justify-center shadow-sm">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
              </div>
              <h4 className="font-bold text-slate-900 text-sm sm:text-base group-hover:text-blue-600 transition-colors">Pengumuman Seleksi Administrasi</h4>
              <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed max-w-xl">
                Hasil seleksi tahap awal akan diumumkan melalui portal ini. Pastikan Anda mengecek secara berkala.
              </p>
            </div>
          </div>
          
          <div className="flex gap-4 sm:gap-6 group">
            <div className="w-14 sm:w-20 text-right pt-0.5 shrink-0">
              <span className="text-xs sm:text-sm font-bold text-slate-500 block group-hover:text-slate-900 transition-colors">16 Okt</span>
              <span className="text-[10px] text-slate-400 font-medium">2026</span>
            </div>
            <div className="relative border-l-2 border-transparent pl-6 sm:pl-8">
              <div className="absolute top-0 -left-[11px] w-5 h-5 rounded-full bg-slate-200 border-4 border-white shadow-sm"></div>
              <h4 className="font-bold text-slate-700 text-sm sm:text-base group-hover:text-slate-900 transition-colors">Masa Sanggah Dibuka</h4>
              <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed max-w-xl">
                Periode pengajuan banding khusus bagi pendaftar yang tidak lolos seleksi administrasi awal.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
