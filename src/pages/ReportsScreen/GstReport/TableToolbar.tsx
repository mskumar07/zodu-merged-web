import { memo } from 'react';
import { Box, InputAdornment, TextField } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

interface Props {
  search: string;
  onSearch: (value: string) => void;
  placeholder: string;
}

/** The search box that sits beside the tabs. */
function TableToolbar({ search, onSearch, placeholder }: Props) {
  return (
    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexShrink: 0 }}>
      <TextField
        size="small" placeholder={placeholder} value={search}
        onChange={(e) => onSearch(e.target.value)} sx={{ width: 320 }}
        InputProps={{
          startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18, color: 'text.disabled' }} /></InputAdornment>,
          sx: { fontSize: 13 },
        }}
      />
    </Box>
  );
}

export default memo(TableToolbar);
