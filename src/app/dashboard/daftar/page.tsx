'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { SULTRA_DISTRICTS } from '@/data/bsscData';
import {
  User,
  GraduationCap,
  BookOpen,
  Users,
  Award,
  Upload,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  FileText,
  AlertCircle,
  Printer,
  Home,
  Loader2
} from 'lucide-react';
import { fetchAPI } from '@/lib/api';

export default function RegistrationPage() {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [registrationCode, setRegistrationCode] = useState<string>('');
  const [loadingProfile, setLoadingProfile] = useState<boolean>(true);

  // Form State (Real empty defaults, automatically populated from Backend API)
  const [formData, setFormData] = useState({
    // Step 1: Kategori
    jenjang: 'S1',
    agreedSemesterRange: true,

    // Step 2: Data Diri
    namaLengkap: '',
    tempatLahir: '',
    tanggalLahir: '',
    jenisKelamin: 'Laki-laki',
    nik: '',
    noKk: '',
    asalDaerah: 'KOTA_KENDARI',
    alamatKtp: '',
    alamatDomisili: '',
    noHp: '',
    email: '',

    // Step 3: Data Akademik
    perguruanTinggi: '',
    fakultasProdi: '',
    akreditasiProdi: 'Baik Sekali',
    nim: '',
    semester: 3,
    ipk: '',
    targetLulus: '',
    beasiswaLain: 'Tidak Ada',

    // Step 4: Riwayat Pendidikan
    sdNama: '',
    sdTahunLulus: '',
    smpNama: '',
    smpTahunLulus: '',
    smaNama: '',
    smaJurusan: '',
    smaTahunLulus: '',
    prestasiRelevan: '',

    // Step 5: Keluarga & Ekonomi
    namaAyah: '',
    pekerjaanAyah: '',
    namaIbu: '',
    pekerjaanIbu: '',
    penghasilanOrtu: '< Rp 1.500.000',
    jumlahTanggungan: '3',
    kepemilikanBantuan: 'Tidak Ada',

    // Step 6: Prestasi & Pengalaman
    prestasiAkademik: '',
    prestasiNonAkademik: '',
    pengalamanOrganisasi: '',
    pengalamanPengabdian: '',
    pelatihanSertifikasi: '',

    // Step 7: Dokumen Uploads
    fileSuratPermohonan: '',
    filePasfoto: '',
    fileKtp: '',
    fileSuratAktif: '',
    fileTranskrip: '',
    fileDtks: '',
    fileSuratPernyataan: '',
    fileMotivationOrEsai: '',

    // Declaration
    agreedDeclaration: false
  });

  const [uploadingDocKey, setUploadingDocKey] = useState<string | null>(null);

  useEffect(() => {
    async function loadUserProfile() {
      setLoadingProfile(true);
      try {
        const res = await fetchAPI('/applicant/profile');
        if (res.success && res.data) {
          const u = res.data.user || {};
          const p = res.data.profile || {};
          const app = res.data.application;
          const docs = res.data.documents || [];

          if (app) {
            setRegistrationCode(app.registrationNo);
            setIsSubmitted(true);
          }

          const selfieDoc = docs.find((d: any) => d.docType === 'selfie');
          const ktmDoc = docs.find((d: any) => d.docType === 'ktm');
          const pendukungDoc = docs.find((d: any) => d.docType === 'pendukung');

          setFormData(prev => ({
            ...prev,
            namaLengkap: u.namaLengkap || '',
            nik: u.nik || '',
            email: u.email || '',
            jenjang: u.jenjangTarget || 'S1',
            tempatLahir: p.tempatLahir || '',
            tanggalLahir: p.tanggalLahir || '',
            jenisKelamin: p.gender || 'Laki-laki',
            noHp: p.noHp || '',
            alamatDomisili: p.alamatDomisili || '',
            alamatKtp: p.alamatDomisili || '',
            filePasfoto: selfieDoc ? selfieDoc.originalName : prev.filePasfoto,
            fileSuratAktif: ktmDoc ? ktmDoc.originalName : prev.fileSuratAktif,
            fileKtp: pendukungDoc ? pendukungDoc.originalName : prev.fileKtp,
          }));
        }
      } catch (err: any) {
        console.warn('Profile fetch warning:', err.message);
      } finally {
        setLoadingProfile(false);
      }
    }
    loadUserProfile();
  }, []);

  const handleDocumentUpload = async (docKey: string, docType: string, file: File) => {
    setUploadingDocKey(docKey);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append(docType, file);
      const endpoint = docType === 'ktm' ? '/applicant/upload/ktm' : docType === 'selfie' ? '/applicant/upload/selfie' : '/applicant/upload/pendukung';
      const res = await fetchAPI(endpoint, {
        method: 'POST',
        body: uploadFormData,
      });
      if (res.success) {
        setFormData(prev => ({ ...prev, [docKey]: file.name }));
      }
    } catch (err: any) {
      alert(err.message || 'Gagal mengunggah dokumen.');
    } finally {
      setUploadingDocKey(null);
    }
  };

  const steps = [
    { id: 1, title: 'Kategori Jenjang', icon: GraduationCap },
    { id: 2, title: 'Data Diri', icon: User },
    { id: 3, title: 'Data Akademik', icon: BookOpen },
    { id: 4, title: 'Riwayat Pendidikan', icon: GraduationCap },
    { id: 5, title: 'Keluarga & Ekonomi', icon: Users },
    { id: 6, title: 'Prestasi & Pengalaman', icon: Award },
    { id: 7, title: 'Unggah Berkas', icon: Upload },
    { id: 8, title: 'Review & Submit', icon: CheckCircle2 }
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmitFinal = async () => {
    try {
      // 1. Update Profile
      await fetchAPI('/applicant/profile', {
        method: 'PUT',
        body: JSON.stringify({
          tempatLahir: formData.tempatLahir,
          tanggalLahir: formData.tanggalLahir,
          gender: formData.jenisKelamin === 'Laki-laki' ? 'Laki-laki' : 'Perempuan',
          noHp: formData.noHp,
          alamatDomisili: formData.alamatDomisili,
        }),
      });

      // 2. Submit Application
      const res = await fetchAPI('/applicant/application', {
        method: 'POST',
        body: JSON.stringify({ catatanTambahan: `Permohonan Beasiswa ${formData.jenjang}` }),
      });

      if (res.success && res.data) {
        setRegistrationCode(res.data.registrationNo);
        setIsSubmitted(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err: any) {
      alert(err.message || 'Gagal mengirim permohonan beasiswa.');
    }
  };

  return (
    <div className="pb-10 max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="max-w-3xl mx-auto text-center space-y-2 mb-10">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Pendaftaran Beasiswa Stimulan Sultra Cerdas 2026
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Lengkapi 8 tahap isian formulir di bawah ini secara akurat sesuai dokumen kependudukan & akademik resmi.
          </p>
        </div>

        {!isSubmitted ? (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Steps Progress Header Bar */}
            <div className="bg-slate-900 text-white p-4 sm:p-6 overflow-x-auto">
              <div className="flex items-center justify-between min-w-[700px]">
                {steps.map((step) => {
                  const IconComponent = step.icon;
                  const isCurrent = step.id === currentStep;
                  const isDone = step.id < currentStep;

                  return (
                    <div
                      key={step.id}
                      onClick={() => {
                        if (step.id < currentStep) setCurrentStep(step.id);
                      }}
                      className={`flex flex-col items-center space-y-1.5 cursor-pointer px-2 transition-all ${
                        isCurrent
                          ? 'text-white scale-105'
                          : isDone
                          ? 'text-blue-400 hover:text-white'
                          : 'text-slate-500 opacity-60'
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs border transition-all ${
                          isCurrent
                            ? 'bg-blue-600 border-blue-400 text-white shadow-md'
                            : isDone
                            ? 'bg-blue-950 border-blue-800 text-blue-300'
                            : 'bg-slate-800 border-slate-700 text-slate-400'
                        }`}
                      >
                        {isDone ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <IconComponent className="w-4 h-4" />}
                      </div>
                      <span className="text-[10px] font-semibold tracking-tight whitespace-nowrap">
                        {step.id}. {step.title}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step Body Content */}
            <div className="p-6 sm:p-10 space-y-8">
              {/* STEP 1: JENJANG */}
              {currentStep === 1 && (
                <div className="space-y-6 max-w-3xl mx-auto">
                  <div className="border-b border-slate-100 pb-4">
                    <h2 className="text-xl font-bold text-slate-900">Tahap 1: Kategori Jenjang Studi</h2>
                    <p className="text-xs text-slate-500">Jenjang studi dikunci sesuai dengan pilihan saat pendaftaran akun.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { id: 'S1', label: 'S1 / D4', range: 'Semester 3 - 5', doc: 'Motivation Letter', ipk: 'Min 3.25' },
                      { id: 'S2', label: 'S2 (Magister)', range: 'Semester 2 - 3', doc: 'Esai Kontribusi', ipk: 'Min 3.50' },
                      { id: 'S3', label: 'S3 (Doktor)', range: 'Semester 2 - 5', doc: 'Esai Kontribusi', ipk: 'Min 3.50' }
                    ].map((item) => (
                      <div
                        key={item.id}
                        className={`p-5 rounded-2xl border-2 transition-all space-y-3 ${
                          formData.jenjang === item.id
                            ? 'bg-blue-50/70 border-blue-900 shadow-sm'
                            : 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-slate-900 text-lg">{item.label}</span>
                          <span
                            className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs font-bold ${
                              formData.jenjang === item.id
                                ? 'bg-blue-900 text-white border-blue-900'
                                : 'border-slate-300'
                            }`}
                          >
                            ✓
                          </span>
                        </div>

                        <div className="space-y-1 text-xs text-slate-600">
                          <p>• Ketentuan: <strong>{item.range}</strong></p>
                          <p>• Standar IPK: <strong>{item.ipk}</strong></p>
                          <p>• Dokumen Khusus: <strong>{item.doc}</strong></p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="agreeRange"
                      checked={formData.agreedSemesterRange}
                      onChange={(e) => handleInputChange('agreedSemesterRange', e.target.checked)}
                      className="mt-1 rounded text-blue-900 focus:ring-blue-900"
                    />
                    <label htmlFor="agreeRange" className="text-xs text-slate-700 leading-relaxed cursor-pointer">
                      Saya mengonfirmasi bahwa saya merupakan mahasiswa aktif pada rentang semester yang sesuai dengan kualifikasi jenjang <strong>{formData.jenjang}</strong> yang saya pilih di atas.
                    </label>
                  </div>
                </div>
              )}

              {/* STEP 2: DATA DIRI */}
              {currentStep === 2 && (
                <div className="space-y-6 max-w-4xl mx-auto">
                  <div className="border-b border-slate-100 pb-4">
                    <h2 className="text-xl font-bold text-slate-900">Tahap 2: Data Diri Pendaftar</h2>
                    <p className="text-xs text-slate-500">Isikan data pribadi persis sesuai KTP/KTM resmi.</p>
                  </div>

                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between text-xs text-emerald-900 shadow-sm">
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                      <div>
                        <span className="font-bold text-emerald-950 block">Data Terisi Otomatis</span>
                        <span className="text-emerald-700 text-[11px]">Identitas diri telah disinkronkan langsung dari verifikasi pendaftaran akun Anda.</span>
                      </div>
                    </div>
                    <span className="text-[10px] bg-emerald-600 text-white font-bold px-2.5 py-1 rounded-full shrink-0 shadow-sm">
                      ✓ Auto-Filled
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs font-medium text-slate-700">
                    <div className="sm:col-span-2">
                      <label className="block mb-1 font-semibold">Nama Lengkap (Sesuai KTP / KTM)</label>
                      <input
                        type="text"
                        value={formData.namaLengkap}
                        onChange={(e) => handleInputChange('namaLengkap', e.target.value)}
                        placeholder="Contoh: Muhammad Rezky Pratama"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-900 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block mb-1 font-semibold">Tempat Lahir</label>
                      <input
                        type="text"
                        value={formData.tempatLahir}
                        onChange={(e) => handleInputChange('tempatLahir', e.target.value)}
                        placeholder="Kendari"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-900 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block mb-1 font-semibold">Tanggal Lahir</label>
                      <input
                        type="date"
                        value={formData.tanggalLahir}
                        onChange={(e) => handleInputChange('tanggalLahir', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-900 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block mb-1 font-semibold">Jenis Kelamin</label>
                      <select
                        value={formData.jenisKelamin}
                        onChange={(e) => handleInputChange('jenisKelamin', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-900 focus:outline-none"
                      >
                        <option value="Laki-laki">Laki-laki</option>
                        <option value="Perempuan">Perempuan</option>
                      </select>
                    </div>

                    <div>
                      <label className="block mb-1 font-semibold">NIK (Nomor Induk Kependudukan - 16 Digit)</label>
                      <input
                        type="text"
                        maxLength={16}
                        value={formData.nik}
                        onChange={(e) => handleInputChange('nik', e.target.value)}
                        placeholder="740102..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-900 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block mb-1 font-semibold">No. Kartu Keluarga (KK)</label>
                      <input
                        type="text"
                        maxLength={16}
                        value={formData.noKk}
                        onChange={(e) => handleInputChange('noKk', e.target.value)}
                        placeholder="740102..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-900 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block mb-1 font-semibold">Asal Daerah (Kabupaten / Kota SULTRA)</label>
                      <select
                        value={formData.asalDaerah}
                        onChange={(e) => handleInputChange('asalDaerah', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-900 focus:outline-none"
                      >
                        {SULTRA_DISTRICTS.map((d) => (
                          <option key={d.code} value={d.code}>
                            {d.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block mb-1 font-semibold">Alamat Sesuai KTP</label>
                      <textarea
                        rows={2}
                        value={formData.alamatKtp}
                        onChange={(e) => handleInputChange('alamatKtp', e.target.value)}
                        placeholder="Jl. Ahmad Yani No. 45, Kendari..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-900 focus:outline-none"
                      ></textarea>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block mb-1 font-semibold">Alamat Domisili Saat Ini</label>
                      <textarea
                        rows={2}
                        value={formData.alamatDomisili}
                        onChange={(e) => handleInputChange('alamatDomisili', e.target.value)}
                        placeholder="Sama dengan KTP atau Alamat Kost/Kontrakan..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-900 focus:outline-none"
                      ></textarea>
                    </div>

                    <div>
                      <label className="block mb-1 font-semibold">No. HP / WhatsApp Aktif</label>
                      <input
                        type="text"
                        value={formData.noHp}
                        onChange={(e) => handleInputChange('noHp', e.target.value)}
                        placeholder="081234567890"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-900 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block mb-1 font-semibold">Alamat Email Aktif</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="nama@email.com"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-900 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: DATA AKADEMIK */}
              {currentStep === 3 && (
                <div className="space-y-6 max-w-4xl mx-auto">
                  <div className="border-b border-slate-100 pb-4">
                    <h2 className="text-xl font-bold text-slate-900">Tahap 3: Data Akademik Saat Ini (Ongoing)</h2>
                    <p className="text-xs text-slate-500">Informasi perguruan tinggi, program studi, dan IPK kumulatif.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs font-medium text-slate-700">
                    <div className="sm:col-span-2">
                      <label className="block mb-1 font-semibold">Nama Perguruan Tinggi (PTN / PTS)</label>
                      <input
                        type="text"
                        value={formData.perguruanTinggi}
                        onChange={(e) => handleInputChange('perguruanTinggi', e.target.value)}
                        placeholder="Universitas Halu Oleo / Universitas 19 November Kolaka..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-900 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block mb-1 font-semibold">Fakultas / Program Studi</label>
                      <input
                        type="text"
                        value={formData.fakultasProdi}
                        onChange={(e) => handleInputChange('fakultasProdi', e.target.value)}
                        placeholder="Fakultas Teknik / Teknik Sipil"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-900 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block mb-1 font-semibold">Akreditasi Prodi (Minimal Baik Sekali)</label>
                      <select
                        value={formData.akreditasiProdi}
                        onChange={(e) => handleInputChange('akreditasiProdi', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-900 focus:outline-none"
                      >
                        <option value="Unggul">Unggul / A</option>
                        <option value="Baik Sekali">Baik Sekali / B</option>
                      </select>
                    </div>

                    <div>
                      <label className="block mb-1 font-semibold">NIM (Nomor Induk Mahasiswa)</label>
                      <input
                        type="text"
                        value={formData.nim}
                        onChange={(e) => handleInputChange('nim', e.target.value)}
                        placeholder="E1A121001"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-900 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block mb-1 font-semibold">Semester Saat Ini</label>
                      <select
                        value={formData.semester}
                        onChange={(e) => handleInputChange('semester', parseInt(e.target.value))}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-900 focus:outline-none"
                      >
                        {[2, 3, 4, 5].map((s) => (
                          <option key={s} value={s}>
                            Semester {s}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block mb-1 font-semibold">IPK Terakhir Kumulatif (Transkrip Nilai)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.ipk}
                        onChange={(e) => handleInputChange('ipk', e.target.value)}
                        placeholder="3.45"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-900 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block mb-1 font-semibold">Target Lulus (Perkiraan Tahun)</label>
                      <input
                        type="text"
                        value={formData.targetLulus}
                        onChange={(e) => handleInputChange('targetLulus', e.target.value)}
                        placeholder="2027"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-900 focus:outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block mb-1 font-semibold">Status Penerima Beasiswa Lain</label>
                      <input
                        type="text"
                        value={formData.beasiswaLain}
                        onChange={(e) => handleInputChange('beasiswaLain', e.target.value)}
                        placeholder="Wajib 'Tidak Ada' (Jika menerima sebutkan nama beasiswa)"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-900 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: RIWAYAT PENDIDIKAN */}
              {currentStep === 4 && (
                <div className="space-y-6 max-w-4xl mx-auto">
                  <div className="border-b border-slate-100 pb-4">
                    <h2 className="text-xl font-bold text-slate-900">Tahap 4: Riwayat Pendidikan Sebelumnya</h2>
                    <p className="text-xs text-slate-500">Isikan riwayat pendidikan SD, SMP, dan SMA/SMK.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs font-medium text-slate-700">
                    <div>
                      <label className="block mb-1 font-semibold">SD (Nama Sekolah)</label>
                      <input
                        type="text"
                        value={formData.sdNama}
                        onChange={(e) => handleInputChange('sdNama', e.target.value)}
                        placeholder="SDN 1 Kendari"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-900 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 font-semibold">SD (Tahun Lulus)</label>
                      <input
                        type="text"
                        value={formData.sdTahunLulus}
                        onChange={(e) => handleInputChange('sdTahunLulus', e.target.value)}
                        placeholder="2015"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-900 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block mb-1 font-semibold">SMP (Nama Sekolah)</label>
                      <input
                        type="text"
                        value={formData.smpNama}
                        onChange={(e) => handleInputChange('smpNama', e.target.value)}
                        placeholder="SMPN 1 Kendari"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-900 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 font-semibold">SMP (Tahun Lulus)</label>
                      <input
                        type="text"
                        value={formData.smpTahunLulus}
                        onChange={(e) => handleInputChange('smpTahunLulus', e.target.value)}
                        placeholder="2018"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-900 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block mb-1 font-semibold">SMA / SMK (Nama Sekolah & Jurusan)</label>
                      <input
                        type="text"
                        value={formData.smaNama}
                        onChange={(e) => handleInputChange('smaNama', e.target.value)}
                        placeholder="SMAN 1 Kendari (IPA)"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-900 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 font-semibold">SMA / SMK (Tahun Lulus)</label>
                      <input
                        type="text"
                        value={formData.smaTahunLulus}
                        onChange={(e) => handleInputChange('smaTahunLulus', e.target.value)}
                        placeholder="2021"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-900 focus:outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block mb-1 font-semibold">Nilai Rata-rata / Catatan Prestasi Relevan</label>
                      <input
                        type="text"
                        value={formData.prestasiRelevan}
                        onChange={(e) => handleInputChange('prestasiRelevan', e.target.value)}
                        placeholder="Rata-rata Ujian 88.50 / Juara 1 Olimpiade Matematika..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-900 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 5: KELUARGA & EKONOMI */}
              {currentStep === 5 && (
                <div className="space-y-6 max-w-4xl mx-auto">
                  <div className="border-b border-slate-100 pb-4">
                    <h2 className="text-xl font-bold text-slate-900">Tahap 5: Data Keluarga & Kondisi Ekonomi</h2>
                    <p className="text-xs text-slate-500">Isikan data orang tua/wali dan latar belakang sosial ekonomi.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs font-medium text-slate-700">
                    <div>
                      <label className="block mb-1 font-semibold">Nama Ayah / Wali</label>
                      <input
                        type="text"
                        value={formData.namaAyah}
                        onChange={(e) => handleInputChange('namaAyah', e.target.value)}
                        placeholder="Nama Ayah / Wali"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-900 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 font-semibold">Pekerjaan Ayah / Wali</label>
                      <input
                        type="text"
                        value={formData.pekerjaanAyah}
                        onChange={(e) => handleInputChange('pekerjaanAyah', e.target.value)}
                        placeholder="Petani / Wiraswasta / PNS..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-900 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block mb-1 font-semibold">Nama Ibu</label>
                      <input
                        type="text"
                        value={formData.namaIbu}
                        onChange={(e) => handleInputChange('namaIbu', e.target.value)}
                        placeholder="Nama Ibu"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-900 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 font-semibold">Pekerjaan Ibu</label>
                      <input
                        type="text"
                        value={formData.pekerjaanIbu}
                        onChange={(e) => handleInputChange('pekerjaanIbu', e.target.value)}
                        placeholder="Ibu Rumah Tangga / Pedagang..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-900 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block mb-1 font-semibold">Penghasilan Orang Tua / Wali Per Bulan</label>
                      <select
                        value={formData.penghasilanOrtu}
                        onChange={(e) => handleInputChange('penghasilanOrtu', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-900 focus:outline-none"
                      >
                        <option value="< Rp 1.500.000">&lt; Rp 1.500.000</option>
                        <option value="Rp 1.500.000 - Rp 3.000.000">Rp 1.500.000 - Rp 3.000.000</option>
                        <option value="Rp 3.000.000 - Rp 5.000.000">Rp 3.000.000 - Rp 5.000.000</option>
                        <option value="> Rp 5.000.000">&gt; Rp 5.000.000</option>
                      </select>
                    </div>

                    <div>
                      <label className="block mb-1 font-semibold">Jumlah Tanggungan Keluarga</label>
                      <select
                        value={formData.jumlahTanggungan}
                        onChange={(e) => handleInputChange('jumlahTanggungan', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-900 focus:outline-none"
                      >
                        <option value="1">1 Orang</option>
                        <option value="2">2 Orang</option>
                        <option value="3">3 Orang</option>
                        <option value="4+">4 Orang / Lebih</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block mb-1 font-semibold">Kepemilikan Kartu KKS / KIP / PKH / DTKS</label>
                      <select
                        value={formData.kepemilikanBantuan}
                        onChange={(e) => handleInputChange('kepemilikanBantuan', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-900 focus:outline-none"
                      >
                        <option value="Ada">Ada (Terdaftar di DTKS/DTSEN/KIP/PKH)</option>
                        <option value="Tidak Ada">Tidak Ada</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 6: PRESTASI & PENGALAMAN */}
              {currentStep === 6 && (
                <div className="space-y-6 max-w-4xl mx-auto">
                  <div className="border-b border-slate-100 pb-4">
                    <h2 className="text-xl font-bold text-slate-900">Tahap 6: Prestasi & Pengalaman</h2>
                    <p className="text-xs text-slate-500">Catatkan prestasi dan keaktifan organisasi (Opsional jika ada).</p>
                  </div>

                  <div className="space-y-4 text-xs font-medium text-slate-700">
                    <div>
                      <label className="block mb-1 font-semibold">Prestasi Akademik (Lomba / Karya Ilmiah / Publikasi)</label>
                      <textarea
                        rows={2}
                        value={formData.prestasiAkademik}
                        onChange={(e) => handleInputChange('prestasiAkademik', e.target.value)}
                        placeholder="Juara 1 Lomba Karya Tulis Ilmiah Nasional 2025..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-900 focus:outline-none"
                      ></textarea>
                    </div>

                    <div>
                      <label className="block mb-1 font-semibold">Prestasi Non-Akademik (Olahraga / Seni / Dll)</label>
                      <textarea
                        rows={2}
                        value={formData.prestasiNonAkademik}
                        onChange={(e) => handleInputChange('prestasiNonAkademik', e.target.value)}
                        placeholder="Juara 2 Bulutangkis Porprov Sultra 2024..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-900 focus:outline-none"
                      ></textarea>
                    </div>

                    <div>
                      <label className="block mb-1 font-semibold">Pengalaman Organisasi Kemahasiswaan</label>
                      <textarea
                        rows={2}
                        value={formData.pengalamanOrganisasi}
                        onChange={(e) => handleInputChange('pengalamanOrganisasi', e.target.value)}
                        placeholder="Ketua Himpunan Mahasiswa Jurusan (HMJ) 2025..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-900 focus:outline-none"
                      ></textarea>
                    </div>

                    <div>
                      <label className="block mb-1 font-semibold">Pengalaman Kegiatan Sosial / Pengabdian Masyarakat</label>
                      <textarea
                        rows={2}
                        value={formData.pengalamanPengabdian}
                        onChange={(e) => handleInputChange('pengalamanPengabdian', e.target.value)}
                        placeholder="Relawan Mengajar Desa Pesisir Kolaka 2025..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-900 focus:outline-none"
                      ></textarea>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 7: UNGGAH BERKAS */}
              {currentStep === 7 && (
                <div className="space-y-6 max-w-4xl mx-auto">
                  <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">Tahap 7: Unggah Dokumen Persyaratan ({formData.jenjang})</h2>
                      <p className="text-xs text-slate-500">Unggah berkas digital spesifik yang dipersyaratkan untuk jenjang {formData.jenjang}.</p>
                    </div>
                    <span className="text-xs font-bold px-3 py-1 bg-blue-100 text-[#0B3A6A] rounded-full">
                      Jenjang {formData.jenjang}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {(formData.jenjang === 'S1'
                      ? [
                          { key: 'fileSuratPermohonan', docType: 'pendukung', title: '1. Surat Permohonan BSSC (Gubernur Sultra)' },
                          { key: 'filePasfoto', docType: 'selfie', title: '2. Pasfoto Terbaru / Selfie KTP' },
                          { key: 'fileKtp', docType: 'pendukung', title: '3. KTP Provinsi Sulawesi Tenggara' },
                          { key: 'fileSuratAktif', docType: 'ktm', title: '4. KTM / Surat Aktif Kuliah' },
                          { key: 'fileTranskrip', docType: 'pendukung', title: '5. Transkrip Nilai Sementara S1' },
                          { key: 'fileDtks', docType: 'pendukung', title: '6. Bukti Terdaftar DTKS / DTSEN' },
                          { key: 'fileSuratPernyataan', docType: 'pendukung', title: '7. Surat Pernyataan Bebas Beasiswa Lain (Materai)' },
                          { key: 'fileMotivationOrEsai', docType: 'pendukung', title: '8. Motivation Letter (S1/D4)' }
                        ]
                      : formData.jenjang === 'S2'
                      ? [
                          { key: 'fileSuratPermohonan', docType: 'pendukung', title: '1. Surat Permohonan BSSC (Gubernur Sultra)' },
                          { key: 'filePasfoto', docType: 'selfie', title: '2. Pasfoto Terbaru / Selfie KTP' },
                          { key: 'fileKtp', docType: 'pendukung', title: '3. KTP Provinsi Sulawesi Tenggara' },
                          { key: 'fileSuratAktif', docType: 'ktm', title: '4. KTM / Surat Aktif S2' },
                          { key: 'fileTranskrip', docType: 'pendukung', title: '5. Transkrip Nilai Semester S2' },
                          { key: 'fileDtks', docType: 'pendukung', title: '6. Ijazah & Transkrip Nilai S1' },
                          { key: 'fileSuratPernyataan', docType: 'pendukung', title: '7. Surat Pernyataan Bebas Beasiswa Lain' },
                          { key: 'fileMotivationOrEsai', docType: 'pendukung', title: '8. Esai Rencana Penelitian & Kontribusi Sultra (S2)' }
                        ]
                      : [
                          { key: 'fileSuratPermohonan', docType: 'pendukung', title: '1. Surat Permohonan BSSC (Gubernur Sultra)' },
                          { key: 'filePasfoto', docType: 'selfie', title: '2. Pasfoto Terbaru / Selfie KTP' },
                          { key: 'fileKtp', docType: 'pendukung', title: '3. KTP Provinsi Sulawesi Tenggara' },
                          { key: 'fileSuratAktif', docType: 'ktm', title: '4. KTM / Surat Aktif S3' },
                          { key: 'fileTranskrip', docType: 'pendukung', title: '5. Transkrip Nilai Semester S3' },
                          { key: 'fileDtks', docType: 'pendukung', title: '6. Ijazah & Transkrip S1 & S2' },
                          { key: 'fileSuratPernyataan', docType: 'pendukung', title: '7. Surat Rekomendasi Promotor' },
                          { key: 'fileMotivationOrEsai', docType: 'pendukung', title: '8. Proposal Disertasi & Esai Kontribusi Sultra (S3)' }
                        ]
                    ).map((docItem, idx) => {
                      const currentVal = (formData as any)[docItem.key];
                      const isUploading = uploadingDocKey === docItem.key;

                      return (
                        <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2 relative">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-900 text-xs">{docItem.title}</span>
                            <span className="text-[10px] text-emerald-800 bg-emerald-100 font-bold px-2 py-0.5 rounded">
                              PDF / JPG
                            </span>
                          </div>

                          <div className="flex items-center justify-between gap-2 bg-white p-2.5 rounded-lg border border-slate-200 text-xs">
                            <div className="flex items-center gap-2 truncate flex-1">
                              <FileText className="w-4 h-4 text-blue-900 shrink-0" />
                              <span className="truncate font-mono text-slate-700 text-[11px]">
                                {currentVal || 'Belum diunggah'}
                              </span>
                            </div>

                            <label className="shrink-0 cursor-pointer px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-900 rounded font-semibold text-[11px] transition-colors">
                              {isUploading ? 'Mengunggah...' : currentVal ? 'Ganti File' : 'Unggah File'}
                              <input
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                className="hidden"
                                disabled={isUploading}
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    handleDocumentUpload(docItem.key, docItem.docType, file);
                                  }
                                }}
                              />
                            </label>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 8: REVIEW & SUBMIT */}
              {currentStep === 8 && (
                <div className="space-y-6 max-w-4xl mx-auto">
                  <div className="border-b border-slate-100 pb-4">
                    <h2 className="text-xl font-bold text-slate-900">Tahap 8: Review & Validasi Final</h2>
                    <p className="text-xs text-slate-500">Periksa kembali ringkasan isian formulir Anda sebelum mengirim permohonan final.</p>
                  </div>

                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4 text-xs text-slate-800">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-4 border-b border-slate-200">
                      <div>
                        <span className="text-slate-500 block">Jenjang Studi</span>
                        <strong className="text-slate-900 text-sm">{formData.jenjang}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block">IPK Kumulatif</span>
                        <strong className="text-blue-900 text-sm">{formData.ipk || '-'}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Semester</span>
                        <strong className="text-slate-900 text-sm">Semester {formData.semester}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Asal Daerah</span>
                        <strong className="text-slate-900 text-sm">{formData.asalDaerah || '-'}</strong>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <p className="text-slate-500">Nama Pendaftar:</p>
                      <p className="font-bold text-slate-900 text-sm">{formData.namaLengkap || '-'}</p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-slate-500">Perguruan Tinggi & Prodi:</p>
                      <p className="font-bold text-slate-900 text-sm">
                        {formData.perguruanTinggi || '-'} {formData.fakultasProdi ? `(${formData.fakultasProdi})` : ''}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-200 space-y-3">
                      <div className="flex items-start gap-3 bg-blue-50/80 p-4 rounded-xl border border-blue-200">
                        <input
                          type="checkbox"
                          id="agreedDec"
                          checked={formData.agreedDeclaration}
                          onChange={(e) => handleInputChange('agreedDeclaration', e.target.checked)}
                          className="mt-1 rounded text-blue-900 focus:ring-blue-900"
                        />
                        <label htmlFor="agreedDec" className="text-xs text-blue-950 font-medium leading-relaxed cursor-pointer">
                          Saya menyatakan dengan sesungguhnya bahwa seluruh data dan dokumen yang saya unggah adalah <strong>BENAR, SAH, dan DAPAT DIPERTANGGUNGJAWABKAN</strong>. Saya memahami bahwa jika terbukti memberikan data fiktif atau pendanaan ganda (double funding), saya bersedia menerima sanksi pembatalan status dan wajib mengembalikan dana beasiswa ke kas daerah.
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Controls */}
              <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={currentStep === 1}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    currentStep === 1
                      ? 'opacity-40 cursor-not-allowed bg-slate-100 text-slate-400'
                      : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Sebelumnya
                </button>

                {currentStep < 8 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-900 hover:bg-blue-950 transition-all flex items-center gap-2 shadow-xs"
                  >
                    Langkah Selanjutnya
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={!formData.agreedDeclaration}
                    onClick={handleSubmitFinal}
                    className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-wider text-white transition-all flex items-center gap-2 shadow-md ${
                      formData.agreedDeclaration
                        ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                        : 'opacity-50 cursor-not-allowed bg-slate-400'
                    }`}
                  >
                    Submit Final Pendaftaran BSSC
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Submission Receipt Modal Container */
          <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-xl space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Pendaftaran Berhasil Disubmit
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900">Nomor Registrasi Pendaftaran Anda</h2>
              <div className="text-3xl font-black text-blue-900 tracking-wider font-mono py-2 bg-slate-50 rounded-xl border border-slate-200 inline-block px-6">
                {registrationCode}
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
              Seluruh data diri, akademik, dan berkas persyaratan Anda telah masuk ke dalam sistem validasi Pemprov Sulawesi Tenggara. Hasil verifikasi administrasi akan diumumkan pada <strong>16 - 17 Oktober 2026</strong>.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => window.print()}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center justify-center gap-2 hover:bg-slate-800"
              >
                <Printer className="w-4 h-4" /> Cetak Bukti Pendaftaran
              </button>

              <Link
                href="/cek-status"
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 hover:bg-slate-100"
              >
                Cek Status Pendaftaran
              </Link>
            </div>
          </div>
        )}
      </div>
  );
}
