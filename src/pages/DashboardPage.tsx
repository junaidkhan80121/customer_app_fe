import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Stack,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableRow,
} from '@mui/material';
import api from '../api/client';
import type { Dashboard, RankingRow } from '../api/types';
import { money, num } from '../utils/format';
import ResponsiveTable from '../components/ResponsiveTable';
import EmptyContent from '../components/EmptyContent';
import PageHeader from '../components/PageHeader';
import { IllustrationWelcome, IllustrationTrophy } from '../assets/illustrations';
import SortableTableHead, {
  SortOrder,
  SortableColumn,
  compareValues,
  nextSortState,
} from '../components/table/SortableTableHead';

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="h4" sx={{ mt: 1, fontSize: { xs: '1.5rem', sm: '2rem' } }}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
}

type BuyerSort = 'customer_name' | 'type_name' | 'total_qty' | 'total_amount' | 'total_points';

const COLUMNS: SortableColumn<BuyerSort>[] = [
  { id: 'customer_name', label: 'Customer' },
  { id: 'type_name', label: 'Type' },
  { id: 'total_qty', label: 'Qty', align: 'right' },
  { id: 'total_amount', label: 'Amount', align: 'right' },
  { id: 'total_points', label: 'Points', align: 'right' },
];

function buyerValue(row: RankingRow, key: BuyerSort): string | number {
  switch (key) {
    case 'customer_name':
      return row.customer_name;
    case 'type_name':
      return row.type_name || '';
    case 'total_qty':
      return Number(row.total_qty);
    case 'total_amount':
      return Number(row.total_amount);
    case 'total_points':
      return Number(row.total_points);
  }
}

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => (await api.get<Dashboard>('/api/dashboard')).data,
  });
  const [sort, setSort] = useState<BuyerSort>('total_amount');
  const [order, setOrder] = useState<SortOrder>('desc');

  const rows = useMemo(() => {
    const list = [...(data?.top_buyers || [])];
    list.sort((a, b) => compareValues(buyerValue(a, sort), buyerValue(b, sort), order));
    return list;
  }, [data?.top_buyers, sort, order]);

  return (
    <Stack spacing={3}>
      <PageHeader
        title="Dashboard"
        description="Overview of customers and sales"
        illustration={<IllustrationWelcome />}
      />

      <Grid container spacing={2}>
        <Grid item xs={12} sm={4}>
          <StatCard label="Customers" value={isLoading ? '…' : String(data?.customer_count ?? 0)} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard label="Invoices" value={isLoading ? '…' : String(data?.invoice_count ?? 0)} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard label="Total sales" value={isLoading ? '…' : money(data?.sales_amount)} />
        </Grid>
      </Grid>

      <Card>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Top buyers (default slab)
          </Typography>
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
                }}
              />
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.customer_id}>
                    <TableCell>{row.customer_name}</TableCell>
                    <TableCell>{row.type_name}</TableCell>
                    <TableCell align="right">{num(row.total_qty)}</TableCell>
                    <TableCell align="right">{money(row.total_amount)}</TableCell>
                    <TableCell align="right">{num(row.total_points)}</TableCell>
                  </TableRow>
                ))}
                {!isLoading && !rows.length && (
                  <TableRow>
                    <TableCell colSpan={5} sx={{ border: 0, py: 0 }}>
                      <EmptyContent
                        compact
                        title="No top buyers yet"
                        description="Record some purchases to see rankings here."
                        illustration={<IllustrationTrophy sx={{ maxWidth: 160 }} />}
                      />
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ResponsiveTable>
        </CardContent>
      </Card>
    </Stack>
  );
}
