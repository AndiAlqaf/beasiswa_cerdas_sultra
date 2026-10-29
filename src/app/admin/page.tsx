'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { Users, FileCheck, Clock, CheckCircle, XCircle, Loader2, AlertCircle, Search, X } from 'lucide-react';
import { fetchAPI } from '@/lib/api';

type FilterCategory = 'RECENT' | 'ALL' | 'MENUNGGU' | 'BERKAS_LOLOS' | 'DITOLAK' | 'DITERIMA';

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [allApplicants, setAllApplicants] = useState<any[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('RECENT');
  const [berkasLolosSubFilter, setBerkasLolosSubFilter] = useState<'ALL_LOLOS' | 'ONLY_VERIFIED'>('ALL_LOLOS');
  const [searchTerm, setSearchTerm] = useState('');

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

  // Load full applicant list so clicking any stat card displays all matching applicants in the dashboard table
  const ensureAllApplicantsLoaded = async () => {
    if (allApplicants.length > 0 || loadingList) return;
    setLoadingList(true);
    try {
      const res = await fetchAPI('/admin/applicants/export');
      if (res.success && res.data?.applicants) {
        setAllApplicants(res.data.applicants);
        setLoadingList(false);
        return;
      }
    } catch {
      // fallback to paginated fetch if /export fails
    }

    try {
      let collected: any[] = [];
      let curPage = 1;
      let totalPages = 1;
      do {
        const res = await fetchAPI(`/admin/applicants?page=${curPage}&limit=100`);
        if (res.success && res.data?.applicants) {
          collected = collected.concat(res.data.applicants);
          totalPages = res.data.pagination?.totalPages || 1;
        } else {
          break;
        }
        curPage++;
      } while (curPage <= totalPages);
      if (collected.length > 0) {
        setAllApplicants(collected);
      }
    } catch (e) {
      console.warn('Gagal memuat daftar lengkap pendaftar di dashboard:', e);
    } finally {
      setLoadingList(false);
    }
  };

  const handleSelectFilter = (filterKey: FilterCategory) => {
    if (activeFilter === filterKey) {
      setActiveFilter('RECENT');
      return;
    }
    setActiveFilter(filterKey);
    setBerkasLolosSubFilter('ALL_LOLOS');
    if (filterKey !== 'RECENT') {
      ensureAllApplicantsLoaded();
    }
  };

  const stats = data?.stats || {};
  const recentApplicants = data?.recentApplicants || [];

  const statItems: {
    key: FilterCategory;
    label: string;
    value: number;
    icon: any;
    color: string;
    bg: string;
    activeBorder: string;
    activeRing: string;
    badgeBg: string;
  }[] = [
    {
      key: 'ALL',
      label: 'Total Pendaftar',
      value: stats.totalPendaftar || 0,
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
      activeBorder: 'border-blue-500',
      activeRing: 'ring-2 ring-blue-500/20 bg-blue-50/30',
      badgeBg: 'bg-blue-100 text-blue-700',
    },
    {
      key: 'MENUNGGU',
      label: 'Menunggu Verifikasi',
      value: stats.menungguVerifikasi || 0,
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-100',
      activeBorder: 'border-amber-500',
      activeRing: 'ring-2 ring-amber-500/20 bg-amber-50/30',
      badgeBg: 'bg-amber-100 text-amber-800',
    },
    {
      key: 'BERKAS_LOLOS',
      label: 'Berkas Lolos',
      value: stats.berkasLolos || 0,
      icon: FileCheck,
      color: 'text-emerald-600',
      bg: 'bg-emerald-100',
      activeBorder: 'border-emerald-500',
      activeRing: 'ring-2 ring-emerald-500/20 bg-emerald-50/30',
      badgeBg: 'bg-emerald-100 text-emerald-800',
    },
    {
      key: 'DITOLAK',
      label: 'Berkas Ditolak',
      value: stats.ditolak || 0,
      icon: XCircle,
      color: 'text-rose-600',
      bg: 'bg-rose-100',
      activeBorder: 'border-rose-500',
      activeRing: 'ring-2 ring-rose-500/20 bg-rose-50/30',
      badgeBg: 'bg-rose-100 text-rose-800',
    },
    {
      key: 'DITERIMA',
      label: 'Diterima Beasiswa',
      value: stats.diterima || 0,
      icon: CheckCircle,
      color: 'text-purple-600',
      bg: 'bg-purple-100',
      activeBorder: 'border-purple-500',
      activeRing: 'ring-2 ring-purple-500/20 bg-purple-50/30',
      badgeBg: 'bg-purple-100 text-purple-800',
    },
  ];

  const displayedApplicants = useMemo(() => {
    const sourceList = activeFilter === 'RECENT' ? recentApplicants : (allApplicants.length > 0 ? allApplicants : recentApplicants);

    let filtered = sourceList.filter((a: any) => {
      if (activeFilter === 'RECENT' || activeFilter === 'ALL') return true;
      if (activeFilter === 'MENUNGGU') return a.status === 'TERKIRIM';
      if (activeFilter === 'BERKAS_LOLOS') {
        if (berkasLolosSubFilter === 'ONLY_VERIFIED') {
          return ['VERIFIKASI_BERKAS', 'SELEKSI_ADMINISTRASI', 'LOLOS_VERIFIKASI'].includes(a.status);
        }
        return ['VERIFIKASI_BERKAS', 'SELEKSI_ADMINISTRASI', 'LOLOS_VERIFIKASI', 'DITERIMA', 'PENCAIRAN_TERMIN_1', 'PENCAIRAN_TERMIN_2'].includes(a.status);
      }
      if (activeFilter === 'DITOLAK') return a.status === 'DITOLAK';
      if (activeFilter === 'DITERIMA') return ['DITERIMA', 'PENCAIRAN_TERMIN_1', 'PENCAIRAN_TERMIN_2'].includes(a.status);
      return true;
    });

    // When viewing Berkas Lolos, sort LOLOS_VERIFIKASI first so applicants awaiting final acceptance are easy to see
    if (activeFilter === 'BERKAS_LOLOS') {
      filtered = [...filtered].sort((a, b) => {
        const aPriority = a.status === 'LOLOS_VERIFIKASI' ? 0 : 1;
        const bPriority = b.status === 'LOLOS_VERIFIKASI' ? 0 : 1;
        return aPriority - bPriority;
      });
    }

    if (searchTerm.trim()) {
      const q = searchTerm.trim().toLowerCase();
      filtered = filtered.filter((a: any) =>
        (a.namaLengkap || '').toLowerCase().includes(q) ||
        (a.registrationNo || '').toLowerCase().includes(q) ||
        (a.email || '').toLowerCase().includes(q) ||
        (a.jenjangTarget || '').toLowerCase().includes(q)
      );
    }

    return filtered;
  }, [activeFilter, berkasLolosSubFilter, allApplicants, recentApplicants, searchTerm]);

  const tableTitle = useMemo(() => {
    switch (activeFilter) {
      case 'ALL':
        return 'Daftar Seluruh Pendaftar';
      case 'MENUNGGU':
        return 'Daftar Pendaftar Menunggu Verifikasi';
      case 'BERKAS_LOLOS':
        return 'Daftar Mahasiswa Berkas Lolos';
      case 'DITOLAK':
        return 'Daftar Mahasiswa Berkas Ditolak';
      case 'DITERIMA':
        return 'Daftar Mahasiswa Diterima Beasiswa';
      default:
        return 'Pendaftar Terbaru';
    }
  }, [activeFilter]);

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

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-[#0B3A6A] rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">Selamat Datang, Admin! 👋</h2>
          <p className="text-blue-100 max-w-2xl">
            Pantau dan kelola pendaftaran Beasiswa Sultra Cerdas 2026. Terdapat <strong className="text-white">{stats.menungguVerifikasi || 0} berkas</strong> pendaftar yang menunggu untuk diverifikasi.
          </p>
        </div>
      </div>

      {/* Stats Grid (Clickable) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statItems.map((stat) => {
          const isActive = activeFilter === stat.key;
          return (
            <button
              key={stat.key}
              type="button"
              onClick={() => handleSelectFilter(stat.key)}
              className={`text-left bg-white p-5 rounded-2xl border shadow-sm flex items-start gap-3.5 transition-all cursor-pointer hover:shadow-md hover:-translate-y-0.5 ${
                isActive ? `${stat.activeBorder} ${stat.activeRing}` : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} shrink-0`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-slate-500 mb-1 truncate">{stat.label}</p>
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="text-2xl font-bold text-slate-900">{stat.value.toLocaleString('id-ID')}</h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${
                    isActive ? stat.badgeBg : 'text-slate-400 bg-slate-100'
                  }`}>
                    {isActive ? 'Aktif' : 'Lihat'}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Registrations Table on Dashboard */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h3 className="text-lg font-bold text-slate-900">{tableTitle}</h3>
              <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                {displayedApplicants.length} Mahasiswa
              </span>
              {activeFilter !== 'RECENT' && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveFilter('RECENT');
                    setSearchTerm('');
                  }}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" /> Reset ke Pendaftar Terbaru
                </button>
              )}
            </div>

            {activeFilter === 'BERKAS_LOLOS' && (
              <div className="flex items-center gap-2 pt-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => setBerkasLolosSubFilter('ALL_LOLOS')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    berkasLolosSubFilter === 'ALL_LOLOS'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Semua Berkas Lolos ({stats.berkasLolos || 0})
                </button>
                <button
                  type="button"
                  onClick={() => setBerkasLolosSubFilter('ONLY_VERIFIED')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    berkasLolosSubFilter === 'ONLY_VERIFIED'
                      ? 'bg-teal-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Menunggu Keputusan Terima ({Math.max(0, (stats.berkasLolos || 0) - (stats.diterima || 0))})
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {activeFilter !== 'RECENT' && (
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Cari nama / No. Reg..."
                  className="pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-48 sm:w-56"
                />
              </div>
            )}
            <Link href="/admin/pendaftar" className="text-sm font-semibold text-blue-600 hover:text-blue-800 whitespace-nowrap">
              Lihat Semua
            </Link>
          </div>
        </div>
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10">
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
              {loadingList && activeFilter !== 'RECENT' ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-900 mb-2" />
                    Memuat daftar mahasiswa...
                  </td>
                </tr>
              ) : displayedApplicants.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-slate-400">
                    Tidak ada data pendaftar pada kategori ini.
                  </td>
                </tr>
              ) : (
                displayedApplicants.map((applicant: any, idx: number) => (
                  <tr key={applicant.registrationNo || idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
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
                        applicant.status === 'LOLOS_VERIFIKASI' ? 'bg-teal-100 text-teal-700' :
                        applicant.status === 'DITOLAK' ? 'bg-rose-100 text-rose-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {applicant.status === 'LOLOS_VERIFIKASI'
                          ? 'Lolos Verifikasi'
                          : applicant.status === 'DITERIMA'
                          ? 'Diterima'
                          : applicant.status === 'DITOLAK'
                          ? 'Ditolak'
                          : applicant.status === 'TERKIRIM'
                          ? 'Terkirim'
                          : applicant.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <Link
                        href={`/admin/seleksi?search=${encodeURIComponent(applicant.registrationNo || applicant.namaLengkap || '')}`}
                        className="text-blue-600 hover:text-blue-800 font-semibold text-xs bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors inline-block"
                      >
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
