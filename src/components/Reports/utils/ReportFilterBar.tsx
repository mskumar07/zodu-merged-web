import React from "react";
import { Box, TextField, MenuItem, Button } from "@mui/material";
import { Clear } from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import { ReportTabs } from "../ReportTabs";

interface ReportFilterBarProps {
  tabs: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;

  searchText: string;
  onSearchChange: (value: string) => void;

  fromDate?: string | null;
  toDate?: string | null;
  onFromDateChange?: (value: string) => void;
  onToDateChange?: (value: string) => void;

  selectedMonth?: string;
  selectedYear?: string;
  onMonthChange?: (value: string) => void;
  onYearChange?: (value: string) => void;
  showDateFilter?: boolean;
  showMonthYearFilter?: boolean;

  onClearFilters?: () => void;
}

const months = [
  "Jan","Feb","Mar","Apr","May","Jun",
  "Jul","Aug","Sep","Oct","Nov","Dec",
];

export const ReportFilterBar: React.FC<ReportFilterBarProps> = ({
  tabs,
  activeTab,
  onTabChange,
  searchText,
  onSearchChange,
  fromDate,
  toDate,
  onFromDateChange,
  onToDateChange,
  selectedMonth,
  selectedYear,
  onMonthChange,
  onYearChange,
  showDateFilter = false,
  showMonthYearFilter = false,
  onClearFilters,
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: 1,
        borderColor: "divider",
        pb: 1,
        px: 2,
        py: 1,
        gap: 2,
        flexWrap: "nowrap",
      }}
    >
      {/* LEFT - TABS */}
      <ReportTabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={onTabChange}
      />

      {/* RIGHT - FILTER CONTROLS */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {/* SEARCH (for all tabs incl category) */}
        <TextField
          size="small"
          placeholder="Search"
          value={searchText}
          onChange={(e) => onSearchChange(e.target.value)}
          sx={{ width: 200 }}
        />

        {/* DATE FILTER (All Orders & Date Wise) */}
        {showDateFilter && (
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="From"
              value={fromDate ? dayjs(fromDate) : null}
              onChange={(newValue: Dayjs | null) => {
                onFromDateChange?.(newValue ? newValue.format("YYYY-MM-DD") : "");
              }}
              slotProps={{
                textField: {
                  size: "small",
                  sx: { width: 150 },
                },
              }}
            />
            <DatePicker
              label="To"
              value={toDate ? dayjs(toDate) : null}
              onChange={(newValue: Dayjs | null) => {
                onToDateChange?.(newValue ? newValue.format("YYYY-MM-DD") : "");
              }}
              slotProps={{
                textField: {
                  size: "small",
                  sx: { width: 150 },
                },
              }}
            />
          </LocalizationProvider>
        )}

        {/* MONTH/YEAR FILTER (Month/Year Wise) */}
        {showMonthYearFilter && (
          <>
            {/* <TextField
              select
              size="small"
              label="Month"
              InputLabelProps={{ shrink: true }}
              value={selectedMonth}
              onChange={(e) => onMonthChange(e.target.value)}
              sx={{ width: 120 }}
            >
              {months.map((m) => (
                <MenuItem key={m} value={m}>
                  {m}
                </MenuItem>
              ))}
            </TextField> */}

            <TextField
              select
              size="small"
              label="Year"
              InputLabelProps={{ shrink: true }}
              value={selectedYear}
              onChange={(e) => onYearChange?.(e.target.value)}
              sx={{ width: 100 }}
            >
              {[2022, 2023, 2024, 2025, 2026].map((y) => (
                <MenuItem key={y} value={y}>
                  {y}
                </MenuItem>
              ))}
            </TextField>
          </>
        )}

      </Box>
    </Box>
  );
};
