import { FormEvent, useState } from 'react';
import { Navigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  IconButton,
  Stack,
  TextField,
  Typography,
  Tooltip,
} from '@mui/material';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import { useAuth } from '../auth/AuthContext';
import { useThemeMode } from '../theme/ThemeModeContext';
import { SplashScreen } from '../components/loading-screen';
import { IllustrationWelcome } from '../assets/illustrations';
import Logo from '../components/logo/Logo';
import { getAppBackground } from '../theme';

export default function LoginPage() {
  const { admin, login, loading } = useAuth();
  const { mode, toggleMode } = useThemeMode();
  const [email, setEmail] = useState('admin@lalatraders.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (loading) return <SplashScreen />;
  if (admin) return <Navigate to="/" replace />;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
    } catch {
      setError('Invalid email or password');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
        position: 'relative',
        background: getAppBackground(mode),
      }}
    >
      <Tooltip title={mode === 'dark' ? 'Light mode' : 'Dark mode'}>
        <IconButton
          onClick={toggleMode}
          sx={{ position: 'absolute', top: 16, right: 16, zIndex: 2 }}
          aria-label="Toggle color mode"
        >
          {mode === 'dark' ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
        </IconButton>
      </Tooltip>

      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 3,
          p: 4,
          bgcolor: (t) => (t.palette.mode === 'dark' ? 'rgba(0,167,111,0.06)' : 'rgba(0,167,111,0.06)'),
          borderRight: '1px dashed',
          borderColor: 'divider',
        }}
      >
        <Box
          sx={{
            animation: 'lt-float 3.5s ease-in-out infinite',
            '@keyframes lt-float': {
              '0%, 100%': { transform: 'translateY(0)' },
              '50%': { transform: 'translateY(-12px)' },
            },
          }}
        >
          <IllustrationWelcome sx={{ maxWidth: 360 }} />
        </Box>
        <Box sx={{ textAlign: 'center', maxWidth: 360 }}>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Lala Traders
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            Track wholesale purchases, points, and top buyers in one place.
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'grid', placeItems: 'center', p: 2 }}>
        <Card sx={{ width: '100%', maxWidth: 420 }}>
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
              <Logo sx={{ width: 44, height: 44, fontSize: 16 }} />
              <Box>
                <Typography variant="h5">Sign in</Typography>
                <Typography variant="body2" color="text.secondary">
                  Admin access only
                </Typography>
              </Box>
            </Stack>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <Stack component="form" spacing={2} onSubmit={onSubmit}>
              <TextField
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                fullWidth
              />
              <TextField
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                fullWidth
              />
              <Button type="submit" variant="contained" color="secondary" size="large" disabled={submitting}>
                {submitting ? 'Signing in…' : 'Sign in'}
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
