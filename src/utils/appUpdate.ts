/**
 * Noticing a deploy from inside an already-open tab.
 *
 * The app's cache invalidation is all boot-time: `loadUserState` compares the
 * persisted Redux slice against CURRENT_USER_STATE_VERSION while store.ts is
 * being evaluated, and `isCatalogueStale` compares the IndexedDB catalogue
 * against CURRENT_CATALOGUE_VERSION when POS mounts. Both run against whichever
 * bundle the tab already holds, so a deploy is invisible to a tab that never
 * reloads — which is why an update only ever landed on a manual refresh.
 *
 * This module supplies the missing trigger. It compares the build id baked into
 * the running bundle against the one currently served, and reloads. Everything
 * downstream — dropping stale permissions, refetching settings, refetching the
 * product catalogue — is already handled by those version gates once the new
 * bundle boots.
 */
import { useCallback, useEffect, useRef, useState } from "react";

/** Where the deployed build id is published (emitted by vite.config.ts). */
const VERSION_URL = "/version.json";

/** Idle re-check. Deliberately slow: the visibility/focus checks do the work. */
const POLL_INTERVAL_MS = 5 * 60 * 1000;

/** Floor between checks, so tabbing back and forth cannot hammer the server. */
const MIN_CHECK_GAP_MS = 30 * 1000;

/**
 * Records the build we reloaded in order to reach. If we come back up still
 * running something else, the reload did not take — almost always index.html
 * being served from a cache — and we must not reload again, or the tab spins
 * in a loop. The banner is shown instead.
 */
const RELOAD_TARGET_KEY = "zodu_update_reload_target";

/** Tells sibling tabs to follow, so two tabs never run different builds. */
const UPDATE_CHANNEL = "zodu-app-update";

function readSession(key: string): string | null {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeSession(key: string, value: string) {
  try {
    sessionStorage.setItem(key, value);
  } catch {
    /* private mode — we lose the loop guard, never the app */
  }
}

function clearSession(key: string) {
  try {
    sessionStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

// ── Unsaved work registry ────────────────────────────────────────────────
// Reloading mid-sale would throw away an unsaved cart, so screens holding work
// the user would lose register here and the reload waits for the banner.

const unsavedWork = new Set<string>();

/**
 * Marks a screen as holding work a reload would destroy. Call with `false`
 * (and on unmount) to clear — a screen that never clears blocks automatic
 * updates for the rest of the session.
 */
export function setUnsavedWork(owner: string, unsaved: boolean) {
  if (unsaved) unsavedWork.add(owner);
  else unsavedWork.delete(owner);
}

export function hasUnsavedWork(): boolean {
  return unsavedWork.size > 0;
}

// ── Version check ────────────────────────────────────────────────────────

/**
 * The build id the server is serving right now, or null when it cannot be
 * determined — the dev server has no version.json, and a network blip must
 * never be read as "a new version exists".
 */
async function fetchDeployedBuildId(): Promise<string | null> {
  try {
    const res = await fetch(`${VERSION_URL}?t=${Date.now()}`, {
      cache: "no-store",
      headers: { "Cache-Control": "no-cache" },
    });
    if (!res.ok) return null;
    const body = (await res.json()) as { buildId?: unknown };
    return typeof body.buildId === "string" && body.buildId ? body.buildId : null;
  } catch {
    return null;
  }
}

export interface AppUpdateState {
  /** A different build is deployed and this tab is still on the old one. */
  updateAvailable: boolean;
  /** True when the reload is being held back by unsaved work. */
  blockedByUnsavedWork: boolean;
  /** Reload onto the new build now. */
  reload: () => void;
}

/**
 * Watches for a newer deployed build and reloads onto it when it is safe.
 *
 * Mounted once, at the app root. Checks on mount, when the tab becomes visible
 * or focused, on a slow interval, and when a lazily-loaded chunk fails to load
 * (which means the files this bundle expects are already gone from the server).
 */
export function useAppUpdate(): AppUpdateState {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [blockedByUnsavedWork, setBlockedByUnsavedWork] = useState(false);

  // Refs, not state: read from event handlers that must not be re-bound.
  const detectedRef = useRef(false);
  const lastCheckRef = useRef(0);
  const channelRef = useRef<BroadcastChannel | null>(null);

  const reload = useCallback(() => {
    window.location.reload();
  }, []);

  /** Announce, then reload if nothing would be lost. */
  const onNewBuild = useCallback(
    (deployedBuildId: string | null) => {
      if (detectedRef.current) return;
      detectedRef.current = true;
      setUpdateAvailable(true);

      // Reloading once already failed to move us onto this build — the server
      // is still handing out the old index.html. Reloading again would loop.
      const previousTarget = readSession(RELOAD_TARGET_KEY);
      const alreadyTried = deployedBuildId !== null && previousTarget === deployedBuildId;

      channelRef.current?.postMessage({ type: "update-available" });

      if (hasUnsavedWork() || alreadyTried) {
        setBlockedByUnsavedWork(hasUnsavedWork());
        return;
      }

      if (deployedBuildId) writeSession(RELOAD_TARGET_KEY, deployedBuildId);
      reload();
    },
    [reload],
  );

  const check = useCallback(
    async (force = false) => {
      if (detectedRef.current) return;
      const now = Date.now();
      if (!force && now - lastCheckRef.current < MIN_CHECK_GAP_MS) return;
      lastCheckRef.current = now;

      const deployed = await fetchDeployedBuildId();
      if (!deployed) return; // dev server, or unreachable
      if (deployed === __BUILD_ID__) {
        // We are on the build we were aiming for; drop the loop guard.
        clearSession(RELOAD_TARGET_KEY);
        return;
      }
      onNewBuild(deployed);
    },
    [onNewBuild],
  );

  useEffect(() => {
    // A reload that did land clears its own guard, even before the first poll
    // runs — otherwise the guard would block the *next* legitimate deploy.
    if (readSession(RELOAD_TARGET_KEY) === __BUILD_ID__) clearSession(RELOAD_TARGET_KEY);

    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel(UPDATE_CHANNEL);
      channelRef.current = channel;
      channel.onmessage = (event: MessageEvent) => {
        if (event.data?.type === "update-available") void check(true);
      };
    } catch {
      /* unsupported — sibling tabs just update on their own next check */
    }

    void check(true);

    const onVisible = () => {
      if (document.visibilityState === "visible") void check();
    };
    const onFocus = () => void check();

    /**
     * Vite fires this when a lazily-imported chunk fails to load. In production
     * that means the deployment moved underneath us, so it is the strongest
     * signal there is — and the app is broken until we reload, hence `force`.
     */
    const onPreloadError = (event: Event) => {
      event.preventDefault();
      void check(true);
    };

    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onFocus);
    window.addEventListener("vite:preloadError", onPreloadError);
    const timer = window.setInterval(() => void check(), POLL_INTERVAL_MS);

    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("vite:preloadError", onPreloadError);
      window.clearInterval(timer);
      channel?.close();
      channelRef.current = null;
    };
  }, [check]);

  return { updateAvailable, blockedByUnsavedWork, reload };
}
