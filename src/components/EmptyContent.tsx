import { Box, Button, Stack, Typography, SxProps, Theme } from '@mui/material';
import { ReactNode } from 'react';
import { IllustrationEmpty, IllustrationSearch } from '../assets/illustrations';

type Props = {
  title?: string;
  description?: string;
  action?: ReactNode;
  /** 'empty' | 'search' */
  variant?: 'empty' | 'search';
  illustration?: ReactNode;
  sx?: SxProps<Theme>;
  compact?: boolean;
};

export default function EmptyContent({
  title = 'Nothing here yet',
  description = 'Try adjusting filters or add a new record.',
  action,
  variant = 'empty',
  illustration,
  sx,
  compact = false,
}: Props) {
  const DefaultIllust = variant === 'search' ? IllustrationSearch : IllustrationEmpty;

  return (
    <Stack
      alignItems="center"
      justifyContent="center"
      spacing={compact ? 1.5 : 2}
      sx={{
        py: compact ? 3 : 5,
        px: 2,
        textAlign: 'center',
        width: 1,
        ...sx,
      }}
    >
      <Box
        sx={{
          color: 'text.primary',
          animation: 'lt-float 3.2s ease-in-out infinite',
          '@keyframes lt-float': {
            '0%, 100%': { transform: 'translateY(0)' },
            '50%': { transform: 'translateY(-8px)' },
          },
        }}
      >
        {illustration || <DefaultIllust sx={{ maxWidth: compact ? 180 : 240 }} />}
      </Box>
      <Box>
        <Typography variant={compact ? 'subtitle1' : 'h6'} sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
        {description && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, maxWidth: 360, mx: 'auto' }}>
            {description}
          </Typography>
        )}
      </Box>
      {action}
    </Stack>
  );
}

export function EmptyActionButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <Button variant="contained" color="secondary" onClick={onClick}>
      {label}
    </Button>
  );
}
