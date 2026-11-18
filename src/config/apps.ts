/**
 * The Zodu apps zodu-web signs people in to.
 *
 * zodu-web (the main domain) has the shared landing page, login and My Apps
 * screen. zodu POS is zodu-web itself; zodu Attendance and zodu Checklist are
 * separate apps on subdomains. Both share one session: the API keeps the refresh token in an
 * HttpOnly cookie on its own host, which the browser sends from every app on
 * the same site. So once signed in here, opening Attendance needs no second
 * login. Requires: the API on the same site (api.zodu.com needs zodu.com apps; zodu.in apps need api.zodu.in), and the
 * Attendance and Checklist origins in the gateway's CORS_ORIGINS.
 */

const trimUrl = (v: unknown, fallback: string) => String(v ?? fallback).trim().replace(/\/+$/, "");

/** zodu Attendance (separate deployment, on a subdomain). */
// Set per mode in .env.development / .env.uat / .env.production. The fallback
// never sends a local run to a deployed site.
export const ATTENDANCE_URL: string = trimUrl(
  import.meta.env.VITE_ATTENDANCE_URL,
  import.meta.env.DEV ? "http://localhost:5174" : "https://attendance.zodu.in",
);

/** zodu Checklist — "zodu Task" under My Apps (separate deployment, on a subdomain). */
export const CHECKLIST_URL: string = trimUrl(
  import.meta.env.VITE_CHECKLIST_URL,
  import.meta.env.DEV ? "http://localhost:5175" : "https://checklist.zodu.in",
);

/** zodu CRM (separate deployment, on a subdomain). */
export const CRM_URL: string = trimUrl(
  import.meta.env.VITE_CRM_URL,
  import.meta.env.DEV ? "http://localhost:5176" : "https://crm.zodu.in",
);

const originOf = (url: string) => {
  try {
    return new URL(url).origin;
  } catch {
    return "";
  }
};

/** Apps another app may ask the login to return to (`/login?app=…&next=…`). */
export type ReturnApp = "attendance" | "checklist" | "crm";

const RETURN_APPS: Record<ReturnApp, string> = {
  attendance: ATTENDANCE_URL,
  checklist: CHECKLIST_URL,
  crm: CRM_URL,
};

/**
 * An app's dashboard on a company/branch. The app opens the shared session
 * itself and switches to this company/branch (then drops the parameters from
 * its address bar).
 */
function appDashboardUrl(base: string, zoduId?: string | null, branchId?: string | null): string {
  const url = new URL(`${base}/dashboard`);
  if (zoduId) url.searchParams.set("zodu_id", zoduId);
  if (zoduId && branchId) url.searchParams.set("branch_id", branchId);
  return url.toString();
}

/** Attendance's dashboard on a company/branch. */
export function attendanceUrl(zoduId?: string | null, branchId?: string | null): string {
  return appDashboardUrl(ATTENDANCE_URL, zoduId, branchId);
}

/** zodu Checklist's dashboard on a company/branch. */
export function checklistUrl(zoduId?: string | null, branchId?: string | null): string {
  return appDashboardUrl(CHECKLIST_URL, zoduId, branchId);
}

/** zodu CRM's dashboard on a company/branch. */
export function crmUrl(zoduId?: string | null, branchId?: string | null): string {
  return appDashboardUrl(CRM_URL, zoduId, branchId);
}

const isReturnApp = (v: string | null): v is ReturnApp => v !== null && Object.prototype.hasOwnProperty.call(RETURN_APPS, v);

/**
 * Where the login should send the user once signed in, when another app sent
 * them here: `?app=attendance&next=<an Attendance page>` (or `app=checklist`).
 * Only a page of that app is accepted, so the login can't be used to send
 * people to another site.
 */
export function returnTarget(search: string): { app: ReturnApp; url: string } | null {
  const params = new URLSearchParams(search);
  const app = params.get("app");
  if (!isReturnApp(app)) return null;
  const origin = originOf(RETURN_APPS[app]);
  if (!origin) return null;
  const home = appDashboardUrl(RETURN_APPS[app]);
  const next = params.get("next");
  if (!next) return { app, url: home };
  try {
    const url = new URL(next);
    return { app, url: url.origin === origin ? url.toString() : home };
  } catch {
    return { app, url: home };
  }
}
