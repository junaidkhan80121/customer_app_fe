import { createTheme, ThemeOptions } from '@mui/material/styles';

/** Shared page background (same soft green radial as 404) */
export function getAppBackground(mode: 'light' | 'dark') {
  return mode === 'dark'
    ? 'radial-gradient(ellipse at 30% 20%, rgba(0,167,111,0.12), transparent 50%), #161C24'
    : 'radial-gradient(ellipse at 30% 20%, rgba(0,167,111,0.1), transparent 50%), #F9FAFB';
}

const shared: ThemeOptions = {
  typography: {
    fontFamily: '"Public Sans", sans-serif',
    h4: { fontWeight: 700, fontSize: '1.5rem', '@media (min-width:600px)': { fontSize: '2rem' } },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 8, boxShadow: 'none' },
        contained: {
          boxShadow: 'none',
          '&:hover': { boxShadow: 'none' },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundImage: 'none',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          margin: 16,
          width: 'calc(100% - 32px)',
        },
      },
    },
  },
};

export function createAppTheme(mode: 'light' | 'dark') {
  const isDark = mode === 'dark';
  const appBg = getAppBackground(mode);
  return createTheme({
    ...shared,
    palette: {
      mode,
      primary: isDark
        ? { main: '#FFFFFF', contrastText: '#161C24' }
        : { main: '#1C252E', contrastText: '#fff' },
      secondary: { main: '#00A76F' },
      background: isDark
        ? { default: '#161C24', paper: '#212B36' }
        : { default: '#F9FAFB', paper: '#FFFFFF' },
      text: isDark
        ? { primary: '#FFFFFF', secondary: '#919EAB' }
        : { primary: '#1C252E', secondary: '#637381' },
      divider: isDark ? 'rgba(145,158,171,0.24)' : 'rgba(145,158,171,0.24)',
      success: { main: '#22C55E' },
      warning: { main: '#FFAB00' },
      error: { main: '#FF5630' },
      info: { main: '#00B8D9' },
    },
    components: {
      ...shared.components,
      MuiCssBaseline: {
        styleOverrides: {
          html: {
            minHeight: '100%',
          },
          body: {
            minHeight: '100%',
            background: appBg,
            backgroundAttachment: 'fixed',
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
          },
          '#root': {
            minHeight: '100vh',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            boxShadow: isDark
              ? '0 0 2px 0 rgba(0,0,0,0.4), 0 12px 24px -4px rgba(0,0,0,0.35)'
              : '0 0 2px 0 rgba(145,158,171,0.2), 0 12px 24px -4px rgba(145,158,171,0.12)',
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            borderRight: '1px dashed rgba(145,158,171,0.24)',
            backgroundImage: 'none',
            backgroundColor: isDark ? 'rgba(22,28,36,0.92)' : 'rgba(249,250,251,0.92)',
            backdropFilter: 'blur(8px)',
          },
        },
      },
      MuiTableContainer: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            overflow: 'auto',
          },
        },
      },
      MuiTable: {
        styleOverrides: {
          root: {
            borderCollapse: 'collapse',
            border: '1px solid rgba(145,158,171,0.24)',
          },
        },
      },
      MuiTableHead: {
        styleOverrides: {
          root: {
            '& .MuiTableCell-head': {
              backgroundColor: isDark ? 'rgba(145,158,171,0.12)' : 'rgba(145,158,171,0.08)',
              color: isDark ? '#FFFFFF' : '#1C252E',
              fontWeight: 600,
              fontSize: 13,
            },
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            whiteSpace: 'nowrap',
            border: '1px solid rgba(145,158,171,0.24)',
            padding: '12px 16px',
            fontSize: 14,
          },
          body: {
            color: isDark ? '#FFFFFF' : '#1C252E',
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            '&:hover': {
              backgroundColor: isDark ? 'rgba(145,158,171,0.08)' : 'rgba(145,158,171,0.06)',
            },
          },
        },
      },
    },
  });
}
