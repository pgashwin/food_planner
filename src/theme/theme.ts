import { alpha, createTheme } from '@mui/material/styles';

/**
 * M3-inspired palette — seed primary #6B705A (sage olive).
 *
 * Color harmony (Material color system + M3 roles):
 * @see https://m3.material.io/styles/color/roles
 * @see https://m3.material.io/styles/color/dynamic/choosing-a-source
 * @see https://m2.material.io/design/color/the-color-system.html#tools-for-picking-colors
 *
 * PRIMARY (seed)     #6B705A — sage olive, hue ~73°
 * ANALOGOUS          #8A8F78 (yellow-green), #706A5A (warm olive-brown) → secondary
 * COMPLEMENTARY      #735A6B (dusty plum, ~253°) → tertiary accent
 * SPLIT-COMPLEMENT   #5A6670 (slate), #8A7A58 (ochre) → info & warning
 * TRIADIC            olive + plum + ochre — balanced warmth across UI roles
 */
export const paletteTokens = {
  /** Neutral surfaces — soft sage-tinted cream */
  surface: {
    background: '#F3F4EF',
    paper: '#FCFCF9',
    dim: '#E7E8E2',
    container: '#F6F7F2',
    containerHigh: '#EDECE6',
    outline: '#BDBBB0',
    outlineVariant: '#D5D3C8',
  },
  /** Primary — seed #6B705A */
  primary: {
    main: '#6B705A',
    onPrimary: '#FFFFFF',
    light: '#8A8F78',
    dark: '#4F5342',
    container: '#E8E9E2',
    onContainer: '#282A22',
  },
  /** Secondary — analogous warm olive-brown (harmonized M3 companion) */
  secondary: {
    main: '#706A5A',
    onSecondary: '#FFFFFF',
    light: '#908A7A',
    dark: '#524E42',
    container: '#EEEBE4',
    onContainer: '#2A2720',
  },
  /** Tertiary — complementary dusty plum (contrasting accent) */
  tertiary: {
    main: '#735A6B',
    onTertiary: '#FFFFFF',
    light: '#907A88',
    dark: '#574452',
    container: '#F0E6EB',
    onContainer: '#3A222E',
  },
  /** Semantic — split-complementary & triadic accents */
  status: {
    ready: '#5A6B52',
    readyContainer: '#DEE6DA',
    readyDark: '#3A4A34',
  },
  text: {
    primary: '#1C1C18',
    secondary: '#4A4A42',
    disabled: '#9A988E',
  },
  error: {
    main: '#A84848',
    container: '#F9DEDC',
    onContainer: '#5C1A1A',
  },
  warning: {
    main: '#8A7A58',
    container: '#F3EBD8',
    onContainer: '#4A3820',
  },
  info: {
    main: '#5A6670',
    container: '#DDE4E8',
    onContainer: '#1E2A32',
  },
};

/** Reference map for color-theory relationships (design docs / tooling) */
export const colorHarmony = {
  primary: paletteTokens.primary.main,
  analogous: {
    yellowGreen: paletteTokens.primary.light,
    warmOliveBrown: paletteTokens.secondary.main,
  },
  complementary: paletteTokens.tertiary.main,
  splitComplementary: {
    slate: paletteTokens.info.main,
    ochre: paletteTokens.warning.main,
  },
  triadic: {
    olive: paletteTokens.primary.main,
    plum: paletteTokens.tertiary.main,
    ochre: paletteTokens.warning.main,
  },
} as const;

declare module '@mui/material/styles' {
  interface Palette {
    surface: {
      dim: string;
      container: string;
      containerHigh: string;
    };
    tertiary: Palette['primary'];
  }
  interface PaletteOptions {
    surface?: {
      dim?: string;
      container?: string;
      containerHigh?: string;
    };
    tertiary?: PaletteOptions['primary'];
  }
}

const t = paletteTokens;

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: t.primary.main,
      light: t.primary.light,
      dark: t.primary.dark,
      contrastText: t.primary.onPrimary,
    },
    secondary: {
      main: t.secondary.main,
      light: t.secondary.light,
      dark: t.secondary.dark,
      contrastText: t.secondary.onSecondary,
    },
    tertiary: {
      main: t.tertiary.main,
      light: t.tertiary.light,
      dark: t.tertiary.dark,
      contrastText: t.tertiary.onTertiary,
    },
    background: {
      default: t.surface.background,
      paper: t.surface.paper,
    },
    surface: {
      dim: t.surface.dim,
      container: t.surface.container,
      containerHigh: t.surface.containerHigh,
    },
    success: {
      main: t.status.ready,
      light: t.status.readyContainer,
      dark: t.status.readyDark,
      contrastText: '#FFFFFF',
    },
    warning: {
      main: t.warning.main,
      light: t.warning.container,
      dark: t.warning.onContainer,
    },
    error: {
      main: t.error.main,
      light: t.error.container,
      dark: t.error.onContainer,
    },
    info: {
      main: t.info.main,
      light: t.info.container,
      dark: t.info.onContainer,
    },
    text: {
      primary: t.text.primary,
      secondary: t.text.secondary,
      disabled: t.text.disabled,
    },
    divider: t.surface.outlineVariant,
    action: {
      hover: alpha(t.primary.main, 0.06),
      selected: alpha(t.primary.main, 0.12),
      focus: alpha(t.primary.main, 0.12),
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 400,
      fontSize: '2rem',
      lineHeight: 1.25,
      letterSpacing: 0,
      color: t.text.primary,
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
      color: t.text.secondary,
    },
    subtitle2: {
      fontSize: '0.875rem',
      fontWeight: 500,
      lineHeight: 1.43,
      color: t.text.secondary,
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
      color: t.text.secondary,
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0 1px 2px rgba(28, 27, 22, 0.05)',
    '0 2px 4px rgba(28, 27, 22, 0.05)',
    '0 4px 8px rgba(28, 27, 22, 0.06)',
    '0 6px 12px rgba(28, 27, 22, 0.06)',
    '0 8px 16px rgba(28, 27, 22, 0.07)',
    '0 10px 20px rgba(28, 27, 22, 0.07)',
    '0 12px 24px rgba(28, 27, 22, 0.08)',
    '0 14px 28px rgba(28, 27, 22, 0.08)',
    '0 16px 32px rgba(28, 27, 22, 0.09)',
    '0 18px 36px rgba(28, 27, 22, 0.09)',
    '0 20px 40px rgba(28, 27, 22, 0.1)',
    '0 22px 44px rgba(28, 27, 22, 0.1)',
    '0 24px 48px rgba(28, 27, 22, 0.11)',
    '0 26px 52px rgba(28, 27, 22, 0.11)',
    '0 28px 56px rgba(28, 27, 22, 0.12)',
    '0 30px 60px rgba(28, 27, 22, 0.12)',
    '0 32px 64px rgba(28, 27, 22, 0.13)',
    '0 34px 68px rgba(28, 27, 22, 0.13)',
    '0 36px 72px rgba(28, 27, 22, 0.14)',
    '0 38px 76px rgba(28, 27, 22, 0.14)',
    '0 40px 80px rgba(28, 27, 22, 0.15)',
    '0 42px 84px rgba(28, 27, 22, 0.15)',
    '0 44px 88px rgba(28, 27, 22, 0.16)',
    '0 46px 92px rgba(28, 27, 22, 0.16)',
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: t.surface.background,
          color: t.text.primary,
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
            backgroundColor: t.primary.dark,
            '&:hover': {
              backgroundColor: t.primary.onContainer,
            },
          },
          '&.MuiButton-containedSecondary': {
            backgroundColor: t.secondary.main,
            '&:hover': {
              backgroundColor: t.secondary.dark,
            },
          },
        },
        outlined: {
          borderColor: t.surface.outline,
          '&:hover': {
            borderColor: t.primary.main,
            backgroundColor: alpha(t.primary.main, 0.04),
          },
        },
        text: {
          '&:hover': {
            backgroundColor: alpha(t.primary.main, 0.06),
          },
        },
      },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: `1px solid ${t.surface.outlineVariant}`,
          backgroundColor: t.surface.paper,
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
            backgroundColor: t.primary.container,
            color: t.primary.onContainer,
          },
          '&.MuiChip-colorSecondary': {
            backgroundColor: t.secondary.container,
            color: t.secondary.onContainer,
          },
          '&.MuiChip-colorSuccess': {
            backgroundColor: t.status.readyContainer,
            color: t.status.readyDark,
          },
        },
        outlined: {
          borderColor: t.surface.outline,
          '&.MuiChip-colorSuccess': {
            borderColor: t.status.ready,
            color: t.status.readyDark,
            backgroundColor: t.status.readyContainer,
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
            backgroundColor: t.surface.container,
            '& fieldset': {
              borderColor: t.surface.outline,
            },
            '&:hover fieldset': {
              borderColor: t.primary.light,
            },
            '&.Mui-focused fieldset': {
              borderColor: t.primary.main,
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
            color: t.primary.main,
            '& + .MuiSwitch-track': {
              backgroundColor: t.primary.light,
              opacity: 1,
            },
          },
        },
        track: {
          backgroundColor: t.surface.outline,
          opacity: 1,
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: 12 },
        colorSuccess: {
          backgroundColor: t.primary.container,
          color: t.primary.onContainer,
        },
        colorInfo: {
          backgroundColor: t.info.container,
          color: t.info.onContainer,
        },
        colorWarning: {
          backgroundColor: t.warning.container,
          color: t.warning.onContainer,
        },
        colorError: {
          backgroundColor: t.error.container,
          color: t.error.onContainer,
        },
      },
    },
    MuiFormLabel: {
      styleOverrides: {
        root: {
          color: t.text.secondary,
          '&.Mui-focused': {
            color: t.primary.dark,
          },
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: t.surface.outlineVariant,
        },
      },
    },
    MuiBottomNavigation: {
      styleOverrides: {
        root: {
          height: 80,
          backgroundColor: t.surface.paper,
          borderTop: `1px solid ${t.surface.outlineVariant}`,
          boxShadow: 'none',
        },
      },
    },
    MuiBottomNavigationAction: {
      styleOverrides: {
        root: {
          color: t.text.secondary,
          minWidth: 64,
          paddingTop: 10,
          '&.Mui-selected': {
            color: t.primary.main,
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
          backgroundColor: t.surface.dim,
          borderRight: `1px solid ${t.surface.outlineVariant}`,
          boxShadow: 'none',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 28,
          margin: '4px 12px',
          color: t.text.secondary,
          '&:hover': {
            backgroundColor: alpha(t.primary.main, 0.06),
          },
          '&.Mui-selected': {
            backgroundColor: t.primary.container,
            color: t.primary.onContainer,
            fontWeight: 600,
            '&:hover': {
              backgroundColor: alpha(t.primary.main, 0.18),
            },
            '& .MuiListItemIcon-root': {
              color: t.primary.onContainer,
            },
          },
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          color: t.text.secondary,
          minWidth: 40,
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: alpha(t.primary.main, 0.08),
          },
        },
      },
    },
    MuiCircularProgress: {
      styleOverrides: {
        root: {
          color: t.primary.main,
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
