import React from 'react';
import { Search, Filter, Download, MoreVertical, Eye, Edit, Trash2 } from 'lucide-react';

export default function PendaftarPage() {
  const dummyData = [
    { id: 'REG-2026-001', name: 'Ahmad Dani', univ: 'Universitas Halu Oleo', prodi: 'Pendidikan Matematika', jenjang: 'S1/D4', ipk: '3.85', status: 'Menunggu', date: '20 Sep 2026' },
    { id: 'REG-2026-002', name: 'Siti Aminah', univ: 'Universitas Muhammadiyah Kendari', prodi: 'Manajemen', jenjang: 'S1/D4', ipk: '3.90', status: 'Lolos', date: '19 Sep 2026' },
    { id: 'REG-2026-003', name: 'Budi Santoso', univ: 'IAIN Kendari', prodi: 'Ekonomi Syariah', jenjang: 'S2', ipk: '3.75', status: 'Ditolak', date: '19 Sep 2026' },
    { id: 'REG-2026-004', name: 'Rina Marlina', univ: 'Universitas Halu Oleo', prodi: 'Ilmu Hukum', jenjang: 'S1/D4', ipk: '3.88', status: 'Lolos', date: '18 Sep 2026' },
    { id: 'REG-2026-005', name: 'Andi Saputra', univ: 'Universitas Sulawesi Tenggara', prodi: 'Teknik Sipil', jenjang: 'S1/D4', ipk: '3.65', status: 'Menunggu', date: '18 Sep 2026' },
    { id: 'REG-2026-006', name: 'Nurul Hidayah', univ: 'Universitas Halu Oleo', prodi: 'Pendidikan Bahasa Inggris', jenjang: 'S2', ipk: '3.92', status: 'Menunggu', date: '17 Sep 2026' },
    { id: 'REG-2026-007', name: 'Kaharuddin', univ: 'USN Kolaka', prodi: 'Agribisnis', jenjang: 'S1/D4', ipk: '3.70', status: 'Ditolak', date: '17 Sep 2026' },
    { id: 'REG-2026-008', name: 'Dewi Lestari', univ: 'Universitas Halu Oleo', prodi: 'Kedokteran', jenjang: 'S3', ipk: '3.95', status: 'Lolos', date: '16 Sep 2026' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Data Pendaftar</h2>
          <p className="text-slate-500">Kelola dan pantau seluruh data pendaftar beasiswa.</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors shadow-sm">
          <Download className="w-4 h-4" />
          Export Data
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Table Controls */}
        <div className="p-4 sm:p-6 border-b border-slate-200 flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari nama, No. Registrasi, atau Universitas..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
            />
          </div>
          <div className="flex gap-2 flex-wrap sm:flex-nowrap">
            <select className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Semua Jenjang</option>
              <option value="S1">S1 / D4</option>
              <option value="S2">S2</option>
              <option value="S3">S3</option>
            </select>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors">
              <Filter className="w-4 h-4" />
              Filter
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
              {dummyData.map((user, idx) => (
                <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="p-4 text-slate-600 font-mono text-xs">{user.id}</td>
                  <td className="p-4">
                    <p className="font-bold text-slate-900">{user.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{user.prodi}</p>
                  </td>
                  <td className="p-4 text-slate-600">{user.univ}</td>
                  <td className="p-4">
                    <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md text-xs font-bold border border-slate-200 whitespace-nowrap">{user.jenjang}</span>
                  </td>
                  <td className="p-4 text-slate-900 font-semibold">{user.ipk}</td>
                  <td className="p-4 text-slate-500 text-xs">{user.date}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      user.status === 'Lolos' ? 'bg-emerald-100 text-emerald-700' :
                      user.status === 'Ditolak' ? 'bg-rose-100 text-rose-700' :
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
                      <button className="p-1.5 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors" title="Edit Data">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors" title="Hapus">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-600">
          <p>Menampilkan 1 hingga 8 dari 1,245 entri</p>
          <div className="flex gap-1">
            <button className="px-3 py-1 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50">Sebelumnya</button>
            <button className="px-3 py-1 bg-blue-600 text-white rounded-lg">1</button>
            <button className="px-3 py-1 border border-slate-200 rounded-lg hover:bg-slate-50">2</button>
            <button className="px-3 py-1 border border-slate-200 rounded-lg hover:bg-slate-50">3</button>
            <span className="px-2 py-1">...</span>
            <button className="px-3 py-1 border border-slate-200 rounded-lg hover:bg-slate-50">Selanjutnya</button>
          </div>
        </div>
      </div>
    </div>
  );
}
