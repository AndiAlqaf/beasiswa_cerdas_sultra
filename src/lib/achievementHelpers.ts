export interface DynamicAchievementItem {
  id: string;
  nama: string;
  tahun: string;
  buktiFile?: string; // base64 / data URL / file path / '[TERLAMPIR]'
  buktiFileName?: string; // Original filename
  buktiLink?: string; // Link URL string
}

/**
 * Safely parse raw achievement string (JSON array, truncated JSON array with base64, or plain text lines)
 * Never leaks raw JSON syntax or base64 data strings into item names.
 * Preserves knowledge of whether an item had an attached buktiFile even if truncated.
 */
export function extractValidAchievementItems(str?: string): DynamicAchievementItem[] {
  if (!str || !str.trim()) return [];
  const trimmed = str.trim();

  // Case 1: JSON array format (complete or truncated by DB column limit)
  if (trimmed.startsWith('[')) {
    // 1a. Try standard JSON.parse first
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed
          .map((item: any, idx: number) => ({
            id: item?.id || `${idx}-${Math.random().toString(36).substring(2, 5)}`,
            nama: String(item?.nama || item?.name || '').trim(),
            tahun: String(item?.tahun || item?.year || '').trim(),
            buktiFile: String(item?.buktiFile || item?.file || ''),
            buktiFileName: String(item?.buktiFileName || item?.fileName || '').trim(),
            buktiLink: String(item?.buktiLink || item?.link || '').trim(),
          }))
          .filter((item) => item.nama !== '' || item.tahun !== '' || item.buktiLink !== '');
      }
    } catch {
      // 1b. JSON.parse failed (e.g. truncated mid-base64 in buktiFile).
      // Replace non-empty buktiFile values with "[TERLAMPIR]" so we know a document was attached.
      const stripped = trimmed
        .replace(/"buktiFile"\s*:\s*""/g, '"buktiFile":""')
        .replace(/"buktiFile"\s*:\s*"[^"]+(?:"|$)/g, '"buktiFile":"[TERLAMPIR]"');
      try {
        const repaired = stripped.endsWith(']')
          ? stripped
          : stripped.replace(/,\s*$/, '') + (stripped.endsWith('}') ? ']' : '"}]');
        const parsedRepaired = JSON.parse(repaired);
        if (Array.isArray(parsedRepaired)) {
          return parsedRepaired
            .map((item: any, idx: number) => ({
              id: item?.id || `${idx}-${Math.random().toString(36).substring(2, 5)}`,
              nama: String(item?.nama || item?.name || '').trim(),
              tahun: String(item?.tahun || item?.year || '').trim(),
              buktiFile: String(item?.buktiFile || item?.file || ''),
              buktiFileName: String(item?.buktiFileName || item?.fileName || '').trim(),
              buktiLink: String(item?.buktiLink || item?.link || '').trim(),
            }))
            .filter((item) => item.nama !== '' || item.tahun !== '' || item.buktiLink !== '');
        }
      } catch {
        // 1c. Regex extraction fallback so raw JSON/base64 is NEVER returned
        const items: DynamicAchievementItem[] = [];
        const objChunks = stripped.split(/\}\s*,\s*\{/);
        objChunks.forEach((chunk, idx) => {
          const namaMatch = chunk.match(/"(?:nama|name)"\s*:\s*"([^"]*)"/i);
          const tahunMatch = chunk.match(/"(?:tahun|year)"\s*:\s*"([^"]*)"/i);
          const fileNameMatch = chunk.match(/"(?:buktiFileName|fileName)"\s*:\s*"([^"]*)"/i);
          const linkMatch = chunk.match(/"(?:buktiLink|link)"\s*:\s*"([^"]*)"/i);
          const hasBuktiFile = /"(?:buktiFile|file)"\s*:\s*"(?:\[TERLAMPIR\]|data:|http|\/)[^"]*"/i.test(chunk);
          const nama = namaMatch ? namaMatch[1].trim() : '';
          const tahun = tahunMatch ? tahunMatch[1].trim() : '';
          const buktiFileName = fileNameMatch ? fileNameMatch[1].trim() : '';
          const buktiLink = linkMatch ? linkMatch[1].trim() : '';
          if (nama || tahun || buktiLink) {
            items.push({
              id: `${idx}-${Math.random().toString(36).substring(2, 5)}`,
              nama,
              tahun,
              buktiFile: hasBuktiFile ? '[TERLAMPIR]' : '',
              buktiFileName,
              buktiLink,
            });
          }
        });
        return items;
      }
    }
    return [];
  }

  // Case 2: Plain text lines (legacy format), ensuring we never leak accidental data:image base64
  const hadBase64 = /data:[a-zA-Z0-9/+.-]+;base64,[A-Za-z0-9+/=]+/.test(trimmed);
  const cleanText = trimmed.replace(/data:[a-zA-Z0-9/+.-]+;base64,[A-Za-z0-9+/=]+/g, '').trim();
  if (!cleanText) return [];

  const lines = cleanText.split('\n').map((l) => l.trim()).filter(Boolean);
  return lines
    .map((line, idx) => {
      let clean = line.replace(/^\d+[\.\)]\s*/, '');
      let tahun = '';
      let buktiLink = '';

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
        tahun,
        buktiFile: hadBase64 ? '[TERLAMPIR]' : '',
        buktiFileName: '',
        buktiLink,
      };
    })
    .filter((item) => item.nama.trim() !== '');
}

export function parseAchievementString(str?: string): DynamicAchievementItem[] {
  const validItems = extractValidAchievementItems(str).map((item) => ({
    ...item,
    buktiFile: item.buktiFile === '[TERLAMPIR]' ? '' : item.buktiFile,
  }));
  if (validItems.length > 0) {
    return validItems;
  }
  return [{ id: Math.random().toString(36).substring(2, 9), nama: '', tahun: '', buktiFile: '', buktiFileName: '', buktiLink: '' }];
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

/**
 * Checks whether an achievement field or list actually has non-empty items to display on a printed form.
 */
export function hasAchievementContent(str?: string, list?: DynamicAchievementItem[]): boolean {
  if (list && list.length > 0) {
    const validFromList = list.filter((i) => i && i.nama && i.nama.trim() !== '');
    if (validFromList.length > 0) return true;
  }
  const parsed = extractValidAchievementItems(str);
  return parsed.some((i) => i.nama.trim() !== '');
}

/**
 * Formats achievement items cleanly for official printed/viewed Formulir Bukti Pendaftaran.
 * Appends "(terlampir)" whenever an item has an attached document/certificate or link.
 * Output example:
 * - Single item: "Best Poster The 4rd HICAFS (2025) (terlampir)"
 * - Multiple items:
 *   "1. Best Poster The 4rd HICAFS (2025) (terlampir)\n2. Juara 1 LKTI Nasional (2024)"
 */
export function formatAchievementForPrint(str?: string, list?: DynamicAchievementItem[]): string {
  let items: DynamicAchievementItem[] = [];
  if (list && list.length > 0) {
    items = list.filter((i) => i && i.nama && i.nama.trim() !== '');
  }
  if (items.length === 0 && str) {
    items = extractValidAchievementItems(str).filter((i) => i.nama.trim() !== '');
  }
  if (items.length === 0) return '-';

  const formatSingleItem = (item: DynamicAchievementItem) => {
    const hasDoc = Boolean(
      (item.buktiFile && item.buktiFile.trim() !== '') ||
      (item.buktiFileName && item.buktiFileName.trim() !== '') ||
      (item.buktiLink && item.buktiLink.trim() !== '')
    );
    const yearPart = item.tahun && item.tahun.trim() ? ` (${item.tahun.trim()})` : '';
    const docPart = hasDoc ? ' (terlampir)' : '';
    return `${item.nama.trim()}${yearPart}${docPart}`;
  };

  if (items.length === 1) {
    return formatSingleItem(items[0]);
  }

  return items
    .map((item, idx) => `${idx + 1}. ${formatSingleItem(item)}`)
    .join('\n');
}
