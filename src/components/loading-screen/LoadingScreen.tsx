import { Box, GlobalStyles } from '@mui/material';
import Logo from '../logo/Logo';

type LoadingScreenProps = {
  /** Taller min-height for use inside dashboard content */
  portal?: boolean;
};

export default function LoadingScreen({ portal = false }: LoadingScreenProps) {
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
          px: 5,
          width: 1,
          flexGrow: 1,
          minHeight: portal ? '60vh' : '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box sx={{ position: 'relative', display: 'inline-flex', mb: 5 }}>
          <Logo />
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
              top: 'calc(100% + 24px)',
              left: 0,
            }}
          >
            {[0, 1, 2].map((i) => (
              <Box
                key={i}
                component="span"
                sx={{
                  width: 8,
                  height: 8,
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
      </Box>
    </>
  );
}
