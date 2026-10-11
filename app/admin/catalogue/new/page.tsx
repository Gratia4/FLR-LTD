"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { ArrowLeft, CheckCircle, Package, Plus, Trash } from "@phosphor-icons/react";
import { ConsoleShell } from "@/components/console-shell";
import { Banner, SectionLabel, useToast } from "@/components/legacy-ui";
import { api, errorMessage } from "@/lib/api";
import { useAdminSession } from "@/lib/use-session";
import { hasPendingUploads, ImageUploader } from "@/components/admin/image-uploader";

type Brand = { id: string; name: string };
type PriceBreak = { id: number; minQuantity: string; unitPriceRwf: string };

export default function NewProductPage() {
  const { user, logout, can } = useAdminSession();
  const toast = useToast();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [priceBreaks, setPriceBreaks] = useState<PriceBreak[]>([]);

  useEffect(() => {
    api
      .get<{ data: Brand[] }>("/api/v1/catalog/brands")
      .then((result) => setBrands(result.data))
      .catch((cause) => setError(errorMessage(cause, "Brands could not be loaded.")));
  }, []);

  function addPriceBreak() {
    setPriceBreaks((items) => [...items, { id: Date.now(), minQuantity: "", unitPriceRwf: "" }]);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (hasPendingUploads(event.currentTarget)) {
      setError("Please wait for the product images to finish uploading.");
      return;
    }
    setSaving(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const imageUrls = String(form.get("imageUrls") || "")
      .split("\n")
      .map((value) => value.trim())
      .filter(Boolean);
    const breaks = priceBreaks.map((item) => ({
      minQuantity: Number(item.minQuantity),
      unitPriceRwf: Number(item.unitPriceRwf),
    }));

    try {
      await api.post("/api/v1/admin/products", {
        brandId: form.get("brandId"),
        sku: form.get("sku"),
        brandReference: form.get("brandReference") || undefined,
        name: form.get("name"),
        category: form.get("category") || undefined,
        size: form.get("size"),
        descriptionEn: form.get("descriptionEn") || undefined,
        descriptionFr: form.get("descriptionFr") || undefined,
        imageUrls,
        unitPriceRwf: Number(form.get("unitPriceRwf")),
        vatRate: Number(form.get("vatRate")),
        minimumOrderQuantity: Number(form.get("minimumOrderQuantity")),
        caseSize: Number(form.get("caseSize")),
        stockQuantity: Number(form.get("stockQuantity")),
        reorderLevel: Number(form.get("reorderLevel")),
        stockStatus: form.get("stockStatus"),
        shelfLifeDays: form.get("shelfLifeDays") ? Number(form.get("shelfLifeDays")) : undefined,
        requiresPrescription: form.get("requiresPrescription") === "on",
        coldChain: form.get("coldChain") === "on",
        controlledSubstance: form.get("controlledSubstance") === "on",
        isActive: form.get("isActive") === "on",
        priceBreaks: breaks,
      });
      toast.success("Product created and published to the wholesale catalogue.");
      window.location.assign("/admin/catalogue");
    } catch (cause) {
      setError(errorMessage(cause, "Product could not be created."));
      setSaving(false);
    }
  }

  return (
    <ConsoleShell user={user} active="new-product" onLogout={logout} can={can}>
      <div className="page-head">
        <div>
          <Link className="back-link" href="/admin/catalogue"><ArrowLeft /> Back to catalogue</Link>
          <h1>Add a wholesale product</h1>
          <p>Create the catalogue record, commercial rules, stock controls, and compliance handling in one place.</p>
        </div>
      </div>

      {error && <Banner tone="error">{error}</Banner>}
      {!can("catalogue") && <Banner tone="error">Your role cannot create catalogue products.</Banner>}

      <form className="card form-page" onSubmit={submit}>
        <div className="card-head"><div><h2>Product record</h2><p>Fields marked required must be completed before publishing.</p></div><Package size={24} /></div>
        <div className="form-grid form-page-grid">
          <SectionLabel>Identity & content</SectionLabel>
          <label className="field"><span>Brand *</span><select className="select" name="brandId" required defaultValue=""><option value="" disabled>Select brand</option>{brands.map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}</select></label>
          <label className="field"><span>Product name *</span><input className="input" name="name" required minLength={2} /></label>
          <label className="field"><span>FLR SKU *</span><input className="input" name="sku" required placeholder="FLR-00001" /></label>
          <label className="field"><span>Brand reference</span><input className="input" name="brandReference" /></label>
          <label className="field"><span>Category</span><input className="input" name="category" placeholder="Dermocosmetics" /></label>
          <label className="field"><span>Pack / size *</span><input className="input" name="size" required placeholder="400 ml" /></label>
          <label className="field span-2"><span>English description</span><textarea className="textarea" name="descriptionEn" rows={4} /></label>
          <label className="field span-2"><span>French description</span><textarea className="textarea" name="descriptionFr" rows={4} /></label>
          <div className="field span-2"><span>Product images</span><ImageUploader name="imageUrls" disabled={!can("catalogue")} /></div>

          <SectionLabel>Wholesale & stock rules</SectionLabel>
          <label className="field"><span>Unit price (RWF) *</span><input className="input" name="unitPriceRwf" type="number" min="0" step="1" required /></label>
          <label className="field"><span>VAT rate</span><select className="select" name="vatRate" defaultValue="0.18"><option value="0.18">Standard · 18%</option><option value="0">Exempt · 0%</option></select></label>
          <label className="field"><span>Minimum order quantity *</span><input className="input" name="minimumOrderQuantity" type="number" min="1" defaultValue="1" required /></label>
          <label className="field"><span>Case size *</span><input className="input" name="caseSize" type="number" min="1" defaultValue="1" required /></label>
          <label className="field"><span>Opening stock *</span><input className="input" name="stockQuantity" type="number" min="0" defaultValue="0" required /></label>
          <label className="field"><span>Reorder alert at</span><input className="input" name="reorderLevel" type="number" min="0" defaultValue="0" /></label>
          <label className="field"><span>Stock status *</span><select className="select" name="stockStatus" defaultValue="IN_STOCK"><option value="IN_STOCK">In stock</option><option value="LOW_STOCK">Low stock</option><option value="OUT_OF_STOCK">Out of stock</option><option value="PRE_ORDER">Pre-order</option></select></label>
          <label className="field"><span>Shelf life (days)</span><input className="input" name="shelfLifeDays" type="number" min="1" placeholder="730" /></label>

          <SectionLabel>Volume pricing</SectionLabel>
          <div className="span-2 price-break-list">
            {priceBreaks.map((item) => (
              <div className="price-break-row" key={item.id}>
                <label className="field"><span>Minimum units</span><input className="input" type="number" min="2" required value={item.minQuantity} onChange={(event) => setPriceBreaks((items) => items.map((entry) => entry.id === item.id ? { ...entry, minQuantity: event.target.value } : entry))} /></label>
                <label className="field"><span>Unit price (RWF)</span><input className="input" type="number" min="0" required value={item.unitPriceRwf} onChange={(event) => setPriceBreaks((items) => items.map((entry) => entry.id === item.id ? { ...entry, unitPriceRwf: event.target.value } : entry))} /></label>
                <button className="btn btn-secondary btn-icon" type="button" aria-label="Remove price break" onClick={() => setPriceBreaks((items) => items.filter((entry) => entry.id !== item.id))}><Trash /></button>
              </div>
            ))}
            {priceBreaks.length < 5 && <button className="btn btn-secondary" type="button" onClick={addPriceBreak}><Plus /> Add price break</button>}
          </div>

          <SectionLabel>Compliance & visibility</SectionLabel>
          <label className="check-line"><input name="requiresPrescription" type="checkbox" /><span>Prescription required</span></label>
          <label className="check-line"><input name="coldChain" type="checkbox" /><span>Cold-chain handling</span></label>
          <label className="check-line"><input name="controlledSubstance" type="checkbox" /><span>Controlled substance</span></label>
          <label className="check-line"><input name="isActive" type="checkbox" defaultChecked /><span>Visible to approved clients</span></label>
        </div>
        <div className="form-actions"><Link className="btn btn-secondary" href="/admin/catalogue">Cancel</Link><button className="btn btn-primary" type="submit" disabled={saving || !can("catalogue")}><CheckCircle />{saving ? "Creating product…" : "Create product"}</button></div>
      </form>
    </ConsoleShell>
  );
}
