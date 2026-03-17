import * as Yup from 'yup';

export const addItemSchema = Yup.object({
  serviceType: Yup.string().oneOf(['product', 'service']).required(),
  inventoryType: Yup.string().oneOf(['sellable', 'raw']).required(),
  name: Yup.string().trim().required('Item name is required'),
  category: Yup.string().required('Please select a category'),
  unit: Yup.string().oneOf(['pcs', 'kg', 'ltr', 'box']).required(),
  mrp: Yup.number()
    .typeError('MRP must be a number')
    .positive('MRP must be greater than 0')
    .required('MRP is required'),
  rate: Yup.number()
    .typeError('Rate must be a number')
    .positive('Rate must be greater than 0')
    .max(Yup.ref('mrp'), 'Rate cannot exceed MRP')
    .required('Selling rate is required'),
  taxType: Yup.string().required('Tax type is required'),
  taxInclusion: Yup.string().oneOf(['Incl.', 'Excl.']).required(),
  hsn: Yup.string()
    .matches(/^\d{4,8}$/, 'HSN must be 4–8 digits')
    .required('HSN/SAC code is required'),
  barcode: Yup.string().optional(),
});

export const addCategorySchema = Yup.object({
  name: Yup.string().trim().required('Category name is required'),
  description: Yup.string().optional(),
});