'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle2, Clock, FileText, Calendar, ChevronRight, AlertCircle, Award, XCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { getUser, fetchAPI } from '@/lib/api';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [application, setApplication] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
          setUser((prev: any) => ({
            ...prev,
            ...profileRes.data.user,
            ...(profileRes.data.profile || {}),
          }));
          setDocuments(profileRes.data.documents || []);
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
  }, []);

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
          desc: application?.notes || 'Mohon maaf, berkas pendaftaran Anda belum memenuhi kualifikasi seleksi.',
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

  const statusInfo = getStatusBadge(application?.status);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-slate-900 rounded-3xl p-8 sm:p-10 text-white relative overflow-hidden shadow-md">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
        <div className="absolute bottom-0 right-20 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl translate-y-1/2 pointer-events-none"></div>
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-blue-200 text-xs font-semibold mb-3 backdrop-blur-xs">
            <span>Portal Mahasiswa Sultra Cerdas</span>
            {user?.jenjangTarget && <span>• Jenjang {user.jenjangTarget}</span>}
          </div>
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
              <Link
                href="/dashboard/daftar"
                className="text-xs font-bold text-blue-900 hover:text-blue-950 flex items-center gap-1.5"
              >
                Isi Formulir Pendaftaran <ArrowRight className="w-3.5 h-3.5" />
              </Link>
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

          {application?.notes && (
            <div className="pt-3 mt-3 border-t border-slate-100">
              <p className="text-xs text-slate-600 font-medium">
                <strong>Catatan:</strong> {application.notes}
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
                      ? `Dokumen terverifikasi di server: ${documents.map(d => d.docType).join(', ')}.`
                      : 'Belum ada berkas tersimpan. Pastikan berkas diunggah.'}
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
    </div>
  );
}
