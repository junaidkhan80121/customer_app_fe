import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  createFilterOptions,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import api from '../api/client';
import type { Customer, CustomerType, PageMeta } from '../api/types';
import { num } from '../utils/format';
import FilterChips, { FilterChipItem } from '../components/FilterChips';
import ResponsiveTable from '../components/ResponsiveTable';
import EmptyContent, { EmptyActionButton } from '../components/EmptyContent';
import PageHeader from '../components/PageHeader';
import { IllustrationUsers } from '../assets/illustrations';
import SortableTableHead, {
  SortOrder,
  SortableColumn,
  nextSortState,
} from '../components/table/SortableTableHead';

interface CustomerPage {
  items: Customer[];
  meta: PageMeta;
}

type CustomerSort = 'name' | 'phone' | 'type' | 'points' | 'status' | 'actions';

const COLUMNS: SortableColumn<CustomerSort>[] = [
  { id: 'name', label: 'Name' },
  { id: 'phone', label: 'Phone' },
  { id: 'type', label: 'Type' },
  { id: 'points', label: 'Lifetime points', align: 'right' },
  { id: 'status', label: 'Status' },
  { id: 'actions', label: '', sortable: false },
];

type TypeOption = CustomerType | { inputValue: string; name: string; id?: string };

const filter = createFilterOptions<TypeOption>();

const emptyForm = {
  name: '',
  phone: '',
  address: '',
  type_id: '',
  type_input: '' as string,
  is_active: true,
};

export default function CustomersPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [typeId, setTypeId] = useState('');
  const [sort, setSort] = useState<CustomerSort>('name');
  const [order, setOrder] = useState<SortOrder>('asc');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [deleting, setDeleting] = useState<Customer | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [selectedType, setSelectedType] = useState<TypeOption | null>(null);
  const [error, setError] = useState('');
  const [deleteError, setDeleteError] = useState('');

  const { data: types } = useQuery({
    queryKey: ['customer-types'],
    queryFn: async () => (await api.get<CustomerType[]>('/api/customer-types')).data,
  });

  const query = useMemo(
    () => ({
      page: page + 1,
      page_size: pageSize,
      search: search || undefined,
      type_id: typeId || undefined,
      sort: sort === 'actions' ? 'name' : sort,
      order,
    }),
    [page, pageSize, search, typeId, sort, order],
  );

  const { data, isLoading } = useQuery({
    queryKey: ['customers', query],
    queryFn: async () => (await api.get<CustomerPage>('/api/customers', { params: query })).data,
  });

  const save = useMutation({
    mutationFn: async () => {
      let resolvedTypeId = form.type_id;

      if (selectedType && 'inputValue' in selectedType && selectedType.inputValue) {
        const created = await api.post<CustomerType>('/api/customer-types', {
          name: selectedType.inputValue.trim(),
          is_active: true,
        });
        resolvedTypeId = created.data.id;
        await qc.invalidateQueries({ queryKey: ['customer-types'] });
      } else if (selectedType && 'id' in selectedType && selectedType.id) {
        resolvedTypeId = selectedType.id;
      } else if (form.type_input.trim() && !resolvedTypeId) {
        const created = await api.post<CustomerType>('/api/customer-types', {
          name: form.type_input.trim(),
          is_active: true,
        });
        resolvedTypeId = created.data.id;
        await qc.invalidateQueries({ queryKey: ['customer-types'] });
      }

      if (!resolvedTypeId) throw new Error('Select or enter a customer type');

      const payload = {
        name: form.name,
        phone: form.phone,
        address: form.address || null,
        type_id: resolvedTypeId,
        is_active: form.is_active,
      };
      if (editing) {
        await api.patch(`/api/customers/${editing.id}`, payload);
      } else {
        await api.post('/api/customers', payload);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['customers'] });
      setOpen(false);
    },
    onError: (err: any) =>
      setError(err?.message || err?.response?.data?.detail || 'Save failed'),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => api.delete(`/api/customers/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['customers'] });
      setDeleting(null);
      setDeleteError('');
    },
    onError: (err: any) =>
      setDeleteError(err?.response?.data?.detail || err?.message || 'Delete failed'),
  });

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setSelectedType(null);
    setError('');
    setOpen(true);
  };

  const openEdit = (c: Customer) => {
    setEditing(c);
    const t = types?.find((x) => x.id === c.type_id) || null;
    setForm({
      name: c.name,
      phone: c.phone,
      address: c.address || '',
      type_id: c.type_id,
      type_input: c.type_name || '',
      is_active: c.is_active,
    });
    setSelectedType(t);
    setError('');
    setOpen(true);
  };

  const typeName = types?.find((t) => t.id === typeId)?.name;
  const filterChips: FilterChipItem[] = [];
  if (search) {
    filterChips.push({
      key: 'search',
      label: `Search: ${search}`,
      onDelete: () => {
        setSearch('');
        setPage(0);
      },
    });
  }
  if (typeId) {
    filterChips.push({
      key: 'type',
      label: `Type: ${typeName || typeId}`,
      onDelete: () => {
        setTypeId('');
        setPage(0);
      },
    });
  }

  const clearFilters = () => {
    setSearch('');
    setTypeId('');
    setPage(0);
  };

  return (
    <Stack spacing={3}>
      <PageHeader
        title="Customers"
        description="Plumbers, masons, and other trade buyers"
        illustration={<IllustrationUsers />}
        action={
          <Button
            variant="contained"
            color="secondary"
            onClick={openCreate}
            sx={{ alignSelf: { xs: 'stretch', sm: 'center' } }}
          >
            Add customer
          </Button>
        }
      />

      <Card>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 2 }}>
            <TextField
              size="small"
              label="Search name / phone"
              value={search}
              onChange={(e) => {
                setPage(0);
                setSearch(e.target.value);
              }}
              fullWidth
              sx={{ maxWidth: { md: 280 } }}
            />
            <FormControl size="small" fullWidth sx={{ maxWidth: { md: 200 } }}>
              <InputLabel>Type</InputLabel>
              <Select
                label="Type"
                value={typeId}
                onChange={(e) => {
                  setPage(0);
                  setTypeId(e.target.value);
                }}
              >
                <MenuItem value="">All</MenuItem>
                {(types || []).map((t) => (
                  <MenuItem key={t.id} value={t.id}>
                    {t.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>

          <FilterChips
            chips={filterChips}
            onClearAll={clearFilters}
            resultsLabel={
              data ? `${data.meta.total} result${data.meta.total === 1 ? '' : 's'} found` : undefined
            }
          />

          <ResponsiveTable>
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
                  setPage(0);
                }}
              />
              <TableBody>
                {(data?.items || []).map((c) => (
                  <TableRow key={c.id} hover>
                    <TableCell>{c.name}</TableCell>
                    <TableCell>{c.phone}</TableCell>
                    <TableCell>{c.type_name}</TableCell>
                    <TableCell align="right">{num(c.lifetime_points)}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={c.is_active ? 'Active' : 'Inactive'}
                        color={c.is_active ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <Button size="small" onClick={() => openEdit(c)}>
                          Edit
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          onClick={() => {
                            setDeleteError('');
                            setDeleting(c);
                          }}
                        >
                          Delete
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
                {!isLoading && !data?.items?.length && (
                  <TableRow>
                    <TableCell colSpan={6} sx={{ border: 0, py: 0 }}>
                      <EmptyContent
                        compact
                        variant={search || typeId ? 'search' : 'empty'}
                        title={search || typeId ? 'No matching customers' : 'No customers yet'}
                        description={
                          search || typeId
                            ? 'Try a different search or clear the type filter.'
                            : 'Add your first trade buyer to get started.'
                        }
                        action={
                          !search && !typeId ? (
                            <EmptyActionButton label="Add customer" onClick={openCreate} />
                          ) : undefined
                        }
                      />
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ResponsiveTable>
          <TablePagination
            component="div"
            count={data?.meta.total || 0}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            rowsPerPage={pageSize}
            onRowsPerPageChange={(e) => {
              setPageSize(parseInt(e.target.value, 10));
              setPage(0);
            }}
            sx={{
              '.MuiTablePagination-toolbar': { flexWrap: 'wrap', justifyContent: 'flex-end' },
            }}
          />
        </CardContent>
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editing ? 'Edit customer' : 'Add customer'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {error && (
              <Typography color="error" variant="body2">
                {String(error)}
              </Typography>
            )}
            <TextField
              label="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              fullWidth
            />
            <TextField
              label="Phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              required
              fullWidth
            />
            <TextField
              label="Address"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              fullWidth
              multiline
              minRows={2}
            />
            <Autocomplete
              freeSolo
              selectOnFocus
              clearOnBlur
              handleHomeEndKeys
              options={(types || []) as TypeOption[]}
              value={selectedType}
              getOptionLabel={(option) => {
                if (typeof option === 'string') return option;
                if ('inputValue' in option && option.inputValue) return option.inputValue;
                return option.name;
              }}
              filterOptions={(options, params) => {
                const filtered = filter(options, params);
                const { inputValue } = params;
                const exists = options.some(
                  (o) => 'name' in o && o.name.toLowerCase() === inputValue.toLowerCase(),
                );
                if (inputValue !== '' && !exists) {
                  filtered.push({
                    inputValue,
                    name: `Add "${inputValue}"`,
                  });
                }
                return filtered;
              }}
              onChange={(_, newValue) => {
                if (typeof newValue === 'string') {
                  setSelectedType({ inputValue: newValue, name: newValue });
                  setForm({ ...form, type_id: '', type_input: newValue });
                } else if (newValue && 'inputValue' in newValue) {
                  setSelectedType(newValue);
                  setForm({ ...form, type_id: '', type_input: newValue.inputValue });
                } else {
                  setSelectedType(newValue);
                  setForm({
                    ...form,
                    type_id: (newValue as CustomerType)?.id || '',
                    type_input: (newValue as CustomerType)?.name || '',
                  });
                }
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Customer type"
                  placeholder="Select or type a new type"
                  helperText="Pick an existing type or type a new one (e.g. Electrician)"
                  required
                />
              )}
            />
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                label="Status"
                value={form.is_active ? '1' : '0'}
                onChange={(e) => setForm({ ...form, is_active: e.target.value === '1' })}
              >
                <MenuItem value="1">Active</MenuItem>
                <MenuItem value="0">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="secondary"
            disabled={
              save.isPending ||
              !form.name ||
              !form.phone ||
              (!form.type_id && !form.type_input && !selectedType)
            }
            onClick={() => save.mutate()}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(deleting)} onClose={() => setDeleting(null)} fullWidth maxWidth="xs">
        <DialogTitle>Delete customer?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            This will permanently remove <strong>{deleting?.name}</strong>
            {deleting?.phone ? ` (${deleting.phone})` : ''} and <strong>all of their invoices /
            purchases</strong>. This cannot be undone.
          </Typography>
          {deleteError && (
            <Typography color="error" variant="body2" sx={{ mt: 1.5 }}>
              {String(deleteError)}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleting(null)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            disabled={remove.isPending || !deleting}
            onClick={() => deleting && remove.mutate(deleting.id)}
          >
            Delete everything
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
