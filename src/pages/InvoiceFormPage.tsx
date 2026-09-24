import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';
import api from '../api/client';
import type { Customer, Invoice, PaymentMode, ShopSettings } from '../api/types';
import { money, num } from '../utils/format';

type Line = {
  item_name: string;
  qty: string;
  unit: string;
  unit_price: string;
  points_earned: string;
};

const emptyLine = (): Line => ({
  item_name: '',
  qty: '1',
  unit: 'piece',
  unit_price: '0',
  points_earned: '',
});

export default function InvoiceFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [customerId, setCustomerId] = useState('');
  const [purchasedAt, setPurchasedAt] = useState<Dayjs | null>(dayjs());
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('cash');
  const [notes, setNotes] = useState('');
  const [pointsOverride, setPointsOverride] = useState('');
  const [lines, setLines] = useState<Line[]>([emptyLine()]);
  const [error, setError] = useState('');

  const { data: customersPage } = useQuery({
    queryKey: ['customers-all'],
    queryFn: async () =>
      (await api.get<{ items: Customer[] }>('/api/customers', { params: { page: 1, page_size: 100, active_only: true } }))
        .data,
  });

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => (await api.get<ShopSettings>('/api/settings')).data,
  });

  const { data: existing } = useQuery({
    queryKey: ['invoice', id],
    enabled: isEdit,
    queryFn: async () => (await api.get<Invoice>(`/api/invoices/${id}`)).data,
  });

  useEffect(() => {
    if (!existing) return;
    setCustomerId(existing.customer_id);
    setPurchasedAt(dayjs(existing.purchased_at));
    setPaymentMode(existing.payment_mode);
    setNotes(existing.notes || '');
    setPointsOverride(existing.points_overridden ? String(existing.points_earned) : '');
    setLines(
      existing.items.map((i) => ({
        item_name: i.item_name,
        qty: String(i.qty),
        unit: i.unit,
        unit_price: String(i.unit_price),
        points_earned: i.points_earned != null ? String(i.points_earned) : '',
      })),
    );
  }, [existing]);

  const totals = useMemo(() => {
    let qty = 0;
    let amount = 0;
    for (const l of lines) {
      qty += Number(l.qty) || 0;
      amount += (Number(l.qty) || 0) * (Number(l.unit_price) || 0);
    }
    return { qty, amount };
  }, [lines]);

  const estimatedPoints = useMemo(() => {
    if (pointsOverride !== '') return Number(pointsOverride) || 0;
    if (!settings) return 0;
    if (settings.points_mode === 'manual') {
      return lines.reduce((s, l) => s + (Number(l.points_earned) || 0), 0);
    }
    if (settings.points_mode === 'rupees_per_point') {
      const per = Number(settings.rupees_per_point) || 1;
      return Math.floor(totals.amount / per);
    }
    if (settings.points_mode === 'percentage_of_amount') {
      return (totals.amount * (Number(settings.points_percentage) || 0)) / 100;
    }
    if (settings.points_mode === 'per_quantity') {
      return totals.qty * (Number(settings.points_per_quantity) || 0);
    }
    return 0;
  }, [settings, totals, lines, pointsOverride]);

  const save = useMutation({
    mutationFn: async () => {
      if (!purchasedAt) throw new Error('Date is required');
      const payload = {
        customer_id: customerId,
        purchased_at: purchasedAt.format('YYYY-MM-DD'),
        payment_mode: paymentMode,
        notes: notes || null,
        points_override: pointsOverride === '' ? null : Number(pointsOverride),
        items: lines.map((l) => ({
          item_name: l.item_name,
          qty: Number(l.qty),
          unit: l.unit,
          unit_price: Number(l.unit_price),
          points_earned:
            settings?.points_mode === 'manual' && l.points_earned !== ''
              ? Number(l.points_earned)
              : null,
        })),
      };
      if (isEdit) {
        await api.put(`/api/invoices/${id}`, {
          ...payload,
          clear_points_override: pointsOverride === '',
        });
      } else {
        await api.post('/api/invoices', payload);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invoices'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      qc.invalidateQueries({ queryKey: ['rankings'] });
      qc.invalidateQueries({ queryKey: ['customers'] });
      navigate('/purchases');
    },
    onError: (err: any) => setError(err?.message || err?.response?.data?.detail || 'Save failed'),
  });

  const modeLabel = {
    rupees_per_point: `Auto: 1 pt / ₹${settings?.rupees_per_point ?? 100}`,
    percentage_of_amount: `Auto: ${settings?.points_percentage ?? 5}% of amount`,
    per_quantity: `Auto: ${settings?.points_per_quantity ?? 1} pt / unit`,
    manual: 'Manual points on lines',
  }[settings?.points_mode || 'rupees_per_point'];

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4">{isEdit ? 'Edit invoice' : 'New invoice'}</Typography>
        <Typography color="text.secondary">Record purchase with qty, price, and points</Typography>
      </Box>

      {error && <Alert severity="error">{String(error)}</Alert>}

      <Card>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Stack spacing={2}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <FormControl fullWidth required>
                <InputLabel>Customer</InputLabel>
                <Select
                  label="Customer"
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                >
                  {(customersPage?.items || []).map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.name} ({c.type_name}) — {c.phone}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <DatePicker
                label="Date"
                value={purchasedAt}
                onChange={(v) => setPurchasedAt(v)}
                slotProps={{ textField: { fullWidth: true, required: true } }}
              />
              <FormControl fullWidth>
                <InputLabel>Payment</InputLabel>
                <Select
                  label="Payment"
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value as PaymentMode)}
                >
                  <MenuItem value="cash">Cash</MenuItem>
                  <MenuItem value="upi">UPI</MenuItem>
                  <MenuItem value="credit">Credit</MenuItem>
                  <MenuItem value="card">Card</MenuItem>
                </Select>
              </FormControl>
            </Stack>

            <TextField
              label="Notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              fullWidth
              multiline
              minRows={2}
            />

            <Typography variant="subtitle1" fontWeight={700}>
              Line items
            </Typography>
            {lines.map((line, idx) => (
              <Stack
                key={idx}
                direction={{ xs: 'column', md: 'row' }}
                spacing={1}
                alignItems={{ xs: 'stretch', md: 'center' }}
                sx={{
                  p: { xs: 1.5, md: 0 },
                  border: { xs: '1px dashed', md: 'none' },
                  borderColor: { xs: 'divider', md: 'transparent' },
                  borderRadius: 2,
                }}
              >
                <TextField
                  label="Item"
                  value={line.item_name}
                  onChange={(e) => {
                    const next = [...lines];
                    next[idx] = { ...line, item_name: e.target.value };
                    setLines(next);
                  }}
                  sx={{ flex: 2 }}
                  fullWidth
                />
                <Stack direction="row" spacing={1} sx={{ width: { xs: '100%', md: 'auto' } }}>
                  <TextField
                    label="Qty"
                    type="number"
                    value={line.qty}
                    onChange={(e) => {
                      const next = [...lines];
                      next[idx] = { ...line, qty: e.target.value };
                      setLines(next);
                    }}
                    sx={{ width: { xs: '50%', md: 100 } }}
                  />
                  <TextField
                    label="Unit"
                    value={line.unit}
                    onChange={(e) => {
                      const next = [...lines];
                      next[idx] = { ...line, unit: e.target.value };
                      setLines(next);
                    }}
                    sx={{ width: { xs: '50%', md: 110 } }}
                  />
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ width: { xs: '100%', md: 'auto' } }}>
                  <TextField
                    label="Unit price"
                    type="number"
                    value={line.unit_price}
                    onChange={(e) => {
                      const next = [...lines];
                      next[idx] = { ...line, unit_price: e.target.value };
                      setLines(next);
                    }}
                    sx={{ width: { xs: '50%', md: 130 }, flex: { xs: 1, md: 'none' } }}
                  />
                  {settings?.points_mode === 'manual' && (
                    <TextField
                      label="Points"
                      type="number"
                      value={line.points_earned}
                      onChange={(e) => {
                        const next = [...lines];
                        next[idx] = { ...line, points_earned: e.target.value };
                        setLines(next);
                      }}
                      sx={{ width: { xs: '50%', md: 110 } }}
                    />
                  )}
                  <Typography sx={{ minWidth: 90 }} variant="body2">
                    {money((Number(line.qty) || 0) * (Number(line.unit_price) || 0))}
                  </Typography>
                  <IconButton
                    disabled={lines.length === 1}
                    onClick={() => setLines(lines.filter((_, i) => i !== idx))}
                    aria-label="Remove line"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Stack>
              </Stack>
            ))}
            <Button startIcon={<AddIcon />} onClick={() => setLines([...lines, emptyLine()])}>
              Add line
            </Button>

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ pt: 1 }}>
              <TextField
                label="Points override (optional)"
                type="number"
                value={pointsOverride}
                onChange={(e) => setPointsOverride(e.target.value)}
                helperText={modeLabel}
                sx={{ maxWidth: 320 }}
              />
              <Box sx={{ flex: 1 }} />
              <Stack spacing={0.5} alignItems={{ xs: 'flex-start', md: 'flex-end' }}>
                <Typography>Total qty: {num(totals.qty)}</Typography>
                <Typography fontWeight={700}>Total amount: {money(totals.amount)}</Typography>
                <Typography color="secondary.main" fontWeight={700}>
                  Points: {num(estimatedPoints)}
                </Typography>
              </Stack>
            </Stack>

            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              justifyContent="flex-end"
              sx={{ pt: 1 }}
            >
              <Button onClick={() => navigate('/purchases')} fullWidth={false} sx={{ width: { xs: '100%', sm: 'auto' } }}>
                Cancel
              </Button>
              <Button
                variant="contained"
                color="secondary"
                sx={{ width: { xs: '100%', sm: 'auto' } }}
                disabled={
                  save.isPending ||
                  !customerId ||
                  !purchasedAt ||
                  lines.some((l) => !l.item_name || !(Number(l.qty) > 0))
                }
                onClick={() => {
                  setError('');
                  save.mutate();
                }}
              >
                {isEdit ? 'Update invoice' : 'Save invoice'}
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}
