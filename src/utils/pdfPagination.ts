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

function trimCanvasBottom(canvas: HTMLCanvasElement): HTMLCanvasElement {
  const context = canvas.getContext("2d");
  if (!context) {
    return canvas;
  }

  const { width, height } = canvas;
  const pixels = context.getImageData(0, 0, width, height).data;
  let lastContentRow = height - 1;

  while (lastContentRow > 0 && isCanvasRowBlank(pixels, width, lastContentRow)) {
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

  const capturedCanvas = await html2canvas(container, {
    scale: PDF_CAPTURE_SCALE,
    useCORS: true,
    backgroundColor: "#ffffff",
    logging: false,
  });
  const canvas = trimCanvasBottom(capturedCanvas);

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
    if (trimmedPageCanvas.height <= 1 && pageIndex > 0) {
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

    sourceY += sliceHeight;
  }

  return pdf;
}
