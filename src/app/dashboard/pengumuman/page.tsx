'use client';

import React, { useEffect, useState } from 'react';
import { Award, Search, Calendar, FileText, CheckCircle2, Download, Printer, Filter, ShieldCheck, Sparkles, Loader2, Clock, ArrowRight, XCircle, RefreshCw } from 'lucide-react';
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
  isLulusSanggah?: boolean;
  isSanggah?: boolean;
  jalur?: string;
  notes?: string;
}

export default function PengumumanPage() {
  const [myApp, setMyApp] = useState<any>(null);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [loadingRecipients, setLoadingRecipients] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [jenjangFilter, setJenjangFilter] = useState('');
  const [showSkModal, setShowSkModal] = useState(false);
  const [scheduleConfig, setScheduleConfig] = useState<ScheduleConfig>(getStoredScheduleConfig());
  const [activeTab, setActiveTab] = useState<'all' | 'sanggah' | 'awal'>('all');

  useEffect(() => {
    // Fetch user's own status
    async function loadMyStatus() {
      try {
        const res = await fetchAPI('/applicant/application').catch(() => null);
        if (res?.success && res?.data) {
          setMyApp(res.data);
        }
      } catch (e) {
        // ignore
      }
    }

    loadMyStatus();

    // Schedule listener
    setScheduleConfig(getStoredScheduleConfig());
    const handleUpdate = () => {
      setScheduleConfig(getStoredScheduleConfig());
    };
    window.addEventListener('bssc_schedule_updated', handleUpdate);
    return () => {
      window.removeEventListener('bssc_schedule_updated', handleUpdate);
    };
  }, []);

  const timeline = getDynamicTimeline(scheduleConfig);
  const pengumumanStep = timeline.find((s) => s.id === 'pengumuman');
  const sanggahStep = timeline.find((s) => s.id === 'sanggah');
  const pengumumanSanggahStep = timeline.find((s) => s.id === 'pengumuman-sanggah');
  const penetapanStep = timeline.find((s) => s.id === 'penetapan');

  const isSanggahPeriodOpen = sanggahStep ? sanggahStep.status === 'active' : false;

  // Check if announcement stage is currently active or completed according to admin schedule
  const isAnnouncementPeriodOpen = pengumumanStep
    ? pengumumanStep.status === 'active' || pengumumanStep.status === 'completed'
    : false;

  const isPengumumanSanggahPeriodOpen = pengumumanSanggahStep
    ? pengumumanSanggahStep.status === 'active' || pengumumanSanggahStep.status === 'completed'
    : false;

  const isPenetapanPeriodOpen = penetapanStep
    ? penetapanStep.status === 'active' || penetapanStep.status === 'completed'
    : false;

  // Set default tab based on period
  useEffect(() => {
    if (isPenetapanPeriodOpen) {
      setActiveTab('all');
    } else if (isPengumumanSanggahPeriodOpen) {
      setActiveTab('sanggah');
    } else {
      setActiveTab('awal');
    }
  }, [isPenetapanPeriodOpen, isPengumumanSanggahPeriodOpen]);

  // Find currently active timeline step (or fallback to upcoming/first step)
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
      if (activeTab) params.set('mode', activeTab);

      const res = await fetchAPI(`/public/announcements/recipients?${params.toString()}`);
      if (res.success && res.data) {
        setRecipients(res.data.recipients || []);
      }
    } catch (e) {
      console.warn('Load recipients error:', e);
    } finally {
      setLoadingRecipients(false);
    }
  };

  useEffect(() => {
    loadRecipients();
  }, [jenjangFilter, isAnnouncementPeriodOpen, activeTab]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadRecipients();
  };

  const effectiveMyStatus = myApp?.status;
  const isUserAccepted =
    isAnnouncementPeriodOpen &&
    (effectiveMyStatus === 'DITERIMA' ||
      effectiveMyStatus === 'PENCAIRAN_TERMIN_1' ||
      effectiveMyStatus === 'PENCAIRAN_TERMIN_2');

  return (
    <div className="w-full space-y-6 max-w-6xl mx-auto pb-16">
      {/* Header Banner - Only Shown When Announcement Period is Open & User is Accepted or Viewing Results */}
      {isAnnouncementPeriodOpen && isUserAccepted && (
        <div className="bg-[#0B3A6A] rounded-3xl p-6 sm:p-10 text-white relative overflow-hidden shadow-sm border border-[#134983]">
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-extrabold tracking-wider uppercase border border-emerald-400/30">
                <Award className="w-4 h-4 text-emerald-300" />{' '}
                {isPenetapanPeriodOpen
                  ? 'RESMI DITETAPKAN (SK GUBERNUR)'
                  : isPengumumanSanggahPeriodOpen
                  ? 'HASIL SANGGAH: ANDA DINYATAKAN LOLOS'
                  : 'SELAMAT! ANDA DINYATAKAN LOLOS SELEKSI'}
              </div>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
                {isPenetapanPeriodOpen
                  ? 'Penerima Resmi Beasiswa Sultra Cerdas 2026'
                  : isPengumumanSanggahPeriodOpen
                  ? 'Kelulusan Hasil Evaluasi Sanggahan'
                  : 'Penerima Beasiswa Sultra Cerdas 2026'}
              </h1>
              <p className="text-blue-100 text-xs sm:text-sm leading-relaxed font-light">
                Nomor Registrasi:{' '}
                <strong className="font-mono bg-white/10 px-2.5 py-1 rounded text-white font-bold">
                  {myApp?.registrationNo || 'BSSC-2026-REG'}
                </strong>
                .{' '}
                {isPenetapanPeriodOpen
                  ? 'Nama Anda telah tercantum dalam SK Gubernur sebagai penerima sah. Silakan lengkapi nomor rekening bank Anda di Beranda Dashboard untuk pencairan Termin 1.'
                  : isPengumumanSanggahPeriodOpen
                  ? 'Sanggahan Anda telah disetujui oleh tim seleksi. Penetapan resmi SK Gubernur dijadwalkan pada 16 - 17 November 2026.'
                  : 'Berkas dan kualifikasi Anda telah dinyatakan lengkap dan memenuhi seluruh kriteria kelulusan.'}
              </p>
            </div>
            <div className="shrink-0 flex flex-col sm:flex-row gap-3">
              {isPenetapanPeriodOpen && (
                <Link
                  href="/dashboard"
                  className="px-5 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 border border-blue-400/40"
                >
                  💳 Input Norek Bank
                </Link>
              )}
              <button
                onClick={() => setShowSkModal(true)}
                className="px-6 py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 border border-emerald-600"
              >
                <Printer className="w-4 h-4" /> Cetak SK &amp; Bukti Lolos (PDF)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clean Page Title Header when Announcement is Closed */}
      {!isAnnouncementPeriodOpen && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Pengumuman Hasil Seleksi</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">Pantau status pelaksanaan seleksi dan pengumuman penetapan penerima beasiswa.</p>
          </div>
        </div>
      )}

      {/* Sanggahan Alert Banner (jika DITOLAK dan masa sanggah SEDANG DIBUKA) */}
      {isAnnouncementPeriodOpen && isSanggahPeriodOpen && effectiveMyStatus === 'DITOLAK' && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-600 text-white rounded-xl shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-xs text-rose-900 uppercase">Masa Sanggah Dibuka</h4>
              <p className="text-xs text-rose-700">Berkas Anda dinyatakan belum memenuhi kualifikasi. Anda dapat mengajukan perbaikan di halaman utama dashboard.</p>
            </div>
          </div>
          <Link
            href="/dashboard"
            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl transition-colors shrink-0 shadow-xs"
          >
            Ajukan Sanggahan
          </Link>
        </div>
      )}

      {/* Informasi Masa Sanggah Selesai (Fase Penetapan / Pasca Sanggah) */}
      {isAnnouncementPeriodOpen && sanggahStep?.status === 'completed' && effectiveMyStatus === 'DITOLAK' && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-slate-800 text-white rounded-xl shadow-xs">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h4 className="font-extrabold text-xs text-slate-900 uppercase">Masa Sanggah Berakhir &bull; Penetapan Hasil Seleksi Final</h4>
              <p className="text-xs text-slate-600">Masa pengajuan sanggahan telah resmi ditutup. Seluruh keputusan penetapan penerima beasiswa bersifat final dan mengikat sesuai SK Gubernur Sulawesi Tenggara.</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      {!isAnnouncementPeriodOpen ? (
        /* Only Show Currently Active Timeline Step Before Announcement Release Date */
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
                {activeStep?.title || 'Pendaftaran Online'}
              </h2>
              <p className="text-xs text-slate-500">
                {activeStep?.desc || 'Pembuatan akun, pengisian formulir, & unggah berkas di portal resmi.'}
              </p>
            </div>
            <div className="shrink-0">
              <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold bg-blue-50 text-blue-900 border border-blue-200 shadow-xs">
                <Clock className="w-4 h-4 text-blue-700" />
                {activeStep?.date || '1 - 18 Oktober 2026'}
              </span>
            </div>
          </div>

          <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200 text-xs sm:text-sm text-slate-700 space-y-2">
            <p className="leading-relaxed">
              Pengumuman resmi hasil seleksi dan daftar penerima beasiswa belum dirilis. Saat ini alur pelaksanaan beasiswa masih berada pada tahap <strong className="text-slate-900">{activeStep?.title}</strong> ({activeStep?.date}).
            </p>
            <p className="text-slate-500 text-xs">
              Jadwal rilis resmi pengumuman kelulusan: <strong className="text-slate-800">{pengumumanStep?.date || '2 - 4 November 2026'}</strong>.
            </p>
          </div>

          <div className="pt-2 flex justify-end">
            <Link
              href="/#jadwal"
              className="inline-flex items-center gap-2 text-xs font-extrabold text-blue-900 hover:text-blue-950 transition-colors bg-blue-50 hover:bg-blue-100 border border-blue-200 px-4 py-2.5 rounded-xl shadow-xs"
            >
              Lihat Seluruh Timeline &amp; Agenda di Beranda <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        /* Recipient Table View when Announcement Date is Reached */
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                  isPenetapanPeriodOpen
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : isPengumumanSanggahPeriodOpen
                    ? 'bg-amber-100 text-amber-900 border border-amber-200'
                    : 'bg-blue-100 text-blue-900 border border-blue-200'
                }`}>
                  {isPenetapanPeriodOpen
                    ? 'SK GUBERNUR • KEPUTUSAN FINAL'
                    : isPengumumanSanggahPeriodOpen
                    ? 'PENGUMUMAN HASIL SANGGAHAN'
                    : 'PENGUMUMAN HASIL SELEKSI AWAL'}
                </span>
              </div>
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-blue-900" />
                {isPenetapanPeriodOpen
                  ? 'Penetapan Penerima Resmi Beasiswa (SK Gubernur)'
                  : isPengumumanSanggahPeriodOpen
                  ? 'Pengumuman Hasil Verifikasi Sanggahan'
                  : 'Daftar Nama Lolos Seleksi Awal'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {isPenetapanPeriodOpen
                  ? 'Daftar KESELURUHAN penerima resmi beasiswa (gabungan seleksi awal dan pasca sanggah) yang telah ditetapkan secara sah.'
                  : isPengumumanSanggahPeriodOpen
                  ? 'Pengumuman hasil peninjauan ulang berkas bagi pendaftar yang berstatus VERIFIKASI BERKAS / mengajukan sanggahan.'
                  : 'Daftar nama mahasiswa yang dinyatakan memenuhi kualifikasi seleksi administrasi tahap awal.'}
              </p>
            </div>
            <button
              onClick={() => setShowSkModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition-colors shrink-0 shadow-xs"
            >
              <Printer className="w-4 h-4 text-amber-400" /> Lihat Format SK Resmi
            </button>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-3">
            {isPenetapanPeriodOpen && (
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                  activeTab === 'all'
                    ? 'bg-blue-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                🏛️ Keseluruhan Penerima Resmi (SK Gubernur)
              </button>
            )}
            {(isPengumumanSanggahPeriodOpen || isPenetapanPeriodOpen) && (
              <button
                type="button"
                onClick={() => setActiveTab('sanggah')}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                  activeTab === 'sanggah'
                    ? 'bg-blue-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                🔄 {isPenetapanPeriodOpen ? 'Penerima Jalur Pasca Sanggah' : 'Hasil Verifikasi Sanggahan'}
              </button>
            )}
            <button
              type="button"
              onClick={() => setActiveTab('awal')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                activeTab === 'awal'
                  ? 'bg-blue-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              📋 {isPenetapanPeriodOpen ? 'Penerima Jalur Seleksi Awal' : 'Lolos Seleksi Awal'}
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
                placeholder="Cari nama mahasiswa, NIK, No. Registrasi, atau nama Perguruan Tinggi..."
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:ring-2 focus:ring-blue-900 focus:outline-none text-slate-900"
              />
            </div>
            <select
              value={jenjangFilter}
              onChange={(e) => setJenjangFilter(e.target.value)}
              className="w-full sm:w-48 py-3 px-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-blue-900 focus:outline-none"
            >
              <option value="">Semua Jenjang</option>
              <option value="S1">Jenjang S1</option>
              <option value="S2">Jenjang S2</option>
              <option value="S3">Jenjang S3</option>
              <option value="D3">Jenjang D3</option>
            </select>
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs rounded-2xl transition-all shadow-md shrink-0"
            >
              Cari Penerima
            </button>
          </form>

          {/* Recipients Table / Cards */}
          {loadingRecipients ? (
            <div className="py-16 text-center space-y-3">
              <Loader2 className="w-8 h-8 text-blue-900 animate-spin mx-auto" />
              <p className="text-xs text-slate-500 font-medium">Memuat data penerima beasiswa resmi...</p>
            </div>
          ) : recipients.length === 0 ? (
            <div className="py-16 text-center space-y-3 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
              <Award className="w-12 h-12 text-slate-300 mx-auto" />
              <h4 className="font-bold text-slate-800 text-sm">Belum Ada Data</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Tidak ada data pada tab ini yang cocok dengan pencarian <strong>"{searchTerm}"</strong>.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-100 rounded-2xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-extrabold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3.5 px-4">No.</th>
                    <th className="py-3.5 px-4">No. Registrasi</th>
                    <th className="py-3.5 px-4">Nama Mahasiswa</th>
                    <th className="py-3.5 px-4">Jenjang</th>
                    <th className="py-3.5 px-4">Perguruan Tinggi / Prodi</th>
                    <th className="py-3.5 px-4 text-center">Jalur Kelulusan</th>
                    <th className="py-3.5 px-4 text-center">Status Penetapan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {recipients.map((rec, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-400">{idx + 1}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-900">{rec.registrationNo}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">{rec.namaLengkap}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                          {rec.jenjangTarget}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-slate-900">{rec.institusi}</p>
                        <p className="text-[10px] text-slate-500">{rec.jurusan}</p>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          rec.isSanggah
                            ? 'bg-amber-100 text-amber-900 border border-amber-200'
                            : 'bg-blue-50 text-blue-900 border border-blue-200'
                        }`}>
                          {rec.isSanggah ? 'Pasca Sanggah' : 'Seleksi Awal'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {rec.status === 'DITERIMA' || rec.status === 'PENCAIRAN_TERMIN_1' || rec.status === 'PENCAIRAN_TERMIN_2' ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            {isPenetapanPeriodOpen ? 'RESMI DITETAPKAN' : 'DITERIMA'}
                          </span>
                        ) : rec.status === 'DITOLAK' ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase bg-rose-100 text-rose-800 border border-rose-200">
                            <XCircle className="w-3 h-3 text-rose-600" /> DITOLAK
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase bg-blue-100 text-blue-800 border border-blue-200">
                            <Clock className="w-3 h-3 text-blue-600" /> PROSES
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modal Format SK Resmi Penerima Beasiswa */}
      {showSkModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl w-[96vw] max-w-4xl shadow-2xl overflow-hidden border border-slate-200 my-8">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-400" />
                <h3 className="font-extrabold text-sm sm:text-base">Surat Keputusan (SK) Penetapan Penerima Beasiswa Sultra Cerdas</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl transition-colors flex items-center gap-1 shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" /> Cetak Dokumen SK
                </button>
                <button
                  onClick={() => setShowSkModal(false)}
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition-colors"
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
    </div>
  );
}
