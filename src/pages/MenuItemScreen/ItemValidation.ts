import * as Yup from 'yup';

// ─── Add Item schema ──────────────────────────────────────────
// Matches INITIAL_VALUES exactly — all optional except marked required
export const addItemSchema = Yup.object({
  serviceType:   Yup.string().oneOf(['product', 'service']).required(),
  inventoryType: Yup.string().oneOf(['sellable', 'raw']).required(),

  name:     Yup.string().trim().required('Item name is required'),
  category: Yup.string().required('Category is required'),

  unit: Yup.number().required(),

  purchasePrice: Yup.number()
    .typeError('Enter a valid price')
    .min(0, 'Cannot be negative')
    .required('Purchase price is required'),

  mrp: Yup.number()
    .typeError('Enter a valid MRP')
    .min(0, 'Cannot be negative')
    .required('MRP is required'),

  rate: Yup.number()
    .typeError('Enter a valid selling rate')
    .min(0, 'Cannot be negative')
    .required('Selling rate is required'),

  // gstId is the API-driven GST dropdown value (string of gst id)
  gstId: Yup.string().required('Tax type is required'),

  taxInclusion: Yup.string().oneOf(['Incl.', 'Excl.']).required(),

  hsn:     Yup.string().required('HSN code is required'),
  barcode: Yup.string().optional(),

  // Inventory — optional collapsible section
  openingStock:  Yup.number().typeError('Enter a valid number').min(0).optional(),
  lowStockAlert: Yup.number().typeError('Enter a valid number').min(0).optional(),
});

// ─── Add Category schema ──────────────────────────────────────
export const addCategorySchema = Yup.object({
  name:        Yup.string().trim().required('Category name is required'),
  description: Yup.string().optional(),
});