"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowRight, Loader2, Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { money } from "@/lib/format";
import { caseStep, lowerQuantity, useCart } from "./cart-context";
import { ProductImage } from "./product-image";

/** The wholesale cart as a slide-over, available from every portal page. */
export function CartSheet() {
  const router = useRouter();
  const { cart, open, setOpen, setQuantity, updating, checkout, checkingOut, count } = useCart();
  const blocked = cart.issues.length > 0;

  const submit = async () => {
    const reference = await checkout();
    if (!reference) return;
    setOpen(false);
    toast.success(`Order ${reference} submitted`, {
      description: "We’ll confirm availability and delivery shortly.",
      action: { label: "View orders", onClick: () => router.push("/client/orders") },
    });
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b border-sage-100 px-6 py-5">
          <SheetTitle className="font-display text-lg font-bold text-forest-900">Your order</SheetTitle>
          <SheetDescription>
            {count ? `${count} unit${count === 1 ? "" : "s"} across ${cart.items.length} product${cart.items.length === 1 ? "" : "s"}` : "Your cart is empty"}
          </SheetDescription>
        </SheetHeader>

        {cart.items.length ? (
          <>
            <ul className="flex-1 divide-y divide-sage-100 overflow-y-auto px-6">
              {cart.items.map((item) => {
                const issue = cart.issues.find((entry) => entry.productId === item.productId);
                const rules = { case_size: item.caseSize, minimum_order_quantity: item.minimumOrderQuantity };
                const busy = updating === item.productId;
                return (
                  <li key={item.productId} className="py-4">
                    <div className="flex gap-3">
                      <ProductImage imageUrls={item.imageUrls} alt="" className="size-16" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-semibold tracking-wide text-brand-700 uppercase">{item.brandName}</p>
                        <p className="truncate text-sm font-semibold text-forest-900">{item.name}</p>
                        <p className="text-xs text-sage-500">
                          {item.size ?? item.sku} · {item.caseSize > 1 ? `case of ${item.caseSize}` : "single units"} · {money(item.unitPriceRwf)} each
                        </p>
                        <div className="mt-2 flex items-center justify-between gap-3">
                          <div className="inline-flex items-center rounded-lg border border-sage-200 bg-white">
                            <button
                              type="button"
                              aria-label={lowerQuantity(rules, item.quantity) === 0 ? `Remove ${item.name}` : `Decrease ${item.name}`}
                              disabled={busy}
                              onClick={() => setQuantity(item.productId, lowerQuantity(rules, item.quantity))}
                              className="grid size-8 cursor-pointer place-items-center text-sage-600 hover:text-forest-900 disabled:opacity-40"
                            >
                              {lowerQuantity(rules, item.quantity) === 0 ? <Trash2 className="size-3.5" /> : <Minus className="size-3.5" />}
                            </button>
                            <span className="min-w-10 text-center text-sm font-semibold tabular-nums">{busy ? <Loader2 className="mx-auto size-3.5 animate-spin" /> : item.quantity}</span>
                            <button
                              type="button"
                              aria-label={`Increase ${item.name}`}
                              disabled={busy}
                              onClick={() => setQuantity(item.productId, item.quantity + caseStep(rules))}
                              className="grid size-8 cursor-pointer place-items-center text-sage-600 hover:text-forest-900 disabled:opacity-40"
                            >
                              <Plus className="size-3.5" />
                            </button>
                          </div>
                          <span className="text-sm font-semibold tabular-nums text-forest-900">{money(item.lineTotalRwf)}</span>
                        </div>
                      </div>
                    </div>
                    {issue && (
                      <p className="mt-2 flex items-start gap-1.5 rounded-lg bg-gold-50 px-2.5 py-1.5 text-xs text-gold-700">
                        <AlertTriangle className="mt-px size-3.5 shrink-0" /> {issue.message}
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>

            <div className="border-t border-sage-100 bg-sage-50/70 px-6 py-5">
              <dl className="grid gap-1.5 text-sm">
                <div className="flex justify-between text-sage-600"><dt>Subtotal</dt><dd className="tabular-nums">{money(cart.totals.subtotalRwf)}</dd></div>
                {cart.totals.discountRwf > 0 && (
                  <div className="flex justify-between text-brand-700"><dt>Contract discount</dt><dd className="tabular-nums">−{money(cart.totals.discountRwf)}</dd></div>
                )}
                <div className="flex justify-between text-sage-600"><dt>VAT</dt><dd className="tabular-nums">{money(cart.totals.vatRwf)}</dd></div>
                {cart.totals.deliveryFeeRwf > 0 && (
                  <div className="flex justify-between text-sage-600"><dt>Delivery</dt><dd className="tabular-nums">{money(cart.totals.deliveryFeeRwf)}</dd></div>
                )}
                <div className="mt-2 flex justify-between border-t border-sage-200 pt-3 text-base font-semibold text-forest-900"><dt>Order total</dt><dd className="tabular-nums">{money(cart.totals.totalRwf)}</dd></div>
              </dl>
              <p className="mt-3 text-xs text-sage-500">Stock and account credit are confirmed when the order is submitted.</p>
              <Button size="xl" className="mt-4 w-full" disabled={checkingOut || blocked} onClick={submit}>
                {checkingOut ? <><Loader2 className="animate-spin" /> Submitting…</> : blocked ? "Resolve stock issues to continue" : <>Submit order <ArrowRight /></>}
              </Button>
              <Button variant="ghost" className="mt-1 w-full" onClick={() => setOpen(false)}>Continue shopping</Button>
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <span className="grid size-14 place-items-center rounded-2xl bg-brand-50 text-brand-600 ring-1 ring-brand-100"><ShoppingCart className="size-6" /></span>
            <p className="mt-4 font-semibold text-forest-900">Your cart is empty</p>
            <p className="mt-1 text-sm text-sage-500">Add products from the catalogue to start an order.</p>
            <Button asChild className="mt-5" onClick={() => setOpen(false)}><Link href="/wholesale">Browse products</Link></Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
