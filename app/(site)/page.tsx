import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  ClipboardList,
  Globe2,
  HeartHandshake,
  Languages,
  Layers,
  MapPin,
  PackageCheck,
  ShieldCheck,
  ShoppingCart,
  Truck,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/site/brand-logo";
import { BrandMarquee } from "@/components/site/brand-marquee";
import { CtaBand } from "@/components/site/cta-band";
import { Reveal } from "@/components/site/reveal";
import { Container, Section, SectionHeading } from "@/components/site/section";
import { brandPortfolio } from "@/lib/brands";

const reasons = [
  { icon: BadgeCheck, title: "Licensed & compliant", text: "A pharmaceutical wholesale operation built around Rwanda’s regulatory requirements." },
  { icon: ShieldCheck, title: "Authentic products", text: "Sourced from manufacturers and authorised international distribution channels." },
  { icon: Layers, title: "Wide portfolio", text: "Internationally recognised brands across dermocosmetics, baby care, wellness and pharmacy." },
  { icon: Truck, title: "Reliable supply chain", text: "Pharmaceutical-grade handling, dependable stock management and Rwanda-wide delivery." },
  { icon: HeartHandshake, title: "Wholesale partnership", text: "Commercial terms designed for verified pharmacies, clinics and retail partners." },
  { icon: Languages, title: "Bilingual support", text: "Clear communication and support for every partner in English and French." },
];

const steps = [
  { icon: ClipboardList, title: "Register your business", text: "Submit your company details, TIN, licences and a primary contact." },
  { icon: UserCheck, title: "Get verified", text: "Our team reviews your credentials within 24–48 business hours." },
  { icon: ShoppingCart, title: "Start ordering", text: "See your wholesale pricing and live availability, then order online." },
];

const categories = [
  {
    id: "dermocosmetics",
    eyebrow: "Premium care",
    title: "Dermocosmetics & skincare",
    brands: "Bioderma · La Roche-Posay · Uriage · SVR · Eucerin · CeraVe",
    images: ["/images/flr-bioderma-sensibio-card.webp"],
    className: "bg-forest-900 text-white lg:row-span-2",
    muted: "text-forest-100/75",
    link: "text-gold-300",
  },
  {
    id: "baby",
    eyebrow: "Gentle essentials",
    title: "Baby & maternity",
    brands: "Mustela · Zwitsal · Byphasse",
    images: ["/images/flr-mustela-baby-card.webp"],
    imageAlt: "Mustela nourishing cleansing gel on an ivory pedestal — generated product illustration",
    className: "bg-brand-50 text-forest-900",
    muted: "text-sage-600",
    link: "text-brand-700",
  },
  {
    id: "wellness",
    eyebrow: "Everyday health",
    title: "Wellness, OTC & pharmacy",
    brands: "Puressentiel · Horizane Santé · Neutrogena",
    images: ["/images/flr-puressentiel-wellness-card.webp"],
    imageAlt: "Puressentiel True Lavender essential oil on a warm stone pedestal — generated product illustration",
    className: "bg-gold-50 text-forest-900",
    muted: "text-sage-600",
    link: "text-gold-700",
  },
];

export default function HomePage() {
  return (
    <>
      {/* ------------------------------- hero -------------------------------- */}
      <section className="relative isolate overflow-hidden">
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(900px_500px_at_15%_-10%,rgb(220_239_221/0.9),transparent_70%),radial-gradient(700px_500px_at_100%_10%,rgb(255_239_194/0.55),transparent_65%)]" />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 opacity-40 [background-image:linear-gradient(rgb(16_39_27/0.06)_1px,transparent_1px),linear-gradient(90deg,rgb(16_39_27/0.06)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:radial-gradient(ellipse_at_30%_20%,#000_20%,transparent_70%)]"
        />
        <Container className="grid items-center gap-14 pt-14 pb-20 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:pt-24 lg:pb-28">
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 ease-out motion-reduce:animate-none">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white/70 px-3.5 py-1.5 text-xs font-semibold text-brand-700 shadow-sm backdrop-blur">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand-400 opacity-60 motion-reduce:hidden" />
                <span className="relative inline-flex size-2 rounded-full bg-brand-500" />
              </span>
              Rwanda · East Africa
            </span>
            <h1 className="mt-5 font-display text-4xl leading-[1.08] font-extrabold tracking-tight text-balance text-forest-900 sm:text-5xl lg:text-[3.35rem]">
              Rwanda’s trusted{" "}
              <span className="bg-gradient-to-r from-brand-700 via-brand-600 to-brand-400 bg-clip-text text-transparent">pharmaceutical wholesale</span>{" "}
              partner
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-pretty text-sage-600 sm:text-[17px]">
              We distribute world-class pharmaceutical and dermocosmetic brands to pharmacies, clinics and retailers across Rwanda and East Africa.
            </p>
            <p className="mt-3 max-w-xl text-sm italic text-sage-500">
              Distribution de marques pharmaceutiques et dermocosmétiques aux pharmacies, cliniques et revendeurs au Rwanda.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="xl">
                <Link href="/register">Become a partner <ArrowRight /></Link>
              </Button>
              <Button asChild size="xl" variant="outline">
                <Link href="/brands">Explore our brands</Link>
              </Button>
            </div>
            <ul className="mt-10 grid gap-3 text-sm font-medium text-sage-700 sm:grid-cols-3">
              {["Licensed importer", "Authentic, traceable stock", "24–48h partner verification"].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <BadgeCheck className="size-4.5 shrink-0 text-brand-600" /> {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative animate-in fade-in slide-in-from-bottom-6 fill-mode-both delay-150 duration-700 ease-out motion-reduce:animate-none">
            <div className="relative aspect-[4/3.4] overflow-hidden rounded-[2rem] bg-forest-100 shadow-lift ring-1 ring-forest-900/5">
              <Image
                src="/images/flr-healthcare-partnership.webp"
                alt="Illustration of a pharmacist and wholesale advisor reviewing a product together"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 48vw"
                className="object-cover"
              />
              <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-forest-950/35 via-transparent to-transparent" />
            </div>

            <div className="absolute -bottom-6 -left-4 flex items-center gap-3 rounded-2xl border border-white/60 bg-white/90 p-3.5 pr-5 shadow-lift backdrop-blur-md sm:-left-8">
              <span className="grid size-11 place-items-center rounded-xl bg-brand-600 text-white">
                <PackageCheck className="size-5" />
              </span>
              <span>
                <b className="block font-display text-xl font-extrabold text-forest-900">20+</b>
                <span className="text-xs text-sage-500">international brands</span>
              </span>
            </div>

            <div className="absolute -top-5 right-4 hidden items-center gap-3 rounded-2xl border border-white/60 bg-white/90 p-3 pr-4 shadow-lift backdrop-blur-md sm:flex">
              <span className="grid size-9 place-items-center rounded-lg bg-gold-100 text-gold-700">
                <ShieldCheck className="size-5" />
              </span>
              <span className="text-sm">
                <b className="block font-semibold text-forest-900">Verified B2B only</b>
                <span className="text-xs text-sage-500">Pharmacies · Clinics · Retail</span>
              </span>
            </div>
          </div>
        </Container>
      </section>

      {/* ---------------------------- brand strip ---------------------------- */}
      <section aria-label="Brands we distribute" className="border-y border-sage-200/70 bg-sage-50/60 py-8">
        <Container className="flex flex-col gap-6 lg:flex-row lg:items-center lg:gap-12">
          <p className="shrink-0 text-sm font-semibold text-sage-500">Distributing brands trusted by professionals</p>
          <div className="min-w-0 flex-1">
            <BrandMarquee />
          </div>
        </Container>
      </section>

      {/* ----------------------------- highlights ---------------------------- */}
      <Container className="grid gap-4 py-14 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: Layers, title: "20+ premium brands", text: "From leading European and international laboratories." },
          { icon: UserCheck, title: "Verified B2B network", text: "Pharmacies, clinics, hospitals and retailers." },
          { icon: MapPin, title: "Rwanda & East Africa", text: "Regional distribution from Kigali." },
          { icon: BadgeCheck, title: "Licensed importer", text: "Pharmaceutical compliance at every step." },
        ].map((item, index) => (
          <Reveal key={item.title} delay={index * 0.06} className="flex gap-4 rounded-2xl p-2">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700 ring-1 ring-brand-100">
              <item.icon className="size-5" />
            </span>
            <span>
              <b className="block font-semibold text-forest-900">{item.title}</b>
              <span className="mt-1 block text-sm leading-relaxed text-sage-500">{item.text}</span>
            </span>
          </Reveal>
        ))}
      </Container>

      {/* ----------------------------- portfolio ----------------------------- */}
      <Section id="portfolio" className="bg-sage-50/70">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading
            eyebrow="Our portfolio"
            title="Healthcare brands for every need"
            description="Explore our core distribution categories. Pricing and online ordering are reserved for approved FLR partners."
          />
          <Button asChild variant="outline" size="lg" className="self-start md:self-auto">
            <Link href="/brands">View all brands <ArrowRight /></Link>
          </Button>
        </div>

        <div className="mt-14 grid gap-5 lg:grid-cols-2 lg:grid-rows-2">
          {categories.map((category, index) => (
            category.id === "dermocosmetics" ? (
              <Reveal key={category.id} delay={index * 0.08} className={`group relative isolate flex flex-col overflow-hidden rounded-3xl ${category.className}`}>
                <div className="px-8 pt-8 sm:px-10 sm:pt-10">
                  <span className={`text-xs font-bold uppercase tracking-[0.16em] ${category.link}`}>{category.eyebrow}</span>
                  <h3 className="mt-3 font-display text-xl font-extrabold tracking-tight sm:text-2xl">{category.title}</h3>
                  <p className={`mt-3 text-sm leading-relaxed ${category.muted}`}>{category.brands}</p>
                </div>
                <div className="mt-6 flex flex-1 items-center">
                  <Image
                    src={category.images[0]}
                    alt="Bioderma Sensibio H2O bottle on a forest-green pedestal — generated product illustration"
                    width={1536}
                    height={1024}
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="h-auto w-full object-contain"
                  />
                </div>
                <Link href={`/brands?category=${category.id}`} className={`inline-flex items-center gap-1.5 px-8 pt-6 pb-8 text-sm font-semibold sm:px-10 sm:pb-10 ${category.link}`}>
                  Explore brands
                  <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  <span className="absolute inset-0" aria-hidden="true" />
                </Link>
              </Reveal>
            ) : (
            <Reveal key={category.id} delay={index * 0.08} className={`group relative isolate grid min-h-72 grid-cols-[1.1fr_0.9fr] overflow-hidden rounded-3xl ${category.className}`}>
              <div className="flex min-w-0 flex-col p-5 sm:p-8">
                <span className={`text-xs font-bold uppercase tracking-[0.12em] ${category.link}`}>{category.eyebrow}</span>
                <h3 className="mt-3 font-display text-xl font-extrabold tracking-tight sm:text-2xl">{category.title}</h3>
                <p className={`mt-3 text-sm leading-relaxed ${category.muted}`}>{category.brands}</p>
                <Link href={`/brands?category=${category.id}`} className={`mt-auto inline-flex items-center gap-1.5 pt-8 text-sm font-semibold ${category.link}`}>
                  Explore brands
                  <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  <span className="absolute inset-0" aria-hidden="true" />
                </Link>
              </div>
              <div className="flex min-w-0 items-center">
                <Image
                  src={category.images[0]}
                  alt={category.imageAlt ?? ""}
                  width={1024}
                  height={1536}
                  sizes="(max-width: 1024px) 45vw, 23vw"
                  className="h-auto w-full object-contain"
                />
              </div>
            </Reveal>
            )
          ))}
        </div>
      </Section>

      {/* ------------------------------- about ------------------------------- */}
      <Section>
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
          <Reveal className="relative">
            <div className="relative aspect-square overflow-hidden rounded-[2rem] bg-[radial-gradient(circle_at_50%_60%,#fff_0%,var(--color-brand-50)_70%)] ring-1 ring-brand-100">
              <Image src="/images/flr-reliable-distribution.webp" alt="Illustration of a logistics professional carefully preparing a wholesale order" fill sizes="(max-width: 1024px) 100vw, 45vw" className="object-cover" />
            </div>
            <div className="absolute -right-3 -bottom-5 rounded-2xl bg-forest-900 px-5 py-4 text-white shadow-lift sm:-right-6">
              <p className="flex items-center gap-2 text-sm font-semibold"><Globe2 className="size-4 text-gold-400" /> Global brands, local expertise</p>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <SectionHeading
              eyebrow="About FLR Ltd."
              title="Connecting trusted global brands with East African healthcare"
              description="FLR Ltd. is a pharmaceutical wholesale distributor and Dépôt Pharmaceutique serving pharmacies, clinics, hospitals and retailers. We import, warehouse and distribute quality pharmaceutical and dermocosmetic products with a focus on authenticity, compliance and dependable partnership."
            />
            <blockquote className="mt-6 border-l-2 border-gold-500 pl-5 text-sm italic leading-relaxed text-sage-500">
              FLR Ltd. accompagne les professionnels de santé et les revendeurs avec une distribution fiable, conforme et adaptée au marché rwandais.
            </blockquote>
            <Button asChild variant="link" className="mt-6 h-auto px-0 text-base">
              <Link href="/about">Discover our company <ArrowRight /></Link>
            </Button>
          </Reveal>
        </div>
      </Section>

      {/* ------------------------------ reasons ------------------------------ */}
      <Section className="bg-forest-950 text-white">
        <SectionHeading
          tone="light"
          eyebrow="Why FLR Ltd."
          title="A dependable partner for your business"
          description="Our wholesale service combines international sourcing with local market knowledge and accountable support."
        />
        <div className="mt-14 grid gap-px overflow-hidden rounded-3xl bg-white/10 ring-1 ring-white/10 sm:grid-cols-2 lg:grid-cols-3">
          {reasons.map((reason, index) => (
            <Reveal key={reason.title} delay={(index % 3) * 0.06} className="group bg-forest-950 p-8 transition-colors duration-300 hover:bg-forest-900">
              <span className="grid size-12 place-items-center rounded-2xl bg-white/5 text-gold-400 ring-1 ring-white/10 transition-colors group-hover:bg-gold-500 group-hover:text-forest-950">
                <reason.icon className="size-5.5" />
              </span>
              <h3 className="mt-6 text-lg font-semibold">{reason.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-forest-100/70">{reason.text}</p>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ---------------------------- how it works --------------------------- */}
      <Section>
        <SectionHeading
          align="center"
          eyebrow="Become a client"
          title="Start ordering in three steps"
          description="Wholesale pricing, stock status and ordering are securely available to verified businesses."
        />
        <ol className="relative mt-16 grid gap-6 md:grid-cols-3">
          <div aria-hidden="true" className="absolute top-8 right-[16%] left-[16%] hidden border-t-2 border-dashed border-sage-300 md:block" />
          {steps.map((step, index) => (
            <Reveal key={step.title} delay={index * 0.1} className="relative flex flex-col items-center text-center">
              <span className="relative grid size-16 place-items-center rounded-2xl bg-white text-brand-600 shadow-soft ring-1 ring-sage-200">
                <step.icon className="size-7" />
                <span className="absolute -top-2.5 -right-2.5 grid size-7 place-items-center rounded-full bg-forest-900 text-xs font-bold text-white ring-4 ring-white">
                  {index + 1}
                </span>
              </span>
              <h3 className="mt-6 text-lg font-semibold text-forest-900">{step.title}</h3>
              <p className="mt-2 max-w-xs text-sm leading-relaxed text-sage-500">{step.text}</p>
            </Reveal>
          ))}
        </ol>
        <div className="mt-14 flex justify-center">
          <Button asChild size="xl">
            <Link href="/register">Register as an FLR partner <ArrowRight /></Link>
          </Button>
        </div>
      </Section>

      {/* ----------------------------- logo wall ----------------------------- */}
      <Section className="bg-sage-50/70">
        <SectionHeading align="center" eyebrow="International portfolio" title="Brands trusted by professionals" />
        <div className="mt-14 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {brandPortfolio.map((brand, index) => (
            <Reveal key={brand.slug} delay={(index % 5) * 0.04} y={12}>
              <Link
                href={`/brands/${brand.slug}`}
                className="group flex h-24 items-center justify-center rounded-2xl border border-sage-200/80 bg-white px-4 transition duration-300 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-soft"
              >
                <BrandLogo brand={brand} size="sm" className="opacity-80 grayscale transition duration-300 group-hover:opacity-100 group-hover:grayscale-0" />
              </Link>
            </Reveal>
          ))}
          <Reveal y={12}>
            <Link
              href="/brands"
              className="flex h-24 items-center justify-center gap-2 rounded-2xl bg-forest-900 px-4 text-sm font-semibold text-white transition hover:bg-forest-800"
            >
              See all brands <ArrowRight className="size-4" />
            </Link>
          </Reveal>
        </div>
      </Section>

      <CtaBand />
    </>
  );
}

export const metadata = {
  title: { absolute: "FLR Ltd. — Pharmaceutical Wholesale in Rwanda" },
};
