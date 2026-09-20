import React from 'react';
import { PRIORITY_FIELDS, SCHOLARSHIP_AMOUNTS } from '@/data/bsscData';
import { GraduationCap, Stethoscope, Wheat, Building2, Layers, DollarSign, Wallet } from 'lucide-react';

export default function PriorityPrograms() {
  const getColorScheme = (iconName: string) => {
    switch (iconName) {
      case 'GraduationCap': return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100', icon: 'text-emerald-600', ring: 'hover:ring-emerald-50' };
      case 'Stethoscope': return { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-100', icon: 'text-sky-600', ring: 'hover:ring-sky-50' };
      case 'Wheat': return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100', icon: 'text-amber-600', ring: 'hover:ring-amber-50' };
      case 'Building2': return { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-100', icon: 'text-indigo-600', ring: 'hover:ring-indigo-50' };
      default: return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-100', icon: 'text-blue-600', ring: 'hover:ring-blue-50' };
    }
  };

  const getIcon = (iconName: string, className: string) => {
    switch (iconName) {
      case 'GraduationCap': return <GraduationCap className={`w-6 h-6 ${className}`} />;
      case 'Stethoscope': return <Stethoscope className={`w-6 h-6 ${className}`} />;
      case 'Wheat': return <Wheat className={`w-6 h-6 ${className}`} />;
      case 'Building2': return <Building2 className={`w-6 h-6 ${className}`} />;
      default: return <GraduationCap className={`w-6 h-6 ${className}`} />;
    }
  };

  return (
    <section id="program-prioritas" className="py-20 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Bidang Program Studi Prioritas BSSC 2026
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Sesuai Petunjuk Teknis Tahun Anggaran 2026, beasiswa difokuskan untuk mendukung 4 sektor strategis pembangunan sumber daya manusia di Sulawesi Tenggara.
          </p>
        </div>

        {/* 4 Priority Fields Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {PRIORITY_FIELDS.map((field) => {
            const colors = getColorScheme(field.icon);
            return (
              <div
                key={field.id}
                className={`bg-white p-7 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-slate-300 transition-all duration-300 flex flex-col h-full ring-4 ring-transparent ${colors.ring}`}
              >
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 ${colors.bg} border ${colors.border}`}>
                  {getIcon(field.icon, colors.icon)}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{field.name}</h3>
                <p className="text-sm text-slate-600 leading-relaxed flex-grow">{field.description}</p>
                <div className="pt-6 mt-auto">
                  <span className={`inline-flex items-center text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-md ${colors.bg} ${colors.text} border ${colors.border}`}>
                    Minimal Akreditasi: Baik Sekali
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Financial Distribution Banner */}
        <div className="bg-slate-900 rounded-3xl p-8 sm:p-10 text-white shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-4 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold uppercase tracking-wider">
                <Wallet className="w-3.5 h-3.5" />
                Skema Penyaluran 2 Termin
              </div>
              <h3 className="text-2xl font-extrabold tracking-tight">
                Mekanisme Pencairan Dana Beasiswa
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Beasiswa Stimulan Sultra Cerdas disalurkan secara bertahap langsung ke rekening mahasiswa penerima melalui 2 termin (masing-masing 50%).
              </p>
            </div>

            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {SCHOLARSHIP_AMOUNTS.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-slate-800/80 border border-slate-700/80 p-5 rounded-2xl space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-blue-400">
                      {item.jenjang}
                    </span>
                    <span className="text-[10px] bg-slate-700 text-slate-300 px-2 py-0.5 rounded font-mono">
                      IPK ≥ {item.minIpk}
                    </span>
                  </div>

                  <div className="text-2xl font-black text-white">{item.totalAmount}</div>
                  <p className="text-[11px] text-slate-400">{item.semesters}</p>

                  <div className="pt-3 border-t border-slate-700/80 space-y-1 text-xs">
                    <div className="flex justify-between text-slate-300">
                      <span>Termin I (50%):</span>
                      <strong className="text-white">{item.termin1.split(' ')[0]}</strong>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Termin II (50%):</span>
                      <strong className="text-white">{item.termin2.split(' ')[0]}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
