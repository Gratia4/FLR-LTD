"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Archive as ArchiveBox, ArrowClockwise, ClockCountdown, CurrencyCircleDollar, MagnifyingGlass, Package, Plus, Siren, WarningCircle } from "@phosphor-icons/react";
import { ConsoleShell } from "@/components/console-shell";
import { Banner, EmptyState, Metric, SectionLabel, Sheet, SkeletonRows, StatusPill, useToast } from "@/components/legacy-ui";
import { api, errorMessage } from "@/lib/api";
import { count, date, dateTime, humanise, moneyCompact, relativeDate } from "@/lib/format";
import { useAdminSession } from "@/lib/use-session";

type Product = { id:string; name:string; sku:string; brand_name:string; stock_quantity:number; stock_status:string };
type Batch = { id:string; product_id:string; batch_number:string; expiry_date:string; manufactured_on:string|null; quantity_received:number; quantity_remaining:number; supplier:string|null; received_at:string; recalled_at:string|null; recall_reason:string|null; days_remaining:number; product_name:string; sku:string; brand_name:string };
type Inventory = {
  metrics:{active_products:number;out_of_stock:number;low_stock:number;stock_value_rwf:string;expiring_batches:number;expired_batches:number;expired_value_rwf:string};
  lowStock:Array<{id:string;name:string;sku:string;stock_quantity:number;reorder_level:number;stock_status:string;brand_name:string}>;
  expiringBatches:Array<{id:string;batch_number:string;expiry_date:string;quantity_remaining:number;days_remaining:number;product_name:string;sku:string}>;
  expiredBatches:Array<{id:string;batch_number:string;expiry_date:string;quantity_remaining:number;product_name:string;sku:string}>;
};

export default function InventoryPage() {
  const { user, logout, can } = useAdminSession();
  const toast = useToast();
  const [data, setData] = useState<Inventory|null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selected, setSelected] = useState<Batch|null>(null);
  const [receiving, setReceiving] = useState(false);
  const [action, setAction] = useState<"recall"|"write-off"|null>(null);
  const [reason, setReason] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    setLoading(true); setError("");
    Promise.all([
      api.get<{data:Inventory}>("/api/v1/admin/inventory"),
      api.get<{data:Batch[]}>("/api/v1/admin/batches", { query: { includeDepleted: true } }),
      api.get<{data:Product[]}>("/api/v1/admin/products", { query: { status: "active" } }),
    ]).then(([inventory, batchResult, productResult]) => {
      setData(inventory.data); setBatches(batchResult.data); setProducts(productResult.data);
    }).catch((cause) => setError(errorMessage(cause, "Inventory could not be loaded."))).finally(() => setLoading(false));
  }, []);
  useEffect(load, [load]);

  const visible = useMemo(() => batches.filter((item) => `${item.product_name} ${item.sku} ${item.batch_number} ${item.supplier??""}`.toLowerCase().includes(search.toLowerCase())), [batches, search]);

  async function receive(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true);
    const form = new FormData(event.currentTarget);
    try {
      await api.post("/api/v1/admin/batches", {
        productId: form.get("productId"), batchNumber: form.get("batchNumber"), expiryDate: form.get("expiryDate"),
        manufacturedOn: form.get("manufacturedOn") || undefined, quantity: Number(form.get("quantity")), supplier: form.get("supplier") || undefined,
      });
      toast.success("Batch received and stock balance updated."); setReceiving(false); load();
    } catch (cause) { toast.error(errorMessage(cause)); } finally { setSaving(false); }
  }

  async function processBatch() {
    if (!selected || !action || !reason.trim()) return;
    setSaving(true);
    try {
      const suffix = action === "recall" ? "recall" : "write-off";
      const result = await api.post<{data:{quarantined?:number;writtenOff?:number;affected?:unknown[]}}>(`/api/v1/admin/batches/${selected.id}/${suffix}`, { reason: reason.trim() });
      const quantity = result.data.quarantined ?? result.data.writtenOff ?? 0;
      const affected = result.data.affected?.length ?? 0;
      toast.success(action === "recall" ? `${quantity} units quarantined${affected ? `; ${affected} affected order(s) identified` : ""}.` : `${quantity} units written off.`);
      setSelected(null); setAction(null); setReason(""); load();
    } catch (cause) { toast.error(errorMessage(cause)); } finally { setSaving(false); }
  }

  return <ConsoleShell user={user} active="inventory" onLogout={logout} can={can}>
    <div className="page-head"><div><h1>Batches & inventory</h1><p>Receive goods, monitor expiry, quarantine recalls, and maintain a traceable stock ledger.</p></div><div className="page-actions"><button className="btn btn-secondary" onClick={load}><ArrowClockwise/>Refresh</button><button className="btn btn-primary" onClick={() => setReceiving(true)}><Plus/>Receive batch</button></div></div>
    {error && <Banner tone="error" action={<button className="btn btn-secondary" onClick={load}>Retry</button>}>{error}</Banner>}
    <div className="metric-row cols-4"><Metric icon={Package} label="Active products" value={data?count(data.metrics.active_products):"—"}/><Metric icon={WarningCircle} label="Low / out of stock" value={data?count(data.metrics.low_stock+data.metrics.out_of_stock):"—"} accent="gold"/><Metric icon={ClockCountdown} label="Expiring / expired" value={data?count(data.metrics.expiring_batches+data.metrics.expired_batches):"—"} note={data?.metrics.expired_batches?`${data.metrics.expired_batches} already expired`:undefined} accent="danger"/><Metric icon={CurrencyCircleDollar} label="Stock value" value={data?moneyCompact(data.metrics.stock_value_rwf):"—"} accent="blue"/></div>
    <div className="split split-wide"><section className="card"><header className="card-head"><div><h2>Batch register</h2><p>Active, depleted, recalled, and expiring stock.</p></div></header><div className="toolbar"><label className="search-field"><MagnifyingGlass/><input value={search} onChange={(event)=>setSearch(event.target.value)} placeholder="Search product, SKU, batch, or supplier"/></label></div>{loading?<SkeletonRows/>:visible.length?<div className="table-wrap"><table className="table"><thead><tr><th>Product / batch</th><th>Expiry</th><th className="num">Received</th><th className="num">Remaining</th><th>Status</th></tr></thead><tbody>{visible.map((item)=><tr className="is-clickable" key={item.id} onClick={()=>{setSelected(item);setAction(null);setReason("")}}><td className="cell-strong">{item.product_name}<span className="cell-sub">{item.sku} · Batch {item.batch_number}</span></td><td>{date(item.expiry_date)}<span className="cell-sub">{relativeDate(item.expiry_date)}</span></td><td className="num">{count(item.quantity_received)}</td><td className="num">{count(item.quantity_remaining)}</td><td>{item.recalled_at?<StatusPill tone="danger">Recalled</StatusPill>:item.quantity_remaining===0?<StatusPill tone="neutral">Depleted</StatusPill>:item.days_remaining<0?<StatusPill tone="danger">Expired</StatusPill>:item.days_remaining<=90?<StatusPill tone="warn">Expiring</StatusPill>:<StatusPill tone="ok">Available</StatusPill>}</td></tr>)}</tbody></table></div>:<EmptyState icon={ArchiveBox} title="No batches found" message="Receive the first batch to begin stock traceability."/>}</section>
      <section className="card"><header className="card-head"><div><h2>Reorder attention</h2><p>Products at or below their reorder threshold.</p></div></header>{!data?<SkeletonRows rows={4}/>:data.lowStock.length?<div className="queue-list">{data.lowStock.map((item)=><div className="alert-line" key={item.id}><span><WarningCircle/></span><span><b>{item.name}</b><small>{item.brand_name} · {item.sku} · reorder at {item.reorder_level}</small></span><strong>{item.stock_quantity}</strong></div>)}</div>:<EmptyState icon={Package} title="Stock levels are healthy" message="No active product currently needs replenishment."/>}</section></div>

    {receiving&&<Sheet eyebrow="Goods received" title="Receive a stock batch" subtitle="The quantity will be added to on-hand stock with a permanent ledger entry." onClose={()=>setReceiving(false)} footer={<button form="receive-batch" className="btn btn-primary" disabled={saving}>{saving?"Receiving…":"Receive stock"}</button>}><form id="receive-batch" className="form-grid" onSubmit={receive}><label className="field span-2"><span>Product</span><select className="select" name="productId" required defaultValue=""><option value="" disabled>Select a product</option>{products.map((product)=><option value={product.id} key={product.id}>{product.brand_name} · {product.name} ({product.sku})</option>)}</select></label><label className="field"><span>Batch number</span><input className="input" name="batchNumber" required maxLength={80}/></label><label className="field"><span>Quantity received</span><input className="input" name="quantity" type="number" min="1" required/></label><label className="field"><span>Expiry date</span><input className="input" name="expiryDate" type="date" min={new Date(Date.now()+86400000).toISOString().slice(0,10)} required/></label><label className="field"><span>Manufactured on</span><input className="input" name="manufacturedOn" type="date"/></label><label className="field span-2"><span>Supplier</span><input className="input" name="supplier" maxLength={200} placeholder="Manufacturer or authorised distributor"/></label></form></Sheet>}

    {selected&&<Sheet eyebrow="Batch traceability" title={`${selected.product_name} · ${selected.batch_number}`} subtitle={`${selected.brand_name} · ${selected.sku}`} onClose={()=>setSelected(null)} footer={selected.quantity_remaining>0&&!selected.recalled_at?<>{action?<><button className="btn btn-secondary" onClick={()=>{setAction(null);setReason("")}}>Cancel</button><button className="btn btn-danger" disabled={saving||!reason.trim()} onClick={processBatch}>{saving?"Processing…":action==="recall"?"Confirm recall":"Confirm write-off"}</button></>:<><button className="btn btn-danger-soft" onClick={()=>setAction("write-off")}><ArchiveBox/>Write off</button><button className="btn btn-danger" onClick={()=>setAction("recall")}><Siren/>Recall batch</button></>}</>:undefined}>
      <div className="detail-grid"><div><small>Received</small><b>{count(selected.quantity_received)} units</b></div><div><small>Remaining</small><b>{count(selected.quantity_remaining)} units</b></div><div><small>Expiry</small><b>{date(selected.expiry_date)} · {relativeDate(selected.expiry_date)}</b></div><div><small>Received at</small><b>{dateTime(selected.received_at)}</b></div><div><small>Supplier</small><b>{selected.supplier||"Not recorded"}</b></div><div><small>Status</small><b>{selected.recalled_at?"Recalled":selected.quantity_remaining?"Available":"Depleted"}</b></div></div>
      {selected.recalled_at&&<Banner tone="error" title="Batch recalled">{selected.recall_reason||"No recall reason recorded."}</Banner>}
      {action&&<><SectionLabel>{action==="recall"?"Regulatory recall":"Inventory write-off"}</SectionLabel><Banner tone={action==="recall"?"error":"warn"}>{action==="recall"?"Remaining units will be quarantined and affected customer orders will be identified.":"All remaining units in this batch will be removed from sellable stock."}</Banner><label className="field"><span>Reason</span><textarea className="textarea" rows={4} value={reason} onChange={(event)=>setReason(event.target.value)} placeholder="Required for the audit trail" autoFocus/></label></>}
    </Sheet>}
  </ConsoleShell>;
}
