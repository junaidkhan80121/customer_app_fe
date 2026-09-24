import { Box, Chip, Stack, Button, Typography } from '@mui/material';

export type FilterChipItem = {
  key: string;
  label: string;
  onDelete: () => void;
};

type Props = {
  chips: FilterChipItem[];
  onClearAll?: () => void;
  resultsLabel?: string;
};

/** Minimals-style result chips — always reserves row height to avoid table jump */
export default function FilterChips({ chips, onClearAll, resultsLabel }: Props) {
  const hasChips = chips.length > 0;

  return (
    <Box
      sx={{
        mb: 2,
        minHeight: 40,
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1}
        alignItems={{ xs: 'stretch', sm: 'center' }}
        flexWrap="wrap"
        useFlexGap
        sx={{ width: 1, minHeight: 32 }}
      >
        {resultsLabel ? (
          <Typography variant="body2" color="text.secondary" sx={{ mr: { sm: 1 }, lineHeight: '32px' }}>
            {resultsLabel}
          </Typography>
        ) : (
          <Typography
            variant="body2"
            color="text.disabled"
            sx={{ mr: { sm: 1 }, lineHeight: '32px', visibility: 'hidden' }}
            aria-hidden
          >
            0 results found
          </Typography>
        )}

        <Stack
          direction="row"
          spacing={1}
          flexWrap="wrap"
          useFlexGap
          sx={{ flex: 1, minHeight: 32, alignItems: 'center' }}
        >
          {hasChips ? (
            chips.map((chip) => (
              <Chip
                key={chip.key}
                label={chip.label}
                onDelete={chip.onDelete}
                size="small"
                sx={{
                  bgcolor: (t) =>
                    t.palette.mode === 'dark' ? 'rgba(145,158,171,0.16)' : 'rgba(145,158,171,0.16)',
                  borderRadius: 1,
                  fontWeight: 600,
                  '& .MuiChip-deleteIcon': { fontSize: 16 },
                }}
              />
            ))
          ) : (
            <Chip
              size="small"
              label="No filters"
              sx={{ visibility: 'hidden', pointerEvents: 'none' }}
              aria-hidden
            />
          )}
        </Stack>

        {onClearAll && (
          <Button
            size="small"
            color="error"
            onClick={onClearAll}
            disabled={!hasChips}
            sx={{
              alignSelf: { xs: 'flex-start', sm: 'center' },
              visibility: hasChips ? 'visible' : 'hidden',
              pointerEvents: hasChips ? 'auto' : 'none',
            }}
          >
            Clear
          </Button>
        )}
      </Stack>
    </Box>
  );
}
