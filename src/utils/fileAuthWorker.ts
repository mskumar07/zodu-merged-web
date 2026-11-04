import { API_BASE, getAccessToken, refreshSession, subscribeSession } from "./authSession";

// Registers public/file-auth-sw.js, which adds the access token to image file
// links (an <img src> can't send it), and keeps it supplied with the current
// token. Nothing else in the app changes: <img src={url}> keeps working when
// the server requires the token (FILE_LINKS_REQUIRE_AUTH).
//
// Needs a secure context (https, or localhost in development); elsewhere the
// browser has no service workers and images load as before.

const SCRIPT = `${import.meta.env.BASE_URL}file-auth-sw.js`;

export function installFileAuthWorker() {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator) || !window.isSecureContext) return;
  const sw = navigator.serviceWorker;
  const apiOrigin = new URL(API_BASE, window.location.href).origin;
  const state = () => ({ type: "file-auth", apiOrigin, token: getAccessToken() });
  const post = (worker: ServiceWorker | null | undefined) => worker?.postMessage(state());

  sw.register(SCRIPT, { scope: import.meta.env.BASE_URL })
    .then((reg) => post(reg.active ?? reg.waiting ?? reg.installing))
    .catch((err) => console.warn("[file-auth] service worker not registered:", err));
  sw.ready.then((reg) => post(reg.active)).catch(() => {});
  sw.addEventListener("controllerchange", () => post(sw.controller));
  subscribeSession(() => post(sw.controller));

  // The worker restarted (and lost the token) or got a 401: answer on its port.
  sw.addEventListener("message", (event: MessageEvent) => {
    if (event.data?.type !== "file-auth-request") return;
    const port = event.ports[0];
    if (!port) return;
    void (async () => {
      let token = getAccessToken();
      // Refresh only an existing session whose token was refused; signed-out pages stay signed out.
      if (token && event.data.refresh) {
        try {
          token = await refreshSession();
        } catch {
          token = null;
        }
      } else if (!token) {
        token = await nextToken(3000);
      }
      port.postMessage({ apiOrigin, token });
    })();
  });
}

// The token once the session sets one (a reload restores it right after start), or null.
function nextToken(ms: number): Promise<string | null> {
  return new Promise((resolve) => {
    let unsubscribe: (() => void) | undefined;
    const timer = setTimeout(() => { unsubscribe?.(); resolve(null); }, ms);
    unsubscribe = subscribeSession(() => {
      const token = getAccessToken();
      if (!token) return;
      clearTimeout(timer);
      unsubscribe?.();
      resolve(token);
    });
  });
}
