"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { MagnifyingGlass, Package, Plus, Stack, Tag, WarningCircle, X } from "@phosphor-icons/react";
import { AdminShell } from "@/components/admin-shell";
import { apiRequest, ApiRequestError } from "@/lib/api";
import { useAdminSession } from "@/lib/use-admin-session";

type Product = { id:string; brand_id:string; sku:string; name:string; size:string; unit_price_rwf:string; minimum_order_quantity:number; case_size:number; stock_quantity:number; stock_status:"IN_STOCK"|"LOW_STOCK"|"OUT_OF_STOCK"|"PRE_ORDER"; is_active:boolean; brand_name:string; brand_slug:string };
type Brand = { id:string; slug:string; name:string; category:string };
const money = (value:string|number) => new Intl.NumberFormat("en-RW",{style:"currency",currency:"RWF",maximumFractionDigits:0}).format(Number(value));

export default function CataloguePage() {
  const { user, token, logout } = useAdminSession();
  const [products,setProducts] = useState<Product[]>([]); const [brands,setBrands] = useState<Brand[]>([]);
  const [search,setSearch] = useState(""); const [brand,setBrand] = useState(""); const [selected,setSelected] = useState<Product|null>(null);
  const [price,setPrice] = useState(""); const [moq,setMoq] = useState(""); const [caseSize,setCaseSize] = useState(""); const [stock,setStock] = useState("");
  const [stockStatus,setStockStatus] = useState<Product["stock_status"]>("IN_STOCK"); const [isActive,setIsActive] = useState(true);
  const [loading,setLoading] = useState(true); const [saving,setSaving] = useState(false); const [error,setError] = useState(""); const [notice,setNotice] = useState("");

  const load = useCallback(async () => {
    if (!token) return; setLoading(true);
    try { const [productResult,brandResult] = await Promise.all([
      apiRequest<{data:Product[]}>("/api/v1/admin/products",{headers:{Authorization:`Bearer ${token}`}}),
      apiRequest<{data:Brand[]}>("/api/v1/catalog/brands"),
    ]); setProducts(productResult.data); setBrands(brandResult.data); }
    catch(cause){ setError(cause instanceof ApiRequestError?cause.message:"Catalogue could not be loaded."); }
    finally { setLoading(false); }
  },[token]);
  useEffect(()=>{void load();},[load]);

  const openProduct=(item:Product)=>{setSelected(item);setPrice(item.unit_price_rwf);setMoq(String(item.minimum_order_quantity));setCaseSize(String(item.case_size));setStock(String(item.stock_quantity));setStockStatus(item.stock_status);setIsActive(item.is_active);setError("");setNotice("");};
  const save=async()=>{if(!token||!selected)return;setSaving(true);setError("");setNotice("");try{await apiRequest(`/api/v1/admin/products/${selected.id}`,{method:"PATCH",headers:{Authorization:`Bearer ${token}`},body:JSON.stringify({unitPriceRwf:Number(price),minimumOrderQuantity:Number(moq),caseSize:Number(caseSize),stockQuantity:Number(stock),stockStatus,isActive})});setNotice("Product inventory and pricing updated.");await load();setSelected(null);}catch(cause){setError(cause instanceof ApiRequestError?cause.message:"Product could not be updated.");}finally{setSaving(false);}};
  const visible=useMemo(()=>products.filter(item=>(!brand||item.brand_slug===brand)&&`${item.name} ${item.brand_name} ${item.sku}`.toLowerCase().includes(search.toLowerCase())),[products,brand,search]);

  return <AdminShell user={user} active="catalogue" onLogout={logout}>
    <section className="admin-content">
      <div className="admin-title"><div><h2>Product catalogue</h2><p>Manage wholesale availability, pricing and order rules.</p></div><Link className="primary-action" href="/admin/catalogue/new"><Plus/>Add product</Link></div>
      {error&&<div className="admin-error"><WarningCircle/>{error}</div>}{notice&&<div className="admin-notice">{notice}</div>}
      <div className="metric-grid metric-three"><article><span className="green"><Package/></span><div><small>Active products</small><strong>{products.filter(item=>item.is_active).length}</strong></div></article><article><span className="blue"><Tag/></span><div><small>Active brands</small><strong>{brands.length}</strong></div></article><article><span className="amber"><Stack/></span><div><small>Units in stock</small><strong>{products.reduce((sum,item)=>sum+item.stock_quantity,0)}</strong></div></article></div>
      <section className="applications"><div className="table-tools"><select value={brand} onChange={event=>setBrand(event.target.value)}><option value="">All brands</option>{brands.map(item=><option value={item.slug} key={item.id}>{item.name}</option>)}</select><label><MagnifyingGlass/><input value={search} onChange={event=>setSearch(event.target.value)} placeholder="Search product, brand or SKU"/></label></div>
        <div className="catalogue-table"><div className="catalogue-row catalogue-head"><span>Product</span><span>Brand</span><span>Price</span><span>MOQ / Case</span><span>Stock</span></div>{loading?<div className="empty-state">Loading catalogue…</div>:visible.length===0?<div className="empty-state">No products have been added yet.</div>:visible.map(item=><button className={`catalogue-row catalogue-button ${!item.is_active?"inactive":""}`} key={item.id} onClick={()=>openProduct(item)}><span><b>{item.name}</b><small>{item.sku} · {item.size}{!item.is_active?" · INACTIVE":""}</small></span><span>{item.brand_name}</span><span><b>{money(item.unit_price_rwf)}</b></span><span>{item.minimum_order_quantity} / {item.case_size}</span><span><i className={`stock ${item.stock_status.toLowerCase()}`}>{item.stock_status.replaceAll("_"," ")}</i><small>{item.stock_quantity} units</small></span></button>)}</div>
      </section>
    </section>
    {selected&&<div className="drawer-backdrop" onMouseDown={()=>setSelected(null)}><aside className="admin-drawer" onMouseDown={event=>event.stopPropagation()} aria-label="Edit product"><button className="drawer-close" onClick={()=>setSelected(null)} aria-label="Close"><X/></button><span className="eyebrow">Catalogue item</span><h2>{selected.name}</h2><p>{selected.brand_name} · {selected.sku} · {selected.size}</p><div className="form-stack"><label>Wholesale price (RWF)<input type="number" min="0" value={price} onChange={event=>setPrice(event.target.value)}/></label><div className="form-pair"><label>Minimum order<input type="number" min="1" value={moq} onChange={event=>setMoq(event.target.value)}/></label><label>Case size<input type="number" min="1" value={caseSize} onChange={event=>setCaseSize(event.target.value)}/></label></div><label>Stock quantity<input type="number" min="0" value={stock} onChange={event=>setStock(event.target.value)}/></label><label>Stock status<select value={stockStatus} onChange={event=>setStockStatus(event.target.value as Product["stock_status"])}><option value="IN_STOCK">In stock</option><option value="LOW_STOCK">Low stock</option><option value="OUT_OF_STOCK">Out of stock</option><option value="PRE_ORDER">Pre-order</option></select></label><label className="switch-line"><input type="checkbox" checked={isActive} onChange={event=>setIsActive(event.target.checked)}/><span>Visible to wholesale customers</span></label></div><button className="primary-action full" disabled={saving||!price||!moq||!caseSize} onClick={save}>{saving?"Saving…":"Save product changes"}</button></aside></div>}
  </AdminShell>;
}
