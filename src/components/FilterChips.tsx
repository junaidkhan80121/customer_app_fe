import { Chip, Stack, Button, Typography } from '@mui/material';

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

/** Minimals-style result chips for active filters */
export default function FilterChips({ chips, onClearAll, resultsLabel }: Props) {
  if (!chips.length) return null;

  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={1}
      alignItems={{ xs: 'stretch', sm: 'center' }}
      flexWrap="wrap"
      useFlexGap
      sx={{ mb: 2 }}
    >
      {resultsLabel && (
        <Typography variant="body2" color="text.secondary" sx={{ mr: { sm: 1 } }}>
          {resultsLabel}
        </Typography>
      )}
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ flex: 1 }}>
        {chips.map((chip) => (
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
        ))}
      </Stack>
      {onClearAll && (
        <Button size="small" color="error" onClick={onClearAll} sx={{ alignSelf: { xs: 'flex-start', sm: 'center' } }}>
          Clear
        </Button>
      )}
    </Stack>
  );
}
