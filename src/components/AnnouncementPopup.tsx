'use client';

import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';

export default function AnnouncementPopup() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Tampilkan popup setelah delay singkat agar animasi terlihat smooth
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={() => setIsOpen(false)}
      ></div>
      
      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8 sm:p-10 animate-in zoom-in-95 duration-200">
        <button 
          onClick={() => setIsOpen(false)}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          aria-label="Tutup popup"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-blue-50 border-4 border-blue-100 rounded-full flex items-center justify-center mb-6 shadow-sm">
            <AlertCircle className="w-8 h-8 text-blue-600" />
          </div>
          
          <h2 className="text-2xl font-extrabold text-slate-900 mb-6 tracking-tight">Informasi Penting</h2>
          
          <div className="space-y-4 text-slate-700">
            <p className="font-bold text-lg text-slate-900 leading-snug">
              Seluruh proses pendaftaran tidak dipungut biaya.
            </p>
            <p className="text-sm sm:text-base leading-relaxed text-slate-600">
              Peserta tidak dikenakan biaya dalam bentuk apa pun selama proses pendaftaran.<br className="hidden sm:block" /> Harap berhati-hati terhadap pihak yang meminta sejumlah uang dengan mengatasnamakan penyelenggara.
            </p>
          </div>
          
          <button 
            onClick={() => setIsOpen(false)}
            className="mt-8 w-full py-3.5 px-4 bg-blue-900 hover:bg-blue-950 text-white font-bold rounded-xl transition-colors shadow-md hover:shadow-lg"
          >
            Saya Mengerti
          </button>
        </div>
      </div>
    </div>
  );
}
