"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { BadgePercent, Headset, PackageSearch, Search, ShoppingCart, Truck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { api, errorMessage } from "@/lib/api";
import { usePortalSession } from "@/lib/use-session";
import { cn } from "@/lib/utils";
import { useCart } from "./cart-context";
import { EmptyState, ErrorBanner } from "./portal-ui";
import { ProductCard, type Product } from "./product-card";
import { SUPPORT_EMAIL } from "./portal-shell";

type Catalogue = { data: Product[]; tier: { name: string; discountPercent: number }; total: number };
type Sort = "name" | "price-asc" | "price-desc";

const ALL = "All products";

export function Shop() {
  const { user } = usePortalSession();
  const { count, setOpen } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [tier, setTier] = useState<Catalogue["tier"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const params = useSearchParams();
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [category, setCategory] = useState(ALL);
  const [sort, setSort] = useState<Sort>("name");
  const [inStockOnly, setInStockOnly] = useState(false);

  const load = () => {
    setLoading(true);
    setError("");
    api
      .get<Catalogue>("/api/v1/catalog/wholesale/products", { query: { limit: 100 } })
      .then((catalogue) => {
        setProducts(catalogue.data);
        setTier(catalogue.tier);
      })
      .catch((cause) => setError(errorMessage(cause, "The wholesale catalogue could not be loaded.")))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const product of products) if (product.category) counts.set(product.category, (counts.get(product.category) ?? 0) + 1);
    return [{ name: ALL, count: products.length }, ...[...counts].sort(([a], [b]) => a.localeCompare(b)).map(([name, total]) => ({ name, count: total }))];
  }, [products]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = products.filter(
      (product) =>
        (category === ALL || product.category === category) &&
        (!inStockOnly || product.stock_status !== "OUT_OF_STOCK") &&
        (!needle || `${product.name} ${product.brand_name} ${product.sku}`.toLowerCase().includes(needle)),
    );
    const price = (product: Product) => Number(product.your_price_rwf);
    return filtered.sort((a, b) => (sort === "price-asc" ? price(a) - price(b) : sort === "price-desc" ? price(b) - price(a) : a.name.localeCompare(b.name)));
  }, [products, category, query, sort, inStockOnly]);

  const filtersActive = query || category !== ALL || inStockOnly;
  const clearFilters = () => {
    setQuery("");
    setCategory(ALL);
    setInStockOnly(false);
  };
  const firstName = user?.fullName.split(" ")[0];

  return (
    <div className="grid gap-8">
      {/* ------------------------------ welcome ------------------------------ */}
      <section className="relative isolate overflow-hidden rounded-3xl bg-forest-900 px-6 py-7 text-white sm:px-8">
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(520px_260px_at_92%_10%,rgb(61_153_67/0.45),transparent_70%),radial-gradient(360px_200px_at_0%_120%,rgb(249_168_37/0.18),transparent_70%)]" />
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-bold tracking-[0.14em] text-gold-300 uppercase">Wholesale catalogue</p>
            <h1 className="mt-2 font-display text-2xl font-extrabold tracking-tight sm:text-3xl">Welcome back{firstName ? `, ${firstName}` : ""}</h1>
            <p className="mt-1.5 max-w-xl text-sm text-forest-100/80">Live stock and the contract prices assigned to {user?.businessName ?? "your account"}.</p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:min-w-[30rem]">
            <div className="min-w-0 rounded-xl bg-white/8 p-2.5 ring-1 ring-white/10 sm:rounded-2xl sm:p-3.5">
              <p className="flex items-center gap-1.5 truncate text-[11px] text-forest-100/70 sm:text-xs"><BadgePercent className="size-3.5 text-gold-300" /> Your pricing</p>
              <p className="mt-1 text-sm leading-snug font-semibold sm:text-base">{tier ? `${tier.name}${tier.discountPercent ? ` · ${tier.discountPercent}% off` : ""}` : "Contract pricing"}</p>
            </div>
            <div className="min-w-0 rounded-xl bg-white/8 p-2.5 ring-1 ring-white/10 sm:rounded-2xl sm:p-3.5">
              <p className="flex items-center gap-1.5 truncate text-[11px] text-forest-100/70 sm:text-xs"><PackageSearch className="size-3.5 text-gold-300" /> Available now</p>
              <p className="mt-1 text-sm leading-snug font-semibold sm:text-base">{loading ? "—" : `${products.filter((product) => product.stock_status !== "OUT_OF_STOCK").length} products`}</p>
            </div>
            <div className="hidden min-w-0 rounded-xl bg-white/8 p-2.5 ring-1 ring-white/10 sm:block sm:rounded-2xl sm:p-3.5">
              <p className="flex items-center gap-1.5 truncate text-[11px] text-forest-100/70 sm:text-xs"><Truck className="size-3.5 text-gold-300" /> Delivery</p>
              <p className="mt-1 text-sm leading-snug font-semibold sm:text-base">From Kigali, Rwanda-wide</p>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------ toolbar ------------------------------ */}
      <section className="grid gap-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <label className="relative flex-1">
            <span className="sr-only">Search products</span>
            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-sage-400" />
            <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by product, brand or SKU" className="h-10 bg-white pr-9 pl-10" />
            {query && (
              <button onClick={() => setQuery("")} aria-label="Clear search" className="absolute top-1/2 right-2.5 grid size-6 -translate-y-1/2 cursor-pointer place-items-center rounded-md text-sage-400 hover:bg-sage-100 hover:text-forest-900">
                <X className="size-3.5" />
              </button>
            )}
          </label>
          <div className="flex gap-2">
            <Select value={sort} onValueChange={(value) => setSort(value as Sort)}>
              <SelectTrigger className="h-10 w-full bg-white md:w-48" aria-label="Sort products"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name (A–Z)</SelectItem>
                <SelectItem value="price-asc">Price: low to high</SelectItem>
                <SelectItem value="price-desc">Price: high to low</SelectItem>
              </SelectContent>
            </Select>
            <Button variant={inStockOnly ? "default" : "outline"} className="h-10 shrink-0" aria-pressed={inStockOnly} onClick={() => setInStockOnly((value) => !value)}>
              In stock only
            </Button>
          </div>
        </div>

        <div role="tablist" aria-label="Product category" className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          {loading
            ? Array.from({ length: 5 }, (_, index) => <Skeleton key={index} className="h-8 w-28 shrink-0 rounded-full" />)
            : categories.map((item) => {
                const active = item.name === category;
                return (
                  <button
                    key={item.name}
                    role="tab"
                    aria-selected={active}
                    onClick={() => setCategory(item.name)}
                    className={cn(
                      "inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium whitespace-nowrap transition-colors",
                      active ? "border-forest-900 bg-forest-900 text-white" : "border-sage-200 bg-white text-sage-600 hover:border-sage-300 hover:text-forest-900",
                    )}
                  >
                    {item.name}
                    <span className={cn("rounded-full px-1.5 text-xs", active ? "bg-white/15" : "bg-sage-100")}>{item.count}</span>
                  </button>
                );
              })}
        </div>
      </section>

      {/* ------------------------------ products ----------------------------- */}
      <section aria-live="polite" className="grid gap-4">
        {error && <ErrorBanner message={error} onRetry={load} />}
        {!error && !loading && (
          <div className="flex items-center justify-between text-sm text-sage-500">
            <span>{visible.length} of {products.length} products{category !== ALL ? ` in ${category}` : ""}</span>
            {filtersActive && <button onClick={clearFilters} className="cursor-pointer font-semibold text-brand-700 hover:underline">Clear filters</button>}
          </div>
        )}

        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }, (_, index) => <Skeleton key={index} className="h-[25rem] rounded-2xl" />)}
          </div>
        ) : !error && visible.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visible.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        ) : !error ? (
          <div className="rounded-2xl border border-sage-200/80 bg-white">
            <EmptyState
              icon={<Search />}
              title={products.length ? "No products match your filters" : "The catalogue is being prepared"}
              text={products.length ? "Try another search term or category." : "Approved products will appear here as soon as they are published."}
              action={filtersActive ? <Button variant="outline" onClick={clearFilters}>Clear filters</Button> : undefined}
            />
          </div>
        ) : null}
      </section>

      {/* ------------------------------- help -------------------------------- */}
      <section className="flex flex-col gap-4 rounded-2xl border border-sage-200/80 bg-white p-5 sm:flex-row sm:items-center">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-gold-50 text-gold-700 ring-1 ring-gold-200"><Headset className="size-5" /></span>
        <div className="flex-1">
          <p className="font-semibold text-forest-900">Large, cold-chain or special order?</p>
          <p className="text-sm text-sage-500">Your account manager can help with availability, delivery planning and quotations.</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline"><a href={`mailto:${SUPPORT_EMAIL}`}>Contact FLR</a></Button>
          {count > 0 && <Button onClick={() => setOpen(true)}><ShoppingCart /> Review order</Button>}
        </div>
      </section>
    </div>
  );
}
