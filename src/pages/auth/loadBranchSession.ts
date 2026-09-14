import type { AppDispatch } from "@store/store";
import { setCompanies, setInvoiceSettings, setPosSettings, setRoleAccess } from "@store/slices/userSlice";
import { markSessionReconciled } from "@hooks/useReconcilePersistedSession";
import { authApis } from "@pages/auth/Authapi";

/**
 * Everything that is scoped per zodu_id + branch_id and therefore cannot ride
 * along on the login response: permissions, invoice settings and POS settings.
 *
 * There is exactly one of these functions because there are three ways into a
 * branch — the branch picker, login's two fast paths (employee pinned to a
 * branch, and a single company with a single branch), and the boot-time
 * reconciliation of a restored session — and every one of them needs the same
 * data in Redux before any screen renders. Loading only role access, as the
 * login fast paths used to, leaves invoiceSettings null, and every consumer
 * reads it as `invoiceSettings?.printer_inch` / `?.invoice_template`: null
 * silently means thermal + the classic template, whatever the branch actually
 * configured.
 *
 * It also refreshes the companies list, which is not strictly branch scoped but
 * has the same problem: the login response's companies carry no
 * `company_logo_url` — only GET /my-companies does — so invoices printed before
 * something else happened to fetch it came out with no company logo.
 */
export interface BranchSessionResult {
  roleAccessOk: boolean;
  settingsOk: boolean;
  /** First failure, for the caller to surface. */
  error?: unknown;
}

export async function loadBranchSession(
  dispatch: AppDispatch,
  zoduId: string,
  branchId: string
): Promise<BranchSessionResult> {
  const [roleAccess, settings, companies] = await Promise.allSettled([
    authApis.getRoleAccess(zoduId, branchId),
    authApis.getSettings(zoduId, branchId),
    authApis.getMyCompanies(),
  ]);

  const result: BranchSessionResult = {
    roleAccessOk: roleAccess.status === "fulfilled",
    settingsOk: settings.status === "fulfilled",
  };

  if (roleAccess.status === "fulfilled") {
    dispatch(setRoleAccess(roleAccess.value));
  } else {
    result.error = roleAccess.reason;
  }

  if (settings.status === "fulfilled") {
    dispatch(setInvoiceSettings(settings.value.settings?.invoice ?? null));
    // The same call carries the POS block — the POS screen reads its sale-type
    // tabs from here rather than making a second request on every open.
    dispatch(setPosSettings(settings.value.settings?.pos ?? null));
  } else {
    result.error = result.error ?? settings.reason;
  }

  // The logo lives here. Non-fatal on failure — whatever the login response or
  // the cache already put in Redux stays, and the invoice falls back to the
  // branch/company details it always did.
  if (companies.status === "fulfilled" && companies.value.length > 0) {
    dispatch(setCompanies(companies.value));
  }

  // Only a complete load counts: a partial one must still be reconciled when
  // the app mounts.
  if (result.roleAccessOk && result.settingsOk) {
    markSessionReconciled(zoduId, branchId);
  }

  return result;
}
