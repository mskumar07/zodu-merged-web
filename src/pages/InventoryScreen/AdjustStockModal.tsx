import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  ToggleButton,
  ToggleButtonGroup,
  IconButton,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import SuccessToast from '@components/Common/SuccessToast';
import {
  Close as CloseIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  CheckCircle as CheckCircleIcon,
  Inventory2 as Inventory2Icon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import type { SelectChangeEvent } from '@mui/material/Select';
import {
  useInfiniteInventory,
  useAdjustStock,
  type InventoryItem,
  type AdjustStockResponse,
} from './useInventoryApi';

const theme = createTheme({
  palette: {
    primary: { main: '#D2122E' },
    background: { default: '#f8f6f6', paper: '#ffffff' },
  },
  shape: { borderRadius: 12 },
});

interface AdjustStockModalProps {
  open:             boolean;
  onClose:          () => void;
  // Optional: pre-select an item when opened from the inventory row
  preselectedItem?: InventoryItem | null;
  onSuccess?:       (res: AdjustStockResponse) => void;
}

const REASONS = [
  { value: 'new_stock',  label: 'Received New Stock'        },
  { value: 'damage',     label: 'Damaged Goods'             },
  { value: 'return',     label: 'Customer Return'           },
  { value: 'correction', label: 'Physical Count Correction' },
  { value: 'expiry',     label: 'Expired Stock'             },
];

const AdjustStockModal: React.FC<AdjustStockModalProps> = ({
  open,
  onClose,
  preselectedItem,
  onSuccess,
}) => {
  // ── State ──────────────────────────────────────────────────
  const [selectedUuid,       setSelectedUuid]       = useState('');
  const [adjustmentType,     setAdjustmentType]     = useState<'add' | 'subtract'>('add');
  const [adjustmentQuantity, setAdjustmentQuantity] = useState('');
  const [reason,             setReason]             = useState('');
  const [notes,              setNotes]              = useState('');
  const [apiError,           setApiError]           = useState<string | null>(null);
  const [successMsg,         setSuccessMsg]         = useState("");

  // ── Fetch full inventory list for the dropdown ─────────────
  const { data: inventoryPages } = useInfiniteInventory({ limit: 100 });
  const inventoryItems: InventoryItem[] =
    (inventoryPages?.pages ?? []).flatMap(p => p.data);

  // ── Derive selected item data ─────────────────────────────
  // Priority: preselectedItem (already loaded, instant) → dropdown selection
  const selectedItem = preselectedItem?.inventory_uuid === selectedUuid
    ? preselectedItem
    : inventoryItems.find(i => i.inventory_uuid === selectedUuid);
  const currentStock = selectedItem ? Number(selectedItem.available_qty) : 0;
  const unitLabel    = selectedItem?.unit_short_name ?? 'units';

  // ── Pre-select item when opened from a list row ───────────
  useEffect(() => {
    if (open && preselectedItem) {
      setSelectedUuid(preselectedItem.inventory_uuid);
    }
  }, [open, preselectedItem]);

  // ── Reset form on close ───────────────────────────────────
  useEffect(() => {
    if (!open) {
      if (!preselectedItem) setSelectedUuid('');
      setAdjustmentType('add');
      setAdjustmentQuantity('');
      setReason('');
      setNotes('');
      setApiError(null);
    }
  }, [open, preselectedItem]);

  // ── Adjust stock mutation ─────────────────────────────────
  const { mutate, isPending } = useAdjustStock({
    onSuccess: (res) => { setSuccessMsg("Stock adjusted successfully!"); onSuccess?.(res); onClose(); },
    onError:   (msg) => setApiError(msg),
  });

  // ── Handlers ──────────────────────────────────────────────
  const handleAdjustmentTypeChange = (
    _e: React.MouseEvent<HTMLElement>,
    val: 'add' | 'subtract' | null,
  ) => { if (val !== null) setAdjustmentType(val); };

  const handleItemChange = (e: SelectChangeEvent) => {
    setSelectedUuid(e.target.value);
    setAdjustmentQuantity('');
    setApiError(null);
  };

  const handleReasonChange = (e: SelectChangeEvent) => setReason(e.target.value);
  const parsedAdjustmentQuantity = Number(adjustmentQuantity || 0);

  const calculateNewStock = () =>
    adjustmentType === 'add'
      ? currentStock + parsedAdjustmentQuantity
      : Math.max(0, currentStock - parsedAdjustmentQuantity);

  const handleSave = () => {
    setApiError(null);
    if (!selectedUuid)                                         return setApiError('Please select an item');
    if (!reason)                                               return setApiError('Please select a reason');
    if (!parsedAdjustmentQuantity || parsedAdjustmentQuantity <= 0) return setApiError('Adjustment quantity must be greater than 0');
    if (adjustmentType === 'subtract' && parsedAdjustmentQuantity > currentStock)
      return setApiError(`Cannot subtract ${adjustmentQuantity} — only ${currentStock} ${unitLabel} available`);

    mutate({
      inventory_uuid:  selectedUuid,
      adjustment_type: adjustmentType,
      adjustment_qty:  parsedAdjustmentQuantity,
      reason,
      notes: notes || undefined,
    });
  };

  // ─────────────────────────────────────────────────────────
  //  JSX — identical to the original UI
  // ─────────────────────────────────────────────────────────
  return (
    <ThemeProvider theme={theme}>
      <Dialog
        open={open}
        onClose={isPending ? undefined : onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            maxWidth: '620px',
            boxShadow: '0 24px 60px rgba(15, 23, 42, 0.18)',
          },
        }}
        BackdropProps={{
          sx: {
            backgroundColor: 'rgba(15, 23, 42, 0.55)',
            backdropFilter: 'blur(2px)',
          },
        }}
      >
        {/* Header */}
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #f1f5f9',
            px: 2.75,
            py: 2.25,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                bgcolor: 'rgba(210, 18, 46, 0.1)',
                width: 34,
                height: 34,
                borderRadius: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Inventory2Icon sx={{ color: 'primary.main', fontSize: 18 }} />
            </Box>
            <Typography variant="h6" fontWeight={700} sx={{ fontSize: '1.05rem', color: '#1e293b' }}>
              Adjust Stock
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small" sx={{ color: '#94a3b8', mr: -0.5 }} disabled={isPending}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        {/* Content */}
        <DialogContent sx={{ px: 2.75, py: 2.5 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.75 }}>

            {/* API error banner */}
            {apiError && (
              <Box sx={{ px: 2, py: 1.25, bgcolor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px' }}>
                <Typography variant="body2" color="error" fontWeight={600}>{apiError}</Typography>
              </Box>
            )}

            {/* Row 1: Item Name & Current Stock */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 2.5 }}>
              <FormControl fullWidth>
                <Typography variant="body2" fontWeight={600} sx={{ mb: 1, fontSize: '0.92rem', color: '#475569' }}>
                  Item Name
                </Typography>
                <Select
                  value={selectedUuid}
                  onChange={handleItemChange}
                  displayEmpty
                  startAdornment={
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: '#94a3b8', fontSize: 20 }} />
                    </InputAdornment>
                  }
                  IconComponent={ExpandMoreIcon}
                  renderValue={(v) =>
                    v
                      ? (selectedItem?.item_name ?? v)
                      : <Box component="span" sx={{ color: '#94a3b8' }}>Select an item...</Box>
                  }
                  sx={{
                    bgcolor: '#fbfcfe',
                    borderRadius: '5px',
                    minHeight: 40,
                    '& .MuiSelect-select': {
                      display: 'flex',
                      alignItems: 'center',
                      minHeight: '40px !important',
                      py: 0,
                      pl: 0.5,
                      color: '#334155',
                      fontWeight: 500,
                    },
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#dbe3ef' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#cbd5e1' },
                    '& .MuiSvgIcon-root': { color: '#94a3b8' },
                  }}
                >
                  <MenuItem value="" disabled sx={{ color: '#94a3b8' }}>Select an item...</MenuItem>
                  {inventoryItems.map(item => (
                    <MenuItem key={item.inventory_uuid} value={item.inventory_uuid} sx={{ fontSize: 14 }}>
                      {item.item_name}
                      {item.unit_short_name
                        ? <Box component="span" sx={{ color: '#94a3b8', ml: 1, fontSize: 12 }}>
                            {Number(item.available_qty)} {item.unit_short_name}
                          </Box>
                        : null}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <Typography variant="body2" fontWeight={600} sx={{ mb: 1, fontSize: '0.92rem', color: '#475569' }}>
                  Current Stock
                </Typography>
                <TextField
                  value={selectedUuid ? `${currentStock} ${unitLabel}` : '—'}
                  disabled
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: '#f1f5f9',
                      borderRadius: '5px',
                      minHeight: 40,
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: '#dbe3ef' },
                    },
                    '& .MuiInputBase-input': { py: 1.1, color: '#64748b', fontWeight: 500 },
                  }}
                />
              </FormControl>
            </Box>

            {/* Row 2: Adjustment Type & Quantity */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2.5 }}>
              <Box>
                <Typography variant="body2" fontWeight={600} sx={{ mb: 1, fontSize: '0.92rem', color: '#475569' }}>
                  Adjustment Type
                </Typography>
                <ToggleButtonGroup
                  value={adjustmentType}
                  exclusive
                  onChange={handleAdjustmentTypeChange}
                  sx={{
                    bgcolor: '#f8fafc',
                    p: 0.5,
                    borderRadius: '5px',
                    border: '1px solid #dbe3ef',
                    width: 'fit-content',
                    gap: 0.5,
                  }}
                >
                  <ToggleButton
                    value="add"
                    sx={{
                      border: 'none',
                      borderRadius: '5px !important',
                      px: 2, py: 0.9,
                      textTransform: 'uppercase',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      letterSpacing: '0.05em',
                      color: '#64748b',
                      '&.Mui-selected': {
                        bgcolor: 'primary.main', color: 'white',
                        boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)',
                        '&:hover': { bgcolor: 'primary.main', color: 'white' },
                      },
                      '&:hover': { bgcolor: 'transparent', color: '#334155' },
                    }}
                  >
                    <AddIcon sx={{ fontSize: 18, mr: 1 }} /> Add
                  </ToggleButton>
                  <ToggleButton
                    value="subtract"
                    sx={{
                      border: 'none',
                      borderRadius: '5px !important',
                      px: 2, py: 0.9,
                      textTransform: 'uppercase',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      letterSpacing: '0.05em',
                      color: '#64748b',
                      '&.Mui-selected': {
                        bgcolor: 'primary.main', color: 'white',
                        boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)',
                        '&:hover': { bgcolor: 'primary.main', color: 'white' },
                      },
                      '&:hover': { bgcolor: 'transparent', color: '#334155' },
                    }}
                  >
                    <RemoveIcon sx={{ fontSize: 18, mr: 1 }} /> Subtract
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>

              <FormControl fullWidth>
                <Typography variant="body2" fontWeight={600} sx={{ mb: 1, fontSize: '0.92rem', color: '#475569' }}>
                  Adjustment Quantity
                </Typography>
                <TextField
                  type="number"
                  value={adjustmentQuantity}
                  onChange={(e) => setAdjustmentQuantity(e.target.value)}
                  placeholder="Enter quantity"
                  inputProps={{ min: 0 }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '5px',
                      minHeight: 40,
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: '#dbe3ef' },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#cbd5e1' },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'primary.main', borderWidth: 2,
                      },
                    },
                    '& .MuiInputBase-input': { py: 1.1 },
                    '& input[type=number]': {
                      MozAppearance: 'textfield',
                    },
                    '& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button': {
                      WebkitAppearance: 'none',
                      margin: 0,
                    },
                  }}
                />
              </FormControl>
            </Box>

            {/* Row 3: New Stock Level Preview */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2.5, mt: -0.5 }}>
              <Box />
              <Box>
                <Typography variant="body2" fontWeight={600} sx={{ mb: 1, fontSize: '0.92rem', color: '#475569' }}>
                  New Stock Level Preview
                </Typography>
                <Box
                  sx={{
                    px: 2, py: 1.35,
                    borderRadius: '5px',
                    bgcolor: '#fff7f7',
                    border: '1px dashed rgba(210, 18, 46, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.95rem' }}>
                    Projected:
                  </Typography>
                  <Typography variant="h6" fontWeight={700} sx={{ color: 'primary.main', fontSize: '1.1rem' }}>
                    {calculateNewStock()} {unitLabel}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Row 4: Reason */}
            <FormControl fullWidth>
              <Typography variant="body2" fontWeight={600} sx={{ mb: 1, fontSize: '0.92rem', color: '#475569' }}>
                Reason for Adjustment
              </Typography>
              <Select
                value={reason}
                onChange={handleReasonChange}
                displayEmpty
                IconComponent={ExpandMoreIcon}
                sx={{
                  bgcolor: '#fbfcfe',
                  borderRadius: '5px',
                  minHeight: 40,
                  '& .MuiSelect-select': {
                    display: 'flex',
                    alignItems: 'center',
                    minHeight: '40px !important',
                    py: 0,
                    color: reason ? '#334155' : '#64748b',
                  },
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#dbe3ef' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#cbd5e1' },
                  '& .MuiSvgIcon-root': { color: '#94a3b8' },
                }}
              >
                <MenuItem value="">Select a reason...</MenuItem>
                {REASONS.map(r => (
                  <MenuItem key={r.value} value={r.value} sx={{ fontSize: 14 }}>{r.label}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Row 5: Notes */}
            <FormControl fullWidth>
              <Typography variant="body2" fontWeight={600} sx={{ mb: 1, fontSize: '0.92rem', color: '#475569' }}>
                Notes{' '}
                <Box component="span" sx={{ fontWeight: 400, color: '#94a3b8' }}>(Optional)</Box>
              </Typography>
              <TextField
                multiline
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add additional details about this adjustment..."
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '5px',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#dbe3ef' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#cbd5e1' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main', borderWidth: 2,
                    },
                  },
                  '& .MuiInputBase-inputMultiline': { color: '#334155' },
                }}
              />
            </FormControl>
          </Box>
        </DialogContent>

        {/* Footer */}
        <DialogActions
          sx={{
            px: 2.75, py: 2.25,
            borderTop: '1px solid #f1f5f9',
            bgcolor: '#fbfcfe',
            gap: 1.5,
            justifyContent: 'flex-end',
          }}
        >
          <Button
            onClick={onClose}
            variant="outlined"
            disabled={isPending}
            sx={{
              borderRadius: '5px', px: 3, py: 1.05,
              fontWeight: 700, textTransform: 'none',
              borderColor: '#d7dfeb', color: '#475569', bgcolor: '#fff',
              '&:hover': { borderColor: '#94a3b8', bgcolor: '#f1f5f9' },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={isPending}
            startIcon={
              isPending
                ? <CircularProgress size={18} color="inherit" />
                : <CheckCircleIcon sx={{ fontSize: 20 }} />
            }
            sx={{
              borderRadius: '5px', px: 3, py: 1.05,
              fontWeight: 700, textTransform: 'none',
              boxShadow: '0 10px 20px rgba(210, 18, 46, 0.28)',
              '&:hover': { bgcolor: 'rgba(210, 18, 46, 0.9)' },
            }}
          >
            {isPending ? 'Saving…' : 'Save Adjustment'}
          </Button>
        </DialogActions>
      </Dialog>

      <SuccessToast message={successMsg} onClose={() => setSuccessMsg("")} />
    </ThemeProvider>
  );
};

export default AdjustStockModal;
