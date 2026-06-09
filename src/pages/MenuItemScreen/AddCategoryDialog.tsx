/**
 * AddCategoryDialog.tsx
 * ─────────────────────────────────────────────────────────────
 * Shared Add / Edit Category dialog used by:
 *   - CategoryTab   — "Add Category" button  +  row Edit icon
 *   - AddItemModal  — inline "Add Category" while creating an item
 *
 * Pass `editRow` to open in EDIT mode (pre-fills name + type, calls PUT).
 * Omit `editRow` / null for ADD mode (calls POST).
 */

import React, { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Typography, TextField, Button, IconButton, CircularProgress,
  ToggleButtonGroup, ToggleButton,
} from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import EditIcon      from '@mui/icons-material/Edit';
import CloseIcon     from '@mui/icons-material/Close';
import { useFormik } from 'formik';
import * as Yup      from 'yup';
import {
  useAddCategory, useUpdateCategory,
  type Category, type CategoryRow,
} from './useMenuItemApi';
import SuccessToast from '@components/Common/SuccessToast';

// ── Props ─────────────────────────────────────────────────────

export interface AddCategoryDialogProps {
  open:          boolean;
  serviceType?:  'product' | 'service';
  editRow?:      CategoryRow | null;
  /** When set, hides the Type toggle and always submits this type (e.g. "E" for expense) */
  fixedType?:    TypeCode;
  businessType?: string;
  onClose:       () => void;
  onAdded?:      (cat: Category) => void;
  onEdited?:     () => void;
}

// ── Constants ─────────────────────────────────────────────────

type TypeCode = 'S' | 'M' | 'E' | 'F' | 'P';

const TYPE_OPTIONS_RETAIL: { value: TypeCode; label: string }[] = [
  { value: 'S', label: 'Sellable' },
  { value: 'M', label: 'Service'  },
];

const TYPE_OPTIONS_RESTAURANT: { value: TypeCode; label: string }[] = [
  { value: 'F', label: 'Food'    },
  { value: 'P', label: 'Product' },
];

const RED = '#D2122E';

// ── Validation ────────────────────────────────────────────────

const schema = Yup.object({
  name: Yup.string().trim().required('Category name is required'),
  type: Yup.string().oneOf(['S', 'M', 'E', 'F', 'P']).required('Type is required'),
});

// ── Helper ────────────────────────────────────────────────────

const Label: React.FC<{ text: string; required?: boolean }> = ({ text, required }) => (
  <Typography variant="body2" fontWeight={600} mb={0.8} color="text.primary">
    {text}
    {required && <Box component="span" sx={{ color: RED, ml: 0.3 }}>*</Box>}
  </Typography>
);

// ── Component ─────────────────────────────────────────────────

const AddCategoryDialog: React.FC<AddCategoryDialogProps> = ({
  open,
  serviceType  = 'product',
  editRow      = null,
  fixedType,
  businessType,
  onClose,
  onAdded,
  onEdited,
}) => {
  const isRestaurant = businessType === 'Restaurant';
  const typeOptions  = isRestaurant ? TYPE_OPTIONS_RESTAURANT : TYPE_OPTIONS_RETAIL;
  const defaultCode: TypeCode = isRestaurant ? 'F' : 'S';

  const isEditMode  = Boolean(editRow);
  const showToggle  = !fixedType;
  const defaultType = fixedType ?? ((editRow?.type_code as TypeCode) ?? defaultCode);

  const [apiError,   setApiError]   = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState('');

  // ── Add mutation ──────────────────────────────────────────
  const { mutate: addCategory, isPending: isAdding, reset: resetAdd } = useAddCategory({
    onSuccess: (category, apiMessage) => {
      onAdded?.(category);
      f.resetForm();
      setApiError(null);
      setSuccessMsg(apiMessage);
      onClose();
    },
    onError: (msg) => setApiError(msg),
  });

  // ── Edit mutation ─────────────────────────────────────────
  const { mutate: updateCategory, isPending: isUpdating, reset: resetUpdate } = useUpdateCategory({
    onSuccess: (apiMessage) => {
      onEdited?.();
      f.resetForm();
      setApiError(null);
      setSuccessMsg(apiMessage);
      onClose();
    },
    onError: (msg) => setApiError(msg),
  });

  const isPending = isAdding || isUpdating;

  // ── Form ──────────────────────────────────────────────────
  const f = useFormik({
    initialValues: { name: editRow?.name ?? '', type: defaultType },
    enableReinitialize: true,
    validationSchema:   schema,
    onSubmit: (values) => {
      setApiError(null);
      // always use fixedType if provided, otherwise use form value
      const typeToSend = (fixedType ?? values.type) as TypeCode;
      if (isEditMode && editRow) {
        updateCategory({ id: editRow.id, name: values.name, type: typeToSend });
      } else {
        addCategory({ name: values.name, type: typeToSend, serviceType });
      }
    },
  });

  // Re-fill whenever dialog opens or editRow changes
  useEffect(() => {
    if (open) {
      f.resetForm({
        values: {
          name: editRow?.name ?? '',
          type: fixedType ?? ((editRow?.type_code as TypeCode) ?? 'S'),
        },
      });
      setApiError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editRow, fixedType]);

  const handleClose = () => {
    if (isPending) return;
    f.resetForm();
    resetAdd();
    resetUpdate();
    setApiError(null);
    onClose();
  };

  // ── Shared toggle sx ──────────────────────────────────────
  const toggleSx = {
    flex: 1,
    border: 'none !important',
    borderRadius: '6px !important',
    textTransform: 'none' as const,
    fontSize: 13,
    fontWeight: 600,
    height: 34,
    color: 'text.secondary',
    transition: 'all 0.15s',
    '&.Mui-selected': {
      bgcolor:   RED,
      color:     '#fff',
      boxShadow: `0 2px 8px rgba(210,18,46,0.35)`,
      '&:hover': { bgcolor: RED },
    },
    '&:hover': { bgcolor: 'rgba(0,0,0,0.05)' },
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 1.5, boxShadow: '0 24px 60px rgba(0,0,0,0.2)' } }}
      >
        {/* ── Header ── */}
        <DialogTitle sx={{ p: 0 }}>
          <Box sx={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            px: 3, py: 2.5, borderBottom: '1px solid', borderColor: 'divider',
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{
                width: 38, height: 38, borderRadius: '50%',
                bgcolor: 'rgba(210,18,46,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {isEditMode
                  ? <EditIcon      sx={{ color: RED, fontSize: 20 }} />
                  : <AddCircleIcon sx={{ color: RED, fontSize: 20 }} />
                }
              </Box>
              <Box>
                <Typography fontWeight={800} lineHeight={1.2} fontSize={16}>
                  {isEditMode ? 'Edit Category' : 'Add New Category'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {isEditMode ? (showToggle ? 'Update category name and type' : 'Update category name') : 'Create a custom product category'}
                </Typography>
              </Box>
            </Box>
            <IconButton size="small" onClick={handleClose} disabled={isPending}
              sx={{ color: 'text.disabled', borderRadius: 1.5 }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </DialogTitle>

        {/* ── Body ── */}
        <DialogContent sx={{ px: 3, py: 3 }}>
          {apiError && (
            <Box sx={{ mb: 2, p: 1.5, bgcolor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 1 }}>
              <Typography variant="caption" color="error" fontWeight={600}>{apiError}</Typography>
            </Box>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>

            {/* Category Name */}
            <Box>
              <Label text="Category Name" required />
              <TextField
                fullWidth size="small" placeholder="e.g. Winterwear" autoFocus
                {...f.getFieldProps('name')}
                error={f.touched.name && Boolean(f.errors.name)}
                helperText={f.touched.name && f.errors.name}
                InputProps={{ sx: { borderRadius: 1, fontSize: 14 } }}
              />
            </Box>

            {/* Type — hidden when fixedType is provided */}
            {showToggle && (
              <Box>
                <Label text="Type" required />
                <ToggleButtonGroup
                  exclusive
                  value={f.values.type}
                  onChange={(_e, val) => { if (val) f.setFieldValue('type', val); }}
                  sx={{
                    width: '100%',
                    bgcolor: '#F3F4F6',
                    borderRadius: 1,
                    p: '3px',
                    gap: '3px',
                    '& .MuiToggleButtonGroup-grouped': { margin: 0 },
                  }}
                >
                  {typeOptions.map((opt) => (
                    <ToggleButton key={opt.value} value={opt.value} sx={toggleSx}>
                      {opt.label}
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
              </Box>
            )}

          </Box>
        </DialogContent>

        {/* ── Footer ── */}
        <DialogActions sx={{ px: 3, py: 2.5, borderTop: '1px solid', borderColor: 'divider', gap: 1.5 }}>
          <Button
            onClick={handleClose}
            variant="outlined"
            disabled={isPending}
            sx={{ borderRadius: 1, textTransform: 'none', fontWeight: 600, px: 3, borderColor: 'divider', color: 'text.secondary' }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => f.submitForm()}
            variant="contained"
            disabled={isPending}
            startIcon={
              isPending
                ? <CircularProgress size={15} color="inherit" />
                : isEditMode ? <EditIcon /> : <AddCircleIcon />
            }
            sx={{ borderRadius: 1, textTransform: 'none', fontWeight: 700, px: 3, boxShadow: `0 4px 12px rgba(210,18,46,0.25)` }}
          >
            {isPending
              ? (isEditMode ? 'Saving…'  : 'Adding…')
              : (isEditMode ? 'Save Changes' : 'Add Category')
            }
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Success toast ── */}
      <SuccessToast
        message={successMsg}
        severity="success"
        onClose={() => setSuccessMsg('')}
      />
    </>
  );
};

export default AddCategoryDialog;
