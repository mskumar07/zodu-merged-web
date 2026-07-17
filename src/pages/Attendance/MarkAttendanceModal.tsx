import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Box, Button, CircularProgress, Dialog, DialogActions,
  DialogContent, DialogTitle, IconButton, Tooltip, TextField, Typography,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import EditCalendarOutlinedIcon from "@mui/icons-material/EditCalendarOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import {
  useMarkAttendanceMutation,
  useGetMarkAttendanceListQuery,
  type AttendanceStatus,
  type MarkAttendanceRecord,
} from "@store/services/attendanceApi";

// ─── Theme ───────────────────────────────────────────────────

const theme = createTheme({
  palette: {
    primary: { main: "#E11D48", contrastText: "#ffffff" },
    background: { default: "#F8FAFC", paper: "#ffffff" },
    text: { primary: "#0F172A", secondary: "#6B7280" },
  },
  components: {
    MuiButton: { styleOverrides: { root: { textTransform: "none", borderRadius: 8, fontWeight: 700 } } },
    MuiDialog: {
      styleOverrides: {
        paper: { borderRadius: 16, boxShadow: "0 25px 60px rgba(15,23,42,0.2)", maxWidth: 760, width: "100%" },
      },
    },
  },
});

const inputSx = {
  "& .MuiOutlinedInput-root": {
    bgcolor: "#F8FAFC", fontSize: 13, borderRadius: "8px",
    "& .MuiInputBase-input": { padding: "8px 10px" },
    "& fieldset": { borderColor: "#E2E8F0" },
    "&:hover fieldset": { borderColor: "#E11D48" },
    "&.Mui-focused fieldset": { borderColor: "#E11D48", borderWidth: 2 },
  },
};

// ─── Types ───────────────────────────────────────────────────

export type MarkStatus = "present" | "absent" | "weekly_off";

export interface MarkAttendanceEmployee {
  employee_id: string;
  name: string;
  code: string;
  checkIn: string;
  checkOut: string;
  status: MarkStatus;
}

const STATUS_FROM_API: Record<AttendanceStatus, MarkStatus> = {
  "Present": "present",
  "Absent": "absent",
  "Weekly Off": "weekly_off",
};

/** Extracts `HH:mm` from an ISO datetime string for the <input type="time"> value. */
function toHm(iso: string | null): string {
  if (!iso) return "";
  const match = iso.match(/T(\d{2}:\d{2})/);
  return match ? match[1] : "";
}

interface MarkAttendanceModalProps {
  open: boolean;
  onClose: () => void;
  zoduId: string;
  branchId: string;
  markedById: string;
  markedByName: string;
  onSuccess?: () => void;
  onError?: (msg: string) => void;
}

const STATUS_TO_API: Record<MarkStatus, AttendanceStatus> = {
  present: "Present",
  absent: "Absent",
  weekly_off: "Weekly Off",
};

/** Combines a `YYYY-MM-DD` date with an `HH:mm` time into an IST-offset ISO string. */
function toIsoIst(date: string, time: string): string | null {
  if (!time) return null;
  return `${date}T${time}:00+05:30`;
}

const STATUS_OPTIONS: { status: MarkStatus; label: string; icon: React.ElementType; color: string; activeBg: string }[] = [
  { status: "present", label: "Present", icon: CheckCircleIcon, color: "#16A34A", activeBg: "#DCFCE7" },
  { status: "absent", label: "Absent", icon: CancelIcon, color: "#DC2626", activeBg: "#FEE2E2" },
  { status: "weekly_off", label: "Weekly Off", icon: RemoveCircleOutlineIcon, color: "#64748B", activeBg: "#F1F5F9" },
];

function StatusToggle({ value, onChange }: { value: MarkStatus; onChange: (s: MarkStatus) => void }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5 }}>
      {STATUS_OPTIONS.map((opt) => {
        const Icon = opt.icon;
        const active = value === opt.status;
        return (
          <Tooltip key={opt.status} title={opt.label}>
            <IconButton
              size="small"
              onClick={() => onChange(opt.status)}
              sx={{
                width: 30, height: 30,
                color: active ? opt.color : "#CBD5E1",
                bgcolor: active ? opt.activeBg : "transparent",
                "&:hover": { bgcolor: opt.activeBg, color: opt.color },
              }}
            >
              <Icon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        );
      })}
    </Box>
  );
}

// ─── Main ────────────────────────────────────────────────────

export default function MarkAttendanceModal({
  open, onClose, zoduId, branchId, markedById, markedByName, onSuccess, onError,
}: MarkAttendanceModalProps) {
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [page, setPage] = useState(1);
  const [markAttendance, { isLoading: isSaving }] = useMarkAttendanceMutation();

  const {
    data, isFetching, isLoading: isLoadingEmployees,
  } = useGetMarkAttendanceListQuery(
    { zodu_id: zoduId, branch_id: branchId, attendance_date: date, page, limit: 10 },
    { skip: !open || !zoduId || !branchId || !date }
  );

  const employees = useMemo<MarkAttendanceEmployee[]>(() => {
    return (data?.data ?? []).map((emp) => ({
      employee_id: emp.employee_id,
      name: emp.employee_name,
      code: emp.employee_code,
      checkIn: toHm(emp.check_in_time),
      checkOut: toHm(emp.check_out_time),
      status: emp.status ? STATUS_FROM_API[emp.status] : "present",
    }));
  }, [data]);

  const hasNextPage = data ? data.pagination.page < data.pagination.pages : false;
  const isFetchingNextPage = isFetching && page > 1;

  const [overrides, setOverrides] = useState<Record<string, Partial<MarkAttendanceEmployee>>>({});

  const rows = useMemo<MarkAttendanceEmployee[]>(
    () => employees.map((emp) => ({ ...emp, ...overrides[emp.employee_id] })),
    [employees, overrides]
  );

  const sentinelRef = useRef<HTMLTableRowElement>(null) as React.RefObject<HTMLTableRowElement>;
  const listContainerRef = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>;

  useEffect(() => {
    if (open) {
      setDate(today);
      setPage(1);
      setOverrides({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Changing the date starts a fresh list from page 1.
  useEffect(() => {
    setPage(1);
  }, [date]);

  useEffect(() => {
    if (!open) return;
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && hasNextPage && !isFetching) setPage((p) => p + 1); },
      { root: listContainerRef.current }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [open, hasNextPage, isFetching]);

  const updateRow = (employeeId: string, patch: Partial<MarkAttendanceEmployee>) => {
    setOverrides((prev) => ({ ...prev, [employeeId]: { ...prev[employeeId], ...patch } }));
  };

  const handleSave = async () => {
    if (!zoduId || !branchId || !markedById || rows.length === 0) return;

    const records: MarkAttendanceRecord[] = rows.map((r) => ({
      employee_id: r.employee_id,
      status: STATUS_TO_API[r.status],
      check_in_time: r.status === "present" ? toIsoIst(date, r.checkIn) : null,
      check_out_time: r.status === "present" ? toIsoIst(date, r.checkOut) : null,
      remarks: null,
    }));

    try {
      await markAttendance({
        zodu_id: zoduId,
        branch_id: branchId,
        attendance_date: date,
        marked_by: markedById,
        marked_by_name: markedByName,
        records,
      }).unwrap();
      onSuccess?.();
      onClose();
    } catch (err: any) {
      onError?.(err?.data?.error ?? err?.data?.message ?? "Failed to save attendance. Please try again.");
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        {/* ── Header ── */}
        <DialogTitle sx={{
          px: 3, py: 2, borderBottom: "1px solid #F1F5F9",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box sx={{ p: 0.8, bgcolor: "rgba(225,29,72,0.08)", borderRadius: 2, display: "flex" }}>
              <EditCalendarOutlinedIcon sx={{ color: "#E11D48", fontSize: 20 }} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: 17, fontWeight: 800, color: "#0F172A" }}>Mark Attendance</Typography>
              <Typography sx={{ fontSize: 11, color: "#6B7280" }}>
                Select date and mark check-in / check-out time for all employees.
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={onClose} size="small"
            sx={{ color: "#6B7280", bgcolor: "#F9FAFB", "&:hover": { bgcolor: "#F3F4F6" }, borderRadius: "50%" }}>
            <CloseIcon sx={{ fontSize: 17 }} />
          </IconButton>
        </DialogTitle>

        {/* ── Content ── */}
        <DialogContent sx={{ px: 3, py: 3, bgcolor: "#fff", maxHeight: "72vh", overflowY: "auto" }}>
          {/* Select date */}
          <Box sx={{ mb: 2, maxWidth: 260 }}>
            <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#374151", mb: 0.5 }}>Select Date</Typography>
            <TextField
              fullWidth
              size="small"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              sx={inputSx}
            />
          </Box>

          {/* Timezone note */}
          <Box sx={{
            display: "flex", alignItems: "center", gap: 1, mb: 2.5,
            bgcolor: "#EFF6FF", border: "1px solid #DBEAFE", borderRadius: 1.5, px: 1.5, py: 1,
          }}>
            <InfoOutlinedIcon sx={{ fontSize: 16, color: "#2563EB" }} />
            <Typography sx={{ fontSize: 12, color: "#1D4ED8" }}>All times are in Asia/Kolkata (IST)</Typography>
          </Box>

          {/* Employee table */}
          <Box sx={{ border: "1px solid #F1F5F9", borderRadius: 2, overflow: "hidden" }}>
            <Box ref={listContainerRef} sx={{ maxHeight: 360, overflowY: "auto" }}>
              <Box component="table" sx={{ width: "100%", borderCollapse: "collapse" }}>
                <Box component="thead" sx={{ position: "sticky", top: 0, zIndex: 1 }}>
                  <Box component="tr">
                    <Box component="th" sx={theadSx({ textAlign: "left", minWidth: 180 })}>Employee</Box>
                    <Box component="th" sx={theadSx({ textAlign: "left", minWidth: 130 })}>Check-in Time</Box>
                    <Box component="th" sx={theadSx({ textAlign: "left", minWidth: 130 })}>Check-out Time</Box>
                    <Box component="th" sx={theadSx({ textAlign: "center", minWidth: 130 })}>Status</Box>
                  </Box>
                </Box>
                <Box component="tbody">
                  {rows.map((row) => (
                    <Box component="tr" key={row.employee_id} sx={{ "&:hover": { bgcolor: "#FAFAFA" } }}>
                      <Box component="td" sx={tbodySx}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Box sx={{
                            width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                            bgcolor: "#FFF1F2", color: "#E11D48",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 11, fontWeight: 700,
                          }}>
                            {row.name.slice(0, 2).toUpperCase()}
                          </Box>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: "#0F172A" }} noWrap>
                              {row.name}
                            </Typography>
                            <Typography sx={{ fontSize: 11, color: "#9CA3AF" }} noWrap>
                              {row.code}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                      <Box component="td" sx={tbodySx}>
                        <TextField
                          size="small"
                          type="time"
                          value={row.checkIn}
                          onChange={(e) => updateRow(row.employee_id, { checkIn: e.target.value })}
                          disabled={row.status !== "present"}
                          sx={{ ...inputSx, width: 120 }}
                        />
                      </Box>
                      <Box component="td" sx={tbodySx}>
                        <TextField
                          size="small"
                          type="time"
                          value={row.checkOut}
                          onChange={(e) => updateRow(row.employee_id, { checkOut: e.target.value })}
                          disabled={row.status !== "present"}
                          sx={{ ...inputSx, width: 120 }}
                        />
                      </Box>
                      <Box component="td" sx={tbodySx}>
                        <StatusToggle
                          value={row.status}
                          onChange={(status) => updateRow(row.employee_id, { status })}
                        />
                      </Box>
                    </Box>
                  ))}
                  {isLoadingEmployees && rows.length === 0 && (
                    <Box component="tr">
                      <Box component="td" colSpan={4} sx={{ ...tbodySx, textAlign: "center", py: 3 }}>
                        <CircularProgress size={20} sx={{ color: "#E11D48" }} />
                      </Box>
                    </Box>
                  )}
                  <Box component="tr" ref={sentinelRef}>
                    <Box component="td" colSpan={4} sx={{ p: isFetchingNextPage ? 1.5 : 0, textAlign: "center", border: "none" }}>
                      {isFetchingNextPage && <CircularProgress size={16} sx={{ color: "#E11D48" }} />}
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        </DialogContent>

        {/* ── Footer ── */}
        <DialogActions sx={{ px: 3, py: 2, bgcolor: "#F8FAFC", borderTop: "1px solid #F1F5F9", gap: 1.5 }}>
          <Typography sx={{ fontSize: 11.5, color: "#9CA3AF", flex: 1 }}>
            Note: This will update attendance for all employees for the selected date.
          </Typography>
          <Button variant="text" onClick={onClose}
            sx={{ color: "#6B7280", fontWeight: 600, "&:hover": { bgcolor: "#F3F4F6" } }}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSave} disabled={isSaving} disableElevation
            sx={{ bgcolor: "#E11D48", color: "#fff", px: 3, "&:hover": { bgcolor: "#BE123C" } }}>
            {isSaving ? <CircularProgress size={16} sx={{ color: "#fff" }} /> : "Save Attendance"}
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
}

// ─── Shared table cell sx ───────────────────────────────────────────────────

function theadSx(extra: Record<string, unknown> = {}) {
  return {
    px: 1.5, py: 1,
    fontSize: 10.5, fontWeight: 700, color: "#6B7280",
    textTransform: "uppercase" as const, letterSpacing: "0.04em",
    bgcolor: "#F9FAFB", borderBottom: "1px solid #E5E7EB",
    ...extra,
  };
}

const tbodySx = {
  px: 1.5, py: 1,
  borderBottom: "1px solid #F1F5F9",
};
