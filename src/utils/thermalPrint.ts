import html2canvas from "html2canvas";
import type { ThermalPaperSize } from "@pages/SalesHistory/ThermalInvoiceTemplate";
import { PAPER_DOTS, packRaster, type CutMode } from "@utils/kot/escpos";
import type { PaperSize } from "@utils/kot/kotTicket";
import { localReceiptPrinters, pickBillPrinter } from "@utils/kot/localPrinter";
import { bridgePrint } from "@utils/kot/printBridge";

/**
 * Printing a thermal receipt on whatever roll is actually loaded.
 *
 * Through the print bridge, the receipt is redrawn for the connected printer's
 * roll, captured as black-and-white dots and sent as an ESC/POS raster. Through
 * the browser's print dialog it prints as the page itself — the same markup,
 * fonts and weights as the Invoice Settings preview — at the width Invoice
 * Settings names.
 */

/** Roll widths, and the band a thermal head prints on each — for the PDF download. */
export const THERMAL_ROLL_MM: Record<ThermalPaperSize, number> = { "2": 58, "3": 80, "4": 104, "5": 130 };
export const THERMAL_PRINTABLE_MM: Record<ThermalPaperSize, number> = { "2": 48, "3": 72, "4": 96, "5": 120 };

// One image pixel per printer dot: thermal heads print 8 dots/mm (203 dpi). The old
// 3× capture was resampled down onto the head, which turned the black-and-white
// edges back into grey that the driver then dithered: the whole bill printed fuzzy.
const HEAD_DOTS_PER_MM = 8;
const CSS_PX_PER_MM = 96 / 25.4;

/**
 * The capture scale that makes the image exactly as many pixels across as the
 * head has dots for this receipt's width: 72 mm → 576 (3"), 96 mm → 768 (4"),
 * 120 mm → 960 (5"). A single 203/96 factor was a dot or two short on the wider
 * rolls, which still made the driver resample. The quarter pixel of slack keeps
 * html2canvas's floor() from dropping the last column.
 */
function captureScale(node: HTMLElement): number {
  const widthPx = node.offsetWidth;
  if (!widthPx) return (HEAD_DOTS_PER_MM * 25.4) / 96;
  const dots = Math.round(widthPx / CSS_PX_PER_MM) * HEAD_DOTS_PER_MM;
  return (dots + 0.25) / widthPx;
}

// Off for now: every thermal print goes through the browser's print dialog, as
// the page itself. Switch back on to send straight to the printer connected to
// this PC through the Zodu Print Bridge (the capture/raster path below).
const PRINT_BRIDGE_ENABLED = false;

// Luminance under which a pixel prints black. Past mid-grey, so the darker half
// of an anti-aliased edge joins its stroke: at 170 thin strokes came out faint
// and patchy, at 205 lighter-weight text ran heavy.
const INK_THRESHOLD = 190;

// How much of a picture's tonal spread a single black/white split explains
// (Otsu's between-class ÷ total variance) for it to count as flat artwork.
const FLAT_ARTWORK = 0.8;

/**
 * Turns one picture's region to ink. Flat artwork — nearly every logo, a
 * signature — splits at its own best threshold (Otsu), so a coloured badge
 * prints as solid black with clean white lettering instead of a grey the driver
 * speckles into mush. Photographic pictures are error-diffused instead, at the
 * head's own dot pitch, so their shading survives.
 */
function inkPicture(lum: Float32Array, ink: Uint8Array, w: number, x0: number, y0: number, x1: number, y1: number): void {
  const hist = new Array<number>(256).fill(0);
  let n = 0;
  let sum = 0;
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const v = Math.round(lum[y * w + x]);
      hist[v]++;
      sum += v;
      n++;
    }
  }
  if (!n) return;
  const mean = sum / n;
  let variance = 0;
  for (let v = 0; v < 256; v++) variance += hist[v] * (v - mean) ** 2;
  variance /= n;
  if (variance < 1) return; // a single tone — the text threshold already inked it

  let split = INK_THRESHOLD;
  let best = 0;
  let countLow = 0;
  let sumLow = 0;
  for (let v = 0; v < 256; v++) {
    countLow += hist[v];
    if (!countLow) continue;
    const countHigh = n - countLow;
    if (!countHigh) break;
    sumLow += v * hist[v];
    const between = (countLow * countHigh * (sumLow / countLow - (sum - sumLow) / countHigh) ** 2) / (n * n);
    if (between > best) {
      best = between;
      split = v;
    }
  }

  if (best / variance >= FLAT_ARTWORK) {
    let black = 0;
    for (let y = y0; y < y1; y++) {
      for (let x = x0; x < x1; x++) {
        const v = lum[y * w + x] <= split ? 1 : 0;
        ink[y * w + x] = v;
        black += v;
      }
    }
    // A logo that is mostly ink — pale lettering on a dark badge — loses that
    // lettering: a thermal dot spreads into its neighbours and closes the thin
    // white strokes. Pulling the ink back off every edge by one dot reopens them.
    if (black / n > 0.55) thinInk(ink, w, x0, y0, x1, y1);
    return;
  }

  // Floyd–Steinberg
  const rw = x1 - x0;
  const rh = y1 - y0;
  const buf = new Float32Array(rw * rh);
  for (let y = 0; y < rh; y++) {
    for (let x = 0; x < rw; x++) buf[y * rw + x] = lum[(y + y0) * w + x + x0];
  }
  for (let y = 0; y < rh; y++) {
    for (let x = 0; x < rw; x++) {
      const i = y * rw + x;
      const black = buf[i] < 128;
      ink[(y + y0) * w + x + x0] = black ? 1 : 0;
      const err = buf[i] - (black ? 0 : 255);
      if (x + 1 < rw) buf[i + 1] += (err * 7) / 16;
      if (y + 1 < rh) {
        if (x > 0) buf[i + rw - 1] += (err * 3) / 16;
        buf[i + rw] += (err * 5) / 16;
        if (x + 1 < rw) buf[i + rw + 1] += err / 16;
      }
    }
  }
}

/** Clears every inked dot that touches a blank one, widening the gaps inside dark artwork. */
function thinInk(ink: Uint8Array, w: number, x0: number, y0: number, x1: number, y1: number): void {
  const before = ink.slice(y0 * w, y1 * w);
  const at = (x: number, y: number) => (x < x0 || x >= x1 || y < y0 || y >= y1 ? 1 : before[(y - y0) * w + x]);
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      if (before[(y - y0) * w + x] && !(at(x - 1, y) && at(x + 1, y) && at(x, y - 1) && at(x, y + 1))) {
        ink[y * w + x] = 0;
      }
    }
  }
}

/**
 * Snaps the capture to the only two things a thermal head prints: black and
 * white. Left grey, the anti-aliased edges of the text were thresholded by some
 * printer drivers and dithered into a speckled halo by others, so the same
 * receipt came out crisp on one printer and faint or fuzzy on the next.
 * Pictures (the logo, the signature) get their own treatment — see inkPicture.
 */
function toThermalInk(canvas: HTMLCanvasElement, node: HTMLElement): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const { width: w, height: h } = canvas;
  let image: ImageData;
  try {
    image = ctx.getImageData(0, 0, w, h);
  } catch {
    return; // a cross-origin picture tainted the canvas — print it as captured
  }
  const box = node.getBoundingClientRect();
  const s = box.width ? w / box.width : captureScale(node);
  const px = image.data;
  const lum = new Float32Array(w * h);
  const ink = new Uint8Array(w * h);
  for (let i = 0, p = 0; i < lum.length; i++, p += 4) {
    const alpha = px[p + 3] / 255;
    lum[i] = 255 - alpha * (255 - (0.299 * px[p] + 0.587 * px[p + 1] + 0.114 * px[p + 2]));
    ink[i] = lum[i] < INK_THRESHOLD ? 1 : 0;
  }
  for (const img of Array.from(node.querySelectorAll("img"))) {
    const r = img.getBoundingClientRect();
    const x0 = Math.max(0, Math.floor((r.left - box.left) * s));
    const y0 = Math.max(0, Math.floor((r.top - box.top) * s));
    const x1 = Math.min(w, Math.ceil((r.right - box.left) * s));
    const y1 = Math.min(h, Math.ceil((r.bottom - box.top) * s));
    if (x1 > x0 && y1 > y0) inkPicture(lum, ink, w, x0, y0, x1, y1);
  }
  for (let i = 0, p = 0; i < ink.length; i++, p += 4) {
    px[p] = px[p + 1] = px[p + 2] = ink[i] ? 0 : 255;
    px[p + 3] = 255;
  }
  ctx.putImageData(image, 0, 0);
}

/** The rendered receipt, black and white, one pixel per head dot. */
async function captureThermalCanvas(node: HTMLElement): Promise<HTMLCanvasElement> {
  const canvas = await html2canvas(node, {
    scale: captureScale(node),
    useCORS: true,
    backgroundColor: "#ffffff",
    logging: false,
    // The receipt is rendered off-screen inside a transparent wrapper; undo
    // that on the clone so the capture isn't blank.
    onclone: (_doc, el) => {
      for (let p = el.parentElement; p; p = p.parentElement) p.style.opacity = "1";
    },
  });
  toThermalInk(canvas, node);
  return canvas;
}

/**
 * ESC/POS raster of a captured receipt for the printer's roll. A receipt laid out
 * for another width is scaled to fill the head — a 3" receipt on a 58 mm printer
 * prints smaller, but whole.
 */
function receiptRaster(canvas: HTMLCanvasElement, paper: PaperSize, cut: CutMode): Uint8Array {
  const width = PAPER_DOTS[paper];
  let source = canvas;
  if (canvas.width !== width) {
    source = document.createElement("canvas");
    source.width = width;
    source.height = Math.max(1, Math.round((canvas.height * width) / canvas.width));
    const scaled = source.getContext("2d");
    if (!scaled) throw new Error("Canvas is not available to print this receipt");
    scaled.fillStyle = "#fff";
    scaled.fillRect(0, 0, source.width, source.height);
    scaled.drawImage(canvas, 0, 0, source.width, source.height);
  }
  const ctx = source.getContext("2d");
  if (!ctx) throw new Error("Canvas is not available to print this receipt");
  return packRaster(ctx.getImageData(0, 0, source.width, source.height).data, source.width, source.height, 255, cut);
}

/**
 * The receipt's pictures (logo, signature) as black-and-white dots, the same
 * treatment the bridge capture gives them (see inkPicture) — left in colour, the
 * driver dithers a coloured logo into grey speckle. Resolves the pictures in
 * `clone` to data URLs; a picture whose pixels can't be read (served without CORS
 * headers) keeps its original file.
 */
/**
 * Waits until the receipt's pictures have loaded and stopped changing.
 *
 * The logo is shown straight from its URL while the template trims its blank
 * margin in the background, then swapped for the trimmed copy. Print in that
 * window — the first bill after a login, before anything is cached — and the
 * picture is either still loading or still the untrimmed file, whose pixels the
 * browser won't let a canvas read: it then went to the printer in colour and the
 * driver screened it into a faint dot pattern. Every later bill printed solid.
 */
async function awaitPicturesSettled(node: HTMLElement, timeoutMs = 4000): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  let previous = "";
  for (;;) {
    const pictures = Array.from(node.querySelectorAll("img"));
    await Promise.all(pictures.map((img) => (
      img.complete
        ? img.decode().catch(() => undefined)
        : new Promise<void>((resolve) => {
            const done = () => resolve();
            img.addEventListener("load", done, { once: true });
            img.addEventListener("error", done, { once: true });
            setTimeout(done, Math.max(0, deadline - Date.now()));
          })
    )));
    const sources = pictures.map((img) => img.src).join("|");
    // Settled once nothing swapped itself out while we waited (the trimmed logo).
    if (sources === previous || Date.now() >= deadline) return;
    previous = sources;
    await new Promise((resolve) => setTimeout(resolve, 60));
  }
}

function inkPicturesInto(clone: HTMLElement, node: HTMLElement): void {
  const originals = Array.from(node.querySelectorAll("img"));
  const copies = Array.from(clone.querySelectorAll("img"));
  originals.forEach((img, i) => {
    const target = copies[i];
    if (!target || !img.complete || !img.naturalWidth) return;
    const box = img.getBoundingClientRect();
    // Drawn at the size it prints, in head dots: the artwork is scaled smoothly
    // first and only then decided black or white, so the lettering inside a logo
    // keeps clean edges. Deciding at the file's own size and letting the browser
    // enlarge the result afterwards printed those edges ragged.
    const scale = (HEAD_DOTS_PER_MM * 25.4) / 96;
    const w = Math.max(1, Math.round(box.width * scale));
    const h = Math.max(1, Math.round(box.height * scale));
    try {
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, w, h);
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, w, h);
      const image = ctx.getImageData(0, 0, w, h); // throws when tainted
      const px = image.data;
      const lum = new Float32Array(w * h);
      const ink = new Uint8Array(w * h);
      for (let j = 0, p = 0; j < lum.length; j++, p += 4) {
        lum[j] = 0.299 * px[p] + 0.587 * px[p + 1] + 0.114 * px[p + 2];
        ink[j] = lum[j] < INK_THRESHOLD ? 1 : 0;
      }
      inkPicture(lum, ink, w, 0, 0, w, h);
      for (let j = 0, p = 0; j < ink.length; j++, p += 4) {
        px[p] = px[p + 1] = px[p + 2] = ink[j] ? 0 : 255;
        px[p + 3] = 255;
      }
      ctx.putImageData(image, 0, 0);
      target.src = canvas.toDataURL("image/png");
      // No "pixelated" here: resizing would then pick single dots and drop the rest,
      // which printed the logo as a thin dotted screen instead of a solid mark.
    } catch {
      // Unreadable pixels (a logo served without CORS headers) — the picture prints
      // as it is, and the driver decides what to do with its colours.
    }
    // No CSS filter here, however tempting: a filter makes the browser rasterize the
    // picture as its own layer at screen resolution and scale that up to the head's,
    // which turns solid black back into grey and prints the logo as a faint screen.
  });
}

/** The receipt as rendered right now, with its pictures turned to ink — one copy's markup. */
function receiptMarkup(node: HTMLElement): string {
  const clone = node.cloneNode(true) as HTMLElement;
  inkPicturesInto(clone, node);
  return clone.outerHTML;
}

/**
 * The page's own @font-face rules, plus links to the font sheets it pulls in —
 * both the ones it links and the ones index.css @imports (Google Fonts) — and
 * nothing else from the app's stylesheets. Miss those imports and the receipt
 * prints in the fallback font: Courier instead of the template's own face, whose
 * wider letters then wrap labels the preview fits on one line.
 */
function fontStyles(): string {
  const faces: string[] = [];
  const links = new Set<string>();
  const collect = (sheet: CSSStyleSheet, depth = 0) => {
    let rules: CSSRuleList;
    try {
      rules = sheet.cssRules; // throws on a cross-origin sheet
    } catch {
      if (sheet.href) links.add(sheet.href);
      return;
    }
    for (const rule of Array.from(rules)) {
      if (rule instanceof CSSFontFaceRule) faces.push(rule.cssText);
      // @import: readable ones are walked, cross-origin ones linked instead.
      else if (rule instanceof CSSImportRule && depth < 4) {
        if (rule.styleSheet) collect(rule.styleSheet, depth + 1);
        else if (rule.href) links.add(new URL(rule.href, sheet.href ?? document.baseURI).href);
      }
    }
  };
  for (const sheet of Array.from(document.styleSheets)) collect(sheet);
  const linkTags = Array.from(links, (href) => `<link rel="stylesheet" href="${href}">`).join("\n");
  return `${linkTags}\n<style>${faces.join("\n")}</style>`;
}

/**
 * The receipt printed as the web page draws it — its own markup, fonts and
 * weights — so the print dialog's output is the Invoice Settings preview, not a
 * picture of it. The template is laid out in physical units (96 px per inch), so
 * it prints at its own width, centred; with no margin declared the page is
 * whatever paper the printer driver reports. The app's font definitions come
 * along so any web font the template names resolves the same way it does on
 * screen — only those: the app's own print rules (index.css hides everything
 * outside [data-print-content]) printed this page blank.
 */
function thermalPrintDocument(receipts: string[]): string {
  const styles = fontStyles();
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>Receipt</title>
  ${styles}
  <style>
    @page { margin: 0; }
    html, body { margin: 0 !important; padding: 0 !important; background: #fff !important; }
    body, body * { visibility: visible !important; }
    /* Black bars and rules print as drawn, not dropped as "background graphics". */
    * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .receipt { display: flex; justify-content: flex-start; }
    .copy-break { break-after: page; page-break-after: always; }
  </style>
</head>
<body>${receipts.map((html) => `<div class="receipt">${html}</div>`).join('<div class="copy-break"></div>')}</body>
</html>`;
}

/**
 * Prints the receipts from a hidden iframe through the browser's print dialog.
 * Not a popup: callers often await something first (a payment, the print bridge),
 * by which time the click no longer counts as a user gesture and a popup blocker
 * swallows the window.
 */
async function printReceiptsInDialog(receipts: string[]): Promise<void> {
  const iframe = document.createElement("iframe");
  Object.assign(iframe.style, { position: "fixed", right: "0", bottom: "0", width: "0", height: "0", border: "0" });
  document.body.appendChild(iframe);
  const win = iframe.contentWindow;
  if (!win) {
    iframe.remove();
    return;
  }
  const doc = win.document;
  doc.open();
  doc.write(thermalPrintDocument(receipts));
  doc.close();
  // Print only once the fonts and pictures are in, or the dialog shows a fallback font.
  await Promise.all(Array.from(doc.images).map((img) => img.decode().catch(() => undefined)));
  await doc.fonts?.ready.catch(() => undefined);
  // After the write — opening the document drops listeners already on its window.
  const cleanup = () => iframe.remove();
  win.addEventListener("afterprint", () => setTimeout(cleanup, 0));
  setTimeout(cleanup, 60000);
  win.focus();
  win.print();
}

/**
 * Prints each copy of the receipt — one capture per copy, `renderCopy`
 * re-rendering `node` with that copy's marking, and with the roll the chosen
 * printer takes, first (it must reach the DOM synchronously, e.g. through
 * flushSync). Drawing the receipt for the printer's own width keeps it at full
 * size: a 72 mm receipt shrunk onto a 58 mm roll printed a third smaller than
 * the printer's own type.
 *
 * Goes straight to the receipt printer connected to this PC, through the print
 * bridge, with no print dialog; resolves to that printer's name. The browser's
 * print dialog opens (resolving null) when there is no printer to send to — and
 * when printing fails, unless `onError` takes that over.
 */
export async function printThermalCopies(
  node: HTMLElement,
  copies: Array<string | null>,
  renderCopy: (copy: string | null, paper: PaperSize | null) => void,
  opts: {
    onError?: (message: string) => void;
    /** Printed after the copies in the same print job — the KOT with a bill. Print-dialog path only. */
    after?: HTMLElement[];
  } = {},
): Promise<string | null> {
  const printer = PRINT_BRIDGE_ENABLED ? pickBillPrinter(null, await localReceiptPrinters()) : null;

  if (printer) {
    const canvases: HTMLCanvasElement[] = [];
    try {
      for (const copy of copies) {
        renderCopy(copy, printer.paper_size);
        await awaitPicturesSettled(node);
        canvases.push(await captureThermalCanvas(node));
      }
    } finally {
      renderCopy(null, null);
    }
    try {
      for (const canvas of canvases) await bridgePrint(printer, receiptRaster(canvas, printer.paper_size, printer.cut_mode));
      return printer.printer_name;
    } catch (err) {
      const reason = err instanceof Error ? err.message : "print bridge error";
      if (opts.onError) {
        opts.onError(`${printer.printer_name} — ${reason}`);
        return null;
      }
      console.warn(`Could not print on ${printer.printer_name} — opening the print dialog instead`, err);
    }
  }

  // The print dialog: the template itself, at the width Invoice Settings names —
  // exactly what its preview shows.
  const receipts: string[] = [];
  try {
    for (const copy of copies) {
      renderCopy(copy, null);
      await awaitPicturesSettled(node);
      receipts.push(receiptMarkup(node));
    }
  } finally {
    renderCopy(null, null);
  }
  for (const extra of opts.after ?? []) {
    await awaitPicturesSettled(extra);
    receipts.push(receiptMarkup(extra));
  }
  await printReceiptsInDialog(receipts);
  return null;
}
