// import React, { useRef, useCallback, useEffect, useState } from "react";
// import {
//   useInfiniteQuery,
//   useQuery,
//   useMutation,
//   QueryClient,
//   QueryClientProvider,
// } from "@tanstack/react-query";
// import {
//   Box, Card, CardContent, Chip, Typography, IconButton, TextField,
//   InputAdornment, Select, MenuItem, FormControl, Button, Divider, Stack,
//   Avatar, CircularProgress, Tooltip, Table, TableBody, TableCell,
//   TableContainer, TableHead, TableRow, Paper, Skeleton, Dialog,
//   DialogTitle, DialogContent, DialogActions, alpha, Checkbox,
//   FormControlLabel,
// } from "@mui/material";
// import {
//   Search as SearchIcon, Receipt as ReceiptIcon,
//   TrendingUp as TrendingUpIcon, StorefrontOutlined as StoreIcon,
//   FileDownloadOutlined as ExportIcon, Circle, Close as CloseIcon,
//   AccountBalanceWallet as WalletIcon,
// } from "@mui/icons-material";
// import { createTheme, ThemeProvider } from "@mui/material/styles";
// import {
//   fetchHistory, fetchSaleDetail, postMarkPayment, salesQueryKeys,
//   type Sale, type SaleItem, type SaleDetail, type HistoryPage,
//   type PaymentHistoryRow, type Filters, type MarkPaymentPayload,
// } from "./useSaleshistory";

// const INR = (v: number) =>
//   new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(v);

// // ─── Theme ────────────────────────────────────────────────────────────────────
// const theme = createTheme({
//   palette: {
//     mode: "light",
//     primary: { main: "#E53935" },
//     success: { main: "#2E7D32" },
//     warning: { main: "#F57C00" },
//     error:   { main: "#C62828" },
//     background: { default: "#F5F6FA", paper: "#FFFFFF" },
//     text: { primary: "#1A1A2E", secondary: "#6B7280" },
//   },
//   typography: {
//     fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
//     h5: { fontWeight: 700, letterSpacing: "-0.5px" },
//     h6: { fontWeight: 600 },
//     subtitle2: { fontWeight: 600, fontSize: "0.78rem", letterSpacing: "0.04em", textTransform: "uppercase" },
//   },
//   shape: { borderRadius: 12 },
//   components: {
//     MuiCard: { styleOverrides: { root: { boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)", borderRadius: 14 } } },
//     MuiButton: { styleOverrides: { root: { textTransform: "none", fontWeight: 600, borderRadius: 8 } } },
//     MuiTextField: { styleOverrides: { root: { "& .MuiOutlinedInput-root": { borderRadius: 8 } } } },
//     MuiTableCell: {
//       styleOverrides: {
//         head: { fontWeight: 700, fontSize: "0.78rem", letterSpacing: "0.04em", textTransform: "uppercase", color: "#6B7280", backgroundColor: alpha("#E53935", 0.04), borderBottom: "1px solid rgba(0,0,0,0.07)" },
//         body: { fontSize: "0.85rem", borderBottom: "1px solid rgba(0,0,0,0.05)" },
//       },
//     },
//     MuiDialog: { styleOverrides: { paper: { borderRadius: 16 } } },
//   },
// });

// // ─── Status helpers ───────────────────────────────────────────────────────────
// type UIStatus = "Paid" | "Partial" | "Unpaid";

// function mapStatus(s: Sale["payment_status"]): UIStatus {
//   if (s === "fully_paid")    return "Paid";
//   if (s === "partially_paid") return "Partial";
//   return "Unpaid";
// }

// function StatusDot({ status }: { status: UIStatus }) {
//   const colors: Record<UIStatus, string> = { Paid: "#2E7D32", Partial: "#F57C00", Unpaid: "#C62828" };
//   return (
//     <Typography variant="body2" sx={{ display: "flex", alignItems: "center", gap: 0.5, color: colors[status], fontWeight: 600 }}>
//       <Circle sx={{ fontSize: 8 }} />
//       {status}
//     </Typography>
//   );
// }

// // ─── useInfiniteScroll ────────────────────────────────────────────────────────
// function useInfiniteScroll(
//   hasNextPage: boolean | undefined,
//   fetchNextPage: () => void,
//   isFetchingNextPage: boolean,
//   scrollContainerRef: React.RefObject<HTMLElement | null>,
// ): React.RefObject<HTMLTableRowElement> {
//   const sentinelRef = useRef<HTMLTableRowElement | null>(null);
//   const handleObserver = useCallback(
//     (entries: IntersectionObserverEntry[]) => {
//       if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage();
//     },
//     [fetchNextPage, hasNextPage, isFetchingNextPage],
//   );
//   useEffect(() => {
//     const el = sentinelRef.current;
//     if (!el) return;
//     const root = scrollContainerRef.current ?? null;
//     const observer = new IntersectionObserver(handleObserver, { root, threshold: 0.1 });
//     observer.observe(el);
//     return () => observer.disconnect();
//   }, [handleObserver, scrollContainerRef]);
//   return sentinelRef as React.RefObject<HTMLTableRowElement>;
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // ── INVOICE DETAIL DIALOG ────────────────────────────────────────────────────
// // ─────────────────────────────────────────────────────────────────────────────

// // Shared table header cell
// function IHCell({ children, align = "left" }: { children: React.ReactNode; align?: "left" | "right" | "center" }) {
//   return (
//     <TableCell align={align} sx={{
//       bgcolor: "#F8FAFC",
//       fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.07em",
//       color: "#9CA3AF", textTransform: "uppercase",
//       borderBottom: "1px solid #E5E7EB",
//       py: 1.3, px: 2.5, whiteSpace: "nowrap",
//     }}>
//       {children}
//     </TableCell>
//   );
// }

// // Shared table body cell
// function IBCell({ children, align = "left", bold = false, red = false }: {
//   children: React.ReactNode; align?: "left" | "right" | "center"; bold?: boolean; red?: boolean;
// }) {
//   return (
//     <TableCell align={align} sx={{
//       fontSize: "0.875rem", fontWeight: bold ? 700 : 400,
//       color: red ? "#E53935" : "#111827",
//       borderBottom: "1px solid #F3F4F6",
//       py: 1.8, px: 2.5,
//     }}>
//       {children}
//     </TableCell>
//   );
// }

// function InvoiceDetailDialog({ saleId, onClose }: { saleId: string; onClose: () => void }) {
//   const { data, isLoading } = useQuery({
//     queryKey: salesQueryKeys.detail(saleId),
//     queryFn: () => fetchSaleDetail(saleId),
//     enabled: !!saleId,
//   });

//   const sale  = data?.sale;
//   const items = data?.items ?? [];

//   // HSN-wise tax breakdown
//   const hsnMap: Record<string, { taxable: number; cgst: number; sgst: number; cgstPct: number; sgstPct: number }> = {};
//   items.forEach((item) => {
//     const hsn     = item.hsn_code ?? item.product_id;
//     const qty     = Number(item.quantity);
//     const price   = Number(item.price);
//     const taxable = qty * price;
//     const cgst    = Number(item.cgst);
//     const sgst    = Number(item.sgst);
//     const gst     = Number(item.gst_percentage);
//     if (!hsnMap[hsn]) hsnMap[hsn] = { taxable: 0, cgst: 0, sgst: 0, cgstPct: gst / 2, sgstPct: gst / 2 };
//     hsnMap[hsn].taxable += taxable;
//     hsnMap[hsn].cgst    += cgst;
//     hsnMap[hsn].sgst    += sgst;
//   });
//   const hsnRows   = Object.entries(hsnMap);
//   const hsnTotals = hsnRows.reduce(
//     (acc, [, v]) => ({ taxable: acc.taxable + v.taxable, cgst: acc.cgst + v.cgst, sgst: acc.sgst + v.sgst }),
//     { taxable: 0, cgst: 0, sgst: 0 }
//   );

//   const discountLabel = sale
//     ? `Discount (${sale.discount_type === "percentage" ? `${Number(sale.discount_value)}%` : "flat"})`
//     : "Discount";

//   // Section heading — "ITEMS LIST" / "HSN-WISE TAX BREAKDOWN" style
//   const SectionHeading = ({ text }: { text: string }) => (
//     <Typography sx={{
//       fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.13em",
//       color: "#6B8CAE", textTransform: "uppercase", mb: 1.5,
//     }}>
//       {text}
//     </Typography>
//   );

//   return (
//     <Dialog
//       open
//       onClose={onClose}
//       maxWidth="md"
//       fullWidth
//       scroll="paper"
//       PaperProps={{ sx: { borderRadius: "14px", overflow: "hidden", m: 2 } }}
//     >
//       {/* ── Title bar ── */}
//       <Box sx={{
//         display: "flex", alignItems: "center", justifyContent: "space-between",
//         px: 4, pt: 3.5, pb: 3,
//       }}>
//         <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
//           <Typography sx={{ fontWeight: 700, fontSize: "1.4rem", color: "#111827", letterSpacing: "-0.3px" }}>
//             Invoice Details
//           </Typography>
//           {sale && (
//             <Box sx={{ bgcolor: "#FEE2E2", borderRadius: "6px", px: 1.5, py: 0.4, display: "inline-flex" }}>
//               <Typography sx={{ fontSize: "0.82rem", fontWeight: 700, color: "#E53935" }}>
//                 {sale.invoice_no}
//               </Typography>
//             </Box>
//           )}
//         </Box>
//         <IconButton onClick={onClose} size="small" sx={{ color: "#9CA3AF", "&:hover": { bgcolor: "#F5F5F5" } }}>
//           <CloseIcon sx={{ fontSize: 20 }} />
//         </IconButton>
//       </Box>

//       <DialogContent sx={{ p: 0, bgcolor: "#fff" }}>
//         {isLoading ? (
//           <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
//             <CircularProgress color="error" size={32} />
//           </Box>
//         ) : sale ? (
//           <Box sx={{ px: 4, pb: 4, display: "flex", flexDirection: "column", gap: 4 }}>

//             {/* ── Customer info ── */}
//             <Box sx={{
//               bgcolor: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: "10px",
//               px: 3, py: 2.5,
//               display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1.6fr",
//             }}>
//               {[
//                 { label: "CUSTOMER NAME", value: sale.customer_name || "Walk-In Customer", red: false },
//                 { label: "MOBILE NO.",    value: sale.customer_phone ? `+91 ${sale.customer_phone}` : "—", red: false },
//                 { label: "GSTIN",         value: "—", red: true  },
//                 { label: "ADDRESS",       value: "—", red: false },
//               ].map(({ label, value, red: isRed }) => (
//                 <Box key={label} sx={{ pr: 2 }}>
//                   <Typography sx={{ fontSize: "0.65rem", fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.1em", textTransform: "uppercase", mb: 0.7 }}>
//                     {label}
//                   </Typography>
//                   <Typography sx={{ fontSize: "0.9rem", fontWeight: 500, color: isRed ? "#E53935" : "#111827", lineHeight: 1.45 }}>
//                     {value}
//                   </Typography>
//                 </Box>
//               ))}
//             </Box>

//             {/* ── ITEMS LIST ── */}
//             <Box>
//               <SectionHeading text="Items List" />
//               <Box sx={{ border: "1px solid #E5E7EB", borderRadius: "10px", overflow: "hidden" }}>
//                 <Table>
//                   <TableHead>
//                     <TableRow>
//                       <IHCell>Item Name</IHCell>
//                       <IHCell>HSN</IHCell>
//                       <IHCell align="right">MRP</IHCell>
//                       <IHCell align="center">QTY</IHCell>
//                       <IHCell align="center">GST%</IHCell>
//                       <IHCell align="right">Total</IHCell>
//                     </TableRow>
//                   </TableHead>
//                   <TableBody>
//                     {items.map((item, idx) => {
//                       const qty    = Number(item.quantity);
//                       const price  = Number(item.price);
//                       const gst    = Number(item.gst_percentage);
//                       const total  = qty * price + Number(item.tax_amount);
//                       const isLast = idx === items.length - 1;
//                       const c = { py: 2, px: 2.5, borderBottom: isLast ? 0 : "1px solid #F3F4F6" };
//                       return (
//                         <TableRow key={item.id}>
//                           <TableCell sx={c}>
//                             <Typography sx={{ fontSize: "0.9rem", color: "#111827" }}>{item.product_name}</Typography>
//                             {item.variant_name && <Typography sx={{ fontSize: "0.75rem", color: "#9CA3AF", mt: 0.2 }}>{item.variant_name}</Typography>}
//                           </TableCell>
//                           <TableCell sx={c}><Typography sx={{ fontSize: "0.9rem", color: "#374151" }}>{item.hsn_code ?? "—"}</Typography></TableCell>
//                           <TableCell align="right" sx={c}><Typography sx={{ fontSize: "0.9rem", color: "#374151" }}>{INR(price)}</Typography></TableCell>
//                           <TableCell align="center" sx={c}><Typography sx={{ fontSize: "0.9rem", color: "#374151" }}>{String(qty).padStart(2, "0")}</Typography></TableCell>
//                           <TableCell align="center" sx={c}><Typography sx={{ fontSize: "0.9rem", color: "#374151" }}>{gst}%</Typography></TableCell>
//                           <TableCell align="right" sx={c}><Typography sx={{ fontSize: "0.9rem", fontWeight: 700, color: "#111827" }}>{INR(total)}</Typography></TableCell>
//                         </TableRow>
//                       );
//                     })}
//                   </TableBody>
//                 </Table>
//               </Box>
//             </Box>

//             {/* ── HSN-WISE TAX BREAKDOWN ── */}
//             <Box>
//               <SectionHeading text="HSN-Wise Tax Breakdown" />
//               <Box sx={{ border: "1px solid #E5E7EB", borderRadius: "10px", overflow: "hidden" }}>
//                 <Table>
//                   <TableHead>
//                     <TableRow>
//                       <IHCell>HSN Code</IHCell>
//                       <IHCell align="right">Taxable Value</IHCell>
//                       <IHCell align="right">CGST (%)</IHCell>
//                       <IHCell align="right">CGST Amount</IHCell>
//                       <IHCell align="right">SGST (%)</IHCell>
//                       <IHCell align="right">SGST Amount</IHCell>
//                       <IHCell align="right">Total Tax</IHCell>
//                     </TableRow>
//                   </TableHead>
//                   <TableBody>
//                     {hsnRows.map(([hsn, v]) => (
//                       <TableRow key={hsn}>
//                         <IBCell>{hsn}</IBCell>
//                         <IBCell align="right">{INR(v.taxable)}</IBCell>
//                         <IBCell align="right">{v.cgstPct}%</IBCell>
//                         <IBCell align="right">{INR(v.cgst)}</IBCell>
//                         <IBCell align="right">{v.sgstPct}%</IBCell>
//                         <IBCell align="right">{INR(v.sgst)}</IBCell>
//                         <IBCell align="right">{INR(v.cgst + v.sgst)}</IBCell>
//                       </TableRow>
//                     ))}
//                     {/* TOTAL row */}
//                     <TableRow sx={{ bgcolor: "#FAFAFA", "& td": { borderBottom: 0 } }}>
//                       <TableCell sx={{ py: 1.8, px: 2.5, fontWeight: 800, fontSize: "0.875rem" }}>TOTAL</TableCell>
//                       <TableCell align="right" sx={{ py: 1.8, px: 2.5, fontWeight: 700, fontSize: "0.875rem" }}>{INR(hsnTotals.taxable)}</TableCell>
//                       <TableCell align="right" sx={{ py: 1.8, px: 2.5, color: "#9CA3AF" }}>-</TableCell>
//                       <TableCell align="right" sx={{ py: 1.8, px: 2.5, fontWeight: 700, fontSize: "0.875rem" }}>{INR(hsnTotals.cgst)}</TableCell>
//                       <TableCell align="right" sx={{ py: 1.8, px: 2.5, color: "#9CA3AF" }}>-</TableCell>
//                       <TableCell align="right" sx={{ py: 1.8, px: 2.5, fontWeight: 700, fontSize: "0.875rem" }}>{INR(hsnTotals.sgst)}</TableCell>
//                       <TableCell align="right" sx={{ py: 1.8, px: 2.5, fontWeight: 800, fontSize: "0.875rem", color: "#E53935" }}>{INR(hsnTotals.cgst + hsnTotals.sgst)}</TableCell>
//                     </TableRow>
//                   </TableBody>
//                 </Table>
//               </Box>
//             </Box>

//             {/* ── Financial Summary ──
//                 Screenshot: white box with border, each row has a ~28% left spacer
//                 so labels appear centre-left, values are right-aligned.
//                 Rows: Subtotal / Discount / CGST Total / SGST Total / (scrolled) Grand Total
//             ── */}
//             <Box sx={{ border: "1px solid #E5E7EB", borderRadius: "10px", overflow: "hidden" }}>
//               {[
//                 { label: "Subtotal",    value: INR(Number(sale.subtotal)),               valueColor: "#111827" },
//                 { label: discountLabel, value: `- ${INR(Number(sale.discount_amount))}`, valueColor: "#16A34A" },
//                 { label: "CGST Total",  value: INR(hsnTotals.cgst),                      valueColor: "#111827" },
//                 { label: "SGST Total",  value: INR(hsnTotals.sgst),                      valueColor: "#111827" },
//               ].map(({ label, value, valueColor }, i, arr) => (
//                 <Box key={label} sx={{
//                   display: "flex", alignItems: "center",
//                   px: 4, py: 2.2,
//                   borderBottom: i < arr.length - 1 ? "1px solid #F5F5F5" : 0,
//                 }}>
//                   <Box sx={{ flex: "0 0 26%" }} />
//                   <Typography sx={{ flex: 1, fontSize: "0.92rem", color: "#6B7280", fontWeight: 400 }}>
//                     {label}
//                   </Typography>
//                   <Typography sx={{ fontSize: "0.92rem", fontWeight: 600, color: valueColor, minWidth: 130, textAlign: "right" }}>
//                     {value}
//                   </Typography>
//                 </Box>
//               ))}

//               {/* Grand Total */}
//               <Box sx={{ display: "flex", alignItems: "center", px: 4, py: 2.2, borderTop: "1px solid #F5F5F5" }}>
//                 <Box sx={{ flex: "0 0 26%" }} />
//                 <Typography sx={{ flex: 1, fontSize: "0.92rem", color: "#6B7280", fontWeight: 400 }}>
//                   Grand Total
//                 </Typography>
//                 <Typography sx={{ fontSize: "0.92rem", fontWeight: 700, color: "#111827", minWidth: 130, textAlign: "right" }}>
//                   {INR(Number(sale.total_amount))}
//                 </Typography>
//               </Box>

//               {Number(sale.balance_amount) > 0 && (
//                 <Box sx={{ display: "flex", alignItems: "center", px: 4, py: 2.2, borderTop: "1px solid #F5F5F5" }}>
//                   <Box sx={{ flex: "0 0 26%" }} />
//                   <Typography sx={{ flex: 1, fontSize: "0.92rem", color: "#F57C00" }}>Balance Due</Typography>
//                   <Typography sx={{ fontSize: "0.92rem", fontWeight: 700, color: "#F57C00", minWidth: 130, textAlign: "right" }}>
//                     {INR(Number(sale.balance_amount))}
//                   </Typography>
//                 </Box>
//               )}
//             </Box>

//           </Box>
//         ) : (
//           <Typography sx={{ textAlign: "center", py: 6, color: "#9CA3AF" }}>Sale not found.</Typography>
//         )}
//       </DialogContent>
//     </Dialog>
//   );
// }


// // ─────────────────────────────────────────────────────────────────────────────
// // ── MARK PAYMENT DIALOG ───────────────────────────────────────────────────────
// // ─────────────────────────────────────────────────────────────────────────────
// function MarkPaymentDialog({ sale, onClose, onSuccess }: { sale: Sale; onClose: () => void; onSuccess: () => void }) {
//   const balance = Number(sale.balance_amount);
//   const [form, setForm] = useState({
//     paid_date:      new Date().toISOString().slice(0, 10),
//     amount:         String(balance),
//     payment_mode:   "Cash",
//     transaction_id: "",
//     notes:          "",
//   });

//   const mutation = useMutation({
//     mutationFn: postMarkPayment,
//     onSuccess: () => { onSuccess(); onClose(); },
//   });

//   const handleSubmit = () => {
//     if (!sale.payment_id) return;
//     mutation.mutate({
//       payment_id:     sale.payment_id,
//       paid_amount:    parseFloat(form.amount) || 0,
//       payment_mode:   form.payment_mode,
//       paid_date:      form.paid_date,
//       transaction_id: form.transaction_id,
//       notes:          form.notes,
//     });
//   };

//   return (
//     <Dialog open onClose={onClose} maxWidth="xs" fullWidth>
//       <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pb: 1 }}>
//         <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
//           <Box sx={{ bgcolor: "#FEE2E2", borderRadius: 2, p: 0.8, display: "flex" }}>
//             <WalletIcon sx={{ color: "#E53935", fontSize: 22 }} />
//           </Box>
//           <Typography sx={{ fontWeight: 700, fontSize: 18 }}>Mark Payment</Typography>
//         </Box>
//         <IconButton size="small" onClick={onClose}><CloseIcon sx={{ fontSize: 18 }} /></IconButton>
//       </DialogTitle>

//       <DialogContent sx={{ pt: 2 }}>
//         {/* Invoice + Outstanding */}
//         <Box sx={{ bgcolor: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: 2, p: 2, mb: 2.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//           <Box>
//             <Typography sx={{ fontSize: 10, color: "#9CA3AF", fontWeight: 600, letterSpacing: "0.1em" }}>INVOICE</Typography>
//             <Typography sx={{ fontWeight: 700, fontSize: 15 }}>{sale.invoice_no}</Typography>
//           </Box>
//           <Box sx={{ textAlign: "right" }}>
//             <Typography sx={{ fontSize: 10, color: "#9CA3AF", fontWeight: 600, letterSpacing: "0.1em" }}>OUTSTANDING</Typography>
//             <Typography sx={{ fontWeight: 800, fontSize: 18, color: "#1D4ED8" }}>{INR(balance)}</Typography>
//           </Box>
//         </Box>

//         <Stack gap={2}>
//           {/* Payment Date */}
//           <Box>
//             <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#374151", mb: 0.6 }}>Payment Date</Typography>
//             <TextField type="date" size="small" fullWidth value={form.paid_date}
//               onChange={e => setForm(f => ({ ...f, paid_date: e.target.value }))}
//               InputProps={{ startAdornment: <InputAdornment position="start"><Typography sx={{ fontSize: 16 }}>📅</Typography></InputAdornment> }}
//             />
//           </Box>

//           {/* Amount to Pay */}
//           <Box>
//             <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#374151", mb: 0.6 }}>Amount to Pay</Typography>
//             <TextField size="small" fullWidth type="number" value={form.amount}
//               onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
//               InputProps={{ startAdornment: <InputAdornment position="start"><Typography sx={{ fontSize: 14, fontWeight: 700, color: "#6B7280" }}>₹</Typography></InputAdornment> }}
//             />
//           </Box>

//           {/* Payment Type + Reference */}
//           <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
//             <Box>
//               <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#374151", mb: 0.6 }}>Payment Type</Typography>
//               <Select size="small" fullWidth value={form.payment_mode}
//                 onChange={e => setForm(f => ({ ...f, payment_mode: e.target.value }))}
//                 sx={{ borderRadius: 2 }}>
//                 {["Cash", "Card", "UPI", "Credit"].map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
//               </Select>
//             </Box>
//             <Box>
//               <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#374151", mb: 0.6 }}>Reference No.</Typography>
//               <TextField size="small" fullWidth placeholder="TXN-12345" value={form.transaction_id}
//                 onChange={e => setForm(f => ({ ...f, transaction_id: e.target.value }))} />
//             </Box>
//           </Box>

//           {/* Notes */}
//           <Box>
//             <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#374151", mb: 0.6 }}>Notes (Optional)</Typography>
//             <TextField multiline rows={3} size="small" fullWidth placeholder="Enter details..."
//               value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
//           </Box>
//         </Stack>
//       </DialogContent>

//       <DialogActions sx={{ px: 3, pb: 3, gap: 1.5 }}>
//         <Button fullWidth variant="outlined" onClick={onClose} sx={{ borderColor: "#E5E7EB", color: "#374151", py: 1.2, borderRadius: 2 }}>Cancel</Button>
//         <Button fullWidth variant="contained" color="primary" disableElevation onClick={handleSubmit}
//           disabled={mutation.isPending}
//           sx={{ py: 1.2, borderRadius: 2, fontWeight: 700, fontSize: 14 }}
//           startIcon={mutation.isPending ? <CircularProgress size={16} color="inherit" /> : <span>✓</span>}>
//           {mutation.isPending ? "Saving…" : "Save Payment"}
//         </Button>
//       </DialogActions>
//     </Dialog>
//   );
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // ── PROCESS SALES RETURN DIALOG ──────────────────────────────────────────────
// // ─────────────────────────────────────────────────────────────────────────────
// function SalesReturnDialog({ saleId, onClose }: { saleId: string; onClose: () => void }) {
//   const { data, isLoading } = useQuery({
//     queryKey: salesQueryKeys.detail(saleId),
//     queryFn: () => fetchSaleDetail(saleId),
//     enabled: !!saleId,
//   });

//   const sale  = data?.sale;
//   const items = data?.items ?? [];

//   const RESTOCK_FEE_PCT = 10;
//   const RETURN_REASONS  = ["Defective Product", "Wrong Item Delivered", "Customer Changed Mind", "Damaged in Transit", "Duplicate Order", "Other"];

//   const [selected, setSelected]   = useState<Record<number, boolean>>({});
//   const [returnQty, setReturnQty] = useState<Record<number, number>>({});
//   const [reason, setReason]       = useState("");
//   const [note, setNote]           = useState("");

//   // Init once items load
//   useEffect(() => {
//     if (items.length > 0) {
//       const sel: Record<number, boolean> = {};
//       const qty: Record<number, number>  = {};
//       items.forEach(item => { sel[item.id] = false; qty[item.id] = Number(item.quantity); });
//       setSelected(sel);
//       setReturnQty(qty);
//     }
//   }, [items.length]);

//   const toggleSelect = (id: number) => setSelected(s => ({ ...s, [id]: !s[id] }));

//   const totalReturnAmount = items.reduce((sum, item) => {
//     if (!selected[item.id]) return sum;
//     const qty   = returnQty[item.id] ?? 0;
//     const price = Number(item.price) + (Number(item.tax_amount) / Number(item.quantity));
//     return sum + qty * price;
//   }, 0);

//   const restockFee   = (totalReturnAmount * RESTOCK_FEE_PCT) / 100;
//   const netRefund    = totalReturnAmount - restockFee;
//   const anySelected  = Object.values(selected).some(Boolean);

//   return (
//     <Dialog open onClose={onClose} maxWidth="md" fullWidth scroll="paper">
//       <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pb: 0.5 }}>
//         <Box>
//           <Typography sx={{ fontWeight: 700, fontSize: 20 }}>Process Sales Return</Typography>
//           {sale && (
//             <Typography sx={{ fontSize: 12, color: "#6B7280", mt: 0.2 }}>
//               Invoice {sale.invoice_no} | Customer: {sale.customer_name || "Walk-In"}
//             </Typography>
//           )}
//         </Box>
//         <IconButton size="small" onClick={onClose}><CloseIcon sx={{ fontSize: 18 }} /></IconButton>
//       </DialogTitle>

//       <DialogContent dividers sx={{ p: 3 }}>
//         {isLoading ? (
//           <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}><CircularProgress /></Box>
//         ) : (
//           <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>

//             {/* Items selection table */}
//             <Box sx={{ border: "1px solid #E5E7EB", borderRadius: 2, overflow: "hidden" }}>
//               <Table size="small">
//                 <TableHead>
//                   <TableRow>
//                     <TableCell padding="checkbox" />
//                     <TableCell>ITEM DETAILS</TableCell>
//                     <TableCell align="center">QTY ORIGINAL</TableCell>
//                     <TableCell align="center">RETURN QTY</TableCell>
//                     <TableCell align="right">UNIT PRICE</TableCell>
//                     <TableCell align="right">TOTAL</TableCell>
//                   </TableRow>
//                 </TableHead>
//                 <TableBody>
//                   {items.map((item) => {
//                     const origQty = Number(item.quantity);
//                     const rQty    = returnQty[item.id] ?? origQty;
//                     const price   = Number(item.price);
//                     const lineTotal = selected[item.id] ? rQty * price : 0;
//                     return (
//                       <TableRow key={item.id} sx={{ bgcolor: selected[item.id] ? alpha("#E53935", 0.03) : "transparent" }}>
//                         <TableCell padding="checkbox">
//                           <Checkbox
//                             checked={!!selected[item.id]}
//                             onChange={() => toggleSelect(item.id)}
//                             sx={{ color: "#E53935", "&.Mui-checked": { color: "#E53935" } }}
//                           />
//                         </TableCell>
//                         <TableCell>
//                           <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{item.product_name}</Typography>
//                           {item.variant_name && <Typography sx={{ fontSize: 11, color: "#9CA3AF" }}>{item.variant_name}</Typography>}
//                         </TableCell>
//                         <TableCell align="center">
//                           <Typography sx={{ fontSize: 13 }}>{origQty}</Typography>
//                         </TableCell>
//                         <TableCell align="center">
//                           <TextField
//                             size="small"
//                             type="number"
//                             value={rQty}
//                             disabled={!selected[item.id]}
//                             onChange={e => {
//                               const v = Math.min(Math.max(0, parseInt(e.target.value) || 0), origQty);
//                               setReturnQty(q => ({ ...q, [item.id]: v }));
//                             }}
//                             inputProps={{ min: 0, max: origQty, style: { textAlign: "center", width: 48, padding: "4px 6px", fontWeight: 700 } }}
//                             sx={{ width: 72, "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
//                           />
//                         </TableCell>
//                         <TableCell align="right">
//                           <Typography sx={{ fontSize: 13 }}>{INR(price)}</Typography>
//                         </TableCell>
//                         <TableCell align="right">
//                           <Typography sx={{ fontSize: 13, fontWeight: 700, color: selected[item.id] ? "#E53935" : "#9CA3AF" }}>
//                             {INR(lineTotal)}
//                           </Typography>
//                         </TableCell>
//                       </TableRow>
//                     );
//                   })}
//                 </TableBody>
//               </Table>
//             </Box>

//             {/* Reason + Financial Summary side-by-side */}
//             <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3, alignItems: "start" }}>

//               {/* Left: Reason + Note */}
//               <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
//                 <Box>
//                   <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#374151", mb: 0.8 }}>Return Reason</Typography>
//                   <Select size="small" fullWidth displayEmpty value={reason}
//                     onChange={e => setReason(e.target.value)} sx={{ borderRadius: 2 }}>
//                     <MenuItem value="" disabled><Typography sx={{ color: "#9CA3AF" }}>Select reason…</Typography></MenuItem>
//                     {RETURN_REASONS.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
//                   </Select>
//                 </Box>
//                 <Box>
//                   <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#374151", mb: 0.8 }}>Internal Note (Optional)</Typography>
//                   <TextField multiline rows={4} size="small" fullWidth
//                     placeholder="Add specific details about the return condition, photos received, or manager approval..."
//                     value={note} onChange={e => setNote(e.target.value)} />
//                 </Box>
//               </Box>

//               {/* Right: Financial Summary */}
//               <Box sx={{ bgcolor: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: 2, p: 2.5 }}>
//                 <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.1em", mb: 2 }}>FINANCIAL SUMMARY</Typography>
//                 <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
//                   <Typography sx={{ fontSize: 14, color: "#374151" }}>Total Return Amount</Typography>
//                   <Typography sx={{ fontSize: 14, fontWeight: 700 }}>{INR(totalReturnAmount)}</Typography>
//                 </Box>
//                 <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
//                   <Typography sx={{ fontSize: 14, color: "#374151" }}>Restocking Fee ({RESTOCK_FEE_PCT}%)</Typography>
//                   <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#E53935" }}>-{INR(restockFee)}</Typography>
//                 </Box>
//                 <Divider sx={{ mb: 2 }} />
//                 <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
//                   <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#6B7280", letterSpacing: "0.08em" }}>NET REFUND PAYABLE</Typography>
//                   <Typography sx={{ fontSize: 26, fontWeight: 900, color: "#E53935" }}>{INR(netRefund)}</Typography>
//                 </Box>
//                 <Typography sx={{ fontSize: 11, color: "#9CA3AF", mt: 1.5 }}>
//                   ℹ Refund will be processed to the original payment method.
//                 </Typography>
//               </Box>

//             </Box>

//           </Box>
//         )}
//       </DialogContent>

//       <DialogActions sx={{ px: 3, py: 2, gap: 1.5 }}>
//         <Button variant="outlined" onClick={onClose} sx={{ borderColor: "#E5E7EB", color: "#374151", px: 4, py: 1, borderRadius: 2 }}>Cancel</Button>
//         <Button variant="contained" color="primary" disableElevation disabled={!anySelected || !reason}
//           sx={{ px: 4, py: 1, borderRadius: 2, fontWeight: 700 }}>
//           Confirm Return
//         </Button>
//       </DialogActions>
//     </Dialog>
//   );
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // ── MAIN SCREEN ───────────────────────────────────────────────────────────────
// // ─────────────────────────────────────────────────────────────────────────────
// const queryClient = new QueryClient();
// export default function SalesHistoryPage() {
//   return (
//     <QueryClientProvider client={queryClient}>
//       <ThemeProvider theme={theme}>
//         <SalesHistoryScreen />
//       </ThemeProvider>
//     </QueryClientProvider>
//   );
// }

// function SalesHistoryScreen() {
//   // ── Filters ────────────────────────────────────────────────
//   const [draftFilters, setDraftFilters] = useState<Filters>({ search: "", payment_status: "", from_date: "", to_date: "" });
//   const [appliedFilters, setAppliedFilters] = useState<Filters>({ search: "", payment_status: "", from_date: "", to_date: "" });

//   // ── Dialog state ───────────────────────────────────────────
//   const [invoiceDialog, setInvoiceDialog] = useState<string | null>(null);   // sale_id
//   const [paymentDialog, setPaymentDialog] = useState<Sale | null>(null);
//   const [returnDialog,  setReturnDialog]  = useState<string | null>(null);   // sale_id

//   // ── Infinite query ─────────────────────────────────────────
//   const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, refetch } =
//     useInfiniteQuery({
//       queryKey: salesQueryKeys.history(appliedFilters),
//       queryFn: ({ pageParam = 1 }) => fetchHistory(pageParam as number, appliedFilters),
//       initialPageParam: 1,
//       getNextPageParam: (last) => last.page < last.total_pages ? last.page + 1 : undefined,
//     });

//   const tableContainerRef = useRef<HTMLDivElement | null>(null);
//   const loadMoreRef = useInfiniteScroll(hasNextPage, fetchNextPage, isFetchingNextPage, tableContainerRef);
//   const allItems = data?.pages.flatMap((p) => p.data) ?? [];
//   const totalCount = data?.pages[0]?.total ?? 0;

//   const handleApply = () => setAppliedFilters({ ...draftFilters });

//   return (
//     <Box sx={{ minHeight: "100vh", bgcolor: "background.default", p: { xs: 2, sm: 3 } }}>

//       {/* Header */}
//       <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1.5} mb={3}>
//         <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
//           <Avatar sx={{ bgcolor: "primary.main", width: 40, height: 40 }}>
//             <StoreIcon sx={{ fontSize: 22 }} />
//           </Avatar>
//           <Box>
//             <Typography variant="h5" lineHeight={1.1}>Sales History</Typography>
//             <Typography sx={{ fontSize: 12, color: "#9CA3AF" }}>Track and manage your sales transactions</Typography>
//           </Box>
//         </Box>
//         <Button sx={{ borderRadius: 0.6, fontWeight: 600 }} onClick={() => window.history.back()}
//           startIcon={<ReceiptIcon />} variant="contained" color="primary" disableElevation>
//           <Typography variant="caption" color="white" fontWeight={600}>Back to POS</Typography>
//         </Button>
//       </Stack>

//       {/* Summary + Export */}
//       <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, mb: 3 }}>
//         <Box sx={{ display: "flex", gap: 2, flex: 0.4 }}>
//           {[
//             { label: "Total Transactions", value: String(totalCount), icon: <ReceiptIcon />, color: "#E53935", bg: "#FFEBEE" },
//             { label: "Net Revenue",        value: INR(allItems.reduce((s, i) => s + Number(i.total_amount), 0)), icon: <TrendingUpIcon />, color: "#2E7D32", bg: "#E8F5E9" },
//           ].map((c) => (
//             <Card key={c.label} elevation={1} sx={{ flex: 1 }}>
//               <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
//                 <Stack direction="row" alignItems="center" gap={1.5}>
//                   <Box sx={{ p: 1, borderRadius: 2, bgcolor: c.bg, color: c.color, display: "flex", flexShrink: 0 }}>
//                     {React.cloneElement(c.icon as React.ReactElement, { sx: { fontSize: 22 } })}
//                   </Box>
//                   <Box>
//                     <Typography variant="subtitle2" color="text.secondary">{c.label}</Typography>
//                     <Typography variant="h6" fontWeight={800} color={c.color}>{c.value}</Typography>
//                   </Box>
//                 </Stack>
//               </CardContent>
//             </Card>
//           ))}
//         </Box>
//         <Button variant="outlined" color="primary" startIcon={<ExportIcon />} disableElevation
//           sx={{ alignSelf: "stretch", minWidth: 140, borderStyle: "dashed", whiteSpace: "nowrap", px: 2.5 }}>
//           Export CSV
//         </Button>
//       </Box>

//       {/* Filter Bar */}
//       <Card elevation={3} sx={{ mb: 2, boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}>
//         <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
//           <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2, letterSpacing: "0.06em" }}>FILTER TRANSACTIONS</Typography>
//           <Stack direction={{ xs: "column", sm: "row" }} gap={2} alignItems="flex-end">
//             {/* Search */}
//             <Box sx={{ flex: 1.2 }}>
//               <Typography variant="caption" fontWeight={600} color="text.secondary" display="block" mb={0.6}>Search Transaction</Typography>
//               <TextField placeholder="Invoice ID or Customer Name" size="small" fullWidth
//                 value={draftFilters.search}
//                 onChange={e => setDraftFilters(f => ({ ...f, search: e.target.value }))}
//                 InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18, color: "text.secondary" }} /></InputAdornment> }}
//               />
//             </Box>
//             {/* From date */}
//             <Box sx={{ flex: 0.5, minWidth: 150 }}>
//               <Typography variant="caption" fontWeight={600} color="text.secondary" display="block" mb={0.6}>From Date</Typography>
//               <TextField type="date" size="small" fullWidth value={draftFilters.from_date}
//                 onChange={e => setDraftFilters(f => ({ ...f, from_date: e.target.value }))} />
//             </Box>
//             {/* To date */}
//             <Box sx={{ flex: 0.5, minWidth: 150 }}>
//               <Typography variant="caption" fontWeight={600} color="text.secondary" display="block" mb={0.6}>To Date</Typography>
//               <TextField type="date" size="small" fullWidth value={draftFilters.to_date}
//                 onChange={e => setDraftFilters(f => ({ ...f, to_date: e.target.value }))} />
//             </Box>
//             {/* Status */}
//             <Box sx={{ flex: 0.5, minWidth: 140 }}>
//               <Typography variant="caption" fontWeight={600} color="text.secondary" display="block" mb={0.6}>Status</Typography>
//               <FormControl size="small" fullWidth>
//                 <Select value={draftFilters.payment_status}
//                   onChange={e => setDraftFilters(f => ({ ...f, payment_status: e.target.value }))}>
//                   <MenuItem value="">All Status</MenuItem>
//                   <MenuItem value="fully_paid">Paid</MenuItem>
//                   <MenuItem value="partially_paid">Partial</MenuItem>
//                   <MenuItem value="unpaid">Unpaid</MenuItem>
//                 </Select>
//               </FormControl>
//             </Box>
//             {/* Apply */}
//             <Box>
//               <Typography variant="caption" color="transparent" display="block" mb={0.6} sx={{ userSelect: "none" }}>&nbsp;</Typography>
//               <Button variant="contained" color="primary" disableElevation size="medium"
//                 sx={{ px: 3.5, height: 40 }} onClick={handleApply}>Apply</Button>
//             </Box>
//           </Stack>
//         </CardContent>
//       </Card>

//       {/* Table */}
//       <Card elevation={3} sx={{ boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}>
//         <TableContainer ref={tableContainerRef} component={Paper} elevation={0} sx={{ maxHeight: 520, overflow: "auto" }}>
//           <Table stickyHeader>
//             <TableHead>
//               <TableRow>
//                 <TableCell>Invoice ID</TableCell>
//                 <TableCell>Date &amp; Time</TableCell>
//                 <TableCell>Customer</TableCell>
//                 <TableCell align="right">Total</TableCell>
//                 <TableCell>Payment</TableCell>
//                 <TableCell align="right">Actions</TableCell>
//               </TableRow>
//             </TableHead>
//             <TableBody>
//               {isLoading
//                 ? Array.from({ length: 8 }).map((_, i) => (
//                     <TableRow key={`sk-${i}`}>
//                       {Array.from({ length: 6 }).map((__, j) => (
//                         <TableCell key={j}><Skeleton variant="text" width={j === 5 ? 80 : "80%"} /></TableCell>
//                       ))}
//                     </TableRow>
//                   ))
//                 : allItems.map((sale) => {
//                     const status  = mapStatus(sale.payment_status);
//                     const balance = Number(sale.balance_amount);
//                     const dateStr = new Date(`${sale.sale_date}T${sale.sale_time || "00:00"}`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
//                     return (
//                       <TableRow key={sale.sale_id} hover sx={{ "&:hover": { bgcolor: alpha("#E53935", 0.03) } }}>
//                         {/* Invoice ID — clickable */}
//                         <TableCell sx={{ cursor: "pointer" }} onClick={() => setInvoiceDialog(sale.sale_id)}>
//                           <Typography variant="body2" fontWeight={700} color="primary">{sale.invoice_no}</Typography>
//                         </TableCell>

//                         <TableCell>
//                           <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8rem" }}>
//                             {dateStr}{sale.sale_time ? ` • ${sale.sale_time.slice(0, 5)}` : ""}
//                           </Typography>
//                         </TableCell>

//                         <TableCell>
//                           <Stack direction="row" alignItems="center" gap={1}>
//                             <Avatar sx={{ width: 28, height: 28, fontSize: "0.7rem", bgcolor: alpha("#E53935", 0.12), color: "primary.main", fontWeight: 700 }}>
//                               {(sale.customer_name || "W").charAt(0).toUpperCase()}
//                             </Avatar>
//                             <Typography variant="body2" fontWeight={500}>{sale.customer_name || "Walk-In"}</Typography>
//                           </Stack>
//                         </TableCell>

//                         <TableCell align="right">
//                           <Typography variant="body2" fontWeight={700}>{INR(Number(sale.total_amount))}</Typography>
//                           {balance > 0 && (
//                             <Typography variant="caption" color="error.main" display="block">
//                               Balance: {INR(balance)}
//                             </Typography>
//                           )}
//                         </TableCell>

//                         <TableCell>
//                           <Stack direction="row" alignItems="center" gap={1}>
//                             <StatusDot status={status} />
//                             {status !== "Paid" && (
//                               <Button size="small" variant="contained" color="primary" disableElevation
//                                 onClick={() => setPaymentDialog(sale)}
//                                 sx={{ fontSize: "0.68rem", py: 0.3, px: 2, height: 24, ml: 2, minWidth: 0, whiteSpace: "nowrap", borderRadius: 1 }}>
//                                 Mark as Paid
//                               </Button>
//                             )}
//                           </Stack>
//                         </TableCell>

//                         <TableCell align="right">
//                           <Stack direction="row" justifyContent="flex-end" gap={0.3}>
//                             {/* Sales Return */}
//                             <Tooltip title="Sales Return">
//                               <IconButton size="small" onClick={() => setReturnDialog(sale.sale_id)}
//                                 sx={{ color: "text.secondary", borderRadius: 1.5, "&:hover": { color: "primary.main", bgcolor: alpha("#E53935", 0.06) } }}>
//                                 <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4 2 4-2 4 2z" />
//                                 </svg>
//                               </IconButton>
//                             </Tooltip>
//                             {/* Edit */}
//                             <Tooltip title="Edit Invoice">
//                               <IconButton size="small"
//                                 sx={{ color: "text.secondary", borderRadius: 1.5, "&:hover": { color: "primary.main", bgcolor: alpha("#E53935", 0.06) } }}>
//                                 <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
//                                 </svg>
//                               </IconButton>
//                             </Tooltip>
//                             {/* Delete */}
//                             <Tooltip title="Delete Invoice">
//                               <IconButton size="small"
//                                 sx={{ color: "text.secondary", borderRadius: 1.5, "&:hover": { color: "#C62828", bgcolor: alpha("#C62828", 0.06) } }}>
//                                 <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
//                                 </svg>
//                               </IconButton>
//                             </Tooltip>
//                           </Stack>
//                         </TableCell>
//                       </TableRow>
//                     );
//                   })}

//               {/* Infinite scroll sentinel */}
//               {hasNextPage && (
//                 <TableRow ref={loadMoreRef}>
//                   <TableCell colSpan={6} sx={{ py: 0, border: 0 }}><Box sx={{ height: 20 }} /></TableCell>
//                 </TableRow>
//               )}
//               {isFetchingNextPage && (
//                 <TableRow>
//                   <TableCell colSpan={6} align="center" sx={{ py: 2 }}>
//                     <CircularProgress size={22} color="primary" />
//                   </TableCell>
//                 </TableRow>
//               )}
//               {!hasNextPage && allItems.length > 0 && !isLoading && (
//                 <TableRow>
//                   <TableCell colSpan={6} align="center" sx={{ py: 2 }}>
//                     <Typography variant="caption" color="text.secondary">All {allItems.length} transactions loaded</Typography>
//                   </TableCell>
//                 </TableRow>
//               )}
//             </TableBody>
//           </Table>
//         </TableContainer>
//         <Divider />
//       </Card>

//       {/* ── Dialogs ─────────────────────────────────────────── */}
//       {invoiceDialog && (
//         <InvoiceDetailDialog saleId={invoiceDialog} onClose={() => setInvoiceDialog(null)} />
//       )}
//       {paymentDialog && (
//         <MarkPaymentDialog
//           sale={paymentDialog}
//           onClose={() => setPaymentDialog(null)}
//           onSuccess={() => refetch()}
//         />
//       )}
//       {returnDialog && (
//         <SalesReturnDialog saleId={returnDialog} onClose={() => setReturnDialog(null)} />
//       )}
//     </Box>
//   );
// }

/**
 * SalesHistory.tsx
 * Main sales history page — infinite-scroll table with filters.
 * Dialogs are imported from their own files for maintainability.
 *
 * Dialog files:
 *   InvoiceDetailDialog.tsx  — full invoice view, HSN breakdown, payment history
 *   MarkPaymentDialog.tsx    — collect payment for partial/unpaid invoices
 *   SalesReturnDialog.tsx    — process a sales return with restocking fee
 *   dialogHelpers.tsx        — shared IHCell, IBCell, SectionHeading, INR
 */
import React, { useRef, useCallback, useEffect, useState } from "react";
import { useInfiniteQuery, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Box, Card, CardContent, Typography, Button, Divider, Stack,
  Avatar, CircularProgress, Tooltip, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Skeleton,
  TextField, InputAdornment, Select, MenuItem, FormControl,
  IconButton, alpha,
} from "@mui/material";
import {
  Search as SearchIcon, Receipt as ReceiptIcon,
  TrendingUp as TrendingUpIcon, StorefrontOutlined as StoreIcon,
  FileDownloadOutlined as ExportIcon, Circle,
} from "@mui/icons-material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import {
  fetchHistory, salesQueryKeys,
  type Sale, type Filters,
} from "./useSaleshistory";

// ── Dialog components (each in their own file) ────────────────────────────
import InvoiceDetailDialog from "./Invoicedetaildialog";
import MarkPaymentDialog   from "./Markpaymentdialog";
import SalesReturnDialog   from "./Salesreturndialog";

const INR = (v: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(v);

// ─── Theme ────────────────────────────────────────────────────────────────────
const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#E53935" },
    success: { main: "#2E7D32" },
    warning: { main: "#F57C00" },
    error:   { main: "#C62828" },
    background: { default: "#F5F6FA", paper: "#FFFFFF" },
    text: { primary: "#1A1A2E", secondary: "#6B7280" },
  },
  typography: {
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    h5: { fontWeight: 700, letterSpacing: "-0.5px" },
    h6: { fontWeight: 600 },
    subtitle2: { fontWeight: 600, fontSize: "0.78rem", letterSpacing: "0.04em", textTransform: "uppercase" },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiCard: { styleOverrides: { root: { boxShadow: "0 1px 3px rgba(0,0,0,0.06)", borderRadius: 14 } } },
    MuiButton: { styleOverrides: { root: { textTransform: "none", fontWeight: 600, borderRadius: 8 } } },
    MuiTextField: { styleOverrides: { root: { "& .MuiOutlinedInput-root": { borderRadius: 8 } } } },
    MuiTableCell: {
      styleOverrides: {
        head: { fontWeight: 700, fontSize: "0.78rem", letterSpacing: "0.04em", textTransform: "uppercase", color: "#6B7280", backgroundColor: alpha("#E53935", 0.04), borderBottom: "1px solid rgba(0,0,0,0.07)" },
        body: { fontSize: "0.85rem", borderBottom: "1px solid rgba(0,0,0,0.05)" },
      },
    },
  },
});

// ─── Status helpers ───────────────────────────────────────────────────────────
type UIStatus = "Paid" | "Partial" | "Unpaid";

function mapStatus(s: Sale["payment_status"]): UIStatus {
  if (s === "fully_paid")     return "Paid";
  if (s === "partially_paid") return "Partial";
  return "Unpaid";
}

function StatusDot({ status }: { status: UIStatus }) {
  const colors: Record<UIStatus, string> = { Paid: "#2E7D32", Partial: "#F57C00", Unpaid: "#C62828" };
  return (
    <Typography variant="body2" sx={{ display: "flex", alignItems: "center", gap: 0.5, color: colors[status], fontWeight: 600 }}>
      <Circle sx={{ fontSize: 8 }} />
      {status}
    </Typography>
  );
}

// ─── Infinite scroll hook ─────────────────────────────────────────────────────
function useInfiniteScroll(
  hasNextPage: boolean | undefined,
  fetchNextPage: () => void,
  isFetchingNextPage: boolean,
  scrollContainerRef: React.RefObject<HTMLElement | null>,
): React.RefObject<HTMLTableRowElement> {
  const sentinelRef = useRef<HTMLTableRowElement | null>(null);
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage();
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage],
  );
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const root = scrollContainerRef.current ?? null;
    const observer = new IntersectionObserver(handleObserver, { root, threshold: 0.1 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [handleObserver, scrollContainerRef]);
  return sentinelRef as React.RefObject<HTMLTableRowElement>;
}

// ─── Root export ──────────────────────────────────────────────────────────────
const queryClient = new QueryClient();

export default function SalesHistoryPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <SalesHistoryScreen />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────
function SalesHistoryScreen() {
  const headerCellSx = {
    bgcolor: "#F8EAEA",
    color: "#6B7280",
    fontSize: "0.78rem",
    fontWeight: 700,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    borderBottom: "1px solid rgba(0,0,0,0.07)",
  } as const;

  const [draftFilters, setDraftFilters]     = useState<Filters>({ search: "", payment_status: "", from_date: "", to_date: "" });
  const [appliedFilters, setAppliedFilters] = useState<Filters>({ search: "", payment_status: "", from_date: "", to_date: "" });

  // Dialog open state
  const [invoiceDialog, setInvoiceDialog] = useState<string | null>(null); // sale_id
  const [paymentDialog, setPaymentDialog] = useState<Sale   | null>(null);
  const [returnDialog,  setReturnDialog]  = useState<string | null>(null); // sale_id

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, refetch } =
    useInfiniteQuery({
      queryKey: salesQueryKeys.history(appliedFilters),
      queryFn:  ({ pageParam = 1 }) => fetchHistory(pageParam as number, appliedFilters),
      initialPageParam: 1,
      getNextPageParam: (last) => last.page < last.total_pages ? last.page + 1 : undefined,
    });


  const tableContainerRef = useRef<HTMLDivElement | null>(null);
  const loadMoreRef  = useInfiniteScroll(hasNextPage, fetchNextPage, isFetchingNextPage, tableContainerRef);
  const allItems     = data?.pages.flatMap((p) => p.data) ?? [];
  const totalCount   = data?.pages[0]?.total ?? 0;
  const handleApply  = () => setAppliedFilters({ ...draftFilters });

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", p: { xs: 2, sm: 3 } }}>

      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1.5} mb={3}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Avatar sx={{ bgcolor: "primary.main", width: 40, height: 40 }}><StoreIcon sx={{ fontSize: 22 }} /></Avatar>
          <Box>
            <Typography variant="h5" lineHeight={1.1}>Sales History</Typography>
            <Typography sx={{ fontSize: 12, color: "#9CA3AF" }}>Track and manage your sales transactions</Typography>
          </Box>
        </Box>
        <Button onClick={() => window.history.back()} startIcon={<ReceiptIcon />}
          variant="contained" color="primary" disableElevation sx={{ borderRadius: 0.6, fontWeight: 600 }}>
          <Typography variant="caption" color="white" fontWeight={600}>Back to POS</Typography>
        </Button>
      </Stack>

      {/* Summary cards + Export */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, mb: 3 }}>
        <Box sx={{ display: "flex", gap: 2, flex: 0.4 }}>
          {[
            { label: "Total Transactions", value: String(totalCount), icon: <ReceiptIcon />, color: "#E53935", bg: "#FFEBEE" },
            { label: "Net Revenue", value: INR(allItems.reduce((s, i) => s + Number(i.total_amount), 0)), icon: <TrendingUpIcon />, color: "#2E7D32", bg: "#E8F5E9" },
          ].map((c) => (
            <Card key={c.label} elevation={1} sx={{ flex: 1 }}>
              <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                <Stack direction="row" alignItems="center" gap={1.5}>
                  <Box sx={{ p: 1, borderRadius: 2, bgcolor: c.bg, color: c.color, display: "flex", flexShrink: 0 }}>
                    {React.cloneElement(c.icon as React.ReactElement, { sx: { fontSize: 22 } })}
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">{c.label}</Typography>
                    <Typography variant="h6" fontWeight={800} color={c.color}>{c.value}</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Box>
        <Button variant="outlined" color="primary" startIcon={<ExportIcon />} disableElevation
          sx={{ alignSelf: "stretch", minWidth: 140,height:40, borderStyle: "dashed", whiteSpace: "nowrap", px: 2.5 }}>
          Export CSV
        </Button>
      </Box>

      {/* Filter bar */}
      <Card elevation={3} sx={{ mb: 2, boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}>
        <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2, letterSpacing: "0.06em" }}>
            FILTER TRANSACTIONS
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} gap={2} alignItems="flex-end">
            <Box sx={{ flex: 1.2 }}>
              <Typography variant="caption" fontWeight={600} color="text.secondary" display="block" mb={0.6}>Search Transaction</Typography>
              <TextField placeholder="Invoice ID or Customer Name" size="small" fullWidth
                value={draftFilters.search} onChange={e => setDraftFilters(f => ({ ...f, search: e.target.value }))}
                InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18, color: "text.secondary" }} /></InputAdornment> }} />
            </Box>
            <Box sx={{ flex: 0.5, minWidth: 150 }}>
              <Typography variant="caption" fontWeight={600} color="text.secondary" display="block" mb={0.6}>From Date</Typography>
              <TextField type="date" size="small" fullWidth value={draftFilters.from_date}
                onChange={e => setDraftFilters(f => ({ ...f, from_date: e.target.value }))} />
            </Box>
            <Box sx={{ flex: 0.5, minWidth: 150 }}>
              <Typography variant="caption" fontWeight={600} color="text.secondary" display="block" mb={0.6}>To Date</Typography>
              <TextField type="date" size="small" fullWidth value={draftFilters.to_date}
                onChange={e => setDraftFilters(f => ({ ...f, to_date: e.target.value }))} />
            </Box>
            <Box sx={{ flex: 0.5, minWidth: 140 }}>
              <Typography variant="caption" fontWeight={600} color="text.secondary" display="block" mb={0.6}>Status</Typography>
              <FormControl size="small" fullWidth>
                <Select value={draftFilters.payment_status} onChange={e => setDraftFilters(f => ({ ...f, payment_status: e.target.value }))}>
                  <MenuItem value="">All Status</MenuItem>
                  <MenuItem value="fully_paid">Paid</MenuItem>
                  <MenuItem value="partially_paid">Partial</MenuItem>
                  <MenuItem value="unpaid">Unpaid</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box>
              <Typography variant="caption" color="transparent" display="block" mb={0.6} sx={{ userSelect: "none" }}>&nbsp;</Typography>
              <Button variant="contained" color="primary" disableElevation size="medium"
                sx={{ px: 3.5, height: 40 }} onClick={handleApply}>Apply</Button>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Transactions table */}
      <Card elevation={3} sx={{ boxShadow: "0 4px 16px rgba(26, 26, 26, 0.08)" }}>
        <TableContainer ref={tableContainerRef} component={Paper} elevation={0} sx={{ maxHeight: 520, overflow: "auto" }}>
          <Table stickyHeader >
            <TableHead sx={{ "& .MuiTableCell-root": headerCellSx }}>
              <TableRow>
                <TableCell sx={headerCellSx}>Invoice ID</TableCell>
                <TableCell sx={headerCellSx}>Date &amp; Time</TableCell>
                <TableCell sx={headerCellSx}>Customer</TableCell>
                <TableCell align="right" sx={headerCellSx}>Total</TableCell>
                <TableCell sx={headerCellSx}>Payment</TableCell>
                <TableCell align="right" sx={headerCellSx}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <TableRow key={`sk-${i}`}>
                      {Array.from({ length: 6 }).map((__, j) => (
                        <TableCell key={j}><Skeleton variant="text" width={j === 5 ? 80 : "80%"} /></TableCell>
                      ))}
                    </TableRow>
                  ))
                : allItems.map((sale) => {
                    const status  = mapStatus(sale.payment_status);
                    const balance = Number(sale.balance_amount);
                    const dateStr = new Date(`${sale.sale_date}T${sale.sale_time || "00:00"}`)
                      .toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
                    return (
                      <TableRow key={sale.sale_id} hover sx={{ "&:hover": { bgcolor: alpha("#E53935", 0.03) } }}>
                        {/* Clickable invoice no → opens InvoiceDetailDialog */}
                        <TableCell sx={{ cursor: "pointer" }} onClick={() => setInvoiceDialog(sale.sale_id)}>
                          <Typography variant="body2" fontWeight={700} color="primary">{sale.invoice_no}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8rem" }}>
                            {sale.sale_date}{sale.sale_time ? ` • ${sale.sale_time}` : ""}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" alignItems="center" gap={1}>
                            <Avatar sx={{ width: 28, height: 28, fontSize: "0.7rem", bgcolor: alpha("#E53935", 0.12), color: "primary.main", fontWeight: 700 }}>
                              {(sale.customer_name || "W").charAt(0).toUpperCase()}
                            </Avatar>
                            <Typography variant="body2" fontWeight={500}>{sale.customer_name || "Walk-In"}</Typography>
                          </Stack>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight={700}>{INR(Number(sale.total_amount))}</Typography>
                          {balance > 0 && <Typography variant="caption" color="error.main" display="block">Balance: {INR(balance)}</Typography>}
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" alignItems="center" gap={1}>
                            <StatusDot status={status} />
                            {status !== "Paid" && (
                              <Button size="small" variant="contained" color="primary" disableElevation
                                onClick={() => setPaymentDialog(sale)}
                                sx={{ fontSize: "0.68rem", py: 0.3, px: 2, height: 24, ml: 2, minWidth: 0, whiteSpace: "nowrap", borderRadius: 1 }}>
                                Mark as Paid
                              </Button>
                            )}
                          </Stack>
                        </TableCell>
                        <TableCell align="right">
                          <Stack direction="row" justifyContent="flex-end" gap={0.3}>
                            <Tooltip title="Sales Return">
                              <IconButton size="small" onClick={() => setReturnDialog(sale.sale_id)}
                                sx={{ color: "text.secondary", borderRadius: 1.5, "&:hover": { color: "primary.main", bgcolor: alpha("#E53935", 0.06) } }}>
                                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4 2 4-2 4 2z" />
                                </svg>
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Edit Invoice">
                              <IconButton size="small"
                                sx={{ color: "text.secondary", borderRadius: 1.5, "&:hover": { color: "primary.main", bgcolor: alpha("#E53935", 0.06) } }}>
                                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete Invoice">
                              <IconButton size="small"
                                sx={{ color: "text.secondary", borderRadius: 1.5, "&:hover": { color: "#C62828", bgcolor: alpha("#C62828", 0.06) } }}>
                                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })}

              {hasNextPage && (
                <TableRow ref={loadMoreRef}>
                  <TableCell colSpan={6} sx={{ py: 0, border: 0 }}><Box sx={{ height: 20 }} /></TableCell>
                </TableRow>
              )}
              {isFetchingNextPage && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 2 }}>
                    <CircularProgress size={22} color="primary" />
                  </TableCell>
                </TableRow>
              )}
              {!hasNextPage && allItems.length > 0 && !isLoading && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 2 }}>
                    <Typography variant="caption" color="text.secondary">All {allItems.length} transactions loaded</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <Divider />
      </Card>

      {/* ── Dialogs ─────────────────────────────────────────────────────── */}
      {invoiceDialog && (
        <InvoiceDetailDialog saleId={invoiceDialog} onClose={() => setInvoiceDialog(null)} />
      )}
      {paymentDialog && (
        <MarkPaymentDialog sale={paymentDialog} onClose={() => setPaymentDialog(null)} onSuccess={() => refetch()} />
      )}
      {returnDialog && (
        <SalesReturnDialog saleId={returnDialog} onClose={() => setReturnDialog(null)} />
      )}
    </Box>
  );
}
