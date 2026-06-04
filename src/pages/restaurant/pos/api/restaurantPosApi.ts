/**
 * restaurantPosApi.ts
 * All API hooks and types for the Restaurant POS screen.
 * Uses axios + TanStack React Query for data fetching.
 */

import { useState, useCallback, useRef } from "react";
import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiConfig } from "@config/api";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";
const RETAIL_BASE = "/retail";

// ─── Auth helper ────────────────────────────────────────────────
function authHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ─── Types ───────────────────────────────────────────────────────

export interface RestaurantMenuItem {
  menu_id: string;
  menu_name: string;
  sell_price: string;
  purchase_price: string | null;
  gst_tax: string;
  tax_include_or_exclude: boolean | null;
  menu_image: string | null;
  menu_type: string;
  menu_unit: string;
  food_type: string | null;
  hsn_code: string | null;
  category: string;
  active: boolean;
  favorites: boolean | null;
  variants: RestaurantVariant[] | null;
  count: number;
  zodu_id?: string;
  branch_id?: string;
  qr_code?: string | null;
}

export interface RestaurantVariant {
  id?: string;
  variant_name: string;
  price: string;
}

export interface RestaurantCategory {
  id?: number;
  name: string;
  items: RestaurantMenuItem[];
}

export interface RestaurantCartItem {
  product: RestaurantMenuItem & {
    variant_id?: string;
    variant_name?: string;
    productTotal?: number;
  };
  quantity: number;
  note?: string;
}

export interface ApiCustomer {
  cust_uuid: string;
  cust_id: number;
  cust_name: string | null;
  cpy_name: string | null;
  mobile_no: string[] | null;
  email_id: string[] | null;
  gst: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  created_at: string;
}

export interface RestaurantOrder {
  orderId: string;
  tableNumber: number | null;
  kotNo: string | null;
  items: RestaurantCartItem[];
  customerName: string;
  customerPhone: string;
  orderType: "DineIn" | "Delivery" | "PickUp";
  subtotal: number;
  taxAmount: number;
  discount: number;
  discountType: "Percent" | "Amount";
  discountValue: number;
  grandTotal: number;
  paymentMethod: "Card" | "QR" | "Cash";
  notes: string;
}

export interface RunningOrderKotItem {
  item_id: string;
  kot_no: string;
  status: string;
  table_no: string;
  qty: number;
}

export interface RunningOrderOrderedItem {
  item_id: string;
  item_name: string;
  item_unit: string;
  qty: number;
  price: number;
  gst_tax?: number | string | null;
  tax_include_or_exclude?: boolean | null;
}

export interface RunningOrder {
  api_order_id: string;
  table_no: string;
  order_type: string;
  customer_name: string | null;
  customer_phone: string | null;
  final_payment: boolean;
  total_amt: string;
  kot_items: RunningOrderKotItem[];
  ordered_items: RunningOrderOrderedItem[];
}

export interface AddOrderPayload {
  zodu_id: string;
  branch_id: string;
  table_no: number | null;
  order_type: string;
  kot_no: string;
  items: {
    menu_id: string;
    name: string;
    price: number;
    qty: number;
    gst_percentage: number;
    tax_inclusive: boolean;
    menu_unit: string | null;
    variant_id: string | null;
    variant_name: string | null;
  }[];
  no_of_items: number;
  total_amt: number;
  discount_type: string;
  discount_value: number;
  final_payment: boolean;
  order_date: string;
  order_time: string;
  customer_name: string;
  customer_phone: string;
}

export interface CompleteOrderPayload {
  api_order_id: string;
  zodu_id: string;
  branch_id: string;
  table_no: number | null;
  payment_type: string;
  discount_type: string;
  discount_value: number;
  items: {
    menu_id: string;
    name: string;
    price: number;
    qty: number;
    gst_percentage: number;
    tax_inclusive: boolean;
    menu_unit: string | null;
    variant_id: string | null;
    variant_name: string | null;
  }[];
}

export interface HoldOrderPayload {
  zodu_id: string;
  branch_id: string;
  orderType: string;
  table_no: string | null;
  customerName: string | null;
  customerPhone: string | null;
  items: {
    item_id: string;
    item_name: string;
    item_unit: string | null;
    qty: number;
    price: number;
    variant_name: string | null;
    variant_id: string | null;
  }[];
}

export interface HoldOrderItem {
  item_id: string;
  item_name: string;
  item_unit: string | null;
  qty: number;
  price: number;
  variant_name: string | null;
  variant_id: string | null;
}

export interface HoldOrder {
  hold_id: string;
  zodu_id: string;
  branch_id: string;
  order_type: string;
  table_no: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  created_at: string;
  items: HoldOrderItem[];
}

export interface CreateCustomerPayload {
  zodu_id: string;
  branch_id: string;
  cust_name: string;
  mobile_no: string[];
  email_id?: string[];
  address_line1?: string;
}

// ─── Response normalizers ─────────────────────────────────────────

function normalizeVariants(raw: any[] | null | undefined): RestaurantVariant[] | null {
  if (!Array.isArray(raw) || raw.length === 0) return null;
  return raw.map((v) => ({
    id: v.id,
    variant_name: v.variant_name ?? v.name ?? "",
    price: String(v.price ?? "0"),
  }));
}

function normalizeItem(raw: any, categoryName: string): RestaurantMenuItem {
  return {
    zodu_id:              raw.zodu_id,
    branch_id:            raw.branch_id,
    menu_id:              raw.menu_id,
    menu_name:            raw.menu_name,
    sell_price:           String(raw.sell_price ?? "0"),
    purchase_price:       raw.purchase_price ?? null,
    gst_tax:              String(raw.gst_tax ?? "0"),
    tax_include_or_exclude: raw.tax_include_or_exclude ?? false,
    menu_image:           raw.menu_image || null,
    menu_type:            raw.menu_type ?? "Food",
    menu_unit:            raw.menu_unit ?? "PC",
    food_type:            raw.food_type ?? null,
    hsn_code:             raw.hsn_code ?? null,
    qr_code:              raw.qr_code ?? null,
    count:                raw.count ?? 0,
    favorites:            raw.favorites ?? false,
    active:               true,
    category:             categoryName,
    variants:             normalizeVariants(raw.variants),
  };
}

// ─── API functions ────────────────────────────────────────────────

async function fetchMenuData(branchId: string): Promise<RestaurantCategory[]> {
  const { data } = await axios.get(
    `http://localhost:5001/restaurant/get/pos_data/ZODU035B1`,
    { headers: authHeaders() }
  );
  const raw: any[] = data?.Data ?? [];
  return raw.map((cat) => ({
    id:    cat.id,
    name:  cat.name,
    items: (cat.items ?? []).map((item: any) => normalizeItem(item, cat.name)),
  }));
}

async function fetchTableOrders(branchId: string): Promise<RunningOrder[]> {
  const { data } = await axios.get(
    `${API_BASE}${apiConfig.menu.getTableKOT(branchId)}`,
    { headers: authHeaders() }
  );
  return (data?.data ?? []) as RunningOrder[];
}

async function fetchHoldOrders(branchId: string) {
  const { data } = await axios.get(
    `${API_BASE}${apiConfig.menu.getHoldMenu(branchId)}`,
    { headers: authHeaders() }
  );
  return (data?.Data?.data ?? []) as HoldOrder[];
}

async function postAddOrder(payload: AddOrderPayload) {
  const { data } = await axios.post(
    `${API_BASE}${apiConfig.menu.addTableKOT()}`,
    payload,
    { headers: authHeaders() }
  );
  return data;
}

async function postCompleteOrder(payload: CompleteOrderPayload) {
  const { data } = await axios.post(
    `${API_BASE}${apiConfig.menu.completeKOT()}`,
    payload,
    { headers: authHeaders() }
  );
  return data;
}

async function postHoldOrder(payload: HoldOrderPayload) {
  const { data } = await axios.post(
    `${API_BASE}${apiConfig.menu.holdMenu()}`,
    payload,
    { headers: authHeaders() }
  );
  return data;
}

async function deleteHoldOrder(holdUuid: string) {
  const { data } = await axios.delete(
    `${API_BASE}${apiConfig.menu.deleteHoldMenu(holdUuid)}`,
    { headers: authHeaders() }
  );
  return data;
}

async function postCreateCustomer(payload: CreateCustomerPayload) {
  const { data } = await axios.post(
    `${API_BASE}${RETAIL_BASE}/api/add/customer`,
    payload,
    { headers: authHeaders() }
  );
  return data;
}

async function searchCustomers(zoduId: string, branchId: string, query: string) {
  const { data } = await axios.get(`${API_BASE}${RETAIL_BASE}/api/customers`, {
    params: { zodu_id: zoduId, branch_id: branchId, search: query.trim(), limit: 10, page: 1 },
    headers: authHeaders(),
  });
  return data?.customers ?? [];
}

// ─── React Query hooks ────────────────────────────────────────────

export function useRestaurantMenuQuery(branchId: string) {
  return useQuery({
    queryKey: ["restaurant", "menu", branchId],
    queryFn: () => fetchMenuData(branchId),
    enabled: !!branchId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useTableOrdersQuery(branchId: string) {
  return useQuery({
    queryKey: ["restaurant", "tableOrders", branchId],
    queryFn: () => fetchTableOrders(branchId),
    enabled: !!branchId,
    refetchInterval: 30 * 1000,
  });
}

export function useHoldOrdersQuery(branchId: string) {
  return useQuery({
    queryKey: ["restaurant", "holdOrders", branchId],
    queryFn: () => fetchHoldOrders(branchId),
    enabled: !!branchId,
  });
}

export function useAddOrderMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: postAddOrder,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["restaurant", "tableOrders"] }),
  });
}

export function useCompleteOrderMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: postCompleteOrder,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["restaurant", "tableOrders"] });
    },
  });
}

export function useHoldOrderMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: postHoldOrder,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["restaurant", "holdOrders"] }),
  });
}

export function useDeleteHoldOrderMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteHoldOrder,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["restaurant", "holdOrders"] }),
  });
}

export function useCreateCustomerMutation() {
  return useMutation({ mutationFn: postCreateCustomer });
}

// ─── Customer search hook (debounced) ────────────────────────────

export function useCustomerSearch(zoduId: string, branchId: string) {
  const [results, setResults] = useState<ApiCustomer[]>([]);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback(
    (query: string) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (!query.trim()) { setResults([]); return; }
      timerRef.current = setTimeout(async () => {
        setLoading(true);
        try {
          const customers = await searchCustomers(zoduId, branchId, query);
          setResults(customers);
        } catch {
          setResults([]);
        } finally {
          setLoading(false);
        }
      }, 280);
    },
    [zoduId, branchId]
  );

  const clear = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setResults([]);
  }, []);

  return { results, loading, search, clear };
}

// ─── Tax calculation helpers ──────────────────────────────────────

export function getItemPrice(item: RestaurantMenuItem): number {
  return parseFloat(item.sell_price) || 0;
}

export function calcTax(items: RestaurantCartItem[]): number {
  return items.reduce((total, cartItem) => {
    const price = getItemPrice(cartItem.product);
    const gst = parseFloat(cartItem.product.gst_tax) || 0;
    const qty = cartItem.quantity;
    if (cartItem.product.tax_include_or_exclude) {
      const base = (price * qty) / (1 + gst / 100);
      return total + (price * qty - base);
    }
    return total + (price * qty * gst) / 100;
  }, 0);
}

export function calcSubtotal(items: RestaurantCartItem[]): number {
  return items.reduce((sum, item) => {
    const price = getItemPrice(item.product);
    const gst   = parseFloat(item.product.gst_tax) || 0;
    // Tax-inclusive: extract the pre-tax base from the sell_price
    const base  = item.product.tax_include_or_exclude
      ? price / (1 + gst / 100)
      : price;
    return sum + base * item.quantity;
  }, 0);
}

export function calcDiscount(
  subtotal: number,
  discountType: "Percent" | "Amount",
  discountValue: number
): number {
  if (discountType === "Percent") return (subtotal * discountValue) / 100;
  return Math.min(discountValue, subtotal);
}

export function calcGrandTotal(
  subtotal: number,
  taxAmount: number,
  discount: number
): number {
  return Math.max(0, subtotal + taxAmount - discount);
}
