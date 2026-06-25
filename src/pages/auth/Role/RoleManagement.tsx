import React, { useState, useMemo, useCallback } from "react";
import {
  Box, Button, CircularProgress, Dialog, DialogActions,
  DialogContent, DialogTitle, IconButton, TextField,
  InputAdornment, Typography, Chip,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import SearchIcon from "@mui/icons-material/Search";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import RefreshIcon from "@mui/icons-material/Refresh";
import ShieldIcon from "@mui/icons-material/Shield";
import { useRoles, useDeleteRole, type RoleListItem } from "./useRoleApi";
import RoleEditPage from "./RoleEditPage";
import LottieLoader from "@components/LottieLoader";

const theme = createTheme({
  palette: { primary: { main: "#E11D48" } },
  components: {
    MuiButton: { styleOverrides: { root: { textTransform: "none" } } },
  },
});

const ROLES_PER_PAGE = 5;

const SHIELD_COLORS = [
  { bg: "#FFF1F2", color: "#E11D48" },
  { bg: "#F3F4F6", color: "#6B7280" },
  { bg: "#F5F3FF", color: "#7C3AED" },
  { bg: "#FFF7ED", color: "#EA580C" },
  { bg: "#EFF6FF", color: "#2563EB" },
  { bg: "#F0FDF4", color: "#16A34A" },
];

function getRoleColor(name: string): { bg: string; color: string } {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return SHIELD_COLORS[Math.abs(hash) % SHIELD_COLORS.length];
}

function fmtDate(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

// ── Delete confirmation dialog ────────────────────────────────
function DeleteDialog({
  open, name, isPending, onConfirm, onCancel,
}: {
  open: boolean; name: string; isPending: boolean;
  onConfirm: () => void; onCancel: () => void;
}) {
  return (
    <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth
      PaperProps={{ sx: { borderRadius: 2 } }}>
      <DialogTitle sx={{ fontWeight: 700, fontSize: 15, pb: 1 }}>Delete Role</DialogTitle>
      <DialogContent>
        <Typography sx={{ fontSize: 14, color: "#374151" }}>
          Are you sure you want to delete{" "}
          <Box component="span" sx={{ fontWeight: 700 }}>{name}</Box>?{" "}
          This action cannot be undone.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 2.5, pb: 2, gap: 1 }}>
        <Button variant="outlined" onClick={onCancel} disabled={isPending}
          sx={{ borderColor: "#E5E7EB", color: "#374151", fontWeight: 600,
            "&:hover": { borderColor: "#9CA3AF" } }}>
          Cancel
        </Button>
        <Button variant="contained" onClick={onConfirm} disabled={isPending} disableElevation
          startIcon={isPending
            ? <CircularProgress size={14} sx={{ color: "#fff" }} />
            : <DeleteOutlineIcon sx={{ fontSize: 16 }} />}
          sx={{ bgcolor: "#E11D48", color: "#fff", fontWeight: 700,
            "&:hover": { bgcolor: "#BE123C" } }}>
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ── Role card ─────────────────────────────────────────────────
function RoleCard({
  role, isSelected, onSelect,
}: {
  role: RoleListItem; isSelected: boolean; onSelect: () => void;
}) {
  const { bg, color } = getRoleColor(role.role_name);
  const isActive = true;

  return (
    <Box
      onClick={onSelect}
      sx={{
        display: "flex", alignItems: "center", gap: 1.5,
        px: 2, py: 1.5, cursor: "pointer", borderRadius: 2, mb: 1.5,
        bgcolor: isSelected ? "#FFF1F2" : "#fff",
        border: "1.5px solid",
        borderColor: isSelected ? "#E11D48" : "#E5E7EB",
        transition: "border-color 0.15s, background-color 0.15s",
        "&:hover": {
          borderColor: "#E11D48",
          bgcolor: isSelected ? "#FFF1F2" : "#FFFAFA",
        },
      }}
    >
      {/* Shield badge */}
      <Box sx={{
        width: 42, height: 42, borderRadius: 1.5, flexShrink: 0,
        bgcolor: bg,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <ShieldIcon sx={{ fontSize: 22, color }} />
      </Box>

      {/* Text */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.25 }}>
          <Typography sx={{ fontWeight: 700, fontSize: 14, color: "#111827", lineHeight: 1.2 }}>
            {role.role_name}
          </Typography>
          <Chip
            label={isActive ? "Active" : "Inactive"}
            size="small"
            sx={{
              height: 17, fontSize: 10, fontWeight: 700, borderRadius: 0.75,
              bgcolor: isActive ? "#DCFCE7" : "#FEF3C7",
              color: isActive ? "#15803D" : "#B45309",
              "& .MuiChip-label": { px: 0.75 },
            }}
          />
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Typography sx={{ fontSize: 12, color: "#6B7280" }}>
            {role.assigned_users ?? 0} {(role.assigned_users ?? 0) === 1 ? "User" : "Users"}
          </Typography>
          {role.created_at && (
            <Typography sx={{ fontSize: 12, color: "#9CA3AF" }}>
              Created on {fmtDate(role.created_at)}
            </Typography>
          )}
        </Box>
      </Box>

      <ChevronRightIcon sx={{ fontSize: 18, color: isSelected ? "#E11D48" : "#D1D5DB", flexShrink: 0 }} />
    </Box>
  );
}

// ── Main ──────────────────────────────────────────────────────
type PageMode = "view" | "edit" | "add";

export default function RoleManagement() {
  const [search,       setSearch]       = useState("");
  const [selectedId,   setSelectedId]   = useState<string | null>(null);
  const [pageMode,     setPageMode]     = useState<PageMode>("view");
  const [page,         setPage]         = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<{ roleId: string; roleName: string } | null>(null);

  const { data: roles = [], isLoading, refetch } = useRoles();

  const filtered = useMemo(() => {
    if (!search.trim()) return roles;
    const q = search.toLowerCase();
    return roles.filter((r) => r.role_name.toLowerCase().includes(q));
  }, [roles, search]);

  const totalPages   = Math.max(1, Math.ceil(filtered.length / ROLES_PER_PAGE));
  const paginated    = filtered.slice((page - 1) * ROLES_PER_PAGE, page * ROLES_PER_PAGE);
  const effectiveId  = selectedId ?? filtered[0]?.role_id ?? null;
  const selectedRole = filtered.find((r) => r.role_id === effectiveId) ?? null;

  const deleteRole = useDeleteRole({
    onSuccess: () => {
      setDeleteTarget(null);
      if (selectedId === deleteTarget?.roleId) setSelectedId(null);
    },
    onError: (msg) => { setDeleteTarget(null); alert(msg); },
  });

  const handleSelect = useCallback((id: string) => { setSelectedId(id);   setPageMode("view"); }, []);
  const handleEdit   = useCallback((id: string) => { setSelectedId(id);   setPageMode("edit"); }, []);
  const handleAdd    = useCallback(()            => { setSelectedId(null); setPageMode("add");  }, []);
  const handleSaved  = useCallback((newId?: string) => {
    setPageMode("view");
    if (newId) setSelectedId(newId);
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{
        display: "flex", height: "100%", bgcolor: "#F1F5F9",
        overflow: "hidden", gap: 2, p: 2,
      }}>

        {/* ════ LEFT PANEL ════ */}
        <Box sx={{
          width: { xs: "100%", sm: 340, md: 360 }, flexShrink: 0,
          bgcolor: "#fff", borderRadius: 2.5, border: "1px solid #E5E7EB",
          display: "flex", flexDirection: "column", overflow: "hidden",
        }}>
          {/* Header */}
          <Box sx={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            px: 2.5, pt: 2, pb: 1.5,
          }}>
            {/* Left: filter icon + ROLES count + refresh icon */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
              <Box sx={{ color: "#6B7280", display: "flex", alignItems: "center" }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                </svg>
              </Box>
              <Typography sx={{
                fontWeight: 700, fontSize: 12.5, color: "#374151",
                textTransform: "uppercase", letterSpacing: "0.06em",
              }}>
                ROLES ({filtered.length})
              </Typography>
              <IconButton size="small" onClick={() => refetch()}
                sx={{ p: 0.3, color: "#9CA3AF", "&:hover": { color: "#374151", bgcolor: "#F3F4F6" } }}>
                <RefreshIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Box>

            {/* Right: + Add Role button */}
            <Button variant="contained" disableElevation size="small"
              onClick={handleAdd}
              sx={{
                bgcolor: "#E11D48", color: "#fff", fontWeight: 700,
                fontSize: 12, borderRadius: 1.5, px: 1.5, py: 0.5,
                "&:hover": { bgcolor: "#BE123C" },
              }}>
              + Add Role
            </Button>
          </Box>

          {/* Search */}
          <Box sx={{ px: 2.5, pb: 1.5, borderBottom: "1px solid #F3F4F6" }}>
            <TextField
              fullWidth size="small" placeholder="Search roles..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  fontSize: 13, borderRadius: 1.5,
                  "& fieldset":             { borderColor: "#E5E7EB" },
                  "&:hover fieldset":       { borderColor: "#E11D48" },
                  "&.Mui-focused fieldset": { borderColor: "#E11D48" },
                },
              }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ fontSize: 16, color: "#9CA3AF" }} />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Box>

          {/* Role list */}
          <Box sx={{ flex: 1, overflowY: "auto", px: 2, pt: 1.5, pb: 1 }}>
            {isLoading ? (
              <LottieLoader />
            ) : paginated.length === 0 ? (
              <Typography sx={{ fontSize: 13, color: "#9CA3AF", textAlign: "center", mt: 4 }}>
                No roles found
              </Typography>
            ) : (
              paginated.map((role) => (
                <RoleCard
                  key={role.role_id}
                  role={role}
                  isSelected={role.role_id === effectiveId && pageMode !== "add"}
                  onSelect={() => handleSelect(role.role_id)}
                />
              ))
            )}
          </Box>

          {/* Pagination */}
          {!isLoading && totalPages > 1 && (
            <Box sx={{
              px: 2, py: 1.5, borderTop: "1px solid #F3F4F6",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5,
            }}>
              <IconButton size="small" disabled={page === 1}
                onClick={() => setPage((p) => p - 1)} sx={{ p: 0.5 }}>
                <ChevronLeftIcon sx={{ fontSize: 18 }} />
              </IconButton>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Box key={p} onClick={() => setPage(p)} sx={{
                  width: 28, height: 28, borderRadius: 1,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", fontSize: 13,
                  fontWeight: p === page ? 700 : 500,
                  bgcolor: p === page ? "#E11D48" : "transparent",
                  color:   p === page ? "#fff"    : "#374151",
                  "&:hover": { bgcolor: p === page ? "#BE123C" : "#F3F4F6" },
                }}>
                  {p}
                </Box>
              ))}

              <IconButton size="small" disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)} sx={{ p: 0.5 }}>
                <ChevronRightIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Box>
          )}
        </Box>

        {/* ════ RIGHT PANEL ════ */}
        <Box sx={{
          flex: 1, overflow: "hidden", display: "flex", flexDirection: "column",
          bgcolor: "#fff", borderRadius: 2.5, border: "1px solid #E5E7EB", minWidth: 0,
        }}>
          {pageMode === "add" ? (
            <RoleEditPage
              mode="add"
              onSaved={handleSaved}
              onCancel={() => setPageMode("view")}
              onAdd={handleAdd}
            />
          ) : pageMode === "edit" && effectiveId ? (
            <RoleEditPage
              mode="edit"
              roleId={effectiveId}
              roleName={selectedRole?.role_name}
              assignedUsers={selectedRole?.assigned_users}
              createdAt={selectedRole?.created_at}
              onSaved={handleSaved}
              onCancel={() => setPageMode("view")}
              onAdd={handleAdd}
            />
          ) : effectiveId ? (
            <RoleEditPage
              mode="view"
              roleId={effectiveId}
              roleName={selectedRole?.role_name}
              assignedUsers={selectedRole?.assigned_users}
              createdAt={selectedRole?.created_at}
              onSaved={handleSaved}
              onCancel={() => setPageMode("view")}
              onAdd={handleAdd}
              onEdit={() => handleEdit(effectiveId)}
              onDelete={() =>
                selectedRole &&
                setDeleteTarget({ roleId: selectedRole.role_id, roleName: selectedRole.role_name })
              }
            />
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
              <Box sx={{
                display: "flex", alignItems: "center", justifyContent: "flex-end",
                px: 3, py: 2, borderBottom: "1px solid #F3F4F6",
              }}>
                <Button variant="contained" disableElevation
                  startIcon={<AddIcon sx={{ fontSize: 15 }} />}
                  onClick={handleAdd}
                  sx={{
                    bgcolor: "#E11D48", color: "#fff", fontWeight: 700,
                    fontSize: 13, borderRadius: 1.5, px: 2.5, py: 0.85,
                    "&:hover": { bgcolor: "#BE123C" },
                  }}>
                  + Add Role
                </Button>
              </Box>
              <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Typography sx={{ color: "#9CA3AF", fontSize: 14 }}>
                  Select a role to view details
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
      </Box>

      <DeleteDialog
        open={!!deleteTarget}
        name={deleteTarget?.roleName ?? ""}
        isPending={deleteRole.isPending}
        onConfirm={() => deleteTarget && deleteRole.mutate(deleteTarget.roleId)}
        onCancel={() => setDeleteTarget(null)}
      />
    </ThemeProvider>
  );
}
