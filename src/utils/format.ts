export function money(v: number | string | undefined | null) {
  const n = Number(v || 0);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(n);
}

export function num(v: number | string | undefined | null) {
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(Number(v || 0));
}

export function schemeMetricLabel(metric: string) {
  if (metric === 'amount') return 'Purchase amount';
  if (metric === 'quantity') return 'Quantity';
  return 'Points';
}

export function schemeValue(metric: string, value: number | string | undefined | null) {
  if (metric === 'amount') return money(value);
  if (metric === 'quantity') return num(value);
  return `${num(value)} pts`;
}
