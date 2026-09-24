import { Box, Button, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Illustration404 } from '../assets/illustrations';
import Logo from '../components/logo/Logo';
import { useThemeMode } from '../theme/ThemeModeContext';
import { getAppBackground } from '../theme';

export default function NotFoundPage() {
  const navigate = useNavigate();
  const { mode } = useThemeMode();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        px: 2,
        background: getAppBackground(mode),
      }}
    >
      <Stack alignItems="center" spacing={3} sx={{ maxWidth: 480, textAlign: 'center' }}>
        <Logo sx={{ width: 56, height: 56 }} />
        <Box
          sx={{
            animation: 'lt-float 3.2s ease-in-out infinite',
            '@keyframes lt-float': {
              '0%, 100%': { transform: 'translateY(0)' },
              '50%': { transform: 'translateY(-10px)' },
            },
          }}
        >
          <Illustration404 />
        </Box>
        <Box>
          <Typography variant="h3" sx={{ fontWeight: 800, fontSize: { xs: '1.75rem', sm: '2.5rem' } }}>
            Page not found
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            Sorry, we couldn’t find the page you’re looking for. Maybe it was moved or never existed.
          </Typography>
        </Box>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
          <Button variant="contained" color="secondary" onClick={() => navigate('/')}>
            Go to dashboard
          </Button>
          <Button variant="outlined" color="inherit" onClick={() => navigate(-1)}>
            Go back
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
