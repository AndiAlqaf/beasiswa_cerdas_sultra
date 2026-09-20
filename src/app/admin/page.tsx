import React from 'react';
import { Users, FileCheck, Clock, CheckCircle } from 'lucide-react';

export default function AdminDashboardPage() {
  const stats = [
    { label: 'Total Pendaftar', value: '1,245', icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Menunggu Verifikasi', value: '452', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100' },
    { label: 'Berkas Lolos', value: '780', icon: FileCheck, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { label: 'Diterima Beasiswa', value: '0', icon: CheckCircle, color: 'text-purple-600', bg: 'bg-purple-100' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-[#0B3A6A] to-[#134983] rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="relative z-10">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">Selamat Datang, Admin! 👋</h2>
          <p className="text-blue-100 max-w-2xl">
            Pantau dan kelola pendaftaran Beasiswa Sultra Cerdas 2026. Anda memiliki 452 berkas pendaftar baru yang menunggu untuk diverifikasi.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4">
            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} shrink-0`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">{stat.label}</p>
              <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Registrations Table (Dummy) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">Pendaftar Terbaru</h3>
          <button className="text-sm font-semibold text-blue-600 hover:text-blue-800">
            Lihat Semua
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
                <th className="p-4 font-semibold">Nama Mahasiswa</th>
                <th className="p-4 font-semibold">Universitas</th>
                <th className="p-4 font-semibold">Tanggal Daftar</th>
                <th className="p-4 font-semibold">Status Berkas</th>
                <th className="p-4 font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {[
                { name: 'Ahmad Dani', univ: 'Universitas Halu Oleo', date: '20 Sep 2026', status: 'Menunggu', statusColor: 'bg-amber-100 text-amber-700' },
                { name: 'Siti Aminah', univ: 'Universitas Muhammadiyah', date: '19 Sep 2026', status: 'Lolos', statusColor: 'bg-emerald-100 text-emerald-700' },
                { name: 'Budi Santoso', univ: 'IAIN Kendari', date: '19 Sep 2026', status: 'Ditolak', statusColor: 'bg-rose-100 text-rose-700' },
                { name: 'Rina Marlina', univ: 'Universitas Halu Oleo', date: '18 Sep 2026', status: 'Lolos', statusColor: 'bg-emerald-100 text-emerald-700' },
              ].map((user, idx) => (
                <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-medium text-slate-900">{user.name}</td>
                  <td className="p-4 text-slate-600">{user.univ}</td>
                  <td className="p-4 text-slate-600">{user.date}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${user.statusColor}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <button className="text-blue-600 hover:text-blue-800 font-semibold text-xs bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors">
                      Verifikasi
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
