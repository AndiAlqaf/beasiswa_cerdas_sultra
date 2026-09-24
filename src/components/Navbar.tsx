'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck, Menu, X, ArrowRight, Search } from 'lucide-react';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeHash, setActiveHash] = useState('');
  const pathname = usePathname();

  useEffect(() => {
    // Set initial hash on load
    if (typeof window !== 'undefined') {
      setActiveHash(window.location.hash);
    }

    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }

      // ScrollSpy logic
      if (pathname === '/') {
        // Must match exact DOM order of navbar items: alur -> program -> jadwal -> faq
        const sections = ['alur-pendaftaran', 'program-prioritas', 'jadwal', 'faq'];
        if (window.scrollY < 100) {
          setActiveHash('');
          return;
        }

        let current = '';
        for (const section of sections) {
          const el = document.getElementById(section);
          if (el) {
            const rect = el.getBoundingClientRect();
            // Trigger when section top is within 400px of viewport top
            if (rect.top <= 400) {
              current = `#${section}`;
            }
          }
        }
        
        // Always update, even if current is empty (meaning we scrolled up past the first section)
        setActiveHash(current);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pathname]);

  const navLinks = [
    { name: 'Beranda', href: '/' },
    { name: 'Alur & Syarat', href: '/#alur-pendaftaran' },
    { name: 'Program Prioritas', href: '/#program-prioritas' },
    { name: 'Jadwal Seleksi', href: '/#jadwal' },
    { name: 'Pengumuman', href: '/pengumuman' },
    { name: 'FAQ', href: '/#faq' },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('/#') && pathname === '/') {
      e.preventDefault();
      const targetId = href.replace('/#', '');
      const elem = document.getElementById(targetId);
      if (elem) {
        elem.scrollIntoView({ behavior: 'smooth' });
        window.history.pushState(null, '', `/#${targetId}`);
        setActiveHash(`#${targetId}`);
      }
      setMobileMenuOpen(false);
    } else if (href === '/') {
      if (pathname === '/') {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        window.history.pushState(null, '', '/');
        setActiveHash('');
        setMobileMenuOpen(false);
      }
    }
  };

  const isLinkActive = (href: string) => {
    if (pathname === href && href !== '/') return true;
    if (pathname === '/') {
      if (href === '/') return activeHash === '' || activeHash === '#';
      if (href.startsWith('/#')) return href === `/${activeHash}`;
    }
    return false;
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-200/80 py-2.5'
          : 'bg-white border-b border-slate-100 py-3.5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          {/* Logo & Brand Identity */}
          <Link href="/" className="flex items-center gap-3 shrink-0 group">
            <img src="/logo sultra.webp" alt="Pemprov Sultra" className="w-10 h-10 object-contain transition-transform group-hover:scale-105 shrink-0" />
            <div className="flex flex-col justify-center">
              <span className="font-bold text-slate-600 tracking-tight text-[10px] sm:text-xs leading-none uppercase">
                Pemerintah Provinsi
              </span>
              <span className="font-black text-slate-900 text-sm sm:text-base tracking-tight whitespace-nowrap uppercase leading-none mt-0.5">
                Sulawesi Tenggara
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-1 xl:gap-2">
            {navLinks.map((link) => {
              const isActive = isLinkActive(link.href);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? 'text-blue-900 font-bold bg-blue-50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Medium-to-Large Navigation fallback (1024px - 1279px) */}
          <nav className="hidden lg:flex xl:hidden items-center gap-1">
            {navLinks.slice(0, 5).map((link) => {
              const isActive = isLinkActive(link.href);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? 'text-blue-900 font-bold bg-blue-50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Action CTAs */}
          <div className="hidden sm:flex items-center gap-2 sm:gap-3 shrink-0">
            <Link
              href="/cek-status"
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-blue-900 hover:bg-slate-100 transition-all flex items-center gap-1.5 border border-slate-200 shadow-2xs whitespace-nowrap"
            >
              <Search className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>Cek Status</span>
            </Link>

            <Link
              href="/login"
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-900 hover:bg-blue-950 shadow-xs transition-all hover:shadow flex items-center gap-1.5 group whitespace-nowrap"
            >
              <span>Masuk Portal</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 shrink-0" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none shrink-0"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-3 shadow-xl animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col space-y-1">
            {navLinks.map((link) => {
              const isActive = isLinkActive(link.href);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    isActive
                      ? 'text-blue-900 bg-blue-50'
                      : 'text-slate-700 hover:text-blue-900 hover:bg-slate-50'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <Link
              href="/cek-status"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full px-4 py-2.5 rounded-xl text-center font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 text-xs"
            >
              <Search className="w-4 h-4" />
              Cek Status Pendaftaran
            </Link>
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full px-4 py-2.5 rounded-xl text-center font-bold text-white bg-blue-900 hover:bg-blue-950 transition-colors flex items-center justify-center gap-2 text-xs"
            >
              Masuk Portal Mahasiswa
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
