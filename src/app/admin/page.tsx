'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Users, FileCheck, Clock, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { fetchAPI } from '@/lib/api';

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const res = await fetchAPI('/admin/dashboard');
        if (res.success && res.data) {
          setData(res.data);
        }
      } catch (err: any) {
        setError(err.message || 'Gagal memuat data dashboard admin.');
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-900" />
        <p className="text-sm font-medium">Memuat Data Dashboard Admin...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-sm flex items-center gap-3">
        <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
        <span>{error}</span>
      </div>
    );
  }

  const stats = data?.stats || {};
  const recentApplicants = data?.recentApplicants || [];

  const statItems = [
    { label: 'Total Pendaftar', value: stats.totalPendaftar || 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Menunggu Verifikasi', value: stats.menungguVerifikasi || 0, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100' },
    { label: 'Berkas Lolos', value: stats.berkasLolos || 0, icon: FileCheck, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { label: 'Diterima Beasiswa', value: stats.diterima || 0, icon: CheckCircle, color: 'text-purple-600', bg: 'bg-purple-100' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-[#0B3A6A] to-[#134983] rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="relative z-10">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">Selamat Datang, Admin! 👋</h2>
          <p className="text-blue-100 max-w-2xl">
            Pantau dan kelola pendaftaran Beasiswa Sultra Cerdas 2026. Terdapat <strong className="text-white">{stats.menungguVerifikasi || 0} berkas</strong> pendaftar yang menunggu untuk diverifikasi.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {statItems.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4">
            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} shrink-0`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">{stat.label}</p>
              <h3 className="text-2xl font-bold text-slate-900">{stat.value.toLocaleString('id-ID')}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Registrations Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">Pendaftar Terbaru</h3>
          <Link href="/admin/pendaftar" className="text-sm font-semibold text-blue-600 hover:text-blue-800">
            Lihat Semua
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
                <th className="p-4 font-semibold">No. Registrasi</th>
                <th className="p-4 font-semibold">Nama Mahasiswa</th>
                <th className="p-4 font-semibold">Email</th>
                <th className="p-4 font-semibold">Jenjang</th>
                <th className="p-4 font-semibold">Tanggal Daftar</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {recentApplicants.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-slate-400">
                    Belum ada pendaftar terbaru.
                  </td>
                </tr>
              ) : (
                recentApplicants.map((applicant: any, idx: number) => (
                  <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="p-4 text-slate-600 font-mono text-xs">{applicant.registrationNo}</td>
                    <td className="p-4 font-medium text-slate-900">{applicant.namaLengkap}</td>
                    <td className="p-4 text-slate-600 text-xs">{applicant.email}</td>
                    <td className="p-4 text-slate-700 font-bold">{applicant.jenjangTarget}</td>
                    <td className="p-4 text-slate-600 text-xs">
                      {applicant.submittedAt ? new Date(applicant.submittedAt).toLocaleDateString('id-ID') : '-'}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        applicant.status === 'DITERIMA' ? 'bg-emerald-100 text-emerald-700' :
                        applicant.status === 'DITOLAK' ? 'bg-rose-100 text-rose-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {applicant.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <Link href="/admin/seleksi" className="text-blue-600 hover:text-blue-800 font-semibold text-xs bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors inline-block">
                        Verifikasi
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
