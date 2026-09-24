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

export default function LoginPage() {
  const { admin, login, loading } = useAuth();
  const { mode, toggleMode } = useThemeMode();
  const [email, setEmail] = useState('admin@lalatraders.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!loading && admin) return <Navigate to="/" replace />;

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
        placeItems: 'center',
        position: 'relative',
        background: (t) =>
          t.palette.mode === 'dark'
            ? 'radial-gradient(circle at 20% 20%, rgba(0,167,111,0.18), transparent 40%), radial-gradient(circle at 80% 0%, rgba(255,255,255,0.04), transparent 35%), #161C24'
            : 'radial-gradient(circle at 20% 20%, rgba(0,167,111,0.12), transparent 40%), radial-gradient(circle at 80% 0%, rgba(28,37,46,0.08), transparent 35%), #F9FAFB',
        p: 2,
      }}
    >
      <Tooltip title={mode === 'dark' ? 'Light mode' : 'Dark mode'}>
        <IconButton
          onClick={toggleMode}
          sx={{ position: 'absolute', top: 16, right: 16 }}
          aria-label="Toggle color mode"
        >
          {mode === 'dark' ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
        </IconButton>
      </Tooltip>
      <Card sx={{ width: '100%', maxWidth: 420 }}>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Typography variant="h5" gutterBottom>
            Lala Traders
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Admin sign in
          </Typography>
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
  );
}
