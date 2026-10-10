import { Fragment, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  LinearProgress,
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
import type { Customer, CustomerSchemeStatus, Invoice, PageMeta, PaymentMode } from '../api/types';
import { money, num, schemeValue } from '../utils/format';
import FilterChips, { FilterChipItem } from './FilterChips';
import ResponsiveTable from './ResponsiveTable';
import EmptyContent from './EmptyContent';
import SortableTableHead, { SortOrder, SortableColumn, nextSortState } from './table/SortableTableHead';

interface PurchasePage {
  items: Invoice[];
  meta: PageMeta;
  total_qty: number | string;
  total_amount: number | string;
  total_points: number | string;
}

type SortKey = 'date' | 'amount' | 'qty' | 'points' | 'invoice_no' | 'payment';
type PaymentFilter = '' | PaymentMode;

const COLUMNS: SortableColumn<SortKey>[] = [
  { id: 'invoice_no', label: 'Invoice' },
  { id: 'date', label: 'Date' },
  { id: 'payment', label: 'Payment' },
  { id: 'qty', label: 'Qty', align: 'right' },
  { id: 'amount', label: 'Amount', align: 'right' },
  { id: 'points', label: 'Points', align: 'right' },
];

export default function CustomerHistoryDialog({
  customer,
  onClose,
}: {
  customer: Customer | null;
  onClose: () => void;
}) {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [payment, setPayment] = useState<PaymentFilter>('');
  const [fromDate, setFromDate] = useState<Dayjs | null>(null);
  const [toDate, setToDate] = useState<Dayjs | null>(null);
  const [sort, setSort] = useState<SortKey>('date');
  const [order, setOrder] = useState<SortOrder>('desc');
  const [openInvoice, setOpenInvoice] = useState<string | null>(null);

  const fromStr = fromDate?.format('YYYY-MM-DD') || undefined;
  const toStr = toDate?.format('YYYY-MM-DD') || undefined;

  const query = useMemo(
    () => ({
      page: page + 1,
      page_size: pageSize,
      search: search || undefined,
      payment_mode: payment || undefined,
      from_date: fromStr,
      to_date: toStr,
      sort,
      order,
    }),
    [page, pageSize, search, payment, fromStr, toStr, sort, order],
  );

  const { data, isLoading } = useQuery({
    queryKey: ['customer-purchases', customer?.id, query],
    enabled: Boolean(customer),
    queryFn: async () =>
      (await api.get<PurchasePage>(`/api/customers/${customer!.id}/purchases`, { params: query })).data,
  });

  const { data: schemes = [] } = useQuery({
    queryKey: ['customer-schemes', customer?.id],
    enabled: Boolean(customer),
    queryFn: async () =>
      (await api.get<CustomerSchemeStatus[]>(`/api/customers/${customer!.id}/schemes`)).data,
  });

  const reset = () => {
    setPage(0);
    setSearch('');
    setPayment('');
    setFromDate(null);
    setToDate(null);
    setSort('date');
    setOrder('desc');
    setOpenInvoice(null);
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
  if (payment) {
    chips.push({
      key: 'payment',
      label: `Payment: ${payment}`,
      onDelete: () => {
        setPayment('');
        setPage(0);
      },
    });
  }
  if (fromStr || toStr) {
    chips.push({
      key: 'dates',
      label: `Dates: ${fromStr || '…'} to ${toStr || '…'}`,
      onDelete: () => {
        setFromDate(null);
        setToDate(null);
        setPage(0);
      },
    });
  }

  const qualified = schemes.filter((scheme) => scheme.qualified);

  return (
    <Dialog
      open={Boolean(customer)}
      onClose={() => {
        reset();
        onClose();
      }}
      fullWidth
      maxWidth="lg"
    >
      <DialogTitle>
        {customer?.name}
        <Typography variant="body2" color="text.secondary">
          {customer?.phone}
          {customer?.type_name ? ` · ${customer.type_name}` : ''}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 0.5 }}>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip label={`Purchases ${money(data?.total_amount)}`} color="secondary" />
            <Chip label={`Qty ${num(data?.total_qty)}`} />
            <Chip label={`Points ${num(data?.total_points)}`} />
            {qualified.map((scheme) => (
              <Chip key={scheme.scheme_id} color="success" label={`Scheme: ${scheme.name}`} />
            ))}
          </Stack>

          {schemes.length > 0 && (
            <Stack spacing={1}>
              <Typography variant="subtitle2">Schemes</Typography>
              {schemes.map((scheme) => {
                const goal = Number(scheme.threshold) || 1;
                const current = Number(scheme.progress) || 0;
                const pct = Math.min(100, Math.round((current / goal) * 100));
                return (
                  <Box key={scheme.scheme_id}>
                    <Stack direction="row" justifyContent="space-between" spacing={1}>
                      <Typography variant="body2">{scheme.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {schemeValue(scheme.metric, scheme.progress)} / {schemeValue(scheme.metric, scheme.threshold)}
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={pct}
                      color={scheme.qualified ? 'success' : 'secondary'}
                      sx={{ mt: 0.5, height: 8, borderRadius: 4 }}
                    />
                  </Box>
                );
              })}
            </Stack>
          )}

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              size="small"
              label="Search invoice / item"
              value={search}
              onChange={(e) => {
                setPage(0);
                setSearch(e.target.value);
              }}
              fullWidth
            />
            <FormControl size="small" fullWidth sx={{ maxWidth: { md: 160 } }}>
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
              onChange={(value) => {
                setPage(0);
                setFromDate(value);
              }}
              slotProps={{ textField: { size: 'small', fullWidth: true } }}
            />
            <DatePicker
              label="To"
              value={toDate}
              onChange={(value) => {
                setPage(0);
                setToDate(value);
              }}
              slotProps={{ textField: { size: 'small', fullWidth: true } }}
            />
          </Stack>

          <FilterChips
            chips={chips}
            onClearAll={() => {
              setSearch('');
              setPayment('');
              setFromDate(null);
              setToDate(null);
              setPage(0);
            }}
            resultsLabel={
              data ? `${data.meta.total} purchase${data.meta.total === 1 ? '' : 's'}` : undefined
            }
          />

          <ResponsiveTable>
            <Table size="small">
              <SortableTableHead
                columns={COLUMNS}
                orderBy={sort}
                order={order}
                onRequestSort={(col) => {
                  const next = nextSortState(sort, order, col, 'desc');
                  setSort(next.orderBy);
                  setOrder(next.order);
                  setPage(0);
                }}
              />
              <TableBody>
                {(data?.items || []).map((invoice) => (
                  <Fragment key={invoice.id}>
                    <TableRow
                      hover
                      sx={{ cursor: 'pointer' }}
                      onClick={() => setOpenInvoice(openInvoice === invoice.id ? null : invoice.id)}
                    >
                      <TableCell>{invoice.invoice_no}</TableCell>
                      <TableCell>{invoice.purchased_at}</TableCell>
                      <TableCell sx={{ textTransform: 'capitalize' }}>{invoice.payment_mode}</TableCell>
                      <TableCell align="right">{num(invoice.total_qty)}</TableCell>
                      <TableCell align="right">{money(invoice.total_amount)}</TableCell>
                      <TableCell align="right">{num(invoice.points_earned)}</TableCell>
                    </TableRow>
                    {openInvoice === invoice.id && (
                      <TableRow>
                        <TableCell colSpan={6} sx={{ bgcolor: 'action.hover' }}>
                          <Stack spacing={0.5}>
                            {(invoice.items || []).map((item) => (
                              <Typography key={item.id || item.item_name} variant="body2">
                                {item.item_name}
                                {item.sku ? ` (${item.sku})` : ''} · {num(item.qty)} {item.unit} × {money(item.unit_price)}{' '}
                                = {money(item.line_amount)}
                              </Typography>
                            ))}
                            {!invoice.items?.length && (
                              <Typography variant="body2" color="text.secondary">
                                No line items
                              </Typography>
                            )}
                          </Stack>
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                ))}
                {!isLoading && !data?.items?.length && (
                  <TableRow>
                    <TableCell colSpan={6} sx={{ border: 0 }}>
                      <EmptyContent
                        compact
                        variant={search || payment || fromStr || toStr ? 'search' : 'empty'}
                        title={search || payment || fromStr || toStr ? 'No matching purchases' : 'No purchases yet'}
                        description="Invoices for this customer show up here."
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
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
