import { useEffect, useState } from "react";
import { getAccessToken, refreshSession } from "@utils/authSession";

/**
 * After a page load the access token (memory only) is gone, while the refresh
 * cookie is still there. This gets a new token once, before any protected
 * screen renders, so the first screen never starts with requests that fail.
 *
 * - refreshed: render the app;
 * - the server ended the session (401/400): authSession clears the user and
 *   ProtectedRoute sends them to the login page;
 * - offline / server error: render anyway (the POS works from its cache);
 *   the next request tries the refresh again.
 *
 * Module scope: one refresh per page load, however often the routes remount.
 */
let boot: Promise<void> | null = null;

export function useSessionBoot(isAuthenticated: boolean): boolean {
  const [ready, setReady] = useState(() => !isAuthenticated || Boolean(getAccessToken()));

  useEffect(() => {
    if (ready || !isAuthenticated) return;
    if (!boot) boot = refreshSession().then(() => undefined, () => undefined);
    let active = true;
    void boot.then(() => {
      if (active) setReady(true);
    });
    return () => {
      active = false;
    };
  }, [ready, isAuthenticated]);

  return ready || !isAuthenticated;
}
