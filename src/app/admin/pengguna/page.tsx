'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, UserCheck, Users, AlertCircle, CheckCircle2, X, Loader2, Calendar, Mail, FileText, ArrowUpDown } from 'lucide-react';
import { fetchAPI } from '@/lib/api';

export default function AdminPenggunaPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [jenjangFilter, setJenjangFilter] = useState('');
  const [hasAppliedFilter, setHasAppliedFilter] = useState('');
  const [page, setPage] = useState(1);
  const [users, setUsers] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '15');
      if (searchTerm.trim()) params.set('search', searchTerm.trim());
      if (jenjangFilter) params.set('jenjang', jenjangFilter);
      if (hasAppliedFilter) params.set('has_applied', hasAppliedFilter);

      const res = await fetchAPI(`/admin/users?${params.toString()}`);
      if (res.success && res.data) {
        setUsers(res.data.users || []);
        setPagination(res.data.pagination || null);
      }
    } catch (err: any) {
      setError(err.message || 'Gagal memuat data pengguna akun.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page, jenjangFilter, hasAppliedFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadData();
  };

  const handleResetSearch = () => {
    setSearchTerm('');
    setJenjangFilter('');
    setHasAppliedFilter('');
    setPage(1);
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Nama Lengkap', 'NIK', 'Email', 'Role', 'Jenjang Target', 'Status Pengajuan', 'No. Registrasi', 'Tanggal Daftar'];
    const rows = users.map((u: any) => [
      `"${u.id || ''}"`,
      `"${(u.namaLengkap || '').replace(/"/g, '""')}"`,
      `"${u.nik || ''}"`,
      `"${u.email || ''}"`,
      `"${u.role || ''}"`,
      `"${u.jenjangTarget || ''}"`,
      `"${u.application ? u.application.status : 'Belum Mengajukan'}"`,
      `"${u.application ? u.application.registrationNo : '-'}"`,
      `"${u.createdAt ? new Date(u.createdAt).toLocaleDateString('id-ID') : ''}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `daftar_akun_pengguna_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-[#0B3A6A]" />
            Daftar Akun Pengguna Terdaftar
          </h2>
          <p className="text-slate-500 text-sm mt-0.5">
            Cek dan pantau seluruh pendaftar/mahasiswa yang telah membuat akun di sistem Beasiswa Cerdas Sultra.
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          disabled={users.length === 0}
          className="flex items-center gap-2 bg-[#0B3A6A] hover:bg-[#082a4d] disabled:opacity-50 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm"
        >
          <Download className="w-4 h-4" />
          Ekspor CSV ({pagination?.total || users.length})
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-rose-400 hover:text-rose-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama lengkap, NIK 16 digit, atau email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B3A6A] focus:bg-white text-slate-900 transition-all"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setPage(1);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Jenjang Filter */}
          <div className="w-full md:w-44">
            <select
              value={jenjangFilter}
              onChange={(e) => {
                setJenjangFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B3A6A] text-slate-700 cursor-pointer"
            >
              <option value="">Semua Jenjang</option>
              <option value="S1">Jenjang S1 / D4</option>
              <option value="S2">Jenjang S2</option>
              <option value="S3">Jenjang S3</option>
            </select>
          </div>

          {/* Has Applied Filter */}
          <div className="w-full md:w-56">
            <select
              value={hasAppliedFilter}
              onChange={(e) => {
                setHasAppliedFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B3A6A] text-slate-700 cursor-pointer"
            >
              <option value="">Semua Status Pengajuan</option>
              <option value="yes">Sudah Mengajukan Beasiswa</option>
              <option value="no">Belum Mengajukan (Hanya Akun)</option>
            </select>
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 bg-[#0B3A6A] hover:bg-[#082a4d] text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Search className="w-4 h-4" /> Cari
          </button>
        </form>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
          <span>
            Ditemukan <strong>{pagination?.total ?? users.length}</strong> akun pengguna terdaftar
          </span>
          {(searchTerm || jenjangFilter || hasAppliedFilter) && (
            <button
              onClick={handleResetSearch}
              className="text-[#0B3A6A] hover:underline font-bold"
            >
              Reset Filter Pencarian
            </button>
          )}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-[#0B3A6A] animate-spin" />
            <p className="text-sm text-slate-500 font-medium">Memuat data pengguna...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <Users className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="font-bold text-slate-800">Tidak Ada Pengguna Ditemukan</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchTerm 
                ? `Tidak ditemukan akun yang cocok dengan kata kunci "${searchTerm}". Silakan periksa kembali ejaan nama atau NIK.`
                : 'Belum ada akun pengguna yang terdaftar di dalam sistem.'}
            </p>
            {searchTerm && (
              <button
                onClick={handleResetSearch}
                className="mt-2 text-xs font-bold text-[#0B3A6A] hover:underline inline-block"
              >
                Hapus Kata Kunci Pencarian
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4 sm:px-6">Nama & NIK</th>
                  <th className="py-3.5 px-4 sm:px-6">Email Terdaftar</th>
                  <th className="py-3.5 px-4 sm:px-6">Jenjang Target</th>
                  <th className="py-3.5 px-4 sm:px-6">Peran (Role)</th>
                  <th className="py-3.5 px-4 sm:px-6">Status Lamaran Beasiswa</th>
                  <th className="py-3.5 px-4 sm:px-6">Tanggal Akun Dibuat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4 sm:px-6">
                      <div className="font-bold text-slate-900 leading-snug">{u.namaLengkap}</div>
                      <div className="font-mono text-xs text-blue-900 font-medium tracking-wide mt-0.5">
                        NIK: {u.nik || '-'}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-slate-700">
                      <span className="text-xs">{u.email}</span>
                    </td>
                    <td className="py-3.5 px-4 sm:px-6">
                      <span className="px-2.5 py-1 bg-blue-50 text-blue-800 font-bold rounded-lg text-xs">
                        {u.jenjangTarget || '-'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 sm:px-6">
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold uppercase ${u.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-700'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 sm:px-6">
                      {u.application ? (
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-semibold">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            {u.application.status}
                          </span>
                          <div className="text-[11px] font-mono text-slate-500">
                            No. {u.application.registrationNo}
                          </div>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full text-xs font-medium">
                          Belum Mengajukan
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-xs text-slate-500">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>
              Halaman {pagination.page} dari {pagination.totalPages} (Total {pagination.total} akun)
            </span>
            <div className="flex gap-1.5">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 font-semibold"
              >
                Sebelumnya
              </button>
              <button
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 font-semibold"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
