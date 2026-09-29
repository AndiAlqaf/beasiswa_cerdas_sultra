'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle2, Clock, FileText, Calendar, ChevronRight, AlertCircle, Award, XCircle, ArrowRight, Send, Loader2, RefreshCw, Landmark, Save, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { getUser, fetchAPI } from '@/lib/api';
import { getStoredScheduleConfig, getDynamicTimeline, ScheduleConfig } from '@/lib/schedule';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [application, setApplication] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [scheduleConfig, setScheduleConfig] = useState<ScheduleConfig>(getStoredScheduleConfig());

  // Sanggahan State
  const [appealText, setAppealText] = useState('');
  const [submittingAppeal, setSubmittingAppeal] = useState(false);
  const [toast, setToast] = useState<{ title: string; message: string; type: 'success' | 'error' } | null>(null);

  // Bank Account State (Penyaluran Beasiswa 50% Termin 1)
  const [namaBank, setNamaBank] = useState('');
  const [noRekening, setNoRekening] = useState('');
  const [namaRekening, setNamaRekening] = useState('');
  const [savingBank, setSavingBank] = useState(false);

  const handleSaveBank = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaBank.trim() || !noRekening.trim() || !namaRekening.trim()) {
      setToast({ title: 'Perhatian', message: 'Harap lengkapi Nama Bank, Nomor Rekening, dan Nama Pemilik Rekening.', type: 'error' });
      return;
    }
    setSavingBank(true);
    try {
      const res = await fetchAPI('/applicant/profile', {
        method: 'PUT',
        body: JSON.stringify({
          namaBank: namaBank.trim(),
          noRekening: noRekening.trim(),
          namaRekening: namaRekening.trim(),
        }),
      });
      if (res.success) {
        setToast({
          title: 'Berhasil Disimpan!',
          message: 'Informasi rekening bank Anda berhasil disimpan untuk proses penyaluran dana beasiswa 50% tahap pertama.',
          type: 'success',
        });
      } else {
        throw new Error(res.message || 'Gagal menyimpan informasi rekening bank.');
      }
    } catch (err: any) {
      setToast({ title: 'Gagal Menyimpan', message: err.message || 'Terjadi kesalahan sistem.', type: 'error' });
    } finally {
      setSavingBank(false);
    }
  };

  const handleSendAppeal = async () => {
    if (!appealText.trim()) {
      setToast({ title: 'Perhatian', message: 'Harap isi penjelasan sanggahan Anda terlebih dahulu.', type: 'error' });
      return;
    }
    setSubmittingAppeal(true);
    try {
      const res = await fetchAPI('/applicant/application/appeal', {
        method: 'POST',
        body: JSON.stringify({ appealNotes: appealText.trim() }),
      });
      if (res.success) {
        setToast({
          title: 'Sanggahan Terkirim!',
          message: 'Sanggahan Anda berhasil diajukan. Berkas Anda akan diverifikasi ulang oleh tim verifikator.',
          type: 'success',
        });
        setApplication((prev: any) => ({
          ...prev,
          ...res.data,
          status: 'VERIFIKASI_BERKAS',
          notes: res.data?.notes || prev.notes,
        }));
        setAppealText('');
      } else {
        throw new Error(res.message || 'Gagal mengirimkan sanggahan');
      }
    } catch (err: any) {
      setToast({ title: 'Gagal Kirim Sanggahan', message: err.message || 'Terjadi kesalahan sistem.', type: 'error' });
    } finally {
      setSubmittingAppeal(false);
    }
  };

  useEffect(() => {
    const cachedUser = getUser();
    if (cachedUser) setUser(cachedUser);

    async function loadData() {
      try {
        const [profileRes, appRes] = await Promise.all([
          fetchAPI('/applicant/profile').catch(() => null),
          fetchAPI('/applicant/application').catch(() => null),
        ]);

        if (profileRes?.success && profileRes?.data) {
          const p = profileRes.data.profile || {};
          setUser((prev: any) => ({
            ...prev,
            ...profileRes.data.user,
            ...p,
          }));
          setDocuments(profileRes.data.documents || []);
          if (p.namaBank) setNamaBank(p.namaBank);
          if (p.noRekening) setNoRekening(p.noRekening);
          if (p.namaRekening) setNamaRekening(p.namaRekening);
        }

        if (appRes?.success && appRes?.data) {
          setApplication(appRes.data);
        }
      } catch (err) {
        console.warn('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();

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

  const sanggahStep = timeline.find((s) => s.id === 'sanggah');
  const isSanggahPeriodOpen = sanggahStep ? sanggahStep.status === 'active' : false;

  const pengumumanSanggahStep = timeline.find((s) => s.id === 'pengumuman-sanggah');
  const isPengumumanSanggahPeriodOpen = pengumumanSanggahStep
    ? pengumumanSanggahStep.status === 'active' || pengumumanSanggahStep.status === 'completed'
    : false;

  const isSanggahan = application?.notes?.includes('[SANGGAHAN MAHASISWA]');

  let effectiveStatus = application?.status;
  let effectiveNotes = application?.notes;

  if (isSanggahan) {
    if (!isPengumumanSanggahPeriodOpen && (application?.status === 'DITERIMA' || application?.status === 'DITOLAK')) {
      effectiveStatus = 'VERIFIKASI_BERKAS';
      effectiveNotes = 'Sanggahan sedang diperiksa. Mohon pantau kembali pada masa pengumuman hasil sanggah.';
    }
  } else {
    if (!isAnnouncementPeriodOpen && (application?.status === 'DITERIMA' || application?.status === 'DITOLAK')) {
      effectiveStatus = 'VERIFIKASI_BERKAS';
      effectiveNotes = undefined; // Sembunyikan catatan penolakan jika belum waktunya
    }
  }

  const userName = user?.namaLengkap || user?.email || 'Peserta';
  const hasSubmitted = !!application?.registrationNo;

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'DITERIMA':
        return {
          title: 'Diterima Beasiswa',
          desc: 'Selamat! Anda dinyatakan lolos dan ditetapkan sebagai penerima Beasiswa Sultra Cerdas.',
          badgeBg: 'bg-emerald-100 text-emerald-800',
          icon: Award,
          iconBg: 'bg-emerald-50 text-emerald-600',
          badgeText: 'Lolos Seleksi',
        };
      case 'DITOLAK':
        return {
          title: 'Belum Lolos Seleksi',
          desc: effectiveNotes || 'Mohon maaf, berkas pendaftaran Anda belum memenuhi kualifikasi seleksi.',
          badgeBg: 'bg-rose-100 text-rose-800',
          icon: XCircle,
          iconBg: 'bg-rose-50 text-rose-600',
          badgeText: 'Ditolak',
        };
      case 'VERIFIKASI_BERKAS':
      case 'SELEKSI_ADMINISTRASI':
        return {
          title: 'Verifikasi Berkas',
          desc: 'Dokumen pendaftaran sedang diteliti dan divalidasi oleh tim penilai Pemprov Sultra.',
          badgeBg: 'bg-blue-100 text-blue-800',
          icon: Clock,
          iconBg: 'bg-blue-50 text-blue-600',
          badgeText: 'Verifikasi',
        };
      case 'TERKIRIM':
      default:
        return {
          title: hasSubmitted ? 'Permohonan Terkirim' : 'Belum Mengajukan',
          desc: hasSubmitted
            ? 'Pendaftaran Anda telah masuk antrean pemeriksaan verifikator.'
            : 'Silakan isi formulir dan ajukan pendaftaran pada menu Pendaftaran.',
          badgeBg: hasSubmitted ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700',
          icon: hasSubmitted ? Clock : AlertCircle,
          iconBg: hasSubmitted ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-500',
          badgeText: hasSubmitted ? 'Menunggu' : 'Draft',
        };
    }
  };

  const statusInfo = getStatusBadge(effectiveStatus);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-[#0B3A6A] rounded-3xl p-8 sm:p-10 text-white relative overflow-hidden shadow-md">
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3 tracking-tight">
            Selamat Datang, {userName}!
          </h2>
          <p className="text-blue-100 text-sm sm:text-base leading-relaxed font-light">
            {hasSubmitted ? (
              <>
                Permohonan beasiswa Anda terdaftar dengan nomor registrasi{' '}
                <strong className="text-white font-mono font-bold bg-white/10 px-2 py-0.5 rounded">
                  {application.registrationNo}
                </strong>
                . Pantau progres verifikasi Anda secara berkala di portal ini.
              </>
            ) : (
              <>
                Lengkapi riwayat pendidikan dan unggah berkas persyaratan untuk mengajukan pendaftaran Beasiswa Stimulan Sultra Cerdas.
              </>
            )}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Status Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className={`w-12 h-12 rounded-2xl ${statusInfo.iconBg} flex items-center justify-center`}>
                <StatusIcon className="w-6 h-6" />
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full ${statusInfo.badgeBg}`}>
                {statusInfo.badgeText}
              </span>
            </div>
            <div>
              <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mb-1.5">Status Pendaftaran</p>
              <h3 className="text-lg font-bold text-slate-900">{statusInfo.title}</h3>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                {statusInfo.desc}
              </p>
            </div>
          </div>

          {!hasSubmitted && (
            <div className="pt-4 mt-4 border-t border-slate-100">
              {(() => {
                const pendaftaranStep = timeline.find((s) => s.id === 'pendaftaran');
                const isRegistrationOpen = pendaftaranStep ? pendaftaranStep.status === 'active' : true;

                if (isRegistrationOpen) {
                  return (
                    <Link
                      href="/dashboard/daftar"
                      className="text-xs font-bold text-blue-900 hover:text-blue-950 flex items-center gap-1.5"
                    >
                      Isi Formulir Pendaftaran <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  );
                } else {
                  return (
                    <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5 cursor-not-allowed">
                      Pendaftaran Online Ditutup
                    </span>
                  );
                }
              })()}
            </div>
          )}
        </div>

        {/* Tahap / Nomor Registrasi Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-900 flex items-center justify-center font-bold">
                <Calendar className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-3 py-1 rounded-full">
                {user?.jenjangTarget ? `Jenjang ${user.jenjangTarget}` : 'Akademik'}
              </span>
            </div>
            <div>
              <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mb-1.5">Identitas & Registrasi</p>
              <h3 className="text-lg font-bold text-slate-900 font-mono">
                {application?.registrationNo || user?.nik || '-'}
              </h3>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                {application?.submittedAt
                  ? `Diajukan pada tanggal ${new Date(application.submittedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`
                  : 'Akun terdaftar dan siap mengajukan beasiswa.'}
              </p>
            </div>
          </div>

          {effectiveNotes && (
            <div className="pt-3 mt-3 border-t border-slate-100">
              <p className="text-xs text-slate-600 font-medium">
                <strong>Catatan:</strong> {effectiveNotes}
              </p>
            </div>
          )}
        </div>

        {/* Dokumen Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <Link href="/dashboard/berkas" className="text-xs font-bold text-blue-900 hover:text-blue-950 flex items-center gap-1 bg-blue-50 px-3 py-1 rounded-full transition-colors">
                Lihat Berkas <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div>
              <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mb-1.5">Dokumen Terunggah</p>
              {loading ? (
                <h3 className="text-lg font-bold text-slate-900">Memuat...</h3>
              ) : (
                <>
                  <h3 className="text-lg font-bold text-slate-900">
                    {documents.length} Dokumen Tersimpan
                  </h3>
                  <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                    {documents.length > 0
                      ? 'Seluruh dokumen persyaratan pendaftaran Anda telah berhasil tersimpan dan siap untuk diverifikasi.'
                      : 'Belum ada berkas tersimpan. Silakan unggah dokumen persyaratan Anda.'}
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100">
            <Link
              href="/dashboard/template-berkas"
              className="text-xs font-bold text-slate-600 hover:text-blue-900 flex items-center gap-1.5"
            >
              Unduh Format Template Surat <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* PENYALURAN BEASISWA & REKENING BANK CARD (Tahap 1 - 50%: Hanya Muncul Bagi Penerima yang Lolos / DITERIMA) */}
      {(effectiveStatus === 'DITERIMA' || effectiveStatus === 'PENCAIRAN_TERMIN_1' || effectiveStatus === 'PENCAIRAN_TERMIN_2') && (
        <div className="bg-white rounded-3xl border border-blue-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-900 text-white rounded-2xl shadow-sm">
                <Landmark className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider bg-blue-100 text-blue-900 px-3 py-1 rounded-full border border-blue-200">
                  Penyaluran Beasiswa 50% Tahap 1
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-1">Rekening Bank Penerima Beasiswa</h3>
              </div>
            </div>
            <div className="text-xs text-slate-600 bg-blue-50/70 px-4 py-2.5 rounded-2xl border border-blue-100 max-w-sm leading-relaxed">
              💳 <strong>Informasi Penyaluran:</strong> Selamat! Anda telah dinyatakan Lolos. Silakan lengkapi rekening bank atas nama Anda untuk pencairan dana 50% tahap pertama.
            </div>
          </div>

          <form onSubmit={handleSaveBank} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Nama Bank *</label>
                <select
                  value={namaBank}
                  onChange={(e) => setNamaBank(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white text-slate-900"
                >
                  <option value="">-- Pilih Bank --</option>
                  <option value="Bank Sultra (BPD Sultra)">Bank Sultra (BPD Sultra)</option>
                  <option value="Bank Mandiri">Bank Mandiri</option>
                  <option value="Bank BNI">Bank BNI</option>
                  <option value="Bank BRI">Bank BRI</option>
                  <option value="Bank BCA">Bank BCA</option>
                  <option value="Bank BSI (Bank Syariah Indonesia)">Bank BSI</option>
                  <option value="Bank BTN">Bank BTN</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Nomor Rekening Bank *</label>
                <input
                  type="text"
                  value={noRekening}
                  onChange={(e) => setNoRekening(e.target.value)}
                  placeholder="Contoh: 001020304050"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Nama Pemilik Rekening *</label>
                <input
                  type="text"
                  value={namaRekening}
                  onChange={(e) => setNamaRekening(e.target.value)}
                  placeholder="Nama Sesuai Buku Tabungan / KTP"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white text-slate-900"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <p className="text-[11px] text-slate-500 italic">
                * Pastikan rekening bank masih aktif atas nama pendaftar sendiri untuk kelancaran pencairan dana tahap pertama.
              </p>
              <button
                type="submit"
                disabled={savingBank}
                className="px-5 py-2.5 bg-blue-900 hover:bg-blue-950 disabled:bg-slate-300 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 shrink-0"
              >
                {savingBank ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" /> Simpan Rekening Bank
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* INFORMASI MENUNGGU MASA SANGGAH (Jika Status DITOLAK dan Masa Sanggah Belum Buka) */}
      {!isSanggahPeriodOpen && effectiveStatus === 'DITOLAK' && !isSanggahan && (
        <div className="bg-amber-50 rounded-3xl border border-amber-200 p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-600 text-white rounded-2xl shadow-sm">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider bg-amber-100 text-amber-900 px-3 py-1 rounded-full border border-amber-300">
                Informasi Masa Sanggah
              </span>
              <h3 className="text-lg font-black text-slate-900 mt-1">Pengajuan Sanggahan Belum Dibuka</h3>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-amber-200 text-xs text-slate-700 leading-relaxed space-y-2">
            <p>
              Mohon maaf, berkas pendaftaran Anda dinyatakan <strong>Belum Lolos Seleksi</strong>. Pengajuan sanggahan dan perbaikan dokumen hanya dapat dilakukan pada jadwal <strong>Masa Sanggah</strong> ({sanggahStep?.date || '5 - 8 November 2026'}).
            </p>
            <p className="text-slate-500 text-[11px]">
              Silakan siapkan dokumen perbaikan Anda (seperti perbaikan KTP/KK atau Surat Pernyataan) dan ajukan sanggahan ketika jadwal Masa Sanggah resmi dibuka.
            </p>
          </div>
        </div>
      )}

      {/* SANGGAHAN SECTION (Jika Status DITOLAK dan Masa Sanggah Buka) */}
      {isSanggahPeriodOpen && effectiveStatus === 'DITOLAK' && !isSanggahan && (
        <div className="bg-rose-50 rounded-3xl border-2 border-rose-200 p-6 sm:p-8 shadow-md space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-rose-100 pb-5">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-rose-600 text-white rounded-2xl shadow-md shadow-rose-200">
                <RefreshCw className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider bg-rose-100 text-rose-800 px-3 py-1 rounded-full border border-rose-200">
                  Masa Sanggah &amp; Perbaikan Berkas
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-1">Formulir Pengajuan Sanggahan</h3>
              </div>
            </div>
            <Link
              href="/dashboard/berkas"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition-colors shadow-sm"
            >
              <FileText className="w-4 h-4 text-blue-300" /> Perbaiki / Unggah Berkas Baru
            </Link>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-rose-100 space-y-2">
            <p className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              Catatan Alasan Penolakan dari Tim Verifikator:
            </p>
            <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-xl text-xs text-rose-950 leading-relaxed font-medium whitespace-pre-line">
              {effectiveNotes || 'Berkas belum memenuhi kualifikasi seleksi administrasi.'}
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-800">
              Penjelasan / Alasan Sanggahan Anda *
            </label>
            <textarea
              rows={4}
              value={appealText}
              onChange={(e) => setAppealText(e.target.value)}
              placeholder="Tuliskan alasan sanggahan dan perbaikan berkas (misal: 'Saya telah mengunggah kembali dokumen Transkrip Nilai yang sudah berstempel basah pada menu Kelola Berkas...')"
              className="w-full px-4 py-3 rounded-2xl border border-slate-300 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none leading-relaxed text-slate-900 bg-white"
            ></textarea>
            <p className="text-[11px] text-slate-500 italic">
              * Setelah mengirimkan sanggahan, status pendaftaran Anda akan berubah kembali menjadi <strong>VERIFIKASI BERKAS</strong> untuk diperiksa ulang oleh Admin.
            </p>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              disabled={submittingAppeal || !appealText.trim()}
              onClick={handleSendAppeal}
              className="px-6 py-3 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-black text-xs rounded-2xl shadow-lg shadow-rose-200 transition-all flex items-center gap-2"
            >
              {submittingAppeal ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Memproses Sanggahan...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" /> Kirim Pengajuan Sanggahan
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Toast Popup */}
      {toast && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl w-[90vw] max-w-sm shadow-2xl overflow-hidden border border-slate-100 p-6 text-center animate-in zoom-in-95">
            <div className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center mb-4 ${
              toast.type === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
            }`}>
              {toast.type === 'success' ? <CheckCircle2 className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">{toast.title}</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-6">{toast.message}</p>
            <button
              onClick={() => setToast(null)}
              className="w-full py-2.5 px-4 font-bold text-xs text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-md"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
