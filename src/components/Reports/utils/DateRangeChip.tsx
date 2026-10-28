import React, { useRef } from "react";
import { Box, Typography } from "@mui/material";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";

interface DateRangeChipProps {
  fromDate: string; // YYYY-MM-DD
  toDate: string;   // YYYY-MM-DD
  onFromDateChange: (value: string) => void;
  onToDateChange: (value: string) => void;
}

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

// YYYY-MM-DD -> "29-JUL-2026" (same display the billing screen uses)
const formatDateDisplay = (value: string): string => {
  const [year, month, day] = value.split("-");
  if (!year || !month || !day) return "";
  return `${day}-${MONTHS[Number(month) - 1]}-${year}`;
};

const boxSx = {
  position: "relative",
  display: "flex",
  alignItems: "center",
  gap: 0.6,
  width: 165,
  height: 36,
  px: 1.25,
  borderRadius: 1.5,
  border: "1px solid #E5E7EB",
  bgcolor: "#fff",
  cursor: "pointer",
  "&:hover": { borderColor: "#C8102E" },
};

// A text label over a hidden native date input — clicking opens the browser's own
// calendar via showPicker(), exactly like the date fields on the billing screen.
const DateField: React.FC<{
  value: string;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
}> = ({ value, onChange, min, max }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const open = () => {
    const el = inputRef.current;
    if (!el) return;
    try { el.showPicker(); } catch { /* already open / unsupported */ }
    el.focus();
  };
  return (
    <Box onClick={open} sx={boxSx}>
      <Typography sx={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", color: value ? "#111827" : "#9CA3AF" }}>
        {value ? formatDateDisplay(value) : "Select date"}
      </Typography>
      <CalendarTodayOutlinedIcon sx={{ fontSize: 15, color: "#6B7280", ml: "auto" }} />
      <input
        ref={inputRef}
        type="date"
        value={value}
        min={min || undefined}
        max={max || undefined}
        onChange={(e) => onChange(e.target.value)}
        style={{ position: "absolute", left: 0, bottom: 0, width: "100%", height: 0, opacity: 0, pointerEvents: "none" }}
      />
    </Box>
  );
};

// Compact "DD-MMM-YYYY" date-range chip shared by all date-wise report screens.
export const DateRangeChip: React.FC<DateRangeChipProps> = ({
  fromDate,
  toDate,
  onFromDateChange,
  onToDateChange,
}) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
    <DateField value={fromDate} onChange={onFromDateChange} max={toDate} />
    <Typography sx={{ fontSize: 12, color: "#9CA3AF", fontWeight: 700 }}>to</Typography>
    <DateField value={toDate} onChange={onToDateChange} min={fromDate} />
  </Box>
);
