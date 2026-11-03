/**
 * Loads an image so its pixels can be read back (canvas, PDF, print raster).
 *
 * Uploaded files (logo, signature, …) come from the API's file host, which
 * answers with Access-Control-Allow-Origin only when the request carries an
 * Origin header, and lets the browser cache the file for up to half an hour.
 * A plain <img> (the topbar logo, the on-screen invoice) requests it without
 * one, so the cached copy has no CORS header; a later `crossOrigin` load of the
 * same URL is served that copy and fails, and the logo came out blank in every
 * downloaded or printed invoice. Fetching with `cache: "reload"` always goes to
 * the server in CORS mode, and the blob URL it becomes is same-origin.
 *
 * Null when the file can't be fetched or read (offline, expired link, no CORS).
 */
export async function loadReadableImage(src: string): Promise<HTMLImageElement | null> {
  if (!src) return null;
  if (src.startsWith("data:") || src.startsWith("blob:")) return loadImage(src);
  let objectUrl: string;
  try {
    const res = await fetch(src, { mode: "cors", credentials: "omit", cache: "reload" });
    if (!res.ok) return null;
    objectUrl = URL.createObjectURL(await res.blob());
  } catch {
    return null;
  }
  const img = await loadImage(objectUrl);
  // A loaded image keeps its pixels; the blob URL isn't needed any more.
  URL.revokeObjectURL(objectUrl);
  return img;
}

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img.naturalWidth ? img : null);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

/**
 * Waits (up to `timeoutMs`) for the <img>s inside `node` to finish loading, so
 * a capture taken right after the template mounts measures and draws them.
 */
export async function settleImages(node: HTMLElement, timeoutMs = 3000): Promise<void> {
  const pending = Array.from(node.querySelectorAll("img")).filter((img) => img.src && !img.complete);
  if (pending.length === 0) return;
  await Promise.race([
    Promise.all(pending.map((img) => img.decode().catch(() => {}))),
    new Promise((resolve) => setTimeout(resolve, timeoutMs)),
  ]);
}
