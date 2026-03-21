/**
 * pos/db.ts
 * ─────────────────────────────────────────────────────────────
 * IndexedDB schema using Dexie.js
 *
 * Matches exact API shape from GET /restaurant/get/pos_data/:branch_id
 * Sample row:
 * {
 *   zodu_id, branch_id, item_id: "9528", item_name: "...",
 *   category_id: 124,           ← number from API
 *   category_name: "Spares",
 *   sku: null,                  ← nullable
 *   barcode: null,              ← nullable
 *   sell_price: "8280.00",      ← string from API → normalised to number
 *   purchase_price: "7527.00",  ← string from API → normalised to number
 *   hsn_code: "132264",
 *   gst_tax: "18",              ← string from API → normalised to number
 *   unit_id: 32, unit: "LTR",
 *   stock_qty: "0",             ← string from API → normalised to number
 *   count: 1, item_type: "S"
 * }
 * ─────────────────────────────────────────────────────────────
 */

import Dexie, { type Table } from "dexie";

// ── Exact shape stored in IndexedDB (post-normalisation) ──────
export interface PosProduct {
  // identity
  zodu_id:   string;
  branch_id: string;

  // item
  item_id:   string;   // primary key — always a non-null string
  item_name: string;

  // category  (category_id comes as number from API)
  category_id:   number;
  category_name: string;

  // scan helpers — null-safe (API sends null when not set)
  sku:     string | null;
  barcode: string | null;

  // pricing  (API sends strings → stored as numbers)
  sell_price:     number;
  purchase_price: number;

  // tax
  hsn_code:      string;
  gst_tax:       number;   // API sends string e.g. "18" → stored as 18
  /**
   * true  → sell_price already INCLUDES GST
   *         base = sell_price / (1 + gst_tax / 100)
   * false → sell_price is the pre-tax BASE price
   */
  tax_inclusive: boolean;

  // stock
  stock_qty: number;  // API sends string "0" → stored as 0

  // unit
  unit:    string;
  unit_id: number;

  count:     number;
  item_type: string;
}

// ── Meta row ──────────────────────────────────────────────────
export interface MetaRow {
  key:   string;
  value: number | string;
}

// ── Dexie schema ──────────────────────────────────────────────
class PosDatabase extends Dexie {
  products!: Table<PosProduct, string>;
  meta!:     Table<MetaRow,    string>;

  constructor() {
    super("RetailPOS_v1");

    // v1 & v2 — legacy, kept so existing browsers migrate cleanly
    this.version(1).stores({
      products: "item_id, item_name, category_id, barcode, sku, branch_id",
      meta: "key",
    });
    this.version(2).stores({
      products: "item_id, item_name, category_id, barcode, sku, branch_id",
      meta: "key",
    });
    // v3 — sku removed from index (always null in API); item_id is sole lookup key
    this.version(3).stores({
      products: "item_id, item_name, category_id, barcode, branch_id",
      meta: "key",
    });
  }
}

export const db = new PosDatabase();

// ── Staleness helper ──────────────────────────────────────────
const STALE_MS = 8 * 60 * 60 * 1000;

export async function isCatalogueStale(branchId: string): Promise<boolean> {
  try {
    const row = await db.meta.get(`lastSync_${branchId}`);
    if (!row) return true;
    return Date.now() - Number(row.value) > STALE_MS;
  } catch {
    return true;
  }
}

export async function markSynced(branchId: string): Promise<void> {
  await db.meta.put({ key: `lastSync_${branchId}`, value: Date.now() });
}

// ── Normalise raw API row → correct types before IDB write ────
function normalise(p: Record<string, unknown>): PosProduct {
  return {
    ...(p as PosProduct),
    // numbers that API sends as strings
    sell_price:     Number(p.sell_price)     || 0,
    purchase_price: Number(p.purchase_price) || 0,
    gst_tax:        Number(p.gst_tax)        || 0,
    stock_qty:      Number(p.stock_qty)      || 0,
    count:          Number(p.count)          || 1,
    category_id:    Number(p.category_id)    || 0,
    unit_id:        Number(p.unit_id)        || 0,
    // boolean — API may send true/false or 1/0 or missing → default false
    tax_inclusive:  Boolean(p.tax_inclusive) ?? false,
    // null-safe — keep null as null, don't coerce to empty string
    sku:            (p.sku     as string | null) ?? null,
    barcode:        (p.barcode as string | null) ?? null,
    hsn_code:       (p.hsn_code  as string) ?? "",
    unit:           (p.unit      as string) ?? "",
    item_type:      (p.item_type as string) ?? "",
  };
}

// ── Bulk write ────────────────────────────────────────────────
export async function bulkUpsertProducts(products: PosProduct[]): Promise<void> {
  if (!Array.isArray(products) || products.length === 0) {
    console.warn("[POS] bulkUpsertProducts: nothing to write");
    return;
  }
  const normalised = (products as unknown as Record<string, unknown>[]).map(normalise);
  await db.products.bulkPut(normalised);
}

// ── Read all products for a branch ───────────────────────────
export async function getAllProducts(branchId: string): Promise<PosProduct[]> {
  return db.products.where("branch_id").equals(branchId).toArray();
}