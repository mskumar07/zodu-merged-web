import type { ColumnDef } from '@utils/DataTable';
import {
  dateColumn, intColumn, moneyColumn, snoColumn, textColumn, type ListRow,
} from './invoiceTableParts';
import type {
  Gstr1B2bRow, Gstr1B2clRow, Gstr1CdnrRow, Gstr1CdnurRow, Gstr1DocRow, Gstr1HsnRow, Gstr1NilRow, Gstr1Response, Gstr1SectionRow,
} from './useGstr1Api';
import type { ExportTable } from './exportGstr1';
import type { RemoteEndpoint, RemoteSummary } from './useGstr1RemoteApi';

/**
 * Every GSTR-1 tab is one entry here. The screen reads this list to draw the tab
 * bar, the summary cards, the table and the exports, so a new tab (or a change to
 * an existing one) is a config edit — no new component.
 */
export interface TabDef<T extends object = any> { // eslint-disable-line @typescript-eslint/no-explicit-any
  id: string;
  label: string;
  /** Used for the exported file/title, e.g. "B2B Invoices". */
  exportName: string;
  searchPlaceholder: string;
  emptyMessage: string;
  columns: ColumnDef<ListRow<T>>[];
  sumKeys: (keyof T & string)[];
  rowKey: (row: T) => string;
  searchText: (row: T) => string;
  lockedKeys?: string[];
  /**
   * true when the tab loads its own data from the server (search, paging and totals
   * included) instead of reading the shared report response.
   */
  remote?: {
    endpoint: RemoteEndpoint;
    /** Whether the endpoint takes the GSTIN filter (only B2B does). */
    gstin?: boolean;
  };
  /** Picks this tab's rows out of the report response. */
  rows: (res: Gstr1Response) => T[];
  /** Totals that replace the computed ones (the return's own figures). */
  footer?: (res: Gstr1Response) => Record<string, number>;
  // Summary cards: [count][value][IGST][CGST][SGST][Cess] — only those the tab has.
  countLabel: string;
  /** Sum this field for the count card instead of counting rows. */
  countKey?: keyof T & string;
  valueLabel?: string;
  valueKey?: keyof T & string;
  /** Replaces the generated cards when a tab needs its own set. */
  cards?: (rows: T[]) => CardDef[];
  /** Adds an eye button per row that opens that row's details. */
  viewable?: boolean;
  /** Bullet points shown under the table. */
  notes?: string[];
}

// ─── Shared column groups ─────────────────────────────────────

const taxColumns = <T extends object>(): ColumnDef<ListRow<T>>[] => [
  moneyColumn<T>('igst' as keyof T & string, 'IGST (₹)', 110),
  moneyColumn<T>('cgst' as keyof T & string, 'CGST (₹)', 110),
  moneyColumn<T>('sgst' as keyof T & string, 'SGST (₹)', 110),
  moneyColumn<T>('cess' as keyof T & string, 'Cess (₹)', 100),
];
const TAX_KEYS = ['igst', 'cgst', 'sgst', 'cess'] as const;

// ─── Invoice-level tabs ───────────────────────────────────────

const b2b: TabDef<Gstr1B2bRow> = {
  id: 'b2b', label: 'B2B (4A, 4B, 4C)', exportName: 'B2B Invoices',
  searchPlaceholder: 'Search by invoice no, GSTIN or customer...',
  emptyMessage: 'No B2B invoices for this return period.',
  columns: [
    snoColumn<Gstr1B2bRow>(),
    textColumn<Gstr1B2bRow>('invoice_no', 'Invoice No', 120),
    dateColumn<Gstr1B2bRow>('invoice_date', 'Invoice Date'),
    textColumn<Gstr1B2bRow>('customer_name', 'Customer Name', 200, { grow: true }),
    textColumn<Gstr1B2bRow>('gstin', 'GSTIN', 190),
    moneyColumn<Gstr1B2bRow>('taxable_value', 'Taxable Value (₹)', 140),
    ...taxColumns<Gstr1B2bRow>(),
    moneyColumn<Gstr1B2bRow>('total_value', 'Total Value (₹)', 140, true),
  ],
  sumKeys: ['taxable_value', ...TAX_KEYS, 'total_value'],
  rowKey: (r) => r.invoice_no,
  searchText: (r) => `${r.invoice_no} ${r.customer_name} ${r.gstin}`,
  lockedKeys: ['invoice_no'],
  remote: { endpoint: 'b2b', gstin: true },
  rows: () => [],
  countLabel: 'Total Invoices', valueLabel: 'Total Taxable Value', valueKey: 'taxable_value',
};

const b2cl: TabDef<Gstr1B2clRow> = {
  id: 'b2cl', label: 'B2C Large (5A, 5B)', exportName: 'B2C Large Invoices',
  searchPlaceholder: 'Search by invoice no. or customer name...',
  emptyMessage: 'No B2C Large invoices for this return period.',
  columns: [
    snoColumn<Gstr1B2clRow>(),
    textColumn<Gstr1B2clRow>('invoice_no', 'Invoice No', 120),
    dateColumn<Gstr1B2clRow>('invoice_date', 'Invoice Date'),
    textColumn<Gstr1B2clRow>('customer_name', 'Customer Name', 180, { grow: true }),
    textColumn<Gstr1B2clRow>('place_of_supply', 'Place of Supply (State)', 190),
    moneyColumn<Gstr1B2clRow>('invoice_value', 'Invoice Value (₹)', 150),
    moneyColumn<Gstr1B2clRow>('taxable_value', 'Taxable Value (₹)', 150),
    ...taxColumns<Gstr1B2clRow>(),
    moneyColumn<Gstr1B2clRow>('total_value', 'Total Value (₹)', 150, true),
  ],
  sumKeys: ['invoice_value', 'taxable_value', ...TAX_KEYS, 'total_value'],
  rowKey: (r) => r.invoice_no,
  searchText: (r) => `${r.invoice_no} ${r.customer_name} ${r.place_of_supply}`,
  lockedKeys: ['invoice_no'],
  remote: { endpoint: 'b2c-large' },
  rows: () => [],
  countLabel: 'Total Invoices', valueLabel: 'Total Taxable Value', valueKey: 'taxable_value',
};

const cdnr: TabDef<Gstr1CdnrRow> = {
  id: 'cdnr', label: 'CDNR (9B)', exportName: 'CDNR Notes',
  searchPlaceholder: 'Search by note no., GSTIN or customer name...',
  emptyMessage: 'No credit/debit notes for this return period.',
  columns: [
    snoColumn<Gstr1CdnrRow>(),
    textColumn<Gstr1CdnrRow>('note_no', 'Note No', 100),
    textColumn<Gstr1CdnrRow>('note_type', 'Note Type', 110),
    dateColumn<Gstr1CdnrRow>('note_date', 'Note Date', 120),
    textColumn<Gstr1CdnrRow>('original_invoice_no', 'Original Invoice No', 150),
    dateColumn<Gstr1CdnrRow>('original_invoice_date', 'Original Invoice Date', 160),
    textColumn<Gstr1CdnrRow>('customer_name', 'Customer Name', 180, { grow: true }),
    textColumn<Gstr1CdnrRow>('gstin', 'GSTIN', 190),
    moneyColumn<Gstr1CdnrRow>('taxable_value', 'Taxable Value (₹)', 140),
    ...taxColumns<Gstr1CdnrRow>(),
    moneyColumn<Gstr1CdnrRow>('total_value', 'Total Value (₹)', 140, true),
  ],
  sumKeys: ['taxable_value', ...TAX_KEYS, 'total_value'],
  rowKey: (r) => r.note_no,
  searchText: (r) => `${r.note_no} ${r.customer_name} ${r.gstin} ${r.original_invoice_no}`,
  lockedKeys: ['note_no'],
  rows: (res) => res.cdnr,
  countLabel: 'Total Notes', valueLabel: 'Total Credit Note Value', valueKey: 'taxable_value',
};

const cdnur: TabDef<Gstr1CdnurRow> = {
  id: 'cdnur', label: 'CDNUR (9B)', exportName: 'CDNUR Notes',
  searchPlaceholder: 'Search by note no. or customer name...',
  emptyMessage: 'No credit/debit notes for this return period.',
  columns: [
    snoColumn<Gstr1CdnurRow>(),
    textColumn<Gstr1CdnurRow>('note_no', 'Note No', 110),
    textColumn<Gstr1CdnurRow>('note_type', 'Note Type', 110),
    dateColumn<Gstr1CdnurRow>('note_date', 'Note Date', 120),
    textColumn<Gstr1CdnurRow>('customer_name', 'Customer Name', 170, { grow: true }),
    textColumn<Gstr1CdnurRow>('place_of_supply', 'Place of Supply (State)', 170),
    textColumn<Gstr1CdnurRow>('original_invoice_no', 'Original Invoice No', 150),
    dateColumn<Gstr1CdnurRow>('original_invoice_date', 'Original Invoice Date', 160),
    moneyColumn<Gstr1CdnurRow>('note_value', 'Note Value (₹)', 130),
    moneyColumn<Gstr1CdnurRow>('taxable_value', 'Taxable Value (₹)', 140),
    ...taxColumns<Gstr1CdnurRow>(),
    moneyColumn<Gstr1CdnurRow>('total_value', 'Total Value (₹)', 140, true),
  ],
  sumKeys: ['note_value', 'taxable_value', ...TAX_KEYS, 'total_value'],
  rowKey: (r) => r.note_no,
  searchText: (r) => `${r.note_no} ${r.customer_name} ${r.place_of_supply} ${r.original_invoice_no}`,
  lockedKeys: ['note_no'],
  rows: (res) => res.cdnur,
  countLabel: 'Total Notes', valueLabel: 'Total Credit Note Value', valueKey: 'note_value',
};

const nil: TabDef<Gstr1NilRow> = {
  id: 'nil', label: 'Nil Rated (8A, 8B)', exportName: 'Nil Rated Supplies',
  searchPlaceholder: 'Search by invoice no. or customer name...',
  emptyMessage: 'No nil rated, exempted or non-GST supplies for this return period.',
  columns: [
    snoColumn<Gstr1NilRow>(),
    textColumn<Gstr1NilRow>('invoice_no', 'Invoice No', 120),
    dateColumn<Gstr1NilRow>('invoice_date', 'Invoice Date'),
    textColumn<Gstr1NilRow>('customer_name', 'Customer Name', 200, { grow: true }),
    textColumn<Gstr1NilRow>('place_of_supply', 'Place of Supply (State)', 190),
    textColumn<Gstr1NilRow>('supply_type', 'Supply Type', 170),
    moneyColumn<Gstr1NilRow>('invoice_value', 'Invoice Value (₹)', 150, true),
    textColumn<Gstr1NilRow>('remarks', 'Remarks', 260, { grow: true }),
  ],
  sumKeys: ['invoice_value'],
  rowKey: (r) => r.invoice_no,
  searchText: (r) => `${r.invoice_no} ${r.customer_name} ${r.place_of_supply} ${r.supply_type}`,
  lockedKeys: ['invoice_no'],
  rows: (res) => res.nil,
  countLabel: 'Total Invoices', valueLabel: 'Total Invoice Value', valueKey: 'invoice_value',
};

const docs: TabDef<Gstr1DocRow> = {
  id: 'docs', label: 'Documents (11, 12)', exportName: 'Documents',
  searchPlaceholder: 'Search by document no., invoice no. or customer name...',
  emptyMessage: 'No documents for this return period.',
  columns: [
    snoColumn<Gstr1DocRow>(),
    textColumn<Gstr1DocRow>('document_type', 'Document Type', 150),
    textColumn<Gstr1DocRow>('document_no', 'Document No', 130),
    textColumn<Gstr1DocRow>('reference_invoice_no', 'Reference Invoice No', 150),
    dateColumn<Gstr1DocRow>('document_date', 'Document Date', 130),
    textColumn<Gstr1DocRow>('customer_name', 'Customer Name', 180, { grow: true }),
    textColumn<Gstr1DocRow>('gstin', 'GSTIN', 190),
    textColumn<Gstr1DocRow>('place_of_supply', 'Place of Supply (State)', 170),
    moneyColumn<Gstr1DocRow>('document_value', 'Document Value (₹)', 160, true),
    moneyColumn<Gstr1DocRow>('taxable_value', 'Taxable Value (₹)', 150),
    ...taxColumns<Gstr1DocRow>(),
  ],
  sumKeys: ['document_value', 'taxable_value', ...TAX_KEYS],
  rowKey: (r) => r.document_no,
  searchText: (r) => `${r.document_no} ${r.reference_invoice_no} ${r.customer_name} ${r.gstin} ${r.document_type}`,
  lockedKeys: ['document_no'],
  rows: (res) => res.docs,
  countLabel: 'Total Documents', valueLabel: 'Total Document Value', valueKey: 'document_value',
};

// ─── Section-level tab (Summary) ──

const sectionColumns: ColumnDef<ListRow<Gstr1SectionRow>>[] = [
  textColumn<Gstr1SectionRow>('section', 'Section', 90, { bold: true, totalLabel: true }),
  textColumn<Gstr1SectionRow>('description', 'Description', 260, { grow: true, wrap: true }),
  intColumn<Gstr1SectionRow>('invoices', 'Invoices'),
  moneyColumn<Gstr1SectionRow>('invoice_value', 'Invoice Value (₹)', 140),
  moneyColumn<Gstr1SectionRow>('taxable_value', 'Taxable Value (₹)', 140),
  moneyColumn<Gstr1SectionRow>('tax_amount', 'Tax Amount (₹)', 140),
];

const sectionTab = (
  id: string, label: string, exportName: string,
  match: (r: Gstr1SectionRow) => boolean,
  extra: Partial<TabDef<Gstr1SectionRow>> = {},
): TabDef<Gstr1SectionRow> => ({
  id, label, exportName,
  searchPlaceholder: 'Search by section or description...',
  emptyMessage: 'No GSTR-1 data for this return period.',
  columns: sectionColumns,
  sumKeys: ['invoices', 'invoice_value', 'taxable_value', 'tax_amount'],
  rowKey: (r) => `${r.section}-${r.description}`,
  searchText: (r) => `${r.section} ${r.description}`,
  lockedKeys: ['section'],
  rows: (res) => res.sections.filter(match),
  countLabel: 'Total Invoices', countKey: 'invoices', valueLabel: 'Total Taxable Value', valueKey: 'taxable_value',
  ...extra,
});

const summary = sectionTab('summary', 'Summary', 'Summary', () => true, {
  // The Summary total is the return's own figures, not a re-sum of the rows.
  footer: (res) => ({
    invoices: res.summary.total_invoices, invoice_value: res.summary.total_invoice_value,
    taxable_value: res.summary.total_taxable_value, tax_amount: res.summary.total_tax,
  }),
});
// ─── HSN-wise ─────────────────────────────────────────────────

const sumOfRows = (rows: object[], key: string) =>
  rows.reduce((a, r) => a + Number((r as Record<string, unknown>)[key] ?? 0), 0);

const hsn: TabDef<Gstr1HsnRow> = {
  id: 'hsn', label: 'HSN-wise Report', exportName: 'HSN-wise Summary',
  searchPlaceholder: 'Search by HSN code, description or UQC...',
  emptyMessage: 'No HSN-wise data for this return period.',
  columns: [
    snoColumn<Gstr1HsnRow>(),
    textColumn<Gstr1HsnRow>('hsn_code', 'HSN Code', 110, { bold: true }),
    textColumn<Gstr1HsnRow>('description', 'Description', 260, { grow: true }),
    textColumn<Gstr1HsnRow>('uqc', 'UQC', 80),
    moneyColumn<Gstr1HsnRow>('quantity', 'Total Quantity', 130),
    moneyColumn<Gstr1HsnRow>('taxable_value', 'Taxable Value (₹)', 150),
    moneyColumn<Gstr1HsnRow>('igst', 'IGST (₹)', 110),
    moneyColumn<Gstr1HsnRow>('cgst', 'CGST (₹)', 110),
    moneyColumn<Gstr1HsnRow>('sgst', 'SGST (₹)', 110),
    moneyColumn<Gstr1HsnRow>('cess', 'Cess (₹)', 100),
    moneyColumn<Gstr1HsnRow>('total_value', 'Total Invoice Value (₹)', 170, true),
  ],
  sumKeys: ['quantity', 'taxable_value', 'igst', 'cgst', 'sgst', 'cess', 'total_value'],
  rowKey: (r) => `${r.hsn_code}-${r.uqc}`,
  searchText: (r) => `${r.hsn_code} ${r.description} ${r.uqc}`,
  lockedKeys: ['hsn_code'],
  rows: (res) => res.hsn,
  countLabel: 'Total HSN Items', valueKey: 'taxable_value',
  cards: (rows) => [
    { id: 'count', kind: 'count', label: 'Total HSN Items', value: rows.length, isMoney: false },
    { id: 'taxable', kind: 'taxable', label: 'Total Taxable Value', value: sumOfRows(rows, 'taxable_value'), isMoney: true },
    {
      id: 'tax', kind: 'tax', label: 'Total Tax Amount', isMoney: true,
      value: ['igst', 'cgst', 'sgst', 'cess'].reduce((a, k) => a + sumOfRows(rows, k), 0),
    },
    { id: 'value', kind: 'value', label: 'Total Invoice Value', value: sumOfRows(rows, 'total_value'), isMoney: true },
  ],
  viewable: true,
};

/** Tab order on screen. */
export const TAB_DEFS: TabDef[] = [summary, b2b, b2cl, cdnr, cdnur, nil, docs, hsn];

// ─── Derived from a tab's config ──────────────────────────────

export interface CardDef {
  id: string;
  kind: 'count' | 'value' | 'taxable' | 'tax' | 'igst' | 'cgst' | 'sgst' | 'cess' | 'docs';
  label: string;
  value: number;
  /** Whole numbers (counts) are shown as-is, amounts with ₹ and two decimals. */
  isMoney: boolean;
}

const sumOf = <T extends object>(rows: T[], key: string) => rows.reduce((a, r) => a + Number((r as Record<string, unknown>)[key] ?? 0), 0);

export function buildCards(def: TabDef, rows: object[], res: Gstr1Response | undefined): CardDef[] {
  if (def.cards) return def.cards(rows);
  if (def.id === 'summary') {
    const s = res?.summary;
    return [
      { id: 'count', kind: 'count', label: 'Total Invoices', value: s?.total_invoices ?? 0, isMoney: false },
      { id: 'value', kind: 'value', label: 'Total Invoice Value', value: s?.total_invoice_value ?? 0, isMoney: true },
      { id: 'taxable', kind: 'taxable', label: 'Total Taxable Value', value: s?.total_taxable_value ?? 0, isMoney: true },
      { id: 'tax', kind: 'tax', label: 'Total Tax', value: s?.total_tax ?? 0, isMoney: true },
      { id: 'docs', kind: 'docs', label: 'Total Documents', value: s?.total_documents ?? 0, isMoney: false },
    ];
  }
  const cards: CardDef[] = [{
    id: 'count', kind: 'count', label: def.countLabel, isMoney: false,
    value: def.countKey ? sumOf(rows, def.countKey) : rows.length,
  }];
  if (def.valueKey) {
    cards.push({ id: 'value', kind: 'value', label: def.valueLabel ?? 'Total Value', value: sumOf(rows, def.valueKey), isMoney: true });
  }
  (['igst', 'cgst', 'sgst', 'cess'] as const).forEach((k) => {
    if (def.sumKeys.includes(k)) cards.push({ id: k, kind: k, label: `Total ${k.toUpperCase()}`, value: sumOf(rows, k), isMoney: true });
  });
  return cards;
}

const INTEGER_KEYS = new Set(['invoices', 'quantity']);

/** The server-driven tabs' cards come straight from the server's summary, which covers every matching invoice. */
export function remoteCards(s: RemoteSummary | undefined): CardDef[] {
  return [
    { id: 'count', kind: 'count', label: 'Total Invoices', value: s?.total_invoices ?? 0, isMoney: false },
    { id: 'value', kind: 'value', label: 'Total Taxable Value', value: s?.total_taxable_value ?? 0, isMoney: true },
    { id: 'igst', kind: 'igst', label: 'Total IGST', value: s?.total_igst ?? 0, isMoney: true },
    { id: 'cgst', kind: 'cgst', label: 'Total CGST', value: s?.total_cgst ?? 0, isMoney: true },
    { id: 'sgst', kind: 'sgst', label: 'Total SGST', value: s?.total_sgst ?? 0, isMoney: true },
    { id: 'cess', kind: 'cess', label: 'Total Cess', value: s?.total_cess ?? 0, isMoney: true },
  ];
}

/** The pinned total row of a server-driven table (a tab only shows the columns it has). */
export const remoteFooter = (s: RemoteSummary): Record<string, number> => ({
  taxable_value: s.total_taxable_value, igst: s.total_igst, cgst: s.total_cgst,
  sgst: s.total_sgst, cess: s.total_cess, total_value: s.total_value, invoice_value: s.total_value,
});

/** The table's own columns and rows, so the export always matches what is on screen. */
export function buildExport(def: TabDef, rows: object[]): ExportTable {
  const cols = def.columns.filter((c) => c.key !== 'sno');
  return {
    headers: cols.map((c) => String(c.label)),
    rows: rows.map((r) => cols.map((c) => {
      const v = (r as Record<string, unknown>)[c.key];
      if (typeof v === 'number') return INTEGER_KEYS.has(c.key) ? v : v.toFixed(2);
      return String(v ?? '');
    })),
  };
}
