import { useCallback, useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "@store/store";
import {
  BranchId,
  InvoiceSettingsData,
  IsAuthenticated,
  PermissionsBlocking,
  PermissionsStatus,
  ZoduId,
  permissionsRefreshFailed,
  permissionsRefreshStarted,
  permissionsRefreshSucceeded,
} from "@store/slices/userSlice";
import { loadBranchSession } from "@pages/auth/loadBranchSession";

/**
 * Treats the persisted permission fields as an optimistic cache rather than
 * the source of truth.
 *
 * A user who was already logged in when a deploy lands never goes through the
 * login flow again — they just refresh the tab — so nothing would otherwise
 * re-fetch their permissions. This runs on every restored session and
 * overwrites roleAccess / invoiceSettings / posSettings from the same
 * endpoints the login flow uses, whether or not the schema version was bumped.
 * That makes the app self-correcting even when we forget to bump it.
 *
 * Whether the refetch *blocks* the UI is the version check's job:
 *   - cache written by the current version → status "ready", render straight
 *     away and refresh in the background,
 *   - stale or missing version → status "stale" and permissionsBlocking, so
 *     the caller holds the UI until fresh permissions land.
 */

/**
 * Guards against refetching on every re-render or React 18 StrictMode's double
 * effect, while still refetching when the tenant actually changes. Module
 * scope, so it resets with the page load the reconciliation belongs to.
 */
let reconciledFor: string | null = null;

/** Exposed for tests and for the logout path, which should force a fresh pass. */
export function resetSessionReconciliation() {
  reconciledFor = null;
}

/**
 * Called by a flow that has just loaded permissions AND settings itself (branch
 * selection), so landing on the dashboard doesn't immediately re-request what
 * it already has. Login's fast paths deliberately do not call this: they load
 * role access but not settings, so they still want a reconciliation pass.
 */
export function markSessionReconciled(zoduId: string, branchId: string) {
  if (zoduId && branchId) reconciledFor = `${zoduId}:${branchId}`;
}

export interface ReconciledSession {
  /** True while nothing trustworthy is loaded — do not render the app yet. */
  blocking: boolean;
  /** True once a refetch has failed and left us with nothing to render. */
  failed: boolean;
  refreshing: boolean;
  retry: () => void;
}

export function useReconcilePersistedSession(): ReconciledSession {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(IsAuthenticated);
  const zoduId = useAppSelector(ZoduId);
  const branchId = useAppSelector(BranchId);
  const status = useAppSelector(PermissionsStatus);
  const permissionsBlocking = useAppSelector(PermissionsBlocking);
  const invoiceSettings = useAppSelector(InvoiceSettingsData);

  // Bumped by retry() to re-run the effect after a failure.
  const [retryToken, setRetryToken] = useState(0);
  const inFlight = useRef(false);

  const retry = useCallback(() => {
    reconciledFor = null;
    setRetryToken((token) => token + 1);
  }, []);

  useEffect(() => {
    // Permissions are scoped per zodu_id + branch_id. Before a branch is
    // chosen there is nothing to fetch — the login/SelectBranch flow loads
    // them as part of choosing one.
    if (!isAuthenticated || !zoduId || !branchId) return;

    const tenantKey = `${zoduId}:${branchId}`;
    if (reconciledFor === tenantKey || inFlight.current) return;
    reconciledFor = tenantKey;
    inFlight.current = true;

    let cancelled = false;

    const run = async () => {
      dispatch(permissionsRefreshStarted());
      // Dispatches whatever succeeded; never throws.
      const result = await loadBranchSession(dispatch, zoduId, branchId);
      inFlight.current = false;
      if (cancelled) return;

      if (result.roleAccessOk && result.settingsOk) {
        dispatch(permissionsRefreshSucceeded());
        return;
      }

      // Deliberately non-destructive: a failed refresh never clears tokens,
      // profile or an already-current cache — and never overwrites roleAccess
      // with an empty list, which would read as full access. The caller decides
      // whether to block on it.
      console.warn(
        "[session] failed to refresh a restored session " +
          `(roleAccess: ${result.roleAccessOk ? "ok" : "failed"}, ` +
          `settings: ${result.settingsOk ? "ok" : "failed"})`,
        result.error
      );
      reconciledFor = null;
      dispatch(permissionsRefreshFailed());
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [dispatch, isAuthenticated, zoduId, branchId, retryToken]);

  // With no branch chosen yet there is nothing to fetch and nothing to wait
  // for — SelectBranch loads permissions as part of choosing one, so blocking
  // here would strand the user on a spinner.
  const hasTenant = Boolean(zoduId && branchId);

  // Two ways to have nothing worth rendering behind:
  //   - permissions dropped as stale (an empty roleAccess reads as full access),
  //   - no invoice settings at all, which every print/download path reads as
  //     "thermal, classic template" rather than as "not loaded yet".
  // Either one only holds until the fetch resolves: once it has, `status` is
  // "ready" and a branch that genuinely has no settings row renders normally.
  const nothingTrustworthy = permissionsBlocking || invoiceSettings === null;

  return {
    blocking: hasTenant && nothingTrustworthy && status !== "ready",
    failed: hasTenant && nothingTrustworthy && status === "error",
    refreshing: status === "refreshing",
    retry,
  };
}
