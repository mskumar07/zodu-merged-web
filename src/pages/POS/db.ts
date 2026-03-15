/**
 * pos/db.ts
 * ─────────────────────────────────────────────────────────────
 * IndexedDB schema using Dexie.js
 *
 * Install:  npm install dexie
 *
 * Tables
 *   products  — full catalogue synced from the backend
 *   meta      — lightweight key/value for sync timestamps etc.
 * ─────────────────────────────────────────────────────────────
 */

import Dexie, { type Table } from "dexie";

// ── Shape that comes back from  GET /get/pos_data/:branch_id ──
export interface PosProduct {
  // identity
  zodu_id: string;
  branch_id: string;

  // item
  item_id: string;        // ← primary key in IndexedDB
  item_name: string;

  // category
  category_id: string;
  category_name: string;

  // lookup / scan
  sku: string;
  barcode: string;

  // pricing  (API sends these as strings — normalised to number on write)
  sell_price: number;
  purchase_price: number;

  // tax
  hsn_code: string;
  gst_tax: number;        // percentage e.g. 5 | 12 | 18  (normalised from string)

  unit: string;           // "LTR" | "NOS" | "PCS" | "KG" …
  unit_id?: number;
  count: number;          // always 1 from the SQL

  item_type: string;
}

// ── Meta row shape ────────────────────────────────────────────
export interface MetaRow {
  key: string;            // e.g. "lastSync_branch_1"
  value: number | string; // epoch ms  |  any string payload
}

// ── Dexie database class ──────────────────────────────────────
class PosDatabase extends Dexie {
  products!: Table<PosProduct, string>;   // keyed by item_id
  meta!: Table<MetaRow, string>;          // keyed by key

  constructor() {
    super("RetailPOS_v1");

    // v1 → v2: re-added to force re-sync after string→number normalisation fix
    this.version(1).stores({
      products: "item_id, item_name, category_id, barcode, sku, branch_id",
      meta: "key",
    });

    this.version(2).stores({
      /**
       * Indexed columns (Dexie only indexes what you list here;
       * the full object is always stored automatically).
       *
       * item_id        → primary key
       * item_name      → for alphabetical browsing / text search
       * category_id    → filter by category
       * barcode        → barcode-scanner lookup
       * sku            → sku lookup
       * branch_id      → filter when multiple branches share one DB
       */
      products: "item_id, item_name, category_id, barcode, sku, branch_id",
      meta: "key",
    });
  }
}

// ── Singleton export ──────────────────────────────────────────
export const db = new PosDatabase();

// ── Staleness helper ─────────────────────────────────────────
const STALE_MS = 8 * 60 * 60 * 1000; // 8 hours

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

// ── Normalise raw API row → correct types before IDB write ──
function normalise(p: Record<string, unknown>): PosProduct {
  return {
    ...(p as PosProduct),
    sell_price:     Number(p.sell_price)     || 0,
    purchase_price: Number(p.purchase_price) || 0,
    gst_tax:        Number(p.gst_tax)        || 0,
    count:          Number(p.count)          || 1,
    barcode:        (p.barcode as string) ?? "",
    sku:            String(p.sku ?? ""),
  };
}

// ── Bulk write (called after a successful API fetch) ─────────
export async function bulkUpsertProducts(products: PosProduct[]): Promise<void> {
  if (!Array.isArray(products) || products.length === 0) {
    console.warn("[POS] bulkUpsertProducts: nothing to write");
    return;
  }
  // Normalise string numbers → real numbers before storing
  const normalised = (products as unknown as Record<string, unknown>[]).map(normalise);
  // bulkPut = insert-or-replace in one transaction → fast for 25k rows
  await db.products.bulkPut(normalised);
}

// ── Read helpers used by the search hook ─────────────────────
export async function getAllProducts(branchId: string): Promise<PosProduct[]> {
  return db.products.where("branch_id").equals(branchId).toArray();
}