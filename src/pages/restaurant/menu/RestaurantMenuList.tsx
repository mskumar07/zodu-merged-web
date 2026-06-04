import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Avatar,
  Box,
  Chip,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  IconButton,
  InputAdornment,
  Button,
  MenuItem,
  Select,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import FilterListIcon from "@mui/icons-material/FilterList";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PercentIcon from "@mui/icons-material/Percent";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import LabelIcon from "@mui/icons-material/Label";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import AddIcon from "@mui/icons-material/Add";
import DataTable, { type ColumnDef } from "@utils/DataTable";
import {
  useInfiniteRestaurantMenu,
  type RestaurantMenuListItem,
} from "./restaurantMenuApi";

const BRANCH_ID = "ZODU035B1";

const FOOD_COLOR: Record<string, { dot: string; bg: string; label: string }> = {
  veg:     { dot: "#16a34a", bg: "#dcfce7", label: "Veg" },
  non_veg: { dot: "#dc2626", bg: "#fee2e2", label: "Non-Veg" },
  egg:     { dot: "#d97706", bg: "#fef3c7", label: "Egg" },
};

function foodStyle(type: string | null) {
  return FOOD_COLOR[(type ?? "veg").toLowerCase()] ?? FOOD_COLOR.veg;
}

// ─── Item Detail Dialog ────────────────────────────────────────────────────────

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

const ItemDetailDialog: React.FC<{
  item: RestaurantMenuListItem | null;
  onClose: () => void;
  onEdit: (item: RestaurantMenuListItem) => void;
  onDelete: (item: RestaurantMenuListItem) => void;
}> = ({ item, onClose, onEdit, onDelete }) => {
  const [showAdditional, setShowAdditional] = useState(true);

  useEffect(() => {
    setShowAdditional(true);
  }, [item?.menu_id]);

  if (!item) return null;

  const price = parseFloat(item.sell_price) || 0;
  const purchasePrice =
    item.purchase_price && item.purchase_price !== "NULL"
      ? parseFloat(item.purchase_price)
      : null;
  const { dot, bg, label: foodLabel } = foodStyle(item.food_type);
  const gst = parseFloat(item.gst_tax) || 0;
  const initials = item.menu_name.slice(0, 2).toUpperCase();

  return (
    <Dialog
      open={!!item}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "20px",
          overflow: "hidden",
          boxShadow: "0 24px 60px rgba(0,0,0,0.18)",
        },
      }}
    >
      {/* ── Header ── */}
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
          Item Details
        </Typography>
        <IconButton size="small" sx={{ color: "#6b7280" }}>
          <MoreVertIcon sx={{ fontSize: 20 }} />
        </IconButton>
        <IconButton size="small" onClick={onClose} sx={{ color: "#6b7280" }}>
          <CloseIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </Box>

      <DialogContent sx={{ px: 2.5, pt: 2.5, pb: 2 }}>
        {/* ── Image + Info row ── */}
        <Box sx={{ display: "flex", gap: 2, mb: 2.5 }}>
          {/* Square image */}
          <Box
            sx={{
              width: 130,
              height: 130,
              flexShrink: 0,
              borderRadius: "14px",
              overflow: "hidden",
              bgcolor: "#fde8e8",
            }}
          >
            {item.menu_image ? (
              <Box
                component="img"
                src={item.menu_image}
                alt={item.menu_name}
                sx={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <Box
                sx={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography sx={{ fontSize: "1.8rem", fontWeight: 700, color: "#c62828" }}>
                  {initials}
                </Typography>
              </Box>
            )}
          </Box>

          {/* Info */}
          <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 0.7, minWidth: 0 }}>
            <Typography
              sx={{
                fontWeight: 800,
                fontSize: "1.05rem",
                color: "#111827",
                lineHeight: 1.3,
                wordBreak: "break-word",
              }}
            >
              {item.menu_name}
            </Typography>
            <Typography sx={{ fontSize: "0.72rem", color: "#6b7280" }}>
              #{item.menu_code} · {item.category}
            </Typography>

            {/* Active chip */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  bgcolor: item.active ? "#16a34a" : "#6b7280",
                  flexShrink: 0,
                }}
              />
              <Typography
                sx={{
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  color: item.active ? "#15803d" : "#4b5563",
                  bgcolor: item.active ? "#dcfce7" : "#f3f4f6",
                  px: 1,
                  py: 0.2,
                  borderRadius: "20px",
                }}
              >
                {item.active ? "Active" : "Inactive"}
              </Typography>
            </Box>

            {/* Type chips */}
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.6 }}>
              <Chip
                label={foodLabel}
                size="small"
                sx={{
                  height: 22,
                  fontSize: "0.68rem",
                  fontWeight: 600,
                  bgcolor: bg,
                  color: dot,
                  "& .MuiChip-label": { px: 0.9 },
                }}
              />
              <Chip
                label={item.menu_type}
                size="small"
                sx={{
                  height: 22,
                  fontSize: "0.68rem",
                  bgcolor: "#f5f3ff",
                  color: "#6d28d9",
                  "& .MuiChip-label": { px: 0.9 },
                }}
              />
            </Box>
          </Box>
        </Box>

        {/* ── Selling Price ── */}
        <Box sx={{ mb: 2.5 }}>
          <Typography sx={{ fontSize: "1.9rem", fontWeight: 800, color: "#111827", lineHeight: 1 }}>
            ₹{price.toFixed(2)}
          </Typography>
          <Typography sx={{ fontSize: "0.75rem", color: "#6b7280", mt: 0.4 }}>Selling Price</Typography>
        </Box>

        {/* ── 2×2 Stat Cards ── */}
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.2, mb: 2 }}>
          <InfoStatCard
            iconBg="#dbeafe"
            icon={<PercentIcon sx={{ fontSize: 17, color: "#2563eb" }} />}
            label="GST Rate"
            value={<Box component="span" sx={{ color: "#1d4ed8" }}>{gst > 0 ? `${gst}%` : "—"}</Box>}
            sub={item.tax_include_or_exclude ? "Inclusive" : "Exclusive"}
          />
          <InfoStatCard
            iconBg="#ede9fe"
            icon={<Inventory2Icon sx={{ fontSize: 17, color: "#7c3aed" }} />}
            label="Stock Qty"
            value={item.stock_qty ?? "—"}
            sub={`Alert at ${item.stock_alert ?? "—"}`}
          />
          <InfoStatCard
            iconBg="#dcfce7"
            icon={<CurrencyRupeeIcon sx={{ fontSize: 17, color: "#16a34a" }} />}
            label="Purchase Price"
            value={purchasePrice !== null ? `₹${purchasePrice.toFixed(2)}` : "—"}
            sub={purchasePrice === null ? "Not Set" : undefined}
          />
          <InfoStatCard
            iconBg="#fef3c7"
            icon={<LabelIcon sx={{ fontSize: 17, color: "#d97706" }} />}
            label="Category"
            value={item.category}
          />
        </Box>

        {/* ── Additional Information (collapsible) ── */}
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
            <Box sx={{ borderTop: "1px solid #f0f0f0" }}>
              {/* Menu ID */}
              <Box
                sx={{
                  px: 2,
                  py: 1.2,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography sx={{ fontSize: "0.78rem", color: "#6b7280" }}>Menu ID</Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <Typography
                    sx={{
                      fontSize: "0.76rem",
                      fontWeight: 600,
                      color: "#374151",
                      fontFamily: "monospace",
                      maxWidth: 160,
                      textAlign: "right",
                      wordBreak: "break-all",
                    }}
                  >
                    {item.menu_id}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => navigator.clipboard?.writeText(item.menu_id)}
                    sx={{ p: 0.3, color: "#9ca3af", "&:hover": { color: "#374151" } }}
                  >
                    <ContentCopyIcon sx={{ fontSize: 15 }} />
                  </IconButton>
                </Box>
              </Box>

              {item.hsn_code && (
                <Box
                  sx={{
                    px: 2,
                    py: 1.2,
                    borderTop: "1px solid #f0f0f0",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography sx={{ fontSize: "0.78rem", color: "#6b7280" }}>HSN Code</Typography>
                  <Typography sx={{ fontSize: "0.78rem", fontWeight: 600, color: "#374151" }}>
                    {item.hsn_code}
                  </Typography>
                </Box>
              )}

              {item.menu_unit && (
                <Box
                  sx={{
                    px: 2,
                    py: 1.2,
                    borderTop: "1px solid #f0f0f0",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography sx={{ fontSize: "0.78rem", color: "#6b7280" }}>Unit</Typography>
                  <Typography sx={{ fontSize: "0.78rem", fontWeight: 600, color: "#374151" }}>
                    {item.menu_unit}
                  </Typography>
                </Box>
              )}
            </Box>
          </Collapse>
        </Box>

        {/* ── Variants ── */}
        {item.variants && item.variants.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography
              sx={{
                fontSize: "0.68rem",
                fontWeight: 700,
                color: "#6b7280",
                mb: 0.8,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Variants
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.6 }}>
              {item.variants.map((v, i) => (
                <Box
                  key={i}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    px: 1.4,
                    py: 0.8,
                    bgcolor: "#f9fafb",
                    borderRadius: "8px",
                    border: "1px solid #f0f0f0",
                  }}
                >
                  <Typography sx={{ fontSize: "0.78rem", color: "#374151", fontWeight: 500 }}>
                    {v.variant_name}
                  </Typography>
                  <Typography sx={{ fontSize: "0.82rem", fontWeight: 700, color: "#d32f2f" }}>
                    ₹{parseFloat(v.price).toFixed(2)}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </DialogContent>

      {/* ── Footer actions ── */}
      <Box
        sx={{
          px: 2.5,
          py: 1.5,
          borderTop: "1px solid #f0f0f0",
          display: "flex",
          gap: 1.5,
        }}
      >
        <Button
          fullWidth
          variant="outlined"
          startIcon={<DeleteIcon sx={{ fontSize: 17 }} />}
          onClick={() => { onClose(); onDelete(item); }}
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
          startIcon={<EditIcon sx={{ fontSize: 17 }} />}
          onClick={() => { onClose(); onEdit(item); }}
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
};

// ─── Delete Confirm Dialog ────────────────────────────────────────────────────

const DeleteConfirmDialog: React.FC<{
  item: RestaurantMenuListItem | null;
  onConfirm: () => void;
  onClose: () => void;
}> = ({ item, onConfirm, onClose }) => (
  <Dialog open={!!item} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: "12px" } }}>
    <DialogTitle sx={{ fontWeight: 700, fontSize: "1rem", pb: 1 }}>Delete Menu Item</DialogTitle>
    <DialogContent>
      <Typography variant="body2" color="text.secondary">
        Are you sure you want to delete <strong>{item?.menu_name}</strong>? This action cannot be undone.
      </Typography>
    </DialogContent>
    <DialogActions sx={{ px: 2.5, pb: 2, gap: 1 }}>
      <Button onClick={onClose} variant="outlined" size="small" sx={{ textTransform: "none", borderRadius: "8px", borderColor: "#e5e7eb", color: "#374151" }}>
        Cancel
      </Button>
      <Button
        onClick={onConfirm}
        variant="contained"
        size="small"
        sx={{ textTransform: "none", borderRadius: "8px", bgcolor: "#d32f2f", "&:hover": { bgcolor: "#b71c1c" } }}
      >
        Delete
      </Button>
    </DialogActions>
  </Dialog>
);

// ─── Main screen ──────────────────────────────────────────────────────────────

const RestaurantMenuList: React.FC = () => {
  const branchId = BRANCH_ID;

  const [search, setSearch]                   = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categoryFilter, setCategoryFilter]   = useState("all");
  const [detailItem, setDetailItem]           = useState<RestaurantMenuListItem | null>(null);
  const [deleteItem, setDeleteItem]           = useState<RestaurantMenuListItem | null>(null);
  const [favOverrides, setFavOverrides]       = useState<Record<string, boolean>>({});
  const [activeOverrides, setActiveOverrides] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError } =
    useInfiniteRestaurantMenu(branchId, debouncedSearch);

  const allItems = useMemo(() => data?.pages.flatMap((p) => p.data) ?? [], [data]);
  const totalCount = data?.pages[0]?.pagination.total_count ?? 0;

  // Unique categories from loaded data
  const categories = useMemo(() => {
    const set = new Set(allItems.map((i) => i.category));
    return Array.from(set).sort();
  }, [allItems]);

  // Client-side category filter
  const filteredItems = useMemo(
    () => (categoryFilter === "all" ? allItems : allItems.filter((i) => i.category === categoryFilter)),
    [allItems, categoryFilter]
  );

  // Infinite scroll refs
  const loadMoreRef  = useRef<HTMLTableRowElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage();
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  );

  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(handleObserver, { threshold: 0.1 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [handleObserver, allItems.length]);

  const handleToggleFav = (item: RestaurantMenuListItem) => {
    const current = favOverrides[item.menu_id] ?? item.favorites;
    setFavOverrides((prev) => ({ ...prev, [item.menu_id]: !current }));
  };

  const handleToggleActive = (item: RestaurantMenuListItem) => {
    const current = activeOverrides[item.menu_id] ?? item.active;
    setActiveOverrides((prev) => ({ ...prev, [item.menu_id]: !current }));
  };

  const handleDeleteConfirm = () => {
    // wire to delete API here
    setDeleteItem(null);
  };

  // ── Column definitions ────────────────────────────────────────────────────────
  const columns = useMemo<ColumnDef<RestaurantMenuListItem>[]>(
    () => [
      {
        key: "menu_code",
        label: "Item ID",
        width: 90,
        render: (row) => (
          <Typography
            onClick={(e) => { e.stopPropagation(); setDetailItem(row); }}
            sx={{
              fontSize: "0.78rem",
              fontWeight: 600,
              color: "#1d4ed8",
              cursor: "pointer",
              fontFamily: "monospace",
              textDecoration: "underline",
              textDecorationStyle: "dotted",
              "&:hover": { color: "#1e40af" },
            }}
          >
            #{row.menu_code}
          </Typography>
        ),
      },
      {
        key: "menu_name",
        label: "Item Name",
        minWidth: 180,
        render: (row) => {
          const initials = row.menu_name.slice(0, 2).toUpperCase();
          return (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
              {row.menu_image ? (
                <Avatar src={row.menu_image} alt={row.menu_name} variant="rounded" sx={{ width: 30, height: 30, flexShrink: 0 }} />
              ) : (
                <Avatar
                  variant="rounded"
                  sx={{ width: 30, height: 30, flexShrink: 0, bgcolor: "rgba(211,47,47,0.1)", color: "#c62828", fontSize: "0.68rem", fontWeight: 700 }}
                >
                  {initials}
                </Avatar>
              )}
              <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, color: "#111827" }} noWrap>
                {row.menu_name}
              </Typography>
            </Box>
          );
        },
      },
      {
        key: "category",
        label: "Category",
        minWidth: 140,
        render: (row) => (
          <Typography sx={{ fontSize: "0.78rem", color: "#374151" }} noWrap>{row.category}</Typography>
        ),
      },
      {
        key: "food_type",
        label: "Type",
        width: 90,
        align: "center",
        render: (row) => {
          const { dot, bg, label } = foodStyle(row.food_type);
          return (
            <Chip label={label} size="small" sx={{ height: 20, fontSize: "0.65rem", fontWeight: 600, bgcolor: bg, color: dot, "& .MuiChip-label": { px: 0.8 } }} />
          );
        },
      },
      {
        key: "sell_price",
        label: "Sell Price",
        width: 90,
        align: "right",
        render: (row) => (
          <Typography sx={{ fontSize: "0.82rem", fontWeight: 700, color: "#111827" }}>
            ₹{(parseFloat(row.sell_price) || 0).toFixed(2)}
          </Typography>
        ),
      },
      {
        key: "purchase_price",
        label: "Purchase",
        width: 90,
        align: "right",
        render: (row) => {
          const p = row.purchase_price && row.purchase_price !== "NULL" ? parseFloat(row.purchase_price) : null;
          return (
            <Typography sx={{ fontSize: "0.82rem", color: p !== null ? "#374151" : "#d1d5db" }}>
              {p !== null ? `₹${p.toFixed(2)}` : "—"}
            </Typography>
          );
        },
      },
      {
        key: "gst",
        label: "GST",
        width: 70,
        align: "center",
        render: (row) => {
          const g = parseFloat(row.gst_tax) || 0;
          return g > 0 ? (
            <Chip label={`${g}%`} size="small" sx={{ height: 20, fontSize: "0.65rem", fontWeight: 600, bgcolor: "#eff6ff", color: "#1d4ed8", "& .MuiChip-label": { px: 0.8 } }} />
          ) : (
            <Typography sx={{ fontSize: "0.78rem", color: "#d1d5db" }}>—</Typography>
          );
        },
      },
      {
        key: "tax_type",
        label: "Tax Type",
        width: 100,
        align: "center",
        render: (row) => (
          <Chip
            label={row.tax_include_or_exclude ? "Inclusive" : "Exclusive"}
            size="small"
            sx={{ height: 20, fontSize: "0.65rem", fontWeight: 600, bgcolor: row.tax_include_or_exclude ? "#dcfce7" : "#fef9c3", color: row.tax_include_or_exclude ? "#15803d" : "#92400e", "& .MuiChip-label": { px: 0.8 } }}
          />
        ),
      },
      {
        key: "status",
        label: "Active",
        width: 80,
        align: "center",
        render: (row) => {
          const isActive = activeOverrides[row.menu_id] ?? row.active;
          return (
            <Switch
              checked={isActive}
              size="small"
              onClick={(e) => e.stopPropagation()}
              onChange={() => handleToggleActive(row)}
              sx={{
                "& .MuiSwitch-switchBase.Mui-checked": { color: "#16a34a" },
                "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: "#16a34a" },
              }}
            />
          );
        },
      },
      {
        key: "actions",
        label: "Actions",
        width: 110,
        align: "center",
        render: (row) => {
          const isFav = favOverrides[row.menu_id] ?? row.favorites;
          return (
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.2 }}>
              <Tooltip title={isFav ? "Remove from favorites" : "Add to favorites"}>
                <IconButton
                  size="small"
                  onClick={(e) => { e.stopPropagation(); handleToggleFav(row); }}
                  sx={{ color: isFav ? "#f59e0b" : "#d1d5db", "&:hover": { color: "#f59e0b", bgcolor: "#fef9c3" } }}
                >
                  {isFav ? <StarIcon sx={{ fontSize: 18 }} /> : <StarBorderIcon sx={{ fontSize: 18 }} />}
                </IconButton>
              </Tooltip>
              <Tooltip title="Edit">
                <IconButton
                  size="small"
                  onClick={(e) => { e.stopPropagation(); setDetailItem(row); }}
                  sx={{ color: "#6b7280", "&:hover": { color: "#1d4ed8", bgcolor: "#eff6ff" } }}
                >
                  <EditIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete">
                <IconButton
                  size="small"
                  onClick={(e) => { e.stopPropagation(); setDeleteItem(row); }}
                  sx={{ color: "#6b7280", "&:hover": { color: "#d32f2f", bgcolor: "#fef2f2" } }}
                >
                  <DeleteIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            </Box>
          );
        },
      },
    ],
    [favOverrides, activeOverrides]
  );

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column", bgcolor: "#f9fafb" }}>
      {/* Top bar */}
      <Box
        sx={{
          px: { xs: 2, md: 3 },
          py: 1.5,
          bgcolor: "#fff",
          borderBottom: "1px solid #f3f4f6",
          display: "flex",
          alignItems: "center",
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        {/* Title */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flex: "0 0 auto" }}>
          <RestaurantMenuIcon sx={{ color: "#d32f2f", fontSize: 22 }} />
          <Typography sx={{ fontWeight: 800, fontSize: "1.1rem", color: "#111827" }}>Menu Items</Typography>
          {totalCount > 0 && (
            <Chip
              label={totalCount}
              size="small"
              sx={{ height: 20, fontSize: "0.68rem", fontWeight: 700, bgcolor: "#fef2f2", color: "#d32f2f", "& .MuiChip-label": { px: 0.8 } }}
            />
          )}
        </Box>

        {/* Search */}
        <TextField
          size="small"
          placeholder="Search items…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 18, color: "#9ca3af" }} />
              </InputAdornment>
            ),
            endAdornment: search ? (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setSearch("")}>
                  <CloseIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </InputAdornment>
            ) : null,
          }}
          sx={{
            flex: 1,
          
            "& .MuiOutlinedInput-root": {
              borderRadius: "10px",
              fontSize: "0.85rem",
              "&.Mui-focused fieldset": { borderColor: "#d32f2f" },
            },
          }}
        />

        {/* Category filter */}
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            displayEmpty
            startAdornment={<FilterListIcon sx={{ fontSize: 16, color: "#9ca3af", mr: 0.5 }} />}
            sx={{
              borderRadius: "10px",
              fontSize: "0.85rem",
              "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e5e7eb" },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#d32f2f" },
            }}
          >
            <MenuItem value="all">
              <Typography sx={{ fontSize: "0.83rem" }}>All Categories</Typography>
            </MenuItem>
            <Divider />
            {categories.map((cat) => (
              <MenuItem key={cat} value={cat}>
                <Typography sx={{ fontSize: "0.83rem" }}>{cat}</Typography>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Create button */}
        <Button
          variant="contained"
          startIcon={<AddIcon sx={{ fontSize: 18 }} />}
          sx={{
            textTransform: "none",
            borderRadius: "10px",
            bgcolor: "#d32f2f",
            fontWeight: 600,
            fontSize: "0.85rem",
            px: 2,
            py: 0.85,
            boxShadow: "none",
            whiteSpace: "nowrap",
            ml: "auto",
            "&:hover": { bgcolor: "#b71c1c", boxShadow: "none" },
          }}
        >
          Create Menu Item
        </Button>
      </Box>

      {/* Table area */}
      <Box sx={{ flex: 1, minHeight: 0, px: { xs: 2, md: 3 }, py: 2 }}>
        {isError ? (
          <Box sx={{ textAlign: "center", pt: 8, color: "#6b7280" }}>
            <Typography>Failed to load menu items. Please try again.</Typography>
          </Box>
        ) : (
          <DataTable
            columns={columns}
            rows={filteredItems}
            rowKey={(row) => row.menu_id}
            isLoading={isLoading}
            hasNextPage={categoryFilter === "all" ? hasNextPage : false}
            isFetchingNextPage={isFetchingNextPage}
            loadMoreRef={loadMoreRef}
            tableContainerRef={containerRef}
            maxHeight="100%"
            emptyMessage="No menu items found."
          />
        )}
      </Box>

      {/* Item detail dialog */}
      <ItemDetailDialog
        item={detailItem}
        onClose={() => setDetailItem(null)}
        onEdit={(item) => setDetailItem(item)}
        onDelete={(item) => setDeleteItem(item)}
      />

      {/* Delete confirm */}
      <DeleteConfirmDialog
        item={deleteItem}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeleteItem(null)}
      />
    </Box>
  );
};

export default RestaurantMenuList;
