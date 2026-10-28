/**
 * A date as "YYYY-MM-DD" on the user's own calendar.
 *
 * `toISOString()` gives the UTC date, which in India (UTC+5:30) is still
 * yesterday until 5:30 AM — bills made after midnight picked up the wrong day.
 */
export function localDateStr(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

const MONTH_INDEX: Record<string, number> = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 };

/**
 * Turns whatever date a list row carries — "YYYY-MM-DD", a full ISO timestamp, or a
 * display string like "26 Oct 2026" — into the "YYYY-MM-DD" a date input's min/max takes.
 * Returns undefined when it can't be read, so callers simply apply no limit.
 */
export function toDateInputValue(raw?: string | null): string | undefined {
  if (!raw) return undefined;
  const text = raw.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  const named = text.match(/^(\d{1,2})[\s-]+([A-Za-z]{3})[A-Za-z]*[\s,-]+(\d{4})/);
  if (named && named[2].toLowerCase() in MONTH_INDEX) {
    return localDateStr(new Date(Number(named[3]), MONTH_INDEX[named[2].toLowerCase()], Number(named[1])));
  }
  const parsed = new Date(text);
  return Number.isNaN(parsed.getTime()) ? undefined : localDateStr(parsed);
}
