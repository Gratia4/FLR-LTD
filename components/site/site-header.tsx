"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, LayoutDashboard, LogIn, LogOut, Menu, ShoppingBag, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useOptionalSession } from "@/lib/use-session";
import { Logo } from "./logo";
import { Container } from "./section";

export const siteNavigation = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/mission-vision", label: "Mission & vision" },
  { href: "/brands", label: "Brands" },
  { href: "/contact", label: "Contact" },
] as const;

const isActive = (pathname: string, href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

/**
 * The one header for every public page. Pages that open with a dark banner get
 * the dark treatment so the header flows straight into it; the homepage, which
 * opens on a light hero, keeps the light version.
 */
export function SiteHeader({ tone }: { tone?: "light" | "dark" }) {
  const pathname = usePathname();
  const dark = (tone ?? (pathname === "/" ? "light" : "dark")) === "dark";
  const onRegister = pathname.startsWith("/register");
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useOptionalSession();
  const isClient = user?.role === "CLIENT";
  const navigation = isClient ? [
    { href: "/", label: "Home" },
    { href: "/wholesale", label: "Wholesale shop" },
    { href: "/client", label: "Dashboard" },
    { href: "/client/orders", label: "Orders" },
    { href: "/client/billing", label: "Billing" },
  ] : siteNavigation;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b transition-[background-color,border-color,box-shadow] duration-300",
        dark
          ? scrolled
            ? "border-white/10 bg-forest-950/85 shadow-[0_10px_30px_-12px_rgb(0_0_0/0.45)] backdrop-blur-xl"
            : "border-transparent bg-forest-900"
          : scrolled
            ? "border-sage-200/80 bg-white/85 shadow-[0_8px_30px_-12px_rgb(16_36_24/0.18)] backdrop-blur-xl"
            : "border-transparent bg-white/70 backdrop-blur-md",
      )}
    >
      <Container className="flex h-16 items-center gap-8">
        <Link href="/" aria-label="FLR Ltd. home" className="rounded-md focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none">
          <Logo tone={dark ? "light" : "dark"} />
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {navigation.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors",
                  dark
                    ? active ? "text-white" : "text-forest-100/75 hover:bg-white/10 hover:text-white"
                    : active ? "text-forest-900" : "text-sage-600 hover:bg-sage-100 hover:text-forest-900",
                )}
              >
                {item.label}
                {active && (
                  <motion.span
                    layoutId="site-nav-indicator"
                    className={cn("absolute inset-x-3.5 -bottom-[14px] h-0.5 rounded-full", dark ? "bg-gold-400" : "bg-brand-600")}
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto hidden items-center gap-2 sm:flex">
          {isClient ? <>
            <Button asChild variant="ghost" className={dark ? "text-white hover:bg-white/10 hover:text-white" : "text-forest-900"}><Link href="/client/account"><UserRound /> Account</Link></Button>
            <Button variant={dark ? "gold" : "default"} onClick={logout}><LogOut /> Sign out</Button>
          </> : <>
            <Button asChild variant="ghost" className={dark ? "text-white hover:bg-white/10 hover:text-white" : "text-forest-900"}>
              <Link href="/login"><LogIn /> Client login</Link>
            </Button>
          {!onRegister && (
            <Button asChild variant={dark ? "gold" : "default"}>
              <Link href="/register">Become a partner <ArrowRight /></Link>
            </Button>
          )}
          </>}
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant={dark ? "inverse" : "outline"} size="icon" className="ml-auto sm:ml-2 lg:hidden" aria-label="Open menu">
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[88vw] max-w-sm gap-0 p-0">
            <SheetHeader className="border-b px-6 py-5">
              <SheetTitle asChild><div><Logo /></div></SheetTitle>
              <SheetDescription className="sr-only">Site navigation</SheetDescription>
            </SheetHeader>
            <nav aria-label="Mobile" className="flex flex-col gap-1 p-4">
              {navigation.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <SheetClose asChild key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex items-center justify-between rounded-xl px-4 py-3 text-base font-semibold transition-colors",
                        active ? "bg-brand-50 text-brand-700" : "text-forest-900 hover:bg-sage-100",
                      )}
                    >
                      {item.label}
                      <ArrowRight className={cn("size-4", active ? "opacity-100" : "opacity-30")} />
                    </Link>
                  </SheetClose>
                );
              })}
            </nav>
            <div className="mt-auto grid gap-2 border-t p-4">
              {isClient ? <>
                <Button asChild size="xl"><Link href="/wholesale"><ShoppingBag /> Shop products</Link></Button>
                <Button asChild size="xl" variant="outline"><Link href="/client"><LayoutDashboard /> Dashboard</Link></Button>
                <Button size="xl" variant="outline" onClick={logout}><LogOut /> Sign out</Button>
              </> : <>
                <Button asChild size="xl"><Link href="/register">Become a partner <ArrowRight /></Link></Button>
                <Button asChild size="xl" variant="outline"><Link href="/login"><LogIn /> Client login</Link></Button>
              </>}
            </div>
          </SheetContent>
        </Sheet>
      </Container>
    </header>
  );
}
