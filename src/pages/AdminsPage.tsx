import { useMemo, useState } from 'react';
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
  TableRow,
  TextField,
  Typography,
  FormControlLabel,
} from '@mui/material';
import api from '../api/client';
import type { Admin } from '../api/types';
import EmptyContent, { EmptyActionButton } from '../components/EmptyContent';
import PageHeader from '../components/PageHeader';
import { IllustrationUsers } from '../assets/illustrations';
import SortableTableHead, {
  SortOrder,
  SortableColumn,
  compareValues,
  nextSortState,
} from '../components/table/SortableTableHead';

type AdminSort = 'name' | 'email' | 'status' | 'actions';

const COLUMNS: SortableColumn<AdminSort>[] = [
  { id: 'name', label: 'Name' },
  { id: 'email', label: 'Email' },
  { id: 'status', label: 'Status' },
  { id: 'actions', label: '', sortable: false },
];

export default function AdminsPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Admin | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [active, setActive] = useState(true);
  const [error, setError] = useState('');
  const [sort, setSort] = useState<AdminSort>('name');
  const [order, setOrder] = useState<SortOrder>('asc');

  const { data = [] } = useQuery({
    queryKey: ['admins'],
    queryFn: async () => (await api.get<Admin[]>('/api/admins')).data,
  });

  const rows = useMemo(() => {
    const list = [...data];
    list.sort((a, b) => {
      const av = sort === 'status' ? a.is_active : sort === 'email' ? a.email : a.name;
      const bv = sort === 'status' ? b.is_active : sort === 'email' ? b.email : b.name;
      return compareValues(av, bv, order);
    });
    return list;
  }, [data, sort, order]);

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
      <PageHeader
        title="Admins"
        description="Only these users can sign in"
        illustration={<IllustrationUsers />}
        action={
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
        }
      />

      <Card>
        <CardContent>
          <Table size="small">
            <SortableTableHead
              columns={COLUMNS}
              orderBy={sort}
              order={order}
              onRequestSort={(col) => {
                if (col === 'actions') return;
                const next = nextSortState(sort, order, col, 'asc');
                setSort(next.orderBy);
                setOrder(next.order);
              }}
            />
            <TableBody>
              {rows.map((a) => (
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
              {!rows.length && (
                <TableRow>
                  <TableCell colSpan={4} sx={{ border: 0, py: 0 }}>
                    <EmptyContent
                      compact
                      title="No admins yet"
                      description="Add an admin account to manage the shop."
                      action={
                        <EmptyActionButton
                          label="Add admin"
                          onClick={() => {
                            setEditing(null);
                            setName('');
                            setEmail('');
                            setPassword('');
                            setActive(true);
                            setError('');
                            setOpen(true);
                          }}
                        />
                      }
                    />
                  </TableCell>
                </TableRow>
              )}
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
