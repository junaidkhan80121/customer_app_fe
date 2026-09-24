import { Box, BoxProps, Typography } from '@mui/material';

type LogoProps = BoxProps & {
  disabledLink?: boolean;
};

export default function Logo({ sx, ...other }: LogoProps) {
  return (
    <Box
      sx={{
        width: 64,
        height: 64,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 2,
        bgcolor: 'secondary.main',
        color: '#fff',
        flexShrink: 0,
        ...sx,
      }}
      {...other}
    >
      <Typography component="span" sx={{ fontWeight: 800, fontSize: 22, letterSpacing: 0.5, lineHeight: 1 }}>
        LT
      </Typography>
    </Box>
  );
}
