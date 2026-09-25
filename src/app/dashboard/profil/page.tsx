'use client';

import React, { useEffect, useState, useRef } from 'react';
import { 
  User, Mail, CreditCard, MapPin, Calendar, GraduationCap, Phone, 
  Save, Loader2, AlertCircle, CheckCircle2, FileText, Home, BookOpen, 
  Users, Award, PenTool, RotateCcw, Eraser, Sparkles
} from 'lucide-react';
import { getUser, fetchAPI } from '@/lib/api';
import { SULTRA_DISTRICTS } from '@/data/bsscData';
import { parseAchievementString, formatAchievementItems, DynamicAchievementItem } from '@/lib/achievementHelpers';
import DynamicAchievementBlock from '@/components/DynamicAchievementBlock';

export default function ProfilPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ title: string; message: string; type: 'success' | 'error' } | null>(null);

  // Form State
  const [form, setForm] = useState({
    namaLengkap: '',
    nik: '',
    noKk: '',
    tempatLahir: '',
    tanggalLahir: '',
    gender: 'Laki-laki',
    statusPernikahan: 'Belum Menikah',

    email: '',
    noHp: '',
    asalDaerah: 'KOTA_KENDARI',
    alamatKtp: '',
    alamatDomisili: '',

    jenjangTarget: 'S1',
    perguruanTinggi: '',
    fakultasProdi: '',
    nim: '',
    semester: 3,
    ipk: '3.50',
    akreditasiProdi: 'Baik Sekali',
    targetLulus: '2027',
    beasiswaLain: 'Tidak Ada',

    smaNama: '',
    smaJurusan: '',
    smaTahunLulus: '',
    s1Nama: '',
    s1Jurusan: '',
    s1TahunLulus: '',

    namaAyah: '',
    pekerjaanAyah: '',
    namaIbu: '',
    pekerjaanIbu: '',
    penghasilanOrtu: '< Rp 1.500.000',
    jumlahTanggungan: '3',
    kepemilikanBantuan: 'Tidak Ada',

    signatureData: '',
  });

  // 5 Category Dynamic Rows State
  const [prestasiAkademikList, setPrestasiAkademikList] = useState<DynamicAchievementItem[]>([]);
  const [prestasiNonAkademikList, setPrestasiNonAkademikList] = useState<DynamicAchievementItem[]>([]);
  const [pengalamanOrganisasiList, setPengalamanOrganisasiList] = useState<DynamicAchievementItem[]>([]);
  const [pengalamanPengabdianList, setPengalamanPengabdianList] = useState<DynamicAchievementItem[]>([]);
  const [pelatihanSertifikasiList, setPelatihanSertifikasiList] = useState<DynamicAchievementItem[]>([]);

  // Tanda Tangan Canvas State
  const [showSignatureCanvas, setShowSignatureCanvas] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const loadProfile = async () => {
    try {
      const cachedUser = getUser();
      const profileRes = await fetchAPI('/applicant/profile');

      if (profileRes?.success && profileRes?.data) {
        const u = profileRes.data.user || cachedUser || {};
        const p = profileRes.data.profile || {};
        const edu = profileRes.data.education || [];

        const smaEdu = edu.find((e: any) => e.tingkat === 'SMA' || e.tingkat === 'SMK') || {};
        const s1Edu = edu.find((e: any) => e.tingkat === 'S1') || {};

        setForm({
          namaLengkap: u.namaLengkap || u.nama_lengkap || '',
          nik: u.nik || '',
          noKk: p.noKk || p.no_kk || '',
          tempatLahir: p.tempatLahir || p.tempat_lahir || '',
          tanggalLahir: p.tanggalLahir ? p.tanggalLahir.split('T')[0] : (p.tanggal_lahir ? p.tanggal_lahir.split('T')[0] : ''),
          gender: p.gender || 'Laki-laki',
          statusPernikahan: p.statusPernikahan || p.status_pernikahan || 'Belum Menikah',

          email: u.email || '',
          noHp: p.noHp || p.no_hp || '',
          asalDaerah: p.asalDaerah || p.asal_daerah || 'KOTA_KENDARI',
          alamatKtp: p.alamatKtp || p.alamat_ktp || '',
          alamatDomisili: p.alamatDomisili || p.alamat_domisili || '',

          jenjangTarget: u.jenjangTarget || u.jenjang_target || 'S1',
          perguruanTinggi: s1Edu.institusi || p.perguruanTinggi || p.institusi || '',
          fakultasProdi: s1Edu.jurusan || p.fakultasProdi || p.jurusan || '',
          nim: p.nim || '',
          semester: p.semester || 3,
          ipk: p.ipk ? String(p.ipk) : '3.50',
          akreditasiProdi: p.akreditasiProdi || p.akreditasi_prodi || 'Baik Sekali',
          targetLulus: p.targetLulus ? String(p.targetLulus) : '2027',
          beasiswaLain: p.beasiswaLain || p.beasiswa_lain || 'Tidak Ada',

          smaNama: smaEdu.institusi || '',
          smaJurusan: smaEdu.jurusan || '',
          smaTahunLulus: smaEdu.tahun_lulus ? String(smaEdu.tahun_lulus) : (smaEdu.tahunLulus ? String(smaEdu.tahunLulus) : ''),
          s1Nama: s1Edu.institusi || '',
          s1Jurusan: s1Edu.jurusan || '',
          s1TahunLulus: s1Edu.tahun_lulus ? String(s1Edu.tahun_lulus) : (s1Edu.tahunLulus ? String(s1Edu.tahunLulus) : ''),

          namaAyah: p.namaAyah || p.nama_ayah || '',
          pekerjaanAyah: p.pekerjaanAyah || p.pekerjaan_ayah || '',
          namaIbu: p.namaIbu || p.nama_ibu || '',
          pekerjaanIbu: p.pekerjaanIbu || p.pekerjaan_ibu || '',
          penghasilanOrtu: p.penghasilanOrtu || p.penghasilan_ortu || '< Rp 1.500.000',
          jumlahTanggungan: p.jumlahTanggungan ? String(p.jumlahTanggungan) : '3',
          kepemilikanBantuan: p.kepemilikanBantuan || p.kepemilikan_bantuan || 'Tidak Ada',

          signatureData: p.signatureData || p.signature_data || '',
        });

        setPrestasiAkademikList(parseAchievementString(p.prestasiAkademik || p.prestasi_akademik));
        setPrestasiNonAkademikList(parseAchievementString(p.prestasiNonAkademik || p.prestasi_non_akademik));
        setPengalamanOrganisasiList(parseAchievementString(p.pengalamanOrganisasi || p.pengalaman_organisasi));
        setPengalamanPengabdianList(parseAchievementString(p.pengalamanPengabdian || p.pengalaman_pengabdian));
        setPelatihanSertifikasiList(parseAchievementString(p.pelatihanSertifikasi || p.pelatihan_sertifikasi));
      }
    } catch (err) {
      console.warn('Profile load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        prestasiAkademik: formatAchievementItems(prestasiAkademikList),
        prestasiNonAkademik: formatAchievementItems(prestasiNonAkademikList),
        pengalamanOrganisasi: formatAchievementItems(pengalamanOrganisasiList),
        pengalamanPengabdian: formatAchievementItems(pengalamanPengabdianList),
        pelatihanSertifikasi: formatAchievementItems(pelatihanSertifikasiList),
      };

      const profileRes = await fetchAPI('/applicant/profile', {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      const eduList = [];
      if (form.smaNama) {
        eduList.push({
          tingkat: 'SMA',
          institusi: form.smaNama,
          jurusan: form.smaJurusan,
          tahunLulus: parseInt(form.smaTahunLulus) || null,
        });
      }
      if ((form.jenjangTarget === 'S2' || form.jenjangTarget === 'S3') && (form.s1Nama)) {
        eduList.push({
          tingkat: 'S1',
          institusi: form.s1Nama,
          jurusan: form.s1Jurusan,
          tahunLulus: parseInt(form.s1TahunLulus) || null,
        });
      }

      if (eduList.length > 0) {
        await fetchAPI('/applicant/education', {
          method: 'PUT',
          body: JSON.stringify({ educationList: eduList }),
        }).catch(() => null);
      }

      if (profileRes.success) {
        setToast({
          title: 'Profil Berhasil Disimpan!',
          message: 'Seluruh data profil dan prestasi Anda telah diperbarui dan diselaraskan secara otomatis.',
          type: 'success',
        });
        await loadProfile();
      } else {
        throw new Error(profileRes.message || 'Gagal menyimpan data');
      }
    } catch (err: any) {
      setToast({
        title: 'Gagal Menyimpan Profil',
        message: err.message || 'Terjadi kesalahan saat menyimpan data.',
        type: 'error',
      });
    } finally {
      setSaving(false);
    }
  };


  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-500 space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#0B3A6A]" />
        <p className="text-sm font-medium">Memuat data profil lengkap Anda...</p>
      </div>
    );
  }

  const userInitials = form.namaLengkap
    ? form.namaLengkap.split(' ').map((n) => n[0]).filter(Boolean).join('').substring(0, 2).toUpperCase()
    : 'U';

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      {/* Toast Popup */}
      {toast && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl w-[90vw] max-w-sm shadow-2xl p-6 text-center border border-slate-100">
            <div className={`w-12 h-12 rounded-2xl mx-auto flex items-center justify-center mb-3 ${
              toast.type === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
            }`}>
              {toast.type === 'success' ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">{toast.title}</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-6">{toast.message}</p>
            <button
              onClick={() => setToast(null)}
              className="w-full py-2.5 px-4 font-bold text-xs text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-sm"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Header Profile Title */}
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Profil &amp; Biodata Lengkap</h1>
        <p className="text-slate-500 text-xs sm:text-sm mt-1 font-normal">
          Seluruh data diri, kontak, alamat KTP, akademik, dan riwayat keluarga yang tersimpan di portal beasiswa.
        </p>
      </div>

      {/* Profile Identity Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-28 bg-[#0B3A6A]"></div>

        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-end gap-6 mt-8">
          <div className="w-28 h-28 bg-white rounded-full p-2 shadow-md shrink-0">
            <div className="w-full h-full bg-blue-100 rounded-full flex items-center justify-center text-3xl font-extrabold text-blue-900 border-4 border-slate-50">
              {userInitials}
            </div>
          </div>
          <div className="text-center sm:text-left flex-1 pb-1 space-y-1">
            <h2 className="text-2xl font-bold text-slate-900">{form.namaLengkap || 'Nama Belum Diisi'}</h2>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-600 font-normal">
              <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-slate-400" /> {form.email}</span>
              <span className="flex items-center gap-1.5"><CreditCard className="w-3.5 h-3.5 text-slate-400" /> NIK: {form.nik || '-'}</span>
              <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-slate-400" /> WA: {form.noHp || '-'}</span>
            </div>
          </div>
          <div className="pb-1">
            <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-50 border border-blue-100 text-blue-900 font-bold text-xs uppercase tracking-wider">
              <GraduationCap className="w-4 h-4" />
              Jenjang {form.jenjangTarget}
            </span>
          </div>
        </div>
      </div>

      {/* Main Full Page Form */}
      <form onSubmit={handleSaveProfile} className="space-y-8">

        {/* SECTION 1: IDENTITAS & BIODATA PRIBADI */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="p-2.5 bg-blue-50 text-[#0B3A6A] rounded-2xl">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base sm:text-lg">1. Identitas &amp; Biodata Diri</h3>
              <p className="text-xs text-slate-500 font-normal">Informasi resmi sesuai Kartu Tanda Penduduk (KTP) &amp; Kartu Keluarga (KK).</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Nama Lengkap (Sesuai KTP) *</label>
              <input
                type="text"
                required
                value={form.namaLengkap}
                onChange={(e) => setForm((prev) => ({ ...prev, namaLengkap: e.target.value }))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-normal text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#0B3A6A] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Nomor Induk Kependudukan (NIK) *</label>
              <input
                type="text"
                required
                maxLength={16}
                value={form.nik}
                onChange={(e) => setForm((prev) => ({ ...prev, nik: e.target.value.replace(/\D/g, '') }))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-normal text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#0B3A6A] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Nomor Kartu Keluarga (KK) *</label>
              <input
                type="text"
                required
                maxLength={16}
                placeholder="16 digit Nomor KK"
                value={form.noKk}
                onChange={(e) => setForm((prev) => ({ ...prev, noKk: e.target.value.replace(/\D/g, '') }))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-normal text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#0B3A6A] focus:outline-none placeholder:font-normal placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Tempat Lahir *</label>
              <input
                type="text"
                required
                placeholder="Contoh: Kendari"
                value={form.tempatLahir}
                onChange={(e) => setForm((prev) => ({ ...prev, tempatLahir: e.target.value }))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-normal text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#0B3A6A] focus:outline-none placeholder:font-normal placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Tanggal Lahir *</label>
              <input
                type="date"
                required
                value={form.tanggalLahir}
                onChange={(e) => setForm((prev) => ({ ...prev, tanggalLahir: e.target.value }))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-normal text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#0B3A6A] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Jenis Kelamin *</label>
              <select
                value={form.gender}
                onChange={(e) => setForm((prev) => ({ ...prev, gender: e.target.value }))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-normal text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#0B3A6A] focus:outline-none"
              >
                <option value="Laki-laki">Laki-laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Status Pernikahan *</label>
              <select
                value={form.statusPernikahan}
                onChange={(e) => setForm((prev) => ({ ...prev, statusPernikahan: e.target.value }))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-normal text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#0B3A6A] focus:outline-none"
              >
                <option value="Belum Menikah">Belum Menikah</option>
                <option value="Menikah">Menikah</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 2: KONTAK & ALAMAT DOMISILI */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-2xl">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base sm:text-lg">2. Kontak &amp; Alamat Lengkap</h3>
              <p className="text-xs text-slate-500 font-normal">Informasi domisili dan alamat persis sesuai dokumen resmi.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Nomor WhatsApp / Handphone *</label>
              <input
                type="text"
                required
                placeholder="Contoh: +62 882020802944"
                value={form.noHp}
                onChange={(e) => setForm((prev) => ({ ...prev, noHp: e.target.value }))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-normal text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#0B3A6A] focus:outline-none placeholder:font-normal placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Kabupaten / Kota Asal Domisili Sultra *</label>
              <select
                value={form.asalDaerah}
                onChange={(e) => setForm((prev) => ({ ...prev, asalDaerah: e.target.value }))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-normal text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#0B3A6A] focus:outline-none"
              >
                {SULTRA_DISTRICTS.map((d) => (
                  <option key={d.code} value={d.code}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Alamat Sesuai KTP *</label>
              <textarea
                rows={3}
                required
                placeholder="Tuliskan alamat lengkap persis seperti yang tertera pada KTP (Jalan, RT/RW, Kelurahan, Kecamatan)..."
                value={form.alamatKtp}
                onChange={(e) => setForm((prev) => ({ ...prev, alamatKtp: e.target.value }))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-normal text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#0B3A6A] focus:outline-none placeholder:font-normal placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Alamat Domisili Lengkap Saat Ini *</label>
              <textarea
                rows={3}
                required
                placeholder="Tuliskan alamat tempat tinggal domisili/kos/kontrakan tempat tinggal saat ini..."
                value={form.alamatDomisili}
                onChange={(e) => setForm((prev) => ({ ...prev, alamatDomisili: e.target.value }))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-normal text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#0B3A6A] focus:outline-none placeholder:font-normal placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: DATA AKADEMIK ONGOING */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="p-2.5 bg-purple-50 text-purple-600 rounded-2xl">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base sm:text-lg">3. Data Akademik Status Berjalan</h3>
              <p className="text-xs text-slate-500 font-normal">Informasi perguruan tinggi, prodi, NIM, semester, dan IPK kumulatif saat ini.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Jenjang Pendidikan Beasiswa *</label>
              <select
                value={form.jenjangTarget}
                onChange={(e) => setForm((prev) => ({ ...prev, jenjangTarget: e.target.value }))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-blue-900 focus:bg-white focus:ring-2 focus:ring-[#0B3A6A] focus:outline-none"
              >
                <option value="S1">Jenjang S1 / D4</option>
                <option value="S2">Jenjang S2 (Magister)</option>
                <option value="S3">Jenjang S3 (Doktor)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Nama Perguruan Tinggi / Universitas *</label>
              <input
                type="text"
                required
                placeholder="Contoh: Universitas Halu Oleo"
                value={form.perguruanTinggi}
                onChange={(e) => setForm((prev) => ({ ...prev, perguruanTinggi: e.target.value }))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-normal text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#0B3A6A] focus:outline-none placeholder:font-normal placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Fakultas / Program Studi *</label>
              <input
                type="text"
                required
                placeholder="Contoh: FKIP / Pendidikan Matematika"
                value={form.fakultasProdi}
                onChange={(e) => setForm((prev) => ({ ...prev, fakultasProdi: e.target.value }))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-normal text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#0B3A6A] focus:outline-none placeholder:font-normal placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Nomor Induk Mahasiswa (NIM) *</label>
              <input
                type="text"
                required
                placeholder="Contoh: A1I122045"
                value={form.nim}
                onChange={(e) => setForm((prev) => ({ ...prev, nim: e.target.value }))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-normal text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#0B3A6A] focus:outline-none placeholder:font-normal placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Semester Saat Ini *</label>
              <select
                value={form.semester}
                onChange={(e) => setForm((prev) => ({ ...prev, semester: parseInt(e.target.value) }))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-normal text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#0B3A6A] focus:outline-none"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>Semester {s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">IPK Kumulatif Transkrip Nilai *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="4.00"
                required
                placeholder="Contoh: 3.50"
                value={form.ipk}
                onChange={(e) => setForm((prev) => ({ ...prev, ipk: e.target.value }))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-normal text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#0B3A6A] focus:outline-none placeholder:font-normal placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Akreditasi Program Studi *</label>
              <select
                value={form.akreditasiProdi}
                onChange={(e) => setForm((prev) => ({ ...prev, akreditasiProdi: e.target.value }))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-normal text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#0B3A6A] focus:outline-none"
              >
                <option value="Unggul">Unggul / A</option>
                <option value="Baik Sekali">Baik Sekali / B</option>
                <option value="Baik">Baik / C</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Estimasi Tahun Lulus *</label>
              <input
                type="text"
                placeholder="Contoh: 2027"
                value={form.targetLulus}
                onChange={(e) => setForm((prev) => ({ ...prev, targetLulus: e.target.value }))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-normal text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#0B3A6A] focus:outline-none placeholder:font-normal placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Penerima Beasiswa Penuh Lain *</label>
              <select
                value={form.beasiswaLain}
                onChange={(e) => setForm((prev) => ({ ...prev, beasiswaLain: e.target.value }))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-normal text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#0B3A6A] focus:outline-none"
              >
                <option value="Tidak Ada">Tidak Ada (Bukan Double Funding)</option>
                <option value="Ada">Ya, Sedang Menerima Beasiswa Penuh</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 4: RIWAYAT PENDIDIKAN SEBELUMNYA */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-2xl">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base sm:text-lg">4. Riwayat Pendidikan Sebelumnya</h3>
              <p className="text-xs text-slate-500 font-normal">Informasi sekolah atau perguruan tinggi jenjang sebelumnya.</p>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">Pendidikan Menengah (SMA / SMK / MA)</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-normal text-slate-600 mb-1">Nama Sekolah SMA/SMK</label>
                <input
                  type="text"
                  placeholder="Contoh: SMAN 1 Kendari"
                  value={form.smaNama}
                  onChange={(e) => setForm((prev) => ({ ...prev, smaNama: e.target.value }))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-normal text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#0B3A6A] focus:outline-none placeholder:font-normal placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-normal text-slate-600 mb-1">Jurusan / MIPA / IPS</label>
                <input
                  type="text"
                  placeholder="Contoh: MIPA"
                  value={form.smaJurusan}
                  onChange={(e) => setForm((prev) => ({ ...prev, smaJurusan: e.target.value }))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-normal text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#0B3A6A] focus:outline-none placeholder:font-normal placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-normal text-slate-600 mb-1">Tahun Lulus SMA</label>
                <input
                  type="text"
                  placeholder="Contoh: 2023"
                  value={form.smaTahunLulus}
                  onChange={(e) => setForm((prev) => ({ ...prev, smaTahunLulus: e.target.value }))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-normal text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#0B3A6A] focus:outline-none placeholder:font-normal placeholder:text-slate-400"
                />
              </div>
            </div>

            {(form.jenjangTarget === 'S2' || form.jenjangTarget === 'S3') && (
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">Pendidikan Jenjang S1 (Sarjana)</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-normal text-slate-600 mb-1">Perguruan Tinggi S1</label>
                    <input
                      type="text"
                      placeholder="Nama Kampus S1"
                      value={form.s1Nama}
                      onChange={(e) => setForm((prev) => ({ ...prev, s1Nama: e.target.value }))}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-normal text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#0B3A6A] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-normal text-slate-600 mb-1">Program Studi S1</label>
                    <input
                      type="text"
                      placeholder="Jurusan S1"
                      value={form.s1Jurusan}
                      onChange={(e) => setForm((prev) => ({ ...prev, s1Jurusan: e.target.value }))}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-normal text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#0B3A6A] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-normal text-slate-600 mb-1">Tahun Lulus S1</label>
                    <input
                      type="text"
                      placeholder="Tahun Lulus S1"
                      value={form.s1TahunLulus}
                      onChange={(e) => setForm((prev) => ({ ...prev, s1TahunLulus: e.target.value }))}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-normal text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#0B3A6A] focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SECTION 5: DATA KELUARGA & EKONOMI */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="p-2.5 bg-rose-50 text-rose-600 rounded-2xl">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base sm:text-lg">5. Data Keluarga &amp; Ekonomi</h3>
              <p className="text-xs text-slate-500 font-normal">Informasi orang tua, penghasilan keluarga, dan kepemilikan program bantuan.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Nama Ayah *</label>
              <input
                type="text"
                placeholder="Nama Lengkap Ayah"
                value={form.namaAyah}
                onChange={(e) => setForm((prev) => ({ ...prev, namaAyah: e.target.value }))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-normal text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#0B3A6A] focus:outline-none placeholder:font-normal placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Pekerjaan Ayah *</label>
              <input
                type="text"
                placeholder="Contoh: Petani / PNS / Wiraswasta"
                value={form.pekerjaanAyah}
                onChange={(e) => setForm((prev) => ({ ...prev, pekerjaanAyah: e.target.value }))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-normal text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#0B3A6A] focus:outline-none placeholder:font-normal placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Nama Ibu *</label>
              <input
                type="text"
                placeholder="Nama Lengkap Ibu"
                value={form.namaIbu}
                onChange={(e) => setForm((prev) => ({ ...prev, namaIbu: e.target.value }))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-normal text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#0B3A6A] focus:outline-none placeholder:font-normal placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Pekerjaan Ibu *</label>
              <input
                type="text"
                placeholder="Contoh: Ibu Rumah Tangga / Pedagang"
                value={form.pekerjaanIbu}
                onChange={(e) => setForm((prev) => ({ ...prev, pekerjaanIbu: e.target.value }))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-normal text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#0B3A6A] focus:outline-none placeholder:font-normal placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Rata-rata Penghasilan Orang Tua *</label>
              <select
                value={form.penghasilanOrtu}
                onChange={(e) => setForm((prev) => ({ ...prev, penghasilanOrtu: e.target.value }))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-normal text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#0B3A6A] focus:outline-none"
              >
                <option value="< Rp 1.500.000">&lt; Rp 1.500.000 / bulan</option>
                <option value="Rp 1.500.000 - Rp 3.000.000">Rp 1.500.000 – Rp 3.000.000 / bulan</option>
                <option value="Rp 3.000.000 - Rp 5.000.000">Rp 3.000.000 – Rp 5.000.000 / bulan</option>
                <option value="> Rp 5.000.000">&gt; Rp 5.000.000 / bulan</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Kepemilikan Bantuan Pemerintah *</label>
              <select
                value={form.kepemilikanBantuan}
                onChange={(e) => setForm((prev) => ({ ...prev, kepemilikanBantuan: e.target.value }))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-normal text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#0B3A6A] focus:outline-none"
              >
                <option value="Tidak Ada">Tidak Ada</option>
                <option value="KIP Kuliah">KIP Kuliah</option>
                <option value="DTKS Kemensos">DTKS Kemensos</option>
                <option value="PKH / KKS">PKH / KKS</option>
                <option value="Surat Keterangan Tidak Mampu">Surat Keterangan Tidak Mampu (SKTM)</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 6: DYNAMIC PRESTASI & PENGALAMAN (5 CATEGORIES) */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-8">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base sm:text-lg">6. Prestasi &amp; Pengalaman</h3>
              <p className="text-xs text-slate-500 font-normal">Tambahkan riwayat prestasi dan pengalaman dalam 5 kategori di bawah ini (Kosongkan jika tidak ada).</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Category 1: Prestasi Akademik */}
            <DynamicAchievementBlock
              title="1. Prestasi Akademik (Lomba / Karya Ilmiah / Publikasi)"
              subtitle="Tambahkan riwayat prestasi akademik atau perlombaan ilmiah yang pernah Anda peroleh."
              labelNama="Nama Prestasi / Karya Ilmiah / Publikasi"
              placeholderNama="Contoh: Juara 1 Lomba Karya Tulis Ilmiah Nasional"
              items={prestasiAkademikList}
              onChange={setPrestasiAkademikList}
              addButtonText="Tambah Prestasi Akademik"
            />

            {/* Category 2: Prestasi Non-Akademik */}
            <DynamicAchievementBlock
              title="2. Prestasi Non-Akademik (Olahraga / Seni / Dll)"
              subtitle="Tambahkan riwayat prestasi bidang keolahragaan, seni, atau keahlian non-akademik lainnya."
              labelNama="Nama Prestasi / Penghargaan Non-Akademik"
              placeholderNama="Contoh: Juara 2 Bulutangkis Porprov Sultra"
              items={prestasiNonAkademikList}
              onChange={setPrestasiNonAkademikList}
              addButtonText="Tambah Prestasi Non-Akademik"
            />

            {/* Category 3: Pengalaman Organisasi Kemahasiswaan */}
            <DynamicAchievementBlock
              title="3. Pengalaman Organisasi Kemahasiswaan"
              subtitle="Tambahkan riwayat keaktifan kepengurusan organisasi kampus atau daerah."
              labelNama="Nama Organisasi & Jabatan / Peran"
              placeholderNama="Contoh: Ketua Himpunan Mahasiswa Jurusan (HMJ)"
              items={pengalamanOrganisasiList}
              onChange={setPengalamanOrganisasiList}
              addButtonText="Tambah Pengalaman Organisasi"
            />

            {/* Category 4: Pengalaman Kegiatan Sosial / Pengabdian Masyarakat */}
            <DynamicAchievementBlock
              title="4. Pengalaman Kegiatan Sosial / Pengabdian Masyarakat"
              subtitle="Tambahkan riwayat partisipasi relawan, aksi sosial, atau pengabdian masyarakat."
              labelNama="Nama Kegiatan Sosial / Pengabdian"
              placeholderNama="Contoh: Relawan Mengajar Desa Pesisir Kolaka"
              items={pengalamanPengabdianList}
              onChange={setPengalamanPengabdianList}
              addButtonText="Tambah Kegiatan Sosial"
            />

            {/* Category 5: Pelatihan / Sertifikasi Relevan */}
            <DynamicAchievementBlock
              title="5. Pelatihan / Sertifikasi Relevan"
              subtitle="Tambahkan riwayat pelatihan keahlian, workshop, atau sertifikasi kompetensi."
              labelNama="Nama Pelatihan / Sertifikasi Kompetensi"
              placeholderNama="Contoh: Sertifikasi Web Development / Pelatihan Kepemimpinan"
              items={pelatihanSertifikasiList}
              onChange={setPelatihanSertifikasiList}
              addButtonText="Tambah Pelatihan / Sertifikasi"
            />

          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto px-8 py-3.5 bg-[#0B3A6A] hover:bg-[#082a4d] disabled:opacity-50 text-white font-bold rounded-2xl text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Simpan Perubahan Profil</span>
          </button>
        </div>
      </form>

    </div>
  );
}
