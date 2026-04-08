/**
 * InvoiceDetailsModal.tsx
 */
import React, { useRef } from "react";
import {
  Dialog, DialogContent, DialogActions,
  Box, Typography, IconButton, Button, Chip, Divider,
  Paper, CircularProgress, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Tooltip,
  styled,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import CloseIcon              from "@mui/icons-material/Close";
import ShareIcon              from "@mui/icons-material/Share";
import DownloadIcon           from "@mui/icons-material/Download";
import PrintIcon              from "@mui/icons-material/Print";
import EditIcon               from "@mui/icons-material/Edit";
import AssignmentReturnIcon   from "@mui/icons-material/AssignmentReturn";
import html2canvas            from "html2canvas";
import jsPDF                  from "jspdf";
import { useNavigate }        from "react-router-dom";
import {
  fetchSaleDetail,
  salesQueryKeys,
  type SaleItem,
  type SaleReturnHistoryItem,
  type SaleReturnHistoryRow,
} from "./useSaleshistory";
import { InvoicePDFTemplate } from "./InvoicePDFTemplate";

const PDF_CAPTURE_SCALE = 1.6;
const PDF_IMAGE_QUALITY = 0.72;
const PDF_HEADER_GAP_MM = 4;
const PDF_PAGE_BOTTOM_GAP_MM = 10;
const PDF_BREAK_SEARCH_PX = 96;
const PDF_MIN_SLICE_HEIGHT_PX = 40;
const PDF_ROW_WHITE_THRESHOLD = 245;

// ─────────────────────────────────────────────────────────────
// Styled helpers
// ─────────────────────────────────────────────────────────────
const StyledDialog = styled(Dialog)(() => ({
  "& .MuiDialog-paper": {
    maxWidth: 1100,
    width: "100%",
    maxHeight: "92vh",
    borderRadius: 16,
    backgroundColor: "#fff",
  },
}));

const InfoCard = styled(Paper)(() => ({
  backgroundColor: "#F8FAFC",
  padding: "16px 20px",
  borderRadius: 12,
  border: "1px solid #E2E8F0",
  boxShadow: "none",
}));

const SectionTitle = styled(Typography)(() => ({
  fontSize: 10,
  fontWeight: 700,
  color: "#94A3B8",
  textTransform: "uppercase",
  letterSpacing: "0.12em",
  marginBottom: 8,
}));

const TH = styled(TableCell)(() => ({
  fontSize: 10,
  fontWeight: 700,
  textTransform: "uppercase",
  color: "#64748B",
  padding: "10px 14px",
  borderBottom: "none",
  backgroundColor: "#F1F5F9",
  letterSpacing: "0.06em",
  whiteSpace: "nowrap",
}));

const TD = styled(TableCell)(() => ({
  fontSize: 13,
  padding: "11px 14px",
  borderBottom: "1px solid #F1F5F9",
  color: "#0F172A",
}));

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
const PAYMENT_COLOR: Record<string, string> = {
  cash: "#22C55E", card: "#3B82F6",
  upi: "#8B5CF6", credit: "#F59E0B",
};

function paymentDot(type: string) {
  return PAYMENT_COLOR[type?.toLowerCase()] ?? "#94A3B8";
}

function INR(v: number | string) {
  return `₹${Number(v).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function toWords(n: number): string {
  // lightweight — just shows the number if words lib not available
  return n.toLocaleString("en-IN");
}

// ─────────────────────────────────────────────────────────────
function getReturnLineItems(
  returnEntry: SaleReturnHistoryRow,
  saleItems: SaleItem[],
  returnCount: number,
): SaleReturnHistoryItem[] {
  const apiItems = returnEntry.items ?? returnEntry.return_items ?? [];
  if (apiItems.length > 0) {
    return apiItems;
  }

  if (returnCount !== 1) {
    return [];
  }

  return saleItems
    .filter((item) => Number(item.returned_qty ?? 0) > 0)
    .map((item) => ({
      item_id: item.item_id,
      item_uuid: item.item_uuid,
      item_name: item.item_name,
      variant_name: item.variant_name,
      unit: item.unit,
      return_qty: item.returned_qty,
      price: item.price,
      refund_amount: item.total_amount,
      return_reason: returnEntry.return_reason,
    }));
}

function getReturnQuantity(item: SaleReturnHistoryItem): number {
  return Number(item.return_qty ?? item.qty_returned ?? item.returned_qty ?? 0);
}

function getReturnRate(item: SaleReturnHistoryItem): number {
  return Number(item.price ?? item.rate ?? 0);
}

function getReturnRefund(item: SaleReturnHistoryItem): number {
  const explicitRefund = Number(item.refund_amount ?? item.amount ?? 0);
  if (explicitRefund > 0) {
    return explicitRefund;
  }

  return getReturnQuantity(item) * getReturnRate(item);
}

function getReturnReason(item: SaleReturnHistoryItem, fallbackReason: string | null): string {
  return item.return_reason ?? item.reason ?? fallbackReason ?? "—";
}

function isCanvasRowBlank(
  pixels: Uint8ClampedArray,
  width: number,
  row: number,
): boolean {
  const offset = row * width * 4;

  for (let x = 0; x < width; x += 1) {
    const index = offset + x * 4;
    const alpha = pixels[index + 3];

    if (alpha === 0) {
      continue;
    }

    const red = pixels[index];
    const green = pixels[index + 1];
    const blue = pixels[index + 2];

    if (
      red < PDF_ROW_WHITE_THRESHOLD ||
      green < PDF_ROW_WHITE_THRESHOLD ||
      blue < PDF_ROW_WHITE_THRESHOLD
    ) {
      return false;
    }
  }

  return true;
}

function trimCanvasBottom(canvas: HTMLCanvasElement): HTMLCanvasElement {
  const context = canvas.getContext("2d");
  if (!context) {
    return canvas;
  }

  const { width, height } = canvas;
  const pixels = context.getImageData(0, 0, width, height).data;
  let lastContentRow = height - 1;

  while (lastContentRow > 0 && isCanvasRowBlank(pixels, width, lastContentRow)) {
    lastContentRow -= 1;
  }

  const trimmedHeight = Math.max(lastContentRow + 1, 1);
  if (trimmedHeight >= height) {
    return canvas;
  }

  const trimmedCanvas = document.createElement("canvas");
  trimmedCanvas.width = width;
  trimmedCanvas.height = trimmedHeight;

  const trimmedContext = trimmedCanvas.getContext("2d");
  if (!trimmedContext) {
    return canvas;
  }

  trimmedContext.fillStyle = "#ffffff";
  trimmedContext.fillRect(0, 0, width, trimmedHeight);
  trimmedContext.drawImage(
    canvas,
    0,
    0,
    width,
    trimmedHeight,
    0,
    0,
    width,
    trimmedHeight,
  );

  return trimmedCanvas;
}

function findSafeSliceHeight(
  canvas: HTMLCanvasElement,
  sourceY: number,
  targetHeight: number,
  minHeight: number,
): number {
  const context = canvas.getContext("2d");
  if (!context) {
    return targetHeight;
  }

  const maxHeight = Math.min(targetHeight, canvas.height - sourceY);
  if (maxHeight <= minHeight) {
    return maxHeight;
  }

  const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
  const idealEnd = sourceY + maxHeight;
  const searchStart = Math.max(sourceY + minHeight, idealEnd - PDF_BREAK_SEARCH_PX);
  const searchEnd = Math.min(canvas.height - 1, idealEnd + PDF_BREAK_SEARCH_PX);

  for (let row = Math.min(searchEnd, canvas.height - 1); row >= searchStart; row -= 1) {
    if (isCanvasRowBlank(pixels, canvas.width, row)) {
      return Math.max(row - sourceY, minHeight);
    }
  }

  return maxHeight;
}

// Summary row
// ─────────────────────────────────────────────────────────────
function SRow({
  label, value, color, bold, large, borderTop,
}: {
  label: string; value: string;
  color?: string; bold?: boolean; large?: boolean; borderTop?: boolean;
}) {
  return (
    <Box sx={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      py: large ? 0.75 : 0.5,
      borderTop: borderTop ? "1.5px solid #E5E7EB" : "none",
      mt: borderTop ? 0.5 : 0,
    }}>
      <Typography sx={{
        fontSize: large ? 15 : 13,
        fontWeight: large ? 800 : bold ? 700 : 500,
        color: color ?? (large ? "#0F172A" : "#475569"),
      }}>
        {label}
      </Typography>
      <Typography sx={{
        fontSize: large ? 18 : 13,
        fontWeight: large ? 900 : bold ? 700 : 600,
        color: color ?? (large ? "#D0021B" : "#0F172A"),
        letterSpacing: large ? "-0.5px" : "normal",
      }}>
        {value}
      </Typography>
    </Box>
  );
}

// ─────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────
interface Props {
  open?: boolean;
  saleId: string;
  onClose: () => void;
}

function getPosEditUrl(saleId: string | undefined, saleType: string | null | undefined): string {
  const params = new URLSearchParams();

  if (saleId) {
    params.set("saleId", saleId);
  }
  if (saleType) {
    params.set("saleType", saleType);
  }

  return `/pos?${params.toString()}`;
}

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────
export default function InvoiceDetailsModal({
  open = true, saleId, onClose,
}: Props) {
  const navigate = useNavigate();
  const pdfRef   = useRef<HTMLDivElement | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: salesQueryKeys.detail(saleId),
    queryFn:  () => fetchSaleDetail(saleId),
    enabled:  !!saleId,
  });

  const sale = data?.sale;
  const customer = data?.customer ?? null;
  const items: SaleItem[] = data?.items ?? [];
  const history = data?.payment_history ?? [];
  const returnHistory: SaleReturnHistoryRow[] = data?.return_history ?? [];

  // ── HSN breakdown ─────────────────────────────────────────
  const hsnMap: Record<string, {
    taxable: number; cgst: number; sgst: number;
    cgstPct: number; sgstPct: number;
  }> = {};

  items.forEach((item: any) => {
    const hsn   = item.hsn_code ?? "—";
    const qty   = Number(item.quantity)       || 0;
    const price = Number(item.price)          || 0;
    const cgst  = Number(item.cgst)           || 0;
    const sgst  = Number(item.sgst)           || 0;
    const gst   = Number(item.gst_percentage) || 0;
    if (!hsnMap[hsn]) {
      hsnMap[hsn] = { taxable: 0, cgst: 0, sgst: 0, cgstPct: gst / 2, sgstPct: gst / 2 };
    }
    hsnMap[hsn].taxable += qty * price;
    hsnMap[hsn].cgst    += cgst;
    hsnMap[hsn].sgst    += sgst;
  });

  const hsnRows   = Object.entries(hsnMap);
  const hsnTotals = hsnRows.reduce(
    (acc, [, v]) => ({
      taxable: acc.taxable + v.taxable,
      cgst:    acc.cgst    + v.cgst,
      sgst:    acc.sgst    + v.sgst,
    }),
    { taxable: 0, cgst: 0, sgst: 0 }
  );
  const gstRateMap: Record<string, {
    taxable: number; cgstRate: number; cgstAmount: number;
    sgstRate: number; sgstAmount: number; totalTaxAmount: number;
  }> = {};

  items.forEach((item: any) => {
    const gstPct = Number(item.gst_percentage) || 0;
    const rateKey = gstPct.toFixed(2);
    const qty = Number(item.quantity) || 0;
    const price = Number(item.price) || 0;
    const taxable = qty * price;
    const cgstAmount = Number(item.cgst) || 0;
    const sgstAmount = Number(item.sgst) || 0;

    if (!gstRateMap[rateKey]) {
      gstRateMap[rateKey] = {
        taxable: 0,
        cgstRate: gstPct / 2,
        cgstAmount: 0,
        sgstRate: gstPct / 2,
        sgstAmount: 0,
        totalTaxAmount: 0,
      };
    }

    gstRateMap[rateKey].taxable += taxable;
    gstRateMap[rateKey].cgstAmount += cgstAmount;
    gstRateMap[rateKey].sgstAmount += sgstAmount;
    gstRateMap[rateKey].totalTaxAmount += cgstAmount + sgstAmount;
  });

  const gstBreakdown = Object.entries(gstRateMap)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([, value]) => ({
      taxable: value.taxable.toFixed(2),
      cgstRate: value.cgstRate.toFixed(2),
      cgstAmount: value.cgstAmount.toFixed(2),
      sgstRate: value.sgstRate.toFixed(2),
      sgstAmount: value.sgstAmount.toFixed(2),
      totalTaxAmount: value.totalTaxAmount.toFixed(2),
    }));

  // ── Derived values ────────────────────────────────────────
  const hasDiscount = sale && Number(sale.discount_amount) > 0;
  const hasRoundOff = sale && sale.round_off !== null &&
                      sale.round_off !== undefined &&
                      Number(sale.round_off) !== 0;

  const discountLabel = sale?.discount_type === "percentage"
    ? `Discount (${Number(sale.discount_value)}%)`
    : "Discount";

  const totalReturned  = returnHistory.reduce((s: number, r: any) => s + Number(r.return_amount), 0);
  const originalTotal  = Number(sale?.total_amount ?? 0);
  const adjustedTotal  = originalTotal - totalReturned;
  const paidAmount     = Number(sale?.paid_amount ?? 0);
  const adjustedBalance = Math.max(0, adjustedTotal - paidAmount);

  const customerName    = customer?.cust_name ?? customer?.cpy_name ?? "Walk-In";
  const customerMobile  = customer?.mobile ? `+91 ${customer.mobile}` : "—";
  const customerGstin   = customer?.gst ?? "—";
  const customerAddress = [
    customer?.address_line1, customer?.address_line2,
    customer?.city, customer?.state, customer?.pincode,
  ].filter(Boolean).join(", ") || "—";

  // ── PDF generation ────────────────────────────────────────
  const generatePDF = async (): Promise<jsPDF | null> => {
    if (!pdfRef.current) return null;

    const headerEl = pdfRef.current.querySelector("[data-pdf-header]") as HTMLElement | null;
    const headerDividerEl = pdfRef.current.querySelector("[data-pdf-header-divider]") as HTMLElement | null;

    const capturedCanvas = await html2canvas(pdfRef.current, {
      scale: PDF_CAPTURE_SCALE,
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false,
    });
    const canvas = trimCanvasBottom(capturedCanvas);

    let headerCanvas: HTMLCanvasElement | null = null;
    let headerImgData: string | null = null;
    let headerHeightPx = 0;

    if (headerEl) {
      const headerRect = headerEl.getBoundingClientRect();
      const dividerRect = headerDividerEl?.getBoundingClientRect();
      const dividerBottom = dividerRect ? dividerRect.bottom : headerRect.bottom;
      headerHeightPx = Math.max(1, Math.round((dividerBottom - headerRect.top) * PDF_CAPTURE_SCALE));

      headerCanvas = document.createElement("canvas");
      headerCanvas.width = canvas.width;
      headerCanvas.height = headerHeightPx;

      const headerContext = headerCanvas.getContext("2d");
      if (!headerContext) return null;

      headerContext.fillStyle = "#ffffff";
      headerContext.fillRect(0, 0, headerCanvas.width, headerCanvas.height);
      headerContext.drawImage(
        canvas,
        0,
        0,
        canvas.width,
        headerHeightPx,
        0,
        0,
        headerCanvas.width,
        headerCanvas.height,
      );

      headerImgData = headerCanvas.toDataURL("image/jpeg", PDF_IMAGE_QUALITY);
    }

    const pdf = new jsPDF({
      orientation: "p",
      unit: "mm",
      format: "a4",
      compress: true,
    });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const pageBottomGapPx = Math.max(0, Math.round((PDF_PAGE_BOTTOM_GAP_MM * canvas.width) / pageWidth));
    const renderedPageHeightPx = Math.max(
      1,
      Math.floor((canvas.width * pageHeight) / pageWidth) - pageBottomGapPx,
    );
    const headerHeightMm = headerCanvas ? (headerCanvas.height * pageWidth) / headerCanvas.width : 0;
    const headerGapPx = headerCanvas
      ? Math.max(0, Math.round((PDF_HEADER_GAP_MM * canvas.width) / pageWidth))
      : 0;
    const laterPageContentHeightPx = headerCanvas
      ? Math.max(1, renderedPageHeightPx - headerHeightPx - headerGapPx)
      : renderedPageHeightPx;

    for (let sourceY = 0, pageIndex = 0; sourceY < canvas.height; pageIndex += 1) {
      const isFirstPage = pageIndex === 0;
      const targetSliceHeight = isFirstPage ? renderedPageHeightPx : laterPageContentHeightPx;
      const sliceHeight = findSafeSliceHeight(
        canvas,
        sourceY,
        targetSliceHeight,
        Math.min(PDF_MIN_SLICE_HEIGHT_PX, targetSliceHeight),
      );

      if (sliceHeight <= 0) {
        break;
      }

      const remainingHeight = canvas.height - sourceY;
      if (pageIndex > 0 && remainingHeight <= PDF_MIN_SLICE_HEIGHT_PX) {
        break;
      }

      const pageCanvas = document.createElement("canvas");
      pageCanvas.width = canvas.width;
      pageCanvas.height = sliceHeight;

      const pageContext = pageCanvas.getContext("2d");
      if (!pageContext) return null;

      pageContext.fillStyle = "#ffffff";
      pageContext.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
      pageContext.drawImage(
        canvas,
        0,
        sourceY,
        canvas.width,
        sliceHeight,
        0,
        0,
        pageCanvas.width,
        pageCanvas.height,
      );

      const trimmedPageCanvas = trimCanvasBottom(pageCanvas);
      if (trimmedPageCanvas.height <= 1 && pageIndex > 0) {
        break;
      }

      const imgData = trimmedPageCanvas.toDataURL("image/jpeg", PDF_IMAGE_QUALITY);
      const sliceHeightMm = (trimmedPageCanvas.height * pageWidth) / trimmedPageCanvas.width;

      if (pageIndex > 0) {
        pdf.addPage();
      }

      if (!isFirstPage && headerCanvas && headerImgData) {
        pdf.addImage(headerImgData, "JPEG", 0, 0, pageWidth, headerHeightMm, undefined, "MEDIUM");
      }

      pdf.addImage(
        imgData,
        "JPEG",
        0,
        isFirstPage ? 0 : headerHeightMm + PDF_HEADER_GAP_MM,
        pageWidth,
        sliceHeightMm,
        undefined,
        "MEDIUM",
      );

      sourceY += sliceHeight;
    }

    return pdf;
  };

  // ── Share handler ─────────────────────────────────────────
  const handleShare = async () => {
    const pdf = await generatePDF();
    if (!pdf) return;

    const fileName = `Invoice_${sale?.sale_id ?? "invoice"}.pdf`;
    const blob     = pdf.output("blob");
    const file     = new File([blob], fileName, { type: "application/pdf" });

    // Web Share API with file support (mobile / modern browsers)
    if (
      navigator.canShare &&
      navigator.canShare({ files: [file] })
    ) {
      try {
        await navigator.share({
          files: [file],
          title: `Invoice ${sale?.sale_id}`,
          text:  `Invoice from ${sale?.sale_id}`,
        });
        return;
      } catch (err: any) {
        // user cancelled — not an error
        if (err?.name === "AbortError") return;
      }
    }

    // Fallback: open in new tab so browser download/share menu appears
    const url = URL.createObjectURL(blob);
    const a   = document.createElement("a");
    a.href    = url;
    a.target  = "_blank";
    a.rel     = "noopener noreferrer";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
  };

  // ── Download handler ──────────────────────────────────────
  const handleDownload = async () => {
    const pdf = await generatePDF();
    pdf?.save(`Invoice_${sale?.sale_id ?? "invoice"}.pdf`);
  };

  // ── Print handler ─────────────────────────────────────────
  const handlePrint = async () => {
    const pdf = await generatePDF();
    if (!pdf) return;
    const url = pdf.output("bloburl");
    const win = window.open(url as unknown as string, "_blank");
    win?.addEventListener("load", () => win.print());
  };

  // ── PDF data ──────────────────────────────────────────────
  const pdfData = {
    sale_id:           sale?.sale_id,
    date:              sale?.sale_date_fmt,
    due_date:          null,
    customer_name:     customerName,
    customer_address:  customerAddress,
    customer_mobile:   customerMobile,
    customer_gstin:    customerGstin,
    payment_mode:      history?.[0]?.transaction_type ?? "Cash",
    payment_status:    sale?.payment_status,
    items: items.map((i: any) => ({
      item_id:   i.item_id,
      name:     i.item_name,
      category: i.variant_name ?? "",
      hsn:      i.hsn_code ?? "—",
      qty:      i.quantity,
      mrp:      i.mrp ?? i.price,
      rate:     i.price,
      tax:      i.gst_percentage,
      total:    i.total_amount,
    })),
    subtotal:       sale?.subtotal,
    discount:       hasDiscount ? sale?.discount_amount : null,
    discount_label: discountLabel,
    cgst:           hsnTotals.cgst,
    sgst:           hsnTotals.sgst,
    cgst_pct:       hsnRows[0]?.[1]?.cgstPct ?? 2.5,
    sgst_pct:       hsnRows[0]?.[1]?.sgstPct ?? 2.5,
    round_off:      hasRoundOff ? sale?.round_off : null,
    total:          originalTotal,
    amount_in_words: `${toWords(Math.round(originalTotal))} Rupees Only`,
    gst_breakdown: gstBreakdown,
    company: {
      name: "Zodu Retail Co.",
      gstin: "29AAAAA0000A1Z5",
      line1: "123 Business Park, MG Road",
      line2: "Bangalore, Karnataka - 560001",
      phone: "+91 80 4567 8900",
      bankName: "Union Bank of India",
      accountNumber: "510101000817928",
      branchIfsc: "Vellore Branch & UBIN090011",
      declaration: "We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.",
    },
  };

  // ─────────────────────────────────────────────────────────
  return (
    <StyledDialog open={open} onClose={onClose} maxWidth="lg" fullWidth>

      {/* ── Sticky header ─────────────────────────────────── */}
      <Box sx={{
        display: "flex", alignItems: "center",
        justifyContent: "space-between",
        px: 3.5, py: 1.75,
        borderBottom: "1px solid #E2E8F0",
        position: "sticky", top: 0, bgcolor: "#fff", zIndex: 10,
      }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
          <Typography sx={{ fontSize: 18, fontWeight: 800, color: "#0F172A" }}>
            Invoice Details
          </Typography>
          <Chip
            label={sale?.sale_id ?? "—"} size="small"
            sx={{ bgcolor: "rgba(208,2,27,0.08)", color: "#D0021B", fontWeight: 700, fontSize: 11, height: 20, borderRadius: "999px" }}
          />
          {sale && (
            <Typography sx={{ fontSize: 12, color: "#94A3B8" }}>
              {sale.sale_date_fmt}{sale.sale_time_fmt ? ` · ${sale.sale_time_fmt}` : ""}
            </Typography>
          )}
          {returnHistory.length > 0 && (
            <Chip
              icon={<AssignmentReturnIcon sx={{ fontSize: "12px !important" }} />}
              label={`${returnHistory.length} return${returnHistory.length > 1 ? "s" : ""} · ${INR(totalReturned)}`}
              size="small"
              sx={{ bgcolor: "#F3E8FF", color: "#6B21A8", fontWeight: 700, fontSize: 11, height: 20, borderRadius: "999px" }}
            />
          )}
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Tooltip title="Edit in POS">
            <IconButton size="small" onClick={() => navigate(getPosEditUrl(sale?.sale_id, sale?.sale_type))}
              sx={{ color: "#2563EB", bgcolor: "#EFF6FF", "&:hover": { bgcolor: "#DBEAFE" }, borderRadius: "50%", width: 32, height: 32 }}>
              <EditIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
          <IconButton size="small" onClick={onClose}
            sx={{ color: "#64748B", "&:hover": { color: "#0F172A" }, width: 32, height: 32 }}>
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
      </Box>

      {/* ── Body ──────────────────────────────────────────── */}
      <DialogContent sx={{ p: "20px 24px", bgcolor: "#fff", overflowX: "hidden" }}>
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 12 }}>
            <CircularProgress size={32} sx={{ color: "#D0021B" }} />
          </Box>
        ) : !sale ? (
          <Typography sx={{ textAlign: "center", py: 8, color: "#94A3B8", fontSize: 14 }}>
            Sale not found.
          </Typography>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>

            {/* 1 ── Customer details ────────────────────────── */}
            <InfoCard elevation={0}>
              <Box sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" },
                gap: 2,
              }}>
                {[
                  { label: "Customer Name", value: customerName, bold: true },
                  { label: "Mobile No.",    value: customerMobile },
                  { label: "GSTIN",         value: customerGstin },
                  { label: "Address",       value: customerAddress, small: true },
                ].map(({ label, value, bold, small }) => (
                  <Box key={label}>
                    <Typography sx={{
                      fontSize: 9, fontWeight: 700, textTransform: "uppercase",
                      letterSpacing: "0.09em", color: "#94A3B8", mb: 0.5,
                    }}>
                      {label}
                    </Typography>
                    <Typography sx={{
                      fontSize: small ? 12 : 13,
                      fontWeight: bold ? 700 : 600,
                      color: "#0F172A",
                      lineHeight: 1.5,
                      wordBreak: "break-word",
                    }}>
                      {value}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </InfoCard>

            {/* 2 ── Items list ──────────────────────────────── */}
            <Box>
              <SectionTitle>Items List</SectionTitle>
              <TableContainer component={Paper} elevation={0}
                sx={{ border: "1px solid #E2E8F0", borderRadius: "12px", overflow: "hidden" }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TH >Item Id</TH>
                      <TH>Item Name</TH>
                      <TH align="center">HSN</TH>
                      <TH align="right">Price</TH>
                      <TH align="center">Qty</TH>
                      {/* <TH align="center">Returned</TH> */}
                      <TH align="center">GST%</TH>
                      <TH align="right">Total</TH>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {items.map((item: any, idx: number) => {
                      const isLast    = idx === items.length - 1;
                      const returned  = Number(item.returned_qty ?? 0);
                      return (
                        <TableRow key={item.id} sx={{ "&:hover": { bgcolor: "#FAFBFC" } }}>
                          <TD sx={{ borderBottom: isLast ? "none" : undefined, color: "#64748B" }}>
                            {item.item_id}
                          </TD>
                          <TD sx={{ borderBottom: isLast ? "none" : undefined }}>
                            <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#0F172A" }}>
                              {item.item_name}
                            </Typography>
                            {item.variant_name && (
                              <Typography sx={{ fontSize: 11, color: "#94A3B8", mt: 0.2 }}>
                                {item.variant_name}
                              </Typography>
                            )}
                          </TD>
                          <TD align="center" sx={{ borderBottom: isLast ? "none" : undefined, color: "#64748B" }}>
                            {item.hsn_code ?? "—"}
                          </TD>
                          <TD align="right" sx={{ borderBottom: isLast ? "none" : undefined, fontWeight: 600 }}>
                            {INR(item.price)}
                          </TD>
                          <TD align="center" sx={{ borderBottom: isLast ? "none" : undefined }}>
                            {String(Number(item.quantity))} {item.unit}
                          </TD>
                          {/* <TD align="center" sx={{ borderBottom: isLast ? "none" : undefined }}>
                            {returned > 0 ? (
                              <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#7C3AED" }}>
                                {returned}
                              </Typography>
                            ) : (
                              <Typography sx={{ fontSize: 12, color: "#CBD5E1" }}>—</Typography>
                            )}
                          </TD> */}
                          <TD align="center" sx={{ borderBottom: isLast ? "none" : undefined }}>
                            {Number(item.gst_percentage)}%
                          </TD>
                          <TD align="right" sx={{ borderBottom: isLast ? "none" : undefined, fontWeight: 700 }}>
                            {INR(item.total_amount)}
                          </TD>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>

            {/* 3 ── Financial summary ───────────────────────── */}
            <Box sx={{
              border: "1px solid #E2E8F0", borderRadius: 2,
              p: "16px 20px", bgcolor: "#fff",
            }}>
              <Box sx={{ maxWidth: 380, ml: "auto" }}>

                <SRow label="Subtotal" value={INR(sale.subtotal)} />

                {hasDiscount && (
                  <SRow
                    label={discountLabel}
                    value={`− ${INR(sale.discount_amount)}`}
                    color="#DC2626"
                  />
                )}

                <Divider sx={{ my: 1, borderColor: "#E2E8F0" }} />

                <SRow label="CGST Total" value={INR(hsnTotals.cgst)} />
                <SRow label="SGST Total" value={INR(hsnTotals.sgst)} />

                {hasRoundOff && (
                  <SRow
                    label="Round Off"
                    value={Number(sale.round_off) > 0
                      ? `+ ${INR(sale.round_off)}`
                      : INR(sale.round_off)
                    }
                    color={Number(sale.round_off) > 0 ? "#16A34A" : "#DC2626"}
                  />
                )}

                {/* Return deduction — only if returns exist */}
                {totalReturned > 0 && (
                  <>
                    <Divider sx={{ my: 1, borderColor: "#E2E8F0" }} />
                    <SRow label="Invoice Total" value={INR(originalTotal)} />
                    <SRow
                      label="Total Returned"
                      value={`− ${INR(totalReturned)}`}
                      color="#7C3AED"
                      bold
                    />
                  </>
                )}

                <SRow
                  label="Grand Total"
                  value={INR(totalReturned > 0 ? adjustedTotal : originalTotal)}
                  color={"#000000"}
                  borderTop
                  large
                />

                {paidAmount > 0 && (
                  <SRow
                    label="Paid Amount"
                    value={INR(paidAmount)}
                    color="#16A34A"
                  />
                )}

                {adjustedBalance > 0 && (
                  <SRow
                    label="Balance Due"
                    value={INR(adjustedBalance)}
                    color="#D97706"
                    bold
                  />
                )}
              </Box>
            </Box>

            {/* 4 ── Payment history ─────────────────────────── */}
            {history.length > 0 && (
              <Box>
                <SectionTitle>Payment History</SectionTitle>
                <TableContainer component={Paper} elevation={0}
                  sx={{ border: "1px solid #E2E8F0", borderRadius: "12px", overflow: "hidden" }}>
                  <Table size="small">
                    <TableHead>
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
                          <TableRow key={h.payment_row_id ?? idx}
                            sx={{ "&:hover": { bgcolor: "#FAFBFC" } }}>
                            <TD sx={{ borderBottom: isLast ? "none" : undefined, color: "#334155" }}>
                              {h.created_at_fmt ?? h.payment_date_fmt ?? "—"}
                            </TD>
                            <TD sx={{ borderBottom: isLast ? "none" : undefined }}>
                              <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1 }}>
                                <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: dot, flexShrink: 0 }} />
                                <Typography sx={{ fontSize: 13, color: "#0F172A" }}>
                                  {h.transaction_type ?? "—"}
                                </Typography>
                              </Box>
                            </TD>
                            <TD sx={{ borderBottom: isLast ? "none" : undefined, fontFamily: "monospace", color: "#64748B", fontSize: 11 }}>
                              {h.transaction_id ?? "—"}
                            </TD>
                            <TD align="right" sx={{ borderBottom: isLast ? "none" : undefined, fontWeight: 700 }}>
                              {INR(h.paid_amount)}
                            </TD>
                            <TD align="center" sx={{ borderBottom: isLast ? "none" : undefined }}>
                              <Chip
                                label={h.status?.toUpperCase()} size="small"
                                sx={{
                                  fontSize: 9, fontWeight: 700, borderRadius: "999px",
                                  bgcolor: h.status === "paid"    ? "#DCFCE7"
                                         : h.status === "partial" ? "#FEF3C7" : "#F1F5F9",
                                  color:   h.status === "paid"    ? "#16A34A"
                                         : h.status === "partial" ? "#D97706" : "#64748B",
                                  height: 20,
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

            {/* 5 ── Return history ──────────────────────────── */}
            {returnHistory.length > 0 && (
              <Box>
                <SectionTitle sx={{ color: "#D0021B !important" }}>
                  Sales Returns
                </SectionTitle>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mb: 1.5 }}>
                  {returnHistory.map((r) => {
                    const returnItems = getReturnLineItems(r, items, returnHistory.length);

                    return (
                      <Paper
                        key={`return-card-${r.return_uuid}`}
                        elevation={0}
                        sx={{
                          border: "1px solid #FECACA",
                          borderRadius: 1,
                          overflow: "hidden",
                          bgcolor: "#FFFFFF",
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: { xs: "flex-start", sm: "center" },
                            justifyContent: "space-between",
                            flexDirection: { xs: "column", sm: "row" },
                            gap: 1,
                            px: 2,
                            py: 1.4,
                            borderBottom: "1px solid #FEE2E2",
                            bgcolor: "#FFF7F7",
                          }}
                        >
                          <Box>
                            <Typography
                              sx={{
                                fontSize: 13,
                                fontWeight: 800,
                                color: "#D0021B",
                                letterSpacing: "0.04em",
                                textTransform: "uppercase",
                              }}
                            >
                              {r.return_id}
                            </Typography>
                            <Typography sx={{ fontSize: 12, color: "#64748B", mt: 0.35 }}>
                              {r.return_date_fmt ?? "—"}
                              {r.return_time_fmt ? `, ${r.return_time_fmt}` : ""}
                            </Typography>
                          </Box>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                            {r.refund_type ? (
                              <Chip
                                label={r.refund_type.replace("_", " ").toUpperCase()}
                                size="small"
                                sx={{
                                  fontSize: 9,
                                  fontWeight: 700,
                                  borderRadius: "999px",
                                  bgcolor: "#FEE2E2",
                                  color: "#B91C1C",
                                  height: 20,
                                }}
                              />
                            ) : null}
                            <Typography sx={{ fontSize: 15, fontWeight: 800, color: "#D0021B" }}>
                              {INR(r.return_amount)}
                            </Typography>
                          </Box>
                        </Box>

                        <TableContainer>
                          <Table size="small">
                            <TableHead>
                              <TableRow sx={{ bgcolor: "#FFF1F2" }}>
                                <TH sx={{ bgcolor: "#FFF1F2", color: "#EF4444" }}>Item Name</TH>
                                <TH sx={{ bgcolor: "#FFF1F2", color: "#EF4444" }}>Reason</TH>
                                <TH align="center" sx={{ bgcolor: "#FFF1F2", color: "#EF4444" }}>Qty Ret.</TH>
                                <TH align="right" sx={{ bgcolor: "#FFF1F2", color: "#EF4444" }}>Rate</TH>
                                <TH align="right" sx={{ bgcolor: "#FFF1F2", color: "#EF4444" }}>Refund</TH>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {returnItems.length > 0 ? (
                                returnItems.map((item, index) => {
                                  const isLast = index === returnItems.length - 1;
                                  const qty = getReturnQuantity(item);
                                  const rate = getReturnRate(item);
                                  const refund = getReturnRefund(item);

                                  return (
                                    <TableRow key={item.return_item_uuid ?? item.item_uuid ?? `${r.return_uuid}-${index}`}>
                                      <TD sx={{ borderBottom: isLast ? "none" : undefined }}>
                                        <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#0F172A" }}>
                                          {item.item_name ?? "—"}
                                        </Typography>
                                        {item.variant_name ? (
                                          <Typography sx={{ fontSize: 11, color: "#94A3B8", mt: 0.2 }}>
                                            {item.variant_name}
                                          </Typography>
                                        ) : null}
                                      </TD>
                                      <TD
                                        sx={{
                                          borderBottom: isLast ? "none" : undefined,
                                          color: "#64748B",
                                          fontStyle: "italic",
                                        }}
                                      >
                                        {getReturnReason(item, r.return_reason)}
                                      </TD>
                                      <TD align="center" sx={{ borderBottom: isLast ? "none" : undefined, fontWeight: 700 }}>
                                        {String(qty || 0).padStart(2, "0")}
                                      </TD>
                                      <TD align="right" sx={{ borderBottom: isLast ? "none" : undefined, fontWeight: 600 }}>
                                        {INR(rate)}
                                      </TD>
                                      <TD align="right" sx={{ borderBottom: isLast ? "none" : undefined, fontWeight: 800, color: "#D0021B" }}>
                                        {INR(refund)}
                                      </TD>
                                    </TableRow>
                                  );
                                })
                              ) : (
                                <TableRow>
                                  <TD colSpan={5} sx={{ borderBottom: "none", color: "#64748B" }}>
                                    Item-level return details are not available for this return.
                                  </TD>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        </TableContainer>

                        {/* <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: { xs: "flex-start", sm: "center" },
                            flexDirection: { xs: "column", sm: "row" },
                            gap: 1,
                            px: 2,
                            py: 1.2,
                            borderTop: "1px solid #FEE2E2",
                            bgcolor: "#FFF7F7",
                          }}
                        >
                          <Typography sx={{ fontSize: 12, color: "#64748B" }}>
                            {r.notes?.trim() ? `Notes: ${r.notes}` : `Items Returned: ${r.total_items}`}
                          </Typography>
                          <Typography sx={{ fontSize: 12, color: "#64748B" }}>
                            Refund Mode: {r.refund_type?.replace("_", " ") ?? "—"}
                          </Typography>
                        </Box> */}
                      </Paper>
                    );
                  })}
                </Box>
                <TableContainer component={Paper} elevation={0}
                  sx={{ display: "none", border: "1px solid #EDE9FE", borderRadius: "12px", overflow: "hidden" }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: "#FAF5FF" }}>
                        <TH sx={{ bgcolor: "#FAF5FF" }}>Return ID</TH>
                        <TH sx={{ bgcolor: "#FAF5FF" }}>Date</TH>
                        <TH sx={{ bgcolor: "#FAF5FF" }}>Reason</TH>
                        <TH sx={{ bgcolor: "#FAF5FF" }}>Refund Type</TH>
                        <TH align="center" sx={{ bgcolor: "#FAF5FF" }}>Items</TH>
                        <TH align="right" sx={{ bgcolor: "#FAF5FF" }}>Return Amount</TH>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {returnHistory.map((r: any, idx: number) => {
                        const isLast = idx === returnHistory.length - 1;
                        return (
                          <TableRow key={r.return_uuid}
                            sx={{ "&:hover": { bgcolor: "#FAF5FF" } }}>
                            <TD sx={{ borderBottom: isLast ? "none" : undefined, fontWeight: 700, color: "#7C3AED" }}>
                              {r.return_id}
                            </TD>
                            <TD sx={{ borderBottom: isLast ? "none" : undefined, color: "#334155" }}>
                              {r.return_date_fmt}
                              {r.return_time_fmt && (
                                <Typography sx={{ fontSize: 11, color: "#94A3B8" }}>{r.return_time_fmt}</Typography>
                              )}
                            </TD>
                            <TD sx={{ borderBottom: isLast ? "none" : undefined, color: "#475569" }}>
                              {r.return_reason ?? "—"}
                            </TD>
                            <TD sx={{ borderBottom: isLast ? "none" : undefined }}>
                              {r.refund_type ? (
                                <Chip
                                  label={r.refund_type.replace("_", " ").toUpperCase()}
                                  size="small"
                                  sx={{
                                    fontSize: 9, fontWeight: 700, borderRadius: "999px",
                                    bgcolor: "#EDE9FE", color: "#6D28D9", height: 20,
                                  }}
                                />
                              ) : "—"}
                            </TD>
                            <TD align="center" sx={{ borderBottom: isLast ? "none" : undefined }}>
                              {r.total_items}
                            </TD>
                            <TD align="right" sx={{ borderBottom: isLast ? "none" : undefined, fontWeight: 700, color: "#7C3AED" }}>
                              {INR(r.return_amount)}
                            </TD>
                          </TableRow>
                        );
                      })}
                      {/* Totals row */}
                      <TableRow sx={{ bgcolor: "#FAF5FF" }}>
                        <TableCell colSpan={5}
                          sx={{ fontWeight: 700, fontSize: 13, color: "#6D28D9", borderBottom: "none", p: "10px 14px" }}>
                          Total Returned
                        </TableCell>
                        <TableCell align="right"
                          sx={{ fontWeight: 900, fontSize: 15, color: "#7C3AED", borderBottom: "none", p: "10px 14px" }}>
                          {INR(totalReturned)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}

            {/* 6 ── HSN-wise tax breakdown ───────────────────── */}
            <Box>
              <SectionTitle>HSN-wise Tax Breakdown</SectionTitle>
            </Box>
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
                      <TD align="right">{INR(hsnTotals.cgst + hsnTotals.sgst)}</TD>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            
          </Box>
        )}
      </DialogContent>

      {/* Hidden PDF render target */}
      <div style={{ position: "absolute", left: "-9999px", top: 0, zIndex: -1 }}>
        <InvoicePDFTemplate ref={pdfRef} data={pdfData} />
      </div>

      {/* ── Footer actions ─────────────────────────────────── */}
      <DialogActions sx={{
        px: 3.5, py: 2,
        bgcolor: "#F8FAFC",
        borderTop: "1px solid #E2E8F0",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 1.5,
      }}>
        <Button onClick={onClose} sx={{
          fontWeight: 700, fontSize: 13,
          color: "#64748B", textTransform: "none",
          "&:hover": { color: "#0F172A", bgcolor: "transparent" },
        }}>
          Close
        </Button>

        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>

          {/* Share */}
          <Tooltip title="Share invoice">
            <IconButton
              onClick={handleShare}
              sx={{
                border: "1px solid #E2E8F0",
                borderRadius: "10px",
                p: 1,
                color: "#475569",
                bgcolor: "#fff",
                "&:hover": { bgcolor: "#F1F5F9", borderColor: "#CBD5E1" },
              }}
            >
              <ShareIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>

          {/* Download */}
          <Button
            startIcon={<DownloadIcon sx={{ fontSize: 17 }} />}
            onClick={handleDownload}
            sx={{
              bgcolor: "#F1F5F9",
              color: "#0F172A",
              fontWeight: 700,
              fontSize: 13,
              px: 2.5,
              py: 1,
              borderRadius: "10px",
              textTransform: "none",
              "&:hover": { bgcolor: "#E2E8F0" },
            }}
          >
            Download
          </Button>

          {/* Print */}
          <Button
            startIcon={<PrintIcon sx={{ fontSize: 17 }} />}
            onClick={handlePrint}
            sx={{
              bgcolor: "#D0021B",
              color: "#fff",
              fontWeight: 700,
              fontSize: 13,
              px: 3,
              py: 1,
              borderRadius: "10px",
              textTransform: "none",
              boxShadow: "0 8px 20px -4px rgba(208,2,27,0.3)",
              "&:hover": { bgcolor: "#B00218", boxShadow: "0 8px 20px -4px rgba(208,2,27,0.45)" },
            }}
          >
            Print Invoice
          </Button>

        </Box>
      </DialogActions>
    </StyledDialog>
  );
}
