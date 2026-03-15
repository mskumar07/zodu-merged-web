/**
 * useSaveOrder.ts
 * ─────────────────────────────────────────────────────────────
 * Thin hook that maps RetailPOS local state → API payload
 * and calls  POST /api/add/orders
 *
 * Usage:
 *   const { saveOrder, saving, lastError } = useSaveOrder();
 *   await saveOrder({ items, customer, discount, ... });
 */

import { useState, useCallback } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "https://api.myzodu.com";

// ── POS-side types (from RetailPOS component) ─────────────────
export interface LineItem {
  code: string;
  description: string;
  qty: number;
  unitPrice: number;
  hsn: string;
  mrp: number;
  gstPct: number;
  category?: string;
  unit?: string;
}

export interface Customer {
  name: string;
  mobile: string;
  address: string;
  gstin: string;
}

export interface SaveOrderParams {
  zodu_id: string;
  branch_id: string;
  items: LineItem[];
  customer: Customer;
  invoiceDate: string;            // "YYYY-MM-DD"
  discountPct: string;            // "5"  → % discount on gross
  discountFlat: string;           // "50" → flat ₹ discount
  receivedAmount: string;         // what cashier entered
  paymentType: "Cash" | "Card" | "UPI" | "Credit";
  referenceNo: string;            // transaction ref / UPI ID
}

// ── What the API returns on success ──────────────────────────
export interface SaveOrderResult {
  success: boolean;
  message: string;
  order?: Record<string, unknown>;
  items?: unknown[];
  payment?: Record<string, unknown>;
  paymentHistory?: Record<string, unknown> | null;
}

// ── Map POS discount state → API fields ──────────────────────
function resolveDiscount(discountPct: string, discountFlat: string) {
  const pct  = parseFloat(discountPct)  || 0;
  const flat = parseFloat(discountFlat) || 0;

  // If both are entered, treat percentage as primary
  if (pct > 0) return { discount_type: "percentage" as const, discount_value: pct };
  if (flat > 0) return { discount_type: "flat"       as const, discount_value: flat };
  return { discount_type: null, discount_value: 0 };
}

// ── Map payment_type → sale_type ──────────────────────────────
function toSaleType(pt: SaveOrderParams["paymentType"]) {
  if (pt === "Credit") return "credit";
  return "retail";
}

// ─────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────
export function useSaveOrder() {
  const [saving,    setSaving]    = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  const saveOrder = useCallback(
    async (params: SaveOrderParams): Promise<SaveOrderResult> => {
      setSaving(true);
      setLastError(null);

      try {
        const { discount_type, discount_value } = resolveDiscount(
          params.discountPct,
          params.discountFlat
        );

        // ── Build the payload the API expects ──────────────────
        const payload = {
          zodu_id:        params.zodu_id,
          branch_id:      params.branch_id,

          sale_type:      toSaleType(params.paymentType),
          sale_date:      params.invoiceDate,
          sale_time:      new Date().toLocaleTimeString("en-IN", { hour12: false }),

          // Customer
          customer_name:  params.customer.name  || null,
          customer_phone: params.customer.mobile || null,

          // Discount
          discount_type,
          discount_value,

          // Payment — parse to float; send null only when field is truly empty
            paid_amount:    (() => {
                            const n = parseFloat(params.receivedAmount);
                            return isNaN(n) ? 0 : n;
                          })(),
          payment_mode:   params.paymentType,
          transaction_id: params.referenceNo || null,

          // Line items — map LineItem → API item shape
          items: params.items.map((li) => ({
            product_id:     li.code,
            product_name:   li.description,
            unit:           li.unit   ?? "NOS",
            quantity:       li.qty,
            price:          li.unitPrice,
            discount:       0,                  // item-level discount not used in POS v3
            gst_percentage: li.gstPct,
            tax_inclusive:  false,
          })),
        };

        const { data } = await axios.post<SaveOrderResult>(
          `${API_BASE}/restaurant/api/add/orders`,
          payload
        );

        return data;
      } catch (err: unknown) {
        const msg =
          axios.isAxiosError(err)
            ? err.response?.data?.message ?? err.message
            : err instanceof Error
            ? err.message
            : "Unknown error";

        setLastError(msg);
        return { success: false, message: msg };
      } finally {
        setSaving(false);
      }
    },
    []
  );

  return { saveOrder, saving, lastError };
}