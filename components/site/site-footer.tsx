import Link from "next/link";
import { Building2, MapPin, ShieldCheck } from "lucide-react";
import { Logo } from "./logo";
import { Container } from "./section";

const columns = [
  {
    title: "Company",
    links: [
      { href: "/about", label: "About FLR" },
      { href: "/mission-vision", label: "Mission & vision" },
      { href: "/brands", label: "Brand portfolio" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Partner portal",
    links: [
      { href: "/login", label: "Client login" },
      { href: "/register", label: "Register a business" },
      { href: "/forgot-password", label: "Reset password" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden bg-forest-950 text-forest-200">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(600px_300px_at_85%_0%,rgb(61_153_67/0.18),transparent_70%)]"
      />
      <Container className="relative grid gap-12 py-16 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div className="max-w-xs">
          <Logo tone="light" />
          <p className="mt-5 text-sm leading-relaxed text-forest-200/80">
            Your trusted pharmaceutical wholesale partner in Rwanda and East Africa.
          </p>
          <p className="mt-2 text-sm italic leading-relaxed text-forest-300/70">Dépôt pharmaceutique · Kigali</p>
        </div>

        {columns.map((column) => (
          <div key={column.title}>
            <h3 className="text-sm font-semibold text-white">{column.title}</h3>
            <ul className="mt-4 space-y-3 text-sm">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-forest-200/80 transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <h3 className="text-sm font-semibold text-white">Service region</h3>
          <ul className="mt-4 space-y-3 text-sm text-forest-200/80">
            <li className="flex items-center gap-2.5"><MapPin className="size-4 text-gold-400" /> Rwanda & East Africa</li>
            <li className="flex items-center gap-2.5"><Building2 className="size-4 text-gold-400" /> Pharmacies · Clinics · Retailers</li>
            <li className="flex items-center gap-2.5"><ShieldCheck className="size-4 text-gold-400" /> Verified B2B partners only</li>
          </ul>
        </div>
      </Container>

      <Container className="relative flex flex-col gap-2 border-t border-white/10 py-6 text-xs text-forest-300/70 sm:flex-row sm:items-center sm:justify-between">
        <span>© {new Date().getFullYear()} FLR Ltd. All rights reserved.</span>
        <span>Wholesale pricing is available to verified partners only.</span>
      </Container>

      <div className="grid h-1 grid-cols-3" aria-hidden="true">
        <span className="bg-sky-500" />
        <span className="bg-gold-500" />
        <span className="bg-brand-500" />
      </div>
    </footer>
  );
}
