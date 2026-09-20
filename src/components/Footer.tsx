import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Mail, Globe, Phone, MapPin, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Col 1 & 2: Brand & Profile */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
                <ShieldCheck className="w-5 h-5 text-blue-200" />
              </div>
              <div>
                <span className="font-bold text-white text-lg tracking-tight">
                  Beasiswa Sultra Cerdas 2026
                </span>
                <p className="text-xs text-slate-400">Pemerintah Provinsi Sulawesi Tenggara</p>
              </div>
            </div>

            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              Program bantuan stimulan biaya pendidikan bagi mahasiswa aktif jenjang S1/D4, S2, dan S3 asal Sulawesi Tenggara untuk meningkatkan kualitas sumber daya manusia daerah.
            </p>

            <div className="pt-2 flex flex-col space-y-2 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Kantor Gubernur Sulawesi Tenggara, Kompleks Bumi Praja Anduonohu, Kendari</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-400 shrink-0" />
                <a
                  href="https://www.akusahabatrakyat.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white underline underline-offset-4 flex items-center gap-1"
                >
                  www.akusahabatrakyat.com
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          {/* Col 3: Navigation */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-4">
              Navigasi Utam
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Beranda
                </Link>
              </li>
              <li>
                <Link href="/#alur-pendaftaran" className="hover:text-white transition-colors">
                  Alur & Flowchart Pendaftaran
                </Link>
              </li>
              <li>
                <Link href="/#cek-kelayakan" className="hover:text-white transition-colors">
                  Cek Kelayakan Studi
                </Link>
              </li>
              <li>
                <Link href="/#program-prioritas" className="hover:text-white transition-colors">
                  4 Bidang Prioritas
                </Link>
              </li>
              <li>
                <Link href="/#jadwal" className="hover:text-white transition-colors">
                  Jadwal Seleksi 2026
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Layanan Pendaftar */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-4">
              Layanan Pendaftar
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/daftar" className="hover:text-white transition-colors font-medium text-blue-400">
                  Formulir Pendaftaran
                </Link>
              </li>
              <li>
                <Link href="/cek-status" className="hover:text-white transition-colors">
                  Cek Status Kelulusan
                </Link>
              </li>
              <li>
                <Link href="/unduh-template" className="hover:text-white transition-colors">
                  Download Template Surat
                </Link>
              </li>
              <li>
                <Link href="/#faq" className="hover:text-white transition-colors">
                  Pertanyaan FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 5: Syarat Jenjang */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-4">
              Kategori Jenjang
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li className="flex flex-col">
                <span className="text-white font-medium">S1 / D4</span>
                <span className="text-xs text-slate-400">Semester 3–5 (IPK Min 3.25)</span>
              </li>
              <li className="flex flex-col">
                <span className="text-white font-medium">S2 (Magister)</span>
                <span className="text-xs text-slate-400">Semester 2–3 (IPK Min 3.50)</span>
              </li>
              <li className="flex flex-col">
                <span className="text-white font-medium">S3 (Doktor)</span>
                <span className="text-xs text-slate-400">Semester 2–5 (IPK Min 3.50)</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 Pemerintah Provinsi Sulawesi Tenggara. All rights reserved.</p>
          <p className="flex items-center gap-4">
            <span>Hak Cipta Portal Resmi Beasiswa Stimulan Sultra Cerdas</span>
            <span>•</span>
            <span>APBD TA 2026</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
