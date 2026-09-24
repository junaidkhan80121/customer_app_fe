import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
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
import type { Admin } from '../api/types';

export default function AdminsPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Admin | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [active, setActive] = useState(true);
  const [error, setError] = useState('');

  const { data = [] } = useQuery({
    queryKey: ['admins'],
    queryFn: async () => (await api.get<Admin[]>('/api/admins')).data,
  });

  const save = useMutation({
    mutationFn: async () => {
      if (editing) {
        await api.patch(`/api/admins/${editing.id}`, {
          name,
          is_active: active,
          ...(password ? { password } : {}),
        });
      } else {
        await api.post('/api/admins', { name, email, password });
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admins'] });
      setOpen(false);
    },
    onError: (err: any) => setError(err?.response?.data?.detail || 'Save failed'),
  });

  return (
    <Stack spacing={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h4">Admins</Typography>
          <Typography color="text.secondary">Only these users can sign in</Typography>
        </Box>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => {
            setEditing(null);
            setName('');
            setEmail('');
            setPassword('');
            setActive(true);
            setError('');
            setOpen(true);
          }}
        >
          Add admin
        </Button>
      </Stack>

      <Card>
        <CardContent>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Status</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>{a.name}</TableCell>
                  <TableCell>{a.email}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={a.is_active ? 'Active' : 'Inactive'}
                      color={a.is_active ? 'success' : 'default'}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      size="small"
                      onClick={() => {
                        setEditing(a);
                        setName(a.name);
                        setEmail(a.email);
                        setPassword('');
                        setActive(a.is_active);
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
        <DialogTitle>{editing ? 'Edit admin' : 'Add admin'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {error && (
              <Typography color="error" variant="body2">
                {String(error)}
              </Typography>
            )}
            <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} fullWidth />
            {!editing && (
              <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth />
            )}
            <TextField
              label={editing ? 'New password (optional)' : 'Password'}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
            />
            {editing && (
              <FormControlLabel
                control={<Switch checked={active} onChange={(e) => setActive(e.target.checked)} />}
                label="Active"
              />
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="secondary"
            disabled={
              save.isPending ||
              !name ||
              (!editing && (!email || password.length < 6)) ||
              (Boolean(password) && password.length < 6)
            }
            onClick={() => save.mutate()}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
