import { useEffect, useState } from 'react';
import { useIsFetching, useIsMutating } from '@tanstack/react-query';
import { Box, LinearProgress } from '@mui/material';

/** Thin top progress bar (Minimals / nprogress style) during query activity. */
export default function ProgressBar() {
  const fetching = useIsFetching();
  const mutating = useIsMutating();
  const active = fetching + mutating > 0;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (active) {
      setVisible(true);
      return;
    }
    const t = window.setTimeout(() => setVisible(false), 280);
    return () => window.clearTimeout(t);
  }, [active]);

  if (!visible) return null;

  return (
    <Box
      sx={{
        top: 0,
        left: 0,
        width: 1,
        zIndex: 9999,
        position: 'fixed',
        pointerEvents: 'none',
      }}
    >
      <LinearProgress
        color="inherit"
        sx={{
          height: 3,
          bgcolor: 'transparent',
          '& .MuiLinearProgress-bar': {
            bgcolor: 'secondary.main',
            boxShadow: (t) => `0 0 8px ${t.palette.secondary.main}`,
          },
        }}
      />
    </Box>
  );
}
