import React, { useEffect, useRef, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Typography, TextField, Button, IconButton,
  ToggleButtonGroup, ToggleButton, FormControl,
  Select, MenuItem, InputAdornment, Tooltip, CircularProgress, ListSubheader,
} from '@mui/material';
import SuccessToast from '@components/Common/SuccessToast';
import { useFormik } from 'formik';
import axios from 'axios';
import AddCircleIcon        from '@mui/icons-material/AddCircle';
import CloseIcon            from '@mui/icons-material/Close';
import AddAPhotoIcon        from '@mui/icons-material/AddAPhoto';
import QrCodeScannerIcon    from '@mui/icons-material/QrCodeScanner';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import SaveIcon             from '@mui/icons-material/Save';
import InventoryIcon        from '@mui/icons-material/Inventory2Outlined';
import SearchIcon           from '@mui/icons-material/Search';
import axiosInstance from '@store/services/axiosInstance';
import { apiConfig } from '@config/api';
import { addItemSchema } from './ItemValidation';
import {
  useInfiniteCategoryList,
  useAddMenuItem,
  useEditMenuItem,
  useGstList,
  useUnitList,
  checkItemId,
  type Category,
  type MenuItem as MenuItemData,
  type AddMenuItemResponse,
  type GstOption,
  type UnitOption,
} from './useMenuItemApi';
import AddCategoryDialog from './AddCategoryDialog';

interface AddItemModalProps {
  open:      boolean;
  onClose:   () => void;
  onSave?:   (data: AddMenuItemResponse) => void;
  editItem?: MenuItemData | null;
}

// ── 1. INITIAL_VALUES — itemId added ─────────────────────────
const INITIAL_VALUES = {
  serviceType:   'product' as 'product' | 'service',
  inventoryType: 'sellable' as 'sellable' | 'raw',
  itemId:        '',          // ← item_id in payload
  name:          '',
  category:      '',
  unit:          '' as string,
  purchasePrice: '',
  mrp:           '',
  rate:          '',
  gstId:         '' as string,
  taxInclusion:  'Incl.' as 'Incl.' | 'Excl.',
  hsn:           '',
  barcode:       '',
  openingStock:  '',
  lowStockAlert: '',
};

// ─── Helper components ────────────────────────────────────────
const Label: React.FC<{ text: string; required?: boolean }> = ({ text, required }) => (
  <Typography variant="body2" fontWeight={600} mb={0.8} color="text.primary">
    {text}{required && <Box component="span" sx={{ color: 'primary.main', ml: 0.3 }}>*</Box>}
  </Typography>
);

// ─── Main AddItemModal ────────────────────────────────────────
const AddItemModal: React.FC<AddItemModalProps> = ({ open, onClose, onSave, editItem }) => {
  const isEditMode = Boolean(editItem);

  const [catDialogOpen,    setCatDialogOpen]    = useState(false);
  const [imagePreview,     setImagePreview]     = useState<string | null>(null);
  const [imageFile,        setImageFile]        = useState<File | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(editItem?.item_img ?? null);
  const [imageUploading,   setImageUploading]   = useState(false);
  const [categorySearch,   setCategorySearch]   = useState('');
  const [unitSearch,       setUnitSearch]       = useState('');
  const [gstSearch,        setGstSearch]        = useState('');
  const [itemIdError,      setItemIdError]      = useState<string | null>(null);
  const [itemIdChecking,   setItemIdChecking]   = useState(false);
  const [successMsg,       setSuccessMsg]       = useState("");
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setUploadedImageUrl(editItem?.item_img ?? null);
    setImagePreview(editItem?.item_img ?? null);
    setImageFile(null);
  }, [editItem]);

  // ── 2. getInitialValues — itemId pre-filled in edit mode ────
  const getInitialValues = () => {
    if (!editItem) return INITIAL_VALUES;
    return {
      serviceType:   (editItem.item_type === 'S' ? 'product' : 'service') as 'product' | 'service',
      inventoryType: 'sellable' as 'sellable' | 'raw',
      itemId:        editItem.item_id         ?? '',      // ← pre-fill in edit mode
      name:          editItem.item_name       ?? '',
      category:      editItem.category_id     ? String(editItem.category_id) : '',
      unit:          editItem.unit            ? String(editItem.unit)         : '',
      purchasePrice: editItem.purchase_price  ?? '',
      mrp:           editItem.mrp             ?? '',
      rate:          editItem.sell_price      ?? '',
      gstId:         editItem.gst_type        ? String(editItem.gst_type)    : '',
      taxInclusion:  editItem.tax_incl_type   ? 'Incl.' : 'Excl.' as 'Incl.' | 'Excl.',
      hsn:           editItem.hsn_code        ?? '',
      barcode:       editItem.barcode         ?? '',
      openingStock:  '',
      lowStockAlert: '',
    };
  };

  const formik = useFormik({
    initialValues:      getInitialValues(),
    enableReinitialize: true,
    validationSchema:   addItemSchema,
    onSubmit: (values) => {
      // ── 3. payload — item_id included ───────────────────────
      const payload = {
        item_id:        values.itemId.trim() || undefined,   // optional on create, present on edit
        item_type:      values.serviceType === 'product' ? 'S' as const : 'P' as const,
        item_name:      values.name.trim(),
        category_id:    values.category     ? Number(values.category)     : null,
        unit:           values.unit         ? Number(values.unit)         : null,
        purchase_price: values.purchasePrice ? Number(values.purchasePrice) : null,
        mrp:            values.mrp           ? Number(values.mrp)           : null,
        sell_price:     values.rate          ? Number(values.rate)          : null,
        gst_type:       values.gstId         ? Number(values.gstId)         : null,
        tax_incl_type:  values.taxInclusion === 'Incl.',
        hsn_code:       values.hsn     || null,
        barcode:        values.barcode || null,
        item_img:       uploadedImageUrl,
        status:         'active' as const,
        opening_stock:  values.openingStock  ? Number(values.openingStock)  : null,
        reorder_level:  values.lowStockAlert ? Number(values.lowStockAlert) : null,
      };

      if (isEditMode && editItem) {
        editItem_({ item_uuid: editItem.item_uuid, ...payload });
      } else {
        saveItem(payload);
      }
    },
  });

  const catType = 'S,M';
  const catIsFetchingRef = React.useRef(false);
  const {
    data:                catPages,
    isLoading:           categoriesLoading,
    hasNextPage:         catHasNextPage,
    isFetchingNextPage:  catIsFetchingNextPage,
    fetchNextPage:       catFetchNextPage,
  } = useInfiniteCategoryList(open, catType);

  const categories: Category[] = catPages?.pages.flatMap((p) =>
    p.Data.map((c) => ({ value: String(c.id), label: c.name }))
  ) ?? [];

  const handleCatScroll = (e: React.UIEvent<HTMLElement>) => {
    const el = e.currentTarget;
    if (
      el.scrollTop + el.clientHeight >= el.scrollHeight - 40 &&
      catHasNextPage && !catIsFetchingNextPage && !catIsFetchingRef.current
    ) {
      catIsFetchingRef.current = true;
      catFetchNextPage().finally(() => { catIsFetchingRef.current = false; });
    }
  };
  const { data: gstOptions  = [], isLoading: gstLoading  }      = useGstList();
  const { data: unitOptions = [], isLoading: unitsLoading }      = useUnitList();

  const { mutate: saveItem,  isPending: saving,  isError: saveError, error: saveErr, reset: resetSave } = useAddMenuItem({
    onSuccess: (data) => { setSuccessMsg("Item added successfully!"); onSave?.(data); handleReset(); },
  });
  const { mutate: editItem_, isPending: editing, isError: editError, error: editErr, reset: resetEdit } = useEditMenuItem({
    onSuccess: (data) => { setSuccessMsg("Item updated successfully!"); onSave?.(data); handleReset(); },
  });

  const isSaving = saving || editing;
  const hasError = saveError || editError;
  const errObj   = saveErr   || editErr;

  const handleReset = () => {
    formik.resetForm();
    resetSave();
    resetEdit();
    setImagePreview(null);
    setImageFile(null);
    setUploadedImageUrl(editItem?.item_img ?? null);
    setCategorySearch('');
    setUnitSearch('');
    setGstSearch('');
    setItemIdError(null);
    onClose();
  };

  const handleClose = () => { if (isSaving) return; handleReset(); };

  const handleServiceTypeChange = (_e: unknown, val: 'product' | 'service') => {
    if (!val) return;
    formik.setFieldValue('serviceType', val);
    formik.setFieldValue('category', '');
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.append('file', file);
    try {
      setImageUploading(true);
      const response = await axiosInstance.post(apiConfig.uploadImage(), formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const fileUrl =
        response.data?.fileUrl     ||
        response.data?.data?.fileUrl ||
        response.data?.url          ||
        response.data?.path         ||
        response.data?.location     ||
        (typeof response.data === 'string' ? response.data : null);
      if (!fileUrl) throw new Error('Failed to upload image');
      setUploadedImageUrl(fileUrl);
    } finally {
      setImageUploading(false);
    }
  };

  const handleCategoryAdded = (cat: Category) => {
    formik.setFieldValue('category', cat.value);
  };

  const handleItemIdBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    formik.handleBlur(e);
    const value = e.target.value.trim();
    if (!value) { setItemIdError(null); return; }
    // In edit mode skip the check when the ID hasn't changed
    if (isEditMode && editItem && value === editItem.item_id) { setItemIdError(null); return; }
    setItemIdChecking(true);
    setItemIdError(null);
    try {
      const res = await checkItemId(value);
      if (res.exists) setItemIdError('Entered Item ID Already Exist');
    } catch {
      // silently ignore network errors for the duplicate check
    } finally {
      setItemIdChecking(false);
    }
  };

  const err   = formik.errors;
  const touch = formik.touched;

  const filteredCategories = categories.filter(c =>
    c.label.toLowerCase().includes(categorySearch.trim().toLowerCase())
  );
  const filteredUnits = unitOptions.filter(u =>
    u.label.toLowerCase().includes(unitSearch.trim().toLowerCase()) ||
    u.shortName.toLowerCase().includes(unitSearch.trim().toLowerCase())
  );
  const filteredGstOptions = gstOptions.filter(g =>
    g.label.toLowerCase().includes(gstSearch.trim().toLowerCase()) ||
    String(g.percentage).includes(gstSearch.trim())
  );

  const toggleGroupSx = {
    bgcolor: 'action.hover', borderRadius: 1.5, p: '4px', gap: '3px', width: '100%',
    '& .MuiToggleButtonGroup-grouped': { margin: 0 },
  };

  const getToggleSx = (colored?: boolean) => ({
    flex: 1, border: 'none !important', borderRadius: '7px !important',
    textTransform: 'none' as const, fontSize: 13, fontWeight: 600, height: 34,
    color: 'text.secondary',
    '&.Mui-selected': {
      color:   colored ? '#fff' : 'text.primary',
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
                <Typography fontWeight={800} fontSize={18} lineHeight={1.2} letterSpacing="-0.3px">
                  {isEditMode ? 'Edit Item' : 'Add New Item'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {isEditMode ? 'Update product or service details' : 'Create a new product or service for your catalog'}
                </Typography>
              </Box>
            </Box>
            <IconButton size="small" onClick={handleClose} disabled={isSaving}
              sx={{ color: 'text.disabled', borderRadius: 2, '&:hover': { color: 'text.secondary', bgcolor: 'action.hover' } }}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        {/* ── Body ── */}
        <DialogContent sx={{ px: 3, py: 3, overflowY: 'auto', '&::-webkit-scrollbar': { width: 5 }, '&::-webkit-scrollbar-thumb': { bgcolor: 'divider', borderRadius: 10 } }}>

          {hasError && (
            <Box sx={{ mb: 2.5, p: 1.5, bgcolor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 1.5 }}>
              <Typography variant="body2" color="error" fontWeight={600}>
                {axios.isAxiosError(errObj)
                  ? errObj?.response?.data?.message ?? errObj?.message ?? 'Unknown error'
                  : 'Failed to save item. Please try again.'}
              </Typography>
            </Box>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

            {/* Row 1: Image + Basic fields */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, mt: 2.5 }}>

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
                    backgroundImage:    imagePreview ? `url(${imagePreview})` : 'none',
                    backgroundSize:     'cover',
                    backgroundPosition: 'center',
                    '&:hover': { borderColor: 'primary.main', bgcolor: 'rgba(210,18,46,0.04)' },
                  }}>
                  {!imagePreview && (
                    <>
                      {imageUploading
                        ? <CircularProgress size={28} sx={{ mb: 0.8 }} />
                        : <AddAPhotoIcon sx={{ color: 'text.disabled', fontSize: 32, mb: 0.8 }} />}
                      <Typography variant="caption" color="text.disabled" fontWeight={500}>
                        {imageUploading ? 'Uploading…' : 'Click to upload'}
                      </Typography>
                    </>
                  )}
                </Box>
                <input ref={imageInputRef} type="file" accept="image/*" hidden onChange={handleImageChange} />
              </Box>

              {/* Basic fields */}
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>

                {/* Service Type + Inventory toggles */}
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <Box>
                    <Label text="Service Type" />
                    <ToggleButtonGroup exclusive value={formik.values.serviceType}
                      onChange={handleServiceTypeChange} sx={toggleGroupSx}>
                      <ToggleButton value="product" sx={getToggleSx(true)}>Product</ToggleButton>
                      <ToggleButton value="service" sx={getToggleSx(true)}>Service</ToggleButton>
                    </ToggleButtonGroup>
                  </Box>
                  <Box>
                    <Label text="Inventory" />
                    <ToggleButtonGroup exclusive value={formik.values.inventoryType}
                      onChange={(_e, v) => v && formik.setFieldValue('inventoryType', v)} sx={toggleGroupSx}>
                      <ToggleButton value="sellable"  sx={getToggleSx(true)}>Sellable</ToggleButton>
                      <ToggleButton value="raw"       sx={getToggleSx(true)}>Raw Material</ToggleButton>
                    </ToggleButtonGroup>
                  </Box>
                </Box>

                {/* ── 4. Item ID + Item Name in a 2-col grid ── */}
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 2 }}>
                  <Box>
                    <Label text="Item ID" required />
                    <TextField
                      fullWidth size="small"
                      placeholder="e.g. ITM-001"
                      {...formik.getFieldProps('itemId')}
                      onBlur={handleItemIdBlur}
                      onChange={(e) => {
                        formik.handleChange(e);
                        setItemIdError(null);
                      }}
                      error={(touch.itemId && Boolean(err.itemId)) || Boolean(itemIdError)}
                      helperText={
                        itemIdError
                          ? itemIdError
                          : (touch.itemId && err.itemId)
                      }
                      InputProps={{
                        sx: inputSx,
                        endAdornment: itemIdChecking
                          ? <InputAdornment position="end"><CircularProgress size={14} /></InputAdornment>
                          : undefined,
                      }}
                    />
                  </Box>
                  <Box>
                    <Label text="Item Name" required />
                    <TextField
                      fullWidth size="small"
                      placeholder="e.g. Premium Cotton Polo"
                      {...formik.getFieldProps('name')}
                      error={touch.name && Boolean(err.name)}
                      helperText={touch.name && err.name}
                      InputProps={{ sx: inputSx }}
                    />
                  </Box>
                </Box>

                {/* ── 5. Category — clean layout ── */}
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.8 }}>
                    <Label text="Category" required />
                    <Button
                      size="small"
                      startIcon={<AddCircleOutlineIcon sx={{ fontSize: '15px !important' }} />}
                      onClick={() => setCatDialogOpen(true)}
                      sx={{
                        textTransform: 'none', fontWeight: 700, fontSize: 12, px: 1.5, py: 0.4,
                        borderRadius: 1, color: 'primary.main', bgcolor: 'rgba(210,18,46,0.07)',
                        border: '1px solid rgba(210,18,46,0.2)', lineHeight: 1,
                        '&:hover': { bgcolor: 'rgba(210,18,46,0.13)', boxShadow: '0 2px 8px rgba(210,18,46,0.15)' },
                      }}>
                      Add Category
                    </Button>
                  </Box>
                  <FormControl fullWidth size="small" error={touch.category && Boolean(err.category)}>
                    <Select
                      value={formik.values.category}
                      displayEmpty
                      onChange={(e) => formik.setFieldValue('category', e.target.value)}
                      onOpen={() => setCategorySearch('')}
                      renderValue={(selected) => {
                        if (!selected) return (
                          <Box component="span" sx={{ color: 'text.disabled' }}>
                            {categoriesLoading ? 'Loading…' : 'Select Category'}
                          </Box>
                        );
                        return categories.find(c => c.value === selected)?.label ?? selected;
                      }}
                      MenuProps={{ PaperProps: { sx: { maxHeight: 340 }, onScroll: handleCatScroll } }}
                      sx={inputSx}
                      startAdornment={categoriesLoading
                        ? <InputAdornment position="start"><CircularProgress size={14} /></InputAdornment>
                        : null
                      }>
                      <ListSubheader sx={{ bgcolor: '#fff', py: 1, px: 1, borderBottom: '1px solid', borderColor: 'divider' }} onKeyDown={(e) => e.stopPropagation()}>
                        <TextField
                          size="small" fullWidth placeholder="Search category..."
                          value={categorySearch}
                          onChange={(e) => setCategorySearch(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 16, color: 'text.disabled' }} /></InputAdornment> }}
                        />
                      </ListSubheader>
                      <MenuItem value="" disabled sx={{ fontSize: 14, color: 'text.disabled' }}>Select Category</MenuItem>
                      {filteredCategories.map(c => (
                        <MenuItem key={c.value} value={c.value} sx={{ fontSize: 14 }}>{c.label}</MenuItem>
                      ))}
                      {catIsFetchingNextPage && (
                        <MenuItem disabled sx={{ fontSize: 12, color: 'text.disabled', justifyContent: 'center' }}>Loading...</MenuItem>
                      )}
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
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr 1fr' }, gap: 2 }}>
                <Box>
                  <Label text="Item Unit" />
                  <FormControl fullWidth size="small">
                    <Select
                      value={formik.values.unit}
                      onChange={(e) => formik.setFieldValue('unit', e.target.value)}
                      onOpen={() => setUnitSearch('')}
                      displayEmpty
                      renderValue={(v) => {
                        if (!v) return <Box component="span" sx={{ color: 'text.disabled' }}>{unitsLoading ? 'Loading…' : 'Select Unit'}</Box>;
                        return unitOptions.find(u => String(u.value) === v)?.label ?? v;
                      }}
                      startAdornment={unitsLoading ? <InputAdornment position="start"><CircularProgress size={14} /></InputAdornment> : null}
                      MenuProps={{ PaperProps: { sx: { maxHeight: 340 } } }}
                      sx={inputSx}>
                      <ListSubheader sx={{ bgcolor: '#fff', py: 1, px: 1, borderBottom: '1px solid', borderColor: 'divider' }} onKeyDown={(e) => e.stopPropagation()}>
                        <TextField size="small" fullWidth placeholder="Search unit..."
                          value={unitSearch}
                          onChange={(e) => setUnitSearch(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 16, color: 'text.disabled' }} /></InputAdornment> }}
                        />
                      </ListSubheader>
                      <MenuItem value="" disabled sx={{ fontSize: 14, color: 'text.disabled' }}>Select Unit</MenuItem>
                      {filteredUnits.map((u: UnitOption) => (
                        <MenuItem key={u.value} value={String(u.value)} sx={{ fontSize: 14 }}>{u.label}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
                <Box>
                  <Label text="Purchase Price" required />
                  <TextField fullWidth size="small" type="number" placeholder="0.00"
                    {...formik.getFieldProps('purchasePrice')}
                    error={touch.purchasePrice && Boolean(err.purchasePrice)}
                    helperText={touch.purchasePrice && err.purchasePrice}
                    InputProps={{ startAdornment: <InputAdornment position="start"><Typography variant="body2" color="text.disabled" fontWeight={600}>₹</Typography></InputAdornment>, sx: inputSx }} />
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

            {/* Row 3: Inventory (collapsible) */}
           

            {/* Row 4: Tax */}
            <Box sx={{ bgcolor: 'action.hover', borderRadius: 1.5, p: 2.5 }}>
              <Typography variant="body2" fontWeight={700} color="text.secondary" textTransform="uppercase" letterSpacing="0.06em" fontSize={11} mb={2}>
                Tax Information
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2.5 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Label text="Tax Type" required />
                    <FormControl fullWidth size="small" error={touch.gstId && Boolean(err.gstId)}>
                      <Select value={formik.values.gstId}
                        onChange={(e) => formik.setFieldValue('gstId', e.target.value)}
                        onOpen={() => setGstSearch('')}
                        displayEmpty
                        renderValue={(v) => {
                          if (!v) return <Box component="span" sx={{ color: 'text.disabled' }}>{gstLoading ? 'Loading…' : 'Select Tax'}</Box>;
                          return gstOptions.find(g => String(g.value) === v)?.label ?? v;
                        }}
                        startAdornment={gstLoading ? <InputAdornment position="start"><CircularProgress size={14} /></InputAdornment> : null}
                        MenuProps={{ PaperProps: { sx: { maxHeight: 340 } } }}
                        sx={{ ...inputSx, bgcolor: 'background.paper' }}>
                        <ListSubheader sx={{ bgcolor: '#fff', py: 1, px: 1, borderBottom: '1px solid', borderColor: 'divider' }} onKeyDown={(e) => e.stopPropagation()}>
                          <TextField size="small" fullWidth placeholder="Search tax..."
                            value={gstSearch}
                            onChange={(e) => setGstSearch(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 16, color: 'text.disabled' }} /></InputAdornment> }}
                          />
                        </ListSubheader>
                        <MenuItem value="" disabled sx={{ fontSize: 14, color: 'text.disabled' }}>Select Tax</MenuItem>
                        {filteredGstOptions.map((g: GstOption) => (
                          <MenuItem key={g.value} value={String(g.value)} sx={{ fontSize: 14 }}>{g.label}</MenuItem>
                        ))}
                      </Select>
                      {touch.gstId && err.gstId && (
                        <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>{err.gstId}</Typography>
                      )}
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

            <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1.5, overflow: 'hidden' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, px: 2.5, py: 1.5, bgcolor: 'action.hover' }}>
                <InventoryIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="body2" fontWeight={700} color="text.secondary" textTransform="uppercase" letterSpacing="0.06em" fontSize={11}>
                  Inventory
                </Typography>
                <Box sx={{ ml: 1, px: 1, py: 0.2, bgcolor: 'action.selected', borderRadius: 5 }}>
                  <Typography sx={{ fontSize: 9, fontWeight: 700, color: 'text.secondary', letterSpacing: '0.04em' }}>OPTIONAL</Typography>
                </Box>
              </Box>
              <Box sx={{ px: 2.5, py: 2.5, borderTop: '1px solid', borderColor: 'divider', display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2.5 }}>
                <Box>
                  <Label text="Opening Stock" />
                  <TextField fullWidth size="small" type="number" placeholder="0"
                    {...formik.getFieldProps('openingStock')}
                    InputProps={{ endAdornment: <InputAdornment position="end"><Typography variant="caption" color="text.disabled" fontWeight={600}>{unitOptions.find(u => String(u.value) === formik.values.unit)?.shortName ?? 'UNIT'}</Typography></InputAdornment>, sx: inputSx }} />
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    Current stock quantity at the time of adding this item
                  </Typography>
                </Box>
                <Box>
                  <Label text="Low Stock Alert" />
                  <TextField fullWidth size="small" type="number" placeholder="e.g. 10"
                    {...formik.getFieldProps('lowStockAlert')}
                    InputProps={{ endAdornment: <InputAdornment position="end"><Typography variant="caption" color="text.disabled" fontWeight={600}>{unitOptions.find(u => String(u.value) === formik.values.unit)?.shortName ?? 'UNIT'}</Typography></InputAdornment>, sx: inputSx }} />
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    Alert when stock falls below this quantity
                  </Typography>
                </Box>
              </Box>
            </Box>

          </Box>
        </DialogContent>

        {/* ── Footer ── */}
        <DialogActions sx={{ px: 3, py: 2.5, borderTop: '1px solid', borderColor: 'divider', gap: 1.5, justifyContent: 'flex-end' }}>
          <Button onClick={handleClose} variant="outlined" disabled={isSaving}
            sx={{ borderRadius: 1, textTransform: 'none', fontWeight: 600, px: 3, height: 42, borderColor: 'divider', color: 'text.secondary' }}>
            Cancel
          </Button>
          <Button
            onClick={async () => {
              if (itemIdError) return;
              const errors = await formik.validateForm();
              if (Object.keys(errors).length > 0) {
                formik.setTouched(
                  Object.keys(INITIAL_VALUES).reduce((acc, k) => ({ ...acc, [k]: true }), {})
                );
                return;
              }
              formik.submitForm();
            }}
            variant="contained"
            disabled={isSaving}
            startIcon={isSaving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
            sx={{ borderRadius: 1, textTransform: 'none', fontWeight: 700, px: 4, height: 42, boxShadow: '0 4px 14px rgba(210,18,46,0.25)', '&:active': { transform: 'scale(0.98)' } }}>
            {saving ? 'Saving…' : 'Save Item'}
          </Button>
        </DialogActions>
      </Dialog>

      <AddCategoryDialog
        open={catDialogOpen}
        serviceType={formik.values.serviceType}
        onClose={() => setCatDialogOpen(false)}
        onAdded={handleCategoryAdded}
      />

      <SuccessToast message={successMsg} onClose={() => setSuccessMsg("")} />
    </>
  );
};

export default AddItemModal;