import html2canvas from "html2canvas";
import jsPDF from "jspdf";

// Tuned for invoice templates that mark a repeating page header with
// [data-pdf-header] / [data-pdf-header-divider], a repeating items-table
// column header with [data-pdf-repeat-thead], and sections that must never be
// sliced across a page boundary with [data-pdf-keep-together].
export const PDF_CAPTURE_SCALE = 1.6;
export const PDF_IMAGE_QUALITY = 0.72;
const PDF_HEADER_GAP_MM = 4;
// Gap between the repeated column header and the first continued table row.
const PDF_THEAD_GAP_MM = 1.5;
// Minimum breathing room reserved at the foot of every page — content is
// sliced short of the full page height by this much so a table row (or the
// footer block) never sits flush against the physical page edge. It's a
// floor, not a fixed gap: trimCanvasBottom below still shrinks the drawn
// image to whatever content actually filled the slice, so a page that ends
// early gets more white space, never less than this.
const PDF_PAGE_BOTTOM_GAP_MM = 14;
// How far ABOVE the ideal page end we're willing to pull the break back to
// land on a blank canvas row. Never search below it: a slice taller than the
// usable page height gets silently clipped by the page edge, which is what
// cuts a table row in half and leaves content flush against the sheet bottom.
const PDF_BREAK_SEARCH_PX = 260;
const PDF_MIN_SLICE_HEIGHT_PX = 40;
// Absorbs the sub-pixel/line-height slack between a keep-together block's
// DOM-measured bottom (captured before html2canvas runs) and the trimmed
// canvas's actual last non-blank row (captured after) — without it, a block
// whose measured end sits even 1px past the trimmed canvas always looks like
// it "doesn't fit" and gets bumped whole to a fresh page, even when there's
// plenty of room.
const PDF_KEEP_TOGETHER_TOLERANCE_PX = 16;
/**
 * How far a document is allowed to be scaled down to keep it on one page.
 *
 * A page holds ~1069 CSS px of content once the bottom gap is reserved, but an
 * A4 sheet is 1123 px tall and an invoice is routinely a little over: the
 * declaration/bank/signature block is a keep-together section, so a document
 * even 20 px too tall moves that whole block to a second page and leaves a
 * third of the first page blank. That reads as a bug — the preview shows one
 * page, the PDF is two, mostly empty.
 *
 * So a document that is close enough is drawn once, scaled to fit. 0.85 caps
 * the shrink at 15%, which takes 11px body text to a still-legible ~9.4px;
 * anything taller than that genuinely needs a second page and gets one.
 */
const PDF_SINGLE_PAGE_MIN_SCALE = 0.85;
const PDF_ROW_WHITE_THRESHOLD = 245;

function isCanvasRowBlank(
  pixels: Uint8ClampedArray,
  width: number,
  row: number,
): boolean {
  const offset = row * width * 4;

  for (let x = 0; x < width; x += 1) {
    const index = offset + x * 4;
    const alpha = pixels[index + 3];

    if (alpha === 0) {
      continue;
    }

    const red = pixels[index];
    const green = pixels[index + 1];
    const blue = pixels[index + 2];

    if (
      red < PDF_ROW_WHITE_THRESHOLD ||
      green < PDF_ROW_WHITE_THRESHOLD ||
      blue < PDF_ROW_WHITE_THRESHOLD
    ) {
      return false;
    }
  }

  return true;
}

/** Drops trailing blank rows — never below `minHeight` px. */
function trimCanvasBottom(canvas: HTMLCanvasElement, minHeight = 0): HTMLCanvasElement {
  const context = canvas.getContext("2d");
  if (!context) {
    return canvas;
  }

  const { width, height } = canvas;
  const pixels = context.getImageData(0, 0, width, height).data;
  let lastContentRow = height - 1;

  while (
    lastContentRow > 0 &&
    lastContentRow + 1 > minHeight &&
    isCanvasRowBlank(pixels, width, lastContentRow)
  ) {
    lastContentRow -= 1;
  }

  const trimmedHeight = Math.max(lastContentRow + 1, 1);
  if (trimmedHeight >= height) {
    return canvas;
  }

  const trimmedCanvas = document.createElement("canvas");
  trimmedCanvas.width = width;
  trimmedCanvas.height = trimmedHeight;

  const trimmedContext = trimmedCanvas.getContext("2d");
  if (!trimmedContext) {
    return canvas;
  }

  trimmedContext.fillStyle = "#ffffff";
  trimmedContext.fillRect(0, 0, width, trimmedHeight);
  trimmedContext.drawImage(
    canvas,
    0,
    0,
    width,
    trimmedHeight,
    0,
    0,
    width,
    trimmedHeight,
  );

  return trimmedCanvas;
}

/** Copies the horizontal band [top, bottom) out of `canvas` onto a white strip. */
function cropCanvasBand(
  canvas: HTMLCanvasElement,
  top: number,
  bottom: number,
): HTMLCanvasElement | null {
  const bandTop = Math.max(0, Math.min(top, canvas.height));
  const bandHeight = Math.max(0, Math.min(bottom, canvas.height) - bandTop);
  if (bandHeight < 1) {
    return null;
  }

  const band = document.createElement("canvas");
  band.width = canvas.width;
  band.height = bandHeight;

  const context = band.getContext("2d");
  if (!context) {
    return null;
  }

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, band.width, band.height);
  context.drawImage(
    canvas,
    0,
    bandTop,
    canvas.width,
    bandHeight,
    0,
    0,
    band.width,
    bandHeight,
  );

  return band;
}

// ── Sharp images ─────────────────────────────────────────────────────
// The page is captured as a 1.6× JPEG — fine for text, but an image such as a
// logo is fine detail (small lettering, curved edges) and came out soft and
// blotchy. So each <img> is left out of that capture and drawn into the PDF on
// its own, from the uploaded file, as a PNG.

// Resolution an image is drawn at, per CSS px of its box: a ~150 px logo
// becomes ~600 px across ~40 mm — well over 300 dpi — without carrying a
// 4000 px original into every PDF.
const PDF_IMAGE_OVERLAY_SCALE = 4;

let overlayAliasSeq = 0;

interface ImageOverlay {
  /** The image's box in the captured canvas, in canvas px. */
  left: number;
  top: number;
  width: number;
  height: number;
  /** The box as the browser shows it (object-fit applied), at overlay resolution. */
  canvas: HTMLCanvasElement;
  dataUrl: string;
  /** Lets jsPDF store the image once however many pages repeat it. */
  alias: string;
}

function loadCorsImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

/**
 * The image at `src` drawn into a canvas the size of its box, fitted the way
 * the browser fits it (object-fit fill / contain / cover). Null when the file
 * can't be read back — served without CORS headers — and the image then stays
 * in the page capture as before.
 */
async function renderImageBox(
  src: string,
  fit: string,
  boxWidth: number,
  boxHeight: number,
): Promise<HTMLCanvasElement | null> {
  if (!src) return null;
  const img = await loadCorsImage(src);
  if (!img || !img.naturalWidth || !img.naturalHeight) return null;

  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(boxWidth * PDF_IMAGE_OVERLAY_SCALE));
  canvas.height = Math.max(1, Math.round(boxHeight * PDF_IMAGE_OVERLAY_SCALE));
  const context = canvas.getContext("2d");
  if (!context) return null;
  context.imageSmoothingQuality = "high";

  let drawWidth = canvas.width;
  let drawHeight = canvas.height;
  if (fit === "contain" || fit === "scale-down" || fit === "cover") {
    const scaleX = canvas.width / img.naturalWidth;
    const scaleY = canvas.height / img.naturalHeight;
    const scale = fit === "cover" ? Math.max(scaleX, scaleY) : Math.min(scaleX, scaleY);
    drawWidth = img.naturalWidth * scale;
    drawHeight = img.naturalHeight * scale;
  }
  context.drawImage(img, (canvas.width - drawWidth) / 2, (canvas.height - drawHeight) / 2, drawWidth, drawHeight);

  try {
    context.getImageData(0, 0, 1, 1); // throws on a tainted canvas
  } catch {
    return null;
  }
  return canvas;
}

/** Every visible, loaded <img> in `container`, keyed by its index among the container's <img>s. */
async function collectImageOverlays(
  container: HTMLElement,
  containerRect: DOMRect,
): Promise<Map<number, ImageOverlay>> {
  const overlays = new Map<number, ImageOverlay>();
  const jobs = Array.from(container.querySelectorAll("img"), (el, index) => {
    // Measured now, before any await, along with the rest of the layout.
    const rect = el.getBoundingClientRect();
    const fit = getComputedStyle(el).objectFit;
    if (!el.complete || rect.width < 1 || rect.height < 1) return Promise.resolve();
    return renderImageBox(el.currentSrc || el.src, fit, rect.width, rect.height).then((canvas) => {
      if (!canvas) return;
      overlays.set(index, {
        left: (rect.left - containerRect.left) * PDF_CAPTURE_SCALE,
        top: (rect.top - containerRect.top) * PDF_CAPTURE_SCALE,
        width: rect.width * PDF_CAPTURE_SCALE,
        height: rect.height * PDF_CAPTURE_SCALE,
        canvas,
        dataUrl: canvas.toDataURL("image/png"),
        alias: `pdf-image-${++overlayAliasSeq}`,
      });
    });
  });
  await Promise.all(jobs);
  return overlays;
}

/** html2canvas onclone hook leaving the overlaid images out of the capture (their space kept). */
function hideOverlaidImages(overlays: Map<number, ImageOverlay>) {
  return (_doc: Document, clone: HTMLElement) => {
    clone.querySelectorAll("img").forEach((img, index) => {
      if (overlays.has(index)) img.style.visibility = "hidden";
    });
  };
}

/**
 * Draws the part of each image that falls in canvas rows [bandTop, bandBottom)
 * — one page's slice of the capture — with that band's top at (x0, y0) mm.
 */
function drawImageOverlays(
  pdf: jsPDF,
  overlays: Map<number, ImageOverlay>,
  bandTop: number,
  bandBottom: number,
  x0: number,
  y0: number,
  mmPerPx: number,
) {
  for (const o of overlays.values()) {
    const top = Math.max(o.top, bandTop);
    const bottom = Math.min(o.top + o.height, bandBottom);
    if (bottom - top < 1) continue;

    let data = o.dataUrl;
    let alias: string | undefined = o.alias;
    if (top !== o.top || bottom !== o.top + o.height) {
      // An image a page break runs through — only its rows in this band.
      const ratio = o.canvas.height / o.height;
      const part = cropCanvasBand(o.canvas, Math.round((top - o.top) * ratio), Math.round((bottom - o.top) * ratio));
      if (!part) continue;
      data = part.toDataURL("image/png");
      alias = undefined;
    }
    pdf.addImage(
      data,
      "PNG",
      x0 + o.left * mmPerPx,
      y0 + (top - bandTop) * mmPerPx,
      o.width * mmPerPx,
      (bottom - top) * mmPerPx,
      alias,
      "FAST",
    );
  }
}

function findSafeSliceHeight(
  canvas: HTMLCanvasElement,
  sourceY: number,
  targetHeight: number,
  minHeight: number,
): number {
  const context = canvas.getContext("2d");
  if (!context) {
    return targetHeight;
  }

  const maxHeight = Math.min(targetHeight, canvas.height - sourceY);
  // This slice already reaches the end of the content — there is nothing
  // after it to defer to another page, so take the whole remainder as-is.
  // Hunting for a "clean" blank-row break here would needlessly truncate
  // trailing content (e.g. the declaration/bank/footer block) onto a wasted
  // extra page even though it fits, since a short invoice's total height is
  // routinely well under one page and any incidental whitespace between
  // sections would otherwise be mistaken for a real page-break candidate.
  if (maxHeight <= minHeight || sourceY + maxHeight >= canvas.height) {
    return maxHeight;
  }

  const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
  const idealEnd = sourceY + maxHeight;
  // Search strictly UPWARD from the ideal page end. Looking past it would hand
  // back a slice taller than the page can hold, and jsPDF clips that overflow
  // at the sheet edge — slicing whatever row straddles the boundary in half.
  const searchEnd = Math.min(idealEnd, canvas.height - 1);
  const searchStart = Math.max(sourceY + minHeight, idealEnd - PDF_BREAK_SEARCH_PX);

  for (let row = searchEnd; row >= searchStart; row -= 1) {
    if (isCanvasRowBlank(pixels, canvas.width, row)) {
      return Math.min(Math.max(row - sourceY, minHeight), maxHeight);
    }
  }

  return maxHeight;
}

/**
 * Renders `container` into a multi-page A4 jsPDF document. Page breaks are
 * nudged to land on a blank canvas row and never cut through a
 * [data-pdf-keep-together] block, so a table row, the totals summary, or the
 * footer never gets sliced in half across two pages. A repeating header
 * (marked by [data-pdf-header] / [data-pdf-header-divider]) is stamped on
 * every page after the first, and while the items table is still running its
 * column-header row ([data-pdf-repeat-thead]) is stamped underneath so
 * continued rows stay labelled.
 */
export async function renderPaginatedInvoicePdf(
  container: HTMLElement,
  // When given, pages are appended to this document instead of a fresh one —
  // lets several invoice copies (Original, Duplicate, …) end up in one file.
  appendTo?: jsPDF | null,
): Promise<jsPDF | null> {
  const headerEl = container.querySelector("[data-pdf-header]") as HTMLElement | null;
  const headerDividerEl = container.querySelector("[data-pdf-header-divider]") as HTMLElement | null;
  const theadEl = container.querySelector("[data-pdf-repeat-thead]") as HTMLElement | null;
  const keepTogetherEls = Array.from(
    container.querySelectorAll("[data-pdf-keep-together]"),
  ) as HTMLElement[];

  // Measure positions BEFORE html2canvas — DOM layout must still be intact
  const containerRect = container.getBoundingClientRect();
  const toCanvasY = (clientY: number) =>
    Math.round((clientY - containerRect.top) * PDF_CAPTURE_SCALE);

  const keepTogetherRanges = keepTogetherEls.map((el) => {
    const elRect = el.getBoundingClientRect();
    return {
      start: toCanvasY(elRect.top),
      end: toCanvasY(elRect.bottom),
    };
  });

  let theadBottomPx = 0;
  let itemsTableBottomPx = 0;
  let theadTopPx = 0;
  if (theadEl) {
    const theadRect = theadEl.getBoundingClientRect();
    theadTopPx = toCanvasY(theadRect.top);
    theadBottomPx = toCanvasY(theadRect.bottom);
    const tableEl = theadEl.closest("table");
    itemsTableBottomPx = tableEl
      ? toCanvasY(tableEl.getBoundingClientRect().bottom)
      : theadBottomPx;
  }

  // Images go into the PDF on their own, sharp — measured here with the rest of
  // the layout, never split by a page break, and left out of the capture.
  const overlays = await collectImageOverlays(container, containerRect);
  for (const o of overlays.values()) {
    keepTogetherRanges.push({ start: Math.round(o.top), end: Math.round(o.top + o.height) });
  }
  const overlayBottomPx = Math.max(0, ...Array.from(overlays.values(), (o) => Math.ceil(o.top + o.height)));

  const capturedCanvas = await html2canvas(container, {
    scale: PDF_CAPTURE_SCALE,
    useCORS: true,
    backgroundColor: "#ffffff",
    logging: false,
    onclone: hideOverlaidImages(overlays),
  });
  // An image at the very bottom is blank in the capture — don't trim it away.
  const canvas = trimCanvasBottom(capturedCanvas, overlayBottomPx);

  let headerImgData: string | null = null;
  let headerHeightPx = 0;

  if (headerEl) {
    const headerRect = headerEl.getBoundingClientRect();
    const dividerRect = headerDividerEl?.getBoundingClientRect();
    const dividerBottom = dividerRect ? dividerRect.bottom : headerRect.bottom;
    // Measure from the container's top (not the header element's top) so the
    // copy from canvas y=0 correctly includes the page's top padding and the
    // accent divider line is fully captured in the repeating header.
    const headerBand = cropCanvasBand(canvas, 0, Math.max(1, toCanvasY(dividerBottom)));
    if (headerBand) {
      headerHeightPx = headerBand.height;
      headerImgData = headerBand.toDataURL("image/jpeg", PDF_IMAGE_QUALITY);
    }
  }

  let theadImgData: string | null = null;
  let theadHeightPx = 0;

  if (theadEl && theadBottomPx > theadTopPx) {
    const theadBand = cropCanvasBand(canvas, theadTopPx, theadBottomPx);
    if (theadBand) {
      theadHeightPx = theadBand.height;
      theadImgData = theadBand.toDataURL("image/jpeg", PDF_IMAGE_QUALITY);
    }
  }

  const pdf = appendTo ?? new jsPDF({
    orientation: "p",
    unit: "mm",
    format: "a4",
    compress: true,
  });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const pxPerMm = canvas.width / pageWidth;
  const toMm = (px: number) => px / pxPerMm;

  const pageBottomGapPx = Math.max(0, Math.round(PDF_PAGE_BOTTOM_GAP_MM * pxPerMm));
  const renderedPageHeightPx = Math.max(
    1,
    Math.floor(pageHeight * pxPerMm) - pageBottomGapPx,
  );
  const headerHeightMm = headerImgData ? toMm(headerHeightPx) : 0;
  const theadHeightMm = theadImgData ? toMm(theadHeightPx) : 0;
  const headerGapPx = headerImgData ? Math.max(0, Math.round(PDF_HEADER_GAP_MM * pxPerMm)) : 0;
  const theadGapPx = theadImgData ? Math.max(0, Math.round(PDF_THEAD_GAP_MM * pxPerMm)) : 0;
  const headerOverheadPx = headerImgData ? headerHeightPx + headerGapPx : 0;
  const headerOverheadMm = headerImgData ? headerHeightMm + PDF_HEADER_GAP_MM : 0;

  // ── Single-page rescue ───────────────────────────────────────────────
  // Before paginating at all: if the whole document is only slightly taller
  // than one page, scale it down onto a single page instead of spilling a
  // near-empty second one. Both dimensions scale together, so nothing is
  // distorted — the page simply gains a little side margin.
  if (
    canvas.height > renderedPageHeightPx &&
    canvas.height <= renderedPageHeightPx / PDF_SINGLE_PAGE_MIN_SCALE
  ) {
    const fitScale = renderedPageHeightPx / canvas.height;
    const imgWidthMm = pageWidth * fitScale;
    const imgHeightMm = toMm(canvas.height) * fitScale;
    const imgData = canvas.toDataURL("image/jpeg", PDF_IMAGE_QUALITY);

    if (appendTo) {
      pdf.addPage();
    }
    pdf.addImage(
      imgData,
      "JPEG",
      (pageWidth - imgWidthMm) / 2,
      0,
      imgWidthMm,
      imgHeightMm,
      undefined,
      "MEDIUM",
    );
    drawImageOverlays(pdf, overlays, 0, canvas.height, (pageWidth - imgWidthMm) / 2, 0, fitScale / pxPerMm);
    return pdf;
  }

  for (let sourceY = 0, pageIndex = 0; sourceY < canvas.height; pageIndex += 1) {
    const isFirstPage = pageIndex === 0;
    // Repeat the items-table column header only while the table itself is
    // still running — once only the totals/footer are left, a stray header
    // row would be nonsense.
    const repeatThead =
      !isFirstPage &&
      !!theadImgData &&
      sourceY >= theadBottomPx &&
      sourceY < itemsTableBottomPx;
    const theadOverheadPx = repeatThead ? theadHeightPx + theadGapPx : 0;
    const theadOverheadMm = repeatThead ? theadHeightMm + PDF_THEAD_GAP_MM : 0;

    const targetSliceHeight = isFirstPage
      ? renderedPageHeightPx
      : Math.max(1, renderedPageHeightPx - headerOverheadPx - theadOverheadPx);

    let sliceHeight = findSafeSliceHeight(
      canvas,
      sourceY,
      targetSliceHeight,
      Math.min(PDF_MIN_SLICE_HEIGHT_PX, targetSliceHeight),
    );

    // If a keep-together section (a table row, the summary block, or the
    // declaration + bank + footer block) would be split across pages, end the
    // current page just before it starts so the whole block lands on the next
    // page together.
    // Only trigger when the section does NOT fully fit in the space
    // remaining after its start point — if it fits, let it stay as-is.
    for (const range of keepTogetherRanges) {
      if (range.start > sourceY + PDF_MIN_SLICE_HEIGHT_PX &&
          range.start < sourceY + sliceHeight) {
        // Clamp to canvas.height — range.end was measured on the live DOM
        // before capture, but trimCanvasBottom may have since shaved a few
        // blank rows (line-height/padding below the last glyph) off the
        // bottom of the actual capture. Without this clamp, the last
        // keep-together block in the document can measure as "longer" than
        // the canvas it must fit inside, so it always fails the fit check.
        const sectionHeight = Math.min(range.end, canvas.height) - range.start;
        const spaceAfterStart = sourceY + sliceHeight - range.start;
        if (sectionHeight > spaceAfterStart + PDF_KEEP_TOGETHER_TOLERANCE_PX) {
          sliceHeight = range.start - sourceY;
        }
      }
    }

    if (sliceHeight <= 0) {
      break;
    }

    const remainingHeight = canvas.height - sourceY;
    if (pageIndex > 0 && remainingHeight <= PDF_MIN_SLICE_HEIGHT_PX) {
      break;
    }

    const pageCanvas = cropCanvasBand(canvas, sourceY, sourceY + sliceHeight);
    if (!pageCanvas) {
      break;
    }

    const trimmedPageCanvas = trimCanvasBottom(pageCanvas);
    // A slice that's blank only because its image was left out of the capture still prints.
    const sliceHasImage = Array.from(overlays.values()).some(
      (o) => o.top < sourceY + sliceHeight && o.top + o.height > sourceY,
    );
    if (trimmedPageCanvas.height <= 1 && pageIndex > 0 && !sliceHasImage) {
      break;
    }

    const imgData = trimmedPageCanvas.toDataURL("image/jpeg", PDF_IMAGE_QUALITY);
    const sliceHeightMm = toMm(trimmedPageCanvas.height);

    // Appending into an existing document needs a page break before its first
    // page too — that document already has content on its current page.
    if (pageIndex > 0 || appendTo) {
      pdf.addPage();
    }

    let cursorMm = 0;
    if (!isFirstPage && headerImgData) {
      pdf.addImage(headerImgData, "JPEG", 0, 0, pageWidth, headerHeightMm, undefined, "MEDIUM");
      drawImageOverlays(pdf, overlays, 0, headerHeightPx, 0, 0, 1 / pxPerMm);
      cursorMm = headerOverheadMm;
    }

    if (repeatThead && theadImgData) {
      pdf.addImage(theadImgData, "JPEG", 0, cursorMm, pageWidth, theadHeightMm, undefined, "MEDIUM");
      cursorMm += theadOverheadMm;
    }

    pdf.addImage(
      imgData,
      "JPEG",
      0,
      cursorMm,
      pageWidth,
      sliceHeightMm,
      undefined,
      "MEDIUM",
    );
    drawImageOverlays(pdf, overlays, sourceY, sourceY + sliceHeight, 0, cursorMm, 1 / pxPerMm);

    sourceY += sliceHeight;
  }

  return pdf;
}

/**
 * Renders a thermal receipt into a PDF shaped like the roll it prints on: one
 * page the full roll width and exactly as tall as the receipt, with the
 * receipt (laid out at the printable width) centred on it — no A4 margins, no
 * page break through the middle of a bill, and printed as-is it lands inside
 * the head's printable band. Pass `appendTo` to add this receipt as a further
 * page (several copies — Original, Duplicate, … — in one file).
 */
export async function renderThermalReceiptPdf(
  container: HTMLElement,
  rollMm: number,
  printableMm: number,
  appendTo?: jsPDF | null,
): Promise<jsPDF> {
  const overlays = await collectImageOverlays(container, container.getBoundingClientRect());
  const canvas = await html2canvas(container, {
    scale: PDF_CAPTURE_SCALE,
    useCORS: true,
    backgroundColor: "#ffffff",
    logging: false,
    onclone: hideOverlaidImages(overlays),
  });
  const heightMm = (canvas.height / canvas.width) * printableMm;
  const format: [number, number] = [rollMm, heightMm];
  // jsPDF swaps a [w, h] format to match the orientation, so a receipt shorter
  // than it is wide needs "l" to keep its width.
  const orientation = heightMm >= rollMm ? "p" : "l";

  const pdf = appendTo ?? new jsPDF({ orientation, unit: "mm", format, compress: true });
  if (appendTo) {
    pdf.addPage(format, orientation);
  }
  pdf.addImage(
    canvas.toDataURL("image/jpeg", PDF_IMAGE_QUALITY),
    "JPEG",
    (rollMm - printableMm) / 2,
    0,
    printableMm,
    heightMm,
    undefined,
    "MEDIUM",
  );
  drawImageOverlays(pdf, overlays, 0, canvas.height, (rollMm - printableMm) / 2, 0, printableMm / canvas.width);
  return pdf;
}
