/**
 * Marks "this account just signed up and has no business details filled in
 * yet" across the /signup → /login navigation, so the first successful login
 * can route straight to Settings with the Edit Business modal open on the
 * business signup created (never Add — that would create a second one),
 * instead of the normal dashboard/branch-picker flow.
 *
 * Backed by localStorage (not router state) because it must survive the full
 * unmount/remount between the two pages, and even a refresh on /login.
 * Keyed by email so a second person logging in on the same browser never
 * inherits someone else's pending flag.
 */

const STORAGE_KEY = "zodu:pendingSignup";

export interface PendingSignup {
  email: string;
  restaurant_name: string;
  phone_number: string;
  business_type: "Retail" | "Restaurant";
}

export function setPendingSignup(data: PendingSignup): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Storage unavailable (private mode, quota) — the modal simply won't
    // pre-fill; not worth failing signup over.
  }
}

/** Reads and clears the flag in one step — it must fire at most once. */
export function consumePendingSignup(email: string): PendingSignup | null {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    return null;
  }
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as PendingSignup;
    if (parsed.email.trim().toLowerCase() !== email.trim().toLowerCase()) return null;
    return parsed;
  } catch {
    return null;
  }
}
