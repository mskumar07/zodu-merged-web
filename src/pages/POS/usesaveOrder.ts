// /**
//  * useSaveOrder.ts
//  * ─────────────────────────────────────────────────────────────
//  * Maps RetailPOS state → POST /restaurant/api/add/orders
//  *
//  * Tax-inclusive fix:
//  *  - LineItem.unitPrice is always the BASE (pre-tax) price
//  *    (toLineItem() in RetailPOS.tsx strips GST for inclusive items)
//  *  - tax_inclusive flag is forwarded to the backend so its own
//  *    calculateItemTax() uses the same formula
//  *  - price sent = unitPrice (base), backend re-derives tax from it
//  * ─────────────────────────────────────────────────────────────
//  */

// import { useState, useCallback } from "react";
// import axios from "axios";
// import { number } from "yup";

// const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "https://api.myzodu.com";

// export interface LineItem {
//   item_uuid:    string;
//   code:         string;
//   description:  string;
//   qty:          number;
//   unitPrice:    number;   // always BASE price (pre-tax)
//   taxInclusive: boolean;  // ✅ needed so backend tax formula matches frontend
//   hsn:          string;
//   mrp:          number;
//   gstPct:       number;
//   category?:    string;
//   unit?:        string;
//   sellPrice:    number;
// }

// export interface Customer {
//   id:      string | null;  // cust_uuid — null = walk-in
//   name:    string;
//   mobile:  string;
//   address: string;
//   gstin:   string;
// }

// export interface SaveOrderParams {
//   zodu_id:        string;
//   branch_id:      string;
//   items:          LineItem[];
//   customer:       Customer;
//   invoiceDate:    string;
//   discountPct:    string;
//   discountFlat:   string;
//   receivedAmount: string;
//   paymentType:    "Cash" | "Card" | "UPI" | "Credit";
//   referenceNo:    string;
// }

// export interface SaveOrderResult {
//   success:  boolean;
//   message:  string;
//   order?:   Record<string, unknown>;
//   items?:   unknown[];
//   payment?: Record<string, unknown> | null;
// }

// function resolveDiscount(pct: string, flat: string) {
//   const p = parseFloat(pct)  || 0;
//   const f = parseFloat(flat) || 0;
//   if (p > 0) return { discount_type: "percentage" as const, discount_value: p };
//   if (f > 0) return { discount_type: "flat"       as const, discount_value: f };
//   return       { discount_type: null,              discount_value: 0 };
// }

// /** Returns current time as "HH:mm" — Joi pattern /^([01]\d|2[0-3]):([0-5]\d)$/ */
// function currentHHmm(): string {
//   const now = new Date();
//   return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
// }

// export function useSaveOrder() {
//   const [saving,    setSaving]    = useState(false);
//   const [lastError, setLastError] = useState<string | null>(null);

//   const saveOrder = useCallback(async (params: SaveOrderParams): Promise<SaveOrderResult> => {
//     setSaving(true);
//     setLastError(null);
//     try {
//       const { discount_type, discount_value } = resolveDiscount(
//         params.discountPct, params.discountFlat
//       );

//       const paidAmount = parseFloat(params.receivedAmount) || 0;

//       console.log("me002",params)
//       const payload = {
//         zodu_id:   params.zodu_id,
//         branch_id: params.branch_id,

//         sale_type:  params.paymentType === "Credit" ? "credit" : "retail",
//         sale_date:  params.invoiceDate,
//         sale_time:  currentHHmm(),

//         customer_id: params.customer.id ?? null,

//         discount_type,
//         discount_value,

//         paid_amount:    paidAmount,
//         payment_mode:   params.paymentType,
//         transaction_id: params.referenceNo || null,

//         notes: null,

//         items: params.items.map(li => ({
//           item_uuid:      li.item_uuid,
//           item_id:        li.code,
//           item_name:      li.description,
//           unit:           li.unit ?? "NOS",
//           quantity:       li.qty,
//           price:          li.sellPrice,       // ✅ always BASE price
//           discount:       0,
//           gst_percentage: li.gstPct,
//           hsn_code:            li.hsn,
//           mrp:            li.mrp,
//           tax_inclusive:  li.taxInclusive,    // ✅ forwarded — was hardcoded false before
//         })),
//       };

//       const { data } = await axios.post<SaveOrderResult>(
//         `${API_BASE}/restaurant/api/add/orders`,
//         payload
//       );
//       return data;
//     } catch (err: unknown) {
//       const msg = axios.isAxiosError(err)
//         ? err.response?.data?.message ?? err.message
//         : err instanceof Error ? err.message : "Unknown error";
//       setLastError(msg);
//       return { success: false, message: msg };
//     } finally {
//       setSaving(false);
//     }
//   }, []);

//   return { saveOrder, saving, lastError };
// }
/**
 * useSaveOrder.ts
 * ─────────────────────────────────────────────────────────────
 * Maps RetailPOS state → POST /restaurant/api/add/orders
 *
 * Tax-inclusive fix:
 *  - LineItem.unitPrice is always the BASE (pre-tax) price
 *    (toLineItem() in RetailPOS.tsx strips GST for inclusive items)
 *  - tax_inclusive flag is forwarded to the backend so its own
 *    calculateItemTax() uses the same formula
 *  - price sent = sellPrice, matching the POS selling price shown to the cashier
 * ─────────────────────────────────────────────────────────────
 */

import { useState, useCallback } from "react";
import axios from "axios";
import { number } from "yup";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "https://api.myzodu.com";

export interface LineItem {
  uuid:    string;
  code:         string;
  description:  string;
  qty:          number;
  unitPrice:    number;   // always BASE price (pre-tax)
  taxInclusive: boolean;  // ✅ needed so backend tax formula matches frontend
  hsn:          string;
  mrp:          number;
  gstPct:       number;
  discount?:    number;   // ✅ item-level discount
  category?:    string;
  unit?:        string;
  sellPrice:    number;
}

export interface Customer {
  id:      string | null;  // cust_uuid — null = walk-in
  name:    string;
  mobile:  string;
  address: string;
  gstin:   string;
}

export interface SaveOrderParams {
  zodu_id:           string;
  branch_id:         string;
  items:             LineItem[];
  customer:          Customer;
  invoiceDate:       string;
  discountPct:       string;
  discountFlat:      string;
  discountGstMode:   "after" | "before";
  roundoff:          number;
  posMode:           "SALE" | "QUOTATION";
  receivedAmount:    string;
  paymentType:       "Cash" | "Card" | "UPI" | "Credit";
  referenceNo:       string;
}

export interface SaveOrderResult {
  success:  boolean;
  message:  string;
  order?:   Record<string, unknown>;
  items?:   unknown[];
  payment?: Record<string, unknown> | null;
}

function resolveDiscount(pct: string, flat: string) {
  const p = parseFloat(pct)  || 0;
  const f = parseFloat(flat) || 0;
  if (p > 0) return { discount_type: "percentage" as const, discount_value: p };
  if (f > 0) return { discount_type: "flat"       as const, discount_value: f };
  return       { discount_type: null,              discount_value: 0 };
}

/** Returns current time as "HH:mm:ss" — Joi pattern /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/ */
function currentHHmm(): string {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
}

export function useSaveOrder() {
  const [saving,    setSaving]    = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  const saveOrder = useCallback(async (params: SaveOrderParams): Promise<SaveOrderResult> => {
    setSaving(true);
    setLastError(null);
    try {
      const { discount_type, discount_value } = resolveDiscount(
        params.discountPct, params.discountFlat
      );

      const paidAmount = parseFloat(params.receivedAmount) || 0;

      console.log("me002",params)
      const payload = {
        zodu_id:   params.zodu_id,
        branch_id: params.branch_id,

        sale_type:  params.posMode === "QUOTATION" ? "quotation" : params.paymentType === "Credit" ? "credit" : "retail",
        sale_date:  params.invoiceDate,
        sale_time:  currentHHmm(),

        customer_id: params.customer.id ?? null,

        discount_type,
        discount_value,
        discount_gst_mode: params.discountGstMode,
        roundoff:          params.roundoff,

        paid_amount:    paidAmount,
        payment_mode:   params.paymentType,
        transaction_id: params.referenceNo || null,

        notes: null,

        items: params.items.map(li => ({
          item_uuid:      li.uuid,      // ✅ Always include item_uuid
          item_id:        li.code,
          item_name:      li.description,
          unit:           li.unit ?? "NOS",
          quantity:       li.qty,
          price:          li.sellPrice,      // ✅ selling price sent in payload
          discount:       li.discount ?? 0,  // ✅ item-level discount
          gst_percentage: li.gstPct,
          hsn_code:       li.hsn,
          mrp:            li.mrp,
          tax_inclusive:  li.taxInclusive,   // ✅ forwarded — was hardcoded false before
        })),
      };

      const { data } = await axios.post<SaveOrderResult>(
        `${API_BASE}/restaurant/api/add/orders`,
        payload
      );
      return data;
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.message ?? err.message
        : err instanceof Error ? err.message : "Unknown error";
      setLastError(msg);
      return { success: false, message: msg };
    } finally {
      setSaving(false);
    }
  }, []);

  
const updateOrder = useCallback(async (
  sale_uuid: string,
  params: SaveOrderParams
): Promise<SaveOrderResult> => {

  setSaving(true);
  setLastError(null);

  try {
    const { discount_type, discount_value } = resolveDiscount(
      params.discountPct,
      params.discountFlat
    );

    const paidAmount = parseFloat(params.receivedAmount) || 0;

    // ✅ SAME PAYLOAD AS saveOrder
    const payload = {
      sale_uuid:sale_uuid,
      zodu_id:   params.zodu_id,
      branch_id: params.branch_id,

      sale_type:  params.posMode === "QUOTATION" ? "quotation" : params.paymentType === "Credit" ? "credit" : "retail",
      sale_date:  params.invoiceDate,
      sale_time:  currentHHmm(),

      customer_id: params.customer.id ?? null,

      discount_type,
      discount_value,
      discount_gst_mode: params.discountGstMode,
      roundoff:          params.roundoff,

      paid_amount:    paidAmount,
      payment_mode:   params.paymentType,
      transaction_id: params.referenceNo || null,

      notes: null,

      items: params.items.map(li => ({
        item_uuid:      li.uuid,
        item_id:        li.code,
        item_name:      li.description,
        unit:           li.unit ?? "NOS",
        quantity:       li.qty,
        price:          li.sellPrice,
        discount:       li.discount ?? 0,
        gst_percentage: li.gstPct,
        hsn_code:       li.hsn,
        mrp:            li.mrp,
        tax_inclusive:  li.taxInclusive,
      })),
    };

    const { data } = await axios.put<SaveOrderResult>(
      `${API_BASE}/restaurant/api/update/orders`,
      payload
    );

    return data;

  } catch (err: any) {
    const msg = err?.response?.data?.message || err.message;
    setLastError(msg);
    return { success: false, message: msg };
  } finally {
    setSaving(false);
  }

}, []);

  return { saveOrder, saving, lastError,updateOrder };
}

