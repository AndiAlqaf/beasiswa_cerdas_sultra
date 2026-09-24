'use client';

import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { DynamicAchievementItem } from '@/lib/achievementHelpers';

interface DynamicAchievementBlockProps {
  title: string;
  subtitle?: string;
  labelNama: string;
  placeholderNama: string;
  items: DynamicAchievementItem[];
  onChange: (items: DynamicAchievementItem[]) => void;
  addButtonText: string;
}

export default function DynamicAchievementBlock({
  title,
  subtitle = 'Tambahkan riwayat yang pernah Anda peroleh. (Kosongkan jika tidak ada)',
  labelNama,
  placeholderNama,
  items,
  onChange,
  addButtonText,
}: DynamicAchievementBlockProps) {
  const handleItemChange = (id: string, field: 'nama' | 'tahun', value: string) => {
    const updated = items.map((item) => (item.id === id ? { ...item, [field]: value } : item));
    onChange(updated);
  };

  const handleAddItem = () => {
    const newItem: DynamicAchievementItem = {
      id: Math.random().toString(36).substring(2, 9),
      nama: '',
      tahun: '',
    };
    onChange([...items, newItem]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length === 1) {
      onChange([{ id: items[0].id, nama: '', tahun: '' }]);
      return;
    }
    onChange(items.filter((item) => item.id !== id));
  };

  const safeItems = items && items.length > 0 ? items : [{ id: '1', nama: '', tahun: '' }];

  return (
    <div className="space-y-2">
      <div>
        <h4 className="font-bold text-slate-900 text-sm sm:text-base">{title}</h4>
        <p className="text-xs text-slate-500 font-normal">{subtitle}</p>
      </div>

      <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 space-y-3">
        <div className="grid grid-cols-12 gap-3 text-xs font-semibold text-slate-700 px-1">
          <div className="col-span-8 sm:col-span-9">{labelNama}</div>
          <div className="col-span-3 sm:col-span-2 text-center">Tahun</div>
          <div className="col-span-1 text-center"></div>
        </div>

        {safeItems.map((item) => (
          <div key={item.id} className="grid grid-cols-12 gap-3 items-center">
            <div className="col-span-8 sm:col-span-9">
              <input
                type="text"
                value={item.nama}
                onChange={(e) => handleItemChange(item.id, 'nama', e.target.value)}
                placeholder={placeholderNama}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-normal text-slate-900 focus:ring-2 focus:ring-[#0B3A6A] focus:outline-none placeholder:font-normal placeholder:text-slate-400"
              />
            </div>
            <div className="col-span-3 sm:col-span-2">
              <input
                type="text"
                maxLength={4}
                value={item.tahun}
                onChange={(e) => handleItemChange(item.id, 'tahun', e.target.value.replace(/\D/g, ''))}
                placeholder="2025"
                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono text-center font-medium text-slate-900 focus:ring-2 focus:ring-[#0B3A6A] focus:outline-none placeholder:font-normal placeholder:text-slate-400"
              />
            </div>
            <div className="col-span-1 flex justify-center">
              <button
                type="button"
                onClick={() => handleRemoveItem(item.id)}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                title="Hapus"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
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
