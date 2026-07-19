import { createTheme } from '@mui/material/styles';

const primary = {
  main: '#2E7D32',
  light: '#4CAF50',
  dark: '#1B5E20',
  contrastText: '#ffffff',
};

const secondary = {
  main: '#FF8F00',
  light: '#FFB74D',
  dark: '#E65100',
  contrastText: '#000000',
};

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary,
    secondary,
    background: {
      default: '#F5F5F5',
      paper: '#FFFFFF',
    },
    success: {
      main: '#2E7D32',
      light: '#E8F5E9',
    },
    warning: {
      main: '#F9A825',
      light: '#FFF8E1',
    },
    error: {
      main: '#C62828',
      light: '#FFEBEE',
    },
    text: {
      primary: '#1C1B1F',
      secondary: '#49454F',
    },
    divider: '#E0E0E0',
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 500, letterSpacing: 0 },
    h5: { fontWeight: 500 },
    h6: { fontWeight: 500 },
    subtitle1: { color: '#49454F' },
    button: { textTransform: 'none', fontWeight: 500 },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          padding: '10px 24px',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': { boxShadow: '0 1px 3px rgba(0,0,0,0.12)' },
        },
      },
      defaultProps: { disableElevation: true },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 500 },
        filled: { borderRadius: 8 },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: { borderRadius: 16 },
      },
    },
    MuiBottomNavigation: {
      styleOverrides: {
        root: {
          height: 72,
          boxShadow: '0 -1px 3px rgba(0,0,0,0.08)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: '1px solid #E0E0E0',
          boxShadow: 'none',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 28,
          margin: '4px 12px',
          '&.Mui-selected': {
            backgroundColor: '#E8F5E9',
            color: primary.main,
            '&:hover': { backgroundColor: '#C8E6C9' },
            '& .MuiListItemIcon-root': { color: primary.main },
          },
        },
      },
    },
  },
});

export const DRAWER_WIDTH = 256;
