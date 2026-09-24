import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Button,
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
  TextField,
  Typography,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Dayjs } from 'dayjs';
import api from '../api/client';
import type { Invoice, PageMeta } from '../api/types';
import { money, num } from '../utils/format';
import FilterChips, { FilterChipItem } from '../components/FilterChips';
import ResponsiveTable from '../components/ResponsiveTable';
import EmptyContent, { EmptyActionButton } from '../components/EmptyContent';
import PageHeader from '../components/PageHeader';
import { IllustrationInvoice } from '../assets/illustrations';
import SortableTableHead, {
  SortOrder,
  SortableColumn,
  nextSortState,
} from '../components/table/SortableTableHead';

interface InvoicePage {
  items: Invoice[];
  meta: PageMeta;
}

type SortKey = 'date' | 'amount' | 'qty' | 'points' | 'invoice_no' | 'customer' | 'payment';
type PaymentFilter = '' | 'cash' | 'upi' | 'credit' | 'card';

const COLUMNS: SortableColumn<SortKey>[] = [
  { id: 'invoice_no', label: 'Invoice' },
  { id: 'customer', label: 'Customer' },
  { id: 'date', label: 'Date' },
  { id: 'payment', label: 'Payment' },
  { id: 'qty', label: 'Qty', align: 'right' },
  { id: 'amount', label: 'Amount', align: 'right' },
  { id: 'points', label: 'Points', align: 'right' },
];

const SORT_LABELS: Record<SortKey, string> = {
  date: 'Date',
  amount: 'Amount',
  qty: 'Quantity',
  points: 'Points',
  invoice_no: 'Invoice',
  customer: 'Customer',
  payment: 'Payment',
};

export default function PurchasesPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortKey>('date');
  const [order, setOrder] = useState<SortOrder>('desc');
  const [payment, setPayment] = useState<PaymentFilter>('');
  const [fromDate, setFromDate] = useState<Dayjs | null>(null);
  const [toDate, setToDate] = useState<Dayjs | null>(null);

  const fromStr = fromDate?.format('YYYY-MM-DD') || undefined;
  const toStr = toDate?.format('YYYY-MM-DD') || undefined;

  const { data, isLoading } = useQuery({
    queryKey: ['invoices', page, pageSize, search, sort, order, payment, fromStr, toStr],
    queryFn: async () =>
      (
        await api.get<InvoicePage>('/api/invoices', {
          params: {
            page: page + 1,
            page_size: pageSize,
            search: search || undefined,
            sort,
            order,
            payment_mode: payment || undefined,
            from_date: fromStr,
            to_date: toStr,
          },
        })
      ).data,
  });

  const handleSort = (column: SortKey) => {
    const next = nextSortState(sort, order, column, 'desc');
    setSort(next.orderBy);
    setOrder(next.order);
    setPage(0);
  };

  const chips: FilterChipItem[] = useMemo(() => {
    const list: FilterChipItem[] = [];
    if (search) {
      list.push({
        key: 'search',
        label: `Search: ${search}`,
        onDelete: () => {
          setSearch('');
          setPage(0);
        },
      });
    }
    if (payment) {
      list.push({
        key: 'payment',
        label: `Payment: ${payment.toUpperCase()}`,
        onDelete: () => {
          setPayment('');
          setPage(0);
        },
      });
    }
    if (sort !== 'date' || order !== 'desc') {
      list.push({
        key: 'sort',
        label: `Sort: ${SORT_LABELS[sort]} (${order})`,
        onDelete: () => {
          setSort('date');
          setOrder('desc');
          setPage(0);
        },
      });
    }
    if (fromStr) {
      list.push({
        key: 'from',
        label: `From: ${fromStr}`,
        onDelete: () => {
          setFromDate(null);
          setPage(0);
        },
      });
    }
    if (toStr) {
      list.push({
        key: 'to',
        label: `To: ${toStr}`,
        onDelete: () => {
          setToDate(null);
          setPage(0);
        },
      });
    }
    return list;
  }, [search, payment, sort, order, fromStr, toStr]);

  const clearFilters = () => {
    setSearch('');
    setPayment('');
    setSort('date');
    setOrder('desc');
    setFromDate(null);
    setToDate(null);
    setPage(0);
  };

  return (
    <Stack spacing={3}>
      <PageHeader
        title="Purchases"
        description="Invoices with qty, price, and points"
        illustration={<IllustrationInvoice />}
        action={
          <Button
            variant="contained"
            color="secondary"
            onClick={() => navigate('/purchases/new')}
            sx={{ alignSelf: { xs: 'stretch', sm: 'center' } }}
          >
            New invoice
          </Button>
        }
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
            <TextField
              size="small"
              label="Search invoice / customer"
              value={search}
              onChange={(e) => {
                setPage(0);
                setSearch(e.target.value);
              }}
              fullWidth
              sx={{ minWidth: { sm: 200 }, flex: { sm: '1 1 220px' }, maxWidth: { md: 280 } }}
            />
            <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 140 }, flex: { sm: '0 1 140px' } }}>
              <InputLabel>Payment</InputLabel>
              <Select
                label="Payment"
                value={payment}
                onChange={(e) => {
                  setPage(0);
                  setPayment(e.target.value as PaymentFilter);
                }}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="cash">Cash</MenuItem>
                <MenuItem value="upi">UPI</MenuItem>
                <MenuItem value="credit">Credit</MenuItem>
                <MenuItem value="card">Card</MenuItem>
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
            chips={chips}
            onClearAll={clearFilters}
            resultsLabel={
              data ? `${data.meta.total} result${data.meta.total === 1 ? '' : 's'} found` : undefined
            }
          />

          <ResponsiveTable>
            <Table size="small">
              <SortableTableHead columns={COLUMNS} orderBy={sort} order={order} onRequestSort={handleSort} />
              <TableBody>
                {(data?.items || []).map((inv) => (
                  <TableRow
                    key={inv.id}
                    hover
                    sx={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/purchases/${inv.id}`)}
                  >
                    <TableCell>{inv.invoice_no}</TableCell>
                    <TableCell>{inv.customer_name}</TableCell>
                    <TableCell>{inv.purchased_at}</TableCell>
                    <TableCell sx={{ textTransform: 'uppercase' }}>{inv.payment_mode}</TableCell>
                    <TableCell align="right">{num(inv.total_qty)}</TableCell>
                    <TableCell align="right">{money(inv.total_amount)}</TableCell>
                    <TableCell align="right">{num(inv.points_earned)}</TableCell>
                  </TableRow>
                ))}
                {!isLoading && !data?.items?.length && (
                  <TableRow>
                    <TableCell colSpan={7} sx={{ border: 0, py: 0 }}>
                      <EmptyContent
                        compact
                        variant={search || payment || fromStr || toStr ? 'search' : 'empty'}
                        title={search || payment || fromStr || toStr ? 'No matching invoices' : 'No invoices yet'}
                        description={
                          search || payment || fromStr || toStr
                            ? 'Try clearing filters or searching something else.'
                            : 'Create your first invoice to start tracking purchases.'
                        }
                        action={
                          !search && !payment && !fromStr && !toStr ? (
                            <EmptyActionButton label="New invoice" onClick={() => navigate('/purchases/new')} />
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
          />
        </CardContent>
      </Card>
    </Stack>
  );
}
