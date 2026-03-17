import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';

const PageHeader: React.FC<{ onAddNew: () => void }> = ({ onAddNew }) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: { xs: 'column', md: 'row' },
      justifyContent: 'space-between',
      alignItems: { xs: 'flex-start', md: 'center' },
      gap: 2,
      mb: 4,
    }}
  >
    <Box>
      <Typography variant="h4" fontWeight={900} letterSpacing="-0.5px" color="text.primary">
        Items/Products
      </Typography>
      <Typography variant="body2" color="text.secondary" mt={0.5}>
        Configure your product catalog, pricing structures, and taxation.
      </Typography>
    </Box>
    <Button
      variant="contained"
      startIcon={<AddCircleIcon />}
      onClick={onAddNew}
      sx={{
        borderRadius: 3,
        fontWeight: 700,
        px: 3,
        py: 1.2,
        boxShadow: '0 4px 14px rgba(210,18,46,0.25)',
        textTransform: 'none',
        fontSize: 14,
        '&:hover': { boxShadow: '0 6px 18px rgba(210,18,46,0.35)' },
      }}
    >
      Add New Item
    </Button>
  </Box>
);

export default PageHeader;
