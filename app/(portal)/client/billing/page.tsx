"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clock, CreditCard, FileDown, Mail, Receipt, Search, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState, ErrorBanner, PageHeader, RowSkeletons, StatCard, StatSkeletons, StatusBadge } from "@/components/portal/portal-ui";
import { api, errorMessage } from "@/lib/api";
import type { ClientInvoice, ClientPayment } from "@/lib/client-types";
import { date, humanise, money, moneyCompact } from "@/lib/format";
import { cn } from "@/lib/utils";

const ACCOUNTS_EMAIL = "accounts@flr.rw";

export default function BillingPage() {
  const [invoices, setInvoices] = useState<ClientInvoice[]>([]);
  const [payments, setPayments] = useState<ClientPayment[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    setError("");
    Promise.all([api.get<{ data: ClientInvoice[] }>("/api/v1/account/invoices"), api.get<{ data: ClientPayment[] }>("/api/v1/account/payments")])
      .then(([invoiceResult, paymentResult]) => {
        setInvoices(invoiceResult.data);
        setPayments(paymentResult.data);
      })
      .catch((cause) => setError(errorMessage(cause, "Billing information could not be loaded.")))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const outstanding = invoices.reduce((sum, invoice) => sum + Number(invoice.balance_rwf), 0);
  const overdue = invoices.filter((invoice) => invoice.is_overdue).reduce((sum, invoice) => sum + Number(invoice.balance_rwf), 0);
  const paid = invoices.reduce((sum, invoice) => sum + Number(invoice.amount_paid_rwf), 0);
  const needle = query.trim().toLowerCase();
  const visibleInvoices = useMemo(() => invoices.filter((invoice) => `${invoice.reference} ${invoice.order_reference} ${invoice.ebm_receipt_number ?? ""}`.toLowerCase().includes(needle)), [invoices, needle]);
  const visiblePayments = useMemo(() => payments.filter((payment) => `${payment.reference} ${payment.invoice_reference ?? ""} ${payment.external_reference ?? ""}`.toLowerCase().includes(needle)), [payments, needle]);

  return (
    <div className="grid gap-6">
      <PageHeader
        eyebrow="Finance"
        title="Invoices & payments"
        description="Account balances, invoice due dates, payment history and EBM receipt references."
        actions={<Button asChild variant="outline"><a href={`mailto:${ACCOUNTS_EMAIL}`}><Mail /> Contact accounts</a></Button>}
      />

      {error && <ErrorBanner message={error} onRetry={load} />}

      {loading ? (
        <StatSkeletons count={3} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard icon={<Clock />} accent="gold" label="Outstanding" value={moneyCompact(outstanding)} note={`Across ${invoices.filter((invoice) => Number(invoice.balance_rwf) > 0).length} open invoices`} />
          <StatCard icon={<AlertTriangle />} accent="red" label="Overdue" value={moneyCompact(overdue)} note={overdue ? "Please contact the accounts team" : "Your account is up to date"} attention={overdue > 0} />
          <StatCard icon={<CheckCircle2 />} label="Total paid" value={moneyCompact(paid)} note={`${payments.filter((payment) => payment.status === "CONFIRMED").length} confirmed payments`} />
        </div>
      )}

      <Tabs defaultValue="invoices" className="gap-0 overflow-hidden rounded-2xl border border-sage-200/80 bg-white shadow-soft">
        <div className="flex flex-col gap-3 border-b border-sage-100 p-4 sm:flex-row sm:items-center sm:justify-between">
          <TabsList className="h-10">
            <TabsTrigger value="invoices" className="gap-2 px-3"><Receipt /> Invoices <span className="rounded-full bg-sage-200/70 px-1.5 text-xs">{invoices.length}</span></TabsTrigger>
            <TabsTrigger value="payments" className="gap-2 px-3"><CreditCard /> Payments <span className="rounded-full bg-sage-200/70 px-1.5 text-xs">{payments.length}</span></TabsTrigger>
          </TabsList>
          <label className="relative sm:w-72">
            <span className="sr-only">Search references</span>
            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-sage-400" />
            <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search references" className="h-10 pl-10" />
          </label>
        </div>

        <TabsContent value="invoices">
          {loading ? (
            <RowSkeletons />
          ) : visibleInvoices.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="border-b border-sage-100 bg-sage-50/70 text-left text-xs font-semibold text-sage-500">
                    <th className="px-5 py-3">Invoice</th>
                    <th className="px-5 py-3">Order</th>
                    <th className="px-5 py-3">Issued / due</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Total</th>
                    <th className="px-5 py-3 text-right">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sage-100">
                  {visibleInvoices.map((invoice) => (
                    <tr key={invoice.id} className="transition-colors hover:bg-sage-50">
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-forest-900">{invoice.reference}</p>
                        <p className="text-xs text-sage-500">{invoice.ebm_receipt_number ? `EBM ${invoice.ebm_receipt_number}` : "EBM receipt pending"}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <Link href={`/client/orders?order=${invoice.order_id}`} className="font-medium text-brand-700 hover:underline">{invoice.order_reference}</Link>
                      </td>
                      <td className="px-5 py-3.5 text-sage-600">
                        {date(invoice.issued_at)}
                        <p className={cn("text-xs", invoice.is_overdue ? "font-semibold text-red-700" : "text-sage-500")}>Due {date(invoice.due_at)}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge kind="invoice" status={invoice.is_overdue ? "OVERDUE" : invoice.status} />
                      </td>
                      <td className="px-5 py-3.5 text-right tabular-nums text-sage-600">{money(invoice.total_rwf)}</td>
                      <td className="px-5 py-3.5 text-right font-semibold tabular-nums text-forest-900">{money(invoice.balance_rwf)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState icon={<Receipt />} title={invoices.length ? "No matching invoices" : "No invoices yet"} text={invoices.length ? "Try another reference." : "Invoices issued for fulfilled orders will appear here."} />
          )}
        </TabsContent>

        <TabsContent value="payments">
          {loading ? (
            <RowSkeletons />
          ) : visiblePayments.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="border-b border-sage-100 bg-sage-50/70 text-left text-xs font-semibold text-sage-500">
                    <th className="px-5 py-3">Payment</th>
                    <th className="px-5 py-3">Invoice</th>
                    <th className="px-5 py-3">Method</th>
                    <th className="px-5 py-3">Received</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sage-100">
                  {visiblePayments.map((payment) => (
                    <tr key={payment.id} className="transition-colors hover:bg-sage-50">
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-forest-900">{payment.reference}</p>
                        <p className="text-xs text-sage-500">{payment.external_reference ?? "No external reference"}</p>
                      </td>
                      <td className="px-5 py-3.5 text-sage-600">{payment.invoice_reference ?? "Account payment"}</td>
                      <td className="px-5 py-3.5 text-sage-600">{humanise(payment.method)}</td>
                      <td className="px-5 py-3.5 text-sage-600">{date(payment.received_at ?? payment.created_at)}</td>
                      <td className="px-5 py-3.5"><StatusBadge kind="payment" status={payment.status} /></td>
                      <td className="px-5 py-3.5 text-right font-semibold tabular-nums text-forest-900">{money(payment.amount_rwf)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState icon={<CreditCard />} title={payments.length ? "No matching payments" : "No payments recorded"} text={payments.length ? "Try another reference." : "Confirmed account payments will appear here."} />
          )}
        </TabsContent>
      </Tabs>

      <section className="flex flex-col gap-4 rounded-2xl border border-brand-200 bg-brand-50/60 p-5 sm:flex-row sm:items-center">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white text-brand-700 ring-1 ring-brand-200"><FileDown className="size-5" /></span>
        <div className="flex-1">
          <p className="font-semibold text-forest-900">Need an official statement or invoice copy?</p>
          <p className="text-sm text-sage-600">Email {ACCOUNTS_EMAIL} with the invoice or account reference.</p>
        </div>
        <Button asChild variant="outline" className="bg-white"><a href={`mailto:${ACCOUNTS_EMAIL}`}>Request a document</a></Button>
      </section>
    </div>
  );
}
