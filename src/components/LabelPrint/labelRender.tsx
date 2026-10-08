import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import QRCode from 'react-qr-code';
import JsBarcode from 'jsbarcode';

// ─── Types ────────────────────────────────────────────────────

export type CodeType = 'qr' | 'code128' | 'ean13';
export type LabelType = 1 | 2;

export interface LabelOptions {
  showCode: boolean;
  showName: boolean;
  showPrice: boolean;
  showCategory: boolean;
  showLogo: boolean;
  showBorder: boolean;
}

export interface LabelSize { id: string; label: string; w: number; h: number }

export interface LabelItem {
  /** Value encoded in the QR / barcode and printed as the item code. */
  code: string;
  /** Numeric barcode on the item, preferred for EAN-13. */
  barcode?: string | null;
  name: string;
  price: number;
  category?: string | null;
}

export const LABEL_SIZES: LabelSize[] = [
  { id: '40x30', label: '40 mm x 30 mm', w: 40, h: 30 },
  { id: '50x30', label: '50 mm x 30 mm', w: 50, h: 30 },
  { id: '50x25', label: '50 mm x 25 mm', w: 50, h: 25 },
  { id: '38x25', label: '38 mm x 25 mm', w: 38, h: 25 },
  { id: '60x40', label: '60 mm x 40 mm', w: 60, h: 40 },
  { id: '100x50', label: '100 mm x 50 mm', w: 100, h: 50 },
];

export const DEFAULT_LABEL_OPTIONS: LabelOptions = {
  showCode: true, showName: true, showPrice: true,
  showCategory: false, showLogo: false, showBorder: false,
};

// ─── Barcode SVG (cached) ─────────────────────────────────────

const barcodeCache = new Map<string, string | null>();

/** Returns a stretchable SVG string, or null when the value is invalid for the format. */
function barcodeSvg(value: string, format: 'CODE128' | 'EAN13'): string | null {
  const key = `${format}|${value}`;
  if (barcodeCache.has(key)) return barcodeCache.get(key)!;
  let out: string | null = null;
  try {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    JsBarcode(svg, value, { format, displayValue: false, margin: 0, width: 2, height: 60 });
    const w = svg.getAttribute('width')?.replace('px', '');
    const h = svg.getAttribute('height')?.replace('px', '');
    if (w && h && !svg.getAttribute('viewBox')) svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
    svg.removeAttribute('width');
    svg.removeAttribute('height');
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.setAttribute('style', 'width:100%;height:100%;display:block');
    out = svg.outerHTML;
  } catch {
    out = null;
  }
  barcodeCache.set(key, out);
  return out;
}

const isEan13Value = (v?: string | null) => !!v && /^\d{12,13}$/.test(v);

// ─── Label view (shared by the preview and the print output) ──

interface LabelViewProps {
  item: LabelItem;
  codeType: CodeType;
  labelType: LabelType;
  options: LabelOptions;
  size: LabelSize;
  logoUrl?: string;
}

const fmtPrice = (n: number) =>
  `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function CodeGraphic({ item, codeType, boxW, boxH }: {
  item: LabelItem; codeType: CodeType; boxW: number; boxH: number;
}) {
  const box: React.CSSProperties = {
    width: `${boxW}mm`, height: `${boxH}mm`, flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  };
  if (codeType === 'qr') {
    const side = Math.min(boxW, boxH);
    return (
      <div style={box}>
        <QRCode value={item.code || ' '} size={256} level="M"
          style={{ width: `${side}mm`, height: `${side}mm` }} />
      </div>
    );
  }
  const value = codeType === 'ean13'
    ? (isEan13Value(item.barcode) ? item.barcode! : isEan13Value(item.code) ? item.code : '')
    : (item.barcode || item.code);
  const svg = value ? barcodeSvg(value, codeType === 'ean13' ? 'EAN13' : 'CODE128') : null;
  if (!svg) {
    return <div style={{ ...box, fontSize: '2mm', color: '#b91c1c', textAlign: 'center' }}>
      {codeType === 'ean13' ? 'No valid EAN-13' : 'Invalid code'}
    </div>;
  }
  // Barcodes are wide and flat, so they take 70% of the box height.
  return <div style={{ ...box, height: `${boxH * 0.7}mm` }}
    dangerouslySetInnerHTML={{ __html: svg }} />;
}

export const LabelView = React.memo(function LabelView(
  { item, codeType, labelType, options, size, logoUrl }: LabelViewProps,
) {
  const { w, h } = size;
  const pad = Math.max(1, h * 0.06);
  const innerW = w - pad * 2;
  const innerH = h - pad * 2;
  const horizontal = labelType === 2;

  // Type 2: code on the left, text on the right. Type 1: code on top, text below.
  const codeW = horizontal ? Math.min(innerH, innerW * 0.45) : innerW;
  const codeH = horizontal ? innerH : innerH * 0.55;
  const fs = Math.max(1.8, h * 0.08);

  const text: React.CSSProperties = {
    margin: 0, lineHeight: 1.15, overflow: 'hidden', color: '#000',
    fontFamily: 'Arial, Helvetica, sans-serif', wordBreak: 'break-word',
  };

  return (
    <div style={{
      width: `${w}mm`, height: `${h}mm`, boxSizing: 'border-box', padding: `${pad}mm`,
      background: '#fff', overflow: 'hidden', display: 'flex',
      flexDirection: horizontal ? 'row' : 'column', alignItems: 'center', gap: `${pad}mm`,
    }}>
      <CodeGraphic item={item} codeType={codeType} boxW={codeW} boxH={codeH} />
      <div style={{
        flex: 1, minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column',
        justifyContent: 'center', gap: `${h * 0.015}mm`,
        textAlign: horizontal ? 'left' : 'center', width: horizontal ? undefined : '100%',
      }}>
        {options.showLogo && logoUrl && (
          <img src={logoUrl} alt="" style={{
            height: `${h * 0.14}mm`, maxWidth: '100%', objectFit: 'contain',
            alignSelf: horizontal ? 'flex-start' : 'center',
          }} />
        )}
        {options.showCode && (
          <p style={{ ...text, fontSize: `${fs}mm`, fontWeight: 700 }}>{item.code}</p>
        )}
        {options.showName && (
          <p style={{
            ...text, fontSize: `${fs}mm`, display: '-webkit-box',
            WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          }}>{item.name}</p>
        )}
        {options.showCategory && item.category && (
          <p style={{ ...text, fontSize: `${fs * 0.85}mm`, color: '#444' }}>{item.category}</p>
        )}
        {options.showPrice && (
          <p style={{ ...text, fontSize: `${fs * 1.1}mm`, fontWeight: 700 }}>{fmtPrice(item.price)}</p>
        )}
      </div>
    </div>
  );
});

// ─── Print ────────────────────────────────────────────────────

/** Prints one label per page through a hidden iframe, so no popup is needed. */
export async function printLabels(
  items: LabelItem[],
  props: Omit<LabelViewProps, 'item'>,
): Promise<void> {
  if (!items.length) return;
  const { w, h } = props.size;
  const body = items
    .map((item) => `<div class="page">${renderToStaticMarkup(<LabelView {...props} item={item} />)}</div>`)
    .join('');

  const iframe = document.createElement('iframe');
  iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden';
  document.body.appendChild(iframe);
  const doc = iframe.contentDocument!;
  doc.open();
  doc.write(`<!doctype html><html><head><meta charset="utf-8"><title>Labels</title>
<style>
  @page { size: ${w}mm ${h}mm; margin: 0; }
  * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  html, body { margin: 0; padding: 0; }
  .page { width: ${w}mm; height: ${h}mm; overflow: hidden; page-break-after: always; break-after: page; }
  .page:last-child { page-break-after: auto; break-after: auto; }
</style></head><body>${body}</body></html>`);
  doc.close();

  // Let a logo (the only external resource) finish loading before printing.
  await Promise.all(
    Array.from(doc.images).map((img) =>
      img.complete ? Promise.resolve() : new Promise<void>((r) => { img.onload = img.onerror = () => r(); }),
    ),
  );

  const win = iframe.contentWindow!;
  win.onafterprint = () => iframe.remove();
  win.focus();
  win.print();
  // Fallback cleanup for browsers that never fire afterprint.
  setTimeout(() => iframe.remove(), 60_000);
}
