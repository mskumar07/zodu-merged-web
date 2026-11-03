import axios, {
  AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";
import { toast } from "react-toastify";

// The browser side of the auth-service session (docs/security/auth.md in the
// backend repo). Every axios client the app uses goes through attachAuth():
//
//   - the access token lives in memory only; nothing token-shaped is written
//     to localStorage, so a script injected into the page can't carry it away;
//   - the refresh token is an HttpOnly cookie the browser sends to
//     /auth/api/refresh-token itself; JavaScript never sees it;
//   - a 401 runs ONE refresh (parallel 401s wait for the same one) and
//     retries each request once; a refused refresh ends the session;
//   - the company and branch come from the token, so when the user picks
//     another branch the token is switched (/auth/api/switch-context) before
//     the next request goes out.

export const API_BASE: string = import.meta.env.VITE_API_BASE_URL ?? "https://api.myzodu.com";
export const CLIENT_PLATFORM = "web";

const API_ORIGIN = (() => {
  try {
    return new URL(API_BASE).origin;
  } catch {
    return "";
  }
})();

// Token endpoints: no access token, the platform header, and the cookie.
const TOKEN_ENDPOINT = /\/auth\/api\/(login|refresh-token|logout|create-account)(\/|\?|$)/;
// Calls that must not wait for a branch switch (they don't act on a branch).
const NO_CONTEXT = /\/auth\/api\/(switch-context|my-companies|logout-all|sessions)(\/|\?|$)/;

// Created before attachAuth() patches axios.create, so it carries no interceptors.
const bare = axios.create({ baseURL: API_BASE, timeout: 15_000, withCredentials: true });

// ── Session state ────────────────────────────────────────────────────────────

let accessToken: string | null = null;

/** What the session needs from the Redux store; bound by store.ts. */
interface SessionStore {
  isAuthenticated(): boolean;
  tenant(): { zoduId: string; branchId: string };
  expire(): void;
  /** The server refused the company/branch the UI is on: go back to the token's. */
  refused(zoduId: string, branchId: string): void;
}

/**
 * The access token's claims, for the UI only (which menus and buttons to show).
 * The server checks every request against the token itself; nothing here is a
 * security decision.
 */
export interface SessionClaims {
  /** The user id. */
  sub?: string;
  zid?: string;
  bid?: string;
  role?: string | null;
  perms: string[];
}

const NO_CLAIMS: SessionClaims = { perms: [] };
let claims: SessionClaims = NO_CLAIMS;
const listeners = new Set<() => void>();

export const getSessionClaims = () => claims;

/** For useSyncExternalStore: called whenever the access token changes. */
export function subscribeSession(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function decodeClaims(token: string | null): SessionClaims {
  if (!token) return NO_CLAIMS;
  try {
    const part = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const c = JSON.parse(atob(part));
    return { sub: c.sub == null ? undefined : String(c.sub), zid: c.zid, bid: c.bid, role: c.role ?? null, perms: Array.isArray(c.perms) ? c.perms : [] };
  } catch {
    return NO_CLAIMS;
  }
}

// Other tabs of the app share the refresh cookie: when one signs out, they all do.
const channel: BroadcastChannel | null = typeof BroadcastChannel === "undefined" ? null : new BroadcastChannel("zodu-session");
channel?.addEventListener("message", (e) => {
  if (e.data === "logout") endSession();
});
let sessionStore: SessionStore | null = null;

export function bindSessionStore(s: SessionStore) {
  sessionStore = s;
}

export const getAccessToken = () => accessToken;

export function setAccessToken(token: string | null) {
  accessToken = token || null;
  claims = decodeClaims(accessToken);
  listeners.forEach((listener) => listener());
}

// Builds before this one kept both tokens in localStorage. The refresh token is
// handed to the server exactly once (it then moves into the cookie); every
// copy is removed from storage at once.
let legacyRefreshToken: string | null = null;
(function takeLegacyTokens() {
  try {
    const blobKey = "zodu_user_state";
    const raw = localStorage.getItem(blobKey);
    const blob = raw ? JSON.parse(raw) : null;
    legacyRefreshToken = localStorage.getItem("refresh_token") || blob?.refreshToken || null;
    for (const key of ["access_token", "refresh_token", "token"]) localStorage.removeItem(key);
    if (blob && (blob.accessToken || blob.refreshToken)) {
      delete blob.accessToken;
      delete blob.refreshToken;
      localStorage.setItem(blobKey, JSON.stringify(blob));
    }
  } catch {
    // Storage blocked: nothing to migrate.
  }
})();

// ── Refresh and switch, one at a time ────────────────────────────────────────

let refreshing: Promise<string> | null = null;

class SessionEndedError extends Error {
  constructor() {
    super("Your session has ended. Please sign in again.");
    this.name = "SessionEndedError";
  }
}

/** One refresh for every caller that needs it right now. */
export function refreshSession(): Promise<string> {
  if (!refreshing) {
    refreshing = (async () => {
      const body = legacyRefreshToken ? { refresh_token: legacyRefreshToken } : undefined;
      legacyRefreshToken = null;
      try {
        const res = await bare.post("/auth/api/refresh-token", body, {
          headers: { "X-Client-Platform": CLIENT_PLATFORM },
        });
        const token: string | undefined = res.data?.data?.access_token;
        if (!token) throw new SessionEndedError();
        setAccessToken(token);
        return token;
      } catch (err) {
        const status = (err as AxiosError).response?.status;
        // 401 / 400: the session is gone. Anything else (offline, 429, 5xx) is
        // left alone; the next request tries again.
        if (err instanceof SessionEndedError || status === 401 || status === 400) {
          endSession();
          throw new SessionEndedError();
        }
        throw err;
      } finally {
        refreshing = null;
      }
    })();
  }
  return refreshing;
}

const switching = new Map<string, Promise<void>>();
// A branch the server refused: don't ask again on every request.
const refusedTenant = new Map<string, { at: number; error: unknown }>();
const REFUSED_FOR_MS = 30_000;

/**
 * Moves the token to another company/branch (POST /auth/api/switch-context),
 * once per change. Rejects with the server's 404 when the user may not use it.
 */
export function switchContext(zoduId: string, branchId: string): Promise<void> {
  const key = `${zoduId}:${branchId}`;
  const refused = refusedTenant.get(key);
  if (refused && Date.now() - refused.at < REFUSED_FOR_MS) return Promise.reject(refused.error);

  let pending = switching.get(key);
  if (!pending) {
    pending = (async () => {
      try {
        const send = () =>
          bare.post(
            "/auth/api/switch-context",
            { zodu_id: zoduId, branch_id: branchId },
            { headers: { Authorization: `Bearer ${accessToken}`, "X-Client-Platform": CLIENT_PLATFORM } }
          );
        let res;
        try {
          res = await send();
        } catch (err) {
          if ((err as AxiosError).response?.status !== 401) throw err;
          await refreshSession();
          res = await send();
        }
        setAccessToken(res.data?.data?.access_token ?? null);
        refusedTenant.delete(key);
      } catch (err) {
        if ((err as AxiosError).response?.status === 404) refusedTenant.set(key, { at: Date.now(), error: err });
        throw err;
      } finally {
        switching.delete(key);
      }
    })();
    switching.set(key, pending);
  }
  return pending;
}

/** Local sign-out after the server ended the session (or refused to renew it). */
function endSession() {
  setAccessToken(null);
  switching.clear();
  refusedTenant.clear();
  sessionStore?.expire();
}

/** Ends the session on the server too (revokes it, clears the cookie). */
export async function logout() {
  try {
    await bare.post("/auth/api/logout", undefined, { headers: { "X-Client-Platform": CLIENT_PLATFORM } });
  } catch {
    // Signing out locally must work offline too.
  } finally {
    setAccessToken(null);
    switching.clear();
    refusedTenant.clear();
    channel?.postMessage("logout");
  }
}

// ── 403 / 429 ────────────────────────────────────────────────────────────────

function serverMessage(error: AxiosError): string | null {
  const body = error.response?.data as { data?: { error?: unknown }; error?: unknown; message?: unknown } | undefined;
  const message = body?.data?.error ?? body?.error ?? body?.message;
  return typeof message === "string" && message ? message : null;
}

/** One toast per kind at a time: ten refused requests are one message, not ten. */
function notifyRefused(error: AxiosError) {
  const status = error.response?.status;
  if (status === 403) {
    toast.error(serverMessage(error) ?? "You don't have access to this.", { toastId: "http-403" });
  } else if (status === 429) {
    const seconds = Number(error.response?.headers?.["retry-after"]);
    const wait = seconds > 0 ? ` Try again in ${seconds < 60 ? `${seconds} seconds` : `${Math.ceil(seconds / 60)} minutes`}.` : " Try again shortly.";
    toast.warn(`Too many requests.${wait}`, { toastId: "http-429" });
  }
}

// ── The interceptors ─────────────────────────────────────────────────────────

type RetryConfig = InternalAxiosRequestConfig & { _authRetried?: boolean };

function isApiRequest(instance: AxiosInstance, config: InternalAxiosRequestConfig): string | null {
  if (!API_ORIGIN) return null;
  try {
    const url = new URL(instance.getUri(config), window.location.href);
    return url.origin === API_ORIGIN ? url.pathname : null;
  } catch {
    return null;
  }
}

/** Adds the session handling to an axios client. Safe to call twice. */
export function attachAuth(instance: AxiosInstance) {
  const marked = instance as AxiosInstance & { __zoduAuth?: boolean };
  if (marked.__zoduAuth) return;
  marked.__zoduAuth = true;

  instance.interceptors.request.use(async (config) => {
    const path = isApiRequest(instance, config);
    // Other hosts (MinIO presigned links, the print bridge) never get the token.
    if (path === null) return config;

    config.headers.set("X-Client-Platform", CLIENT_PLATFORM);
    if (TOKEN_ENDPOINT.test(path)) {
      config.withCredentials = true;
      config.headers.delete("Authorization");
      return config;
    }

    // A session restored after a reload has no access token yet: get one first
    // instead of sending a request that is bound to fail.
    if (!accessToken && sessionStore?.isAuthenticated()) await refreshSession();

    const tenant = sessionStore?.tenant();
    if (accessToken && tenant?.zoduId && tenant.branchId && !NO_CONTEXT.test(path)) {
      const { zid, bid } = claims;
      if (zid !== tenant.zoduId || bid !== tenant.branchId) {
        try {
          await switchContext(tenant.zoduId, tenant.branchId);
        } catch (err) {
          // Not this user's company/branch (any more): back to the one the token has.
          if ((err as AxiosError).response?.status === 404) sessionStore?.refused(tenant.zoduId, tenant.branchId);
          throw err;
        }
      }
    }

    if (accessToken) config.headers.set("Authorization", `Bearer ${accessToken}`);
    else config.headers.delete("Authorization");
    return config;
  });

  instance.interceptors.response.use(undefined, async (error: AxiosError) => {
    const config = error.config as RetryConfig | undefined;
    const path = config ? isApiRequest(instance, config) : null;
    // 403 / 429 are never retried here; the user is told once. Login shows its own.
    if (path !== null && !TOKEN_ENDPOINT.test(path)) notifyRefused(error);
    if (!config || error.response?.status !== 401 || config._authRetried) throw error;
    if (path === null || TOKEN_ENDPOINT.test(path)) throw error;
    if (!sessionStore?.isAuthenticated()) throw error;

    config._authRetried = true;
    await refreshSession();
    return instance.request(config);
  });
}

/**
 * Puts the app's HTTP client under attachAuth(). There is exactly one
 * (store/services/axiosInstance); raw axios calls are a lint error, so nothing
 * else needs patching.
 */
export function installAuth(...clients: AxiosInstance[]) {
  clients.forEach(attachAuth);
}
