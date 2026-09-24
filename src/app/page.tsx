'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Info, ShieldCheck, GraduationCap, Download, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

import Navbar from '@/components/Navbar';
import FlowchartDiagram from '@/components/FlowchartDiagram';
import PriorityPrograms from '@/components/PriorityPrograms';
import TimelineSection from '@/components/TimelineSection';
import FaqSection from '@/components/FaqSection';
import EligibilityChecker from '@/components/EligibilityChecker';
import Footer from '@/components/Footer';
import AnnouncementPopup from '@/components/AnnouncementPopup';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased">
      <AnnouncementPopup />
      <Navbar />

      {/* Hero / Splash Screen Section */}
      <section className="relative min-h-[90vh] flex items-center pt-20 overflow-hidden bg-slate-900">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transform scale-105"
          style={{ backgroundImage: 'url("/footage3.png")' }}
        ></div>
        <div className="absolute inset-0 z-0 bg-gradient-to-r from-slate-950 via-slate-900/90 to-transparent"></div>
        <div className="absolute inset-0 z-0 bg-black/50"></div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col items-start text-left">

          {/* Title */}
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-5xl sm:text-7xl lg:text-[5.5rem] font-black text-white tracking-tighter leading-[1] mb-8 max-w-4xl uppercase"
          >
            Wujudkan <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
              Masa Depan
            </span> <br />
            Sulawesi Tenggara
          </motion.h1>

          {/* Subtitle */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className="text-lg sm:text-xl text-slate-300 max-w-2xl mb-12 leading-relaxed font-light"
          >
            Program bantuan stimulan biaya pendidikan dari APBD Pemprov Sulawesi Tenggara selama 2 semester bagi mahasiswa aktif berprestasi jenjang D4/S1, S2, dan S3 yang berdedikasi tinggi dalam membangun daerah.
          </motion.p>

          {/* Action Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
          >
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-4 text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 transition-colors flex items-center justify-center gap-3 border border-blue-500 rounded-xl shadow-lg hover:shadow-xl group"
            >
              MASUK PORTAL
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/#jadwal"
              className="w-full sm:w-auto px-8 py-4 text-sm font-bold text-white border border-white/30 hover:border-white hover:bg-white/10 transition-colors flex items-center justify-center gap-3 rounded-xl backdrop-blur-sm group"
            >
              JADWAL SELEKSI
              <ArrowRight className="w-4 h-4 opacity-70 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Informative Sections */}
      <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true, amount: 0.1 }}>
        <FlowchartDiagram />
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true, amount: 0.1 }}>
        <PriorityPrograms />
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true, amount: 0.1 }}>
        <TimelineSection />
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true, amount: 0.1 }}>
        <FaqSection />
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true, amount: 0.1 }}>
        <EligibilityChecker />
      </motion.div>

      {/* Juknis Download Banner at bottom of Landing Page */}
      <motion.section 
        id="juknis"
        initial={{ opacity: 0, y: 50 }} 
        whileInView={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.6 }} 
        viewport={{ once: true, amount: 0.1 }}
        className="py-16 bg-slate-900 text-white border-t border-slate-800 relative overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="bg-gradient-to-r from-slate-800 via-blue-950 to-slate-800 border border-blue-500/30 rounded-3xl p-8 sm:p-12 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-8">
            
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
              <div className="w-20 h-20 rounded-2xl bg-blue-600/20 border border-blue-400/40 flex items-center justify-center text-blue-400 shrink-0 shadow-inner">
                <FileText className="w-10 h-10" />
              </div>
              <div className="space-y-2">
              
                <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Petunjuk Teknis Beasiswa Stimulan Sultra Cerdas
                </h3>
                <p className="text-slate-300 text-sm max-w-2xl leading-relaxed font-light">
                  Unduh dokumen resmi Petunjuk Teknis (Juknis) TA 2026 untuk mempelajari persyaratan lengkap, kriteria kelayakan, alur pendaftaran, 4 bidang program studi prioritas, serta format lampiran dokumen permohonan.
                </p>
              </div>
            </div>

            <div className="shrink-0 w-full sm:w-auto">
              <a
                href="/Petunjuk_Teknis_BSSC_2026.pdf"
                download="Petunjuk_Teknis_BSSC_2026.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-2xl shadow-xl hover:shadow-emerald-900/50 transition-all flex items-center justify-center gap-3 border border-emerald-400 text-sm sm:text-base group"
              >
                <Download className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span>UNDUH DOKUMEN JUKNIS (PDF)</span>
              </a>
            </div>

          </div>
        </div>
      </motion.section>

      <Footer />
    </main>
  );
}
