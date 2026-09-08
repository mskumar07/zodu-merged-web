import { describe, expect, it } from "vitest";
import type { AuthUser, RoleAccessItem } from "@pages/auth/Authapi";
import {
  CURRENT_USER_STATE_VERSION,
  isTokenUsable,
  reconcilePersistedUserState,
  toPersistedUserState,
  type PersistedUserState,
} from "./persistedUserState";

// ── fixtures ──────────────────────────────────────────────────

const NOW = Date.UTC(2026, 0, 1, 12, 0, 0);

/** Minimal but valid JWT-shaped token expiring `secondsFromNow` from NOW. */
function jwt(secondsFromNow: number): string {
  const payload = { exp: Math.floor(NOW / 1000) + secondsFromNow };
  const body = btoa(JSON.stringify(payload)).replace(/=+$/, "");
  return `header.${body}.signature`;
}

const PROFILE: AuthUser = {
  user_id: "u-1",
  zodu_id: "Z-1",
  restaurant_name: "Good Luck Automobiles",
  email: "owner@example.com",
  phone_number: "9888888888",
  user_type: "owner",
  branch_id: "B1",
};

const ROLE_ACCESS: RoleAccessItem[] = [
  {
    module_id: "m-1",
    module_name: "Billing",
    parent_module_id: null,
    sort_order: 1,
    can_read: false,
    can_create: false,
    can_edit: false,
    can_delete: false,
    role_id: "r-1",
    role_name: "Cashier",
  },
];

function cachedBlob(overrides: Partial<PersistedUserState> = {}): string {
  return JSON.stringify({
    _stateVersion: CURRENT_USER_STATE_VERSION,
    accessToken: jwt(3600),
    refreshToken: jwt(86_400),
    profile: PROFILE,
    zoduId: "Z-1",
    branchId: "B1",
    branchName: "Main",
    businessType: "Retail",
    companies: [{ zodu_id: "Z-1", restaurant_name: "Good Luck", business_type: "Retail", branches: [] }],
    company: { gst_no: "33ABCDE1234F1Z5" },
    roleAccess: ROLE_ACCESS,
    invoiceSettings: { id: 1, invoice_prefix: "INV" },
    posSettings: { pos_types: ["Invoice", "Quotation"] },
    isAuthenticated: true,
    ...overrides,
  });
}

// ── (a) fresh login, no cache ─────────────────────────────────

describe("reconcilePersistedUserState — no cache", () => {
  it("returns no state when storage is empty, so the slice falls back to its initial state", () => {
    const result = reconcilePersistedUserState(null, {}, NOW);
    expect(result.state).toBeUndefined();
    expect(result.outcome).toBe("no-cache");
  });

  it("restores a session from the standalone legacy token keys when the blob has none", () => {
    const raw = JSON.stringify({ profile: PROFILE, zoduId: "Z-1", branchId: "B1" });
    const result = reconcilePersistedUserState(
      raw,
      { accessToken: jwt(3600), refreshToken: jwt(86_400) },
      NOW
    );

    expect(result.state?.isAuthenticated).toBe(true);
    // No _stateVersion on that blob → version 0 → permissions untrusted.
    expect(result.outcome).toBe("restored-stale");
  });
});

// ── (b) cache with the current version ────────────────────────

describe("reconcilePersistedUserState — current version", () => {
  it("keeps identity AND permission data, and does not block the UI", () => {
    const result = reconcilePersistedUserState(cachedBlob(), {}, NOW);

    expect(result.outcome).toBe("restored-current");
    expect(result.storedVersion).toBe(CURRENT_USER_STATE_VERSION);
    expect(result.state).toMatchObject({
      isAuthenticated: true,
      zoduId: "Z-1",
      branchId: "B1",
      branchName: "Main",
      businessType: "Retail",
      roleAccess: ROLE_ACCESS,
      permissionsStatus: "ready",
      permissionsBlocking: false,
    });
    expect(result.state?.invoiceSettings).not.toBeNull();
    expect(result.state?.posSettings).not.toBeNull();
    expect(result.state?.company).not.toBeNull();
    expect(result.state?.companies).toHaveLength(1);
  });

  it("ignores unknown fields instead of spreading them into state", () => {
    const raw = cachedBlob({ /* @ts-expect-error deliberately unknown field */ rogueField: "boom" });
    const result = reconcilePersistedUserState(raw, {}, NOW);
    expect(result.state).not.toHaveProperty("rogueField");
  });

  it("falls back to the profile for branch and zodu ids the blob is missing", () => {
    const raw = cachedBlob({ zoduId: "", branchId: "" });
    const result = reconcilePersistedUserState(raw, {}, NOW);
    expect(result.state?.zoduId).toBe("Z-1");
    expect(result.state?.branchId).toBe("B1");
  });
});

// ── (c) cache with an old or missing version ──────────────────

describe("reconcilePersistedUserState — stale version", () => {
  it("keeps the session but drops every permission-bearing field", () => {
    const raw = cachedBlob({ _stateVersion: 0 });
    const result = reconcilePersistedUserState(raw, {}, NOW);

    expect(result.outcome).toBe("restored-stale");
    expect(result.state).toMatchObject({
      isAuthenticated: true,
      accessToken: expect.any(String),
      profile: PROFILE,
      branchId: "B1",
      // Permission/config data is not trusted across a schema change.
      roleAccess: [],
      companies: [],
      company: null,
      invoiceSettings: null,
      posSettings: null,
      // …and an empty roleAccess reads as full access, so the UI must block.
      permissionsStatus: "stale",
      permissionsBlocking: true,
    });
  });

  it("treats a blob with no _stateVersion at all as version 0", () => {
    const parsed = JSON.parse(cachedBlob()) as Record<string, unknown>;
    delete parsed._stateVersion;
    const result = reconcilePersistedUserState(JSON.stringify(parsed), {}, NOW);

    expect(result.storedVersion).toBe(0);
    expect(result.outcome).toBe("restored-stale");
  });

  it("treats a newer version (a rolled-back deploy) as untrustworthy too", () => {
    const raw = cachedBlob({ _stateVersion: CURRENT_USER_STATE_VERSION + 5 });
    expect(reconcilePersistedUserState(raw, {}, NOW).outcome).toBe("restored-stale");
  });

  it("still derives businessType from the companies list it is about to drop", () => {
    const raw = cachedBlob({ _stateVersion: 0, businessType: "" });
    const result = reconcilePersistedUserState(raw, {}, NOW);

    expect(result.state?.businessType).toBe("Retail");
    expect(result.state?.companies).toEqual([]);
  });
});

// ── (d) corrupted / invalid JSON ──────────────────────────────

describe("reconcilePersistedUserState — corrupt cache", () => {
  it("starts logged out rather than throwing on unparseable JSON", () => {
    const result = reconcilePersistedUserState("{ not json", {}, NOW);
    expect(result.state).toBeUndefined();
    expect(result.outcome).toBe("invalid-json");
  });

  it("rejects JSON that parses to something other than an object", () => {
    for (const raw of ["null", "42", '"a string"', "[1,2,3]"]) {
      expect(reconcilePersistedUserState(raw, {}, NOW).outcome).toBe("invalid-json");
    }
  });

  it("rejects a blob whose profile is not a usable user record", () => {
    for (const profile of [null, {}, { user_id: "" }, "nope", 7]) {
      const result = reconcilePersistedUserState(cachedBlob({ profile } as never), {}, NOW);
      expect(result.state).toBeUndefined();
      expect(result.outcome).toBe("no-session");
    }
  });

  it("survives permission fields of the wrong type", () => {
    const raw = cachedBlob({ roleAccess: "not-an-array", companies: 3, company: [] } as never);
    const result = reconcilePersistedUserState(raw, {}, NOW);

    expect(result.state?.roleAccess).toEqual([]);
    expect(result.state?.companies).toEqual([]);
    expect(result.state?.company).toBeNull();
    expect(result.state?.isAuthenticated).toBe(true);
  });
});

// ── (e) valid session, expired / invalid token ────────────────

describe("reconcilePersistedUserState — token validity", () => {
  it("logs out when the refresh token has expired", () => {
    const raw = cachedBlob({ accessToken: jwt(3600), refreshToken: jwt(-60) });
    const result = reconcilePersistedUserState(raw, {}, NOW);

    expect(result.state).toBeUndefined();
    expect(result.outcome).toBe("no-session");
  });

  it("keeps the session when only the access token has expired — the interceptor refreshes it", () => {
    const raw = cachedBlob({ accessToken: jwt(-60), refreshToken: jwt(86_400) });
    const result = reconcilePersistedUserState(raw, {}, NOW);

    expect(result.state?.isAuthenticated).toBe(true);
  });

  it("logs out when a token is missing or blank", () => {
    expect(reconcilePersistedUserState(cachedBlob({ accessToken: null }), {}, NOW).state).toBeUndefined();
    expect(reconcilePersistedUserState(cachedBlob({ refreshToken: "  " }), {}, NOW).state).toBeUndefined();
  });

  it("accepts opaque (non-JWT) tokens it cannot judge", () => {
    const raw = cachedBlob({ accessToken: "opaque-access", refreshToken: "opaque-refresh" });
    expect(reconcilePersistedUserState(raw, {}, NOW).state?.isAuthenticated).toBe(true);
  });

  it("isTokenUsable reads exp, and tolerates undecodable payloads", () => {
    expect(isTokenUsable(jwt(60), NOW)).toBe(true);
    expect(isTokenUsable(jwt(-1), NOW)).toBe(false);
    expect(isTokenUsable("a.b.c", NOW)).toBe(true);
    expect(isTokenUsable("", NOW)).toBe(false);
    expect(isTokenUsable(null, NOW)).toBe(false);
  });
});

// ── what we write back ────────────────────────────────────────

describe("toPersistedUserState", () => {
  it("stamps the current version and omits transient sync bookkeeping", () => {
    const restored = reconcilePersistedUserState(cachedBlob(), {}, NOW).state!;
    const persisted = toPersistedUserState({ ...restored, permissionsStatus: "refreshing" });

    expect(persisted._stateVersion).toBe(CURRENT_USER_STATE_VERSION);
    expect(persisted).not.toHaveProperty("permissionsStatus");
    expect(persisted).not.toHaveProperty("permissionsBlocking");
  });

  it("round-trips: what we write is trusted in full on the next boot", () => {
    const restored = reconcilePersistedUserState(cachedBlob(), {}, NOW).state!;
    const raw = JSON.stringify(toPersistedUserState(restored));
    const again = reconcilePersistedUserState(raw, {}, NOW);

    expect(again.outcome).toBe("restored-current");
    expect(again.state).toEqual(restored);
  });

  it("refuses to stamp the current version while permissions are still untrusted", () => {
    const stale = reconcilePersistedUserState(cachedBlob({ _stateVersion: 0 }), {}, NOW).state!;

    // A dispatch lands before the refetch resolves and the store persists.
    const written = toPersistedUserState(stale);
    expect(written._stateVersion).toBe(0);

    // Reloading in that window must NOT trust the emptied permissions.
    const reloaded = reconcilePersistedUserState(JSON.stringify(written), {}, NOW);
    expect(reloaded.outcome).toBe("restored-stale");
    expect(reloaded.state?.permissionsBlocking).toBe(true);
  });

  it("a blob written by the previous code (no version) is stale exactly once", () => {
    // Simulates the deploy: old blob in storage → stale → refreshed → rewritten.
    const legacy = JSON.parse(cachedBlob()) as Record<string, unknown>;
    delete legacy._stateVersion;

    const first = reconcilePersistedUserState(JSON.stringify(legacy), {}, NOW);
    expect(first.outcome).toBe("restored-stale");

    // …the boot-time refetch lands (permissionsRefreshSucceeded), then the
    // store persists, and the reload after that is trusted in full.
    const refreshed = { ...first.state!, roleAccess: ROLE_ACCESS, permissionsBlocking: false };
    const rewritten = JSON.stringify(toPersistedUserState(refreshed));
    expect(reconcilePersistedUserState(rewritten, {}, NOW).outcome).toBe("restored-current");
  });
});
