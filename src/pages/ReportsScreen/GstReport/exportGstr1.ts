export interface ExportTable {
  headers: string[];
  rows: (string | number)[][];
}

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** CSV with a BOM, so Excel opens it with the ₹ sign intact. */
export function exportGstr1Excel({ headers, rows }: ExportTable, title: string, filename: string) {
  const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const lines = [[title], headers, ...rows].map((l) => l.map(esc).join(','));
  download(new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' }), `${filename}.csv`);
}

/** jsPDF is loaded on demand, so it never weighs on the report's first render. */
export async function exportGstr1Pdf({ headers, rows }: ExportTable, title: string, filename: string) {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
  const left = 40;
  const width = doc.internal.pageSize.getWidth() - left * 2;
  // Text columns (the first two) are wider than the numeric ones.
  const weights = headers.map((_, i) => (i === 1 ? 3 : i === 0 ? 1.2 : 1.4));
  const unit = width / weights.reduce((a, b) => a + b, 0);
  const starts = weights.map((_, i) => left + unit * weights.slice(0, i).reduce((a, b) => a + b, 0));
  let y = 50;

  const line = (cells: (string | number)[], bold = false) => {
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    cells.forEach((c, i) => {
      if (i < 2) doc.text(String(c), starts[i], y, { maxWidth: unit * weights[i] - 8 });
      else doc.text(String(c), starts[i] + unit * weights[i] - 8, y, { align: 'right' });
    });
    y += 20;
  };

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(title, left, y);
  y += 28;
  doc.setFontSize(9);
  // jsPDF's built-in font has no ₹ glyph, so the PDF labels amounts as Rs.
  line(headers.map((h) => h.replace('₹', 'Rs.')), true);
  rows.forEach((r) => {
    if (y > 550) { doc.addPage(); y = 50; }
    line(r);
  });
  doc.save(`${filename}.pdf`);
}
