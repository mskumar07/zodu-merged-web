import Dexie, { type Table } from "dexie";

// ── Exact shape stored in IndexedDB (post-normalisation) ──────
export interface PosProduct {
  // identity
  zodu_id:   string;
  branch_id: string;

  // item
  item_id:   string;   // with zodu_id + branch_id, the primary key — always a non-null string
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
  products!: Table<PosProduct, [string, string, string]>;
  meta!:     Table<MetaRow,    string>;

  constructor() {
    // A row is keyed by company + branch + item. RetailPOS_v1 keyed it by
    // item_id alone, so two companies (or two branches) with the same item code
    // overwrote each other's rows. Dexie can't change a primary key in place,
    // hence the new database; the old one is deleted below.
    super("RetailPOS_v2");
    this.version(1).stores({
      products: "[zodu_id+branch_id+item_id], [zodu_id+branch_id], item_id, barcode",
      meta: "key",
    });
  }
}

export const db = new PosDatabase();

// The old database may still hold another account's catalogue.
void Dexie.delete("RetailPOS_v1").catch(() => {});

// A Dexie schema upgrade cannot run while another tab still holds the database
// open on the previous version — it blocks silently and indefinitely. Closing
// here lets the upgrading tab through; reloading puts this one on the new
// bundle, which is where the newer schema came from in the first place.
db.on("versionchange", () => {
  db.close();
  window.location.reload();
});

// ── Whose catalogue this is ───────────────────────────────────
// The cache outlives the session: a tab closed without "Sign out", or a session
// the server ended, leaves it behind. So every load first checks that it
// belongs to the user signed in now, and wipes it when it doesn't.
const OWNER_KEY = "owner";

/** Empties the whole POS cache (every company and branch). */
export async function clearCatalogue(): Promise<void> {
  await db.transaction("rw", db.products, db.meta, async () => {
    await db.products.clear();
    await db.meta.clear();
  });
}

/**
 * Makes the cache belong to `userId`, emptying it first when it holds another
 * user's catalogue. Without a user id (offline start, token not renewed yet)
 * it is left as it is: only an online sign-in can change who the user is.
 */
export async function claimCatalogue(userId: string | undefined): Promise<void> {
  if (!userId) return;
  const row = await db.meta.get(OWNER_KEY);
  if (row?.value === userId) return;
  await clearCatalogue();
  await db.meta.put({ key: OWNER_KEY, value: userId });
}

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

const versionKey = (zoduId: string, branchId: string) => `schemaVersion_${zoduId}_${branchId}`;
const lastSyncKey = (zoduId: string, branchId: string) => `lastSync_${zoduId}_${branchId}`;

export async function isCatalogueStale(zoduId: string, branchId: string): Promise<boolean> {
  try {
    const row = await db.meta.get(lastSyncKey(zoduId, branchId));
    if (!row) return true;

    const versionRow = await db.meta.get(versionKey(zoduId, branchId));
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

export async function markSynced(zoduId: string, branchId: string): Promise<void> {
  await db.meta.bulkPut([
    { key: lastSyncKey(zoduId, branchId), value: Date.now() },
    { key: versionKey(zoduId, branchId), value: CURRENT_CATALOGUE_VERSION },
  ]);
}

export async function clearSyncMeta(zoduId: string, branchId: string): Promise<void> {
  await db.meta.bulkDelete([lastSyncKey(zoduId, branchId), versionKey(zoduId, branchId)]);
}

// ── Normalise raw API row → correct types before IDB write ────
function normalise(p: Record<string, unknown>): PosProduct {
  return {
    ...(p as unknown as PosProduct),
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
    tax_inclusive:  Boolean(p.tax_inclusive),
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
function dedupe(products: PosProduct[]): Record<string, unknown>[] {
  const deduped = new Map<string, Record<string, unknown>>();
  for (const p of products as unknown as Record<string, unknown>[]) {
    const id = p.item_id as string;
    if (id) deduped.set(id, p);
  }
  return Array.from(deduped.values());
}

/**
 * Replaces one branch's catalogue with what the API just returned. Rows are
 * stamped with the company and branch they were fetched for, and items the
 * server no longer has are dropped instead of lingering in the cache.
 */
export async function replaceProducts(zoduId: string, branchId: string, products: PosProduct[]): Promise<void> {
  const rows = dedupe(products).map((p) => ({ ...normalise(p), zodu_id: zoduId, branch_id: branchId }));
  await db.transaction("rw", db.products, async () => {
    await db.products.where("[zodu_id+branch_id]").equals([zoduId, branchId]).delete();
    await db.products.bulkPut(rows);
  });
}

/** Updates rows already in the cache (each carries its own company and branch). */
export async function bulkUpsertProducts(products: PosProduct[]): Promise<void> {
  if (!Array.isArray(products) || products.length === 0) return;
  const rows = dedupe(products).map(normalise).filter((p) => p.zodu_id && p.branch_id);
  await db.products.bulkPut(rows);
}

// ── Read all products for a branch ───────────────────────────
export async function getAllProducts(zoduId: string, branchId: string): Promise<PosProduct[]> {
  return db.products.where("[zodu_id+branch_id]").equals([zoduId, branchId]).toArray();
}
