'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, XCircle, AlertTriangle, Calculator, ArrowRight, RefreshCw } from 'lucide-react';
import { PRIORITY_FIELDS } from '@/data/bsscData';

export default function EligibilityChecker() {
  const [jenjang, setJenjang] = useState<'S1' | 'S2' | 'S3'>('S1');
  const [semester, setSemester] = useState<number>(3);
  const [ipk, setIpk] = useState<string>('3.40');
  const [akreditasiProdi, setAkreditasiProdi] = useState<string>('Baik Sekali');
  const [priorityField, setPriorityField] = useState<string>('pendidikan');
  const [hasFullScholarship, setHasFullScholarship] = useState<boolean>(false);
  const [isSultraCitizen, setIsSultraCitizen] = useState<boolean>(true);
  const [isActiveStudent, setIsActiveStudent] = useState<boolean>(true);

  const [hasChecked, setHasChecked] = useState<boolean>(false);

  const calculateEligibility = () => {
    const parsedIpk = parseFloat(ipk) || 0;
    const errors: string[] = [];
    const passes: string[] = [];

    // Check KTP
    if (isSultraCitizen) {
      passes.push('Memiliki KTP & Asal Domisili Provinsi Sulawesi Tenggara');
    } else {
      errors.push('Wajib memegang KTP & berasal dari Provinsi Sulawesi Tenggara');
    }

    // Check Status Mahasiswa
    if (isActiveStudent) {
      passes.push('Berstatus Mahasiswa Aktif (Tidak Cuti Academic)');
    } else {
      errors.push('Harus berstatus mahasiswa aktif dan tidak sedang cuti akademik');
    }

    // Check Semester range
    if (jenjang === 'S1') {
      if (semester >= 3 && semester <= 5) {
        passes.push(`Semester ${semester} sesuai untuk jenjang S1/D4 (Syarat: Sem 3–5)`);
      } else {
        errors.push(`Jenjang S1/D4 hanya terbuka untuk semester 3, 4, atau 5 (Anda di semester ${semester})`);
      }
    } else if (jenjang === 'S2') {
      if (semester >= 2 && semester <= 3) {
        passes.push(`Semester ${semester} sesuai untuk jenjang S2 (Syarat: Sem 2–3)`);
      } else {
        errors.push(`Jenjang S2 hanya terbuka untuk semester 2 atau 3 (Anda di semester ${semester})`);
      }
    } else if (jenjang === 'S3') {
      if (semester >= 2 && semester <= 5) {
        passes.push(`Semester ${semester} sesuai untuk jenjang S3 (Syarat: Sem 2–5)`);
      } else {
        errors.push(`Jenjang S3 hanya terbuka untuk semester 2 sampai 5 (Anda di semester ${semester})`);
      }
    }

    // Check IPK min
    const minRequiredIpk = jenjang === 'S1' ? 3.25 : 3.50;
    if (parsedIpk >= minRequiredIpk) {
      passes.push(`IPK ${parsedIpk.toFixed(2)} memenuhi standar minimal ${minRequiredIpk.toFixed(2)} (${jenjang})`);
    } else {
      errors.push(`IPK ${parsedIpk.toFixed(2)} berada di bawah syarat minimal ${minRequiredIpk.toFixed(2)} (${jenjang})`);
    }

    // Check Akreditasi
    if (['Unggul', 'Baik Sekali', 'A', 'B'].includes(akreditasiProdi)) {
      passes.push(`Akreditasi Prodi "${akreditasiProdi}" memenuhi standar minimal "Baik Sekali / B"`);
    } else {
      errors.push(`Akreditasi prodi wajib minimal "Baik Sekali" atau "B"`);
    }

    // Check Priority Major
    if (priorityField !== 'lainnya') {
      passes.push('Program studi masuk dalam 4 Bidang Prioritas BSSC 2026');
    } else {
      errors.push('Program studi tidak termasuk dalam 4 bidang prioritas (Pendidikan, Kesehatan, Agromaritim, Infrastruktur)');
    }

    // Check Double Funding
    if (!hasFullScholarship) {
      passes.push('Tidak sedang menerima beasiswa penuh dari institusi lain');
    } else {
      errors.push('Penerima beasiswa penuh dari institusi lain tidak diperbolehkan (Double Funding)');
    }

    const isEligible = errors.length === 0;

    return { isEligible, passes, errors };
  };

  const result = calculateEligibility();

  return (
    <section id="cek-kelayakan" className="py-20 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Information */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-900 text-xs font-bold uppercase tracking-wider">
              <Calculator className="w-3.5 h-3.5" />
              Simulasi & Cek Kelayakan
            </div>

            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Apakah Anda Memenuhi Syarat Pendaftaran BSSC 2026?
            </h2>

            <p className="text-slate-600 text-sm leading-relaxed">
              Gunakan kalkulator kelayakan ini untuk memeriksa kualifikasi semester, IPK transkrip sementara, status KTP, dan akreditasi program studi Anda secara realtime sebelum mengisi form pendaftaran.
            </p>

            <div className="space-y-4 pt-2">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shrink-0 text-sm">
                  IPK
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Batas Minimum IPK</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    • <strong>S1 / D4</strong>: Minimal 3.25 (skala 4.00)<br />
                    • <strong>S2 & S3</strong>: Minimal 3.50 (skala 4.00)
                  </p>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold shrink-0 text-sm">
                  SEM
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Batas Ketentuan Semester</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    • <strong>S1 / D4</strong>: Semester 3 sampai 5<br />
                    • <strong>S2</strong>: Semester 2 sampai 3<br />
                    • <strong>S3</strong>: Semester 2 sampai 5
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Form */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-900 text-lg mb-6 border-b border-slate-100 pb-3 flex items-center justify-between">
              <span>Form Cek Kelayakan Mandiri</span>
              <button
                onClick={() => {
                  setJenjang('S1');
                  setSemester(3);
                  setIpk('3.40');
                  setAkreditasiProdi('Baik Sekali');
                  setPriorityField('pendidikan');
                  setHasFullScholarship(false);
                  setIsSultraCitizen(true);
                  setIsActiveStudent(true);
                  setHasChecked(false);
                }}
                className="text-xs text-slate-500 hover:text-blue-900 flex items-center gap-1 font-normal"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Reset Form
              </button>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
              {/* Select Jenjang */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Jenjang Pendidikan
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['S1', 'S2', 'S3'] as const).map((j) => (
                    <button
                      key={j}
                      type="button"
                      onClick={() => setJenjang(j)}
                      className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
                        jenjang === j
                          ? 'bg-blue-900 text-white border-blue-900 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {j === 'S1' ? 'S1 / D4' : j}
                    </button>
                  ))}
                </div>
              </div>

              {/* Enter Semester */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Semester Berjalan Saat Ini
                </label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(parseInt(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-900 focus:outline-none"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                    <option key={sem} value={sem}>
                      Semester {sem}
                    </option>
                  ))}
                </select>
              </div>

              {/* Enter IPK */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  IPK Kumulatif (Transkrip Nilai)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="4.00"
                  value={ipk}
                  onChange={(e) => setIpk(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-900 focus:outline-none"
                  placeholder="Contoh: 3.45"
                />
              </div>

              {/* Select Akreditasi */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Akreditasi Program Studi
                </label>
                <select
                  value={akreditasiProdi}
                  onChange={(e) => setAkreditasiProdi(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-900 focus:outline-none"
                >
                  <option value="Unggul">Unggul / A</option>
                  <option value="Baik Sekali">Baik Sekali / B</option>
                  <option value="Baik">Baik / C (Tidak Memenuhi)</option>
                </select>
              </div>

              {/* Select Priority Field */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Bidang Program Studi
                </label>
                <select
                  value={priorityField}
                  onChange={(e) => setPriorityField(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-900 focus:outline-none"
                >
                  <option value="pendidikan">Bidang Pendidikan (Keguruan, Manajemen Pend., dll)</option>
                  <option value="kesehatan">Bidang Kesehatan (Kedokteran, Keperawatan, Kebidanan, dll)</option>
                  <option value="agromaritim">Bidang Agromaritim (Pertanian, Perikanan, Kelautan, dll)</option>
                  <option value="infrastruktur">Bidang Infrastruktur (Teknik Sipil, Arsitektur, Elektro, dll)</option>
                  <option value="lainnya">Lainnya / Tidak Masuk 4 Bidang Prioritas</option>
                </select>
              </div>

              {/* Checkboxes */}
              <div className="sm:col-span-2 space-y-2 pt-2 border-t border-slate-100">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 font-medium">
                  <input
                    type="checkbox"
                    checked={isSultraCitizen}
                    onChange={(e) => setIsSultraCitizen(e.target.checked)}
                    className="rounded text-blue-900 focus:ring-blue-900 w-4 h-4"
                  />
                  <span>Saya warga domisili & ber-KTP Provinsi Sulawesi Tenggara</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 font-medium">
                  <input
                    type="checkbox"
                    checked={isActiveStudent}
                    onChange={(e) => setIsActiveStudent(e.target.checked)}
                    className="rounded text-blue-900 focus:ring-blue-900 w-4 h-4"
                  />
                  <span>Saya berstatus mahasiswa aktif (tidak sedang cuti kuliah)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 font-medium">
                  <input
                    type="checkbox"
                    checked={hasFullScholarship}
                    onChange={(e) => setHasFullScholarship(e.target.checked)}
                    className="rounded text-blue-900 focus:ring-blue-900 w-4 h-4"
                  />
                  <span className="text-rose-700">Saya sedang menerima beasiswa penuh dari institusi lain (Double Funding)</span>
                </label>
              </div>
            </div>

            {/* Check Button */}
            <button
              onClick={() => setHasChecked(true)}
              className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-sm"
            >
              Jalankan Analisis Kelayakan
            </button>

            {/* Result Box */}
            {hasChecked && (
              <div
                className={`mt-6 p-5 rounded-xl border transition-all ${
                  result.isEligible
                    ? 'bg-emerald-50/90 border-emerald-200 text-emerald-950'
                    : 'bg-rose-50/90 border-rose-200 text-rose-950'
                }`}
              >
                <div className="flex items-start gap-3 mb-4">
                  {result.isEligible ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <h4 className="font-extrabold text-base">
                      {result.isEligible
                        ? 'SELAMAT! ANDA MEMENUHI KRITERIA PENDAFTARAN'
                        : 'MAAF, ANDA BELUM MEMENUHI SEMUA KRITERIA'}
                    </h4>
                    <p className="text-xs opacity-90 mt-0.5">
                      {result.isEligible
                        ? 'Kualifikasi studi dan IPK Anda sesuai dengan petunjuk teknis BSSC 2026. Anda disarankan segera melakukan pendaftaran online.'
                        : 'Beberapa kriteria penting di bawah ini belum terpenuhi sesuai Juknis BSSC 2026.'}
                    </p>
                  </div>
                </div>

                {/* Passed List */}
                {result.passes.length > 0 && (
                  <div className="mb-3 space-y-1">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                      Kriteria Terpenuhi:
                    </p>
                    <ul className="space-y-1 text-xs">
                      {result.passes.map((passItem, idx) => (
                        <li key={idx} className="flex items-center gap-1.5 text-emerald-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0"></span>
                          <span>{passItem}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Failed List */}
                {result.errors.length > 0 && (
                  <div className="space-y-1 pt-2 border-t border-rose-200/60">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-rose-800">
                      Kendala / Kriteria Belum Terpenuhi:
                    </p>
                    <ul className="space-y-1 text-xs">
                      {result.errors.map((errItem, idx) => (
                        <li key={idx} className="flex items-center gap-1.5 text-rose-900 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0"></span>
                          <span>{errItem}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.isEligible && (
                  <div className="mt-4 pt-3 border-t border-emerald-200 flex justify-end">
                    <Link
                      href="/daftar"
                      className="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors"
                    >
                      Lanjut Isi Form Pendaftaran
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
