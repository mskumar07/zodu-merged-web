import { useState, useCallback, useMemo, useRef } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Typography, TextField, Button, IconButton,
  Select, MenuItem, FormControl, InputAdornment,
  Table, TableHead, TableBody, TableRow, TableCell,
  Paper, Tooltip, Checkbox, Chip, Badge,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import ShoppingCartCheckoutIcon from "@mui/icons-material/ShoppingCartCheckout";
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

// ─── Theme ────────────────────────────────────────────────────
const theme = createTheme({
  palette: {
    primary: { main: "#D21F3C" },
    background: { default: "#f8f6f6", paper: "#ffffff" },
    text: { primary: "#0F172A", secondary: "#6B7280" },
  },
  typography: { fontFamily: "'DM Sans', 'Public Sans', 'Segoe UI', sans-serif" },
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

// ─── Catalogue Mock Data ──────────────────────────────────────
export interface CatalogueItem {
  id: string; name: string; sku: string; category: string;
  unitPrice: number; unit: string; gstPct: number;
}

const CATALOGUE: CatalogueItem[] = [
  { id: "cat-01", name: "Arabica Coffee Beans",      sku: "COF-001", category: "Beverages",   unitPrice: 850,  unit: "KG",  gstPct: 5  },
  { id: "cat-02", name: "Robusta Coffee Blend",      sku: "COF-002", category: "Beverages",   unitPrice: 620,  unit: "KG",  gstPct: 5  },
  { id: "cat-03", name: "Cold Brew Concentrate",     sku: "COF-003", category: "Beverages",   unitPrice: 340,  unit: "LTR", gstPct: 12 },
  { id: "cat-04", name: "Oat Milk Barista",          sku: "MLK-001", category: "Dairy Alt",   unitPrice: 180,  unit: "LTR", gstPct: 5  },
  { id: "cat-05", name: "Almond Milk Unsweetened",   sku: "MLK-002", category: "Dairy Alt",   unitPrice: 220,  unit: "LTR", gstPct: 5  },
  { id: "cat-06", name: "Whole Milk (Pasteurised)",  sku: "MLK-003", category: "Dairy Alt",   unitPrice: 65,   unit: "LTR", gstPct: 5  },
  { id: "cat-07", name: "Vanilla Syrup",             sku: "SYR-001", category: "Syrups",      unitPrice: 290,  unit: "BTL", gstPct: 18 },
  { id: "cat-08", name: "Caramel Sauce",             sku: "SYR-002", category: "Syrups",      unitPrice: 310,  unit: "BTL", gstPct: 18 },
  { id: "cat-09", name: "Hazelnut Syrup",            sku: "SYR-003", category: "Syrups",      unitPrice: 320,  unit: "BTL", gstPct: 18 },
  { id: "cat-10", name: "Mocha Sauce",               sku: "SYR-004", category: "Syrups",      unitPrice: 280,  unit: "BTL", gstPct: 18 },
  { id: "cat-11", name: "Espresso Machine Cleaner",  sku: "EQP-001", category: "Equipment",   unitPrice: 1200, unit: "SET", gstPct: 18 },
  { id: "cat-12", name: "Portafilter Basket 58mm",   sku: "EQP-002", category: "Equipment",   unitPrice: 450,  unit: "NOS", gstPct: 18 },
  { id: "cat-13", name: "Milk Steaming Pitcher",     sku: "EQP-003", category: "Equipment",   unitPrice: 380,  unit: "NOS", gstPct: 18 },
  { id: "cat-14", name: "Paper Cups 350ml (50 pcs)", sku: "PKG-001", category: "Packaging",   unitPrice: 145,  unit: "PKT", gstPct: 12 },
  { id: "cat-15", name: "Paper Cups 500ml (50 pcs)", sku: "PKG-002", category: "Packaging",   unitPrice: 175,  unit: "PKT", gstPct: 12 },
  { id: "cat-16", name: "Biodegradable Straws",      sku: "PKG-003", category: "Packaging",   unitPrice: 90,   unit: "PKT", gstPct: 12 },
  { id: "cat-17", name: "Takeaway Bags (100 pcs)",   sku: "PKG-004", category: "Packaging",   unitPrice: 120,  unit: "PKT", gstPct: 12 },
  { id: "cat-18", name: "Brown Sugar Sachets",       sku: "ACC-001", category: "Accessories", unitPrice: 55,   unit: "BOX", gstPct: 5  },
  { id: "cat-19", name: "Honey Sticks",              sku: "ACC-002", category: "Accessories", unitPrice: 210,  unit: "BOX", gstPct: 5  },
  { id: "cat-20", name: "Cinnamon Powder 500g",      sku: "ACC-003", category: "Accessories", unitPrice: 180,  unit: "TIN", gstPct: 5  },
  { id: "cat-21", name: "Dark Chocolate Powder",     sku: "ACC-004", category: "Accessories", unitPrice: 240,  unit: "KG",  gstPct: 5  },
  { id: "cat-22", name: "Green Tea Bags (50 pcs)",   sku: "TEA-001", category: "Beverages",   unitPrice: 160,  unit: "BOX", gstPct: 5  },
  { id: "cat-23", name: "Earl Grey Tea Bags",        sku: "TEA-002", category: "Beverages",   unitPrice: 190,  unit: "BOX", gstPct: 5  },
  { id: "cat-24", name: "Chamomile Herbal Tea",      sku: "TEA-003", category: "Beverages",   unitPrice: 210,  unit: "BOX", gstPct: 5  },
];

const CATEGORIES = ["All", ...Array.from(new Set(CATALOGUE.map(c => c.category)))];

const CAT_COLORS: Record<string, { bg: string; color: string }> = {
  Beverages:   { bg: "#EFF6FF", color: "#1D4ED8" },
  "Dairy Alt": { bg: "#F0FDF4", color: "#166534" },
  Syrups:      { bg: "#FFF7ED", color: "#B45309" },
  Equipment:   { bg: "#F5F3FF", color: "#5B21B6" },
  Packaging:   { bg: "#ECFDF5", color: "#065F46" },
  Accessories: { bg: "#FFF1F2", color: "#9F1239" },
};

// ─── Attachment Types ─────────────────────────────────────────
interface AttachmentFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  previewUrl: string | null; // object URL for images, null for docs
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const XLSX_TYPES = [
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/csv",
];
const DOC_TYPES = [
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

function getFileIcon(type: string, size = 18) {
  if (type.startsWith("image/"))           return <ImageOutlinedIcon sx={{ fontSize: size, color: "#3B82F6" }} />;
  if (type === "application/pdf")          return <PictureAsPdfOutlinedIcon sx={{ fontSize: size, color: "#EF4444" }} />;
  if (XLSX_TYPES.includes(type))           return <TableChartOutlinedIcon sx={{ fontSize: size, color: "#16A34A" }} />;
  if (DOC_TYPES.includes(type))            return <DescriptionOutlinedIcon sx={{ fontSize: size, color: "#2563EB" }} />;
  return <ArticleOutlinedIcon sx={{ fontSize: size, color: "#6B7280" }} />;
}

function getFileChipStyle(type: string): { bg: string; color: string } {
  if (type.startsWith("image/"))  return { bg: "#EFF6FF", color: "#1D4ED8" };
  if (type === "application/pdf") return { bg: "#FEF2F2", color: "#B91C1C" };
  if (XLSX_TYPES.includes(type))  return { bg: "#F0FDF4", color: "#166534" };
  if (DOC_TYPES.includes(type))   return { bg: "#EFF6FF", color: "#1E40AF" };
  return { bg: "#F3F4F6", color: "#374151" };
}

function getFileExt(name: string): string {
  return name.split(".").pop()?.toUpperCase() ?? "FILE";
}

// ─── Attachment Section Component ────────────────────────────
interface AttachmentsSectionProps {
  attachments: AttachmentFile[];
  onAdd: (files: AttachmentFile[]) => void;
  onRemove: (id: string) => void;
}

function AttachmentsSection({ attachments, onAdd, onRemove }: AttachmentsSectionProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewFile, setPreviewFile] = useState<AttachmentFile | null>(null);
  const [isDragging, setIsDragging]   = useState(false);

  // Resolve MIME type from extension when browser reports empty type (common with PDF on some OSes)
  const resolveType = (file: File): string => {
    if (file.type) return file.type;
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    const map: Record<string, string> = {
      pdf:  "application/pdf",
      doc:  "application/msword",
      docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      xls:  "application/vnd.ms-excel",
      xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      csv:  "text/csv",
      jpg:  "image/jpeg",
      jpeg: "image/jpeg",
      png:  "image/png",
      gif:  "image/gif",
      webp: "image/webp",
    };
    return map[ext] ?? "application/octet-stream";
  };

  const processFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const newFiles: AttachmentFile[] = [];
    Array.from(fileList).forEach(file => {
      const resolvedType = resolveType(file);
      const isImage = resolvedType.startsWith("image/");
      newFiles.push({
        id: `att-${Date.now()}-${Math.random()}`,
        file,
        name: file.name,
        size: file.size,
        type: resolvedType,
        previewUrl: isImage ? URL.createObjectURL(file) : null,
      });
    });
    onAdd(newFiles);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);

  return (
    <Box>
      {/* Drop Zone */}
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv,.pdf,.doc,.docx,.xls,.xlsx,.csv"
        style={{ display: "none" }}
        onChange={e => {
          processFiles(e.target.files);
          // Reset so the same file can be picked again after removal
          e.target.value = "";
        }}
      />
      <Box
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        sx={{
          border: `2px dashed ${isDragging ? "#D21F3C" : "#E2E8F0"}`,
          borderRadius: 2, p: 2.5,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          bgcolor: isDragging ? "#FFF5F5" : "#F8FAFC",
          cursor: "pointer",
          "&:hover": { borderColor: "#D21F3C", bgcolor: "#FFF5F5" },
          transition: "all 0.15s",
          minHeight: 80,
        }}
      >
        <CloudUploadOutlinedIcon sx={{ fontSize: 28, color: isDragging ? "#D21F3C" : "#9CA3AF", mb: 0.4, transition: "color 0.15s" }} />
        <Typography sx={{ fontSize: 12, fontWeight: 600, color: isDragging ? "#D21F3C" : "#6B7280", transition: "color 0.15s" }}>
          {isDragging ? "Drop files here" : "Click to upload or drag & drop"}
        </Typography>
        <Typography sx={{ fontSize: 10, color: "#9CA3AF", mt: 0.3, letterSpacing: "0.06em" }}>
          JPG, PNG, PDF, DOC, DOCX, XLS, XLSX, CSV
        </Typography>
      </Box>

      {/* File List */}
      {attachments.length > 0 && (
        <Box sx={{ mt: 1.5, display: "flex", flexDirection: "column", gap: 0.75 }}>
          {attachments.map(att => {
            const chipStyle = getFileChipStyle(att.type);
            return (
              <Box
                key={att.id}
                sx={{
                  display: "flex", alignItems: "center", gap: 1,
                  p: "7px 10px",
                  border: "1px solid #E5E7EB",
                  borderRadius: 2,
                  bgcolor: "#fff",
                  "&:hover": { bgcolor: "#FAFAFA", borderColor: "#D1D5DB" },
                  "&:hover .att-actions": { opacity: 1 },
                  transition: "all 0.12s",
                }}
              >
                {/* Thumbnail or icon */}
                <Box
                  sx={{
                    width: 36, height: 36, borderRadius: 1.5, overflow: "hidden",
                    flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
                    bgcolor: att.previewUrl ? "transparent" : chipStyle.bg,
                    border: "1px solid #E5E7EB",
                    cursor: "pointer",
                    position: "relative",
                    "&:hover .thumb-overlay": { opacity: 1 },
                  }}
                  onClick={() => setPreviewFile(att)}
                >
                  {att.previewUrl ? (
                    <>
                      <img src={att.previewUrl} alt={att.name}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <Box className="thumb-overlay" sx={{
                        position: "absolute", inset: 0, bgcolor: "rgba(0,0,0,0.4)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        opacity: 0, transition: "opacity 0.15s", borderRadius: 1.5,
                      }}>
                        <ZoomInIcon sx={{ fontSize: 16, color: "#fff" }} />
                      </Box>
                    </>
                  ) : (
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
                      onClick={() => setPreviewFile(att)}>
                      {getFileIcon(att.type)}
                    </Box>
                  )}
                </Box>

                {/* Name + meta */}
                <Box sx={{ flex: 1, minWidth: 0, cursor: "pointer" }} onClick={() => setPreviewFile(att)}>
                  <Typography sx={{
                    fontSize: 12, fontWeight: 600, color: "#0F172A",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    "&:hover": { color: "#D21F3C" }, transition: "color 0.12s",
                  }}>
                    {att.name}
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mt: 0.2 }}>
                    <Chip label={getFileExt(att.name)} size="small"
                      sx={{ fontSize: 9, fontWeight: 800, height: 16, px: 0.3, bgcolor: chipStyle.bg, color: chipStyle.color, border: "none" }} />
                    <Typography sx={{ fontSize: 10, color: "#9CA3AF" }}>{formatBytes(att.size)}</Typography>
                  </Box>
                </Box>

                {/* Action buttons */}
                <Box className="att-actions" sx={{ display: "flex", gap: 0.5, opacity: 0, transition: "opacity 0.15s", flexShrink: 0 }}>
                  <Tooltip title="Preview" placement="top">
                    <IconButton size="small" onClick={() => setPreviewFile(att)}
                      sx={{ p: 0.5, color: "#9CA3AF", "&:hover": { color: "#3B82F6", bgcolor: "#EFF6FF" }, borderRadius: 1 }}>
                      <ZoomInIcon sx={{ fontSize: 15 }} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Remove" placement="top">
                    <IconButton size="small" onClick={() => onRemove(att.id)}
                      sx={{ p: 0.5, color: "#9CA3AF", "&:hover": { color: "#EF4444", bgcolor: "#FEF2F2" }, borderRadius: 1 }}>
                      <CloseIcon sx={{ fontSize: 15 }} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            );
          })}
        </Box>
      )}

      {/* Preview Dialog */}
      <Dialog open={!!previewFile} onClose={() => setPreviewFile(null)} maxWidth="md" fullWidth
        PaperProps={{ sx: { borderRadius: 3, overflow: "hidden", boxShadow: "0 25px 60px rgba(15,23,42,0.3)" } }}>
        <DialogTitle sx={{ px: 3, py: 2, borderBottom: "1px solid #F1F5F9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
            {previewFile && getFileIcon(previewFile.type)}
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#0F172A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {previewFile?.name}
              </Typography>
              <Typography sx={{ fontSize: 11, color: "#9CA3AF" }}>
                {previewFile && formatBytes(previewFile.size)}
              </Typography>
            </Box>
          </Box>
          <IconButton size="small" onClick={() => setPreviewFile(null)}
            sx={{ color: "#6B7280", bgcolor: "#F9FAFB", "&:hover": { bgcolor: "#F3F4F6" }, borderRadius: "50%", flexShrink: 0 }}>
            <CloseIcon sx={{ fontSize: 17 }} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0, bgcolor: "#0F172A", display: "flex", alignItems: "center", justifyContent: "center", minHeight: 320 }}>
          {previewFile?.previewUrl ? (
            <img src={previewFile.previewUrl} alt={previewFile.name}
              style={{ maxWidth: "100%", maxHeight: "70vh", objectFit: "contain", display: "block" }} />
          ) : (
            <Box sx={{ py: 6, display: "flex", flexDirection: "column", alignItems: "center", gap: 2.5 }}>
              <Box sx={{
                p: 2.5, bgcolor: "rgba(255,255,255,0.06)", borderRadius: 3,
                border: "1px solid rgba(255,255,255,0.1)",
              }}>
                {previewFile && getFileIcon(previewFile.type, 40)}
              </Box>
              <Box sx={{ textAlign: "center" }}>
                <Typography sx={{ fontSize: 14, color: "#E2E8F0", fontWeight: 700, mb: 0.5 }}>
                  {previewFile?.name}
                </Typography>
                <Typography sx={{ fontSize: 12, color: "#64748B" }}>
                  {previewFile && formatBytes(previewFile.size)} · {previewFile && getFileExt(previewFile.name)} file
                </Typography>
              </Box>
              <Typography sx={{ fontSize: 12, color: "#64748B", fontWeight: 500 }}>
                Preview not available — download to view
              </Typography>
              <Button
                variant="contained"
                size="small"
                startIcon={<DownloadOutlinedIcon sx={{ fontSize: 16 }} />}
                onClick={() => {
                  if (previewFile) {
                    const url = URL.createObjectURL(previewFile.file);
                    const a = document.createElement("a");
                    a.href = url; a.download = previewFile.name; a.click();
                    URL.revokeObjectURL(url);
                  }
                }}
                disableElevation
                sx={{
                  bgcolor: "#334155", color: "#E2E8F0", fontSize: 12, fontWeight: 700,
                  px: 2.5, py: 0.8, borderRadius: 2,
                  "&:hover": { bgcolor: "#475569" },
                }}
              >
                Download File
              </Button>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 1.5, bgcolor: "#fff", borderTop: "1px solid #F1F5F9", justifyContent: "space-between" }}>
          <Typography sx={{ fontSize: 11, color: "#9CA3AF" }}>
            Click outside to close
          </Typography>
          <Button size="small" onClick={() => { onRemove(previewFile!.id); setPreviewFile(null); }}
            startIcon={<DeleteOutlineIcon sx={{ fontSize: 15 }} />}
            sx={{ color: "#EF4444", fontWeight: 700, fontSize: 12, px: 1.5, py: 0.5, borderRadius: 1.5, "&:hover": { bgcolor: "#FEF2F2" } }}>
            Remove File
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// ─── Types ────────────────────────────────────────────────────
type PaymentType   = "Credit" | "Cash";
type PaymentMethod = "Bank Transfer" | "Cash" | "UPI/Digital" | "Cheque";

interface PurchaseItem {
  id: string; catalogueId: string; itemName: string; sku: string;
  qty: number; unitPrice: number; taxPct: number; unit: string;
}

interface PurchaseForm {
  supplier: string; purchaseDate: string; invoiceNo: string; paymentType: PaymentType;
  notes: string; paymentMethod: PaymentMethod; paymentRef: string; paidAmount: string;
  items: PurchaseItem[];
}

// ─── Helpers ─────────────────────────────────────────────────
const todayStr = () => new Date().toISOString().split("T")[0];
const INR = (v: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(v);
const itemSubtotal = (item: PurchaseItem) => {
  const base = item.qty * item.unitPrice;
  return base + (base * item.taxPct) / 100;
};
const catalogueToItem = (cat: CatalogueItem): PurchaseItem => ({
  id: `pi-${cat.id}-${Date.now()}-${Math.random()}`,
  catalogueId: cat.id, itemName: cat.name, sku: cat.sku,
  qty: 1, unitPrice: cat.unitPrice, taxPct: cat.gstPct, unit: cat.unit,
});

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#374151", mb: 0.5 }}>{children}</Typography>
  );
}

// ─── Item Picker Dialog ───────────────────────────────────────
interface ItemPickerDialogProps {
  open: boolean;
  onClose: () => void;
  alreadyAdded: string[];
  onConfirm: (selected: CatalogueItem[]) => void;
}

function ItemPickerDialog({ open, onClose, alreadyAdded, onConfirm }: ItemPickerDialogProps) {
  const [search, setSearch]               = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [selected, setSelected]           = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return CATALOGUE.filter(c => {
      const catMatch = activeCategory === "All" || c.category === activeCategory;
      const qMatch   = !q || c.name.toLowerCase().includes(q) || c.sku.toLowerCase().includes(q);
      return catMatch && qMatch;
    });
  }, [search, activeCategory]);

  const toggle = (id: string) =>
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const reset = () => { setSelected(new Set()); setSearch(""); setActiveCategory("All"); };

  const handleConfirm = () => {
    onConfirm(CATALOGUE.filter(c => selected.has(c.id)));
    reset(); onClose();
  };
  const handleClose = () => { reset(); onClose(); };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md"
      PaperProps={{ sx: { borderRadius: 3, maxHeight: "82vh", display: "flex", flexDirection: "column", boxShadow: "0 25px 60px rgba(15,23,42,0.28)" } }}>

      {/* Header */}
      <DialogTitle sx={{ px: 3, py: 2, borderBottom: "1px solid #F1F5F9", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={{ p: 0.8, bgcolor: "rgba(210,31,60,0.08)", borderRadius: 2, display: "flex" }}>
            <InventoryOutlinedIcon sx={{ color: "#D21F3C", fontSize: 20 }} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: 16, fontWeight: 800, color: "#0F172A" }}>Select Items</Typography>
            <Typography sx={{ fontSize: 11, color: "#9CA3AF" }}>Choose one or more items to add to this purchase</Typography>
          </Box>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          {selected.size > 0 && (
            <Chip label={`${selected.size} selected`} size="small"
              sx={{ bgcolor: "#FFF1F2", color: "#D21F3C", fontWeight: 700, fontSize: 11, border: "1px solid #FECDD3" }} />
          )}
          <IconButton size="small" onClick={handleClose}
            sx={{ color: "#6B7280", bgcolor: "#F9FAFB", "&:hover": { bgcolor: "#F3F4F6" }, borderRadius: "50%" }}>
            <CloseIcon sx={{ fontSize: 17 }} />
          </IconButton>
        </Box>
      </DialogTitle>

      {/* Search + Category Filter */}
      <Box sx={{ px: 3, pt: 2, pb: 1.5, flexShrink: 0, borderBottom: "1px solid #F1F5F9" }}>
        <TextField
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or SKU…" size="small" fullWidth
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 17, color: "#9CA3AF" }} /></InputAdornment> }}
          sx={{ mb: 1.5, "& .MuiOutlinedInput-root": { bgcolor: "#F8FAFC", borderRadius: 2, fontSize: 13, "& fieldset": { borderColor: "#E2E8F0" }, "&:hover fieldset": { borderColor: "#D21F3C" }, "&.Mui-focused fieldset": { borderColor: "#D21F3C", borderWidth: 2 } } }}
        />
        <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap" }}>
          {CATEGORIES.map(cat => (
            <Box key={cat} onClick={() => setActiveCategory(cat)}
              sx={{
                px: 1.5, py: 0.4, borderRadius: "999px", fontSize: 11, fontWeight: 700, cursor: "pointer",
                bgcolor: activeCategory === cat ? "#D21F3C" : "#F3F4F6",
                color: activeCategory === cat ? "#fff" : "#6B7280",
                border: `1px solid ${activeCategory === cat ? "#D21F3C" : "#E5E7EB"}`,
                transition: "all 0.12s",
                "&:hover": { bgcolor: activeCategory === cat ? "#B71C1C" : "#E5E7EB" },
              }}>{cat}</Box>
          ))}
        </Box>
      </Box>

      {/* Item List */}
      <DialogContent sx={{ p: 0, overflowY: "auto", flex: 1 }}>
        {filtered.length === 0 ? (
          <Box sx={{ py: 6, textAlign: "center" }}>
            <Typography sx={{ fontSize: 13, color: "#9CA3AF" }}>No items found</Typography>
          </Box>
        ) : (
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: 48, bgcolor: "#F9FAFB !important", borderBottom: "1px solid #E5E7EB !important" }} />
                <TableCell sx={{ bgcolor: "#F9FAFB !important", borderBottom: "1px solid #E5E7EB !important", fontSize: "10px !important", fontWeight: "700 !important", color: "#6B7280 !important", letterSpacing: "0.07em", textTransform: "uppercase" as const }}>Item</TableCell>
                <TableCell sx={{ bgcolor: "#F9FAFB !important", borderBottom: "1px solid #E5E7EB !important", fontSize: "10px !important", fontWeight: "700 !important", color: "#6B7280 !important", letterSpacing: "0.07em", textTransform: "uppercase" as const }}>Category</TableCell>
                <TableCell align="right" sx={{ bgcolor: "#F9FAFB !important", borderBottom: "1px solid #E5E7EB !important", fontSize: "10px !important", fontWeight: "700 !important", color: "#6B7280 !important", letterSpacing: "0.07em", textTransform: "uppercase" as const }}>Unit Price</TableCell>
                <TableCell align="center" sx={{ bgcolor: "#F9FAFB !important", borderBottom: "1px solid #E5E7EB !important", fontSize: "10px !important", fontWeight: "700 !important", color: "#6B7280 !important", letterSpacing: "0.07em", textTransform: "uppercase" as const }}>GST</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map(cat => {
                const isSelected = selected.has(cat.id);
                const isAdded    = alreadyAdded.includes(cat.id);
                const cs         = CAT_COLORS[cat.category] ?? { bg: "#F3F4F6", color: "#374151" };
                return (
                  <TableRow key={cat.id} onClick={() => !isAdded && toggle(cat.id)}
                    sx={{
                      cursor: isAdded ? "not-allowed" : "pointer",
                      bgcolor: isSelected ? "#FFF1F2" : "transparent",
                      opacity: isAdded ? 0.4 : 1,
                      borderLeft: `3px solid ${isSelected ? "#D21F3C" : "transparent"}`,
                      "&:hover": { bgcolor: isAdded ? "transparent" : isSelected ? "#FFE4E6" : "#FFF8F8" },
                      transition: "all 0.1s",
                    }}>
                    <TableCell sx={{ borderBottom: "1px solid #F3F4F6" }}>
                      <Checkbox checked={isSelected} disabled={isAdded} size="small"
                        sx={{ color: "#D1D5DB", "&.Mui-checked": { color: "#D21F3C" }, p: 0.5 }} />
                    </TableCell>
                    <TableCell sx={{ borderBottom: "1px solid #F3F4F6" }}>
                      <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#0F172A" }}>{cat.name}</Typography>
                      <Typography sx={{ fontSize: 10, color: "#9CA3AF", fontFamily: "monospace" }}>{cat.sku} · {cat.unit}</Typography>
                    </TableCell>
                    <TableCell sx={{ borderBottom: "1px solid #F3F4F6" }}>
                      <Chip label={cat.category} size="small"
                        sx={{ fontSize: 10, fontWeight: 700, height: 20, bgcolor: cs.bg, color: cs.color, border: "none" }} />
                    </TableCell>
                    <TableCell align="right" sx={{ borderBottom: "1px solid #F3F4F6" }}>
                      <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#374151", fontFamily: "monospace" }}>{INR(cat.unitPrice)}</Typography>
                    </TableCell>
                    <TableCell align="center" sx={{ borderBottom: "1px solid #F3F4F6" }}>
                      <Chip label={`${cat.gstPct}%`} size="small"
                        sx={{ fontSize: 10, fontWeight: 700, height: 18, bgcolor: "#EDE9FE", color: "#5B21B6" }} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </DialogContent>

      {/* Footer */}
      <DialogActions sx={{ px: 3, py: 2, bgcolor: "#F8FAFC", borderTop: "1px solid #F1F5F9", gap: 1.5, flexShrink: 0, justifyContent: "space-between" }}>
        <Typography sx={{ fontSize: 12, color: "#9CA3AF" }}>{filtered.length} item{filtered.length !== 1 ? "s" : ""} shown</Typography>
        <Box sx={{ display: "flex", gap: 1.5 }}>
          <Button onClick={handleClose}
            sx={{ color: "#374151", fontWeight: 700, px: 2.5, py: 0.9, fontSize: 13, borderRadius: 2, "&:hover": { bgcolor: "#F3F4F6" } }}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleConfirm} disabled={selected.size === 0}
            startIcon={<CheckBoxOutlinedIcon sx={{ fontSize: 17 }} />} disableElevation
            sx={{
              bgcolor: "#D21F3C", color: "#fff", fontWeight: 700, px: 3, py: 0.9, fontSize: 13, borderRadius: 2,
              boxShadow: "0 4px 14px rgba(210,31,60,0.28)",
              "&:hover": { bgcolor: "#B71C1C" },
              "&.Mui-disabled": { bgcolor: "#E5E7EB", color: "#9CA3AF", boxShadow: "none" },
            }}>
            Add {selected.size > 0 ? `${selected.size} ` : ""}Item{selected.size !== 1 ? "s" : ""}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}

// ─── Main Dialog Props ────────────────────────────────────────
interface AddNewPurchaseDialogProps {
  open: boolean;
  onClose: () => void;
  onSave?: (form: PurchaseForm, attachments: AttachmentFile[]) => void;
}

// ─── Main Component ───────────────────────────────────────────
export default function AddNewPurchaseDialog({ open, onClose, onSave }: AddNewPurchaseDialogProps) {
  const [form, setForm] = useState<PurchaseForm>({
    supplier: "", purchaseDate: todayStr(), invoiceNo: "", paymentType: "Credit",
    notes: "", paymentMethod: "Bank Transfer", paymentRef: "", paidAmount: "", items: [],
  });
  const [attachments, setAttachments] = useState<AttachmentFile[]>([]);
  const [pickerOpen, setPickerOpen]   = useState(false);

  const setField = <K extends keyof PurchaseForm>(key: K, value: PurchaseForm[K]) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const handlePickerConfirm = useCallback((selected: CatalogueItem[]) => {
    setForm(prev => ({ ...prev, items: [...prev.items, ...selected.map(catalogueToItem)] }));
  }, []);

  const removeItem   = useCallback((id: string) =>
    setForm(prev => ({ ...prev, items: prev.items.filter(i => i.id !== id) })), []);
  const updateItem   = useCallback((id: string, field: keyof PurchaseItem, value: string | number) =>
    setForm(prev => ({ ...prev, items: prev.items.map(i => i.id === id ? { ...i, [field]: value } : i) })), []);

  const handleAddAttachments = useCallback((files: AttachmentFile[]) =>
    setAttachments(prev => [...prev, ...files]), []);
  const handleRemoveAttachment = useCallback((id: string) =>
    setAttachments(prev => {
      const file = prev.find(a => a.id === id);
      if (file?.previewUrl) URL.revokeObjectURL(file.previewUrl);
      return prev.filter(a => a.id !== id);
    }), []);

  const grandTotal   = form.items.reduce((s, i) => s + itemSubtotal(i), 0);
  const paid         = parseFloat(form.paidAmount) || 0;
  const balanceDue   = Math.max(0, grandTotal - paid);
  const alreadyAdded = form.items.map(i => i.catalogueId);

  const inputSx = {
    "& .MuiOutlinedInput-root": {
      bgcolor: "#F8FAFC", fontSize: 13, borderRadius: "8px",
      "& fieldset": { borderColor: "#E2E8F0" },
      "&:hover fieldset": { borderColor: "#D21F3C" },
      "&.Mui-focused fieldset": { borderColor: "#D21F3C", borderWidth: 2 },
    },
  };

  const handleDiscard = () => {
    // Revoke all object URLs
    attachments.forEach(a => { if (a.previewUrl) URL.revokeObjectURL(a.previewUrl); });
    setAttachments([]);
    setForm({ supplier: "", purchaseDate: todayStr(), invoiceNo: "", paymentType: "Credit", notes: "", paymentMethod: "Bank Transfer", paymentRef: "", paidAmount: "", items: [] });
    onClose();
  };

  return (
    <ThemeProvider theme={theme}>
      <ItemPickerDialog open={pickerOpen} onClose={() => setPickerOpen(false)}
        alreadyAdded={alreadyAdded} onConfirm={handlePickerConfirm} />

      <Dialog open={open} onClose={handleDiscard} fullWidth maxWidth="lg"
        PaperProps={{ sx: { borderRadius: 3, maxHeight: "90vh", display: "flex", flexDirection: "column", boxShadow: "0 25px 60px rgba(15,23,42,0.2)" } }}>

        {/* Header */}
        <DialogTitle sx={{ px: 3, py: 2, borderBottom: "1px solid #F1F5F9", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0, position: "sticky", top: 0, zIndex: 10, bgcolor: "#fff" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box sx={{ p: 0.8, bgcolor: "rgba(210,31,60,0.08)", borderRadius: 2, display: "flex" }}>
              <ShoppingCartCheckoutIcon sx={{ color: "#D21F3C", fontSize: 20 }} />
            </Box>
            <Typography sx={{ fontSize: 17, fontWeight: 800, color: "#0F172A" }}>Add New Purchase</Typography>
          </Box>
          <IconButton size="small" onClick={handleDiscard}
            sx={{ color: "#6B7280", bgcolor: "#F9FAFB", "&:hover": { bgcolor: "#F3F4F6" }, borderRadius: "50%" }}>
            <CloseIcon sx={{ fontSize: 17 }} />
          </IconButton>
        </DialogTitle>

        {/* Body */}
        <DialogContent sx={{ px: 3, py: 3, overflowY: "auto", flex: 1 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>

            {/* Top 4 fields */}
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "1fr 1fr 1fr 1fr" }, gap: 2 }}>
              <Box>
                <FieldLabel>Supplier</FieldLabel>
                <FormControl size="small" fullWidth sx={inputSx}>
                  <Select value={form.supplier} onChange={e => setField("supplier", e.target.value)} displayEmpty
                    renderValue={v => v || <Typography sx={{ color: "#9CA3AF", fontSize: 13 }}>Select Supplier</Typography>}
                    sx={{ bgcolor: "#F8FAFC", fontSize: 13, borderRadius: "8px" }}>
                    {["Global Logistics Ltd", "Prime Wholesale Corp", "Direct Source Inc"].map(s => (
                      <MenuItem key={s} value={s} sx={{ fontSize: 13 }}>{s}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              <Box>
                <FieldLabel>Purchase Date</FieldLabel>
                <TextField type="date" size="small" fullWidth value={form.purchaseDate}
                  onChange={e => setField("purchaseDate", e.target.value)} sx={inputSx}
                  inputProps={{ style: { fontSize: 13 } }} />
              </Box>
              <Box>
                <FieldLabel>Invoice / Bill No.</FieldLabel>
                <TextField size="small" fullWidth value={form.invoiceNo}
                  onChange={e => setField("invoiceNo", e.target.value)}
                  placeholder="INV-2023-001" sx={inputSx} />
              </Box>
             
            </Box>

            {/* Items Section */}
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography sx={{ fontSize: 15, fontWeight: 800, color: "#1E293B" }}>Purchase Items</Typography>
                  {form.items.length > 0 && (
                    <Chip label={`${form.items.length} item${form.items.length !== 1 ? "s" : ""}`} size="small"
                      sx={{ fontSize: 10, fontWeight: 700, height: 20, bgcolor: "#FFF1F2", color: "#D21F3C", border: "1px solid #FECDD3" }} />
                  )}
                </Box>
                <Button size="small" startIcon={<AddIcon sx={{ fontSize: 15 }} />}
                  onClick={() => setPickerOpen(true)}
                  sx={{ fontSize: 12, fontWeight: 700, color: "#D21F3C", bgcolor: "rgba(210,31,60,0.07)", px: 1.5, py: 0.6, borderRadius: 1.5, "&:hover": { bgcolor: "rgba(210,31,60,0.14)" } }}>
                  Add Items
                </Button>
              </Box>
              <Paper elevation={0} sx={{ border: "1px solid #E5E7EB", borderRadius: 2, overflow: "hidden" }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Item</TableCell>
                      <TableCell align="center" sx={{ width: 80 }}>Qty</TableCell>
                      <TableCell sx={{ width: 150 }}>Unit Price</TableCell>
                      <TableCell align="center" sx={{ width: 90 }}>Tax %</TableCell>
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
                            <Button size="small" startIcon={<AddIcon sx={{ fontSize: 14 }} />}
                              onClick={() => setPickerOpen(true)}
                              sx={{ fontSize: 11, fontWeight: 700, mt: 0.5, color: "#D21F3C", bgcolor: "rgba(210,31,60,0.07)", px: 1.5, py: 0.5, borderRadius: 1.5, "&:hover": { bgcolor: "rgba(210,31,60,0.14)" } }}>
                              Browse &amp; Add Items
                            </Button>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ) : (
                      form.items.map(item => (
                        <TableRow key={item.id} sx={{ "&:hover": { bgcolor: "#FAFAFA" }, transition: "background 0.1s" }}>
                          <TableCell>
                            <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#0F172A" }}>{item.itemName}</Typography>
                            <Typography sx={{ fontSize: 10, color: "#9CA3AF", fontFamily: "monospace" }}>{item.sku} · {item.unit}</Typography>
                          </TableCell>
                          <TableCell align="center">
                            <TextField variant="standard" type="number" value={item.qty}
                              onChange={e => updateItem(item.id, "qty", Math.max(1, parseInt(e.target.value) || 1))}
                              InputProps={{ disableUnderline: true }}
                              inputProps={{ style: { fontSize: 13, textAlign: "center", padding: 0, width: 50 } }} />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
                              <Typography sx={{ fontSize: 12, color: "#9CA3AF", fontWeight: 700 }}>₹</Typography>
                              <TextField variant="standard" type="number"
                                value={item.unitPrice === 0 ? "" : item.unitPrice}
                                onChange={e => updateItem(item.id, "unitPrice", parseFloat(e.target.value) || 0)}
                                placeholder="0.00" InputProps={{ disableUnderline: true }}
                                inputProps={{ style: { fontSize: 13, padding: 0, width: 90 } }}
                                sx={{ "& input::placeholder": { color: "#CBD5E1" } }} />
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            <TextField variant="standard" type="number" value={item.taxPct}
                              onChange={e => updateItem(item.id, "taxPct", Math.max(0, parseFloat(e.target.value) || 0))}
                              InputProps={{ disableUnderline: true }}
                              inputProps={{ style: { fontSize: 13, textAlign: "center", padding: 0, width: 40 } }} />
                          </TableCell>
                          <TableCell align="right">
                            <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#374151", fontFamily: "monospace" }}>
                              {INR(itemSubtotal(item))}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Tooltip title="Remove" placement="top">
                              <IconButton size="small" onClick={() => removeItem(item.id)}
                                sx={{ color: "#D1D5DB", p: 0.5, borderRadius: 1, "&:hover": { color: "#EF4444", bgcolor: "#FEF2F2" }, transition: "all 0.12s" }}>
                                <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </Paper>
            </Box>

            {/* Bottom 3 columns */}
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr 1fr" }, gap: 3, alignItems: "start" }}>

              {/* Notes + Attachments */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                <Box>
                  <FieldLabel>Purchase Notes</FieldLabel>
                  <TextField multiline rows={3} fullWidth value={form.notes}
                    onChange={e => setField("notes", e.target.value)}
                    placeholder="Any additional notes about this purchase…" size="small" sx={inputSx} />
                </Box>
                <Box>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.5 }}>
                    <FieldLabel>Attachments</FieldLabel>
                    {attachments.length > 0 && (
                      <Chip label={`${attachments.length} file${attachments.length !== 1 ? "s" : ""}`} size="small"
                        sx={{ fontSize: 9, fontWeight: 700, height: 18, bgcolor: "#EFF6FF", color: "#1D4ED8", border: "1px solid #BFDBFE" }} />
                    )}
                  </Box>
                  <AttachmentsSection
                    attachments={attachments}
                    onAdd={handleAddAttachments}
                    onRemove={handleRemoveAttachment}
                  />
                </Box>
              </Box>

              {/* Payment Details */}
              <Paper elevation={0} sx={{ bgcolor: "#F8FAFC", border: "1px solid #E5E7EB", borderRadius: 3, p: 2.5, display: "flex", flexDirection: "column", gap: 2 }}>
                <Typography sx={{ fontSize: 12, fontWeight: 800, color: "#1E293B", letterSpacing: "0.04em", pb: 1, borderBottom: "1px solid #E5E7EB" }}>
                  PAYMENT DETAILS
                </Typography>
                <Box>
                  <FieldLabel>Payment Method</FieldLabel>
                  <FormControl size="small" fullWidth sx={inputSx}>
                    <Select value={form.paymentMethod} onChange={e => setField("paymentMethod", e.target.value as PaymentMethod)}
                      sx={{ bgcolor: "#fff", fontSize: 13, borderRadius: "8px" }}>
                      {(["Bank Transfer", "Cash", "UPI/Digital", "Cheque"] as PaymentMethod[]).map(v => (
                        <MenuItem key={v} value={v} sx={{ fontSize: 13 }}>{v}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
                <Box>
                  <FieldLabel>Payment Reference</FieldLabel>
                  <TextField size="small" fullWidth value={form.paymentRef}
                    onChange={e => setField("paymentRef", e.target.value)}
                    placeholder="Ref No. / Transaction ID"
                    sx={{ ...inputSx, "& .MuiOutlinedInput-root": { ...inputSx["& .MuiOutlinedInput-root"], bgcolor: "#fff" } }} />
                </Box>
              </Paper>

              {/* Order Summary */}
              <Paper elevation={0} sx={{ bgcolor: "#F8FAFC", border: "1px solid #E5E7EB", borderRadius: 3, p: 2.5, display: "flex", flexDirection: "column", gap: 2 }}>
                <Typography sx={{ fontSize: 12, fontWeight: 800, color: "#1E293B", letterSpacing: "0.04em", pb: 1, borderBottom: "1px solid #E5E7EB" }}>
                  ORDER SUMMARY
                </Typography>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 1.5, borderBottom: "1px solid #E5E7EB" }}>
                  <Typography sx={{ fontSize: 13, color: "#6B7280", fontWeight: 500 }}>Grand Total</Typography>
                  <Typography sx={{ fontSize: 18, fontWeight: 800, color: "#0F172A", fontFamily: "monospace" }}>{INR(grandTotal)}</Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1 }}>
                  <Typography sx={{ fontSize: 13, color: "#6B7280", fontWeight: 500, whiteSpace: "nowrap" }}>Paid Amount</Typography>
                  <TextField size="small" type="number" value={form.paidAmount}
                    onChange={e => setField("paidAmount", e.target.value)} placeholder="0.00"
                    InputProps={{ startAdornment: <InputAdornment position="start"><Typography sx={{ fontSize: 13, fontWeight: 700, color: "#9CA3AF" }}>₹</Typography></InputAdornment> }}
                    inputProps={{ style: { textAlign: "right", fontSize: 13, fontWeight: 600, padding: "6px 8px" } }}
                    sx={{ width: 130, "& .MuiOutlinedInput-root": { bgcolor: "#fff", borderRadius: "8px", fontSize: 13, "& fieldset": { borderColor: "#E2E8F0" }, "&:hover fieldset": { borderColor: "#D21F3C" }, "&.Mui-focused fieldset": { borderColor: "#D21F3C", borderWidth: 2 } } }} />
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pt: 1.5, borderTop: "1px solid #E5E7EB" }}>
                  <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#D21F3C" }}>Balance Due</Typography>
                  <Typography sx={{ fontSize: 17, fontWeight: 800, color: "#D21F3C", fontFamily: "monospace" }}>{INR(balanceDue)}</Typography>
                </Box>
              </Paper>
            </Box>
          </Box>
        </DialogContent>

        {/* Footer */}
        <DialogActions sx={{ px: 3, py: 2, bgcolor: "#F8FAFC", borderTop: "1px solid #F1F5F9", gap: 1.5, flexShrink: 0 }}>
          <Button onClick={handleDiscard}
            sx={{ color: "#374151", fontWeight: 700, px: 3, py: 1, fontSize: 13, borderRadius: 2, "&:hover": { bgcolor: "#F3F4F6" } }}>
            Discard
          </Button>
          <Button variant="contained" onClick={() => { onSave?.(form, attachments); onClose(); }}
            startIcon={<SaveOutlinedIcon sx={{ fontSize: 17 }} />} disableElevation
            sx={{ bgcolor: "#D21F3C", color: "#fff", fontWeight: 700, px: 3.5, py: 1, fontSize: 13, borderRadius: 2, boxShadow: "0 4px 16px rgba(210,31,60,0.28)", "&:hover": { bgcolor: "#B71C1C" }, "&:active": { transform: "scale(0.97)" }, transition: "all 0.15s" }}>
            Save Purchase
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
}