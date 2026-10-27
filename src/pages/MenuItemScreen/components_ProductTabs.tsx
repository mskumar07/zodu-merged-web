import React from "react";
import { Tabs, Tab, Box, useTheme } from "@mui/material";
import type { TabValue } from "./types";

interface ProductTabsProps {
  value: TabValue;
  onChange: (value: TabValue) => void;
  rightSlot?: React.ReactNode;
}

const TAB_CONFIG: { label: string; value: TabValue }[] = [
  { label: "Menu Item", value: "all" },
   { label: "Category", value: "category" },
  { label: "Sellable Products", value: "sellable" },
  { label: "Raw Materials", value: "raw" },
];

const ProductTabs: React.FC<ProductTabsProps> = ({ value, onChange, rightSlot }) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        borderBottom: `1px solid ${theme.palette.divider}`,
        mb: 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 1.5,
      }}
    >
      <Tabs
        value={value}
        onChange={(_e, newVal) => onChange(newVal as TabValue)}
        textColor="primary"
        indicatorColor="primary"
        sx={{
          flexShrink: 0,
          minHeight: 28,
          "& .MuiTab-root": {
            textTransform: "none",
            fontWeight: 600,
            fontSize: 14,
            minHeight: 30,
            px: 3,
            color: "text.secondary",
            "&.Mui-selected": {
              fontWeight: 700,
              color: "primary.main",
            },
          },
          "& .MuiTabs-indicator": {
            height: 2,
          },
        }}
      >
        {TAB_CONFIG.map((tab) => (
          <Tab
            key={tab.value}
            label={tab.label}
            value={tab.value}
            disableRipple
          />
        ))}
      </Tabs>

      {rightSlot && (
        // One line on the tab row: no wrapping (a wrapping row breaks lines before it shrinks
        // anything), so when a control appears (e.g. Reset Filters) the search / category
        // fields shrink to make room instead of pushing buttons onto a second line.
        <Box sx={{ flex: "1 1 auto", minWidth: 0, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 1.5, flexWrap: "nowrap", pb: 1, "& > *": { flexShrink: 0 }, "& > .MuiFormControl-root, & > .MuiTextField-root": { flexShrink: 1 } }}>
          {rightSlot}
        </Box>
      )}
    </Box>
  );
};

export default ProductTabs;
