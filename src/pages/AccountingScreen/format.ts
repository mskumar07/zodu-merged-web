// Formatters are created once — Intl construction is the slow part, not the call.
const AMOUNT = new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const DATE   = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" });
const TIME   = new Intl.DateTimeFormat("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });

export const fmtAmount = (v: number) => AMOUNT.format(v);
export const fmtDate   = (iso: string) => DATE.format(new Date(iso));
export const fmtTime   = (iso: string) => TIME.format(new Date(iso));
