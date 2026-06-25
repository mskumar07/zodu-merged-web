import React, { useState, useMemo, useRef, useEffect, useCallback } from "react";
import {
  Box, Button, Chip, CircularProgress, Dialog, DialogActions,
  DialogContent, DialogTitle, IconButton, InputAdornment,
  Tab, Tabs, TextField, Tooltip, Typography, Avatar,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import SearchIcon from "@mui/icons-material/Search";
import DataTable, { type ColumnDef } from "@utils/DataTable";
import { useInfiniteEmployees, useDeleteEmployee, type EmployeeListItem } from "./useEmployeeApi";
import EmployeeFormModal from "./EmployeeFormModal";
import EmployeeViewModal from "./EmployeeViewModal";
import LottieLoader from "@components/LottieLoader";

const theme = createTheme({
  palette: {
    primary: { main: "#E11D48" },
    background: { default: "#F9FAFB", paper: "#FFFFFF" },
    text: { primary: "#0F172A", secondary: "#6B7280" },
  },
  components: {
    MuiButton: { styleOverrides: { root: { textTransform: "none", borderRadius: 8, fontWeight: 700 } } },
  },
});

function formatDate(iso: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

// ─── Delete confirm dialog ────────────────────────────────────
function DeleteDialog({ open, name, isPending, onConfirm, onCancel }: {
  open: boolean; name: string; isPending: boolean; onConfirm: () => void; onCancel: () => void;
}) {
  return (
    <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth
      slotProps={{ paper: { sx: { borderRadius: 2 } } }}>
      <DialogTitle sx={{ fontWeight: 700, fontSize: 16, pb: 1 }}>Delete Employee</DialogTitle>
      <DialogContent>
        <Typography sx={{ fontSize: 14, color: "#374151" }}>
          Are you sure you want to delete{" "}
          <Box component="span" sx={{ fontWeight: 700 }}>{name}</Box>? This action cannot be undone.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 2.5, pb: 2, gap: 1 }}>
        <Button variant="outlined" onClick={onCancel} disabled={isPending}
          sx={{ borderColor: "#E5E7EB", color: "#374151", fontWeight: 600, "&:hover": { borderColor: "#9CA3AF" } }}>
          Cancel
        </Button>
        <Button variant="contained" onClick={onConfirm} disabled={isPending} disableElevation
          startIcon={isPending ? <CircularProgress size={14} sx={{ color: "#fff" }} /> : <DeleteOutlineIcon sx={{ fontSize: 16 }} />}
          sx={{ bgcolor: "#E11D48", color: "#fff", fontWeight: 700, "&:hover": { bgcolor: "#BE123C" } }}>
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Main ─────────────────────────────────────────────────────
export default function EmployeeManagement() {
  const [modalOpen, setModalOpen]   = useState(false);
  const [modalMode, setModalMode]   = useState<"add" | "edit" | "view">("add");
  const [activeId, setActiveId]     = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [search, setSearch]         = useState("");
  const [tab, setTab]               = useState<0 | 1>(0);

  const status: "active" | "inactive" = tab === 0 ? "active" : "inactive";

  const sentinelRef       = useRef<HTMLTableRowElement>(null) as React.RefObject<HTMLTableRowElement>;
  const tableContainerRef = useRef<HTMLDivElement>(null)      as React.RefObject<HTMLDivElement>;

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteEmployees(status, search);

  const employees = useMemo(() => data?.pages.flatMap((p) => p.data) ?? [], [data]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage(); },
      { root: tableContainerRef.current }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const deleteEmp = useDeleteEmployee({
    onSuccess: () => setDeleteTarget(null),
    onError: (msg) => { setDeleteTarget(null); alert(msg); },
  });

  const openAdd  = useCallback(() => { setModalMode("add");  setActiveId(null); setModalOpen(true); }, []);
  const openEdit = useCallback((id: string) => { setModalMode("edit"); setActiveId(id); setModalOpen(true); }, []);
  const openView = useCallback((id: string) => { setModalMode("view"); setActiveId(id); setModalOpen(true); }, []);
  const closeModal = useCallback(() => { setModalOpen(false); setActiveId(null); }, []);

  const columns = useMemo<ColumnDef<EmployeeListItem>[]>(() => [
    {
      key: "name",
      label: "Employee",
      width: 220,
      render: (row) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Avatar sx={{ width: 32, height: 32, bgcolor: "#FFF1F2", color: "#E11D48", fontSize: 13, fontWeight: 700 }}>
            {row.name?.[0]?.toUpperCase() ?? "E"}
          </Avatar>
          <Box>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#0F172A" }}>{row.name}</Typography>
          </Box>
        </Box>
      ),
    },
    {
      key: "employee_code",
      label: "Employee ID",
      width: 140,
      render: (row) => <Typography sx={{ fontSize: 13, color: "#374151" }}>{row.employee_code || "—"}</Typography>,
    },
    {
      key: "employment_type",
      label: "Type",
      width: 110,
      render: (row) => (
        <Chip label={row.employment_type || "—"} size="small"
          sx={{ bgcolor: "#EFF6FF", color: "#2563EB", fontWeight: 600, fontSize: 11, height: 20 }} />
      ),
    },
    {
      key: "phone",
      label: "Phone",
      width: 130,
      render: (row) => <Typography sx={{ fontSize: 13, color: "#374151" }}>{row.phone}</Typography>,
    },
    {
      key: "reporting_manager_name",
      label: "Reporting Manager",
      width: 160,
      render: (row) => <Typography sx={{ fontSize: 13, color: "#374151" }}>{row.reporting_manager_name || "—"}</Typography>,
    },
    {
      key: "date_of_joining",
      label: "Joined Date",
      width: 120,
      render: (row) => <Typography sx={{ fontSize: 13, color: "#6B7280" }}>{formatDate(row.date_of_joining)}</Typography>,
    },
    {
      key: "actions",
      label: "Actions",
      align: "center",
      width: 120,
      render: (row) => (
        <Box sx={{ display: "flex", justifyContent: "center", gap: 0.5 }}>
          <Tooltip title="View" placement="top">
            <IconButton size="small" onClick={(e) => { e.stopPropagation(); openView(row.employee_id); }}
              sx={{ color: "#6B7280", p: 0.6, borderRadius: 1, "&:hover": { bgcolor: "#F3F4F6", color: "#0F172A" }, transition: "all 0.12s" }}>
              <VisibilityOutlinedIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit" placement="top">
            <IconButton size="small" onClick={(e) => { e.stopPropagation(); openEdit(row.employee_id); }}
              sx={{ color: "#E11D48", p: 0.6, borderRadius: 1, "&:hover": { bgcolor: "#FFF1F2", color: "#BE123C" }, transition: "all 0.12s" }}>
              <EditOutlinedIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
          {status === "active" && (
            <Tooltip title="Delete" placement="top">
              <IconButton size="small" onClick={(e) => { e.stopPropagation(); setDeleteTarget({ id: row.employee_id, name: row.name }); }}
                sx={{ color: "#D1D5DB", p: 0.6, borderRadius: 1, "&:hover": { bgcolor: "#FFF1F2", color: "#E11D48" }, transition: "all 0.12s" }}>
                <DeleteOutlineIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      ),
    },
  ], [openView, openEdit, status]);

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ height: "100%", display: "flex", flexDirection: "column", bgcolor: "#F9FAFB", overflow: "hidden", minHeight: 0 }}>

        {/* Toolbar */}
        <Box sx={{ px: 1, py: 1.5, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0, gap: 2 }}>
          <TextField
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, EMP ID..." size="small"
            sx={{
              flex: "1 1 0", minWidth: 0,
              "& .MuiOutlinedInput-root": {
                borderRadius: 1, bgcolor: "#fff", fontSize: 13,
                "& fieldset": { borderColor: "#E5E7EB" },
                "&:hover fieldset": { borderColor: "#E11D48" },
                "&.Mui-focused fieldset": { borderColor: "#E11D48", borderWidth: 2 },
              },
            }}
            slotProps={{ input: { startAdornment: (
              <InputAdornment position="start"><SearchIcon sx={{ fontSize: 17, color: "#9CA3AF" }} /></InputAdornment>
            ) } }}
          />
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexShrink: 0 }}>
            <Typography sx={{ fontSize: 12, color: "#9CA3AF", fontWeight: 500 }}>
              Showing <Box component="span" sx={{ fontWeight: 800, color: "#1A1A2E" }}>{employees.length}</Box> employees
            </Typography>
            <Button variant="contained" size="small" startIcon={<AddIcon sx={{ fontSize: 16 }} />}
              onClick={openAdd} disableElevation
              sx={{ fontSize: 13, fontWeight: 700, bgcolor: "#E11D48", color: "#fff", px: 2, py: 0.8,
                borderRadius: 1.5, boxShadow: "0 4px 14px rgba(225,29,72,0.3)",
                "&:hover": { bgcolor: "#BE123C" }, transition: "all 0.15s" }}>
              Add Employee
            </Button>
          </Box>
        </Box>

        {/* Tabs */}
        <Box sx={{ px: 1, flexShrink: 0, borderBottom: "1px solid #E5E7EB" }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)}
            sx={{ minHeight: 36,
              "& .MuiTab-root": { minHeight: 36, fontSize: 13, fontWeight: 600, textTransform: "none", color: "#6B7280" },
              "& .Mui-selected": { color: "#E11D48" },
              "& .MuiTabs-indicator": { bgcolor: "#E11D48" } }}>
            <Tab label="Active Employees" />
            <Tab label="Inactive Employees" />
          </Tabs>
        </Box>

        {/* Table */}
        <Box sx={{ flex: 1, minHeight: 0, px: 1, py: 1.5 }}>
          {isLoading ? (
            <LottieLoader />
          ) : (
            <DataTable<EmployeeListItem>
              columns={columns}
              rows={employees}
              rowKey={(r) => r.employee_id}

              isLoading={isLoading}
              hasNextPage={hasNextPage}
              isFetchingNextPage={isFetchingNextPage}
              loadMoreRef={sentinelRef}
              tableContainerRef={tableContainerRef}
              maxHeight="100%"
              emptyMessage={search ? `No employees found for "${search}"` : `No ${status} employees found.`}
            />
          )}
        </Box>

        {/* Add / Edit modal */}
        <EmployeeFormModal
          open={modalOpen && modalMode !== "view"}
          onClose={closeModal}
          mode={modalMode as "add" | "edit"}
          employeeId={activeId}
        />

        {/* View modal */}
        <EmployeeViewModal
          open={modalOpen && modalMode === "view"}
          onClose={closeModal}
          employeeId={activeId}
        />

        {/* Delete confirmation */}
        <DeleteDialog
          open={!!deleteTarget}
          name={deleteTarget?.name ?? ""}
          isPending={deleteEmp.isPending}
          onConfirm={() => deleteTarget && deleteEmp.mutate(deleteTarget.id)}
          onCancel={() => setDeleteTarget(null)}
        />
      </Box>
    </ThemeProvider>
  );
}
