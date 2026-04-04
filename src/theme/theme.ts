import { createTheme } from "@mui/material/styles";

// Create your theme
const muiTheme = createTheme({
  palette: {
    primary: {
      main: "#CA0022",
    },
    secondary: {
      main: "#EB0029",
    },
    subscription: { main: "#6C5DD3", contrastText: "#fff" },
    text: {
      primary: "#1A0004",
      secondary: "#586474",
      disabled: "#8B97A7",
    },
    background: {
      default: "#ffffff",
      light: "#f5f5f5", // Light grey for top bar/sidebar
      sidebar: "#f0f0f0", // Custom named for clarity
      productCard: "#dae1e4", // Custom color for product card background
    },
    customText: {
      productCard: "#5e5e5e", // Custom color for product card text
    },
  },
  typography: {
    fontFamily: '"Inter", sans-serif',
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 600,
    logo: {
      fontFamily: '"Inter", sans-serif',
      fontWeight: 700,
      letterSpacing: 2,
      fontSize: "2.5rem",
    },
    button: {
      textTransform: "none",
      fontWeight: 500,
    },
    label: {
      fontSize: "0.6875rem", // 11px
      fontWeight: 400,
      lineHeight: 1.4,
      letterSpacing: "0.02em",
      color: "#586474",
    },
    placeholder: {
      fontSize: "0.75rem", // 12px
      fontWeight: 400,
      lineHeight: 1.4,
      letterSpacing: "0.01em",
      color: "#8B97A7",
    },
  },
  shape: {
    borderRadius: 8,
  },
});

export default muiTheme;
