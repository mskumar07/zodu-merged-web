import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import {
  Box, Button, Typography, CircularProgress,
  TextField, InputAdornment, Select, MenuItem, FormControl,
  IconButton, Tooltip,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingOutlinedIcon from "@mui/icons-material/PendingOutlined";
import AccessTimeFilledIcon from "@mui/icons-material/AccessTimeFilled";
import CancelIcon from "@mui/icons-material/Cancel";
import HourglassBottomIcon from "@mui/icons-material/HourglassBottom";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import FilterListIcon from "@mui/icons-material/FilterList";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import ChecklistIcon from "@mui/icons-material/Checklist";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import SuccessToast from "@components/Common/SuccessToast";
import StatCard from "@components/StatCard";
import DataTable, { type ColumnDef } from "@utils/DataTable";
import { useAppSelector } from "@store/store";
import { useModulePermission } from "@hooks/useModulePermission";
import { ZoduId, BranchId, UserProfile } from "@store/slices/userSlice";
import {
  useGetMyChecklistSummaryQuery,
  useGetMyChecklistTasksQuery,
  useGetAssignedEmployeesQuery,
  useGetAssignedEmployeesSummaryQuery,
  useGetChecklistByIdQuery,
  type MyTaskItem,
  type AssignedChecklistSummary,
  type AssignedChecklistAssignee,
} from "./checklistNewApi";
import CreateTaskModal from "./CreateTaskModal";
import UpdateTaskStatusModal, { type TaskStatusDetail, type ItemStatus } from "./UpdateTaskStatusModal";
import LottieLoader from "@components/LottieLoader";


// ─── Theme ─────────────────────────────────────────────────────────────────────

const theme = createTheme({
  palette: {
    primary: { main: "#E11D48" },
    background: { default: "#FFFFFF", paper: "#FFFFFF" },
    text: { primary: "#0F172A", secondary: "#6B7280" },
  },
  components: {
    MuiButton: { styleOverrides: { root: { textTransform: "none", borderRadius: 8, fontWeight: 600 } } },
    MuiOutlinedInput: { styleOverrides: { root: { borderRadius: 8, fontSize: 13 } } },
  },
});

// ─── Status helpers ───────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  "Not Started": { bg: "#FEE2E2", color: "#DC2626" },
  "Pending":     { bg: "#FEF9C3", color: "#A16207" },
  "In Progress": { bg: "#DBEAFE", color: "#1D4ED8" },
  "Completed":   { bg: "#DCFCE7", color: "#15803D" },
  "Overdue":     { bg: "#FEE2E2", color: "#DC2626" },
};

function StatusChip({ status }: { status: string }) {
  const c = STATUS_COLORS[status] ?? STATUS_COLORS["Not Started"];
  return (
    <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.6 }}>
      <Box component="span" sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: c.color, flexShrink: 0 }} />
      <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: c.color, whiteSpace: "nowrap" }}>
        {status}
      </Typography>
    </Box>
  );
}

function formatDate(dt: string | null): string {
  if (!dt) return "—";
  return new Date(dt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function isOverdue(dt: string | null): boolean {
  if (!dt) return false;
  const due = new Date(dt);
  due.setHours(23, 59, 59, 999);
  return due.getTime() < Date.now();
}

const AVATAR_BG = "#FCE7F3";
const AVATAR_COLOR = "#DB2777";

function CountPill({ value, color }: { value: number; color: string }) {
  return (
    <Box sx={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      minWidth: 26, height: 22, px: 1,
      color, fontSize: 12, fontWeight: 700,
    }}>
      {value}
    </Box>
  );
}

// ─── Status Overview (compact icon+count, hides zero-value statuses) ───────

const STATUS_OVERVIEW_META = {
  completed:   { icon: CheckCircleIcon,       color: "#16A34A", bg: "#DCFCE7", label: "Completed" },
  in_progress: { icon: AccessTimeFilledIcon,  color: "#2563EB", bg: "#DBEAFE", label: "In Progress" },
  pending:     { icon: HourglassBottomIcon,   color: "#D97706", bg: "#FEF3C7", label: "Pending" },
  cancelled:   { icon: CancelIcon,            color: "#DC2626", bg: "#FEE2E2", label: "Cancelled" },
} as const;

function StatusOverviewLegend() {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
      {(Object.keys(STATUS_OVERVIEW_META) as (keyof typeof STATUS_OVERVIEW_META)[]).map((key) => {
        const meta = STATUS_OVERVIEW_META[key];
        const Icon = meta.icon;
        return (
          <Box key={key} sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Icon sx={{ fontSize: 14, color: meta.color }} />
            <Typography sx={{ fontSize: 12, color: "#6B7280", fontWeight: 500 }}>{meta.label}</Typography>
          </Box>
        );
      })}
    </Box>
  );
}

function StatusOverview({ pending, in_progress, completed, cancelled }: {
  pending: number; in_progress: number; completed: number; cancelled: number;
}) {
  const counts = { completed, in_progress, pending, cancelled };
  const entries = (Object.keys(STATUS_OVERVIEW_META) as (keyof typeof STATUS_OVERVIEW_META)[])
    .filter((key) => counts[key] > 0);

  if (entries.length === 0) {
    return <Typography sx={{ fontSize: 12, color: "#9CA3AF" }}>—</Typography>;
  }

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, flexWrap: "wrap" }}>
      {entries.map((key) => {
        const meta = STATUS_OVERVIEW_META[key];
        const Icon = meta.icon;
        return (
          <Tooltip key={key} title={meta.label}>
            <Box sx={{
              display: "inline-flex", alignItems: "center", gap: 0.5,
              bgcolor: meta.bg, color: meta.color,
              borderRadius: 10, height: 24, pl: 0.6, pr: 1,
            }}>
              <Icon sx={{ fontSize: 15 }} />
              <Typography sx={{ fontSize: 12, fontWeight: 700, lineHeight: 1 }}>{counts[key]}</Typography>
            </Box>
          </Tooltip>
        );
      })}
    </Box>
  );
}

// ─── Task Row cells ──────────────────────────────────────────────────────────

function ProgressRing({ value, color }: { value: number; color: string }) {
  return (
    <Box sx={{ position: "relative", display: "inline-flex" }}>
      <CircularProgress variant="determinate" value={100} size={32} thickness={4} sx={{ color: "#F1F5F9" }} />
      <CircularProgress
        variant="determinate" value={value} size={32} thickness={4}
        sx={{ color, position: "absolute", left: 0 }}
      />
      <Box sx={{
        position: "absolute", inset: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Typography sx={{ fontSize: 9, fontWeight: 700, color: "#374151" }}>{value}%</Typography>
      </Box>
    </Box>
  );
}

function buildTaskColumns(onView: (id: string) => void, canEdit: boolean): ColumnDef<MyTaskItem>[] {
  return [
    {
      key: "checklist_code",
      label: "Checklist ID",
      width: 120,
      render: (task) => (
        <Typography
          onClick={() => onView(task.id)}
          sx={{
            fontSize: 13, fontWeight: 700, color: "#1976d2", whiteSpace: "nowrap",
            cursor: "pointer", textDecoration: "none",
            "&:hover": { textDecoration: "underline" },
          }}
          noWrap
        >
          {task.checklist_code ?? "—"}
        </Typography>
      ),
    },
    {
      key: "title",
      label: "Task / Checklist",
      minWidth: 220,
      render: (task) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
          <Box sx={{
            width: 28, height: 28, borderRadius: 1.5, flexShrink: 0,
            bgcolor: "#EEF2FF", color: "#6366F1",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <ChecklistIcon sx={{ fontSize: 15 }} />
          </Box>
          <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#374151" }} noWrap>{task.title}</Typography>
        </Box>
      ),
    },
    {
      key: "description",
      label: "Description",
      minWidth: 200,
      render: (task) =>
        task.description ? (
          <Tooltip title={task.description}>
            <Typography sx={{ fontSize: 13, color: "#374151" }} noWrap>{task.description}</Typography>
          </Tooltip>
        ) : (
          <Typography sx={{ fontSize: 13, color: "#374151" }}>—</Typography>
        ),
    },
    {
      key: "created_by_name",
      label: "Created By",
      width: 140,
      render: (task) => (
        <Typography sx={{ fontSize: 13, color: "#374151" }} noWrap>{task.created_by_name || "—"}</Typography>
      ),
    },
    {
      key: "status",
      label: "Status",
      width: 120,
      render: (task) => <StatusChip status={task.status} />,
    },
    {
      key: "progress",
      label: "Progress",
      width: 110,
      align: "center",
      render: (task) => {
        const progress = task.total_items > 0 ? Math.round((task.completed_items / task.total_items) * 100) : 0;
        const progressColor = task.status === "Overdue" ? "#EF4444" : task.status === "Completed" ? "#22C55E" : "#3B82F6";
        return (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.25 }}>
            <ProgressRing value={progress} color={progressColor} />
            <Typography sx={{ fontSize: 10.5, color: "#9CA3AF" }}>
              {task.completed_items} / {task.total_items}
            </Typography>
          </Box>
        );
      },
    },
    {
      key: "due_date",
      label: "Due Date",
      width: 130,
      render: (task) => (
        <Typography sx={{ fontSize: 13, color: "#374151" }} noWrap>{formatDate(task.due_date)}</Typography>
      ),
    },
    {
      key: "action",
      label: "Action",
      width: 120,
      align: "center",
      render: (task) => (
        <Button
          variant="outlined"
          size="small"
          disabled={!canEdit}
          onClick={() => onView(task.id)}
          sx={{
            fontSize: 12, fontWeight: 700, py: 0.5, px: 1.75, borderColor: "#E11D48", color: "#E11D48",
            borderRadius: 1.5, whiteSpace: "nowrap",
            "&:hover": { bgcolor: "#FFF1F2", borderColor: "#E11D48" },
          }}
        >
          View Task
        </Button>
      ),
    },
  ];
}

// ─── Assignees cell (avatar + comma-separated names, full list on hover) ───

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/);
  return parts.length === 1 ? parts[0].slice(0, 2).toUpperCase() : (parts[0][0] + parts[1][0]).toUpperCase();
}

function AssigneesCell({ assignees }: { assignees?: AssignedChecklistAssignee[] | null }) {
  const list = assignees ?? [];

  if (list.length === 0) {
    return <Typography sx={{ fontSize: 12, color: "#9CA3AF" }}>—</Typography>;
  }

  const names = list.map((a) => a.employee_name ?? "Unknown");
  const fullNames = names.join(", ");
  const isTruncated = names.length > 2;
  const summary = isTruncated ? `${names.slice(0, 2).join(", ")}` : fullNames;
  const overflowCount = isTruncated ? names.length - 2 : 0;

  const content = (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, minWidth: 0 }}>
      <Box sx={{
        width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
        bgcolor: AVATAR_BG,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 10, fontWeight: 700, color: AVATAR_COLOR,
      }}>
        {initialsOf(names[0])}
      </Box>
      <Typography sx={{ fontSize: 12.5, color: "#374151", cursor: isTruncated ? "default" : "inherit" }} noWrap>
        {summary}
        {overflowCount > 0 && (
          <Box component="span" sx={{ color: "#9CA3AF", fontWeight: 600 }}> +{overflowCount}</Box>
        )}
      </Typography>
    </Box>
  );

  return isTruncated ? <Tooltip title={fullNames}>{content}</Tooltip> : content;
}

// ─── Checklist Assignment columns ───────────────────────────────────────────

function buildChecklistColumns(
  onView: (id: string) => void,
  onEdit: (id: string) => void,
  canEdit: boolean
): ColumnDef<AssignedChecklistSummary>[] {
  return [
    {
      key: "checklist_code",
      label: "Checklist ID",
      width: 120,
      render: (item) => (
        <Typography
          onClick={() => onView(item.checklist_id)}
          sx={{
            fontSize: 13, fontWeight: 700, color: "#2563EB", whiteSpace: "nowrap",
            cursor: "pointer", textDecoration: "none",
            "&:hover": { textDecoration: "underline" },
          }}
          noWrap
        >
          {item.checklist_code ?? "—"}
        </Typography>
      ),
    },
    {
      key: "title",
      label: "Checklist Name",
      minWidth: 200,
      render: (item) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
          <Box sx={{
            width: 26, height: 26, borderRadius: 1.5, flexShrink: 0,
            bgcolor: "#FCE7F3", color: "#DB2777",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <DescriptionOutlinedIcon sx={{ fontSize: 14 }} />
          </Box>
          <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#374151" }} noWrap>{item.title ?? "—"}</Typography>
        </Box>
      ),
    },
    {
      key: "total_items",
      label: "Total",
      width: 70,
      align: "center",
      render: (item) => <CountPill value={item.total_items ?? 0} color="#4338CA" />,
    },
    {
      key: "status_overview",
      label: "Status Overview",
      minWidth: 200,
      render: (item) => (
        <StatusOverview
          pending={item.pending ?? 0}
          in_progress={item.in_progress ?? 0}
          completed={item.completed ?? 0}
          cancelled={item.cancelled ?? 0}
        />
      ),
    },
    {
      key: "assignees",
      label: "Assigned To",
      minWidth: 160,
      render: (item) => <AssigneesCell assignees={item.assignees} />,
    },
    {
      key: "created_by_name",
      label: "Created By",
      width: 140,
      render: (item) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <VerifiedUserOutlinedIcon sx={{ fontSize: 14, color: "#9CA3AF" }} />
          <Typography sx={{ fontSize: 13, color: "#374151" }} noWrap>{item.created_by_name ?? "—"}</Typography>
        </Box>
      ),
    },
    {
      key: "due_date",
      label: "Due Date",
      width: 130,
      render: (item) => {
        const isFullyDone = (item.pending ?? 0) === 0 && (item.in_progress ?? 0) === 0;
        const overdue = isOverdue(item.due_date) && !isFullyDone;
        return (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <CalendarMonthOutlinedIcon sx={{ fontSize: 14, color: overdue ? "#EF4444" : "#9CA3AF" }} />
            <Typography sx={{ fontSize: 13, fontWeight: overdue ? 700 : 400, color: overdue ? "#EF4444" : "#374151" }} noWrap>
              {formatDate(item.due_date)}
            </Typography>
          </Box>
        );
      },
    },
    {
      key: "action",
      label: "Action",
      width: 140,
      align: "center",
      render: (item) => (
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1, py: 0.5 }}>
          <IconButton
            size="small"
            disabled={!canEdit}
            onClick={() => onEdit(item.checklist_id)}
            sx={{ color: "#1976d2", p: 0.6, borderRadius: 1, "&:hover": { color: "#1565C0", bgcolor: "#EFF6FF" }, transition: "all 0.12s" }}
          >
            <EditOutlinedIcon sx={{ fontSize: 15 }} />
          </IconButton>
          <Button
            variant="outlined"
            size="small"
            disabled={!canEdit}
            onClick={() => onView(item.checklist_id)}
            sx={{
              fontSize: 12, fontWeight: 700, py: 0.5, px: 1.75, borderColor: "#E11D48", color: "#E11D48",
              borderRadius: 1.5, whiteSpace: "nowrap",
              "&:hover": { bgcolor: "#FFF1F2", borderColor: "#E11D48" },
            }}
          >
            View Task
          </Button>
        </Box>
      ),
    },
  ];
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ChecklistDashboard() {
  const { canCreate, canEdit } = useModulePermission("Checklist / Tasklist");
  const zoduId = useAppSelector(ZoduId);
  const branchId = useAppSelector(BranchId);
  const profile = useAppSelector(UserProfile);
  const employeeId = (profile as any)?.employee_id ?? (profile as any)?.id ?? "";
  const isReportingManager = !!(profile as any)?.reporting_manager_id;

  const [createOpen, setCreateOpen] = useState(false);
  const [viewTaskId, setViewTaskId] = useState<string | null>(null);
  const [isEditingTask, setIsEditingTask] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [page, setPage] = useState(1);
  const [taskRows, setTaskRows] = useState<MyTaskItem[]>([]);
  const taskScrollSentinelRef = useRef<HTMLTableRowElement | null>(null);

  // Checklist table filters + infinite scroll
  const [empSearch, setEmpSearch] = useState("");
  const [empStatusFilter, setEmpStatusFilter] = useState("All Status");
  const [empPage, setEmpPage] = useState(1);
  const [checklistRows, setChecklistRows] = useState<AssignedChecklistSummary[]>([]);
  const scrollSentinelRef = useRef<HTMLTableRowElement | null>(null);

  const commonParams = { zodu_id: zoduId, branch_id: branchId, employee_id: employeeId };

  const { data: summaryData, isLoading: summaryLoading, refetch: refetchSummary } =
    useGetMyChecklistSummaryQuery(
      { ...commonParams, search: search.trim() || undefined, status: statusFilter },
      { skip: !zoduId || !branchId }
    );

  const { data: assignedEmployeesSummaryData, isLoading: assignedEmployeesSummaryLoading, refetch: refetchAssignedEmployeesSummary } =
    useGetAssignedEmployeesSummaryQuery(
      { ...commonParams, search: empSearch.trim() || undefined, status: empStatusFilter },
      { skip: !zoduId || !branchId }
    );

  const { data: tasksData, isLoading: tasksLoading, refetch: refetchTasks } =
    useGetMyChecklistTasksQuery(
      { ...commonParams, page, limit: 10, search: search.trim() || undefined, status: statusFilter },
      { skip: !zoduId || !branchId }
    );

  const { data: assignedEmployeesData, isFetching: employeesFetching, isLoading: employeesLoading, refetch: refetchEmployees } =
    useGetAssignedEmployeesQuery(
      { ...commonParams, page: empPage, limit: 10, search: empSearch.trim() || undefined, status: empStatusFilter },
      { skip: !zoduId || !branchId }
    );

  const { data: checklistDetailData } = useGetChecklistByIdQuery(
    { id: viewTaskId ?? "", zodu_id: zoduId, branch_id: branchId },
    { skip: !viewTaskId || !zoduId || !branchId }
  );

  const viewTask: TaskStatusDetail | null = useMemo(() => {
    const c = checklistDetailData?.data;
    if (!c) return null;
    return {
      taskTitle: c.title,
      taskId: c.checklist_code ?? c.id,
      checklistDbId: c.id,
      dueDate: formatDate(c.due_date),
      assignedBy: c.created_by_name ?? "—",
      assignedById: c.created_by,
      assignedOn: formatDate(c.created_at),
      status: c.status,
      assignees: (c.assignees ?? []).map((a) => ({ id: a.employee_id, name: a.employee_name })),
      description: c.description ?? "",
      items: (c.items ?? []).map((i) => ({
        id: i.id,
        order: i.item_order,
        title: i.item_title,
        description: i.description ?? "",
        referenceImageUrl: i.file_url?.[0]?.file_url ?? null,
        status: (i.status as ItemStatus) ?? "Not Started",
        remarks: i.remarks ?? "",
        files: [
          ...(i.file_url ?? []).map((f) => ({ id: f.id, name: f.file_name, url: f.file_url, uploadedBy: f.uploaded_by_name ?? undefined, uploadedById: f.uploaded_by ?? undefined, isEmployeeUpload: false })),
          ...(i.employee_checklist_upload ?? []).map((f) => ({ id: f.id, name: f.file_name, url: f.file_url, uploadedBy: f.uploaded_by_name ?? undefined, uploadedById: f.uploaded_by ?? undefined, isEmployeeUpload: true })),
        ],
      })),
      files: (c.attachments ?? []).flatMap((att: any) => {
        // The backend returns attachments either nested ({ file_url: FileEntry[] }) or
        // flat (the attachment row itself is a FileEntry with file_url as a URL string).
        const entries = Array.isArray(att.file_url) ? att.file_url : [att];
        return entries
          .filter((f: any) => f && f.file_name)
          .map((f: any) => ({
            id: f.id,
            name: f.file_name,
            url: f.file_url ?? "",
            type: (f.file_name.split(".").pop() ?? "file").toLowerCase(),
            sizeLabel: "",
            uploadedBy: f.uploaded_by_name ?? undefined,
            uploadedById: f.uploaded_by ?? undefined,
          }));
      }),
    };
  }, [checklistDetailData]);

  // Only resets the page cursor — row state is left alone until fresh page-1 data
  // actually arrives (see the replace/append effects below). Clearing rows here
  // eagerly would blank the table if the refetch it precedes ever resolves to a
  // reference-equal (structurally-shared) or otherwise effect-skipping response.
  const resetChecklistRows = useCallback(() => {
    setEmpPage(1);
  }, []);

  // Filter changes are a real context switch, so clear stale rows immediately here.
  useEffect(() => {
    setChecklistRows([]);
    setEmpPage(1);
  }, [empSearch, empStatusFilter]);

  const resetTaskRows = useCallback(() => {
    setPage(1);
  }, []);

  // Filter changes are a real context switch, so clear stale rows immediately here.
  useEffect(() => {
    setTaskRows([]);
    setPage(1);
  }, [search, statusFilter]);

  // Replace rows with page 1's data, or append page 2+ data — only once the response
  // actually matches the page currently requested (guards against a stale/in-flight
  // response from a page we've since navigated away from being applied).
  useEffect(() => {
    if (!assignedEmployeesData || assignedEmployeesData.pagination.page !== empPage) return;
    setChecklistRows((prev) => (empPage === 1 ? assignedEmployeesData.data : [...prev, ...assignedEmployeesData.data]));
  }, [assignedEmployeesData, empPage]);

  const hasMoreChecklistRows = !!assignedEmployeesData
    && assignedEmployeesData.pagination.page === empPage
    && empPage < assignedEmployeesData.pagination.pages;

  // Infinite scroll: load the next page only once the user has actually scrolled the
  // container (scrollTop > 0). Without this, a short first page leaves the sentinel
  // visible in the viewport the instant it mounts, and the IntersectionObserver fires
  // immediately — fetching page 2 with no scrolling at all. A scroll listener is also
  // attached because the observer callback only fires on a visibility *transition*, so
  // a sentinel that was already intersecting on mount wouldn't otherwise re-fire once
  // the user does scroll.
  useEffect(() => {
    const node = scrollSentinelRef.current;
    if (!hasMoreChecklistRows || !node) return;
    const container = node.parentElement;
    let triggered = false;
    const tryTrigger = () => {
      if (triggered || (container?.scrollTop ?? 0) <= 0) return;
      triggered = true;
      setEmpPage((p) => p + 1);
    };
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) tryTrigger(); },
      { root: container, threshold: 0.1 }
    );
    observer.observe(node);
    container?.addEventListener("scroll", tryTrigger);
    return () => { observer.disconnect(); container?.removeEventListener("scroll", tryTrigger); };
  }, [hasMoreChecklistRows]);

  // Same pattern as the checklist table above.
  useEffect(() => {
    if (!tasksData || tasksData.pagination.page !== page) return;
    setTaskRows((prev) => (page === 1 ? tasksData.data : [...prev, ...tasksData.data]));
  }, [tasksData, page]);

  const hasMoreTaskRows = !!tasksData
    && tasksData.pagination.page === page
    && page < tasksData.pagination.pages;

  // Same guard as the checklist sentinel effect above — see that comment for why scrollTop is checked.
  useEffect(() => {
    const node = taskScrollSentinelRef.current;
    if (!hasMoreTaskRows || !node) return;
    const container = node.parentElement;
    let triggered = false;
    const tryTrigger = () => {
      if (triggered || (container?.scrollTop ?? 0) <= 0) return;
      triggered = true;
      setPage((p) => p + 1);
    };
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) tryTrigger(); },
      { root: container, threshold: 0.1 }
    );
    observer.observe(node);
    container?.addEventListener("scroll", tryTrigger);
    return () => { observer.disconnect(); container?.removeEventListener("scroll", tryTrigger); };
  }, [hasMoreTaskRows]);

  const summary = summaryData?.data;
  const assignedEmployeesSummary = assignedEmployeesSummaryData?.data;

  const handleSuccess = useCallback((msg: string) => {
    setSuccessMsg(msg);
    refetchSummary();
    refetchAssignedEmployeesSummary();
    resetChecklistRows();
    resetTaskRows();
    // If we were already on page 1, resetting won't change query args, so force a refetch
    // to pull the latest data; otherwise the page reset itself triggers the fetch.
    if (empPage === 1) refetchEmployees();
    if (page === 1) refetchTasks();
  }, [refetchSummary, refetchAssignedEmployeesSummary, resetChecklistRows, resetTaskRows, refetchEmployees, refetchTasks, empPage, page]);

  const handleView = useCallback((id: string) => {
    setViewTaskId(id);
  }, []);

  const handleEdit = useCallback((id: string) => {
    setViewTaskId(id);
    setIsEditingTask(true);
  }, []);

  const checklistColumns = useMemo(() => buildChecklistColumns(handleView, handleEdit, canEdit), [handleView, handleEdit, canEdit]);
  const taskColumns = useMemo(() => buildTaskColumns(handleView, canEdit), [handleView, canEdit]);

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ bgcolor: "#ffffff", minHeight: "100vh" }}>
        {/* Stat cards */}
        <Box sx={{px:3, pt: 3}}>
        {summaryLoading || assignedEmployeesSummaryLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
            <CircularProgress size={28} sx={{ color: "#E11D48" }} />
          </Box>
        ) : (
          <Box sx={{ display: "flex", gap: 4, mb: 3, flexWrap: "wrap", alignItems: "flex-start" }}>
            {/* Left: Assigned To Employees summary */}
            {isReportingManager && (
              <Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 1.25 }}>
                  <PeopleAltOutlinedIcon sx={{ fontSize: 16, color: "#4F46E5" }} />
                  <Typography sx={{ fontSize: 13, fontWeight: 800, color: "#4338CA", letterSpacing: 0.2 }}>
                    Assigned to Employees
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                  <StatCard
                    radius={2}
                    label="Total Assigned Tasks"
                    value={assignedEmployeesSummary?.total_assigned ?? 0}
                    valuePrefix=""
                    icon={<AssignmentOutlinedIcon sx={{ color: "#4F46E5" }} />}
                    iconBgColor="#E0E1FA"
                  />
                  <StatCard
                    radius={2}
                    label="Pending Tasks"
                    value={assignedEmployeesSummary?.pending ?? 0}
                    valuePrefix=""
                    icon={<PendingOutlinedIcon sx={{ color: "#0E7490" }} />}
                    iconBgColor="#CFEEF3"
                  />
                  <StatCard
                    radius={2}
                    label="Completed"
                    value={assignedEmployeesSummary?.completed ?? 0}
                    valuePrefix=""
                    icon={<CheckCircleOutlineIcon sx={{ color: "#16A34A" }} />}
                    iconBgColor="#D3F5DE"
                  />
                </Box>
              </Box>
            )}

            {/* Right: My Assigned Tasks summary */}
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 1.25 }}>
                <ChecklistIcon sx={{ fontSize: 16, color: "#E11D48" }} />
                <Typography sx={{ fontSize: 13, fontWeight: 800, color: "#BE123C", letterSpacing: 0.2 }}>
                  My Assigned Tasks
                </Typography>
              </Box>
              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                <StatCard
                  radius={2}
                  label="Total Assigned Tasks"
                  value={summary?.tasks_assigned ?? 0}
                  valuePrefix=""
                  icon={<AssignmentOutlinedIcon sx={{ color: "#4F46E5" }} />}
                  iconBgColor="#E0E1FA"
                />
                <StatCard
                  radius={2}
                  label="Pending Tasks"
                  value={summary?.pending ?? 0}
                  valuePrefix=""
                  icon={<PendingOutlinedIcon sx={{ color: "#0E7490" }} />}
                  iconBgColor="#CFEEF3"
                />
                <StatCard
                  radius={2}
                  label="Completed"
                  value={summary?.completed ?? 0}
                  valuePrefix=""
                  icon={<CheckCircleOutlineIcon sx={{ color: "#16A34A" }} />}
                  iconBgColor="#D3F5DE"
                />
              </Box>
            </Box>
          </Box>
        )}

        {/* Employee filter row */}
        <Box sx={{ display: "flex", gap: 1.5, mb: 2, flexWrap: "wrap", alignItems: "center" }}>
          {isReportingManager && (
            <>
              <TextField
                size="small"
                placeholder="Search by checklist ID, name or employee..."
                value={empSearch}
                onChange={(e) => setEmpSearch(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ fontSize: 16, color: "#9CA3AF" }} />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{ flex: 1, minWidth: 280, maxWidth: 440, bgcolor: "#fff" }}
              />
              <FormControl size="small" sx={{ minWidth: 130, bgcolor: "#fff" }}>
                <Select value={empStatusFilter} onChange={(e) => setEmpStatusFilter(e.target.value)}>
                  <MenuItem value="All Status">All Status</MenuItem>
                  {["Pending", "In Progress", "Completed"].map((s) => (
                    <MenuItem key={s} value={s}>{s}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button
                variant="outlined"
                startIcon={<FilterListIcon sx={{ fontSize: 16 }} />}
                onClick={() => { setEmpSearch(""); setEmpStatusFilter("All Status"); }}
                sx={{ borderColor: "#E5E7EB", color: "#374151", bgcolor: "#fff", ml: "auto" }}
              >
                Reset Filter
              </Button>
            </>
          )}
          {isReportingManager && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setCreateOpen(true)}
              disableElevation
              disabled={!canCreate}
              sx={{ bgcolor: "#E11D48", color: "#fff", px: 3, "&:hover": { bgcolor: "#BE123C" } }}
            >
              Assign Task
            </Button>
          )}
        </Box>

        {/* Checklist assignment table */}
        {isReportingManager && (
          <Box sx={{ mb: 3 }}>
            {/* Status legend */}
            <Box sx={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              px: 0.5, pb: 1.25,
            }}>
              <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#0F172A" }}>
                Assigned Checklists
              </Typography>
              <StatusOverviewLegend />
            </Box>

            {(employeesLoading || employeesFetching) && checklistRows.length === 0 ? (
              <LottieLoader />
            ) : (
              <DataTable<AssignedChecklistSummary>
                columns={checklistColumns}
                rows={checklistRows}
                rowKey={(item) => item.checklist_id}
                maxHeight={400}
                hasNextPage={hasMoreChecklistRows}
                loadMoreRef={scrollSentinelRef}
                emptyMessage="No checklists found"
              />
            )}
          </Box>
        )}

        {/* My Assigned Tasks */}
        <Box sx={{ bgcolor: "#fff", borderRadius: 2.5, border: "1px solid #F1F5F9", overflow: "hidden" }}>
          {/* Section header */}
          <Box sx={{ px: 2.5, pt: 2.5, pb: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box sx={{
                width: 44, height: 44, borderRadius: 2, flexShrink: 0,
                bgcolor: "#EEF2FF", color: "#6366F1",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <ChecklistIcon sx={{ fontSize: 22 }} />
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: 18, color: "#0F172A" }}>
                  My Assigned Tasks{" "}
                  <Box component="span" sx={{ fontWeight: 400, color: "#9CA3AF", fontSize: 14 }}>
                    (Assigned by me)
                  </Box>
                </Typography>
                <Typography sx={{ fontSize: 13, color: "#6B7280" }}>
                  Track and manage all tasks assigned to you
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Filters row */}
          <Box sx={{ px: 2.5, py: 1.5, display: "flex", gap: 1.5, borderBottom: "1px solid #F1F5F9" }}>
            <TextField
              size="small"
              placeholder="Search by checklist ID, name"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ fontSize: 16, color: "#9CA3AF" }} />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{ flex: 1, minWidth: 280, maxWidth: 440 }}
            />
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <MenuItem value="All Status">All Status</MenuItem>
                {["Pending", "In Progress", "Completed"].map((s) => (
                  <MenuItem key={s} value={s}>{s}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="outlined"
              startIcon={<FilterListIcon sx={{ fontSize: 16 }} />}
              onClick={() => { setSearch(""); setStatusFilter("All Status"); }}
              sx={{ borderColor: "#E5E7EB", color: "#374151", bgcolor: "#fff", ml: "auto" }}
            >
              Reset Filter
            </Button>
          </Box>

          {/* Rows */}
          {tasksLoading && taskRows.length === 0 ? (
            <LottieLoader />
          ) : (
            <DataTable<MyTaskItem>
              columns={taskColumns}
              rows={taskRows}
              rowKey={(task) => task.id}
              maxHeight={400}
              hasNextPage={hasMoreTaskRows}
              loadMoreRef={taskScrollSentinelRef}
              emptyMessage="No tasks found"
            />
          )}
          </Box>
        </Box>

        {/* Create / Edit Task Modal */}
        <CreateTaskModal
          open={createOpen || isEditingTask}
          onClose={() => { setCreateOpen(false); setIsEditingTask(false); setViewTaskId(null); }}
          onSuccess={() => {
            setIsEditingTask(false);
            setViewTaskId(null);
            handleSuccess(isEditingTask ? "Task updated successfully!" : "Task created successfully!");
          }}
          onError={(msg) => setErrorMsg(msg)}
          editChecklist={isEditingTask ? checklistDetailData?.data ?? null : null}
        />

        {/* Update Task Status Modal */}
        <UpdateTaskStatusModal
          open={!!viewTaskId && !isEditingTask}
          onClose={() => setViewTaskId(null)}
          task={viewTask}
          loggedEmployeeId={employeeId}
          canEdit={canEdit}
          onEdit={() => setIsEditingTask(true)}
          onSuccess={() => {
            setSuccessMsg("Task status updated successfully!");
            setViewTaskId(null);
            refetchSummary();
            refetchAssignedEmployeesSummary();
            resetChecklistRows();
            resetTaskRows();
            // If we were already on page 1, resetting won't change query args, so force a refetch
            // to pull the latest data; otherwise the page reset itself triggers the fetch.
            if (empPage === 1) refetchEmployees();
            if (page === 1) refetchTasks();
          }}
          onError={(msg) => setErrorMsg(msg)}
        />

        <SuccessToast message={successMsg} onClose={() => setSuccessMsg("")} />
        <SuccessToast message={errorMsg} severity="error" onClose={() => setErrorMsg("")} />
      </Box>
    </ThemeProvider>
  );
}
