import React, { useState } from "react";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import Toolbar from "@mui/material/Toolbar";
import { useTheme } from "@mui/material/styles";
import Sidebar from "./Sidebar/index.tsx"; // adjust import if path differs
import TopBar from "./Topbar/index.tsx"; // adjust import if path differs
import { Outlet, useLocation } from "react-router-dom";
import RouteAccessGuard from "../routes/RouteAccessGuard";

const Layout: React.FC = () => {
  const theme = useTheme();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Closing on route change covers both nav-item clicks (Sidebar also closes
  // itself immediately for a snappier feel) and any other way the URL changes
  // while the drawer happens to be open.
  React.useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
      <Box
        sx={{
          flexGrow: 1,
          minWidth: 0,
          bgcolor: theme.palette.background.default,
          height: "100vh",
          // Mobile browsers size 100vh as if their toolbars were hidden, but only
          // this shell's inner box scrolls, so the toolbars never hide and the
          // bottom of every page (e.g. the POS Save button) sat unreachable
          // behind them. dvh is the height actually visible.
          "@supports (height: 100dvh)": { height: "100dvh" },
          display: "flex",
          flexDirection: "column",
        }}
      >
        <TopBar onMenuClick={() => setMobileOpen(true)} />
        {/* This Toolbar acts as a vertical spacer, matching TopBar height */}
        <Toolbar />
        <Box
          sx={{
            flex: 1,
            backgroundColor: "#ffffff",
            overflow: "auto",
            minHeight: 0,
          }}
        >
          <Box sx={{ height: "100%" }}>
            <RouteAccessGuard>
              <Outlet />
            </RouteAccessGuard>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;
