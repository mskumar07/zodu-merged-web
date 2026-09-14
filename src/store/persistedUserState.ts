import type {
  AuthUser,
  CompanyDetails,
  CompanyWithBranches,
  InvoiceSettings,
  PosSettings,
  RoleAccessItem,
} from "@pages/auth/Authapi";

/**
 * The `user` slice's shape, the subset of it we persist, and the pure logic
 * that turns a raw localStorage string back into state we are willing to
 * trust.
 *
 * This module deliberately touches neither the store nor localStorage: the
 * caller reads the string and passes it in, so every branch below can be unit
 * tested by handing it a string and asserting on the state that comes out.
 * See persistedUserState.test.ts.
 */

export const USER_STORAGE_KEY = "zodu_user_state";

/**
 * Bump this whenever the shape OR the meaning of a permission-bearing field
 * changes — roleAccess, invoiceSettings, posSettings, company, companies.
 *
 * Sessions persisted under an older version keep their identity (tokens,
 * profile, branch), but their permission fields are treated as untrusted and
 * refetched before the app renders. Bumping is the fast path; the boot-time
 * reconciliation in useReconcilePersistedSession refetches regardless, so
 * forgetting to bump costs freshness for one render, not correctness.
 *
 * v1 — first versioned schema. Everything written before this fix carries no
 *      `_stateVersion` at all and is read as version 0.
 */
export const CURRENT_USER_STATE_VERSION = 1;

/** What a blob written before versioning existed is treated as. */
export const LEGACY_USER_STATE_VERSION = 0;

/** How current the permission-bearing fields in state are. */
export type PermissionsSyncStatus = "ready" | "stale" | "refreshing" | "error";

export interface Userstate {
  // ── Session identity — safe to trust from cache indefinitely ──────────
  branchId: string;
  branchName: string;
  zoduId: string;
  businessType: string;
  accessToken: string | null;
  refreshToken: string | null;
  profile: AuthUser | null;
  isAuthenticated: boolean;

  // ── Permission / config data — version-gated, refetched on boot ───────
  companies: CompanyWithBranches[];
  company: CompanyDetails | null;
  roleAccess: RoleAccessItem[];
  invoiceSettings: InvoiceSettings | null;
  posSettings: PosSettings | null;

  // ── Transient sync bookkeeping — never persisted ──────────────────────
  permissionsStatus: PermissionsSyncStatus;
  /**
   * True while the permission fields in state are NOT trustworthy, so nothing
   * may render behind them.
   *
   * Note this is not merely cosmetic: an empty `roleAccess` reads as "full
   * access" in useModulePermission and RouteAccessGuard, so dropping a stale
   * cache and rendering anyway would *widen* permissions. Blocking until the
   * refetch lands (or showing a retry) is the least-privilege behaviour.
   */
  permissionsBlocking: boolean;
}

/** Exactly what goes into localStorage — the slice minus its transient fields. */
export type PersistedUserState = Omit<
  Userstate,
  "permissionsStatus" | "permissionsBlocking"
> & { _stateVersion: number };

export const INITIAL_USER_STATE: Userstate = {
  branchId: "",
  branchName: "",
  zoduId: "",
  businessType: "",
  companies: [],
  accessToken: null,
  refreshToken: null,
  profile: null,
  company: null,
  roleAccess: [],
  invoiceSettings: null,
  posSettings: null,
  isAuthenticated: false,
  permissionsStatus: "ready",
  permissionsBlocking: false,
};

export type LoadUserStateOutcome =
  /** Nothing in storage — a first visit or a cleared browser. */
  | "no-cache"
  /** Storage held something that isn't parseable JSON, or isn't an object. */
  | "invalid-json"
  /** Parsed fine, but there is no usable session in it — stay logged out. */
  | "no-session"
  /** Session restored, cached permission data written by this schema version. */
  | "restored-current"
  /** Session restored, permission data dropped as stale — must refetch. */
  | "restored-stale";

export interface LoadUserStateResult {
  /** Preloaded slice state, or undefined to fall back to INITIAL_USER_STATE. */
  state: Userstate | undefined;
  outcome: LoadUserStateOutcome;
  /** Version read off the blob — 0 for anything written before this fix. */
  storedVersion: number;
}

/** Tokens the caller found under the standalone legacy localStorage keys. */
export interface FallbackTokens {
  accessToken?: string | null;
  refreshToken?: string | null;
}

// ── Narrowing helpers — no `any` anywhere below ──────────────────────────

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asNonEmptyStringOrNull(value: unknown): string | null {
  return typeof value === "string" && value.trim() !== "" ? value : null;
}

function asRecordArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value.filter(isRecord) as T[]) : [];
}

function asRecordOrNull<T>(value: unknown): T | null {
  return isRecord(value) ? (value as T) : null;
}

/**
 * A profile is only usable if it carries the identity the rest of the app
 * reads off it. Anything less is corrupt cache, not a session.
 */
function asProfile(value: unknown): AuthUser | null {
  if (!isRecord(value)) return null;
  if (typeof value.user_id !== "string" || value.user_id === "") return null;
  return value as unknown as AuthUser;
}

/**
 * Whether a token is worth restoring a session with.
 *
 * JWTs are checked against their own `exp`; an opaque token can't be judged
 * here, so it is assumed usable and left for the API to reject (the axios
 * interceptor already refreshes on 401 and clears on refresh failure).
 */
export function isTokenUsable(token: unknown, now: number = Date.now()): boolean {
  const value = asNonEmptyStringOrNull(token);
  if (!value) return false;

  const segments = value.split(".");
  if (segments.length !== 3) return true;

  try {
    const payload: unknown = JSON.parse(
      atob(segments[1].replace(/-/g, "+").replace(/_/g, "/"))
    );
    if (!isRecord(payload) || typeof payload.exp !== "number") return true;
    return payload.exp * 1000 > now;
  } catch {
    // Undecodable payload — treat like an opaque token rather than logging the
    // user out on a parsing quirk.
    return true;
  }
}

/**
 * businessType was not always persisted. Older sessions derive it from the
 * cached companies list, matched on the active zodu_id — kept working here
 * even when the companies list itself is about to be dropped as stale.
 */
function deriveBusinessType(
  cachedBusinessType: unknown,
  companies: CompanyWithBranches[],
  zoduId: string
): string {
  const stored = asString(cachedBusinessType);
  if (stored) return stored;
  return companies.find((company) => company.zodu_id === zoduId)?.business_type ?? "";
}

// ── The reconciliation itself ────────────────────────────────────────────

/**
 * Rebuild slice state from a persisted blob.
 *
 * Every field is named explicitly — nothing is spread in blind — and they fall
 * into two groups:
 *
 *   trusted from cache : tokens, profile, branchId, branchName, zoduId,
 *                        businessType. Session identity, not permissions.
 *   version-gated      : roleAccess, invoiceSettings, posSettings, company,
 *                        companies. Kept only when the blob was written by the
 *                        current schema version, otherwise dropped and flagged
 *                        for refetch.
 */
export function reconcilePersistedUserState(
  raw: string | null,
  fallbackTokens: FallbackTokens = {},
  now: number = Date.now()
): LoadUserStateResult {
  let parsed: unknown;

  if (raw === null || raw === undefined || raw === "") {
    parsed = undefined;
  } else {
    try {
      parsed = JSON.parse(raw);
    } catch {
      return { state: undefined, outcome: "invalid-json", storedVersion: LEGACY_USER_STATE_VERSION };
    }
    if (!isRecord(parsed)) {
      return { state: undefined, outcome: "invalid-json", storedVersion: LEGACY_USER_STATE_VERSION };
    }
  }

  const cached: Record<string, unknown> = isRecord(parsed) ? parsed : {};
  const storedVersion =
    typeof cached._stateVersion === "number" ? cached._stateVersion : LEGACY_USER_STATE_VERSION;

  const accessToken =
    asNonEmptyStringOrNull(cached.accessToken) ??
    asNonEmptyStringOrNull(fallbackTokens.accessToken);
  const refreshToken =
    asNonEmptyStringOrNull(cached.refreshToken) ??
    asNonEmptyStringOrNull(fallbackTokens.refreshToken);
  const profile = asProfile(cached.profile);

  // The refresh token is what keeps a session alive: an expired *access* token
  // is refreshed transparently by the axios interceptor, but an expired or
  // missing refresh token means there is nothing left to restore.
  if (!accessToken || !profile || !isTokenUsable(refreshToken, now)) {
    return {
      state: undefined,
      outcome: raw ? "no-session" : "no-cache",
      storedVersion,
    };
  }

  const cachedCompanies = asRecordArray<CompanyWithBranches>(cached.companies);
  const zoduId = asString(cached.zoduId) || asString(profile.zodu_id);
  const isCurrentVersion = storedVersion === CURRENT_USER_STATE_VERSION;

  const state: Userstate = {
    // Session identity — trusted from cache.
    accessToken,
    refreshToken,
    profile,
    zoduId,
    branchId: asString(cached.branchId) || asString(profile.branch_id),
    branchName: asString(cached.branchName),
    businessType: deriveBusinessType(cached.businessType, cachedCompanies, zoduId),
    isAuthenticated: true,

    // Permission / config data — only as good as the version it was written by.
    companies: isCurrentVersion ? cachedCompanies : [],
    company: isCurrentVersion ? asRecordOrNull<CompanyDetails>(cached.company) : null,
    roleAccess: isCurrentVersion ? asRecordArray<RoleAccessItem>(cached.roleAccess) : [],
    invoiceSettings: isCurrentVersion
      ? asRecordOrNull<InvoiceSettings>(cached.invoiceSettings)
      : null,
    posSettings: isCurrentVersion ? asRecordOrNull<PosSettings>(cached.posSettings) : null,

    // A current-version cache is an optimistic starting point and renders
    // immediately while it is refreshed in the background; a stale one has
    // nothing worth rendering behind.
    permissionsStatus: isCurrentVersion ? "ready" : "stale",
    permissionsBlocking: !isCurrentVersion,
  };

  return {
    state,
    outcome: isCurrentVersion ? "restored-current" : "restored-stale",
    storedVersion,
  };
}

/**
 * The slice state reduced to what belongs in localStorage, version stamped.
 *
 * The stamp claims "these permission fields were produced by the current
 * schema", so it is only written once they actually have been. While the
 * session is still blocking — stale cache dropped, refetch not landed or
 * failed — the blob keeps version 0. Otherwise the very first dispatch after a
 * stale boot would persist empty permissions AS current, and the next reload
 * would trust them: empty roleAccess reads as full access everywhere.
 */
export function toPersistedUserState(state: Userstate): PersistedUserState {
  return {
    branchId: state.branchId,
    branchName: state.branchName,
    zoduId: state.zoduId,
    businessType: state.businessType,
    accessToken: state.accessToken,
    refreshToken: state.refreshToken,
    profile: state.profile,
    isAuthenticated: state.isAuthenticated,
    companies: state.companies,
    company: state.company,
    roleAccess: state.roleAccess,
    invoiceSettings: state.invoiceSettings,
    posSettings: state.posSettings,
    _stateVersion: state.permissionsBlocking
      ? LEGACY_USER_STATE_VERSION
      : CURRENT_USER_STATE_VERSION,
  };
}
