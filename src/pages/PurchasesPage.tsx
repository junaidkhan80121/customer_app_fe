import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import api from '../api/client';
import type { Invoice, PageMeta } from '../api/types';
import { money, num } from '../utils/format';
import FilterChips, { FilterChipItem } from '../components/FilterChips';
import ResponsiveTable from '../components/ResponsiveTable';

interface InvoicePage {
  items: Invoice[];
  meta: PageMeta;
}

export default function PurchasesPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['invoices', page, pageSize, search],
    queryFn: async () =>
      (
        await api.get<InvoicePage>('/api/invoices', {
          params: { page: page + 1, page_size: pageSize, search: search || undefined },
        })
      ).data,
  });

  const chips: FilterChipItem[] = search
    ? [
        {
          key: 'search',
          label: `Search: ${search}`,
          onDelete: () => {
            setSearch('');
            setPage(0);
          },
        },
      ]
    : [];

  return (
    <Stack spacing={3}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', sm: 'center' }}
        spacing={2}
      >
        <Box>
          <Typography variant="h4">Purchases</Typography>
          <Typography color="text.secondary">Invoices with qty, price, and points</Typography>
        </Box>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => navigate('/purchases/new')}
          sx={{ alignSelf: { xs: 'stretch', sm: 'center' } }}
        >
          New invoice
        </Button>
      </Stack>

      <Card>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <TextField
            size="small"
            label="Search invoice / customer"
            value={search}
            onChange={(e) => {
              setPage(0);
              setSearch(e.target.value);
            }}
            fullWidth
            sx={{ mb: 2, maxWidth: { md: 320 } }}
          />

          <FilterChips
            chips={chips}
            onClearAll={() => {
              setSearch('');
              setPage(0);
            }}
            resultsLabel={
              data ? `${data.meta.total} result${data.meta.total === 1 ? '' : 's'} found` : undefined
            }
          />

          <ResponsiveTable>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Invoice</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Payment</TableCell>
                  <TableCell align="right">Qty</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell align="right">Points</TableCell>
                </TableRow>
              </TableHead>
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
                    <TableCell colSpan={7}>No invoices yet</TableCell>
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
