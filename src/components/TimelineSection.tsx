import React from 'react';
import { SCHEDULE_TIMELINE } from '@/data/bsscData';
import { Calendar, Clock, CheckCircle2 } from 'lucide-react';

export default function TimelineSection() {
  return (
    <section id="jadwal" className="py-20 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Agenda & Alur Waktu Pelaksanaan BSSC 2026
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Pastikan Anda mencatat tanggal-tanggal penting pendaftaran online, masa sanggah, hingga tahap penyaluran dana beasiswa.
          </p>
        </div>

        {/* Timeline Horizontal / Vertical Steps */}
        <div className="max-w-4xl mx-auto space-y-4">
          {SCHEDULE_TIMELINE.map((step, idx) => (
            <div
              key={idx}
              className={`p-5 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                step.status === 'active'
                  ? 'bg-white border-blue-600 shadow-md ring-2 ring-blue-900/10'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                    step.status === 'active'
                      ? 'bg-blue-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  0{idx + 1}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-base">{step.title}</h3>
                    {step.status === 'active' && (
                      <span className="px-2 py-0.5 rounded text-[10px] uppercase font-extrabold bg-blue-900 text-white tracking-wider">
                        SEDANGBERJALAN
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{step.desc}</p>
                </div>
              </div>

              <div className="sm:text-right shrink-0">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold ${
                    step.status === 'active'
                      ? 'bg-blue-50 text-blue-900 border border-blue-200'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  {step.date}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
