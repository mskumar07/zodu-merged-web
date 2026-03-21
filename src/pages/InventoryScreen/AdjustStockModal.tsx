import React, { useState } from 'react';
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
} from '@mui/material';
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

const theme = createTheme({
  palette: {
    primary: {
      main: '#D2122E',
    },
    background: {
      default: '#f8f6f6',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Poppins", sans-serif',
  },
  shape: {
    borderRadius: 12,
  },
});

interface AdjustStockModalProps {
  open: boolean;
  onClose: () => void;
}

const AdjustStockModal: React.FC<AdjustStockModalProps> = ({ open, onClose }) => {
  const [selectedItem, setSelectedItem] = useState('Organic Espresso Beans - 1kg');
  const [currentStock] = useState(42);
  const [adjustmentType, setAdjustmentType] = useState<'add' | 'subtract'>('add');
  const [adjustmentQuantity, setAdjustmentQuantity] = useState<number>(0);
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');

  const handleAdjustmentTypeChange = (
    event: React.MouseEvent<HTMLElement>,
    newType: 'add' | 'subtract' | null
  ) => {
    if (newType !== null) {
      setAdjustmentType(newType);
    }
  };

  const handleItemChange = (event: SelectChangeEvent) => {
    setSelectedItem(event.target.value);
  };

  const handleReasonChange = (event: SelectChangeEvent) => {
    setReason(event.target.value);
  };

  const calculateNewStock = () => {
    if (adjustmentType === 'add') {
      return currentStock + adjustmentQuantity;
    } else {
      return currentStock - adjustmentQuantity;
    }
  };

  const handleSave = () => {
    // Handle save logic here
    console.log({
      selectedItem,
      adjustmentType,
      adjustmentQuantity,
      reason,
      notes,
      newStock: calculateNewStock(),
    });
    onClose();
  };

  return (
    <ThemeProvider theme={theme}>
      <Dialog
        open={open}
        onClose={onClose}
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
          <IconButton onClick={onClose} size="small" sx={{ color: '#94a3b8', mr: -0.5 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        {/* Content */}
        <DialogContent sx={{ px: 2.75, py: 2.5 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.75 }}>
            {/* Row 1: Item Name & Current Stock */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 2.5 }}>
              <FormControl fullWidth>
                <Typography
                  variant="body2"
                  fontWeight={600}
                  sx={{ mb: 1, fontSize: '0.92rem', color: '#475569' }}
                >
                  Item Name
                </Typography>
                <Select
                  value={selectedItem}
                  onChange={handleItemChange}
                  startAdornment={
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: '#94a3b8', fontSize: 20 }} />
                    </InputAdornment>
                  }
                  IconComponent={ExpandMoreIcon}
                  sx={{
                    bgcolor: '#fbfcfe',
                    borderRadius: '12px',
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
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#dbe3ef',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#cbd5e1',
                    },
                    '& .MuiSvgIcon-root': {
                      color: '#94a3b8',
                    },
                  }}
                >
                  <MenuItem value="Select an item...">Select an item...</MenuItem>
                  <MenuItem value="Organic Espresso Beans - 1kg">
                    Organic Espresso Beans - 1kg
                  </MenuItem>
                  <MenuItem value="Oat Milk - Barista Edition">Oat Milk - Barista Edition</MenuItem>
                  <MenuItem value="Paper Coffee Filters (100ct)">
                    Paper Coffee Filters (100ct)
                  </MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <Typography
                  variant="body2"
                  fontWeight={600}
                  sx={{ mb: 1, fontSize: '0.92rem', color: '#475569' }}
                >
                  Current Stock
                </Typography>
                <TextField
                  value={`${currentStock} units`}
                  disabled
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: '#f1f5f9',
                      borderRadius: '12px',
                      minHeight: 40,
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#dbe3ef',
                      },
                    },
                    '& .MuiInputBase-input': {
                      py: 1.1,
                      color: '#64748b',
                      fontWeight: 500,
                    },
                  }}
                />
              </FormControl>
            </Box>

            {/* Row 2: Adjustment Type & Quantity */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2.5 }}>
              <Box>
                <Typography
                  variant="body2"
                  fontWeight={600}
                  sx={{ mb: 1, fontSize: '0.92rem', color: '#475569' }}
                >
                  Adjustment Type
                </Typography>
                <ToggleButtonGroup
                  value={adjustmentType}
                  exclusive
                  onChange={handleAdjustmentTypeChange}
                  sx={{
                    bgcolor: '#f8fafc',
                    p: 0.5,
                    borderRadius: '12px',
                    border: '1px solid #dbe3ef',
                    width: 'fit-content',
                    gap: 0.5,
                  }}
                >
                  <ToggleButton
                    value="add"
                    sx={{
                      border: 'none',
                      borderRadius: '8px !important',
                      px: 2,
                      py: 0.9,
                      textTransform: 'uppercase',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      letterSpacing: '0.05em',
                      color: '#64748b',
                      '&.Mui-selected': {
                        bgcolor: 'primary.main',
                        color: 'white',
                        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                        '&:hover': {
                          bgcolor: 'primary.main',
                                                  color: 'white',

                        },
                      },
                      '&:hover': {
                        bgcolor: 'transparent',
                        color: '#334155',
                      },
                    }}
                  >
                    <AddIcon sx={{ fontSize: 18, mr: 1 }} />
                    Add
                  </ToggleButton>
                  <ToggleButton
                    value="subtract"
                    sx={{
                      border: 'none',
                      borderRadius: '8px !important',
                      px: 2,
                      py: 0.9,
                      textTransform: 'uppercase',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      letterSpacing: '0.05em',
                      color: '#64748b',
                      '&.Mui-selected': {
                      bgcolor: 'primary.main',
                        color: 'white',
                        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                        '&:hover': {
                          bgcolor: 'primary.main',
                                                  color: 'white',

                        },
                      },
                      '&:hover': {
                        bgcolor: 'transparent',
                        color: '#334155',
                      },
                    }}
                  >
                    <RemoveIcon sx={{ fontSize: 18, mr: 1 }} />
                    Subtract
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>

              <FormControl fullWidth>
                <Typography
                  variant="body2"
                  fontWeight={600}
                  sx={{ mb: 1, fontSize: '0.92rem', color: '#475569' }}
                >
                  Adjustment Quantity
                </Typography>
                <TextField
                  type="number"
                  value={adjustmentQuantity}
                  onChange={(e) => setAdjustmentQuantity(Number(e.target.value))}
                  placeholder="0"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      minHeight: 40,
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#dbe3ef',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#cbd5e1',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'primary.main',
                        borderWidth: 2,
                      },
                    },
                    '& .MuiInputBase-input': {
                      py: 1.1,
                    },
                  }}
                />
              </FormControl>
            </Box>

            {/* Row 3: New Stock Level Preview */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2.5, mt: -0.5 }}>
              <Box />
              <Box>
                <Typography
                  variant="body2"
                  fontWeight={600}
                  sx={{ mb: 1, fontSize: '0.92rem', color: '#475569' }}
                >
                  New Stock Level Preview
                </Typography>
                <Box
                  sx={{
                    px: 2,
                    py: 1.35,
                    borderRadius: '12px',
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
                    {calculateNewStock()} units
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Row 4: Reason */}
            <FormControl fullWidth>
              <Typography
                variant="body2"
                fontWeight={600}
                sx={{ mb: 1, fontSize: '0.92rem', color: '#475569' }}
              >
                Reason for Adjustment
              </Typography>
              <Select
                value={reason}
                onChange={handleReasonChange}
                displayEmpty
                IconComponent={ExpandMoreIcon}
                sx={{
                  bgcolor: '#fbfcfe',
                  borderRadius: '12px',
                  minHeight: 40,
                  '& .MuiSelect-select': {
                    display: 'flex',
                    alignItems: 'center',
                    minHeight: '40px !important',
                    py: 0,
                    color: reason ? '#334155' : '#64748b',
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#dbe3ef',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#cbd5e1',
                  },
                  '& .MuiSvgIcon-root': {
                    color: '#94a3b8',
                  },
                }}
              >
                <MenuItem value="">Select a reason...</MenuItem>
                <MenuItem value="new_stock">Received New Stock</MenuItem>
                <MenuItem value="damage">Damaged Goods</MenuItem>
                <MenuItem value="return">Customer Return</MenuItem>
                <MenuItem value="correction">Physical Count Correction</MenuItem>
                <MenuItem value="expiry">Expired Stock</MenuItem>
              </Select>
            </FormControl>

            {/* Row 5: Notes */}
            <FormControl fullWidth>
              <Typography
                variant="body2"
                fontWeight={600}
                sx={{ mb: 1, fontSize: '0.92rem', color: '#475569' }}
              >
                Notes{' '}
                <Box component="span" sx={{ fontWeight: 400, color: '#94a3b8' }}>
                  (Optional)
                </Box>
              </Typography>
              <TextField
                multiline
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add additional details about this adjustment..."
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#dbe3ef',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#cbd5e1',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main',
                      borderWidth: 2,
                    },
                  },
                  '& .MuiInputBase-inputMultiline': {
                    color: '#334155',
                  },
                }}
              />
            </FormControl>
          </Box>
        </DialogContent>

        {/* Footer */}
        <DialogActions
          sx={{
            px: 2.75,
            py: 2.25,
            borderTop: '1px solid #f1f5f9',
            bgcolor: '#fbfcfe',
            gap: 1.5,
            justifyContent: 'flex-end',
          }}
        >
          <Button
            onClick={onClose}
            variant="outlined"
            sx={{
              borderRadius: '12px',
              px: 3,
              py: 1.05,
              fontWeight: 700,
              textTransform: 'none',
              borderColor: '#d7dfeb',
              color: '#475569',
              bgcolor: '#fff',
              '&:hover': {
                borderColor: '#94a3b8',
                bgcolor: '#f1f5f9',
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            startIcon={<CheckCircleIcon sx={{ fontSize: 20 }} />}
            sx={{
              borderRadius: '12px',
              px: 3,
              py: 1.05,
              fontWeight: 700,
              textTransform: 'none',
              boxShadow: '0 10px 20px rgba(210, 18, 46, 0.28)',
              '&:hover': {
                bgcolor: 'rgba(210, 18, 46, 0.9)',
              },
            }}
          >
            Save Adjustment
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
};

export default AdjustStockModal;
