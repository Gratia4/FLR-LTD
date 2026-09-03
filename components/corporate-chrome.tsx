"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Buildings, GlobeHemisphereEast, List, MapPin, X } from "@phosphor-icons/react";
import { useState } from "react";

const navigation = [
  ["/", "Home"],
  ["/about", "About"],
  ["/mission-vision", "Mission & Vision"],
  ["/brands", "Brands"],
  ["/contact", "Contact"],
] as const;

export function CorporateHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  return <header className="corporate-header"><div className="corporate-nav container">
    <Link className="corporate-brand" href="/"><span className="mountain-logo" aria-hidden="true"><i /><i /><i /></span><span><b>FLR Ltd.</b><small>Pharmaceutical Wholesale<br /><em>Depot Pharmaceutique</em></small></span></Link>
    <nav className={menuOpen ? "corporate-links open" : "corporate-links"}>{navigation.map(([href, label]) => <Link className={pathname === href ? "active" : ""} href={href} key={href} onClick={() => setMenuOpen(false)}>{label}</Link>)}</nav>
    <div className="corporate-actions"><button className="language"><GlobeHemisphereEast /> EN <span>/ FR</span></button><Link className="login-link" href="/login">Client Login</Link><Link className="register-link" href="/register">Register</Link></div>
    <button className="corporate-menu" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu" aria-expanded={menuOpen}>{menuOpen ? <X /> : <List />}</button>
  </div></header>;
}

export function CorporateFooter() {
  return <footer className="corporate-footer"><div className="container footer-grid"><div><Link className="corporate-brand footer-brand" href="/"><span className="mountain-logo"><i /><i /><i /></span><span><b>FLR Ltd.</b><small>Pharmaceutical Wholesale<br />Depot Pharmaceutique</small></span></Link><p>Your trusted pharmaceutical wholesale partner in Rwanda.</p></div><div><h3>Quick links</h3><Link href="/about">About</Link><Link href="/mission-vision">Mission & Vision</Link><Link href="/brands">Our Brands</Link><Link href="/contact">Contact</Link></div><div><h3>Client portal</h3><Link href="/login">Client Login</Link><Link href="/register">Register a Business</Link><Link href="/login">Order History</Link><Link href="/login">Documents</Link></div><div><h3>Service region</h3><p><MapPin /> Rwanda & East Africa</p><p><Buildings /> Pharmacies · Clinics · Retailers</p></div></div><div className="footer-bottom container"><span>© 2026 FLR Ltd. All rights reserved.</span><span><Link href="/privacy">Privacy</Link> · <Link href="/terms">Terms</Link></span></div><div className="mountain-stripe"><i /><i /><i /></div></footer>;
}
