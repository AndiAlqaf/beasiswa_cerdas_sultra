'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Bell, Calendar, Download, Printer, ShieldCheck, Search, Loader2, Award, CheckCircle2, FileText, ArrowRight } from 'lucide-react';
import { fetchAPI } from '@/lib/api';
import { getStoredScheduleConfig, getDynamicTimeline, ScheduleConfig } from '@/lib/schedule';
import Link from 'next/link';

interface Recipient {
  registrationNo: string;
  namaLengkap: string;
  jenjangTarget: string;
  status: string;
  verifiedAt: string;
  institusi: string;
  jurusan: string;
}

export default function PublicPengumumanPage() {
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [loadingRecipients, setLoadingRecipients] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [jenjangFilter, setJenjangFilter] = useState('');
  const [showSkModal, setShowSkModal] = useState(false);
  const [scheduleConfig, setScheduleConfig] = useState<ScheduleConfig>(getStoredScheduleConfig());

  useEffect(() => {
    setScheduleConfig(getStoredScheduleConfig());
    const handleUpdate = () => {
      setScheduleConfig(getStoredScheduleConfig());
    };
    window.addEventListener('bssc_schedule_updated', handleUpdate);
    return () => window.removeEventListener('bssc_schedule_updated', handleUpdate);
  }, []);

  const timeline = getDynamicTimeline(scheduleConfig);
  const pengumumanStep = timeline.find((s) => s.id === 'pengumuman');

  const isAnnouncementPeriodOpen = pengumumanStep
    ? pengumumanStep.status === 'active' || pengumumanStep.status === 'completed'
    : false;

  const loadRecipients = async () => {
    if (!isAnnouncementPeriodOpen) {
      setLoadingRecipients(false);
      return;
    }
    setLoadingRecipients(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm.trim()) params.set('search', searchTerm.trim());
      if (jenjangFilter) params.set('jenjang', jenjangFilter);

      const res = await fetchAPI(`/public/announcements/recipients?${params.toString()}`);
      if (res.success && res.data) {
        setRecipients(res.data.recipients || []);
      }
    } catch (e) {
      console.warn('Load public recipients error:', e);
    } finally {
      setLoadingRecipients(false);
    }
  };

  useEffect(() => {
    loadRecipients();
  }, [jenjangFilter, isAnnouncementPeriodOpen]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadRecipients();
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased">
      <Navbar />

      <div className="pt-32 pb-20 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Icon + Title */}
        <div className="text-center mb-10">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200/60 text-slate-700 flex items-center justify-center mx-auto mb-4 shadow-xs">
            <Bell className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Pengumuman
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-normal mt-1.5">
            Informasi dan pembaruan resmi pelaksanaan Beasiswa Stimulan Sultra Cerdas Pemprov Sulawesi Tenggara.
          </p>
        </div>

        {/* Announcement Cards Stack */}
        <div className="space-y-4">

          {/* Card 1: Pendaftaran Online (Timeline Active) */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs hover:shadow-md transition-all space-y-2">
            <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{timeline[0]?.date || '13 – 30 September 2026'}</span>
              <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-600 text-[10px] font-extrabold uppercase tracking-wider ml-1">
                TAHAP BERJALAN
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
              Pembukaan Pendaftaran Online Beasiswa Stimulan Sultra Cerdas TA 2026
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-normal">
              Pemerintah Provinsi Sulawesi Tenggara secara resmi membuka pendaftaran Beasiswa Stimulan Sultra Cerdas bagi mahasiswa aktif jenjang S1/D4, S2, dan S3 yang berdomisili di Sultra. Pembuatan akun, pengisian formulir, dan unggah berkas dilakukan secara online melalui portal resmi ini.
            </p>
          </div>

          {/* Card 2: Juknis PDF & Panduan Berkas */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs hover:shadow-md transition-all space-y-2">
            <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>13 September 2026</span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
              Penerbitan Petunjuk Teknis (Juknis) &amp; Panduan Unggah Dokumen
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-normal">
              Petunjuk Teknis (Juknis) resmi BSSC TA 2026 telah diterbitkan. Pastikan seluruh dokumen persyaratan (KTM, KTP, Transkrip Nilai, dan Surat Pernyataan) diunggah berformat PDF/JPG/PNG dengan ukuran maksimal 2MB per berkas.
            </p>
            <div className="pt-2">
              <a
                href="/Petunjuk_Teknis_BSSC_2026.pdf"
                download="Petunjuk_Teknis_BSSC_2026.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 rounded-xl text-xs font-bold transition-colors"
              >
                <Download className="w-4 h-4" /> Unduh Dokumen Juknis BSSC (PDF)
              </a>
            </div>
          </div>

          {/* Card 3: Tahap Seleksi & Verifikasi */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs hover:shadow-md transition-all space-y-2">
            <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{timeline[1]?.date || '1 – 15 Oktober 2026'}</span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
              Jadwal Seleksi Administrasi &amp; Verifikasi Berkas
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-normal">
              Proses penelitian, verifikasi berkas, dan validasi kualifikasi pendaftar oleh tim penilai Dinas Pendidikan &amp; Kebudayaan Pemprov Sultra. Pendaftar diimbau untuk memantau status pemeriksaan secara berkala melalui fitur Cek Status.
            </p>
          </div>

          {/* Card 4: Hasil Seleksi (Jika Tahap Pengumuman Buka) */}
          {isAnnouncementPeriodOpen && (
            <div className="bg-emerald-50/80 rounded-2xl border border-emerald-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-xs text-emerald-800 font-medium">
                <Calendar className="w-3.5 h-3.5" />
                <span>{timeline[2]?.date || '16 Oktober 2026'}</span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-200 text-emerald-800 text-[10px] font-extrabold uppercase tracking-wider ml-1">
                  HASIL SELEKSI
                </span>
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                  Pengumuman Resmi Nama-Nama Penerima Beasiswa Sultra Cerdas 2026
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal mt-1">
                  Hasil seleksi resmi telah ditetapkan oleh Pemprov Sulawesi Tenggara. Anda dapat mencari nama mahasiswa penerima dan melihat SK resmi di bawah ini.
                </p>
              </div>

              <div className="pt-1 flex flex-wrap gap-3">
                <button
                  onClick={() => setShowSkModal(true)}
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl transition-colors inline-flex items-center gap-2 shadow-xs"
                >
                  <Printer className="w-4 h-4 text-amber-300" /> Cetak Format SK Resmi (PDF)
                </button>
              </div>

              {/* Filter & Table */}
              <div className="pt-4 border-t border-emerald-200/60 space-y-4">
                <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-3">
                  <div className="relative flex-1 w-full">
                    <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Cari nama mahasiswa atau nomor registrasi..."
                      className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-700 focus:outline-none text-slate-900 font-normal placeholder:font-normal placeholder:text-slate-400"
                    />
                  </div>
                  <select
                    value={jenjangFilter}
                    onChange={(e) => setJenjangFilter(e.target.value)}
                    className="w-full sm:w-40 py-2.5 px-3 bg-white border border-slate-200 rounded-xl text-xs font-normal text-slate-700 focus:ring-2 focus:ring-emerald-700 focus:outline-none"
                  >
                    <option value="">Semua Jenjang</option>
                    <option value="S1">Jenjang S1</option>
                    <option value="S2">Jenjang S2</option>
                    <option value="S3">Jenjang S3</option>
                  </select>
                </form>

                {loadingRecipients ? (
                  <div className="py-8 text-center space-y-2">
                    <Loader2 className="w-6 h-6 text-emerald-700 animate-spin mx-auto" />
                    <p className="text-xs text-slate-500 font-normal">Memuat data penerima...</p>
                  </div>
                ) : recipients.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-4 text-center">Tidak ada data penerima yang cocok.</p>
                ) : (
                  <div className="overflow-x-auto border border-emerald-200 rounded-xl bg-white">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-emerald-100/50 text-emerald-950 font-bold border-b border-emerald-200 text-[10px] uppercase">
                        <tr>
                          <th className="py-2.5 px-3">No.</th>
                          <th className="py-2.5 px-3">No. Registrasi</th>
                          <th className="py-2.5 px-3">Nama Mahasiswa</th>
                          <th className="py-2.5 px-3">Jenjang</th>
                          <th className="py-2.5 px-3 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-emerald-100 text-slate-800">
                        {recipients.map((rec, idx) => (
                          <tr key={idx}>
                            <td className="py-2.5 px-3 font-bold text-slate-400">{idx + 1}</td>
                            <td className="py-2.5 px-3 font-mono font-bold text-emerald-900">{rec.registrationNo}</td>
                            <td className="py-2.5 px-3 font-bold text-slate-900">{rec.namaLengkap}</td>
                            <td className="py-2.5 px-3">{rec.jenjangTarget}</td>
                            <td className="py-2.5 px-3 text-center font-bold text-emerald-700">DITERIMA</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal Format SK Resmi */}
      {showSkModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl w-[96vw] max-w-4xl shadow-2xl overflow-hidden border border-slate-200 my-8">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm sm:text-base">Surat Keputusan (SK) Penetapan Penerima Beasiswa Sultra Cerdas</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1 shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" /> Cetak Dokumen SK
                </button>
                <button
                  onClick={() => setShowSkModal(false)}
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>

            <div className="p-8 sm:p-12 space-y-6 text-black font-sans text-xs max-h-[75vh] overflow-y-auto bg-white">
              <div className="text-center border-b-4 border-black pb-4 space-y-1">
                <h2 className="text-lg font-black uppercase tracking-wider">PEMERINTAH PROVINSI SULAWESI TENGGARA</h2>
                <h1 className="text-xl font-black uppercase tracking-wider">DINAS PENDIDIKAN DAN KEBUDAYAAN</h1>
                <p className="text-[11px]">Jalan Kompleks Perkantoran Bumi Praja Anduonohu Kendari — Sulawesi Tenggara</p>
              </div>

              <div className="text-center space-y-1 py-2">
                <h3 className="font-bold text-sm uppercase underline">SURAT KEPUTUSAN KEPALA DINAS PENDIDIKAN DAN KEBUDAYAAN</h3>
                <p className="font-mono text-xs">NOMOR: 421.5/BSSC-SK/X/2026</p>
                <p className="font-bold uppercase mt-2">TENTANG PENETAPAN PENERIMA BEASISWA STIMULAN SULTRA CERDAS TAHUN ANGGARAN 2026</p>
              </div>

              <div className="space-y-3 leading-relaxed text-justify">
                <p><strong>MEMUTUSKAN:</strong> Menetapkan nama-nama mahasiswa yang tercantum dalam Lampiran Surat Keputusan ini sebagai <strong>Penerima Resmi Beasiswa Stimulan Sultra Cerdas Tahun 2026</strong> Pemerintah Provinsi Sulawesi Tenggara.</p>
              </div>

              <div className="border border-black rounded-lg overflow-hidden my-4">
                <table className="w-full text-left border-collapse text-[11px]">
                  <thead className="bg-gray-100 border-b border-black font-bold">
                    <tr>
                      <th className="p-2 border-r border-black">No.</th>
                      <th className="p-2 border-r border-black">No. Registrasi</th>
                      <th className="p-2 border-r border-black">Nama Lengkap Mahasiswa</th>
                      <th className="p-2 border-r border-black">Jenjang</th>
                      <th className="p-2">Perguruan Tinggi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recipients.slice(0, 15).map((r, i) => (
                      <tr key={i} className="border-b border-gray-300">
                        <td className="p-2 border-r border-black font-bold text-center">{i + 1}</td>
                        <td className="p-2 border-r border-black font-mono">{r.registrationNo}</td>
                        <td className="p-2 border-r border-black font-bold">{r.namaLengkap}</td>
                        <td className="p-2 border-r border-black text-center">{r.jenjangTarget}</td>
                        <td className="p-2">{r.institusi}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end pt-8">
                <div className="text-center w-64 space-y-1">
                  <p>Ditetapkan di Kendari</p>
                  <p className="font-bold">Pada Tanggal: 22 Oktober 2026</p>
                  <p className="pt-2 font-bold uppercase">Kepala Dinas Pendidikan dan Kebudayaan Prov. Sultra</p>
                  <div className="h-16 flex items-center justify-center italic text-gray-400">
                    [Tanda Tangan &amp; Cap Basah Digital]
                  </div>
                  <p className="font-bold underline uppercase">H. YUSUF, S.Pd., M.Si.</p>
                  <p className="text-[10px]">NIP. 19710812 199703 1 004</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </main>
  );
}
