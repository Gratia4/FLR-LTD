"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AlertTriangle, ArrowRight, CalendarCheck, ChevronRight, CreditCard, Package, Receipt, ShoppingBag, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorBanner, PageHeader, Panel, PanelLink, StatCard, StatSkeletons, StatusBadge } from "@/components/portal/portal-ui";
import { ProductImage } from "@/components/portal/product-image";
import { api, errorMessage } from "@/lib/api";
import type { ClientOrder, CreditPosition } from "@/lib/client-types";
import { date, money, moneyCompact } from "@/lib/format";
import { usePortalSession } from "@/lib/use-session";
import { cn } from "@/lib/utils";

type Summary = {
  metrics: { open_orders: number; lifetime_orders: number; month_spend_rwf: number | string; overdue_invoices: number; cart_lines: number };
  recentOrders: ClientOrder[];
  frequentProducts: Array<{ product_id: string; product_name: string; sku: string; total_quantity: number; last_ordered: string; image_urls: string[] | null; stock_status: string; brand_name: string }>;
  credit: CreditPosition;
};

const greeting = () => {
  const hour = new Date().getHours();
  return hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
};

export default function ClientDashboardPage() {
  const { user } = usePortalSession();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState("");

  const load = () => {
    setError("");
    api
      .get<{ data: Summary }>("/api/v1/account/summary")
      .then((result) => setSummary(result.data))
      .catch((cause) => setError(errorMessage(cause, "Your dashboard could not be loaded.")));
  };
  useEffect(load, []);

  const credit = summary?.credit;
  const limit = Number(credit?.creditLimitRwf ?? 0);
  const used = Math.min(100, limit ? (Number(credit?.outstandingRwf ?? 0) / limit) * 100 : 0);

  return (
    <div className="grid gap-6">
      <PageHeader
        eyebrow="Partner dashboard"
        title={`${greeting()}${user ? `, ${user.fullName.split(" ")[0]}` : ""}`}
        description="Track orders, balances and invoices, and quickly re-order the products your business buys most."
        actions={<Button asChild><Link href="/wholesale"><ShoppingBag /> Browse products</Link></Button>}
      />

      {error && <ErrorBanner message={error} onRetry={load} />}

      {!summary && !error ? (
        <>
          <StatSkeletons />
          <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
            <Skeleton className="h-80 rounded-2xl" />
            <Skeleton className="h-80 rounded-2xl" />
          </div>
        </>
      ) : summary && credit ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard icon={<Package />} label="Open orders" value={summary.metrics.open_orders} note={`${summary.metrics.lifetime_orders} orders placed in total`} />
            <StatCard icon={<TrendingUp />} accent="blue" label="Spend this month" value={moneyCompact(summary.metrics.month_spend_rwf)} note="Confirmed and active orders" />
            <StatCard icon={<CreditCard />} accent="gold" label="Available credit" value={moneyCompact(credit.availableRwf)} note={`of ${moneyCompact(credit.creditLimitRwf)} account limit`} />
            <StatCard
              icon={<Receipt />}
              accent="red"
              label="Overdue invoices"
              value={summary.metrics.overdue_invoices}
              note={Number(credit.overdueRwf) > 0 ? `${moneyCompact(credit.overdueRwf)} overdue balance` : "Nothing overdue"}
              attention={summary.metrics.overdue_invoices > 0}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
            <Panel eyebrow="Order activity" title="Recent orders" action={<PanelLink href="/client/orders">View all</PanelLink>}>
              {summary.recentOrders.length ? (
                <ul className="divide-y divide-sage-100">
                  {summary.recentOrders.map((order) => (
                    <li key={order.id}>
                      <Link href={`/client/orders?order=${order.id}`} className="group flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-sage-50">
                        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700 ring-1 ring-brand-100"><Package className="size-4.5" /></span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold text-forest-900">{order.reference}</span>
                          <span className="block text-xs text-sage-500">
                            {order.item_count} product line{order.item_count === 1 ? "" : "s"} · {date(order.created_at)}
                          </span>
                        </span>
                        <span className="hidden sm:block"><StatusBadge kind="order" status={order.status} /></span>
                        <span className="text-sm font-semibold tabular-nums text-forest-900">{money(order.total_rwf)}</span>
                        <ChevronRight className="size-4 text-sage-300 transition-transform group-hover:translate-x-0.5" />
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState icon={<Package />} title="No orders yet" text="Your submitted wholesale orders will appear here." action={<Button asChild variant="outline"><Link href="/wholesale">Start shopping</Link></Button>} />
              )}
            </Panel>

            <Panel eyebrow="Account terms" title="Credit position" bodyClassName="p-5">
              <p className="text-sm text-sage-500">Outstanding balance</p>
              <p className="mt-1 font-display text-3xl font-extrabold tracking-tight text-forest-900">{money(credit.outstandingRwf)}</p>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-sage-100" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(used)} aria-label="Credit used">
                <div className={cn("h-full rounded-full transition-all", used > 90 ? "bg-red-500" : used > 70 ? "bg-gold-500" : "bg-brand-500")} style={{ width: `${used}%` }} />
              </div>
              <p className="mt-1.5 text-xs text-sage-500">{Math.round(used)}% of your credit limit in use</p>
              <dl className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-sage-50 p-3">
                  <dt className="text-xs text-sage-500">Credit limit</dt>
                  <dd className="mt-0.5 text-sm font-semibold tabular-nums text-forest-900">{money(credit.creditLimitRwf)}</dd>
                </div>
                <div className="rounded-xl bg-sage-50 p-3">
                  <dt className="text-xs text-sage-500">Available</dt>
                  <dd className="mt-0.5 text-sm font-semibold tabular-nums text-brand-700">{money(credit.availableRwf)}</dd>
                </div>
              </dl>
              {Number(credit.overdueRwf) > 0 && (
                <p className="mt-4 flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
                  <AlertTriangle className="size-4 shrink-0" /> {money(credit.overdueRwf)} is overdue
                </p>
              )}
              <Button asChild variant="outline" className="mt-5 w-full"><Link href="/client/billing">Invoices & payments <ArrowRight /></Link></Button>
            </Panel>
          </div>

          <Panel eyebrow="Easy replenishment" title="Frequently ordered" action={<PanelLink href="/wholesale">View catalogue</PanelLink>}>
            {summary.frequentProducts.length ? (
              <ul className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3">
                {summary.frequentProducts.map((product) => (
                  <li key={product.product_id}>
                    <Link href={`/wholesale?q=${encodeURIComponent(product.sku)}`} className="flex items-center gap-3 rounded-xl border border-sage-200/80 p-3 transition-colors hover:border-brand-200 hover:bg-brand-50/40">
                      <ProductImage imageUrls={product.image_urls} alt="" className="size-14" fallbackIcon />
                      <span className="min-w-0">
                        <span className="block text-[11px] font-semibold tracking-wide text-brand-700 uppercase">{product.brand_name}</span>
                        <span className="block truncate text-sm font-semibold text-forest-900">{product.product_name}</span>
                        <span className="block text-xs text-sage-500">Ordered {product.total_quantity} units · last {date(product.last_ordered)}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState icon={<CalendarCheck />} title="Your favourites will appear here" text="After your first order, the products you buy most will be one click away." />
            )}
          </Panel>
        </>
      ) : null}
    </div>
  );
}
