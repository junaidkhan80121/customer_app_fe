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
