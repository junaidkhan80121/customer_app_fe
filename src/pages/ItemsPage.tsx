import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import api from '../api/client';
import type { CatalogItem, PageMeta } from '../api/types';
import { money } from '../utils/format';
import FilterChips, { FilterChipItem } from '../components/FilterChips';
import ResponsiveTable from '../components/ResponsiveTable';
import EmptyContent, { EmptyActionButton } from '../components/EmptyContent';
import PageHeader from '../components/PageHeader';
import { IllustrationEmpty } from '../assets/illustrations';
import SortableTableHead, {
  SortOrder,
  SortableColumn,
  nextSortState,
} from '../components/table/SortableTableHead';

interface ItemPage {
  items: CatalogItem[];
  meta: PageMeta;
}

type ItemSort = 'name' | 'sku' | 'price' | 'points' | 'status' | 'actions';

const COLUMNS: SortableColumn<ItemSort>[] = [
  { id: 'name', label: 'Name' },
  { id: 'sku', label: 'SKU' },
  { id: 'price', label: 'Price', align: 'right' },
  { id: 'points', label: 'Points' },
  { id: 'status', label: 'Status' },
  { id: 'actions', label: '', sortable: false },
];

const emptyForm = {
  name: '',
  description: '',
  sku: '',
  price: '',
  points_enabled: true,
  is_active: true,
};

export default function ItemsPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [pointsFilter, setPointsFilter] = useState('');
  const [sort, setSort] = useState<ItemSort>('name');
  const [order, setOrder] = useState<SortOrder>('asc');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CatalogItem | null>(null);
  const [deleting, setDeleting] = useState<CatalogItem | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [deleteError, setDeleteError] = useState('');

  const query = useMemo(
    () => ({
      page: page + 1,
      page_size: pageSize,
      search: search || undefined,
      points_enabled: pointsFilter === '' ? undefined : pointsFilter === '1',
      sort: sort === 'actions' ? 'name' : sort,
      order,
    }),
    [page, pageSize, search, pointsFilter, sort, order],
  );

  const { data, isLoading } = useQuery({
    queryKey: ['items', query],
    queryFn: async () => (await api.get<ItemPage>('/api/items', { params: query })).data,
  });

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        sku: form.sku.trim(),
        price: Number(form.price),
        points_enabled: form.points_enabled,
        is_active: form.is_active,
      };
      if (editing) {
        await api.patch(`/api/items/${editing.id}`, payload);
      } else {
        await api.post('/api/items', payload);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['items'] });
      setOpen(false);
    },
    onError: (err: any) => setError(err?.response?.data?.detail || err?.message || 'Save failed'),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => api.delete(`/api/items/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['items'] });
      setDeleting(null);
      setDeleteError('');
    },
    onError: (err: any) =>
      setDeleteError(err?.response?.data?.detail || err?.message || 'Delete failed'),
  });

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setError('');
    setOpen(true);
  };

  const openEdit = (item: CatalogItem) => {
    setEditing(item);
    setForm({
      name: item.name,
      description: item.description || '',
      sku: item.sku,
      price: String(item.price),
      points_enabled: item.points_enabled,
      is_active: item.is_active,
    });
    setError('');
    setOpen(true);
  };

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
  if (pointsFilter) {
    filterChips.push({
      key: 'points',
      label: pointsFilter === '1' ? 'Points: On' : 'Points: Off',
      onDelete: () => {
        setPointsFilter('');
        setPage(0);
      },
    });
  }

  const clearFilters = () => {
    setSearch('');
    setPointsFilter('');
    setPage(0);
  };

  const filtered = Boolean(search || pointsFilter);

  return (
    <Stack spacing={3}>
      <PageHeader
        title="Items"
        description="Catalog of products. Points are earned only on items with points enabled."
        illustration={<IllustrationEmpty />}
        action={
          <Button
            variant="contained"
            color="secondary"
            onClick={openCreate}
            sx={{ alignSelf: { xs: 'stretch', sm: 'center' } }}
          >
            Add item
          </Button>
        }
      />

      <Card>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 2 }}>
            <TextField
              size="small"
              label="Search name / SKU / description"
              value={search}
              onChange={(e) => {
                setPage(0);
                setSearch(e.target.value);
              }}
              fullWidth
              sx={{ maxWidth: { md: 360 } }}
            />
            <FormControl size="small" fullWidth sx={{ maxWidth: { md: 200 } }}>
              <InputLabel>Points</InputLabel>
              <Select
                label="Points"
                value={pointsFilter}
                onChange={(e) => {
                  setPage(0);
                  setPointsFilter(e.target.value);
                }}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="1">Points on</MenuItem>
                <MenuItem value="0">Points off</MenuItem>
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
                {(data?.items || []).map((item) => (
                  <TableRow key={item.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {item.name}
                      </Typography>
                      {item.description ? (
                        <Typography variant="caption" color="text.secondary">
                          {item.description}
                        </Typography>
                      ) : null}
                    </TableCell>
                    <TableCell>{item.sku}</TableCell>
                    <TableCell align="right">{money(item.price)}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={item.points_enabled ? 'On' : 'Off'}
                        color={item.points_enabled ? 'secondary' : 'default'}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={item.is_active ? 'Active' : 'Inactive'}
                        color={item.is_active ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <Button size="small" onClick={() => openEdit(item)}>
                          Edit
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          onClick={() => {
                            setDeleteError('');
                            setDeleting(item);
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
                        variant={filtered ? 'search' : 'empty'}
                        title={filtered ? 'No matching items' : 'No items yet'}
                        description={
                          filtered
                            ? 'Try a different search or clear the points filter.'
                            : 'Add a product with a SKU. Turn points on for the ones that should earn points.'
                        }
                        action={
                          !filtered ? <EmptyActionButton label="Add item" onClick={openCreate} /> : undefined
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
        <DialogTitle>{editing ? 'Edit item' : 'Add item'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {error && (
              <Typography color="error" variant="body2">
                {String(error)}
              </Typography>
            )}
            <TextField
              label="Item name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              fullWidth
            />
            <TextField
              label="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              fullWidth
              multiline
              minRows={2}
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="SKU / code"
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                required
                fullWidth
                helperText="Stored in uppercase. Points follow this code."
              />
              <TextField
                label="Price"
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                required
                fullWidth
                inputProps={{ min: 0, step: '0.01' }}
              />
            </Stack>
            <FormControlLabel
              control={
                <Switch
                  checked={form.points_enabled}
                  onChange={(e) => setForm({ ...form, points_enabled: e.target.checked })}
                />
              }
              label="Points enabled"
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
            disabled={save.isPending || !form.name.trim() || !form.sku.trim() || form.price === ''}
            onClick={() => {
              setError('');
              save.mutate();
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(deleting)} onClose={() => setDeleting(null)} fullWidth maxWidth="xs">
        <DialogTitle>Delete item?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            This removes <strong>{deleting?.name}</strong>
            {deleting?.sku ? ` (${deleting.sku})` : ''} from the catalog. Past invoices keep their line
            names and points.
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
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
