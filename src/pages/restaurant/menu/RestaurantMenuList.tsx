import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Avatar,
  Box,
  Checkbox,
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
  ListItemText,
  MenuItem,
  OutlinedInput,
  Select,
  Switch,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
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
import { useSelector } from "react-redux";
import DataTable, { type ColumnDef } from "@utils/DataTable";
import {
  useInfiniteRestaurantMenu,
  useInfiniteRestaurantCategories,
  updateMenuStatus,
  updateMenuFav,
  deleteMenuItem,
  type RestaurantMenuListItem,
} from "./restaurantMenuApi";
import AddRestaurantMenuItemDialog from "./AddRestaurantMenuItemDialog";
import CategoryTab from "@pages/MenuItemScreen/CategoryTab";
import { BranchId, ZoduId } from "@store/slices/userSlice";

type MenuTab = "all" | "food" | "product" | "Category";

const TABS: { value: MenuTab; label: string }[] = [
  { value: "all",     label: "All Items" },
  { value: "food",    label: "Food"      },
  { value: "product", label: "Product"   },
  { value: "Category", label: "Category"   },
];

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
        <Box sx={{ display: "flex", gap: 2, mb: 2.5 }}>
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

        <Box sx={{ mb: 2.5 }}>
          <Typography sx={{ fontSize: "1.9rem", fontWeight: 800, color: "#111827", lineHeight: 1 }}>
            ₹{price.toFixed(2)}
          </Typography>
          <Typography sx={{ fontSize: "0.75rem", color: "#6b7280", mt: 0.4 }}>Selling Price</Typography>
        </Box>

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
            sub={`Alert at ${item.alert_stock ?? item.stock_alert ?? "—"}`}
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

        {(() => {
          let parsedVariants = item.variants;
          if (typeof parsedVariants === "string") {
            try { parsedVariants = JSON.parse(parsedVariants); } catch { parsedVariants = []; }
          }
          if (!Array.isArray(parsedVariants) || parsedVariants.length === 0) return null;
          return (
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
              {parsedVariants.map((v: { id?: string; name?: string; variant_name?: string; price?: string }, i: number) => (
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
                    {v.name ?? v.variant_name}
                  </Typography>
                  <Typography sx={{ fontSize: "0.82rem", fontWeight: 700, color: "#d32f2f" }}>
                    ₹{parseFloat(v.price ?? "0").toFixed(2)}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
          );
        })()}
      </DialogContent>

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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  const branchId = useSelector(BranchId) ?? "";
  const zoduId   = useSelector(ZoduId)   ?? "";

  const [activeTab, setActiveTab]                   = useState<MenuTab>("all");
  const [search, setSearch]                         = useState("");
  const [debouncedSearch, setDebouncedSearch]       = useState("");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [detailItem, setDetailItem]           = useState<RestaurantMenuListItem | null>(null);
  const [deleteItem, setDeleteItem]           = useState<RestaurantMenuListItem | null>(null);
  const [addMenuOpen, setAddMenuOpen]         = useState(false);
  const [editItem, setEditItem]               = useState<RestaurantMenuListItem | null>(null);
  const [favOverrides, setFavOverrides]       = useState<Record<string, boolean>>({});
  const [activeOverrides, setActiveOverrides] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const menuType = (activeTab === "all" || activeTab === "Category") ? undefined : activeTab;
  const categoryIdsParam = selectedCategoryIds.length > 0 ? selectedCategoryIds : undefined;

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError, refetch } =
    useInfiniteRestaurantMenu(zoduId, branchId, debouncedSearch, menuType, categoryIdsParam);

  const categoryTypes = (activeTab === "all" || activeTab === "Category") ? undefined : [activeTab];
  const {
    data: categoryPagesData,
    fetchNextPage: fetchNextCategoryPage,
    hasNextPage: hasNextCategoryPage,
    isFetchingNextPage: isFetchingNextCategoryPage,
  } = useInfiniteRestaurantCategories(zoduId, branchId, categoryTypes);

  const categories = useMemo(
    () => categoryPagesData?.pages.flatMap((p) => p.data) ?? [],
    [categoryPagesData]
  );

  const allItems   = useMemo(() => data?.pages.flatMap((p) => p.data) ?? [], [data]);
  const totalCount = data?.pages[0]?.pagination.total_count ?? 0;

  const handleTabChange = (_: React.SyntheticEvent, tab: MenuTab) => {
    setActiveTab(tab);
    setSelectedCategoryIds([]);
  };

  const handleCategoryDropdownScroll = (e: React.UIEvent<HTMLElement>) => {
    const el = e.currentTarget;
    if (el.scrollHeight - el.scrollTop <= el.clientHeight + 40) {
      if (hasNextCategoryPage && !isFetchingNextCategoryPage) fetchNextCategoryPage();
    }
  };

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

  const handleToggleFav = useCallback(async (item: RestaurantMenuListItem) => {
    const current = favOverrides[item.menu_id] ?? item.favorites;
    const next = !current;
    setFavOverrides((prev) => ({ ...prev, [item.menu_id]: next }));
    try {
      await updateMenuFav(item.menu_id, next);
    } catch {
      setFavOverrides((prev) => ({ ...prev, [item.menu_id]: current }));
    }
  }, [favOverrides]);

  const handleToggleActive = useCallback(async (item: RestaurantMenuListItem) => {
    const current = activeOverrides[item.menu_id] ?? item.active;
    const next = !current;
    setActiveOverrides((prev) => ({ ...prev, [item.menu_id]: next }));
    try {
      await updateMenuStatus(item.menu_id, next);
    } catch {
      setActiveOverrides((prev) => ({ ...prev, [item.menu_id]: current }));
    }
  }, [activeOverrides]);

  const handleDeleteConfirm = async () => {
    if (!deleteItem) return;
    try {
      await deleteMenuItem(deleteItem.menu_id);
      setDeleteItem(null);
      refetch();
    } catch {
      setDeleteItem(null);
    }
  };

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
              fontSize: 13,
              fontWeight: 600,
              color: "#1976d2",
              cursor: "pointer",
              "&:hover": { textDecoration: "underline" },
            }}
          >
            #{row.menu_code}
          </Typography>
        ),
      },
      {
        key: "menu_name",
        label: "Item Name",
        width: 280,
        render: (row) => {
          const initials = row.menu_name.slice(0, 2).toUpperCase();
          const ft = (row.food_type ?? "").toLowerCase();
          const isNonVeg = ft === "nonveg" || ft === "non_veg" || ft === "non-veg";
          const isEgg = ft === "egg";
          const dotColor = isNonVeg ? "#dc2626" : isEgg ? "#d97706" : "#16a34a";
          return (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {row.menu_image ? (
                <Avatar
                  src={row.menu_image}
                  alt={row.menu_name}
                  variant="rounded"
                  sx={{
                    width: 40,
                    height: 40,
                    flexShrink: 0,
                    border: `1px solid ${theme.palette.divider}`,
                  }}
                />
              ) : (
                <Avatar
                  variant="rounded"
                  sx={{
                    width: 40,
                    height: 40,
                    flexShrink: 0,
                    bgcolor: "rgba(211,47,47,0.1)",
                    color: "#c62828",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    border: `1px solid ${theme.palette.divider}`,
                  }}
                >
                  {initials}
                </Avatar>
              )}
              <Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <Box
                    sx={{
                      width: 14,
                      height: 14,
                      borderRadius: "3px",
                      border: `1.5px solid ${dotColor}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Box
                      sx={{
                        width: 7,
                        height: 7,
                        borderRadius: "50%",
                        bgcolor: dotColor,
                      }}
                    />
                  </Box>
                  <Typography sx={{ fontWeight: 600, lineHeight: 1.4, fontSize: 13, color: "#374151", whiteSpace: "normal", wordBreak: "break-word", width: 340 }}>
                    {row.menu_name}
                  </Typography>
                </Box>
                <Typography sx={{ fontSize: 13, color: "#374151", whiteSpace: "normal", wordBreak: "break-word", width: 340 }}>
                  {row.category}
                </Typography>
              </Box>
            </Box>
          );
        },
      },
      {
        key: "sell_price",
        label: "Rate",
        width: 90,
        align: "right" as const,
        render: (row: RestaurantMenuListItem) => (
          <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>
            ₹{(parseFloat(row.sell_price) || 0).toFixed(2)}
          </Typography>
        ),
      },
      ...(!isTablet ? [{
        key: "purchase_price",
        label: "Purchase Price",
        width: 110,
        align: "right" as const,
        render: (row: RestaurantMenuListItem) => {
          const p = row.purchase_price && row.purchase_price !== "NULL" ? parseFloat(row.purchase_price) : null;
          return (
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>
              {p !== null ? `₹${p.toFixed(2)}` : "—"}
            </Typography>
          );
        },
      }] : []),
      {
        key: "status",
        label: "Status",
        width: 80,
        align: "center" as const,
        render: (row: RestaurantMenuListItem) => {
          const isActive = activeOverrides[row.menu_id] ?? row.active;
          return (
            <Switch
              checked={isActive}
              size="small"
              color="primary"
              onClick={(e) => e.stopPropagation()}
              onChange={() => handleToggleActive(row)}
            />
          );
        },
      },
      {
        key: "actions",
        label: "Actions",
        width: isMobile ? 80 : 110,
        align: "center" as const,
        render: (row: RestaurantMenuListItem) => {
          const isFav = favOverrides[row.menu_id] ?? row.favorites;
          return (
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5 }}>
              {!isMobile && (
                <Tooltip title={isFav ? "Remove from favorites" : "Add to favorites"}>
                  <IconButton
                    size="small"
                    onClick={(e) => { e.stopPropagation(); handleToggleFav(row); }}
                    sx={{ color: isFav ? "#f59e0b" : "text.disabled", "&:hover": { color: "#f59e0b", bgcolor: "#fef9c3" }, borderRadius: 1.5 }}
                  >
                    {isFav ? <StarIcon sx={{ fontSize: 18 }} /> : <StarBorderIcon sx={{ fontSize: 18 }} />}
                  </IconButton>
                </Tooltip>
              )}
              <Tooltip title="Edit">
                <IconButton
                  size="small"
                  onClick={(e) => { e.stopPropagation(); setDetailItem(row); }}
                  sx={{ color: "text.disabled", "&:hover": { color: "primary.main", bgcolor: "primary.light" + "22" }, borderRadius: 1.5 }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete">
                <IconButton
                  size="small"
                  onClick={(e) => { e.stopPropagation(); setDeleteItem(row); }}
                  sx={{ color: "primary.main", "&:hover": { bgcolor: "primary.light" + "22" }, borderRadius: 1.5 }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          );
        },
      },
    ],
    [handleToggleFav, handleToggleActive, favOverrides, activeOverrides, isMobile, isTablet, theme]
  );

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column", p: 2 }}>
      {/* ── Tabs ── */}
      <Box sx={{ borderBottom: `1px solid ${theme.palette.divider}`, mb: 2 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          textColor="primary"
          indicatorColor="primary"
          sx={{
            minHeight: 28,
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 600,
              fontSize: 14,
              minHeight: 30,
              px: 3,
              color: "text.secondary",
              "&.Mui-selected": { fontWeight: 700, color: "primary.main" },
            },
            "& .MuiTabs-indicator": { height: 2 },
          }}
        >
          {TABS.map((tab) => (
            <Tab key={tab.value} label={tab.label} value={tab.value} disableRipple />
          ))}
        </Tabs>
      </Box>

      {/* ── Category Tab view ── */}
      {activeTab === "Category" && (
        <Box sx={{ flex: 1, overflow: "hidden" }}>
          <CategoryTab typeFilter="F,P" businessType="Restaurant" />
        </Box>
      )}

      {/* ── Toolbar + Table (hidden on Category tab) ── */}
      {activeTab !== "Category" && (
        <>
          <Box sx={{ display: "flex", gap: 1.5, mb: 2, alignItems: "center", flexWrap: "wrap" }}>
            {/* Title + count */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flex: "0 0 auto" }}>
              <RestaurantMenuIcon sx={{ color: "#d32f2f", fontSize: 20 }} />
              <Typography sx={{ fontWeight: 700, fontSize: 14, color: "#111827" }}>Menu Items</Typography>
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
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ flex: 1, minWidth: isMobile ? "100%" : 200, bgcolor: "#fff" }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: 18, color: "text.disabled" }} />
                  </InputAdornment>
                ),
                endAdornment: search ? (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearch("")}>
                      <CloseIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </InputAdornment>
                ) : null,
                sx: { borderRadius: 0.5, fontSize: 13 },
              }}
            />

            {/* Category filter */}
            <FormControl size="small" sx={{ minWidth: isMobile ? "100%" : 220 }}>
              <Select
                multiple
                value={selectedCategoryIds}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedCategoryIds(typeof val === "string" ? [] : (val as number[]));
                }}
                displayEmpty
                renderValue={(selected) => {
                  const sel = selected as number[];
                  if (sel.length === 0) {
                    return <Box component="span" sx={{ color: "text.disabled", fontSize: 13 }}>All Categories</Box>;
                  }
                  if (sel.length === 1) {
                    const name = categories.find((c) => c.id === sel[0])?.name ?? String(sel[0]);
                    return <Typography noWrap sx={{ fontSize: 13 }}>{name}</Typography>;
                  }
                  return <Typography noWrap sx={{ fontSize: 13 }}>{sel.length} categories selected</Typography>;
                }}
                startAdornment={<FilterListIcon sx={{ fontSize: 16, color: "#9ca3af", mr: 0.5 }} />}
                input={<OutlinedInput sx={{ borderRadius: 0.5, fontSize: 13, bgcolor: "#fff" }} />}
                MenuProps={{
                  PaperProps: {
                    onScroll: handleCategoryDropdownScroll,
                    sx: { maxHeight: 280 },
                  },
                }}
                sx={{ borderRadius: 0.5, fontSize: 13, bgcolor: "#fff" }}
              >
                {selectedCategoryIds.length > 0 && (
                  <MenuItem
                    onClick={() => setSelectedCategoryIds([])}
                    sx={{ fontSize: 12, color: "#d32f2f", fontWeight: 600, py: 0.5 }}
                  >
                    Clear selection
                  </MenuItem>
                )}
                {selectedCategoryIds.length > 0 && <Divider />}
                {categories.map((cat) => (
                  <MenuItem key={cat.id} value={cat.id} sx={{ fontSize: 13, py: 0.5 }}>
                    <Checkbox
                      checked={selectedCategoryIds.includes(cat.id)}
                      size="small"
                      sx={{ p: 0.5, mr: 0.5 }}
                    />
                    <ListItemText primary={cat.name} primaryTypographyProps={{ fontSize: 13 }} />
                  </MenuItem>
                ))}
                {isFetchingNextCategoryPage && (
                  <MenuItem disabled sx={{ fontSize: 12, color: "text.disabled", justifyContent: "center" }}>
                    Loading...
                  </MenuItem>
                )}
              </Select>
            </FormControl>

            {/* Add button */}
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setAddMenuOpen(true)}
              sx={{
                borderRadius: 0.5,
                fontWeight: 700,
                px: 2.5,
                height: 40,
                textTransform: "none",
                fontSize: 13,
                whiteSpace: "nowrap",
                boxShadow: "0 4px 14px rgba(210,18,46,0.25)",
              }}
            >
              {isMobile ? "Add" : "Create Menu Item"}
            </Button>
          </Box>

          {/* ── Table ── */}
          <Box sx={{ flex: 1, overflow: "hidden" }}>
            {isError ? (
              <Box sx={{ textAlign: "center", pt: 8, color: "#6b7280" }}>
                <Typography>Failed to load menu items. Please try again.</Typography>
              </Box>
            ) : (
              <DataTable
                columns={columns}
                rows={allItems}
                rowKey={(row) => row.menu_id}
                isLoading={isLoading}
                hasNextPage={hasNextPage}
                isFetchingNextPage={isFetchingNextPage}
                loadMoreRef={loadMoreRef}
                tableContainerRef={containerRef}
                maxHeight="100%"
                emptyMessage="No menu items found."
              />
            )}
          </Box>
        </>
      )}

      <ItemDetailDialog
        item={detailItem}
        onClose={() => setDetailItem(null)}
        onEdit={(item) => { setDetailItem(null); setEditItem(item); setAddMenuOpen(true); }}
        onDelete={(item) => setDeleteItem(item)}
      />

      <DeleteConfirmDialog
        item={deleteItem}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeleteItem(null)}
      />

      <AddRestaurantMenuItemDialog
        open={addMenuOpen}
        editItem={editItem ? { ...editItem, menu_unit: editItem.menu_unit ?? undefined } : null}
        onClose={() => { setAddMenuOpen(false); setEditItem(null); }}
        onSuccess={() => { setAddMenuOpen(false); setEditItem(null); refetch(); }}
      />
    </Box>
  );
};

export default RestaurantMenuList;
