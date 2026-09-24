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
  TableHead,
  TableRow,
} from '@mui/material';
import api from '../api/client';
import type { Dashboard } from '../api/types';
import { money, num } from '../utils/format';
import ResponsiveTable from '../components/ResponsiveTable';

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

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => (await api.get<Dashboard>('/api/dashboard')).data,
  });

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4">Dashboard</Typography>
        <Typography color="text.secondary">Overview of customers and sales</Typography>
      </Box>

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
              <TableHead>
                <TableRow>
                  <TableCell>Customer</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell align="right">Qty</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell align="right">Points</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(data?.top_buyers || []).map((row) => (
                  <TableRow key={row.customer_id}>
                    <TableCell>{row.customer_name}</TableCell>
                    <TableCell>{row.type_name}</TableCell>
                    <TableCell align="right">{num(row.total_qty)}</TableCell>
                    <TableCell align="right">{money(row.total_amount)}</TableCell>
                    <TableCell align="right">{num(row.total_points)}</TableCell>
                  </TableRow>
                ))}
                {!isLoading && !data?.top_buyers?.length && (
                  <TableRow>
                    <TableCell colSpan={5}>No purchases yet</TableCell>
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
