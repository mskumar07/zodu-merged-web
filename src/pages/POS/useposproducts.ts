/**
 * pos/usePosProducts.ts
 * ─────────────────────────────────────────────────────────────
 * Reusable TanStack Query hook that:
 *   1. Checks IndexedDB freshness (< 8 hours → skip network)
 *   2. If stale → fetches from  GET /get/pos_data/:branch_id
 *   3. Bulk-upserts into IndexedDB
 *   4. Returns the full local catalogue for instant search
 *   5. Builds a Fuse.js index once — sub-ms search on 25k rows
 *
 * Install:
 *   npm install @tanstack/react-query dexie fuse.js axios
 *
 * Wrap your app once (e.g. main.tsx):
 *   const queryClient = new QueryClient();
 *   <QueryClientProvider client={queryClient}>…</QueryClientProvider>
 * ─────────────────────────────────────────────────────────────
 */

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
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

// ── API base (change to your backend URL / env var) ───────────
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000";

// ── TanStack Query keys ───────────────────────────────────────
export const posProductsKey = (branchId: string) =>
  ["pos", "products", branchId] as const;

// ── API fetcher (used only when IndexedDB is stale) ──────────
async function fetchAndCacheProducts(branchId: string): Promise<PosProduct[]> {
  const { data } = await axios.get<{
    message: string;
    Data?: PosProduct[];   // capital D  — your router sends { Data: [...] }
    data?: PosProduct[];   // lowercase  — fallback
  }>(`${API_BASE}/restaurant/get/pos_data/${branchId}`);

  // Handle both { Data: [...] } and { data: [...] } shapes
  const products = data.Data ?? data.data ?? [];

  if (!Array.isArray(products) || products.length === 0) {
    console.warn("[POS] API returned empty or unexpected product list", data);
    return [];
  }

  await bulkUpsertProducts(products);
  await markSynced(branchId);

  return products;
}

// ── Core query function (returns from IDB or API) ─────────────
async function loadProducts(branchId: string): Promise<PosProduct[]> {
  const stale = await isCatalogueStale(branchId);

  if (!stale) {
    // IndexedDB is fresh — return local data immediately, no network
    return getAllProducts(branchId);
  }

  // Stale → hit the API, persist, then return
  return fetchAndCacheProducts(branchId);
}

// ── Main hook ────────────────────────────────────────────────
export function usePosProducts(branchId: string) {
  const query = useQuery({
    queryKey: posProductsKey(branchId),
    queryFn: () => loadProducts(branchId),
    staleTime: 8 * 60 * 60 * 1000,   // TanStack won't re-fetch for 8 h
    gcTime: 12 * 60 * 60 * 1000,     // keep in memory for 12 h
    refetchOnWindowFocus: false,       // offline-first: don't refetch on tab switch
    refetchOnReconnect: false,         // handle reconnect manually if needed
    retry: 2,
  });

  return query;
}

// ── Fuse search hook (built on top of usePosProducts) ────────
const FUSE_OPTIONS: Fuse.IFuseOptions<PosProduct> = {
  keys: [
    { name: "item_name",     weight: 0.8 },
    { name: "category_name", weight: 0.2 },
    // sku/barcode handled via exact→prefix→contains logic, not Fuse
  ],
  threshold: 0.25,           // tighter: 0 = exact only, 1 = match anything
  distance: 100,
  minMatchCharLength: 2,
  includeScore: true,
};

// Numeric-aware SKU comparator: 101 → 102 → ... → 1000 → 25906
// Falls back to locale-alpha for non-numeric SKUs
function skuCompare(a: PosProduct, b: PosProduct): number {
  const na = parseInt(a.sku ?? "", 10);
  const nb = parseInt(b.sku ?? "", 10);
  if (!isNaN(na) && !isNaN(nb)) return na - nb;
  if (!isNaN(na)) return -1;
  if (!isNaN(nb)) return 1;
  return (a.sku ?? "").localeCompare(b.sku ?? "");
}

export function usePosSearch(branchId: string, query: string) {
  const { data: products = [], isLoading, isError } = usePosProducts(branchId);

  // Build Fuse index once when products load
  const fuseRef = useRef<Fuse<PosProduct> | null>(null);
  useEffect(() => {
    if (products.length > 0) {
      fuseRef.current = new Fuse(products, FUSE_OPTIONS);
    }
  }, [products]);

  const results = useMemo<PosProduct[]>(() => {
    // Don't return anything until the catalogue is fully loaded
    if (isLoading || products.length === 0) return [];

    const q = query.trim();

    // No query → first 50 in numeric SKU order
    if (!q) {
      return [...products].sort(skuCompare).slice(0, 50);
    }

    const ql = q.toLowerCase();
    const isNumeric = /^\d+$/.test(q);

    if (isNumeric) {
      // Three priority buckets — order matters, DO NOT re-sort across buckets
      // exact "200" → prefix "2001","2002" → contains "1200","2000"
      const exact    = products.filter(p => p.sku === q || p.barcode === q);
      const prefix   = products
        .filter(p =>
          (p.sku?.startsWith(q) || p.barcode?.startsWith(q)) &&
          p.sku !== q && p.barcode !== q
        )
        .sort(skuCompare);   // sort within bucket only
      const contains = products
        .filter(p =>
          (p.sku?.includes(q) || p.barcode?.includes(q)) &&
          !p.sku?.startsWith(q) && !p.barcode?.startsWith(q)
        )
        .sort(skuCompare);   // sort within bucket only

      // Spread in priority order — exact always first, no cross-bucket sort
      return [...exact, ...prefix, ...contains].slice(0, 20);
    }

    // Text input → Fuse fuzzy on item_name / category
    if (!fuseRef.current) {
      return products
        .filter(p => p.item_name?.toLowerCase().includes(ql))
        .sort(skuCompare)
        .slice(0, 20);
    }

    const limit = q.length === 1 ? 30 : 20;
    return fuseRef.current
      .search(q, { limit })
      .map((r) => r.item)
      .sort(skuCompare);
  }, [query, products, isLoading]);

  return { results, isLoading, isError, total: products.length };
}

// ── Manual force-refresh (call after admin adds a product) ───
export function useForceRefreshProducts(branchId: string) {
  const queryClient = useQueryClient();

  return async () => {
    // Clear IDB meta so loadProducts treats data as stale
    await db.meta.delete(`lastSync_${branchId}`);
    // Invalidate TanStack cache → triggers a re-fetch
    await queryClient.invalidateQueries({ queryKey: posProductsKey(branchId) });
  };
}

// ── Utility: add/update a single product locally ─────────────
//  Call this after a "Create Item" flow to avoid a full re-sync
export async function upsertLocalProduct(product: PosProduct): Promise<void> {
  await db.products.put(product);
}