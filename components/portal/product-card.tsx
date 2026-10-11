"use client";

import { Boxes, Loader2, Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { money } from "@/lib/format";
import { cn } from "@/lib/utils";
import { caseStep, lowerQuantity, minimumOrder, useCart, type StockStatus } from "./cart-context";
import { ProductImage } from "./product-image";

export type Product = {
  id: string;
  name: string;
  brand_name: string;
  category: string | null;
  sku: string;
  size: string | null;
  image_urls: string[] | null;
  list_price_rwf: number | string;
  your_price_rwf: number | string;
  stock_status: StockStatus;
  stock_quantity: number;
  minimum_order_quantity: number;
  case_size: number;
};

const STOCK: Record<StockStatus, { label: (product: Product) => string; className: string }> = {
  IN_STOCK: { label: () => "In stock", className: "bg-brand-50 text-brand-700 ring-brand-200" },
  LOW_STOCK: { label: (product) => `Low stock · ${product.stock_quantity} left`, className: "bg-gold-50 text-gold-700 ring-gold-200" },
  OUT_OF_STOCK: { label: () => "Out of stock", className: "bg-sage-100 text-sage-500 ring-sage-200" },
  PRE_ORDER: { label: () => "Pre-order", className: "bg-sky-50 text-sky-600 ring-sky-100" },
};

export function ProductCard({ product }: { product: Product }) {
  const { cart, setQuantity, updating } = useCart();
  const quantity = cart.items.find((item) => item.productId === product.id)?.quantity ?? 0;
  const busy = updating === product.id;
  const unavailable = product.stock_status === "OUT_OF_STOCK";
  const listPrice = Number(product.list_price_rwf);
  const price = Number(product.your_price_rwf);
  const saving = listPrice > price ? Math.round(((listPrice - price) / listPrice) * 100) : 0;
  const first = minimumOrder(product);
  const stock = STOCK[product.stock_status];

  return (
    <article className={cn("group flex flex-col overflow-hidden rounded-2xl border bg-white transition duration-300 hover:-translate-y-0.5 hover:shadow-lift", quantity ? "border-brand-300 ring-1 ring-brand-200" : "border-sage-200/80")}>
      <div className="relative">
        <ProductImage imageUrls={product.image_urls} category={product.category} alt={product.name} className="aspect-[16/10] w-full rounded-none ring-0 sm:aspect-[4/3]" />
        {saving > 0 && (
          <span className="absolute top-3 left-3 rounded-full bg-forest-900 px-2.5 py-1 text-[11px] font-bold text-white">−{saving}% trade price</span>
        )}
        {quantity > 0 && (
          <span className="absolute top-3 right-3 grid min-w-7 place-items-center rounded-full bg-brand-600 px-2 py-1 text-[11px] font-bold text-white">{quantity}</span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-[11px] font-semibold tracking-wide text-brand-700 uppercase">{product.brand_name}</p>
        <h3 className="mt-1 line-clamp-2 min-h-10 text-sm leading-5 font-semibold text-forest-900">{product.name}</h3>
        <p className="mt-1 truncate text-xs text-sage-500">SKU {product.sku}{product.size ? ` · ${product.size}` : ""}</p>

        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset", stock.className)}>{stock.label(product)}</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-sage-100 px-2 py-0.5 text-[11px] font-medium text-sage-600">
            <Boxes className="size-3" /> {product.case_size > 1 ? `Case of ${product.case_size}` : `Min. ${product.minimum_order_quantity}`}
          </span>
        </div>

        <div className="mt-auto pt-4">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-lg font-extrabold tabular-nums text-forest-900">{money(price)}</span>
            {saving > 0 && <del className="text-xs tabular-nums text-sage-400">{money(listPrice)}</del>}
          </div>
          <p className="text-[11px] text-sage-500">per unit, excl. VAT</p>

          {quantity ? (
            <div className="mt-3 flex items-center justify-between rounded-xl border border-brand-200 bg-brand-50/60 p-1">
              <button
                type="button"
                aria-label={lowerQuantity(product, quantity) === 0 ? `Remove ${product.name}` : `Decrease ${product.name}`}
                disabled={busy}
                onClick={() => setQuantity(product.id, lowerQuantity(product, quantity))}
                className="grid size-8 cursor-pointer place-items-center rounded-lg bg-white text-sage-600 shadow-xs hover:text-forest-900 disabled:opacity-40"
              >
                {lowerQuantity(product, quantity) === 0 ? <Trash2 className="size-3.5" /> : <Minus className="size-3.5" />}
              </button>
              <span className="text-sm font-semibold tabular-nums text-forest-900">
                {busy ? <Loader2 className="size-4 animate-spin" /> : `${quantity} unit${quantity === 1 ? "" : "s"}`}
              </span>
              <button
                type="button"
                aria-label={`Increase ${product.name}`}
                disabled={busy}
                onClick={() => setQuantity(product.id, quantity + caseStep(product))}
                className="grid size-8 cursor-pointer place-items-center rounded-lg bg-white text-sage-600 shadow-xs hover:text-forest-900 disabled:opacity-40"
              >
                <Plus className="size-3.5" />
              </button>
            </div>
          ) : (
            <Button className="mt-3 w-full" variant={unavailable ? "secondary" : "default"} disabled={unavailable || busy} onClick={() => setQuantity(product.id, first)}>
              {busy ? <Loader2 className="animate-spin" /> : <ShoppingCart />}
              {unavailable ? "Out of stock" : busy ? "Adding…" : first > 1 ? `Add ${first} units` : "Add to cart"}
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
