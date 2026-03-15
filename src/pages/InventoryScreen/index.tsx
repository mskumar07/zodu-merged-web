import * as React from "react";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import DirectInventoryScreen from "./DirectInventory";
import InDirectInventoryScreen from "./InDirectInventory";

export default function LabTabs() {
  const [value, setValue] = React.useState("1");

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: "100%", typography: "body1" }}>
      <TabContext value={value}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <TabList onChange={handleChange} aria-label="lab API tabs example">
            <Tab label="Direct Inventory" value="1" />
            <Tab label="In-Direct Inventory" value="2" />
          </TabList>
        </Box>
        <TabPanel value="1">
          <DirectInventoryScreen />
        </TabPanel>
        <TabPanel value="2">
          <InDirectInventoryScreen />
        </TabPanel>
      </TabContext>
    </Box>
  );
}
