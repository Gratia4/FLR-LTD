"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Buildings, MagnifyingGlass, NotePencil, ShoppingCart, UsersThree, Wallet, WarningCircle } from "@phosphor-icons/react";
import { ConsoleShell } from "@/components/console-shell";
import { Banner, EmptyState, Metric, SectionLabel, Sheet, SkeletonRows, StatusLabel, StatusPill, useToast } from "@/components/legacy-ui";
import { api, errorMessage } from "@/lib/api";
import { date, dateTime, humanise, money, moneyCompact, toneFor } from "@/lib/format";
import { useAdminSession } from "@/lib/use-session";

type Contact = { fullName: string; email: string; phone: string; jobTitle: string };
type Client = {
  id: string; name: string; type: string; registration_number: string; tin: string; district: string; country: string;
  status: "APPROVED" | "SUSPENDED"; credit_limit_rwf: string; payment_terms_days: number; credit_hold: boolean;
  price_tier_id: string | null; price_tier: string | null; discount_percent: string | null; approved_at: string | null;
  account_manager_id: string | null; account_manager_name: string | null; contact: Contact; order_count: number;
  lifetime_value_rwf: string; last_order_at: string | null; outstanding_rwf: string; overdue_rwf: string;
};
type Tier = { id: string; code: string; name: string; discount_percent: string; minimum_monthly_rwf: string; is_default: boolean };
type Manager = { id: string; full_name: string; email: string; role: string };
type Note = { id: string; note: string; created_at: string; author_name: string | null; author_role: string | null };
type Detail = Client & {
  street_address: string; vat_registration_number: string | null; pharmacy_licence_number: string | null;
  operating_licence_number: string; status_reason: string | null; assigned_account_manager_id: string | null;
  credit: { creditLimitRwf: number; paymentTermsDays: number; creditHold: boolean; outstandingRwf: number; overdueRwf: number; availableRwf: number };
  recentOrders: Array<{ id: string; reference: string; status: string; total_rwf: string; created_at: string }>;
  invoices: Array<{ id: string; reference: string; status: string; total_rwf: string; amount_paid_rwf: string; due_at: string; issued_at: string }>;
  addresses: Array<{ id: string; label: string; recipient_name: string; street_address: string; district: string; country: string; is_default: boolean }>;
  notes: Note[];
};

export default function ClientsPage() {
  const { user, logout, can } = useAdminSession();
  const toast = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [selected, setSelected] = useState<Client | null>(null);
  const [detail, setDetail] = useState<Detail | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    Promise.all([
      api.get<{ data: Client[] }>("/api/v1/admin/clients"),
      api.get<{ data: Tier[] }>("/api/v1/admin/clients/tiers"),
      api.get<{ data: Manager[] }>("/api/v1/admin/clients/account-managers"),
    ])
      .then(([clientResult, tierResult, managerResult]) => {
        setClients(clientResult.data);
        setTiers(tierResult.data);
        setManagers(managerResult.data);
      })
      .catch((cause) => setError(errorMessage(cause, "Clients could not be loaded.")))
      .finally(() => setLoading(false));
  }, []);
  useEffect(load, [load]);

  const open = useCallback((client: Client) => {
    setSelected(client);
    setDetail(null);
    setDetailLoading(true);
    api.get<{ data: Detail }>(`/api/v1/admin/clients/${client.id}`)
      .then((result) => setDetail({
        ...result.data,
        order_count: client.order_count,
        lifetime_value_rwf: client.lifetime_value_rwf,
        last_order_at: client.last_order_at,
        outstanding_rwf: client.outstanding_rwf,
        overdue_rwf: client.overdue_rwf,
        price_tier_id: client.price_tier_id,
      }))
      .catch((cause) => toast.error(errorMessage(cause)))
      .finally(() => setDetailLoading(false));
  }, [toast]);

  const visible = useMemo(() => clients.filter((item) =>
    (!filter || item.status === filter)
    && `${item.name} ${item.contact.fullName} ${item.contact.email} ${item.tin}`.toLowerCase().includes(search.toLowerCase()),
  ), [clients, search, filter]);
  const totalValue = clients.reduce((sum, item) => sum + Number(item.lifetime_value_rwf), 0);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!detail) return;
    setSaving(true);
    const form = new FormData(event.currentTarget);
    const status = String(form.get("status"));
    try {
      await api.patch(`/api/v1/admin/clients/${detail.id}`, {
        creditLimitRwf: Number(form.get("creditLimitRwf")),
        paymentTermsDays: Number(form.get("paymentTermsDays")),
        priceTierId: form.get("priceTierId") || null,
        accountManagerId: form.get("accountManagerId") || null,
        creditHold: form.get("creditHold") === "on",
        status,
        reason: status === "SUSPENDED" ? form.get("reason") || undefined : undefined,
      });
      toast.success("Client terms, ownership, and access updated.");
      setSelected(null);
      setDetail(null);
      load();
    } catch (cause) {
      toast.error(errorMessage(cause));
    } finally {
      setSaving(false);
    }
  }

  async function addNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!detail) return;
    const form = new FormData(event.currentTarget);
    setSaving(true);
    try {
      const result = await api.post<{ data: Note }>(`/api/v1/admin/clients/${detail.id}/notes`, { note: form.get("note") });
      setDetail({ ...detail, notes: [result.data, ...detail.notes] });
      event.currentTarget.reset();
      toast.success("Internal account note added.");
    } catch (cause) {
      toast.error(errorMessage(cause));
    } finally {
      setSaving(false);
    }
  }

  return (
    <ConsoleShell user={user} active="clients" onLogout={logout} can={can}>
      <div className="page-head"><div><h1>Wholesale clients</h1><p>Manage access, ownership, contract pricing, credit exposure, and account history.</p></div></div>
      {error && <Banner tone="error" action={<button className="btn btn-secondary" onClick={load}>Retry</button>}>{error}</Banner>}
      <div className="metric-row cols-4">
        <Metric icon={UsersThree} label="Active clients" value={clients.filter((item) => item.status === "APPROVED").length} />
        <Metric icon={ShoppingCart} label="Total orders" value={clients.reduce((sum, item) => sum + item.order_count, 0)} accent="blue" />
        <Metric icon={Wallet} label="Lifetime order value" value={moneyCompact(totalValue)} accent="gold" />
        <Metric icon={WarningCircle} label="Overdue exposure" value={moneyCompact(clients.reduce((sum, item) => sum + Number(item.overdue_rwf), 0))} accent="danger" />
      </div>
      <section className="card">
        <div className="toolbar"><label className="search-field"><MagnifyingGlass /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search business, contact, email, or TIN" /></label><select className="select" value={filter} onChange={(event) => setFilter(event.target.value)}><option value="">All accounts</option><option value="APPROVED">Approved</option><option value="SUSPENDED">Suspended</option></select></div>
        {loading ? <SkeletonRows /> : visible.length ? <div className="table-wrap"><table className="table"><thead><tr><th>Business</th><th>Contact / owner</th><th>Pricing</th><th className="num">Orders / value</th><th className="num">Exposure</th><th>Status</th></tr></thead><tbody>{visible.map((client) => <tr className="is-clickable" key={client.id} onClick={() => open(client)}><td><div className="cell-with-avatar"><span className="avatar-chip"><Buildings /></span><span className="cell-strong">{client.name}<span className="cell-sub">{humanise(client.type)} · TIN {client.tin}</span></span></div></td><td>{client.contact.fullName}<span className="cell-sub">{client.account_manager_name ? `FLR owner: ${client.account_manager_name}` : "No account manager"}</span></td><td>{client.price_tier || "Standard"}<span className="cell-sub">{Number(client.discount_percent || 0)}% discount · {client.payment_terms_days} days</span></td><td className="num">{client.order_count}<span className="cell-sub">{money(client.lifetime_value_rwf)}</span></td><td className="num">{money(client.outstanding_rwf)}<span className="cell-sub">{Number(client.overdue_rwf) > 0 ? `${money(client.overdue_rwf)} overdue` : "No overdue balance"}</span></td><td><StatusLabel tone={toneFor("account", client.status)} status={client.status} />{client.credit_hold && <span className="cell-sub">Credit hold</span>}</td></tr>)}</tbody></table></div> : <EmptyState icon={Buildings} title="No clients found" message="Approved wholesale partners will appear here." />}
      </section>

      {selected && <Sheet wide eyebrow="Client account" title={selected.name} subtitle={`${selected.contact.fullName} · ${selected.contact.email}`} onClose={() => { setSelected(null); setDetail(null); }} footer={detail ? <button form="client-edit" className="btn btn-primary" disabled={saving}>{saving ? "Saving…" : "Save account terms"}</button> : undefined}>
        {detailLoading ? <SkeletonRows rows={5} /> : detail && <>
          <div className="detail-grid"><div><small>Account status</small><b>{humanise(detail.status)}</b></div><div><small>Account manager</small><b>{detail.account_manager_name || "Unassigned"}</b></div><div><small>Credit available</small><b>{money(detail.credit.availableRwf)}</b></div><div><small>Outstanding</small><b>{money(detail.credit.outstandingRwf)}</b></div><div><small>Last order</small><b>{dateTime(detail.last_order_at)}</b></div><div><small>Approved</small><b>{date(detail.approved_at)}</b></div></div>
          {detail.credit.overdueRwf > 0 && <Banner tone="error" title="Overdue balance">{money(detail.credit.overdueRwf)} is overdue. Ordering is automatically blocked until cleared.</Banner>}
          <SectionLabel>Commercial terms & access</SectionLabel>
          <form id="client-edit" className="form-grid" onSubmit={save}>
            <label className="field"><span>Account manager</span><select className="select" name="accountManagerId" defaultValue={detail.assigned_account_manager_id ?? ""}><option value="">Unassigned</option>{managers.map((manager) => <option value={manager.id} key={manager.id}>{manager.full_name} · {humanise(manager.role)}</option>)}</select></label>
            <label className="field"><span>Price tier</span><select className="select" name="priceTierId" defaultValue={detail.price_tier_id ?? ""}><option value="">Default pricing</option>{tiers.map((tier) => <option value={tier.id} key={tier.id}>{tier.name} · {Number(tier.discount_percent)}% discount</option>)}</select></label>
            <label className="field"><span>Credit limit (RWF)</span><input className="input" name="creditLimitRwf" type="number" min="0" defaultValue={detail.credit_limit_rwf} required /></label>
            <label className="field"><span>Payment terms</span><select className="select" name="paymentTermsDays" defaultValue={String(detail.payment_terms_days)}><option value="0">Prepayment</option>{[15, 30, 45, 60, 90].map((days) => <option key={days} value={days}>{days} days</option>)}</select></label>
            <label className="field"><span>Account status</span><select className="select" name="status" defaultValue={detail.status}><option value="APPROVED">Approved</option><option value="SUSPENDED">Suspended</option></select></label><div />
            <label className="check-line span-2"><input name="creditHold" type="checkbox" defaultChecked={detail.credit_hold} /><span>Place account on credit hold (login remains available; checkout is blocked)</span></label>
            <label className="field span-2"><span>Suspension reason (required when suspending)</span><textarea className="textarea" name="reason" defaultValue={detail.status_reason ?? ""} /></label>
          </form>

          <SectionLabel>Internal account notes</SectionLabel>
          <form className="note-composer" onSubmit={addNote}><textarea className="textarea" name="note" minLength={2} maxLength={2000} required placeholder="Add a private sales, service, or compliance note…" /><button className="btn btn-secondary" disabled={saving}><NotePencil /> Add note</button></form>
          {detail.notes.length ? <div className="note-list">{detail.notes.map((note) => <article key={note.id}><p>{note.note}</p><small>{note.author_name || "Former staff member"} · {dateTime(note.created_at)}</small></article>)}</div> : <Banner tone="info">No internal notes have been added.</Banner>}

          <SectionLabel>Recent orders</SectionLabel>
          {detail.recentOrders.length ? <div className="table-wrap"><table className="table"><thead><tr><th>Order</th><th>Date</th><th className="num">Total</th><th>Status</th></tr></thead><tbody>{detail.recentOrders.map((order) => <tr key={order.id}><td className="cell-strong">{order.reference}</td><td>{date(order.created_at)}</td><td className="num">{money(order.total_rwf)}</td><td><StatusLabel tone={toneFor("order", order.status)} status={order.status} /></td></tr>)}</tbody></table></div> : <EmptyState icon={ShoppingCart} title="No orders" message="This client has not placed an order yet." />}
          <SectionLabel>Delivery addresses</SectionLabel>
          {detail.addresses.length ? <div className="queue-list">{detail.addresses.map((address) => <div className="queue-item" key={address.id}><span><b>{address.label}{address.is_default ? " · Default" : ""}</b><small>{address.recipient_name} · {address.street_address}, {address.district}, {address.country}</small></span>{address.is_default && <StatusPill tone="ok">Default</StatusPill>}</div>)}</div> : <Banner tone="info">No delivery addresses saved.</Banner>}
        </>}
      </Sheet>}
    </ConsoleShell>
  );
}
