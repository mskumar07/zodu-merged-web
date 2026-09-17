import { PAPER_COLUMNS, isPlainAscii, type PaperSize, type Slip } from "./kotTicket";

/**
 * ESC/POS bytes for a KOT slip.
 *
 * Plain-ASCII slips go out as printer text — fastest, sharpest, and every
 * thermal printer speaks it. A slip with characters outside ASCII (Tamil or
 * Hindi item names) can't: printer code pages don't carry those scripts, so it
 * is drawn in the browser and sent as a raster image instead.
 */

const ESC = 0x1b;
const GS = 0x1d;
const LF = 0x0a;

/** Printable dots across the head at 203 dpi: 58 mm → 384, 80 mm → 576, 5" (120 mm) → 960. */
export const PAPER_DOTS: Record<PaperSize, number> = { "2": 384, "3": 576, "5": 960 };

const INIT = [ESC, 0x40];
const CODE_PAGE_PC437 = [ESC, 0x74, 0x00];
const boldOn = (on: boolean) => [ESC, 0x45, on ? 1 : 0];
const charSize = (size: 1 | 2) => [GS, 0x21, size === 2 ? 0x11 : 0x00];

/** What the auto cutter does after a slip: partial cut (leaves a tab), full cut, or no cut to tear by hand. */
export type CutMode = "partial" | "full" | "none";

// Feed 4 lines so the last line clears the cutter, then GS V 65/66 (full/partial cut).
// Without a cut, feed further so the slip clears the tear bar.
const FEED_AND_CUT: Record<CutMode, number[]> = {
  partial: [ESC, 0x64, 0x04, GS, 0x56, 0x42, 0x00],
  full: [ESC, 0x64, 0x04, GS, 0x56, 0x41, 0x00],
  none: [ESC, 0x64, 0x06],
};

function asciiBytes(text: string): number[] {
  const out: number[] = [];
  for (const ch of text) {
    const code = ch.charCodeAt(0);
    out.push(code >= 0x20 && code <= 0x7e ? code : 0x3f);
  }
  return out;
}

export function encodeSlipText(slip: Slip, cut: CutMode = "partial"): Uint8Array {
  const bytes: number[] = [...INIT, ...CODE_PAGE_PC437];
  let bold = false;
  let size: 1 | 2 = 1;
  for (const line of slip.lines) {
    const nextBold = !!line.bold;
    const nextSize = line.size ?? 1;
    if (nextBold !== bold) { bytes.push(...boldOn(nextBold)); bold = nextBold; }
    if (nextSize !== size) { bytes.push(...charSize(nextSize)); size = nextSize; }
    bytes.push(...asciiBytes(line.text), LF);
  }
  bytes.push(...boldOn(false), ...charSize(1), ...(FEED_AND_CUT[cut] ?? FEED_AND_CUT.partial));
  return Uint8Array.from(bytes);
}

/**
 * GS v 0 raster bands from RGBA pixels — 1 bit per dot, MSB first, set = black.
 * Split into bands because many printers cap one raster command's height.
 */
export function packRaster(rgba: Uint8ClampedArray, widthDots: number, heightDots: number, bandRows = 255, cut: CutMode = "partial"): Uint8Array {
  const bytesPerRow = Math.ceil(widthDots / 8);
  const out: number[] = [...INIT];
  for (let top = 0; top < heightDots; top += bandRows) {
    const rows = Math.min(bandRows, heightDots - top);
    out.push(GS, 0x76, 0x30, 0x00, bytesPerRow & 0xff, (bytesPerRow >> 8) & 0xff, rows & 0xff, (rows >> 8) & 0xff);
    for (let y = top; y < top + rows; y++) {
      for (let bx = 0; bx < bytesPerRow; bx++) {
        let byte = 0;
        for (let bit = 0; bit < 8; bit++) {
          const x = bx * 8 + bit;
          if (x >= widthDots) continue;
          const i = (y * widthDots + x) * 4;
          const alpha = rgba[i + 3] / 255;
          const lum = 255 - alpha * (255 - (0.299 * rgba[i] + 0.587 * rgba[i + 1] + 0.114 * rgba[i + 2]));
          if (lum < 160) byte |= 0x80 >> bit;
        }
        out.push(byte);
      }
    }
  }
  out.push(...(FEED_AND_CUT[cut] ?? FEED_AND_CUT.partial));
  return Uint8Array.from(out);
}

/** Draws the slip on a canvas at the head's resolution and packs it as raster. */
export function encodeSlipRaster(slip: Slip, cut: CutMode = "partial"): Uint8Array {
  const widthDots = PAPER_DOTS[slip.paper];
  const cols = PAPER_COLUMNS[slip.paper];
  const cell = widthDots / cols;
  // A monospace glyph is ~0.6em wide, so this font fills one column per character.
  const baseFont = cell / 0.6;
  const lineHeights = slip.lines.map((l) => Math.ceil(baseFont * (l.size === 2 ? 2 : 1) * 1.25));
  const heightDots = lineHeights.reduce((a, b) => a + b, 0) + 8;

  const canvas = document.createElement("canvas");
  canvas.width = widthDots;
  canvas.height = heightDots;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not available to render this KOT");
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, widthDots, heightDots);
  ctx.fillStyle = "#000";
  ctx.textBaseline = "top";

  let y = 4;
  slip.lines.forEach((line, i) => {
    let font = baseFont * (line.size === 2 ? 2 : 1);
    const face = (px: number) => `${line.bold ? "bold " : ""}${px}px "Noto Sans Mono", "Courier New", monospace`;
    ctx.font = face(font);
    // Non-Latin glyphs are wider than a monospace cell; shrink rather than clip.
    const measured = ctx.measureText(line.text).width;
    if (measured > widthDots) {
      font = (font * widthDots) / measured;
      ctx.font = face(font);
    }
    ctx.fillText(line.text, 0, y);
    y += lineHeights[i];
  });

  return packRaster(ctx.getImageData(0, 0, widthDots, heightDots).data, widthDots, heightDots, 255, cut);
}

export function encodeSlip(slip: Slip, cut: CutMode = "partial"): Uint8Array {
  return isPlainAscii(slip) ? encodeSlipText(slip, cut) : encodeSlipRaster(slip, cut);
}

export function toBase64(bytes: Uint8Array): string {
  let binary = "";
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  }
  return btoa(binary);
}
