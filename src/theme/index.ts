import { createTheme, ThemeOptions } from '@mui/material/styles';
import typography from './typography';

/** Full-viewport soft green wash (not just a top corner blob) */
export function getAppBackground(mode: 'light' | 'dark') {
  if (mode === 'dark') {
    return [
      'radial-gradient(ellipse 100% 80% at 20% 0%, rgba(0,167,111,0.28), transparent 55%)',
      'radial-gradient(ellipse 90% 70% at 100% 30%, rgba(0,167,111,0.16), transparent 50%)',
      'radial-gradient(ellipse 80% 60% at 50% 100%, rgba(0,167,111,0.20), transparent 55%)',
      'linear-gradient(180deg, #161C24 0%, #161C24 100%)',
    ].join(', ');
  }
  return [
    'radial-gradient(ellipse 100% 80% at 20% 0%, rgba(0,167,111,0.26), transparent 55%)',
    'radial-gradient(ellipse 90% 70% at 100% 30%, rgba(0,167,111,0.14), transparent 50%)',
    'radial-gradient(ellipse 80% 60% at 50% 100%, rgba(0,167,111,0.18), transparent 55%)',
    'linear-gradient(180deg, #E8F7F0 0%, #F2FAF6 40%, #F9FAFB 100%)',
  ].join(', ');
}

/** Soft green wash for tables / data panels */
export function getTableBackground(mode: 'light' | 'dark') {
  if (mode === 'dark') {
    return [
      'radial-gradient(ellipse 80% 60% at 0% 0%, rgba(0,167,111,0.22), transparent 55%)',
      'radial-gradient(ellipse 70% 50% at 100% 100%, rgba(0,167,111,0.14), transparent 50%)',
      'linear-gradient(180deg, rgba(33,43,54,0.92) 0%, rgba(33,43,54,0.88) 100%)',
    ].join(', ');
  }
  return [
    'radial-gradient(ellipse 80% 60% at 0% 0%, rgba(0,167,111,0.18), transparent 55%)',
    'radial-gradient(ellipse 70% 50% at 100% 100%, rgba(0,167,111,0.12), transparent 50%)',
    'linear-gradient(180deg, rgba(255,255,255,0.82) 0%, rgba(232,247,240,0.9) 100%)',
  ].join(', ');
}

const shared: ThemeOptions = {
  typography,
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 8, boxShadow: 'none', fontWeight: 700 },
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
  const tableBg = getTableBackground(mode);
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
            height: '100%',
          },
          body: {
            minHeight: '100%',
            margin: 0,
            background: appBg,
            backgroundAttachment: 'fixed',
            backgroundRepeat: 'no-repeat',
            backgroundSize: '100% 100%',
          },
          '#root': {
            position: 'relative',
            minHeight: '100vh',
            isolation: 'isolate',
          },
          /* Fixed full-viewport layer so gradient never clips mid-page */
          '#root::before': {
            content: '""',
            position: 'fixed',
            inset: 0,
            zIndex: -1,
            pointerEvents: 'none',
            background: appBg,
            backgroundRepeat: 'no-repeat',
            backgroundSize: '100% 100%',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            backgroundImage: tableBg,
            backgroundColor: 'transparent',
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
            backgroundColor: isDark ? 'rgba(22,28,36,0.55)' : 'rgba(255,255,255,0.55)',
            backdropFilter: 'blur(10px)',
          },
        },
      },
      MuiTableContainer: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            overflow: 'auto',
            backgroundImage: tableBg,
            backgroundColor: 'transparent',
            border: '1px solid rgba(145,158,171,0.24)',
          },
        },
      },
      MuiTable: {
        styleOverrides: {
          root: {
            borderCollapse: 'collapse',
            border: '1px solid rgba(145,158,171,0.24)',
            backgroundColor: 'transparent',
          },
        },
      },
      MuiTableHead: {
        styleOverrides: {
          root: {
            '& .MuiTableCell-head': {
              backgroundColor: isDark ? 'rgba(0,167,111,0.18)' : 'rgba(0,167,111,0.14)',
              color: isDark ? '#FFFFFF' : '#1C252E',
              fontWeight: 600,
              fontSize: '0.8125rem',
              lineHeight: 1.5,
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
            fontSize: '0.875rem',
            fontWeight: 400,
            lineHeight: 22 / 14,
            backgroundColor: 'transparent',
          },
          body: {
            color: isDark ? '#FFFFFF' : '#1C252E',
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            backgroundColor: 'transparent',
            '&:nth-of-type(even)': {
              backgroundColor: isDark ? 'rgba(0,167,111,0.06)' : 'rgba(0,167,111,0.05)',
            },
            '&:hover': {
              backgroundColor: isDark ? 'rgba(0,167,111,0.12)' : 'rgba(0,167,111,0.10)',
            },
          },
        },
      },
      MuiListItemText: {
        styleOverrides: {
          primary: {
            fontSize: '0.875rem',
            fontWeight: 600,
            lineHeight: 22 / 14,
          },
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: {
            fontSize: '0.875rem',
            fontWeight: 500,
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          label: {
            fontWeight: 600,
            fontSize: '0.8125rem',
          },
        },
      },
    },
  });
}
