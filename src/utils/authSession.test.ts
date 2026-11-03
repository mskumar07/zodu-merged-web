import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import axios, { AxiosError, type AxiosAdapter, type InternalAxiosRequestConfig } from "axios";

// The session layer against a fake API: no network, no DOM. The adapter is set
// on axios' defaults before authSession loads, so its own refresh client uses it too.

type Session = typeof import("./authSession");

const jwt = (claims: Record<string, unknown>) =>
  `x.${Buffer.from(JSON.stringify(claims)).toString("base64url")}.sig`;
const EXPIRED = jwt({ zid: "Z1", bid: "B1", role: "Cashier", perms: [], v: "old" });
const FRESH = jwt({ zid: "Z1", bid: "B1", role: "Cashier", perms: ["billing:create"], v: "new" });

const storage = new Map<string, string>();
const server = {
  refreshCalls: 0,
  refreshBodies: [] as unknown[],
  refreshWorks: true,
};

function reply(config: InternalAxiosRequestConfig, status: number, data: unknown) {
  const response = { status, statusText: "", data, headers: {}, config };
  if (status >= 400) throw new AxiosError(`HTTP ${status}`, "ERR_BAD_REQUEST", config, null, response);
  return response;
}

const adapter: AxiosAdapter = async (config) => {
  const url = /^https?:/.test(config.url ?? "") ? config.url! : `${config.baseURL ?? ""}${config.url}`;
  const path = new URL(url).pathname;
  if (path === "/auth/api/refresh-token") {
    server.refreshCalls += 1;
    server.refreshBodies.push(config.data);
    await new Promise((r) => setTimeout(r, 20));
    return server.refreshWorks
      ? reply(config, 200, { data: { access_token: FRESH, expires_in: 900 } })
      : reply(config, 401, { data: { error: "Invalid or expired refresh token" } });
  }
  const auth = config.headers?.Authorization ?? config.headers?.get?.("Authorization");
  return auth === `Bearer ${FRESH}` ? reply(config, 200, { ok: true }) : reply(config, 401, {});
};

let session: Session;
let http: ReturnType<typeof axios.create>;
const expire = vi.fn();

beforeAll(async () => {
  vi.stubGlobal("window", { location: { href: "http://localhost:5173/" } });
  vi.stubGlobal("localStorage", {
    getItem: (k: string) => storage.get(k) ?? null,
    setItem: (k: string, v: string) => void storage.set(k, v),
    removeItem: (k: string) => void storage.delete(k),
  });
  // What builds before this one left behind.
  storage.set("access_token", EXPIRED);
  storage.set("refresh_token", "old-refresh");
  storage.set("token", EXPIRED);
  storage.set("zodu_user_state", JSON.stringify({ zoduId: "Z1", accessToken: EXPIRED, refreshToken: "old-refresh" }));

  axios.defaults.adapter = adapter;
  session = await import("./authSession");
  session.bindSessionStore({
    isAuthenticated: () => true,
    tenant: () => ({ zoduId: "Z1", branchId: "B1" }),
    expire,
    refused: () => {},
  });
  http = axios.create({ baseURL: session.API_BASE });
  session.attachAuth(http);
});

afterEach(() => {
  server.refreshCalls = 0;
  server.refreshBodies = [];
  server.refreshWorks = true;
  expire.mockClear();
});

describe("authSession", () => {
  it("removes every token older builds kept in localStorage", () => {
    expect(storage.has("access_token")).toBe(false);
    expect(storage.has("refresh_token")).toBe(false);
    expect(storage.has("token")).toBe(false);
    expect(JSON.parse(storage.get("zodu_user_state")!)).toEqual({ zoduId: "Z1" });
  });

  it("ten parallel requests with an expired token make exactly one refresh call", async () => {
    session.setAccessToken(EXPIRED);
    const results = await Promise.all(Array.from({ length: 10 }, (_, i) => http.get(`/retail/api/item/${i}`)));

    expect(server.refreshCalls).toBe(1);
    expect(results.every((r) => r.status === 200)).toBe(true);
    expect(session.getAccessToken()).toBe(FRESH);
    expect(session.getSessionClaims().perms).toEqual(["billing:create"]);
    // The old refresh token was handed over once, to move it into the cookie.
    expect(server.refreshBodies[0]).toContain("old-refresh");
  });

  it("refreshes with the cookie only (no body) from then on", async () => {
    session.setAccessToken(EXPIRED);
    await http.get("/retail/api/item/1");
    expect(server.refreshCalls).toBe(1);
    expect(server.refreshBodies[0]).toBeUndefined();
  });

  it("a refused refresh ends the session once and is not retried", async () => {
    server.refreshWorks = false;
    session.setAccessToken(EXPIRED);
    const results = await Promise.allSettled(Array.from({ length: 5 }, () => http.get("/retail/api/item/1")));

    expect(results.every((r) => r.status === "rejected")).toBe(true);
    expect(server.refreshCalls).toBe(1);
    expect(expire).toHaveBeenCalled();
    expect(session.getAccessToken()).toBeNull();
  });
});
