"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { AlertTriangle, Check, ChevronRight, Loader2, MapPin, Package, RotateCcw, Search, ShoppingBag, Undo2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { api, errorMessage } from "@/lib/api";
import type { ClientOrder, OrderDetail } from "@/lib/client-types";
import { date, dateTime, humanise, money } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useCart } from "./cart-context";
import { EmptyState, ErrorBanner, PageHeader, RowSkeletons, StatusBadge } from "./portal-ui";
import { ProductImage } from "./product-image";

const STATUSES = ["SUBMITTED", "PROCESSING", "SHIPPED", "DELIVERED", "INVOICED", "CANCELLED"];
const PROGRESS = ["SUBMITTED", "PROCESSING", "SHIPPED", "DELIVERED"];
const RETURN_REASONS = ["DAMAGED", "EXPIRED", "WRONG_ITEM", "SHORT_DATED", "RECALL", "OTHER"];

export function OrdersView() {
  const router = useRouter();
  const params = useSearchParams();
  const { reload: reloadCart, setOpen: openCart } = useCart();
  const [orders, setOrders] = useState<ClientOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selected, setSelected] = useState<OrderDetail | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [returnOpen, setReturnOpen] = useState(false);
  const [returnReason, setReturnReason] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    api
      .get<{ data: ClientOrder[] }>("/api/v1/orders", { query: { limit: 100 } })
      .then((result) => setOrders(result.data))
      .catch((cause) => setError(errorMessage(cause, "Your orders could not be loaded.")))
      .finally(() => setLoading(false));
  }, []);

  const openOrder = useCallback(async (id: string) => {
    setSheetOpen(true);
    setSelected(null);
    setReturnOpen(false);
    setDetailLoading(true);
    try {
      const result = await api.get<{ data: OrderDetail }>(`/api/v1/orders/${id}`);
      setSelected(result.data);
    } catch (cause) {
      toast.error(errorMessage(cause));
      setSheetOpen(false);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  useEffect(load, [load]);
  useEffect(() => {
    const id = params.get("order");
    if (id) void openOrder(id);
  }, [params, openOrder]);

  const visible = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return orders.filter(
      (order) =>
        (status === "all" || order.status === status) &&
        (!needle || `${order.reference} ${order.purchase_order_reference ?? ""} ${order.invoice_reference ?? ""}`.toLowerCase().includes(needle)),
    );
  }, [orders, search, status]);

  async function reorder() {
    if (!selected) return;
    setBusy(true);
    try {
      const result = await api.post<{ data: { added: number; skipped: string[] } }>(`/api/v1/orders/${selected.id}/reorder`, {});
      await reloadCart();
      toast.success(`${result.data.added} product line${result.data.added === 1 ? "" : "s"} added to your cart`, {
        description: result.data.skipped.length ? `${result.data.skipped.length} unavailable item(s) were skipped.` : undefined,
      });
      setSheetOpen(false);
      router.push("/wholesale");
      openCart(true);
    } catch (cause) {
      toast.error(errorMessage(cause));
    } finally {
      setBusy(false);
    }
  }

  async function cancelOrder() {
    if (!selected || !cancelReason.trim()) return;
    setBusy(true);
    try {
      await api.post(`/api/v1/orders/${selected.id}/cancel`, { reason: cancelReason.trim() });
      toast.success(`Order ${selected.reference} cancelled`);
      setCancelOpen(false);
      setCancelReason("");
      setSheetOpen(false);
      load();
    } catch (cause) {
      toast.error(errorMessage(cause));
    } finally {
      setBusy(false);
    }
  }

  async function requestReturn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;
    const form = new FormData(event.currentTarget);
    const items = selected.items.flatMap((item) => {
      const quantity = Number(form.get(`qty-${item.id}`) || 0);
      return quantity > 0 ? [{ orderItemId: item.id, quantity }] : [];
    });
    if (!items.length) return void toast.error("Choose at least one item and quantity to return.");
    if (!returnReason) return void toast.error("Choose a reason for the return.");
    setBusy(true);
    try {
      const result = await api.post<{ reference: string }>(`/api/v1/orders/${selected.id}/returns`, { reason: returnReason, note: form.get("note") || undefined, items });
      toast.success(`Return ${result.reference} submitted for review`);
      setReturnOpen(false);
      setReturnReason("");
    } catch (cause) {
      toast.error(errorMessage(cause));
    } finally {
      setBusy(false);
    }
  }

  const step = selected ? ["SUBMITTED", "PROCESSING", "SHIPPED", "DELIVERED", "INVOICED"].indexOf(selected.status) : -1;

  return (
    <div className="grid gap-6">
      <PageHeader
        eyebrow="Purchasing"
        title="Orders"
        description="Follow every order from submission to delivery, re-order previous baskets, or request a return."
        actions={<Button onClick={() => router.push("/wholesale")}><ShoppingBag /> New order</Button>}
      />

      {error && <ErrorBanner message={error} onRetry={load} />}

      <section className="overflow-hidden rounded-2xl border border-sage-200/80 bg-white shadow-soft">
        <div className="flex flex-col gap-3 border-b border-sage-100 p-4 sm:flex-row">
          <label className="relative flex-1">
            <span className="sr-only">Search orders</span>
            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-sage-400" />
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search order, PO or invoice reference" className="h-10 pl-10" />
          </label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="h-10 w-full sm:w-52" aria-label="Filter by status"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {STATUSES.map((item) => <SelectItem key={item} value={item}>{humanise(item)}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <RowSkeletons rows={6} />
        ) : visible.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-sage-100 bg-sage-50/70 text-left text-xs font-semibold text-sage-500">
                  <th className="px-5 py-3">Order</th>
                  <th className="px-5 py-3">Placed</th>
                  <th className="px-5 py-3">Items</th>
                  <th className="px-5 py-3">Delivery</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Total</th>
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody className="divide-y divide-sage-100">
                {visible.map((order) => (
                  <tr key={order.id} onClick={() => openOrder(order.id)} className="group cursor-pointer transition-colors hover:bg-sage-50">
                    <td className="px-5 py-3.5">
                      <button className="cursor-pointer text-left font-semibold text-forest-900 group-hover:text-brand-700" onClick={(event) => { event.stopPropagation(); void openOrder(order.id); }}>
                        {order.reference}
                      </button>
                      <p className="text-xs text-sage-500">{order.purchase_order_reference ? `PO ${order.purchase_order_reference}` : order.invoice_reference ?? "Online order"}</p>
                    </td>
                    <td className="px-5 py-3.5 text-sage-600">{date(order.created_at)}</td>
                    <td className="px-5 py-3.5 text-sage-600">
                      {order.total_quantity} units
                      <p className="text-xs text-sage-500">{order.item_count} product line{order.item_count === 1 ? "" : "s"}</p>
                    </td>
                    <td className="px-5 py-3.5 text-sage-600">
                      {order.tracking_number ?? date(order.expected_delivery_date)}
                      <p className="text-xs text-sage-500">{order.tracking_number ? "Tracking number" : "Expected delivery"}</p>
                    </td>
                    <td className="px-5 py-3.5"><StatusBadge kind="order" status={order.status} /></td>
                    <td className="px-5 py-3.5 text-right font-semibold tabular-nums text-forest-900">{money(order.total_rwf)}</td>
                    <td className="pr-4"><ChevronRight className="size-4 text-sage-300 transition-transform group-hover:translate-x-0.5" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={<Package />}
            title={orders.length ? "No matching orders" : "No orders yet"}
            text={orders.length ? "Change your search or status filter." : "Orders you submit from the catalogue will appear here."}
            action={!orders.length ? <Button variant="outline" onClick={() => router.push("/wholesale")}>Browse products</Button> : undefined}
          />
        )}
      </section>

      {/* ---------------------------- order detail --------------------------- */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-xl">
          <SheetHeader className="border-b border-sage-100 px-6 py-5">
            <SheetTitle className="font-display text-xl font-bold text-forest-900">{selected?.reference ?? "Order details"}</SheetTitle>
            <SheetDescription>{selected ? `Placed ${dateTime(selected.created_at)}` : "Loading order…"}</SheetDescription>
          </SheetHeader>

          {detailLoading || !selected ? (
            <div className="grid gap-4 p-6">
              <Skeleton className="h-14 rounded-xl" />
              <Skeleton className="h-28 rounded-xl" />
              <Skeleton className="h-48 rounded-xl" />
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto px-6 py-6">
                {selected.status === "CANCELLED" ? (
                  <p className="flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                    <AlertTriangle className="mt-0.5 size-4 shrink-0" /> Cancelled: {selected.cancelled_reason || "no reason recorded"}
                  </p>
                ) : (
                  <ol className="grid grid-cols-4" aria-label="Order progress">
                    {PROGRESS.map((item, index) => {
                      const done = index <= step;
                      return (
                        <li key={item} className="relative flex flex-col items-center gap-1.5 text-center">
                          {index > 0 && <span className={cn("absolute top-3.5 right-1/2 h-0.5 w-full -translate-y-1/2", index <= step ? "bg-brand-500" : "bg-sage-200")} aria-hidden="true" />}
                          <span className={cn("relative grid size-7 place-items-center rounded-full text-xs font-bold ring-4 ring-white", done ? "bg-brand-600 text-white" : "bg-sage-100 text-sage-500")}>
                            {done ? <Check className="size-3.5" /> : index + 1}
                          </span>
                          <span className={cn("text-xs", done ? "font-semibold text-brand-700" : "text-sage-500")}>{humanise(item)}</span>
                        </li>
                      );
                    })}
                  </ol>
                )}

                <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-sage-200 bg-sage-200">
                  {[
                    ["Status", <StatusBadge key="s" kind="order" status={selected.status} />],
                    ["Tracking", selected.tracking_number ?? "Not assigned"],
                    ["Expected delivery", date(selected.expected_delivery_date)],
                    ["Invoice", selected.invoice?.reference ?? "Not issued"],
                  ].map(([label, value]) => (
                    <div key={label as string} className="bg-white p-3.5">
                      <dt className="text-xs text-sage-500">{label}</dt>
                      <dd className="mt-1 text-sm font-semibold text-forest-900">{value}</dd>
                    </div>
                  ))}
                </dl>

                <h3 className="mt-7 text-sm font-semibold text-forest-900">Products</h3>
                <ul className="mt-2 divide-y divide-sage-100">
                  {selected.items.map((item) => (
                    <li key={item.id} className="flex items-center gap-3 py-3">
                      <ProductImage imageUrls={item.image_urls} alt="" className="size-12" fallbackIcon />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-forest-900">{item.product_name}</span>
                        <span className="block text-xs text-sage-500">{item.sku}{item.size ? ` · ${item.size}` : ""} · {item.quantity} × {money(item.unit_price_rwf)}</span>
                      </span>
                      <span className="text-sm font-semibold tabular-nums text-forest-900">{money(item.line_total_rwf)}</span>
                    </li>
                  ))}
                </ul>

                <dl className="mt-3 ml-auto grid max-w-xs gap-1.5 text-sm">
                  <div className="flex justify-between text-sage-600"><dt>Subtotal</dt><dd className="tabular-nums">{money(selected.subtotal_rwf)}</dd></div>
                  {Number(selected.discount_rwf) > 0 && <div className="flex justify-between text-brand-700"><dt>Discount</dt><dd className="tabular-nums">−{money(selected.discount_rwf)}</dd></div>}
                  <div className="flex justify-between text-sage-600"><dt>VAT</dt><dd className="tabular-nums">{money(selected.vat_rwf)}</dd></div>
                  <div className="mt-1 flex justify-between border-t border-sage-200 pt-2 font-semibold text-forest-900"><dt>Total</dt><dd className="tabular-nums">{money(selected.total_rwf)}</dd></div>
                </dl>

                {selected.delivery_address && (
                  <>
                    <h3 className="mt-7 text-sm font-semibold text-forest-900">Delivery address</h3>
                    <div className="mt-2 flex gap-3 rounded-xl border border-sage-200 p-4">
                      <MapPin className="mt-0.5 size-4.5 shrink-0 text-brand-600" />
                      <div className="text-sm">
                        <p className="font-semibold text-forest-900">{selected.delivery_address.label}</p>
                        <p className="mt-0.5 text-sage-600">
                          {selected.delivery_address.recipientName} · {selected.delivery_address.phone}
                          <br />
                          {selected.delivery_address.streetAddress}, {selected.delivery_address.district}
                        </p>
                      </div>
                    </div>
                  </>
                )}

                {returnOpen && (
                  <form onSubmit={requestReturn} className="mt-7 grid gap-4 rounded-2xl border border-sage-200 bg-sage-50/70 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-forest-900">Request a return</h3>
                        <p className="text-xs text-sage-500">Enter a quantity only for the items you need to return.</p>
                      </div>
                      <button type="button" onClick={() => setReturnOpen(false)} aria-label="Close return form" className="cursor-pointer rounded-md p-1 text-sage-400 hover:bg-white hover:text-forest-900"><X className="size-4" /></button>
                    </div>
                    <ul className="grid gap-2">
                      {selected.items.map((item) => (
                        <li key={item.id} className="flex items-center justify-between gap-3 rounded-xl bg-white p-3">
                          <Label htmlFor={`qty-${item.id}`} className="min-w-0 flex-col items-start gap-0.5">
                            <span className="truncate text-sm font-semibold text-forest-900">{item.product_name}</span>
                            <span className="text-xs font-normal text-sage-500">Up to {item.quantity}</span>
                          </Label>
                          <Input id={`qty-${item.id}`} name={`qty-${item.id}`} type="number" min={0} max={item.quantity} defaultValue={0} className="h-9 w-20 tabular-nums" />
                        </li>
                      ))}
                    </ul>
                    <Select value={returnReason} onValueChange={setReturnReason}>
                      <SelectTrigger className="h-10 w-full bg-white" aria-label="Return reason"><SelectValue placeholder="Select a reason" /></SelectTrigger>
                      <SelectContent>{RETURN_REASONS.map((reason) => <SelectItem key={reason} value={reason}>{humanise(reason)}</SelectItem>)}</SelectContent>
                    </Select>
                    <Textarea name="note" placeholder="Add helpful details (optional)" className="bg-white" />
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setReturnOpen(false)}>Back</Button>
                      <Button type="submit" disabled={busy}>{busy && <Loader2 className="animate-spin" />} Submit return</Button>
                    </div>
                  </form>
                )}
              </div>

              {!returnOpen && (
                <div className="flex flex-wrap justify-end gap-2 border-t border-sage-100 bg-sage-50/70 px-6 py-4">
                  {selected.status === "SUBMITTED" && (
                    <Button variant="outline" className="text-red-700 hover:bg-red-50 hover:text-red-800" disabled={busy} onClick={() => setCancelOpen(true)}>
                      <X /> Cancel order
                    </Button>
                  )}
                  {["DELIVERED", "INVOICED"].includes(selected.status) && (
                    <Button variant="outline" onClick={() => setReturnOpen(true)}><Undo2 /> Request return</Button>
                  )}
                  <Button disabled={busy} onClick={reorder}>{busy ? <Loader2 className="animate-spin" /> : <RotateCcw />} Re-order items</Button>
                </div>
              )}
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* ---------------------------- cancel dialog -------------------------- */}
      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel {selected?.reference}?</DialogTitle>
            <DialogDescription>The order will be withdrawn before it is processed. Tell us why so we can help.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            <Label htmlFor="cancel-reason">Reason</Label>
            <Textarea id="cancel-reason" value={cancelReason} onChange={(event) => setCancelReason(event.target.value)} placeholder="e.g. Ordered the wrong quantity" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelOpen(false)}>Keep order</Button>
            <Button variant="destructive" disabled={busy || !cancelReason.trim()} onClick={cancelOrder}>{busy && <Loader2 className="animate-spin" />} Cancel order</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
