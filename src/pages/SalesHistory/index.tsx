import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider, createTheme, alpha } from "@mui/material/styles";
import SalesHistoryScreen from "./SalesHistory";
const queryClient = new QueryClient();
const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#E53935" },
    success: { main: "#2E7D32" },
    warning: { main: "#F57C00" },
    error: { main: "#C62828" },
    background: { default: "#F5F6FA", paper: "#FFFFFF" },
    text: { primary: "#1A1A2E", secondary: "#6B7280" },
  },
  typography: {
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    h5: { fontWeight: 700, letterSpacing: "-0.5px" },
    h6: { fontWeight: 600 },
    subtitle2: {
      fontWeight: 600,
      fontSize: "0.78rem",
      letterSpacing: "0.04em",
      textTransform: "uppercase",
    },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
          borderRadius: 14,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { textTransform: "none", fontWeight: 600, borderRadius: 8 },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: { "& .MuiOutlinedInput-root": { borderRadius: 8 } },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 700,
          fontSize: "0.78rem",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: "#6B7280",
          backgroundColor: "#F1F3F6",
          borderBottom: "1px solid rgba(0,0,0,0.09)",
          padding: "18px 18px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.06)",
        },
        body: {
          fontSize: "0.85rem",
          borderBottom: "1px solid rgba(0,0,0,0.05)",
          padding: "20px 20px",
        },
      },
    },
  },
});
export default function SalesHistory() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <SalesHistoryScreen />
      </ThemeProvider>
    </QueryClientProvider>
  );
}