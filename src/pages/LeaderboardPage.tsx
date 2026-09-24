import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Card,
  CardContent,
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
  Typography,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Dayjs } from 'dayjs';
import api from '../api/client';
import type { CustomerType, RankingRow, PageMeta, SortKey, TimeSlab } from '../api/types';
import { money, num } from '../utils/format';
import FilterChips, { FilterChipItem } from '../components/FilterChips';
import ResponsiveTable from '../components/ResponsiveTable';
import EmptyContent from '../components/EmptyContent';
import PageHeader from '../components/PageHeader';
import { IllustrationTrophy } from '../assets/illustrations';
import SortableTableHead, {
  SortOrder,
  SortableColumn,
  nextSortState,
} from '../components/table/SortableTableHead';

interface RankingResponse {
  items: RankingRow[];
  meta: PageMeta;
  slab_name?: string | null;
  from_date?: string | null;
  to_date?: string | null;
}

type LeaderboardCol = SortKey | 'rank';

const COLUMNS: SortableColumn<LeaderboardCol>[] = [
  { id: 'rank', label: '#', sortable: false },
  { id: 'customer_name', label: 'Customer' },
  { id: 'phone', label: 'Phone' },
  { id: 'type_name', label: 'Type' },
  { id: 'invoice_count', label: 'Invoices', align: 'right' },
  { id: 'qty', label: 'Qty', align: 'right' },
  { id: 'amount', label: 'Amount', align: 'right' },
  { id: 'points', label: 'Points', align: 'right' },
];

export default function LeaderboardPage() {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [slabId, setSlabId] = useState('');
  const [typeId, setTypeId] = useState('');
  const [sort, setSort] = useState<SortKey>('amount');
  const [order, setOrder] = useState<SortOrder>('desc');
  const [fromDate, setFromDate] = useState<Dayjs | null>(null);
  const [toDate, setToDate] = useState<Dayjs | null>(null);

  const { data: slabs = [] } = useQuery({
    queryKey: ['time-slabs'],
    queryFn: async () => (await api.get<TimeSlab[]>('/api/time-slabs')).data,
  });

  const { data: types = [] } = useQuery({
    queryKey: ['customer-types'],
    queryFn: async () => (await api.get<CustomerType[]>('/api/customer-types')).data,
  });

  const fromStr = fromDate ? fromDate.format('YYYY-MM-DD') : '';
  const toStr = toDate ? toDate.format('YYYY-MM-DD') : '';

  const { data, isLoading } = useQuery({
    queryKey: ['rankings', page, pageSize, slabId, typeId, sort, order, fromStr, toStr],
    queryFn: async () =>
      (
        await api.get<RankingResponse>('/api/rankings', {
          params: {
            page: page + 1,
            page_size: pageSize,
            slab_id: fromStr || toStr ? undefined : slabId || undefined,
            type_id: typeId || undefined,
            sort,
            order,
            from_date: fromStr || undefined,
            to_date: toStr || undefined,
          },
        })
      ).data,
  });

  const filterChips: FilterChipItem[] = useMemo(() => {
    const chips: FilterChipItem[] = [];
    if (slabId && !(fromStr || toStr)) {
      const slab = slabs.find((s) => s.id === slabId);
      chips.push({
        key: 'slab',
        label: `Slab: ${slab?.name || 'Custom'}`,
        onDelete: () => {
          setSlabId('');
          setPage(0);
        },
      });
    }
    if (typeId) {
      const t = types.find((x) => x.id === typeId);
      chips.push({
        key: 'type',
        label: `Type: ${t?.name || typeId}`,
        onDelete: () => {
          setTypeId('');
          setPage(0);
        },
      });
    }
    if (sort !== 'amount' || order !== 'desc') {
      chips.push({
        key: 'sort',
        label: `Sort: ${sort} (${order})`,
        onDelete: () => {
          setSort('amount');
          setOrder('desc');
          setPage(0);
        },
      });
    }
    if (fromStr) {
      chips.push({
        key: 'from',
        label: `From: ${fromStr}`,
        onDelete: () => {
          setFromDate(null);
          setPage(0);
        },
      });
    }
    if (toStr) {
      chips.push({
        key: 'to',
        label: `To: ${toStr}`,
        onDelete: () => {
          setToDate(null);
          setPage(0);
        },
      });
    }
    return chips;
  }, [slabId, typeId, sort, order, fromStr, toStr, slabs, types]);

  const clearFilters = () => {
    setSlabId('');
    setTypeId('');
    setSort('amount');
    setOrder('desc');
    setFromDate(null);
    setToDate(null);
    setPage(0);
  };

  return (
    <Stack spacing={3}>
      <PageHeader
        title="Leaderboard"
        description={
          `Who bought the most in the selected time slab` +
          (data?.slab_name ? ` · ${data.slab_name}` : '') +
          (data?.from_date && data?.to_date ? ` · ${data.from_date} → ${data.to_date}` : '')
        }
        illustration={<IllustrationTrophy />}
      />

      <Card>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{ mb: 2 }}
            flexWrap="wrap"
            useFlexGap
          >
            <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 160 }, flex: { sm: '0 1 160px' } }}>
              <InputLabel>Time slab</InputLabel>
              <Select
                label="Time slab"
                value={slabId}
                disabled={Boolean(fromStr || toStr)}
                onChange={(e) => {
                  setPage(0);
                  setSlabId(e.target.value);
                }}
              >
                <MenuItem value="">Default</MenuItem>
                {slabs.map((s) => (
                  <MenuItem key={s.id} value={s.id}>
                    {s.name}
                    {s.is_default ? ' (default)' : ''}
                    {s.start_date || s.end_date
                      ? ` · ${s.start_date || '…'} → ${s.end_date || 'today'}`
                      : ` · ${s.months} mo rolling`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 150 }, flex: { sm: '0 1 150px' } }}>
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
                {types.map((t) => (
                  <MenuItem key={t.id} value={t.id}>
                    {t.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <DatePicker
              label="From"
              value={fromDate}
              onChange={(v) => {
                setPage(0);
                setFromDate(v);
              }}
              slotProps={{
                textField: {
                  size: 'small',
                  fullWidth: true,
                  sx: { minWidth: { sm: 150 }, flex: { sm: '0 1 160px' } },
                },
              }}
            />
            <DatePicker
              label="To"
              value={toDate}
              minDate={fromDate || undefined}
              onChange={(v) => {
                setPage(0);
                setToDate(v);
              }}
              slotProps={{
                textField: {
                  size: 'small',
                  fullWidth: true,
                  sx: { minWidth: { sm: 150 }, flex: { sm: '0 1 160px' } },
                },
              }}
            />
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
                  if (col === 'rank') return;
                  const next = nextSortState(sort, order, col, 'desc');
                  setSort(next.orderBy);
                  setOrder(next.order);
                  setPage(0);
                }}
              />
              <TableBody>
                {(data?.items || []).map((row, idx) => (
                  <TableRow key={row.customer_id}>
                    <TableCell>{page * pageSize + idx + 1}</TableCell>
                    <TableCell>{row.customer_name}</TableCell>
                    <TableCell>{row.phone}</TableCell>
                    <TableCell>{row.type_name}</TableCell>
                    <TableCell align="right">{row.invoice_count}</TableCell>
                    <TableCell align="right">{num(row.total_qty)}</TableCell>
                    <TableCell align="right">{money(row.total_amount)}</TableCell>
                    <TableCell align="right">{num(row.total_points)}</TableCell>
                  </TableRow>
                ))}
                {!isLoading && !data?.items?.length && (
                  <TableRow>
                    <TableCell colSpan={8} sx={{ border: 0, py: 0 }}>
                      <EmptyContent
                        compact
                        variant="search"
                        title="No rankings for this filter"
                        description="Try another time slab, type, or date range."
                        illustration={<IllustrationTrophy sx={{ maxWidth: 160 }} />}
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
          />
        </CardContent>
      </Card>
    </Stack>
  );
}
