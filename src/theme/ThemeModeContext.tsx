import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { createAppTheme } from './index';

type Mode = 'light' | 'dark';

interface ThemeModeContextValue {
  mode: Mode;
  toggleMode: () => void;
  setMode: (mode: Mode) => void;
}

const ThemeModeContext = createContext<ThemeModeContextValue | undefined>(undefined);
const STORAGE_KEY = 'lt_theme_mode';

function getInitialMode(): Mode {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === 'light' || saved === 'dark') return saved;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<Mode>(() => getInitialMode());

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, mode);
  }, [mode]);

  const setMode = useCallback((next: Mode) => setModeState(next), []);
  const toggleMode = useCallback(
    () => setModeState((m) => (m === 'light' ? 'dark' : 'light')),
    [],
  );

  const theme = useMemo(() => createAppTheme(mode), [mode]);
  const value = useMemo(() => ({ mode, toggleMode, setMode }), [mode, toggleMode, setMode]);

  return (
    <ThemeModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <CssBaseline />
          {children}
        </LocalizationProvider>
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
}

export function useThemeMode() {
  const ctx = useContext(ThemeModeContext);
  if (!ctx) throw new Error('useThemeMode must be used within ThemeModeProvider');
  return ctx;
}
