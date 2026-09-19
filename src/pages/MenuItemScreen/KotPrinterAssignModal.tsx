/**
 * KotPrinterAssignModal.tsx
 * ─────────────────────────────────────────────────────────────
 * "Bulk Assign KOT Printer - By Category" — lets a cashier/admin route
 * categories or individual menu items to a kitchen printer counter
 * (Main Kitchen, South Indian, Chinese, ...).
 *
 * Backed by the KOT counter API (kotApi.ts):
 *   - useKotCounters          — GET  /restaurant/get/kot-counters/:zodu_id/:branch_id
 *   - useAddKotCounter        — POST /restaurant/add/kot-counter
 *   - useKotAssignment        — GET  /restaurant/get/kot-assignment/:zodu_id/:branch_id
 *   - useAssignKotCounterItems — POST /restaurant/assign/kot-counter-items
 */

import { useEffect, useMemo, useState } from "react";
import {
  Box, Typography, TextField, InputAdornment, IconButton, Button,
  Dialog, DialogTitle, DialogContent, DialogActions, Checkbox, Chip, Collapse, Tooltip,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { closeFromControlsOnly } from "@utils/dialog";
import SuccessToast from "@components/Common/SuccessToast";
import {
  useKotCounters, useAddKotCounter, useKotAssignment, useAssignKotCounterItems,
  type KotCounter, type KotAssignmentItem,
} from "./kotApi";

const RED = "#d32f2f";
const NAVY = "#1e2a5e";
const PRIMARY = RED;
const COUNTER_NAME_MAX_LENGTH = 40;

// Styled to match AddCategoryDialog (icon badge + title/subtitle header,
// labeled field, Cancel / Add footer) — just a single counter-name field,
// no type toggle since a KOT counter has no such concept.
function AddKotCounterDialog({
  open, onClose, onSave, isSaving, apiError,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
  isSaving: boolean;
  apiError: string;
}) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) { setName(""); setError(""); }
  }, [open]);

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) { setError("Counter name is required"); return; }
    onSave(trimmed);
  };

  return (
    <Dialog
      open={open}
      onClose={closeFromControlsOnly(onClose)}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: 1.5, boxShadow: "0 24px 60px rgba(0,0,0,0.2)" } }}
    >
      <DialogTitle sx={{ p: 0 }}>
        <Box sx={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          px: 3, py: 2.5, borderBottom: "1px solid", borderColor: "divider",
        }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box sx={{
              width: 38, height: 38, borderRadius: "50%",
              bgcolor: "rgba(210,18,46,0.1)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <AddCircleIcon sx={{ color: RED, fontSize: 20 }} />
            </Box>
            <Box>
              <Typography fontWeight={800} lineHeight={1.2} fontSize={16}>
                Add KOT Counter
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Create a new kitchen printer counter
              </Typography>
            </Box>
          </Box>
          <IconButton size="small" onClick={onClose} disabled={isSaving} sx={{ color: "text.disabled", borderRadius: 1.5 }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ px: 3, py: 3 }}>
        <Typography variant="body2" fontWeight={600} mb={0.8} color="text.primary">
          Counter Name
          <Box component="span" sx={{ color: RED, ml: 0.3 }}>*</Box>
        </Typography>
        <TextField
          fullWidth
          size="small"
          autoFocus
          placeholder="e.g. Tandoor, Bar, South Indian"
          value={name}
          onChange={(e) => { setName(e.target.value); if (error) setError(""); }}
          onKeyDown={(e) => { if (e.key === "Enter") handleSave(); }}
          error={Boolean(error) || Boolean(apiError)}
          helperText={error || apiError}
          inputProps={{ maxLength: COUNTER_NAME_MAX_LENGTH }}
          InputProps={{ sx: { borderRadius: 1, fontSize: 14 } }}
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2.5, borderTop: "1px solid", borderColor: "divider", gap: 1.5 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          disabled={isSaving}
          sx={{ borderRadius: 1, textTransform: "none", fontWeight: 600, px: 3, borderColor: "divider", color: "text.secondary" }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={isSaving}
          startIcon={isSaving ? <CircularProgress size={15} color="inherit" /> : <AddCircleIcon />}
          sx={{ borderRadius: 1, textTransform: "none", fontWeight: 700, px: 3, boxShadow: "0 4px 12px rgba(210,18,46,0.25)" }}
        >
          {isSaving ? "Adding…" : "Add Counter"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

interface Props {
  open: boolean;
  onClose: () => void;
  branchId: string;
  zoduId: string;
  /** Called once the assignment has actually saved to the backend. */
  onAssigned?: (counter: KotCounter, itemCount: number) => void;
}

// A short, stable 2-letter tag standing in for a real thumbnail — same
// initials-badge idea ProductCard/CategoryNav already use elsewhere.
function itemTag(name: string): string {
  const clean = name.trim();
  return (clean.slice(0, 2) || "?").toUpperCase();
}

const TAG_COLORS = [
  "#6366f1", "#ec4899", "#f59e0b", "#10b981",
  "#3b82f6", "#8b5cf6", "#ef4444", "#14b8a6",
  "#f97316", "#06b6d4", "#84cc16", "#f43f5e",
];

export default function KotPrinterAssignModal({ open, onClose, branchId, zoduId, onAssigned }: Props) {
  const { data: counters = [], isLoading: countersLoading } = useKotCounters(zoduId, branchId);
  const { data: categories = [], isLoading: assignmentLoading } = useKotAssignment(zoduId, branchId);

  const [selectedCounterId, setSelectedCounterId] = useState<number | null>(null);
  // Once counters load, default to the first one — but never override a choice the user already made.
  useEffect(() => {
    if (selectedCounterId == null && counters.length > 0) setSelectedCounterId(counters[0].id);
  }, [counters, selectedCounterId]);

  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [summaryCollapsed, setSummaryCollapsed] = useState<Record<number, boolean>>({});
  // menu_item_id -> true — the id (a UUID string) the assign API expects.
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [addCounterOpen, setAddCounterOpen] = useState(false);
  const [assignError, setAssignError] = useState("");

  // Selection resets to whatever is already routed to the chosen counter —
  // switching counters shows that counter's current assignment, not a stale
  // selection built while a different counter was active.
  useEffect(() => {
    if (selectedCounterId == null) return;
    const next = new Set<string>();
    categories.forEach((cat) => {
      cat.items.forEach((it) => {
        if (it.kot_counter_id === selectedCounterId) next.add(it.menu_item_id);
      });
    });
    setSelectedIds(next);
  }, [selectedCounterId, categories]);

  const filteredCategories = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return categories;
    return categories
      .map((cat) => ({
        ...cat,
        items: cat.category_name.toLowerCase().includes(q)
          ? cat.items
          : cat.items.filter((it) => it.menu_name.toLowerCase().includes(q)),
      }))
      .filter((cat) => cat.items.length > 0);
  }, [categories, search]);

  const selectedByCategory = useMemo(() => {
    // category_id, not category_name, is the render key below — the same
    // category name can legitimately appear more than once as separate
    // records, and keying by name made React conflate two "Sweets" groups
    // into one (silently dropping/merging their item lists) instead of
    // rendering both.
    return categories
      .map((cat) => ({
        id: cat.category_id,
        name: cat.category_name,
        items: cat.items.filter((it) => selectedIds.has(it.menu_item_id)),
      }))
      .filter((g) => g.items.length > 0);
  }, [categories, selectedIds]);

  const totalSelected = selectedIds.size;

  // A KOT counter name lookup for the "Assigned to KOT3" label on locked items.
  const counterNameById = useMemo(
    () => new Map(counters.map((c) => [c.id, c])),
    [counters]
  );

  // An item already routed to a *different* counter is locked here — it can
  // only be reassigned by switching to that counter first, so the checkbox
  // is disabled rather than letting this screen silently steal it away.
  const isLockedElsewhere = (item: KotAssignmentItem) =>
    item.kot_counter_id != null && item.kot_counter_id !== selectedCounterId;

  const toggleCategoryExpand = (name: string) =>
    setExpanded((prev) => ({ ...prev, [name]: !prev[name] }));

  const isCategoryFullySelected = (items: KotAssignmentItem[]) => {
    const selectable = items.filter((it) => !isLockedElsewhere(it));
    return selectable.length > 0 && selectable.every((it) => selectedIds.has(it.menu_item_id));
  };
  const isCategoryPartiallySelected = (items: KotAssignmentItem[]) => {
    const selectable = items.filter((it) => !isLockedElsewhere(it));
    return selectable.some((it) => selectedIds.has(it.menu_item_id)) && !isCategoryFullySelected(items);
  };

  const toggleCategory = (items: KotAssignmentItem[]) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      const selectable = items.filter((it) => !isLockedElsewhere(it));
      const allSelected = isCategoryFullySelected(items);
      selectable.forEach((it) => {
        if (allSelected) next.delete(it.menu_item_id);
        else next.add(it.menu_item_id);
      });
      return next;
    });
  };

  const toggleItem = (menuItemId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(menuItemId)) next.delete(menuItemId);
      else next.add(menuItemId);
      return next;
    });
  };

  const removeItem = (menuItemId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(menuItemId);
      return next;
    });
  };

  const clearAll = () => setSelectedIds(new Set());

  const toggleSummaryGroup = (categoryId: number) =>
    setSummaryCollapsed((prev) => ({ ...prev, [categoryId]: !prev[categoryId] }));

  const [addCounterError, setAddCounterError] = useState("");
  const { mutate: addCounter, isPending: isAddingCounter, reset: resetAddCounter } =
    useAddKotCounter(zoduId, branchId, {
      onSuccess: (counter) => {
        setSelectedCounterId(counter.id);
        setAddCounterOpen(false);
      },
      onError: (msg) => setAddCounterError(msg),
    });

  const handleCloseAddCounter = () => {
    resetAddCounter();
    setAddCounterError("");
    setAddCounterOpen(false);
  };

  const { mutate: assignItems, isPending: isAssigning } = useAssignKotCounterItems(zoduId, branchId, {
    onSuccess: () => {
      const counter = counters.find((c) => c.id === selectedCounterId);
      if (counter) onAssigned?.(counter, totalSelected);
      onClose();
    },
    onError: (msg) => setAssignError(msg),
  });

  const selectedCounter = counters.find((c) => c.id === selectedCounterId) ?? null;
  const canAssign = totalSelected > 0 && !!selectedCounter && !isAssigning;

  const handleAssign = () => {
    if (!canAssign || !selectedCounter) return;
    setAssignError("");
    assignItems({ kotCounterId: selectedCounter.id, menuItemIds: Array.from(selectedIds) });
  };

  const handleClose = () => { if (!isAssigning) onClose(); };

  return (
    <>
    <Dialog
      open={open}
      onClose={closeFromControlsOnly(handleClose)}
      maxWidth={false}
      PaperProps={{
        sx: {
          width: 1280, maxWidth: "95vw", borderRadius: 3, overflow: "hidden",
          height: "90vh", maxHeight: 860, display: "flex", flexDirection: "column",
        },
      }}
    >
      {/* ── Header ── */}
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, px: 3, pt: 2.5, pb: 2, borderBottom: "1px solid #eef0f3", flexShrink: 0 }}>
        <Box
          sx={{
            width: 40, height: 40, borderRadius: "10px", flexShrink: 0,
            bgcolor: `${PRIMARY}14`, color: PRIMARY,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <PrintOutlinedIcon sx={{ fontSize: 22 }} />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: "1.15rem", fontWeight: 800, color: NAVY, lineHeight: 1.3 }}>
            Bulk Assign KOT Printer - By Category
          </Typography>
          <Typography sx={{ fontSize: "0.82rem", color: "#6b7280", mt: 0.25 }}>
            Select KOT counters first, then choose categories and menu items to add for printer allocation.
          </Typography>
        </Box>
        <IconButton onClick={handleClose} size="small" sx={{ color: "#9ca3af" }}>
          <CloseIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </Box>

      {/* ── Section 1: KOT counters ── */}
      <Box sx={{ px: 3, pt: 2, pb: 1.5, flexShrink: 0, overflowY: "auto", maxHeight: 160 }}>
        <Typography sx={{ fontSize: "0.85rem", fontWeight: 800, color: NAVY, mb: 1 }}>
          1. Select KOT Counter(s)
        </Typography>
        <Box sx={{ display: "flex", gap: 1.25, flexWrap: "wrap" }}>
          {countersLoading && (
            <Typography sx={{ fontSize: 13, color: "#9ca3af", py: 1 }}>Loading counters…</Typography>
          )}
          {!countersLoading && counters.map((c) => {
            const active = c.id === selectedCounterId;
            return (
              <Box
                key={c.id}
                onClick={() => setSelectedCounterId(c.id)}
                sx={{
                  display: "flex", alignItems: "center", gap: 1,
                  minWidth: 140, px: 1.75, py: 1.1, borderRadius: "10px", cursor: "pointer",
                  border: "1.5px solid", borderColor: active ? PRIMARY : "#e5e7eb",
                  bgcolor: active ? PRIMARY : "#fff",
                  color: active ? "#fff" : "#374151",
                  transition: "all 0.12s",
                  "&:hover": { borderColor: PRIMARY },
                }}
              >
                <RestaurantIcon sx={{ fontSize: 18, opacity: active ? 1 : 0.55 }} />
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontSize: "0.78rem", fontWeight: 800, lineHeight: 1.25 }}>{c.counter_code}</Typography>
                  <Typography sx={{ fontSize: "0.72rem", opacity: active ? 0.9 : 0.65, lineHeight: 1.25, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {c.counter_name}
                  </Typography>
                </Box>
              </Box>
            );
          })}

          <Box
            onClick={() => setAddCounterOpen(true)}
            sx={{
              display: "flex", alignItems: "center", gap: 0.75,
              px: 1.75, py: 1.1, borderRadius: "10px", cursor: "pointer",
              border: `1.5px dashed ${PRIMARY}66`, bgcolor: `${PRIMARY}0d`, color: PRIMARY,
              "&:hover": { bgcolor: `${PRIMARY}1a` },
            }}
          >
            <AddCircleIcon sx={{ fontSize: 18 }} />
            <Typography sx={{ fontSize: "0.78rem", fontWeight: 800 }}>Add Counter</Typography>
          </Box>
        </Box>
      </Box>

      {/* ── Sections 2 & 3: category tree + selection summary ── */}
      <Box sx={{ display: "flex", gap: 2, px: 3, pb: 2, flex: 1, minHeight: 0 }}>
        {/* Section 2 */}
        <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", border: "1px solid #eef0f3", borderRadius: 2, overflow: "hidden" }}>
          <Box sx={{ p: 1.5, borderBottom: "1px solid #eef0f3" }}>
            <Typography sx={{ fontSize: "0.85rem", fontWeight: 800, color: NAVY, mb: 1 }}>
              2. Select Categories and Items
            </Typography>
            <TextField
              size="small"
              fullWidth
              placeholder="Search categories or menu items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: 17, color: "#9ca3af" }} />
                  </InputAdornment>
                ),
                sx: { fontSize: 13, borderRadius: 1.5, bgcolor: "#f9fafb" },
              }}
            />
          </Box>

          <Box sx={{ flex: 1, overflowY: "auto", px: 1, py: 0.5 }}>
            {assignmentLoading && (
              <Typography sx={{ fontSize: 13, color: "#9ca3af", textAlign: "center", py: 4 }}>
                Loading menu…
              </Typography>
            )}
            {!assignmentLoading && filteredCategories.length === 0 && (
              <Typography sx={{ fontSize: 13, color: "#9ca3af", textAlign: "center", py: 4 }}>
                No categories or items match your search.
              </Typography>
            )}
            {filteredCategories.map((cat) => {
              const isOpen = !!expanded[cat.category_name] || !!search.trim();
              const full = isCategoryFullySelected(cat.items);
              const partial = isCategoryPartiallySelected(cat.items);
              // Nothing selectable here for this counter — every item already
              // belongs to a different one — so the whole category row locks too.
              const allLocked = cat.items.length > 0 && cat.items.every((it) => isLockedElsewhere(it));
              return (
                <Box key={cat.category_id} sx={{ mb: 0.25 }}>
                  <Box
                    sx={{
                      display: "flex", alignItems: "center", gap: 0.5,
                      py: 0.75, px: 0.5, borderRadius: 1,
                      cursor: allLocked ? "not-allowed" : "pointer",
                      opacity: allLocked ? 0.5 : 1,
                      "&:hover": { bgcolor: allLocked ? "transparent" : "#f9fafb" },
                    }}
                  >
                    <IconButton size="small" onClick={() => toggleCategoryExpand(cat.category_name)} sx={{ p: 0.25 }}>
                      {isOpen ? <ExpandMoreIcon sx={{ fontSize: 18 }} /> : <ChevronRightIcon sx={{ fontSize: 18 }} />}
                    </IconButton>
                    <Checkbox
                      size="small"
                      checked={allLocked || full}
                      indeterminate={!allLocked && partial}
                      disabled={allLocked}
                      onChange={() => toggleCategory(cat.items)}
                      sx={{ p: 0.4 }}
                    />
                    <Typography
                      onClick={() => toggleCategoryExpand(cat.category_name)}
                      sx={{ flex: 1, fontSize: "0.82rem", fontWeight: 800, color: NAVY }}
                    >
                      {cat.category_name}
                    </Typography>
                    <Typography sx={{ fontSize: "0.75rem", color: "#9ca3af", fontWeight: 600, pr: 1 }}>
                      ({cat.items.length})
                    </Typography>
                  </Box>

                  <Collapse in={isOpen} unmountOnExit>
                    <Box sx={{ pl: 4.5 }}>
                      {cat.items.map((it) => {
                        const locked = isLockedElsewhere(it);
                        const lockedCounter = locked ? counterNameById.get(it.kot_counter_id as number) : undefined;
                        return (
                          <Box
                            key={it.menu_item_id}
                            onClick={() => { if (!locked) toggleItem(it.menu_item_id); }}
                            sx={{
                              display: "flex", alignItems: "center", gap: 0.75,
                              py: 0.5, px: 0.5, borderRadius: 1,
                              cursor: locked ? "not-allowed" : "pointer",
                              opacity: locked ? 0.5 : 1,
                              "&:hover": { bgcolor: locked ? "transparent" : "#f9fafb" },
                            }}
                          >
                            <Checkbox
                              size="small"
                              checked={locked || selectedIds.has(it.menu_item_id)}
                              disabled={locked}
                              onChange={() => toggleItem(it.menu_item_id)}
                              onClick={(e) => e.stopPropagation()}
                              sx={{ p: 0.4 }}
                            />
                            <Typography sx={{ fontSize: "0.8rem", color: "#374151", fontWeight: 500, flex: 1 }}>
                              {it.menu_name}
                            </Typography>
                            {locked && (
                              <Chip
                                label={`Assigned to ${lockedCounter?.counter_code ?? "another counter"}`}
                                size="small"
                                sx={{ height: 18, fontSize: "0.62rem", fontWeight: 700, bgcolor: "#f3f4f6", color: "#6b7280" }}
                              />
                            )}
                          </Box>
                        );
                      })}
                    </Box>
                  </Collapse>
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* Section 3 */}
        <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", border: "1px solid #eef0f3", borderRadius: 2, overflow: "hidden" }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: 1.5, borderBottom: "1px solid #eef0f3" }}>
            <Typography sx={{ fontSize: "0.85rem", fontWeight: 800, color: NAVY }}>
              3. Selection Summary ({totalSelected} Items)
            </Typography>
            {totalSelected > 0 && (
              <Box
                onClick={clearAll}
                sx={{
                  display: "flex", alignItems: "center", gap: 0.4, cursor: "pointer",
                  color: RED, fontSize: "0.78rem", fontWeight: 700,
                  "&:hover": { opacity: 0.8 },
                }}
              >
                <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                Clear All
              </Box>
            )}
          </Box>

          {/* No top/bottom padding here — any container padding above a
              sticky child's `top: 0` sits outside what the sticky box can
              ever cover, so the previous group's last item kept showing
              through that strip while scrolling. Horizontal padding only;
              vertical spacing instead lives on the content below. */}
          <Box sx={{ flex: 1, overflowY: "auto", px: 1.5 }}>
            {totalSelected === 0 && (
              <Typography sx={{ fontSize: 13, color: "#9ca3af", textAlign: "center", py: 4 }}>
                No items selected yet — pick categories or items on the left.
              </Typography>
            )}
            {selectedByCategory.map((group, gi) => {
              const isOpen = !summaryCollapsed[group.id];
              return (
              <Box key={group.id} sx={{ pb: 2 }}>
                <Box
                  onClick={() => toggleSummaryGroup(group.id)}
                  sx={{
                    display: "flex", alignItems: "center", gap: 0.75, cursor: "pointer", userSelect: "none",
                    position: "sticky", top: 0, zIndex: 2,
                    mx: -1.5, px: 1.5,
                    pt: gi === 0 ? 1.5 : 0.5, pb: 1,
                    // A fully opaque layer sized to the sticky box's own
                    // edges via an absolutely-positioned pseudo-element,
                    // rather than `bgcolor` on the row itself — `bgcolor`
                    // only paints exactly as tall as the row's own content
                    // box, and any sub-pixel rounding on a sticky element's
                    // computed height/offset during scroll left a hairline
                    // where the previous group's last item showed through.
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      inset: 0,
                      backgroundColor: "#ffffff",
                      zIndex: -1,
                    },
                  }}
                >
                  <ExpandMoreIcon
                    sx={{
                      fontSize: 18, color: "#9ca3af",
                      transform: isOpen ? "rotate(0deg)" : "rotate(-90deg)",
                      transition: "transform 0.15s",
                    }}
                  />
                  <Typography sx={{ fontSize: "0.82rem", fontWeight: 800, color: NAVY }}>
                    {group.name}
                  </Typography>
                  <Chip
                    label={`${group.items.length} item${group.items.length === 1 ? "" : "s"}`}
                    size="small"
                    sx={{ height: 20, fontSize: "0.68rem", fontWeight: 700, bgcolor: `${PRIMARY}14`, color: PRIMARY }}
                  />
                </Box>
                <Collapse in={isOpen} unmountOnExit>
                <Box sx={{ pl: 1.5, borderLeft: "2px dashed #e5e7eb", ml: 1 }}>
                  {group.items.map((it) => (
                    <Box
                      key={it.menu_item_id}
                      sx={{
                        display: "flex", alignItems: "center", gap: 1,
                        py: 0.6, pl: 1.25,
                      }}
                    >
                      <Box
                        sx={{
                          width: 30, height: 30, borderRadius: "8px", flexShrink: 0,
                          bgcolor: `${TAG_COLORS[gi % TAG_COLORS.length]}22`,
                          color: TAG_COLORS[gi % TAG_COLORS.length],
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: "0.68rem", fontWeight: 800,
                        }}
                      >
                        {itemTag(it.menu_name)}
                      </Box>
                      <Typography sx={{ flex: 1, fontSize: "0.82rem", color: "#374151", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {it.menu_name}
                      </Typography>
                      <Typography sx={{ fontSize: "0.72rem", color: "#9ca3af", fontWeight: 600, flexShrink: 0 }}>
                        #{it.menu_id}
                      </Typography>
                      <Tooltip title="Remove">
                        <IconButton size="small" onClick={() => removeItem(it.menu_item_id)} sx={{ color: RED, p: 0.4 }}>
                          <DeleteOutlineIcon sx={{ fontSize: 17 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  ))}
                </Box>
                </Collapse>
              </Box>
              );
            })}
          </Box>
        </Box>
      </Box>

      {/* ── Footer ── */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.25, px: 3, py: 2, borderTop: "1px solid #eef0f3", bgcolor: "#fafafa", flexShrink: 0 }}>
        <Button
          onClick={handleClose}
          variant="outlined"
          disabled={isAssigning}
          sx={{
            textTransform: "none", fontWeight: 700, fontSize: 13, px: 3, py: 1,
            borderRadius: "10px", color: "#374151", borderColor: "#e5e7eb", bgcolor: "#fff",
            "&:hover": { borderColor: "#d1d5db", bgcolor: "#f9fafb" },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleAssign}
          disabled={!canAssign}
          startIcon={isAssigning ? <CircularProgress size={15} color="inherit" /> : <PrintOutlinedIcon sx={{ fontSize: 17 }} />}
          variant="contained"
          sx={{
            textTransform: "none", fontWeight: 800, fontSize: 13, px: 3, py: 1, borderRadius: "10px",
            bgcolor: PRIMARY, boxShadow: `0 4px 14px ${PRIMARY}4d`,
            "&:hover": { bgcolor: "#b71c1c", boxShadow: `0 4px 14px ${PRIMARY}66` },
            "&.Mui-disabled": { bgcolor: "#e5e7eb", color: "#9ca3af" },
          }}
        >
          {isAssigning ? "Assigning…" : `Assign ${totalSelected} Item${totalSelected === 1 ? "" : "s"}`}
        </Button>
      </Box>

      <AddKotCounterDialog
        open={addCounterOpen}
        onClose={handleCloseAddCounter}
        onSave={(name) => { setAddCounterError(""); addCounter(name); }}
        isSaving={isAddingCounter}
        apiError={addCounterError}
      />
    </Dialog>

    <SuccessToast message={assignError} severity="error" onClose={() => setAssignError("")} />
    </>
  );
}
