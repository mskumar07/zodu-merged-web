import React from 'react';
import {
  Box,
  InputAdornment,
  TextField,
  Button,
  Paper,
  useTheme,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import AddCircleIcon from '@mui/icons-material/AddCircle';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onAddNew: () => void 
}

const FilterBar: React.FC<FilterBarProps> = ({ searchQuery, onSearchChange, onAddNew}) => {
  const theme = useTheme();

  return (
  
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', lg: 'row' },
          gap: 2,
          mb:1.5
        }}
      >
        <TextField
          fullWidth
          
          placeholder="Search by item name, category, or HSN code..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            ),
            sx: {
              borderRadius: 1,
              height:40,
              bgcolor: '#ffff',
              border: `1px solid ${theme.palette.divider}`,
              '& fieldset': { border: 'none' },
              fontSize: 14,
            },
          }}
        />

        <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
          <Button
            variant="text"
            startIcon={<FilterListIcon />}
            sx={{
              borderRadius: 1,
              px: 2.5,
              height: 40,
              fontWeight: 600,
              textTransform: 'none',
              bgcolor: 'action.hover',
              color: 'text.primary',
              '&:hover': { bgcolor: 'action.selected' },
              fontSize: 13,
              whiteSpace: 'nowrap',
            }}
          >
            Filters
          </Button>
          <Button
      variant="contained"
      startIcon={<AddCircleIcon />}
      onClick={onAddNew}
      sx={{
        borderRadius: 1,
        fontWeight: 700,
        px: 3,
        height: 40,
        boxShadow: '0 4px 14px rgba(210,18,46,0.25)',
        textTransform: 'none',
        fontSize: 14,
        '&:hover': { boxShadow: '0 6px 18px rgba(210,18,46,0.35)' },
      }}
    >
      Add New Item
    </Button>
          {/* <Button
            variant="text"
            startIcon={<FileDownloadIcon />}
            sx={{
              borderRadius: 1.5,
              px: 2.5,
              fontWeight: 600,
              textTransform: 'none',
              bgcolor: 'action.hover',
              color: 'text.primary',
              '&:hover': { bgcolor: 'action.selected' },
              fontSize: 13,
              whiteSpace: 'nowrap',
            }}
          >
            Export
          </Button> */}
        </Box>
      </Box>
  );
};

export default FilterBar;
