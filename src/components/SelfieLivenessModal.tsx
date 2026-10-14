'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Camera,
  X,
  RotateCw,
  Check,
  AlertCircle,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

interface SelfieLivenessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title?: string;
  subtitle?: string;
}

type LivenessStatus = 'searching' | 'detected' | 'right' | 'left' | 'smiling';

export default function SelfieLivenessModal({
  isOpen,
  onClose,
  onSuccess,
  title = 'Ambil Ulang Pasfoto / Selfie KTP',
  subtitle = 'Wajib melalui verifikasi liveness detection (Hadap Kanan, Hadap Kiri, Senyum)',
}: SelfieLivenessModalProps) {
  const [faceModelLoaded, setFaceModelLoaded] = useState(false);
  const [modelLoadError, setModelLoadError] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const [isBypassed, setIsBypassed] = useState(false);

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

  const [livenessStatus, setLivenessStatus] = useState<LivenessStatus>('searching');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const faceApiRef = useRef<any>(null);

  const baselineYawRef = useRef<number | null>(null);
  const yawHistoryRef = useRef<number[]>([]);
  const missedFaceCountRef = useRef<number>(0);

  // 1. Load Face API Models
  useEffect(() => {
    if (!isOpen) return;

    if (!faceModelLoaded) {
      setModelLoadError('');
      import('@vladmandic/face-api')
        .then(async (faceapi) => {
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
            console.warn('WebGL backend error, falling back to CPU:', err);
            try {
              // @ts-ignore
              await faceapi.tf.setBackend('cpu');
              // @ts-ignore
              await faceapi.tf.ready();
              await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
              await faceapi.nets.faceExpressionNet.loadFromUri('/models');
              await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
              setFaceModelLoaded(true);
            } catch (cpuErr: any) {
              console.error('Face model load error:', cpuErr);
              setModelLoadError(
                'Gagal memuat model deteksi wajah. Periksa koneksi internet Anda atau gunakan mode manual jika darurat.'
              );
            }
          }
        })
        .catch((err) => {
          console.error('Error importing face-api:', err);
          setModelLoadError('Gagal mengunduh modul deteksi wajah.');
        });
    }
  }, [isOpen, faceModelLoaded, retryCount]);

  // 2. Start Camera
  const startCamera = useCallback(
    async (mode: 'user' | 'environment' = 'user') => {
      setCameraLoading(true);
      setCameraError(null);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: mode,
            width: { ideal: 640 },
            height: { ideal: 480 },
          },
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setIsCameraActive(true);
      } catch (err: any) {
        console.error('Camera access error:', err);
        setCameraError(
          'Tidak dapat mengakses kamera. Pastikan izin kamera telah diberikan pada browser atau buka halaman ini melalui smartphone Anda.'
        );
        setIsCameraActive(false);
      } finally {
        setCameraLoading(false);
      }
    },
    []
  );

  // 3. Stop Camera
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  }, []);

  // 4. Capture Photo from Video to Canvas
  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const video = videoRef.current;

    try {
      let width = video.videoWidth || 640;
      let height = video.videoHeight || 480;
      const MAX_DIM = 640;
      if (width > height && width > MAX_DIM) {
        height = Math.round((height * MAX_DIM) / width);
        width = MAX_DIM;
      } else if (height > MAX_DIM) {
        width = Math.round((width * MAX_DIM) / height);
        height = MAX_DIM;
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Mirror if front camera ('user')
        if (facingMode === 'user') {
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(video, 0, 0, width, height);
      }
      const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
      setCapturedImage(dataUrl);
      stopCamera();
    } catch (err) {
      console.error('Capture photo error:', err);
      setCameraError('Gagal menangkap foto dari kamera.');
    }
  }, [facingMode, stopCamera]);

  // 5. Open / Reset Camera on Modal Open
  useEffect(() => {
    if (isOpen) {
      setCapturedImage(null);
      setUploadError(null);
      setLivenessStatus('searching');
      baselineYawRef.current = null;
      yawHistoryRef.current = [];
      missedFaceCountRef.current = 0;
      startCamera(facingMode);
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, startCamera, stopCamera, facingMode]);

  // 6. Reset Liveness State when Camera restarts
  useEffect(() => {
    if (!capturedImage && isCameraActive) {
      setLivenessStatus('searching');
      baselineYawRef.current = null;
      yawHistoryRef.current = [];
      missedFaceCountRef.current = 0;
    }
  }, [capturedImage, isCameraActive]);

  // 7. Liveness Detection Loop (Hadap Kanan -> Hadap Kiri -> Senyum)
  useEffect(() => {
    if (
      !isOpen ||
      capturedImage ||
      !isCameraActive ||
      !faceModelLoaded ||
      !faceApiRef.current ||
      isBypassed
    ) {
      return;
    }

    let isChecking = false;
    const interval = setInterval(async () => {
      if (isChecking) return;
      const video = videoRef.current;
      if (!video || video.readyState < 2) return;

      isChecking = true;
      try {
        const faceapi = faceApiRef.current;
        const detection = await faceapi
          .detectSingleFace(
            video,
            new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.25 })
          )
          .withFaceLandmarks()
          .withFaceExpressions();

        if (!detection) {
          missedFaceCountRef.current++;
          if (missedFaceCountRef.current > 12) {
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

          // Calibration: collect 10 frames to compute neutral baseline yaw
          if (yawHistoryRef.current.length < 10) {
            yawHistoryRef.current.push(yawRatio);
            if (yawHistoryRef.current.length === 10) {
              const avgYaw =
                yawHistoryRef.current.reduce((a, b) => a + b, 0) / 10;
              baselineYawRef.current = avgYaw;
              setLivenessStatus('right');
            } else {
              setLivenessStatus('searching');
            }
            isChecking = false;
            return;
          }

          const currentBaselineYaw = baselineYawRef.current || 1.0;
          const YAW_RIGHT_THRESHOLD = currentBaselineYaw * 1.2;
          const YAW_LEFT_THRESHOLD = currentBaselineYaw * 0.8;

          // Step 1: Hadap Kanan
          if (livenessStatus === 'right') {
            if (yawRatio < YAW_LEFT_THRESHOLD) {
              setLivenessStatus('left');
            }
          }
          // Step 2: Hadap Kiri
          else if (livenessStatus === 'left') {
            if (yawRatio > YAW_RIGHT_THRESHOLD) {
              setLivenessStatus('smiling');
            }
          }
          // Step 3: Senyum
          else if (livenessStatus === 'smiling') {
            if (detection.expressions && detection.expressions.happy > 0.75) {
              clearInterval(interval);
              capturePhoto();
            }
          }
        }
      } catch (err) {
        console.error('Liveness detection error:', err);
      } finally {
        isChecking = false;
      }
    }, 100);

    return () => clearInterval(interval);
  }, [
    isOpen,
    capturedImage,
    isCameraActive,
    faceModelLoaded,
    isBypassed,
    livenessStatus,
    capturePhoto,
  ]);

  // 8. Retake Action
  const handleRetake = () => {
    setCapturedImage(null);
    setUploadError(null);
    startCamera(facingMode);
  };

  // 9. Switch Camera Action
  const handleSwitchCamera = () => {
    const nextMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  // 10. Upload Captured Photo
  const handleUploadPhoto = async () => {
    if (!capturedImage) return;
    setIsUploading(true);
    setUploadError(null);

    try {
      const res = await fetch(capturedImage);
      const blob = await res.blob();
      const token =
        typeof window !== 'undefined'
          ? localStorage.getItem('bssc_access_token')
          : null;

      const formData = new FormData();
      formData.append('file', blob, 'selfie_kamera.jpg');

      const uploadRes = await fetch('/api/v1/applicant/upload/selfie', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await uploadRes.json();
      if (!uploadRes.ok || !data.success) {
        throw new Error(data.message || 'Gagal menyimpan foto selfie.');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Upload selfie error:', err);
      setUploadError(err.message || 'Terjadi kesalahan saat menyimpan foto.');
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 text-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-800 flex flex-col animate-in zoom-in-95 duration-200 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white">{title}</h3>
              <p className="text-[11px] text-slate-400 leading-tight mt-0.5">{subtitle}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isUploading}
            className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Liveness Step Progress Bar */}
        {!capturedImage && (
          <div className="bg-slate-950/40 px-4 py-2.5 border-b border-slate-800/80 flex items-center justify-between gap-2 text-[11px]">
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all ${
                livenessStatus === 'searching'
                  ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30'
                  : 'text-slate-400 font-medium'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[10px]">
                1
              </span>
              <span>Posisikan</span>
            </div>

            <span className="text-slate-600">→</span>

            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all ${
                livenessStatus === 'right'
                  ? 'bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30'
                  : livenessStatus === 'left' || livenessStatus === 'smiling'
                  ? 'text-emerald-400 font-semibold'
                  : 'text-slate-400 font-medium'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[10px]">
                2
              </span>
              <span>Hadap Kanan</span>
            </div>

            <span className="text-slate-600">→</span>

            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all ${
                livenessStatus === 'left'
                  ? 'bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30'
                  : livenessStatus === 'smiling'
                  ? 'text-emerald-400 font-semibold'
                  : 'text-slate-400 font-medium'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[10px]">
                3
              </span>
              <span>Hadap Kiri</span>
            </div>

            <span className="text-slate-600">→</span>

            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all ${
                livenessStatus === 'smiling'
                  ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 animate-pulse'
                  : 'text-slate-400 font-medium'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[10px]">
                4
              </span>
              <span>Senyum</span>
            </div>
          </div>
        )}

        {/* Viewfinder Screen */}
        <div className="relative aspect-[4/3] w-full bg-black flex items-center justify-center overflow-hidden">
          <canvas ref={canvasRef} className="hidden" />

          {capturedImage ? (
            /* Preview of Captured Photo */
            <div className="relative w-full h-full">
              <img
                src={capturedImage}
                alt="Pratinjau Foto Pasfoto"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 bg-emerald-600/90 backdrop-blur-sm text-white text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-md">
                <Check className="w-3.5 h-3.5" /> Foto Berhasil Terverifikasi Liveness
              </div>
            </div>
          ) : cameraError ? (
            /* Camera Error Message */
            <div className="p-6 text-center max-w-sm space-y-3">
              <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
              <p className="text-xs text-rose-300 leading-relaxed">{cameraError}</p>
              <button
                type="button"
                onClick={() => startCamera(facingMode)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-xl text-white inline-flex items-center gap-1.5"
              >
                <RotateCw className="w-3.5 h-3.5" /> Coba Sambungkan Lagi
              </button>
            </div>
          ) : (
            /* Live Camera Stream with Liveness Overlay */
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${
                  facingMode === 'user' ? '-scale-x-100' : ''
                }`}
              />

              {/* Silhouette Oval Guide */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-70">
                <svg
                  viewBox="0 0 100 100"
                  className="w-full h-full absolute inset-0"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M50 15 C35 15 25 30 25 50 C25 70 35 75 50 75 C65 75 75 70 75 50 C75 30 65 15 50 15 Z"
                    fill="none"
                    stroke={
                      livenessStatus === 'smiling'
                        ? '#10b981'
                        : livenessStatus === 'searching'
                        ? '#f59e0b'
                        : '#3b82f6'
                    }
                    strokeWidth="1.8"
                    strokeDasharray={livenessStatus === 'smiling' ? 'none' : '3 3'}
                  />
                  <path
                    d="M15 100 C15 85 30 80 50 80 C70 80 85 85 85 100"
                    fill="none"
                    stroke="rgba(255,255,255,0.4)"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                  />
                </svg>
              </div>

              {/* Real-time Directive Badge */}
              {isCameraActive && !isBypassed && (
                <div className="absolute bottom-5 left-0 right-0 px-4 flex justify-center pointer-events-none z-10">
                  <div
                    className={`px-4 py-2.5 rounded-full text-xs sm:text-sm font-bold shadow-xl flex items-center gap-2 transition-all duration-300 ${
                      livenessStatus === 'searching'
                        ? 'bg-amber-600/95 text-white animate-bounce'
                        : livenessStatus === 'right'
                        ? 'bg-blue-600/95 text-white animate-pulse'
                        : livenessStatus === 'left'
                        ? 'bg-indigo-600/95 text-white animate-pulse'
                        : livenessStatus === 'smiling'
                        ? 'bg-emerald-600/95 text-white animate-pulse scale-105'
                        : 'bg-slate-800 text-white'
                    }`}
                  >
                    {livenessStatus === 'searching' && (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                        <span>Mencari Wajah... Posisikan di siluet</span>
                      </>
                    )}
                    {livenessStatus === 'right' && (
                      <>
                        <span className="text-base shrink-0">👉</span>
                        <span>Silakan HADAP KANAN</span>
                      </>
                    )}
                    {livenessStatus === 'left' && (
                      <>
                        <span className="text-base shrink-0">👈</span>
                        <span>Silakan HADAP KIRI</span>
                      </>
                    )}
                    {livenessStatus === 'smiling' && (
                      <>
                        <Sparkles className="w-4 h-4 text-amber-300 animate-spin shrink-0" />
                        <span>😊 Silakan TERSENYUM (Otomatis Jepret)</span>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Bypassed Manual Capture Button */}
              {isCameraActive && isBypassed && (
                <div className="absolute bottom-5 left-0 right-0 px-4 flex justify-center z-10">
                  <button
                    type="button"
                    onClick={capturePhoto}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white shadow-xl flex items-center gap-2 rounded-full font-bold text-xs sm:text-sm transition-transform hover:scale-105"
                  >
                    <Camera className="w-4 h-4" /> Ambil Foto Sekarang
                  </button>
                </div>
              )}

              {/* Loading AI / Camera State */}
              {(cameraLoading || (!faceModelLoaded && !isBypassed)) && (
                <div className="absolute inset-0 bg-black/75 flex flex-col items-center justify-center space-y-2 p-4 text-center z-20">
                  <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
                  <p className="text-xs text-slate-200 font-semibold">
                    {cameraLoading
                      ? 'Menghubungkan ke kamera...'
                      : 'Memuat sistem AI Liveness Detection...'}
                  </p>
                  <p className="text-[10px] text-slate-400 max-w-xs">
                    Mohon tunggu beberapa detik, sistem sedang memverifikasi model wajah.
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Model Load Error Banner */}
        {modelLoadError && !isBypassed && (
          <div className="p-3 bg-rose-950/60 border-t border-rose-800 text-[11px] text-rose-300 flex items-center justify-between gap-2">
            <span className="truncate">{modelLoadError}</span>
            <div className="flex gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setRetryCount((prev) => prev + 1)}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded text-white font-bold text-[10px]"
              >
                Coba Lagi
              </button>
              <button
                type="button"
                onClick={() => setIsBypassed(true)}
                className="px-2.5 py-1 bg-amber-600/80 hover:bg-amber-600 rounded text-white font-bold text-[10px]"
              >
                Manual
              </button>
            </div>
          </div>
        )}

        {/* Upload Error Banner */}
        {uploadError && (
          <div className="p-3 bg-rose-950/70 border-t border-rose-800 text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}

        {/* Anti-spoofing Advice */}
        {!capturedImage && (
          <div className="px-4 py-2 bg-slate-950/80 border-t border-slate-800/60 flex items-center gap-2 text-[10px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>
              Anti-Spoofing aktif: Foto dari layar HP lain atau foto cetak akan ditolak otomatis.
            </span>
          </div>
        )}

        {/* Footer Controls */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between gap-3">
          {capturedImage ? (
            <>
              <button
                type="button"
                onClick={handleRetake}
                disabled={isUploading}
                className="flex-1 py-2.5 px-4 text-xs font-bold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <RotateCw className="w-3.5 h-3.5" /> Ulangi Foto
              </button>
              <button
                type="button"
                onClick={handleUploadPhoto}
                disabled={isUploading}
                className="flex-1 py-2.5 px-4 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Menyimpan Foto...
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" /> Gunakan & Simpan Foto
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handleSwitchCamera}
                disabled={cameraLoading || !!cameraError}
                className="py-2 px-3 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1.5 disabled:opacity-50"
                title="Ganti Kamera Depan/Belakang"
              >
                <RotateCw className="w-3.5 h-3.5" /> Ganti Kamera
              </button>

              <button
                type="button"
                onClick={onClose}
                disabled={isUploading}
                className="py-2 px-4 text-xs font-semibold rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 transition-colors"
              >
                Batal
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
