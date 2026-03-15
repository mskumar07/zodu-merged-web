// components/reports/ReportTabs.tsx
import React from "react";
import { Tabs, Tab, Box } from "@mui/material";

interface ReportTabsProps {
  tabs: string[];
  activeTab: string;
  onChange: (tab: string) => void;
}

export const ReportTabs: React.FC<ReportTabsProps> = ({
  tabs,
  activeTab,
  onChange,
}) => {
  const formatTabValue = (tab: string): string => {
    return tab.toLowerCase().replace(/ /g, "-");
  };

  return (
    <Box
      sx={{
       
        

        "& .MuiTabs-root": {
          minHeight: "48px",
        },
      }}>
      <Tabs
        value={activeTab}
        onChange={(_, value) => onChange(value)}
        sx={{
          "& .MuiTabs-indicator": {
            backgroundColor: "#d32f2f",
            height: 3,
            borderRadius: "3px 3px 0 0",
          },
          "& .MuiTab-root": {
            textTransform: "none",
            fontSize: "14px",
            fontWeight: 500,
            minWidth: "auto",
            px: 3,
            py: 1,
            color: "text.secondary",
            minHeight: "48px",
            "&.Mui-selected": {
              color: "#d32f2f",
              fontWeight: 600,
            },
          },
        }}>
        {tabs.map((tab) => (
          <Tab key={tab} label={tab} value={formatTabValue(tab)} />
        ))}
      </Tabs>
    </Box>
  );
};
