/**
 * The company/branch another Zodu app (Attendance, Checklist, CRM) asked zodu POS to open
 * (`/dashboard?zodu_id=…&branch_id=…`). Read once, when the app loads, and removed from the
 * address bar so a bookmark or reload doesn't repeat it.
 */
export interface Handoff {
  zoduId: string | null;
  branchId: string | null;
}

const PARAMS = ["zodu_id", "branch_id"] as const;

let handoff: Handoff | null = (() => {
  try {
    const url = new URL(window.location.href);
    const found = { zoduId: url.searchParams.get("zodu_id"), branchId: url.searchParams.get("branch_id") };
    if (!found.zoduId) return null;
    PARAMS.forEach((p) => url.searchParams.delete(p));
    window.history.replaceState(window.history.state, "", url.toString());
    return found;
  } catch {
    return null;
  }
})();

/** What the other app asked for, if anything (still available until taken). */
export const peekHandoff = (): Handoff => handoff ?? { zoduId: null, branchId: null };

/** Same, and forgets it: it applies once. */
export function takeHandoff(): Handoff | null {
  const found = handoff;
  handoff = null;
  return found;
}
