'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CheckSquare, FileText, ArrowDown, ChevronRight, CheckCircle2, Download, Info } from 'lucide-react';

export default function FlowchartDiagram() {
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'S1' | 'S2' | 'S3'>('ALL');

  return (
    <section id="alur-pendaftaran" className="py-20 bg-slate-900 text-white relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-blue-600 rounded-full blur-[120px]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            TENTANG BEASISWA STIMULAN SULTRA CERDAS 2026
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Alur tahapan pendaftaran berdasarkan jenjang studi aktif (S1/D4, S2, dan S3) sesuai panduan resmi petunjuk teknis.
          </p>
        </div>

        {/* Main Flowchart Box */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
          {/* Top Title Banner */}
          <div className="max-w-md mx-auto bg-white text-blue-950 font-black text-center py-3 px-6 rounded-xl shadow-md uppercase tracking-wider text-sm sm:text-base border border-blue-200 mb-10">
            TENTANG BEASISWA STIMULAN SULTRA CERDAS 2026
          </div>

          {/* Connecting Tree Lines SVG (Desktop) */}
          <div className="hidden lg:block relative mb-8">
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-[72%] h-8 border-t-2 border-l-2 border-r-2 border-blue-500/50 rounded-t-xl"></div>
          </div>

          {/* 3 Columns for S1/D4, S2, S3 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative">
            {/* COLUMN 1: S1/D4 */}
            {(selectedCategory === 'ALL' || selectedCategory === 'S1') && (
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6 flex flex-col justify-between hover:border-blue-500/40 transition-colors">
                <div className="space-y-5">
                  {/* Category Header */}
                  <div className="bg-white text-slate-900 font-extrabold text-center py-2.5 px-4 rounded-xl shadow-xs text-lg tracking-tight">
                    S1 / D4
                  </div>

                  {/* Step 1 */}
                  <div className="bg-blue-950/60 border border-blue-800/60 rounded-xl p-3 text-center text-xs font-bold uppercase tracking-wider text-blue-200">
                    MENGISI FORM IDENTITAS
                  </div>

                  {/* Semester Checkbox Requirement */}
                  <div className="bg-slate-800/80 border border-slate-700/70 rounded-xl p-3 flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div className="text-xs space-y-1">
                      <p className="font-semibold text-slate-200">
                        Saya berada di rentang semester 3 - 5
                      </p>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-1">
                        <span>Semester saat ini:</span>
                        <span className="font-mono bg-slate-900 px-2 py-0.5 rounded border border-slate-700 text-blue-300">
                          Semester 3 / 4 / 5
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Step 2: Upload */}
                  <div className="bg-blue-950/60 border border-blue-800/60 rounded-xl p-3 text-center text-xs font-bold uppercase tracking-wider text-blue-200">
                    UNGGAH DOKUMEN PERSYARATAN
                  </div>

                  {/* Required Docs */}
                  <div className="space-y-2 pt-1">
                    <div className="bg-white text-slate-900 px-4 py-2.5 rounded-lg text-xs font-bold text-center shadow-xs">
                      Surat Permohonan
                    </div>
                    <div className="bg-white text-slate-900 px-4 py-2.5 rounded-lg text-xs font-bold text-center shadow-xs">
                      Surat Pernyataan (E-Materai)
                    </div>
                    <div className="bg-white text-slate-900 px-4 py-2.5 rounded-lg text-xs font-bold text-center shadow-xs text-blue-900">
                      Motivation Letter
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* COLUMN 2: S2 */}
            {(selectedCategory === 'ALL' || selectedCategory === 'S2') && (
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6 flex flex-col justify-between hover:border-blue-500/40 transition-colors">
                <div className="space-y-5">
                  {/* Category Header */}
                  <div className="bg-white text-slate-900 font-extrabold text-center py-2.5 px-4 rounded-xl shadow-xs text-lg tracking-tight">
                    S2
                  </div>

                  {/* Step 1 */}
                  <div className="bg-blue-950/60 border border-blue-800/60 rounded-xl p-3 text-center text-xs font-bold uppercase tracking-wider text-blue-200">
                    MENGISI FORM IDENTITAS
                  </div>

                  {/* Semester Checkbox Requirement */}
                  <div className="bg-slate-800/80 border border-slate-700/70 rounded-xl p-3 flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div className="text-xs space-y-1">
                      <p className="font-semibold text-slate-200">
                        Saya berada di rentang semester 2 - 3
                      </p>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-1">
                        <span>Semester saat ini:</span>
                        <span className="font-mono bg-slate-900 px-2 py-0.5 rounded border border-slate-700 text-blue-300">
                          Semester 2 / 3
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Step 2: Upload */}
                  <div className="bg-blue-950/60 border border-blue-800/60 rounded-xl p-3 text-center text-xs font-bold uppercase tracking-wider text-blue-200">
                    UNGGAH DOKUMEN PERSYARATAN
                  </div>

                  {/* Required Docs */}
                  <div className="space-y-2 pt-1">
                    <div className="bg-white text-slate-900 px-4 py-2.5 rounded-lg text-xs font-bold text-center shadow-xs">
                      Surat Permohonan
                    </div>
                    <div className="bg-white text-slate-900 px-4 py-2.5 rounded-lg text-xs font-bold text-center shadow-xs">
                      Surat Pernyataan (E-Materai)
                    </div>
                    <div className="bg-white text-slate-900 px-4 py-2.5 rounded-lg text-xs font-bold text-center shadow-xs text-blue-900">
                      Esai Kontribusi Daerah (5 Tahun)
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* COLUMN 3: S3 */}
            {(selectedCategory === 'ALL' || selectedCategory === 'S3') && (
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6 flex flex-col justify-between hover:border-blue-500/40 transition-colors">
                <div className="space-y-5">
                  {/* Category Header */}
                  <div className="bg-white text-slate-900 font-extrabold text-center py-2.5 px-4 rounded-xl shadow-xs text-lg tracking-tight">
                    S3
                  </div>

                  {/* Step 1 */}
                  <div className="bg-blue-950/60 border border-blue-800/60 rounded-xl p-3 text-center text-xs font-bold uppercase tracking-wider text-blue-200">
                    MENGISI FORM IDENTITAS
                  </div>

                  {/* Semester Checkbox Requirement */}
                  <div className="bg-slate-800/80 border border-slate-700/70 rounded-xl p-3 flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div className="text-xs space-y-1">
                      <p className="font-semibold text-slate-200">
                        Saya berada di rentang semester 2 - 5
                      </p>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-1">
                        <span>Semester saat ini:</span>
                        <span className="font-mono bg-slate-900 px-2 py-0.5 rounded border border-slate-700 text-blue-300">
                          Semester 2 / 3 / 4 / 5
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Step 2: Upload */}
                  <div className="bg-blue-950/60 border border-blue-800/60 rounded-xl p-3 text-center text-xs font-bold uppercase tracking-wider text-blue-200">
                    UNGGAH DOKUMEN PERSYARATAN
                  </div>

                  {/* Required Docs */}
                  <div className="space-y-2 pt-1">
                    <div className="bg-white text-slate-900 px-4 py-2.5 rounded-lg text-xs font-bold text-center shadow-xs">
                      Surat Permohonan
                    </div>
                    <div className="bg-white text-slate-900 px-4 py-2.5 rounded-lg text-xs font-bold text-center shadow-xs">
                      Surat Pernyataan (E-Materai)
                    </div>
                    <div className="bg-white text-slate-900 px-4 py-2.5 rounded-lg text-xs font-bold text-center shadow-xs text-blue-900">
                      Esai Kontribusi Daerah (5 Tahun)
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Convergence Line & Submit Action Button */}
          <div className="mt-12 flex flex-col items-center space-y-6">
            <div className="w-0.5 h-10 bg-gradient-to-b from-blue-500 to-white opacity-60"></div>
            
            <div className="w-full max-w-md bg-slate-800 text-slate-300 font-black text-center py-4 px-8 rounded-2xl shadow-xl text-xl tracking-wider uppercase border-2 border-slate-700 flex items-center justify-center gap-3">
              <span>SUBMIT PENDAFTARAN</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
