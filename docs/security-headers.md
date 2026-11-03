# Security headers for the web host

The API gateway already sends its own security headers. These are for the
**web app's host** (whatever serves `dist/`: nginx, Netlify, Cloudflare Pages,
Vercel). They go on every HTML response, next to the cache headers in
[deploy-cache-headers.md](deploy-cache-headers.md).

## Content-Security-Policy

A CSP tells the browser what the page may load and where it may send data. If
an attacker ever gets a `<script>` into the page (a stored XSS in a product
name, a compromised npm package's injected tag), the browser refuses to run it
and refuses to send data anywhere but the API.

Replace the two placeholders first:

- `API_ORIGIN`: the API gateway, e.g. `https://api.myzodu.com`
- `FILES_ORIGIN`: where uploaded images/PDFs are served (file-service's
  `MINIO_PUBLIC_URL`), e.g. `https://files.myzodu.com`

```
default-src 'self';
script-src 'self';
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
font-src 'self' https://fonts.gstatic.com data:;
img-src 'self' data: blob: https:;
media-src 'self' blob:;
connect-src 'self' API_ORIGIN FILES_ORIGIN http://127.0.0.1:* http://localhost:*;
frame-src 'self' blob: FILES_ORIGIN;
worker-src 'self' blob:;
object-src 'none';
base-uri 'self';
form-action 'self';
frame-ancestors 'none';
upgrade-insecure-requests
```

(Send it as one line; the line breaks above are for reading.)

| Directive | Why |
|---|---|
| `script-src 'self'` | **The XSS protection.** Only the app's own bundle runs; inline and injected scripts are blocked. The Vite build has no inline scripts. |
| `style-src 'unsafe-inline'` | MUI / emotion inject `<style>` tags at runtime. Styles cannot run code. |
| `img-src https:` | Product, logo and avatar images come from the file host and a few outside sites (Google, placeholders). An image cannot run code. |
| `connect-src` | Where `fetch`/axios may go: the API, the file host, and the shop PC's print bridge (`127.0.0.1:9123` by default, the port is configurable). An injected script cannot post data to its own server. |
| `frame-src` | Print previews (`blob:`) and PDF previews from the file host. |
| `object-src 'none'`, `base-uri 'self'`, `form-action 'self'` | No plugins; no `<base>` hijacking every relative URL; forms post only to the app. |
| `frame-ancestors 'none'` | No other site can show the app in an iframe and trick a cashier into clicking (clickjacking). |

### Roll it out without breaking anything

1. Deploy it as **`Content-Security-Policy-Report-Only`** (same value). The
   browser enforces nothing and logs each violation in the console.
2. Use the app for a few days: login, POS, printing, label print, uploads,
   reports, PDF previews. Add any legitimate host the console reports.
3. Rename the header to **`Content-Security-Policy`**.

## The other headers

```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(self), microphone=(), geolocation=(), payment=()
```

- **HSTS**: browsers only ever use HTTPS for the site, so the `Secure` refresh
  cookie is never offered over plain HTTP.
- **nosniff**: a file is never run as a script because of its content.
- **Referrer-Policy**: full URLs (with ids) aren't sent to other sites.
- **Permissions-Policy**: the camera stays available to the app itself (barcode
  scanning on phones and tablets); nothing else.

## Examples

**nginx** (inside the `server` block for the web app)

```nginx
add_header Content-Security-Policy-Report-Only "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https:; media-src 'self' blob:; connect-src 'self' https://api.myzodu.com https://files.myzodu.com http://127.0.0.1:* http://localhost:*; frame-src 'self' blob: https://files.myzodu.com; worker-src 'self' blob:; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "camera=(self), microphone=(), geolocation=(), payment=()" always;
```

nginx drops `add_header` from the parent block in any `location` that sets its
own (the cache headers do): repeat these there, or use an `include` file.

**Netlify / Cloudflare Pages**: `public/_headers`

```
/*
  Content-Security-Policy-Report-Only: default-src 'self'; script-src 'self'; ...
  Strict-Transport-Security: max-age=31536000; includeSubDomains
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(self), microphone=(), geolocation=(), payment=()
```

**Vercel**: `vercel.json`, one more entry in `headers` with `"source": "/(.*)"`.

## The session cookie needs the same site

The refresh token is an HttpOnly cookie `rt` set by the API with
`SameSite=Strict`. The browser only sends it when the web app and the API are
the **same site**, e.g. `app.myzodu.com` and `api.myzodu.com`. Served from
another domain (`*.vercel.app`, `*.netlify.app`), every reload signs the user
out. The gateway's `CORS_ORIGINS` must list the web app's origin.
