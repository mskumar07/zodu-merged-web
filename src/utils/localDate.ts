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
