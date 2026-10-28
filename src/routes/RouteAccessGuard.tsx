import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAppSelector } from "@store/store";
import { BusinessType, RoleAccess } from "@store/slices/userSlice";

// Maps a route's path prefix to the `module_name` returned in the login
// response's `role_access` list. Only routes modelled as permission modules
// need an entry — anything else is left open to every authenticated user.
const PATH_MODULE_MAP: { prefix: string; module: string }[] = [
  { prefix: "/dashboard", module: "Dashboard" },
  { prefix: "/pos", module: "Billing" },
  { prefix: "/restaurant-pos", module: "Billing" },
  { prefix: "/menu", module: "Menu Items" },
  { prefix: "/restaurant-menu", module: "Menu Items" },
  { prefix: "/sales-history", module: "Sales History" },
  { prefix: "/stock", module: "Inventory" },
  { prefix: "/purchase", module: "Purchase" },
  { prefix: "/expense", module: "Expense" },
  { prefix: "/accounting", module: "Accounting" },
  { prefix: "/customer-details", module: "Customer Management" },
  { prefix: "/employee-management", module: "Staff / User Management" },
  { prefix: "/attendance", module: "Attendance" },
  { prefix: "/checklist", module: "Checklist / Tasklist" },
  { prefix: "/reports", module: "Reports" },
  { prefix: "/settings", module: "Settings" },
];

// Screens that only exist for retail businesses; a restaurant account typing the URL is sent home.
const RETAIL_ONLY_PREFIXES = ["/accounting", "/reports/gst"];

type Props = { children: ReactNode };

export default function RouteAccessGuard({ children }: Props) {
  const location = useLocation();
  const roleAccess = useAppSelector(RoleAccess);
  const businessType = useAppSelector(BusinessType);

  const isRetailOnly = RETAIL_ONLY_PREFIXES.some(
    (prefix) => location.pathname === prefix || location.pathname.startsWith(prefix + "/"),
  );
  if (isRetailOnly && businessType?.toLowerCase() === "restaurant") {
    return <Navigate to="/dashboard" replace />;
  }

  const match = PATH_MODULE_MAP.find((entry) =>
    location.pathname === entry.prefix || location.pathname.startsWith(entry.prefix + "/")
  );

  if (match) {
    const access = roleAccess.find((r) => r.module_name === match.module);
    if (access && !access.can_read) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
}
