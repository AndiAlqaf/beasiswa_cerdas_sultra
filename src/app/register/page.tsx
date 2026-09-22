'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Camera,
  CheckCircle2,
  Trash2,
  Plus,
  RefreshCw,
  Upload,
  UserCheck,
  ShieldCheck,
  AlertCircle,
  FileText,
  FileCheck,
  Loader2
} from 'lucide-react';
import { fetchAPI, setTokens } from '@/lib/api';

interface EducationEntry {
  id: string;
  tingkat: string;
  institusi: string;
  jurusan: string;
  tahunMulai: string;
  tahunLulus: string;
}

export default function RegisterPage() {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const totalSteps = 5;

  // Form State
  const [showPassword, setShowPassword] = useState<boolean>(false);
  
  // Step 1: Akun & NIM/NIK & Jenjang Target Beasiswa
  const [jenjangTarget, setJenjangTarget] = useState<string>('S1');
  const [namaLengkap, setNamaLengkap] = useState<string>('');
  const [nimNik, setNimNik] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  // Step 2: Foto Selfie
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Step 3: Data Diri
  const [tempatLahir, setTempatLahir] = useState<string>('');
  const [tanggalLahir, setTanggalLahir] = useState<string>('');
  const [gender, setGender] = useState<string>('Laki-laki');
  const [noHp, setNoHp] = useState<string>('+62 ');
  const [statusPernikahan, setStatusPernikahan] = useState<string>('Belum Menikah');
  const [alamatDomisili, setAlamatDomisili] = useState<string>('');

  // Step 4: Pendidikan
  const [educationList, setEducationList] = useState<EducationEntry[]>([
    {
      id: '1',
      tingkat: 'SMA',
      institusi: '',
      jurusan: '',
      tahunMulai: '',
      tahunLulus: ''
    },
    {
      id: '2',
      tingkat: 'S1',
      institusi: '',
      jurusan: '',
      tahunMulai: '',
      tahunLulus: ''
    }
  ]);

  // Step 5: Dokumen KTM / Surat Keterangan Aktif Kuliah
  const [fileKtm, setFileKtm] = useState<File | null>(null);
  const [fileKtmName, setFileKtmName] = useState<string>('');
  const [filePendukung, setFilePendukung] = useState<File | null>(null);
  const [filePendukungName, setFilePendukungName] = useState<string>('');
  const [agreedDeclaration, setAgreedDeclaration] = useState<boolean>(true);

  // Synchronize education history structure based on target jenjang (S1/S2/S3)
  useEffect(() => {
    if (jenjangTarget === 'S1') {
      setEducationList([
        { id: '1', tingkat: 'SMA', institusi: '', jurusan: '', tahunMulai: '', tahunLulus: '' },
        { id: '2', tingkat: 'S1', institusi: '', jurusan: '', tahunMulai: '', tahunLulus: '' }
      ]);
    } else if (jenjangTarget === 'S2') {
      setEducationList([
        { id: '1', tingkat: 'S1', institusi: '', jurusan: '', tahunMulai: '', tahunLulus: '' },
        { id: '2', tingkat: 'S2', institusi: '', jurusan: '', tahunMulai: '', tahunLulus: '' }
      ]);
    } else if (jenjangTarget === 'S3') {
      setEducationList([
        { id: '1', tingkat: 'S1', institusi: '', jurusan: '', tahunMulai: '', tahunLulus: '' },
        { id: '2', tingkat: 'S2', institusi: '', jurusan: '', tahunMulai: '', tahunLulus: '' },
        { id: '3', tingkat: 'S3', institusi: '', jurusan: '', tahunMulai: '', tahunLulus: '' }
      ]);
    }
  }, [jenjangTarget]);

  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  // Camera Management
  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraError('Kamera tidak dapat diakses atau diizin ditolak. Gunakan simulasi / upload foto selfie.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const takeSnapshot = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        setCapturedImage(canvas.toDataURL('image/png'));
        stopCamera();
      }
    } else {
      // Fallback simulated photo
      setCapturedImage('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCapturedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (currentStep === 2 && !capturedImage) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [currentStep]);

  // Education Card handlers
  const handleAddEducation = () => {
    setEducationList((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        tingkat: 'S1',
        institusi: '',
        jurusan: '',
        tahunMulai: '',
        tahunLulus: ''
      }
    ]);
  };

  const handleRemoveEducation = (id: string) => {
    if (educationList.length > 1) {
      setEducationList((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const handleEducationChange = (id: string, field: keyof EducationEntry, value: string) => {
    setEducationList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  // Step Navigation
  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegisterAccount = async () => {
    if (!email || !password || !namaLengkap || !nimNik) {
      setError('Harap lengkapi semua bidang bertanda bintang (*).');
      return;
    }
    if (password !== confirmPassword) {
      setError('Konfirmasi password tidak cocok.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetchAPI('/auth/register', {
        method: 'POST',
        skipAuth: true,
        body: JSON.stringify({
          email,
          nik: nimNik,
          password,
          confirmPassword,
          namaLengkap,
          jenjangTarget,
        }),
      });

      if (res.success && res.data) {
        setTokens(res.data.accessToken, res.data.refreshToken, res.data.user);
        nextStep();
      }
    } catch (err: any) {
      setError(err.message || 'Registrasi gagal. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedDeclaration) return;
    
    setLoading(true);
    setError(null);
    try {
      // 1. Submit Profile (Data Diri)
      await fetchAPI('/applicant/profile', {
        method: 'PUT',
        body: JSON.stringify({
          tempatLahir,
          tanggalLahir,
          gender,
          noHp,
          statusPernikahan,
          alamatDomisili,
        }),
      });

      // 2. Submit Education
      await fetchAPI('/applicant/education', {
        method: 'PUT',
        body: JSON.stringify({
          educationList,
        }),
      });

      // 3. Upload Selfie
      if (capturedImage && capturedImage.startsWith('data:image')) {
        const res = await fetch(capturedImage);
        const fileBlob = await res.blob();
        const formData = new FormData();
        formData.append('file', fileBlob, 'selfie.png');
        await fetchAPI('/applicant/upload/selfie', {
          method: 'POST',
          body: formData,
        });
      }

      // 4. Upload KTM
      if (fileKtm) {
        const formData = new FormData();
        formData.append('file', fileKtm);
        await fetchAPI('/applicant/upload/ktm', {
          method: 'POST',
          body: formData,
        });
      }

      // 5. Upload KTP/KK (Pendukung)
      if (filePendukung) {
        const formData = new FormData();
        formData.append('file', filePendukung);
        await fetchAPI('/applicant/upload/pendukung', {
          method: 'POST',
          body: formData,
        });
      }

      setIsSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan data kelengkapan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8">
      {/* Top Navbar Header */}
      <div className="max-w-3xl mx-auto w-full flex items-center justify-between pb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 text-sm font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Beranda
        </Link>
        <div className="text-right">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
            Portal Mahasiswa
          </span>
          <span className="text-sm font-extrabold text-[#0B3A6A]">
            Beasiswa Sultra Cerdas 2026
          </span>
        </div>
      </div>

      {/* Main Registration Container */}
      <div className="max-w-3xl mx-auto w-full bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {!isSubmitted ? (
          <div className="p-6 sm:p-10">
            {/* Step Progress Bar Segment */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[#0B3A6A] tracking-wider uppercase">
                  LANGKAH {currentStep} DARI {totalSteps}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {currentStep === 1 && 'Akun & NIM/NIK'}
                  {currentStep === 2 && 'Foto Selfie'}
                  {currentStep === 3 && 'Data Diri'}
                  {currentStep === 4 && 'Pendidikan'}
                  {currentStep === 5 && 'Unggah KTM / Surat Aktif'}
                </span>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map((stepNum) => (
                  <div
                    key={stepNum}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      stepNum <= currentStep ? 'bg-[#0B3A6A]' : 'bg-slate-200'
                    }`}
                  ></div>
                ))}
              </div>
            </div>

            {/* STEP 1: AKUN & NIP / NIM / NIK */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                    Pilih Jenjang & Kredensial Akun
                  </h1>
                  <p className="text-sm text-slate-500 mt-1">
                    Pilih program jenjang beasiswa yang akan Anda tuju dan lengkapi data registrasi awal.
                  </p>
                </div>

                {/* Target Scholarship Selection */}
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-800">
                    Target Program Jenjang Beasiswa *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { id: 'S1', title: 'S1 / D4', desc: 'Semester 3 - 5', ipk: 'Min IPK 3.25' },
                      { id: 'S2', title: 'S2 (Magister)', desc: 'Semester 2 - 3', ipk: 'Min IPK 3.50' },
                      { id: 'S3', title: 'S3 (Doktor)', desc: 'Semester 2 - 5', ipk: 'Min IPK 3.50' }
                    ].map((j) => (
                      <div
                        key={j.id}
                        onClick={() => setJenjangTarget(j.id)}
                        className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                          jenjangTarget === j.id
                            ? 'bg-blue-50 border-[#0B3A6A] shadow-sm'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-slate-900 text-sm">{j.title}</span>
                          <span
                            className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] font-bold ${
                              jenjangTarget === j.id
                                ? 'bg-[#0B3A6A] text-white border-[#0B3A6A]'
                                : 'border-slate-300'
                            }`}
                          >
                            ✓
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 font-medium">{j.desc}</p>
                        <span className="text-[10px] font-bold text-[#0B3A6A] bg-blue-100 px-2 py-0.5 rounded mt-2 inline-block">
                          {j.ipk}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4 pt-2 border-t border-slate-100">
                  <div>
                    <label className="block text-sm font-bold text-slate-800 mb-1.5">
                      Nama Lengkap Sesuai KTP *
                    </label>
                    <input
                      type="text"
                      required
                      value={namaLengkap}
                      onChange={(e) => setNamaLengkap(e.target.value)}
                      placeholder="Contoh: Budi Santoso"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-base focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B3A6A] transition-all text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-800 mb-1.5">
                      NIM / NIK Mahasiswa *
                    </label>
                    <input
                      type="text"
                      required
                      value={nimNik}
                      onChange={(e) => setNimNik(e.target.value)}
                      placeholder="Masukkan NIM atau 16 Digit NIK"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-base focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B3A6A] transition-all text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-800 mb-1.5">
                      Email Aktif *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="contoh@email.com"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-base focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B3A6A] transition-all text-slate-900"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-800 mb-1.5">
                        Password *
                      </label>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Minimal 6 karakter"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-base focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B3A6A] transition-all text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-800 mb-1.5">
                        Konfirmasi Password *
                      </label>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Ulangi password"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-base focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B3A6A] transition-all text-slate-900"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="showPass"
                      checked={showPassword}
                      onChange={(e) => setShowPassword(e.target.checked)}
                      className="w-4 h-4 rounded text-[#0B3A6A] focus:ring-[#0B3A6A]"
                    />
                    <label htmlFor="showPass" className="text-sm font-medium text-slate-600 cursor-pointer">
                      Tampilkan Password
                    </label>
                  </div>
                  {error && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-800">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}
                </div>

                <div className="pt-4">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={handleRegisterAccount}
                    className="w-full py-3.5 px-6 bg-[#0B3A6A] hover:bg-[#082a4d] text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-base disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" /> Daftarkan Akun...
                      </>
                    ) : (
                      <>
                        Lanjut ke Foto Selfie <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>

                <div className="text-center pt-2">
                  <span className="text-sm text-slate-500">
                    Sudah punya akun?{' '}
                    <Link href="/login" className="font-bold text-[#0B3A6A] hover:underline">
                      Masuk di sini
                    </Link>
                  </span>
                </div>
              </div>
            )}

            {/* STEP 2: FOTO SELFIE / VERIFIKASI WAJAH */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                    Foto Selfie (Verifikasi Wajah)
                  </h1>
                  <p className="text-sm text-slate-500 mt-1">
                    Posisikan wajah Anda pada area oval untuk verifikasi identitas fisik.
                  </p>
                </div>

                <div className="flex flex-col items-center justify-center">
                  <div className="relative w-full max-w-sm h-80 bg-slate-900 rounded-3xl overflow-hidden shadow-inner flex items-center justify-center border-4 border-slate-100">
                    {capturedImage ? (
                      <img
                        src={capturedImage}
                        alt="Hasil Foto Selfie"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <>
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          className="w-full h-full object-cover"
                        />
                        {/* Oval dashed face overlay guide */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="w-48 h-64 border-4 border-dashed border-white/80 rounded-[50%] shadow-lg animate-pulse flex flex-col justify-between items-center py-4">
                            <span className="bg-black/60 text-white text-[10px] font-semibold px-2.5 py-0.5 rounded-full backdrop-blur-sm">
                              Posisikan Wajah Di Sini
                            </span>
                          </div>
                        </div>

                        {/* Live detection badge overlay */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
                          <div className="bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg flex items-center gap-2 border border-emerald-400/30">
                            <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                            <span>😊 Silakan TERSENYUM</span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {cameraError && (
                    <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2 max-w-sm">
                      <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                      <span>{cameraError}</span>
                    </div>
                  )}

                  {/* Camera action buttons */}
                  <div className="mt-4 flex flex-wrap gap-3 justify-center">
                    {!capturedImage ? (
                      <>
                        <button
                          type="button"
                          onClick={takeSnapshot}
                          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm shadow flex items-center gap-2 transition-colors"
                        >
                          <Camera className="w-4 h-4" /> Ambil Foto Selfie
                        </button>
                        <label className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm cursor-pointer flex items-center gap-2 transition-colors">
                          <Upload className="w-4 h-4" /> Unggah Foto
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                        </label>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setCapturedImage(null);
                          startCamera();
                        }}
                        className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-sm shadow flex items-center gap-2 transition-colors"
                      >
                        <RefreshCw className="w-4 h-4" /> Foto Ulang
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="px-6 py-3 border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-100 text-sm transition-colors"
                  >
                    Kembali
                  </button>
                  <button
                    type="button"
                    onClick={nextStep}
                    className="px-6 py-3 bg-[#0B3A6A] hover:bg-[#082a4d] text-white font-bold rounded-xl shadow text-sm transition-all flex items-center gap-2"
                  >
                    Lanjut <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: DATA DIRI */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                    Data Diri
                  </h1>
                  <p className="text-sm text-slate-500 mt-1">
                    Lengkapi informasi kependudukan resmi dan kontak aktif Anda.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-800 mb-1.5">
                        Tempat Lahir *
                      </label>
                      <input
                        type="text"
                        required
                        value={tempatLahir}
                        onChange={(e) => setTempatLahir(e.target.value)}
                        placeholder="Contoh: Kendari"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-base focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B3A6A] transition-all text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-800 mb-1.5">
                        Tanggal Lahir *
                      </label>
                      <input
                        type="date"
                        required
                        value={tanggalLahir}
                        onChange={(e) => setTanggalLahir(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-base focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B3A6A] transition-all text-slate-900"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-800 mb-1.5">
                        Gender *
                      </label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-base focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B3A6A] transition-all text-slate-900 font-medium"
                      >
                        <option value="Laki-laki">Laki-laki</option>
                        <option value="Perempuan">Perempuan</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-800 mb-1.5">
                        Nomor Telepon/WA *
                      </label>
                      <input
                        type="text"
                        required
                        value={noHp}
                        onChange={(e) => setNoHp(e.target.value)}
                        placeholder="+62 8..."
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-base focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B3A6A] transition-all text-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-800 mb-1.5">
                      Status Pernikahan *
                    </label>
                    <select
                      value={statusPernikahan}
                      onChange={(e) => setStatusPernikahan(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-base focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B3A6A] transition-all text-slate-900 font-medium"
                    >
                      <option value="Belum Menikah">Belum Menikah</option>
                      <option value="Menikah">Menikah</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-800 mb-1.5">
                      Alamat Domisili *
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={alamatDomisili}
                      onChange={(e) => setAlamatDomisili(e.target.value)}
                      placeholder="Masukkan alamat lengkap RT/RW, Kelurahan, Kecamatan"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-base focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B3A6A] transition-all text-slate-900 resize-none"
                    ></textarea>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="px-6 py-3 border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-100 text-sm transition-colors"
                  >
                    Kembali
                  </button>
                  <button
                    type="button"
                    onClick={nextStep}
                    className="px-6 py-3 bg-[#0B3A6A] hover:bg-[#082a4d] text-white font-bold rounded-xl shadow text-sm transition-all flex items-center gap-2"
                  >
                    Lanjut <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: PENDIDIKAN */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                    Pendidikan
                  </h1>
                  <p className="text-sm text-slate-500 mt-1">
                    Tambahkan riwayat pendidikan formal Anda.
                  </p>
                </div>

                <div className="space-y-6">
                  {educationList.map((edu, index) => (
                    <div
                      key={edu.id}
                      className="p-5 bg-slate-50 border border-slate-200 rounded-2xl relative space-y-4"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                        <span className="text-xs font-extrabold text-[#0B3A6A] uppercase tracking-wider">
                          Riwayat Pendidikan #{index + 1}
                        </span>
                        {educationList.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveEducation(edu.id)}
                            className="text-slate-400 hover:text-red-600 transition-colors p-1"
                            title="Hapus entry"
                          >
                            <Trash2 className="w-5 h-5 text-red-500" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-bold text-slate-800 mb-1.5">
                            Tingkat *
                          </label>
                          <select
                            value={edu.tingkat}
                            onChange={(e) =>
                              handleEducationChange(edu.id, 'tingkat', e.target.value)
                            }
                            className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-base text-slate-700 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B3A6A] transition-all"
                          >
                            <option value="SMA">SMA / SMK / MA</option>
                            <option value="D3">D3</option>
                            <option value="S1">S1 / D4</option>
                            <option value="S2">S2 (Magister)</option>
                            <option value="S3">S3 (Doktor)</option>
                          </select>
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-sm font-bold text-slate-800 mb-1.5">
                            Institusi / Nama Sekolah *
                          </label>
                          <input
                            type="text"
                            required
                            value={edu.institusi}
                            onChange={(e) =>
                              handleEducationChange(edu.id, 'institusi', e.target.value)
                            }
                            placeholder="Contoh: Universitas Halu Oleo"
                            className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-base text-slate-700 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B3A6A] transition-all placeholder:text-slate-400 placeholder:font-normal"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-bold text-slate-800 mb-1.5">
                            Jurusan *
                          </label>
                          <input
                            type="text"
                            required
                            value={edu.jurusan}
                            onChange={(e) =>
                              handleEducationChange(edu.id, 'jurusan', e.target.value)
                            }
                            placeholder="Contoh: Teknik Informatika"
                            className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-base text-slate-700 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B3A6A] transition-all placeholder:text-slate-400 placeholder:font-normal"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-slate-800 mb-1.5">
                            Tahun Mulai *
                          </label>
                          <input
                            type="text"
                            required
                            value={edu.tahunMulai}
                            onChange={(e) =>
                              handleEducationChange(edu.id, 'tahunMulai', e.target.value)
                            }
                            placeholder="YYYY"
                            className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-base text-slate-700 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B3A6A] transition-all placeholder:text-slate-400 placeholder:font-normal"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-slate-800 mb-1.5">
                            Tahun Lulus
                          </label>
                          <input
                            type="text"
                            value={edu.tahunLulus}
                            onChange={(e) =>
                              handleEducationChange(edu.id, 'tahunLulus', e.target.value)
                            }
                            placeholder="YYYY"
                            className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-base text-slate-700 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B3A6A] transition-all placeholder:text-slate-400 placeholder:font-normal"
                          />
                          <p className="text-xs text-red-600 mt-1.5 font-semibold">
                            *Kosongkan jika masih menempuh studi
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={handleAddEducation}
                    className="w-full py-3 border-2 border-dashed border-slate-300 hover:border-[#0B3A6A] hover:bg-blue-50/50 text-[#0B3A6A] font-bold rounded-2xl transition-all flex items-center justify-center gap-2 text-sm"
                  >
                    <Plus className="w-4 h-4" /> Tambah Pendidikan
                  </button>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="px-6 py-3 border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-100 text-sm transition-colors"
                  >
                    Kembali
                  </button>
                  <button
                    type="button"
                    onClick={nextStep}
                    className="px-6 py-3 bg-[#0B3A6A] hover:bg-[#082a4d] text-white font-bold rounded-xl shadow text-sm transition-all flex items-center gap-2"
                  >
                    Lanjut ke Unggah Berkas <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 5: UNGGAH KTM / SURAT KETERANGAN AKTIF KULIAH */}
            {currentStep === 5 && (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                    Unggah Dokumen Verifikasi
                  </h1>
                  <p className="text-sm text-slate-500 mt-1">
                    Unggah Kartu Tanda Mahasiswa (KTM) atau Surat Keterangan Aktif Kuliah resmi dari perguruan tinggi Anda.
                  </p>
                </div>

                <div className="space-y-5">
                  {/* File Upload 1: KTM / Surat Aktif */}
                  <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-bold text-slate-800">
                        KTM / Surat Keterangan Aktif Kuliah *
                      </label>
                      <span className="text-[11px] font-semibold bg-blue-100 text-[#0B3A6A] px-2.5 py-0.5 rounded-full">
                        Wajib
                      </span>
                    </div>

                    <div className="border-2 border-dashed border-slate-300 hover:border-[#0B3A6A] bg-white rounded-xl p-6 text-center transition-all cursor-pointer relative">
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setFileKtm(file);
                            setFileKtmName(file.name);
                          }
                        }}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <div className="w-12 h-12 bg-blue-50 text-[#0B3A6A] rounded-full flex items-center justify-center">
                          <FileText className="w-6 h-6" />
                        </div>
                        {fileKtmName ? (
                          <div>
                            <p className="text-sm font-bold text-slate-800 flex items-center justify-center gap-1.5">
                              <FileCheck className="w-4 h-4 text-emerald-600" />
                              {fileKtmName}
                            </p>
                            <p className="text-xs text-emerald-600 font-semibold mt-0.5">
                              File siap diunggah (Klik untuk mengganti)
                            </p>
                          </div>
                        ) : (
                          <div>
                            <p className="text-sm font-bold text-slate-700">
                              Klik atau seret file PDF / JPG ke sini
                            </p>
                            <p className="text-xs text-slate-400 mt-1">
                              Ukuran maksimal file 2 MB (PDF, JPG, PNG)
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* File Upload 2: Dokumen Pendukung (Opsional) */}
                  <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-bold text-slate-800">
                        Dokumen Pendukung Lainnya (KTP / KK)
                      </label>
                      <span className="text-[11px] font-semibold bg-slate-200 text-slate-600 px-2.5 py-0.5 rounded-full">
                        Opsional
                      </span>
                    </div>

                    <div className="border-2 border-dashed border-slate-300 hover:border-[#0B3A6A] bg-white rounded-xl p-4 text-center transition-all cursor-pointer relative">
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setFilePendukung(file);
                            setFilePendukungName(file.name);
                          }
                        }}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      <div className="flex items-center justify-center gap-3">
                        <Upload className="w-5 h-5 text-slate-400" />
                        <span className="text-xs font-semibold text-slate-600">
                          {filePendukungName ? filePendukungName : 'Pilih File KTP / KK (Opsional)'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Declaration Checkbox */}
                  <div className="pt-2">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        required
                        checked={agreedDeclaration}
                        onChange={(e) => setAgreedDeclaration(e.target.checked)}
                        className="mt-1 w-4 h-4 rounded text-[#0B3A6A] focus:ring-[#0B3A6A]"
                      />
                      <span className="text-xs text-slate-600 leading-relaxed font-medium">
                        Saya menyatakan bahwa seluruh dokumen yang saya unggah adalah asli dan sah milik saya pribadi. Apabila ditemukan kejanggalan atau data palsu, saya bersedia menerima sanksi yang berlaku.
                      </span>
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="px-6 py-3 border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-100 text-sm transition-colors"
                  >
                    Kembali
                  </button>
                  <button
                    type="submit"
                    className="px-8 py-3.5 bg-[#0B3A6A] hover:bg-[#082a4d] text-white font-extrabold rounded-xl shadow-lg text-sm transition-all flex items-center gap-2"
                  >
                    Daftar Akun Sekarang <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          /* REGISTRATION SUCCESS VIEW */
          <div className="p-8 sm:p-12 text-center space-y-6">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-12 h-12" />
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Pendaftaran Akun Berhasil!
              </h2>
              <p className="text-slate-600 max-w-md mx-auto text-sm leading-relaxed">
                Akun portal Anda telah terdaftar, foto verifikasi wajah & dokumen KTM berhasil disimpan. Anda dapat langsung masuk ke portal mahasiswa untuk mengajukan pendaftaran beasiswa.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl max-w-md mx-auto text-left space-y-2">
              <div className="flex justify-between text-xs text-slate-500">
                <span>Email Terdaftar:</span>
                <span className="font-semibold text-slate-800">{email || '-'}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>NIM / NIK:</span>
                <span className="font-semibold text-slate-800">{nimNik || '-'}</span>
              </div>
              {fileKtmName && (
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Dokumen KTM / Aktif Kuliah:</span>
                  <span className="font-semibold text-emerald-600 flex items-center gap-1 truncate max-w-[200px]">
                    <FileCheck className="w-3.5 h-3.5 shrink-0" /> {fileKtmName}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-xs text-slate-500">
                <span>Status Verifikasi Akun:</span>
                <span className="font-bold text-emerald-600 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Terdaftar di Sistem
                </span>
              </div>
            </div>

            <div className="pt-4">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-8 py-4 bg-[#0B3A6A] hover:bg-[#082a4d] text-white font-extrabold text-base rounded-2xl shadow-lg transition-all transform hover:-translate-y-0.5"
              >
                Masuk ke Portal Login <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Footer copyright */}
      <div className="text-center pt-8 text-xs text-slate-400 font-medium">
        &copy; 2026 Pemerintah Provinsi Sulawesi Tenggara &bull; Beasiswa Sultra Cerdas
      </div>
    </div>
  );
}
