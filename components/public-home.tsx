"use client";

import Image from "next/image";
import Link from "next/link";
import { brandPortfolio } from "@/lib/brands";
import { CorporateFooter, CorporateHeader } from "@/components/corporate-chrome";
import {
  ArrowRight,
  Certificate,
  CheckCircle,
  ClipboardText,
  Handshake,
  MapPin,
  Package,
  Phone,
  ShieldCheck,
  ShoppingCartSimple,
  Translate,
  Truck,
  UsersThree,
} from "@phosphor-icons/react";

const reasons = [
  [Certificate, "Licensed & compliant", "A pharmaceutical wholesale operation built around Rwanda’s regulatory requirements."],
  [ShieldCheck, "Authentic products", "Products sourced through manufacturers and authorised international distribution channels."],
  [Package, "Wide portfolio", "Internationally recognised brands across dermocosmetics, baby care, wellness and pharmacy."],
  [Truck, "Reliable supply chain", "Pharmaceutical-grade handling, dependable stock management and Rwanda-wide distribution."],
  [Handshake, "Wholesale partnership", "Commercial terms designed for verified pharmacies, clinics and retail partners."],
  [Translate, "Bilingual support", "Clear client communication and support in both English and French."],
];

export function PublicHome() {
  return (
    <div className="public-site">
      <CorporateHeader />

      <main>
        <section className="corporate-hero">
          <Image src="/hero/mustela-family-hero.png" alt="African family with pharmaceutical skincare products" fill priority sizes="100vw" />
          <div className="corporate-hero-overlay" />
          <div className="container corporate-hero-content">
            <span className="hero-label">Rwanda · East Africa</span>
            <h1>Rwanda’s Trusted<br /><strong>Pharmaceutical Wholesale</strong> Partner</h1>
            <p>Distributing world-class pharmaceutical and dermocosmetic brands to pharmacies, clinics and retailers across Rwanda and East Africa.</p>
            <p className="hero-fr">Distribution de marques pharmaceutiques et dermocosmétiques aux pharmacies, cliniques et revendeurs au Rwanda.</p>
            <div className="corporate-hero-actions">
              <Link className="gold-button" href="/brands">View Our Brands <ArrowRight /></Link>
              <Link className="outline-button" href="/register">Become a Partner</Link>
            </div>
          </div>
        </section>

        <section className="brand-ticker" aria-label="Distributed brands">
          <div className="ticker-track">{[...brandPortfolio, ...brandPortfolio].map((brand, index) => <span className={brand.wordmark ? "wordmark" : ""} key={`${brand.slug}-${index}`}><Image src={brand.logo} alt="" width={110} height={38} /><b>{brand.wordmark ? "" : brand.name}</b></span>)}</div>
        </section>

        <section className="trust-strip">
          <div className="container trust-grid">
            <div><ShieldCheck /><p><b>20+</b><span>Premium brands distributed</span></p></div>
            <div><UsersThree /><p><b>Verified B2B</b><span>Pharmacies, clinics & retailers</span></p></div>
            <div><MapPin /><p><b>Rwanda & East Africa</b><span>Regional distribution coverage</span></p></div>
            <div><Certificate /><p><b>Licensed importer</b><span>Pharmaceutical compliance</span></p></div>
          </div>
        </section>

        <section className="about-preview container">
          <div className="about-image"><Image src="/products/mustela-baby-range.png" alt="Part of FLR's international product portfolio" fill sizes="(max-width: 800px) 100vw, 46vw" /></div>
          <div className="about-copy"><span className="section-label">About FLR Ltd.</span><h2>Connecting trusted global brands with East African healthcare.</h2><p>FLR Ltd. is a pharmaceutical wholesale distributor and Dépôt Pharmaceutique serving pharmacies, clinics, hospitals and retailers. We import, warehouse and distribute quality pharmaceutical and dermocosmetic products with a focus on authenticity, compliance and dependable partnership.</p><p className="bilingual-copy">FLR Ltd. accompagne les professionnels de santé et les revendeurs avec une distribution fiable, conforme et adaptée au marché rwandais.</p><Link className="text-link" href="/about">Discover our company <ArrowRight /></Link></div>
        </section>

        <section className="category-section" id="categories">
          <div className="container"><div className="center-heading"><span className="section-label">Our portfolio</span><h2>Healthcare brands for every need</h2><p>Explore our core distribution categories. Product prices and online ordering are reserved for approved FLR partners.</p></div>
            <div className="category-tiles">
              <article className="category-tile dermo"><span>01</span><div><small>Premium care</small><h3>Dermocosmetics<br />& Skincare</h3><p>Bioderma · Uriage · SVR · Eucerin · CeraVe</p><Link href="/brands?category=dermocosmetics">Explore brands <ArrowRight /></Link></div></article>
              <article className="category-tile baby"><Image src="/products/mustela-baby-range.png" alt="Baby and maternity products" fill sizes="(max-width: 700px) 100vw, 33vw" /><span>02</span><div><small>Gentle essentials</small><h3>Baby<br />& Maternity</h3><p>Mustela · Zwitsal · Byphasse Baby</p><Link href="/brands?category=baby">Explore brands <ArrowRight /></Link></div></article>
              <article className="category-tile wellness"><span>03</span><div><small>Everyday health</small><h3>Wellness, OTC<br />& Pharmacy</h3><p>Puressentiel · Horizane Santé · Neutrogena</p><Link href="/brands?category=wellness">Explore brands <ArrowRight /></Link></div></article>
            </div>
          </div>
        </section>

        <section className="why-section container">
          <div className="split-heading"><div><span className="section-label">Why FLR Ltd.</span><h2>A dependable partner for your business</h2></div><p>Our wholesale service combines international sourcing with local market knowledge and accountable support.</p></div>
          <div className="reason-grid">{reasons.map(([Icon, title, description]) => { const ReasonIcon = Icon as typeof ShieldCheck; return <article key={title as string}><span><ReasonIcon /></span><h3>{title as string}</h3><p>{description as string}</p></article>; })}</div>
        </section>

        <section className="brand-grid-section">
          <div className="container"><div className="center-heading"><span className="section-label">International portfolio</span><h2>Brands trusted by professionals</h2></div><div className="logo-grid">{brandPortfolio.map((brand) => <Link href={`/brands/${brand.slug}`} key={brand.slug} className={brand.wordmark ? "wordmark" : ""}><Image src={brand.logo} alt={`${brand.name} logo`} width={150} height={56} /><span>{brand.wordmark ? "" : brand.name}</span></Link>)}</div><Link className="green-button" href="/brands">See All Brands <ArrowRight /></Link></div>
        </section>

        <section className="onboarding container">
          <div className="center-heading"><span className="section-label">Become a client</span><h2>Start ordering in three steps</h2><p>Wholesale pricing, stock status and ordering are securely available to verified businesses.</p></div>
          <div className="steps"><article><span>1</span><ClipboardText /><h3>Register your business</h3><p>Submit your company, TIN, licence and primary contact information.</p></article><i /><article><span>2</span><CheckCircle /><h3>Account verification</h3><p>Our team reviews your credentials within 24–48 business hours.</p></article><i /><article><span>3</span><ShoppingCartSimple /><h3>Start ordering</h3><p>Access wholesale pricing, live availability and online ordering by brand.</p></article></div>
          <Link className="green-button" href="/register">Register as an FLR Partner <ArrowRight /></Link>
        </section>

        <section className="contact-strip"><div className="container"><div><span className="section-label">Talk to our team</span><h2>Ready to partner with FLR Ltd.?</h2><p>Contact details will be published following management approval.</p></div><div className="contact-actions"><Link href="/contact"><Phone /> Send a message</Link><Link href="/register">Partner registration <ArrowRight /></Link></div></div></section>
      </main>

      <CorporateFooter />
    </div>
  );
}
