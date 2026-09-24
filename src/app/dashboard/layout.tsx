'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FileText, Bell, LogOut, User, Menu, X, ShieldCheck, Download } from 'lucide-react';
import { getUser, fetchAPI, clearTokens } from '@/lib/api';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const cachedUser = getUser();
    if (cachedUser) {
      setUser(cachedUser);
    }
    
    fetchAPI('/applicant/profile')
      .then((res) => {
        if (res.success && res.data?.user) {
          setUser({
            ...cachedUser,
            ...res.data.user,
            ...(res.data.profile || {}),
          });
        }
      })
      .catch((err) => {
        console.warn('DashboardLayout profile load error:', err.message);
      });

    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    clearTokens();
    window.location.href = '/login';
  };

  const userName = user?.namaLengkap || user?.email || 'Memuat...';
  const userInitials = userName !== 'Memuat...' 
    ? userName.split(' ').map((n: string) => n[0]).filter(Boolean).join('').substring(0, 2).toUpperCase()
    : 'U';
  const userJenjang = user?.jenjangTarget ? `Jenjang ${user.jenjangTarget}` : 'Peserta Beasiswa';

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Profil', href: '/dashboard/profil', icon: User },
    { name: 'Pengumuman', href: '/dashboard/pengumuman', icon: Bell },
    { name: 'Pendaftaran', href: '/dashboard/daftar', icon: FileText },
    { name: 'Template Berkas', href: '/dashboard/template-berkas', icon: Download },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-x-hidden">
      {/* Sidebar Mobile Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)}></div>
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-[#0B3A6A] text-white border-r border-[#134983] z-50 transform transition-transform duration-300 lg:translate-x-0 print:hidden ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 flex items-center justify-between border-b border-[#134983]">
          <Link href="/" className="flex items-center gap-3 group">
            <img src="/logo sultra.webp" alt="Pemprov Sultra" className="w-10 h-10 object-contain shrink-0 bg-white rounded-full p-1" />
            <div className="flex flex-col">
              <span className="font-bold text-blue-200 tracking-tight text-[9px] leading-none uppercase">
                Pemerintah Provinsi
              </span>
              <span className="font-black text-white text-xs tracking-tight whitespace-nowrap uppercase leading-none mt-0.5">
                Sulawesi Tenggara
              </span>
            </div>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 text-blue-200 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="mt-2 px-4 flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${isActive ? 'bg-[#154B86] text-white shadow-sm' : 'text-blue-100 hover:bg-[#134983] hover:text-white'}`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-blue-200'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen min-w-0 max-w-full print:ml-0 print:p-0">
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-30 print:hidden">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 -ml-2 rounded-xl text-slate-600 hover:bg-slate-100">
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="hidden lg:block">
            <h1 className="text-xl font-bold text-slate-900">
              {navItems.find(item => item.href === pathname)?.name || 'Dashboard'}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative" ref={notificationsRef}>
              <button 
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className={`relative p-2 rounded-full transition-colors ${notificationsOpen ? 'bg-slate-100 text-blue-600' : 'text-slate-500 hover:bg-slate-100'}`}
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 border border-white rounded-full"></span>
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-slate-100 py-2 z-50 origin-top-right">
                  {/* Dropdown Pointer Arrow */}
                  <div className="absolute -top-2 right-3 w-4 h-4 bg-white border-t border-l border-slate-100 transform rotate-45"></div>
                  
                  <div className="px-4 py-3 border-b border-slate-100 relative z-10 flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 text-sm">Notifikasi</h3>
                    <span className="text-xs bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full font-semibold">2 Baru</span>
                  </div>
                  
                  <div className="max-h-[300px] overflow-y-auto relative z-10">
                    <Link href="/dashboard/pengumuman" onClick={() => setNotificationsOpen(false)} className="block px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <p className="text-sm font-semibold text-slate-900 mb-1">Pengumuman Seleksi Administrasi</p>
                      <p className="text-xs text-slate-500 line-clamp-2">Hasil seleksi tahap awal akan diumumkan melalui portal ini. Pastikan Anda mengecek secara berkala.</p>
                      <p className="text-[10px] text-slate-400 mt-2 font-medium">15 Okt 2026</p>
                    </Link>
                    <Link href="/dashboard/pengumuman" onClick={() => setNotificationsOpen(false)} className="block px-4 py-3 hover:bg-slate-50 transition-colors">
                      <p className="text-sm font-semibold text-slate-900 mb-1">Masa Sanggah Dibuka</p>
                      <p className="text-xs text-slate-500 line-clamp-2">Periode pengajuan banding khusus bagi pendaftar yang tidak lolos seleksi administrasi awal.</p>
                      <p className="text-[10px] text-slate-400 mt-2 font-medium">16 Okt 2026</p>
                    </Link>
                  </div>
                  
                  <div className="px-4 py-2 border-t border-slate-100 relative z-10">
                    <Link href="/dashboard/pengumuman" onClick={() => setNotificationsOpen(false)} className="block text-center text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors py-1">
                      Lihat Semua Notifikasi
                    </Link>
                  </div>
                </div>
              )}
            </div>
            <div className="relative" ref={profileRef}>
              <button 
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-3 pl-4 border-l border-slate-200 hover:opacity-80 transition-opacity text-left h-full py-2"
              >
                <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-900 flex items-center justify-center font-bold text-sm">
                  {userInitials}
                </div>
                <div className="hidden sm:block text-sm">
                  <p className="font-bold text-slate-900 leading-none">{userName}</p>
                  <p className="text-xs text-slate-500 mt-1">{userJenjang}</p>
                </div>
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-slate-100 py-2 z-50 origin-top-right">
                  {/* Dropdown Pointer Arrow */}
                  <div className="absolute -top-2 right-8 w-4 h-4 bg-white border-t border-l border-slate-100 transform rotate-45"></div>
                  
                  <div className="px-4 py-2 border-b border-slate-100 mb-1 sm:hidden relative z-10">
                    <p className="font-bold text-slate-900 text-sm truncate">{userName}</p>
                    <p className="text-xs text-slate-500">{userJenjang}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-colors text-left relative z-10"
                  >
                    <LogOut className="w-4 h-4" />
                    Keluar Akun
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-3 sm:p-8 min-w-0 max-w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
