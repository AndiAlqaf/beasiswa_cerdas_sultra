'use client';

import React, { useEffect, useState } from 'react';
import { User, Mail, CreditCard, MapPin, Calendar, GraduationCap, Phone, Edit, Loader2, AlertCircle } from 'lucide-react';
import { getUser, fetchAPI } from '@/lib/api';
import Link from 'next/link';

export default function ProfilPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cachedUser = getUser();
    if (cachedUser) setUser(cachedUser);

    async function loadProfile() {
      try {
        const profileRes = await fetchAPI('/applicant/profile');
        if (profileRes?.success && profileRes?.data) {
          setUser({
            ...cachedUser,
            ...profileRes.data.user,
            ...(profileRes.data.profile || {}),
          });
        }
      } catch (err) {
        console.warn('Profile load error:', err);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  if (loading && !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
        <p>Memuat profil Anda...</p>
      </div>
    );
  }

  const userInitials = user?.namaLengkap
    ? user.namaLengkap.split(' ').map((n: string) => n[0]).filter(Boolean).join('').substring(0, 2).toUpperCase()
    : 'U';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Profil Saya</h1>
          <p className="text-slate-500 text-sm mt-1">Kelola informasi pribadi dan biodata Anda.</p>
        </div>
        <Link 
          href="/dashboard/daftar"
          className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 font-semibold rounded-xl text-sm border border-blue-200 hover:bg-blue-100 transition-colors"
        >
          <Edit className="w-4 h-4" />
          Ubah di Pendaftaran
        </Link>
      </div>

      {/* Identitas Utama Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-32 bg-[#0B3A6A]"></div>
        
        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-end gap-6 mt-12">
          <div className="w-32 h-32 bg-white rounded-full p-2 shadow-lg shrink-0">
            <div className="w-full h-full bg-blue-100 rounded-full flex items-center justify-center text-4xl font-black text-blue-900 border-4 border-slate-50">
              {userInitials}
            </div>
          </div>
          <div className="text-center sm:text-left flex-1 pb-2">
            <h2 className="text-2xl font-bold text-slate-900">{user?.namaLengkap || 'Nama Tidak Tersedia'}</h2>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-2 text-sm text-slate-600 font-medium">
              <span className="flex items-center gap-1.5"><Mail className="w-4 h-4 text-slate-400" /> {user?.email}</span>
              <span className="flex items-center gap-1.5"><CreditCard className="w-4 h-4 text-slate-400" /> NIK: {user?.nik}</span>
            </div>
          </div>
          <div className="pb-2">
            <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-50 border border-blue-100 text-blue-700 font-bold text-sm">
              <GraduationCap className="w-4 h-4" />
              Jenjang {user?.jenjangTarget || '-'}
            </span>
          </div>
        </div>
      </div>

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
              <p className="text-sm font-medium text-slate-500 mb-1">Tempat, Tanggal Lahir</p>
              <p className="font-semibold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                {user?.tempatLahir || '-'}, {user?.tanggalLahir ? new Date(user.tanggalLahir).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
              </p>
            </div>
            
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Jenis Kelamin</p>
              <p className="font-semibold text-slate-900">{user?.gender || '-'}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Status Pernikahan</p>
              <p className="font-semibold text-slate-900">{user?.statusPernikahan || '-'}</p>
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
              <p className="text-sm font-medium text-slate-500 mb-1">Nomor Handphone (WhatsApp)</p>
              <p className="font-semibold text-slate-900 flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400" />
                {user?.noHp || '-'}
              </p>
            </div>
            
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Alamat Domisili Lengkap</p>
              <p className="font-semibold text-slate-900 leading-relaxed">
                {user?.alamatDomisili || '-'}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <p className="text-sm text-blue-800 leading-relaxed">
          <strong>Pemberitahuan:</strong> Profil Anda otomatis terhubung dengan formulir pendaftaran beasiswa. Untuk mengubah data profil, Anda dapat melakukannya saat mengisi form Pendaftaran.
        </p>
      </div>
    </div>
  );
}
