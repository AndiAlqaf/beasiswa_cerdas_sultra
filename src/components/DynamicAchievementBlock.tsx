'use client';

import React, { useRef } from 'react';
import { Plus, Trash2, Upload, Link as LinkIcon, FileCheck, X, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { DynamicAchievementItem } from '@/lib/achievementHelpers';

interface DynamicAchievementBlockProps {
  title: string;
  subtitle?: string;
  labelNama: string;
  placeholderNama: string;
  items: DynamicAchievementItem[];
  onChange: (items: DynamicAchievementItem[]) => void;
  addButtonText: string;
  showBuktiAkademik?: boolean;
  showBuktiNonAkademik?: boolean;
}

export default function DynamicAchievementBlock({
  title,
  subtitle = 'Tambahkan riwayat yang pernah Anda peroleh. (Kosongkan jika tidak ada)',
  labelNama,
  placeholderNama,
  items,
  onChange,
  addButtonText,
  showBuktiAkademik = false,
  showBuktiNonAkademik = false,
}: DynamicAchievementBlockProps) {
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const handleItemChange = (id: string, field: keyof DynamicAchievementItem, value: string) => {
    const updated = items.map((item) => (item.id === id ? { ...item, [field]: value } : item));
    onChange(updated);
  };

  const handleFileUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran file foto sertifikat terlalu besar (Maksimum 5MB).');
      if (e.target) e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Data = event.target?.result as string;
      const updated = items.map((item) => (
        item.id === id ? { ...item, buktiFile: base64Data, buktiFileName: file.name } : item
      ));
      onChange(updated);
    };
    reader.readAsDataURL(file);
    if (e.target) e.target.value = '';
  };

  const handleRemoveFile = (id: string) => {
    const updated = items.map((item) => (
      item.id === id ? { ...item, buktiFile: '', buktiFileName: '' } : item
    ));
    onChange(updated);
  };

  const handleAddItem = () => {
    const newItem: DynamicAchievementItem = {
      id: Math.random().toString(36).substring(2, 9),
      nama: '',
      tahun: '',
      buktiFile: '',
      buktiFileName: '',
      buktiLink: '',
    };
    onChange([...items, newItem]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length === 1) {
      onChange([{ id: items[0].id, nama: '', tahun: '', buktiFile: '', buktiFileName: '', buktiLink: '' }]);
      return;
    }
    onChange(items.filter((item) => item.id !== id));
  };

  const safeItems = items && items.length > 0 ? items : [{ id: '1', nama: '', tahun: '', buktiFile: '', buktiFileName: '', buktiLink: '' }];

  return (
    <div className="space-y-3">
      <div>
        <h4 className="font-bold text-slate-900 text-sm sm:text-base">{title}</h4>
        <p className="text-xs text-slate-500 font-normal">{subtitle}</p>
      </div>

      <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 space-y-4">
        {safeItems.map((item, index) => {
          const hasProofFile = !!item.buktiFile;
          const hasProofLink = !!(item.buktiLink && item.buktiLink.trim());
          const isAcademicMissingProof = showBuktiAkademik && item.nama.trim() !== '' && !hasProofFile && !hasProofLink;

          return (
            <div
              key={item.id}
              className={`p-3.5 rounded-2xl bg-white border transition-all space-y-3 ${
                isAcademicMissingProof
                  ? 'border-rose-300 ring-2 ring-rose-100'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Row 1: Nama & Tahun & Hapus */}
              <div className="grid grid-cols-12 gap-3 items-center">
                <div className="col-span-8 sm:col-span-9">
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    {labelNama} #{index + 1}
                  </label>
                  <input
                    type="text"
                    value={item.nama}
                    onChange={(e) => handleItemChange(item.id, 'nama', e.target.value)}
                    placeholder={placeholderNama}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-normal text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#0B3A6A] focus:outline-none placeholder:text-slate-400"
                  />
                </div>
                <div className="col-span-3 sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1 text-center">Tahun</label>
                  <input
                    type="text"
                    maxLength={4}
                    value={item.tahun}
                    onChange={(e) => handleItemChange(item.id, 'tahun', e.target.value.replace(/\D/g, ''))}
                    placeholder="2025"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-center font-normal text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#0B3A6A] focus:outline-none placeholder:text-slate-400"
                  />
                </div>
                <div className="col-span-1 flex justify-center pt-5">
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(item.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Hapus Baris Ini"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Row 2: Upload Bukti Sertifikat / Link URL (Khusus Akademik & Non-Akademik) */}
              {(showBuktiAkademik || showBuktiNonAkademik) && (
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  {showBuktiAkademik && (
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                        <AlertCircle className={`w-3.5 h-3.5 ${isAcademicMissingProof ? 'text-rose-600' : 'text-blue-600'}`} />
                        Bukti Sertifikat / Karya (Wajib melampirkan minimal salah satu: Foto ATAU Link):
                      </span>
                      {(hasProofFile || hasProofLink) && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          ✓ Bukti Terisi
                        </span>
                      )}
                    </div>
                  )}

                  {showBuktiNonAkademik && (
                    <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                      Unggah Foto Sertifikat / Bukti Non-Akademik:
                    </span>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Upload Foto Sertifikat */}
                    <div>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        ref={(el) => { fileInputRefs.current[item.id] = el; }}
                        onChange={(e) => handleFileUpload(item.id, e)}
                        className="hidden"
                      />
                      {item.buktiFile ? (
                        <div className="flex items-center justify-between p-2.5 bg-emerald-50/80 border border-emerald-200 rounded-xl text-xs text-emerald-900">
                          <div className="flex items-center gap-2 truncate">
                            <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span className="truncate font-semibold text-[11px]">{item.buktiFileName || 'Foto_Sertifikat.jpg'}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveFile(item.id)}
                            className="p-1 text-emerald-700 hover:text-rose-600 transition-colors ml-2"
                            title="Hapus foto"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => fileInputRefs.current[item.id]?.click()}
                          className={`w-full py-2 px-3 border border-dashed rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                            isAcademicMissingProof
                              ? 'bg-rose-50/50 border-rose-300 text-rose-700 hover:bg-rose-100/50'
                              : 'bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Unggah Foto Sertifikat (PDF/JPG)</span>
                        </button>
                      )}
                    </div>

                    {/* Link Bukti Sertifikat (Khusus Akademik) */}
                    {showBuktiAkademik && (
                      <div className="relative">
                        <LinkIcon className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="url"
                          value={item.buktiLink || ''}
                          onChange={(e) => handleItemChange(item.id, 'buktiLink', e.target.value)}
                          placeholder="https://link-karya-ilmiah-atau-sertifikat.com"
                          className={`w-full pl-9 pr-3 py-2 border rounded-xl text-xs font-normal text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#0B3A6A] focus:outline-none placeholder:text-slate-400 ${
                            isAcademicMissingProof
                              ? 'bg-rose-50/30 border-rose-300'
                              : 'bg-slate-50 border-slate-200'
                          }`}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="pt-1 flex justify-start">
        <button
          type="button"
          onClick={handleAddItem}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0B3A6A] hover:text-[#082a4d] transition-colors"
        >
          <Plus className="w-4 h-4" /> {addButtonText}
        </button>
      </div>
    </div>
  );
}
