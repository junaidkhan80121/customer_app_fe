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
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';
import api from '../api/client';
import type { PageMeta, Scheme, SchemeCustomer, SchemeMetric } from '../api/types';
import { schemeMetricLabel, schemeValue } from '../utils/format';
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

interface SchemePage {
  items: Scheme[];
  meta: PageMeta;
}

interface QualifierPage {
  items: SchemeCustomer[];
  meta: PageMeta;
}

type SchemeSort = 'name' | 'metric' | 'threshold' | 'qualified' | 'status' | 'actions';
type QualifierSort = 'name' | 'progress' | 'invoices';

const COLUMNS: SortableColumn<SchemeSort>[] = [
  { id: 'name', label: 'Scheme' },
  { id: 'metric', label: 'Measured by' },
  { id: 'threshold', label: 'Threshold', align: 'right' },
  { id: 'qualified', label: 'Qualified', align: 'right' },
  { id: 'status', label: 'Status' },
  { id: 'actions', label: '', sortable: false },
];

const QUALIFIER_COLUMNS: SortableColumn<QualifierSort>[] = [
  { id: 'name', label: 'Customer' },
  { id: 'progress', label: 'Progress', align: 'right' },
  { id: 'invoices', label: 'Invoices', align: 'right' },
];

const emptyForm = {
  name: '',
  description: '',
  metric: 'amount' as SchemeMetric,
  threshold: '',
  start: null as Dayjs | null,
  end: null as Dayjs | null,
  is_active: true,
};

function periodLabel(scheme: { start_date?: string | null; end_date?: string | null }) {
  if (!scheme.start_date && !scheme.end_date) return 'All purchases';
  return `${scheme.start_date || '…'} to ${scheme.end_date || '…'}`;
}

export default function SchemesPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [metric, setMetric] = useState('');
  const [sort, setSort] = useState<SchemeSort>('name');
  const [order, setOrder] = useState<SortOrder>('asc');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Scheme | null>(null);
  const [viewing, setViewing] = useState<Scheme | null>(null);
  const [deleting, setDeleting] = useState<Scheme | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [qPage, setQPage] = useState(0);
  const [qSearch, setQSearch] = useState('');
  const [qualifiedOnly, setQualifiedOnly] = useState(true);
  const [qSort, setQSort] = useState<QualifierSort>('progress');
  const [qOrder, setQOrder] = useState<SortOrder>('desc');

  const query = useMemo(
    () => ({
      page: page + 1,
      page_size: pageSize,
      search: search || undefined,
      metric: metric || undefined,
      sort: sort === 'actions' ? 'name' : sort,
      order,
    }),
    [page, pageSize, search, metric, sort, order],
  );

  const { data, isLoading } = useQuery({
    queryKey: ['schemes', query],
    queryFn: async () => (await api.get<SchemePage>('/api/schemes', { params: query })).data,
  });

  const qualifierQuery = useMemo(
    () => ({
      page: qPage + 1,
      page_size: 10,
      search: qSearch || undefined,
      qualified_only: qualifiedOnly,
      sort: qSort,
      order: qOrder,
    }),
    [qPage, qSearch, qualifiedOnly, qSort, qOrder],
  );

  const { data: qualifiers, isLoading: qualifiersLoading } = useQuery({
    queryKey: ['scheme-customers', viewing?.id, qualifierQuery],
    enabled: Boolean(viewing),
    queryFn: async () =>
      (await api.get<QualifierPage>(`/api/schemes/${viewing!.id}/customers`, { params: qualifierQuery })).data,
  });

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        metric: form.metric,
        threshold: Number(form.threshold),
        start_date: form.start ? form.start.format('YYYY-MM-DD') : null,
        end_date: form.end ? form.end.format('YYYY-MM-DD') : null,
        is_active: form.is_active,
      };
      if (editing) {
        await api.patch(`/api/schemes/${editing.id}`, payload);
      } else {
        await api.post('/api/schemes', payload);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['schemes'] });
      qc.invalidateQueries({ queryKey: ['customer-schemes'] });
      setOpen(false);
    },
    onError: (err: any) => setError(err?.response?.data?.detail || err?.message || 'Save failed'),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => api.delete(`/api/schemes/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['schemes'] });
      setDeleting(null);
      setDeleteError('');
    },
    onError: (err: any) => setDeleteError(err?.response?.data?.detail || err?.message || 'Delete failed'),
  });

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setError('');
    setOpen(true);
  };

  const openEdit = (scheme: Scheme) => {
    setEditing(scheme);
    setForm({
      name: scheme.name,
      description: scheme.description || '',
      metric: scheme.metric,
      threshold: String(scheme.threshold),
      start: scheme.start_date ? dayjs(scheme.start_date) : null,
      end: scheme.end_date ? dayjs(scheme.end_date) : null,
      is_active: scheme.is_active,
    });
    setError('');
    setOpen(true);
  };

  const openView = (scheme: Scheme) => {
    setViewing(scheme);
    setQPage(0);
    setQSearch('');
    setQualifiedOnly(true);
    setQSort('progress');
    setQOrder('desc');
  };

  const chips: FilterChipItem[] = [];
  if (search) {
    chips.push({
      key: 'search',
      label: `Search: ${search}`,
      onDelete: () => {
        setSearch('');
        setPage(0);
      },
    });
  }
  if (metric) {
    chips.push({
      key: 'metric',
      label: `Measure: ${schemeMetricLabel(metric)}`,
      onDelete: () => {
        setMetric('');
        setPage(0);
      },
    });
  }

  const filtered = Boolean(search || metric);

  return (
    <Stack spacing={3}>
      <PageHeader
        title="Schemes"
        description="A customer qualifies when their purchases cross the threshold you set."
        illustration={<IllustrationEmpty />}
        action={
          <Button variant="contained" color="secondary" onClick={openCreate}>
            Add scheme
          </Button>
        }
      />

      <Card>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 2 }}>
            <TextField
              size="small"
              label="Search name / description"
              value={search}
              onChange={(e) => {
                setPage(0);
                setSearch(e.target.value);
              }}
              fullWidth
              sx={{ maxWidth: { md: 320 } }}
            />
            <FormControl size="small" fullWidth sx={{ maxWidth: { md: 220 } }}>
              <InputLabel>Measured by</InputLabel>
              <Select
                label="Measured by"
                value={metric}
                onChange={(e) => {
                  setPage(0);
                  setMetric(e.target.value);
                }}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="amount">Purchase amount</MenuItem>
                <MenuItem value="quantity">Quantity</MenuItem>
                <MenuItem value="points">Points</MenuItem>
              </Select>
            </FormControl>
          </Stack>

          <FilterChips
            chips={chips}
            onClearAll={() => {
              setSearch('');
              setMetric('');
              setPage(0);
            }}
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
                {(data?.items || []).map((scheme) => (
                  <TableRow key={scheme.id} hover sx={{ cursor: 'pointer' }} onClick={() => openView(scheme)}>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {scheme.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {scheme.description || periodLabel(scheme)}
                      </Typography>
                    </TableCell>
                    <TableCell>{schemeMetricLabel(scheme.metric)}</TableCell>
                    <TableCell align="right">{schemeValue(scheme.metric, scheme.threshold)}</TableCell>
                    <TableCell align="right">{scheme.qualified_count}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={scheme.is_active ? 'Active' : 'Inactive'}
                        color={scheme.is_active ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <Button size="small" onClick={() => openView(scheme)}>
                          Customers
                        </Button>
                        <Button size="small" onClick={() => openEdit(scheme)}>
                          Edit
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          onClick={() => {
                            setDeleteError('');
                            setDeleting(scheme);
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
                        title={filtered ? 'No matching schemes' : 'No schemes yet'}
                        description="Set a purchase amount, quantity, or points threshold."
                        action={!filtered ? <EmptyActionButton label="Add scheme" onClick={openCreate} /> : undefined}
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
            onPageChange={(_, next) => setPage(next)}
            rowsPerPage={pageSize}
            onRowsPerPageChange={(e) => {
              setPageSize(parseInt(e.target.value, 10));
              setPage(0);
            }}
          />
        </CardContent>
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editing ? 'Edit scheme' : 'Add scheme'}</DialogTitle>
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
              label="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              fullWidth
              multiline
              minRows={2}
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <FormControl fullWidth>
                <InputLabel>Measured by</InputLabel>
                <Select
                  label="Measured by"
                  value={form.metric}
                  onChange={(e) => setForm({ ...form, metric: e.target.value as SchemeMetric })}
                >
                  <MenuItem value="amount">Purchase amount</MenuItem>
                  <MenuItem value="quantity">Quantity</MenuItem>
                  <MenuItem value="points">Points</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Threshold"
                type="number"
                value={form.threshold}
                onChange={(e) => setForm({ ...form, threshold: e.target.value })}
                required
                fullWidth
                inputProps={{ min: 0, step: '0.01' }}
                helperText="Customer qualifies at or above this value"
              />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <DatePicker
                label="Start date"
                value={form.start}
                onChange={(start) => setForm({ ...form, start })}
                slotProps={{ textField: { fullWidth: true, helperText: 'Optional. Blank counts all purchases.' } }}
              />
              <DatePicker
                label="End date"
                value={form.end}
                onChange={(end) => setForm({ ...form, end })}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Stack>
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
            disabled={save.isPending || !form.name.trim() || form.threshold === '' || Number(form.threshold) <= 0}
            onClick={() => {
              setError('');
              save.mutate();
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(viewing)} onClose={() => setViewing(null)} fullWidth maxWidth="md">
        <DialogTitle>
          {viewing?.name}
          <Typography variant="body2" color="text.secondary">
            Qualifies at {viewing ? schemeValue(viewing.metric, viewing.threshold) : ''} · {viewing ? periodLabel(viewing) : ''}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                size="small"
                label="Search customer"
                value={qSearch}
                onChange={(e) => {
                  setQPage(0);
                  setQSearch(e.target.value);
                }}
                fullWidth
              />
              <FormControl size="small" fullWidth sx={{ maxWidth: { sm: 220 } }}>
                <InputLabel>Show</InputLabel>
                <Select
                  label="Show"
                  value={qualifiedOnly ? '1' : '0'}
                  onChange={(e) => {
                    setQPage(0);
                    setQualifiedOnly(e.target.value === '1');
                  }}
                >
                  <MenuItem value="1">Qualified only</MenuItem>
                  <MenuItem value="0">All customers</MenuItem>
                </Select>
              </FormControl>
            </Stack>
            <ResponsiveTable>
              <Table size="small">
                <SortableTableHead
                  columns={QUALIFIER_COLUMNS}
                  orderBy={qSort}
                  order={qOrder}
                  onRequestSort={(col) => {
                    const next = nextSortState(qSort, qOrder, col, 'desc');
                    setQSort(next.orderBy);
                    setQOrder(next.order);
                    setQPage(0);
                  }}
                />
                <TableBody>
                  {(qualifiers?.items || []).map((row) => (
                    <TableRow key={row.customer_id}>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {row.customer_name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {row.phone}
                          {row.type_name ? ` · ${row.type_name}` : ''}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Stack alignItems="flex-end" spacing={0.5}>
                          <span>{viewing ? schemeValue(viewing.metric, row.progress) : ''}</span>
                          <Chip
                            size="small"
                            label={row.qualified ? 'Qualified' : 'Not yet'}
                            color={row.qualified ? 'success' : 'default'}
                          />
                        </Stack>
                      </TableCell>
                      <TableCell align="right">{row.invoice_count}</TableCell>
                    </TableRow>
                  ))}
                  {!qualifiersLoading && !qualifiers?.items?.length && (
                    <TableRow>
                      <TableCell colSpan={3} sx={{ border: 0 }}>
                        <EmptyContent
                          compact
                          title={qualifiedOnly ? 'Nobody has crossed this threshold yet' : 'No customers'}
                          description="Purchases in the scheme dates count toward the threshold."
                        />
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </ResponsiveTable>
            <TablePagination
              component="div"
              count={qualifiers?.meta.total || 0}
              page={qPage}
              onPageChange={(_, next) => setQPage(next)}
              rowsPerPage={10}
              rowsPerPageOptions={[10]}
            />
          </Stack>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(deleting)} onClose={() => setDeleting(null)} fullWidth maxWidth="xs">
        <DialogTitle>Delete scheme?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            This removes <strong>{deleting?.name}</strong>. Customer purchases stay as they are.
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
