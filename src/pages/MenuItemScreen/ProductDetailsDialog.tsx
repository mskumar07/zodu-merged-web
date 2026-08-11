import { useState } from "react";
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Avatar,
  Chip,
  IconButton,
  Button,
  Collapse,
  CircularProgress,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PercentIcon from "@mui/icons-material/Percent";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import LabelIcon from "@mui/icons-material/Label";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { useMenuItemDetail } from "./useMenuItemApi";

interface Props {
  open: boolean;
  itemUuid: string | null;
  onClose: () => void;
  onEdit: (itemUuid: string) => void;
  onDelete?: (itemUuid: string) => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

const INR = (v: any) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(Number(v || 0));

const IconAccent: React.FC<{ bg: string; children: React.ReactNode }> = ({ bg, children }) => (
  <Box
    sx={{
      width: 36,
      height: 36,
      borderRadius: "10px",
      bgcolor: bg,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    }}
  >
    {children}
  </Box>
);

const InfoStatCard: React.FC<{
  iconBg: string;
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  sub?: string;
}> = ({ iconBg, icon, label, value, sub }) => (
  <Box
    sx={{
      display: "flex",
      gap: 1.2,
      p: 1.4,
      bgcolor: "#f9fafb",
      borderRadius: "12px",
      border: "1px solid #f0f0f0",
    }}
  >
    <IconAccent bg={iconBg}>{icon}</IconAccent>
    <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center", minWidth: 0 }}>
      <Typography sx={{ fontSize: "0.63rem", color: "#9ca3af", mb: 0.2 }}>{label}</Typography>
      <Typography sx={{ fontSize: "0.92rem", fontWeight: 700, color: "#111827", lineHeight: 1.2 }}>
        {value}
      </Typography>
      {sub !== undefined && (
        <Typography sx={{ fontSize: "0.62rem", color: "#6b7280", mt: 0.1 }}>{sub}</Typography>
      )}
    </Box>
  </Box>
);

const DetailRow: React.FC<{ label: string; value: React.ReactNode; copyValue?: string; last?: boolean }> = ({
  label,
  value,
  copyValue,
  last,
}) => (
  <Box
    sx={{
      px: 2,
      py: 1.2,
      borderTop: last ? undefined : "1px solid #f0f0f0",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    }}
  >
    <Typography sx={{ fontSize: "0.78rem", color: "#6b7280" }}>{label}</Typography>
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
      <Typography sx={{ fontSize: "0.78rem", fontWeight: 600, color: "#374151" }}>{value}</Typography>
      {copyValue && (
        <IconButton
          size="small"
          onClick={() => navigator.clipboard?.writeText(copyValue)}
          sx={{ p: 0.3, color: "#9ca3af", "&:hover": { color: "#374151" } }}
        >
          <ContentCopyIcon sx={{ fontSize: 15 }} />
        </IconButton>
      )}
    </Box>
  </Box>
);

export default function ProductDetailsDialog({ open, itemUuid, onClose, onEdit, onDelete, canEdit = true, canDelete = true }: Props) {
  const { data: item, isLoading } = useMenuItemDetail(itemUuid);
  const [showAdditional, setShowAdditional] = useState(true);

  if (isLoading || !item) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogContent sx={{ display: "flex", justifyContent: "center", alignItems: "center", p: 5 }}>
          {open && <CircularProgress />}
        </DialogContent>
      </Dialog>
    );
  }

  const isActive = item.status === "active";
  const gst = item.gst_rate ? parseFloat(item.gst_rate) : 0;
  const stockQty = item.available_qty != null ? parseInt(String(item.available_qty), 10) : null;
  const reorderLevel = item.reorder_level != null ? parseInt(String(item.reorder_level), 10) : null;
  const initials = (item.item_name || "?").slice(0, 2).toUpperCase();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: "20px", overflow: "hidden", boxShadow: "0 24px 60px rgba(0,0,0,0.18)" },
      }}
    >
      <Box
        sx={{
          px: 1,
          py: 1,
          display: "flex",
          alignItems: "center",
          gap: 0.5,
          borderBottom: "1px solid #f3f4f6",
        }}
      >
        <IconButton size="small" onClick={onClose} sx={{ color: "#374151" }}>
          <ArrowBackIcon sx={{ fontSize: 20 }} />
        </IconButton>
        <Typography sx={{ flex: 1, fontWeight: 700, fontSize: "1rem", color: "#111827", pl: 0.5 }}>
          Product Details
        </Typography>
        <IconButton size="small" onClick={onClose} sx={{ color: "#6b7280" }}>
          <CloseIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </Box>

      <DialogContent sx={{ px: 2.5, pt: 2.5, pb: 2 }}>
        <Box sx={{ display: "flex", gap: 2, mb: 2.5 }}>
          <Avatar
            src={item.item_img || undefined}
            variant="rounded"
            sx={{ width: 88, height: 88, borderRadius: "14px", flexShrink: 0, bgcolor: "#fde8e8" }}
          >
            <Typography sx={{ fontSize: "1.5rem", fontWeight: 700, color: "#c62828" }}>{initials}</Typography>
          </Avatar>

          <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 0.7, minWidth: 0 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.6, flexWrap: "wrap" }}>
              <Chip
                label={isActive ? "ACTIVE" : "INACTIVE"}
                size="small"
                sx={{
                  height: 22,
                  fontSize: "0.68rem",
                  fontWeight: 700,
                  bgcolor: isActive ? "#dcfce7" : "#f3f4f6",
                  color: isActive ? "#15803d" : "#4b5563",
                  "& .MuiChip-label": { px: 0.9 },
                }}
              />
              {item.category_name && (
                <Typography sx={{ fontSize: "0.75rem", color: "#6b7280" }}>{item.category_name}</Typography>
              )}
            </Box>

            <Typography
              sx={{ fontWeight: 800, fontSize: "1.15rem", color: "#111827", lineHeight: 1.3, wordBreak: "break-word" }}
            >
              {item.item_name}
            </Typography>

            <Typography sx={{ fontSize: "0.72rem", color: "#6b7280" }}>
              #{item.item_id}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ mb: 2.5 }}>
          <Typography sx={{ fontSize: "1.9rem", fontWeight: 800, color: "#111827", lineHeight: 1 }}>
            {INR(item.sell_price)}
          </Typography>
          <Typography sx={{ fontSize: "0.75rem", color: "#6b7280", mt: 0.4 }}>Selling Price</Typography>
        </Box>

        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.2, mb: 2 }}>
          <InfoStatCard
            iconBg="#dbeafe"
            icon={<PercentIcon sx={{ fontSize: 17, color: "#2563eb" }} />}
            label="GST Rate"
            value={<Box component="span" sx={{ color: "#1d4ed8" }}>{gst > 0 ? `${gst}%` : "—"}</Box>}
            sub={item.tax_incl_type ? "Inclusive" : "Exclusive"}
          />
          <InfoStatCard
            iconBg="#ede9fe"
            icon={<Inventory2Icon sx={{ fontSize: 17, color: "#7c3aed" }} />}
            label="Stock Qty"
            value={stockQty !== null ? stockQty : "—"}
            sub={`Alert at ${reorderLevel !== null ? reorderLevel : "—"}`}
          />
          <InfoStatCard
            iconBg="#dcfce7"
            icon={<CurrencyRupeeIcon sx={{ fontSize: 17, color: "#16a34a" }} />}
            label="Purchase Price"
            value={item.purchase_price ? INR(item.purchase_price) : "—"}
            sub={!item.purchase_price ? "Not Set" : undefined}
          />
          <InfoStatCard
            iconBg="#fef3c7"
            icon={<LabelIcon sx={{ fontSize: 17, color: "#d97706" }} />}
            label="MRP"
            value={item.mrp ? INR(item.mrp) : "—"}
          />
        </Box>

        <Box sx={{ border: "1px solid #f0f0f0", borderRadius: "12px", overflow: "hidden" }}>
          <Box
            onClick={() => setShowAdditional((v) => !v)}
            sx={{
              px: 2,
              py: 1.4,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              cursor: "pointer",
              bgcolor: "#fff",
              userSelect: "none",
              "&:hover": { bgcolor: "#fafafa" },
            }}
          >
            <Typography sx={{ fontWeight: 700, fontSize: "0.88rem", color: "#111827" }}>
              Additional Information
            </Typography>
            <ExpandMoreIcon
              sx={{
                fontSize: 20,
                color: "#6b7280",
                transform: showAdditional ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s ease",
              }}
            />
          </Box>
          <Collapse in={showAdditional}>
            <Box>
              <DetailRow label="Item ID" value={item.item_id} copyValue={item.item_id} />
              {item.hsn_code && <DetailRow label="HSN Code" value={item.hsn_code} />}
              {item.unit_name && <DetailRow label="Unit" value={item.unit_name} />}
              {item.sku && <DetailRow label="SKU" value={item.sku} />}
              {item.barcode && <DetailRow label="Barcode" value={item.barcode} last />}
            </Box>
          </Collapse>
        </Box>
      </DialogContent>

      <Box sx={{ px: 2.5, py: 1.5, borderTop: "1px solid #f0f0f0", display: "flex", gap: 1.5 }}>
        <Button
          fullWidth
          variant="outlined"
          disabled={!canDelete}
          startIcon={<DeleteIcon sx={{ fontSize: 17 }} />}
          onClick={() => { onClose(); onDelete?.(item.item_uuid); }}
          sx={{
            textTransform: "none",
            borderRadius: "14px",
            borderColor: "#fca5a5",
            color: "#d32f2f",
            fontSize: "0.88rem",
            fontWeight: 600,
            py: 1.1,
            "&:hover": { bgcolor: "#fef2f2", borderColor: "#d32f2f" },
          }}
        >
          Delete Item
        </Button>
        <Button
          fullWidth
          variant="contained"
          disabled={!canEdit}
          startIcon={<EditIcon sx={{ fontSize: 17 }} />}
          onClick={() => { onClose(); onEdit(item.item_uuid); }}
          sx={{
            textTransform: "none",
            borderRadius: "14px",
            bgcolor: "#2563eb",
            fontSize: "0.88rem",
            fontWeight: 600,
            py: 1.1,
            boxShadow: "none",
            "&:hover": { bgcolor: "#1d4ed8", boxShadow: "none" },
          }}
        >
          Edit Item
        </Button>
      </Box>
    </Dialog>
  );
}
