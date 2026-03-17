import React, { useRef, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Typography, TextField, Button, IconButton,
  ToggleButtonGroup, ToggleButton, FormControl,
  Select, MenuItem, InputAdornment, Tooltip, Chip,
} from '@mui/material';
import { useFormik } from 'formik';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import CloseIcon from '@mui/icons-material/Close';
import AddAPhotoIcon from '@mui/icons-material/AddAPhoto';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import SaveIcon from '@mui/icons-material/Save';
import { addItemSchema, addCategorySchema } from './ItemValidation';


// ── Types ─────────────────────────────────────────────────────
interface Category { value: string; label: string }

const DEFAULT_CATEGORIES: Category[] = [
  { value: 'apparel', label: 'Apparel' },
  { value: 'footwear', label: 'Footwear' },
  { value: 'accessories', label: 'Accessories' },
  { value: 'textiles', label: 'Textiles' },
  { value: 'hardware', label: 'Hardware' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'service', label: 'Service' },
];

interface AddItemModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (values: typeof INITIAL_VALUES, imageFile: File | null) => void;
}

const INITIAL_VALUES = {
  serviceType: 'product' as 'product' | 'service',
  inventoryType: 'sellable' as 'sellable' | 'raw',
  name: '',
  category: '',
  unit: 'pcs' as 'pcs' | 'kg' | 'ltr' | 'box',
  mrp: '',
  rate: '',
  taxType: 'gst18',
  taxInclusion: 'Incl.' as 'Incl.' | 'Excl.',
  hsn: '',
  barcode: '',
};

// ── Helper: field label ────────────────────────────────────────
const Label: React.FC<{ text: string; required?: boolean }> = ({ text, required }) => (
  <Typography variant="body2" fontWeight={600} mb={0.8} color="text.primary">
    {text}{required && <Box component="span" sx={{ color: 'primary.main', ml: 0.3 }}>*</Box>}
  </Typography>
);

// ── Add Category nested dialog ────────────────────────────────
interface AddCategoryDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (cat: Category) => void;
}

const AddCategoryDialog: React.FC<AddCategoryDialogProps> = ({ open, onClose, onAdd }) => {
  const f = useFormik({
    initialValues: { name: '', description: '' },
    validationSchema: addCategorySchema,
    onSubmit: (values, helpers) => {
      onAdd({ value: values.name.toLowerCase().replace(/\s+/g, '_'), label: values.name.trim() });
      helpers.resetForm();
      onClose();
    },
  });

  const handleClose = () => { f.resetForm(); onClose(); };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth
      PaperProps={{ sx: { borderRadius: 3, boxShadow: '0 24px 60px rgba(0,0,0,0.2)' } }}>
      <DialogTitle sx={{ p: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 3, py: 2.5, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 38, height: 38, borderRadius: '50%', bgcolor: 'rgba(210,18,46,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AddCircleIcon sx={{ color: 'primary.main', fontSize: 20 }} />
            </Box>
            <Box>
              <Typography fontWeight={800} lineHeight={1.2} fontSize={16}>Add New Category</Typography>
              <Typography variant="caption" color="text.secondary">Create a custom product category</Typography>
            </Box>
          </Box>
          <IconButton size="small" onClick={handleClose} sx={{ color: 'text.disabled', borderRadius: 1.5 }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ px: 3, py: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Box>
            <Label text="Category Name" required />
            <TextField fullWidth size="small" placeholder="e.g. Winterwear" autoFocus
              {...f.getFieldProps('name')}
              error={f.touched.name && Boolean(f.errors.name)}
              helperText={f.touched.name && f.errors.name}
              InputProps={{ sx: { borderRadius: 2, fontSize: 14 } }} />
          </Box>
          <Box>
            <Label text="Description" />
            <TextField fullWidth size="small" multiline rows={2} placeholder="Describe this category..."
              {...f.getFieldProps('description')}
              InputProps={{ sx: { borderRadius: 2, fontSize: 14 } }} />
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2.5, borderTop: '1px solid', borderColor: 'divider', gap: 1.5 }}>
        <Button onClick={handleClose} variant="outlined"
          sx={{ borderRadius: 1, textTransform: 'none', fontWeight: 600, px: 3, borderColor: 'divider', color: 'text.secondary', '&:hover': { bgcolor: 'action.hover', borderColor: 'divider' } }}>
          Cancel
        </Button>
        <Button onClick={() => f.submitForm()} variant="contained" startIcon={<AddCircleIcon />}
          sx={{ borderRadius: 1, textTransform: 'none', fontWeight: 700, px: 3, boxShadow: '0 4px 12px rgba(210,18,46,0.25)', '&:hover': { boxShadow: '0 6px 16px rgba(210,18,46,0.35)' } }}>
          Add Category
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ── Main AddItemModal ─────────────────────────────────────────
const AddItemModal: React.FC<AddItemModalProps> = ({ open, onClose, onSave }) => {
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [catDialogOpen, setCatDialogOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const formik = useFormik({
    initialValues: INITIAL_VALUES,
    validationSchema: addItemSchema,
    onSubmit: (values, helpers) => {
      onSave(values, imageFile);
      helpers.resetForm();
      setImagePreview(null);
      setImageFile(null);
      onClose();
    },
  });

  const handleClose = () => {
    formik.resetForm();
    setImagePreview(null);
    setImageFile(null);
    onClose();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleAddCategory = (cat: Category) => {
    setCategories(prev => [...prev, cat]);
    formik.setFieldValue('category', cat.value);
  };

  const err = formik.errors;
  const touch = formik.touched;

  // Reusable toggle group styles
  const toggleGroupSx = {
    bgcolor: 'action.hover', borderRadius: 1.5, p: '4px', gap: '3px', width: '100%',
    '& .MuiToggleButtonGroup-grouped': { margin: 0 },
  };

  const getToggleSx = (colored?: boolean) => ({
    flex: 1, border: 'none !important', borderRadius: '7px !important',
    textTransform: 'none' as const, fontSize: 13, fontWeight: 600, height: 34,
    color: 'text.secondary',
    '&.Mui-selected': {
      color: colored ? '#fff' : 'text.primary',
      bgcolor: colored ? 'primary.main' : 'background.paper',
      boxShadow: colored ? '0 2px 8px rgba(210,18,46,0.3)' : '0 1px 4px rgba(0,0,0,0.1)',
      '&:hover': { bgcolor: colored ? 'primary.main' : 'background.paper' },
    },
    '&:hover': { bgcolor: 'transparent' },
  });

  const inputSx = { borderRadius: 1, fontSize: 14 };

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth
        PaperProps={{ sx: { borderRadius: 1.5, boxShadow: '0 32px 80px rgba(0,0,0,0.22)', maxHeight: '92vh' } }}
        BackdropProps={{ sx: { bgcolor: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(3px)' } }}>

        {/* ── Header ── */}
        <DialogTitle sx={{ p: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 3, py: 2.5, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ width: 42, height: 42, borderRadius: '50%', bgcolor: 'rgba(210,18,46,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AddCircleIcon sx={{ color: 'primary.main', fontSize: 22 }} />
              </Box>
              <Box>
                <Typography fontWeight={800} fontSize={18} lineHeight={1.2} letterSpacing="-0.3px">Add New Item</Typography>
                <Typography variant="caption" color="text.secondary">Create a new product or service for your catalog</Typography>
              </Box>
            </Box>
            <IconButton size="small" onClick={handleClose}
              sx={{ color: 'text.disabled', borderRadius: 2, '&:hover': { color: 'text.secondary', bgcolor: 'action.hover' } }}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        {/* ── Body ── */}
        <DialogContent sx={{ px: 3, py: 3, overflowY: 'auto', '&::-webkit-scrollbar': { width: 5 }, '&::-webkit-scrollbar-thumb': { bgcolor: 'divider', borderRadius: 10 } }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

            {/* Row 1: Image + Basic fields */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>

              {/* Image Upload */}
              <Box sx={{ width: { xs: '100%', md: 156 }, flexShrink: 0 }}>
                <Label text="Item Image" />
                <Box onClick={() => imageInputRef.current?.click()}
                  sx={{
                    aspectRatio: '1/1', width: '100%', borderRadius: 1.5, border: '2px dashed',
                    borderColor: imagePreview ? 'primary.main' : 'divider',
                    bgcolor: imagePreview ? 'transparent' : 'action.hover',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', overflow: 'hidden', transition: 'all 0.2s',
                    backgroundImage: imagePreview ? `url(${imagePreview})` : 'none',
                    backgroundSize: 'cover', backgroundPosition: 'center',
                    '&:hover': { borderColor: 'primary.main', bgcolor: 'rgba(210,18,46,0.04)' },
                  }}>
                  {!imagePreview && (
                    <>
                      <AddAPhotoIcon sx={{ color: 'text.disabled', fontSize: 32, mb: 0.8 }} />
                      <Typography variant="caption" color="text.disabled" fontWeight={500}>Click to upload</Typography>
                    </>
                  )}
                </Box>
                <input ref={imageInputRef} type="file" accept="image/*" hidden onChange={handleImageChange} />
              </Box>

              {/* Basic fields */}
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>

                {/* Type Toggles */}
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <Box>
                    <Label text="Service Type" />
                    <ToggleButtonGroup exclusive value={formik.values.serviceType}
                      onChange={(_e, v) => v && formik.setFieldValue('serviceType', v)} sx={toggleGroupSx}>
                      <ToggleButton value="product" sx={getToggleSx()}>Product</ToggleButton>
                      <ToggleButton value="service" sx={getToggleSx()}>Service</ToggleButton>
                    </ToggleButtonGroup>
                  </Box>
                  <Box>
                    <Label text="Inventory" />
                    <ToggleButtonGroup exclusive value={formik.values.inventoryType}
                      onChange={(_e, v) => v && formik.setFieldValue('inventoryType', v)} sx={toggleGroupSx}>
                      <ToggleButton value="sellable" sx={getToggleSx(true)}>Sellable</ToggleButton>
                      <ToggleButton value="raw" sx={getToggleSx(true)}>Raw Material</ToggleButton>
                    </ToggleButtonGroup>
                  </Box>
                </Box>

                {/* Item Name */}
                <Box>
                  <Label text="Item Name" required />
                  <TextField fullWidth size="small" placeholder="e.g. Premium Cotton Polo"
                    {...formik.getFieldProps('name')}
                    error={touch.name && Boolean(err.name)}
                    helperText={touch.name && err.name}
                    InputProps={{ sx: inputSx }} />
                </Box>

                {/* Category row */}
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.8 }}>
                    <Label text="Category" required />
                    <Button size="small" startIcon={<AddCircleOutlineIcon sx={{ fontSize: '15px !important' }} />}
                      onClick={() => setCatDialogOpen(true)}
                      sx={{
                        textTransform: 'none', fontWeight: 700, fontSize: 12, px: 1.5, py: 0.4,
                        borderRadius: 1, color: 'primary.main', bgcolor: 'rgba(210,18,46,0.07)',
                        border: '1px solid rgba(210,18,46,0.2)', lineHeight: 1,
                        '&:hover': { bgcolor: 'rgba(210,18,46,0.13)', boxShadow: '0 2px 8px rgba(210,18,46,0.15)' },
                        transition: 'all 0.2s',
                      }}>
                      Add Category
                    </Button>
                  </Box>
                  <FormControl fullWidth size="small" error={touch.category && Boolean(err.category)}>
                    <Select value={formik.values.category}
                      displayEmpty
                      onChange={(e) => formik.setFieldValue('category', e.target.value)}
                      renderValue={(selected) => {
                        if (!selected) {
                          return <Box component="span" sx={{ color: 'text.disabled' }}>Select Category</Box>;
                        }
                        return categories.find(c => c.value === selected)?.label ?? selected;
                      }}
                      sx={{ ...inputSx }}>
                      <MenuItem value="" disabled sx={{ fontSize: 14, color: 'text.disabled' }}>Select Category</MenuItem>
                      {categories.map(c => (
                        <MenuItem key={c.value} value={c.value} sx={{ fontSize: 14 }}>{c.label}</MenuItem>
                      ))}
                    </Select>
                    {touch.category && err.category && (
                      <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>{err.category}</Typography>
                    )}
                  </FormControl>
                </Box>
              </Box>
            </Box>

            {/* Row 2: Pricing */}
            <Box sx={{ borderTop: '1px solid', borderColor: 'divider', pt: 2.5 }}>
              <Typography variant="body2" fontWeight={700} color="text.secondary" textTransform="uppercase" letterSpacing="0.06em" fontSize={11} mb={2}>
                Pricing & Inventory
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
                <Box>
                  <Label text="Item Unit" />
                  <FormControl fullWidth size="small">
                    <Select value={formik.values.unit}
                      onChange={(e) => formik.setFieldValue('unit', e.target.value)} sx={inputSx}>
                      {['pcs', 'kg', 'ltr', 'box'].map(u => (
                        <MenuItem key={u} value={u} sx={{ fontSize: 14 }}>{u.toUpperCase()}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
                <Box>
                  <Label text="MRP" required />
                  <TextField fullWidth size="small" type="number" placeholder="0.00"
                    {...formik.getFieldProps('mrp')}
                    error={touch.mrp && Boolean(err.mrp)}
                    helperText={touch.mrp && err.mrp}
                    InputProps={{ startAdornment: <InputAdornment position="start"><Typography variant="body2" color="text.disabled" fontWeight={600}>₹</Typography></InputAdornment>, sx: inputSx }} />
                </Box>
                <Box>
                  <Label text="Selling Rate" required />
                  <TextField fullWidth size="small" type="number" placeholder="0.00"
                    {...formik.getFieldProps('rate')}
                    error={touch.rate && Boolean(err.rate)}
                    helperText={touch.rate && err.rate}
                    InputProps={{ startAdornment: <InputAdornment position="start"><Typography variant="body2" color="primary.main" fontWeight={700}>₹</Typography></InputAdornment>, sx: { ...inputSx, fontWeight: 700 } }} />
                </Box>
              </Box>
            </Box>

            {/* Row 3: Tax */}
            <Box sx={{ bgcolor: 'action.hover', borderRadius: 3, p: 2.5 }}>
              <Typography variant="body2" fontWeight={700} color="text.secondary" textTransform="uppercase" letterSpacing="0.06em" fontSize={11} mb={2}>
                Tax Information
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2.5 }}>

                {/* Left */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Label text="Tax Type" required />
                    <FormControl fullWidth size="small" error={touch.taxType && Boolean(err.taxType)}>
                      <Select value={formik.values.taxType}
                        onChange={(e) => formik.setFieldValue('taxType', e.target.value)}
                        sx={{ ...inputSx, bgcolor: 'background.paper' }}>
                        {[['gst5','GST 5%'],['gst12','GST 12%'],['gst18','GST 18%'],['gst28','GST 28%'],['exempt','Exempt']].map(([v, l]) => (
                          <MenuItem key={v} value={v} sx={{ fontSize: 14 }}>{l}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="body2" fontWeight={600} whiteSpace="nowrap">Tax Inclusion</Typography>
                    <ToggleButtonGroup exclusive value={formik.values.taxInclusion}
                      onChange={(_e, v) => v && formik.setFieldValue('taxInclusion', v)}
                      sx={{ bgcolor: 'rgba(0,0,0,0.08)', borderRadius: '999px', p: '3px', gap: '3px', '& .MuiToggleButtonGroup-grouped': { margin: 0 } }}>
                      {(['Incl.', 'Excl.'] as const).map(v => (
                        <ToggleButton key={v} value={v}
                          sx={{ border: 'none !important', borderRadius: '999px !important', textTransform: 'none', fontSize: 12, fontWeight: 600, px: 1.8, height: 28, color: 'text.secondary', '&.Mui-selected': { bgcolor: 'background.paper', color: 'text.primary', boxShadow: '0 1px 3px rgba(0,0,0,0.15)', '&:hover': { bgcolor: 'background.paper' } }, '&:hover': { bgcolor: 'transparent' } }}>
                          {v}
                        </ToggleButton>
                      ))}
                    </ToggleButtonGroup>
                  </Box>
                </Box>

                {/* Right */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Label text="HSN Code" required />
                    <TextField fullWidth size="small" placeholder="Enter HSN/SAC"
                      {...formik.getFieldProps('hsn')}
                      error={touch.hsn && Boolean(err.hsn)}
                      helperText={touch.hsn && err.hsn}
                      InputProps={{ sx: { ...inputSx, bgcolor: 'background.paper' } }} />
                  </Box>
                  <Box>
                    <Label text="Barcode / QR" />
                    <TextField fullWidth size="small" placeholder="Scan or enter code"
                      {...formik.getFieldProps('barcode')}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <Tooltip title="Scan barcode">
                              <IconButton size="small" edge="end" sx={{ color: 'text.disabled' }}>
                                <QrCodeScannerIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </InputAdornment>
                        ),
                        sx: { ...inputSx, bgcolor: 'background.paper' },
                      }} />
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        </DialogContent>

        {/* ── Footer ── */}
        <DialogActions sx={{ px: 3, py: 2.5, borderTop: '1px solid', borderColor: 'divider', gap: 1.5, justifyContent: 'flex-end' }}>
          <Button onClick={handleClose} variant="outlined"
            sx={{ borderRadius: 1, textTransform: 'none', fontWeight: 600, px: 3, height: 42, borderColor: 'divider', color: 'text.secondary', '&:hover': { bgcolor: 'action.hover', borderColor: 'divider' } }}>
            Cancel
          </Button>
          <Button onClick={() => formik.submitForm()} variant="contained" startIcon={<SaveIcon />}
            sx={{ borderRadius: 1, textTransform: 'none', fontWeight: 700, px: 4, height: 42, boxShadow: '0 4px 14px rgba(210,18,46,0.25)', '&:hover': { boxShadow: '0 6px 18px rgba(210,18,46,0.35)' }, '&:active': { transform: 'scale(0.98)' } }}>
            Save Item
          </Button>
        </DialogActions>
      </Dialog>

      {/* Nested: Add Category dialog */}
      <AddCategoryDialog
        open={catDialogOpen}
        onClose={() => setCatDialogOpen(false)}
        onAdd={handleAddCategory}
      />
    </>
  );
};

export default AddItemModal;
