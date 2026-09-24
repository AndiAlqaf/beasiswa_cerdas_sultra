'use client';

import React, { useEffect, useState } from 'react';
import { Settings, Users, Bell, Shield, Save, Calendar, FileText, CheckCircle2 } from 'lucide-react';
import { getStoredScheduleConfig, saveScheduleConfig, ScheduleConfig } from '@/lib/schedule';

export default function PengaturanPage() {
  const [activeTab, setActiveTab] = useState('umum');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [generalConfig, setGeneralConfig] = useState({
    programName: 'Beasiswa Sultra Cerdas 2026',
    academicYear: '2026/2027',
    status: 'Dibuka',
  });

  const [scheduleConfig, setScheduleConfig] = useState<ScheduleConfig>({
    openDate: '2026-09-13',
    closeDate: '2026-09-30',
    selectionStart: '2026-10-01',
    selectionEnd: '2026-10-15',
    announcementDate: '2026-10-16',
    announcementEnd: '2026-10-17',
    sanggahStart: '2026-10-19',
    sanggahEnd: '2026-10-21',
    pengumumanSanggahDate: '2026-10-22',
    penetapanDate: '2026-10-30',
    kontrakDate: '2026-11-02',
    penyaluranDate: '2026-11-04'
  });

  useEffect(() => {
    setScheduleConfig(getStoredScheduleConfig());
  }, []);

  const [reqConfig, setReqConfig] = useState({
    minIpkS1: '3.25',
    minIpkS2: '3.50',
    minIpkS3: '3.50',
    allowDoubleFunding: false,
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveScheduleConfig(scheduleConfig);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 4000);
  };

  const tabs = [
    { id: 'umum', label: 'Pengaturan Umum', icon: Settings },
    { id: 'jadwal', label: 'Jadwal Pendaftaran', icon: Calendar },
    { id: 'persyaratan', label: 'Standar Persyaratan', icon: FileText },
    { id: 'admin', label: 'Hak Akses & Keamanan', icon: Shield },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Pengaturan Portal</h2>
          <p className="text-slate-500 text-sm">Konfigurasi parameter program, periode jadwal seleksi, dan standar kelulusan.</p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-200 px-4 py-2 rounded-xl text-xs font-bold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Pengaturan berhasil disimpan!
          </div>
        )}
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[550px]">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 bg-slate-50 border-r border-slate-200 p-4 shrink-0">
          <nav className="flex flex-col gap-1.5">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all text-left ${
                    isActive 
                      ? 'bg-blue-900 text-white shadow-sm' 
                      : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 sm:p-10">
          {activeTab === 'umum' && (
            <form onSubmit={handleSave} className="space-y-6 max-w-2xl animate-in fade-in duration-200">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900">Pengaturan Umum</h3>
                <p className="text-xs text-slate-500">Atur parameter dasar identitas program beasiswa Pemprov Sultra.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Nama Program</label>
                  <input
                    type="text"
                    value={generalConfig.programName}
                    onChange={(e) => setGeneralConfig({ ...generalConfig, programName: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-normal text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-900"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Tahun Anggaran & Akademik</label>
                  <input
                    type="text"
                    value={generalConfig.academicYear}
                    onChange={(e) => setGeneralConfig({ ...generalConfig, academicYear: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-normal text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-900"
                  />
                </div>

                <div className="space-y-2 pt-2">
                  <label className="text-xs font-bold text-slate-700 block">Status Pendaftaran Portal</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                      <input
                        type="radio"
                        name="status"
                        checked={generalConfig.status === 'Dibuka'}
                        onChange={() => setGeneralConfig({ ...generalConfig, status: 'Dibuka' })}
                        className="w-4 h-4 text-blue-900 focus:ring-blue-900"
                      />
                      <span>Dibuka (Pendaftaran Aktif)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                      <input
                        type="radio"
                        name="status"
                        checked={generalConfig.status === 'Ditutup'}
                        onChange={() => setGeneralConfig({ ...generalConfig, status: 'Ditutup' })}
                        className="w-4 h-4 text-blue-900 focus:ring-blue-900"
                      />
                      <span>Ditutup (Maintenance / Selesai)</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button type="submit" className="flex items-center gap-2 bg-blue-900 hover:bg-blue-950 text-white px-6 py-2.5 rounded-xl font-bold text-xs transition-colors shadow-sm">
                  <Save className="w-4 h-4" />
                  Simpan Perubahan
                </button>
              </div>
            </form>
          )}

          {activeTab === 'jadwal' && (
            <form onSubmit={handleSave} className="space-y-6 max-w-2xl animate-in fade-in duration-200">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900">Jadwal Pelaksanaan Seleksi</h3>
                <p className="text-xs text-slate-500">Tentukan periode pembukaan, masa verifikasi berkas, dan pengumuman.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Tanggal Mulai Pendaftaran</label>
                  <input
                    type="date"
                    value={scheduleConfig.openDate}
                    onChange={(e) => setScheduleConfig({ ...scheduleConfig, openDate: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-normal text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-900"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Batas Akhir Pendaftaran</label>
                  <input
                    type="date"
                    value={scheduleConfig.closeDate}
                    onChange={(e) => setScheduleConfig({ ...scheduleConfig, closeDate: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-normal text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-900"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Masa Verifikasi &amp; Seleksi (Mulai)</label>
                  <input
                    type="date"
                    value={scheduleConfig.selectionStart}
                    onChange={(e) => setScheduleConfig({ ...scheduleConfig, selectionStart: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-normal text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-900"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Pengumuman Kelulusan (Mulai)</label>
                  <input
                    type="date"
                    value={scheduleConfig.announcementDate}
                    onChange={(e) => setScheduleConfig({ ...scheduleConfig, announcementDate: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-normal text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-900"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Masa Sanggah (Mulai)</label>
                  <input
                    type="date"
                    value={scheduleConfig.sanggahStart || '2026-10-19'}
                    onChange={(e) => setScheduleConfig({ ...scheduleConfig, sanggahStart: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-normal text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-900"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Masa Sanggah (Selesai)</label>
                  <input
                    type="date"
                    value={scheduleConfig.sanggahEnd || '2026-10-21'}
                    onChange={(e) => setScheduleConfig({ ...scheduleConfig, sanggahEnd: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-normal text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-900"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button type="submit" className="flex items-center gap-2 bg-blue-900 hover:bg-blue-950 text-white px-6 py-2.5 rounded-xl font-bold text-xs transition-colors shadow-sm">
                  <Save className="w-4 h-4" />
                  Simpan Jadwal
                </button>
              </div>
            </form>
          )}

          {activeTab === 'persyaratan' && (
            <form onSubmit={handleSave} className="space-y-6 max-w-2xl animate-in fade-in duration-200">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900">Standar Persyaratan Akademik</h3>
                <p className="text-xs text-slate-500">Konfigurasi batas minimal nilai IPK dan syarat administrasi bagi pendaftar.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Min IPK S1 / D4</label>
                  <input
                    type="text"
                    value={reqConfig.minIpkS1}
                    onChange={(e) => setReqConfig({ ...reqConfig, minIpkS1: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-normal text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-900"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Min IPK S2 (Magister)</label>
                  <input
                    type="text"
                    value={reqConfig.minIpkS2}
                    onChange={(e) => setReqConfig({ ...reqConfig, minIpkS2: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-normal text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-900"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Min IPK S3 (Doktor)</label>
                  <input
                    type="text"
                    value={reqConfig.minIpkS3}
                    onChange={(e) => setReqConfig({ ...reqConfig, minIpkS3: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-normal text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-900"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button type="submit" className="flex items-center gap-2 bg-blue-900 hover:bg-blue-950 text-white px-6 py-2.5 rounded-xl font-bold text-xs transition-colors shadow-sm">
                  <Save className="w-4 h-4" />
                  Simpan Persyaratan
                </button>
              </div>
            </form>
          )}

          {activeTab === 'admin' && (
            <div className="space-y-6 max-w-2xl animate-in fade-in duration-200">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900">Hak Akses & Keamanan Sistem</h3>
                <p className="text-xs text-slate-500">Konfigurasi keamanan 5-Layer Defense dan akun administrator portal.</p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 block">Rate Limiting Protection</span>
                    <span className="text-slate-500">Membatasi frekuensi request untuk mencegah brute force dan DDoS.</span>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-md">Aktif</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 block">Magic Bytes File Validation</span>
                    <span className="text-slate-500">Validasi struktur header biner file PDF, JPG, PNG pada unggahan berkas.</span>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-md">Aktif</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 block">JWT Token HS512 & Audit Logging</span>
                    <span className="text-slate-500">Audit trail pencatatan IP address dan aktivitas verifikasi administrator.</span>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-md">Aktif</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
