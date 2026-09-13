import html2canvas from "html2canvas";
import type { ThermalPaperSize } from "@pages/SalesHistory/ThermalInvoiceTemplate";

/**
 * Printing a thermal receipt on whatever roll is actually loaded.
 *
 * The receipt is laid out at the width Invoice Settings names (3" → 72 mm),
 * but the printer on the counter may take a different roll — a 5" receipt sent
 * to a 3" printer lost everything past 72 mm. So the receipt is captured as an
 * image and printed across the width of whatever paper the printer reports,
 * which scales it to fit: full size on the matching printer, shrunk on a
 * narrower one.
 */

/** Roll widths, and the band a thermal head prints on each — for the PDF download. */
export const THERMAL_ROLL_MM: Record<ThermalPaperSize, number> = { "3": 80, "4": 104, "5": 130 };
export const THERMAL_PRINTABLE_MM: Record<ThermalPaperSize, number> = { "3": 72, "4": 96, "5": 120 };

// 3× gives the image more pixels across than a thermal head has dots (576 on a
// 3" head, 832 on a 4"), so it stays sharp once scaled to the paper.
const CAPTURE_SCALE = 3;

/** The rendered receipt as a PNG — not JPEG, so text edges stay clean on the head. */
export async function captureThermalReceipt(node: HTMLElement): Promise<string> {
  const canvas = await html2canvas(node, {
    scale: CAPTURE_SCALE,
    useCORS: true,
    backgroundColor: "#ffffff",
    logging: false,
    // The receipt is rendered off-screen inside a transparent wrapper; undo
    // that on the clone so the capture isn't blank.
    onclone: (_doc, el) => {
      for (let p = el.parentElement; p; p = p.parentElement) p.style.opacity = "1";
    },
  });
  return canvas.toDataURL("image/png");
}

/**
 * No page size is declared, so the page is whatever paper the printer driver
 * reports; each image fills its width less 4 mm a side — the strip a thermal
 * head can't reach (an 80 mm roll prints 72 mm).
 */
function thermalPrintDocument(images: string[]): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>Receipt</title>
  <style>
    @page { margin: 0; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #fff; padding: 0 4mm; }
    img { display: block; width: 100%; height: auto; }
    .copy-break { break-after: page; page-break-after: always; }
  </style>
</head>
<body>${images.map((src) => `<img src="${src}" alt=""/>`).join('<div class="copy-break"></div>')}</body>
</html>`;
}

/** Writes the receipt images into `win` and resolves once they've decoded, ready to print. */
export async function writeThermalPrint(win: Window, images: string[]): Promise<void> {
  const doc = win.document;
  doc.open();
  doc.write(thermalPrintDocument(images));
  doc.close();
  await Promise.all(Array.from(doc.images).map((img) => img.decode().catch(() => undefined)));
}

/**
 * Prints each copy of the receipt from a popup window — one capture per copy,
 * `renderCopy` re-rendering `node` with that copy's marking first (it must
 * reach the DOM synchronously, e.g. through flushSync). Call it straight from
 * the click: the popup opens before any await, while the click still counts
 * as a user gesture.
 */
export async function printThermalCopies(
  node: HTMLElement,
  copies: Array<string | null>,
  renderCopy: (copy: string | null) => void,
): Promise<void> {
  const win = window.open("", "_blank", "width=500,height=700");
  if (!win) return;
  const images: string[] = [];
  try {
    for (const copy of copies) {
      renderCopy(copy);
      images.push(await captureThermalReceipt(node));
    }
  } catch (err) {
    win.close();
    throw err;
  } finally {
    renderCopy(null);
  }
  await writeThermalPrint(win, images);
  win.focus();
  win.print();
  win.close();
}
