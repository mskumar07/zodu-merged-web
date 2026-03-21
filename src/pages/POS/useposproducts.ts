/**
 * pos/usePosProducts.ts
 * ─────────────────────────────────────────────────────────────
 * UPDATED to match real API shape:
 *  - sku is null → all lookups use item_id
 *  - barcode is null → null-safe checks throughout
 *  - stock_qty available on PosProduct (can be used for out-of-stock badge)
 *  - itemCompare sorts numerically by item_id
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

  await bulkUpsertProducts(products);
  await markSynced(branchId);

  return products;
}

async function loadProducts(branchId: string): Promise<PosProduct[]> {
  const stale = await isCatalogueStale(branchId);
  if (!stale) return getAllProducts(branchId);
  return fetchAndCacheProducts(branchId);
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

// ── Fuse options (item_name + category_name only) ─────────────
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

// ── Sort numerically by item_id ("9528" < "10001") ────────────
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

    // No query → first 50 sorted by item_id
    if (!q) {
      return [...products].sort(itemCompare).slice(0, 50);
    }

    const ql        = q.toLowerCase();
    const isNumeric = /^\d+$/.test(q);

    if (isNumeric) {
      /**
       * Three priority buckets (order matters):
       *  1. exact item_id match  OR  exact barcode match
       *  2. item_id starts-with  OR  barcode starts-with  (sorted within bucket)
       *  3. item_id contains     OR  barcode contains     (sorted within bucket)
       *
       * barcode and sku can be null → use optional chaining throughout
       */
      const exact = products.filter(
        p => p.item_id === q || (p.barcode != null && p.barcode === q)
      );

      const prefix = products
        .filter(
          p =>
            (p.item_id?.startsWith(q) ||
             (p.barcode != null && p.barcode.startsWith(q))) &&
            p.item_id !== q &&
            p.barcode !== q
        )
        .sort(itemCompare);

      const contains = products
        .filter(
          p =>
            (p.item_id?.includes(q) ||
             (p.barcode != null && p.barcode.includes(q))) &&
            !p.item_id?.startsWith(q) &&
            !(p.barcode != null && p.barcode.startsWith(q))
        )
        .sort(itemCompare);

      return [...exact, ...prefix, ...contains].slice(0, 20);
    }

    // Text search → Fuse fuzzy on item_name / category_name
    if (!fuseRef.current) {
      // Fallback if Fuse not ready yet
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

// ── Force refresh (call after admin adds/edits a product) ─────
export function useForceRefreshProducts(branchId: string) {
  const queryClient = useQueryClient();
  return async () => {
    await db.meta.delete(`lastSync_${branchId}`);
    await queryClient.invalidateQueries({ queryKey: posProductsKey(branchId) });
  };
}

// ── Upsert one product locally (skip full re-sync) ────────────
export async function upsertLocalProduct(product: PosProduct): Promise<void> {
  await db.products.put(product);
}