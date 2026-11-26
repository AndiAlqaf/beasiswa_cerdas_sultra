'use client';

import React from 'react';
import { Printer, X, FileText, ExternalLink, CheckCircle2, Award } from 'lucide-react';
import { formatAchievementForPrint, hasAchievementContent } from '@/lib/achievementHelpers';

interface FormulirDokumenModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicantDetail: any;
  loading?: boolean;
  onViewUploadedDoc?: (userId: string, docId: string) => void;
}

const getDocTitle = (key: string) => {
  if (!key) return '-';
  const clean = String(key).trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  if (['dtks', 'filedtks', 'kip', 'dtsen', 'kemensos', 'suratdtks'].includes(clean)) return 'Bukti DTKS / DTSEN';
  if (['ijazah', 'fileijazah', 'ijazahs1', 'ijazahs2', 'ijazahsebelumnya'].includes(clean)) return 'Ijazah & Transkrip Jenjang Sebelumnya';
  if (['ktm', 'filesurataktif', 'surataktif', 'filektm', 'kartumahasiswa', 'suratketeranganaktif'].includes(clean)) return 'Surat Aktif Kuliah / KTM';
  if (['ktp', 'filektp', 'kartutandapenduduk'].includes(clean)) return 'KTP';
  if (['transkrip', 'filetranskrip', 'transkripnilai', 'khs'].includes(clean)) return 'Transkrip Nilai';
  if (['suratpermohonan', 'filesuratpermohonan', 'permohonan'].includes(clean)) return 'Surat Permohonan';
  if (['suratpernyataan', 'filesuratpernyataan', 'pernyataan'].includes(clean)) return 'Surat Pernyataan';
  if (['esai', 'filemotivationoresai', 'motivationletter', 'essay', 'fileesai'].includes(clean)) return 'Motivation Letter / Esai';
  if (['selfie', 'filepasfoto', 'pasfoto', 'fileselfie', 'foto'].includes(clean)) return 'Pasfoto / Selfie';
  if (['pendukung', 'filependukung', 'prestasi', 'sertifikat'].includes(clean)) return 'Berkas Pendukung / Sertifikat';
  return key;
};

const formatAsalDaerah = (asal?: string) => {
  if (!asal) return '-';
  return asal
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
};

const getOngoingEducation = (detail: any) => {
  if (!detail) return { institusi: '-', jurusan: '-' };
  const profilePt = detail.profile?.perguruanTinggi;
  const profileProdi = detail.profile?.fakultasProdi || detail.profile?.prodiPrioritas;

  const targetEdu = detail.education?.find((e: any) => e.tingkat === detail.user?.jenjangTarget);
  const higherEdu = detail.education?.find((e: any) => e.tingkat && e.tingkat !== 'SMA');
  const lastEdu = detail.education && detail.education.length > 0 ? detail.education[detail.education.length - 1] : null;

  const institusi = profilePt || targetEdu?.institusi || higherEdu?.institusi || lastEdu?.institusi || detail.education?.[0]?.institusi || '-';
  const jurusan = profileProdi || targetEdu?.jurusan || higherEdu?.jurusan || lastEdu?.jurusan || detail.education?.[0]?.jurusan || '-';

  return { institusi, jurusan };
};

export default function FormulirDokumenModal({
  isOpen,
  onClose,
  applicantDetail,
  loading = false,
  onViewUploadedDoc,
}: FormulirDokumenModalProps) {
  if (!isOpen) return null;

  const u = applicantDetail?.user || {};
  const p = applicantDetail?.profile || {};
  const app = applicantDetail?.application || {};
  const docs: any[] = applicantDetail?.documents || [];
  const edu = getOngoingEducation(applicantDetail);

  const hasPrestasi =
    hasAchievementContent(p.prestasiAkademik) ||
    hasAchievementContent(p.prestasiNonAkademik) ||
    hasAchievementContent(p.pengalamanOrganisasi) ||
    hasAchievementContent(p.pengalamanPengabdian) ||
    hasAchievementContent(p.pelatihanSertifikasi);

  const submittedDateStr = app.submittedAt
    ? new Date(app.submittedAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })
    : new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });

  const handlePrintFormulir = () => {
    window.print();
  };

  const renderFormulirSheet = () => (
    <div className="p-6 sm:p-10 font-serif text-slate-900 bg-white border border-slate-300 shadow-sm rounded-xl print:border-0 print:shadow-none print:p-0 print:rounded-none max-w-4xl mx-auto">
      {/* Kop Surat Resmi */}
      <div className="text-center font-serif border-b-4 border-slate-900 pb-3 mb-1">
        <h3 className="text-sm sm:text-base font-bold uppercase tracking-wider text-slate-900">
          Pemerintah Provinsi Sulawesi Tenggara
        </h3>
        <p className="text-xs sm:text-sm font-bold uppercase text-slate-800">
          Panitia Seleksi Program Beasiswa Sultra Cerdas 2026
        </p>
        <p className="text-[10px] sm:text-xs text-slate-600 italic">
          Kompleks Bumi Praja Anduonohu, Kota Kendari | Website: bssc.akusahabatrakyat.com
        </p>
      </div>
      <div className="border-b border-slate-900 mb-6"></div>

      {/* Title & Document Ref */}
      <div className="text-center space-y-1.5 mb-6">
        <h1 className="text-base sm:text-lg font-black uppercase tracking-wider underline text-slate-900">
          FORMULIR BUKTI PENDAFTARAN BEASISWA MAHASISWA
        </h1>
        <p className="text-xs font-bold text-slate-800">
          NOMOR REGISTRASI:{' '}
          <span className="font-mono text-sm px-2.5 py-0.5 bg-slate-100 border border-slate-400 inline-block font-black">
            {app.registrationNo || '-'}
          </span>
        </p>
      </div>

      <div className="space-y-4 text-xs font-sans">
        {/* Section 1 */}
        <div className="border border-slate-400 overflow-hidden">
          <div className="bg-slate-100 px-3 py-1.5 font-bold uppercase text-slate-900 border-b border-slate-400 flex justify-between">
            <span>I. IDENTITAS DIRI PENDAFTAR</span>
            <span>JENJANG TARGET: {u.jenjangTarget || '-'}</span>
          </div>
          <table className="w-full text-left border-collapse">
            <tbody>
              <tr className="border-b border-slate-200">
                <td className="w-1/3 p-1.5 font-semibold bg-slate-50">Nama Lengkap (KTP)</td>
                <td className="p-1.5 font-bold">: {u.namaLengkap || '-'}</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="w-1/3 p-1.5 font-semibold bg-slate-50">NIK Mahasiswa</td>
                <td className="p-1.5 font-mono">: {u.nik || '-'}</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="w-1/3 p-1.5 font-semibold bg-slate-50">No. Kartu Keluarga (KK)</td>
                <td className="p-1.5 font-mono">: {p.noKk || '-'}</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="w-1/3 p-1.5 font-semibold bg-slate-50">Tempat, Tanggal Lahir</td>
                <td className="p-1.5">
                  : {p.tempatLahir || '-'}, {p.tanggalLahir ? String(p.tanggalLahir).split('T')[0] : '-'}
                </td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="w-1/3 p-1.5 font-semibold bg-slate-50">Jenis Kelamin</td>
                <td className="p-1.5">: {p.gender || '-'}</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="w-1/3 p-1.5 font-semibold bg-slate-50">Asal Daerah (Kab/Kota)</td>
                <td className="p-1.5">: {formatAsalDaerah(p.asalDaerah)}</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="w-1/3 p-1.5 font-semibold bg-slate-50">Alamat KTP</td>
                <td className="p-1.5">: {p.alamatKtp || '-'}</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="w-1/3 p-1.5 font-semibold bg-slate-50">Alamat Domisili</td>
                <td className="p-1.5">: {p.alamatDomisili || '-'}</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="w-1/3 p-1.5 font-semibold bg-slate-50">No. HP / WhatsApp</td>
                <td className="p-1.5">: {p.noHp || '-'}</td>
              </tr>
              <tr>
                <td className="w-1/3 p-1.5 font-semibold bg-slate-50">Email Aktif</td>
                <td className="p-1.5">: {u.email || '-'}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Section 2 */}
        <div className="border border-slate-400 overflow-hidden">
          <div className="bg-slate-100 px-3 py-1.5 font-bold uppercase text-slate-900 border-b border-slate-400">
            II. DATA AKADEMIK &amp; PERGURUAN TINGGI
          </div>
          <table className="w-full text-left border-collapse">
            <tbody>
              <tr className="border-b border-slate-200">
                <td className="w-1/3 p-1.5 font-semibold bg-slate-50">Perguruan Tinggi</td>
                <td className="p-1.5 font-bold">: {edu.institusi}</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="w-1/3 p-1.5 font-semibold bg-slate-50">Fakultas / Program Studi</td>
                <td className="p-1.5">: {edu.jurusan}</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="w-1/3 p-1.5 font-semibold bg-slate-50">Akreditasi Perguruan Tinggi</td>
                <td className="p-1.5">: {p.akreditasiProdi || '-'}</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="w-1/3 p-1.5 font-semibold bg-slate-50">NIM Mahasiswa</td>
                <td className="p-1.5 font-mono">: {p.nim || '-'}</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="w-1/3 p-1.5 font-semibold bg-slate-50">Semester Saat Ini</td>
                <td className="p-1.5">: Semester {p.semester || '-'}</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="w-1/3 p-1.5 font-semibold bg-slate-50">IPK Kumulatif Terakhir</td>
                <td className="p-1.5 font-bold">: {p.ipk || '-'}</td>
              </tr>
              <tr>
                <td className="w-1/3 p-1.5 font-semibold bg-slate-50">Target Tahun Lulus</td>
                <td className="p-1.5">: {p.targetLulus || '-'}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Section 3 */}
        <div className="border border-slate-400 overflow-hidden">
          <div className="bg-slate-100 px-3 py-1.5 font-bold uppercase text-slate-900 border-b border-slate-400">
            III. ORANG TUA / EKONOMI KELUARGA
          </div>
          <table className="w-full text-left border-collapse">
            <tbody>
              <tr className="border-b border-slate-200">
                <td className="w-1/3 p-1.5 font-semibold bg-slate-50">Nama Ayah / Ibu</td>
                <td className="p-1.5">
                  : {p.namaAyah || '-'} / {p.namaIbu || '-'}
                </td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="w-1/3 p-1.5 font-semibold bg-slate-50">Pekerjaan Orang Tua</td>
                <td className="p-1.5">
                  : {p.pekerjaanAyah || '-'} / {p.pekerjaanIbu || '-'}
                </td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="w-1/3 p-1.5 font-semibold bg-slate-50">Penghasilan Orang Tua</td>
                <td className="p-1.5">: {p.penghasilanOrtu || '-'}</td>
              </tr>
              <tr>
                <td className="w-1/3 p-1.5 font-semibold bg-slate-50">Jumlah Tanggungan</td>
                <td className="p-1.5">: {p.jumlahTanggungan || '0'} Orang</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Section 4 - Prestasi (Cleanly parsed without base64 or raw JSON) */}
        {hasPrestasi && (
          <div className="border border-slate-400 overflow-hidden">
            <div className="bg-slate-100 px-3 py-1.5 font-bold uppercase text-slate-900 border-b border-slate-400">
              IV. PRESTASI &amp; PENGALAMAN ORGANISASI
            </div>
            <table className="w-full text-left border-collapse">
              <tbody>
                {hasAchievementContent(p.prestasiAkademik) && (
                  <tr className="border-b border-slate-200">
                    <td className="w-1/3 p-1.5 font-semibold bg-slate-50 align-top">Prestasi Akademik</td>
                    <td className="p-1.5 whitespace-pre-line">: {formatAchievementForPrint(p.prestasiAkademik)}</td>
                  </tr>
                )}
                {hasAchievementContent(p.prestasiNonAkademik) && (
                  <tr className="border-b border-slate-200">
                    <td className="w-1/3 p-1.5 font-semibold bg-slate-50 align-top">Prestasi Non-Akademik</td>
                    <td className="p-1.5 whitespace-pre-line">: {formatAchievementForPrint(p.prestasiNonAkademik)}</td>
                  </tr>
                )}
                {hasAchievementContent(p.pengalamanOrganisasi) && (
                  <tr className="border-b border-slate-200">
                    <td className="w-1/3 p-1.5 font-semibold bg-slate-50 align-top">Pengalaman Organisasi</td>
                    <td className="p-1.5 whitespace-pre-line">: {formatAchievementForPrint(p.pengalamanOrganisasi)}</td>
                  </tr>
                )}
                {hasAchievementContent(p.pengalamanPengabdian) && (
                  <tr className="border-b border-slate-200">
                    <td className="w-1/3 p-1.5 font-semibold bg-slate-50 align-top">Pengalaman Pengabdian</td>
                    <td className="p-1.5 whitespace-pre-line">: {formatAchievementForPrint(p.pengalamanPengabdian)}</td>
                  </tr>
                )}
                {hasAchievementContent(p.pelatihanSertifikasi) && (
                  <tr>
                    <td className="w-1/3 p-1.5 font-semibold bg-slate-50 align-top">Pelatihan / Sertifikasi</td>
                    <td className="p-1.5 whitespace-pre-line">: {formatAchievementForPrint(p.pelatihanSertifikasi)}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Statement Box */}
        <div className="p-3 border-2 border-slate-900 text-[10px] leading-relaxed text-justify bg-slate-50 font-serif">
          <p className="font-bold mb-1 uppercase">PERNYATAAN TANGGUNG JAWAB MUTLAK (SPTJM):</p>
          <p>
            Saya yang bertanda tangan di bawah ini menyatakan dengan sesungguhnya bahwa seluruh data, informasi, dan dokumen berkas persyaratan yang saya sampaikan adalah <strong>BENAR, SAH, dan DAPAT DIPERTANGGUNGJAWABKAN</strong>. Apabila di kemudian hari terbukti memberikan data palsu atau terbukti menerima pendanaan beasiswa ganda (double funding), saya bersedia menerima sanksi pembatalan status penerima beasiswa dan sanggup mengembalikan seluruh dana beasiswa yang telah diterima ke Kas Daerah Provinsi Sulawesi Tenggara.
          </p>
        </div>

        {/* Signature Block */}
        <div className="pt-4 flex justify-end items-end">
          <div className="text-center w-64 space-y-1">
            <p className="text-xs">Kendari, {submittedDateStr}</p>
            <p className="text-xs font-semibold mb-1">Pemohon / Pendaftar Beasiswa,</p>

            <div className="h-16 flex items-center justify-center my-1">
              {p.signatureData ? (
                <img
                  src={p.signatureData}
                  alt="Tanda Tangan Digital"
                  className="max-h-16 max-w-full object-contain"
                  crossOrigin="anonymous"
                />
              ) : (
                <div className="text-[10px] text-slate-400 italic">(Tanda Tangan Digital)</div>
              )}
            </div>

            <p className="font-bold underline uppercase text-slate-900">{u.namaLengkap || '-'}</p>
            <p className="text-[10px] text-slate-700 font-mono">NIK. {u.nik || '-'}</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Interactive Modal View (Hidden when printing) */}
      <div className="fixed inset-0 z-[150] flex items-center justify-center p-2 sm:p-4 bg-slate-900/70 backdrop-blur-sm print:hidden animate-in fade-in duration-150">
        <div className="bg-slate-100 rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[94vh] border border-slate-200">
          {/* Header */}
          <div className="px-5 py-4 bg-[#0B3A6A] text-white flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 bg-white/10 rounded-xl shrink-0">
                <FileText className="w-5 h-5 text-blue-200" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm sm:text-base font-extrabold truncate">
                    Dokumen Formulir Bukti Pendaftaran Mahasiswa
                  </h3>
                  {app.status === 'DITERIMA' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500 text-white shadow-xs">
                      <CheckCircle2 className="w-3 h-3" /> DITERIMA
                    </span>
                  )}
                </div>
                <p className="text-xs text-blue-200 truncate">
                  {u.namaLengkap || 'Memuat...'} {app.registrationNo ? `• ${app.registrationNo}` : ''}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {!loading && applicantDetail && (
                <button
                  type="button"
                  onClick={handlePrintFormulir}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Printer className="w-4 h-4" /> Cetak / PDF Formulir
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="p-2 text-blue-200 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                title="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {loading ? (
              <div className="p-16 text-center text-slate-500 space-y-3 bg-white rounded-2xl border border-slate-200">
                <div className="w-10 h-10 border-4 border-blue-900 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-sm font-semibold">Memuat dokumen formulir pendaftar...</p>
              </div>
            ) : applicantDetail ? (
              <>
                {/* Main Official Formulir Paper Preview */}
                {renderFormulirSheet()}

                {/* Quick Access to Uploaded Supporting Documents */}
                {docs.length > 0 && onViewUploadedDoc && (
                  <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 max-w-4xl mx-auto space-y-3">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-900" />
                      Lampiran Dokumen Persyaratan Mahasiswa ({docs.length} Berkas)
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {docs.map((doc: any, idx: number) => (
                        <div
                          key={doc.id || idx}
                          className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-blue-50/40 transition-colors gap-2"
                        >
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-800 truncate">{getDocTitle(doc.docType)}</p>
                            <p className="text-[10px] text-slate-500 font-mono truncate">{doc.originalName}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => onViewUploadedDoc(u.id, doc.id)}
                            className="px-2.5 py-1 text-[11px] font-bold bg-blue-100 text-blue-800 hover:bg-blue-200 rounded-lg transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
                          >
                            <ExternalLink className="w-3 h-3" /> Lihat File
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
                Data formulir pendaftar tidak ditemukan.
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-5 py-3.5 bg-white border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
            <span className="text-xs text-slate-500">
              Formulir Resmi Beasiswa Stimulan Sultra Cerdas 2026
            </span>
            <div className="flex items-center gap-2.5">
              {!loading && applicantDetail && (
                <button
                  type="button"
                  onClick={handlePrintFormulir}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4" /> Cetak Formulir
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Print-Only Official Sheet */}
      {applicantDetail && (
        <div className="hidden print:block p-8 font-serif text-slate-900 max-w-4xl mx-auto bg-white min-h-screen">
          {renderFormulirSheet()}
        </div>
      )}
    </>
  );
}
