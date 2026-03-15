import React from "react";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import Toolbar from "@mui/material/Toolbar";
import { useTheme } from "@mui/material/styles";
import POSSidebar from "./POSSideBar/index.tsx"; // adjust import if path differs
import TopBar from "./Topbar/index.tsx"; // adjust import if path differs
import { Outlet } from "react-router-dom";

const drawerWidth = 260;

const POSLayout: React.FC = () => {
  const theme = useTheme();

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <POSSidebar />
      <Box
        sx={{
          flexGrow: 1,
          bgcolor: theme.palette.background.default,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <TopBar />
        {/* This Toolbar acts as a vertical spacer, matching TopBar height */}
        <Toolbar />
        <Box
          sx={{
            // p: 2,
            flexGrow: 1,
             maxHeight: "calc(100vh - 64px)",
            backgroundColor: "#fafafa",
            // overflow: "auto",
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default POSLayout;
