/** Shared formatting. RWF is quoted without a minor unit in trade. */

const rwf = new Intl.NumberFormat("en-RW", { style: "currency", currency: "RWF", maximumFractionDigits: 0 });
const rwfCompact = new Intl.NumberFormat("en-RW", {
  style: "currency",
  currency: "RWF",
  notation: "compact",
  maximumFractionDigits: 1,
});
const plain = new Intl.NumberFormat("en-RW", { maximumFractionDigits: 0 });

export const money = (value: number | string | null | undefined) => rwf.format(Number(value ?? 0));
export const moneyCompact = (value: number | string | null | undefined) => rwfCompact.format(Number(value ?? 0));
export const count = (value: number | string | null | undefined) => plain.format(Number(value ?? 0));

export const percent = (value: number | string | null | undefined, digits = 1) =>
  `${Number(value ?? 0).toFixed(digits)}%`;

export function date(value: string | Date | null | undefined, style: "short" | "medium" | "long" = "medium") {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-RW", { dateStyle: style }).format(new Date(value));
}

export function dateTime(value: string | Date | null | undefined) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-RW", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

const relative = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

export function relativeDate(value: string | Date | null | undefined) {
  if (!value) return "—";
  const days = Math.round((new Date(value).getTime() - Date.now()) / 86_400_000);
  if (Math.abs(days) < 1) return "today";
  if (Math.abs(days) < 30) return relative.format(days, "day");
  if (Math.abs(days) < 365) return relative.format(Math.round(days / 30), "month");
  return relative.format(Math.round(days / 365), "year");
}

/** Turns SCREAMING_SNAKE enums into readable labels. */
export const humanise = (value: string | null | undefined) =>
  !value ? "—" : value.replaceAll("_", " ").toLowerCase().replace(/^./, (c) => c.toUpperCase());

/** Display names for the payment methods the backend accepts. */
const PAYMENT_METHODS: Record<string, string> = {
  MTN_MOMO: "MTN MoMo",
  AIRTEL_MONEY: "Airtel Money",
  BANK_TRANSFER: "Bank transfer",
  CASH: "Cash",
  CHEQUE: "Cheque",
  CREDIT_NOTE: "Credit note",
};

export const paymentMethod = (value: string | null | undefined) => (value ? PAYMENT_METHODS[value] ?? humanise(value) : "—");

export const initials = (name: string | null | undefined) =>
  (name ?? "")
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "—";

export const fileSize = (bytes: number) =>
  bytes >= 1_048_576 ? `${(bytes / 1_048_576).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;

/* ---------------- status → visual tone ---------------- */

export type Tone = "ok" | "warn" | "danger" | "info" | "violet" | "neutral";

const ORDER_TONES: Record<string, Tone> = {
  DRAFT: "neutral",
  SUBMITTED: "warn",
  PROCESSING: "info",
  SHIPPED: "violet",
  DELIVERED: "ok",
  INVOICED: "ok",
  CANCELLED: "danger",
};

const ACCOUNT_TONES: Record<string, Tone> = {
  PENDING: "warn",
  APPROVED: "ok",
  SUSPENDED: "danger",
  REJECTED: "danger",
};

const INVOICE_TONES: Record<string, Tone> = {
  DRAFT: "neutral",
  ISSUED: "info",
  PARTIALLY_PAID: "warn",
  PAID: "ok",
  OVERDUE: "danger",
  CANCELLED: "neutral",
  CREDITED: "violet",
};

const STOCK_TONES: Record<string, Tone> = {
  IN_STOCK: "ok",
  LOW_STOCK: "warn",
  OUT_OF_STOCK: "danger",
  PRE_ORDER: "info",
};

const RETURN_TONES: Record<string, Tone> = {
  REQUESTED: "warn",
  APPROVED: "info",
  RECEIVED: "violet",
  CREDITED: "ok",
  REJECTED: "danger",
};

const PAYMENT_TONES: Record<string, Tone> = {
  PENDING: "warn",
  CONFIRMED: "ok",
  FAILED: "danger",
  REVERSED: "neutral",
};

export const toneFor = (kind: "order" | "account" | "invoice" | "stock" | "return" | "payment", status: string): Tone => {
  const table = { order: ORDER_TONES, account: ACCOUNT_TONES, invoice: INVOICE_TONES, stock: STOCK_TONES, return: RETURN_TONES, payment: PAYMENT_TONES }[kind];
  return table[status] ?? "neutral";
};
