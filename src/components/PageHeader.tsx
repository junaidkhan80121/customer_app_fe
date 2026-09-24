import { Box, Stack, Typography, SxProps, Theme } from '@mui/material';
import { ReactNode } from 'react';

type Props = {
  title: string;
  description?: string;
  illustration?: ReactNode;
  action?: ReactNode;
  sx?: SxProps<Theme>;
};

/** Page header with optional floating illustration accent */
export default function PageHeader({ title, description, illustration, action, sx }: Props) {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      justifyContent="space-between"
      alignItems={{ xs: 'stretch', sm: 'center' }}
      spacing={2}
      sx={sx}
    >
      <Stack direction="row" spacing={2} alignItems="center" sx={{ minWidth: 0 }}>
        {illustration && (
          <Box
            sx={{
              display: { xs: 'none', md: 'block' },
              flexShrink: 0,
              width: 72,
              '& svg': { maxWidth: 72 },
              animation: 'lt-bob 2.8s ease-in-out infinite',
              '@keyframes lt-bob': {
                '0%, 100%': { transform: 'translateY(0) rotate(-2deg)' },
                '50%': { transform: 'translateY(-4px) rotate(2deg)' },
              },
            }}
          >
            {illustration}
          </Box>
        )}
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h4">{title}</Typography>
          {description && (
            <Typography color="text.secondary">{description}</Typography>
          )}
        </Box>
      </Stack>
      {action}
    </Stack>
  );
}
