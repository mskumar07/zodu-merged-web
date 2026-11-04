/**
 * tableDensity.tsx
 * Row-density settings shared by every DataTable.
 *
 *  - Three densities: Compact (40px), Default (48px), Comfortable (56px).
 *  - The viewer's choice is remembered on this device and applies to every table, so
 *    switching it on one screen keeps the rest of the app consistent.
 *  - DataTable provides the active density through context, so rows a screen renders
 *    itself (e.g. an invoice's return rows) line up with the table's own rows.
 */
import { createContext, useContext, useSyncExternalStore } from "react";

export type TableDensity = "compact" | "default" | "comfortable";

export interface DensitySpec {
  label:        string;
  /** Minimum height of a body row, in px. Rows with multi-line content grow past it. */
  rowHeight:    number;
  /** Height of the header row, in px — a notch shorter than a body row so it reads as a label strip. */
  headerHeight: number;
  /** Vertical cell padding, in px. */
  cellPy:       number;
}

export const TABLE_DENSITIES: Record<TableDensity, DensitySpec> = {
  compact:     { label: "Compact",     rowHeight: 40, headerHeight: 34, cellPy: 4 },
  default:     { label: "Default",     rowHeight: 48, headerHeight: 38, cellPy: 8 },
  comfortable: { label: "Comfortable", rowHeight: 56, headerHeight: 42, cellPy: 12 },
};

/** Horizontal cell padding: regular tables, and fitWidth tables that share every px. */
export const CELL_PX     = 12;
export const FIT_CELL_PX = 8;

// ─── Money columns ────────────────────────────────────────────────────────────
// Amount columns are a fixed width that fits the largest amount we support, 10 crore,
// on one line: "₹10,00,00,000.00", and "−₹…" on a return row. Every row then lines up
// digit-for-digit, and the text never wraps or clips.

/** The widest amount a money column must show, as printed (en-IN, 2 decimals, negative). */
export const MONEY_LIMIT_TEXT = "−₹10,00,00,000.00";

/** Body text of a money cell: 13px, bold for the main figure (the widest case). */
export const MONEY_FONT = "700 13px";
/** Secondary lines under an amount ("Ret −₹…", "Net ₹…"): 12px regular. */
export const MONEY_NOTE_FONT = "400 12px";

const widthCache = new Map<string, number>();
let measureCtx: CanvasRenderingContext2D | null | undefined;

/** Rendered width of `text` in the page's font, in px (an estimate where canvas is unavailable). */
export function measureTextPx(text: string, font: string): number {
  const key = `${font}|${text}`;
  const hit = widthCache.get(key);
  if (hit !== undefined) return hit;
  if (measureCtx === undefined) {
    try { measureCtx = document.createElement("canvas").getContext("2d"); } catch { measureCtx = null; }
  }
  let width = text.length * 7.8;   // ~bold 13px digit
  if (measureCtx) {
    const family = getComputedStyle(document.body).fontFamily || "Roboto, Helvetica, Arial, sans-serif";
    measureCtx.font = `${font} ${family}`;
    width = measureCtx.measureText(text).width;
  }
  widthCache.set(key, width);
  return width;
}

/**
 * Width of a money column, in px: the widest of `lines` (each [text, font]) plus the
 * cell's side padding, with a little headroom for a web font that loads after measuring.
 */
export function moneyColumnWidth(
  lines: Array<[text: string, font: string]> = [[MONEY_LIMIT_TEXT, MONEY_FONT]],
): number {
  const widest = Math.max(...lines.map(([text, font]) => measureTextPx(text, font)));
  return Math.ceil(widest * 1.06) + FIT_CELL_PX * 2;
}

/** Cell text style for an amount: one line, digits of equal width. */
export const MONEY_TEXT_SX = { whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" } as const;

// ─── Table colours (no zebra stripes: borders, whitespace and the header carry the structure) ───
export const TABLE_COLORS = {
  headBg:     "#F5F5F5",
  headBorder: "#CBD5E1",
  headText:   "#4B5563",
  rowBorder:  "#ECEEF1",
  rowHover:   "#F8FAFC",
  bodyText:   "#374151",
  bodyBg:     "#FFFFFF",
} as const;

// ─── Saved preference ─────────────────────────────────────────────────────────
// A display preference only; nothing sensitive is stored.
const STORAGE_KEY = "zodu.tableDensity";
const DEFAULT_DENSITY: TableDensity = "default";
const listeners = new Set<() => void>();

export const isDensity = (v: unknown): v is TableDensity =>
  v === "compact" || v === "default" || v === "comfortable";

let current: TableDensity = (() => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return isDensity(saved) ? saved : DEFAULT_DENSITY;
  } catch {
    return DEFAULT_DENSITY;
  }
})();

export function setTableDensity(next: TableDensity) {
  if (next === current) return;
  current = next;
  try { localStorage.setItem(STORAGE_KEY, next); } catch { /* private mode etc. — keep it in memory */ }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

/** The viewer's saved density, kept in sync across every table on the page. */
export function useTableDensityPreference(): [TableDensity, (d: TableDensity) => void] {
  const density = useSyncExternalStore(subscribe, () => current, () => DEFAULT_DENSITY);
  return [density, setTableDensity];
}

// ─── Context for rows rendered outside DataTable's own row loop ───────────────
const TableDensityContext = createContext<TableDensity>(DEFAULT_DENSITY);
export const TableDensityProvider = TableDensityContext.Provider;

/**
 * Body-cell sx for the active density — use it in custom rows (renderRow / renderSubRows)
 * so they match the table's own rows exactly.
 */
export function useTableBodyCellSx(fitWidth = true) {
  const spec = TABLE_DENSITIES[useContext(TableDensityContext)];
  return {
    rowHeight: spec.rowHeight,
    cellSx: bodyCellSx(spec, fitWidth),
  };
}

export function bodyCellSx(spec: DensitySpec, fitWidth: boolean) {
  return {
    height: spec.rowHeight,
    padding: `${spec.cellPy}px ${fitWidth ? FIT_CELL_PX : CELL_PX}px`,
    fontSize: "13px",
    color: TABLE_COLORS.bodyText,
    verticalAlign: "middle",
    backgroundColor: TABLE_COLORS.bodyBg,
    borderBottom: `1px solid ${TABLE_COLORS.rowBorder}`,
    ...(fitWidth && { overflow: "hidden" }),
  } as const;
}
