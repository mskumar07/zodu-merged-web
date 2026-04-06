import Dexie, { type Table } from "dexie";

// ── Exact shape stored in IndexedDB (post-normalisation) ──────
export interface PosProduct {
  // identity
  zodu_id:   string;
  branch_id: string;

  // item
  item_id:   string;   // primary key — always a non-null string
  item_uuid: string;
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

  hsn_code:      string;
  gst_tax:       number;   // API sends string e.g. "18" → stored as 18
 
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
    // this.version(3).stores({
    //   products: "item_id, item_name, category_id, barcode, branch_id",
    //   meta: "key",
    // });
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

export async function clearSyncMeta(branchId: string): Promise<void> {
  await db.meta.delete(`lastSync_${branchId}`);
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
// Deduplicates by item_id before writing — API may return the same
// item_id multiple times with different zodu_id/branch_id variants.
// We keep only one record per item_id (last one wins).
export async function bulkUpsertProducts(products: PosProduct[]): Promise<void> {
  if (!Array.isArray(products) || products.length === 0) {
    console.warn("[POS] bulkUpsertProducts: nothing to write");
    return;
  }

  // Deduplicate: build a Map keyed by item_id — last entry wins
  const deduped = new Map<string, Record<string, unknown>>();
  for (const p of products as unknown as Record<string, unknown>[]) {
    const id = p.item_id as string;
    if (id) deduped.set(id, p);
  }

  const normalised = Array.from(deduped.values()).map(normalise);
  await db.products.bulkPut(normalised);
  console.log(`[POS] bulkUpsertProducts: wrote ${normalised.length} unique items (${products.length} received)`);
}

// ── Read all products for a branch ───────────────────────────
export async function getAllProducts(branchId: string): Promise<PosProduct[]> {
  return db.products.where("branch_id").equals(branchId).toArray();
}