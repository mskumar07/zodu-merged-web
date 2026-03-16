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
import { Close as CloseIcon, InfoOutlined as InfoIcon } from "@mui/icons-material";
import { toast } from "react-toastify";
import { API_BASE, BRANCH_ID, fetchSaleDetail, salesQueryKeys, ZODU_ID } from "./useSaleshistory";
import { INR } from "./dialogHelpers";

interface Props {
  saleId: string;
  onClose: () => void;
}

const RESTOCK_FEE_PCT = 10;
const RETURN_REASONS  = [
  { value: "damaged",  label: "Damaged on arrival" },
  { value: "wrong",    label: "Wrong item sent" },
  { value: "choice",   label: "Customer choice / No longer needed" },
  { value: "other",    label: "Other" },
];

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

export default function SalesReturnDialog({ saleId, onClose }: Props) {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: salesQueryKeys.detail(saleId),
    queryFn:  () => fetchSaleDetail(saleId),
    enabled:  !!saleId,
  });

  const sale  = data?.sale;
  const items = data?.items ?? [];

  const [selected,  setSelected]  = useState<Record<number, boolean>>({});
  const [returnQty, setReturnQty] = useState<Record<number, number>>({});
  const [reason,    setReason]    = useState("");
  const [note,      setNote]      = useState("");

  useEffect(() => {
    if (items.length > 0) {
      const sel: Record<number, boolean> = {};
      const qty: Record<number, number>  = {};
      items.forEach(item => {
        sel[item.id] = false;
        qty[item.id] = Number(item.quantity);
      });
      setSelected(sel);
      setReturnQty(qty);
    }
  }, [items.length]);

  const toggleSelect    = (id: number) => setSelected(s => ({ ...s, [id]: !s[id] }));
  const toggleSelectAll = () => {
    const allSelected = items.every(i => selected[i.id]);
    const next: Record<number, boolean> = {};
    items.forEach(i => { next[i.id] = !allSelected; });
    setSelected(next);
  };
  const allSelected  = items.length > 0 && items.every(i => selected[i.id]);
  const someSelected = items.some(i => selected[i.id]);

  const totalReturnAmount = items.reduce((sum, item) => {
    if (!selected[item.id]) return sum;
    const qty   = returnQty[item.id] ?? 0;
    const price = Number(item.price) + Number(item.tax_amount) / Number(item.quantity);
    return sum + qty * price;
  }, 0);

  const restockFee  = (totalReturnAmount * RESTOCK_FEE_PCT) / 100;
  const netRefund   = totalReturnAmount - restockFee;
  const canConfirm  = someSelected && !!reason;

  const mutation = useMutation({
    mutationFn: async () => {
      const return_items = items
        .filter(item => selected[item.id] && (returnQty[item.id] ?? 0) > 0)
        .map(item => ({
          sale_item_id: item.id,
          product_id: item.product_id,
          quantity: returnQty[item.id] ?? 0,
          unit_price: Number(item.price),
          tax_amount: Number(item.tax_amount),
          total_amount: (returnQty[item.id] ?? 0) * Number(item.price),
        }));

      if (return_items.length === 0) {
        throw new Error("Select at least one item with a return quantity greater than 0");
      }

      const payload = {
        sale_id: saleId,
        zodu_id: ZODU_ID,
        branch_id: BRANCH_ID,
        reason,
        notes: note,
        restock_fee: Number(restockFee.toFixed(2)),
        refund_amount: Number(netRefund.toFixed(2)),
        return_items,
      };

      const { data } = await axios.post(`${API_BASE}/restaurant/api/sales/return`, payload);
      return data;
    },
    onSuccess: async () => {
      toast.success("Sales return submitted successfully");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: salesQueryKeys.detail(saleId) }),
        queryClient.invalidateQueries({ queryKey: ["sales-history"] }),
      ]);
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
          {sale && (
            <Typography sx={{ fontSize: "0.875rem", fontWeight: 500, color: "#64748B", mt: 0.4 }}>
              Invoice {sale.invoice_no} | Customer: {sale.customer_name || "Walk-In"}
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
                        sx={{ color: "#CBD5E1", "&.Mui-checked": { color: "#D2042D" }, "&.MuiCheckbox-indeterminate": { color: "#D2042D" }, p: 0.5 }}
                      />
                    </TableCell>
                    <TH>Item Details</TH>
                    <TH align="center">Qty Original</TH>
                    <TH align="center">Return Qty</TH>
                    <TH align="right">Unit Price</TH>
                    <TH align="right">Total</TH>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((item, idx) => {
                    const isLast    = idx === items.length - 1;
                    const origQty   = Number(item.quantity);
                    const rQty      = returnQty[item.id] ?? origQty;
                    const price     = Number(item.price);
                    const lineTotal = selected[item.id] ? rQty * price : 0;
                    const rowBg     = selected[item.id] ? alpha("#D2042D", 0.03) : "transparent";
                    const borderB   = isLast ? 0 : "1px solid #F1F5F9";

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
                        <TableCell sx={{ borderBottom: borderB, py: 2, px: 2 }}>
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
                        <TableCell align="center" sx={{ borderBottom: borderB, py: 2, px: 2, fontSize: "0.875rem", color: "#334155" }}>
                          {origQty}
                        </TableCell>

                        {/* Return qty input — w-20 h-9 text-center rounded-lg */}
                        <TableCell align="center" sx={{ borderBottom: borderB, py: 2, px: 2 }}>
                          <TextField
                            size="small"
                            type="number"
                            value={rQty}
                            disabled={!selected[item.id]}
                            onChange={e => {
                              const v = Math.min(Math.max(0, parseInt(e.target.value) || 0), origQty);
                              setReturnQty(q => ({ ...q, [item.id]: v }));
                            }}
                            inputProps={{ min: 0, max: origQty }}
                            sx={{
                              width: 80,
                              "& .MuiOutlinedInput-root": {
                                borderRadius: "8px",
                                fontSize: "0.875rem",
                                "& input": { textAlign: "center", fontWeight: 600, py: 1 },
                                "& fieldset":             { borderColor: "#E2E8F0" },
                                "&:hover fieldset":       { borderColor: "#CBD5E1" },
                                "&.Mui-focused fieldset": { borderColor: "#D2042D", borderWidth: 2 },
                              },
                            }}
                          />
                        </TableCell>

                        {/* Unit price */}
                        <TableCell align="right" sx={{ borderBottom: borderB, py: 2, px: 2, fontSize: "0.875rem", color: "#334155" }}>
                          {INR(price)}
                        </TableCell>

                        {/* Line total */}
                        <TableCell align="right" sx={{ borderBottom: borderB, py: 2, px: 2 }}>
                          <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: selected[item.id] ? "#0F172A" : "#94A3B8" }}>
                            {INR(lineTotal)}
                          </Typography>
                        </TableCell>
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
                    {/* <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Typography sx={{ fontSize: "0.875rem", color: "#475569" }}>Restocking Fee ({RESTOCK_FEE_PCT}%)</Typography>
                      <Typography sx={{ fontSize: "0.875rem", fontWeight: 700, color: "#D2042D" }}>-{INR(restockFee)}</Typography>
                    </Box> */}
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
