// Adds the signed-in user's access token to requests for Zodu file links
// (/files/v/<id>, /{service}/file/<key>, signed with ?sig=) on the API origin.
//
// Images are shown with a plain <img src> / CSS url(), which can't send an
// Authorization header. With FILE_LINKS_REQUIRE_AUTH on the server, those links
// open only with the token of the user they were issued to, so this worker
// sends them with it. The token stays in memory here, as in the page; the page
// (src/utils/fileAuthWorker.ts) posts it on every change and answers when the
// worker was restarted and lost it, or got a 401 and needs a fresh one.

const FILE_LINK = /^\/(files\/v\/[0-9a-f-]{36}|(auth|employee|restaurant|retail|checklist)\/file\/)/i;

let apiOrigin = null;
let token = null;

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

self.addEventListener("message", (event) => {
  const data = event.data || {};
  if (data.type !== "file-auth") return;
  apiOrigin = typeof data.apiOrigin === "string" ? data.apiOrigin : apiOrigin;
  token = typeof data.token === "string" ? data.token : null;
});

// Asks a page of this app for { apiOrigin, token }; refresh: the last token was refused.
async function askPage(clientId, refresh) {
  const pages = [];
  const own = clientId ? await self.clients.get(clientId) : null;
  if (own) pages.push(own);
  pages.push(...(await self.clients.matchAll({ type: "window" })));
  for (const page of pages) {
    const answer = await new Promise((resolve) => {
      const channel = new MessageChannel();
      const timer = setTimeout(() => resolve(null), 5000);
      channel.port1.onmessage = (e) => { clearTimeout(timer); resolve(e.data || null); };
      page.postMessage({ type: "file-auth-request", refresh }, [channel.port2]);
    });
    if (answer) {
      apiOrigin = answer.apiOrigin || apiOrigin;
      token = answer.token || null;
      return;
    }
  }
}

const withToken = (request, value) => {
  const headers = new Headers(request.headers);
  headers.set("Authorization", `Bearer ${value}`);
  return new Request(request.url, {
    method: request.method, headers, mode: "cors", credentials: "omit",
    cache: request.cache, redirect: "follow", referrerPolicy: request.referrerPolicy,
  });
};

async function fetchFileLink(event, url) {
  if (!token || !apiOrigin) await askPage(event.clientId, false);
  if (url.origin !== apiOrigin || !token) return fetch(event.request);
  let res = await fetch(withToken(event.request, token));
  if (res.status === 401) {
    await askPage(event.clientId, true);
    if (token) res = await fetch(withToken(event.request, token));
  }
  return res;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET" && request.method !== "HEAD") return;
  if (request.headers.has("Authorization")) return;   // the app's own API calls
  let url;
  try { url = new URL(request.url); } catch { return; }
  if (!FILE_LINK.test(url.pathname) || !url.searchParams.has("sig")) return;
  if (apiOrigin && url.origin !== apiOrigin) return;
  event.respondWith(fetchFileLink(event, url).catch(() => fetch(request)));
});
