'use client';

import React, { useEffect, useState } from 'react';
import { User, Mail, CreditCard, MapPin, Calendar, GraduationCap, Phone, Edit, Loader2, AlertCircle, Save, X, CheckCircle2 } from 'lucide-react';
import { getUser, fetchAPI } from '@/lib/api';

export default function ProfilPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Edit Form State
  const [editForm, setEditForm] = useState({
    namaLengkap: '',
    tempatLahir: '',
    tanggalLahir: '',
    gender: 'Laki-laki',
    statusPernikahan: 'Belum Menikah',
    noHp: '',
    alamatDomisili: '',
    noKk: '',
    alamatKtp: '',
  });

  const loadProfile = async () => {
    try {
      const cachedUser = getUser();
      if (cachedUser) setUser(cachedUser);

      const profileRes = await fetchAPI('/applicant/profile');
      if (profileRes?.success && profileRes?.data) {
        const fullUser = {
          ...cachedUser,
          ...profileRes.data.user,
          ...(profileRes.data.profile || {}),
        };
        setUser(fullUser);
        setEditForm({
          namaLengkap: fullUser.namaLengkap || '',
          tempatLahir: fullUser.tempatLahir || '',
          tanggalLahir: fullUser.tanggalLahir ? fullUser.tanggalLahir.split('T')[0] : '',
          gender: fullUser.gender || 'Laki-laki',
          statusPernikahan: fullUser.statusPernikahan || 'Belum Menikah',
          noHp: fullUser.noHp || '',
          alamatDomisili: fullUser.alamatDomisili || '',
          noKk: fullUser.noKk || '',
          alamatKtp: fullUser.alamatKtp || '',
        });
      }
    } catch (err) {
      console.warn('Profile load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleOpenEdit = () => {
    if (user) {
      setEditForm({
        namaLengkap: user.namaLengkap || '',
        tempatLahir: user.tempatLahir || '',
        tanggalLahir: user.tanggalLahir ? user.tanggalLahir.split('T')[0] : '',
        gender: user.gender || 'Laki-laki',
        statusPernikahan: user.statusPernikahan || 'Belum Menikah',
        noHp: user.noHp || '',
        alamatDomisili: user.alamatDomisili || '',
        noKk: user.noKk || '',
        alamatKtp: user.alamatKtp || '',
      });
    }
    setIsEditing(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetchAPI('/applicant/profile', {
        method: 'PUT',
        body: JSON.stringify(editForm),
      });

      if (res.success) {
        setToastMessage('Profil berhasil diperbarui!');
        setIsEditing(false);
        await loadProfile();
      }
    } catch (err: any) {
      alert(err.message || 'Gagal memperbarui profil.');
    } finally {
      setSaving(false);
    }
  };

  if (loading && !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
        <p className="text-sm font-medium">Memuat profil Anda...</p>
      </div>
    );
  }

  const userInitials = user?.namaLengkap
    ? user.namaLengkap.split(' ').map((n: string) => n[0]).filter(Boolean).join('').substring(0, 2).toUpperCase()
    : 'U';

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Toast Success */}
      {toastMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-emerald-800 text-sm shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-emerald-600 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Profil Saya</h1>
          <p className="text-slate-500 text-sm mt-1 font-normal">Kelola informasi pribadi, biodata, dan alamat domisili Anda.</p>
        </div>
        <button 
          onClick={handleOpenEdit}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#0B3A6A] hover:bg-[#082a4d] text-white font-medium rounded-xl text-sm transition-all shadow-sm"
        >
          <Edit className="w-4 h-4" />
          Edit Profil
        </button>
      </div>

      {/* Identitas Utama Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-32 bg-[#0B3A6A]"></div>
        
        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-end gap-6 mt-12">
          <div className="w-32 h-32 bg-white rounded-full p-2 shadow-lg shrink-0">
            <div className="w-full h-full bg-blue-100 rounded-full flex items-center justify-center text-4xl font-extrabold text-blue-900 border-4 border-slate-50">
              {userInitials}
            </div>
          </div>
          <div className="text-center sm:text-left flex-1 pb-2">
            <h2 className="text-2xl font-bold text-slate-900">{user?.namaLengkap || 'Nama Tidak Tersedia'}</h2>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-2 text-sm text-slate-600 font-normal">
              <span className="flex items-center gap-1.5"><Mail className="w-4 h-4 text-slate-400" /> {user?.email}</span>
              <span className="flex items-center gap-1.5"><CreditCard className="w-4 h-4 text-slate-400" /> NIK: {user?.nik}</span>
            </div>
          </div>
          <div className="pb-2">
            <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-50 border border-blue-100 text-blue-700 font-semibold text-sm">
              <GraduationCap className="w-4 h-4" />
              Jenjang {user?.jenjangTarget || '-'}
            </span>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Biodata Diri */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <User className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg">Biodata Pribadi</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <p className="text-xs font-normal text-slate-500 mb-1">Tempat, Tanggal Lahir</p>
              <p className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                {user?.tempatLahir || '-'}{user?.tanggalLahir ? `, ${new Date(user.tanggalLahir).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}` : ''}
              </p>
            </div>
            
            <div>
              <p className="text-xs font-normal text-slate-500 mb-1">Jenis Kelamin</p>
              <p className="font-semibold text-slate-900 text-sm">{user?.gender || '-'}</p>
            </div>

            <div>
              <p className="text-xs font-normal text-slate-500 mb-1">Status Pernikahan</p>
              <p className="font-semibold text-slate-900 text-sm">{user?.statusPernikahan || '-'}</p>
            </div>

            <div>
              <p className="text-xs font-normal text-slate-500 mb-1">Nomor Kartu Keluarga (KK)</p>
              <p className="font-semibold text-slate-900 text-sm font-mono">{user?.noKk || '-'}</p>
            </div>
          </div>
        </div>

        {/* Informasi Kontak */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg">Kontak & Alamat</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <p className="text-xs font-normal text-slate-500 mb-1">Nomor Handphone (WhatsApp)</p>
              <p className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400" />
                {user?.noHp || '-'}
              </p>
            </div>
            
            <div>
              <p className="text-xs font-normal text-slate-500 mb-1">Alamat Domisili Lengkap</p>
              <p className="font-medium text-slate-900 text-sm leading-relaxed">
                {user?.alamatDomisili || '-'}
              </p>
            </div>

            <div>
              <p className="text-xs font-normal text-slate-500 mb-1">Alamat Sesuai KTP</p>
              <p className="font-medium text-slate-900 text-sm leading-relaxed">
                {user?.alamatKtp || '-'}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <p className="text-xs text-blue-800 leading-relaxed font-normal">
          <strong>Pemberitahuan:</strong> Perubahan data profil pada halaman ini akan secara otomatis tersimpan dan menyelaraskan formulir pendaftaran beasiswa Anda.
        </p>
      </div>

      {/* EDIT PROFILE MODAL */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8 border border-slate-100 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-50 text-[#0B3A6A] rounded-xl">
                  <Edit className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Edit Data Profil</h3>
                  <p className="text-xs text-slate-500 font-normal">Perbarui informasi biodata dan kontak Anda.</p>
                </div>
              </div>
              <button 
                onClick={() => setIsEditing(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Nama Lengkap (Sesuai KTP)</label>
                <input 
                  type="text"
                  required
                  value={editForm.namaLengkap}
                  onChange={(e) => setEditForm(prev => ({ ...prev, namaLengkap: e.target.value }))}
                  placeholder="Masukkan nama lengkap Anda"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 font-normal placeholder:font-normal placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-[#0B3A6A] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Tempat Lahir</label>
                  <input 
                    type="text"
                    required
                    value={editForm.tempatLahir}
                    onChange={(e) => setEditForm(prev => ({ ...prev, tempatLahir: e.target.value }))}
                    placeholder="Contoh: Kendari"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 font-normal placeholder:font-normal placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-[#0B3A6A] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Tanggal Lahir</label>
                  <input 
                    type="date"
                    required
                    value={editForm.tanggalLahir}
                    onChange={(e) => setEditForm(prev => ({ ...prev, tanggalLahir: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 font-normal focus:bg-white focus:ring-2 focus:ring-[#0B3A6A] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Jenis Kelamin</label>
                  <select 
                    value={editForm.gender}
                    onChange={(e) => setEditForm(prev => ({ ...prev, gender: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 font-normal focus:bg-white focus:ring-2 focus:ring-[#0B3A6A] focus:outline-none"
                  >
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Status Pernikahan</label>
                  <select 
                    value={editForm.statusPernikahan}
                    onChange={(e) => setEditForm(prev => ({ ...prev, statusPernikahan: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 font-normal focus:bg-white focus:ring-2 focus:ring-[#0B3A6A] focus:outline-none"
                  >
                    <option value="Belum Menikah">Belum Menikah</option>
                    <option value="Menikah">Menikah</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Nomor Handphone / WhatsApp</label>
                  <input 
                    type="text"
                    required
                    value={editForm.noHp}
                    onChange={(e) => setEditForm(prev => ({ ...prev, noHp: e.target.value }))}
                    placeholder="Contoh: +62 882020802944"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 font-normal placeholder:font-normal placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-[#0B3A6A] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Nomor Kartu Keluarga (KK)</label>
                  <input 
                    type="text"
                    maxLength={16}
                    value={editForm.noKk}
                    onChange={(e) => setEditForm(prev => ({ ...prev, noKk: e.target.value.replace(/\D/g, '') }))}
                    placeholder="16 digit No. KK"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 font-normal placeholder:font-normal placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-[#0B3A6A] focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Alamat Domisili Lengkap</label>
                <textarea 
                  rows={2}
                  required
                  value={editForm.alamatDomisili}
                  onChange={(e) => setEditForm(prev => ({ ...prev, alamatDomisili: e.target.value }))}
                  placeholder="Isi alamat domisili saat ini"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 font-normal placeholder:font-normal placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-[#0B3A6A] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Alamat Sesuai KTP</label>
                <textarea 
                  rows={2}
                  value={editForm.alamatKtp}
                  onChange={(e) => setEditForm(prev => ({ ...prev, alamatKtp: e.target.value }))}
                  placeholder="Isi alamat persis sesuai KTP"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 font-normal placeholder:font-normal placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-[#0B3A6A] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-[#0B3A6A] hover:bg-[#082a4d] rounded-xl transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
