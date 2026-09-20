import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import TemplateDownloads from '@/components/TemplateDownloads';

export const metadata = {
  title: 'Unduh Template Dokumen Persyaratan | BSSC 2026',
  description: 'Pusat Unduh Format Surat Permohonan, Surat Pernyataan Materai 10.000, dan Juknis Beasiswa Stimulan Sultra Cerdas 2026.',
};

export default function DownloadPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased">
      <Navbar />

      <div className="pt-16">
        <TemplateDownloads />
      </div>

      <Footer />
    </main>
  );
}
