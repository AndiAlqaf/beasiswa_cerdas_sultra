const fs = require('fs');
const file = 'src/app/register/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Imports
content = content.replace(/import \{[\s\S]*?\} from 'lucide-react';/, `import {
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
} from 'lucide-react';`);

// 2. States
content = content.replace(/const \[capturedImage, setCapturedImage\] = useState<string \| null>\(null\);[\s\S]*?const videoRef = useRef<HTMLVideoElement \| null>\(null\);/, `const [capturedImage, setCapturedImage] = useState<string | null>(null);
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
  const baselineYawRef = useRef<number | null>(null);`);

// 3. Camera Management
content = content.replace(/\/\/ Camera Management[\s\S]*?  \}, \[currentStep\]\);/m, `// Camera Management & Liveness Detection
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

  useEffect(() => { return () => { stopCamera(); }; }, [stopCamera]);`);

fs.writeFileSync(file, content);
console.log('done replacing logic');
