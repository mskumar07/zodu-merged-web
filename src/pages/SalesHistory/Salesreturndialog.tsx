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
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
  Box, Typography, IconButton, Button, TextField, Select,
  MenuItem, CircularProgress, Divider,
  Dialog, DialogContent,
  Table, TableBody, TableCell, TableHead, TableRow,
  Checkbox, alpha,
} from "@mui/material";
import {
  Add as AddIcon,
  Close as CloseIcon,
  DeleteOutline as DeleteOutlineIcon,
  InfoOutlined as InfoIcon,
  Remove as RemoveIcon,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import { API_BASE, fetchSaleDetail, salesQueryKeys, getBranchId, getZoduId, createSaleReturn, type CreateSaleReturnPayload, type Sale } from "./useSaleshistory";
import { INR } from "./dialogHelpers";

interface Props {
  sale: Sale;
  onClose: () => void;
  onSuccess?: () => void;
}

const RESTOCK_FEE_PCT = 10;
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
      fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.08em",
      color: "#64748B", textTransform: "uppercase",
      borderBottom: "1px solid #E2E8F0",
      py: 1.75, px: 2,
    }}>
      {children}
    </TableCell>
  );
}

export default function SalesReturnDialog({ sale, onClose, onSuccess }: Props) {
  const queryClient = useQueryClient();
  const saleId = sale.sale_id;
  const saleUuid = sale.sale_uuid;
  
  const { data, isLoading } = useQuery({
    queryKey: salesQueryKeys.detail(saleId),
    queryFn:  () => fetchSaleDetail(saleId),
    enabled:  !!saleId,
  });

  // ── Normalize API response fields ──────────────────────────────────────
  // API returns: item_name, item_id, item_uuid, sale_id, customer (separate object)
  // Component expects: product_name, product_id, invoice_no, customer_name
  const normalizedSale = data?.sale
    ? {
        ...data.sale,
        invoice_no:    data.sale.invoice_no    ?? data.sale.sale_id,
        customer_name: data.sale.customer_name ?? data?.customer?.cust_name ?? null,
      }
    : sale;

  const items = (data?.items ?? []).map((item: any) => ({
    ...item,
    product_id:   item.product_id   ?? item.item_id,
    product_name: item.product_name ?? item.item_name,
    item_uuid:    item.item_uuid,  // Ensure item_uuid is preserved
  }));
  // ───────────────────────────────────────────────────────────────────────

  const [selected,  setSelected]  = useState<Record<number, boolean>>({});
  const [returnQty, setReturnQty] = useState<Record<number, number>>({});
  const [reason,    setReason]    = useState("");
  const [note,      setNote]      = useState("");
  const [refundType, setRefundType] = useState("");

  useEffect(() => {
    if (items.length > 0) {
      const sel: Record<number, boolean> = {};
      const qty: Record<number, number>  = {};
      items.forEach((item: any) => {
        sel[item.id] = false;
        // Set initial return qty to available quantity (not already returned)
        qty[item.id] = getAvailableQty(item);
      });
      setSelected(sel);
      setReturnQty(qty);
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

  const totalReturnAmount = items.reduce((sum: number, item: any) => {
    if (!selected[item.id]) return sum;
    const qty   = returnQty[item.id] ?? 0;
    // price is tax-inclusive — use it directly, no need to add tax_amount again
    const price = Number(item.price);
    return sum + qty * price;
  }, 0);

  const restockFee  = (totalReturnAmount * RESTOCK_FEE_PCT) / 100;
  // Restock fee row is hidden in UI — net refund equals the full return amount
  const netRefund   = totalReturnAmount;
const canConfirm = someSelected && !!reason && !!refundType;

  const mutation = useMutation({
    mutationFn: async () => {
      const returnItems = items
        .filter((item: any) => selected[item.id] && (returnQty[item.id] ?? 0) > 0)
        .map((item: any) => ({
          original_item_id: item.id,
          item_id:          item.item_id,
          item_uuid:        item.item_uuid,
          return_qty:       returnQty[item.id] ?? 0,
        }));

      if (returnItems.length === 0) {
        throw new Error("Select at least one item with a return quantity greater than 0");
      }

      const payload: CreateSaleReturnPayload = {
        original_sale_uuid: saleUuid,
        zodu_id:            getZoduId(),
        branch_id:          getBranchId(),
        return_reason:      reason || null,
        refund_type:        refundType || null,
        notes:              note || null,
        items:              returnItems,
      };

      return await createSaleReturn(payload);
    },
    onSuccess: async () => {
      toast.success("Sales return submitted successfully");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: salesQueryKeys.detail(saleId) }),
        queryClient.invalidateQueries({ queryKey: ["sales-history"] }),
        queryClient.invalidateQueries({ queryKey: salesQueryKeys.returns() }),
      ]);
      onSuccess?.();
      onClose();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || "Failed to submit sales return");
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
        px: 4, py: 3,
        borderBottom: "1px solid #E2E8F0",
        bgcolor: "#fff",
      }}>
        <Box>
          <Typography sx={{ fontSize: "1.5rem", fontWeight: 700, color: "#0F172A", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
            Process Sales Return
          </Typography>
          {normalizedSale && (
            <Typography sx={{ fontSize: "0.875rem", fontWeight: 500, color: "#64748B", mt: 0.4 }}>
              Invoice {normalizedSale.invoice_no} | Customer: {normalizedSale.customer_name || "Walk-In"}
            </Typography>
          )}
        </Box>
        <IconButton onClick={onClose} size="small"
          sx={{ borderRadius: "999px", color: "#64748B", "&:hover": { bgcolor: "#F1F5F9" }, mt: 0.5 }}>
          <CloseIcon sx={{ fontSize: 22 }} />
        </IconButton>
      </Box>

      {/* ── Scrollable body ─────────────────────────────────────────────── */}
      <DialogContent sx={{ p: 4, bgcolor: "#fff", flex: 1, overflowY: "auto" }}>
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
            <CircularProgress sx={{ color: "#D2042D" }} size={32} />
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>

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
                    <TH align="center">Returned</TH>
                    <TH align="center">Available</TH>
                    <TH align="center">Return Qty</TH>
                    <TH align="right">Unit Price</TH>
                    <TH align="right">Total</TH>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((item: any, idx: number) => {
                    const isLast        = idx === items.length - 1;
                    const origQty       = Number(item.quantity);
                    const returnedQty   = Number(item.returned_qty ?? 0);
                    const availableQty  = getAvailableQty(item);
                    const rQty          = returnQty[item.id] ?? availableQty;
                    const price         = Number(item.price);
                    const lineTotal     = selected[item.id] ? rQty * price : 0;
                    const rowBg         = selected[item.id] ? alpha("#D2042D", 0.03) : "transparent";
                    const borderB       = isLast ? 0 : "1px solid #F1F5F9";
                    console.log(items)

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

                        {/* Item name + sub-label */}
                        <TableCell sx={{ borderBottom: borderB, py: 0.75, px: 2 }}>
                          <Typography sx={{ fontSize: "0.875rem", fontWeight: 700, color: "#0F172A" }}>
                            {item.product_name}
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
                <Box>
  <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: "#0F172A", mb: 1 }}>
    Refund Type
  </Typography>

  <Select
    size="small"
    fullWidth
    displayEmpty
    value={refundType}
    onChange={(e) => setRefundType(e.target.value)}
    sx={{
      borderRadius: "12px",
      height: 44,
      fontSize: "0.875rem",
      bgcolor: "#fff",
      "& fieldset": { borderColor: "#E2E8F0" },
      "&:hover fieldset": { borderColor: "#CBD5E1" },
      "&.Mui-focused fieldset": { borderColor: "#D2042D", borderWidth: 2 },
    }}
  >
    <MenuItem value="" disabled sx={{ color: "#94A3B8" }}>
      Select refund type...
    </MenuItem>

    <MenuItem value="cash">Cash</MenuItem>
    <MenuItem value="upi">UPI</MenuItem>
        <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
    <MenuItem value="others">Others</MenuItem>
  </Select>
</Box>
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
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Typography sx={{ fontSize: "0.875rem", color: "#475569" }}>Total Return Amount</Typography>
                      <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: "#0F172A" }}>{INR(totalReturnAmount)}</Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Bottom: net refund + info note */}
                <Box sx={{ borderTop: "1px solid #E2E8F0", pt: 2.5 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                    <Typography sx={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.12em", color: "#94A3B8", textTransform: "uppercase" }}>
                      Net Refund Payable
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
          {mutation.isPending ? "Submitting..." : "Confirm Return"}
        </Button>
      </Box>
    </Dialog>
  );
}
