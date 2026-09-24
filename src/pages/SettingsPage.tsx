import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
  FormControlLabel,
} from '@mui/material';
import api from '../api/client';
import type { PointsMode, ShopSettings, TimeSlab } from '../api/types';

export default function SettingsPage() {
  const qc = useQueryClient();
  const [mode, setMode] = useState<PointsMode>('rupees_per_point');
  const [rupees, setRupees] = useState('100');
  const [pct, setPct] = useState('5');
  const [perQty, setPerQty] = useState('1');
  const [msg, setMsg] = useState('');

  const [slabOpen, setSlabOpen] = useState(false);
  const [editingSlab, setEditingSlab] = useState<TimeSlab | null>(null);
  const [slabName, setSlabName] = useState('');
  const [slabMonths, setSlabMonths] = useState('6');
  const [slabDefault, setSlabDefault] = useState(false);

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => (await api.get<ShopSettings>('/api/settings')).data,
  });

  const { data: slabs = [] } = useQuery({
    queryKey: ['time-slabs'],
    queryFn: async () => (await api.get<TimeSlab[]>('/api/time-slabs')).data,
  });

  useEffect(() => {
    if (!settings) return;
    setMode(settings.points_mode);
    setRupees(String(settings.rupees_per_point));
    setPct(String(settings.points_percentage));
    setPerQty(String(settings.points_per_quantity));
  }, [settings]);

  const saveSettings = useMutation({
    mutationFn: async () => {
      await api.patch('/api/settings', {
        points_mode: mode,
        rupees_per_point: Number(rupees),
        points_percentage: Number(pct),
        points_per_quantity: Number(perQty),
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['settings'] });
      setMsg('Points settings saved');
    },
  });

  const saveSlab = useMutation({
    mutationFn: async () => {
      const payload = {
        name: slabName,
        months: Number(slabMonths),
        is_default: slabDefault,
      };
      if (editingSlab) {
        await api.patch(`/api/time-slabs/${editingSlab.id}`, payload);
      } else {
        await api.post('/api/time-slabs', payload);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['time-slabs'] });
      setSlabOpen(false);
    },
  });

  const deleteSlab = useMutation({
    mutationFn: async (id: string) => api.delete(`/api/time-slabs/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['time-slabs'] }),
  });

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4">Settings</Typography>
        <Typography color="text.secondary">Points rules and time slabs</Typography>
      </Box>

      {msg && <Alert severity="success" onClose={() => setMsg('')}>{msg}</Alert>}

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            How points are earned
          </Typography>
          <Stack spacing={2} maxWidth={480}>
            <FormControl fullWidth>
              <InputLabel>Points mode</InputLabel>
              <Select
                label="Points mode"
                value={mode}
                onChange={(e) => setMode(e.target.value as PointsMode)}
              >
                <MenuItem value="rupees_per_point">Rupees per point (e.g. ₹100 = 1 pt)</MenuItem>
                <MenuItem value="percentage_of_amount">Percentage of purchase amount</MenuItem>
                <MenuItem value="per_quantity">Points per quantity unit</MenuItem>
                <MenuItem value="manual">Manual entry on each invoice</MenuItem>
              </Select>
            </FormControl>

            {mode === 'rupees_per_point' && (
              <TextField
                label="Rupees per 1 point"
                type="number"
                value={rupees}
                onChange={(e) => setRupees(e.target.value)}
              />
            )}
            {mode === 'percentage_of_amount' && (
              <TextField
                label="Percentage of amount"
                type="number"
                value={pct}
                onChange={(e) => setPct(e.target.value)}
                helperText="e.g. 5 means 5% of invoice amount as points"
              />
            )}
            {mode === 'per_quantity' && (
              <TextField
                label="Points per quantity"
                type="number"
                value={perQty}
                onChange={(e) => setPerQty(e.target.value)}
              />
            )}
            {mode === 'manual' && (
              <Typography variant="body2" color="text.secondary">
                Admin enters points on each line (or invoice override) when creating purchases.
              </Typography>
            )}

            <Button
              variant="contained"
              color="secondary"
              sx={{ alignSelf: 'flex-start' }}
              disabled={saveSettings.isPending}
              onClick={() => saveSettings.mutate()}
            >
              Save points settings
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h6">Time slabs</Typography>
            <Button
              variant="outlined"
              onClick={() => {
                setEditingSlab(null);
                setSlabName('');
                setSlabMonths('6');
                setSlabDefault(false);
                setSlabOpen(true);
              }}
            >
              Add slab
            </Button>
          </Stack>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Months</TableCell>
                <TableCell>Default</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {slabs.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>{s.name}</TableCell>
                  <TableCell>{s.months}</TableCell>
                  <TableCell>{s.is_default ? 'Yes' : '—'}</TableCell>
                  <TableCell align="right">
                    <Button
                      size="small"
                      onClick={() => {
                        setEditingSlab(s);
                        setSlabName(s.name);
                        setSlabMonths(String(s.months));
                        setSlabDefault(s.is_default);
                        setSlabOpen(true);
                      }}
                    >
                      Edit
                    </Button>
                    <Button size="small" color="error" onClick={() => deleteSlab.mutate(s.id)}>
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={slabOpen} onClose={() => setSlabOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>{editingSlab ? 'Edit slab' : 'Add slab'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Name" value={slabName} onChange={(e) => setSlabName(e.target.value)} fullWidth />
            <TextField
              label="Months"
              type="number"
              value={slabMonths}
              onChange={(e) => setSlabMonths(e.target.value)}
              fullWidth
            />
            <FormControlLabel
              control={<Switch checked={slabDefault} onChange={(e) => setSlabDefault(e.target.checked)} />}
              label="Set as default"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSlabOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="secondary"
            disabled={!slabName || !(Number(slabMonths) > 0) || saveSlab.isPending}
            onClick={() => saveSlab.mutate()}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
