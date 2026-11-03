import { useCallback, useSyncExternalStore } from "react";
import { getSessionClaims, subscribeSession, type SessionClaims } from "@utils/authSession";

// The company owner's role: the server lets it do everything in its own company.
export const OWNER_ROLE = "Admin";

/** The access token's claims (role, perms), re-rendering when the token changes. */
export function useSessionClaims(): SessionClaims {
  return useSyncExternalStore(subscribeSession, getSessionClaims);
}

/**
 * can("branch:edit") etc., from the token's perms: '<module>:<read|create|edit|delete>'
 * plus company:edit, company:delete, branch:create, branch:edit, branch:delete,
 * role:read, role:edit (only Admin has those). For showing and hiding UI only;
 * the server checks every request itself.
 */
export function useCan(): (perm: string) => boolean {
  const { role, perms } = useSessionClaims();
  return useCallback((perm: string) => role === OWNER_ROLE || perms.includes(perm), [role, perms]);
}
