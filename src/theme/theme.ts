import { alpha, createTheme } from '@mui/material/styles';

/** M3-inspired tokens — warm beige surfaces + fresh green accent */
export const paletteTokens = {
  beige: {
    background: '#F5F0E6',
    surface: '#FFFBF6',
    surfaceDim: '#EDE6DA',
    surfaceBright: '#FFFCF8',
    outline: '#C9BFB0',
    outlineVariant: '#DED5C8',
  },
  green: {
    primary: '#2D6A4F',
    onPrimary: '#FFFFFF',
    primaryContainer: '#D8EADD',
    onPrimaryContainer: '#1B4332',
    light: '#40916C',
    dark: '#1B4332',
  },
  /** Pantry-ready / success — jade teal, distinct from brand primary */
  status: {
    ready: '#1B8A6B',
    readyContainer: '#D4F0E8',
    readyDark: '#146B52',
  },
  earth: {
    secondary: '#5C6B4F',
    onSecondary: '#FFFFFF',
    secondaryContainer: '#E3E9DC',
    onSecondaryContainer: '#2E3A28',
  },
  text: {
    primary: '#1F1B16',
    secondary: '#5C5348',
    disabled: '#9A9185',
  },
};

declare module '@mui/material/styles' {
  interface Palette {
    surface: {
      dim: string;
      container: string;
      containerHigh: string;
    };
  }
  interface PaletteOptions {
    surface?: {
      dim?: string;
      container?: string;
      containerHigh?: string;
    };
  }
}

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: paletteTokens.green.primary,
      light: paletteTokens.green.light,
      dark: paletteTokens.green.dark,
      contrastText: paletteTokens.green.onPrimary,
    },
    secondary: {
      main: paletteTokens.earth.secondary,
      contrastText: paletteTokens.earth.onSecondary,
    },
    background: {
      default: paletteTokens.beige.background,
      paper: paletteTokens.beige.surface,
    },
    surface: {
      dim: paletteTokens.beige.surfaceDim,
      container: paletteTokens.beige.surfaceBright,
      containerHigh: '#F7F1E8',
    },
    success: {
      main: paletteTokens.status.ready,
      light: paletteTokens.status.readyContainer,
      dark: paletteTokens.status.readyDark,
      contrastText: '#FFFFFF',
    },
    warning: {
      main: '#B8860B',
      light: '#FFF4D6',
      dark: '#8B6914',
    },
    error: {
      main: '#BA1A1A',
      light: '#FFDAD6',
      dark: '#93000A',
    },
    info: {
      main: '#3D6B8C',
      light: '#D4E8F5',
      dark: '#2A4D66',
    },
    text: {
      primary: paletteTokens.text.primary,
      secondary: paletteTokens.text.secondary,
      disabled: paletteTokens.text.disabled,
    },
    divider: paletteTokens.beige.outlineVariant,
    action: {
      hover: alpha(paletteTokens.green.primary, 0.06),
      selected: alpha(paletteTokens.green.primary, 0.12),
      focus: alpha(paletteTokens.green.primary, 0.12),
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 400,
      fontSize: '2rem',
      lineHeight: 1.25,
      letterSpacing: 0,
      color: paletteTokens.text.primary,
    },
    h5: {
      fontWeight: 500,
      fontSize: '1.375rem',
      lineHeight: 1.3,
      letterSpacing: 0,
    },
    h6: {
      fontWeight: 500,
      fontSize: '1.125rem',
      lineHeight: 1.35,
    },
    subtitle1: {
      fontSize: '1rem',
      lineHeight: 1.5,
      color: paletteTokens.text.secondary,
    },
    subtitle2: {
      fontSize: '0.875rem',
      fontWeight: 500,
      lineHeight: 1.43,
      color: paletteTokens.text.secondary,
    },
    body1: { fontSize: '1rem', lineHeight: 1.5 },
    body2: { fontSize: '0.875rem', lineHeight: 1.43 },
    button: {
      textTransform: 'none',
      fontWeight: 500,
      letterSpacing: 0.1,
    },
    caption: {
      fontSize: '0.75rem',
      lineHeight: 1.33,
      color: paletteTokens.text.secondary,
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0 1px 2px rgba(31, 27, 22, 0.06)',
    '0 2px 4px rgba(31, 27, 22, 0.06)',
    '0 4px 8px rgba(31, 27, 22, 0.08)',
    '0 6px 12px rgba(31, 27, 22, 0.08)',
    '0 8px 16px rgba(31, 27, 22, 0.1)',
    '0 10px 20px rgba(31, 27, 22, 0.1)',
    '0 12px 24px rgba(31, 27, 22, 0.12)',
    '0 14px 28px rgba(31, 27, 22, 0.12)',
    '0 16px 32px rgba(31, 27, 22, 0.14)',
    '0 18px 36px rgba(31, 27, 22, 0.14)',
    '0 20px 40px rgba(31, 27, 22, 0.16)',
    '0 22px 44px rgba(31, 27, 22, 0.16)',
    '0 24px 48px rgba(31, 27, 22, 0.18)',
    '0 26px 52px rgba(31, 27, 22, 0.18)',
    '0 28px 56px rgba(31, 27, 22, 0.2)',
    '0 30px 60px rgba(31, 27, 22, 0.2)',
    '0 32px 64px rgba(31, 27, 22, 0.22)',
    '0 34px 68px rgba(31, 27, 22, 0.22)',
    '0 36px 72px rgba(31, 27, 22, 0.24)',
    '0 38px 76px rgba(31, 27, 22, 0.24)',
    '0 40px 80px rgba(31, 27, 22, 0.26)',
    '0 42px 84px rgba(31, 27, 22, 0.26)',
    '0 44px 88px rgba(31, 27, 22, 0.28)',
    '0 46px 92px rgba(31, 27, 22, 0.28)',
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: paletteTokens.beige.background,
          color: paletteTokens.text.primary,
        },
        '#root': {
          minHeight: '100vh',
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: 20,
          padding: '10px 24px',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
          '&.MuiButton-containedPrimary': {
            backgroundColor: paletteTokens.green.primary,
            '&:hover': {
              backgroundColor: paletteTokens.green.dark,
            },
          },
        },
        outlined: {
          borderColor: paletteTokens.beige.outline,
          '&:hover': {
            borderColor: paletteTokens.green.primary,
            backgroundColor: alpha(paletteTokens.green.primary, 0.04),
          },
        },
        text: {
          '&:hover': {
            backgroundColor: alpha(paletteTokens.green.primary, 0.06),
          },
        },
      },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: `1px solid ${paletteTokens.beige.outlineVariant}`,
          backgroundColor: paletteTokens.beige.surface,
          backgroundImage: 'none',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        rounded: { borderRadius: 16 },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          borderRadius: 8,
        },
        filled: {
          '&.MuiChip-colorPrimary': {
            backgroundColor: paletteTokens.green.primaryContainer,
            color: paletteTokens.green.onPrimaryContainer,
          },
          '&.MuiChip-colorSecondary': {
            backgroundColor: paletteTokens.earth.secondaryContainer,
            color: paletteTokens.earth.onSecondaryContainer,
          },
          '&.MuiChip-colorSuccess': {
            backgroundColor: paletteTokens.status.readyContainer,
            color: paletteTokens.status.readyDark,
          },
        },
        outlined: {
          borderColor: paletteTokens.beige.outline,
          '&.MuiChip-colorSuccess': {
            borderColor: paletteTokens.status.ready,
            color: paletteTokens.status.readyDark,
            backgroundColor: paletteTokens.status.readyContainer,
          },
        },
      },
    },
    MuiTextField: {
      defaultProps: { variant: 'outlined', size: 'small' },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            backgroundColor: paletteTokens.beige.surfaceBright,
            '& fieldset': {
              borderColor: paletteTokens.beige.outline,
            },
            '&:hover fieldset': {
              borderColor: paletteTokens.green.light,
            },
            '&.Mui-focused fieldset': {
              borderColor: paletteTokens.green.primary,
              borderWidth: 2,
            },
          },
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        switchBase: {
          '&.Mui-checked': {
            color: paletteTokens.green.primary,
            '& + .MuiSwitch-track': {
              backgroundColor: paletteTokens.green.light,
              opacity: 1,
            },
          },
        },
        track: {
          backgroundColor: paletteTokens.beige.outline,
          opacity: 1,
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: 12 },
        colorSuccess: {
          backgroundColor: paletteTokens.green.primaryContainer,
          color: paletteTokens.green.onPrimaryContainer,
        },
        colorInfo: {
          backgroundColor: '#D4E8F5',
          color: '#1A3A4F',
        },
        colorWarning: {
          backgroundColor: '#FFF4D6',
          color: '#5C4A12',
        },
        colorError: {
          backgroundColor: '#FFDAD6',
          color: '#690005',
        },
      },
    },
    MuiFormLabel: {
      styleOverrides: {
        root: {
          color: paletteTokens.text.secondary,
          '&.Mui-focused': {
            color: paletteTokens.green.primary,
          },
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: paletteTokens.beige.outlineVariant,
        },
      },
    },
    MuiBottomNavigation: {
      styleOverrides: {
        root: {
          height: 80,
          backgroundColor: paletteTokens.beige.surface,
          borderTop: `1px solid ${paletteTokens.beige.outlineVariant}`,
          boxShadow: 'none',
        },
      },
    },
    MuiBottomNavigationAction: {
      styleOverrides: {
        root: {
          color: paletteTokens.text.secondary,
          minWidth: 64,
          paddingTop: 10,
          '&.Mui-selected': {
            color: paletteTokens.green.primary,
          },
        },
        label: {
          fontSize: '0.75rem',
          fontWeight: 500,
          '&.Mui-selected': {
            fontSize: '0.75rem',
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: paletteTokens.beige.surfaceDim,
          borderRight: `1px solid ${paletteTokens.beige.outlineVariant}`,
          boxShadow: 'none',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 28,
          margin: '4px 12px',
          color: paletteTokens.text.secondary,
          '&:hover': {
            backgroundColor: alpha(paletteTokens.green.primary, 0.06),
          },
          '&.Mui-selected': {
            backgroundColor: paletteTokens.green.primaryContainer,
            color: paletteTokens.green.onPrimaryContainer,
            fontWeight: 600,
            '&:hover': {
              backgroundColor: alpha(paletteTokens.green.primary, 0.18),
            },
            '& .MuiListItemIcon-root': {
              color: paletteTokens.green.onPrimaryContainer,
            },
          },
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          color: paletteTokens.text.secondary,
          minWidth: 40,
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: alpha(paletteTokens.green.primary, 0.08),
          },
        },
      },
    },
    MuiCircularProgress: {
      styleOverrides: {
        root: {
          color: paletteTokens.green.primary,
        },
      },
    },
  },
});

export const DRAWER_WIDTH = 280;

/** Reusable surface panel for filter bars and grouped content */
export const surfacePanelSx = {
  bgcolor: 'surface.containerHigh',
  border: 1,
  borderColor: 'divider',
  borderRadius: 3,
} as const;
