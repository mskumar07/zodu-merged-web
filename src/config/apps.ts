/**
 * The Zodu apps zodu-web signs people in to.
 *
 * zodu-web (the main domain) has the shared landing page, login and My Apps
 * screen. zodu POS is zodu-web itself; zodu Attendance is a separate app on a
 * subdomain. Both share one session: the API keeps the refresh token in an
 * HttpOnly cookie on its own host, which the browser sends from every app on
 * the same site. So once signed in here, opening Attendance needs no second
 * login. Requires: the API on the same site (api.zodu.com needs zodu.com apps; zodu.in apps need api.zodu.in), and the
 * Attendance origin in the gateway's CORS_ORIGINS.
 */

const trimUrl = (v: unknown, fallback: string) => String(v ?? fallback).trim().replace(/\/+$/, "");

/** zodu Attendance (separate deployment, on a subdomain). */
// Set per mode in .env.development / .env.uat / .env.production. The fallback
// never sends a local run to a deployed site.
export const ATTENDANCE_URL: string = trimUrl(
  import.meta.env.VITE_ATTENDANCE_URL,
  import.meta.env.DEV ? "http://localhost:5174" : "https://attendance.zodu.in",
);

const ATTENDANCE_ORIGIN = (() => {
  try {
    return new URL(ATTENDANCE_URL).origin;
  } catch {
    return "";
  }
})();

/** Apps another app may ask the login to return to (`/login?app=…&next=…`). */
export type ReturnApp = "attendance";

/**
 * Attendance's dashboard on a company/branch. Attendance opens the shared
 * session itself and switches to this company/branch (then drops the
 * parameters from its address bar).
 */
export function attendanceUrl(zoduId?: string | null, branchId?: string | null): string {
  const url = new URL(`${ATTENDANCE_URL}/dashboard`);
  if (zoduId) url.searchParams.set("zodu_id", zoduId);
  if (zoduId && branchId) url.searchParams.set("branch_id", branchId);
  return url.toString();
}

/**
 * Where the login should send the user once signed in, when another app sent
 * them here: `?app=attendance&next=<an Attendance page>`. Only a page of that
 * app is accepted, so the login can't be used to send people to another site.
 */
export function returnTarget(search: string): { app: ReturnApp; url: string } | null {
  const params = new URLSearchParams(search);
  if (params.get("app") !== "attendance" || !ATTENDANCE_ORIGIN) return null;
  const next = params.get("next");
  if (!next) return { app: "attendance", url: attendanceUrl() };
  try {
    const url = new URL(next);
    return url.origin === ATTENDANCE_ORIGIN ? { app: "attendance", url: url.toString() } : { app: "attendance", url: attendanceUrl() };
  } catch {
    return { app: "attendance", url: attendanceUrl() };
  }
}
