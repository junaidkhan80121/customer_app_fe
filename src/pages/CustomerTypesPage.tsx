import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
import type { CustomerType } from '../api/types';

export default function CustomerTypesPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CustomerType | null>(null);
  const [name, setName] = useState('');
  const [active, setActive] = useState(true);
  const [error, setError] = useState('');

  const { data = [] } = useQuery({
    queryKey: ['customer-types'],
    queryFn: async () => (await api.get<CustomerType[]>('/api/customer-types')).data,
  });

  const save = useMutation({
    mutationFn: async () => {
      if (editing) {
        await api.patch(`/api/customer-types/${editing.id}`, { name, is_active: active });
      } else {
        await api.post('/api/customer-types', { name, is_active: active });
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['customer-types'] });
      setOpen(false);
    },
    onError: (err: any) => setError(err?.response?.data?.detail || 'Save failed'),
  });

  return (
    <Stack spacing={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h4">Customer types</Typography>
          <Typography color="text.secondary">Add plumber, mason, or any trade type</Typography>
        </Box>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => {
            setEditing(null);
            setName('');
            setActive(true);
            setError('');
            setOpen(true);
          }}
        >
          Add type
        </Button>
      </Stack>

      <Card>
        <CardContent>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Active</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>{t.name}</TableCell>
                  <TableCell>{t.is_active ? 'Yes' : 'No'}</TableCell>
                  <TableCell align="right">
                    <Button
                      size="small"
                      onClick={() => {
                        setEditing(t);
                        setName(t.name);
                        setActive(t.is_active);
                        setError('');
                        setOpen(true);
                      }}
                    >
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>{editing ? 'Edit type' : 'Add type'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {error && (
              <Typography color="error" variant="body2">
                {error}
              </Typography>
            )}
            <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} fullWidth />
            <FormControlLabel
              control={<Switch checked={active} onChange={(e) => setActive(e.target.checked)} />}
              label="Active"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" color="secondary" disabled={!name || save.isPending} onClick={() => save.mutate()}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
