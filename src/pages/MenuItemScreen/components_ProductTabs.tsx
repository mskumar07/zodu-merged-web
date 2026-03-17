import React from "react";
import { Tabs, Tab, Box, useTheme } from "@mui/material";
import type { TabValue } from "./types";

interface ProductTabsProps {
  value: TabValue;
  onChange: (value: TabValue) => void;
}

const TAB_CONFIG: { label: string; value: TabValue }[] = [
  { label: "All Items", value: "all" },
  { label: "Sellable Products", value: "sellable" },
  { label: "Raw Materials", value: "raw" },
];

const ProductTabs: React.FC<ProductTabsProps> = ({ value, onChange }) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        borderBottom: `1px solid ${theme.palette.divider}`,
        mb: 3,
      }}
    >
      <Tabs
        value={value}
        onChange={(_e, newVal) => onChange(newVal as TabValue)}
        textColor="primary"
        indicatorColor="primary"
        sx={{
          minHeight: 48,
          "& .MuiTab-root": {
            textTransform: "none",
            fontWeight: 600,
            fontSize: 14,
            minHeight: 48,
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
    </Box>
  );
};

export default ProductTabs;
