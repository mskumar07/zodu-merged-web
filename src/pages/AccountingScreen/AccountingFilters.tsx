import { memo } from "react";
import { Box, InputAdornment, MenuItem, TextField } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import type { TransactionType } from "./types";

export const TRANSACTION_TYPES: TransactionType[] = [
  "Sales", "Payment", "Purchase", "Expense", "Receipt", "Sales Return", "Purchase Return", "Credit Note", "Debit Note",
];

export interface FilterValues {
  search: string;
  /** "" = every type. */
  type: TransactionType | "";
  from_date: string;
  to_date: string;
}

interface Props {
  values: FilterValues;
  onChange: (patch: Partial<FilterValues>) => void;
}

const FIELD_SX = { "& .MuiInputBase-root": { fontSize: 13, height: 38 } };
const SHRINK = { inputLabel: { shrink: true } };

/** Memoised: table and scroll updates don't repaint the filter row. */
function AccountingFilters({ values, onChange }: Props) {
  return (
    <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", alignItems: "center", justifyContent: "flex-end" }}>
      <TextField
        size="small" placeholder="Search by reference no. or party..." value={values.search}
        onChange={(e) => onChange({ search: e.target.value })}
        sx={{ ...FIELD_SX, width: 300 }}
        slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18, color: "text.disabled" }} /></InputAdornment> } }}
      />
      <TextField
        select size="small" label="Type" value={values.type}
        onChange={(e) => onChange({ type: e.target.value as FilterValues["type"] })}
        sx={{ ...FIELD_SX, width: 180 }}
        slotProps={{ ...SHRINK, select: { displayEmpty: true } }}
      >
        <MenuItem value="" sx={{ fontSize: 13 }}>All types</MenuItem>
        {TRANSACTION_TYPES.map((t) => <MenuItem key={t} value={t} sx={{ fontSize: 13 }}>{t}</MenuItem>)}
      </TextField>
      <TextField
        type="date" size="small" label="From" value={values.from_date}
        onChange={(e) => onChange({ from_date: e.target.value })}
        sx={{ ...FIELD_SX, width: 160 }} slotProps={{ ...SHRINK, htmlInput: { max: values.to_date || undefined } }}
      />
      <TextField
        type="date" size="small" label="To" value={values.to_date}
        onChange={(e) => onChange({ to_date: e.target.value })}
        sx={{ ...FIELD_SX, width: 160 }} slotProps={{ ...SHRINK, htmlInput: { min: values.from_date || undefined } }}
      />
    </Box>
  );
}

export default memo(AccountingFilters);
