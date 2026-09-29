import type { Branch } from "@pages/auth/Authapi";

// Subscriptions live per branch (tbl_subscription). A branch on trial runs to
// trial_end_date; a paid plan runs to subscription_end_date. The backend's
// subscription_effective_status already flags an end date that has passed
// ("trial_expired" / "subscription_expired").

/** Show "Pay Now" once the trial / subscription ends within this many days. */
export const PAY_NOW_WINDOW_DAYS = 10;

export interface BranchSubscriptionInfo {
  isTrial: boolean;
  /** e.g. "31 Dec 2025", or "-" when no end date is known. */
  dateLabel: string;
  /** Whole days until the end date (0 = ends today, negative = past). */
  daysLeft: number | null;
  expired: boolean;
  /** "120 Days Left" / "Ends Today" / "Expired". */
  daysLabel: string;
  /** green → plenty left, orange → within 30 days, red → within the pay-now window or expired. */
  color: string;
  /** True when the Pay Now prompt should show (ends within PAY_NOW_WINDOW_DAYS, or already ended). */
  payNow: boolean;
}

const parseDate = (value?: string | null): Date | null => {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

export function getBranchSubscription(branch?: Branch | null): BranchSubscriptionInfo | null {
  if (!branch) return null;
  const status = (branch.subscription_effective_status || branch.subscription_status || "").toLowerCase();
  if (!status) return null;

  const isTrial = status.startsWith("trial");
  const end = parseDate(isTrial ? branch.trial_end_date : branch.subscription_end_date);

  let daysLeft: number | null = null;
  if (end) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endDay = new Date(end);
    endDay.setHours(0, 0, 0, 0);
    daysLeft = Math.round((endDay.getTime() - today.getTime()) / 86400000);
  } else if (isTrial && typeof branch.trial_days_left === "number") {
    daysLeft = branch.trial_days_left;
  }

  const expired = status.endsWith("expired") || (daysLeft !== null && daysLeft < 0);
  // A status without any end date has nothing to show (avoids "Expires -").
  if (!end && daysLeft === null && !expired) return null;
  const daysLabel = expired
    ? "Expired"
    : daysLeft === null
      ? ""
      : daysLeft === 0
        ? "Ends Today"
        : `${daysLeft} Day${daysLeft === 1 ? "" : "s"} Left`;
  const color = expired || (daysLeft !== null && daysLeft <= PAY_NOW_WINDOW_DAYS)
    ? "#D2122E"
    : daysLeft !== null && daysLeft <= 30
      ? "#ea8a00"
      : "#16a34a";

  return {
    isTrial,
    dateLabel: end
      ? end.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
      : "-",
    daysLeft,
    expired,
    daysLabel,
    color,
    payNow: expired || (daysLeft !== null && daysLeft <= PAY_NOW_WINDOW_DAYS),
  };
}
