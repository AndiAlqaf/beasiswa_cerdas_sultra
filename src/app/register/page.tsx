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
  AlertTriangle,
  FileText,
  FileCheck,
  XCircle,
  Loader2
} from 'lucide-react';
import { fetchAPI, setTokens } from '@/lib/api';
import { PRIORITY_PRODI_BY_JENJANG } from '@/data/bsscData';

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
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  
  // Step 1: Akun & NIK & Jenjang Target Beasiswa
  const [jenjangTarget, setJenjangTarget] = useState<string>('S1');
  const [prodiPrioritas, setProdiPrioritas] = useState<string>('');
  const [isSemesterConfirmed, setIsSemesterConfirmed] = useState<boolean>(false);
  const [namaLengkap, setNamaLengkap] = useState<string>('');
  const [nik, setNimNik] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  // Step 2: Foto Selfie
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [isDetectingFace, setIsDetectingFace] = useState(false);
  const [faceModelLoaded, setFaceModelLoaded] = useState(false);
  const [readyToSelfie, setReadyToSelfie] = useState(false);
  const [livenessStatus, setLivenessStatus] = useState<'searching' | 'detected' | 'right' | 'left' | 'up' | 'down' | 'smiling'>('searching');
  const faceApiRef = useRef<any>(null);
  const [modelLoadError, setModelLoadError] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const [isBypassed, setIsBypassed] = useState(false);
  const [guideChecked, setGuideChecked] = useState(false);

  const missedFaceCountRef = useRef(0);
  const yawHistoryRef = useRef<number[]>([]);
  const baselineYawRef = useRef<number | null>(null);

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
    setProdiPrioritas('');
    if (jenjangTarget === 'S1') {
      setEducationList([
        { id: '1', tingkat: 'SMA', institusi: '', jurusan: '', tahunMulai: '', tahunLulus: '' }
      ]);
    } else if (jenjangTarget === 'S2') {
      setEducationList([
        { id: '1', tingkat: 'SMA', institusi: '', jurusan: '', tahunMulai: '', tahunLulus: '' },
        { id: '2', tingkat: 'S1', institusi: '', jurusan: '', tahunMulai: '', tahunLulus: '' }
      ]);
    } else if (jenjangTarget === 'S3') {
      setEducationList([
        { id: '1', tingkat: 'SMA', institusi: '', jurusan: '', tahunMulai: '', tahunLulus: '' },
        { id: '2', tingkat: 'S1', institusi: '', jurusan: '', tahunMulai: '', tahunLulus: '' },
        { id: '3', tingkat: 'S2', institusi: '', jurusan: '', tahunMulai: '', tahunLulus: '' }
      ]);
    }
  }, [jenjangTarget]);

  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isDraftLoaded, setIsDraftLoaded] = useState<boolean>(false);

  // 1. Restore register draft from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('bssc_register_draft');
      if (saved) {
        const d = JSON.parse(saved);
        if (d.currentStep && d.currentStep > 1) setCurrentStep(d.currentStep);
        if (d.jenjangTarget) setJenjangTarget(d.jenjangTarget);
        if (d.prodiPrioritas) setProdiPrioritas(d.prodiPrioritas);
        if (d.isSemesterConfirmed !== undefined) setIsSemesterConfirmed(d.isSemesterConfirmed);
        if (d.namaLengkap) setNamaLengkap(d.namaLengkap);
        if (d.nik) setNimNik(d.nik);
        if (d.email) setEmail(d.email);
        if (d.capturedImage) setCapturedImage(d.capturedImage);
        if (d.tempatLahir) setTempatLahir(d.tempatLahir);
        if (d.tanggalLahir) setTanggalLahir(d.tanggalLahir);
        if (d.gender) setGender(d.gender);
        if (d.noHp) setNoHp(d.noHp);
        if (d.statusPernikahan) setStatusPernikahan(d.statusPernikahan);
        if (d.alamatDomisili) setAlamatDomisili(d.alamatDomisili);
        if (d.educationList && Array.isArray(d.educationList) && d.educationList.length > 0) {
          setEducationList(d.educationList);
        }
      }
    } catch (e) {
      console.warn('Failed to load register draft:', e);
    } finally {
      setIsDraftLoaded(true);
    }
  }, []);

  // 2. Auto-save register draft to localStorage on state changes
  useEffect(() => {
    if (!isDraftLoaded || isSubmitted) return;
    try {
      const draftData = {
        currentStep,
        jenjangTarget,
        prodiPrioritas,
        isSemesterConfirmed,
        namaLengkap,
        nik,
        email,
        capturedImage,
        tempatLahir,
        tanggalLahir,
        gender,
        noHp,
        statusPernikahan,
        alamatDomisili,
        educationList
      };
      localStorage.setItem('bssc_register_draft', JSON.stringify(draftData));
    } catch (e) {
      console.warn('Failed to save register draft:', e);
    }
  }, [
    isDraftLoaded,
    isSubmitted,
    currentStep,
    jenjangTarget,
    prodiPrioritas,
    isSemesterConfirmed,
    namaLengkap,
    nik,
    email,
    capturedImage,
    tempatLahir,
    tanggalLahir,
    gender,
    noHp,
    statusPernikahan,
    alamatDomisili,
    educationList
  ]);

  // Camera Management & Liveness Detection
  const startCamera = React.useCallback(async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsCameraActive(true);
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraError('Kamera tidak dapat diakses atau izin ditolak. Pastikan izin kamera diberikan.');
      setIsCameraActive(false);
    }
  }, []);

  const stopCamera = React.useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  }, []);

  useEffect(() => {
    if (currentStep === 2 && !faceModelLoaded) {
      setModelLoadError('');
      import('@vladmandic/face-api').then(async faceapi => {
        faceApiRef.current = faceapi;
        try {
          // @ts-ignore
          await faceapi.tf.setBackend('webgl');
          // @ts-ignore
          await faceapi.tf.ready();
          await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
          await faceapi.nets.faceExpressionNet.loadFromUri('/models');
          await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
          setFaceModelLoaded(true);
        } catch (err: any) {
          console.error('Face model load error:', err);
          setModelLoadError('Gagal mengunduh file model deteksi wajah. Pastikan file model sudah tersedia di folder public/models.');
        }
      }).catch(err => {
        console.error('Error importing face-api:', err);
        setModelLoadError('Gagal mengunduh modul deteksi wajah. Periksa koneksi internet Anda.');
      });
    }
  }, [currentStep, faceModelLoaded, retryCount]);

  useEffect(() => {
    if (!capturedImage && isCameraActive) {
      setLivenessStatus('searching');
      baselineYawRef.current = null;
      yawHistoryRef.current = [];
      missedFaceCountRef.current = 0;
    }
  }, [capturedImage, isCameraActive]);

  useEffect(() => {
    if (currentStep === 2 && !isCameraActive) {
      startCamera();
    }
  }, [currentStep, isCameraActive, startCamera]);

  useEffect(() => {
    if (currentStep !== 2 || !readyToSelfie || capturedImage || !isCameraActive || !faceModelLoaded || !faceApiRef.current || isBypassed) return;

    let isChecking = false;
    const interval = setInterval(async () => {
      if (isChecking) return;
      const video = videoRef.current;
      if (!video) return;

      isChecking = true;
      try {
        const faceapi = faceApiRef.current;
        const detection = await faceapi
          .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.25 }))
          .withFaceLandmarks()
          .withFaceExpressions();

        if (!detection) {
          missedFaceCountRef.current++;
          if (missedFaceCountRef.current > 15) {
            setLivenessStatus('searching');
            baselineYawRef.current = null;
            yawHistoryRef.current = [];
          }
        } else {
          missedFaceCountRef.current = 0;
          const lm = detection.landmarks.positions;

          const cheekLeft = lm[0];
          const cheekRight = lm[16];
          const noseTip = lm[30];

          const dxLeft = noseTip.x - cheekLeft.x;
          const dxRight = cheekRight.x - noseTip.x;
          const yawRatio = dxLeft / dxRight;

          if (yawHistoryRef.current.length < 10) {
            yawHistoryRef.current.push(yawRatio);
            if (yawHistoryRef.current.length === 10) {
              const avgYaw = yawHistoryRef.current.reduce((a, b) => a + b, 0) / 10;
              baselineYawRef.current = avgYaw;
              setLivenessStatus('right'); 
            } else {
              setLivenessStatus('searching');
            }
            isChecking = false;
            return;
          }

          const currentBaselineYaw = baselineYawRef.current || 1.0;
          const YAW_RIGHT_THRESHOLD = currentBaselineYaw * 1.20;
          const YAW_LEFT_THRESHOLD = currentBaselineYaw * 0.80;

          if (livenessStatus === 'right') {
            if (yawRatio < YAW_LEFT_THRESHOLD) {
              setLivenessStatus('left'); 
            }
          } else if (livenessStatus === 'left') {
            if (yawRatio > YAW_RIGHT_THRESHOLD) {
              setLivenessStatus('smiling'); 
            }
          } else if (livenessStatus === 'smiling') {
            if (detection.expressions.happy > 0.8) {
              clearInterval(interval);
              capturePhoto();
            }
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        isChecking = false;
      }
    }, 100);

    return () => clearInterval(interval);
  }, [currentStep, readyToSelfie, capturedImage, isCameraActive, faceModelLoaded, isBypassed, livenessStatus]);

  const capturePhoto = React.useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const video = videoRef.current;

    setIsDetectingFace(true);
    try {
      let width = video.videoWidth || 640;
      let height = video.videoHeight || 480;
      const MAX_DIM = 640;
      if (width > height && width > MAX_DIM) {
        height = Math.round(height * MAX_DIM / width);
        width = MAX_DIM;
      } else if (height > MAX_DIM) {
        width = Math.round(width * MAX_DIM / height);
        height = MAX_DIM;
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, width, height);
      }
      setCapturedImage(canvas.toDataURL('image/webp', 0.75));
      stopCamera();
      setCameraError(null);
    } catch (err) {
      console.error(err);
      setCameraError('Terjadi kesalahan saat menangkap foto.');
    } finally {
      setIsDetectingFace(false);
    }
  }, [stopCamera]);

  useEffect(() => { return () => { stopCamera(); }; }, [stopCamera]);

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

  // Step Navigation with Strict Field Validation
  const validateAndNextStep = () => {
    setError(null);

    if (currentStep === 2) {
      if (!capturedImage) {
        setError('Wajib mengambil foto selfie atau mengunggah foto selfie terlebih dahulu sebelum melanjutkan.');
        return;
      }
    } else if (currentStep === 3) {
      if (!tempatLahir.trim()) {
        setError('Tempat Lahir wajib diisi.');
        return;
      }
      if (!tanggalLahir.trim()) {
        setError('Wajib mengisi Tanggal Lahir Anda.');
        return;
      }
      if (!noHp.trim() || noHp.trim() === '+62') {
        setError('Nomor Telepon/WA wajib diisi secara lengkap.');
        return;
      }
      if (!alamatDomisili.trim()) {
        setError('Alamat Domisili lengkap wajib diisi.');
        return;
      }
    } else if (currentStep === 4) {
      for (let i = 0; i < educationList.length; i++) {
        const edu = educationList[i];
        if (!edu.institusi.trim() || !edu.jurusan.trim() || !edu.tahunMulai.trim()) {
          setError(`Harap lengkapi data riwayat pendidikan ${edu.tingkat} (Nama Sekolah/Perguruan Tinggi, Jurusan, dan Tahun Mulai).`);
          return;
        }
      }
    }

    setError(null);
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const nextStep = () => {
    validateAndNextStep();
  };

  const prevStep = () => {
    setError(null);
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegisterAccount = async () => {
    if (!email || !password || !namaLengkap || !nik || !prodiPrioritas) {
      setError('Harap lengkapi semua bidang bertanda bintang (*), termasuk Program Studi Prioritas.');
      return;
    }
    const cleanNik = nik.replace(/\D/g, '');
    if (cleanNik.length !== 16) {
      setError('NIK Mahasiswa wajib diisi tepat 16 digit angka (saat ini: ' + cleanNik.length + ' digit).');
      return;
    }
    if (!isSemesterConfirmed) {
      setError('Harap beri tanda centang konfirmasi bahwa Anda benar berada di semester yang sesuai kriteria.');
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
          nik: nik,
          password,
          confirmPassword,
          namaLengkap,
          jenjangTarget,
          prodiPrioritas,
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
        formData.append('selfie', fileBlob, 'selfie.png');
        await fetchAPI('/applicant/upload/selfie', {
          method: 'POST',
          body: formData,
        });
      }

      // 4. Upload KTM
      if (fileKtm) {
        const formData = new FormData();
        formData.append('ktm', fileKtm);
        await fetchAPI('/applicant/upload/ktm', {
          method: 'POST',
          body: formData,
        });
      }

      // 5. Upload KTP/KK (Pendukung)
      if (filePendukung) {
        const formData = new FormData();
        formData.append('pendukung', filePendukung);
        await fetchAPI('/applicant/upload/pendukung', {
          method: 'POST',
          body: formData,
        });
      }

      try {
        localStorage.removeItem('bssc_register_draft');
      } catch (e) {}
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
                  {currentStep === 1 && 'Akun & NIK'}
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

            {error && (
              <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-rose-800 text-sm shadow-sm">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-bold text-rose-900 mb-1">Terjadi Kesalahan</h4>
                  <p>{error}</p>
                </div>
              </div>
            )}

            {/* STEP 1: AKUN & NIP / NIK */}
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

                {/* Priority Study Program Selection */}
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-800">
                    Program Studi Prioritas (Lampiran 1 Petunjuk Teknis) *
                  </label>
                  <select
                    value={prodiPrioritas}
                    onChange={(e) => setProdiPrioritas(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B3A6A] transition-all text-slate-900 font-normal"
                  >
                    <option value="">-- Pilih Program Studi Prioritas ({jenjangTarget}) --</option>
                    {(['Pendidikan', 'Kesehatan', 'Agromaritim', 'Infrastruktur'] as const).map((cat) => {
                      const items = (PRIORITY_PRODI_BY_JENJANG[jenjangTarget as 'S1' | 'S2' | 'S3'] || []).filter(p => p.category === cat);
                      if (items.length === 0) return null;
                      return (
                        <optgroup key={cat} label={`Bidang Prioritas: ${cat}`}>
                          {items.map((p, idx) => (
                            <option key={idx} value={p.name}>
                              {p.name}
                            </option>
                          ))}
                        </optgroup>
                      );
                    })}
                  </select>
                  <p className="text-xs text-slate-500 font-medium">
                    Pilihan prodi disesuaikan dengan Lampiran 1 Juknis Beasiswa Stimulan Sultra Cerdas 2026 untuk jenjang {jenjangTarget}.
                  </p>
                </div>

                <div className="space-y-4 pt-2 border-t border-slate-100">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">
                      Nama Lengkap Sesuai KTP *
                    </label>
                    <input
                      type="text"
                      required
                      value={namaLengkap}
                      onChange={(e) => setNamaLengkap(e.target.value)}
                      placeholder="Contoh: Budi Santoso"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B3A6A] transition-all text-slate-900 font-normal placeholder:font-normal placeholder:text-slate-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">
                      NIK Mahasiswa *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={16}
                      value={nik}
                      onChange={(e) => setNimNik(e.target.value.replace(/\D/g, '').slice(0, 16))}
                      placeholder="Masukkan 16 Digit NIK"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B3A6A] transition-all text-slate-900 font-normal placeholder:font-normal placeholder:text-slate-400 font-mono tracking-wider"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">
                      Email Aktif *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="contoh@email.com"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B3A6A] transition-all text-slate-900 font-normal placeholder:font-normal placeholder:text-slate-400"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">
                        Password *
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Minimal 6 karakter"
                          className="w-full pl-4 pr-11 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B3A6A] transition-all text-slate-900 font-normal placeholder:font-normal placeholder:text-slate-400"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                          tabIndex={-1}
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">
                        Konfirmasi Password *
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Ulangi password"
                          className="w-full pl-4 pr-11 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B3A6A] transition-all text-slate-900 font-normal placeholder:font-normal placeholder:text-slate-400"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                          tabIndex={-1}
                        >
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <label className="flex items-start gap-3 p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-xl cursor-pointer hover:bg-blue-50 transition-colors">
                      <input
                        type="checkbox"
                        checked={isSemesterConfirmed}
                        onChange={(e) => setIsSemesterConfirmed(e.target.checked)}
                        className="w-4.5 h-4.5 mt-0.5 rounded text-[#0B3A6A] focus:ring-[#0B3A6A] shrink-0"
                      />
                      <span className="text-xs font-semibold text-slate-800 leading-relaxed">
                        {jenjangTarget === 'S1'
                          ? 'Saya menyatakan dengan sebenarnya bahwa saat ini saya adalah mahasiswa aktif yang berada di semester 3, 4, atau 5. *'
                          : jenjangTarget === 'S2'
                          ? 'Saya menyatakan dengan sebenarnya bahwa saat ini saya adalah mahasiswa aktif yang berada di semester 2 atau 3. *'
                          : 'Saya menyatakan dengan sebenarnya bahwa saat ini saya adalah mahasiswa aktif yang berada di semester 2, 3, 4, atau 5. *'}
                      </span>
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
                    Verifikasi identitas fisik secara langsung melalui liveness detection.
                  </p>
                </div>

                <div className="flex flex-col items-center justify-center">
                  {!readyToSelfie && (
                    <>
                      <div className="fixed inset-0 bg-black/60 z-50 transition-opacity backdrop-blur-sm" />
                      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                          {/* Header */}
                          <div className="bg-slate-50 p-6 flex items-center gap-4 border-b border-slate-100">
                            <div className="w-12 h-12 rounded-2xl bg-[#0B3A6A]/10 flex items-center justify-center shrink-0 shadow-inner">
                              <Camera className="w-6 h-6 text-[#0B3A6A]" />
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-slate-800">Verifikasi Keaktifan Wajah</h3>
                              <p className="text-xs text-slate-500 mt-0.5">Ikuti panduan berikut agar proses pendaftaran berjalan lancar.</p>
                            </div>
                          </div>

                          {/* Body */}
                          <div className="p-6 space-y-5">
                            {/* Liveness Steps Banner */}
                            <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4">
                              <h4 className="text-xs font-bold text-slate-700 mb-3 uppercase tracking-wider">Tahapan Verifikasi</h4>
                              <div className="grid grid-cols-3 gap-3 text-center">
                                <div className="bg-white border border-slate-100 rounded-xl p-3 shadow-sm flex flex-col items-center">
                                  <span className="bg-[#0B3A6A]/10 text-[#0B3A6A] font-bold rounded-full w-6 h-6 flex items-center justify-center text-xs mb-1">1</span>
                                  <span className="text-xs font-semibold text-slate-700">Posisikan Wajah</span>
                                  <span className="text-[10px] text-slate-400 mt-0.5">Pas di dalam garis panduan</span>
                                </div>
                                <div className="bg-white border border-slate-100 rounded-xl p-3 shadow-sm flex flex-col items-center">
                                  <span className="bg-[#0B3A6A]/10 text-[#0B3A6A] font-bold rounded-full w-6 h-6 flex items-center justify-center text-xs mb-1">2</span>
                                  <span className="text-xs font-semibold text-slate-700">Kedip & Hadap Samping</span>
                                  <span className="text-[10px] text-slate-400 mt-0.5">Kedip, lalu tengok kanan/kiri</span>
                                </div>
                                <div className="bg-white border border-slate-100 rounded-xl p-3 shadow-sm flex flex-col items-center">
                                  <span className="bg-emerald-600/10 text-emerald-600 font-bold rounded-full w-6 h-6 flex items-center justify-center text-xs mb-1">3</span>
                                  <span className="text-xs font-semibold text-slate-700">Tersenyum</span>
                                  <span className="text-[10px] text-slate-400 mt-0.5">Foto terambil otomatis</span>
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* DOs */}
                              <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4">
                                <h4 className="flex items-center gap-2 text-emerald-800 font-bold mb-3 text-sm">
                                  <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Boleh (Dianjurkan)
                                </h4>
                                <ul className="space-y-2">
                                  <li className="text-xs text-emerald-700 flex items-start gap-1.5">
                                    <span className="text-emerald-500 font-bold shrink-0">✔</span>
                                    <span>Gunakan pakaian rapi dan berkerah resmi.</span>
                                  </li>
                                  <li className="text-xs text-emerald-700 flex items-start gap-1.5">
                                    <span className="text-emerald-500 font-bold shrink-0">✔</span>
                                    <span>Posisi wajah tegak lurus menghadap kamera.</span>
                                  </li>
                                  <li className="text-xs text-emerald-700 flex items-start gap-1.5">
                                    <span className="text-emerald-500 font-bold shrink-0">✔</span>
                                    <span>Pencahayaan ruangan cukup terang dan merata.</span>
                                  </li>
                                </ul>
                              </div>

                              {/* DONTs */}
                              <div className="bg-rose-50/50 border border-rose-100 rounded-2xl p-4">
                                <h4 className="flex items-center gap-2 text-rose-800 font-bold mb-3 text-sm">
                                  <XCircle className="w-5 h-5 text-rose-600" /> Tidak Boleh
                                </h4>
                                <ul className="space-y-2">
                                  <li className="text-xs text-rose-700 flex items-start gap-1.5">
                                    <span className="text-rose-500 font-bold shrink-0">✖</span>
                                    <span>Menggunakan kacamata hitam, masker, atau penutup wajah.</span>
                                  </li>
                                  <li className="text-xs text-rose-700 flex items-start gap-1.5">
                                    <span className="text-rose-500 font-bold shrink-0">✖</span>
                                    <span>Mengambil foto dari layar HP lain atau foto cetak.</span>
                                  </li>
                                  <li className="text-xs text-rose-700 flex items-start gap-1.5">
                                    <span className="text-rose-500 font-bold shrink-0">✖</span>
                                    <span>Posisi kepala miring atau keluar dari batas area.</span>
                                  </li>
                                </ul>
                              </div>
                            </div>

                            {/* Garis Bantu Warning & Checkbox Agreement */}
                            <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-4 space-y-3 mt-4">
                              <p className="text-xs text-amber-800 font-medium leading-relaxed flex items-start gap-2">
                                <AlertTriangle className="w-4.5 h-4.5 text-amber-600 shrink-0 mt-0.5" />
                                <span>
                                  <strong>PENTING:</strong> Wajah Anda wajib diposisikan pas di dalam <strong>Garis Bantu (Siluet)</strong> yang muncul di kamera nanti. Jika posisi wajah melenceng atau keluar garis bantu, sistem AI tidak akan merespons atau gagal melakukan deteksi liveness.
                                </span>
                              </p>
                              <label className="flex items-start gap-2.5 pt-3 border-t border-amber-200/50 cursor-pointer select-none">
                                <input
                                  type="checkbox"
                                  checked={guideChecked}
                                  onChange={(e) => setGuideChecked(e.target.checked)}
                                  className="rounded text-[#0B3A6A] focus:ring-[#0B3A6A] w-4.5 h-4.5 mt-0.5 shrink-0"
                                />
                                <span className="text-xs font-semibold text-slate-700 leading-snug">
                                  Saya memahami bahwa wajah harus disesuaikan dengan siluet garis bantu agar sistem deteksi wajah dapat mengenali saya.
                                </span>
                              </label>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex flex-col items-center gap-3">
                            {modelLoadError ? (
                              <div className="w-full space-y-3">
                                <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl p-4 leading-relaxed font-medium">
                                  <p className="font-bold mb-1 flex items-center gap-1.5 text-sm text-rose-700">
                                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                                    Gagal Memuat Model AI
                                  </p>
                                  {modelLoadError}
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => setRetryCount(prev => prev + 1)}
                                    className="px-6 py-3 bg-[#0B3A6A] hover:bg-[#082a4d] text-white flex-1 text-sm rounded-xl font-semibold shadow-md"
                                  >
                                    Coba Lagi
                                  </button>
                                  <button
                                    onClick={() => {
                                      setIsBypassed(true);
                                      setFaceModelLoaded(true);
                                      setReadyToSelfie(true);
                                    }}
                                    className="px-4 py-3 border border-slate-300 text-slate-600 rounded-xl text-xs font-semibold"
                                  >
                                    Lewati (Gunakan Kamera Biasa)
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <button
                                  onClick={() => setReadyToSelfie(true)}
                                  disabled={!faceModelLoaded || !guideChecked}
                                  className="w-full py-3.5 bg-[#0B3A6A] hover:bg-[#082a4d] text-white rounded-xl text-base font-semibold shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                  {!faceModelLoaded ? (
                                    <span className="flex items-center justify-center gap-2">
                                      <Loader2 className="w-5 h-5 animate-spin" />
                                      Memuat sistem deteksi wajah...
                                    </span>
                                  ) : (
                                    'Saya Sudah Siap Foto'
                                  )}
                                </button>
                                {!faceModelLoaded && (
                                  <p className="text-[11px] text-slate-400 text-center">Harap tunggu, model AI sedang diunduh dan diproses...</p>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {!capturedImage ? (
                    <div className="relative w-full max-w-sm aspect-[3/4] bg-slate-900 rounded-3xl overflow-hidden shadow-inner ring-4 ring-slate-100">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1]"
                      />
                      <canvas ref={canvasRef} className="hidden" />
                      
                      {/* Overlay Silhouette */}
                      <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-60">
                        <svg viewBox="0 0 100 100" className="w-full h-full absolute inset-0" preserveAspectRatio="none">
                          <path d="M50 15 C35 15 25 30 25 50 C25 70 35 75 50 75 C65 75 75 70 75 50 C75 30 65 15 50 15 Z" fill="none" stroke="white" strokeWidth="1.5" strokeDasharray="3 3" />
                          <path d="M15 100 C15 85 30 80 50 80 C70 80 85 85 85 100" fill="none" stroke="white" strokeWidth="1.5" strokeDasharray="3 3" />
                        </svg>
                      </div>

                      {isCameraActive && !isBypassed && (
                        <div className="absolute bottom-6 left-0 right-0 px-4 flex justify-center pointer-events-none">
                          <div className={`px-4 py-2.5 rounded-full text-xs sm:text-sm font-bold shadow-lg flex items-center gap-2 transition-all duration-300 ${livenessStatus === 'searching' ? 'bg-orange-500 text-white animate-bounce' :
                            livenessStatus === 'detected' ? 'bg-indigo-600 text-white animate-pulse' :
                              livenessStatus === 'smiling' ? 'bg-emerald-600 text-white animate-pulse' :
                                'bg-blue-600 text-white animate-pulse'
                            }`}>
                            {livenessStatus === 'searching' && (
                              <><Loader2 className="w-4 h-4 animate-spin" /> Mencari Wajah...</>
                            )}
                            {livenessStatus === 'detected' && (
                              <>👁 Silakan KEDIPKAN MATA</>
                            )}
                            {livenessStatus === 'right' && (
                              <>👉 Silakan HADAP KANAN</>
                            )}
                            {livenessStatus === 'left' && (
                              <>👈 Silakan HADAP KIRI</>
                            )}
                            {livenessStatus === 'smiling' && (
                              <><CheckCircle2 className="w-4 h-4 text-white animate-pulse" /> 😊 Silakan TERSENYUM</>
                            )}
                          </div>
                        </div>
                      )}

                      {isCameraActive && isBypassed && (
                        <div className="absolute bottom-6 left-0 right-0 px-4 flex justify-center z-10">
                          <button
                            onClick={capturePhoto}
                            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg flex items-center gap-2 rounded-full font-semibold pointer-events-auto transition-transform hover:scale-105"
                          >
                            <Camera className="w-4 h-4" /> Ambil Foto Sekarang
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="relative w-full max-w-sm aspect-[3/4] bg-slate-900 rounded-3xl overflow-hidden shadow-inner ring-4 ring-slate-100">
                      <img
                        src={capturedImage}
                        alt="Hasil Foto Selfie"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-between p-6">
                        <button
                          onClick={() => {
                            setCapturedImage(null);
                            startCamera();
                          }}
                          className="px-4 py-2 border border-white/30 bg-white/20 hover:bg-white/30 text-white rounded-xl backdrop-blur-md text-sm font-semibold transition-colors flex items-center gap-2"
                        >
                          <RefreshCw className="w-4 h-4" /> Ulangi
                        </button>
                      </div>
                    </div>
                  )}

                  {(isCameraActive || capturedImage) && (
                    <div className="max-w-sm w-full bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-2.5 items-start mt-4 shadow-sm">
                      <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-xs text-amber-800">⚠ Peringatan Anti-Pemalsuan Foto</p>
                        <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                          Sistem mendeteksi dan memblokir wajah dari foto cetak/layar HP. Segala bentuk pemalsuan akan mengakibatkan <strong>diskualifikasi permanen</strong>.
                        </p>
                      </div>
                    </div>
                  )}

                  {cameraError && (
                    <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2 max-w-sm">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                      <span>{cameraError}</span>
                    </div>
                  )}
                </div>

                {error && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs font-bold text-rose-800 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentStep(1);
                      stopCamera();
                    }}
                    className="py-3.5 px-6 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl shadow-sm transition-all flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" /> Kembali
                  </button>
                  <button
                    type="button"
                    disabled={!capturedImage}
                    onClick={() => {
                      validateAndNextStep();
                      stopCamera();
                    }}
                    className="py-3.5 px-6 bg-[#0B3A6A] hover:bg-[#082a4d] text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    Lanjut Isi Data Diri <ArrowRight className="w-4 h-4" />
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
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">
                        Tempat Lahir *
                      </label>
                      <input
                        type="text"
                        required
                        value={tempatLahir}
                        onChange={(e) => setTempatLahir(e.target.value)}
                        placeholder="Contoh: Kendari"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B3A6A] transition-all text-slate-900 font-normal placeholder:font-normal placeholder:text-slate-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">
                        Tanggal Lahir *
                      </label>
                      <input
                        type="date"
                        required
                        value={tanggalLahir}
                        onChange={(e) => setTanggalLahir(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B3A6A] transition-all text-slate-900 font-normal"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">
                        Gender *
                      </label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B3A6A] transition-all text-slate-900 font-normal"
                      >
                        <option value="Laki-laki">Laki-laki</option>
                        <option value="Perempuan">Perempuan</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">
                        Nomor Telepon/WA *
                      </label>
                      <input
                        type="text"
                        required
                        value={noHp}
                        onChange={(e) => setNoHp(e.target.value)}
                        placeholder="+62 8..."
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B3A6A] transition-all text-slate-900 font-normal placeholder:font-normal placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">
                      Status Pernikahan *
                    </label>
                    <select
                      value={statusPernikahan}
                      onChange={(e) => setStatusPernikahan(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B3A6A] transition-all text-slate-900 font-normal"
                    >
                      <option value="Belum Menikah">Belum Menikah</option>
                      <option value="Menikah">Menikah</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">
                      Alamat Domisili *
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={alamatDomisili}
                      onChange={(e) => setAlamatDomisili(e.target.value)}
                      placeholder="Masukkan alamat lengkap RT/RW, Kelurahan, Kecamatan"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B3A6A] transition-all text-slate-900 font-normal placeholder:font-normal placeholder:text-slate-400 resize-none"
                    ></textarea>
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs font-bold text-rose-800 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

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
                    onClick={validateAndNextStep}
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
                            className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-base text-slate-700 font-normal focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B3A6A] transition-all"
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
                            className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-base text-slate-700 font-normal focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B3A6A] transition-all placeholder:text-slate-400 placeholder:font-normal"
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
                            className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-base text-slate-700 font-normal focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B3A6A] transition-all placeholder:text-slate-400 placeholder:font-normal"
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
                            className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-base text-slate-700 font-normal focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B3A6A] transition-all placeholder:text-slate-400 placeholder:font-normal"
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
                            className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-base text-slate-700 font-normal focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B3A6A] transition-all placeholder:text-slate-400 placeholder:font-normal"
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

                {error && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs font-bold text-rose-800 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

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
                    onClick={validateAndNextStep}
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
                    disabled={loading}
                    className="px-8 py-3.5 bg-[#0B3A6A] hover:bg-[#082a4d] disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-extrabold rounded-xl shadow-lg text-sm transition-all flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" /> Sedang Memproses...
                      </>
                    ) : (
                      <>
                        Daftar Akun Sekarang <ArrowRight className="w-5 h-5" />
                      </>
                    )}
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
                <span>NIK:</span>
                <span className="font-semibold text-slate-800">{nik || '-'}</span>
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
