export type CreditPosition = {
  creditLimitRwf: number | string;
  paymentTermsDays: number;
  outstandingRwf: number | string;
  availableRwf: number | string;
  overdueRwf: number | string;
  creditHold?: boolean;
};

export type ClientOrder = {
  id: string;
  reference: string;
  status: string;
  purchase_order_reference: string | null;
  subtotal_rwf: number | string;
  vat_rwf: number | string;
  discount_rwf: number | string;
  total_rwf: number | string;
  tracking_number: string | null;
  expected_delivery_date: string | null;
  submitted_at: string | null;
  delivered_at: string | null;
  created_at: string;
  item_count: number;
  total_quantity: number;
  invoice_reference: string | null;
  invoice_status: string | null;
};

export type OrderItem = {
  id: string;
  product_id: string;
  product_name: string;
  sku: string;
  quantity: number;
  unit_price_rwf: number | string;
  line_total_rwf: number | string;
  vat_rwf: number | string;
  image_urls: string[] | null;
  size: string | null;
};

export type OrderDetail = ClientOrder & {
  notes: string | null;
  cancelled_reason: string | null;
  delivery_address: { label: string; recipientName: string; phone: string; streetAddress: string; district: string; country: string } | null;
  invoice: { id: string; reference: string; status: string; dueAt: string; totalRwf: number | string; amountPaidRwf: number | string } | null;
  items: OrderItem[];
};

export type ClientInvoice = {
  id: string;
  reference: string;
  status: string;
  issued_at: string;
  due_at: string;
  subtotal_rwf: number | string;
  vat_rwf: number | string;
  total_rwf: number | string;
  amount_paid_rwf: number | string;
  balance_rwf: number | string;
  ebm_receipt_number: string | null;
  order_reference: string;
  order_id: string;
  is_overdue: boolean;
};

export type ClientPayment = {
  id: string;
  reference: string;
  method: string;
  status: string;
  amount_rwf: number | string;
  external_reference: string | null;
  received_at: string | null;
  created_at: string;
  invoice_reference: string | null;
};
