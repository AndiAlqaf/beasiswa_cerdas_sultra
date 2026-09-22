'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, Eye, Edit, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { fetchAPI } from '@/lib/api';

export default function PendaftarPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [jenjangFilter, setJenjangFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [applicants, setApplicants] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '10');
      if (searchTerm.trim()) params.set('search', searchTerm.trim());
      if (jenjangFilter) params.set('jenjang', jenjangFilter);
      if (statusFilter) params.set('status', statusFilter);

      const res = await fetchAPI(`/admin/applicants?${params.toString()}`);
      if (res.success && res.data) {
        setApplicants(res.data.applicants || []);
        setPagination(res.data.pagination || null);
      }
    } catch (err: any) {
      setError(err.message || 'Gagal memuat data pendaftar.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page, jenjangFilter, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadData();
  };

  const handleExport = () => {
    const headers = ['No. Registrasi', 'Nama', 'Email', 'NIK', 'Jenjang', 'Status', 'Tanggal'];
    const csvContent = [
      headers.join(','),
      ...applicants.map((u: any) => `"${u.registrationNo}","${u.namaLengkap}","${u.email}","${u.nik}","${u.jenjangTarget}","${u.status}","${u.submittedAt}"`)
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `data_pendaftar_${jenjangFilter || 'semua'}_${statusFilter || 'semua'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Data Pendaftar</h2>
          <p className="text-slate-500">Kelola dan pantau seluruh data pendaftar beasiswa.</p>
        </div>
        <button onClick={handleExport} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors shadow-sm">
          <Download className="w-4 h-4" />
          Export Data ({applicants.length})
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Table Controls */}
        <div className="p-4 sm:p-6 border-b border-slate-200 flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nama, No. Registrasi, atau Universitas..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
            />
          </div>
          <div className="flex gap-2 flex-wrap sm:flex-nowrap">
            <select 
              value={jenjangFilter}
              onChange={(e) => setJenjangFilter(e.target.value)}
              className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Semua Jenjang</option>
              <option value="S1/D4">S1 / D4</option>
              <option value="S2">S2</option>
              <option value="S3">S3</option>
            </select>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Semua Status</option>
              <option value="Lolos">Lolos</option>
              <option value="Menunggu">Menunggu</option>
              <option value="Ditolak">Ditolak</option>
            </select>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 text-blue-700 rounded-xl text-sm font-semibold hover:bg-blue-100 transition-colors">
              <Filter className="w-4 h-4" />
              Terapkan
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
                <th className="p-4 font-semibold whitespace-nowrap">No. Registrasi</th>
                <th className="p-4 font-semibold whitespace-nowrap">Nama & Prodi</th>
                <th className="p-4 font-semibold whitespace-nowrap">Universitas</th>
                <th className="p-4 font-semibold whitespace-nowrap">Jenjang</th>
                <th className="p-4 font-semibold whitespace-nowrap">IPK</th>
                <th className="p-4 font-semibold whitespace-nowrap">Tanggal</th>
                <th className="p-4 font-semibold whitespace-nowrap">Status</th>
                <th className="p-4 font-semibold text-center whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-900 mb-2" />
                    Memuat data pendaftar...
                  </td>
                </tr>
              ) : applicants.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    Tidak ada pendaftar yang sesuai dengan kriteria filter.
                  </td>
                </tr>
              ) : (
                applicants.map((user, idx) => (
                  <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="p-4 text-slate-600 font-mono text-xs">{user.registrationNo}</td>
                    <td className="p-4">
                      <p className="font-bold text-slate-900">{user.namaLengkap}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{user.email}</p>
                    </td>
                    <td className="p-4 text-slate-600">NIK: {user.nik}</td>
                    <td className="p-4">
                      <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md text-xs font-bold border border-slate-200 whitespace-nowrap">{user.jenjangTarget}</span>
                    </td>
                    <td className="p-4 text-slate-900 font-semibold">-</td>
                    <td className="p-4 text-slate-500 text-xs">
                      {user.submittedAt ? new Date(user.submittedAt).toLocaleDateString('id-ID') : '-'}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        user.status === 'DITERIMA' ? 'bg-emerald-100 text-emerald-700' :
                        user.status === 'DITOLAK' ? 'bg-rose-100 text-rose-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors" title="Lihat Detail">
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-600">
          <p>Total {pagination?.totalItems || applicants.length} pendaftar (Halaman {pagination?.currentPage || 1} dari {pagination?.totalPages || 1})</p>
          <div className="flex gap-1">
            <button
              disabled={page <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="px-3 py-1 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50"
            >
              Sebelumnya
            </button>
            <button
              disabled={page >= (pagination?.totalPages || 1)}
              onClick={() => setPage(p => p + 1)}
              className="px-3 py-1 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50"
            >
              Selanjutnya
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
