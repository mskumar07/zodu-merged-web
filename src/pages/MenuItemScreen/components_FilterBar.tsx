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
import FileDownloadIcon from '@mui/icons-material/FileDownload';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ searchQuery, onSearchChange }) => {
  const theme = useTheme();

  return (
    <Paper
      elevation={0}
      variant="outlined"
      sx={{
        borderRadius: 3,
        border: `1px solid ${theme.palette.divider}`,
        p: 2,
        mb: 3,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', lg: 'row' },
          gap: 2,
        }}
      >
        <TextField
          fullWidth
          size="medium"
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
              borderRadius: 3,
              bgcolor: 'action.hover',
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
              borderRadius: 2,
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
            Filters
          </Button>
          <Button
            variant="text"
            startIcon={<FileDownloadIcon />}
            sx={{
              borderRadius: 2,
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
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default FilterBar;
