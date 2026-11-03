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
