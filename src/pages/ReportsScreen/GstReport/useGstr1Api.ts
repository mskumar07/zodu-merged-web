import { useQuery } from '@tanstack/react-query';
// import axiosInstance from '@store/services/axiosInstance'; // re-enable with the real request below

// ─── Types ────────────────────────────────────────────────────

export interface Gstr1SectionRow {
  /** GSTR-1 table reference, e.g. "4A", "5B", "7". */
  section: string;
  description: string;
  invoices: number;
  invoice_value: number;
  taxable_value: number;
  tax_amount: number;
}

export interface Gstr1B2bRow {
  invoice_no: string;
  /** ISO date, e.g. "2025-09-01". */
  invoice_date: string;
  customer_name: string;
  gstin: string;
  taxable_value: number;
  igst: number;
  cgst: number;
  sgst: number;
  cess: number;
  total_value: number;
}

export interface Gstr1B2clRow {
  invoice_no: string;
  /** ISO date, e.g. "2025-09-02". */
  invoice_date: string;
  customer_name: string;
  /** State the supply is made to. */
  place_of_supply: string;
  invoice_value: number;
  taxable_value: number;
  igst: number;
  cgst: number;
  sgst: number;
  cess: number;
  total_value: number;
}

export interface Gstr1CdnrRow {
  note_no: string;
  note_type: 'Credit Note' | 'Debit Note';
  /** ISO dates. */
  note_date: string;
  original_invoice_no: string;
  original_invoice_date: string;
  customer_name: string;
  gstin: string;
  taxable_value: number;
  igst: number;
  cgst: number;
  sgst: number;
  cess: number;
  total_value: number;
}

export interface Gstr1CdnurRow {
  note_no: string;
  note_type: 'Credit Note' | 'Debit Note';
  /** ISO dates. */
  note_date: string;
  customer_name: string;
  place_of_supply: string;
  original_invoice_no: string;
  original_invoice_date: string;
  note_value: number;
  taxable_value: number;
  igst: number;
  cgst: number;
  sgst: number;
  cess: number;
  total_value: number;
}

export interface Gstr1NilRow {
  invoice_no: string;
  /** ISO date. */
  invoice_date: string;
  customer_name: string;
  place_of_supply: string;
  /** e.g. "Nil Rated", "Exempted", "Non-GST Supply", "Nil Rated (Export)". */
  supply_type: string;
  invoice_value: number;
  remarks: string;
}

export interface Gstr1DocRow {
  /** e.g. "Issued Invoice", "Amended Invoice", "Cancelled Invoice". */
  document_type: string;
  document_no: string;
  /** Invoice an amended/cancelled document refers to; empty for plain issued ones. */
  reference_invoice_no: string;
  /** ISO date. */
  document_date: string;
  customer_name: string;
  gstin: string;
  place_of_supply: string;
  document_value: number;
  taxable_value: number;
  igst: number;
  cgst: number;
  sgst: number;
  cess: number;
}

export interface Gstr1HsnRow {
  hsn_code: string;
  description: string;
  /** Unit quantity code, e.g. "PCS". */
  uqc: string;
  quantity: number;
  total_value: number;
  taxable_value: number;
  igst: number;
  cgst: number;
  sgst: number;
  cess: number;
}

export interface Gstr1Summary {
  total_invoices: number;
  total_invoice_value: number;
  total_taxable_value: number;
  total_tax: number;
  total_documents: number;
}

export interface Gstr1Filing {
  status: string;
  due_date: string | null;
  filed_date: string | null;
  arn: string | null;
}

export interface Gstr1Response {
  summary: Gstr1Summary;
  sections: Gstr1SectionRow[];
  hsn: Gstr1HsnRow[];
  /** Credit/debit notes to registered persons (section 9B, CDNR). */
  cdnr: Gstr1CdnrRow[];
  /** Credit/debit notes to unregistered persons (section 9B, CDNUR). */
  cdnur: Gstr1CdnurRow[];
  /** Nil rated, exempted and non-GST supplies (sections 8A/8B). */
  nil: Gstr1NilRow[];
  /** Issued, amended and cancelled documents (sections 11/12). */
  docs: Gstr1DocRow[];
  filing: Gstr1Filing;
}

export interface Gstr1Params {
  zodu_id: string;
  branch_id: string;
  /** "2025-26" */
  financial_year: string;
  /** 1-12 */
  month: number;
  /** Calendar year of that month. */
  year: number;
  gstin?: string;
  isRestaurant?: boolean;
}

// ─── Hook ─────────────────────────────────────────────────────

/**
 * GSTR-1 summary for one return period.
 *
 * NOTE: GET /{retail|restaurant}/api/report/gstr1 and the response shape above
 * are the contract this screen was built against — align them with the backend.
 */
export function useGstr1Report(params: Gstr1Params | null, enabled = true) {
  return useQuery({
    queryKey: ['reports', 'gstr1', params],
    enabled: enabled && !!params?.zodu_id && !!params?.branch_id,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
    // TEMPORARY: serves MOCK_GSTR1 with no network call. To go live, delete the
    // return below and uncomment the real request.
    queryFn: async (): Promise<Gstr1Response> => {
      // const { isRestaurant, ...query } = params!;
      // const base = isRestaurant ? '/restaurant' : '/retail';
      // const res = await axiosInstance.get(`${base}/api/report/gstr1`, { params: query });
      // return res.data?.data as Gstr1Response;
      return MOCK_GSTR1;
    },
  });
}

// ─── Temporary mock data ──────────────────────────────────────

const B2B_CUSTOMERS: [string, string][] = [
  ['Alpha Traders', '29ABCDE1234F1Z5'], ['Metro Distributors', '33AABCM5678K1Z1'], ['City Retailers', '27AABCC1234L1Z7'],
  ['Global Supplies', '24AACFG5678M1Z2'], ['Prime Enterprises', '36AAACD7890N1Z3'], ['National Traders', '29AADCN8901P1Z6'],
  ['Shree Agencies', '32AAEFS1234Q1Z8'], ['Bright Stores', '37AABCT5678R1Z4'], ['Omni Traders', '24AACFO9012S1Z9'],
  ['Loyal Associates', '33AAECM3456T1Z0'],
];
// [note, type, date, original invoice, original date, taxable, igst]; CGST/SGST split the tax when igst is 0
const MOCK_CDNR: Gstr1CdnrRow[] = ([
  ['CN001', 'Credit Note', '2025-09-03', 'SI0005', '2025-08-28', 0, 25000, 4500],
  ['CN002', 'Credit Note', '2025-09-05', 'SI0010', '2025-09-01', 1, 18500, 0],
  ['CN003', 'Debit Note', '2025-09-08', 'SI0012', '2025-09-03', 2, 12750, 0],
  ['CN004', 'Credit Note', '2025-09-10', 'SI0018', '2025-09-06', 3, 32000, 5760],
  ['CN005', 'Credit Note', '2025-09-12', 'SI0021', '2025-09-08', 4, 15000, 0],
  ['CN006', 'Debit Note', '2025-09-15', 'SI0025', '2025-09-10', 5, 48750, 8775],
  ['CN007', 'Credit Note', '2025-09-18', 'SI0028', '2025-09-12', 6, 27600, 0],
  ['CN008', 'Debit Note', '2025-09-20', 'SI0031', '2025-09-15', 7, 9850, 0],
  ['CN009', 'Credit Note', '2025-09-22', 'SI0035', '2025-09-18', 8, 36400, 6552],
  ['CN010', 'Debit Note', '2025-09-25', 'SI0038', '2025-09-20', 9, 28900, 0],
  ['CN011', 'Credit Note', '2025-09-26', 'SI0040', '2025-09-22', 0, 14200, 0],
  ['CN012', 'Credit Note', '2025-09-29', 'SI0044', '2025-09-25', 1, 11300, 2034],
] as [string, 'Credit Note' | 'Debit Note', string, string, string, number, number, number][]).map(
  ([note_no, note_type, note_date, original_invoice_no, original_invoice_date, c, taxable_value, igst]) => {
    const [customer_name, gstin] = B2B_CUSTOMERS[c];
    const tax = Math.round(taxable_value * 0.18 * 100) / 100;
    const inter = igst > 0;
    const cgst = inter ? 0 : tax / 2;
    return {
      note_no, note_type, note_date, original_invoice_no, original_invoice_date, customer_name, gstin,
      taxable_value, igst: inter ? tax : 0, cgst, sgst: cgst, cess: 0,
      total_value: taxable_value + tax,
    };
  },
);

// [note, type, date, customer, state, original invoice, original date, note value, taxable, cgst (= sgst)]
const MOCK_CDNUR: Gstr1CdnurRow[] = ([
  ['CNUR001', 'Credit Note', '2025-09-02', 'Walk-in Customer', 'Tamil Nadu', 'SI0075', '2025-09-01', 3500, 2966.10, 266.95],
  ['CNUR002', 'Credit Note', '2025-09-05', 'Cash Customer', 'Karnataka', 'SI0081', '2025-09-03', 2800, 2372.88, 213.56],
  ['CNUR003', 'Debit Note', '2025-09-08', 'Retail Customer', 'Kerala', 'SI0090', '2025-09-05', 1200, 1016.95, 91.52],
  ['CNUR004', 'Credit Note', '2025-09-10', 'General Customer', 'Maharashtra', 'SI0098', '2025-09-08', 4500, 3813.56, 343.22],
  ['CNUR005', 'Credit Note', '2025-09-12', 'Walk-in Customer', 'Delhi', 'SI0102', '2025-09-10', 6800, 5762.71, 518.64],
  ['CNUR006', 'Debit Note', '2025-09-15', 'Cash Customer', 'Telangana', 'SI0108', '2025-09-12', 2250, 1906.78, 171.61],
  ['CNUR007', 'Credit Note', '2025-09-18', 'Retail Customer', 'Gujarat', 'SI0115', '2025-09-15', 3000, 2542.37, 228.81],
  ['CNUR008', 'Credit Note', '2025-09-22', 'General Customer', 'Uttar Pradesh', 'SI0120', '2025-09-20', 5250, 4449.15, 400.42],
  ['CNUR009', 'Debit Note', '2025-09-25', 'Walk-in Customer', 'Rajasthan', 'SI0126', '2025-09-22', 2000, 1694.92, 152.54],
  ['CNUR010', 'Credit Note', '2025-09-27', 'Cash Customer', 'Madhya Pradesh', 'SI0130', '2025-09-25', 4200, 3559.32, 320.34],
] as [string, 'Credit Note' | 'Debit Note', string, string, string, string, string, number, number, number][]).map(
  ([note_no, note_type, note_date, customer_name, place_of_supply, original_invoice_no, original_invoice_date, note_value, taxable_value, cgst]) => ({
    note_no, note_type, note_date, customer_name, place_of_supply, original_invoice_no, original_invoice_date,
    note_value, taxable_value, igst: 0, cgst, sgst: cgst, cess: 0, total_value: note_value,
  }),
);

const MOCK_NIL: Gstr1NilRow[] = ([
  ['NIL001', '2025-09-02', 'Government School', 'Tamil Nadu', 'Nil Rated (Export)', 45000, 'Export of educational material'],
  ['NIL002', '2025-09-05', 'Charity Trust', 'Karnataka', 'Exempted', 28500, 'Supply to registered charitable trust'],
  ['NIL003', '2025-09-08', 'Rural Development Board', 'Kerala', 'Nil Rated', 62300, 'Govt. project supply'],
  ['NIL004', '2025-09-10', 'Export Customer', 'United Arab Emirates', 'Nil Rated (Export)', 125000, 'Export without payment of tax'],
  ['NIL005', '2025-09-14', 'Diplomatic Mission', 'Delhi', 'Exempted', 32450, 'Supply to embassy'],
  ['NIL006', '2025-09-18', 'SEZ Unit', 'Maharashtra', 'Nil Rated (SEZ)', 78600, 'Supply to SEZ unit'],
  ['NIL007', '2025-09-21', 'Agriculture Dept', 'Telangana', 'Exempted', 18750, 'Supply of agricultural equipment'],
  ['NIL008', '2025-09-24', 'NGO Foundation', 'Gujarat', 'Exempted', 22400, 'Supply to NGO'],
  ['NIL009', '2025-09-27', 'UN Organization', 'Delhi', 'Nil Rated (Export)', 180000, 'Supply to UN organization'],
  ['NIL010', '2025-09-30', 'Research Institute', 'Karnataka', 'Non-GST Supply', 56820, 'Research and development supply'],
  ['NIL011', '2025-09-12', 'Public Library', 'West Bengal', 'Exempted', 14200, 'Supply of books and periodicals'],
  ['NIL012', '2025-09-16', 'Municipal Corporation', 'Tamil Nadu', 'Nil Rated', 33600, 'Civic project supply'],
  ['NIL013', '2025-09-19', 'Export Customer', 'Singapore', 'Nil Rated (Export)', 96400, 'Export without payment of tax'],
  ['NIL014', '2025-09-23', 'Trust Hospital', 'Kerala', 'Exempted', 27300, 'Supply to charitable hospital'],
  ['NIL015', '2025-09-28', 'Panchayat Office', 'Andhra Pradesh', 'Non-GST Supply', 15500, 'Local body supply'],
] as [string, string, string, string, string, number, string][]).map(
  ([invoice_no, invoice_date, customer_name, place_of_supply, supply_type, invoice_value, remarks]) => ({
    invoice_no, invoice_date, customer_name, place_of_supply, supply_type, invoice_value, remarks,
  }),
);

const MOCK_DOCS: Gstr1DocRow[] = ([
  ['Issued Invoice', 'DOC001', '', '2025-09-02', 'Fresh Foods Pvt Ltd', '29ABCDE1234F1Z5', 'Karnataka', 12450, 10550.85],
  ['Issued Invoice', 'DOC002', '', '2025-09-05', 'Green Mart', '33AABCG5678K1Z9', 'Tamil Nadu', 8320, 7050.85],
  ['Amended Invoice', 'AMD001', 'INV-0045', '2025-09-08', 'Metro Traders', '27AABCM1234K1Z7', 'Maharashtra', 15600, 13220.34],
  ['Amended Invoice', 'AMD002', 'INV-0062', '2025-09-10', 'City Retailers', '29AACCD8901L1Z3', 'Delhi', 6820, 5780.51],
  ['Cancelled Invoice', 'CAN001', 'INV-0074', '2025-09-12', 'Star Enterprises', '36AAACE4567M1Z1', 'Gujarat', 4250, 3601.69],
  ['Issued Invoice', 'DOC003', '', '2025-09-15', 'Prime Solutions', '24AABCP2345N1Z4', 'Kerala', 18750, 15891.53],
  ['Amended Invoice', 'AMD003', 'INV-0088', '2025-09-18', 'Global Supplies', '22AABCG5678P1Z8', 'Karnataka', 9600, 8135.59],
  ['Issued Invoice', 'DOC004', '', '2025-09-20', 'Oceanic Traders', '07AABCT6789Q1Z2', 'Tamil Nadu', 11820, 10016.95],
  ['Cancelled Invoice', 'CAN002', 'INV-0095', '2025-09-22', 'Bright Stores', '29AADCB3456R1Z6', 'Maharashtra', 5430, 4601.69],
  ['Issued Invoice', 'DOC005', '', '2025-09-25', 'Blue Ocean Exports', '29AADCE9012S1Z7', 'Delhi', 22450, 19025.42],
  ['Issued Invoice', 'DOC006', '', '2025-09-27', 'Sunrise Agencies', '33AABCS7890T1Z3', 'Tamil Nadu', 13200, 11186.44],
  ['Amended Invoice', 'AMD004', 'INV-0101', '2025-09-29', 'Lotus Distributors', '24AABCL1234U1Z5', 'Gujarat', 7930, 6720.34],
] as [string, string, string, string, string, string, string, number, number][]).map(
  ([document_type, document_no, reference_invoice_no, document_date, customer_name, gstin, place_of_supply, document_value, taxable_value]) => ({
    document_type, document_no, reference_invoice_no, document_date, customer_name, gstin, place_of_supply,
    document_value, taxable_value, igst: 0, cgst: 0, sgst: 0, cess: 0,
  }),
);

const MOCK_GSTR1: Gstr1Response = {
  cdnr: MOCK_CDNR,
  cdnur: MOCK_CDNUR,
  nil: MOCK_NIL,
  docs: MOCK_DOCS,
  summary: {
    total_invoices: 156,
    total_invoice_value: 2278690,
    total_taxable_value: 1845720,
    total_tax: 324190,
    total_documents: 12,
  },
  sections: [
    { section: '4A', description: 'B2B - Invoices', invoices: 28, invoice_value: 845620, taxable_value: 678350, tax_amount: 122103 },
    { section: '4B', description: 'B2B - Debit Notes', invoices: 2, invoice_value: 18500, taxable_value: 15250, tax_amount: 2745 },
    { section: '4C', description: 'B2B - Credit Notes', invoices: 1, invoice_value: -12300, taxable_value: -10420, tax_amount: -1875.6 },
    { section: '5A', description: 'B2C Large - Invoices', invoices: 12, invoice_value: 425800, taxable_value: 362500, tax_amount: 65250 },
    { section: '5B', description: 'B2C Large - Credit/Debit Notes', invoices: 0, invoice_value: 0, taxable_value: 0, tax_amount: 0 },
    { section: '7', description: 'B2C Small', invoices: 85, invoice_value: 535640, taxable_value: 462850, tax_amount: 83313 },
    { section: '6A', description: 'Exports - Invoices', invoices: 10, invoice_value: 1248500, taxable_value: 1248500, tax_amount: 0 },
    { section: '6B', description: 'Exports - Credit/Debit Notes', invoices: 0, invoice_value: 0, taxable_value: 0, tax_amount: 0 },
    { section: '9B', description: 'CDNR - Credit/Debit Notes (Registered)', invoices: 8, invoice_value: 235750, taxable_value: 198650, tax_amount: 37100 },
    { section: '9B', description: 'CDNUR - Credit/Debit Notes (Unregistered)', invoices: 5, invoice_value: 52300, taxable_value: 35550, tax_amount: 6507 },
    { section: '8A', description: 'Nil Rated Supplies', invoices: 4, invoice_value: 710820, taxable_value: 710820, tax_amount: 0 },
    { section: '8B', description: 'Exempted Supplies', invoices: 2, invoice_value: 185000, taxable_value: 185000, tax_amount: 0 },
    { section: '11', description: 'Issued Documents', invoices: 9, invoice_value: 162300, taxable_value: 132850, tax_amount: 29450 },
    { section: '12', description: 'Amended Documents', invoices: 3, invoice_value: 23320, taxable_value: 13720, tax_amount: 2480.6 },
  ],
  hsn: ([
    ['0101', 'Live horses, asses, mules and hinnies', 'NOS', 15, 25000, 'i'],
    ['0202', 'Meat and edible meat offal', 'KGS', 120, 38750, 'c'],
    ['0401', 'Milk and cream, not concentrated', 'LTR', 450, 64500, 'c'],
    ['0901', 'Coffee, whether or not roasted', 'KGS', 85, 27600, 'i'],
    ['1006', 'Rice', 'KGS', 600, 42350, 'c'],
    ['1701', 'Cane or beet sugar', 'KGS', 310, 48300, 'c'],
    ['1905', 'Bread, pastry, cakes, biscuits', 'KGS', 220, 22020, 'c'],
    ['2106', 'Food preparations n.e.s.', 'KGS', 95, 53700, 'c'],
    ['2202', 'Waters, including mineral water', 'LTR', 520, 35400, 'c'],
    ['2402', 'Cigars, cheroots, cigarillos and cigarettes', 'NOS', 180, 31750, 'c'],
    ['0702', 'Tomatoes, fresh or chilled', 'KGS', 340, 18200, 'c'],
    ['0713', 'Dried leguminous vegetables', 'KGS', 410, 36800, 'c'],
    ['1101', 'Wheat or meslin flour', 'KGS', 520, 29900, 'c'],
    ['1507', 'Soya-bean oil and its fractions', 'LTR', 160, 44800, 'i'],
    ['1704', 'Sugar confectionery', 'KGS', 130, 21500, 'c'],
    ['1806', 'Chocolate and food preparations with cocoa', 'KGS', 90, 39200, 'i'],
    ['2009', 'Fruit or vegetable juices', 'LTR', 280, 26400, 'c'],
    ['2501', 'Salt and pure sodium chloride', 'NOS', 700, 9800, 'c'],
  ] as [string, string, string, number, number, 'i' | 'c'][]).map(([hsn_code, description, uqc, quantity, taxable_value, kind]) => {
    // 18% GST: all IGST on inter-state lines, split evenly into CGST + SGST otherwise.
    const tax = Math.round(taxable_value * 0.18 * 100) / 100;
    const half = tax / 2;
    return {
      hsn_code, description, uqc, quantity, taxable_value,
      igst: kind === 'i' ? tax : 0, cgst: kind === 'c' ? half : 0, sgst: kind === 'c' ? half : 0, cess: 0,
      total_value: taxable_value + tax,
    };
  }),
  filing: { status: 'Not Filed', due_date: '2025-10-11', filed_date: null, arn: null },
};
