'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X,
  RefreshCw,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  Check,
  Camera,
  AlertCircle,
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
  title = 'Foto Selfie (Verifikasi Wajah)',
  subtitle = 'Verifikasi identitas fisik secara langsung melalui liveness detection.',
}: SelfieLivenessModalProps) {
  const [faceModelLoaded, setFaceModelLoaded] = useState(false);
  const [modelLoadError, setModelLoadError] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const [isBypassed, setIsBypassed] = useState(false);

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

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
            console.warn('WebGL backend error, trying CPU fallback:', err);
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
              setModelLoadError('Gagal memuat file model deteksi wajah.');
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
  const startCamera = useCallback(async () => {
    setCameraLoading(true);
    setCameraError(null);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
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
      setCameraError('Gagal mengakses kamera. Pastikan izin kamera telah diberikan.');
      setIsCameraActive(false);
    } finally {
      setCameraLoading(false);
    }
  }, []);

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
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, width, height);
      }
      const dataUrl = canvas.toDataURL('image/webp', 0.85);
      setCapturedImage(dataUrl);
      stopCamera();
    } catch (err) {
      console.error('Capture photo error:', err);
      setCameraError('Terjadi kesalahan saat menangkap foto.');
    }
  }, [stopCamera]);

  // 5. Open / Reset Camera on Modal Open
  useEffect(() => {
    if (isOpen) {
      setCapturedImage(null);
      setUploadError(null);
      setLivenessStatus('searching');
      baselineYawRef.current = null;
      yawHistoryRef.current = [];
      missedFaceCountRef.current = 0;
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, startCamera, stopCamera]);

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
            if (detection.expressions && detection.expressions.happy > 0.8) {
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
    startCamera();
  };

  // 9. Upload Captured Photo
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
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 my-auto border border-slate-100">
        {/* Header - Identical clean style with Register */}
        <div className="px-6 pt-6 pb-2 flex items-start justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              {title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {subtitle}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isUploading}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 flex items-center justify-center transition-colors shrink-0 -mt-1 -mr-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Viewfinder & Warning */}
        <div className="p-6 pt-3 flex flex-col items-center justify-center overflow-y-auto">
          {!capturedImage ? (
            /* Live Camera Viewfinder (Aspect 3/4, rounded-3xl, ring-4 ring-slate-100) */
            <div className="relative w-full max-w-sm aspect-[3/4] bg-slate-900 rounded-3xl overflow-hidden shadow-inner ring-4 ring-slate-100">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1]"
              />
              <canvas ref={canvasRef} className="hidden" />

              {/* Exact Overlay Silhouette from register page */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-60">
                <svg
                  viewBox="0 0 100 100"
                  className="w-full h-full absolute inset-0"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M50 15 C35 15 25 30 25 50 C25 70 35 75 50 75 C65 75 75 70 75 50 C75 30 65 15 50 15 Z"
                    fill="none"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                  />
                  <path
                    d="M15 100 C15 85 30 80 50 80 C70 80 85 85 85 100"
                    fill="none"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                  />
                </svg>
              </div>

              {/* Directive Pill Badge (Mencari Wajah / Hadap Kanan / Hadap Kiri / Senyum) */}
              {isCameraActive && !isBypassed && (
                <div className="absolute bottom-6 left-0 right-0 px-4 flex justify-center pointer-events-none">
                  <div
                    className={`px-4 py-2.5 rounded-full text-xs sm:text-sm font-bold shadow-lg flex items-center gap-2 transition-all duration-300 ${
                      livenessStatus === 'searching'
                        ? 'bg-orange-500 text-white animate-bounce'
                        : livenessStatus === 'right'
                        ? 'bg-blue-600 text-white animate-pulse'
                        : livenessStatus === 'left'
                        ? 'bg-blue-600 text-white animate-pulse'
                        : livenessStatus === 'smiling'
                        ? 'bg-emerald-600 text-white animate-pulse'
                        : 'bg-blue-600 text-white animate-pulse'
                    }`}
                  >
                    {livenessStatus === 'searching' && (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Mencari Wajah...
                      </>
                    )}
                    {livenessStatus === 'right' && (
                      <>👉 Silakan HADAP KANAN</>
                    )}
                    {livenessStatus === 'left' && (
                      <>👈 Silakan HADAP KIRI</>
                    )}
                    {livenessStatus === 'smiling' && (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-white animate-pulse" /> 😊 Silakan TERSENYUM
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Bypassed Manual Capture Button */}
              {isCameraActive && isBypassed && (
                <div className="absolute bottom-6 left-0 right-0 px-4 flex justify-center z-10">
                  <button
                    type="button"
                    onClick={capturePhoto}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg flex items-center gap-2 rounded-full font-semibold pointer-events-auto transition-transform hover:scale-105"
                  >
                    <Camera className="w-4 h-4" /> Ambil Foto Sekarang
                  </button>
                </div>
              )}

              {/* Initial Loading Model / Camera */}
              {(cameraLoading || (!faceModelLoaded && !isBypassed)) && (
                <div className="absolute inset-0 bg-slate-900/80 flex flex-col items-center justify-center space-y-2 p-4 text-center z-20">
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                  <p className="text-xs text-white font-semibold">
                    {cameraLoading ? 'Menghubungkan ke kamera...' : 'Memuat sistem deteksi wajah...'}
                  </p>
                  <p className="text-[11px] text-slate-300">
                    Harap tunggu, model AI sedang diunduh...
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* Captured Photo Preview Screen */
            <div className="relative w-full max-w-sm aspect-[3/4] bg-slate-900 rounded-3xl overflow-hidden shadow-inner ring-4 ring-slate-100">
              <img
                src={capturedImage}
                alt="Hasil Foto Selfie"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end justify-between p-5">
                <button
                  type="button"
                  onClick={handleRetake}
                  disabled={isUploading}
                  className="px-4 py-2 border border-white/30 bg-white/20 hover:bg-white/30 text-white rounded-xl backdrop-blur-md text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <RefreshCw className="w-4 h-4" /> Ulangi
                </button>
                <button
                  type="button"
                  onClick={handleUploadPhoto}
                  disabled={isUploading}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" /> Simpan Foto
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Model Load Error Banner with retry/bypass */}
          {modelLoadError && !isBypassed && (
            <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center justify-between gap-2 max-w-sm w-full">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{modelLoadError}</span>
              </div>
              <div className="flex gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setRetryCount((prev) => prev + 1)}
                  className="px-2 py-1 bg-white border border-rose-300 rounded text-[11px] font-bold text-rose-700"
                >
                  Coba Lagi
                </button>
                <button
                  type="button"
                  onClick={() => setIsBypassed(true)}
                  className="px-2 py-1 bg-rose-600 text-white rounded text-[11px] font-bold"
                >
                  Manual
                </button>
              </div>
            </div>
          )}

          {/* Camera Error Banner */}
          {cameraError && (
            <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2 max-w-sm w-full">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{cameraError}</span>
            </div>
          )}

          {/* Upload Error Banner */}
          {uploadError && (
            <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2 max-w-sm w-full">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{uploadError}</span>
            </div>
          )}

          {/* Anti-spoofing Warning Box - Identical to Register */}
          <div className="max-w-sm w-full bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-2.5 items-start mt-4 shadow-sm">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-xs text-amber-800">⚠ Peringatan Anti-Pemalsuan Foto</p>
              <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                Sistem mendeteksi dan memblokir wajah dari foto cetak/layar HP. Segala bentuk pemalsuan akan mengakibatkan <strong>diskualifikasi permanen</strong>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
