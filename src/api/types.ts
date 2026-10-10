export type PointsMode = 'rupees_per_point' | 'percentage_of_amount' | 'per_quantity' | 'manual';
export type PaymentMode = 'cash' | 'upi' | 'credit' | 'card';
export type SchemeMetric = 'amount' | 'quantity' | 'points';
export type SortKey =
  | 'qty'
  | 'amount'
  | 'points'
  | 'customer_name'
  | 'phone'
  | 'type_name'
  | 'invoice_count';


export interface PageMeta {
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

export interface Admin {
  id: string;
  email: string;
  name: string;
  is_active: boolean;
  created_at: string;
}

export interface CustomerType {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address?: string | null;
  type_id: string;
  type_name?: string | null;
  lifetime_points: number | string;
  is_active: boolean;
  created_at: string;
}

export interface TimeSlab {
  id: string;
  name: string;
  months: number;
  start_date?: string | null;
  end_date?: string | null;
  is_default: boolean;
  created_at: string;
}

export interface ShopSettings {
  id: string;
  points_mode: PointsMode;
  rupees_per_point: number | string;
  points_percentage: number | string;
  points_per_quantity: number | string;
}

export interface CatalogItem {
  id: string;
  name: string;
  description?: string | null;
  sku: string;
  price: number | string;
  points_enabled: boolean;
  is_active: boolean;
  created_at: string;
}

export interface InvoiceItem {
  id?: string;
  item_id?: string | null;
  sku?: string | null;
  item_name: string;
  qty: number | string;
  unit: string;
  unit_price: number | string;
  line_amount?: number | string;
  points_earned?: number | string;
}

export interface Invoice {
  id: string;
  invoice_no: string;
  customer_id: string;
  customer_name?: string | null;
  customer_type_name?: string | null;
  purchased_at: string;
  payment_mode: PaymentMode;
  notes?: string | null;
  total_qty: number | string;
  total_amount: number | string;
  points_earned: number | string;
  points_overridden: boolean;
  items: InvoiceItem[];
  created_at: string;
}

export interface Scheme {
  id: string;
  name: string;
  description?: string | null;
  metric: SchemeMetric;
  threshold: number | string;
  start_date?: string | null;
  end_date?: string | null;
  is_active: boolean;
  qualified_count: number;
  created_at: string;
}

export interface CustomerSchemeStatus {
  scheme_id: string;
  name: string;
  description?: string | null;
  metric: SchemeMetric;
  threshold: number | string;
  progress: number | string;
  qualified: boolean;
  start_date?: string | null;
  end_date?: string | null;
}

export interface SchemeCustomer {
  customer_id: string;
  customer_name: string;
  phone: string;
  type_name?: string | null;
  progress: number | string;
  invoice_count: number;
  qualified: boolean;
}

export interface RankingRow {
  customer_id: string;
  customer_name: string;
  phone: string;
  type_name: string;
  total_qty: number | string;
  total_amount: number | string;
  total_points: number | string;
  invoice_count: number;
}

export interface Dashboard {
  customer_count: number;
  invoice_count: number;
  sales_amount: number | string;
  top_buyers: RankingRow[];
}
