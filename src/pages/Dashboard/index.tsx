import React from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import DashboardLayout from "@components/Dashboard";
import { getTenantContext } from "@store/tenantContext";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#d21919ff",
    },
    secondary: {
      main: "#007ddcff",
    },
    background: {
      default: "#ffffff",
    },
  },
 
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});

const Dashboard: React.FC = () => {
 
  return (
    <ThemeProvider theme={theme}>
      <DashboardLayout />
    </ThemeProvider>
  );
};

export default Dashboard;
