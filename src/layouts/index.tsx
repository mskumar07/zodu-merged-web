import React from "react";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import Toolbar from "@mui/material/Toolbar";
import { useTheme } from "@mui/material/styles";
import Sidebar from "./Sidebar/index.tsx"; // adjust import if path differs
import TopBar from "./Topbar/index.tsx"; // adjust import if path differs
import { Outlet } from "react-router-dom";

const drawerWidth = 260;

const Layout: React.FC = () => {
  const theme = useTheme();

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <Sidebar />
      <Box
        sx={{
          flexGrow: 1,
          bgcolor: theme.palette.background.default,
          height: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <TopBar />
        {/* This Toolbar acts as a vertical spacer, matching TopBar height */}
        <Toolbar />
        <Box
          sx={{
            flex: 1,
            backgroundColor: "#fafafa",
            overflow: "auto",
            minHeight: 0,
          }}
        >
          <Box sx={{ height: "100%" }}>
            <Outlet />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;
