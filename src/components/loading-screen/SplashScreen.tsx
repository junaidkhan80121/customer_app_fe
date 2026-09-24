import { Box, GlobalStyles } from '@mui/material';
import Logo from '../logo/Logo';
import { getAppBackground } from '../../theme';
import { useThemeMode } from '../../theme/ThemeModeContext';

export default function SplashScreen() {
  const { mode } = useThemeMode();

  return (
    <>
      <GlobalStyles
        styles={{
          '@keyframes lt-splash-bounce': {
            '0%, 80%, 100%': { transform: 'scale(0)' },
            '40%': { transform: 'scale(1)' },
          },
        }}
      />
      <Box
        sx={{
          right: 0,
          width: 1,
          bottom: 0,
          height: 1,
          zIndex: 9998,
          display: 'flex',
          position: 'fixed',
          alignItems: 'center',
          justifyContent: 'center',
          background: getAppBackground(mode),
        }}
      >
        <Box sx={{ position: 'relative', display: 'inline-flex' }}>
          <Logo sx={{ zIndex: 9 }} />
          <Box
            component="span"
            sx={{
              top: 0,
              left: 0,
              width: 1,
              height: 1,
              position: 'absolute',
              borderRadius: '50%',
              border: (t) => `3px solid ${t.palette.secondary.main}`,
              opacity: 0.24,
            }}
          />
        </Box>

        <Box
          sx={{
            right: 0,
            bottom: 0,
            m: 'auto',
            display: 'flex',
            position: 'absolute',
            alignItems: 'flex-end',
            justifyContent: 'center',
            gap: 0.75,
            mb: '20vh',
          }}
        >
          {[0, 1, 2].map((i) => (
            <Box
              key={i}
              component="span"
              sx={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                bgcolor: 'secondary.main',
                display: 'inline-block',
                animation: 'lt-splash-bounce 1.4s ease-in-out infinite both',
                animationDelay: `${i * 0.16}s`,
              }}
            />
          ))}
        </Box>
      </Box>
    </>
  );
}
