'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  Loader2,
  PenTool,
  RotateCcw,
  Eraser,
  X
} from 'lucide-react';
import { fetchAPI, getUser } from '@/lib/api';
import { parseAchievementString, formatAchievementItems, DynamicAchievementItem } from '@/lib/achievementHelpers';
import DynamicAchievementBlock from '@/components/DynamicAchievementBlock';

export default function RegistrationPage() {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [registrationCode, setRegistrationCode] = useState<string>('');
  const [loadingProfile, setLoadingProfile] = useState<boolean>(true);

  // 5 Categories Dynamic State
  const [prestasiAkademikList, setPrestasiAkademikList] = useState<DynamicAchievementItem[]>([]);
  const [prestasiNonAkademikList, setPrestasiNonAkademikList] = useState<DynamicAchievementItem[]>([]);
  const [pengalamanOrganisasiList, setPengalamanOrganisasiList] = useState<DynamicAchievementItem[]>([]);
  const [pengalamanPengabdianList, setPengalamanPengabdianList] = useState<DynamicAchievementItem[]>([]);
  const [pelatihanSertifikasiList, setPelatihanSertifikasiList] = useState<DynamicAchievementItem[]>([]);

  // Signature Canvas State & Refs
  const [showSignatureModal, setShowSignatureModal] = useState<boolean>(false);
  const [signatureDataUrl, setSignatureDataUrl] = useState<string>('');
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [hasDrawnSignature, setHasDrawnSignature] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Canvas drawing handlers — accurately scaled with display bounds to prevent offset
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = rect.width > 0 ? canvas.width / rect.width : 1;
    const scaleY = rect.height > 0 ? canvas.height / rect.height : 1;

    if ('touches' in e && e.touches.length > 0) {
      const touch = e.touches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY
      };
    }
    const mouseEvent = e as React.MouseEvent<HTMLCanvasElement>;
    return {
      x: (mouseEvent.clientX - rect.left) * scaleX,
      y: (mouseEvent.clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { x, y } = getCanvasCoords(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setHasDrawnSignature(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { x, y } = getCanvasCoords(e);
    ctx.lineTo(x, y);
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawnSignature(false);
  };

  // Form State (Real empty defaults, automatically populated from Backend API)
  const [formData, setFormData] = useState({
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
    smaNama: '',
    smaJurusan: '',
    smaTahunLulus: '',
    s1Nama: '',
    s1Jurusan: '',
    s1TahunLulus: '',
    s2Nama: '',
    s2Jurusan: '',
    s2TahunLulus: '',
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
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const [isProfileLoaded, setIsProfileLoaded] = useState<boolean>(false);

  const formatAsalDaerah = (asal: string) => {
    if (!asal) return '-';
    return asal.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
  };

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
          const edus = res.data.education || [];

          const sma = edus.find((e: any) => e.tingkat === 'SMA') || {};
          const s1 = edus.find((e: any) => e.tingkat === 'S1') || {};
          const s2 = edus.find((e: any) => e.tingkat === 'S2') || {};
          const currentJenjang = u.jenjangTarget || 'S1';

          if (p.signatureData) {
            setSignatureDataUrl(p.signatureData);
            setHasDrawnSignature(true);
          }

          if (app) {
            setRegistrationCode(app.registrationNo);
            setIsSubmitted(true);
          }

          const selfieDoc = docs.find((d: any) => d.docType === 'selfie');
          const ktmDoc = docs.find((d: any) => d.docType === 'ktm');
          const ktpDoc = docs.find((d: any) => d.docType === 'ktp' || d.docType === 'pendukung');
          const suratPermohonanDoc = docs.find((d: any) => d.docType === 'surat_permohonan');
          const transkripDoc = docs.find((d: any) => d.docType === 'transkrip');
          const dtksDoc = docs.find((d: any) => d.docType === 'dtks');
          const suratPernyataanDoc = docs.find((d: any) => d.docType === 'surat_pernyataan');
          const esaiDoc = docs.find((d: any) => d.docType === 'esai');

          let regDraft: any = null;
          try {
            const rd = localStorage.getItem('bssc_register_draft');
            if (rd) regDraft = JSON.parse(rd);
          } catch (e) {}

          const cachedUser = getUser();

          let initialData = {
            namaLengkap: u.namaLengkap || cachedUser?.namaLengkap || regDraft?.namaLengkap || '',
            nik: u.nik || cachedUser?.nik || regDraft?.nimNik || '',
            email: u.email || cachedUser?.email || regDraft?.email || '',
            jenjang: currentJenjang || cachedUser?.jenjangTarget || regDraft?.jenjangTarget || 'S1',
            tempatLahir: p.tempatLahir || regDraft?.tempatLahir || '',
            tanggalLahir: p.tanggalLahir ? String(p.tanggalLahir).split('T')[0] : (regDraft?.tanggalLahir || ''),
            jenisKelamin: p.gender || regDraft?.gender || 'Laki-laki',
            noHp: p.noHp || regDraft?.noHp || '',
            alamatDomisili: p.alamatDomisili || p.alamat_domisili || regDraft?.alamatDomisili || '',
            alamatKtp: p.alamatKtp || p.alamat_ktp || '',
            noKk: p.noKk || '',
            akreditasiProdi: p.akreditasiProdi || 'Baik Sekali',
            nim: p.nim || '',
            semester: p.semester || 3,
            ipk: p.ipk || '',
            targetLulus: p.targetLulus || '',
            beasiswaLain: p.beasiswaLain || 'Tidak Ada',
            smaNama: sma.institusi || p.smaNama || regDraft?.smaNama || '',
            smaJurusan: sma.jurusan || p.smaJurusan || regDraft?.smaJurusan || '',
            smaTahunLulus: sma.tahun_lulus ? String(sma.tahun_lulus) : (sma.tahunLulus ? String(sma.tahunLulus) : (p.smaTahunLulus || regDraft?.smaTahunLulus || '')),
            s1Nama: (currentJenjang === 'S2' || currentJenjang === 'S3') ? (s1.institusi || p.s1Nama || regDraft?.s1Nama || '') : '',
            s1Jurusan: (currentJenjang === 'S2' || currentJenjang === 'S3') ? (s1.jurusan || p.s1Jurusan || regDraft?.s1Jurusan || '') : '',
            s1TahunLulus: (currentJenjang === 'S2' || currentJenjang === 'S3') ? (s1.tahun_lulus ? String(s1.tahun_lulus) : (s1.tahunLulus ? String(s1.tahunLulus) : (p.s1TahunLulus || regDraft?.s1TahunLulus || ''))) : '',
            s2Nama: s2.institusi || p.s2Nama || regDraft?.s2Nama || '',
            s2Jurusan: s2.jurusan || p.s2Jurusan || regDraft?.s2Jurusan || '',
            s2TahunLulus: s2.tahun_lulus ? String(s2.tahun_lulus) : (s2.tahunLulus ? String(s2.tahunLulus) : (p.s2TahunLulus || regDraft?.s2TahunLulus || '')),
            perguruanTinggi: p.perguruanTinggi || p.institusi || (currentJenjang === 'S3' ? edus.find((e: any) => e.tingkat === 'S3')?.institusi : currentJenjang === 'S2' ? s2.institusi : s1.institusi) || regDraft?.perguruanTinggi || cachedUser?.institusi || '',
            fakultasProdi: p.fakultasProdi || p.jurusan || (currentJenjang === 'S3' ? edus.find((e: any) => e.tingkat === 'S3')?.jurusan : currentJenjang === 'S2' ? s2.jurusan : s1.jurusan) || p.prodiPrioritas || regDraft?.prodi || cachedUser?.jurusan || '',
            namaAyah: p.namaAyah || p.nama_ayah || '',
            pekerjaanAyah: p.pekerjaanAyah || p.pekerjaan_ayah || '',
            namaIbu: p.namaIbu || p.nama_ibu || '',
            pekerjaanIbu: p.pekerjaanIbu || p.pekerjaan_ibu || '',
            penghasilanOrtu: p.penghasilanOrtu || p.penghasilan_ortu || '< Rp 1.500.000',
            jumlahTanggungan: p.jumlahTanggungan ? String(p.jumlahTanggungan) : '3',
            kepemilikanBantuan: p.kepemilikanBantuan || p.kepemilikan_bantuan || 'Tidak Ada',
            prestasiAkademik: p.prestasiAkademik || p.prestasi_akademik || '',
            prestasiNonAkademik: p.prestasiNonAkademik || p.prestasi_non_akademik || '',
            pengalamanOrganisasi: p.pengalamanOrganisasi || p.pengalaman_organisasi || '',
            pengalamanPengabdian: p.pengalamanPengabdian || p.pengalaman_pengabdian || '',
            pelatihanSertifikasi: p.pelatihanSertifikasi || p.pelatihan_sertifikasi || '',
            filePasfoto: selfieDoc ? selfieDoc.originalName : '',
            fileSuratAktif: ktmDoc ? ktmDoc.originalName : '',
            fileKtp: ktpDoc ? ktpDoc.originalName : '',
            fileSuratPermohonan: suratPermohonanDoc ? suratPermohonanDoc.originalName : '',
            fileTranskrip: transkripDoc ? transkripDoc.originalName : '',
            fileDtks: dtksDoc ? dtksDoc.originalName : '',
            fileSuratPernyataan: suratPernyataanDoc ? suratPernyataanDoc.originalName : '',
            fileMotivationOrEsai: esaiDoc ? esaiDoc.originalName : '',
          };

          // Restore draft if exists and application is not submitted
          if (!app) {
            try {
              const savedDraft = localStorage.getItem('bssc_application_draft');
              if (savedDraft) {
                const draft = JSON.parse(savedDraft);
                if (draft.currentStep && draft.currentStep > 1) {
                  setCurrentStep(draft.currentStep);
                }
                if (draft.formData) {
                  Object.keys(draft.formData).forEach((key) => {
                    const draftVal = draft.formData[key];
                    if (draftVal !== undefined && draftVal !== null && draftVal !== '') {
                      (initialData as any)[key] = draftVal;
                    }
                  });
                }
                if (draft.signatureDataUrl) {
                  setSignatureDataUrl(draft.signatureDataUrl);
                  setHasDrawnSignature(true);
                }
              }
            } catch (e) {
              console.warn('Failed to load application draft:', e);
            }
          }

          setFormData(prev => ({ ...prev, ...initialData }));

          // Initialize dynamic achievement lists
          setPrestasiAkademikList(parseAchievementString(initialData.prestasiAkademik));
          setPrestasiNonAkademikList(parseAchievementString(initialData.prestasiNonAkademik));
          setPengalamanOrganisasiList(parseAchievementString(initialData.pengalamanOrganisasi));
          setPengalamanPengabdianList(parseAchievementString(initialData.pengalamanPengabdian));
          setPelatihanSertifikasiList(parseAchievementString(initialData.pelatihanSertifikasi));
        }
      } catch (err: any) {
        console.warn('Profile fetch warning:', err.message);
      } finally {
        setLoadingProfile(false);
        setIsProfileLoaded(true);
      }
    }
    loadUserProfile();
  }, []);

  // Auto-save application draft to localStorage whenever form data or step changes
  useEffect(() => {
    if (!isProfileLoaded || isSubmitted) return;
    try {
      const draft = {
        currentStep,
        formData,
        signatureDataUrl
      };
      localStorage.setItem('bssc_application_draft', JSON.stringify(draft));
    } catch (e) {
      console.warn('Failed to save application draft:', e);
    }
  }, [isProfileLoaded, isSubmitted, currentStep, formData, signatureDataUrl]);

  const handleDocumentUpload = async (docKey: string, docType: string, file: File) => {
    setUploadingDocKey(docKey);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append(docType, file);
      const res = await fetchAPI(`/applicant/upload/${docType}`, {
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

  const handleOpenSignatureModal = () => {
    // Validate required fields
    const requiredFields = [
      { key: 'namaLengkap', name: 'Nama Lengkap (Tahap 2)' },
      { key: 'tempatLahir', name: 'Tempat Lahir (Tahap 2)' },
      { key: 'tanggalLahir', name: 'Tanggal Lahir (Tahap 2)' },
      { key: 'nik', name: 'NIK (Tahap 2)' },
      { key: 'noKk', name: 'No. KK (Tahap 2)' },
      { key: 'alamatKtp', name: 'Alamat KTP (Tahap 2)' },
      { key: 'alamatDomisili', name: 'Alamat Domisili (Tahap 2)' },
      { key: 'noHp', name: 'No. HP (Tahap 2)' },
      { key: 'perguruanTinggi', name: 'Perguruan Tinggi (Tahap 3)' },
      { key: 'fakultasProdi', name: 'Fakultas / Prodi (Tahap 3)' },
      { key: 'nim', name: 'NIM (Tahap 3)' },
      { key: 'ipk', name: 'IPK Kumulatif (Tahap 3)' },
      { key: 'targetLulus', name: 'Target Tahun Lulus (Tahap 3)' },
      { key: 'smaNama', name: 'Nama SMA/SMK (Tahap 4)' },
      ...(formData.jenjang === 'S2' || formData.jenjang === 'S3' ? [{ key: 's1Nama', name: 'Nama PT S1 (Tahap 4)' }] : []),
      ...(formData.jenjang === 'S3' ? [{ key: 's2Nama', name: 'Nama PT S2 (Tahap 4)' }] : []),
      { key: 'namaAyah', name: 'Nama Ayah (Tahap 5)' },
      { key: 'namaIbu', name: 'Nama Ibu (Tahap 5)' },
      { key: 'fileSuratPermohonan', name: 'Dokumen: Surat Permohonan (Tahap 7)' },
      { key: 'filePasfoto', name: 'Dokumen: Pasfoto/Selfie (Tahap 7)' },
      { key: 'fileKtp', name: 'Dokumen: KTP (Tahap 7)' },
      { key: 'fileSuratAktif', name: 'Dokumen: Surat Aktif Kuliah (Tahap 7)' },
      { key: 'fileTranskrip', name: 'Dokumen: Transkrip Nilai (Tahap 7)' },
      { key: 'fileDtks', name: 'Dokumen: Syarat ke-6 (Tahap 7)' },
      { key: 'fileSuratPernyataan', name: 'Dokumen: Surat Pernyataan (Tahap 7)' },
      { key: 'fileMotivationOrEsai', name: 'Dokumen: Motivation Letter/Esai (Tahap 7)' }
    ];

    const missingFields = requiredFields.filter(f => {
      const val = (formData as any)[f.key];
      return !val || (typeof val === 'string' && val.trim() === '');
    });

    if (missingFields.length > 0) {
      setValidationErrors(missingFields.map(f => f.name));
      return;
    }

    // Open Signature Modal
    setShowSignatureModal(true);
  };

  const handleConfirmSignatureAndSubmit = async () => {
    let sigUrl = signatureDataUrl;
    if (canvasRef.current && hasDrawnSignature) {
      sigUrl = canvasRef.current.toDataURL('image/png');
      setSignatureDataUrl(sigUrl);
    }
    setShowSignatureModal(false);
    await executeFinalSubmit(sigUrl);
  };

  const executeFinalSubmit = async (finalSignatureUrl?: string) => {
    const sigToSave = finalSignatureUrl || signatureDataUrl;
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
          noKk: formData.noKk,
          alamatKtp: formData.alamatKtp,
          akreditasiProdi: formData.akreditasiProdi,
          nim: formData.nim,
          semester: formData.semester,
          ipk: formData.ipk,
          targetLulus: formData.targetLulus,
          beasiswaLain: formData.beasiswaLain,
          namaAyah: formData.namaAyah,
          pekerjaanAyah: formData.pekerjaanAyah,
          namaIbu: formData.namaIbu,
          pekerjaanIbu: formData.pekerjaanIbu,
          penghasilanOrtu: formData.penghasilanOrtu,
          jumlahTanggungan: formData.jumlahTanggungan,
          kepemilikanBantuan: formData.kepemilikanBantuan,
          prestasiAkademik: formatAchievementItems(prestasiAkademikList),
          prestasiNonAkademik: formatAchievementItems(prestasiNonAkademikList),
          pengalamanOrganisasi: formatAchievementItems(pengalamanOrganisasiList),
          pengalamanPengabdian: formatAchievementItems(pengalamanPengabdianList),
          pelatihanSertifikasi: formatAchievementItems(pelatihanSertifikasiList),
          prodiPrioritas: formData.fakultasProdi,
          signatureData: sigToSave
        }),
      });

      // 1.5 Update Education History
      const educationList: any[] = [];
      if (formData.smaNama) {
        educationList.push({
          tingkat: 'SMA',
          institusi: formData.smaNama,
          jurusan: formData.smaJurusan || null,
          tahunLulus: formData.smaTahunLulus || null
        });
      }
      if ((formData.jenjang === 'S2' || formData.jenjang === 'S3') && formData.s1Nama) {
        educationList.push({
          tingkat: 'S1',
          institusi: formData.s1Nama,
          jurusan: formData.s1Jurusan || null,
          tahunLulus: formData.s1TahunLulus || null
        });
      }
      if (formData.jenjang === 'S3' && formData.s2Nama) {
        educationList.push({
          tingkat: 'S2',
          institusi: formData.s2Nama,
          jurusan: formData.s2Jurusan || null,
          tahunLulus: formData.s2TahunLulus || null
        });
      }
      if (formData.perguruanTinggi) {
        educationList.push({
          tingkat: formData.jenjang || 'S1',
          institusi: formData.perguruanTinggi,
          jurusan: formData.fakultasProdi || null
        });
      }

      await fetchAPI('/applicant/education', {
        method: 'PUT',
        body: JSON.stringify({ educationList }),
      });

      // 2. Submit Application
      const res = await fetchAPI('/applicant/application', {
        method: 'POST',
        body: JSON.stringify({ catatanTambahan: `Permohonan Beasiswa ${formData.jenjang}` }),
      });

      if (res.success && res.data) {
        try {
          localStorage.removeItem('bssc_application_draft');
        } catch (e) {}
        setRegistrationCode(res.data.registrationNo);
        setIsSubmitted(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err: any) {
      alert(err.message || 'Gagal mengirim permohonan beasiswa.');
    }
  };

  return (
    <div className="relative">
      <div className="pb-8 sm:pb-10 max-w-7xl mx-auto print:hidden w-full">
        {/* Page Header */}
        <div className="max-w-3xl mx-auto text-center space-y-1.5 sm:space-y-2 mb-6 sm:mb-10 px-2">
          <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
            Pendaftaran Beasiswa Stimulan Sultra Cerdas 2026
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
            Lengkapi 8 tahap isian formulir di bawah ini secara akurat sesuai dokumen kependudukan & akademik resmi.
          </p>
        </div>

        {!isSubmitted ? (
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm overflow-hidden w-full">
            {/* Steps Progress Header Bar */}
            <div className="bg-slate-900 text-white p-3.5 sm:p-6">
              {/* Mobile View Progress Header */}
              <div className="sm:hidden space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-400 tracking-wider uppercase">
                    LANGKAH {currentStep} DARI {steps.length}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-300 bg-slate-800 px-2.5 py-0.5 rounded-full">
                    {Math.round((currentStep / steps.length) * 100)}% Selesai
                  </span>
                </div>

                <div className="text-sm font-bold text-white flex items-center gap-2 truncate">
                  {React.createElement(steps[currentStep - 1].icon, { className: "w-4 h-4 text-blue-400 shrink-0" })}
                  <span className="truncate">Tahap {currentStep}: {steps[currentStep - 1].title}</span>
                </div>

                {/* Progress Bar Fill */}
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-full transition-all duration-300 ease-out rounded-full"
                    style={{ width: `${(currentStep / steps.length) * 100}%` }}
                  ></div>
                </div>

                {/* Mobile Horizontal Step Selector Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-0.5 scrollbar-none -mx-1 px-1">
                  {steps.map((step) => {
                    const isCurrent = step.id === currentStep;
                    const isDone = step.id < currentStep;
                    return (
                      <button
                        key={step.id}
                        type="button"
                        onClick={() => {
                          if (step.id < currentStep) setCurrentStep(step.id);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap shrink-0 transition-all flex items-center gap-1 ${
                          isCurrent
                            ? 'bg-blue-600 text-white shadow-xs'
                            : isDone
                            ? 'bg-blue-950/80 text-blue-300 hover:bg-blue-900'
                            : 'bg-slate-800/60 text-slate-400 opacity-60'
                        }`}
                      >
                        <span>{step.id}. {step.title}</span>
                        {isDone && <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Desktop View Horizontal Stepper */}
              <div className="hidden sm:block overflow-x-auto overflow-y-hidden no-scrollbar py-3 px-1">
                <div className="flex items-center justify-between min-w-[700px] px-1">
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
                            ? 'text-white'
                            : isDone
                            ? 'text-blue-400 hover:text-white'
                            : 'text-slate-500 opacity-60'
                        }`}
                      >
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs border transition-all ${
                            isCurrent
                              ? 'bg-blue-600 border-blue-400 text-white shadow-md scale-105'
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
            </div>

            {/* Step Body Content */}
            <div className="p-4 sm:p-10 space-y-6 sm:space-y-8">
              {/* STEP 1: JENJANG */}
              {currentStep === 1 && (
                <div className="space-y-6 max-w-3xl mx-auto">
                  <div className="border-b border-slate-100 pb-4">
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900">Tahap 1: Kategori Jenjang Studi</h2>
                    <p className="text-xs text-slate-500">Jenjang studi dikunci sesuai dengan pilihan saat pendaftaran akun.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                    {[
                      { id: 'S1', label: 'S1 / D4', range: 'Semester 3 - 5', doc: 'Motivation Letter', ipk: 'Min 3.25' },
                      { id: 'S2', label: 'S2 (Magister)', range: 'Semester 2 - 3', doc: 'Esai Kontribusi', ipk: 'Min 3.50' },
                      { id: 'S3', label: 'S3 (Doktor)', range: 'Semester 2 - 5', doc: 'Esai Kontribusi', ipk: 'Min 3.50' }
                    ].map((item) => (
                      <div
                        key={item.id}
                        className={`p-4 sm:p-5 rounded-2xl border-2 transition-all space-y-3 ${
                          formData.jenjang === item.id
                            ? 'bg-blue-50/70 border-blue-900 shadow-sm'
                            : 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-slate-900 text-base sm:text-lg">{item.label}</span>
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

                  <div className="bg-slate-50 p-3.5 sm:p-4 rounded-xl border border-slate-200 flex items-start gap-2.5 sm:gap-3">
                    <input
                      type="checkbox"
                      id="agreeRange"
                      checked={formData.agreedSemesterRange}
                      onChange={(e) => handleInputChange('agreedSemesterRange', e.target.checked)}
                      className="mt-1 rounded text-blue-900 focus:ring-blue-900 shrink-0"
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
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900">Tahap 2: Data Diri Pendaftar</h2>
                    <p className="text-xs text-slate-500">Isikan data pribadi persis sesuai KTP/KTM resmi.</p>
                  </div>

                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-emerald-900 shadow-sm">
                    <div className="flex items-start sm:items-center gap-3">
                      <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5 sm:mt-0" />
                      <div>
                        <span className="font-bold text-emerald-950 block">Data Terisi Otomatis</span>
                        <span className="text-emerald-700 text-[11px] leading-relaxed block sm:inline">Identitas diri telah disinkronkan langsung dari verifikasi pendaftaran akun Anda.</span>
                      </div>
                    </div>
                    <span className="text-[10px] bg-emerald-600 text-white font-bold px-2.5 py-1 rounded-full shrink-0 shadow-sm">
                      ✓ Auto-Filled
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 text-xs font-medium text-slate-700">
                    <div className="sm:col-span-2">
                      <label className="block mb-1 text-xs font-medium text-slate-700">Nama Lengkap (Sesuai KTP / KTM)</label>
                      <input
                        type="text"
                        value={formData.namaLengkap}
                        onChange={(e) => handleInputChange('namaLengkap', e.target.value)}
                        placeholder="Contoh: Muhammad Rezky Pratama"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-normal text-slate-900 placeholder:font-normal placeholder:text-slate-400 focus:ring-2 focus:ring-blue-900 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block mb-1 text-xs font-medium text-slate-700">Tempat Lahir</label>
                      <input
                        type="text"
                        value={formData.tempatLahir}
                        onChange={(e) => handleInputChange('tempatLahir', e.target.value)}
                        placeholder="Kendari"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-normal text-slate-900 placeholder:font-normal placeholder:text-slate-400 focus:ring-2 focus:ring-blue-900 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block mb-1 text-xs font-medium text-slate-700">Tanggal Lahir</label>
                      <input
                        type="date"
                        value={formData.tanggalLahir}
                        onChange={(e) => handleInputChange('tanggalLahir', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-normal text-slate-900 focus:ring-2 focus:ring-blue-900 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block mb-1 text-xs font-medium text-slate-700">Jenis Kelamin</label>
                      <select
                        value={formData.jenisKelamin}
                        onChange={(e) => handleInputChange('jenisKelamin', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-normal text-slate-900 focus:ring-2 focus:ring-blue-900 focus:outline-none"
                      >
                        <option value="Laki-laki">Laki-laki</option>
                        <option value="Perempuan">Perempuan</option>
                      </select>
                    </div>

                    <div>
                      <label className="block mb-1 text-xs font-medium text-slate-700">NIK (Nomor Induk Kependudukan - 16 Digit)</label>
                      <input
                        type="text"
                        maxLength={16}
                        value={formData.nik}
                        onChange={(e) => handleInputChange('nik', e.target.value.replace(/\D/g, '').slice(0, 16))}
                        placeholder="740102..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-normal text-slate-900 placeholder:font-normal placeholder:text-slate-400 focus:ring-2 focus:ring-blue-900 focus:outline-none font-mono tracking-wider"
                      />
                    </div>

                    <div>
                      <label className="block mb-1 text-xs font-medium text-slate-700">No. Kartu Keluarga (KK)</label>
                      <input
                        type="text"
                        maxLength={16}
                        value={formData.noKk}
                        onChange={(e) => handleInputChange('noKk', e.target.value.replace(/\D/g, '').slice(0, 16))}
                        placeholder="740102..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-normal text-slate-900 placeholder:font-normal placeholder:text-slate-400 focus:ring-2 focus:ring-blue-900 focus:outline-none font-mono tracking-wider"
                      />
                    </div>

                    <div>
                      <label className="block mb-1 text-xs font-medium text-slate-700">Asal Daerah (Kabupaten / Kota SULTRA)</label>
                      <select
                        value={formData.asalDaerah}
                        onChange={(e) => handleInputChange('asalDaerah', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-normal text-slate-900 focus:ring-2 focus:ring-blue-900 focus:outline-none"
                      >
                        {SULTRA_DISTRICTS.map((d) => (
                          <option key={d.code} value={d.code}>
                            {d.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block mb-1 text-xs font-medium text-slate-700">Alamat Sesuai KTP</label>
                      <textarea
                        rows={2}
                        value={formData.alamatKtp}
                        onChange={(e) => handleInputChange('alamatKtp', e.target.value)}
                        placeholder="Jl. Ahmad Yani No. 45, Kendari..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-normal text-slate-900 placeholder:font-normal placeholder:text-slate-400 focus:ring-2 focus:ring-blue-900 focus:outline-none"
                      ></textarea>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block mb-1 text-xs font-medium text-slate-700">Alamat Domisili Saat Ini</label>
                      <textarea
                        rows={2}
                        value={formData.alamatDomisili}
                        onChange={(e) => handleInputChange('alamatDomisili', e.target.value)}
                        placeholder="Sama dengan KTP atau Alamat Kost/Kontrakan..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-normal text-slate-900 placeholder:font-normal placeholder:text-slate-400 focus:ring-2 focus:ring-blue-900 focus:outline-none"
                      ></textarea>
                    </div>

                    <div>
                      <label className="block mb-1 text-xs font-medium text-slate-700">No. HP / WhatsApp Aktif</label>
                      <input
                        type="text"
                        value={formData.noHp}
                        onChange={(e) => handleInputChange('noHp', e.target.value)}
                        placeholder="081234567890"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-normal text-slate-900 placeholder:font-normal placeholder:text-slate-400 focus:ring-2 focus:ring-blue-900 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block mb-1 text-xs font-medium text-slate-700">Alamat Email Aktif</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="nama@email.com"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-normal text-slate-900 placeholder:font-normal placeholder:text-slate-400 focus:ring-2 focus:ring-blue-900 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: DATA AKADEMIK */}
              {currentStep === 3 && (
                <div className="space-y-6 max-w-4xl mx-auto">
                  <div className="border-b border-slate-100 pb-4">
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900">Tahap 3: Data Akademik Saat Ini (Ongoing)</h2>
                    <p className="text-xs text-slate-500">Informasi perguruan tinggi, program studi, dan IPK kumulatif.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 text-xs font-medium text-slate-700">
                    <div className="sm:col-span-2">
                      <label className="block mb-1 font-semibold">Nama Perguruan Tinggi (PTN / PTS)</label>
                      <input
                        type="text"
                        value={formData.perguruanTinggi}
                        onChange={(e) => handleInputChange('perguruanTinggi', e.target.value)}
                        placeholder="Universitas Halu Oleo / Universitas 19 November Kolaka..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-base sm:text-sm focus:ring-2 focus:ring-blue-900 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block mb-1 font-semibold">Fakultas / Program Studi</label>
                      <input
                        type="text"
                        value={formData.fakultasProdi}
                        onChange={(e) => handleInputChange('fakultasProdi', e.target.value)}
                        placeholder="Fakultas Teknik / Teknik Sipil"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-base sm:text-sm focus:ring-2 focus:ring-blue-900 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block mb-1 font-semibold">Akreditasi Prodi (Minimal Baik Sekali)</label>
                      <select
                        value={formData.akreditasiProdi}
                        onChange={(e) => handleInputChange('akreditasiProdi', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-base sm:text-sm focus:ring-2 focus:ring-blue-900 focus:outline-none"
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
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-base sm:text-sm focus:ring-2 focus:ring-blue-900 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block mb-1 font-semibold">Semester Saat Ini</label>
                      <select
                        value={formData.semester}
                        onChange={(e) => handleInputChange('semester', parseInt(e.target.value))}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-base sm:text-sm focus:ring-2 focus:ring-blue-900 focus:outline-none"
                      >
                        {(formData.jenjang === 'S1' ? [3, 4, 5] : formData.jenjang === 'S2' ? [2, 3] : [2, 3, 4, 5]).map((s) => (
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
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-base sm:text-sm focus:ring-2 focus:ring-blue-900 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block mb-1 font-semibold">Target Lulus (Perkiraan Tahun)</label>
                      <input
                        type="text"
                        value={formData.targetLulus}
                        onChange={(e) => handleInputChange('targetLulus', e.target.value)}
                        placeholder="2027"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-base sm:text-sm focus:ring-2 focus:ring-blue-900 focus:outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block mb-1 font-semibold">Status Penerima Beasiswa Lain</label>
                      <input
                        type="text"
                        value={formData.beasiswaLain}
                        onChange={(e) => handleInputChange('beasiswaLain', e.target.value)}
                        placeholder="Wajib 'Tidak Ada' (Jika menerima sebutkan nama beasiswa)"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-base sm:text-sm focus:ring-2 focus:ring-blue-900 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: RIWAYAT PENDIDIKAN */}
              {currentStep === 4 && (
                <div className="space-y-6 max-w-4xl mx-auto">
                  <div className="border-b border-slate-100 pb-4">
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900">Tahap 4: Riwayat Pendidikan Sebelumnya</h2>
                    <p className="text-xs text-slate-500">
                      {formData.jenjang === 'S3'
                        ? 'Isikan riwayat pendidikan SMA/SMK, S1, dan S2.'
                        : formData.jenjang === 'S2'
                        ? 'Isikan riwayat pendidikan SMA/SMK dan S1.'
                        : 'Isikan riwayat pendidikan SMA/SMK.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 text-xs font-medium text-slate-700">
                    {/* SMA / SMK (Shown for all jenjang) */}
                    {/* SMA / SMK (Shown for all jenjang) */}
                    <div>
                      <label className="block mb-1 font-semibold">SMA / SMK / MA (Nama Sekolah)</label>
                      <input
                        type="text"
                        value={formData.smaNama}
                        onChange={(e) => handleInputChange('smaNama', e.target.value)}
                        placeholder="SMAN 1 Kendari"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-base sm:text-sm focus:ring-2 focus:ring-blue-900 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 font-semibold">SMA / SMK / MA (Jurusan / Peminatan)</label>
                      <input
                        type="text"
                        value={formData.smaJurusan}
                        onChange={(e) => handleInputChange('smaJurusan', e.target.value)}
                        placeholder="MIPA / IPS / Kejuruan"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-base sm:text-sm focus:ring-2 focus:ring-blue-900 focus:outline-none"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block mb-1 font-semibold">SMA / SMK / MA (Tahun Lulus)</label>
                      <input
                        type="text"
                        value={formData.smaTahunLulus}
                        onChange={(e) => handleInputChange('smaTahunLulus', e.target.value)}
                        placeholder="2021"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-base sm:text-sm focus:ring-2 focus:ring-blue-900 focus:outline-none"
                      />
                    </div>

                    {/* S1 / D4 (Shown for S2 and S3) */}
                    {(formData.jenjang === 'S2' || formData.jenjang === 'S3') && (
                      <>
                        <div>
                          <label className="block mb-1 font-semibold">S1 / D4 (Nama Perguruan Tinggi)</label>
                          <input
                            type="text"
                            value={formData.s1Nama}
                            onChange={(e) => handleInputChange('s1Nama', e.target.value)}
                            placeholder="Universitas Halu Oleo"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-base sm:text-sm focus:ring-2 focus:ring-blue-900 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block mb-1 font-semibold">S1 / D4 (Program Studi / Jurusan)</label>
                          <input
                            type="text"
                            value={formData.s1Jurusan}
                            onChange={(e) => handleInputChange('s1Jurusan', e.target.value)}
                            placeholder="Teknik Informatika"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-base sm:text-sm focus:ring-2 focus:ring-blue-900 focus:outline-none"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block mb-1 font-semibold">S1 / D4 (Tahun Lulus)</label>
                          <input
                            type="text"
                            value={formData.s1TahunLulus}
                            onChange={(e) => handleInputChange('s1TahunLulus', e.target.value)}
                            placeholder="2024"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-base sm:text-sm focus:ring-2 focus:ring-blue-900 focus:outline-none"
                          />
                        </div>
                      </>
                    )}

                    {/* S2 / Magister (Shown for S3) */}
                    {formData.jenjang === 'S3' && (
                      <>
                        <div>
                          <label className="block mb-1 font-semibold">S2 / Magister (Nama Perguruan Tinggi)</label>
                          <input
                            type="text"
                            value={formData.s2Nama}
                            onChange={(e) => handleInputChange('s2Nama', e.target.value)}
                            placeholder="Universitas Gadjah Mada"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-base sm:text-sm focus:ring-2 focus:ring-blue-900 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block mb-1 font-semibold">S2 / Magister (Program Studi)</label>
                          <input
                            type="text"
                            value={formData.s2Jurusan}
                            onChange={(e) => handleInputChange('s2Jurusan', e.target.value)}
                            placeholder="Magister Ilmu Komputer"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-base sm:text-sm focus:ring-2 focus:ring-blue-900 focus:outline-none"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block mb-1 font-semibold">S2 / Magister (Tahun Lulus)</label>
                          <input
                            type="text"
                            value={formData.s2TahunLulus}
                            onChange={(e) => handleInputChange('s2TahunLulus', e.target.value)}
                            placeholder="2026"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-base sm:text-sm focus:ring-2 focus:ring-blue-900 focus:outline-none"
                          />
                        </div>
                      </>
                    )}

                    <div className="sm:col-span-2">
                      <label className="block mb-1 font-semibold">Nilai Rata-rata / Catatan Prestasi Relevan</label>
                      <input
                        type="text"
                        value={formData.prestasiRelevan}
                        onChange={(e) => handleInputChange('prestasiRelevan', e.target.value)}
                        placeholder="Rata-rata Ujian 88.50 / Juara 1 Olimpiade Matematika..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-base sm:text-sm focus:ring-2 focus:ring-blue-900 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 5: KELUARGA & EKONOMI */}
              {currentStep === 5 && (
                <div className="space-y-6 max-w-4xl mx-auto">
                  <div className="border-b border-slate-100 pb-4">
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900">Tahap 5: Data Keluarga & Kondisi Ekonomi</h2>
                    <p className="text-xs text-slate-500">Isikan data orang tua/wali dan latar belakang sosial ekonomi.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 text-xs font-medium text-slate-700">
                    <div>
                      <label className="block mb-1 font-semibold">Nama Ayah / Wali</label>
                      <input
                        type="text"
                        value={formData.namaAyah}
                        onChange={(e) => handleInputChange('namaAyah', e.target.value)}
                        placeholder="Nama Ayah / Wali"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-base sm:text-sm focus:ring-2 focus:ring-blue-900 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 font-semibold">Pekerjaan Ayah / Wali</label>
                      <input
                        type="text"
                        value={formData.pekerjaanAyah}
                        onChange={(e) => handleInputChange('pekerjaanAyah', e.target.value)}
                        placeholder="Petani / Wiraswasta / PNS..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-base sm:text-sm focus:ring-2 focus:ring-blue-900 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block mb-1 font-semibold">Nama Ibu</label>
                      <input
                        type="text"
                        value={formData.namaIbu}
                        onChange={(e) => handleInputChange('namaIbu', e.target.value)}
                        placeholder="Nama Ibu"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-base sm:text-sm focus:ring-2 focus:ring-blue-900 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 font-semibold">Pekerjaan Ibu</label>
                      <input
                        type="text"
                        value={formData.pekerjaanIbu}
                        onChange={(e) => handleInputChange('pekerjaanIbu', e.target.value)}
                        placeholder="Ibu Rumah Tangga / Pedagang..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-base sm:text-sm focus:ring-2 focus:ring-blue-900 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block mb-1 font-semibold">Penghasilan Orang Tua / Wali Per Bulan</label>
                      <select
                        value={formData.penghasilanOrtu}
                        onChange={(e) => handleInputChange('penghasilanOrtu', e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-base sm:text-sm focus:ring-2 focus:ring-blue-900 focus:outline-none"
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
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-base sm:text-sm focus:ring-2 focus:ring-blue-900 focus:outline-none"
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
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-base sm:text-sm focus:ring-2 focus:ring-blue-900 focus:outline-none"
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
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900">Tahap 6: Prestasi & Pengalaman</h2>
                    <p className="text-xs text-slate-500">Catatkan riwayat prestasi, keaktifan organisasi, pengabdian, dan pelatihan Anda (Opsional). Gunakan tombol + Tambah untuk menambah baris.</p>
                  </div>

                  <div className="space-y-6">
                    <DynamicAchievementBlock
                      title="1. Prestasi Akademik (Lomba / Karya Ilmiah / Publikasi)"
                      subtitle="Tambahkan riwayat prestasi akademik/lomba yang pernah Anda peroleh. (Kosongkan jika tidak ada)"
                      labelNama="Nama Prestasi / Karya Ilmiah / Publikasi"
                      placeholderNama="Contoh: Juara 1 Lomba Karya Tulis Ilmiah Nasional"
                      items={prestasiAkademikList}
                      onChange={setPrestasiAkademikList}
                      addButtonText="Tambah Prestasi Akademik"
                    />

                    <DynamicAchievementBlock
                      title="2. Prestasi Non-Akademik (Olahraga / Seni / Dll)"
                      subtitle="Tambahkan riwayat prestasi non-akademik yang pernah Anda peroleh. (Kosongkan jika tidak ada)"
                      labelNama="Nama Prestasi / Penghargaan Non-Akademik"
                      placeholderNama="Contoh: Juara 2 Bulutangkis Porprov Sultra"
                      items={prestasiNonAkademikList}
                      onChange={setPrestasiNonAkademikList}
                      addButtonText="Tambah Prestasi Non-Akademik"
                    />

                    <DynamicAchievementBlock
                      title="3. Pengalaman Organisasi Kemahasiswaan"
                      subtitle="Tambahkan pengalaman keaktifan organisasi kemahasiswaan Anda. (Kosongkan jika tidak ada)"
                      labelNama="Nama Organisasi & Jabatan / Peran"
                      placeholderNama="Contoh: Ketua Himpunan Mahasiswa Jurusan (HMJ)"
                      items={pengalamanOrganisasiList}
                      onChange={setPengalamanOrganisasiList}
                      addButtonText="Tambah Pengalaman Organisasi"
                    />

                    <DynamicAchievementBlock
                      title="4. Pengalaman Kegiatan Sosial / Pengabdian Masyarakat"
                      subtitle="Tambahkan pengalaman kegiatan sosial/pengabdian di daerah asal. (Kosongkan jika tidak ada)"
                      labelNama="Nama Kegiatan / Pengabdian Masyarakat"
                      placeholderNama="Contoh: Relawan Mengajar Desa Pesisir Kolaka"
                      items={pengalamanPengabdianList}
                      onChange={setPengalamanPengabdianList}
                      addButtonText="Tambah Pengalaman Sosial"
                    />

                    <DynamicAchievementBlock
                      title="5. Pelatihan / Sertifikasi Relevan"
                      subtitle="Tambahkan pelatihan atau sertifikasi keahlian yang pernah Anda ikuti. (Kosongkan jika tidak ada)"
                      labelNama="Nama Pelatihan / Sertifikasi"
                      placeholderNama="Contoh: Pelatihan Data Analyst / Web Development"
                      items={pelatihanSertifikasiList}
                      onChange={setPelatihanSertifikasiList}
                      addButtonText="Tambah Pelatihan / Sertifikasi"
                    />
                  </div>
                </div>
              )}

              {/* STEP 7: UNGGAH BERKAS */}
              {currentStep === 7 && (
                <div className="space-y-6 max-w-4xl mx-auto">
                  <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold text-slate-900">Tahap 7: Unggah Dokumen Persyaratan ({formData.jenjang})</h2>
                      <p className="text-xs text-slate-500">Unggah berkas digital spesifik yang dipersyaratkan untuk jenjang {formData.jenjang}.</p>
                    </div>
                    <span className="text-xs font-bold px-3 py-1 bg-blue-100 text-[#0B3A6A] rounded-full shrink-0">
                      Jenjang {formData.jenjang}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {(formData.jenjang === 'S1'
                      ? [
                          { key: 'fileSuratPermohonan', docType: 'surat_permohonan', title: '1. Surat Permohonan BSSC (Gubernur Sultra)' },
                          { key: 'filePasfoto', docType: 'selfie', title: '2. Pasfoto Terbaru / Selfie KTP' },
                          { key: 'fileKtp', docType: 'ktp', title: '3. KTP Provinsi Sulawesi Tenggara' },
                          { key: 'fileSuratAktif', docType: 'ktm', title: '4. KTM / Surat Aktif Kuliah' },
                          { key: 'fileTranskrip', docType: 'transkrip', title: '5. Transkrip Nilai Sementara S1' },
                          { key: 'fileDtks', docType: 'dtks', title: '6. Bukti Terdaftar DTKS / DTSEN' },
                          { key: 'fileSuratPernyataan', docType: 'surat_pernyataan', title: '7. Surat Pernyataan Bebas Beasiswa Lain (Materai)' },
                          { key: 'fileMotivationOrEsai', docType: 'esai', title: '8. Motivation Letter (S1/D4)' }
                        ]
                      : formData.jenjang === 'S2'
                      ? [
                          { key: 'fileSuratPermohonan', docType: 'surat_permohonan', title: '1. Surat Permohonan BSSC (Gubernur Sultra)' },
                          { key: 'filePasfoto', docType: 'selfie', title: '2. Pasfoto Terbaru / Selfie KTP' },
                          { key: 'fileKtp', docType: 'ktp', title: '3. KTP Provinsi Sulawesi Tenggara' },
                          { key: 'fileSuratAktif', docType: 'ktm', title: '4. KTM / Surat Aktif S2' },
                          { key: 'fileTranskrip', docType: 'transkrip', title: '5. Transkrip Nilai Semester S2' },
                          { key: 'fileDtks', docType: 'dtks', title: '6. Ijazah & Transkrip Nilai S1' },
                          { key: 'fileSuratPernyataan', docType: 'surat_pernyataan', title: '7. Surat Pernyataan Bebas Beasiswa Lain' },
                          { key: 'fileMotivationOrEsai', docType: 'esai', title: '8. Esai Rencana Penelitian & Kontribusi Sultra (S2)' }
                        ]
                      : [
                          { key: 'fileSuratPermohonan', docType: 'surat_permohonan', title: '1. Surat Permohonan BSSC (Gubernur Sultra)' },
                          { key: 'filePasfoto', docType: 'selfie', title: '2. Pasfoto Terbaru / Selfie KTP' },
                          { key: 'fileKtp', docType: 'ktp', title: '3. KTP Provinsi Sulawesi Tenggara' },
                          { key: 'fileSuratAktif', docType: 'ktm', title: '4. KTM / Surat Aktif S3' },
                          { key: 'fileTranskrip', docType: 'transkrip', title: '5. Transkrip Nilai Semester S3' },
                          { key: 'fileDtks', docType: 'dtks', title: '6. Ijazah & Transkrip S1 & S2' },
                          { key: 'fileSuratPernyataan', docType: 'surat_pernyataan', title: '7. Surat Rekomendasi Promotor' },
                          { key: 'fileMotivationOrEsai', docType: 'esai', title: '8. Proposal Disertasi & Esai Kontribusi Sultra (S3)' }
                        ]
                    ).map((docItem, idx) => {
                      const currentVal = (formData as any)[docItem.key];
                      const isUploading = uploadingDocKey === docItem.key;

                      return (
                        <div key={idx} className="p-3.5 sm:p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2 relative">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-semibold text-slate-900 text-xs leading-snug">{docItem.title}</span>
                            <span className="text-[10px] text-emerald-800 bg-emerald-100 font-bold px-2 py-0.5 rounded shrink-0">
                              PDF / JPG
                            </span>
                          </div>

                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 bg-white p-2.5 rounded-lg border border-slate-200 text-xs">
                            <div className="flex items-center gap-2 truncate min-w-0 flex-1">
                              <FileText className="w-4 h-4 text-blue-900 shrink-0" />
                              <span className="truncate font-mono text-slate-700 text-[11px]">
                                {currentVal || 'Belum diunggah'}
                              </span>
                            </div>

                            <label className="shrink-0 cursor-pointer px-3 py-1.5 sm:py-1 bg-blue-50 hover:bg-blue-100 text-blue-900 rounded font-semibold text-xs sm:text-[11px] transition-colors text-center">
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
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900">Tahap 8: Review & Validasi Final</h2>
                    <p className="text-xs text-slate-500">Periksa kembali ringkasan isian formulir Anda sebelum mengirim permohonan final.</p>
                  </div>

                  <div className="bg-slate-50 p-4 sm:p-6 rounded-2xl border border-slate-200 space-y-4 text-xs text-slate-800">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pb-4 border-b border-slate-200">
                      <div>
                        <span className="text-slate-500 block text-[11px]">Jenjang Studi</span>
                        <strong className="text-slate-900 text-xs sm:text-sm">{formData.jenjang}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[11px]">IPK Kumulatif</span>
                        <strong className="text-blue-900 text-xs sm:text-sm">{formData.ipk || '-'}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[11px]">Semester</span>
                        <strong className="text-slate-900 text-xs sm:text-sm">Semester {formData.semester}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[11px]">Asal Daerah</span>
                        <strong className="text-slate-900 text-xs sm:text-sm truncate block">{formatAsalDaerah(formData.asalDaerah)}</strong>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <p className="text-slate-500 text-[11px]">Nama Pendaftar:</p>
                      <p className="font-bold text-slate-900 text-xs sm:text-sm">{formData.namaLengkap || '-'}</p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-slate-500 text-[11px]">Perguruan Tinggi & Prodi:</p>
                      <p className="font-bold text-slate-900 text-xs sm:text-sm leading-relaxed">
                        {formData.perguruanTinggi || '-'} {formData.fakultasProdi ? `(${formData.fakultasProdi})` : ''}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-200 space-y-3">
                      <div className="flex items-start gap-2.5 sm:gap-3 bg-blue-50/80 p-3.5 sm:p-4 rounded-xl border border-blue-200">
                        <input
                          type="checkbox"
                          id="agreedDec"
                          checked={formData.agreedDeclaration}
                          onChange={(e) => handleInputChange('agreedDeclaration', e.target.checked)}
                          className="mt-1 rounded text-blue-900 focus:ring-blue-900 shrink-0"
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
              <div className="pt-6 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={currentStep === 1}
                  className={`w-full sm:w-auto px-5 py-3 sm:py-2.5 rounded-xl text-xs sm:text-xs font-bold transition-all flex items-center justify-center gap-2 ${
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
                    className="w-full sm:w-auto px-6 py-3 sm:py-2.5 rounded-xl text-xs sm:text-xs font-bold text-white bg-blue-900 hover:bg-blue-950 transition-all flex items-center justify-center gap-2 shadow-xs"
                  >
                    Langkah Selanjutnya
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={!formData.agreedDeclaration}
                    onClick={handleOpenSignatureModal}
                    className={`w-full sm:w-auto px-8 py-3.5 sm:py-3 rounded-xl text-xs font-black uppercase tracking-wider text-white transition-all flex items-center justify-center gap-2 shadow-md ${
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
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-6 sm:p-12 text-center max-w-2xl mx-auto shadow-xl space-y-5 sm:space-y-6">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>

            <div className="space-y-2">
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 inline-block">
                Pendaftaran Berhasil Disubmit
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">Nomor Registrasi Pendaftaran Anda</h2>
              <div className="text-2xl sm:text-3xl font-black text-blue-900 tracking-wider font-mono py-2 bg-slate-50 rounded-xl border border-slate-200 inline-block px-4 sm:px-6">
                {registrationCode}
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
              Seluruh data diri, akademik, dan berkas persyaratan Anda telah masuk ke dalam sistem validasi Pemprov Sulawesi Tenggara. Hasil verifikasi administrasi akan diumumkan pada <strong>16 - 17 Oktober 2026</strong>.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => window.print()}
                className="w-full sm:w-auto px-6 py-3 sm:py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center justify-center gap-2 hover:bg-slate-800 shadow-md"
              >
                <Printer className="w-4 h-4" /> Cetak Bukti Pendaftaran
              </button>

              <Link
                href="/cek-status"
                className="w-full sm:w-auto px-6 py-3 sm:py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 hover:bg-slate-100"
              >
                Cek Status Pendaftaran
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Signature Canvas Modal */}
      {showSignatureModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 print:hidden animate-in fade-in">
          <div className="bg-white rounded-3xl w-[94vw] max-w-lg shadow-2xl overflow-hidden border border-slate-200">
            {/* Modal Header */}
            <div className="bg-[#0B3A6A] text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-xl">
                  <PenTool className="w-5 h-5 text-blue-200" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold">Tanda Tangan Digital Pendaftar</h3>
                  <p className="text-xs text-blue-200">Bubuhkan tanda tangan Anda di bawah ini</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSignatureModal(false)}
                className="text-blue-200 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                Tanda tangan digital ini akan tertera secara otomatis pada lembar <strong>Formulir Bukti Pendaftaran Beasiswa Sultra Cerdas</strong> Anda.
              </p>

              {/* Canvas Area */}
              <div className="relative border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50/50 p-2 overflow-hidden">
                <canvas
                  ref={canvasRef}
                  width={440}
                  height={180}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full h-[180px] touch-none cursor-crosshair rounded-xl bg-white shadow-inner"
                />
                
                {/* Guideline line */}
                <div className="absolute left-6 right-6 bottom-8 border-b border-slate-200 pointer-events-none text-center">
                  <span className="text-[10px] text-slate-300 bg-white px-2">Garis Batas Tanda Tangan</span>
                </div>

                {!hasDrawnSignature && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-400 text-xs font-medium px-4 text-center">
                    Gunakan Mouse atau Sentuhan Layar (Touchscreen) untuk Menggambar Tanda Tangan
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={clearCanvas}
                  className="px-3.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors flex items-center gap-1.5 border border-rose-200"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Hapus / Ulangi
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowSignatureModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    disabled={!hasDrawnSignature}
                    onClick={handleConfirmSignatureAndSubmit}
                    className="px-5 py-2.5 text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-xl shadow-md transition-all flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Simpan & Submit Final
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Official Professional Printable Application Form */}
      {isSubmitted && (
        <div className="hidden print:block p-8 font-serif text-slate-900 max-w-4xl mx-auto bg-white min-h-screen">
          {/* Kop Surat Resmi */}
          <div className="text-center font-serif border-b-4 border-slate-900 pb-3 mb-1">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">Pemerintah Provinsi Sulawesi Tenggara</h3>            <p className="text-xs font-bold uppercase text-slate-800">Panitia Seleksi Program Beasiswa Sultra Cerdas 2026</p>
            <p className="text-[10px] text-slate-600 italic">Kompleks Bumi Praja Anduonohu, Kota Kendari | Website: beasiswasultra.go.id</p>
          </div>
          <div className="border-b border-slate-900 mb-6"></div>

          {/* Title & Document Ref */}
          <div className="text-center space-y-1 mb-6">
            <h1 className="text-base font-black uppercase tracking-wider underline text-slate-900">FORMULIR BUKTI PENDAFTARAN BEASISWA MAHASISWA</h1>
            <p className="text-xs font-bold text-slate-800">NOMOR REGISTRASI: <span className="font-mono text-sm px-2 py-0.5 bg-slate-100 border border-slate-400 inline-block font-black">{registrationCode}</span></p>
          </div>

          <div className="space-y-4 text-xs font-sans">
            {/* Section 1 */}
            <div className="border border-slate-400 overflow-hidden">
              <div className="bg-slate-100 px-3 py-1 font-bold uppercase text-slate-900 border-b border-slate-400 flex justify-between">
                <span>I. IDENTITAS DIRI PENDAFTAR</span>
                <span>JENJANG TARGET: {formData.jenjang}</span>
              </div>
              <table className="w-full text-left border-collapse">
                <tbody>
                  <tr className="border-b border-slate-200"><td className="w-1/3 p-1.5 font-semibold bg-slate-50">Nama Lengkap (KTP)</td><td className="p-1.5 font-bold">: {formData.namaLengkap}</td></tr>
                  <tr className="border-b border-slate-200"><td className="w-1/3 p-1.5 font-semibold bg-slate-50">NIK Mahasiswa</td><td className="p-1.5 font-mono">: {formData.nik}</td></tr>
                  <tr className="border-b border-slate-200"><td className="w-1/3 p-1.5 font-semibold bg-slate-50">No. Kartu Keluarga (KK)</td><td className="p-1.5 font-mono">: {formData.noKk || '-'}</td></tr>
                  <tr className="border-b border-slate-200"><td className="w-1/3 p-1.5 font-semibold bg-slate-50">Tempat, Tanggal Lahir</td><td className="p-1.5">: {formData.tempatLahir}, {formData.tanggalLahir}</td></tr>
                  <tr className="border-b border-slate-200"><td className="w-1/3 p-1.5 font-semibold bg-slate-50">Jenis Kelamin</td><td className="p-1.5">: {formData.jenisKelamin}</td></tr>
                  <tr className="border-b border-slate-200"><td className="w-1/3 p-1.5 font-semibold bg-slate-50">Asal Daerah (Kab/Kota)</td><td className="p-1.5">: {formatAsalDaerah(formData.asalDaerah)}</td></tr>
                  <tr className="border-b border-slate-200"><td className="w-1/3 p-1.5 font-semibold bg-slate-50">Alamat KTP</td><td className="p-1.5">: {formData.alamatKtp}</td></tr>
                  <tr className="border-b border-slate-200"><td className="w-1/3 p-1.5 font-semibold bg-slate-50">Alamat Domisili</td><td className="p-1.5">: {formData.alamatDomisili}</td></tr>
                  <tr className="border-b border-slate-200"><td className="w-1/3 p-1.5 font-semibold bg-slate-50">No. HP / WhatsApp</td><td className="p-1.5">: {formData.noHp}</td></tr>
                  <tr><td className="w-1/3 p-1.5 font-semibold bg-slate-50">Email Aktif</td><td className="p-1.5">: {formData.email}</td></tr>
                </tbody>
              </table>
            </div>

            {/* Section 2 */}
            <div className="border border-slate-400 overflow-hidden">
              <div className="bg-slate-100 px-3 py-1 font-bold uppercase text-slate-900 border-b border-slate-400">
                II. DATA AKADEMIK & PERGURUAN TINGGI
              </div>
              <table className="w-full text-left border-collapse">
                <tbody>
                  <tr className="border-b border-slate-200"><td className="w-1/3 p-1.5 font-semibold bg-slate-50">Perguruan Tinggi</td><td className="p-1.5 font-bold">: {formData.perguruanTinggi}</td></tr>
                  <tr className="border-b border-slate-200"><td className="w-1/3 p-1.5 font-semibold bg-slate-50">Fakultas / Program Studi</td><td className="p-1.5">: {formData.fakultasProdi}</td></tr>
                  <tr className="border-b border-slate-200"><td className="w-1/3 p-1.5 font-semibold bg-slate-50">Akreditasi Prodi</td><td className="p-1.5">: {formData.akreditasiProdi}</td></tr>
                  <tr className="border-b border-slate-200"><td className="w-1/3 p-1.5 font-semibold bg-slate-50">NIM Mahasiswa</td><td className="p-1.5 font-mono">: {formData.nim}</td></tr>
                  <tr className="border-b border-slate-200"><td className="w-1/3 p-1.5 font-semibold bg-slate-50">Semester Saat Ini</td><td className="p-1.5">: Semester {formData.semester}</td></tr>
                  <tr className="border-b border-slate-200"><td className="w-1/3 p-1.5 font-semibold bg-slate-50">IPK Kumulatif Terakhir</td><td className="p-1.5 font-bold">: {formData.ipk}</td></tr>
                  <tr><td className="w-1/3 p-1.5 font-semibold bg-slate-50">Target Tahun Lulus</td><td className="p-1.5">: {formData.targetLulus || '-'}</td></tr>
                </tbody>
              </table>
            </div>

            {/* Section 3 */}
            <div className="border border-slate-400 overflow-hidden">
              <div className="bg-slate-100 px-3 py-1 font-bold uppercase text-slate-900 border-b border-slate-400">
                III. ORANG TUA / EKONOMI KELUARGA
              </div>
              <table className="w-full text-left border-collapse">
                <tbody>
                  <tr className="border-b border-slate-200"><td className="w-1/3 p-1.5 font-semibold bg-slate-50">Nama Ayah / Ibu</td><td className="p-1.5">: {formData.namaAyah} / {formData.namaIbu}</td></tr>
                  <tr className="border-b border-slate-200"><td className="w-1/3 p-1.5 font-semibold bg-slate-50">Pekerjaan Orang Tua</td><td className="p-1.5">: {formData.pekerjaanAyah || '-'} / {formData.pekerjaanIbu || '-'}</td></tr>
                  <tr className="border-b border-slate-200"><td className="w-1/3 p-1.5 font-semibold bg-slate-50">Penghasilan Orang Tua</td><td className="p-1.5">: {formData.penghasilanOrtu}</td></tr>
                  <tr><td className="w-1/3 p-1.5 font-semibold bg-slate-50">Jumlah Tanggungan</td><td className="p-1.5">: {formData.jumlahTanggungan} Orang</td></tr>
                </tbody>
              </table>
            </div>

            {/* Section 4 - Prestasi */}
            {(formData.prestasiAkademik || formData.prestasiNonAkademik || formData.pengalamanOrganisasi) && (
              <div className="border border-slate-400 overflow-hidden">
                <div className="bg-slate-100 px-3 py-1 font-bold uppercase text-slate-900 border-b border-slate-400">
                  IV. PRESTASI & PENGALAMAN ORGANISASI
                </div>
                <table className="w-full text-left border-collapse">
                  <tbody>
                    {formData.prestasiAkademik && <tr className="border-b border-slate-200"><td className="w-1/3 p-1.5 font-semibold bg-slate-50">Prestasi Akademik</td><td className="p-1.5 whitespace-pre-line">: {formData.prestasiAkademik}</td></tr>}
                    {formData.prestasiNonAkademik && <tr className="border-b border-slate-200"><td className="w-1/3 p-1.5 font-semibold bg-slate-50">Prestasi Non-Akademik</td><td className="p-1.5 whitespace-pre-line">: {formData.prestasiNonAkademik}</td></tr>}
                    {formData.pengalamanOrganisasi && <tr><td className="w-1/3 p-1.5 font-semibold bg-slate-50">Pengalaman Organisasi</td><td className="p-1.5 whitespace-pre-line">: {formData.pengalamanOrganisasi}</td></tr>}
                  </tbody>
                </table>
              </div>
            )}

            {/* Statement Box */}
            <div className="p-3 border-2 border-slate-900 text-[10px] leading-relaxed text-justify bg-slate-50 font-serif">
              <p className="font-bold mb-1 uppercase">PERNYATAAN TANGGUNG JAWAB MUTLAK (SPTJM):</p>
              <p>
                Saya yang bertanda tangan di bawah ini menyatakan dengan sesungguhnya bahwa seluruh data, informasi, dan dokumen berkas persyaratan yang saya sampaikan adalah <strong>BENAR, SAH, dan DAPAT DIPERTANGGUNGJAWABKAN</strong>. Apabila di kemudian hari terbukti memberikan data palsu atau terbukti menerima pendanaan beasiswa ganda (double funding), saya bersedia menerima sanksi pembatalan status penerima beasiswa dan sanggup mengembalikan seluruh dana beasiswa yang telah diterima ke Kas Daerah Provinsi Sulawesi Tenggara.
              </p>
            </div>

            {/* Signature Block */}
            <div className="pt-4 flex justify-end items-end">
              <div className="text-center w-64 space-y-1">
                <p className="text-xs">Kendari, {new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p className="text-xs font-semibold mb-1">Pemohon / Pendaftar Beasiswa,</p>
                
                {/* Signature Display */}
                <div className="h-16 flex items-center justify-center my-1">
                  {signatureDataUrl ? (
                    <img src={signatureDataUrl} alt="Tanda Tangan Digital" className="max-h-16 max-w-full object-contain" />
                  ) : (
                    <div className="text-[10px] text-slate-400 italic">
                      (Tanda Tangan Digital)
                    </div>
                  )}
                </div>

                <p className="font-bold underline uppercase text-slate-900">{formData.namaLengkap}</p>
                <p className="text-[10px] text-slate-700 font-mono">NIK. {formData.nik}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Validation Errors Modal */}
      {validationErrors.length > 0 && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 print:hidden">
          <div className="bg-white rounded-2xl sm:rounded-3xl w-[92vw] max-w-md shadow-2xl overflow-hidden border border-slate-200">
            <div className="bg-rose-50 p-4 sm:p-6 flex items-start gap-3.5 border-b border-rose-100">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-rose-900">Data Belum Lengkap</h3>
                <p className="text-xs text-rose-700 mt-1">
                  Mohon lengkapi data yang masih kosong berikut ini sebelum melakukan Submit Final:
                </p>
              </div>
            </div>
            
            <div className="p-4 sm:p-6 max-h-64 overflow-y-auto">
              <ul className="space-y-2">
                {validationErrors.map((err, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-xs sm:text-sm text-slate-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0"></span>
                    {err}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="p-3.5 sm:p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={() => setValidationErrors([])}
                className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
              >
                Tutup & Lengkapi Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
