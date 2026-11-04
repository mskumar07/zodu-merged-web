import { memo, useCallback, useState } from "react";
import type { ComponentType } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import ButtonBase from "@mui/material/ButtonBase";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAppSelector } from "@store/store";
import { AllCompanies, BranchId, UserProfile, ZoduId } from "@store/slices/userSlice";
import type { CompanyWithBranches } from "@pages/auth/Authapi";
import { useEnterBranch } from "@hooks/useEnterBranch";
import { useSignOut } from "@hooks/useSignOut";
import { attendanceUrl } from "@config/apps";
import zlogo from "../../../assets/zlogo.png";

/**
 * My Apps: the first screen after signing in. zodu POS is this app (its
 * dashboard); zodu Attendance is a separate app on a subdomain that opens the
 * same session (see config/apps.ts) — no second login.
 */

const BRAND_RED = "#E8002D";
const INK = "#111827";
const MUTED = "#6B7280";
const BORDER = "#EBEDF0";

type AppKey = "pos" | "attendance" | "task" | "payroll";

type AppItem = {
  key: AppKey;
  name: string;
  accent: string;
  desc: string;
  Icon: ComponentType<{ sx?: object }>;
  enabled: boolean;
};

const APPS: AppItem[] = [
  { key: "pos", name: "zodu", accent: "POS", desc: "Billing, invoicing and point of sale for retail and restaurants.", Icon: ReceiptLongOutlinedIcon, enabled: true },
  { key: "attendance", name: "zodu", accent: "Attendance", desc: "Track employee attendance, leaves and work hours.", Icon: CalendarMonthOutlinedIcon, enabled: true },
  { key: "task", name: "zodu", accent: "Task", desc: "Create, assign and track tasks with your team.", Icon: AssignmentTurnedInOutlinedIcon, enabled: false },
  { key: "payroll", name: "zodu", accent: "Payroll", desc: "Manage payroll, salaries and compliance with ease.", Icon: CurrencyRupeeIcon, enabled: false },
];

const cardSx = {
  position: "relative",
  overflow: "hidden",
  display: "flex",
  gap: 2.5,
  p: { xs: 2.5, md: 3 },
  bgcolor: "#fff",
  border: `1px solid ${BORDER}`,
  borderRadius: "14px",
  boxShadow: "0 2px 10px rgba(17,24,39,0.04)",
  // Soft pink swoosh, pure CSS (no image to load).
  "&::after": {
    content: '""',
    position: "absolute",
    right: -60,
    bottom: -70,
    width: 220,
    height: 150,
    borderRadius: "50%",
    background: "radial-gradient(closest-side, rgba(232,0,45,0.08), rgba(232,0,45,0))",
    pointerEvents: "none",
  },
} as const;

const AppCard = memo(function AppCard({ app, onOpen, busy, disabled }: { app: AppItem; onOpen: (app: AppItem) => void; busy: boolean; disabled: boolean }) {
  const { Icon } = app;
  return (
    <Box sx={cardSx}>
      <Icon sx={{ fontSize: 56, color: INK, flexShrink: 0 }} />
      <Box sx={{ minWidth: 0, position: "relative", zIndex: 1 }}>
        <Typography sx={{ fontSize: { xs: 24, md: 28 }, fontWeight: 800, color: INK, lineHeight: 1.15, letterSpacing: "-0.02em" }}>
          {app.name}{" "}
          <Box component="span" sx={{ color: BRAND_RED }}>{app.accent}</Box>
        </Typography>
        <Typography sx={{ mt: 1.25, fontSize: 14.5, color: MUTED, lineHeight: 1.5, maxWidth: 300 }}>{app.desc}</Typography>
        <ButtonBase
          onClick={() => onOpen(app)}
          disabled={disabled}
          sx={{
            "&.Mui-disabled": { opacity: 0.7, color: "#fff" },
            mt: 2.25, px: 2.25, py: 1, gap: 1, borderRadius: "8px",
            bgcolor: app.enabled ? BRAND_RED : "#9CA3AF", color: "#fff", fontSize: 14.5, fontWeight: 700,
            boxShadow: app.enabled ? "0 6px 14px rgba(232,0,45,0.22)" : "none",
            "&:hover": { bgcolor: app.enabled ? "#C90027" : "#9CA3AF" },
          }}
        >
          {busy ? "Opening…" : app.enabled ? "Open App" : "Coming soon"} <ArrowForwardIcon sx={{ fontSize: 18 }} />
        </ButtonBase>
      </Box>
    </Box>
  );
});

/** The branch to open an app on: the one last used, else the primary company's first. */
function defaultBranch(companies: CompanyWithBranches[], zoduId: string, branchId: string) {
  const company = companies.find((c) => c.zodu_id === zoduId) ?? companies.find((c) => c.is_primary) ?? companies[0];
  const branch = company?.branches?.find((b) => b.branch_id === branchId) ?? company?.branches?.[0];
  return company && branch ? { company, branch } : null;
}

export default function MyApps() {
  const navigate = useNavigate();
  const signOut = useSignOut();
  const profile = useAppSelector(UserProfile);
  const companies = useAppSelector(AllCompanies);
  const zoduId = useAppSelector(ZoduId);
  const branchId = useAppSelector(BranchId);
  const enterBranch = useEnterBranch();
  const [menuEl, setMenuEl] = useState<HTMLElement | null>(null);
  const [opening, setOpening] = useState<AppKey | null>(null);

  const name = (profile?.employee_name || profile?.restaurant_name || "").trim();
  const initials = name.split(/\s+/).map((p) => p[0]).slice(0, 2).join("").toUpperCase() || "U";

  const openApp = useCallback(
    async (app: AppItem) => {
      if (!app.enabled) {
        toast.info(`zodu ${app.accent} is coming soon.`, { toastId: `soon-${app.key}` });
        return;
      }
      if (opening) return;
      const target = defaultBranch(companies, zoduId, branchId);

      if (app.key === "attendance") {
        // Attendance opens this same session and switches to the branch named here.
        setOpening(app.key);
        window.location.assign(attendanceUrl(target?.company.zodu_id, target?.branch.branch_id));
        return;
      }

      // zodu POS: this app. Straight to the dashboard on the last-used branch;
      // only a user with no company/branch to pick goes to /select-branch.
      if (!target) {
        navigate("/select-branch", { state: { companies } });
        return;
      }
      setOpening(app.key);
      const ok = await enterBranch(target.company, target.branch.branch_id, target.branch.branch_name);
      if (ok) navigate("/dashboard", { replace: true });
      else setOpening(null);
    },
    [navigate, companies, zoduId, branchId, enterBranch, opening]
  );

  return (
    <Box sx={{ minHeight: "100dvh", bgcolor: "#fff", position: "relative", overflow: "hidden" }}>
      {/* Header */}
      <Box component="header" sx={{ height: 70, px: { xs: 2, md: 4 }, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${BORDER}` }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2.5, minWidth: 0 }}>
          <Box component="img" src={zlogo} alt="Zodu" sx={{ height: { xs: 26, md: 32 }, width: "auto" }} />
          <Box sx={{ width: "1px", height: 28, bgcolor: BORDER }} />
          <Typography sx={{ fontSize: 17, fontWeight: 600, color: INK }}>My Apps</Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 0.5, md: 1.5 } }}>
          <ButtonBase
            onClick={(e) => setMenuEl(e.currentTarget)}
            aria-label="Account menu"
            sx={{ display: "flex", alignItems: "center", gap: 1, pl: 0.75, pr: 1.25, py: 0.5, borderRadius: "999px", bgcolor: "#FDECEF" }}
          >
            <Avatar sx={{ width: 32, height: 32, bgcolor: "#F8C9D1", color: BRAND_RED, fontSize: 13, fontWeight: 700 }}>{initials}</Avatar>
            <Typography sx={{ display: { xs: "none", sm: "block" }, fontSize: 14, fontWeight: 700, color: INK, textTransform: "uppercase" }}>{name || "Account"}</Typography>
            <KeyboardArrowDownIcon sx={{ fontSize: 20, color: INK }} />
          </ButtonBase>
          {menuEl && (
            <Menu open anchorEl={menuEl} onClose={() => setMenuEl(null)}>
              <MenuItem onClick={() => { setMenuEl(null); void signOut(); }}>Sign out</MenuItem>
            </Menu>
          )}
        </Box>
      </Box>

      {/* Body */}
      <Box component="main" sx={{ maxWidth: 1500, mx: "auto", px: { xs: 2, md: 6 }, pt: { xs: 3, md: 5 }, pb: 6 }}>
        <Typography component="h1" sx={{ fontSize: { xs: 26, md: 34 }, fontWeight: 800, color: INK, letterSpacing: "-0.02em" }}>
          Welcome Back{name ? `, ${name}` : ""}!
        </Typography>
        <Typography sx={{ mt: 0.5, fontSize: 18, color: MUTED }}>Choose an app to continue</Typography>

        <Box sx={{ mt: 4, display: "grid", gap: 3, gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" } }}>
          {APPS.map((app) => (
            <AppCard key={app.key} app={app} onOpen={openApp} busy={opening === app.key} disabled={opening !== null} />
          ))}
        </Box>
      </Box>
    </Box>
  );
}
