"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { brandGroups, brandPortfolio, type BrandGroup } from "@/lib/brands";
import { cn } from "@/lib/utils";
import { BrandLogo } from "./brand-logo";

const isGroup = (value: string | null): value is BrandGroup => brandGroups.some((group) => group.id === value);

/** Filterable brand grid. The active category lives in `?category=` so links can deep-link to it. */
export function BrandDirectory() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const requested = params.get("category");
  const category: BrandGroup | "all" = isGroup(requested) ? requested : "all";
  const [query, setQuery] = useState("");

  const setCategory = (next: BrandGroup | "all") => {
    const search = new URLSearchParams(params.toString());
    if (next === "all") search.delete("category");
    else search.set("category", next);
    const suffix = search.toString();
    router.replace(`${pathname}${suffix ? `?${suffix}` : ""}`, { scroll: false });
  };

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return brandPortfolio.filter(
      (brand) =>
        (category === "all" || brand.group === category) &&
        (!needle || `${brand.name} ${brand.category} ${brand.origin}`.toLowerCase().includes(needle)),
    );
  }, [category, query]);

  const tabs = [{ id: "all" as const, label: "All brands", count: brandPortfolio.length }, ...brandGroups.map((group) => ({ id: group.id, label: group.label, count: brandPortfolio.filter((brand) => brand.group === group.id).length }))];

  return (
    <div>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div role="tablist" aria-label="Brand category" className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1">
          {tabs.map((tab) => {
            const active = category === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={active}
                onClick={() => setCategory(tab.id)}
                className={cn(
                  "relative inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition-colors",
                  active ? "text-white" : "text-sage-600 hover:bg-sage-100 hover:text-forest-900",
                )}
              >
                {active && <motion.span layoutId="brand-tab" className="absolute inset-0 -z-0 rounded-full bg-forest-900" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
                <span className="relative">{tab.label}</span>
                <span className={cn("relative rounded-full px-1.5 text-xs", active ? "bg-white/15" : "bg-sage-200/70")}>{tab.count}</span>
              </button>
            );
          })}
        </div>
        <label className="relative w-full lg:w-72">
          <span className="sr-only">Search brands</span>
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-sage-400" />
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search brands" className="h-10 rounded-full bg-white pr-10 pl-10" />
          {query && (
            <button onClick={() => setQuery("")} aria-label="Clear search" className="absolute top-1/2 right-3 grid size-6 -translate-y-1/2 cursor-pointer place-items-center rounded-full text-sage-400 hover:bg-sage-100 hover:text-forest-900">
              <X className="size-3.5" />
            </button>
          )}
        </label>
      </div>

      <motion.ul layout className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <AnimatePresence mode="popLayout" initial={false}>
          {visible.map((brand) => (
            <motion.li
              key={brand.slug}
              layout
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link
                href={`/brands/${brand.slug}`}
                className="group flex h-full flex-col rounded-3xl border border-sage-200/80 bg-white p-6 transition duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-lift"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="rounded-full bg-sage-100 px-2.5 py-1 text-[11px] font-semibold text-sage-600">{brand.tier}</span>
                  <ArrowUpRight className="size-5 text-sage-300 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brand-600" />
                </div>
                <div className="grid h-28 place-items-center">
                  <BrandLogo brand={brand} size="md" />
                </div>
                <div className="mt-auto border-t border-sage-100 pt-4">
                  <h2 className="font-semibold text-forest-900">{brand.name}</h2>
                  <p className="mt-0.5 text-sm text-sage-500">{brand.category} · {brand.origin}</p>
                </div>
              </Link>
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>

      {visible.length === 0 && (
        <div className="mt-10 rounded-3xl border border-dashed border-sage-300 p-12 text-center">
          <p className="font-semibold text-forest-900">No brands match “{query}”.</p>
          <button onClick={() => { setQuery(""); setCategory("all"); }} className="mt-3 cursor-pointer text-sm font-semibold text-brand-700 hover:underline">
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
