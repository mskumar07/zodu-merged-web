# Deploy cache headers

The in-app update watcher (`src/utils/appUpdate.ts`) compares the build id baked
into the running bundle against `/version.json` on the server. That comparison
is only meaningful if the browser and any CDN in front of it are actually
allowed to see the new files.

Two rules, and they pull in opposite directions:

| Path | Header | Why |
| --- | --- | --- |
| `/index.html`, `/version.json` | `Cache-Control: no-cache` | Must be revalidated on every request, or a deploy is invisible. |
| `/assets/*` | `Cache-Control: public, max-age=31536000, immutable` | Filenames are content-hashed by Vite, so a given URL never changes. |

`no-cache` does not mean "do not store" — it means "revalidate before use", so
these files still get a cheap 304 when unchanged.

## Symptom this prevents

If `index.html` is cached, a hard refresh (Ctrl+Shift+R) picks up a new build
but an ordinary refresh does not. The watcher then detects the new
`version.json`, reloads, comes back on the *same* old bundle, and would loop —
`appUpdate.ts` guards against that with `zodu_update_reload_target` and falls
back to showing the banner, but the underlying deploy is still broken until the
headers are fixed.

## Examples

**nginx**

```nginx
location = /index.html   { add_header Cache-Control "no-cache"; }
location = /version.json { add_header Cache-Control "no-cache"; }
location /assets/        { add_header Cache-Control "public, max-age=31536000, immutable"; }
```

**Netlify / Cloudflare Pages** — `public/_headers`

```
/index.html
  Cache-Control: no-cache
/version.json
  Cache-Control: no-cache
/assets/*
  Cache-Control: public, max-age=31536000, immutable
```

**Vercel** — `vercel.json`

```json
{
  "headers": [
    { "source": "/index.html",   "headers": [{ "key": "Cache-Control", "value": "no-cache" }] },
    { "source": "/version.json", "headers": [{ "key": "Cache-Control", "value": "no-cache" }] },
    { "source": "/assets/(.*)",  "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }] }
  ]
}
```

If a CDN sits in front of the origin, purge or bypass its cache for
`index.html` and `version.json` as well.

## Verifying

After a deploy:

```sh
curl -sI https://<host>/version.json | grep -i cache-control   # expect no-cache
curl -s  https://<host>/version.json                            # expect the new buildId
```

Then open an already-loaded tab, switch away and back — it should reload itself
onto the new build within a second or two.
