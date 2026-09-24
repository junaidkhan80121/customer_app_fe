import { Box, BoxProps } from '@mui/material';

type IllustProps = BoxProps & { primary?: string; secondary?: string };

/** Soft blob + character illustrations (Minimals-inspired) */

export function IllustrationEmpty({ sx, ...other }: IllustProps) {
  return (
    <Box
      component="svg"
      viewBox="0 0 480 360"
      xmlns="http://www.w3.org/2000/svg"
      sx={{ width: '100%', maxWidth: 280, height: 'auto', ...sx }}
      {...other}
    >
      <ellipse cx="240" cy="300" rx="140" ry="18" fill="currentColor" opacity="0.08" />
      <path
        fill="#00A76F"
        opacity="0.16"
        d="M120 210c0-70 54-120 120-120s120 50 120 120c0 18-4 34-12 48H132c-8-14-12-30-12-48z"
      />
      <rect x="170" y="150" width="140" height="100" rx="16" fill="#fff" stroke="#919EAB" strokeWidth="2" />
      <path d="M190 180h100M190 200h70M190 220h85" stroke="#C4CDD5" strokeWidth="8" strokeLinecap="round" />
      <circle cx="320" cy="140" r="28" fill="#00A76F" opacity="0.9" />
      <path d="M320 128v24M308 140h24" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
      <circle cx="160" cy="130" r="10" fill="#FFAB00" />
      <circle cx="350" cy="220" r="8" fill="#00B8D9" />
    </Box>
  );
}

export function IllustrationSearch({ sx, ...other }: IllustProps) {
  return (
    <Box
      component="svg"
      viewBox="0 0 480 360"
      xmlns="http://www.w3.org/2000/svg"
      sx={{ width: '100%', maxWidth: 280, height: 'auto', ...sx }}
      {...other}
    >
      <ellipse cx="240" cy="300" rx="140" ry="18" fill="currentColor" opacity="0.08" />
      <circle cx="220" cy="170" r="70" fill="#00A76F" opacity="0.14" />
      <circle cx="220" cy="170" r="48" fill="none" stroke="#1C252E" strokeWidth="10" opacity="0.7" />
      <path d="M255 205l48 48" stroke="#00A76F" strokeWidth="12" strokeLinecap="round" />
      <circle cx="340" cy="120" r="14" fill="#FFAB00" />
      <circle cx="140" cy="230" r="10" fill="#00B8D9" />
    </Box>
  );
}

export function Illustration404({ sx, ...other }: IllustProps) {
  return (
    <Box
      component="svg"
      viewBox="0 0 480 360"
      xmlns="http://www.w3.org/2000/svg"
      sx={{ width: '100%', maxWidth: 360, height: 'auto', ...sx }}
      {...other}
    >
      <ellipse cx="240" cy="310" rx="150" ry="16" fill="currentColor" opacity="0.08" />
      <text
        x="240"
        y="175"
        textAnchor="middle"
        fontFamily="Public Sans, sans-serif"
        fontWeight="800"
        fontSize="120"
        fill="#00A76F"
        opacity="0.2"
      >
        404
      </text>
      <circle cx="180" cy="200" r="36" fill="#212B36" />
      <circle cx="300" cy="200" r="36" fill="#212B36" />
      <circle cx="168" cy="194" r="6" fill="#fff" />
      <circle cx="288" cy="194" r="6" fill="#fff" />
      <path d="M200 250c20 16 60 16 80 0" fill="none" stroke="#00A76F" strokeWidth="6" strokeLinecap="round" />
      <circle cx="120" cy="140" r="10" fill="#FFAB00" />
      <circle cx="360" cy="150" r="8" fill="#00B8D9" />
      <path
        d="M150 280h180"
        stroke="#919EAB"
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray="8 10"
        opacity="0.5"
      />
    </Box>
  );
}

export function IllustrationWelcome({ sx, ...other }: IllustProps) {
  return (
    <Box
      component="svg"
      viewBox="0 0 480 360"
      xmlns="http://www.w3.org/2000/svg"
      sx={{ width: '100%', maxWidth: 320, height: 'auto', ...sx }}
      {...other}
    >
      <ellipse cx="240" cy="310" rx="150" ry="16" fill="currentColor" opacity="0.08" />
      <path
        d="M90 250c30-90 90-140 150-140s120 50 150 140"
        fill="#00A76F"
        opacity="0.12"
      />
      <rect x="150" y="120" width="180" height="130" rx="20" fill="#fff" stroke="#DFE3E8" strokeWidth="3" />
      <rect x="170" y="145" width="80" height="12" rx="6" fill="#00A76F" opacity="0.7" />
      <rect x="170" y="170" width="140" height="8" rx="4" fill="#C4CDD5" />
      <rect x="170" y="190" width="110" height="8" rx="4" fill="#C4CDD5" />
      <rect x="170" y="210" width="90" height="20" rx="10" fill="#00A76F" />
      <circle cx="360" cy="110" r="32" fill="#FFAB00" opacity="0.9" />
      <path d="M360 96v28M346 110h28" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
      <circle cx="120" cy="160" r="12" fill="#00B8D9" />
    </Box>
  );
}

export function IllustrationTrophy({ sx, ...other }: IllustProps) {
  return (
    <Box
      component="svg"
      viewBox="0 0 480 360"
      xmlns="http://www.w3.org/2000/svg"
      sx={{ width: '100%', maxWidth: 260, height: 'auto', ...sx }}
      {...other}
    >
      <ellipse cx="240" cy="300" rx="120" ry="16" fill="currentColor" opacity="0.08" />
      <path d="M180 120h120v70c0 40-30 70-60 70s-60-30-60-70V120z" fill="#FFAB00" opacity="0.9" />
      <path d="M180 130c-30 10-40 40-20 60M300 130c30 10 40 40 20 60" fill="none" stroke="#FFAB00" strokeWidth="14" strokeLinecap="round" />
      <rect x="220" y="255" width="40" height="30" rx="4" fill="#919EAB" />
      <rect x="200" y="280" width="80" height="14" rx="4" fill="#637381" />
      <circle cx="140" cy="100" r="8" fill="#00A76F" />
      <circle cx="340" cy="160" r="10" fill="#00B8D9" />
    </Box>
  );
}

export function IllustrationUsers({ sx, ...other }: IllustProps) {
  return (
    <Box
      component="svg"
      viewBox="0 0 480 360"
      xmlns="http://www.w3.org/2000/svg"
      sx={{ width: '100%', maxWidth: 260, height: 'auto', ...sx }}
      {...other}
    >
      <ellipse cx="240" cy="300" rx="130" ry="16" fill="currentColor" opacity="0.08" />
      <circle cx="240" cy="130" r="36" fill="#00A76F" />
      <path d="M180 230c10-40 30-55 60-55s50 15 60 55" fill="#00A76F" opacity="0.85" />
      <circle cx="155" cy="150" r="26" fill="#00B8D9" />
      <path d="M110 240c8-30 22-42 45-42s37 12 45 42" fill="#00B8D9" opacity="0.75" />
      <circle cx="325" cy="150" r="26" fill="#FFAB00" />
      <path d="M280 240c8-30 22-42 45-42s37 12 45 42" fill="#FFAB00" opacity="0.75" />
    </Box>
  );
}

export function IllustrationInvoice({ sx, ...other }: IllustProps) {
  return (
    <Box
      component="svg"
      viewBox="0 0 480 360"
      xmlns="http://www.w3.org/2000/svg"
      sx={{ width: '100%', maxWidth: 260, height: 'auto', ...sx }}
      {...other}
    >
      <ellipse cx="240" cy="300" rx="120" ry="16" fill="currentColor" opacity="0.08" />
      <rect x="155" y="80" width="170" height="210" rx="12" fill="#fff" stroke="#DFE3E8" strokeWidth="3" />
      <rect x="175" y="110" width="90" height="10" rx="5" fill="#00A76F" />
      <rect x="175" y="140" width="130" height="8" rx="4" fill="#C4CDD5" />
      <rect x="175" y="160" width="110" height="8" rx="4" fill="#C4CDD5" />
      <rect x="175" y="180" width="120" height="8" rx="4" fill="#C4CDD5" />
      <rect x="175" y="220" width="70" height="24" rx="8" fill="#00A76F" opacity="0.85" />
      <circle cx="350" cy="100" r="16" fill="#FFAB00" />
      <circle cx="130" cy="200" r="10" fill="#00B8D9" />
    </Box>
  );
}
