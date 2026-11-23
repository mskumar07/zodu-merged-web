import { useEffect, useRef, type ReactNode } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import { useAppSelector } from "@store/store";
import { AllCompanies, BranchId, IsAuthenticated, ZoduId } from "@store/slices/userSlice";
import { useSessionBoot } from "@hooks/useSessionBoot";
import { useEnterBranch } from "@hooks/useEnterBranch";
import { peekHandoff, takeHandoff } from "@utils/handoff";
import SessionReconciliationGate from "./SessionReconciliationGate";

type ProtectedRouteProps = {
  children?: ReactNode;
};

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation();
  const isAuthenticated = useAppSelector(IsAuthenticated);
  // After a reload: a new access token from the refresh cookie first.
  const sessionReady = useSessionBoot(isAuthenticated);

  // Opened from another Zodu app (e.g. Attendance's MY APPS) on a branch POS is not on, or on none yet: switch to it.
  const companies = useAppSelector(AllCompanies);
  const zoduId = useAppSelector(ZoduId);
  const branchId = useAppSelector(BranchId);
  const enterBranch = useEnterBranch();
  const handoffRef = useRef(false);
  useEffect(() => {
    if (!isAuthenticated || !sessionReady || handoffRef.current) return;
    const wanted = peekHandoff();
    if (!wanted.zoduId) return;
    handoffRef.current = true;
    takeHandoff();
    if (wanted.zoduId === zoduId && (!wanted.branchId || wanted.branchId === branchId)) return;
    const company = companies.find((c) => c.zodu_id === wanted.zoduId);
    const branch = company?.branches?.find((b) => b.branch_id === wanted.branchId) ?? company?.branches?.[0];
    if (company && branch) void enterBranch(company, branch.branch_id, branch.branch_name);
  }, [isAuthenticated, sessionReady, zoduId, branchId, companies, enterBranch]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!sessionReady) {
    return (
      <Box sx={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <CircularProgress size={26} sx={{ color: "#c8101f" }} />
      </Box>
    );
  }

  // A session restored from localStorage carries a permission cache we only
  // treat as optimistic — the gate refreshes it, and holds the UI back when
  // there is nothing trustworthy to render behind.
  return (
    <SessionReconciliationGate>
      {children ? <>{children}</> : <Outlet />}
    </SessionReconciliationGate>
  );
}
