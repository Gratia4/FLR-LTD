"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { motion } from "motion/react";
import { ChevronDown, Headset, KeyRound, LayoutDashboard, LogOut, Menu, Package, Receipt, ShoppingBag, ShoppingCart, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Toaster } from "@/components/ui/sonner";
import { LogoMark } from "@/components/site/logo";
import { MotionProvider } from "@/components/site/motion-provider";
import { initials, moneyCompact } from "@/lib/format";
import { usePortalSession } from "@/lib/use-session";
import { cn } from "@/lib/utils";
import { CartProvider, useCart } from "./cart-context";
import { CartSheet } from "./cart-sheet";

export const SUPPORT_EMAIL = "support@flr.rw";

const NAVIGATION = [
  { href: "/wholesale", label: "Shop", icon: ShoppingBag },
  { href: "/client", label: "Dashboard", icon: LayoutDashboard },
  { href: "/client/orders", label: "Orders", icon: Package },
  { href: "/client/billing", label: "Invoices & payments", icon: Receipt },
  { href: "/client/account", label: "Account", icon: UserRound },
];

const isActive = (pathname: string, href: string) => (href === "/client" ? pathname === href : pathname.startsWith(href));

function PortalLogo() {
  return (
    <Link href="/wholesale" aria-label="FLR partner portal home" className="flex shrink-0 items-center gap-2.5">
      <LogoMark className="h-7 w-9" />
      <span className="flex flex-col leading-none">
        <span className="font-display text-base font-extrabold tracking-tight text-forest-900">FLR Ltd.</span>
        <span className="mt-1 text-[10px] font-semibold tracking-[0.14em] text-brand-600 uppercase">Partner portal</span>
      </span>
    </Link>
  );
}

function CartButton() {
  const { count, cart, setOpen } = useCart();
  return (
    <Button variant="outline" onClick={() => setOpen(true)} className="relative h-10 gap-2.5 px-3" aria-label={`Open cart, ${count} units`}>
      <ShoppingCart className="size-4.5" />
      <span className="hidden text-left leading-none md:block">
        <span className="block text-[11px] font-medium text-sage-500">{count} unit{count === 1 ? "" : "s"}</span>
        <span className="mt-0.5 block text-sm font-semibold tabular-nums text-forest-900">{moneyCompact(cart.totals.totalRwf)}</span>
      </span>
      {count > 0 && (
        <span className="absolute -top-1.5 -right-1.5 grid min-w-5 place-items-center rounded-full bg-brand-600 px-1 text-[11px] font-bold text-white ring-2 ring-white md:hidden">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Button>
  );
}

export function PortalShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user, loading, logout } = usePortalSession();

  if (loading || !user) {
    return (
      <div className="grid min-h-screen place-items-center bg-sage-50 font-sans">
        <div className="flex flex-col items-center gap-4 text-sage-500">
          <LogoMark className="h-10 w-12 animate-pulse" />
          <p className="text-sm">Loading your partner portal…</p>
        </div>
      </div>
    );
  }

  const business = user.businessName ?? "FLR partner";

  return (
    <MotionProvider>
      <CartProvider enabled>
        <div className="flex min-h-screen flex-col bg-sage-50 font-sans text-sage-900 antialiased">
          <header className="sticky top-0 z-40 border-b border-sage-200/80 bg-white/90 backdrop-blur-xl">
            <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-5 sm:px-8">
              <PortalLogo />

              <nav aria-label="Partner portal" className="hidden h-full items-center gap-1 lg:flex">
                {NAVIGATION.map((item) => {
                  const active = isActive(pathname, item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "relative flex h-full items-center gap-2 px-3 text-sm font-semibold transition-colors",
                        active ? "text-forest-900" : "text-sage-500 hover:text-forest-900",
                      )}
                    >
                      <item.icon className={cn("size-4", active ? "text-brand-600" : "")} />
                      {item.label}
                      {active && <motion.span layoutId="portal-nav" className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-brand-600" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
                    </Link>
                  );
                })}
              </nav>

              <div className="ml-auto flex items-center gap-2">
                <CartButton />

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="hidden cursor-pointer items-center gap-2.5 rounded-xl py-1.5 pr-2 pl-1.5 text-left transition-colors hover:bg-sage-100 sm:flex">
                      <span className="grid size-8 place-items-center rounded-lg bg-brand-600 text-xs font-bold text-white">{initials(user.fullName)}</span>
                      <span className="hidden max-w-40 leading-tight xl:block">
                        <span className="block truncate text-sm font-semibold text-forest-900">{user.fullName}</span>
                        <span className="block truncate text-xs text-sage-500">{business}</span>
                      </span>
                      <ChevronDown className="size-4 text-sage-400" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-60">
                    <DropdownMenuLabel className="font-normal">
                      <p className="truncate text-sm font-semibold text-forest-900">{user.fullName}</p>
                      <p className="truncate text-xs text-sage-500">{user.email}</p>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild><Link href="/client/account"><UserRound /> Account settings</Link></DropdownMenuItem>
                    <DropdownMenuItem asChild><Link href="/account/password"><KeyRound /> Change password</Link></DropdownMenuItem>
                    <DropdownMenuItem asChild><a href={`mailto:${SUPPORT_EMAIL}`}><Headset /> Contact support</a></DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant="destructive" onSelect={logout}><LogOut /> Sign out</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="size-10 lg:hidden" aria-label="Open portal menu"><Menu /></Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-[86vw] max-w-sm gap-0 p-0">
                    <SheetHeader className="border-b border-sage-100 px-5 py-5">
                      <SheetTitle asChild><div><PortalLogo /></div></SheetTitle>
                      <SheetDescription className="sr-only">Partner portal navigation</SheetDescription>
                    </SheetHeader>
                    <div className="flex items-center gap-3 border-b border-sage-100 px-5 py-4">
                      <span className="grid size-10 place-items-center rounded-xl bg-brand-600 text-sm font-bold text-white">{initials(user.fullName)}</span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-forest-900">{user.fullName}</span>
                        <span className="block truncate text-xs text-sage-500">{business}</span>
                      </span>
                    </div>
                    <nav aria-label="Partner portal mobile" className="grid gap-1 p-3">
                      {NAVIGATION.map((item) => {
                        const active = isActive(pathname, item.href);
                        return (
                          <SheetClose asChild key={item.href}>
                            <Link
                              href={item.href}
                              aria-current={active ? "page" : undefined}
                              className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold", active ? "bg-brand-50 text-brand-700" : "text-forest-900 hover:bg-sage-100")}
                            >
                              <item.icon className="size-4.5" /> {item.label}
                            </Link>
                          </SheetClose>
                        );
                      })}
                    </nav>
                    <div className="mt-auto grid gap-2 border-t border-sage-100 p-4">
                      <Button asChild variant="outline"><a href={`mailto:${SUPPORT_EMAIL}`}><Headset /> Contact support</a></Button>
                      <Button variant="outline" className="text-red-700 hover:bg-red-50 hover:text-red-800" onClick={logout}><LogOut /> Sign out</Button>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </header>

          <main className="mx-auto w-full max-w-7xl flex-1 px-5 py-8 sm:px-8 sm:py-10">{children}</main>

          <footer className="border-t border-sage-200/80 bg-white">
            <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-5 text-xs text-sage-500 sm:flex-row sm:items-center sm:justify-between sm:px-8">
              <span>© {new Date().getFullYear()} FLR Ltd. · Pharmaceutical wholesale, Kigali</span>
              <span>
                Need help? <a href={`mailto:${SUPPORT_EMAIL}`} className="font-semibold text-brand-700 hover:underline">{SUPPORT_EMAIL}</a>
              </span>
            </div>
          </footer>
        </div>
        <CartSheet />
        <Toaster position="bottom-right" richColors closeButton />
      </CartProvider>
    </MotionProvider>
  );
}
