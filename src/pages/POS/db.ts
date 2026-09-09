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
  description?: string;   // absent when the menu item has no description

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
  mrp:           number;
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

// A Dexie schema upgrade cannot run while another tab still holds the database
// open on the previous version — it blocks silently and indefinitely. Closing
// here lets the upgrading tab through; reloading puts this one on the new
// bundle, which is where the newer schema came from in the first place.
db.on("versionchange", () => {
  db.close();
  window.location.reload();
});

// ── Staleness helpers ─────────────────────────────────────────
const STALE_MS = 8 * 60 * 60 * 1000;

/**
 * Bump whenever the normalised PosProduct shape changes — a new field, a
 * changed type, a different default.
 *
 * The age check alone cannot see a shape change: rows cached before a deploy
 * keep their old shape and are served for up to eight more hours, which is the
 * IndexedDB version of the stale-permissions bug. Comparing the version
 * stamped at write time against this constant forces one refetch instead.
 *
 * v1 — first versioned catalogue. Rows written before this carry no version
 *      and are treated as stale on the next load.
 */
export const CURRENT_CATALOGUE_VERSION = 1;

const versionKey = (branchId: string) => `schemaVersion_${branchId}`;
const lastSyncKey = (branchId: string) => `lastSync_${branchId}`;

export async function isCatalogueStale(branchId: string): Promise<boolean> {
  try {
    const row = await db.meta.get(lastSyncKey(branchId));
    if (!row) return true;

    const versionRow = await db.meta.get(versionKey(branchId));
    if (Number(versionRow?.value) !== CURRENT_CATALOGUE_VERSION) {
      console.warn(
        `[POS] cached catalogue for ${branchId} is v${versionRow?.value ?? 0}, expected ` +
          `v${CURRENT_CATALOGUE_VERSION} — refetching instead of serving the cached shape.`
      );
      return true;
    }

    return Date.now() - Number(row.value) > STALE_MS;
  } catch {
    return true;
  }
}

export async function markSynced(branchId: string): Promise<void> {
  await db.meta.bulkPut([
    { key: lastSyncKey(branchId), value: Date.now() },
    { key: versionKey(branchId), value: CURRENT_CATALOGUE_VERSION },
  ]);
}

export async function clearSyncMeta(branchId: string): Promise<void> {
  await db.meta.bulkDelete([lastSyncKey(branchId), versionKey(branchId)]);
}

// ── Normalise raw API row → correct types before IDB write ────
function normalise(p: Record<string, unknown>): PosProduct {

  console.log("db",p)
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
    mrp:            Number(p.mrp)            || 0,
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