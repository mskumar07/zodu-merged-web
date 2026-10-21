/**
 * SalesReturnDialog.tsx
 * Process a sales return — pixel-matched to HTML design.
 * max-w-4xl modal, items table, reason+summary grid, slate-50 footer.
 */
/**
 * SalesReturnDialog.tsx
 * Process a sales return — pixel-matched to HTML design.
 * max-w-4xl modal, items table, reason+summary grid, slate-50 footer.
 */
import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
  Box, Typography, IconButton, Button, TextField, Select,
  MenuItem, CircularProgress, Divider,
  Dialog, DialogContent,
  Table, TableBody, TableCell, TableHead, TableRow,
  Checkbox, FormControlLabel, alpha,
} from "@mui/material";
import {
  Add as AddIcon,
  SwapHoriz as SwapHorizIcon,
  Description as DescriptionIcon,
  ReceiptLongOutlined as ReceiptIcon,
  PersonOutline as PersonIcon,
  CalendarTodayOutlined as CalendarIcon,
  Close as CloseIcon,
  DeleteOutline as DeleteOutlineIcon,
  InfoOutlined as InfoIcon,
  Remove as RemoveIcon,
  AssignmentReturn as AssignmentReturnIcon,
} from "@mui/icons-material";
import { API_BASE, fetchSaleDetail, salesQueryKeys, getBranchId, getZoduId, createSaleReturn, updateSaleReturn, apiErrorMessage, REFUND_MODES, resolveNotify, type Notify, type SaleListReturn, type SaleReturnHistoryRow, type CreateSaleReturnPayload, type ReturnType, type Sale } from "./useSaleshistory";
import { INR } from "./dialogHelpers";
import { buildInvoiceContext, computeReturnBreakdown } from "./returnCredit";
import { useBlockWhenReadOnly } from "@hooks/useSubscriptionGuard";

interface Props {
  sale: Sale;
  onClose: () => void;
  onSuccess?: () => void;
  notify?:    Notify;
  /** Reopen an existing return: its items come back pre-selected, the rest of the invoice unselected. */
  editReturn?: SaleListReturn;
}

const RESTOCK_FEE_PCT = 10;
const todayStr = () => new Date().toISOString().slice(0, 10);
const RETURN_REASONS  = [
  { value: "damaged",  label: "Damaged on arrival" },
  { value: "wrong",    label: "Wrong item sent" },
  { value: "choice",   label: "Customer choice / No longer needed" },
  { value: "other",    label: "Other" },
];

// Helper function to get available quantity (original - already returned)
const getAvailableQty = (item: any): number => {
  const origQty = Number(item.quantity);
  const returnedQty = Number(item.returned_qty ?? 0);
  return Math.max(0, origQty - returnedQty);
};

// Shared table header cell — slate-50 bg, xs uppercase
function TH({ children, align = "left" }: { children: React.ReactNode; align?: "left" | "right" | "center" }) {
  return (
    <TableCell align={align} sx={{
      bgcolor: "#F8FAFC",
      fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.02em", whiteSpace: "nowrap",
      color: "#64748B",
      borderBottom: "1px solid #E2E8F0",
      py: 1.25, px: 2,
    }}>
      {children}
    </TableCell>
  );
}

export default function SalesReturnDialog({ sale, onClose, onSuccess, notify, editReturn }: Props) {
  const say = resolveNotify(notify);
  useBlockWhenReadOnly(true, onClose);
  const queryClient = useQueryClient();
  // The detail endpoint (and its cache key) address a sale by uuid.
  const saleId = sale.sale_uuid;
  const saleUuid = sale.sale_uuid;
  
  const { data, isLoading } = useQuery({
    queryKey: salesQueryKeys.detail(saleId),
    queryFn:  () => fetchSaleDetail(saleId),
    enabled:  !!saleId,
  });

  // ── Normalize API response fields ──────────────────────────────────────
  // API returns: item_name, item_id, item_uuid, sale_id, customer (separate object)
  // Component expects: product_name, product_id, invoice_no, customer_name
  const normalizedSale = useMemo(
    () => data?.sale
      ? {
          ...data.sale,
          invoice_no:    data.sale.invoice_no    ?? data.sale.sale_id,
          customer_name: data.sale.customer_name ?? data?.customer?.cust_name ?? null,
        }
      : sale,
    [data, sale],
  );

  const items = useMemo(
    () => (data?.items ?? []).map((item: any) => ({
      ...item,
      product_id:   item.product_id   ?? item.item_id,
      product_name: item.product_name ?? item.item_name,
      item_uuid:    item.item_uuid,  // Ensure item_uuid is preserved
    })),
    [data],
  );

  // Invoice-level discount / round-off maths, done once per loaded invoice.
  const creditContext = useMemo(() => buildInvoiceContext(normalizedSale, items), [normalizedSale, items]);
  // ───────────────────────────────────────────────────────────────────────

  // Edit mode: qty this very return holds per invoice line. Those units count as available
  // again, because editing the return releases them before re-allocating.
  const existingReturn = editReturn
    ? (data?.return_history as SaleReturnHistoryRow[] | undefined)?.find((r) => r.return_uuid === editReturn.return_uuid)
    : undefined;
  const ownQty: Record<number, number> = {};
  (existingReturn?.items ?? existingReturn?.return_items ?? []).forEach((ri) => {
    const line = items.find((i: any) => (ri.sale_item_id != null && i.id === ri.sale_item_id) || (ri.item_uuid && i.item_uuid === ri.item_uuid));
    if (line) ownQty[line.id] = (ownQty[line.id] ?? 0) + Number(ri.return_qty ?? ri.qty_returned ?? ri.returned_qty ?? 0);
  });
  // The detail response may omit the return's own lines. With one return per invoice, every
  // previously returned unit on the invoice belongs to this return, so fall back to that.
  if (editReturn && Object.keys(ownQty).length === 0) {
    items.forEach((i: any) => { const r = Number(i.returned_qty ?? 0); if (r > 0) ownQty[i.id] = r; });
  }
  const availableOf = (item: any): number => getAvailableQty(item) + (ownQty[item.id] ?? 0);

  const [selected,  setSelected]  = useState<Record<number, boolean>>({});
  const [returnQty, setReturnQty] = useState<Record<number, number>>({});
  const [reason,    setReason]    = useState("");
  const [note,      setNote]      = useState("");
  const [returnType, setReturnType] = useState<ReturnType>("SALES_RETURN");
  // Optionally pay the refund as part of the same request; otherwise it stays pending (Mark Payment later).
  const [payNow,      setPayNow]      = useState(false);
  const [payMode,     setPayMode]     = useState<(typeof REFUND_MODES)[number]>("Cash");
  const [payReference, setPayReference] = useState("");
  const [payDate,      setPayDate]      = useState(todayStr);
  // null = untouched -> follows the refundable amount as items/quantities change
  const [payAmountInput, setPayAmountInput] = useState<string | null>(null);
  const isCreditNote = returnType === "CREDIT_NOTE";

  useEffect(() => {
    if (items.length > 0) {
      const sel: Record<number, boolean> = {};
      const qty: Record<number, number>  = {};
      items.forEach((item: any) => {
        const own = ownQty[item.id] ?? 0;
        sel[item.id] = own > 0;                      // create: nothing ticked; edit: only this return's lines
        qty[item.id] = own > 0 ? own : availableOf(item);
      });
      setSelected(sel);
      setReturnQty(qty);
      if (editReturn) {
        setReturnType(editReturn.return_type ?? "SALES_RETURN");
        setReason(existingReturn?.return_reason ?? editReturn.return_reason ?? "");
        setNote(existingReturn?.notes ?? "");
      }
    }
  }, [items.length]);

  const toggleSelect    = (id: number) => setSelected(s => ({ ...s, [id]: !s[id] }));
  const toggleSelectAll = () => {
    const allSelected = items.every((i: any) => selected[i.id]);
    const next: Record<number, boolean> = {};
    items.forEach((i: any) => { next[i.id] = !allSelected; });
    setSelected(next);
  };
  const allSelected  = items.length > 0 && items.every((i: any) => selected[i.id]);
  const someSelected = items.some((i: any) => selected[i.id]);

  // Credit after the invoice's discounts, same as what the backend saves.
  const credit = useMemo(
    () => computeReturnBreakdown(
      creditContext,
      items
        .filter((item: any) => selected[item.id] && (returnQty[item.id] ?? 0) > 0)
        .map((item: any) => ({ item, qty: returnQty[item.id] })),
    ),
    [creditContext, items, selected, returnQty],
  );
  const totalReturnAmount = credit.total;

  // Names the discount so the cashier can see why the credit is below the item's price,
  // e.g. "Invoice discount (2.5% · Before GST)".
  const discountLabel = useMemo(() => {
    const s: any = normalizedSale;
    const pct = s?.discount_type === "percentage" ? Number(s.discount_value) : 0;
    const when = s?.discount_gst_mode === "before" ? "Before GST" : s?.discount_gst_mode === "after" ? "After GST" : "";
    const detail = [pct > 0 ? `${Number(pct.toFixed(2))}%` : "", when].filter(Boolean).join(" · ");
    return detail ? `Invoice discount (${detail})` : "Invoice discount";
  }, [normalizedSale]);

  const restockFee  = (totalReturnAmount * RESTOCK_FEE_PCT) / 100;
  // Restock fee row is hidden in UI — net refund equals the full return amount
  // Dues on the invoice absorb the return first; only the excess is owed back to the customer.
  // When editing, the stored balance already reflects this return's adjustment — add it back.
  // An overpaid invoice (negative balance, e.g. round-off) has no dues to absorb a return.
  const invoiceBalance  = Math.max(0, Number((normalizedSale as any)?.balance_amount ?? 0)
    + (editReturn ? Number(editReturn.adjusted_amount ?? 0) : 0));
  const refundable      = Math.max(0, totalReturnAmount - invoiceBalance);
  const adjustedAmount  = totalReturnAmount - refundable;
  const netRefund       = refundable;

  const payAmountText   = payAmountInput ?? (refundable > 0 ? String(Number(refundable.toFixed(2))) : "");
  const payAmount       = parseFloat(payAmountText);
  const payAmountValid  = payAmount > 0 && payAmount <= refundable + 0.001;
  const pendingAfter    = Math.max(0, refundable - (payAmountValid ? payAmount : 0));
  const showPayNow      = refundable > 0.001 && !editReturn;   // the update call carries no refund payment
// Refund type is only needed when the refund is paid now (the mode doubles as the type).
const canConfirm = someSelected && !!reason && (!payNow || !showPayNow || payAmountValid);

  const mutation = useMutation({
    mutationFn: async () => {
      const returnItems = items
        .filter((item: any) => selected[item.id] && (returnQty[item.id] ?? 0) > 0)
        .map((item: any) => ({
          // Description is inherited by the backend from the original sale
          // line automatically — not sent here (Joi has no stripUnknown, so
          // an extra key on this payload would 400).
          original_item_id: item.id,
          item_id:          item.item_id,
          item_uuid:        item.item_uuid,
          return_qty:       returnQty[item.id] ?? 0,
        }));

      if (returnItems.length === 0) {
        throw new Error("Select at least one item with a return quantity greater than 0");
      }

      if (editReturn) {
        await updateSaleReturn(editReturn.return_uuid, {
          zodu_id:       getZoduId()!,
          branch_id:     getBranchId()!,
          return_type:   returnType,
          return_reason: reason || null,
          notes:         note || null,
          items:         returnItems,
        });
        return { return_id: editReturn.return_id, refund_status: undefined };
      }

      const payload: CreateSaleReturnPayload = {
        original_sale_uuid: saleUuid,
        zodu_id:            getZoduId(),
        branch_id:          getBranchId(),
        return_type:        returnType,
        return_reason:      reason || null,
        refund_type:        payNow && showPayNow ? payMode : null,
        notes:              note || null,
        items:              returnItems,
        // amount omitted → backend refunds the full refund_due
        ...(payNow && showPayNow && {
          refund_payment: {
            payment_mode: payMode,
            amount:       Number(payAmount.toFixed(2)),
            refund_date:  payDate,
            ...(payReference.trim() && { reference_no: payReference.trim() }),
          },
        }),
      };

      const res = await createSaleReturn(payload);
      return { return_id: res.data.return_id, refund_status: res.data.refund_status };
    },
    onSuccess: async (res) => {
      const { return_id, refund_status } = res;
      say(
        `${isCreditNote ? "Credit note" : "Sales return"} ${return_id} ${editReturn ? "updated" : "created"}` +
        (refund_status === "PENDING" ? " — refund pending" : refund_status === "REFUNDED" ? " — refunded" : "")
      );
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: salesQueryKeys.detail(saleId) }),
        queryClient.invalidateQueries({ queryKey: ["sales-history"] }),
        queryClient.invalidateQueries({ queryKey: salesQueryKeys.returns() }),
      ]);
      onSuccess?.();
      onClose();
    },
    onError: (error: any) => {
      say(apiErrorMessage(error, "Failed to submit sales return"), "error");
    },
  });

  const handleSubmit = () => {
    if (!canConfirm || mutation.isPending) return;
    mutation.mutate();
  };

  // Shared input field style — rounded-xl, focus primary
  const inputSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "12px",
      fontSize: "0.875rem",
      bgcolor: "#fff",
      "& fieldset":             { borderColor: "#E2E8F0" },
      "&:hover fieldset":       { borderColor: "#CBD5E1" },
      "&.Mui-focused fieldset": { borderColor: "#D2042D", borderWidth: 2 },
    },
  };

  return (
    <Dialog
      open
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      scroll="paper"
      PaperProps={{
        sx: {
          borderRadius: "16px",
          overflow: "hidden",
          border: "1px solid #E2E8F0",
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
          display: "flex", flexDirection: "column",
          maxHeight: "92vh",
        },
      }}
    >
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <Box sx={{
        display: "flex", alignItems: "flex-start", justifyContent: "space-between",
        px: 3, py: 2,
        borderBottom: "1px solid #E2E8F0",
        bgcolor: "#fff",
      }}>
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
          <Box sx={{ p: 1, borderRadius: "8px", bgcolor: "rgba(210,4,45,0.1)", display: "flex" }}>
            <AssignmentReturnIcon sx={{ color: "#D2042D", fontSize: 22 }} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: "1.25rem", fontWeight: 700, color: "#0F172A", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              Process Return / Credit Note
            </Typography>
            <Typography sx={{ fontSize: "0.875rem", fontWeight: 500, color: "#64748B", mt: 0.4 }}>
              {editReturn ? `Editing ${editReturn.return_id} — its items are ticked; the rest of the invoice is not.` : "Select items and process as Sales Return or Credit Note."}
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} size="small"
          sx={{ borderRadius: "999px", color: "#64748B", "&:hover": { bgcolor: "#F1F5F9" }, mt: 0.5 }}>
          <CloseIcon sx={{ fontSize: 22 }} />
        </IconButton>
      </Box>

      {/* ── Scrollable body ─────────────────────────────────────────────── */}
      <DialogContent sx={{ p: 3, bgcolor: "#fff", flex: 1, overflowY: "auto" }}>
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
            <CircularProgress sx={{ color: "#D2042D" }} size={32} />
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>

            {/* ── Invoice / customer details + transaction type ─────────── */}
            <Box sx={{
              display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between",
              gap: 2, px: 2.5, py: 1.75,
              bgcolor: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "14px",
            }}>
              <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: { xs: 2, md: 4 } }}>
                {[
                  { label: "Invoice No.",   value: (normalizedSale as any)?.invoice_no ?? "—",                    icon: <ReceiptIcon sx={{ fontSize: 18 }} /> },
                  { label: "Customer",      value: (normalizedSale as any)?.customer_name || "Walk-In",           icon: <PersonIcon sx={{ fontSize: 18 }} /> },
                  { label: "Invoice Date",  value: (normalizedSale as any)?.sale_date_fmt ?? "—",        icon: <CalendarIcon sx={{ fontSize: 17 }} /> },
                ].map((f) => (
                  <Box key={f.label} sx={{ display: "flex", alignItems: "center", gap: 1.25, minWidth: 0 }}>
                    <Box sx={{ width: 34, height: 34, borderRadius: "10px", bgcolor: "#fff", border: "1px solid #E2E8F0", color: "#64748B", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {f.icon}
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ fontSize: "0.68rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#94A3B8", lineHeight: 1.2 }}>{f.label}</Typography>
                      <Typography noWrap sx={{ fontSize: "0.95rem", fontWeight: 700, color: "#0F172A", lineHeight: 1.35, maxWidth: 220 }}>{f.value}</Typography>
                    </Box>
                  </Box>
                ))}
              </Box>

              {/* Transaction type — segmented control */}
              <Box sx={{ display: "inline-flex", p: 0.5, gap: 0.5, bgcolor: "#E2E8F0", borderRadius: "11px" }}>
                {([
                  { value: "SALES_RETURN", label: "Sales Return", icon: <SwapHorizIcon sx={{ fontSize: 17 }} /> },
                  { value: "CREDIT_NOTE",  label: "Credit Note",  icon: <DescriptionIcon sx={{ fontSize: 16 }} /> },
                ] as const).map((t) => {
                  const active = returnType === t.value;
                  const seg = (
                    <Box
                      onClick={() => { if (!editReturn) setReturnType(t.value); }}
                      sx={{
                        display: "flex", alignItems: "center", gap: 0.75,
                        px: 2, py: 0.75, borderRadius: "8px",
                        fontSize: "0.85rem", fontWeight: 700,
                        bgcolor: active ? "#fff" : "transparent",
                        color: active ? "#D2042D" : "#64748B",
                        boxShadow: active ? "0 1px 3px rgba(15,23,42,0.15)" : "none",
                        cursor: editReturn ? (active ? "default" : "not-allowed") : "pointer",
                        opacity: editReturn && !active ? 0.5 : 1,
                        transition: "all 0.15s",
                        userSelect: "none",
                      }}
                    >
                      {t.icon}
                      {t.label}
                    </Box>
                  );
                  return <Box key={t.value}>{seg}</Box>;
                })}
              </Box>
            </Box>

            {/* ── Items table ─────────────────────────────────────────────── */}
            <Box sx={{ border: "1px solid #E2E8F0", borderRadius: "12px", overflow: "hidden" }}>
              <Table>
                <TableHead>
                  <TableRow>
                    {/* Select all checkbox */}
                    <TableCell padding="checkbox" sx={{ bgcolor: "#F8FAFC", borderBottom: "1px solid #E2E8F0", px: 2, width: 48 }}>
                      <Checkbox
                        checked={allSelected}
                        indeterminate={someSelected && !allSelected}
                        onChange={toggleSelectAll}
                        sx={{ color: "#CBD5E1", "&.Mui-checked": { color: "#D2042D" }, "&.MuiCheckbox-indeterminate": { color: "#D2042D" }, py:0.2 }}
                      />
                    </TableCell>
                    <TH>Item Details</TH>
                    <TH align="center">Qty Original</TH>
                    <TH align="center">Returned / Credited</TH>
                    <TH align="center">Available</TH>
                    <TH align="center">Return/Credit Qty</TH>
                    <TH align="right">Unit Price</TH>
                    <TH align="right">Amount</TH>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((item: any, idx: number) => {
                    const isLast        = idx === items.length - 1;
                    const origQty       = Number(item.quantity);
                    const returnedQty   = Number(item.returned_qty ?? 0);
                    const availableQty  = availableOf(item);
                    const rQty          = returnQty[item.id] ?? availableQty;
                    const price         = Number(item.price);
                    const lineTotal     = selected[item.id] ? rQty * price : 0;
                    const rowBg         = selected[item.id] ? alpha("#D2042D", 0.03) : "transparent";
                    const borderB       = isLast ? 0 : "1px solid #F1F5F9";

                    return (
                      <TableRow key={item.id} sx={{ bgcolor: rowBg, transition: "background 0.15s" }}>

                        {/* Checkbox */}
                        <TableCell padding="checkbox" sx={{ borderBottom: borderB, px: 2 }}>
                          <Checkbox
                            checked={!!selected[item.id]}
                            onChange={() => toggleSelect(item.id)}
                            sx={{ color: "#CBD5E1", "&.Mui-checked": { color: "#D2042D" }, p: 0.5 }}
                          />
                        </TableCell>

                        {/* Item code (GST %) - name + sub-label */}
                        <TableCell sx={{ borderBottom: borderB, py: 0.75, px: 2 }}>
                          <Typography sx={{ fontSize: "0.875rem", fontWeight: 700, color: "#0F172A" }}>
                            {item.product_id}
                            {Number(item.gst_percentage) > 0 ? ` (${Number(item.gst_percentage)}%)` : ""}
                            {" - "}{item.product_name}
                          </Typography>
                          {item.variant_name && (
                            <Typography sx={{ fontSize: "0.75rem", color: "#94A3B8", mt: 0.2 }}>
                              {item.variant_name}
                            </Typography>
                          )}
                        </TableCell>

                        {/* Qty original */}
                        <TableCell align="center" sx={{ borderBottom: borderB, py: 0.75, px: 2, fontSize: "0.875rem", color: "#334155" }}>
                          {origQty}
                        </TableCell>
                        {/* Previously returned qty */}
                        <TableCell align="center" sx={{ borderBottom: borderB, py: 0.75, px: 2 }}>
                          {returnedQty > 0 ? (
                            <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: "#7C3AED" }}>
                              {returnedQty}
                            </Typography>
                          ) : (
                            <Typography sx={{ fontSize: "0.875rem", color: "#94A3B8" }}>-</Typography>
                          )}
                        </TableCell>

                        {/* Available qty */}
                        <TableCell align="center" sx={{ borderBottom: borderB, py: 0.75, px: 2 }}>
                          <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: availableQty > 0 ? "#0F172A" : "#D2042D" }}>
                            {availableQty}
                          </Typography>
                        </TableCell>
                        {/* Return qty input � counter style with +/- buttons */}
                        <TableCell align="center" sx={{ borderBottom: borderB, py: 0.75, px: 1 }}>
                          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Box
                              sx={{
                                display: "inline-flex",
                                alignItems: "center",
                                height: 34,
                                border: `1.5px solid ${selected[item.id] ? "#E2E8F0" : "#CBD5E1"}`,
                                borderRadius: "8px",
                                overflow: "hidden",
                                bgcolor: selected[item.id] ? "#FFFFFF" : "#F8FAFC",
                                transition: "border-color 0.15s, background 0.15s",
                              }}
                            >
                              <Box
                                component="button"
                                type="button"
                                onClick={() => {
                                  const current = returnQty[item.id] ?? availableQty;
                                  const newQty = Math.max(0, current - 1);
                                  setReturnQty(q => ({ ...q, [item.id]: newQty }));
                                }}
                                disabled={!selected[item.id] || rQty <= 0}
                                sx={{
                                  width: 30,
                                  height: "100%",
                                  border: "none",
                                  borderRight: "1px solid #E2E8F0",
                                  bgcolor: "transparent",
                                  cursor: !selected[item.id] || rQty <= 0 ? "default" : "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  color: !selected[item.id] || rQty <= 0 ? "#CBD5E1" : "#D2042D",
                                  transition: "background 0.1s",
                                  "&:hover:not(:disabled)": { bgcolor: "rgba(210,31,60,0.07)" },
                                  "&:active:not(:disabled)": { bgcolor: "rgba(210,31,60,0.13)" },
                                  p: 0,
                                  m: 0,
                                  flexShrink: 0,
                                }}
                              >
                                <RemoveIcon sx={{ fontSize: 16 }} />
                              </Box>
                              <Box
                                component="input"
                                type="number"
                                value={rQty}
                                disabled={!selected[item.id]}
                                onClick={e => e.stopPropagation()}
                                onChange={e => {
                                  const v = parseInt(e.target.value, 10);
                                  if (isNaN(v)) return;
                                  setReturnQty(q => ({
                                    ...q,
                                    [item.id]: Math.min(Math.max(0, v), availableQty),
                                  }));
                                }}
                                sx={{
                                  width: 44,
                                  height: "100%",
                                  border: "none",
                                  outline: "none",
                                  textAlign: "center",
                                  fontSize: "0.95rem",
                                  fontWeight: 700,
                                  color: !selected[item.id] ? "#94A3B8" : "#0F172A",
                                  bgcolor: "transparent",
                                  fontFamily: "inherit",
                                  "&::-webkit-outer-spin-button, &::-webkit-inner-spin-button": {
                                    WebkitAppearance: "none",
                                    margin: 0,
                                  },
                                  MozAppearance: "textfield",
                                  p: 0,
                                }}
                              />
                              <Box
                                component="button"
                                type="button"
                                onClick={() => {
                                  const current = returnQty[item.id] ?? availableQty;
                                  const newQty = Math.min(current + 1, availableQty);
                                  setReturnQty(q => ({ ...q, [item.id]: newQty }));
                                }}
                                disabled={!selected[item.id] || rQty >= availableQty}
                                sx={{
                                  width: 30,
                                  height: "100%",
                                  border: "none",
                                  borderLeft: "1px solid #E2E8F0",
                                  bgcolor: "transparent",
                                  cursor: !selected[item.id] || rQty >= origQty ? "default" : "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  color: !selected[item.id] || rQty >= origQty ? "#CBD5E1" : "#D2042D",
                                  transition: "background 0.1s",
                                  "&:hover:not(:disabled)": { bgcolor: "rgba(210,31,60,0.07)" },
                                  "&:active:not(:disabled)": { bgcolor: "rgba(210,31,60,0.13)" },
                                  p: 0,
                                  m: 0,
                                  flexShrink: 0,
                                }}
                              >
                                <AddIcon sx={{ fontSize: 16 }} />
                              </Box>
                            </Box>
                          </Box>
                        </TableCell>

                        {/* Unit price */}
                        <TableCell align="right" sx={{ borderBottom: borderB, py: 0.75, px: 2, fontSize: "0.875rem", color: "#334155" }}>
                          {INR(price)}
                        </TableCell>

                        {/* Line total */}
                        <TableCell align="right" sx={{ borderBottom: borderB, py: 0.75, px: 2 }}>
                          <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: selected[item.id] ? "#0F172A" : "#94A3B8" }}>
                            {INR(lineTotal)}
                          </Typography>
                        </TableCell>

                        {/* Delete button */}
                        {/* <TableCell align="center" sx={{ borderBottom: borderB, py: 0.75, px: 1 }}>
                          <IconButton
                            size="small"
                            onClick={() => {
                              const newSelected = { ...selected };
                              delete newSelected[item.id];
                              setSelected(newSelected);
                              const newQty = { ...returnQty };
                              delete newQty[item.id];
                              setReturnQty(newQty);
                            }}
                            sx={{ color: "#D1D5DB", "&:hover": { color: "#DC2626", bgcolor: "#FEE2E2" } }}
                          >
                            <DeleteOutlineIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        </TableCell> */}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Box>

            {/* ── Return details + Financial summary — md:grid-cols-5 ─────── */}
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "3fr 2fr" }, gap: 4 }}>

              {/* Left col (md:col-span-3) — reason + note */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                <Box>
                  <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: "#0F172A", mb: 1 }}>
                    Return Reason
                  </Typography>
                  <Select
                    size="small"
                    fullWidth
                    displayEmpty
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                    sx={{
                      borderRadius: "12px",
                      height: 44,
                      fontSize: "0.875rem",
                      bgcolor: "#fff",
                      "& fieldset":             { borderColor: "#E2E8F0" },
                      "&:hover fieldset":       { borderColor: "#CBD5E1" },
                      "&.Mui-focused fieldset": { borderColor: "#D2042D", borderWidth: 2 },
                    }}
                  >
                    <MenuItem value="" disabled sx={{ color: "#94A3B8", fontSize: "0.875rem" }}>
                      Select reason...
                    </MenuItem>
                    {RETURN_REASONS.map(r => (
                      <MenuItem key={r.value} value={r.value} sx={{ fontSize: "0.875rem" }}>
                        {r.label}
                      </MenuItem>
                    ))}
                  </Select>
                </Box>
                {/* Pay the refund now (only meaningful when the customer has paid something) */}
                {showPayNow && (
                  <Box sx={{ border: "1px solid #E2E8F0", borderRadius: "12px", px: 2, py: 1 }}>
                    <FormControlLabel
                      control={<Checkbox checked={payNow} onChange={(e) => { setPayNow(e.target.checked); setPayAmountInput(null); }} sx={{ "&.Mui-checked": { color: "#D2042D" } }} />}
                      label={<Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: "#0F172A" }}>Pay refund now</Typography>}
                    />
                    {payNow ? (
                      <Box sx={{ pb: 1.5, display: "flex", flexDirection: "column", gap: 1.5 }}>
                        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
                          <Box>
                            <Typography sx={{ fontSize: "0.75rem", fontWeight: 600, color: "#475569", mb: 0.5 }}>
                              {isCreditNote ? "Credit Type" : "Refund Type"}
                            </Typography>
                            <Select size="small" fullWidth value={payMode} onChange={(e) => setPayMode(e.target.value as typeof payMode)} sx={{ borderRadius: "10px", fontSize: "0.875rem" }}>
                              {REFUND_MODES.map((m) => <MenuItem key={m} value={m} sx={{ fontSize: "0.875rem" }}>{m}</MenuItem>)}
                            </Select>
                          </Box>
                          <Box>
                            <Typography sx={{ fontSize: "0.75rem", fontWeight: 600, color: "#475569", mb: 0.5 }}>Amount to pay now</Typography>
                            <TextField
                              size="small" fullWidth type="number" value={payAmountText}
                              error={!!payAmountText && !payAmountValid}
                              onChange={(e) => setPayAmountInput(e.target.value)}
                              inputProps={{ min: 0, max: refundable, step: "0.01", style: { fontWeight: 700 } }}
                              InputProps={{ startAdornment: <Typography sx={{ mr: 0.5, fontWeight: 700, color: "#64748B" }}>₹</Typography> }}
                              sx={inputSx}
                            />
                          </Box>
                          <Box>
                            <Typography sx={{ fontSize: "0.75rem", fontWeight: 600, color: "#475569", mb: 0.5 }}>Reference No.</Typography>
                            <TextField size="small" fullWidth placeholder="Optional" value={payReference} onChange={(e) => setPayReference(e.target.value)} sx={inputSx} />
                          </Box>
                          <Box>
                            <Typography sx={{ fontSize: "0.75rem", fontWeight: 600, color: "#475569", mb: 0.5 }}>Date</Typography>
                            <TextField size="small" fullWidth type="date" value={payDate} onChange={(e) => setPayDate(e.target.value)} inputProps={{ max: todayStr() }} sx={inputSx} />
                          </Box>
                        </Box>
                        {!!payAmountText && !payAmountValid ? (
                          <Typography sx={{ fontSize: "0.75rem", color: "#D32F2F", fontWeight: 600 }}>
                            Enter an amount above ₹0 and up to {INR(refundable)}.
                          </Typography>
                        ) : (
                          <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, color: pendingAfter > 0 ? "#B45309" : "#15803D" }}>
                            Pending after this: {INR(pendingAfter)}
                            {pendingAfter > 0 && <Box component="span" sx={{ fontWeight: 500, color: "#64748B" }}> - the rest stays pending; pay it later from the invoice.</Box>}
                          </Typography>
                        )}
                      </Box>
                    ) : (
                      <Typography sx={{ fontSize: "0.75rem", color: "#94A3B8", pb: 1, pl: 0.5 }}>
                        Leave unchecked to keep the whole refund pending — you can pay it later from the invoice.
                      </Typography>
                    )}
                  </Box>
                )}
                <Box>
                  <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: "#0F172A", mb: 1 }}>
                    Internal Note (Optional)
                  </Typography>
                  <TextField
                    multiline
                    rows={5}
                    fullWidth
                    placeholder="Add specific details about the return condition, photos received, or manager approval..."
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    sx={inputSx}
                  />
                </Box>
              </Box>

              {/* Right col (md:col-span-2) — financial summary card */}
              <Box sx={{
                bgcolor: "#F8FAFC",
                borderRadius: "16px",
                p: 3,
                display: "flex", flexDirection: "column", justifyContent: "space-between",
                gap: 3,
              }}>
                {/* Top: summary rows */}
                <Box>
                  <Typography sx={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.12em", color: "#94A3B8", textTransform: "uppercase", mb: 2 }}>
                    Financial Summary
                  </Typography>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                    {[
                      // Breakdown first, so the total never appears to differ from the item's price without a reason
                      { label: "Item Value", value: credit.itemValue, show: credit.itemValue > 0, sign: "", color: undefined as string | undefined, bold: false },
                      { label: discountLabel, value: credit.discount, show: Math.abs(credit.discount) >= 0.005, sign: "-", color: "#D2042D" as string | undefined, bold: false },
                      { label: "Round Off", value: Math.abs(credit.roundOff), show: Math.abs(credit.roundOff) >= 0.005, sign: credit.roundOff < 0 ? "-" : "+", color: "#64748B" as string | undefined, bold: false },
                      { label: "Total Return Amount", value: totalReturnAmount, show: true, sign: "", color: undefined as string | undefined, bold: true },
                      { label: "Adjusted against dues", value: adjustedAmount, show: adjustedAmount > 0.001, sign: "-", color: "#0369A1" as string | undefined, bold: false },
                    ].filter((r) => r.show).map((r) => (
                      <Box
                        key={r.label}
                        sx={{
                          display: "flex", justifyContent: "space-between", alignItems: "center",
                          ...(r.bold && { borderTop: "1px dashed #CBD5E1", pt: 1.25, mt: 0.25 }),
                        }}
                      >
                        <Typography sx={{ fontSize: "0.875rem", color: r.bold ? "#0F172A" : "#475569", fontWeight: r.bold ? 700 : 400 }}>{r.label}</Typography>
                        <Typography sx={{ fontSize: "0.875rem", fontWeight: r.bold ? 700 : 600, color: r.color ?? "#0F172A" }}>
                          {r.sign}{INR(r.value)}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>

                {/* Bottom: net refund + info note */}
                <Box sx={{ borderTop: "1px solid #E2E8F0", pt: 2.5 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                    <Typography sx={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.12em", color: "#94A3B8", textTransform: "uppercase" }}>
                      Refund Payable
                    </Typography>
                    <Typography sx={{ fontSize: "1.875rem", fontWeight: 900, color: "#D2042D", letterSpacing: "-1px", lineHeight: 1 }}>
                      {INR(netRefund)}
                    </Typography>
                  </Box>
                  {/* Info note */}
                  <Box sx={{ display: "flex", alignItems: "flex-start", gap: 0.75 }}>
                    <InfoIcon sx={{ fontSize: 14, color: "#94A3B8", mt: 0.2, flexShrink: 0 }} />
                    <Typography sx={{ fontSize: "0.7rem", color: "#94A3B8", lineHeight: 1.5 }}>
                      Refund will be processed to the original payment method.
                    </Typography>
                  </Box>
                </Box>
              </Box>

            </Box>
          </Box>
        )}
      </DialogContent>

      {/* ── Footer — slate-50, Cancel text + Confirm Return red CTA ──────── */}
      <Box sx={{
        display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 2,
        px: 4, py: 2.5,
        borderTop: "1px solid #E2E8F0",
        bgcolor: "#F8FAFC",
      }}>
        <Button
          onClick={onClose}
          sx={{
            px: 4, py: 1.5, borderRadius: "12px",
            fontWeight: 700, fontSize: "0.875rem",
            color: "#475569",
            "&:hover": { bgcolor: "#E2E8F0" },
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          disableElevation
          disabled={!canConfirm || mutation.isPending}
          onClick={handleSubmit}
          sx={{
            px: 6, py: 1.5, borderRadius: "12px",
            bgcolor: "#D2042D", color: "#fff",
            fontWeight: 700, fontSize: "1rem",
            boxShadow: "0 8px 24px rgba(210,4,45,0.3)",
            "&:hover":        { bgcolor: "#B80028", opacity: 0.9 },
            "&:active":       { transform: "scale(0.95)" },
            "&.Mui-disabled": { bgcolor: "#E2E8F0", color: "#94A3B8", boxShadow: "none" },
            transition: "all 0.15s",
          }}
        >
          {mutation.isPending ? "Submitting..." : editReturn ? "Update Return" : isCreditNote ? "Issue Credit Note" : "Confirm Return"}
        </Button>
      </Box>
    </Dialog>
  );
}
