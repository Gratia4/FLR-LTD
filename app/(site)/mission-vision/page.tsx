import Image from "next/image";
import { CheckCircle2, Handshake, HeartPulse, ShieldCheck, Star } from "lucide-react";
import { CtaBand } from "@/components/site/cta-band";
import { PageHero } from "@/components/site/page-hero";
import { Reveal } from "@/components/site/reveal";
import { Container, Eyebrow, Section, SectionHeading } from "@/components/site/section";

export const metadata = { title: "Mission & Vision" };

const values = [
  { icon: ShieldCheck, name: "Integrity", text: "Honest sourcing and transparent terms." },
  { icon: Star, name: "Quality", text: "Only authentic products from authorised channels." },
  { icon: CheckCircle2, name: "Reliability", text: "Dependable stock and delivery partners can plan on." },
  { icon: Handshake, name: "Partnership", text: "Long-term relationships with every client." },
  { icon: HeartPulse, name: "Health impact", text: "Better access to care across the region." },
];

export default function MissionPage() {
  return (
    <>
      <PageHero eyebrow="Our purpose" title="Mission & vision" translation="Mission et vision" crumbs={[{ href: "/mission-vision", label: "Mission & vision" }]} />

      <section className="py-20 sm:py-28">
        <Container className="grid gap-6 lg:grid-cols-2">
          <Reveal className="relative isolate overflow-hidden rounded-3xl bg-forest-900 text-white">
            <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(420px_280px_at_100%_0%,rgb(61_153_67/0.45),transparent_70%)]" />
            <div className="relative aspect-[3/2] bg-forest-800">
              <Image src="/images/flr-mission-access-to-care.webp" alt="Illustration of a pharmacist helping a customer, representing access to everyday care" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
            </div>
            <div className="p-8 sm:p-12">
              <Eyebrow tone="light">Our mission</Eyebrow>
              <blockquote className="mt-6 font-display text-xl leading-snug font-bold text-balance sm:text-2xl">
                “To provide Rwanda and East Africa with consistent, reliable access to world-class pharmaceutical and dermocosmetic products, delivered with integrity and expertise.”
              </blockquote>
              <p className="mt-6 text-sm italic leading-relaxed text-forest-100/70">
                Offrir au Rwanda et à l’Afrique de l’Est un accès fiable aux meilleurs produits pharmaceutiques et dermocosmétiques, distribués avec intégrité.
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.1} className="relative isolate overflow-hidden rounded-3xl border border-gold-200 bg-gold-50">
            <div aria-hidden="true" className="absolute -right-16 -bottom-16 -z-10 size-64 rounded-full bg-gold-200/60 blur-3xl" />
            <div className="relative aspect-[3/2] bg-sage-100">
              <Image src="/images/flr-vision-regional-reach.webp" alt="An imagined Rwandan landscape with a delivery road connecting green hills to a city" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
            </div>
            <div className="p-8 sm:p-12">
              <Eyebrow tone="gold">Our vision</Eyebrow>
              <blockquote className="mt-6 font-display text-xl leading-snug font-bold text-balance text-forest-900 sm:text-2xl">
                “To be East Africa’s most trusted pharmaceutical wholesale distributor — connecting international brands to African healthcare.”
              </blockquote>
            </div>
          </Reveal>
        </Container>
      </section>

      <Section className="bg-sage-50/70">
        <SectionHeading align="center" eyebrow="Our values" title="Values that guide every partnership" />
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {values.map((value, index) => (
            <Reveal key={value.name} delay={index * 0.06} className="group rounded-3xl border border-sage-200/80 bg-white p-6 text-center shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-lift">
              <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-brand-50 text-brand-600 ring-1 ring-brand-100 transition-colors group-hover:bg-brand-600 group-hover:text-white">
                <value.icon className="size-6" />
              </span>
              <h3 className="mt-5 font-semibold text-forest-900">{value.name}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-sage-500">{value.text}</p>
            </Reveal>
          ))}
        </div>
      </Section>

      <CtaBand />
    </>
  );
}
