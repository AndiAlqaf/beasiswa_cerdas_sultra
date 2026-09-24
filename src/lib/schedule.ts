export interface ScheduleConfig {
  openDate: string;
  closeDate: string;
  selectionStart: string;
  selectionEnd: string;
  announcementDate: string;
  announcementEnd: string;
  sanggahStart: string;
  sanggahEnd: string;
  pengumumanSanggahDate: string;
  penetapanDate: string;
  kontrakDate: string;
  penyaluranDate: string;
}

export const DEFAULT_SCHEDULE_CONFIG: ScheduleConfig = {
  openDate: '2026-09-13',
  closeDate: '2026-09-30',
  selectionStart: '2026-10-01',
  selectionEnd: '2026-10-15',
  announcementDate: '2026-10-16',
  announcementEnd: '2026-10-17',
  sanggahStart: '2026-10-19',
  sanggahEnd: '2026-10-21',
  pengumumanSanggahDate: '2026-10-22',
  penetapanDate: '2026-10-30',
  kontrakDate: '2026-11-02',
  penyaluranDate: '2026-11-04'
};

const STORAGE_KEY = 'bssc_schedule_config';

export function getStoredScheduleConfig(): ScheduleConfig {
  if (typeof window === 'undefined') return DEFAULT_SCHEDULE_CONFIG;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...DEFAULT_SCHEDULE_CONFIG, ...JSON.parse(stored) };
    }
  } catch (e) {
    console.warn('Failed to load schedule config:', e);
  }
  return DEFAULT_SCHEDULE_CONFIG;
}

export function saveScheduleConfig(config: ScheduleConfig): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    window.dispatchEvent(new Event('bssc_schedule_updated'));
  } catch (e) {
    console.warn('Failed to save schedule config:', e);
  }
}

export interface TimelineStep {
  id: string;
  title: string;
  desc: string;
  date: string;
  startDate: string;
  endDate: string;
  status: 'completed' | 'active' | 'upcoming';
}

export function getDynamicTimeline(
  config: ScheduleConfig = getStoredScheduleConfig(),
  customNow?: string
): TimelineStep[] {
  // Helper to parse date string YYYY-MM-DD in local time
  const parseDate = (dStr: string) => {
    const [y, m, d] = dStr.split('-').map(Number);
    return new Date(y, m - 1, d);
  };

  const now = customNow ? parseDate(customNow) : new Date();
  // Zero out time components for date-only comparison
  now.setHours(12, 0, 0, 0);

  const getStatus = (startStr: string, endStr: string): 'completed' | 'active' | 'upcoming' => {
    const start = parseDate(startStr);
    start.setHours(0, 0, 0, 0);
    const end = parseDate(endStr);
    end.setHours(23, 59, 59, 999);

    if (now < start) return 'upcoming';
    if (now > end) return 'completed';
    return 'active';
  };

  const formatDateRange = (startStr: string, endStr: string): string => {
    const s = parseDate(startStr);
    const e = parseDate(endStr);
    const monthsIndo = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];

    const sDay = s.getDate();
    const eDay = e.getDate();
    const sMonth = monthsIndo[s.getMonth()];
    const eMonth = monthsIndo[e.getMonth()];
    const sYear = s.getFullYear();
    const eYear = e.getFullYear();

    if (startStr === endStr) {
      return `${sDay} ${sMonth} ${sYear}`;
    }

    if (sMonth === eMonth && sYear === eYear) {
      return `${sDay} - ${eDay} ${sMonth} ${sYear}`;
    }

    if (sYear === eYear) {
      return `${sDay} ${sMonth} - ${eDay} ${eMonth} ${sYear}`;
    }

    return `${sDay} ${sMonth} ${sYear} - ${eDay} ${eMonth} ${eYear}`;
  };

  return [
    {
      id: 'pendaftaran',
      title: 'Pendaftaran Online',
      desc: 'Pembuatan akun, pengisian formulir, & unggah berkas di portal resmi.',
      date: formatDateRange(config.openDate, config.closeDate),
      startDate: config.openDate,
      endDate: config.closeDate,
      status: getStatus(config.openDate, config.closeDate)
    },
    {
      id: 'seleksi',
      title: 'Proses Seleksi & Verifikasi',
      desc: 'Verifikasi berkas & validasi kualifikasi pendaftar oleh tim seleksi.',
      date: formatDateRange(config.selectionStart, config.selectionEnd || '2026-10-15'),
      startDate: config.selectionStart,
      endDate: config.selectionEnd || '2026-10-15',
      status: getStatus(config.selectionStart, config.selectionEnd || '2026-10-15')
    },
    {
      id: 'pengumuman',
      title: 'Pengumuman Hasil Seleksi',
      desc: 'Pengumuman kelulusan administrasi & seleksi tahap awal.',
      date: formatDateRange(config.announcementDate, config.announcementEnd || config.announcementDate),
      startDate: config.announcementDate,
      endDate: config.announcementEnd || config.announcementDate,
      status: getStatus(config.announcementDate, config.announcementEnd || config.announcementDate)
    },
    {
      id: 'sanggah',
      title: 'Masa Sanggah',
      desc: 'Pengajuan sanggahan bagi pendaftar yang berkasnya memerlukan klarifikasi.',
      date: formatDateRange(config.sanggahStart || '2026-10-19', config.sanggahEnd || '2026-10-21'),
      startDate: config.sanggahStart || '2026-10-19',
      endDate: config.sanggahEnd || '2026-10-21',
      status: getStatus(config.sanggahStart || '2026-10-19', config.sanggahEnd || '2026-10-21')
    },
    {
      id: 'pengumuman-sanggah',
      title: 'Pengumuman Hasil Sanggah',
      desc: 'Pengumuman final setelah proses verifikasi sanggahan.',
      date: formatDateRange(config.pengumumanSanggahDate || '2026-10-22', '2026-10-29'),
      startDate: config.pengumumanSanggahDate || '2026-10-22',
      endDate: '2026-10-29',
      status: getStatus(config.pengumumanSanggahDate || '2026-10-22', '2026-10-29')
    },
    {
      id: 'penetapan',
      title: 'Penetapan Penerima Resmi',
      desc: 'SK Gubernur penetapan nama penerima Beasiswa Stimulan Sultra Cerdas.',
      date: formatDateRange(config.penetapanDate || '2026-10-30', '2026-10-31'),
      startDate: config.penetapanDate || '2026-10-30',
      endDate: '2026-10-31',
      status: getStatus(config.penetapanDate || '2026-10-30', '2026-10-31')
    },
    {
      id: 'kontrak',
      title: 'Penandatanganan Kontrak & Pakta Integritas',
      desc: 'Penandatanganan dokumen komitmen penerima beasiswa.',
      date: formatDateRange(config.kontrakDate || '2026-11-02', '2026-11-03'),
      startDate: config.kontrakDate || '2026-11-02',
      endDate: '2026-11-03',
      status: getStatus(config.kontrakDate || '2026-11-02', '2026-11-03')
    },
    {
      id: 'penyaluran',
      title: 'Penyaluran Beasiswa Termin I',
      desc: 'Pencairan dana 50% tahap pertama langsung ke rekening bank penerima.',
      date: `Mulai ${formatDateRange(config.penyaluranDate || '2026-11-04', config.penyaluranDate || '2026-11-04')}`,
      startDate: config.penyaluranDate || '2026-11-04',
      endDate: '2026-12-31',
      status: getStatus(config.penyaluranDate || '2026-11-04', '2026-12-31')
    }
  ];
}
