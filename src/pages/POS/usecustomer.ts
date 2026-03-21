/**
 * useCustomer.ts
 * ─────────────────────────────────────────────────────────────
 * Hooks for customer search + single customer fetch.
 * Calls GET /restaurant/api/customers  (tbl_customer)
 * ─────────────────────────────────────────────────────────────
 */

import { useState, useCallback, useRef } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "https://api.myzodu.com";

// ── Types matching tbl_customer columns ───────────────────────
export interface ApiCustomer {
  cust_uuid:     string;
  cust_id:       number;
  cust_name:     string | null;
  cpy_name:      string | null;
  mobile_no:     string[] | null;   // jsonb array in DB
  email_id:      string[] | null;
  gst:           string | null;
  address_line1: string | null;
  address_line2: string | null;
  city:          string | null;
  state:         string | null;
  pincode:       string | null;
  created_at:    string;
}

interface CustomerSearchResult {
  success:    boolean;
  total:      number;
  page:       number;
  limit:      number;
  totalPages: number;
  customers:  ApiCustomer[];
}

// ── Helpers ───────────────────────────────────────────────────
/** First mobile number from the jsonb array (safe) */
export function primaryMobile(c: ApiCustomer): string {
  return (c.mobile_no?.[0] ?? "").toString();
}

/** "CompanyName / PersonName" or whichever is available */
export function customerLabel(c: ApiCustomer): string {
  if (c.cpy_name && c.cust_name) return `${c.cpy_name} / ${c.cust_name}`;
  return c.cust_name ?? c.cpy_name ?? "Unknown";
}

/** Formatted address string from individual columns */
export function customerAddress(c: ApiCustomer): string {
  return [c.address_line1, c.address_line2, c.city, c.state, c.pincode]
    .filter(Boolean)
    .join(", ");
}

// ─────────────────────────────────────────────────────────────
//  useCustomerSearch — debounced, used in POS customer panel
// ─────────────────────────────────────────────────────────────
export function useCustomerSearch(zodu_id: string, branch_id: string) {
  const [results, setResults] = useState<ApiCustomer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback(
    (query: string) => {
      if (timerRef.current) clearTimeout(timerRef.current);

      if (!query.trim()) {
        setResults([]);
        return;
      }

      timerRef.current = setTimeout(async () => {
        setLoading(true);
        setError(null);
        try {
          const { data } = await axios.get<CustomerSearchResult>(
            `${API_BASE}/restaurant/api/customers`,
            { params: { zodu_id, branch_id, search: query.trim(), limit: 10, page: 1 } }
          );
          setResults(data.customers ?? []);
        } catch (err) {
          const msg = axios.isAxiosError(err)
            ? err.response?.data?.message ?? err.message
            : "Customer search failed";
          setError(msg);
          setResults([]);
        } finally {
          setLoading(false);
        }
      }, 280);
    },
    [zodu_id, branch_id]
  );

  const clear = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setResults([]);
    setError(null);
  }, []);

  return { results, loading, error, search, clear };
}