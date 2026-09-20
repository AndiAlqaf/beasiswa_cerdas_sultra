'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, FileText, Sparkles, Shield, Clock, Award } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50 border-b border-slate-100">
      {/* Background subtle geometric patterns */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-100 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-20 w-80 h-80 bg-slate-200 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center max-w-4xl mx-auto space-y-6">

          {/* Schedule Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200/60 text-slate-600 text-xs font-semibold tracking-wide shadow-sm">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>Pendaftaran: 13 – 30 September 2026</span>
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight mt-6">
            Beasiswa Stimulan <br className="hidden sm:inline" />
            <span className="text-blue-900">
              SULTRA CERDAS 2026
            </span>
          </h1>

          {/* Description */}
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed mt-6">
            Program bantuan operasional pendidikan APBD Pemprov Sulawesi Tenggara bagi mahasiswa aktif jenjang <strong className="text-slate-900 font-bold">S1/D4</strong>, <strong className="text-slate-900 font-bold">S2</strong>, dan <strong className="text-slate-900 font-bold">S3</strong> yang berdomisili di Sulawesi Tenggara.
          </p>

          {/* Action CTAs */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/daftar"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-sm font-bold text-white bg-blue-900 hover:bg-blue-950 shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group"
            >
              Mulai Pendaftaran
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>

            <Link
              href="/#cek-kelayakan"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 transition-all flex items-center justify-center gap-2 shadow-xs hover:border-slate-300"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Cek Kelayakan
            </Link>
          </div>
        </div>

        {/* Feature Cards Grid (Minimalist Cards) */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* S1/D4 Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 hover:-translate-y-1 transition-all duration-300 relative group">
            <div className="absolute top-5 right-5">
              <span className="text-[10px] uppercase font-extrabold tracking-wider px-2 py-1 rounded bg-blue-50 text-blue-700 border border-blue-100">
                SARJANA / D4
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-900 flex items-center justify-center font-bold text-lg mb-4 group-hover:bg-blue-100 transition-colors">
              S1
            </div>
            <div className="flex items-baseline justify-between mb-2">
              <h3 className="font-bold text-slate-900 text-lg">Jenjang S1 / D4</h3>
              <span className="text-xl font-extrabold text-blue-900">Rp10 Juta</span>
            </div>
            <p className="text-xs text-slate-500 mb-4">Penyaluran 2 Termin (Rp5.000.000 / Termin)</p>
            <ul className="text-xs text-slate-600 space-y-2 border-t border-slate-100 pt-4">
              <li className="flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></span>
                <span>Khusus Mahasiswa Semester 3 - 5</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></span>
                <span>IPK Minimal 3.25 (Skala 4.00)</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></span>
                <span>Wajib Upload Motivation Letter</span>
              </li>
            </ul>
          </div>

          {/* S2 Card */}
          <div className="bg-white p-6 rounded-2xl border border-blue-200 ring-4 ring-blue-50 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative group">
            <div className="absolute top-5 right-5">
              <span className="text-[10px] uppercase font-extrabold tracking-wider px-2 py-1 rounded bg-blue-900 text-white shadow-xs">
                MAGISTER
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-900 text-white flex items-center justify-center font-bold text-lg mb-4 group-hover:bg-blue-800 transition-colors shadow-sm">
              S2
            </div>
            <div className="flex items-baseline justify-between mb-2">
              <h3 className="font-bold text-slate-900 text-lg">Jenjang S2 (Magister)</h3>
              <span className="text-xl font-extrabold text-blue-900">Rp15 Juta</span>
            </div>
            <p className="text-xs text-slate-500 mb-4">Penyaluran 2 Termin (Rp7.500.000 / Termin)</p>
            <ul className="text-xs text-slate-600 space-y-2 border-t border-slate-100 pt-4">
              <li className="flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-900 shrink-0"></span>
                <span>Khusus Mahasiswa Semester 2 - 3</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-900 shrink-0"></span>
                <span>IPK Minimal 3.50 (Skala 4.00)</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-900 shrink-0"></span>
                <span>Wajib Upload Esai Kontribusi Daerah</span>
              </li>
            </ul>
          </div>

          {/* S3 Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-400 hover:-translate-y-1 transition-all duration-300 relative group">
            <div className="absolute top-5 right-5">
              <span className="text-[10px] uppercase font-extrabold tracking-wider px-2 py-1 rounded bg-slate-100 text-slate-700 border border-slate-200">
                DOKTOR
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-lg mb-4 group-hover:bg-slate-800 transition-colors">
              S3
            </div>
            <div className="flex items-baseline justify-between mb-2">
              <h3 className="font-bold text-slate-900 text-lg">Jenjang S3 (Doktor)</h3>
              <span className="text-xl font-extrabold text-blue-900">Rp30 Juta</span>
            </div>
            <p className="text-xs text-slate-500 mb-4">Penyaluran 2 Termin (Rp15.000.000 / Termin)</p>
            <ul className="text-xs text-slate-600 space-y-2 border-t border-slate-100 pt-4">
              <li className="flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-800 shrink-0"></span>
                <span>Khusus Mahasiswa Semester 2 - 5</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-800 shrink-0"></span>
                <span>IPK Minimal 3.50 (Skala 4.00)</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-800 shrink-0"></span>
                <span>Wajib Upload Esai Kontribusi Daerah</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
