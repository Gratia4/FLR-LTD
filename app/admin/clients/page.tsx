"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Buildings, MagnifyingGlass, ShoppingCart, UsersThree, Wallet, WarningCircle, X } from "@phosphor-icons/react";
import { AdminShell } from "@/components/admin-shell";
import { apiRequest, ApiRequestError } from "@/lib/api";
import { useAdminSession } from "@/lib/use-admin-session";

type Client = {
  id: string; name: string; type: string; registration_number: string; tin: string; district: string; country: string;
  status: "APPROVED" | "SUSPENDED"; credit_limit_rwf: string; payment_terms_days: number; approved_at: string | null;
  contact: { fullName: string; email: string; phone: string; jobTitle: string }; order_count: number; lifetime_value_rwf: string;
};

const money = (value: string | number) => new Intl.NumberFormat("en-RW", { style: "currency", currency: "RWF", maximumFractionDigits: 0 }).format(Number(value));

export default function ClientsPage() {
  const { user, token, logout } = useAdminSession();
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Client | null>(null);
  const [creditLimit, setCreditLimit] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("30");
  const [status, setStatus] = useState<"APPROVED" | "SUSPENDED">("APPROVED");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadClients = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const result = await apiRequest<{ data: Client[] }>("/api/v1/admin/clients", { headers: { Authorization: `Bearer ${token}` } });
      setClients(result.data);
    } catch (cause) {
      setError(cause instanceof ApiRequestError ? cause.message : "Clients could not be loaded.");
    } finally { setLoading(false); }
  }, [token]);

  useEffect(() => { void loadClients(); }, [loadClients]);

  const openClient = (client: Client) => {
    setSelected(client); setCreditLimit(client.credit_limit_rwf); setPaymentTerms(String(client.payment_terms_days));
    setStatus(client.status); setReason(""); setError(""); setNotice("");
  };

  const saveClient = async () => {
    if (!token || !selected) return;
    setSaving(true); setError(""); setNotice("");
    try {
      await apiRequest(`/api/v1/admin/clients/${selected.id}`, {
        method: "PATCH", headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ creditLimitRwf: Number(creditLimit), paymentTermsDays: Number(paymentTerms), status, reason: reason || undefined }),
      });
      setNotice("Client account updated successfully.");
      await loadClients();
      setSelected(current => current ? { ...current, credit_limit_rwf: creditLimit, payment_terms_days: Number(paymentTerms), status } : null);
    } catch (cause) {
      setError(cause instanceof ApiRequestError ? cause.message : "The account could not be updated.");
    } finally { setSaving(false); }
  };

  const visible = useMemo(() => clients.filter(item => `${item.name} ${item.contact.fullName} ${item.contact.email} ${item.tin}`.toLowerCase().includes(search.toLowerCase())), [clients, search]);
  const totalValue = clients.reduce((sum, item) => sum + Number(item.lifetime_value_rwf), 0);

  return <AdminShell user={user} active="clients" onLogout={logout}>
    <section className="admin-content">
      <div className="admin-title"><div><h2>Wholesale clients</h2><p>Control account access, credit limits and commercial terms.</p></div></div>
      {error && <div className="admin-error"><WarningCircle />{error}</div>}
      {notice && <div className="admin-notice">{notice}</div>}
      <div className="metric-grid metric-three">
        <article><span className="green"><UsersThree /></span><div><small>Active clients</small><strong>{clients.filter(item => item.status === "APPROVED").length}</strong></div></article>
        <article><span className="amber"><ShoppingCart /></span><div><small>Total orders</small><strong>{clients.reduce((sum, item) => sum + item.order_count, 0)}</strong></div></article>
        <article><span className="blue"><Wallet /></span><div><small>Lifetime order value</small><strong className="metric-money">{money(totalValue)}</strong></div></article>
      </div>
      <section className="applications">
        <div className="table-tools"><b className="table-title">Client directory</b><label><MagnifyingGlass /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search clients" /></label></div>
        <div className="data-card-grid">{loading ? <div className="empty-state">Loading clients…</div> : visible.length === 0 ? <div className="empty-state">No approved clients yet.</div> : visible.map(client =>
          <article className="client-card" key={client.id}>
            <div className="client-card-head"><span><Buildings /></span><i className={`status ${client.status.toLowerCase()}`}>{client.status}</i></div>
            <h3>{client.name}</h3><small>{client.type.replaceAll("_", " ")} · {client.district}</small>
            <dl><div><dt>Contact</dt><dd>{client.contact.fullName}</dd></div><div><dt>Email</dt><dd>{client.contact.email}</dd></div><div><dt>Orders</dt><dd>{client.order_count}</dd></div><div><dt>Order value</dt><dd>{money(client.lifetime_value_rwf)}</dd></div><div><dt>Payment terms</dt><dd>{client.payment_terms_days} days</dd></div><div><dt>Credit limit</dt><dd>{money(client.credit_limit_rwf)}</dd></div></dl>
            <button className="text-action" onClick={() => openClient(client)}>Manage account →</button>
          </article>)}</div>
      </section>
    </section>

    {selected && <div className="drawer-backdrop" onMouseDown={() => setSelected(null)}>
      <aside className="admin-drawer" onMouseDown={event => event.stopPropagation()} aria-label="Manage client account">
        <button className="drawer-close" onClick={() => setSelected(null)} aria-label="Close"><X /></button>
        <span className="eyebrow">Client account</span><h2>{selected.name}</h2><p>{selected.contact.fullName} · {selected.contact.email}</p>
        <div className="drawer-summary"><span><small>Orders</small><b>{selected.order_count}</b></span><span><small>Lifetime value</small><b>{money(selected.lifetime_value_rwf)}</b></span></div>
        <div className="form-stack">
          <label>Credit limit (RWF)<input type="number" min="0" value={creditLimit} onChange={event => setCreditLimit(event.target.value)} /></label>
          <label>Payment terms<select value={paymentTerms} onChange={event => setPaymentTerms(event.target.value)}><option value="0">Due immediately</option><option value="15">15 days</option><option value="30">30 days</option><option value="45">45 days</option><option value="60">60 days</option><option value="90">90 days</option></select></label>
          <label>Account status<select value={status} onChange={event => setStatus(event.target.value as "APPROVED" | "SUSPENDED")}><option value="APPROVED">Active</option><option value="SUSPENDED">Suspended</option></select></label>
          {status === "SUSPENDED" && <label>Suspension reason<textarea value={reason} onChange={event => setReason(event.target.value)} placeholder="Required for the audit trail" /></label>}
        </div>
        <button className="primary-action full" disabled={saving || !creditLimit} onClick={saveClient}>{saving ? "Saving…" : "Save account changes"}</button>
      </aside>
    </div>}
  </AdminShell>;
}
