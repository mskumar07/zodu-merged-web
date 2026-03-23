/**
 * pos/usePosProducts.ts
 * ─────────────────────────────────────────────────────────────
 * Changes:
 *  - Empty query → returns [] (no suggestions shown until user types)
 *  - Deduplication happens in db.bulkUpsertProducts (by item_id)
 * ─────────────────────────────────────────────────────────────
 */

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef } from "react";
import Fuse from "fuse.js";
import axios from "axios";

import {
  db,
  isCatalogueStale,
  bulkUpsertProducts,
  markSynced,
  getAllProducts,
  type PosProduct,
} from "./db";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "https://api.myzodu.com";

export const posProductsKey = (branchId: string) =>
  ["pos", "products", branchId] as const;

// ── API fetch + cache ─────────────────────────────────────────
async function fetchAndCacheProducts(branchId: string): Promise<PosProduct[]> {
  const { data } = await axios.get<{
    message: string;
    Data?: PosProduct[];
    data?: PosProduct[];
  }>(`${API_BASE}/restaurant/get/pos_data/${branchId}`);

  const products = data.Data ?? data.data ?? [];

  if (!Array.isArray(products) || products.length === 0) {
    console.warn("[POS] API returned empty or unexpected product list", data);
    return [];
  }

  // bulkUpsertProducts deduplicates by item_id before writing
  await bulkUpsertProducts(products);
  await markSynced(branchId);

  // Return deduped list from IDB (source of truth after write)
  return getAllProducts(branchId);
}

async function loadProducts(branchId: string): Promise<PosProduct[]> {
  const stale = await isCatalogueStale(branchId);

  // Not stale → serve from IDB directly (works fully offline)
  if (!stale) return getAllProducts(branchId);

  // Stale → try to refresh from API
  try {
    return await fetchAndCacheProducts(branchId);
  } catch (err) {
    // ✅ Offline fallback: API unreachable → serve whatever is in IDB
    // Cashier can still work; catalogue will sync next time they're online
    console.warn("[POS] API unreachable, serving cached catalogue:", err);
    const cached = await getAllProducts(branchId);
    if (cached.length > 0) return cached;
    throw err; // IDB also empty (first load, never synced) → surface the error
  }
}

// ── Core query hook ───────────────────────────────────────────
export function usePosProducts(branchId: string) {
  return useQuery({
    queryKey:             posProductsKey(branchId),
    queryFn:              () => loadProducts(branchId),
    staleTime:            8 * 60 * 60 * 1000,
    gcTime:               12 * 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect:   false,
    retry: 2,
  });
}

// ── Fuse options ──────────────────────────────────────────────
const FUSE_OPTIONS: Fuse.IFuseOptions<PosProduct> = {
  keys: [
    { name: "item_name",     weight: 0.8 },
    { name: "category_name", weight: 0.2 },
  ],
  threshold:          0.25,
  distance:           100,
  minMatchCharLength: 2,
  includeScore:       true,
};

// ── Sort numerically by item_id ───────────────────────────────
function itemCompare(a: PosProduct, b: PosProduct): number {
  const na = parseInt(a.item_id ?? "", 10);
  const nb = parseInt(b.item_id ?? "", 10);
  if (!isNaN(na) && !isNaN(nb)) return na - nb;
  if (!isNaN(na)) return -1;
  if (!isNaN(nb)) return  1;
  return (a.item_id ?? "").localeCompare(b.item_id ?? "");
}

// ── Search hook ───────────────────────────────────────────────
export function usePosSearch(branchId: string, query: string) {
  const { data: products = [], isLoading, isError } = usePosProducts(branchId);

  // Build Fuse index once when catalogue loads
  const fuseRef = useRef<Fuse<PosProduct> | null>(null);
  useEffect(() => {
    if (products.length > 0) {
      fuseRef.current = new Fuse(products, FUSE_OPTIONS);
    }
  }, [products]);

  const results = useMemo<PosProduct[]>(() => {
    if (isLoading || products.length === 0) return [];

    const q = query.trim();

    // ✅ Empty query → no suggestions (don't show anything until user types)
    if (!q) return [];

    const ql        = q.toLowerCase();
    const isNumeric = /^\d+$/.test(q);

    if (isNumeric) {
      // Priority 1: exact item_id match
      const exact = products.filter(p => p.item_id === q);

      // Priority 2: item_id starts with query
      const prefix = products
        .filter(p => p.item_id?.startsWith(q) && p.item_id !== q)
        .sort(itemCompare);

      // Priority 3: item_id contains query
      const contains = products
        .filter(p => p.item_id?.includes(q) && !p.item_id?.startsWith(q))
        .sort(itemCompare);

      return [...exact, ...prefix, ...contains].slice(0, 20);
    }

    // Text search → Fuse fuzzy on item_name / category_name
    if (!fuseRef.current) {
      return products
        .filter(p => p.item_name?.toLowerCase().includes(ql))
        .sort(itemCompare)
        .slice(0, 20);
    }

    const limit = q.length === 1 ? 30 : 20;
    return fuseRef.current
      .search(q, { limit })
      .map(r => r.item)
      .sort(itemCompare);
  }, [query, products, isLoading]);

  return { results, isLoading, isError, total: products.length };
}

// ── Force refresh ─────────────────────────────────────────────
export function useForceRefreshProducts(branchId: string) {
  const queryClient = useQueryClient();
  return async () => {
    await db.meta.delete(`lastSync_${branchId}`);
    await queryClient.invalidateQueries({ queryKey: posProductsKey(branchId) });
  };
}

// ── Upsert one product locally ────────────────────────────────
export async function upsertLocalProduct(product: PosProduct): Promise<void> {
  await db.products.put(product);
}