import { memo, useState } from 'react';
import {
  Box, Button, Checkbox, InputAdornment, ListItemText, Menu, MenuItem, TextField,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

const RED = '#D2122E';

interface Props {
  search: string;
  onSearch: (value: string) => void;
  placeholder: string;
  columns: { key: string; label: React.ReactNode }[];
  hidden: Set<string>;
  onToggleColumn: (key: string) => void;
  /** Columns the menu can't switch off. */
  lockedKeys?: string[];
}

/** The search box and Columns menu that sit beside the tabs. */
function TableToolbar({ search, onSearch, placeholder, columns, hidden, onToggleColumn, lockedKeys = [] }: Props) {
  const [menuEl, setMenuEl] = useState<HTMLElement | null>(null);
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
      <Button variant="outlined" endIcon={<KeyboardArrowDownIcon />} onClick={(e) => setMenuEl(e.currentTarget)}
        sx={{ textTransform: 'none', fontWeight: 600, color: '#0F172A', borderColor: '#CBD5E1', height: 40 }}>
        Columns
      </Button>
      <Menu anchorEl={menuEl} open={!!menuEl} onClose={() => setMenuEl(null)}>
        {columns.map((c) => (
          <MenuItem key={c.key} dense disabled={lockedKeys.includes(c.key)} onClick={() => onToggleColumn(c.key)}>
            <Checkbox size="small" checked={!hidden.has(c.key)} sx={{ py: 0, '&.Mui-checked': { color: RED } }} />
            <ListItemText primary={c.label} primaryTypographyProps={{ fontSize: 13 }} />
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
}

export default memo(TableToolbar);
