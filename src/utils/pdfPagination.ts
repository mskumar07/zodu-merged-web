import html2canvas from "html2canvas";
import jsPDF from "jspdf";

// Tuned for invoice templates that mark a repeating page header with
// [data-pdf-header] / [data-pdf-header-divider], and sections that must
// never be sliced across a page boundary with [data-pdf-keep-together].
export const PDF_CAPTURE_SCALE = 1.6;
export const PDF_IMAGE_QUALITY = 0.72;
const PDF_HEADER_GAP_MM = 4;
const PDF_PAGE_BOTTOM_GAP_MM = 10;
const PDF_BREAK_SEARCH_PX = 96;
const PDF_MIN_SLICE_HEIGHT_PX = 40;
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
  if (maxHeight <= minHeight) {
    return maxHeight;
  }

  const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
  const idealEnd = sourceY + maxHeight;
  const searchStart = Math.max(sourceY + minHeight, idealEnd - PDF_BREAK_SEARCH_PX);
  const searchEnd = Math.min(canvas.height - 1, idealEnd + PDF_BREAK_SEARCH_PX);

  for (let row = Math.min(searchEnd, canvas.height - 1); row >= searchStart; row -= 1) {
    if (isCanvasRowBlank(pixels, canvas.width, row)) {
      return Math.max(row - sourceY, minHeight);
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
 * every page after the first.
 */
export async function renderPaginatedInvoicePdf(
  container: HTMLElement,
): Promise<jsPDF | null> {
  const headerEl = container.querySelector("[data-pdf-header]") as HTMLElement | null;
  const headerDividerEl = container.querySelector("[data-pdf-header-divider]") as HTMLElement | null;
  const keepTogetherEls = Array.from(
    container.querySelectorAll("[data-pdf-keep-together]"),
  ) as HTMLElement[];

  // Measure positions BEFORE html2canvas — DOM layout must still be intact
  const containerRect = container.getBoundingClientRect();
  const keepTogetherRanges = keepTogetherEls.map((el) => {
    const elRect = el.getBoundingClientRect();
    return {
      start: Math.round((elRect.top - containerRect.top) * PDF_CAPTURE_SCALE),
      end: Math.round((elRect.bottom - containerRect.top) * PDF_CAPTURE_SCALE),
    };
  });

  const capturedCanvas = await html2canvas(container, {
    scale: PDF_CAPTURE_SCALE,
    useCORS: true,
    backgroundColor: "#ffffff",
    logging: false,
  });
  const canvas = trimCanvasBottom(capturedCanvas);

  let headerCanvas: HTMLCanvasElement | null = null;
  let headerImgData: string | null = null;
  let headerHeightPx = 0;

  if (headerEl) {
    const headerRect = headerEl.getBoundingClientRect();
    const dividerRect = headerDividerEl?.getBoundingClientRect();
    const dividerBottom = dividerRect ? dividerRect.bottom : headerRect.bottom;
    // Measure from the container's top (not the header element's top) so the
    // copy from canvas y=0 correctly includes the page's top padding and the
    // red divider line is fully captured in the repeating header.
    headerHeightPx = Math.max(1, Math.round((dividerBottom - containerRect.top) * PDF_CAPTURE_SCALE));

    headerCanvas = document.createElement("canvas");
    headerCanvas.width = canvas.width;
    headerCanvas.height = headerHeightPx;

    const headerContext = headerCanvas.getContext("2d");
    if (!headerContext) return null;

    headerContext.fillStyle = "#ffffff";
    headerContext.fillRect(0, 0, headerCanvas.width, headerCanvas.height);
    headerContext.drawImage(
      canvas,
      0,
      0,
      canvas.width,
      headerHeightPx,
      0,
      0,
      headerCanvas.width,
      headerCanvas.height,
    );

    headerImgData = headerCanvas.toDataURL("image/jpeg", PDF_IMAGE_QUALITY);
  }

  const pdf = new jsPDF({
    orientation: "p",
    unit: "mm",
    format: "a4",
    compress: true,
  });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const pageBottomGapPx = Math.max(0, Math.round((PDF_PAGE_BOTTOM_GAP_MM * canvas.width) / pageWidth));
  const renderedPageHeightPx = Math.max(
    1,
    Math.floor((canvas.width * pageHeight) / pageWidth) - pageBottomGapPx,
  );
  const headerHeightMm = headerCanvas ? (headerCanvas.height * pageWidth) / headerCanvas.width : 0;
  const headerGapPx = headerCanvas
    ? Math.max(0, Math.round((PDF_HEADER_GAP_MM * canvas.width) / pageWidth))
    : 0;
  const laterPageContentHeightPx = headerCanvas
    ? Math.max(1, renderedPageHeightPx - headerHeightPx - headerGapPx)
    : renderedPageHeightPx;

  for (let sourceY = 0, pageIndex = 0; sourceY < canvas.height; pageIndex += 1) {
    const isFirstPage = pageIndex === 0;
    const targetSliceHeight = isFirstPage ? renderedPageHeightPx : laterPageContentHeightPx;
    let sliceHeight = findSafeSliceHeight(
      canvas,
      sourceY,
      targetSliceHeight,
      Math.min(PDF_MIN_SLICE_HEIGHT_PX, targetSliceHeight),
    );

    // If a keep-together section (e.g. the summary block, or the
    // declaration + bank + footer block) would be split across pages, end
    // the current page just before it starts so the whole block lands on
    // the next page together.
    // Only trigger when the section does NOT fully fit in the space
    // remaining after its start point — if it fits, let it stay as-is.
    for (const range of keepTogetherRanges) {
      if (range.start > sourceY + PDF_MIN_SLICE_HEIGHT_PX &&
          range.start < sourceY + sliceHeight) {
        const sectionHeight = range.end - range.start;
        const spaceAfterStart = sourceY + sliceHeight - range.start;
        if (sectionHeight > spaceAfterStart) {
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

    const pageCanvas = document.createElement("canvas");
    pageCanvas.width = canvas.width;
    pageCanvas.height = sliceHeight;

    const pageContext = pageCanvas.getContext("2d");
    if (!pageContext) return null;

    pageContext.fillStyle = "#ffffff";
    pageContext.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
    pageContext.drawImage(
      canvas,
      0,
      sourceY,
      canvas.width,
      sliceHeight,
      0,
      0,
      pageCanvas.width,
      pageCanvas.height,
    );

    const trimmedPageCanvas = trimCanvasBottom(pageCanvas);
    if (trimmedPageCanvas.height <= 1 && pageIndex > 0) {
      break;
    }

    const imgData = trimmedPageCanvas.toDataURL("image/jpeg", PDF_IMAGE_QUALITY);
    const sliceHeightMm = (trimmedPageCanvas.height * pageWidth) / trimmedPageCanvas.width;

    if (pageIndex > 0) {
      pdf.addPage();
    }

    if (!isFirstPage && headerCanvas && headerImgData) {
      pdf.addImage(headerImgData, "JPEG", 0, 0, pageWidth, headerHeightMm, undefined, "MEDIUM");
    }

    pdf.addImage(
      imgData,
      "JPEG",
      0,
      isFirstPage ? 0 : headerHeightMm + PDF_HEADER_GAP_MM,
      pageWidth,
      sliceHeightMm,
      undefined,
      "MEDIUM",
    );

    sourceY += sliceHeight;
  }

  return pdf;
}
