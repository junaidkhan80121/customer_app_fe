import { useMemo, useState } from 'react';
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
  TableRow,
  TextField,
  Typography,
  FormControlLabel,
} from '@mui/material';
import api from '../api/client';
import type { CustomerType } from '../api/types';
import EmptyContent, { EmptyActionButton } from '../components/EmptyContent';
import PageHeader from '../components/PageHeader';
import { IllustrationEmpty } from '../assets/illustrations';
import SortableTableHead, {
  SortOrder,
  SortableColumn,
  compareValues,
  nextSortState,
} from '../components/table/SortableTableHead';

type TypeSort = 'name' | 'active' | 'actions';

const COLUMNS: SortableColumn<TypeSort>[] = [
  { id: 'name', label: 'Name' },
  { id: 'active', label: 'Active' },
  { id: 'actions', label: '', sortable: false },
];

export default function CustomerTypesPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CustomerType | null>(null);
  const [name, setName] = useState('');
  const [active, setActive] = useState(true);
  const [error, setError] = useState('');
  const [sort, setSort] = useState<TypeSort>('name');
  const [order, setOrder] = useState<SortOrder>('asc');

  const { data = [] } = useQuery({
    queryKey: ['customer-types'],
    queryFn: async () => (await api.get<CustomerType[]>('/api/customer-types')).data,
  });

  const rows = useMemo(() => {
    const list = [...data];
    list.sort((a, b) => {
      const av = sort === 'active' ? a.is_active : a.name;
      const bv = sort === 'active' ? b.is_active : b.name;
      return compareValues(av, bv, order);
    });
    return list;
  }, [data, sort, order]);

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
      <PageHeader
        title="Customer types"
        description="Add plumber, mason, or any trade type"
        illustration={<IllustrationEmpty />}
        action={
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
              {rows.map((t) => (
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
              {!rows.length && (
                <TableRow>
                  <TableCell colSpan={3} sx={{ border: 0, py: 0 }}>
                    <EmptyContent
                      compact
                      title="No types yet"
                      description="Create trade types like plumber or mason."
                      action={
                        <EmptyActionButton
                          label="Add type"
                          onClick={() => {
                            setEditing(null);
                            setName('');
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
