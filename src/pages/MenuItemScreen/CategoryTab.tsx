/**
 * CategoryTab.tsx
 * ─────────────────────────────────────────────────────────────
 * Reusable category management tab with infinite scroll.
 *
 * Props:
 *   typeFilter  — URL type segment, e.g. "S,M" (menu) | "E" (expense)
 *   fixedType   — when set, the Add/Edit dialog skips the Type toggle
 *                 and always sends this value (e.g. "E" for expense)
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Box, TextField, Button, InputAdornment, Typography,
  IconButton, Tooltip, Switch, Dialog, DialogTitle,
  DialogContent, DialogActions, Chip,
} from "@mui/material";
import SearchIcon  from "@mui/icons-material/Search";
import AddIcon     from "@mui/icons-material/Add";
import EditIcon    from "@mui/icons-material/Edit";
import DeleteIcon  from "@mui/icons-material/Delete";

import DataTable, { type ColumnDef } from "@utils/DataTable";
import {
  useInfiniteCategoryList, useDeleteCategory,
  useToggleCategoryStatus, type CategoryRow,
} from "./useMenuItemApi";
import AddCategoryDialog from "./AddCategoryDialog";
import SuccessToast from "@components/Common/SuccessToast";
import { useQueryClient } from "@tanstack/react-query";

// ── Props ─────────────────────────────────────────────────────

interface CategoryTabProps {
  /** comma-separated type codes sent in the URL, e.g. "S,M" or "E" or "F,P" */
  typeFilter?:  string;
  /** when provided, Add/Edit dialog hides the Type toggle and always uses this value */
  fixedType?:   "S" | "M" | "E";
  businessType?: string;
}

// ─── CategoryTab ──────────────────────────────────────────────────────────────

const CategoryTab: React.FC<CategoryTabProps> = ({
  typeFilter = "S,M",
  fixedType,
  businessType,
}) => {
  const qc = useQueryClient();

  // ── Add / Edit dialog ─────────────────────────────────────────────────────
  const [catDialogOpen, setCatDialogOpen] = useState(false);
  const [editRow,       setEditRow]       = useState<CategoryRow | null>(null);

  const openAdd  = useCallback(() => { setEditRow(null); setCatDialogOpen(true); }, []);
  const openEdit = useCallback((row: CategoryRow) => { setEditRow(row); setCatDialogOpen(true); }, []);

  // ── Search ────────────────────────────────────────────────────────────────
  const [search,          setSearch]    = useState("");
  const [debouncedSearch, setDebSearch] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchChange = (val: string) => {
    setSearch(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebSearch(val), 300);
  };

  // ── Toast ─────────────────────────────────────────────────────────────────
  const [toastMsg,      setToastMsg]      = useState("");
  const [toastSeverity, setToastSeverity] = useState<"success" | "error">("success");

  // ── Delete ────────────────────────────────────────────────────────────────
  const [deleteTarget, setDeleteTarget] = useState<CategoryRow | null>(null);

  const { mutate: deleteCategory, isPending: isDeleting } = useDeleteCategory({
    onSuccess: () => {
      setDeleteTarget(null);
      setToastSeverity("success");
      setToastMsg("Category deleted successfully!");
    },
    onError: (msg) => {
      setDeleteTarget(null);
      setToastSeverity("error");
      setToastMsg(msg || "Failed to delete category.");
    },
  });

  // ── Toggle status ─────────────────────────────────────────────────────────
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const { mutate: toggleStatus } = useToggleCategoryStatus({
    onSuccess: (_id, message) => {
      setTogglingId(null);
      setToastSeverity("success");
      setToastMsg(message);
    },
    onError: (msg) => {
      setTogglingId(null);
      setToastSeverity("error");
      setToastMsg(msg || "Failed to update status.");
    },
  });

  // ── Infinite scroll refs ──────────────────────────────────────────────────
  const sentinelRef       = useRef<HTMLTableRowElement>(null);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const isFetchingRef     = useRef(false);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const {
    data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage,
  } = useInfiniteCategoryList(true, typeFilter);

  const allCategories = useMemo<CategoryRow[]>(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page.Data);
  }, [data]);

  const filtered = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    if (!q) return allCategories;
    return allCategories.filter((c) => c.name.toLowerCase().includes(q));
  }, [allCategories, debouncedSearch]);

  // ── Infinite scroll observer ──────────────────────────────────────────────
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage && !isFetchingRef.current) {
          isFetchingRef.current = true;
          fetchNextPage().finally(() => {
            setTimeout(() => { isFetchingRef.current = false; }, 300);
          });
        }
      },
      { root: tableContainerRef.current }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  // ── Columns ───────────────────────────────────────────────────────────────
  type CategoryRowWithSno = CategoryRow & { _sno: number };

  const TYPE_META: Record<string, { bg: string; text: string; label: string }> = {
    S: { bg: "#EFF6FF", text: "#1D4ED8", label: "Sellable" },
    M: { bg: "#F0FDF4", text: "#15803D", label: "Service"  },
    E: { bg: "#FFF7ED", text: "#C2410C", label: "Expense"  },
    F: { bg: "#FDF4FF", text: "#7E22CE", label: "Food"     },
    P: { bg: "#F0FDF4", text: "#065F46", label: "Product"  },
  };

  const columns = useMemo<ColumnDef<CategoryRowWithSno>[]>(
    () => [
      {
        key: "sno", label: "S.No", width: 65,
        render: (row) => (
          <Typography variant="body2" sx={{ fontSize: 13, color: "#374151" }}>{row._sno}</Typography>
        ),
      },
      {
        key: "name", label: "Category", minWidth: 200,
        render: (row) => (
          <Typography variant="body2" fontWeight={600} sx={{ fontSize: 13, color: "#374151" }}>
            {row.name}
          </Typography>
        ),
      },
      {
        key: "type", label: "Type", width: 110,
        render: (row) => {
          const meta = TYPE_META[row.type_code] ?? { bg: "#F3F4F6", text: "#374151", label: row.type };
          return (
            <Chip label={meta.label} size="small" sx={{
              fontSize: 11, fontWeight: 600, bgcolor: meta.bg, color: meta.text, border: "none", height: 22,
            }} />
          );
        },
      },
      {
        key: "status", label: "Status", width: 85,
        render: (row) => (
          <Switch
            checked={row.active}
            size="small"
            color="primary"
            disabled={togglingId === row.id}
            onChange={() => { setTogglingId(row.id); toggleStatus({ id: row.id, active: !row.active, pageExpense: typeFilter === "E" }); }}
          />
        ),
      },
      {
        key: "actions", label: "Actions", align: "center", width: 100,
        render: (row) => (
          <Box sx={{ display: "flex", justifyContent: "center", gap: 0.5 }}>
            <Tooltip title="Edit">
              <IconButton size="small" onClick={() => openEdit(row)}
                sx={{ color: "text.disabled", "&:hover": { color: "primary.main", bgcolor: "primary.light" + "22" }, borderRadius: 1.5 }}>
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton size="small" onClick={() => setDeleteTarget(row)}
                sx={{ color: "#D2122E", "&:hover": { bgcolor: "#D2122E22" }, borderRadius: 1.5 }}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        ),
      },
    ],
    [openEdit, toggleStatus, togglingId] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const rows = useMemo<CategoryRowWithSno[]>(
    () => filtered.map((c, i) => ({ ...c, _sno: i + 1 })),
    [filtered]
  );

  const invalidate = useCallback(() => {
    qc.invalidateQueries({ queryKey: ["menu", "categoryList"] });
    qc.invalidateQueries({ queryKey: ["menu", "categories"] });
  }, [qc]);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, height: "100%" }}>

      {/* ── Toolbar ── */}
      <Box sx={{ display: "flex", gap: 1.5, alignItems: "center", flexWrap: "wrap" }}>
        <TextField
          size="small" placeholder="Search..." value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          sx={{ flex: 1, minWidth: 200, bgcolor: "#fff" }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 18, color: "text.disabled" }} />
                </InputAdornment>
              ),
              sx: { borderRadius: 0.5, fontSize: 13 },
            },
          }}
        />
        <Button
          variant="contained" startIcon={<AddIcon />} onClick={openAdd}
          sx={{ borderRadius: 0.5, fontWeight: 700, px: 2.5, height: 40, textTransform: "none", fontSize: 13, whiteSpace: "nowrap", boxShadow: "0 4px 14px rgba(210,18,46,0.25)" }}
        >
          Add Category
        </Button>
      </Box>

      {/* ── Table ── */}
      <Box sx={{ flex: 1, overflow: "hidden" }}>
        <DataTable<CategoryRowWithSno>
          columns={columns} rows={rows} rowKey={(r) => r.id}
          isLoading={isLoading} hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          loadMoreRef={sentinelRef as React.RefObject<HTMLTableRowElement>}
          tableContainerRef={tableContainerRef as React.RefObject<HTMLDivElement>}
          emptyMessage="No items found."
        />
      </Box>

      {/* ── Delete Dialog ── */}
      <Dialog open={!!deleteTarget} onClose={() => !isDeleting && setDeleteTarget(null)}>
        <DialogTitle>Delete Category</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>"{deleteTarget?.name}"</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button disabled={isDeleting} onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button color="error" variant="contained" disabled={isDeleting}
            onClick={() => { if (deleteTarget) deleteCategory({ id: deleteTarget.id, pageExpense: typeFilter === "E" }); }}>
            {isDeleting ? "Deleting…" : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Add / Edit Dialog ── */}
      <AddCategoryDialog
        open={catDialogOpen}
        serviceType="product"
        editRow={editRow}
        fixedType={fixedType}
        businessType={businessType}
        onClose={() => { setCatDialogOpen(false); setEditRow(null); }}
        onAdded={invalidate}
        onEdited={invalidate}
      />

      {/* ── Toast ── */}
      <SuccessToast message={toastMsg} severity={toastSeverity} onClose={() => setToastMsg("")} />
    </Box>
  );
};

export default CategoryTab;
