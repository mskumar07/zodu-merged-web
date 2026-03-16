/**
 * InvoiceDetailDialog.tsx
 * Full invoice detail modal — customer info, items list,
 * HSN tax breakdown, financial summary, payment history.
 * Fetches data from GET /api/sales/:sale_id.
 */
import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Box, Typography, IconButton, Button, CircularProgress,
  Dialog, DialogContent, Table, TableBody, TableCell,
  TableHead, TableRow, alpha,
} from "@mui/material";
import {
  Close as CloseIcon,
  Share as ShareIcon,
  Print as PrintIcon,
  PictureAsPdf as PdfIcon,
} from "@mui/icons-material";
import { fetchSaleDetail, salesQueryKeys } from "./useSaleshistory";
import { INR, IHCell, IBCell, SectionHeading } from "./dialogHelpers";

interface Props {
  saleId: string;
  onClose: () => void;
}

// Payment mode dot colour map
const MODE_DOT: Record<string, string> = {
  Cash: "#22C55E", Card: "#3B82F6", UPI: "#8B5CF6", Credit: "#F59E0B",
};

function formatDateTime(d: string, t?: string) {
  try {
    const date = new Date(d).toLocaleDateString("en-IN", {
      day: "numeric", month: "short", year: "numeric",
    });
    if (!t) return date;
    const [h, m] = t.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    const h12  = h > 12 ? h - 12 : h === 0 ? 12 : h;
    return `${date}, ${String(h12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${ampm}`;
  } catch {
    return d;
  }
}

export default function InvoiceDetailDialog({ saleId, onClose }: Props) {
  const { data, isLoading } = useQuery({
    queryKey: salesQueryKeys.detail(saleId),
    queryFn:  () => fetchSaleDetail(saleId),
    enabled:  !!saleId,
  });

  const sale    = data?.sale;
  const items   = data?.items ?? [];
  const history = data?.payment_history ?? [];

  // ── HSN-wise tax breakdown ──────────────────────────────────────────────
  const hsnMap: Record<string, {
    taxable: number; cgst: number; sgst: number; cgstPct: number; sgstPct: number;
  }> = {};

  items.forEach((item) => {
    const hsn     = (item as any).hsn_code ?? item.product_id;
    const qty     = Number(item.quantity);
    const price   = Number(item.price);
    const cgst    = Number(item.cgst);
    const sgst    = Number(item.sgst);
    const gst     = Number(item.gst_percentage);
    if (!hsnMap[hsn]) hsnMap[hsn] = { taxable: 0, cgst: 0, sgst: 0, cgstPct: gst / 2, sgstPct: gst / 2 };
    hsnMap[hsn].taxable += qty * price;
    hsnMap[hsn].cgst    += cgst;
    hsnMap[hsn].sgst    += sgst;
  });

  const hsnRows   = Object.entries(hsnMap);
  const hsnTotals = hsnRows.reduce(
    (acc, [, v]) => ({ taxable: acc.taxable + v.taxable, cgst: acc.cgst + v.cgst, sgst: acc.sgst + v.sgst }),
    { taxable: 0, cgst: 0, sgst: 0 }
  );

  const hasDiscount   = sale ? Number(sale.discount_amount) > 0 : false;
  const discountLabel = sale?.discount_type === "percentage"
    ? `Discount (${Number(sale.discount_value)}%)`
    : "Discount";

  return (
    <Dialog
      open
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      scroll="paper"
      PaperProps={{
        sx: {
          borderRadius: "12px", overflow: "hidden", m: 2,
          maxHeight: "90vh", border: "1px solid #E2E8F0",
          display: "flex", flexDirection: "column",
        },
      }}
    >
      {/* ── Sticky header ───────────────────────────────────────────────── */}
      <Box sx={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        px: 4, py: 3,
        borderBottom: "1px solid #F1F5F9",
        position: "sticky", top: 0, bgcolor: "#fff", zIndex: 10,
      }}>
        <Box sx={{ display: "flex", alignItems: "baseline", gap: 1.5 }}>
          <Typography sx={{ fontSize: "1.5rem", fontWeight: 800, color: "#0F172A", letterSpacing: "-0.5px" }}>
            Invoice Details
          </Typography>
          <Box sx={{ bgcolor: alpha("#D0021B", 0.1), borderRadius: "999px", px: 1.5, py: 0.5, display: "inline-flex" }}>
            <Typography sx={{ fontSize: "0.82rem", fontWeight: 700, color: "#D0021B" }}>
              {sale?.invoice_no ?? "—"}
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} size="small"
          sx={{ borderRadius: "999px", color: "#94A3B8", "&:hover": { bgcolor: "#F1F5F9" } }}>
          <CloseIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </Box>

      {/* ── Scrollable body ─────────────────────────────────────────────── */}
      <DialogContent sx={{ p: 4, bgcolor: "#fff", flex: 1, overflowY: "auto" }}>
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
            <CircularProgress sx={{ color: "#D0021B" }} size={32} />
          </Box>
        ) : sale ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 5 }}>

            {/* 1. Customer Details */}
            <Box sx={{
              display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 3,
              bgcolor: "#F8FAFC", p: 3, borderRadius: "12px", border: "1px solid #F1F5F9",
            }}>
              {[
                { label: "Customer Name", value: sale.customer_name  || "Walk-In Customer", primary: false, muted: false },
                { label: "Mobile No.",    value: sale.customer_phone ? `+91 ${sale.customer_phone}` : "—", primary: false, muted: false },
                { label: "GSTIN",         value: "—", primary: true,  muted: false },
                { label: "Address",       value: "—", primary: false, muted: true  },
              ].map(({ label, value, primary: isPrimary, muted }) => (
                <Box key={label}>
                  <Typography sx={{ fontSize: "0.65rem", fontWeight: 700, color: "#94A3B8", letterSpacing: "0.1em", textTransform: "uppercase", mb: 0.5 }}>
                    {label}
                  </Typography>
                  <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: isPrimary ? "#D0021B" : muted ? "#475569" : "#0F172A", lineHeight: 1.5 }}>
                    {value}
                  </Typography>
                </Box>
              ))}
            </Box>

            {/* 2. Items List */}
            <Box>
              <SectionHeading text="Items List" />
              <Box sx={{ border: "1px solid #E2E8F0", borderRadius: "12px", overflow: "hidden" }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <IHCell>Item Name</IHCell>
                      <IHCell align="center">HSN</IHCell>
                      <IHCell align="right">MRP</IHCell>
                      <IHCell align="center">Qty</IHCell>
                      <IHCell align="center">GST%</IHCell>
                      <IHCell align="right">Total</IHCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {items.map((item, idx) => {
                      const qty    = Number(item.quantity);
                      const price  = Number(item.price);
                      const gst    = Number(item.gst_percentage);
                      const total  = qty * price + Number(item.tax_amount);
                      const isLast = idx === items.length - 1;
                      const c      = { py: 2, px: 2, borderBottom: isLast ? 0 : "1px solid #F1F5F9" };
                      return (
                        <TableRow key={item.id} sx={{ "&:hover": { bgcolor: "#F8FAFC" }, transition: "background 0.15s" }}>
                          <TableCell sx={{ ...c, fontSize: "0.875rem", fontWeight: 500, color: "#0F172A" }}>
                            {item.product_name}
                            {item.variant_name && (
                              <Typography sx={{ fontSize: "0.75rem", color: "#94A3B8", mt: 0.2 }}>{item.variant_name}</Typography>
                            )}
                          </TableCell>
                          <TableCell align="center" sx={{ ...c, fontSize: "0.875rem", color: "#64748B" }}>{(item as any).hsn_code ?? "—"}</TableCell>
                          <TableCell align="right"  sx={{ ...c, fontSize: "0.875rem", fontWeight: 500, color: "#0F172A" }}>{INR(price)}</TableCell>
                          <TableCell align="center" sx={{ ...c, fontSize: "0.875rem" }}>{String(qty).padStart(2, "0")}</TableCell>
                          <TableCell align="center" sx={{ ...c, fontSize: "0.875rem" }}>{gst}%</TableCell>
                          <TableCell align="right"  sx={{ ...c, fontSize: "0.875rem", fontWeight: 700, color: "#0F172A" }}>{INR(total)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </Box>
            </Box>

            {/* 3. HSN-wise Tax Breakdown */}
            <Box>
              <SectionHeading text="HSN-wise Tax Breakdown" />
              <Box sx={{ border: "1px solid #E2E8F0", borderRadius: "12px", overflow: "hidden" }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <IHCell>HSN Code</IHCell>
                      <IHCell align="right">Taxable Value</IHCell>
                      <IHCell align="center">CGST (%)</IHCell>
                      <IHCell align="right">CGST Amount</IHCell>
                      <IHCell align="center">SGST (%)</IHCell>
                      <IHCell align="right">SGST Amount</IHCell>
                      <IHCell align="right">Total Tax</IHCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {hsnRows.map(([hsn, v]) => (
                      <TableRow key={hsn}>
                        <IBCell bold>{hsn}</IBCell>
                        <IBCell align="right">{INR(v.taxable)}</IBCell>
                        <IBCell align="center">{v.cgstPct}%</IBCell>
                        <IBCell align="right">{INR(v.cgst)}</IBCell>
                        <IBCell align="center">{v.sgstPct}%</IBCell>
                        <IBCell align="right">{INR(v.sgst)}</IBCell>
                        <IBCell align="right" bold>{INR(v.cgst + v.sgst)}</IBCell>
                      </TableRow>
                    ))}
                    {/* TOTAL row */}
                    <TableRow sx={{ bgcolor: "#F8FAFC", "& td": { borderBottom: 0 } }}>
                      <TableCell sx={{ px: 2, py: 1.75, fontSize: "0.72rem", fontWeight: 800, textTransform: "uppercase", color: "#0F172A" }}>Total</TableCell>
                      <TableCell align="right"  sx={{ px: 2, py: 1.75, fontSize: "0.875rem", fontWeight: 700 }}>{INR(hsnTotals.taxable)}</TableCell>
                      <TableCell align="center" sx={{ px: 2, py: 1.75, color: "#94A3B8" }}>-</TableCell>
                      <TableCell align="right"  sx={{ px: 2, py: 1.75, fontSize: "0.875rem", fontWeight: 700 }}>{INR(hsnTotals.cgst)}</TableCell>
                      <TableCell align="center" sx={{ px: 2, py: 1.75, color: "#94A3B8" }}>-</TableCell>
                      <TableCell align="right"  sx={{ px: 2, py: 1.75, fontSize: "0.875rem", fontWeight: 700 }}>{INR(hsnTotals.sgst)}</TableCell>
                      <TableCell align="right"  sx={{ px: 2, py: 1.75, fontSize: "0.875rem", fontWeight: 700, color: "#D0021B" }}>{INR(hsnTotals.cgst + hsnTotals.sgst)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Box>
            </Box>

            {/* 4. Financial Summary */}
            <Box sx={{ bgcolor: "#F8FAFC", borderRadius: "12px", p: 4, border: "1px solid #F1F5F9" }}>
              <Box sx={{ maxWidth: 700, mx: "auto", display: "flex", flexDirection: "column", gap: 2 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography sx={{ fontSize: "0.875rem", fontWeight: 500, color: "#64748B" }}>Subtotal</Typography>
                  <Typography sx={{ fontSize: "1.125rem", fontWeight: 600, color: "#0F172A" }}>{INR(Number(sale.subtotal))}</Typography>
                </Box>
                {hasDiscount && (
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography sx={{ fontSize: "0.875rem", fontWeight: 500, color: "#64748B" }}>{discountLabel}</Typography>
                    <Typography sx={{ fontSize: "1.125rem", fontWeight: 600, color: "#16A34A" }}>- {INR(Number(sale.discount_amount))}</Typography>
                  </Box>
                )}
                <Box sx={{ height: "1px", bgcolor: "#E2E8F0", my: 0.5 }} />
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography sx={{ fontSize: "0.875rem", fontWeight: 500, color: "#64748B" }}>CGST Total</Typography>
                  <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: "#0F172A" }}>{INR(hsnTotals.cgst)}</Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography sx={{ fontSize: "0.875rem", fontWeight: 500, color: "#64748B" }}>SGST Total</Typography>
                  <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: "#0F172A" }}>{INR(hsnTotals.sgst)}</Typography>
                </Box>
                {/* Grand Total */}
                <Box sx={{ pt: 3, mt: 1, borderTop: "2px dashed #CBD5E1", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography sx={{ fontSize: "1.25rem", fontWeight: 800, color: "#0F172A" }}>Grand Total</Typography>
                  <Typography sx={{ fontSize: "1.875rem", fontWeight: 900, color: "#D0021B", letterSpacing: "-1px" }}>
                    {INR(Number(sale.total_amount))}
                  </Typography>
                </Box>
                {Number(sale.balance_amount) > 0 && (
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography sx={{ fontSize: "0.875rem", fontWeight: 500, color: "#F59E0B" }}>Balance Due</Typography>
                    <Typography sx={{ fontSize: "0.875rem", fontWeight: 700, color: "#F59E0B" }}>{INR(Number(sale.balance_amount))}</Typography>
                  </Box>
                )}
              </Box>
            </Box>

            {/* 5. Payment History */}
            {history.length > 0 && (
              <Box sx={{ pt: 1 }}>
                <SectionHeading text="Payment History" />
                <Box sx={{ border: "1px solid #E2E8F0", borderRadius: "12px", overflow: "hidden" }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <IHCell>Date</IHCell>
                        <IHCell>Payment Type</IHCell>
                        <IHCell>Reference No</IHCell>
                        <IHCell align="right">Amount</IHCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {history.map((h, idx) => {
                        const isLast = idx === history.length - 1;
                        const dot    = MODE_DOT[h.payment_mode] ?? "#94A3B8";
                        const cSx    = { borderBottom: isLast ? 0 : "1px solid #F1F5F9", py: 1.75, px: 2 };
                        return (
                          <TableRow key={h.payment_history_id} sx={{ "&:hover": { bgcolor: "#F8FAFC" }, transition: "background 0.15s" }}>
                            <TableCell sx={{ ...cSx, fontSize: "0.875rem", color: "#334155" }}>
                              {formatDateTime(h.paid_date)}
                            </TableCell>
                            <TableCell sx={cSx}>
                              <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.8 }}>
                                <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: dot, flexShrink: 0 }} />
                                <Typography sx={{ fontSize: "0.875rem", color: "#334155" }}>{h.payment_mode}</Typography>
                              </Box>
                            </TableCell>
                            <TableCell sx={{ ...cSx, fontFamily: "monospace", fontSize: "0.875rem", color: "#94A3B8" }}>
                              {h.transaction_id || "—"}
                            </TableCell>
                            <TableCell align="right" sx={{ ...cSx, fontSize: "0.875rem", fontWeight: 700, color: "#0F172A" }}>
                              {INR(Number(h.paid_amount))}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </Box>
              </Box>
            )}

          </Box>
        ) : (
          <Typography sx={{ textAlign: "center", py: 8, color: "#94A3B8" }}>Sale not found.</Typography>
        )}
      </DialogContent>

      {/* ── Sticky footer ───────────────────────────────────────────────── */}
      <Box sx={{
        px: 4, py: 3,
        bgcolor: "#F8FAFC",
        borderTop: "1px solid #F1F5F9",
        display: "flex", flexWrap: "wrap",
        alignItems: "center", justifyContent: "space-between", gap: 2,
        borderRadius: "0 0 12px 12px",
      }}>
        <Button onClick={onClose}
          sx={{ fontSize: "0.875rem", fontWeight: 700, color: "#475569", "&:hover": { color: "#0F172A" }, px: 3, py: 1 }}>
          Cancel
        </Button>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
          <Button variant="outlined"
            sx={{ minWidth: 0, px: 2, py: 1.2, borderColor: "#E2E8F0", color: "#475569", borderRadius: "10px", "&:hover": { bgcolor: "#fff", borderColor: "#CBD5E1" } }}>
            <ShareIcon sx={{ fontSize: 20 }} />
          </Button>
          <Button variant="contained" disableElevation startIcon={<PdfIcon sx={{ fontSize: 18 }} />}
            sx={{ bgcolor: "#E2E8F0", color: "#0F172A", borderRadius: "10px", px: 3, py: 1.2, fontWeight: 700, fontSize: "0.875rem", "&:hover": { bgcolor: "#CBD5E1" }, boxShadow: "none" }}>
            Download PDF
          </Button>
          <Button variant="contained" disableElevation startIcon={<PrintIcon sx={{ fontSize: 18 }} />}
            sx={{ bgcolor: "#D0021B", color: "#fff", borderRadius: "10px", px: 4, py: 1.2, fontWeight: 700, fontSize: "0.875rem", boxShadow: "0 4px 14px rgba(208,2,27,0.25)", "&:hover": { bgcolor: "#B80018" } }}>
            Print Invoice
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
}