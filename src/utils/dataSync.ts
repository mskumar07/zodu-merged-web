/**
 * Telling the rest of the app — and the rest of the browser — that a sale
 * landed.
 *
 * A sale saved in POS changes what the Dashboard and Sales History should be
 * showing, but neither screen has any way to know: React Query only refetches
 * when something invalidates its cache or a refetch trigger fires. Within one
 * tab that is an `invalidateQueries` call; across tabs (a till and a manager's
 * dashboard open side by side) it needs a message, which is what this is.
 *
 * A cashier on a *different machine* is beyond a BroadcastChannel — that is
 * covered by the dashboard's polling, and would need a server push (SSE or a
 * websocket) to be instant.
 */

/** Query-key prefixes that a new sale makes stale, wherever they are cached. */
export const SALE_DEPENDENT_KEYS = [
  ["dashboard"],
  ["sales-history"],
  ["sales-summary"],
] as const;

const CHANNEL_NAME = "zodu-data-sync";

type DataChange = { type: "sale-saved" };

function openChannel(): BroadcastChannel | null {
  try {
    return new BroadcastChannel(CHANNEL_NAME);
  } catch {
    // Unsupported or blocked (older Safari, some private modes). Same-tab
    // invalidation still works; other tabs fall back to their poll.
    return null;
  }
}

/** Announce a saved sale to every other tab on this browser. */
export function publishSaleSaved() {
  const channel = openChannel();
  if (!channel) return;
  try {
    channel.postMessage({ type: "sale-saved" } satisfies DataChange);
  } finally {
    channel.close();
  }
}

/**
 * Runs `onSaleSaved` when another tab reports a sale. Returns an unsubscribe
 * function, so callers can hand it straight back from a `useEffect`.
 */
export function subscribeSaleSaved(onSaleSaved: () => void): () => void {
  const channel = openChannel();
  if (!channel) return () => {};

  channel.onmessage = (event: MessageEvent<DataChange>) => {
    if (event.data?.type === "sale-saved") onSaleSaved();
  };

  return () => channel.close();
}
