'use client';

import React, { useState } from 'react';
import { FAQ_DATA } from '@/data/bsscData';
import { HelpCircle, Search, ChevronDown, ChevronUp } from 'lucide-react';

export default function FaqSection() {
  const [activeCategory, setActiveCategory] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedId, setExpandedId] = useState<string | null>('faq-1');

  const categories = ['Semua', 'Tentang BSSC', 'Cek Kelayakan', 'Program Studi Prioritas', 'Dokumen Persyaratan', 'Beasiswa Lain & Double Funding', 'Besaran & Penyaluran'];

  const filteredFaqs = FAQ_DATA.filter((faq) => {
    const matchesCategory = activeCategory === 'Semua' || faq.category === activeCategory;
    const matchesQuery =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  return (
    <section id="faq" className="py-20 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Frequently Asked Questions (FAQ) BSSC 2026
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Jawaban lengkap atas pertanyaan yang sering diajukan seputar syarat, formulir, berkas, dan ketentuan Beasiswa Stimulan Sultra Cerdas.
          </p>

          {/* Search Box */}
          <div className="pt-4 max-w-xl mx-auto">
            <div className="relative">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari pertanyaan... (cth: IPK, KTP, Double Funding, Termin)"
                className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:ring-2 focus:ring-blue-900 focus:outline-none shadow-xs"
              />
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeCategory === cat
                    ? 'bg-blue-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ Accordion List */}
        <div className="max-w-4xl mx-auto space-y-3">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq) => {
              const isOpen = expandedId === faq.id;
              return (
                <div
                  key={faq.id}
                  className={`border rounded-2xl transition-all ${
                    isOpen ? 'bg-slate-50 border-blue-200 shadow-xs' : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <button
                    onClick={() => setExpandedId(isOpen ? null : faq.id)}
                    className="w-full text-left p-5 flex items-center justify-between gap-4 focus:outline-none"
                  >
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase tracking-wider font-extrabold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                        {faq.category}
                      </span>
                      <h3 className="font-bold text-slate-900 text-base leading-snug">{faq.question}</h3>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 text-slate-500">
                      {isOpen ? <ChevronUp className="w-4 h-4 text-blue-900" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-slate-600 text-xs sm:text-sm leading-relaxed whitespace-pre-line border-t border-slate-200/60 mt-1">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-200">
              <p className="text-slate-500 text-sm">Tidak ada pertanyaan yang sesuai dengan kata kunci pencarian Anda.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
