import Image from "next/image";
import { Building2, HeartHandshake, Hospital, PackageSearch, ShieldCheck, ShoppingBasket, Sparkles, Store, Truck } from "lucide-react";
import { CtaBand } from "@/components/site/cta-band";
import { PageHero } from "@/components/site/page-hero";
import { Reveal } from "@/components/site/reveal";
import { Section, SectionHeading } from "@/components/site/section";

export const metadata = { title: "About" };

const pillars = [
  { icon: PackageSearch, title: "Import", text: "Sourcing from established European and international manufacturers and authorised channels.", image: "/images/flr-trusted-sourcing.webp", alt: "Illustration of a pharmaceutical specialist checking a sealed product carton" },
  { icon: Truck, title: "Distribute", text: "Professional handling and dependable delivery throughout Rwanda and the wider region.", image: "/images/flr-reliable-distribution.webp", alt: "Illustration of a logistics professional carefully packing an order" },
  { icon: HeartHandshake, title: "Support", text: "Responsive commercial support for every verified wholesale partner.", image: "/images/flr-partner-support.webp", alt: "Illustration of healthcare business partners discussing their needs" },
];

const clients = [
  { icon: Store, label: "Pharmacies" },
  { icon: Hospital, label: "Clinics & hospitals" },
  { icon: Sparkles, label: "Beauty retailers" },
  { icon: ShoppingBasket, label: "Supermarkets" },
  { icon: Building2, label: "Health stores" },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="Company"
        title="International quality, delivered with local expertise"
        description="FLR Ltd. imports, warehouses and distributes pharmaceutical and dermocosmetic products for professional clients across Rwanda and East Africa."
        translation="FLR Ltd. importe, stocke et distribue des produits pharmaceutiques et dermocosmétiques destinés aux professionnels de santé et aux revendeurs."
        crumbs={[{ href: "/about", label: "About" }]}
        image={{ src: "/images/flr-healthcare-partnership.webp", alt: "Illustration of a pharmacist and wholesale advisor reviewing a product together" }}
      />

      <Section>
        <div className="grid items-center gap-14 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
          <Reveal>
            <SectionHeading
              eyebrow="Who we are"
              title="A wholesale partner built for healthcare professionals"
              description="Our work connects trusted international brands with pharmacies, clinics, hospitals, beauty retailers and health stores. Every partner is verified, every product is sourced through authorised channels, and every order is handled with pharmaceutical care."
            />
          </Reveal>
          <Reveal delay={0.1} className="overflow-hidden rounded-3xl bg-forest-900 shadow-soft">
            <figure>
              <div className="relative aspect-[3/2] bg-sage-100">
                <Image src="/images/flr-vision-regional-reach.webp" alt="An imagined Rwandan landscape with a delivery road connecting green hills to a city" fill sizes="(max-width: 1024px) 100vw, 45vw" className="object-cover" />
              </div>
              <figcaption className="px-6 py-5 text-sm font-medium text-forest-100">Connecting international quality with care across Rwanda and East Africa.</figcaption>
            </figure>
          </Reveal>
        </div>
      </Section>

      <Section className="bg-sage-50/70">
        <SectionHeading align="center" eyebrow="What we do" title="Import. Distribute. Support." />
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {pillars.map((pillar, index) => (
            <Reveal key={pillar.title} delay={index * 0.08} className="overflow-hidden rounded-3xl border border-sage-200/80 bg-white shadow-soft">
              <div className="relative aspect-[3/2] bg-sage-100">
                <Image src={pillar.image} alt={pillar.alt} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
              </div>
              <div className="p-8">
                <span className="grid size-12 place-items-center rounded-2xl bg-brand-600 text-white shadow-md shadow-brand-600/25">
                  <pillar.icon className="size-5.5" />
                </span>
                <h3 className="mt-6 font-display text-xl font-bold text-forest-900">{pillar.title}</h3>
                <p className="mt-2 leading-relaxed text-sage-600">{pillar.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section>
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
          <Reveal>
            <SectionHeading eyebrow="Who we serve" title="Professional clients across the healthcare and retail chain" />
            <ul className="mt-10 flex flex-wrap gap-3">
              {clients.map((client) => (
                <li key={client.label} className="inline-flex items-center gap-2.5 rounded-full border border-sage-200 bg-white px-4 py-2.5 text-sm font-semibold text-forest-900 shadow-xs">
                  <client.icon className="size-4 text-brand-600" /> {client.label}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={0.1} className="flex gap-5 self-start rounded-3xl border border-gold-200 bg-gold-50 p-8">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-gold-500 text-forest-950">
              <ShieldCheck className="size-6" />
            </span>
            <div>
              <h3 className="font-display text-lg font-bold text-forest-900">Compliance information</h3>
              <p className="mt-2 leading-relaxed text-sage-700">
                Specific licence numbers, certificates and regulatory badges will be published after verification and management approval.
              </p>
            </div>
          </Reveal>
        </div>
      </Section>

      <CtaBand />
    </>
  );
}
