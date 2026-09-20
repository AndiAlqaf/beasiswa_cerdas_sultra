'use client';

import React, { useState } from 'react';
import { Settings, Users, Bell, Shield, Save, Calendar, FileText } from 'lucide-react';

export default function PengaturanPage() {
  const [activeTab, setActiveTab] = useState('umum');

  const tabs = [
    { id: 'umum', label: 'Pengaturan Umum', icon: Settings },
    { id: 'jadwal', label: 'Jadwal Pendaftaran', icon: Calendar },
    { id: 'persyaratan', label: 'Persyaratan', icon: FileText },
    { id: 'admin', label: 'Kelola Admin', icon: Shield },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Pengaturan Sistem</h2>
        <p className="text-slate-500">Konfigurasi portal beasiswa, jadwal, dan preferensi sistem.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 bg-slate-50 border-r border-slate-200 p-4 shrink-0">
          <nav className="flex flex-col gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors text-left ${
                    isActive 
                      ? 'bg-blue-100 text-blue-900' 
                      : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 sm:p-8">
          {activeTab === 'umum' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900">Pengaturan Umum</h3>
                <p className="text-sm text-slate-500">Atur informasi dasar tentang program beasiswa tahun ini.</p>
              </div>

              <div className="space-y-5 max-w-2xl">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-900 block">Nama Program</label>
                  <input type="text" defaultValue="Beasiswa Sultra Cerdas 2026" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-900 block">Tahun Akademik</label>
                  <input type="text" defaultValue="2026/2027" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-900 block">Status Pendaftaran</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="status" defaultChecked className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                      <span className="text-sm font-medium text-slate-700">Dibuka</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="status" className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                      <span className="text-sm font-medium text-slate-700">Ditutup</span>
                    </label>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold transition-colors shadow-sm">
                    <Save className="w-4 h-4" />
                    Simpan Perubahan
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'jadwal' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900">Jadwal Pendaftaran</h3>
                <p className="text-sm text-slate-500">Tentukan periode pembukaan dan penutupan beasiswa.</p>
              </div>

              <div className="space-y-5 max-w-2xl">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-900 block">Tanggal Buka</label>
                    <input type="date" defaultValue="2026-09-01" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-900 block">Tanggal Tutup</label>
                    <input type="date" defaultValue="2026-10-31" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-900 block">Mulai Seleksi</label>
                    <input type="date" defaultValue="2026-11-01" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-900 block">Pengumuman Hasil</label>
                    <input type="date" defaultValue="2026-11-15" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold transition-colors shadow-sm">
                    <Save className="w-4 h-4" />
                    Simpan Jadwal
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab !== 'umum' && activeTab !== 'jadwal' && (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4 animate-in fade-in">
              <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center">
                <Settings className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Modul Belum Tersedia</h3>
                <p className="text-slate-500 max-w-md mx-auto mt-2">Halaman pengaturan ini masih dalam tahap pengembangan (dummy).</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
