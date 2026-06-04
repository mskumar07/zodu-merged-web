import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Typography, TextField, Button, IconButton,
  Select, MenuItem, FormControl, InputAdornment, ListSubheader,
  Table, TableHead, TableBody, TableRow, TableCell,
  Paper, Tooltip, Checkbox, Chip, CircularProgress,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import ShoppingCartCheckoutIcon from "@mui/icons-material/ShoppingCartCheckout";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import SearchIcon from "@mui/icons-material/Search";
import CheckBoxOutlinedIcon from "@mui/icons-material/CheckBoxOutlined";
import InventoryOutlinedIcon from "@mui/icons-material/InventoryOutlined";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import TableChartOutlinedIcon from "@mui/icons-material/TableChartOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { useInfiniteMenuItems, type MenuItem as ApiMenuItem } from "../MenuItemScreen/useMenuItemApi";
import {
  useCreatePurchase,
  useUpdatePurchase,
  usePurchaseById,
  useVendors,
  type PurchasePayload,
  type PurchaseItemPayload,
  type PurchaseDetail,
  type Vendor,
  getZoduId,
  getBranchId,
} from "./usePuchaseapi";
import AddVendorModal from "@pages/Vendor/AddVendorDialog";
import axios from "axios";
import SuccessToast from "@components/Common/SuccessToast";
import { getTenantContext, getAccessToken } from "@store/tenantContext";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "https://api.myzodu.com";

function getApi() {
  const { businessType } = getTenantContext();
  const route = businessType === "Restaurant" ? "restaurant" : "retail";
  const token = getAccessToken();
  return axios.create({
    baseURL: `${API_BASE}/${route}/api`,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}

function getUploadUrl() {
  const { businessType } = getTenantContext();
  const route = businessType === "Restaurant" ? "restaurant" : "retail";
  return `${API_BASE}/${route}/upload/multiple`;
}

// ─── Theme ────────────────────────────────────────────────────
const theme = createTheme({
  palette: {
    primary: { main: "#D21F3C" },
    background: { default: "#f8f6f6", paper: "#ffffff" },
    text: { primary: "#0F172A", secondary: "#6B7280" },
  },
  components: {
    MuiButton: {
      styleOverrides: { root: { textTransform: "none", borderRadius: 8, fontWeight: 700 } },
    },
    MuiDialog: { styleOverrides: { paper: { borderRadius: 16 } } },
    MuiTableCell: {
      styleOverrides: {
        root: { borderBottom: "1px solid #F3F4F6", padding: "8px 12px", fontSize: 13 },
        head: {
          fontSize: 10, fontWeight: 700, letterSpacing: "0.07em",
          color: "#6B7280", textTransform: "uppercase" as const,
          backgroundColor: "#F9FAFB", borderBottom: "1px solid #E5E7EB",
          padding: "10px 12px",
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8, fontSize: 13,
          "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#D21F3C" },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#D21F3C", borderWidth: 2 },
        },
        notchedOutline: { borderColor: "#E2E8F0" },
      },
    },
  },
});

// ─── Catalogue ────────────────────────────────────────────────
export interface CatalogueItem {
  id: string;
  itemId: string;
  name: string; sku: string; category: string;
  categoryId?: number | null;
  unitPrice: number; unit: string; gstPct: number;
}

const menuItemToCatalogue = (item: ApiMenuItem): CatalogueItem => ({
  id: item.item_uuid ?? item.item_id,
  itemId: item.item_id,
  name: item.item_name,
  sku: item.sku || item.item_id,
  category: item.category_name || "Uncategorized",
  categoryId: item.category_id ?? null,
  unitPrice: Number(item.purchase_price) || Number(item.sell_price) || 0,
  unit: item.unit_short_name || "NOS",
  gstPct: Number(item.gst_rate) || 0,
});

// ─── File helpers ─────────────────────────────────────────────
interface AttachmentFile {
  id: string; file?: File; url?: string; name: string; size: number; type: string; previewUrl: string | null; uploading?: boolean;
}

function formatBytes(b: number) {
  if (b < 1024) return `${b} B`;
  if (b < 1048576) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1048576).toFixed(1)} MB`;
}
const XLSX_TYPES = ["application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "text/csv"];
const DOC_TYPES  = ["application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];

function getFileIcon(type: string = "", size = 18) {
  if (type.startsWith("image/"))  return <ImageOutlinedIcon sx={{ fontSize: size, color: "#3B82F6" }} />;
  if (type === "application/pdf") return <PictureAsPdfOutlinedIcon sx={{ fontSize: size, color: "#EF4444" }} />;
  if (XLSX_TYPES.includes(type))  return <TableChartOutlinedIcon sx={{ fontSize: size, color: "#16A34A" }} />;
  if (DOC_TYPES.includes(type))   return <DescriptionOutlinedIcon sx={{ fontSize: size, color: "#2563EB" }} />;
  return <ArticleOutlinedIcon sx={{ fontSize: size, color: "#6B7280" }} />;
}
function getFileChipStyle(type: string = "") {
  if (type.startsWith("image/"))  return { bg: "#EFF6FF", color: "#1D4ED8" };
  if (type === "application/pdf") return { bg: "#FEF2F2", color: "#B91C1C" };
  if (XLSX_TYPES.includes(type))  return { bg: "#F0FDF4", color: "#166534" };
  if (DOC_TYPES.includes(type))   return { bg: "#EFF6FF", color: "#1E40AF" };
  return { bg: "#F3F4F6", color: "#374151" };
}
function formatDateForInput(dateString: string) {
  const d = new Date(dateString);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
function getFileExt(name: string) { return name.split(".").pop()?.toUpperCase() ?? "FILE"; }

// ─── QtyCounter ───────────────────────────────────────────────
interface QtyCounterProps {
  value: number; onChange: (v: number) => void;
  disabled?: boolean; min?: number; size?: "compact" | "full";
}
function QtyCounter({ value, onChange, disabled = false, min = 0, size = "compact" }: QtyCounterProps) {
  const h = size === "compact" ? 28 : 32;
  const btnW = size === "compact" ? 26 : 28;
  const numW = size === "compact" ? 52 : 68;
  const fs = size === "compact" ? 12 : 13;
  const active = value > 0;
  const dec = (e: React.MouseEvent) => { e.stopPropagation(); if (value > min) onChange(value - 1); };
  const inc = (e: React.MouseEvent) => { e.stopPropagation(); onChange(value + 1); };
  const border = active ? "#FECDD3" : "#E2E8F0";
  const divider = active ? "#FECDD3" : "#E2E8F0";
  const bg = active ? "#FFF5F5" : "#F8FAFC";
  const btnColor = disabled ? "#CBD5E1" : "#D21F3C";
  const numColor = active ? "#0F172A" : "#94A3B8";
  return (
    <Box sx={{ display: "inline-flex", alignItems: "center", height: h, border: `1.5px solid ${border}`, borderRadius: "8px", overflow: "hidden", bgcolor: bg, transition: "border-color 0.15s, background 0.15s" }}>
      <Box component="button" onClick={dec} disabled={disabled || value <= min} sx={{ width: btnW, height: "100%", border: "none", borderRight: `1px solid ${divider}`, bgcolor: "transparent", cursor: disabled || value <= min ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: disabled || value <= min ? "#CBD5E1" : btnColor, transition: "background 0.1s", "&:hover:not(:disabled)": { bgcolor: "rgba(210,31,60,0.07)" }, "&:active:not(:disabled)": { bgcolor: "rgba(210,31,60,0.13)" }, p: 0, m: 0, flexShrink: 0 }}>
        <RemoveIcon sx={{ fontSize: fs + 1 }} />
      </Box>
      <Box component="input" type="number" step="any" value={value} disabled={disabled} onClick={e => e.stopPropagation()} onChange={e => { const raw = e.target.value; if (raw === "") return; const v = parseFloat(raw); if (!isNaN(v)) onChange(Math.max(min, v)); }} sx={{ width: numW, height: "100%", border: "none", outline: "none", textAlign: "center", fontSize: fs, fontWeight: 700, color: numColor, bgcolor: "transparent", fontFamily: "inherit", "&::-webkit-outer-spin-button, &::-webkit-inner-spin-button": { WebkitAppearance: "none" }, MozAppearance: "textfield", p: 0 }} />
      <Box component="button" onClick={inc} disabled={disabled} sx={{ width: btnW, height: "100%", border: "none", borderLeft: `1px solid ${divider}`, bgcolor: "transparent", cursor: disabled ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: disabled ? "#CBD5E1" : btnColor, transition: "background 0.1s", "&:hover:not(:disabled)": { bgcolor: "rgba(210,31,60,0.07)" }, "&:active:not(:disabled)": { bgcolor: "rgba(210,31,60,0.13)" }, p: 0, m: 0, flexShrink: 0 }}>
        <AddIcon sx={{ fontSize: fs + 1 }} />
      </Box>
    </Box>
  );
}

// ─── PriceInput ───────────────────────────────────────────────
interface PriceInputProps {
  value: number; onChange: (v: number) => void;
  disabled?: boolean; size?: "compact" | "full";
}
function PriceInput({ value, onChange, disabled = false, size = "compact" }: PriceInputProps) {
  const h = size === "compact" ? 28 : 32;
  const fs = size === "compact" ? 12 : 13;
  const w = size === "compact" ? 84 : 96;
  return (
    <Box sx={{ display: "inline-flex", alignItems: "center", height: h, border: "1.5px solid #E2E8F0", borderRadius: "8px", overflow: "hidden", bgcolor: disabled ? "#F8FAFC" : "#fff", transition: "border-color 0.15s", "&:focus-within": { borderColor: "#D21F3C" }, "&:hover": { borderColor: disabled ? "#E2E8F0" : "#D21F3C" } }}>
      <Box sx={{ px: "8px", height: "100%", display: "flex", alignItems: "center", borderRight: "1px solid #E2E8F0", bgcolor: "#F8FAFC", flexShrink: 0 }}>
        <Typography sx={{ fontSize: fs - 1, fontWeight: 700, color: "#9CA3AF", lineHeight: 1 }}>₹</Typography>
      </Box>
      <Box component="input" type="number" value={value === 0 ? "" : value} placeholder="0.00" disabled={disabled} onClick={e => e.stopPropagation()} onChange={e => { const v = parseFloat(e.target.value); onChange(isNaN(v) ? 0 : Math.max(0, v)); }} sx={{ width: w, height: "100%", border: "none", outline: "none", textAlign: "right", fontSize: fs, fontWeight: 600, color: "#0F172A", bgcolor: "transparent", fontFamily: "inherit", px: "8px", "&::placeholder": { color: "#CBD5E1", fontWeight: 400 }, "&::-webkit-outer-spin-button, &::-webkit-inner-spin-button": { WebkitAppearance: "none" }, MozAppearance: "textfield" }} />
    </Box>
  );
}

// ─── AttachmentsSection ───────────────────────────────────────
interface AttachmentsSectionProps {
  attachments: AttachmentFile[];
  onAdd: (files: AttachmentFile[]) => void;
  onRemove: (id: string) => void;
  onUpload: (entries: { id: string; file: File }[]) => Promise<void>;
}
function AttachmentsSection({ attachments, onAdd, onRemove, onUpload }: AttachmentsSectionProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewFile, setPreviewFile] = useState<AttachmentFile | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const resolveType = (file: File): string => {
    if (file.type) return file.type;
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    const map: Record<string, string> = { pdf: "application/pdf", doc: "application/msword", docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", xls: "application/vnd.ms-excel", xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", csv: "text/csv", jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", gif: "image/gif", webp: "image/webp" };
    return map[ext] ?? "application/octet-stream";
  };

  const processFiles = (fileList: FileList | null) => {
    if (!fileList?.length) return;
    const newAtts = Array.from(fileList).map(file => {
      const t = resolveType(file);
      return { id: `att-${Date.now()}-${Math.random()}`, file, name: file.name, size: file.size, type: t, previewUrl: t.startsWith("image/") ? URL.createObjectURL(file) : null, uploading: true };
    });
    onAdd(newAtts);
    onUpload(newAtts.map(att => ({ id: att.id, file: att.file! })));
  };

  return (
    <Box>
      <input ref={inputRef} type="file" multiple accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.csv" style={{ display: "none" }} onChange={e => { processFiles(e.target.files); e.target.value = ""; }} />
      <Box onClick={() => inputRef.current?.click()} onDrop={e => { e.preventDefault(); setIsDragging(false); processFiles(e.dataTransfer.files); }} onDragOver={e => { e.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)} sx={{ border: `2px dashed ${isDragging ? "#D21F3C" : "#E2E8F0"}`, borderRadius: 2, p: 2.5, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", bgcolor: isDragging ? "#FFF5F5" : "#F8FAFC", cursor: "pointer", minHeight: 80, "&:hover": { borderColor: "#D21F3C", bgcolor: "#FFF5F5" }, transition: "all 0.15s" }}>
        <CloudUploadOutlinedIcon sx={{ fontSize: 28, color: isDragging ? "#D21F3C" : "#9CA3AF", mb: 0.4 }} />
        <Typography sx={{ fontSize: 12, fontWeight: 600, color: isDragging ? "#D21F3C" : "#6B7280" }}>{isDragging ? "Drop files here" : "Click to upload or drag & drop"}</Typography>
        <Typography sx={{ fontSize: 10, color: "#9CA3AF", mt: 0.3 }}>JPG, PNG, PDF, DOC, DOCX, XLS, XLSX, CSV</Typography>
      </Box>
      {attachments.length > 0 && (
        <Box sx={{ mt: 1.5, display: "flex", flexDirection: "column", gap: 0.75 }}>
          {attachments.map(att => {
            const cs = getFileChipStyle(att.type);
            return (
              <Box key={att.id} sx={{ display: "flex", alignItems: "center", gap: 1, p: "7px 10px", border: `1px solid ${att.uploading ? "#BFDBFE" : "#E5E7EB"}`, borderRadius: 2, bgcolor: att.uploading ? "#EFF6FF" : "#fff", "&:hover": { bgcolor: att.uploading ? "#EFF6FF" : "#FAFAFA", borderColor: att.uploading ? "#BFDBFE" : "#D1D5DB" }, "&:hover .att-a": { opacity: 1 }, transition: "all 0.12s" }}>
                <Box sx={{ width: 36, height: 36, borderRadius: 1.5, overflow: "hidden", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", bgcolor: att.previewUrl ? "transparent" : cs.bg, border: "1px solid #E5E7EB", cursor: att.uploading ? "default" : "pointer", position: "relative", "&:hover .tov": { opacity: 1 } }} onClick={() => !att.uploading && setPreviewFile(att)}>
                  {att.uploading
                    ? <CircularProgress size={18} sx={{ color: "#3B82F6" }} />
                    : att.previewUrl
                      ? (<><img src={att.previewUrl} alt={att.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /><Box className="tov" sx={{ position: "absolute", inset: 0, bgcolor: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, transition: "opacity 0.15s", borderRadius: 1.5 }}><ZoomInIcon sx={{ fontSize: 16, color: "#fff" }} /></Box></>)
                      : <Box sx={{ display: "flex" }}>{getFileIcon(att.type)}</Box>}
                </Box>
                <Box sx={{ flex: 1, minWidth: 0, cursor: att.uploading ? "default" : "pointer" }} onClick={() => !att.uploading && setPreviewFile(att)}>
                  <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#0F172A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{att.name}</Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mt: 0.2 }}>
                    {att.uploading
                      ? <Typography sx={{ fontSize: 10, color: "#3B82F6", fontWeight: 600 }}>Uploading…</Typography>
                      : <><Chip label={getFileExt(att.name)} size="small" sx={{ fontSize: 9, fontWeight: 800, height: 16, px: 0.3, bgcolor: cs.bg, color: cs.color, border: "none" }} /><Typography sx={{ fontSize: 10, color: "#9CA3AF" }}>{formatBytes(att.size)}</Typography></>}
                  </Box>
                </Box>
                {!att.uploading && <Box className="att-a" sx={{ display: "flex", gap: 0.5, opacity: 0, transition: "opacity 0.15s", flexShrink: 0 }}>
                  <Tooltip title="Preview"><IconButton size="small" onClick={() => setPreviewFile(att)} sx={{ p: 0.5, color: "#9CA3AF", "&:hover": { color: "#3B82F6", bgcolor: "#EFF6FF" }, borderRadius: 1 }}><ZoomInIcon sx={{ fontSize: 15 }} /></IconButton></Tooltip>
                  <Tooltip title="Remove"><IconButton size="small" onClick={() => onRemove(att.id)} sx={{ p: 0.5, color: "#9CA3AF", "&:hover": { color: "#EF4444", bgcolor: "#FEF2F2" }, borderRadius: 1 }}><CloseIcon sx={{ fontSize: 15 }} /></IconButton></Tooltip>
                </Box>}
              </Box>
            );
          })}
        </Box>
      )}
      <Dialog open={!!previewFile} onClose={() => setPreviewFile(null)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3, overflow: "hidden" } }}>
        <DialogTitle sx={{ px: 3, py: 2, borderBottom: "1px solid #F1F5F9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
            {previewFile && getFileIcon(previewFile.type)}
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#0F172A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{previewFile?.name}</Typography>
              <Typography sx={{ fontSize: 11, color: "#9CA3AF" }}>{previewFile && formatBytes(previewFile.size)}</Typography>
            </Box>
          </Box>
          <IconButton size="small" onClick={() => setPreviewFile(null)} sx={{ color: "#6B7280", bgcolor: "#F9FAFB", "&:hover": { bgcolor: "#F3F4F6" }, borderRadius: "50%", flexShrink: 0 }}><CloseIcon sx={{ fontSize: 17 }} /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0, bgcolor: "#0F172A", display: "flex", alignItems: "center", justifyContent: "center", minHeight: 320 }}>
          {previewFile?.previewUrl
            ? <img src={previewFile.previewUrl} alt={previewFile.name} style={{ maxWidth: "100%", maxHeight: "70vh", objectFit: "contain", display: "block" }} />
            : <Box sx={{ py: 6, display: "flex", flexDirection: "column", alignItems: "center", gap: 2.5 }}>
                <Box sx={{ p: 2.5, bgcolor: "rgba(255,255,255,0.06)", borderRadius: 3, border: "1px solid rgba(255,255,255,0.1)" }}>{previewFile && getFileIcon(previewFile.type, 40)}</Box>
                <Typography sx={{ fontSize: 12, color: "#64748B", fontWeight: 500 }}>Preview not available — download to view</Typography>
                <Button variant="contained" size="small" startIcon={<DownloadOutlinedIcon sx={{ fontSize: 16 }} />} onClick={() => { if (previewFile) { if (previewFile.file) { const u = URL.createObjectURL(previewFile.file); const a = document.createElement("a"); a.href = u; a.download = previewFile.name; a.click(); URL.revokeObjectURL(u); } else if (previewFile.url) { const a = document.createElement("a"); a.href = previewFile.url; a.download = previewFile.name; a.target = "_blank"; a.click(); } } }} disableElevation sx={{ bgcolor: "#334155", color: "#E2E8F0", fontSize: 12, fontWeight: 700, px: 2.5, py: 0.8, borderRadius: 2, "&:hover": { bgcolor: "#475569" } }}>Download File</Button>
              </Box>}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 1.5, bgcolor: "#fff", borderTop: "1px solid #F1F5F9", justifyContent: "space-between" }}>
          <Typography sx={{ fontSize: 11, color: "#9CA3AF" }}>Click outside to close</Typography>
          <Button size="small" onClick={() => { onRemove(previewFile!.id); setPreviewFile(null); }} startIcon={<DeleteOutlineIcon sx={{ fontSize: 15 }} />} sx={{ color: "#EF4444", fontWeight: 700, fontSize: 12, px: 1.5, py: 0.5, borderRadius: 1.5, "&:hover": { bgcolor: "#FEF2F2" } }}>Remove File</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// ─── Types ────────────────────────────────────────────────────
type PaymentMethod =  "Cash" | "UPI" | "Bank Transfer" | "Others";

interface PurchaseItem {
  id: string; itemUuid: string; itemId: string; itemName: string; sku: string;
  qty: number; unitPrice: number; taxPct: number; unit: string; categoryId?: number | null;
}

// ✅ UPDATED: Added dueDate field
interface PurchaseForm {
  supplier: string; purchaseDate: string; invoiceNo: string;
  paymentMethod: PaymentMethod; paymentRef: string; paymentDate: string; paidAmount: string; notes: string;
  dueDate?: string;
  items: PurchaseItem[];
}

// ─── Helpers ──────────────────────────────────────────────────
const todayStr      = () => new Date().toISOString().split("T")[0];
const INR           = (v: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(v);
const itemSubtotal  = (i: PurchaseItem) => { const b = i.qty * i.unitPrice; return b + (b * i.taxPct) / 100; };
const itemTaxAmount = (i: PurchaseItem) => (i.qty * i.unitPrice * i.taxPct) / 100;
const catalogueToItem = (cat: CatalogueItem & { qty?: number }): PurchaseItem => ({
  id: `pi-${cat.id}-${Date.now()}-${Math.random()}`,
  itemUuid: cat.id, itemId: cat.itemId, itemName: cat.name, sku: cat.sku,
  qty: cat.qty ?? 1, unitPrice: cat.unitPrice, taxPct: cat.gstPct,
  unit: cat.unit, categoryId: cat.categoryId ?? null,
});

function FieldLabel({ children, sx }: { children: React.ReactNode; sx?: object }) {
  return <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#374151", mb: 0.5, ...sx }}>{children}</Typography>;
}
function vendorDisplayName(v?: Vendor) {
  if (!v) return "";
  return v.company_name ? `${v.vendor_name} (${v.company_name})` : v.vendor_name;
}

// ─── Item Picker Dialog ───────────────────────────────────────
interface ItemPickerDialogProps {
  open: boolean; onClose: () => void; alreadyAdded: string[];
  onConfirm: (items: Array<CatalogueItem & { qty: number }>) => void;
}

function ItemPickerDialog({ open, onClose, alreadyAdded, onConfirm }: ItemPickerDialogProps) {
  const [qtys, setQtys]           = useState<Record<string, number>>({});
  const [prices, setPrices]       = useState<Record<string, number>>({});
  const [search, setSearch]       = useState("");
  const [debSearch, setDebSearch] = useState("");
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const frameRef  = useRef<number | null>(null);
  const selectedCount = Object.values(qtys).filter(q => q > 0).length;

  useEffect(() => {
    const t = window.setTimeout(() => setDebSearch(search.trim()), 300);
    return () => window.clearTimeout(t);
  }, [search]);

  const qp = useMemo(() => ({ search: debSearch || undefined, status: "active" as const, limit: 100 }), [debSearch]);
  const { data: res, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = useInfiniteMenuItems(qp);
  const totalItems = res?.pages[0]?.total ?? 0;
  const catalogue  = useMemo(() => (res?.pages ?? []).flatMap(p => p.data).map(menuItemToCatalogue), [res]);

  const loadMore = useCallback((el?: HTMLDivElement | null) => {
    const root = el ?? scrollRef.current;
    if (!root || !hasNextPage || isFetchingNextPage) return;
    if (root.scrollHeight - root.scrollTop - root.clientHeight <= 360) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => () => { if (frameRef.current !== null) cancelAnimationFrame(frameRef.current); }, []);
  useEffect(() => {
    if (!open) return;
    const root = scrollRef.current;
    if (!root || !hasNextPage || isFetchingNextPage) return;
    if (root.scrollHeight <= root.clientHeight + 24) fetchNextPage();
  }, [open, hasNextPage, isFetchingNextPage, fetchNextPage, catalogue.length]);

  const toggleItem = (id: string) => {
    if (alreadyAdded.includes(id)) return;
    setQtys(prev => {
      const cur = prev[id] ?? 0;
      if (cur > 0) { setPrices(p => { const n = { ...p }; delete n[id]; return n; }); return { ...prev, [id]: 0 }; }
      const item = catalogue.find(c => c.id === id);
      if (item) setPrices(p => ({ ...p, [id]: item.unitPrice }));
      return { ...prev, [id]: 1 };
    });
  };

  const setQty = (id: string, val: number) => {
    if (alreadyAdded.includes(id)) return;
    const next = Math.max(0, val);
    setQtys(prev => {
      const was = prev[id] ?? 0;
      if (next === 0) { setPrices(p => { const n = { ...p }; delete n[id]; return n; }); }
      else if (was === 0 && next > 0) { const item = catalogue.find(c => c.id === id); if (item) setPrices(p => ({ ...p, [id]: item.unitPrice })); }
      return { ...prev, [id]: next };
    });
  };

  const setPrice = (id: string, price: number, fallback: number) =>
    setPrices(prev => ({ ...prev, [id]: Math.max(0, Number.isFinite(price) ? price : fallback) }));

  const reset = () => { setQtys({}); setPrices({}); setSearch(""); setDebSearch(""); };
  const handleClose   = () => { reset(); onClose(); };
  const handleConfirm = () => {
    const items = catalogue.filter(c => (qtys[c.id] ?? 0) > 0).map(c => ({ ...c, unitPrice: prices[c.id] ?? c.unitPrice, qty: qtys[c.id] }));
    onConfirm(items); reset(); onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md" PaperProps={{ sx: { borderRadius: 3, maxHeight: "82vh", height:"82vh" ,display: "flex", flexDirection: "column", boxShadow: "0 25px 60px rgba(15,23,42,0.28)" } }}>
      <DialogTitle sx={{ px: 3, py: 2, borderBottom: "1px solid #F1F5F9", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={{ p: 0.8, bgcolor: "rgba(210,31,60,0.08)", borderRadius: 2, display: "flex" }}><InventoryOutlinedIcon sx={{ color: "#D21F3C", fontSize: 20 }} /></Box>
          <Box>
            <Typography sx={{ fontSize: 16, fontWeight: 800, color: "#0F172A" }}>Select Items</Typography>
            <Typography sx={{ fontSize: 11, color: "#9CA3AF" }}>Use +/− to set quantity — reaching 0 deselects the item</Typography>
          </Box>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          {selectedCount > 0 && <Chip label={`${selectedCount} selected`} size="small" sx={{ bgcolor: "#FFF1F2", color: "#D21F3C", fontWeight: 700, fontSize: 11, border: "1px solid #FECDD3" }} />}
          <IconButton size="small" onClick={handleClose} sx={{ color: "#6B7280", bgcolor: "#F9FAFB", "&:hover": { bgcolor: "#F3F4F6" }, borderRadius: "50%" }}><CloseIcon sx={{ fontSize: 17 }} /></IconButton>
        </Box>
      </DialogTitle>
      <Box sx={{ px: 3, pt: 2, pb: 1.5, flexShrink: 0, borderBottom: "1px solid #F1F5F9" }}>
        <TextField value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or SKU…" size="small" fullWidth InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 17, color: "#9CA3AF" }} /></InputAdornment> }} sx={{ "& .MuiOutlinedInput-root": { bgcolor: "#F8FAFC", borderRadius: 2, fontSize: 13, "& fieldset": { borderColor: "#E2E8F0" }, "&:hover fieldset": { borderColor: "#D21F3C" }, "&.Mui-focused fieldset": { borderColor: "#D21F3C", borderWidth: 2 } } }} />
      </Box>
      <DialogContent ref={scrollRef} onScroll={e => { const t = e.currentTarget; if (frameRef.current !== null) return; frameRef.current = requestAnimationFrame(() => { loadMore(t); frameRef.current = null; }); }} sx={{ p: 0, overflowY: "auto", flex: 1, overscrollBehavior: "contain" }}>
        {isLoading ? (
          <Box sx={{ py: 6, textAlign: "center" }}><CircularProgress size={24} sx={{ color: "#D21F3C" }} /></Box>
        ) : catalogue.length === 0 ? (
          <Box sx={{ py: 6, textAlign: "center" }}><Typography sx={{ fontSize: 13, color: "#9CA3AF" }}>No items found</Typography></Box>
        ) : (
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: 44, bgcolor: "#F9FAFB !important", borderBottom: "1px solid #E5E7EB !important" }} />
                <TableCell sx={{ bgcolor: "#F9FAFB !important", borderBottom: "1px solid #E5E7EB !important", fontSize: "10px !important", fontWeight: "700 !important", color: "#6B7280 !important", letterSpacing: "0.07em", textTransform: "uppercase" as const }}>Item</TableCell>
                <TableCell align="center" sx={{ bgcolor: "#F9FAFB !important", borderBottom: "1px solid #E5E7EB !important", fontSize: "10px !important", fontWeight: "700 !important", color: "#6B7280 !important", width: 122 }}>Qty</TableCell>
                <TableCell align="right" sx={{ bgcolor: "#F9FAFB !important", borderBottom: "1px solid #E5E7EB !important", fontSize: "10px !important", fontWeight: "700 !important", color: "#6B7280 !important", width: 148 }}>Unit Price</TableCell>
                <TableCell align="center" sx={{ bgcolor: "#F9FAFB !important", borderBottom: "1px solid #E5E7EB !important", fontSize: "10px !important", fontWeight: "700 !important", color: "#6B7280 !important", width: 68 }}>GST</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {catalogue.map(cat => {
                const qty = qtys[cat.id] ?? 0;
                const isSelected = qty > 0;
                const isAdded = alreadyAdded.includes(cat.id);
                const price = prices[cat.id] ?? cat.unitPrice;
                return (
                  <TableRow key={cat.id} onClick={() => !isAdded && toggleItem(cat.id)} sx={{ cursor: isAdded ? "not-allowed" : "pointer", bgcolor: isSelected ? "#FFF9F9" : "transparent", opacity: isAdded ? 0.4 : 1, borderLeft: `3px solid ${isSelected ? "#D21F3C" : "transparent"}`, "&:hover": { bgcolor: isAdded ? "transparent" : isSelected ? "#FFF1F2" : "#FAFAFA" }, transition: "all 0.1s" }}>
                    <TableCell sx={{ borderBottom: "1px solid #F3F4F6" }}><Checkbox checked={isSelected} disabled={isAdded} size="small" sx={{ color: "#D1D5DB", "&.Mui-checked": { color: "#D21F3C" }, p: 0.5 }} /></TableCell>
                    <TableCell sx={{ borderBottom: "1px solid #F3F4F6" }}>
                      <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#0F172A" }}>{cat.name}</Typography>
                      <Typography sx={{ fontSize: 10, color: "#9CA3AF", fontFamily: "monospace" }}>{cat.sku} · {cat.unit}</Typography>
                    </TableCell>
                    <TableCell align="center" sx={{ borderBottom: "1px solid #F3F4F6" }} onClick={e => e.stopPropagation()}><QtyCounter value={qty} onChange={v => setQty(cat.id, v)} disabled={isAdded} min={0} size="compact" /></TableCell>
                    <TableCell align="right" sx={{ borderBottom: "1px solid #F3F4F6" }} onClick={e => e.stopPropagation()}><PriceInput value={isSelected ? price : cat.unitPrice} onChange={v => setPrice(cat.id, v, cat.unitPrice)} disabled={isAdded || !isSelected} size="compact" /></TableCell>
                    <TableCell align="center" sx={{ borderBottom: "1px solid #F3F4F6" }}><Chip label={`${cat.gstPct}%`} size="small" sx={{ fontSize: 10, fontWeight: 700, height: 18, bgcolor: "#EDE9FE", color: "#5B21B6" }} /></TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
        {!isLoading && catalogue.length > 0 && (
          <Box sx={{ py: 1.5, display: "flex", alignItems: "center", justifyContent: "center", borderTop: "1px solid #F1F5F9" }}>
            <Typography sx={{ fontSize: 11, color: "#9CA3AF", fontWeight: 600 }}>
              {isFetchingNextPage ? "Loading more…" : hasNextPage ? `Loaded ${catalogue.length} of ${totalItems || catalogue.length} items` : `All ${catalogue.length} items loaded`}
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, bgcolor: "#F8FAFC", borderTop: "1px solid #F1F5F9", gap: 1.5, flexShrink: 0, justifyContent: "space-between" }}>
        <Typography sx={{ fontSize: 12, color: "#9CA3AF" }}>{catalogue.length} item{catalogue.length !== 1 ? "s" : ""} shown</Typography>
        <Box sx={{ display: "flex", gap: 1.5 }}>
          <Button onClick={handleClose} sx={{ color: "#374151", fontWeight: 700, px: 2.5, py: 0.9, fontSize: 13, borderRadius: 2, "&:hover": { bgcolor: "#F3F4F6" } }}>Cancel</Button>
          <Button variant="contained" onClick={handleConfirm} disabled={selectedCount === 0} startIcon={<CheckBoxOutlinedIcon sx={{ fontSize: 17 }} />} disableElevation sx={{ bgcolor: "#D21F3C", color: "#fff", fontWeight: 700, px: 3, py: 0.9, fontSize: 13, borderRadius: 2, boxShadow: "0 4px 14px rgba(210,31,60,0.28)", "&:hover": { bgcolor: "#B71C1C" }, "&.Mui-disabled": { bgcolor: "#E5E7EB", color: "#9CA3AF", boxShadow: "none" } }}>
            Add {selectedCount > 0 ? `${selectedCount} ` : ""}Item{selectedCount !== 1 ? "s" : ""}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}

// ─── Main Dialog ──────────────────────────────────────────────
interface AddNewPurchaseDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  editPurchaseId?: string | null;
}

const emptyForm = (): PurchaseForm => ({
  supplier: "", purchaseDate: todayStr(), invoiceNo: "",
  paymentMethod: "Bank Transfer", paymentRef: "", paymentDate: todayStr(), paidAmount: "", notes: "",
  dueDate: "",
  items: [],
});

// ✅ UPDATED: Handle dueDate in conversion function
function detailToForm(detail: PurchaseDetail): PurchaseForm {
  return {
    supplier:      detail.vendor_id ?? "",
    purchaseDate:  detail.purchase_date?.split("T")[0] ?? todayStr(),
    invoiceNo:     detail.purchase_id ?? "",
    paymentMethod: (detail.payments?.[0]?.transaction_type as PaymentMethod) ?? "Bank Transfer",
    paymentRef:    detail.payments?.[0]?.transaction_id ?? "",
    paymentDate:   detail.payments?.[0]?.payment_date ? formatDateForInput(detail.payments[0].payment_date) : todayStr(),
    paidAmount:    detail.paid_amount ?? "0",
    notes:         detail.notes ?? "",
dueDate: detail.due_date
  ? formatDateForInput(detail.due_date)
  : "",    items: (detail.items ?? []).map(pi => ({
      id:          `pi-${pi.item_uuid ?? pi.item_id}-${Date.now()}-${Math.random()}`,
      itemUuid:    pi.item_uuid ?? "",
      itemId:      pi.item_id ?? "",
      itemName:    pi.item_name,
      sku:         pi.item_id ?? "",
      qty:         Number(pi.qty),
      unitPrice:   Number(pi.purchase_price),
      taxPct:      Number(pi.gst_percentage ?? 0),
      unit:        pi.unit ?? "NOS",
      categoryId:  pi.category_id ?? null,
    })),
  };
}

export default function AddNewPurchaseDialog({
  open, onClose, onSuccess, editPurchaseId,
}: AddNewPurchaseDialogProps) {
  const isEditMode = !!editPurchaseId;

  const [form, setForm]               = useState<PurchaseForm>(emptyForm);
  const [attachments, setAttachments] = useState<AttachmentFile[]>([]);
  const [pickerOpen, setPickerOpen]   = useState(false);
  const [saveError, setSaveError]     = useState("");
  const [vendoropen , setVendorOpen]=useState(false);
  const [vendorSearch, setVendorSearch] = useState("");
  const [successMsg, setSuccessMsg]   = useState("");

  const { data: vendorsResponse = [], isLoading: vendorsLoading } = useVendors();
  const createPurchase = useCreatePurchase();
  const updatePurchase = useUpdatePurchase();

  const { data: existingDetail, isLoading: detailLoading } = usePurchaseById(editPurchaseId ?? "");

  useEffect(() => {
    if (isEditMode && existingDetail) {
      setForm(detailToForm(existingDetail));

      // Load existing attachments from the saved URLs
      const raw = existingDetail.attachment_url;
      if (raw) {
        let items: any[] = [];
        try {
          const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
          items = Array.isArray(parsed) ? parsed.filter(Boolean) : [parsed].filter(Boolean);
        } catch {
          items = [raw].filter(Boolean);
        }
        const mimeMap: Record<string, string> = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", pdf: "application/pdf", doc: "application/msword", docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", xls: "application/vnd.ms-excel", xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", csv: "text/csv" };
        setAttachments(
          items.map((item: any, i: number) => {
            if (typeof item === "string") {
              const name = item.split("/").pop() ?? `attachment-${i + 1}`;
              const ext = name.split(".").pop()?.toLowerCase() ?? "";
              const type = mimeMap[ext] ?? "application/octet-stream";
              return { id: `existing-${i}-${item}`, url: item, name, size: 0, type, previewUrl: type.startsWith("image/") ? item : null };
            }
            const url = item.url ?? "";
            const name = item.filename ?? url.split("/").pop() ?? `attachment-${i + 1}`;
            const type = item.mimetype ?? "application/octet-stream";
            return { id: item.id ?? `existing-${i}`, url, name, size: item.size ?? 0, type, previewUrl: type.startsWith("image/") ? url : null };
          })
        );
      } else {
        setAttachments([]);
      }
    }
  }, [isEditMode, existingDetail]);

  useEffect(() => {
    if (open && !isEditMode) {
      setForm(emptyForm());
      setAttachments([]);
      setSaveError("");
      setVendorSearch("");
    }
  }, [open, isEditMode]);

  const vendors = useMemo<Vendor[]>(() => Array.isArray(vendorsResponse) ? vendorsResponse : [], [vendorsResponse]);
  const filteredVendors = useMemo(() => {
    const query = vendorSearch.trim().toLowerCase();
    if (!query) return vendors;
    return vendors.filter(v => {
      const label = vendorDisplayName(v).toLowerCase();
      return (
        label.includes(query) ||
        v.vendor_name?.toLowerCase().includes(query) ||
        v.company_name?.toLowerCase().includes(query) ||
        v.vendor_id?.toLowerCase().includes(query)
      );
    });
  }, [vendorSearch, vendors]);
  const setField = <K extends keyof PurchaseForm>(key: K, val: PurchaseForm[K]) =>
    setForm(prev => ({ ...prev, [key]: val }));

  const handlePickerConfirm = useCallback((items: Array<CatalogueItem & { qty: number }>) => {
    setForm(prev => ({ ...prev, items: [...prev.items, ...items.map(catalogueToItem)] }));
  }, []);

  const removeItem      = useCallback((id: string) => setForm(prev => ({ ...prev, items: prev.items.filter(i => i.id !== id) })), []);
  const updateItemQty   = useCallback((id: string, v: number) => setForm(prev => ({ ...prev, items: prev.items.map(i => i.id === id ? { ...i, qty: Math.max(1, v) } : i) })), []);
  const updateItemPrice = useCallback((id: string, v: number) => setForm(prev => ({ ...prev, items: prev.items.map(i => i.id === id ? { ...i, unitPrice: Math.max(0, v) } : i) })), []);
  const updateItemTax   = useCallback((id: string, v: number) => setForm(prev => ({ ...prev, items: prev.items.map(i => i.id === id ? { ...i, taxPct: Math.max(0, v) } : i) })), []);

  const handleAddAtts   = useCallback((files: AttachmentFile[]) => setAttachments(prev => [...prev, ...files]), []);
  const handleRemoveAtt = useCallback((id: string) => setAttachments(prev => { const f = prev.find(a => a.id === id); if (f?.previewUrl && !f.url) URL.revokeObjectURL(f.previewUrl); return prev.filter(a => a.id !== id); }), []);

  const handleUploadAtt = useCallback(async (entries: { id: string; file: File }[]) => {
    const ids = entries.map(e => e.id);
    try {
      const formData = new FormData();
      entries.forEach(e => formData.append("files", e.file));
<<<<<<< HEAD
      const token = getAccessToken();
      const res = await axios.post(getUploadUrl(), formData, { headers: { "Content-Type": "multipart/form-data", ...(token ? { Authorization: `Bearer ${token}` } : {}) } });
=======
      const res = await axios.post(`${API_BASE}/retail/upload/multiple`, formData, { headers: { "Content-Type": "multipart/form-data" } });
>>>>>>> 6572542ac8c38ed70a77b139a78fcbd7797da5ee
      const uploaded: { id: string; url: string; filename: string; size: number; mimetype: string }[] = res.data.files || [];
      setAttachments(prev => prev.map(a => {
        const idx = ids.indexOf(a.id);
        if (idx === -1) return a;
        const f = uploaded[idx];
        return { ...a, id: f.id, url: f.url, name: f.filename, size: f.size, type: f.mimetype, uploading: false };
      }));
    } catch {
      setAttachments(prev => prev.filter(a => !ids.includes(a.id)));
    }
  }, []);

  const grandTotal = parseFloat(form.items.reduce((s, i) => s + itemSubtotal(i), 0).toFixed(2));
  const paid       = parseFloat(form.paidAmount) || 0;
  const balanceDue = Math.max(0, grandTotal - paid);
  const alreadyAdded = form.items.map(i => i.itemUuid);

  const paymentStatus = (): "paid" | "partial" | "pending" => {
    if (paid >= grandTotal && grandTotal > 0) return "paid";
    if (paid > 0) return "partial";
    return "pending";
  };

  const handleDiscard = () => {
    attachments.forEach(a => { if (a.previewUrl) URL.revokeObjectURL(a.previewUrl); });
    setAttachments([]); setSaveError(""); setForm(emptyForm()); onClose();
  };

  const isBusy = createPurchase.isPending || updatePurchase.isPending || detailLoading || attachments.some(a => a.uploading);

  const handleSave = async () => {
    if (!form.supplier)     { setSaveError("Select a supplier before saving."); return; }
    if (!form.items.length) { setSaveError("Add at least one item before saving."); return; }
    if (paid > grandTotal)  { setSaveError("Paid amount cannot exceed grand total."); return; }
    if (attachments.some(a => a.uploading)) { setSaveError("Please wait for attachments to finish uploading."); return; }

    const allUrls = attachments.filter(a => !!a.url).map(a => ({
      id: a.id,
      url: a.url as string,
      filename: a.name,
      size: a.size,
      mimetype: a.type,
    }));

    const payload: PurchasePayload = {
      zodu_id: getZoduId() ?? "", branch_id: getBranchId() ?? "",
      vendor_id: form.supplier, purchase_date: form.purchaseDate,
      total_amount: grandTotal, paid_amount: paid,
      payment_status: paymentStatus(),
      notes: form.notes || undefined,
      transaction_type: form.paymentMethod,
      transaction_id: form.paymentRef || null,
      payment_date: form.paymentDate || null,
      due_date: form.dueDate ? new Date(form.dueDate).toISOString() : null,
      attachment_url: allUrls,
      items: form.items.map((item): PurchaseItemPayload => {
        const tax = itemTaxAmount(item);
        return { item_uuid: item.itemUuid, item_id: item.itemId, item_name: item.itemName, qty: item.qty, unit: item.unit, purchase_price: item.unitPrice, gst_percentage: item.taxPct, tax_amount: tax, cgst: tax / 2, sgst: tax / 2, category_id: item.categoryId ?? null };
      }),
    };

    try {
      setSaveError("");
      if (isEditMode && editPurchaseId) {
        await updatePurchase.mutateAsync({ id: editPurchaseId, data: payload });
        setSuccessMsg("Purchase updated successfully!");
      } else {
        await createPurchase.mutateAsync(payload);
        setSuccessMsg("Purchase added successfully!");
      }
      onSuccess?.();
      handleDiscard();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      setSaveError(e?.response?.data?.message ?? e?.message ?? "Failed to save purchase.");
    }
  };

  const inputSx = {
    "& .MuiOutlinedInput-root": {
      bgcolor: "#F8FAFC", fontSize: 13, borderRadius: "8px",
      "& fieldset": { borderColor: "#E2E8F0" },
      "&:hover fieldset": { borderColor: "#D21F3C" },
      "&.Mui-focused fieldset": { borderColor: "#D21F3C", borderWidth: 2 },
    },
  };

  return (
    <ThemeProvider theme={theme}>
      <ItemPickerDialog open={pickerOpen} onClose={() => setPickerOpen(false)} alreadyAdded={alreadyAdded} onConfirm={handlePickerConfirm} />

      <Dialog open={open} onClose={handleDiscard} fullWidth maxWidth="lg" PaperProps={{ sx: { borderRadius: 3, maxHeight: "90vh", display: "flex", flexDirection: "column", boxShadow: "0 25px 60px rgba(15,23,42,0.2)" } }}>

        {/* Header */}
        <DialogTitle sx={{ px: 3, py: 2, borderBottom: "1px solid #F1F5F9", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0, position: "sticky", top: 0, zIndex: 10, bgcolor: "#fff" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box sx={{ p: 0.8, bgcolor: isEditMode ? "rgba(37,99,235,0.08)" : "rgba(210,31,60,0.08)", borderRadius: 2, display: "flex" }}>
              {isEditMode
                ? <EditOutlinedIcon sx={{ color: "#2563EB", fontSize: 20 }} />
                : <ShoppingCartCheckoutIcon sx={{ color: "#D21F3C", fontSize: 20 }} />}
            </Box>
            <Box>
              <Typography sx={{ fontSize: 17, fontWeight: 800, color: "#0F172A" }}>
                {isEditMode ? `Edit Purchase` : "Add New Purchase"}
              </Typography>
              {isEditMode && editPurchaseId && (
                <Typography sx={{ fontSize: 11, color: "#6B7280" }}>{editPurchaseId}</Typography>
              )}
            </Box>
          </Box>
          <IconButton size="small" onClick={handleDiscard} sx={{ color: "#6B7280", bgcolor: "#F9FAFB", "&:hover": { bgcolor: "#F3F4F6" }, borderRadius: "50%" }}>
            <CloseIcon sx={{ fontSize: 17 }} />
          </IconButton>
        </DialogTitle>

        {/* Loading overlay for edit mode */}
        {isEditMode && detailLoading && (
          <Box sx={{ position: "absolute", inset: 0, zIndex: 20, display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "rgba(255,255,255,0.7)", borderRadius: 3 }}>
            <CircularProgress sx={{ color: "#D21F3C" }} />
          </Box>
        )}

        {/* Body */}
        <DialogContent sx={{ px: 3, py: 3, overflowY: "auto", flex: 1 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>

            {/* Top fields */}
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "1fr 1fr 1fr" }, gap: 2, mt: 1, alignItems: "start" }}>
              <Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1, minHeight: 30, mb: 0.5 }}>
                <FieldLabel sx={{ mb: 0, lineHeight: 1.2 }}>Supplier / Vendor *</FieldLabel>
                  <Button size="small" startIcon={<AddIcon sx={{ fontSize: 13 }} />} onClick={() => setVendorOpen(true)} sx={{ height: 24, minWidth: 0, flexShrink: 0, px: 0.5, py: 0, fontSize: 11.5, fontWeight: 700, color: "#D21F3C", borderRadius: 1.5 }}>
                  Add Vendor
                </Button>
                </Box>
                <FormControl size="small" fullWidth sx={inputSx}>
                  <Select value={form.supplier} onChange={e => setField("supplier", e.target.value)} displayEmpty
                    renderValue={v => {
                      if (!v) return <Typography sx={{ color: "#9CA3AF", fontSize: 13 }}>Select Supplier</Typography>;
                      const vendor = vendors.find(item => item.vendor_id === v);
                      return vendorDisplayName(vendor) || String(v);
                    }}
                    onOpen={() => setVendorSearch("")}
                    MenuProps={{ PaperProps: { sx: { mt: 0.5, maxHeight: 340, borderRadius: 2, boxShadow: "0 18px 40px rgba(15,23,42,0.12)" } } }}
                    sx={{ bgcolor: "#F8FAFC", fontSize: 13, borderRadius: "8px" }}>
                    <ListSubheader sx={{ bgcolor: "#fff", py: 1, px: 1, borderBottom: "1px solid #F1F5F9" }} onKeyDown={e => e.stopPropagation()}>
                      <TextField
                        autoFocus
                        size="small"
                        fullWidth
                        placeholder="Search supplier..."
                        value={vendorSearch}
                        onChange={e => setVendorSearch(e.target.value)}
                        onClick={e => e.stopPropagation()}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <SearchIcon sx={{ fontSize: 16, color: "#9CA3AF" }} />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            bgcolor: "#F8FAFC",
                            fontSize: 12.5,
                            borderRadius: 1.5,
                          },
                        }}
                      />
                    </ListSubheader>
                    {vendorsLoading
                      ? <MenuItem disabled sx={{ fontSize: 13 }}>Loading…</MenuItem>
                      : filteredVendors.length === 0
                        ? <MenuItem disabled sx={{ fontSize: 13 }}>No suppliers found</MenuItem>
                        : filteredVendors.map(v => <MenuItem key={v.vendor_id} value={v.vendor_id} sx={{ fontSize: 13 }}>{vendorDisplayName(v)}</MenuItem>)}
                  </Select>
                </FormControl>
              </Box>
              <Box>
                <Box sx={{ minHeight: 30, display: "flex", alignItems: "center", mb: 0.5 }}>
                  <FieldLabel sx={{ mb: 0, lineHeight: 1.2 }}>Purchase Date</FieldLabel>
                </Box>
                <TextField type="date" size="small" fullWidth value={form.purchaseDate} onChange={e => setField("purchaseDate", e.target.value)} sx={inputSx} inputProps={{ style: { fontSize: 13 } }} />
              </Box>
              <Box>
                <Box sx={{ minHeight: 30, display: "flex", alignItems: "center", mb: 0.5 }}>
                  <FieldLabel sx={{ mb: 0, lineHeight: 1.2 }}>Invoice / Bill No.</FieldLabel>
                </Box>
                <TextField size="small" fullWidth value={form.invoiceNo} onChange={e => setField("invoiceNo", e.target.value)} placeholder="INV-2023-001" sx={inputSx} />
              </Box>
            </Box>

            {/* Items */}
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography sx={{ fontSize: 15, fontWeight: 800, color: "#1E293B" }}>Purchase Items</Typography>
                  {form.items.length > 0 && <Chip label={`${form.items.length} item${form.items.length !== 1 ? "s" : ""}`} size="small" sx={{ fontSize: 10, fontWeight: 700, height: 20, bgcolor: "#FFF1F2", color: "#D21F3C", border: "1px solid #FECDD3" }} />}
                </Box>
                <Button size="small" startIcon={<AddIcon sx={{ fontSize: 15 }} />} onClick={() => setPickerOpen(true)} sx={{ fontSize: 12, fontWeight: 700, color: "#D21F3C", bgcolor: "rgba(210,31,60,0.07)", px: 1.5, py: 0.6, borderRadius: 1.5, "&:hover": { bgcolor: "rgba(210,31,60,0.14)" } }}>
                  Add Items
                </Button>
              </Box>
              <Paper elevation={0} sx={{ border: "1px solid #E5E7EB", borderRadius: 2, overflow: "hidden" }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Item</TableCell>
                      <TableCell align="center" sx={{ width: 116 }}>Qty</TableCell>
                      <TableCell sx={{ width: 160 }}>Unit Price</TableCell>
                      <TableCell align="center" sx={{ width: 88 }}>GST %</TableCell>
                      <TableCell align="right" sx={{ width: 130 }}>Subtotal</TableCell>
                      <TableCell sx={{ width: 44 }} />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {form.items.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 5, border: "none" }}>
                          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                            <InventoryOutlinedIcon sx={{ fontSize: 34, color: "#E2E8F0" }} />
                            <Typography sx={{ fontSize: 13, color: "#9CA3AF" }}>No items added yet</Typography>
                            <Button size="small" startIcon={<AddIcon sx={{ fontSize: 14 }} />} onClick={() => setPickerOpen(true)} sx={{ fontSize: 11, fontWeight: 700, mt: 0.5, color: "#D21F3C", bgcolor: "rgba(210,31,60,0.07)", px: 1.5, py: 0.5, borderRadius: 1.5, "&:hover": { bgcolor: "rgba(210,31,60,0.14)" } }}>
                              Browse &amp; Add Items
                            </Button>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ) : form.items.map(item => (
                      <TableRow key={item.id} sx={{ "&:hover": { bgcolor: "#FAFAFA" }, transition: "background 0.1s" }}>
                        <TableCell>
                          <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#0F172A" }}>{item.itemName}</Typography>
                          <Typography sx={{ fontSize: 10, color: "#9CA3AF", fontFamily: "monospace" }}>{item.sku} · {item.unit}</Typography>
                        </TableCell>
                        <TableCell align="center"><QtyCounter value={item.qty} onChange={v => updateItemQty(item.id, v)} min={1} size="full" /></TableCell>
                        <TableCell><PriceInput value={item.unitPrice} onChange={v => updateItemPrice(item.id, v)} size="full" /></TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: "inline-flex", alignItems: "center", height: 32, border: "1.5px solid #E2E8F0", borderRadius: "8px", overflow: "hidden", bgcolor: "#fff", "&:focus-within": { borderColor: "#D21F3C" } }}>
                            <Box component="input" type="number" value={item.taxPct} onChange={e => updateItemTax(item.id, parseFloat(e.target.value) || 0)} sx={{ width: 36, height: "100%", border: "none", outline: "none", textAlign: "center", fontSize: 13, fontWeight: 600, color: "#374151", bgcolor: "transparent", fontFamily: "inherit", px: 0.5, "&::-webkit-outer-spin-button, &::-webkit-inner-spin-button": { WebkitAppearance: "none" }, MozAppearance: "textfield" }} />
                            <Box sx={{ pr: "6px", display: "flex", alignItems: "center" }}><Typography sx={{ fontSize: 11, fontWeight: 700, color: "#9CA3AF" }}>%</Typography></Box>
                          </Box>
                        </TableCell>
                        <TableCell align="right"><Typography sx={{ fontSize: 13, fontWeight: 600, color: "#374151", fontFamily: "monospace" }}>{INR(itemSubtotal(item))}</Typography></TableCell>
                        <TableCell>
                          <Tooltip title="Remove" placement="top">
                            <IconButton size="small" onClick={() => removeItem(item.id)} sx={{ color: "#D1D5DB", p: 0.5, borderRadius: 1, "&:hover": { color: "#EF4444", bgcolor: "#FEF2F2" }, transition: "all 0.12s" }}>
                              <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Paper>
            </Box>

            {/* Bottom 3 cols */}
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr 1fr" }, gap: 3, alignItems: "start" }}>
              {/* Notes + Attachments */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                <Box>
                  <FieldLabel>Purchase Notes</FieldLabel>
                  <TextField multiline rows={3} fullWidth value={form.notes} onChange={e => setField("notes", e.target.value)} placeholder="Any additional notes…" size="small" sx={inputSx} />
                </Box>
                <Box>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.5 }}>
                    <FieldLabel>Attachments</FieldLabel>
                    {attachments.length > 0 && <Chip label={`${attachments.length} file${attachments.length !== 1 ? "s" : ""}`} size="small" sx={{ fontSize: 9, fontWeight: 700, height: 18, bgcolor: "#EFF6FF", color: "#1D4ED8", border: "1px solid #BFDBFE" }} />}
                  </Box>
                  <AttachmentsSection attachments={attachments} onAdd={handleAddAtts} onRemove={handleRemoveAtt} onUpload={handleUploadAtt} />
                </Box>
              </Box>

              {/* Payment */}
              <Paper elevation={0} sx={{ bgcolor: "#F8FAFC", border: "1px solid #E5E7EB", borderRadius: 3, p: 2.5, display: "flex", flexDirection: "column", gap: 2 }}>
                <Typography sx={{ fontSize: 12, fontWeight: 800, color: "#1E293B", letterSpacing: "0.04em", pb: 1, borderBottom: "1px solid #E5E7EB" }}>PAYMENT DETAILS</Typography>
                <Box>
                  <FieldLabel>Payment Method</FieldLabel>
                  <FormControl size="small" fullWidth sx={inputSx}>
                    <Select value={form.paymentMethod} onChange={e => setField("paymentMethod", e.target.value as PaymentMethod)} sx={{ bgcolor: "#fff", fontSize: 13, borderRadius: "8px" }}>
                      {(["Bank Transfer", "Cash", "UPI","Others"] as PaymentMethod[]).map(v => (
                        <MenuItem key={v} value={v} sx={{ fontSize: 13 }}>{v}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
                <Box>
                  <FieldLabel>Payment Date</FieldLabel>
                  <TextField type="date" size="small" fullWidth value={form.paymentDate} onChange={e => setField("paymentDate", e.target.value)} sx={{ ...inputSx, "& .MuiOutlinedInput-root": { ...inputSx["& .MuiOutlinedInput-root"], bgcolor: "#fff" } }} inputProps={{ style: { fontSize: 13 } }} />
                </Box>
                <Box>
                  <FieldLabel>Payment Reference</FieldLabel>
                  <TextField size="small" fullWidth value={form.paymentRef} onChange={e => setField("paymentRef", e.target.value)} placeholder="Ref No. / Transaction ID" sx={{ ...inputSx, "& .MuiOutlinedInput-root": { ...inputSx["& .MuiOutlinedInput-root"], bgcolor: "#fff" } }} />
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Typography sx={{ fontSize: 12, color: "#6B7280", fontWeight: 500 }}>Status</Typography>
                  <Chip label={paymentStatus().toUpperCase()} size="small" sx={{ fontSize: 10, fontWeight: 800, height: 20, ...(paymentStatus() === "paid" && { bgcolor: "#F0FDF4", color: "#166534" }), ...(paymentStatus() === "partial" && { bgcolor: "#FFFBEB", color: "#92400E" }), ...(paymentStatus() === "pending" && { bgcolor: "#F3F4F6", color: "#374151" }) }} />
                </Box>
              </Paper>

              {/* Summary */}
              <Paper elevation={0} sx={{ bgcolor: "#F8FAFC", border: "1px solid #E5E7EB", borderRadius: 3, p: 2.5, display: "flex", flexDirection: "column", gap: 2 }}>
                <Typography sx={{ fontSize: 12, fontWeight: 800, color: "#1E293B", letterSpacing: "0.04em", pb: 1, borderBottom: "1px solid #E5E7EB" }}>ORDER SUMMARY</Typography>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 1.5, borderBottom: "1px solid #E5E7EB" }}>
                  <Typography sx={{ fontSize: 13, color: "#6B7280", fontWeight: 500 }}>Grand Total</Typography>
                  <Typography sx={{ fontSize: 18, fontWeight: 800, color: "#0F172A", fontFamily: "monospace" }}>{INR(grandTotal)}</Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1 }}>
                  <Typography sx={{ fontSize: 13, color: "#6B7280", fontWeight: 500, whiteSpace: "nowrap" }}>Paid Amount</Typography>
                  <TextField size="small" type="number" value={form.paidAmount} onChange={e => setField("paidAmount", e.target.value)} placeholder="0.00" error={paid > grandTotal}
                    InputProps={{ startAdornment: <InputAdornment position="start"><Typography sx={{ fontSize: 13, fontWeight: 700, color: "#9CA3AF" }}>₹</Typography></InputAdornment> }}
                    inputProps={{ style: { textAlign: "right", fontSize: 13, fontWeight: 600, padding: "6px 8px" } }}
                    sx={{ width: 130, "& .MuiOutlinedInput-root": { bgcolor: "#fff", borderRadius: "8px", fontSize: 13, "& fieldset": { borderColor: "#E2E8F0" }, "&:hover fieldset": { borderColor: "#D21F3C" }, "&.Mui-focused fieldset": { borderColor: "#D21F3C", borderWidth: 2 } } }} />
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pt: 1.5, borderTop: "1px solid #E5E7EB" }}>
                  <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#D21F3C" }}>Balance Due</Typography>
                  <Typography sx={{ fontSize: 17, fontWeight: 800, color: "#D21F3C", fontFamily: "monospace" }}>{INR(balanceDue)}</Typography>
                </Box>
                {/* ✅ NEW: Due Date Field under Balance Due */}
                <Box sx={{ pt: 1.5, borderTop: "1px solid #E5E7EB", display: "flex", flexDirection: "column", gap: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <CalendarTodayIcon sx={{ fontSize: 13, color: "#D21F3C" }} />
                    <FieldLabel>Due Date</FieldLabel>
                  </Box>
                  <TextField
                    type="date"
                    size="small"
                    fullWidth
                    value={form.dueDate ?? ""}
                    onChange={e => setField("dueDate", e.target.value)}
                    sx={inputSx}
                    inputProps={{ style: { fontSize: 13 } }}
                  />
                  {form.dueDate && (
                    <Typography sx={{ fontSize: 10, color: "#6B7280", fontWeight: 500, mt: 0.5 }}>
                      {new Date(form.dueDate).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })}
                    </Typography>
                  )}
                </Box>
              </Paper>
            </Box>
          </Box>
        </DialogContent>

        {/* Footer */}
        <DialogActions sx={{ px: 3, py: 2, bgcolor: "#F8FAFC", borderTop: "1px solid #F1F5F9", gap: 1.5, flexShrink: 0 }}>
          {saveError && <Typography sx={{ flex: 1, fontSize: 12, color: "#DC2626", fontWeight: 600 }}>{saveError}</Typography>}
          <Button onClick={handleDiscard} sx={{ color: "#374151", fontWeight: 700, px: 3, py: 1, fontSize: 13, borderRadius: 2, "&:hover": { bgcolor: "#F3F4F6" } }}>Discard</Button>
          <Button variant="contained" onClick={handleSave}
            startIcon={isBusy ? <CircularProgress size={15} sx={{ color: "#fff" }} /> : <SaveOutlinedIcon sx={{ fontSize: 17 }} />}
            disableElevation disabled={isBusy}
            sx={{ bgcolor: isEditMode ? "#2563EB" : "#D21F3C", color: "#fff", fontWeight: 700, px: 3.5, py: 1, fontSize: 13, borderRadius: 2, boxShadow: isEditMode ? "0 4px 16px rgba(37,99,235,0.28)" : "0 4px 16px rgba(210,31,60,0.28)", "&:hover": { bgcolor: isEditMode ? "#1D4ED8" : "#B71C1C" }, "&:active": { transform: "scale(0.97)" }, transition: "all 0.15s", "&.Mui-disabled": { bgcolor: "#E5E7EB", color: "#9CA3AF", boxShadow: "none" } }}>
            {isBusy ? "Saving…" : isEditMode ? "Update Purchase" : "Save Purchase"}
          </Button>
        </DialogActions>
       
      </Dialog>
        <AddVendorModal
          open={vendoropen}
          onClose={() => setVendorOpen(false)}
          vendorType="Purchase"
          onSave={(data) => console.log("Saved vendor:", data)}
        />

        <SuccessToast message={successMsg} onClose={() => setSuccessMsg("")} />
    </ThemeProvider>
  );
}
