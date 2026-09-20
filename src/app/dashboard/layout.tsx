'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FileText, Bell, LogOut, User, Menu, X, ShieldCheck, Download } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Pengumuman', href: '/dashboard/pengumuman', icon: Bell },
    { name: 'Pendaftaran', href: '/dashboard/daftar', icon: FileText },
    { name: 'Template Berkas', href: '/dashboard/template-berkas', icon: Download },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Mobile Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)}></div>
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-[#0B3A6A] text-white border-r border-[#134983] z-50 transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
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

        <div className="absolute bottom-0 left-0 w-full p-4 border-t border-[#134983]">
          <Link href="/login" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-rose-200 hover:bg-white/10 transition-colors">
            <LogOut className="w-5 h-5" />
            Keluar Akun
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 -ml-2 rounded-xl text-slate-600 hover:bg-slate-100">
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="hidden lg:block">
            <h1 className="text-xl font-bold text-slate-900">
              {navItems.find(item => item.href === pathname)?.name || 'Dashboard'}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 rounded-full text-slate-500 hover:bg-slate-100 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 border border-white rounded-full"></span>
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
              <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-900 flex items-center justify-center font-bold text-sm">
                AD
              </div>
              <div className="hidden sm:block text-sm">
                <p className="font-bold text-slate-900 leading-none">Ahmad Dani</p>
                <p className="text-xs text-slate-500 mt-1">S1 - Pendidikan</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
