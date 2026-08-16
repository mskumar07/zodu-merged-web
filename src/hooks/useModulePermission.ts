import { useAppSelector } from "@store/store";
import { RoleAccess } from "@store/slices/userSlice";

export interface ModulePermission {
  canRead: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

// A module with no matching role_access entry (older sessions, or a module not
// yet wired to the permission system) defaults to full access so existing
// screens keep working until the backend/login response adds it.
const FULL_ACCESS: ModulePermission = {
  canRead: true,
  canCreate: true,
  canEdit: true,
  canDelete: true,
};

export function useModulePermission(moduleName: string): ModulePermission {
  const roleAccess = useAppSelector(RoleAccess);
  const access = roleAccess.find((r) => r.module_name === moduleName);
  if (!access) return FULL_ACCESS;
  return {
    canRead: access.can_read,
    canCreate: access.can_create,
    canEdit: access.can_edit,
    canDelete: access.can_delete,
  };
}
