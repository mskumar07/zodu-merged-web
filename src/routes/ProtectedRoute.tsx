import type { ReactNode } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppSelector } from "@store/store";
import { IsAuthenticated } from "@store/slices/userSlice";
import SessionReconciliationGate from "./SessionReconciliationGate";

type ProtectedRouteProps = {
  children?: ReactNode;
};

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation();
  const isAuthenticated = useAppSelector(IsAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
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
