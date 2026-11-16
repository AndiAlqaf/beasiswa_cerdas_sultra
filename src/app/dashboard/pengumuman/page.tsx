'use client';

import React, { useEffect, useState } from 'react';
import {
  Award,
  Calendar,
  FileText,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Loader2,
  Clock,
  ArrowRight,
  XCircle,
  Lightbulb,
  ExternalLink,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { fetchAPI } from '@/lib/api';
import { getStoredScheduleConfig, getDynamicTimeline, ScheduleConfig, isPenetapanAnnounced } from '@/lib/schedule';
import Link from 'next/link';

export default function PengumumanPage() {
  const [application, setApplication] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [scheduleConfig, setScheduleConfig] = useState<ScheduleConfig>(getStoredScheduleConfig());

  useEffect(() => {
    async function loadData() {
      try {
        const [appRes, profileRes] = await Promise.all([
          fetchAPI('/applicant/application').catch(() => null),
          fetchAPI('/applicant/profile').catch(() => null),
        ]);

        if (appRes?.success && appRes?.data) {
          setApplication(appRes.data);
        }

        if (profileRes?.success && profileRes?.data) {
          setProfile(profileRes.data.profile || {});
          setUser(profileRes.data.user || {});
        }
      } catch (err) {
        console.warn('Load pengumuman error:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();

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
  const isSanggahPeriodCompleted = sanggahStep ? sanggahStep.status === 'completed' : false;

  const isAnnouncementPeriodOpen = pengumumanStep
    ? pengumumanStep.status === 'active' || pengumumanStep.status === 'completed'
    : false;

  const isPengumumanSanggahPeriodOpen = pengumumanSanggahStep
    ? pengumumanSanggahStep.status === 'active' || pengumumanSanggahStep.status === 'completed'
    : false;

  const isPenetapanPeriodOpen = isPenetapanAnnounced(scheduleConfig);

  const activeStep =
    timeline.find((step) => step.status === 'active') ||
    timeline.find((step) => step.status === 'upcoming') ||
    timeline[0];

  const isSanggahan = application?.notes?.includes('[SANGGAHAN MAHASISWA]');

  let effectiveStatus = application?.status;
  let effectiveNotes = application?.notes;

  if (isSanggahan) {
    if (!isPengumumanSanggahPeriodOpen && (application?.status === 'DITERIMA' || application?.status === 'LOLOS_VERIFIKASI' || application?.status === 'DITOLAK')) {
      effectiveStatus = 'VERIFIKASI_BERKAS';
      effectiveNotes = 'Sanggahan sedang diperiksa. Mohon pantau kembali pada masa pengumuman hasil sanggah.';
    }
  } else {
    if (!isAnnouncementPeriodOpen && (application?.status === 'DITERIMA' || application?.status === 'LOLOS_VERIFIKASI' || application?.status === 'DITOLAK')) {
      effectiveStatus = 'VERIFIKASI_BERKAS';
      effectiveNotes = undefined;
    }
  }

  // Sebelum jadwal penetapan resmi dibuka, status DITERIMA diperlakukan sebagai LOLOS_VERIFIKASI
  // agar hasil penetapan tidak tampil sebelum waktu pengumuman resmi (17 Nov 23:59 WITA)
  if ((effectiveStatus === 'DITERIMA' || effectiveStatus === 'PENCAIRAN_TERMIN_1' || effectiveStatus === 'PENCAIRAN_TERMIN_2') && !isPenetapanPeriodOpen) {
    effectiveStatus = 'LOLOS_VERIFIKASI';
  }

  const isDiterima =
    effectiveStatus === 'DITERIMA' ||
    effectiveStatus === 'PENCAIRAN_TERMIN_1' ||
    effectiveStatus === 'PENCAIRAN_TERMIN_2';

  const namaMahasiswa = profile?.namaLengkap || user?.namaLengkap || 'Mahasiswa';
  const noRegistrasi = application?.registrationNo || '-';
  const nikMahasiswa = profile?.nik || user?.nik || '-';
  const jenjang = profile?.jenjangTarget || user?.jenjangTarget || 'S1';
  const perguruanTinggi = profile?.namaInstitusi || profile?.institusi || '-';
  const programStudi = profile?.namaJurusan || profile?.jurusan || '-';

  if (loading) {
    return (
      <div className="w-full max-w-5xl mx-auto py-24 text-center space-y-3">
        <Loader2 className="w-10 h-10 text-blue-900 animate-spin mx-auto" />
        <p className="text-xs sm:text-sm text-slate-500 font-medium">Memuat data pengumuman hasil seleksi...</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 max-w-5xl mx-auto pb-16">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Pengumuman Hasil Seleksi</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Informasi resmi hasil verifikasi dan penetapan penerima Beasiswa Stimulan Sultra Cerdas 2026.
          </p>
        </div>
      </div>

      {/* BELUM MENGAJUKAN PENDAFTARAN */}
      {!application?.registrationNo && (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Belum Ada Pendaftaran Diajukan</h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
            Anda belum mengajukan pendaftaran beasiswa. Silakan lengkapi formulir dan unggah berkas persyaratan di menu Pendaftaran.
          </p>
          <div className="pt-2">
            <Link
              href="/dashboard/daftar"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
            >
              Isi Formulir Pendaftaran <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* JIKA PENGUMUMAN BELUM DIBUKA */}
      {application?.registrationNo && !isAnnouncementPeriodOpen && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-900 px-3 py-1 rounded-full border border-blue-200">
                Tahapan Seleksi Berjalan
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-2">
                {activeStep?.title || 'Pendaftaran & Verifikasi Berkas'}
              </h2>
              <p className="text-xs text-slate-500">
                {activeStep?.desc || 'Dokumen pendaftaran sedang diteliti dan divalidasi oleh tim penilai.'}
              </p>
            </div>
            <div className="shrink-0">
              <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold bg-blue-50 text-blue-900 border border-blue-200 shadow-xs">
                <Clock className="w-4 h-4 text-blue-700" />
                {activeStep?.date || 'Oktober - November 2026'}
              </span>
            </div>
          </div>

          <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200 text-xs sm:text-sm text-slate-700 space-y-2">
            <p className="leading-relaxed">
              Pengumuman resmi hasil seleksi dan daftar penerima beasiswa belum dirilis. Saat ini tahapan beasiswa masih berada pada tahap{' '}
              <strong className="text-slate-900">{activeStep?.title}</strong>.
            </p>
            <p className="text-slate-500 text-xs">
              Silakan ditunggu dan pantau informasi pengumuman secara berkala di portal ini.
            </p>
          </div>
        </div>
      )}

      {/* JIKA MASA PENGUMUMAN DIBUKA & SUDAH ADA PENDAFTARAN */}
      {application?.registrationNo && isAnnouncementPeriodOpen && (
        <>
          {/* ===================== KASUS 1: DITERIMA (PENERIMA RESMI) ===================== */}
          {isDiterima && (
            <div className="space-y-6">
              {/* Hero Banner Lolos */}
              <div className="bg-[#0B3A6A] rounded-3xl p-6 sm:p-10 text-white relative overflow-hidden shadow-sm border border-[#134983]">
                <div className="relative z-10 flex flex-col justify-between gap-4">
                  <div className="space-y-3 max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-extrabold tracking-wider uppercase border border-emerald-400/30">
                      <CheckCircle2 className="w-4 h-4 text-emerald-300" />{' '}
                      {isPenetapanPeriodOpen
                        ? 'RESMI DITETAPKAN'
                        : isPengumumanSanggahPeriodOpen
                        ? 'HASIL SANGGAH: TERVERIFIKASI'
                        : 'BERKAS TERVERIFIKASI'}
                    </div>
                    <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
                      {isPenetapanPeriodOpen
                        ? 'Selamat! Anda Ditetapkan Sebagai Penerima Beasiswa'
                        : 'Selamat! Berkas Pendaftaran Anda Terverifikasi'}
                    </h1>
                    <p className="text-blue-100 text-xs sm:text-sm leading-relaxed font-light">
                      {isPenetapanPeriodOpen
                        ? 'Selamat! Anda telah resmi ditetapkan sebagai penerima Beasiswa Stimulan Sultra Cerdas 2026 Pemerintah Provinsi Sulawesi Tenggara.'
                        : 'Seluruh berkas persyaratan Anda telah selesai diverifikasi dan dinyatakan memenuhi syarat.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Data Identitas Penerima */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-900 flex items-center justify-center">
                      <ShieldCheck className="w-5 h-5 text-blue-900" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900">Identitas Penerima Beasiswa</h3>
                      <p className="text-xs text-slate-500">Data pendaftar resmi penerima Beasiswa Stimulan Sultra Cerdas 2026</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                    RESMI DITETAPKAN
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 text-xs">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Nomor Registrasi</span>
                    <p className="font-mono font-bold text-sm text-blue-950">{noRegistrasi}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Nama Mahasiswa</span>
                    <p className="font-bold text-sm text-slate-900">{namaMahasiswa}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Nomor Induk Kependudukan (NIK)</span>
                    <p className="font-mono font-bold text-sm text-slate-800">{nikMahasiswa}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Jenjang Pendidikan</span>
                    <p className="font-bold text-sm text-slate-900">Jenjang {jenjang}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Perguruan Tinggi</span>
                    <p className="font-bold text-sm text-slate-900">{perguruanTinggi}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Program Studi</span>
                    <p className="font-bold text-sm text-slate-900">{programStudi}</p>
                  </div>
                </div>
              </div>

              {/* BANNER INFORMASI PENTING TAHAPAN PENETAPAN (WA MINBEST & WA GROUP) */}
              <div className="bg-[#FFFDF5] rounded-2xl sm:rounded-3xl border-2 border-amber-300 p-5 sm:p-6 shadow-xs">
                <div className="flex items-start sm:items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#0B2545] text-amber-300 flex items-center justify-center shrink-0 shadow-sm">
                    <Lightbulb className="w-6 h-6 text-amber-300" />
                  </div>
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-black text-[#0B2545] tracking-tight">
                      Informasi Penting
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                      Terima kasih telah mengikuti seluruh tahapan seleksi Beasiswa Stimulan Sultra Cerdas 2026. Untuk informasi selanjutnya silakan menghubungi Minbest BSSC 2026 (WA +62 823 5555 6187) atau bergabung dalam WA group berikut ini:
                    </p>
                    <div className="pt-1">
                      <a
                        href="https://chat.whatsapp.com/DKx9IvH25jJDKnzqf0qrrF?s=sw&p=i&iam=2"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-blue-700 hover:text-blue-900 underline break-all group transition-colors"
                      >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 shrink-0 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.698c.974.577 1.956.883 2.8.883 3.181 0 5.767-2.586 5.768-5.766 0-3.18-2.587-5.77-5.772-5.77zm6.772 5.766c-.001 3.737-3.041 6.777-6.777 6.777-.999 0-2.146-.301-3.08-.857l-3.415.895.912-3.334c-.663-1.049-1.014-2.261-1.014-3.481 0-3.738 3.04-6.778 6.777-6.778 3.738 0 6.777 3.04 6.777 6.778zM12.031 2C6.49 2 2 6.49 2 12.031c0 1.986.586 3.842 1.602 5.405L2 22l4.698-1.57c1.513.916 3.286 1.442 5.333 1.442 5.541 0 10.031-4.49 10.031-10.031C22.062 6.49 17.572 2 12.031 2z"/>
                        </svg>
                        <span>https://chat.whatsapp.com/DKx9IvH25jJDKnzqf0qrrF?s=sw&p=i&iam=2</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===================== KASUS 2: LOLOS_VERIFIKASI ===================== */}
          {effectiveStatus === 'LOLOS_VERIFIKASI' && (
            <div className="space-y-6">
              {isPenetapanPeriodOpen ? (
                /* Pada fase Penetapan: Belum Terpilih Sebagai Penerima */
                <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                    <div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                        PENETAPAN HASIL SELEKSI AKHIR
                      </span>
                      <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-2">
                        Belum Terpilih Sebagai Penerima Beasiswa
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">
                        Nomor Registrasi: <strong className="font-mono text-slate-800">{noRegistrasi}</strong> &bull; {namaMahasiswa}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
                      Belum Terpilih
                    </span>
                  </div>

                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 text-xs sm:text-sm text-slate-700 leading-relaxed space-y-3">
                    <p>
                      Terima kasih telah mengikuti seluruh tahapan seleksi hingga akhir. Berdasarkan hasil penetapan resmi, mohon maaf Anda belum terpilih sebagai penerima Beasiswa Stimulan Sultra Cerdas 2026 pada periode ini. Tetap semangat, jangan berkecil hati, dan teruslah berprestasi dalam perjalanan pendidikan Anda.
                    </p>
                  </div>

                  {/* Apresiasi Pemprov Sultra */}
                  <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-5 space-y-2">
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-amber-600" />
                      <h4 className="font-extrabold text-xs text-amber-950 uppercase tracking-wider">Apresiasi Pemprov Sulawesi Tenggara</h4>
                    </div>
                    <p className="text-xs text-amber-900 italic leading-relaxed font-medium">
                      &ldquo;Kepada seluruh mahasiswa Sulawesi Tenggara yang belum berhasil menerima beasiswa pada periode ini: jangan pernah berkecil hati. Seluruh ikhtiar, kerja keras, dan potensi luar biasa yang Anda miliki adalah kebanggaan daerah. Kegagalan hari ini adalah tangga awal menuju pencapaian yang lebih gemilang. Teruslah belajar, berinovasi, dan mengukir prestasi terbaik demi masa depan Anda dan daerah yang kita cintai.&rdquo;
                    </p>
                  </div>
                </div>
              ) : (
                /* Sebelum Penetapan: Berkas Lolos Verifikasi */
                <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                    <div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-teal-100 text-teal-800 border border-teal-200">
                        {isPengumumanSanggahPeriodOpen ? 'HASIL EVALUASI SANGGAH' : 'HASIL VERIFIKASI BERKAS'}
                      </span>
                      <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-2">
                        Lolos Verifikasi Berkas
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">
                        Nomor Registrasi: <strong className="font-mono text-slate-800">{noRegistrasi}</strong> &bull; {namaMahasiswa}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200 shrink-0">
                      <CheckCircle2 className="w-4 h-4 text-teal-600" /> Lolos Verifikasi
                    </span>
                  </div>

                  <div className="p-5 bg-teal-50/60 rounded-2xl border border-teal-200 text-xs sm:text-sm text-teal-950 leading-relaxed space-y-2">
                    <p>
                      Berkas pendaftaran Anda dinyatakan <strong>Lolos Verifikasi Berkas</strong>. Silakan ditunggu dan pantau informasi pengumuman penetapan resmi penerima beasiswa secara berkala di portal ini.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ===================== KASUS 3: DITOLAK ===================== */}
          {effectiveStatus === 'DITOLAK' && (
            <div className="space-y-6">
              {/* Jika masih dalam masa sanggah aktif */}
              {isSanggahPeriodOpen && (
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-rose-600 text-white rounded-xl shadow-xs">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-xs text-rose-900 uppercase">Masa Sanggah Sedang Dibuka</h4>
                      <p className="text-xs text-rose-700">Berkas pendaftaran Anda belum memenuhi kualifikasi. Anda dapat mengajukan sanggahan dan perbaikan berkas di Dashboard.</p>
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

              {/* Card Status Belum Lolos Seleksi */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-200">
                      {isPenetapanPeriodOpen || isSanggahPeriodCompleted
                        ? 'KEPUTUSAN PENETAPAN FINAL'
                        : 'HASIL VERIFIKASI BERKAS'}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-2">
                      {isPenetapanPeriodOpen || isSanggahPeriodCompleted
                        ? 'Belum Lolos Seleksi'
                        : 'Belum Lolos Verifikasi'}
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Nomor Registrasi: <strong className="font-mono text-slate-800">{noRegistrasi}</strong> &bull; {namaMahasiswa}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200 shrink-0">
                    <XCircle className="w-4 h-4 text-rose-600" /> Belum Lolos
                  </span>
                </div>

                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 text-xs sm:text-sm text-slate-700 leading-relaxed space-y-2">
                  <p>
                    Tetap semangat dan jangan berkecil hati! Perjalanan pendidikan Anda masih panjang dan kesempatan emas lainnya menanti di masa depan. Teruslah berkarya, belajar, dan berprestasi untuk kebanggaan Sulawesi Tenggara.
                  </p>
                </div>

                {/* Riwayat Catatan Verifikator (Collapsible) */}
                {effectiveNotes && (
                  <details className="group bg-slate-50/80 border border-slate-200 rounded-2xl p-4 transition-all">
                    <summary className="font-bold text-xs text-slate-700 cursor-pointer list-none flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-slate-500" />
                        Lihat Riwayat Catatan Verifikasi Administrasi
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-open:rotate-90 transition-transform" />
                    </summary>
                    <div className="pt-3 mt-3 border-t border-slate-200/80 text-xs text-slate-600 whitespace-pre-wrap leading-relaxed font-sans">
                      {effectiveNotes}
                    </div>
                  </details>
                )}

                {/* Pesan & Apresiasi Pemprov Sultra */}
                <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-5 space-y-2">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-600" />
                    <h4 className="font-extrabold text-xs text-amber-950 uppercase tracking-wider">Pesan Semangat &amp; Apresiasi Pemprov Sultra</h4>
                  </div>
                  <p className="text-xs text-amber-900 italic leading-relaxed font-medium">
                    &ldquo;Kepada seluruh mahasiswa Sulawesi Tenggara yang belum berhasil menerima beasiswa pada periode ini: jangan pernah berkecil hati. Seluruh ikhtiar, kerja keras, dan potensi luar biasa yang Anda miliki adalah kebanggaan daerah. Kegagalan hari ini adalah tangga awal menuju pencapaian yang lebih gemilang. Teruslah belajar, berinovasi, dan mengukir prestasi terbaik demi masa depan Anda dan daerah yang kita cintai.&rdquo;
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ===================== KASUS 4: MASIH PROSES VERIFIKASI ===================== */}
          {effectiveStatus !== 'DITERIMA' &&
            effectiveStatus !== 'PENCAIRAN_TERMIN_1' &&
            effectiveStatus !== 'PENCAIRAN_TERMIN_2' &&
            effectiveStatus !== 'LOLOS_VERIFIKASI' &&
            effectiveStatus !== 'DITOLAK' && (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-blue-100 text-blue-900 border border-blue-200">
                      STATUS PROSES
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-2">
                      Verifikasi Berkas Sedang Berlangsung
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Nomor Registrasi: <strong className="font-mono text-slate-800">{noRegistrasi}</strong> &bull; {namaMahasiswa}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200 shrink-0">
                    <Clock className="w-4 h-4 text-blue-600" /> Proses Pemeriksaan
                  </span>
                </div>

                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 text-xs sm:text-sm text-slate-700 leading-relaxed">
                  <p>
                    Dokumen persyaratan pendaftaran Anda saat ini sedang diperiksa dan diteliti oleh tim verifikator Pemerintah Provinsi Sulawesi Tenggara. Silakan pantau pengumuman secara berkala.
                  </p>
                </div>
              </div>
            )}
        </>
      )}
    </div>
  );
}
