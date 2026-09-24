'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ShieldCheck, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, Loader2, Clock } from 'lucide-react';
import { fetchAPI, setTokens, getAccessToken, getUser } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lockoutSeconds, setLockoutSeconds] = useState<number | null>(null);
  const [failedCount, setFailedCount] = useState<number>(0);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Auto-redirect if already logged in
  useEffect(() => {
    const token = getAccessToken();
    const user = getUser();
    if (token && user) {
      if (user.role === 'admin') {
        router.replace('/admin');
      } else {
        router.replace('/dashboard');
      }
    } else {
      setCheckingAuth(false);
    }
  }, [router]);

  useEffect(() => {
    if (lockoutSeconds === null || lockoutSeconds <= 0) return;
    const interval = setInterval(() => {
      setLockoutSeconds((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          setFailedCount(0);
          setError(null);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutSeconds]);

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutSeconds !== null && lockoutSeconds > 0) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetchAPI('/auth/login', {
        method: 'POST',
        skipAuth: true,
        body: JSON.stringify({ identifier, password }),
      });

      if (res.success && res.data) {
        setFailedCount(0);
        const { accessToken, refreshToken, user } = res.data;
        setTokens(accessToken, refreshToken, user);

        if (user.role === 'admin') {
          router.push('/admin');
        } else {
          router.push('/dashboard');
        }
      }
    } catch (err: any) {
      const msg = err.message || 'Email/NIK atau kata sandi salah.';
      const newFailCount = failedCount + 1;
      setFailedCount(newFailCount);

      // Check if locked out (status 429, retryAfter, 5 consecutive failed attempts, or lockout message)
      if (
        err.status === 429 ||
        err.data?.retryAfter ||
        newFailCount >= 5 ||
        msg.toLowerCase().includes('terkunci') ||
        msg.toLowerCase().includes('too many') ||
        msg.toLowerCase().includes('dibatasi') ||
        msg.toLowerCase().includes('menit')
      ) {
        let secs = err.data?.retryAfter || 60;
        const match = msg.match(/(\d+)\s*menit/i);
        if (match && match[1] && !err.data?.retryAfter) {
          secs = parseInt(match[1], 10) * 60;
        }
        setLockoutSeconds(secs);
        setError('Terlalu banyak percobaan login gagal (5 kali berturut-turut). Sistem mengunci login sementara.');
      } else {
        setError(`${msg} (Percobaan gagal: ${newFailCount}/5)`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      {checkingAuth && (
        <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-[#0B3A6A] animate-spin" />
        </div>
      )}
      {/* Left Column: Branding / Graphic (Hidden on Mobile) */}

      <div 
        className="hidden lg:flex lg:w-1/2 relative bg-slate-900 overflow-hidden bg-cover bg-center"
        style={{ backgroundImage: "url('/footage2.jpg')" }}
      >
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-slate-900/80 z-0"></div>

        {/* Abstract Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/40 via-slate-900/60 to-slate-900/90 z-0"></div>
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-blue-600/40 rounded-full blur-3xl z-0"></div>
        <div className="absolute top-1/4 -right-20 w-80 h-80 bg-emerald-600/20 rounded-full blur-3xl z-0"></div>

        <div className="relative z-10 w-full h-full flex flex-col p-12 lg:p-20">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 text-white/90 hover:text-white bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md px-4 py-2 rounded-xl transition-all shadow-sm text-sm font-normal">
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Beranda
            </Link>
          </div>

          <div className="flex-1 flex flex-col justify-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl font-bold text-white tracking-tight leading-tight">
                Portal Beasiswa <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-300">
                  Sultra Cerdas 2026
                </span>
              </h1>
              <p className="text-slate-200 text-xl lg:text-2xl max-w-lg leading-relaxed">
                Platform resmi pendaftaran dan pemantauan status beasiswa bagi mahasiswa aktif asal Sulawesi Tenggara.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        {/* Mobile Back Button */}
        <div className="absolute top-6 left-6 lg:hidden">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors text-sm font-medium bg-slate-100 px-3 py-1.5 rounded-full">
            <ArrowLeft className="w-4 h-4" />
            Beranda
          </Link>
        </div>

        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left space-y-2">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Selamat Datang</h2>
            <p className="text-slate-500">Silakan masuk ke akun Anda untuk melanjutkan.</p>
          </div>

          {error && lockoutSeconds === null && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-xs text-rose-800 animate-in fade-in">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Gagal Masuk</span>
                <span>{error}</span>
              </div>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleLogin}>
            <div className="space-y-4">
              {/* Email/NIK Input */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 block">Email atau NIK</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="w-5 h-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    required
                    disabled={lockoutSeconds !== null && lockoutSeconds > 0}
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-900 font-normal placeholder:font-normal placeholder:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Masukkan Email atau NIK Anda"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 block">Kata Sandi</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-slate-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    disabled={lockoutSeconds !== null && lockoutSeconds > 0}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-900 font-normal placeholder:font-normal placeholder:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Masukkan kata sandi Anda"
                  />
                  <button
                    type="button"
                    disabled={lockoutSeconds !== null && lockoutSeconds > 0}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none disabled:opacity-50"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>



            {/* Submit Button */}
            <div className="space-y-3 pt-2">
              <button
                type="submit"
                disabled={loading || (lockoutSeconds !== null && lockoutSeconds > 0)}
                className="w-full py-3.5 px-4 bg-blue-900 hover:bg-blue-950 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Memproses...
                  </>
                ) : lockoutSeconds !== null && lockoutSeconds > 0 ? (
                  <>
                    <Clock className="w-4 h-4 animate-pulse" /> Tunggu ({formatCountdown(lockoutSeconds)})
                  </>
                ) : (
                  <>
                    Masuk ke Akun
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Registration Link */}
          <p className="text-center text-sm text-slate-500">
            Belum memiliki akun?{' '}
            <Link href="/register" className="font-bold text-blue-900 hover:text-blue-700 hover:underline underline-offset-4">
              Daftar Sekarang
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
