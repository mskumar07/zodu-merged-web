import { useAppSelector } from "@store/store";
import { RoleAccess } from "@store/slices/userSlice";
import type { RoleAccessItem } from "@pages/auth/Authapi";
import { OWNER_ROLE, useSessionClaims } from "@hooks/usePermission";

export interface ModulePermission {
  canRead: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

const FULL_ACCESS: ModulePermission = {
  canRead: true,
  canCreate: true,
  canEdit: true,
  canDelete: true,
};

const NO_ACCESS: ModulePermission = {
  canRead: false,
  canCreate: false,
  canEdit: false,
  canDelete: false,
};

// Screens without a tbl_modules row of their own, checked against the module
// whose permission the server requires for them (backend route policies).
const MODULE_ALIASES: Record<string, string> = {
  Accounting: "Reports", // retail-service: GET /api/accounting needs report:read
  "KDS Screen": "Billing", // restaurant-service: the kitchen screen is part of Billing
};

/**
 * What the role may do in a module, for showing and hiding UI (the server
 * checks every request itself):
 *   - the company's Admin role: everything (the server lets it do everything);
 *   - otherwise the role-access row, and no row means no access.
 */
export function resolveModuleAccess(
  roleAccess: RoleAccessItem[],
  moduleName: string,
  role: string | null | undefined
): ModulePermission {
  if (role === OWNER_ROLE) return FULL_ACCESS;
  const name = MODULE_ALIASES[moduleName] ?? moduleName;
  const access = roleAccess.find((r) => r.module_name === name);
  if (!access) return NO_ACCESS;
  return {
    canRead: access.can_read,
    canCreate: access.can_create,
    canEdit: access.can_edit,
    canDelete: access.can_delete,
  };
}

export function useModulePermission(moduleName: string): ModulePermission {
  const roleAccess = useAppSelector(RoleAccess);
  const { role } = useSessionClaims();
  return resolveModuleAccess(roleAccess, moduleName, role);
}
