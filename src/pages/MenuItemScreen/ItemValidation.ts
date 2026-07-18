import * as Yup from 'yup';

// ─── Shared field limits ────────────────────────────────────────
export const ITEM_ID_MAX_LENGTH       = 35;
export const ITEM_NAME_MAX_LENGTH     = 200;
export const CATEGORY_NAME_MAX_LENGTH = 60;
export const HSN_CODE_MAX_LENGTH      = 20;
export const BARCODE_MAX_LENGTH       = 20;
export const MAX_AMOUNT               = 99999999999.99;

const amountField = (label: string) =>
  Yup.number()
    .typeError(`Enter a valid ${label}`)
    .min(0, 'Cannot be negative')
    .max(MAX_AMOUNT, `${label} cannot exceed ${MAX_AMOUNT.toLocaleString('en-IN')}`);

/**
 * Restricts a raw text-input value to a valid decimal amount as the user types:
 * digits only, a single decimal point, at most 2 digits after it.
 */
export function sanitizeAmountInput(raw: string): string {
  let value = raw.replace(/[^0-9.]/g, '');
  const firstDot = value.indexOf('.');
  if (firstDot !== -1) {
    value = value.slice(0, firstDot + 1) + value.slice(firstDot + 1).replace(/\./g, '');
  }
  const [whole, decimal] = value.split('.');
  if (decimal !== undefined) {
    value = `${whole}.${decimal.slice(0, 2)}`;
  }
  return value;
}

// ─── Add Item schema ──────────────────────────────────────────
// Matches INITIAL_VALUES exactly — all optional except marked required
export const addItemSchema = Yup.object({
  serviceType:   Yup.string().oneOf(['product', 'service']).required(),
  inventoryType: Yup.string().oneOf(['sellable', 'raw']).required(),

  itemId:   Yup.string().trim().max(ITEM_ID_MAX_LENGTH, `Item ID cannot exceed ${ITEM_ID_MAX_LENGTH} characters`).required('Item ID is required'),
  name:     Yup.string().trim().max(ITEM_NAME_MAX_LENGTH, `Item name cannot exceed ${ITEM_NAME_MAX_LENGTH} characters`).required('Item name is required'),
  category: Yup.string().required('Category is required'),

  unit: Yup.number().required(),

  purchasePrice: amountField('purchase price').required('Purchase price is required'),
  mrp:           amountField('MRP').required('MRP is required'),
  rate:          amountField('selling rate').required('Selling rate is required'),

  // gstId is the API-driven GST dropdown value (string of gst id)
  gstId: Yup.string().required('Tax type is required'),

  taxInclusion: Yup.string().oneOf(['Incl.', 'Excl.']).required(),

  hsn:     Yup.string().max(HSN_CODE_MAX_LENGTH, `HSN code cannot exceed ${HSN_CODE_MAX_LENGTH} characters`).optional(),
  barcode: Yup.string().max(BARCODE_MAX_LENGTH, `Barcode cannot exceed ${BARCODE_MAX_LENGTH} characters`).optional(),

  // Inventory — optional collapsible section
  openingStock:  amountField('opening stock').optional(),
  lowStockAlert: amountField('low stock alert').optional(),
});

// ─── Add Category schema ──────────────────────────────────────
export const addCategorySchema = Yup.object({
  name:        Yup.string().trim().max(CATEGORY_NAME_MAX_LENGTH, `Category name cannot exceed ${CATEGORY_NAME_MAX_LENGTH} characters`).required('Category name is required'),
  description: Yup.string().optional(),
});