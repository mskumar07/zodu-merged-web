import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  Box, Button, Chip, CircularProgress,
  Collapse, IconButton, TextField, Typography,
} from "@mui/material";
import SaveIcon              from "@mui/icons-material/Save";
import CalendarMonthIcon     from "@mui/icons-material/CalendarMonth";
import GroupIcon             from "@mui/icons-material/Group";
import ShieldIcon            from "@mui/icons-material/Shield";
import DashboardIcon         from "@mui/icons-material/Dashboard";
import ReceiptIcon           from "@mui/icons-material/Receipt";
import ShoppingCartIcon      from "@mui/icons-material/ShoppingCart";
import PaymentsIcon          from "@mui/icons-material/Payments";
import InventoryIcon         from "@mui/icons-material/Inventory";
import PeopleIcon            from "@mui/icons-material/People";
import BadgeIcon             from "@mui/icons-material/Badge";
import AccessTimeIcon        from "@mui/icons-material/AccessTime";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import BarChartIcon          from "@mui/icons-material/BarChart";
import SettingsIcon          from "@mui/icons-material/Settings";
import CategoryIcon          from "@mui/icons-material/Category";
import VisibilityIcon        from "@mui/icons-material/Visibility";
import AddCircleOutlineIcon  from "@mui/icons-material/AddCircleOutline";
import EditNoteIcon          from "@mui/icons-material/EditNote";
import DeleteOutlineIcon     from "@mui/icons-material/DeleteOutline";
import ExpandMoreIcon        from "@mui/icons-material/ExpandMore";
import ExpandLessIcon        from "@mui/icons-material/ExpandLess";
import {
  useModules, useCreateRole, useUpdateRole, useRoleDetail,
  type ModuleItem, type PermissionPayload,
} from "./useRoleApi";
import { getTenantContext } from "@store/tenantContext";
import LottieLoader from "@components/LottieLoader";

// ─── Module icon config ───────────────────────────────────────
interface IconCfg { icon: React.ReactElement; bg: string; color: string; }

const MODULE_CFG: Record<string, IconCfg> = {
  dashboard:  { icon: <DashboardIcon sx={{ fontSize: 15 }} />,            bg: "#EFF6FF", color: "#2563EB" },
  billing:    { icon: <ReceiptIcon sx={{ fontSize: 15 }} />,              bg: "#FFF1F2", color: "#E11D48" },
  purchase:   { icon: <ShoppingCartIcon sx={{ fontSize: 15 }} />,         bg: "#FFF7ED", color: "#EA580C" },
  expense:    { icon: <PaymentsIcon sx={{ fontSize: 15 }} />,             bg: "#FFFBEB", color: "#D97706" },
  inventory:  { icon: <InventoryIcon sx={{ fontSize: 15 }} />,            bg: "#F0FDF4", color: "#16A34A" },
  customer:   { icon: <PeopleIcon sx={{ fontSize: 15 }} />,               bg: "#F0F9FF", color: "#0284C7" },
  customers:  { icon: <PeopleIcon sx={{ fontSize: 15 }} />,               bg: "#F0F9FF", color: "#0284C7" },
  employee:   { icon: <BadgeIcon sx={{ fontSize: 15 }} />,                bg: "#FDF4FF", color: "#9333EA" },
  attendance: { icon: <AccessTimeIcon sx={{ fontSize: 15 }} />,           bg: "#FFF0F0", color: "#DC2626" },
  payroll:    { icon: <AccountBalanceWalletIcon sx={{ fontSize: 15 }} />, bg: "#F0FDF4", color: "#059669" },
  report:     { icon: <BarChartIcon sx={{ fontSize: 15 }} />,             bg: "#EFF6FF", color: "#3B82F6" },
  reports:    { icon: <BarChartIcon sx={{ fontSize: 15 }} />,             bg: "#EFF6FF", color: "#3B82F6" },
  settings:   { icon: <SettingsIcon sx={{ fontSize: 15 }} />,             bg: "#F9FAFB", color: "#6B7280" },
  sales:      { icon: <ReceiptIcon sx={{ fontSize: 15 }} />,              bg: "#FFF1F2", color: "#E11D48" },
  credit:     { icon: <ReceiptIcon sx={{ fontSize: 15 }} />,              bg: "#FDF4FF", color: "#9333EA" },
};
const DEFAULT_CFG: IconCfg = {
  icon: <CategoryIcon sx={{ fontSize: 15 }} />, bg: "#F3F4F6", color: "#6B7280",
};

function getIconCfg(name: string): IconCfg {
  return MODULE_CFG[name.toLowerCase().split(" ")[0]] ?? DEFAULT_CFG;
}

function ModuleBadge({ name, size = 30 }: { name: string; size?: number }) {
  const { icon, bg, color } = getIconCfg(name);
  return (
    <Box sx={{
      width: size, height: size, bgcolor: bg, borderRadius: 1.5, flexShrink: 0,
      display: "flex", alignItems: "center", justifyContent: "center", color,
    }}>
      {icon}
    </Box>
  );
}

// ─── Permission types ─────────────────────────────────────────
interface PermState {
  can_read: boolean; can_create: boolean; can_edit: boolean; can_delete: boolean;
}
type PermKey = keyof PermState;

const EMPTY: PermState = { can_read: false, can_create: false, can_edit: false, can_delete: false };
const FULL:  PermState = { can_read: true,  can_create: true,  can_edit: true,  can_delete: true  };

interface PermCol { key: PermKey; label: string; icon: React.ReactNode; }

const PERM_COLS: PermCol[] = [
  { key: "can_read",   label: "View",   icon: <VisibilityIcon sx={{ fontSize: 15 }} /> },
  { key: "can_create", label: "Create", icon: <AddCircleOutlineIcon sx={{ fontSize: 15 }} /> },
  { key: "can_edit",   label: "Edit",   icon: <EditNoteIcon sx={{ fontSize: 15 }} /> },
  { key: "can_delete", label: "Delete", icon: <DeleteOutlineIcon sx={{ fontSize: 15 }} /> },
];

function initPerms(modules: ModuleItem[]): Record<string, PermState> {
  const map: Record<string, PermState> = {};
  const walk = (list: ModuleItem[]) =>
    list.forEach((m) => {
      map[m.module_id] = { ...EMPTY };
      if (m.sub_modules?.length) walk(m.sub_modules);
    });
  walk(modules);
  return map;
}

function countSelected(perms: Record<string, PermState>) {
  const vals     = Object.values(perms);
  const total    = vals.length * 4;
  const selected = vals.reduce(
    (acc, p) => acc + [p.can_read, p.can_create, p.can_edit, p.can_delete].filter(Boolean).length,
    0,
  );
  return { selected, total };
}

function moduleCount(module: ModuleItem, perms: Record<string, PermState>) {
  const ids: string[] = [];
  const walk = (m: ModuleItem) => { ids.push(m.module_id); m.sub_modules?.forEach(walk); };
  walk(module);
  const total    = ids.length * 4;
  const selected = ids.reduce((acc, id) => {
    const p = perms[id];
    return p ? acc + [p.can_read, p.can_create, p.can_edit, p.can_delete].filter(Boolean).length : acc;
  }, 0);
  return { selected, total };
}

function fmtDate(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

// ─── Permission card: bordered box + icon + label + green dot ─
function PermItem({
  label, icon, checked, onClick, readOnly,
}: {
  label: string; icon: React.ReactNode; checked: boolean;
  onClick: () => void; readOnly: boolean;
}) {
  return (
    <Box
      onClick={readOnly ? undefined : onClick}
      sx={{
        position: "relative",
        display: "inline-flex", alignItems: "center", gap: 1,
        pl: 1.2, pr: 5, py: 0.75,
        border: "1.5px solid #E5E7EB",
        borderRadius: 1.5,
        bgcolor: "#fff",
        cursor: readOnly ? "default" : "pointer",
        userSelect: "none",
        transition: "border-color 0.15s",
        "&:hover": readOnly ? {} : { borderColor: "#E11D48" },
      }}
    >
      {/* Red rounded-square icon */}
      <Box sx={{
        width: 20, height: 20, borderRadius: 1,
        bgcolor: "#FEE2E2",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "#E11D48", flexShrink: 0,
      }}>
        {icon}
      </Box>
      <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#374151", whiteSpace: "nowrap" }}>
        {label}
      </Typography>
      {checked && (
        <Box sx={{
          position: "relative", top: 1, right: -30,
          width: 13, height: 13, bgcolor: "#16A34A", borderRadius: 0.75,
          display: "flex", alignItems: "center", justifyContent: "center",
          border: "2px solid #fff", zIndex: 1,
        }}>
          <svg width="7" height="7" viewBox="0 0 10 10" fill="none">
            <polyline points="1.5,5 4,7.5 8.5,2.5" stroke="white" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Box>
      )}
    </Box>
  );
}

// ─── Select All checkbox ──────────────────────────────────────
function SelectAllCheck({
  checked, indeterminate, onClick,
}: {
  checked: boolean; indeterminate?: boolean; onClick: () => void;
}) {
  return (
    <Box onClick={onClick}
      sx={{ display: "flex", alignItems: "center", gap: 0.6, cursor: "pointer", userSelect: "none", flexShrink: 0 }}>
      <Box sx={{
        width: 16, height: 16, border: "2px solid",
        borderColor: (checked || indeterminate) ? "#E11D48" : "#D1D5DB",
        borderRadius: 0.5,
        bgcolor: (checked || indeterminate) ? "#E11D48" : "#fff",
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        {checked && (
          <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
            <polyline points="1.5,5 4,7.5 8.5,2.5" stroke="white" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
        {!checked && indeterminate && (
          <Box sx={{ width: 7, height: 2, bgcolor: "#fff", borderRadius: 1 }} />
        )}
      </Box>
      <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: "#374151" }}>Select All</Typography>
    </Box>
  );
}

// ─── x/y selected badge ───────────────────────────────────────
function SelectedBadge({ selected, total }: { selected: number; total: number }) {
  return (
    <Typography sx={{
      fontSize: 11.5, fontWeight: 700, whiteSpace: "nowrap", flexShrink: 0,
      px: 1.5, py: 0.5, borderRadius: 10,
      color: selected > 0 ? "#15803D" : "#9CA3AF",
      bgcolor: selected > 0 ? "#DCFCE7" : "#F3F4F6",
    }}>
      {selected} / {total} selected
    </Typography>
  );
}

// ─── Module card ──────────────────────────────────────────────
interface ModuleCardProps {
  module:      ModuleItem;
  perms:       Record<string, PermState>;
  expanded:    boolean;
  onToggle:    () => void;
  onSetPerm:   (id: string, key: PermKey, val: boolean) => void;
  onSelectAll: (module: ModuleItem, checked: boolean) => void;
  readOnly:    boolean;
}

const ModuleCard = React.memo(function ModuleCard({
  module, perms, expanded, onToggle, onSetPerm, onSelectAll, readOnly,
}: ModuleCardProps) {
  const hasSubs = !!module.sub_modules?.length;
  const perm    = perms[module.module_id] ?? EMPTY;

  const { selected, total } = moduleCount(module, perms);
  const allChecked  = selected === total && total > 0;
  const someChecked = selected > 0 && selected < total;


  return (
    <Box sx={{ bgcolor: "#fff", border: "1px solid #E5E7EB", borderRadius: 2, mb: 1.5, overflow: "hidden" }}>

      {/* ── Row 1: [icon + Name] ←space-between→ [x/x selected | ☑ Select All | chevron] ── */}
      <Box sx={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        px: 2.5, pt: 1.4, pb: 1, gap: 2,
      }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
          <ModuleBadge name={module.module_name} size={30} />
          <Typography sx={{ fontWeight: 700, fontSize: 14, color: "#1E293B" }}>
            {module.module_name}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexShrink: 0 }}>
          <SelectedBadge selected={selected} total={total} />
          {!readOnly && (
            <SelectAllCheck
              checked={allChecked}
              indeterminate={someChecked}
              onClick={() => onSelectAll(module, !allChecked)}
            />
          )}
          {hasSubs ? (
            <IconButton size="small" onClick={onToggle}
              sx={{ p: 0.3, color: "#94A3B8",
                "&:hover": { color: "#475569", bgcolor: "#F1F5F9" } }}>
              {expanded
                ? <ExpandLessIcon sx={{ fontSize: 19 }} />
                : <ExpandMoreIcon sx={{ fontSize: 19 }} />}
            </IconButton>
          ) : (
            <Box sx={{ width: 26 }} />
          )}
        </Box>
      </Box>

      {/* ── Row 2: permission cards ── */}
      <Box sx={{
        display: "flex", alignItems: "center", gap: 1.5,
        px: 2.5, pb: 1.4,
        borderBottom: hasSubs && expanded ? "1px solid #F0F0F0" : "none",
      }}>
        {PERM_COLS.map((c) => (
          <PermItem
            key={c.key}
            label={c.label}
            icon={c.icon}
            checked={perm[c.key]}
            onClick={() => onSetPerm(module.module_id, c.key, !perm[c.key])}
            readOnly={readOnly}
          />
        ))}
      </Box>

      {/* ── Sub-modules ── */}
      {hasSubs && (
        <Collapse in={expanded}>
          <Box sx={{ px: 2.5, pb: 2, bgcolor: "#F8FAFC" }}>

            {/* SUB MODULES label */}
            <Typography sx={{
              fontSize: 11, fontWeight: 800, color: "#94A3B8",
              textTransform: "uppercase", letterSpacing: "0.1em",
              py: 1,
            }}>
              Sub Modules
            </Typography>

            {/* Single wrapper box containing all sub-module rows */}
            <Box sx={{
              border: "1px solid #E5E7EB",
              borderRadius: 2,
              bgcolor: "#fff",
              overflow: "hidden",
            }}>
              {module.sub_modules!.map((sub, idx) => {
                const sp = perms[sub.module_id] ?? EMPTY;
                const isLast = idx === module.sub_modules!.length - 1;
                return (
                  <Box key={sub.module_id} sx={{
                    display: "flex", alignItems: "center",
                    px: 2.5, py: 1.1, gap: 2,
                    borderBottom: isLast ? "none" : "1px solid #F3F4F6",
                    "&:hover": { bgcolor: "#FAFAFA" },
                  }}>
                    {/* icon + name */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, width: 150, flexShrink: 0 }}>
                      <ModuleBadge name={sub.module_name} size={26} />
                      <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>
                        {sub.module_name}
                      </Typography>
                    </Box>

                    {/* permission cards */}
                    <Box sx={{ flex: 1, display: "flex", alignItems: "center", gap: 1.5 }}>
                      {PERM_COLS.map((c) => (
                        <PermItem
                          key={c.key}
                          label={c.label}
                          icon={c.icon}
                          checked={sp[c.key]}
                          onClick={() => onSetPerm(sub.module_id, c.key, !sp[c.key])}
                          readOnly={readOnly}
                        />
                      ))}
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Collapse>
      )}
    </Box>
  );
});

// ─── Props ────────────────────────────────────────────────────
interface Props {
  mode:           "view" | "edit" | "add";
  roleId?:        string;
  roleName?:      string;
  assignedUsers?: number;
  createdAt?:     string;
  onSaved:        (newId?: string) => void;
  onCancel:       () => void;
  onAdd?:         () => void;
  onEdit?:        () => void;
  onDelete?:      () => void;
}

export default function RoleEditPage({
  mode, roleId, roleName, assignedUsers, createdAt,
  onSaved, onCancel, onAdd, onEdit, onDelete,
}: Props) {
  const isView = mode === "view";
  const isEdit = mode === "edit";
  const isAdd  = mode === "add";

  const { data: modules = [], isLoading: modulesLoading } = useModules();
  const { data: detail,        isLoading: detailLoading  } = useRoleDetail(roleId ?? null);

  const [nameVal,  setNameVal]  = useState("");
  const [descVal,  setDescVal]  = useState("");
  const [perms,    setPerms]    = useState<Record<string, PermState>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [error,    setError]    = useState("");

  useEffect(() => {
    if (!modules.length) return;
    setPerms(initPerms(modules));
    const exp: Record<string, boolean> = {};
    modules.forEach((m) => { if (m.sub_modules?.length) exp[m.module_id] = true; });
    setExpanded(exp);
  }, [modules]);

  useEffect(() => {
    if (!detail || !modules.length) return;
    setNameVal(detail.role_name   ?? "");
    setDescVal(detail.description ?? "");
    const updated = initPerms(modules);
    const walk = (list: typeof detail.permissions) =>
      list.forEach((p) => {
        if (updated[p.module_id]) {
          updated[p.module_id] = {
            can_read:   p.can_read,
            can_create: p.can_create,
            can_edit:   p.can_edit,
            can_delete: p.can_delete,
          };
        }
        if (p.sub_modules?.length) walk(p.sub_modules);
      });
    walk(detail.permissions);
    setPerms(updated);
  }, [detail, modules]);

  useEffect(() => {
    if (isAdd && modules.length) {
      setNameVal(""); setDescVal(""); setError("");
      setPerms(initPerms(modules));
    }
  }, [isAdd, modules]);

  const toggleExpand = useCallback((id: string) =>
    setExpanded((p) => ({ ...p, [id]: !p[id] })), []);

  const setPermFn = useCallback((id: string, key: PermKey, val: boolean) =>
    setPerms((p) => ({ ...p, [id]: { ...p[id], [key]: val } })), []);

  const selectAllForModule = useCallback((module: ModuleItem, checked: boolean) => {
    setPerms((prev) => {
      const next = { ...prev };
      const walk = (m: ModuleItem) => {
        next[m.module_id] = checked ? { ...FULL } : { ...EMPTY };
        m.sub_modules?.forEach(walk);
      };
      walk(module);
      return next;
    });
  }, []);

  const buildPermissions = useCallback((): PermissionPayload[] =>
    Object.entries(perms).map(([module_id, p]) => ({ module_id, ...p })), [perms]);

  const createRole = useCreateRole({ onSuccess: () => onSaved(),       onError: (msg) => setError(msg) });
  const updateRole = useUpdateRole({ onSuccess: () => onSaved(roleId), onError: (msg) => setError(msg) });

  const isSaving  = createRole.isPending || updateRole.isPending;
  const isLoading = modulesLoading || (!!roleId && detailLoading);

  const handleSave = () => {
    if (!nameVal.trim()) { setError("Role name is required."); return; }
    setError("");
    const { zoduId, branchId } = getTenantContext();
    const payload = {
      zodu_id:     (zoduId   as string) || "",
      branch_id:   (branchId as string) || "",
      role_name:   nameVal.trim(),
      description: descVal.trim(),
      permissions: buildPermissions(),
    };
    if (isEdit && roleId) updateRole.mutate({ roleId, payload });
    else createRole.mutate(payload);
  };

  const { selected: totalSelected, total: totalPerms } = useMemo(
    () => countSelected(perms), [perms],
  );

  if (isLoading) return <LottieLoader />;

  const displayName = detail?.role_name ?? roleName ?? "";

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>

      {/* ── Role identity bar ── */}
      <Box sx={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        px: 3, py: 1.5,
        borderBottom: "1px solid #F0F0F0", flexShrink: 0, gap: 2,
      }}>
        {/* Left: shield + name + status */}
        {(isView || isEdit) ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box sx={{
              width: 38, height: 38, bgcolor: "#FFF1F2", borderRadius: 1.5,
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <ShieldIcon sx={{ fontSize: 21, color: "#E11D48" }} />
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
              <Typography sx={{ fontWeight: 700, fontSize: 17, color: "#111827" }}>
                {displayName}
              </Typography>
              <Chip label="Active" size="small" sx={{
                height: 20, fontSize: 10, fontWeight: 700, borderRadius: 0.75,
                bgcolor: "#DCFCE7", color: "#15803D",
                "& .MuiChip-label": { px: 0.75 },
              }} />
            </Box>
          </Box>
        ) : (
          /* Add mode: name + description inputs */
          <Box sx={{ display: "flex", gap: 2, flex: 1 }}>
            <TextField
              label="Role Name" required size="small" sx={{ flex: 1 }}
              value={nameVal} onChange={(e) => setNameVal(e.target.value)}
              error={!!error && !nameVal.trim()}
              slotProps={{ htmlInput: { maxLength: 80 } }}
            />
            <TextField
              label="Description (optional)" size="small" sx={{ flex: 2 }}
              value={descVal} onChange={(e) => setDescVal(e.target.value)}
              slotProps={{ htmlInput: { maxLength: 200 } }}
            />
          </Box>
        )}

        {/* Right: Edit + Delete + Created On + Assigned Users + kebab */}
        {isView && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {/* Edit & Delete action buttons */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <IconButton size="small" onClick={onEdit}
                sx={{
                  p: 0.7, borderRadius: 1.5, color: "#2563EB",
                  bgcolor: "#EFF6FF", border: "1px solid #BFDBFE",
                  "&:hover": { bgcolor: "#DBEAFE" },
                }}>
                <EditNoteIcon sx={{ fontSize: 18 }} />
              </IconButton>
              <IconButton size="small" onClick={onDelete}
                sx={{
                  p: 0.7, borderRadius: 1.5, color: "#E11D48",
                  bgcolor: "#FFF1F2", border: "1px solid #FECDD3",
                  "&:hover": { bgcolor: "#FFE4E6" },
                }}>
                <DeleteOutlineIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Box>

            <Box sx={{ width: "1px", height: 28, bgcolor: "#E5E7EB" }} />

            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
              <CalendarMonthIcon sx={{ fontSize: 17, color: "#6B7280" }} />
              <Box>
                <Typography sx={{ fontSize: 10, color: "#9CA3AF", lineHeight: 1.2 }}>Created On</Typography>
                <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#111827", lineHeight: 1.4 }}>
                  {fmtDate(createdAt)}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
              <GroupIcon sx={{ fontSize: 17, color: "#6B7280" }} />
              <Box>
                <Typography sx={{ fontSize: 10, color: "#9CA3AF", lineHeight: 1.2 }}>Assigned Users</Typography>
                <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#111827", lineHeight: 1.4 }}>
                  {assignedUsers ?? 0} Users
                </Typography>
              </Box>
            </Box>

          </Box>
        )}
      </Box>

      {/* Edit mode: name + desc inputs */}
      {isEdit && (
        <Box sx={{
          display: "flex", gap: 2, px: 3, py: 1.5,
          borderBottom: "1px solid #F0F0F0", flexShrink: 0,
        }}>
          <TextField
            label="Role Name" required size="small" sx={{ flex: 1 }}
            value={nameVal} onChange={(e) => setNameVal(e.target.value)}
            error={!!error && !nameVal.trim()}
            slotProps={{ htmlInput: { maxLength: 80 } }}
          />
          <TextField
            label="Description (optional)" size="small" sx={{ flex: 2 }}
            value={descVal} onChange={(e) => setDescVal(e.target.value)}
            slotProps={{ htmlInput: { maxLength: 200 } }}
          />
        </Box>
      )}

      {/* ── MODULE PERMISSIONS label ── */}
      <Box sx={{ px: 3, py: 1.25, flexShrink: 0, borderBottom: "1px solid #E5E7EB" }}>
        <Typography sx={{
          fontWeight: 700, fontSize: 11.5, color: "#64748B",
          textTransform: "uppercase", letterSpacing: "0.09em",
        }}>
          MODULE PERMISSIONS
        </Typography>
      </Box>

      {/* ── Scrollable module list ── */}
      <Box sx={{ flex: 1, overflowY: "auto", px: 3, py: 2, bgcolor: "#F8FAFC" }}>
        {modules.map((module) => (
          <ModuleCard
            key={module.module_id}
            module={module}
            perms={perms}
            expanded={!!expanded[module.module_id]}
            onToggle={() => toggleExpand(module.module_id)}
            onSetPerm={setPermFn}
            onSelectAll={selectAllForModule}
            readOnly={isView}
          />
        ))}
      </Box>

      {/* ── Footer ── */}
      <Box sx={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        px: 3, py: 1.75, bgcolor: "#fff", borderTop: "1px solid #E5E7EB", flexShrink: 0,
        gap: 2, flexWrap: "wrap",
      }}>
        {/* Total permissions */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={{
            width: 34, height: 34, bgcolor: "#FFF1F2", borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <ShieldIcon sx={{ fontSize: 17, color: "#E11D48" }} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>
              Total Permissions Selected
            </Typography>
            <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#E11D48" }}>
              {totalSelected} of {totalPerms} permissions selected
            </Typography>
          </Box>
        </Box>

        {/* Buttons */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {error && (
            <Typography sx={{ fontSize: 12, color: "#E11D48", mr: 1 }}>{error}</Typography>
          )}

          <Button
            variant="outlined"
            onClick={onCancel}
            sx={{
              borderColor: "#E5E7EB", color: "#374151", fontWeight: 600, fontSize: 13,
              px: 2.5, py: 0.85, borderRadius: 1.5,
              "&:hover": { borderColor: "#9CA3AF", bgcolor: "#F9FAFB" },
            }}
          >
            Cancel
          </Button>

          <Button
            variant="contained" disableElevation
            onClick={isView ? onEdit : handleSave}
            disabled={isSaving}
            startIcon={
              isSaving
                ? <CircularProgress size={14} sx={{ color: "#fff" }} />
                : <SaveIcon sx={{ fontSize: 16 }} />
            }
            sx={{
              bgcolor: "#E11D48", color: "#fff", fontWeight: 700,
              fontSize: 13, px: 3, py: 0.85, borderRadius: 1.5,
              "&:hover": { bgcolor: "#BE123C" },
            }}
          >
            Save Role
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
