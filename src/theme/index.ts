import { createTheme, ThemeOptions } from '@mui/material/styles';

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
    MuiTableCell: {
      styleOverrides: {
        root: {
          whiteSpace: 'nowrap',
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
          },
        },
      },
    },
  });
}
