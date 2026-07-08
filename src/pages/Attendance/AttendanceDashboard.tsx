import React, { useMemo, useState, useCallback } from "react";
import {
  Box, Button, Tooltip, Typography, CircularProgress, Select, MenuItem, FormControl,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import PercentOutlinedIcon from "@mui/icons-material/PercentOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import StatCard from "@components/StatCard";
import { useAppSelector } from "@store/store";
import { BranchId, ZoduId, UserProfile } from "@store/slices/userSlice";
import {
  useGetTeamAttendanceQuery,
  useGetMyAttendanceQuery,
  type AttendanceStatus,
  type TeamAttendanceEmployee,
} from "@store/services/attendanceApi";
import LottieLoader from "@components/LottieLoader";
import SuccessToast from "@components/Common/SuccessToast";
import MarkAttendanceModal, { type MarkAttendanceEmployee } from "./MarkAttendanceModal";

// ─── Theme ─────────────────────────────────────────────────────────────────

const theme = createTheme({
  palette: {
    primary: { main: "#E11D48" },
    background: { default: "#FFFFFF", paper: "#FFFFFF" },
    text: { primary: "#0F172A", secondary: "#6B7280" },
  },
  components: {
    MuiButton: { styleOverrides: { root: { textTransform: "none", borderRadius: 8, fontWeight: 600 } } },
  },
});

// ─── Attendance status meta (legend + per-day dots) ─────────────────────────
// UI keys stay lowercase/snake_case; STATUS_API_MAP bridges to the backend's
// display-cased `AttendanceStatus` strings ("Present" | "Absent" | "Weekly Off").

type UiStatus = "present" | "absent" | "weekly_off";

const STATUS_API_MAP: Record<AttendanceStatus, UiStatus> = {
  "Present": "present",
  "Absent": "absent",
  "Weekly Off": "weekly_off",
};

const STATUS_META: Record<UiStatus, { icon: React.ElementType; color: string; label: string }> = {
  present:    { icon: CheckCircleIcon,         color: "#22C55E", label: "Present" },
  absent:     { icon: CancelIcon,              color: "#EF4444", label: "Absent" },
  weekly_off: { icon: RemoveCircleOutlineIcon, color: "#94A3B8", label: "Weekly Off" },
};

const LEGEND_ITEMS: UiStatus[] = ["present", "absent", "weekly_off"];

function StatusDot({ status }: { status: UiStatus | null }) {
  if (!status) {
    return <Typography sx={{ fontSize: 13, color: "#CBD5E1", textAlign: "center" }}>—</Typography>;
  }
  const meta = STATUS_META[status];
  const Icon = meta.icon;
  return (
    <Box sx={{ display: "flex", justifyContent: "center" }}>
      <Icon sx={{ fontSize: 16, color: meta.color }} />
    </Box>
  );
}

function Legend() {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
      {LEGEND_ITEMS.map((status) => {
        const meta = STATUS_META[status];
        const Icon = meta.icon;
        return (
          <Box key={status} sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Icon sx={{ fontSize: 14, color: meta.color }} />
            <Typography sx={{ fontSize: 11.5, color: "#6B7280", fontWeight: 500 }}>{meta.label}</Typography>
          </Box>
        );
      })}
    </Box>
  );
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function MonthYearFilter({ month, year, years, onMonthChange, onYearChange }: {
  month: number; year: number; years: number[];
  onMonthChange: (m: number) => void; onYearChange: (y: number) => void;
}) {
  return (
    <Box sx={{ display: "flex", gap: 1 }}>
      <FormControl size="small" sx={{ minWidth: 130 }}>
        <Select value={month} onChange={(e) => onMonthChange(Number(e.target.value))} sx={{ fontSize: 13 }}>
          {MONTH_NAMES.map((label, idx) => (
            <MenuItem key={label} value={idx + 1} sx={{ fontSize: 13 }}>{label}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl size="small" sx={{ minWidth: 90 }}>
        <Select value={year} onChange={(e) => onYearChange(Number(e.target.value))} sx={{ fontSize: 13 }}>
          {years.map((y) => (
            <MenuItem key={y} value={y} sx={{ fontSize: 13 }}>{y}</MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────

function daysInMonth(year: number, month1to12: number): number {
  return new Date(year, month1to12, 0).getDate();
}

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

function isoDate(year: number, month1to12: number, day: number): string {
  return `${year}-${pad2(month1to12)}-${pad2(day)}`;
}

function weekdayLabel(year: number, month1to12: number, day: number): string {
  return new Date(year, month1to12 - 1, day).toLocaleDateString("en-IN", { weekday: "short" }).slice(0, 3);
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/);
  return parts.length === 1 ? parts[0].slice(0, 2).toUpperCase() : (parts[0][0] + parts[1][0]).toUpperCase();
}

const AVATAR_PALETTE = ["#FCE7F3", "#DBEAFE", "#DCFCE7", "#FEF3C7", "#EDE9FE", "#E0F2FE"];
const AVATAR_TEXT = ["#DB2777", "#1D4ED8", "#15803D", "#B45309", "#6D28D9", "#0369A1"];

function avatarColors(seed: string): { bg: string; color: string } {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  const idx = hash % AVATAR_PALETTE.length;
  return { bg: AVATAR_PALETTE[idx], color: AVATAR_TEXT[idx] };
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

// ─── Main Component ────────────────────────────────────────────────────────

export default function AttendanceDashboard() {
  const zoduId = useAppSelector(ZoduId);
  const branchId = useAppSelector(BranchId);
  const profile = useAppSelector(UserProfile);
  const employeeId: string = (profile as any)?.employee_id ?? (profile as any)?.id ?? "";

  const today = useMemo(() => new Date(), []);
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1); // 1-12, matches API contract

  const monthLabel = `${MONTH_NAMES[month - 1]} ${year}`;
  const totalDays = daysInMonth(year, month);
  const dateColumns = useMemo(() => Array.from({ length: totalDays }, (_, i) => i + 1), [totalDays]);
  const yearOptions = useMemo(() => {
    const current = today.getFullYear();
    return Array.from({ length: 6 }, (_, i) => current - 4 + i);
  }, [today]);

  const canQueryTeam = Boolean(zoduId && branchId && employeeId);
  const canQueryMine = Boolean(zoduId && branchId && employeeId);

  const {
    data: teamData,
    isFetching: teamFetching,
    isLoading: teamLoading,
  } = useGetTeamAttendanceQuery(
    { zodu_id: zoduId, branch_id: branchId, employee_id: employeeId, month, year },
    { skip: !canQueryTeam }
  );

  const {
    data: myData,
    isFetching: myFetching,
    isLoading: myLoading,
  } = useGetMyAttendanceQuery(
    { zodu_id: zoduId, branch_id: branchId, employee_id: employeeId, month, year },
    { skip: !canQueryMine }
  );

  // ── Team summary (top-left cards) ──
  const teamSummary = teamData?.data?.summary;
  const presentDaysAvg = teamSummary ? round1(teamSummary.avg_present_days) : 0;
  const attendancePct = teamSummary ? round1(teamSummary.avg_attendance_pct) : 0;
  const absentPct = teamSummary ? round1(teamSummary.avg_absent_pct) : 0;

  // ── Team grid rows ──
  const teamEmployees: TeamAttendanceEmployee[] = teamData?.data?.employees ?? [];

  const teamRows = useMemo(() => {
    return teamEmployees.map((emp) => {
      const statusByDay = new Map<number, UiStatus>();
      for (const day of dateColumns) {
        const entry = emp.days[isoDate(year, month, day)];
        if (entry) statusByDay.set(day, STATUS_API_MAP[entry.status]);
      }
      return {
        id: emp.employee_id,
        name: emp.employee_name,
        code: emp.employee_code,
        role: emp.designation ?? "",
        statusByDay,
        presentCount: emp.present_days,
        absentCount: emp.absent_days,
      };
    });
  }, [teamEmployees, dateColumns, year, month]);

  // ── My summary (top-right cards) ──
  const mySummary = myData?.data?.summary;
  const myPresentDays = mySummary?.present_days ?? 0;
  const myAbsentDays = mySummary?.absent_days ?? 0;
  const myAttendancePct = mySummary ? round1(mySummary.attendance_pct) : 0;

  // ── My daily strip ──
  const myStatusByDay = useMemo(() => {
    const map = new Map<number, UiStatus>();
    for (const entry of myData?.data?.days ?? []) {
      const day = Number(entry.attendance_date.slice(-2));
      map.set(day, STATUS_API_MAP[entry.status]);
    }
    return map;
  }, [myData]);

  const isTeamBusy = teamLoading || teamFetching;
  const isMyBusy = myLoading || myFetching;

  // ── Mark Attendance modal ──
  const [markModalOpen, setMarkModalOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const markAttendanceEmployees: MarkAttendanceEmployee[] = useMemo(() => {
    return teamEmployees.map((emp) => ({
      employee_id: emp.employee_id,
      name: emp.employee_name,
      code: emp.employee_code,
      role: emp.designation ?? "",
      checkIn: "",
      checkOut: "",
      status: "present",
    }));
  }, [teamEmployees]);

  const handleMarkSuccess = useCallback(() => {
    setSuccessMsg("Attendance saved successfully!");
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ bgcolor: "#ffffff", minHeight: "100vh", width: "100%", minWidth: 0, px: 3, py: 3, boxSizing: "border-box" }}>
        {/* ── Summary Cards (grouped, like Checklist dashboard) ───────────── */}
        <Box sx={{ display: "flex", gap: 4, mb: 3, flexWrap: "wrap", alignItems: "flex-start" }}>
          {/* Team Attendance summary */}
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 1.25 }}>
              <PeopleAltOutlinedIcon sx={{ fontSize: 16, color: "#4F46E5" }} />
              <Typography sx={{ fontSize: 13, fontWeight: 800, color: "#4338CA", letterSpacing: 0.2 }}>
                Team Attendance
              </Typography>
            </Box>
            {isTeamBusy && !teamData ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 2, minWidth: 300 }}>
                <CircularProgress size={22} sx={{ color: "#E11D48" }} />
              </Box>
            ) : (
              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                <StatCard
                  radius={2}
                  label="Present Days (Avg.)"
                  value={presentDaysAvg}
                  valuePrefix=""
                  icon={<EventAvailableOutlinedIcon sx={{ color: "#0E7490" }} />}
                  iconBgColor="#CFEEF3"
                />
                <StatCard
                  radius={2}
                  label="Attendance % (Avg.)"
                  value={attendancePct}
                  valuePrefix=""
                  icon={<PercentOutlinedIcon sx={{ color: "#16A34A" }} />}
                  iconBgColor="#D3F5DE"
                />
                <StatCard
                  radius={2}
                  label="Absent Days % (Avg.)"
                  value={absentPct}
                  valuePrefix=""
                  icon={<CancelIcon sx={{ color: "#DC2626" }} />}
                  iconBgColor="#FEE2E2"
                />
              </Box>
            )}
          </Box>

          {/* My Attendance summary */}
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 1.25 }}>
              <EventAvailableOutlinedIcon sx={{ fontSize: 16, color: "#E11D48" }} />
              <Typography sx={{ fontSize: 13, fontWeight: 800, color: "#BE123C", letterSpacing: 0.2 }}>
                My Attendance
              </Typography>
            </Box>
            {isMyBusy && !myData ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 2, minWidth: 300 }}>
                <CircularProgress size={22} sx={{ color: "#E11D48" }} />
              </Box>
            ) : (
              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                <StatCard
                  radius={2}
                  label="Present Days"
                  value={myPresentDays}
                  valuePrefix=""
                  icon={<CheckCircleIcon sx={{ color: "#16A34A" }} />}
                  iconBgColor="#D3F5DE"
                />
                <StatCard
                  radius={2}
                  label="Absent Days"
                  value={myAbsentDays}
                  valuePrefix=""
                  icon={<CancelIcon sx={{ color: "#DC2626" }} />}
                  iconBgColor="#FEE2E2"
                />
                <StatCard
                  radius={2}
                  label="Attendance %"
                  value={myAttendancePct}
                  valuePrefix=""
                  icon={<PercentOutlinedIcon sx={{ color: "#0E7490" }} />}
                  iconBgColor="#CFEEF3"
                />
              </Box>
            )}
          </Box>
        </Box>

        {/* ── Title + Mark Attendance ───────────────────────────────────── */}
        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 2.5, flexWrap: "wrap", gap: 1.5 }}>
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
              <Typography sx={{ fontSize: 19, fontWeight: 700, color: "#0F172A" }}>
                My Team Attendance
              </Typography>
              <Tooltip title="Overview of your team's attendance for the current month">
                <InfoOutlinedIcon sx={{ fontSize: 16, color: "#9CA3AF" }} />
              </Tooltip>
            </Box>
            <Typography sx={{ fontSize: 13, color: "#6B7280" }}>
              View and manage attendance for your team members.
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<EditOutlinedIcon sx={{ fontSize: 16 }} />}
            disableElevation
            onClick={() => setMarkModalOpen(true)}
            disabled={markAttendanceEmployees.length === 0}
            sx={{ bgcolor: "#E11D48", color: "#fff", px: 2.5, "&:hover": { bgcolor: "#BE123C" } }}
          >
            Mark Attendance
          </Button>
        </Box>

        {/* ── Team Attendance Grid ───────────────────────────────────────── */}
        <Box sx={{ border: "1px solid #F1F5F9", borderRadius: 2.5, overflow: "hidden", mb: 3, width: "100%", minWidth: 0 }}>
          <Box sx={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            px: 2.5, py: 2, flexWrap: "wrap", gap: 1.5,
          }}>
            <Typography sx={{ fontSize: 15, fontWeight: 700, color: "#0F172A" }}>
              Team Attendance — {monthLabel}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
              <MonthYearFilter month={month} year={year} years={yearOptions} onMonthChange={setMonth} onYearChange={setYear} />
              <Legend />
            </Box>
          </Box>

          {isTeamBusy && !teamData ? (
            <LottieLoader />
          ) : (
            <Box sx={{
              overflowX: "auto", overflowY: "hidden", width: "100%",
              scrollbarWidth: "auto" as const,
              scrollbarColor: "#CBD5E1 #F1F5F9",
              "&::-webkit-scrollbar": { height: 10 },
              "&::-webkit-scrollbar-track": { background: "#F1F5F9" },
              "&::-webkit-scrollbar-thumb": { background: "#CBD5E1", borderRadius: "999px" },
              "&::-webkit-scrollbar-thumb:hover": { background: "#94A3B8" },
            }}>
              <Box
                component="table"
                sx={{
                  borderCollapse: "collapse",
                  tableLayout: "fixed",
                  width: 180 + totalDays * 32 + 90,
                }}
              >
                <Box component="colgroup">
                  <Box component="col" sx={{ width: 180 }} />
                  {dateColumns.map((d) => (
                    <Box component="col" key={d} sx={{ width: 32 }} />
                  ))}
                  <Box component="col" sx={{ width: 90 }} />
                </Box>
                <Box component="thead">
                  <Box component="tr">
                    <Box component="th" sx={theadCellSx({ position: "sticky", left: 0, zIndex: 2 })}>
                      Employee / Date
                    </Box>
                    {dateColumns.map((d) => (
                      <Box component="th" key={d} sx={theadCellSx({ textAlign: "center", px: 0.25 })}>
                        <Box sx={{ fontWeight: 700 }}>{d}</Box>
                        <Box sx={{ fontSize: 9.5, color: "#9CA3AF", fontWeight: 500 }}>
                          {weekdayLabel(year, month, d)}
                        </Box>
                      </Box>
                    ))}
                    <Box component="th" sx={theadCellSx({ position: "sticky", right: 0, zIndex: 2 })}>
                      Summary
                    </Box>
                  </Box>
                </Box>
                <Box component="tbody">
                  {teamRows.length === 0 ? (
                    <Box component="tr">
                      <Box component="td" colSpan={dateColumns.length + 2} sx={{ textAlign: "center", py: 4, color: "#9CA3AF", fontSize: 13 }}>
                        No team attendance records found.
                      </Box>
                    </Box>
                  ) : (
                    teamRows.map((row) => {
                      const colors = avatarColors(row.name);
                      return (
                        <Box component="tr" key={row.id} sx={{ "&:hover": { bgcolor: "#FAFAFA" } }}>
                          <Box component="td" sx={{
                            ...tbodyCellSx, position: "sticky", left: 0, bgcolor: "#fff", zIndex: 1,
                            borderRight: "1px solid #F1F5F9", px: 1,
                          }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, minWidth: 0 }}>
                              <Box sx={{
                                width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                                bgcolor: colors.bg, color: colors.color,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: 11, fontWeight: 700,
                              }}>
                                {initialsOf(row.name)}
                              </Box>
                              <Box sx={{ minWidth: 0 }}>
                                <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: "#0F172A" }} noWrap>
                                  {row.name}
                                </Typography>
                                <Typography sx={{ fontSize: 11, color: "#9CA3AF" }} noWrap>
                                  {row.code}{row.role ? ` · ${row.role}` : ""}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>

                          {dateColumns.map((day) => (
                            <Box component="td" key={day} sx={{ ...tbodyCellSx, textAlign: "center", px: 0.25 }}>
                              <StatusDot status={row.statusByDay.get(day) ?? null} />
                            </Box>
                          ))}

                          <Box component="td" sx={{
                            ...tbodyCellSx, position: "sticky", right: 0, bgcolor: "#fff", zIndex: 1,
                            borderLeft: "1px solid #F1F5F9",
                          }}>
                            <Typography sx={{ fontSize: 11, color: "#374151", lineHeight: 1.5 }}>
                              {row.presentCount} Present
                              {row.absentCount > 0 && <><br />{row.absentCount} Absent</>}
                            </Typography>
                          </Box>
                        </Box>
                      );
                    })
                  )}
                </Box>
              </Box>
            </Box>
          )}
        </Box>

        {/* ── My Attendance ──────────────────────────────────────────────── */}
        <Box sx={{ border: "1px solid #F1F5F9", borderRadius: 2.5, overflow: "hidden", width: "100%", minWidth: 0 }}>
          <Box sx={{
            display: "flex", alignItems: "flex-start", justifyContent: "space-between",
            px: 2.5, py: 2, flexWrap: "wrap", gap: 1.5,
          }}>
            <Box>
              <Typography sx={{ fontSize: 15, fontWeight: 700, color: "#0F172A" }}>
                My Attendance — {monthLabel}
              </Typography>
              <Typography sx={{ fontSize: 12.5, color: "#6B7280" }}>
                Your personal attendance summary for this month.
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
              <MonthYearFilter month={month} year={year} years={yearOptions} onMonthChange={setMonth} onYearChange={setYear} />
              <Button
                variant="outlined"
                size="small"
                startIcon={<EventAvailableOutlinedIcon sx={{ fontSize: 15 }} />}
                sx={{ borderColor: "#E5E7EB", color: "#374151", "&:hover": { borderColor: "#9CA3AF" } }}
              >
                Daily View
              </Button>
            </Box>
          </Box>

          {isMyBusy && !myData ? (
            <LottieLoader />
          ) : (
            <Box sx={{
              overflowX: "auto", overflowY: "hidden", width: "100%",
              scrollbarWidth: "auto" as const,
              scrollbarColor: "#CBD5E1 #F1F5F9",
              "&::-webkit-scrollbar": { height: 10 },
              "&::-webkit-scrollbar-track": { background: "#F1F5F9" },
              "&::-webkit-scrollbar-thumb": { background: "#CBD5E1", borderRadius: "999px" },
              "&::-webkit-scrollbar-thumb:hover": { background: "#94A3B8" },
            }}>
              <Box
                component="table"
                sx={{
                  borderCollapse: "collapse",
                  tableLayout: "fixed",
                  width: 90 + totalDays * 32 + 90,
                }}
              >
                <Box component="colgroup">
                  <Box component="col" sx={{ width: 90 }} />
                  {dateColumns.map((d) => (
                    <Box component="col" key={d} sx={{ width: 32 }} />
                  ))}
                  <Box component="col" sx={{ width: 90 }} />
                </Box>
                <Box component="tbody">
                  <Box component="tr">
                    <Box component="td" sx={{
                      ...tbodyCellSx, position: "sticky", left: 0, bgcolor: "#fff", zIndex: 1,
                      borderRight: "1px solid #F1F5F9",
                      fontSize: 10.5, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.04em",
                    }}>
                      Date
                    </Box>
                    {dateColumns.map((d) => (
                      <Box component="td" key={d} sx={{ ...tbodyCellSx, textAlign: "center", px: 0.25 }}>
                        <Box sx={{ fontWeight: 700, fontSize: 11, color: "#374151" }}>{d}</Box>
                        <Box sx={{ fontSize: 9.5, color: "#9CA3AF", fontWeight: 500 }}>
                          {weekdayLabel(year, month, d)}
                        </Box>
                      </Box>
                    ))}
                    <Box component="td" rowSpan={2} sx={{
                      ...tbodyCellSx, position: "sticky", right: 0, bgcolor: "#fff", zIndex: 1,
                      borderLeft: "1px solid #F1F5F9",
                    }}>
                      <Typography sx={{ fontSize: 11, color: "#374151", lineHeight: 1.5 }}>
                        {myPresentDays} Present
                        {myAbsentDays > 0 && <><br />{myAbsentDays} Absent</>}
                      </Typography>
                    </Box>
                  </Box>
                  <Box component="tr">
                    <Box component="td" sx={{
                      ...tbodyCellSx, position: "sticky", left: 0, bgcolor: "#fff", zIndex: 1,
                      borderRight: "1px solid #F1F5F9",
                      fontSize: 10.5, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.04em",
                    }}>
                      Status
                    </Box>
                    {dateColumns.map((day) => (
                      <Box component="td" key={day} sx={{ ...tbodyCellSx, textAlign: "center", px: 0.25 }}>
                        <StatusDot status={myStatusByDay.get(day) ?? null} />
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Box>
            </Box>
          )}
        </Box>

        <MarkAttendanceModal
          open={markModalOpen}
          onClose={() => setMarkModalOpen(false)}
          employees={markAttendanceEmployees}
          zoduId={zoduId}
          branchId={branchId}
          markedById={employeeId}
          markedByName={(profile as any)?.name ?? (profile as any)?.full_name ?? "—"}
          onSuccess={handleMarkSuccess}
          onError={(msg) => setErrorMsg(msg)}
        />

        <SuccessToast message={successMsg} onClose={() => setSuccessMsg("")} />
        <SuccessToast message={errorMsg} severity="error" onClose={() => setErrorMsg("")} />
      </Box>
    </ThemeProvider>
  );
}

// ─── Shared table cell sx ───────────────────────────────────────────────────

function theadCellSx(extra: Record<string, unknown> = {}) {
  return {
    px: 1.25, py: 1,
    fontSize: 10.5, fontWeight: 700, color: "#6B7280",
    textTransform: "uppercase" as const, letterSpacing: "0.04em",
    bgcolor: "#F9FAFB", borderBottom: "1px solid #E5E7EB",
    textAlign: "left" as const, whiteSpace: "nowrap" as const,
    ...extra,
  };
}

const tbodyCellSx = {
  px: 1.25, py: 1,
  borderBottom: "1px solid #F1F5F9",
  whiteSpace: "nowrap" as const,
};
