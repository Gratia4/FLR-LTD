"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Buildings,
  CalendarBlank,
  CheckCircle,
  ClipboardText,
  CurrencyCircleDollar,
  Package,
  ShoppingCart,
  Stack,
  UsersThree,
  WarningCircle,
} from "@phosphor-icons/react";
import { ConsoleShell } from "@/components/console-shell";
import { Banner, Bars, EmptyState, Metric, SkeletonRows, StatusLabel } from "@/components/ui";
import { api, errorMessage } from "@/lib/api";
import { count, dateTime, money, moneyCompact, toneFor } from "@/lib/format";
import { useAdminSession } from "@/lib/use-session";

type Dashboard = {
  metrics: {
    active_clients: number;
    pending_applications: number;
    active_orders: number;
    month_revenue_rwf: string;
    previous_month_revenue_rwf: string;
    stock_alerts: number;
    active_products: number;
    active_brands: number;
    total_stock_units: number;
    overdue_rwf: string;
    open_returns: number;
  };
  monthlyRevenue: Array<{ label: string; period: string; revenue_rwf: string; order_count: number }>;
  recentOrders: Array<{ id: string; reference: string; status: string; total_rwf: string; created_at: string; business_name: string }>;
  pendingApplications: Array<{ id: string; name: string; type: string; created_at: string; contact_name: string; district: string }>;
  stockAlerts: Array<{ id: string; name: string; sku: string; stock_quantity: number; reorder_level: number; stock_status: string; brand_name: string }>;
  expiringBatches: Array<{ id: string; batch_number: string; expiry_date: string; quantity_remaining: number; days_remaining: number; product_name: string; sku: string }>;
};

export default function OverviewPage() {
  const { user, logout, can } = useAdminSession();
  const [data, setData] = useState<Dashboard | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get<{ data: Dashboard }>("/api/v1/admin/dashboard")
      .then((result) => setData(result.data))
      .catch((cause) => setError(errorMessage(cause, "The operational overview could not be loaded.")));
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const revenueChange = data && Number(data.metrics.previous_month_revenue_rwf) > 0
    ? ((Number(data.metrics.month_revenue_rwf) - Number(data.metrics.previous_month_revenue_rwf)) / Number(data.metrics.previous_month_revenue_rwf)) * 100
    : null;

  const emptyWorkspace = data
    && data.metrics.active_products === 0
    && data.metrics.active_clients === 0
    && data.metrics.active_orders === 0;

  return (
    <ConsoleShell user={user} active="overview" onLogout={logout} can={can}>
      <section className="console-hero">
        <div>
          <span className="eyebrow">Operational overview</span>
          <h1>{greeting}, {user?.fullName.split(" ")[0]}</h1>
          <p>Monitor partner onboarding, catalogue readiness, fulfilment, inventory, and receivables from one workspace.</p>
        </div>
        <div className="console-hero-side"><CalendarBlank weight="duotone" /><span><small>Today</small><b>{new Intl.DateTimeFormat("en-RW", { dateStyle: "long" }).format(new Date())}</b></span></div>
      </section>

      {error && <Banner tone="error">{error}</Banner>}
      {!data && !error ? <SkeletonRows rows={6} /> : data && <>
        <div className="metric-row cols-4">
          <Metric icon={Buildings} label="Active clients" value={data.metrics.active_clients} note={`${data.metrics.pending_applications} awaiting review`} />
          <Metric icon={ShoppingCart} label="Orders in progress" value={data.metrics.active_orders} accent="blue" note="Submitted through shipped" />
          <Metric
            icon={CurrencyCircleDollar}
            label="Revenue this month"
            value={moneyCompact(data.metrics.month_revenue_rwf)}
            accent="gold"
            note={`${money(data.metrics.overdue_rwf)} overdue`}
            trend={revenueChange === null ? undefined : { direction: revenueChange >= 0 ? "up" : "down", label: `${revenueChange >= 0 ? "+" : ""}${revenueChange.toFixed(1)}% vs last month` }}
          />
          <Metric icon={Package} label="Stock alerts" value={data.metrics.stock_alerts} accent={data.metrics.stock_alerts ? "danger" : "green"} note={`${count(data.metrics.total_stock_units)} units on hand`} />
        </div>

        {emptyWorkspace && <section className="card setup-card">
          <div className="card-head"><div><span className="eyebrow">New workspace</span><h2>Your management console is ready</h2><p>The database is connected. Complete these operational steps to begin seeing live activity across the dashboard.</p></div><ClipboardText size={30} weight="duotone" /></div>
          <div className="setup-steps">
            <article><span>1</span><div><b>Build the product catalogue</b><small>{data.metrics.active_brands} brands are ready. Add SKU, price, MOQ, image, and stock rules.</small></div>{can("catalogue") && <Link className="btn btn-secondary" href="/admin/catalogue/new">Add product <ArrowRight /></Link>}</article>
            <article><span>2</span><div><b>Receive opening inventory</b><small>Create batches with quantities and expiry dates for FEFO fulfilment.</small></div>{can("inventory") && <Link className="btn btn-secondary" href="/admin/inventory">Open inventory <ArrowRight /></Link>}</article>
            <article><span>3</span><div><b>Approve the first wholesale partner</b><small>New client registrations will enter the verification queue automatically.</small></div>{can("registrations") && <Link className="btn btn-secondary" href="/admin">Review applications <ArrowRight /></Link>}</article>
          </div>
        </section>}

        <div className="split split-wide">
          <section className="card">
            <div className="card-head"><div><h2>Order revenue</h2><p>Submitted order value, last twelve months · current month highlighted</p></div><span className="header-chip">RWF</span></div>
            <div className="card-body"><Bars data={data.monthlyRevenue.map((item) => ({ label: item.label, value: Number(item.revenue_rwf) }))} height={220} format={money} /></div>
          </section>
          <section className="card">
            <div className="card-head"><div><h2>Partner review queue</h2><p>Newest registration requests</p></div>{can("registrations") && <Link className="text-link" href="/admin">View all <ArrowRight /></Link>}</div>
            {data.pendingApplications.length ? <div className="queue-list">{data.pendingApplications.map((item) => <Link href="/admin" className="queue-item" key={item.id}><span className="avatar-chip">{item.name.slice(0, 2).toUpperCase()}</span><span><b>{item.name}</b><small>{item.contact_name} · {item.district}</small></span><time>{dateTime(item.created_at)}</time></Link>)}</div> : <EmptyState icon={CheckCircle} title="Review queue is clear" message="New wholesale applications will appear here." />}
          </section>
        </div>

        <div className="split split-2">
          <section className="card">
            <div className="card-head"><div><h2>Recent orders</h2><p>Latest wholesale activity</p></div>{can("fulfilment") && <Link className="text-link" href="/admin/orders">Manage <ArrowRight /></Link>}</div>
            {data.recentOrders.length ? <div className="queue-list">{data.recentOrders.map((order) => <Link href="/admin/orders" className="queue-item" key={order.id}><span className="avatar-chip"><ShoppingCart /></span><span><b>{order.reference}</b><small>{order.business_name} · {dateTime(order.created_at)}</small></span><StatusLabel tone={toneFor("order", order.status)} status={order.status} /><strong>{money(order.total_rwf)}</strong></Link>)}</div> : <EmptyState icon={ShoppingCart} title="No orders yet" message="Approved partners’ submitted orders will appear here." />}
          </section>
          <section className="card">
            <div className="card-head"><div><h2>Inventory attention</h2><p>Reorder and expiry priorities</p></div>{can("inventory") && <Link className="text-link" href="/admin/inventory">Open inventory <ArrowRight /></Link>}</div>
            {data.stockAlerts.length || data.expiringBatches.length ? <div className="queue-list">
              {data.stockAlerts.map((item) => <Link href="/admin/inventory" className="queue-item" key={item.id}><span className="avatar-chip"><Package /></span><span><b>{item.name}</b><small>{item.brand_name} · {item.sku}</small></span><StatusLabel tone={toneFor("stock", item.stock_status)} status={item.stock_status} /><strong>{item.stock_quantity}</strong></Link>)}
              {data.expiringBatches.map((batch) => <Link href="/admin/inventory" className="queue-item" key={batch.id}><span className="avatar-chip"><Stack /></span><span><b>{batch.product_name}</b><small>Batch {batch.batch_number} · {batch.quantity_remaining} units</small></span><StatusLabel tone={batch.days_remaining <= 30 ? "danger" : "warn"} status={`${batch.days_remaining} days`} /></Link>)}
            </div> : <EmptyState icon={CheckCircle} title="No inventory alerts" message={data.metrics.active_products ? "Stock and batch expiry levels are healthy." : "Add products and receive batches to begin stock monitoring."} />}
          </section>
        </div>

        <section className="card quick-actions-card">
          <div className="card-head"><div><h2>Operational shortcuts</h2><p>Common management actions</p></div></div>
          <div className="quick-actions">
            {can("catalogue") && <Link href="/admin/catalogue/new"><Package weight="duotone" /><span><b>Add a product</b><small>Create pricing and stock rules</small></span><ArrowRight /></Link>}
            {can("registrations") && <Link href="/admin"><UsersThree weight="duotone" /><span><b>Review applications</b><small>Verify partner credentials</small></span><ArrowRight /></Link>}
            {can("fulfilment") && <Link href="/admin/orders"><ShoppingCart weight="duotone" /><span><b>Process orders</b><small>Pick, dispatch, and invoice</small></span><ArrowRight /></Link>}
            {can("inventory") && <Link href="/admin/inventory"><Stack weight="duotone" /><span><b>Receive inventory</b><small>Register a traceable batch</small></span><ArrowRight /></Link>}
          </div>
        </section>
      </>}
    </ConsoleShell>
  );
}
