/**
 * restaurantPosApi.ts
 * All API hooks and types for the Restaurant POS screen.
 * Uses axios + TanStack React Query for data fetching.
 */

import { useState, useCallback, useRef } from "react";
import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "https://api.myzodu.com";
const BASE = "/retail";

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
  purchase_price: string;
  gst_tax: string;
  tax_include_or_exclude: boolean | null;
  menu_image: string | null;
  menu_type: string;
  menu_unit: string;
  food_type: string;
  hsn_code: string;
  category: string;
  active: boolean;
  favorites: boolean | null;
  variants: RestaurantVariant[] | null;
  count: number;
}

export interface RestaurantVariant {
  id?: string;
  variant_id?: string;
  variant_name: string;
  price: string;
}

export interface RestaurantCategory {
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

export interface AddOrderPayload {
  zodu_id: string;
  branch_id: string;
  table_no: number;
  order_type: string;
  items: {
    menu_id: string;
    name: string;
    price: number;
    qty: number;
    tax: number;
    tax_inclusive: boolean;
    variant_id: string | null;
    variant_name: string | null;
    image: string | null;
    menu_unit: string;
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
  tableNumber: number;
  items: {
    menu_id: string;
    name: string;
    price: number;
    qty: number;
    tax: number;
    tax_inclusive: boolean;
    variant_id: string | null;
    variant_name: string | null;
    image: string | null;
  }[];
  discount_type: string;
  discount_value: number;
  totalAmount: number;
  paymentType: string;
}

export interface HoldOrderPayload {
  zodu_id: string;
  branch_id: string;
  table_no: number | null;
  order_type: string;
  items: any[];
  total_amt: number;
  order_date: string;
  order_time: string;
}

export interface CreateCustomerPayload {
  zodu_id: string;
  branch_id: string;
  cust_name: string;
  mobile_no: string[];
  email_id?: string[];
  address_line1?: string;
}

// ─── API functions ────────────────────────────────────────────────

async function fetchMenuData(branchId: string): Promise<RestaurantCategory[]> {
  const { data } = await axios.get(`${API_BASE}${BASE}/get/pos_data/${branchId}`, {
    headers: authHeaders(),
  });
  return data?.Data ?? [];
}

async function fetchTableOrders(branchId: string) {
  const { data } = await axios.get(`${API_BASE}${BASE}/get/orders/${branchId}`, {
    headers: authHeaders(),
  });
  return data?.Data ?? [];
}

async function fetchHoldOrders(branchId: string) {
  const { data } = await axios.get(`${API_BASE}${BASE}/get/hold-orders/${branchId}`, {
    headers: authHeaders(),
  });
  return data?.Data ?? [];
}

async function postAddOrder(payload: AddOrderPayload) {
  const { data } = await axios.post(`${API_BASE}${BASE}/api/add/orders`, payload, {
    headers: authHeaders(),
  });
  return data;
}

async function postCompleteOrder(payload: CompleteOrderPayload) {
  const { data } = await axios.post(`${API_BASE}${BASE}/api/completeorder`, payload, {
    headers: authHeaders(),
  });
  return data;
}

async function postHoldOrder(payload: HoldOrderPayload) {
  const { data } = await axios.post(`${API_BASE}${BASE}/add/hold_menu`, payload, {
    headers: authHeaders(),
  });
  return data;
}

async function deleteHoldOrder(holdUuid: string) {
  const { data } = await axios.delete(`${API_BASE}${BASE}/delete/hold-menu/${holdUuid}`, {
    headers: authHeaders(),
  });
  return data;
}

async function postCreateCustomer(payload: CreateCustomerPayload) {
  const { data } = await axios.post(`${API_BASE}/retail/api/add/customer`, payload, {
    headers: authHeaders(),
  });
  return data;
}

async function searchCustomers(zoduId: string, branchId: string, query: string) {
  const { data } = await axios.get(`${API_BASE}/retail/api/customers`, {
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
    return sum + price * item.quantity;
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
