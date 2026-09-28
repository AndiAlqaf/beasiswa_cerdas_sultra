export interface DynamicAchievementItem {
  id: string;
  nama: string;
  tahun: string;
  buktiFile?: string; // base64 / data URL / file path
  buktiFileName?: string; // Original filename
  buktiLink?: string; // Link URL string
}

export function parseAchievementString(str?: string): DynamicAchievementItem[] {
  if (!str || !str.trim()) {
    return [{ id: Math.random().toString(36).substring(2, 9), nama: '', tahun: '', buktiFile: '', buktiFileName: '', buktiLink: '' }];
  }

  if (str.trim().startsWith('[')) {
    try {
      const parsed = JSON.parse(str);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((item: any, idx: number) => ({
          id: item.id || `${idx}-${Math.random().toString(36).substring(2, 5)}`,
          nama: item.nama || item.name || '',
          tahun: item.tahun || item.year || '',
          buktiFile: item.buktiFile || item.file || '',
          buktiFileName: item.buktiFileName || item.fileName || '',
          buktiLink: item.buktiLink || item.link || '',
        }));
      }
    } catch (e) {
      // ignore
    }
  }

  const lines = str.split('\n').map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) {
    return [{ id: Math.random().toString(36).substring(2, 9), nama: '', tahun: '', buktiFile: '', buktiFileName: '', buktiLink: '' }];
  }

  return lines.map((line, idx) => {
    let clean = line.replace(/^\d+[\.\)]\s*/, '');
    let tahun = '';
    let buktiLink = '';
    let buktiFile = '';
    let buktiFileName = '';

    // Extract link if embedded like [Link: http...]
    const linkMatch = clean.match(/\[Link:\s*([^\]]+)\]/i);
    if (linkMatch) {
      buktiLink = linkMatch[1].trim();
      clean = clean.replace(/\[Link:\s*([^\]]+)\]/i, '').trim();
    }

    const yearMatch = clean.match(/\s*\(?(\d{4})\)?\s*$/);
    if (yearMatch) {
      tahun = yearMatch[1];
      clean = clean.replace(/\s*\(?(\d{4})\)?\s*$/, '').trim();
    }

    return {
      id: `${idx}-${Math.random().toString(36).substring(2, 5)}`,
      nama: clean || line,
      tahun: tahun,
      buktiFile,
      buktiFileName,
      buktiLink,
    };
  });
}

export function formatAchievementItems(items: DynamicAchievementItem[]): string {
  const valid = items.filter((i) => i.nama.trim() || i.tahun.trim() || i.buktiFile || i.buktiLink);
  if (valid.length === 0) return '';

  return JSON.stringify(valid.map(item => ({
    id: item.id,
    nama: item.nama.trim(),
    tahun: item.tahun.trim(),
    buktiFile: item.buktiFile || '',
    buktiFileName: item.buktiFileName || '',
    buktiLink: item.buktiLink ? item.buktiLink.trim() : '',
  })));
}
