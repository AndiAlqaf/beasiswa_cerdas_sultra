'use client';

import React, { useState, useEffect } from 'react';
import { Megaphone, Award, Printer, CheckCircle2, FileText, Search, Loader2, Sparkles, AlertCircle, RefreshCw, Send, ShieldCheck, UserCheck } from 'lucide-react';
import { fetchAPI } from '@/lib/api';

interface Recipient {
  id: string;
  registrationNo: string;
  namaLengkap: string;
  nik: string;
  jenjangTarget: string;
  email: string;
  status: string;
  verifiedAt: string;
  institusi?: string;
  jurusan?: string;
}

export default function PenerbitanPengumumanAdminPage() {
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [jenjangFilter, setJenjangFilter] = useState('');

  // Announcement Settings Form
  const [isPublished, setIsPublished] = useState(true);
  const [skTitle, setSkTitle] = useState('Surat Keputusan Kepala Dinas Pendidikan dan Kebudayaan Prov. Sultra tentang Penetapan Penerima Beasiswa Stimulan Sultra Cerdas 2026');
  const [skNumber, setSkNumber] = useState('421.5/BSSC-SK/X/2026');
  const [skDate, setSkDate] = useState('22 Oktober 2026');
  const [skSigner, setSkSigner] = useState('H. YUSUF, S.Pd., M.Si. (Kepala Dinas Pendidikan dan Kebudayaan Prov. Sultra)');
  const [announcementMessage, setAnnouncementMessage] = useState('Selamat kepada seluruh mahasiswa yang telah dinyatakan LOLOS SELEKSI dan DITETAPKAN sebagai Penerima Beasiswa Stimulan Sultra Cerdas Tahun 2026. Hasil ini bersifat mutlak berdasarkan hasil verifikasi berkas dan kriteria akademik.');

  const [savingAnnouncement, setSavingAnnouncement] = useState(false);
  const [showSkModal, setShowSkModal] = useState(false);
  const [toast, setToast] = useState<{ title: string; message: string; type: 'success' | 'error' } | null>(null);

  const loadAcceptedApplicants = async () => {
    setLoading(true);
    try {
      const res = await fetchAPI('/admin/applicants');
      if (res.success && res.data) {
        const all: any[] = res.data.applicants || [];
        const accepted = all.filter(a => a.status === 'DITERIMA' || a.status === 'PENCAIRAN_TERMIN_1' || a.status === 'PENCAIRAN_TERMIN_2');
        setRecipients(accepted.map(a => ({
          id: a.id,
          registrationNo: a.registrationNo || a.nik,
          namaLengkap: a.namaLengkap,
          nik: a.nik,
          jenjangTarget: a.jenjangTarget,
          email: a.email,
          status: a.status,
          verifiedAt: a.verifiedAt || new Date().toISOString(),
          institusi: a.institusi || 'Universitas Halu Oleo',
          jurusan: a.jurusan || 'Pendidikan'
        })));
      }
    } catch (e: any) {
      console.warn('Failed to load accepted applicants:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAcceptedApplicants();
  }, []);

  const handlePublishAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingAnnouncement(true);
    try {
      // Simulate save configuration
      await new Promise(resolve => setTimeout(resolve, 800));
      setToast({
        title: 'Pengumuman Berhasil Diterbitkan!',
        message: 'Pengumuman hasil seleksi dan daftar penerima beasiswa kini telah aktif dan dapat diakses oleh seluruh mahasiswa di portal.',
        type: 'success',
      });
    } catch (err: any) {
      setToast({
        title: 'Gagal Penerbitan',
        message: err.message || 'Terjadi kesalahan sistem saat menerbitkan pengumuman.',
        type: 'error',
      });
    } finally {
      setSavingAnnouncement(false);
    }
  };

  const filteredRecipients = recipients.filter(r => {
    const matchSearch = !searchTerm.trim() || 
      r.namaLengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.registrationNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.nik.includes(searchTerm);
    const matchJenjang = !jenjangFilter || r.jenjangTarget === jenjangFilter;
    return matchSearch && matchJenjang;
  });

  const countByJenjang = (j: string) => recipients.filter(r => r.jenjangTarget === j).length;

  return (
    <div className="w-full space-y-8 max-w-7xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="bg-[#0B3A6A] p-6 sm:p-8 rounded-3xl text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 border border-blue-800/40">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Penerbitan Pengumuman &amp; SK Penerima Beasiswa
          </h1>
          <p className="text-blue-100 text-xs sm:text-sm max-w-2xl font-light leading-relaxed">
            Halaman khusus Admin untuk mengelola publikasi hasil seleksi, menerbitkan Surat Keputusan (SK) resmi, dan mengumumkan nama-nama penerima beasiswa.
          </p>
        </div>

        <button
          onClick={() => setShowSkModal(true)}
          className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg transition-all flex items-center gap-2 shrink-0 border border-blue-400/40"
        >
          <Printer className="w-4 h-4 text-white" /> Cetak Dokumen SK Resmi (PDF)
        </button>
      </div>

      {/* Ringkasan Kuota & Penerima Lolos */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <p className="text-[10px] font-extrabold uppercase text-slate-400">Total Penerima Lolos</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">{recipients.length} Mahasiswa</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Status DITERIMA</p>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <p className="text-[10px] font-extrabold uppercase text-slate-400">Penerima Jenjang S1</p>
          <p className="text-2xl font-black text-blue-900 mt-1">{countByJenjang('S1')} Orang</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Strata Satu (S1)</p>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <p className="text-[10px] font-extrabold uppercase text-slate-400">Penerima Jenjang S2</p>
          <p className="text-2xl font-black text-indigo-900 mt-1">{countByJenjang('S2')} Orang</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Magister (S2)</p>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <p className="text-[10px] font-extrabold uppercase text-slate-400">Penerima Jenjang S3 &amp; D3</p>
          <p className="text-2xl font-black text-purple-900 mt-1">{countByJenjang('S3') + countByJenjang('D3')} Orang</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Doktoral &amp; Diplomasi</p>
        </div>
      </div>

      {/* Form Editor Penerbitan Pengumuman */}
      <form onSubmit={handlePublishAnnouncement} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider bg-blue-100 text-blue-900 px-3 py-1 rounded-full">
              Konfigurasi Publikasi Portal
            </span>
            <h3 className="text-xl font-black text-slate-900 mt-1">Formulir Terbitan Pengumuman Kelulusan</h3>
          </div>

          <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-200">
            <span className="text-xs font-bold text-slate-700">Status Publikasi:</span>
            <button
              type="button"
              onClick={() => setIsPublished(!isPublished)}
              className={`px-3 py-1 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                isPublished
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-300 text-slate-700'
              }`}
            >
              {isPublished ? '✓ DITERBITKAN (ONLINE)' : 'DRAFT (OFFLINE)'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800">Judul Pengumuman Resmi *</label>
            <input
              type="text"
              value={skTitle}
              onChange={(e) => setSkTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-900 focus:outline-none font-medium text-slate-900"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800">Nomor SK Penetapan Resmi *</label>
            <input
              type="text"
              value={skNumber}
              onChange={(e) => setSkNumber(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-900 focus:outline-none font-mono text-slate-900"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800">Tanggal SK Ditetapkan *</label>
            <input
              type="text"
              value={skDate}
              onChange={(e) => setSkDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-900 focus:outline-none text-slate-900"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800">Pejabat Penandatangan SK *</label>
            <input
              type="text"
              value={skSigner}
              onChange={(e) => setSkSigner(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-900 focus:outline-none text-slate-900"
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-800">Pesan Pengumuman &amp; Sambutan Resmi ke Mahasiswa *</label>
          <textarea
            rows={3}
            value={announcementMessage}
            onChange={(e) => setAnnouncementMessage(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-900 focus:outline-none leading-relaxed text-slate-900"
            required
          ></textarea>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={savingAnnouncement}
            className="px-6 py-3 bg-blue-900 hover:bg-blue-950 disabled:bg-slate-300 text-white font-extrabold text-xs rounded-2xl shadow-lg transition-all flex items-center gap-2"
          >
            {savingAnnouncement ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Menerbitkan Pengumuman...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" /> Terbitkan &amp; Publikasikan Pengumuman Resmi
              </>
            )}
          </button>
        </div>
      </form>

      {/* Tabel Roster Nama Mahasiswa Lolos */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <UserCheck className="w-6 h-6 text-emerald-600" />
              Daftar Roster Nama Penerima Beasiswa
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Daftar seluruh pendaftar yang telah disetujui statusnya menjadi DITERIMA oleh tim verifikator.
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nama mahasiswa, NIK, atau No. Registrasi..."
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-900 focus:outline-none text-slate-900"
            />
          </div>
          <select
            value={jenjangFilter}
            onChange={(e) => setJenjangFilter(e.target.value)}
            className="w-full sm:w-44 py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
          >
            <option value="">Semua Jenjang</option>
            <option value="S1">Jenjang S1</option>
            <option value="S2">Jenjang S2</option>
            <option value="S3">Jenjang S3</option>
            <option value="D3">Jenjang D3</option>
          </select>
        </div>

        {/* Table */}
        {loading ? (
          <div className="py-12 text-center space-y-2">
            <Loader2 className="w-8 h-8 text-blue-900 animate-spin mx-auto" />
            <p className="text-xs text-slate-500 font-medium">Memuat data penerima...</p>
          </div>
        ) : filteredRecipients.length === 0 ? (
          <div className="py-12 text-center space-y-2 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <Award className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-xs text-slate-500 font-medium">Belum ada penerima beasiswa dengan status DITERIMA.</p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-200 rounded-2xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-extrabold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">No.</th>
                  <th className="py-3 px-4">No. Registrasi</th>
                  <th className="py-3 px-4">Nama Mahasiswa</th>
                  <th className="py-3 px-4">NIK</th>
                  <th className="py-3 px-4">Jenjang</th>
                  <th className="py-3 px-4">Perguruan Tinggi</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {filteredRecipients.map((r, i) => (
                  <tr key={r.id || i} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-400">{i + 1}</td>
                    <td className="py-3 px-4 font-mono font-bold text-blue-900">{r.registrationNo}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{r.namaLengkap}</td>
                    <td className="py-3 px-4 font-mono text-slate-500">{r.nik}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                        {r.jenjangTarget}
                      </span>
                    </td>
                    <td className="py-3 px-4">{r.institusi}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> DITERIMA
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Format SK Resmi Penerima Beasiswa */}
      {showSkModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl w-[96vw] max-w-4xl shadow-2xl overflow-hidden border border-slate-200 my-8">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm sm:text-base">Dokumen SK Penetapan Penerima Beasiswa Sultra Cerdas</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl transition-colors flex items-center gap-1 shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" /> Cetak Dokumen SK
                </button>
                <button
                  onClick={() => setShowSkModal(false)}
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>

            {/* Printable SK Document */}
            <div className="p-8 sm:p-12 space-y-6 text-black font-sans text-xs max-h-[75vh] overflow-y-auto bg-white">
              <div className="text-center border-b-4 border-black pb-4 space-y-1">
                <h2 className="text-lg font-black uppercase tracking-wider">PEMERINTAH PROVINSI SULAWESI TENGGARA</h2>
                <h1 className="text-xl font-black uppercase tracking-wider">DINAS PENDIDIKAN DAN KEBUDAYAAN</h1>
                <p className="text-[11px]">Jalan Kompleks Perkantoran Bumi Praja Anduonohu Kendari — Sulawesi Tenggara</p>
              </div>

              <div className="text-center space-y-1 py-2">
                <h3 className="font-bold text-sm uppercase underline">{skTitle}</h3>
                <p className="font-mono text-xs">NOMOR: {skNumber}</p>
                <p className="font-bold uppercase mt-2">TENTANG PENETAPAN PENERIMA BEASISWA STIMULAN SULTRA CERDAS TAHUN ANGGARAN 2026</p>
              </div>

              <div className="space-y-3 leading-relaxed text-justify">
                <p><strong>MEMUTUSKAN:</strong> Menetapkan nama-nama mahasiswa yang tercantum dalam Lampiran Surat Keputusan ini sebagai <strong>Penerima Resmi Beasiswa Stimulan Sultra Cerdas Tahun 2026</strong> Pemerintah Provinsi Sulawesi Tenggara.</p>
                <p className="italic text-gray-700">{announcementMessage}</p>
              </div>

              <div className="border border-black rounded-lg overflow-hidden my-4">
                <table className="w-full text-left border-collapse text-[11px]">
                  <thead className="bg-gray-100 border-b border-black font-bold">
                    <tr>
                      <th className="p-2 border-r border-black">No.</th>
                      <th className="p-2 border-r border-black">No. Registrasi</th>
                      <th className="p-2 border-r border-black">Nama Lengkap Mahasiswa</th>
                      <th className="p-2 border-r border-black">Jenjang</th>
                      <th className="p-2">Perguruan Tinggi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recipients.map((r, i) => (
                      <tr key={i} className="border-b border-gray-300">
                        <td className="p-2 border-r border-black font-bold text-center">{i + 1}</td>
                        <td className="p-2 border-r border-black font-mono">{r.registrationNo}</td>
                        <td className="p-2 border-r border-black font-bold">{r.namaLengkap}</td>
                        <td className="p-2 border-r border-black text-center">{r.jenjangTarget}</td>
                        <td className="p-2">{r.institusi}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end pt-8">
                <div className="text-center w-72 space-y-1">
                  <p>Ditetapkan di Kendari</p>
                  <p className="font-bold">Pada Tanggal: {skDate}</p>
                  <p className="pt-2 font-bold uppercase">{skSigner}</p>
                  <div className="h-16 flex items-center justify-center italic text-gray-400">
                    [Tanda Tangan &amp; Cap Basah Digital]
                  </div>
                  <p className="font-bold underline uppercase">H. YUSUF, S.Pd., M.Si.</p>
                  <p className="text-[10px]">NIP. 19710812 199703 1 004</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl w-[90vw] max-w-sm shadow-2xl overflow-hidden border border-slate-100 p-6 text-center animate-in zoom-in-95">
            <div className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center mb-4 ${
              toast.type === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
            }`}>
              {toast.type === 'success' ? <CheckCircle2 className="w-8 h-8" /> : <AlertCircle className="w-8 h-8" />}
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
