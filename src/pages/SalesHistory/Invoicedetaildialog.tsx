/**
 * InvoiceDetailsModal.tsx
 * Wired entirely to the real API response shape:
 *
 * data.sale            → sale header
 * data.customer        → tbl_customer row (null = walk-in)
 * data.items[]         → tbl_sale_items rows
 * data.payment_history → tbl_sale_payment rows
 *
 * All sample/hardcoded data removed.
 * mapSaleDetailToInvoiceData() derives every field from the real API.
 */

import React from "react";
import {
  Dialog, DialogContent, DialogActions,
  Box, Typography, IconButton, Button, Chip, Divider,
  Paper, CircularProgress, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow,
  styled,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import CloseIcon    from "@mui/icons-material/Close";
import ShareIcon    from "@mui/icons-material/Share";
import DownloadIcon from "@mui/icons-material/Download";
import PrintIcon    from "@mui/icons-material/Print";
import { fetchSaleDetail, salesQueryKeys, type SaleDetail } from "./useSaleshistory";
import EditIcon from "@mui/icons-material/Edit";
import { useNavigate } from "react-router-dom";

// ── Styled helpers ────────────────────────────────────────────
const StyledDialog = styled(Dialog)(() => ({
  "& .MuiDialog-paper": {
    maxWidth: 1200, width: "100%", maxHeight: "90vh",
    borderRadius: 12, backgroundColor: "#fff",
  },
}));

const InfoCard = styled(Paper)(() => ({
  backgroundColor: "#F8FAFC", padding: 16,
  borderRadius: 12, border: "1px solid #E2E8F0", boxShadow: "none",
}));

const SectionTitle = styled(Typography)(() => ({
  fontSize: 11, fontWeight: 700, color: "#94A3B8",
  textTransform: "uppercase", letterSpacing: "0.1em",
  marginBottom: 8, paddingLeft: 4,
}));

const TH = styled(TableCell)(() => ({
  fontSize: 10, fontWeight: 700, textTransform: "uppercase",
  color: "#64748B", padding: "12px 16px",
  borderBottom: "none", backgroundColor: "#F1F5F9",
}));

const TD = styled(TableCell)(() => ({
  fontSize: 12, padding: "12px 16px",
  borderBottom: "1px solid #F1F5F9", color: "#0F172A",
}));

const SummaryCard = styled(Box)(() => ({
  backgroundColor: "#F8FAFC", borderRadius: 12,
  padding: 24, border: "1px solid #E2E8F0",
}));

// ── Payment dot colours ───────────────────────────────────────
const PAYMENT_DOT: Record<string, string> = {
  cash: "#22C55E", card: "#3B82F6", upi: "#8B5CF6", credit: "#F59E0B",
};
function paymentDot(type: string) {
  return PAYMENT_DOT[type?.toLowerCase()] ?? "#94A3B8";
}

// ── Currency formatter ────────────────────────────────────────
function INR(v: number | string) {
  return `₹${Number(v).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// ── Props ─────────────────────────────────────────────────────
interface Props {
  open?:    boolean;
  saleId:   string;
  onClose:  () => void;
}

// ─────────────────────────────────────────────────────────────
export default function InvoiceDetailsModal({ open = true, saleId, onClose }: Props) {
  const { data, isLoading } = useQuery({
    queryKey: salesQueryKeys.detail(saleId),
    queryFn:  () => fetchSaleDetail(saleId),
    enabled:  !!saleId,
  });

  const sale    = data?.sale;
  const customer = data?.customer ?? null;
  const items   = data?.items          ?? [];
  const history = data?.payment_history ?? [];
 const navigate = useNavigate();
  // ── HSN-wise tax breakdown computed from real items ───────────
  const hsnMap: Record<string, {
    taxable: number; cgst: number; sgst: number; cgstPct: number; sgstPct: number;
  }> = {};

  items.forEach((item: any) => {
    // hsn column — may be null when not set on the product
    const hsn   = item.hsn_code ?? "—";
    const qty   = Number(item.quantity)      || 0;
    const price = Number(item.price)         || 0;
    const cgst  = Number(item.cgst)          || 0;
    const sgst  = Number(item.sgst)          || 0;
    const gst   = Number(item.gst_percentage)|| 0;

    if (!hsnMap[hsn]) {
      hsnMap[hsn] = { taxable: 0, cgst: 0, sgst: 0, cgstPct: gst / 2, sgstPct: gst / 2 };
    }
    hsnMap[hsn].taxable += qty * price;
    hsnMap[hsn].cgst    += cgst;
    hsnMap[hsn].sgst    += sgst;
  });

  const hsnRows   = Object.entries(hsnMap);
  const hsnTotals = hsnRows.reduce(
    (acc, [, v]) => ({ taxable: acc.taxable + v.taxable, cgst: acc.cgst + v.cgst, sgst: acc.sgst + v.sgst }),
    { taxable: 0, cgst: 0, sgst: 0 }
  );

  // ── Discount label ────────────────────────────────────────────
  const hasDiscount = sale ? Number(sale.discount_amount) > 0 : false;
  const discountLabel = sale?.discount_type === "percentage"
    ? `Discount (${Number(sale.discount_value)}%)`
    : "Discount";

  // ── Customer display helpers ──────────────────────────────────
  const customerName    = customer?.cust_name ?? customer?.cpy_name ?? "Walk-In Customer";
  const customerMobile  = customer?.mobile    ? `+91 ${customer.mobile}` : "—";
  const customerGst     = customer?.gst       ?? "—";
  const customerAddress = [
    customer?.address_line1,
    customer?.address_line2,
    customer?.city,
    customer?.state,
    customer?.pincode,
  ].filter(Boolean).join(", ") || "—";

  return (
    <StyledDialog open={open} onClose={onClose} maxWidth="lg" fullWidth>

      {/* ── Sticky header ─────────────────────────────────────── */}
      <Box sx={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        px: 4, py: 2, borderBottom: "1px solid #E2E8F0",
        position: "sticky", top: 0, bgcolor: "#fff", zIndex: 10,
      }}>
        <Box sx={{ display: "flex", alignItems: "baseline", gap: 1.5 }}>
          <Typography sx={{ fontSize: 20, fontWeight: 700, color: "#0F172A" }}>
            Invoice Details
          </Typography>
          {/* sale_id used as the invoice reference */}
          <Chip
            label={sale?.sale_id ?? "—"}
            size="small"
            sx={{ bgcolor: "rgba(208,2,27,0.1)", color: "#D0021B", fontWeight: 700, fontSize: 12, height: 22, borderRadius: "999px" }}
          />
          {sale && (
            <Typography sx={{ fontSize: 12, color: "#94A3B8", fontWeight: 500 }}>
              {sale.sale_date_fmt} {sale.sale_time_fmt && `· ${sale.sale_time_fmt}`}
            </Typography>
          )}
        </Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>

  <IconButton
    size="small"
    onClick={() => navigate(`/pos?saleId=${sale?.sale_id}`)}
    sx={{
      color: "#2563EB",
      bgcolor: "#EFF6FF",
      "&:hover": { bgcolor: "#DBEAFE" },
      borderRadius: "50%",
    }}
  >
    <EditIcon sx={{ fontSize: 18 }} />
  </IconButton>

  <IconButton onClick={onClose} size="small">
    <CloseIcon sx={{ fontSize: 20 }} />
  </IconButton>

</Box>
      </Box>

      {/* ── Body ──────────────────────────────────────────────── */}
      <DialogContent sx={{ p: 3, bgcolor: "#fff" }}>
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
            <CircularProgress size={32} sx={{ color: "#D0021B" }} />
          </Box>
        ) : !sale ? (
          <Typography sx={{ textAlign: "center", py: 8, color: "#94A3B8" }}>
            Sale not found.
          </Typography>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 1 }}>

            {/* 1. Customer Details */}
            <InfoCard elevation={0}>
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(4, 1fr)" }, gap: 2 }}>
                {[
                  { label: "Customer Name", value: customerName },
                  { label: "Mobile No.",    value: customerMobile },
                  { label: "GSTIN",         value: customerGst},
                  { label: "Address",       value: customerAddress, small: true },
                ].map(({ label, value, color, small }) => (
                  <Box key={label}>
                    <Typography sx={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#94A3B8", mb: 0.5 }}>
                      {label}
                    </Typography>
                    <Typography sx={{ fontSize: small ? 12 : 14, fontWeight: 600, color: color ?? "#0F172A", lineHeight: 1.5 }}>
                      {value}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </InfoCard>

            {/* 2. Items List */}
            <Box>
              <SectionTitle>Items List</SectionTitle>
              <TableContainer component={Paper} elevation={0}
                sx={{ border: "1px solid #E2E8F0", borderRadius: "12px", overflow: "hidden" }}>
                <Table>
                  <TableHead sx={{ bgcolor: "#F1F5F9" }}>
                    <TableRow>
                      <TH>Item Name</TH>
                      <TH align="center">HSN</TH>
                      <TH align="right">MRP</TH>
                      <TH align="center">Qty</TH>
                      <TH align="center">GST%</TH>
                      <TH align="right">Total</TH>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {items.map((item: any, idx: number) => {
                      const qty     = Number(item.quantity);
                      const price   = Number(item.price);
                      const tax     = Number(item.tax_amount);
                      const gst     = Number(item.gst_percentage);
                      const lineTotal = qty * price + tax;
                      const isLast  = idx === items.length - 1;
                      return (
                        <TableRow key={item.id}
                          sx={{ "&:hover": { bgcolor: "#FAFBFC" }, transition: "background 0.15s" }}>
                          <TD sx={{ borderBottom: isLast ? 0 : undefined, fontWeight: 500 }}>
                            {item.item_name}
                            {item.variant_name && (
                              <Typography sx={{ fontSize: 11, color: "#94A3B8", mt: 0.2 }}>{item.variant_name}</Typography>
                            )}
                          </TD>
                          <TD align="center"  sx={{ borderBottom: isLast ? 0 : undefined, color: "#64748B" }}>{item.hsn_code ?? "—"}</TD>
                          <TD align="right"   sx={{ borderBottom: isLast ? 0 : undefined, fontWeight: 500 }}>{INR(price)}</TD>
                          <TD align="center"  sx={{ borderBottom: isLast ? 0 : undefined }}>{String(qty).padStart(2, "0")}</TD>
                          <TD align="center"  sx={{ borderBottom: isLast ? 0 : undefined }}>{gst}%</TD>
                          <TD align="right"   sx={{ borderBottom: isLast ? 0 : undefined, fontWeight: 700 }}>{INR(lineTotal)}</TD>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>

            {/* 3. Financial Summary */}
            <SummaryCard>
              <Box sx={{ maxWidth: 600, mx: "auto", display: "flex", flexDirection: "column", gap: 1.5 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography sx={{ fontSize: 13, color: "#64748B" }}>Subtotal</Typography>
                  <Typography sx={{ fontSize: 16, fontWeight: 600, color: "#0F172A" }}>{INR(sale.subtotal)}</Typography>
                </Box>

                {hasDiscount && (
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography sx={{ fontSize: 13, color: "#64748B" }}>{discountLabel}</Typography>
                    <Typography sx={{ fontSize: 16, fontWeight: 600, color: "#16A34A" }}>− {INR(sale.discount_amount)}</Typography>
                  </Box>
                )}

                <Divider sx={{ borderColor: "#E2E8F0" }} />

                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography sx={{ fontSize: 13, color: "#64748B" }}>CGST Total</Typography>
                  <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#0F172A" }}>{INR(hsnTotals.cgst)}</Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography sx={{ fontSize: 13, color: "#64748B" }}>SGST Total</Typography>
                  <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#0F172A" }}>{INR(hsnTotals.sgst)}</Typography>
                </Box>

                <Divider sx={{ borderStyle: "dashed", borderColor: "#CBD5E1", my: 1 }} />

                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography sx={{ fontSize: 18, fontWeight: 700, color: "#0F172A" }}>Grand Total</Typography>
                  <Typography sx={{ fontSize: 28, fontWeight: 900, color: "#0F172A", letterSpacing: "-1px" }}>{INR(sale.total_amount)}</Typography>
                </Box>

                {Number(sale.paid_amount) > 0 && (
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography sx={{ fontSize: 13, color: "#64748B" }}>Paid Amount</Typography>
                    <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#16A34A" }}>{INR(sale.paid_amount)}</Typography>
                  </Box>
                )}

                {Number(sale.balance_amount) > 0 && (
                  <Box sx={{ display: "flex", justifyContent: "space-between", borderRadius: 1.5, px: 1.5, py: 1 }}>
                    <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#D97706" }}>Balance Due</Typography>
                    <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#D97706" }}>{INR(sale.balance_amount)}</Typography>
                  </Box>
                )}

                {/* Payment status badge */}
                {/* <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                  <Chip
                    label={sale.payment_status?.replace("_", " ").toUpperCase()}
                    size="small"
                    sx={{
                      fontWeight: 700, fontSize: 10, borderRadius: "999px",
                      bgcolor: sale.payment_status === "fully_paid"     ? "#DCFCE7"
                             : sale.payment_status === "partially_paid" ? "#FEF3C7"
                             : "#FEE2E2",
                      color:   sale.payment_status === "fully_paid"     ? "#16A34A"
                             : sale.payment_status === "partially_paid" ? "#D97706"
                             : "#DC2626",
                    }}
                  />
                </Box> */}
              </Box>
            </SummaryCard>

              {history.length > 0 && (
              <Box>
                <SectionTitle>Payment History</SectionTitle>
                <TableContainer component={Paper} elevation={0}
                  sx={{ border: "1px solid #E2E8F0", borderRadius: "12px", overflow: "hidden" }}>
                  <Table>
                    <TableHead sx={{ bgcolor: "#F1F5F9" }}>
                      <TableRow>
                        <TH>Date</TH>
                        <TH>Payment Type</TH>
                        <TH>Reference No</TH>
                        <TH align="right">Amount</TH>
                        <TH align="center">Status</TH>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {history.map((h: any, idx: number) => {
                        const isLast = idx === history.length - 1;
                        const dot    = paymentDot(h.transaction_type);
                        return (
                          <TableRow key={h.payment_row_id}
                            sx={{ "&:hover": { bgcolor: "#FAFBFC" }, transition: "background 0.15s" }}>
                            {/* ✅ payment_date_fmt from API */}
                            <TD sx={{ borderBottom: isLast ? 0 : undefined, color: "#334155" }}>
                              {h.created_at_fmt ?? h.payment_date_fmt ?? "—"}
                            </TD>
                            {/* ✅ transaction_type from tbl_sale_payment */}
                            <TD sx={{ borderBottom: isLast ? 0 : undefined }}>
                              <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1 }}>
                                <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: dot, flexShrink: 0 }} />
                                <Typography sx={{ fontSize: 12, color: "#0F172A" }}>{h.transaction_type ?? "—"}</Typography>
                              </Box>
                            </TD>
                            {/* ✅ transaction_id from tbl_sale_payment */}
                            <TD sx={{ borderBottom: isLast ? 0 : undefined, fontFamily: "monospace", color: "#64748B", fontSize: 11 }}>
                              {h.transaction_id ?? "—"}
                            </TD>
                            {/* ✅ paid_amount from tbl_sale_payment */}
                            <TD align="right" sx={{ borderBottom: isLast ? 0 : undefined, fontWeight: 700 }}>
                              {INR(h.paid_amount)}
                            </TD>
                            {/* ✅ status from tbl_sale_payment */}
                            <TD align="center" sx={{ borderBottom: isLast ? 0 : undefined }}>
                              <Chip
                                label={h.status?.toUpperCase()}
                                size="small"
                                sx={{
                                  fontSize: 9, fontWeight: 700, borderRadius: "999px",
                                  bgcolor: h.status === "paid"    ? "#DCFCE7"
                                         : h.status === "partial" ? "#FEF3C7"
                                         : "#F1F5F9",
                                  color:   h.status === "paid"    ? "#16A34A"
                                         : h.status === "partial" ? "#D97706"
                                         : "#64748B",
                                }}
                              />
                            </TD>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}

            {/* 4. HSN-wise Tax Breakdown */}
            <Box>
              <SectionTitle>HSN-wise Tax Breakdown</SectionTitle>
              <TableContainer component={Paper} elevation={0}
                sx={{ border: "1px solid #E2E8F0", borderRadius: "12px", overflow: "hidden" }}>
                <Table>
                  <TableHead sx={{ bgcolor: "#F1F5F9" }}>
                    <TableRow>
                      <TH>HSN Code</TH>
                      <TH align="right">Taxable Val</TH>
                      <TH align="center">CGST %</TH>
                      <TH align="right">CGST Amt</TH>
                      <TH align="center">SGST %</TH>
                      <TH align="right">SGST Amt</TH>
                      <TH align="right">Total Tax</TH>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {hsnRows.map(([hsn, v]) => (
                      <TableRow key={hsn}>
                        <TD sx={{ fontWeight: 500 }}>{hsn}</TD>
                        <TD align="right">{INR(v.taxable)}</TD>
                        <TD align="center">{v.cgstPct}%</TD>
                        <TD align="right">{INR(v.cgst)}</TD>
                        <TD align="center">{v.sgstPct}%</TD>
                        <TD align="right">{INR(v.sgst)}</TD>
                        <TD align="right" sx={{ fontWeight: 700 }}>{INR(v.cgst + v.sgst)}</TD>
                      </TableRow>
                    ))}
                    {/* Totals row */}
                    <TableRow sx={{ bgcolor: "#F1F5F9", "& td": { borderBottom: 0, fontWeight: 700 } }}>
                      <TD>Total</TD>
                      <TD align="right">{INR(hsnTotals.taxable)}</TD>
                      <TD align="center" sx={{ color: "#94A3B8", fontWeight: 400 }}>—</TD>
                      <TD align="right">{INR(hsnTotals.cgst)}</TD>
                      <TD align="center" sx={{ color: "#94A3B8", fontWeight: 400 }}>—</TD>
                      <TD align="right">{INR(hsnTotals.sgst)}</TD>
                      <TD align="right" sx={{ color: "#D0021B" }}>{INR(hsnTotals.cgst + hsnTotals.sgst)}</TD>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>

            {/* 5. Payment History */}
          

          </Box>
        )}
      </DialogContent>

      {/* ── Footer ────────────────────────────────────────────── */}
      <DialogActions sx={{
        px: 4, py: 2, bgcolor: "#F8FAFC",
        borderTop: "1px solid #E2E8F0",
        justifyContent: "space-between", flexWrap: "wrap", gap: 2,
      }}>
        <Button onClick={onClose}
          sx={{ fontWeight: 700, fontSize: 14, color: "#64748B", textTransform: "none", "&:hover": { color: "#0F172A", bgcolor: "transparent" } }}>
          Cancel
        </Button>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          <IconButton sx={{ border: "1px solid #E2E8F0", borderRadius: "12px", p: 1, color: "#64748B", "&:hover": { bgcolor: "#fff" } }}>
            <ShareIcon sx={{ fontSize: 18 }} />
          </IconButton>
          <Button startIcon={<DownloadIcon sx={{ fontSize: 18 }} />}
            sx={{ bgcolor: "#F1F5F9", color: "#0F172A", fontWeight: 700, fontSize: 14, px: 2.5, py: 1, borderRadius: "12px", textTransform: "none", "&:hover": { bgcolor: "#E2E8F0" } }}>
            Download
          </Button>
          <Button startIcon={<PrintIcon sx={{ fontSize: 18 }} />}
            sx={{ bgcolor: "#D0021B", color: "#fff", fontWeight: 700, fontSize: 14, px: 3.5, py: 1, borderRadius: "12px", textTransform: "none", boxShadow: "0 10px 25px -5px rgba(208,2,27,0.2)", "&:hover": { bgcolor: "#B00218" } }}>
            Print Invoice
          </Button>
        </Box>
      </DialogActions>

    </StyledDialog>
  );
}