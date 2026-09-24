'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { FileText, Download, Award, Search, Calendar, CheckCircle2, ShieldCheck, Printer, Clock, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
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

  // Check if announcement period is currently open or completed
  const isAnnouncementPeriodOpen = pengumumanStep
    ? pengumumanStep.status === 'active' || pengumumanStep.status === 'completed'
    : false;

  const activeStep =
    timeline.find((step) => step.status === 'active') ||
    timeline.find((step) => step.status === 'upcoming') ||
    timeline[0];

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

      {/* Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12 space-y-10">
        
        {/* JUKNIS DOWNLOAD BANNER (Dipindahkan dari Landing Page) */}
        <section id="juknis-download" className="relative">
          <div className="bg-[#0e2744] border border-blue-500/30 rounded-3xl p-6 sm:p-10 shadow-xl flex flex-col lg:flex-row items-center justify-between gap-6 text-white">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-blue-600/20 border border-blue-400/30 flex items-center justify-center text-blue-400 shrink-0 shadow-inner">
                <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-blue-300" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Petunjuk Teknis Beasiswa Stimulan Sultra Cerdas
                </h2>
                <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed font-normal">
                  Unduh dokumen resmi Petunjuk Teknis (Juknis) TA 2026 untuk mempelajari persyaratan lengkap, kriteria kelayakan, alur pendaftaran, 4 bidang program studi prioritas, serta format lampiran dokumen permohonan.
                </p>
              </div>
            </div>

            <div className="shrink-0 w-full sm:w-auto">
              <a
                href="/Petunjuk_Teknis_BSSC_2026.pdf"
                download="Petunjuk_Teknis_BSSC_2026.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl shadow-lg hover:shadow-emerald-900/50 transition-all flex items-center justify-center gap-2.5 border border-emerald-400 text-xs sm:text-sm group"
              >
                <Download className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>UNDUH DOKUMEN JUKNIS (PDF)</span>
              </a>
            </div>
          </div>
        </section>

        {/* ANNOUNCEMENT STATUS & RESULTS SECTION */}
        <section className="space-y-6">
          {!isAnnouncementPeriodOpen ? (
            /* Scheduled Notice before Announcement Release */
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                    Tahap Berjalan Saat Ini
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-2">
                    {activeStep?.title || 'Pendaftaran Online'}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1 font-normal">
                    {activeStep?.desc || 'Pembuatan akun, pengisian formulir, & unggah berkas di portal resmi.'}
                  </p>
                </div>
                <div className="shrink-0">
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-50 text-blue-900 border border-blue-200 shadow-xs">
                    <Clock className="w-4 h-4 text-blue-700" />
                    {activeStep?.date || '13 - 30 September 2026'}
                  </span>
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 text-xs sm:text-sm text-slate-700 space-y-2">
                <p className="leading-relaxed font-normal">
                  Pengumuman resmi hasil seleksi dan daftar nama-nama penerima beasiswa belum dirilis. Tahapan seleksi saat ini sedang berada pada tahap <strong className="text-slate-900 font-bold">{activeStep?.title}</strong> ({activeStep?.date}).
                </p>
                <p className="text-slate-500 text-xs font-normal">
                  Jadwal pengumuman resmi rilis hasil penetapan penerima beasiswa: <strong className="text-slate-800 font-bold">{pengumumanStep?.date || '16 - 17 Oktober 2026'}</strong>.
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100">
                <span className="text-xs text-slate-500 font-normal">
                  Sudah mendaftar beasiswa? Cek status verifikasi pendaftaran Anda.
                </span>
                <Link
                  href="/cek-status"
                  className="inline-flex items-center gap-2 text-xs font-bold text-white bg-[#0B3A6A] hover:bg-[#082a4d] px-5 py-2.5 rounded-xl shadow-xs transition-all"
                >
                  Cek Status Pendaftaran <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ) : (
            /* Recipient Results List when Announcement Date is Reached */
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-6 h-6 text-blue-900" />
                    Daftar Penerima Beasiswa Sultra Cerdas 2026
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 font-normal">
                    Daftar nama mahasiswa penerima beasiswa yang telah dinyatakan lulus seleksi dan diverifikasi oleh tim verifikator.
                  </p>
                </div>
                <button
                  onClick={() => setShowSkModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition-colors shrink-0 shadow-xs"
                >
                  <Printer className="w-4 h-4 text-amber-400" /> Format SK Resmi Penetapan
                </button>
              </div>

              {/* Filter Bar */}
              <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Cari nama mahasiswa, No. Registrasi, atau Perguruan Tinggi..."
                    className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0B3A6A] focus:outline-none text-slate-900 font-normal placeholder:font-normal placeholder:text-slate-400"
                  />
                </div>
                <select
                  value={jenjangFilter}
                  onChange={(e) => setJenjangFilter(e.target.value)}
                  className="w-full sm:w-48 py-2.5 px-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-normal text-slate-700 focus:ring-2 focus:ring-[#0B3A6A] focus:outline-none"
                >
                  <option value="">Semua Jenjang</option>
                  <option value="S1">Jenjang S1 / D4</option>
                  <option value="S2">Jenjang S2</option>
                  <option value="S3">Jenjang S3</option>
                </select>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-2.5 bg-[#0B3A6A] hover:bg-[#082a4d] text-white font-bold text-xs rounded-xl transition-all shadow-xs shrink-0"
                >
                  Cari Penerima
                </button>
              </form>

              {/* Recipients Table */}
              {loadingRecipients ? (
                <div className="py-16 text-center space-y-3">
                  <Loader2 className="w-8 h-8 text-[#0B3A6A] animate-spin mx-auto" />
                  <p className="text-xs text-slate-500 font-normal">Memuat data penerima beasiswa resmi...</p>
                </div>
              ) : recipients.length === 0 ? (
                <div className="py-16 text-center space-y-3 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                  <Award className="w-12 h-12 text-slate-300 mx-auto" />
                  <h4 className="font-bold text-slate-800 text-sm">Belum Ada Data Penerima</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto font-normal">
                    Tidak ada data penerima beasiswa yang cocok dengan pencarian <strong>"{searchTerm}"</strong>.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="py-3.5 px-4">No.</th>
                        <th className="py-3.5 px-4">No. Registrasi</th>
                        <th className="py-3.5 px-4">Nama Mahasiswa</th>
                        <th className="py-3.5 px-4">Jenjang</th>
                        <th className="py-3.5 px-4">Perguruan Tinggi / Prodi</th>
                        <th className="py-3.5 px-4 text-center">Status Penetapan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-normal text-slate-800">
                      {recipients.map((rec, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-slate-400">{idx + 1}</td>
                          <td className="py-3.5 px-4 font-mono font-bold text-blue-900">{rec.registrationNo}</td>
                          <td className="py-3.5 px-4 font-bold text-slate-900">{rec.namaLengkap}</td>
                          <td className="py-3.5 px-4">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                              {rec.jenjangTarget}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <p className="font-medium text-slate-900">{rec.institusi}</p>
                            <p className="text-[10px] text-slate-500">{rec.jurusan}</p>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> DITERIMA
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </section>
      </div>

      {/* Modal Format SK Resmi Penerima Beasiswa */}
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

            {/* Content Printable SK */}
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
