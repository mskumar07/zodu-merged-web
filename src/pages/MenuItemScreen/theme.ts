import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#D2122E',
      light: '#e84460',
      dark: '#a50e24',
      contrastText: '#fff',
    },
    background: {
      default: '#f8f6f6',
      paper: '#ffffff',
    },
    divider: '#e2e8f0',
    text: {
      primary: '#0f172a',
      secondary: '#64748b',
      disabled: '#94a3b8',
    },
  },
  typography: {
    fontFamily: '"Public Sans", sans-serif',
    h4: { fontWeight: 900, letterSpacing: '-0.5px' },
    h6: { fontWeight: 900 },
  },
  shape: {
    borderRadius: 4,
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid #f1f5f9',
        },
      },
    },
  },
});
