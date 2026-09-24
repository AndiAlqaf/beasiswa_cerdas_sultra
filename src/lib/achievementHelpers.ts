export interface DynamicAchievementItem {
  id: string;
  nama: string;
  tahun: string;
}

export function parseAchievementString(str?: string): DynamicAchievementItem[] {
  if (!str || !str.trim()) {
    return [{ id: Math.random().toString(36).substring(2, 9), nama: '', tahun: '' }];
  }

  if (str.trim().startsWith('[')) {
    try {
      const parsed = JSON.parse(str);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((item: any, idx: number) => ({
          id: item.id || `${idx}-${Math.random().toString(36).substring(2, 5)}`,
          nama: item.nama || item.name || '',
          tahun: item.tahun || item.year || '',
        }));
      }
    } catch (e) {
      // ignore
    }
  }

  const lines = str.split('\n').map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) {
    return [{ id: Math.random().toString(36).substring(2, 9), nama: '', tahun: '' }];
  }

  return lines.map((line, idx) => {
    let clean = line.replace(/^\d+[\.\)]\s*/, '');
    let tahun = '';
    const yearMatch = clean.match(/\s*\(?(\d{4})\)?\s*$/);
    if (yearMatch) {
      tahun = yearMatch[1];
      clean = clean.replace(/\s*\(?(\d{4})\)?\s*$/, '').trim();
    }
    return {
      id: `${idx}-${Math.random().toString(36).substring(2, 5)}`,
      nama: clean || line,
      tahun: tahun,
    };
  });
}

export function formatAchievementItems(items: DynamicAchievementItem[]): string {
  const valid = items.filter((i) => i.nama.trim() || i.tahun.trim());
  if (valid.length === 0) return '';
  return valid
    .map((item, idx) => `${idx + 1}. ${item.nama.trim()}${item.tahun.trim() ? ` (${item.tahun.trim()})` : ''}`)
    .join('\n');
}
