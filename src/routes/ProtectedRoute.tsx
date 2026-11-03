import type { ReactNode } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import { useAppSelector } from "@store/store";
import { IsAuthenticated } from "@store/slices/userSlice";
import { useSessionBoot } from "@hooks/useSessionBoot";
import SessionReconciliationGate from "./SessionReconciliationGate";

type ProtectedRouteProps = {
  children?: ReactNode;
};

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation();
  const isAuthenticated = useAppSelector(IsAuthenticated);
  // After a reload: a new access token from the refresh cookie first.
  const sessionReady = useSessionBoot(isAuthenticated);

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
